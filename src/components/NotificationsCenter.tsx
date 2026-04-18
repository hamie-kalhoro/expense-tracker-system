import React, { useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, UserPlus } from 'lucide-react';
import { useNotifications, type Notification } from '../contexts/NotificationsContext';

const NotificationsCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend-request':
        return <UserPlus size={18} color="#667eea" />;
      case 'friend-accepted':
        return <CheckCircle size={18} color="#10b981" />;
      case 'friend-rejected':
        return <AlertCircle size={18} color="#ef4444" />;
      case 'success':
        return <CheckCircle size={18} color="#10b981" />;
      case 'error':
        return <AlertCircle size={18} color="#ef4444" />;
      case 'info':
      default:
        return <Info size={18} color="#3b82f6" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'friend-request':
        return '#f0f9ff';
      case 'friend-accepted':
        return '#dcfce7';
      case 'friend-rejected':
        return '#fee2e2';
      case 'success':
        return '#dcfce7';
      case 'error':
        return '#fee2e2';
      case 'info':
      default:
        return '#dbeafe';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '10px',
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          cursor: 'pointer',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e5e7eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '700',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '380px',
            maxHeight: '500px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f9fafb'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Notifications List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '400px'
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#9ca3af'
                }}
              >
                <Bell size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                  }}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid #f3f4f6',
                    background: notification.read ? 'white' : getNotificationColor(notification.type),
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    borderLeft: notification.read ? 'none' : '4px solid #667eea'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = notification.read ? '#f9fafb' : getNotificationColor(notification.type);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.read ? 'white' : getNotificationColor(notification.type);
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px'
                        }}
                      >
                        <h4 style={{
                          margin: 0,
                          fontSize: '14px',
                          fontWeight: notification.read ? '500' : '700',
                          color: '#1f2937'
                        }}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#d1d5db',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.4'
                      }}>
                        {notification.message}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{
                          fontSize: '11px',
                          color: '#9ca3af'
                        }}>
                          {formatTime(notification.timestamp)}
                        </span>
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            style={{
                              fontSize: '12px',
                              color: '#667eea',
                              textDecoration: 'none',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            {notification.actionLabel || 'View'}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid #e5e7eb',
                background: '#f9fafb',
                display: 'flex',
                gap: '8px',
                justifyContent: 'space-between'
              }}
            >
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#667eea',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => clearAll()}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'none',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ef4444',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fee2e2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsCenter;
