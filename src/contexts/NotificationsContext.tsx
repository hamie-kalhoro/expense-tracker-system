import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../supabase/config';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  fromName?: string;
  fromUid?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  pushPermission: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<void>;
  addNotification: (notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    fromName?: string;
    fromUid?: string;
    actionUrl?: string;
  }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// ═══════════════════════════════════════════
// Browser Push Notification Helpers
// ═══════════════════════════════════════════

const isPushSupported = () => 'Notification' in window;

const sendBrowserNotification = (title: string, body: string, icon?: string, tag?: string) => {
  if (!isPushSupported() || Notification.permission !== 'granted') return;

  try {
    const notif = new window.Notification(title, {
      body,
      icon: icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: tag || `splitease-${Date.now()}`,
      silent: false,
      requireInteraction: false,
    });

    // Auto-close after 6 seconds
    setTimeout(() => notif.close(), 6000);

    // Focus window on click
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (e) {
    console.warn('Browser notification failed:', e);
  }
};

const getNotificationEmoji = (type: string) => {
  switch (type) {
    case 'friend-request': return '👋';
    case 'friend-accepted': return '🤝';
    case 'expense-added': return '💸';
    case 'settlement': return '✅';
    default: return '🔔';
  }
};

// ═══════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(
    isPushSupported() ? window.Notification.permission : 'unsupported'
  );
  // Track known notification IDs to only push browser notifications for NEW ones
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  const requestPushPermission = useCallback(async () => {
    if (!isPushSupported()) {
      setPushPermission('unsupported');
      return;
    }
    try {
      const result = await window.Notification.requestPermission();
      setPushPermission(result);
    } catch (e) {
      console.warn('Push permission request failed:', e);
    }
  }, []);

  // Auto-request permission when user logs in
  useEffect(() => {
    if (user && isPushSupported() && window.Notification.permission === 'default') {
      const timer = setTimeout(() => requestPushPermission(), 3000);
      return () => clearTimeout(timer);
    }
  }, [user, requestPushPermission]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    const mapped = data.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: new Date(n.created_at),
      read: n.read,
      actionUrl: n.action_url,
      fromName: n.from_name,
      fromUid: n.from_uid
    }));

    // Detect truly new notifications and fire browser push
    if (!isInitialLoadRef.current) {
      mapped.forEach(notif => {
        if (!knownIdsRef.current.has(notif.id) && !notif.read) {
          const emoji = getNotificationEmoji(notif.type);
          sendBrowserNotification(
            `${emoji} ${notif.title}`,
            notif.message,
            '/favicon.svg',
            `splitease-${notif.id}`
          );
        }
      });
    }

    // Update known IDs
    knownIdsRef.current = new Set(mapped.map(n => n.id));
    isInitialLoadRef.current = false;

    setNotifications(mapped);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      knownIdsRef.current = new Set();
      isInitialLoadRef.current = true;
      return;
    }

    fetchNotifications();

    const channel = supabase.channel(`notifications:${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const addNotification = async (notif: {
    userId: string;
    type: string;
    title: string;
    message: string;
    fromName?: string;
    fromUid?: string;
    actionUrl?: string;
  }) => {
    const { error } = await supabase.from('notifications').insert({
      user_id: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      from_name: notif.fromName,
      from_uid: notif.fromUid,
      action_url: notif.actionUrl
    });

    if (error) console.error('Error creating notification:', error);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (error) console.error(error);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id);
    if (error) console.error(error);
  };

  const removeNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) console.error(error);
  };

  const clearAll = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);
    if (error) console.error(error);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        pushPermission,
        requestPushPermission,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
