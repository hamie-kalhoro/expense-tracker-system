import React, { useState, useEffect } from 'react';
import { useFriends } from '../contexts/FriendsContext';
import { Users, Mail, Send, CheckCircle, X, UserMinus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface FriendsModalProps {
  open: boolean;
  onClose: () => void;
}

const FriendsModal: React.FC<FriendsModalProps> = ({ open, onClose }) => {
  const {
    friends,
    pendingRequests,
    sentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    loadFriendsData,
    getFriendByEmail,
  } = useFriends();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'found' | 'not-found'>('idle');
  const [foundName, setFoundName] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadFriendsData();
    }
  }, [open, loadFriendsData]);

  useEffect(() => {
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setEmailStatus('idle');
      setFoundName(null);
      return;
    }

    setEmailStatus('checking');

    // Debounce the search
    const timeOutId = setTimeout(async () => {
      try {
        const friend = await getFriendByEmail(email.trim());
        if (friend) {
          setEmailStatus('found');
          setFoundName(friend.displayName);
        } else {
          setEmailStatus('not-found');
          setFoundName(null);
        }
      } catch (error) {
        setEmailStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [email, getFriendByEmail]);

  const handleSendRequest = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email');
      return;
    }
    setLoading(true);
    try {
      await sendFriendRequest(email.trim());
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={24} color="white" />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Friends</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Add Friend Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
              Add a Friend
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                />
              </div>
              <button
                onClick={handleSendRequest}
                disabled={loading || emailStatus === 'checking'}
                style={{
                  padding: '10px 16px',
                  background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Send size={16} />
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>

            {/* Real-time Status Indicator */}
            {emailStatus === 'checking' && (
              <span
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid #cbd5e1',
                    borderTopColor: '#667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Checking user...
              </span>
            )}
            {emailStatus === 'found' && (
              <span
                style={{
                  fontSize: '13px',
                  color: '#10b981',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '500',
                }}
              >
                <CheckCircle size={14} /> ✓ {foundName} is already on SplitEase!
              </span>
            )}
            {emailStatus === 'not-found' && (
              <span
                style={{
                  fontSize: '13px',
                  color: '#f59e0b',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '500',
                }}
              >
                <Mail size={14} /> User will receive an email invite to join.
              </span>
            )}
          </div>

          {/* Tabs */}
          <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <button
                style={{
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: '2px solid #667eea',
                  color: '#667eea',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Friends ({friends.length})
              </button>
            </div>
          </div>

          {/* Friends List */}
          {friends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af' }}>
              <Users size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No friends yet. Add one to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friends.map((friend) => (
                <div
                  key={friend.uid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>{friend.displayName}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>{friend.email}</p>
                  </div>
                  <button
                    onClick={() => removeFriend(friend.uid)}
                    style={{
                      padding: '6px 12px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <UserMinus size={14} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginTop: '24px',
                  marginBottom: '12px',
                  color: '#374151',
                }}
              >
                Friend Requests ({pendingRequests.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: '#fef3c7',
                      borderRadius: '10px',
                      border: '1px solid #fcd34d',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>{request.fromName}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>{request.fromEmail}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => acceptFriendRequest(request.from)}
                        style={{
                          padding: '6px 12px',
                          background: '#dcfce7',
                          color: '#16a34a',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle size={14} />
                        Accept
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(request.from)}
                        style={{
                          padding: '6px 12px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginTop: '24px',
                  marginBottom: '12px',
                  color: '#374151',
                }}
              >
                Sent Requests ({sentRequests.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sentRequests.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: '#eff6ff',
                      borderRadius: '10px',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>
                        {request.toName || request.toEmail}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>Pending...</p>
                    </div>
                    <ArrowRight size={18} color="#9ca3af" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FriendsModal;
