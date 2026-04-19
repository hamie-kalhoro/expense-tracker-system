import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { useAuth, type UserProfile } from './AuthContext';
import { useNotifications } from './NotificationsContext';
import { sendFriendRequestEmail } from '../services/emailService';
import toast from 'react-hot-toast';

interface FriendsContextType {
  friends: UserProfile[]; // Accepted friendships
  pendingRequests: UserProfile[]; // Incoming requests
  sentRequests: UserProfile[]; // Outgoing requests
  sendFriendRequest: (targetUsername: string) => Promise<boolean>;
  acceptFriendRequest: (senderUid: string) => Promise<void>;
  rejectFriendRequest: (senderUid: string) => Promise<void>;
  removeFriend: (friendUid: string) => Promise<void>;
  getFriendByUsername: (username: string) => Promise<any | null>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<UserProfile[]>([]);

  const fetchFriendships = React.useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          status,
          user_id1,
          user_id2,
          user1:users!user_id1 ( id, username, display_name, photo_url, email, created_at ),
          user2:users!user_id2 ( id, username, display_name, photo_url, email, created_at )
        `)
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

      if (error) throw error;

      const accepted: UserProfile[] = [];
      const pending: UserProfile[] = [];
      const sent: UserProfile[] = [];

      data?.forEach((row: any) => {
        const isSender = row.user_id1 === user.id;
        const otherUser = isSender ? row.user2 : row.user1;

        if (!otherUser) return; // Defensive

        const profile: UserProfile = {
          uid: otherUser.id,
          username: otherUser.username,
          displayName: otherUser.display_name,
          email: otherUser.email,
          photoURL: otherUser.photo_url || undefined,
          createdAt: otherUser.created_at
        };

        if (row.status === 'accepted') {
          accepted.push(profile);
        } else if (row.status === 'pending' && !isSender) {
          // It's an incoming request!
          pending.push(profile);
        } else if (row.status === 'pending' && isSender) {
          // Outgoing
          sent.push(profile);
        }
      });

      setFriends(accepted);
      setPendingRequests(pending);
      setSentRequests(sent);

    } catch (e) {
      console.error('Error fetching friendships:', e);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchFriendships();

    const channel = supabase.channel('friendships_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        fetchFriendships();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFriendships]);

  const getFriendByUsername = async (targetUsername: string) => {
    if (!user) return null;
    const clean = targetUsername.toLowerCase().replace('@', '').trim();
    try {
      const { data } = await supabase
        .from('users')
        .select('id, username, display_name, email')
        .eq('username', clean)
        .single();
        
      if (data) {
        return {
          uid: data.id,
          username: data.username,
          displayName: data.display_name,
          email: data.email
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const sendFriendRequest = async (targetUsername: string): Promise<boolean> => {
    if (!user || !userProfile) return false;
    
    // Ensure case insensitivity
    const cleanUsername = targetUsername.toLowerCase().replace('@', '').trim();

    if (cleanUsername === userProfile.username.toLowerCase()) {
      toast.error("You can't add yourself as a friend!");
      return false;
    }

    try {
      // Find the user
      const { data: foundUsers, error: searchError } = await supabase
        .from('users')
        .select('id, email, username')
        .eq('username', cleanUsername);

      if (searchError) throw searchError;

      if (!foundUsers || foundUsers.length === 0) {
        // User not registered, prompt to invite
        toast.error(`@${cleanUsername} is not on SplitEase yet.`);
        return false;
      }

      const targetUser = foundUsers[0];

      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id1.eq.${user.id},user_id2.eq.${targetUser.id}),and(user_id1.eq.${targetUser.id},user_id2.eq.${user.id})`);
        
      if (existing && existing.length > 0) {
        toast.error(`Friendship or request already exists with @${cleanUsername}`);
        return false;
      }

      // Insert request
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          user_id1: user.id,
          user_id2: targetUser.id,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast.success(`Friend request sent to @${cleanUsername}!`);
      
      // Dispatch email Notification
      sendFriendRequestEmail(targetUser.email, targetUser.username, userProfile.username);

      return true;
      
    } catch (e) {
      console.error(e);
      toast.error('Failed to send request.');
      return false;
    }
  };

  const acceptFriendRequest = async (senderUid: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('user_id1', senderUid)
      .eq('user_id2', user.id);
      
    if (error) {
      console.error(error);
      toast.error('Failed to accept request.');
    } else {
      toast.success('Friend request accepted!');
    }
  };

  const rejectFriendRequest = async (senderUid: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('user_id1', senderUid)
      .eq('user_id2', user.id);

    if (error) {
      console.error(error);
      toast.error('Failed to reject request.');
    } else {
      toast.success('Friend request rejected.');
    }
  };

  const removeFriend = async (friendUid: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id1.eq.${user.id},user_id2.eq.${friendUid}),and(user_id1.eq.${friendUid},user_id2.eq.${user.id})`);

    if (error) {
      console.error(error);
      toast.error('Failed to remove friend.');
    } else {
      toast.success('Friend removed.');
    }
  };

  return (
    <FriendsContext.Provider value={{ friends, pendingRequests, sentRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, getFriendByUsername }}>
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
