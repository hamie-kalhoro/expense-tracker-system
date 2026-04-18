import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth, type UserProfile } from './AuthContext';
import { useNotifications } from './NotificationsContext';
import { db } from '../firebase/config';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, type Firestore } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { sendFriendRequestEmail, sendJoinAppReminderEmail } from '../services/emailService';

export interface FriendRequest {
  id: string;
  from: string; // UID
  fromEmail: string;
  fromName: string;
  to: string; // UID
  toEmail?: string;
  toName?: string;
  createdAt: unknown;
  status: 'pending' | 'accepted' | 'rejected';
}

interface FriendsContextType {
  friends: UserProfile[];
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  sendFriendRequest: (recipientEmail: string) => Promise<void>;
  acceptFriendRequest: (fromUid: string) => Promise<void>;
  rejectFriendRequest: (fromUid: string) => Promise<void>;
  removeFriend: (friendUid: string) => Promise<void>;
  loadFriendsData: () => Promise<void>;
  getFriendByEmail: (email: string) => Promise<UserProfile | null>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, isMockMode } = useAuth();
  const { addNotification } = useNotifications();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const seenRequestIds = React.useRef<Set<string>>(new Set());

  const loadFriendsData = useCallback(async () => {
    if (!user || !db || isMockMode) return;

    try {
      // Fetch friends
      if (userProfile?.friends && userProfile.friends.length > 0) {
        const friendsData = await Promise.all(
          userProfile.friends.map(async (friendUid) => {
            const friendDoc = await getDoc(doc(db as Firestore, 'users', friendUid));
            return friendDoc.data() as UserProfile;
          })
        );
        setFriends(friendsData.filter(Boolean));
      }

      // Fetch pending requests (incoming)
      if (userProfile?.pendingRequests && userProfile.pendingRequests.length > 0) {
        const pendingData = await Promise.all(
          userProfile.pendingRequests.map(async (fromUid) => {
            const friendDoc = await getDoc(doc(db as Firestore, 'users', fromUid));
            const friendData = friendDoc.data() as UserProfile;
            return {
              id: fromUid,
              from: fromUid,
              fromEmail: friendData?.email || '',
              fromName: friendData?.displayName || '',
              to: user.uid,
              createdAt: new Date(),
              status: 'pending' as const,
            };
          })
        );
        setPendingRequests(pendingData);

        // Add notifications for new pending requests
        pendingData.forEach((request) => {
          if (!seenRequestIds.current.has(request.id)) {
            addNotification({
              type: 'friend-request',
              title: 'New Friend Request',
              message: `${request.fromName} wants to split expenses with you`,
              fromName: request.fromName,
              fromUid: request.from,
            });
            seenRequestIds.current.add(request.id);
          }
        });
      }

      // Fetch sent requests (outgoing)
      if (userProfile?.sentRequests && userProfile.sentRequests.length > 0) {
        const sentData = await Promise.all(
          userProfile.sentRequests.map(async (toUid) => {
            const friendDoc = await getDoc(doc(db as Firestore, 'users', toUid));
            const friendData = friendDoc.data() as UserProfile;
            return {
              id: toUid,
              from: user.uid,
              fromEmail: user.email || '',
              fromName: user.displayName || '',
              to: toUid,
              toEmail: friendData?.email,
              toName: friendData?.displayName,
              createdAt: new Date(),
              status: 'pending' as const,
            };
          })
        );
        setSentRequests(sentData);
      }
    } catch (error) {
      console.error('Error loading friends data:', error);
    }
  }, [user, userProfile, isMockMode, addNotification]);

  useEffect(() => {
    // Automatically load friends data when user profile updates (e.g. via real-time onSnapshot)
    if (userProfile) {
      loadFriendsData();
    } else {
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
    }
  }, [userProfile, loadFriendsData]);

  const getFriendByEmail = async (email: string): Promise<UserProfile | null> => {
    if (!db || isMockMode) return null;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  };

  const sendFriendRequest = async (recipientEmail: string) => {
    if (!user || !db || !userProfile) return;

    try {
      // Check if recipient exists in app
      const recipient = await getFriendByEmail(recipientEmail);

      if (!recipient) {
        // User doesn't exist in app - send join reminder email
        toast.error(
          `User with email "${recipientEmail}" is not registered on SplitEase yet. A reminder email has been sent to them to join the app.`
        );

        try {
          await sendJoinAppReminderEmail(recipientEmail, userProfile.displayName || 'A friend');
          toast.success('Reminder email sent! They can join and accept your request later.');
        } catch (emailError) {
          console.error('Error sending reminder email:', emailError);
          toast.error('Email sending failed. Please try again.');
        }
        return;
      }

      if (recipient.uid === user.uid) {
        toast.error('Cannot send request to yourself');
        return;
      }

      if (userProfile.friends.includes(recipient.uid)) {
        toast.error('Already friends with this user');
        return;
      }

      if (userProfile.sentRequests.includes(recipient.uid)) {
        toast.error('Request already sent to this user');
        return;
      }

      // Update sender's sentRequests
      await updateDoc(doc(db, 'users', user.uid), {
        sentRequests: [...(userProfile.sentRequests || []), recipient.uid],
      });

      // Update recipient's pendingRequests
      await updateDoc(doc(db, 'users', recipient.uid), {
        pendingRequests: [...(recipient.pendingRequests || []), user.uid],
      });

      // Send friend request email notification
      try {
        await sendFriendRequestEmail(
          recipient.email,
          recipient.displayName || 'Friend',
          userProfile.displayName || 'A friend'
        );
      } catch (emailError) {
        console.error('Error sending friend request email:', emailError);
        // Don't fail the whole operation if email fails
      }

      // Add notification to notification center
      addNotification({
        type: 'success',
        title: 'Friend Request Sent',
        message: `Request sent to ${recipient.displayName || recipientEmail}. They've been notified via email.`,
      });

      toast.success(
        `✅ Friend request sent to ${recipient.displayName || recipientEmail}! They've been notified via email.`
      );
      await loadFriendsData();
    } catch (error) {
      toast.error('Failed to send friend request');
      console.error(error);
    }
  };

  const acceptFriendRequest = async (fromUid: string) => {
    if (!user || !db || !userProfile) return;

    try {
      const sender = await getDoc(doc(db, 'users', fromUid));
      const senderData = sender.data() as UserProfile;

      // Update receiver (current user)
      await updateDoc(doc(db, 'users', user.uid), {
        friends: [...(userProfile.friends || []), fromUid],
        pendingRequests: (userProfile.pendingRequests || []).filter((uid) => uid !== fromUid),
      });

      // Update sender
      await updateDoc(doc(db, 'users', fromUid), {
        friends: [...(senderData.friends || []), user.uid],
        sentRequests: (senderData.sentRequests || []).filter((uid) => uid !== user.uid),
      });

      // Add notification to notification center
      addNotification({
        type: 'friend-accepted',
        title: 'Friend Request Accepted',
        message: `You accepted ${senderData.displayName}'s friend request`,
      });

      toast.success('Friend request accepted');
      await loadFriendsData();
    } catch (error) {
      toast.error('Failed to accept friend request');
      console.error(error);
    }
  };

  const rejectFriendRequest = async (fromUid: string) => {
    if (!user || !db || !userProfile) return;

    try {
      const sender = await getDoc(doc(db, 'users', fromUid));
      const senderData = sender.data() as UserProfile;

      // Update receiver
      await updateDoc(doc(db, 'users', user.uid), {
        pendingRequests: (userProfile.pendingRequests || []).filter((uid) => uid !== fromUid),
      });

      // Update sender
      await updateDoc(doc(db, 'users', fromUid), {
        sentRequests: (senderData.sentRequests || []).filter((uid) => uid !== user.uid),
      });

      // Add notification to notification center
      addNotification({
        type: 'friend-rejected',
        title: 'Friend Request Rejected',
        message: `You rejected ${senderData.displayName}'s friend request`,
      });

      toast.success('Friend request rejected');
      await loadFriendsData();
    } catch (error) {
      toast.error('Failed to reject friend request');
      console.error(error);
    }
  };

  const removeFriend = async (friendUid: string) => {
    if (!user || !db || !userProfile) return;

    try {
      const friend = await getDoc(doc(db, 'users', friendUid));
      const friendData = friend.data() as UserProfile;

      // Update current user
      await updateDoc(doc(db, 'users', user.uid), {
        friends: (userProfile.friends || []).filter((uid) => uid !== friendUid),
      });

      // Update friend
      await updateDoc(doc(db, 'users', friendUid), {
        friends: (friendData.friends || []).filter((uid) => uid !== user.uid),
      });

      toast.success('Friend removed');
      await loadFriendsData();
    } catch (error) {
      toast.error('Failed to remove friend');
      console.error(error);
    }
  };

  return (
    <FriendsContext.Provider
      value={{
        friends,
        pendingRequests,
        sentRequests,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        loadFriendsData,
        getFriendByEmail,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};
