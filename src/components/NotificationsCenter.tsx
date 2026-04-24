import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import { useFriends } from '../contexts/FriendsContext';
import { Bell, Check, X, Clock, User as Users } from 'lucide-react';

const timeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes";
  return Math.floor(seconds) + " seconds";
};

const NotificationsCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotifications();
  const { acceptFriendRequest, rejectFriendRequest } = useFriends();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = async (action: 'accept' | 'decline', notification: any) => {
    if (!notification.fromUid) return;

    if (action === 'accept') {
      await acceptFriendRequest(notification.fromUid);
    } else {
      await rejectFriendRequest(notification.fromUid);
    }
    await markAsRead(notification.id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'friend-request': return <Users size={16} style={{ color: 'var(--info)' }} />;
      case 'friend-accepted': return <Check size={16} style={{ color: 'var(--success)' }} />;
      case 'friend-rejected': return <X size={16} style={{ color: 'var(--error)' }} />;
      case 'success': return <Check size={16} style={{ color: 'var(--success)' }} />;
      case 'expense-added': return <span style={{ fontSize: '1rem' }}>💸</span>;
      default: return <Bell size={16} style={{ color: 'var(--accent-1)' }} />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="icon-btn"
        style={{ position: 'relative', background: isOpen ? 'var(--bg-elevated)' : 'transparent', border: 'none' }}
      >
        <Bell size={18} style={{ color: isOpen ? 'var(--accent-1)' : 'var(--text-secondary)' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            width: '8px', height: '8px', background: 'var(--error)',
            borderRadius: '50%', boxShadow: '0 0 0 2px var(--bg-card)',
          }} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: '340px', background: 'var(--bg-modal)',
          backdropFilter: 'blur(20px)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
          zIndex: 100, transformOrigin: 'top right', animation: 'scaleIn 0.2s ease',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-elevated)',
          }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Notifications
            </h3>
            {notifications.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={markAllAsRead}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-1)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              </div>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <Bell size={32} style={{ marginBottom: '12px' }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>You're all caught up!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.map((notif) => (
                  <div key={notif.id} style={{
                    padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
                    background: notif.read ? 'transparent' : 'var(--bg-elevated)',
                    transition: 'background 0.2s', position: 'relative',
                  }}
                    onMouseEnter={(e) => { (e.currentTarget.querySelector('.notif-delete-btn') as HTMLElement)!.style.opacity = '1'; }}
                    onMouseLeave={(e) => { (e.currentTarget.querySelector('.notif-delete-btn') as HTMLElement)!.style.opacity = '0'; }}
                  >
                    {!notif.read && (
                      <div style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-1)' }} />
                    )}

                    <button
                      className="notif-delete-btn"
                      onClick={() => removeNotification(notif.id)}
                      style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s', padding: '4px' }}
                    >
                      <X size={14} />
                    </button>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: 'var(--shadow-sm)',
                      }}>
                        {getIcon(notif.type)}
                      </div>
                      <div style={{ flex: 1, paddingRight: '20px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {notif.title}
                        </p>
                        <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {notif.message}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />
                          {timeAgo(notif.timestamp)} ago
                        </p>

                        {/* Interactive actions for friend requests */}
                        {notif.type === 'friend-request' && notif.fromUid && !notif.read && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button
                              onClick={() => handleAction('accept', notif)}
                              className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleAction('decline', notif)}
                              className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', textAlign: 'center' }}>
              <button
                onClick={clearAll}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
