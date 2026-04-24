import React, { useState, useEffect } from 'react';
import { useFriends } from '../contexts/FriendsContext';
import { Users, Send, CheckCircle, X, UserMinus, ArrowRight, AlertCircle, AtSign, Clock, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface FriendsModalProps {
  open: boolean;
  onClose: () => void;
}

const FriendsModal: React.FC<FriendsModalProps> = ({ open, onClose }) => {
  const {
    friends, pendingRequests, sentRequests,
    sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
    removeFriend, getFriendByUsername,
  } = useFriends();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'incoming' | 'outgoing'>('friends');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'found' | 'not-found'>('idle');
  const [foundUser, setFoundUser] = useState<{ displayName: string; email: string; username: string } | null>(null);

  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      setUsernameStatus('idle');
      setFoundUser(null);
      return;
    }

    setUsernameStatus('checking');
    const timeOutId = setTimeout(async () => {
      try {
        const friend = await getFriendByUsername(username.trim().toLowerCase());
        if (friend) {
          setUsernameStatus('found');
          setFoundUser({ displayName: friend.displayName, email: friend.email, username: friend.username });
        } else {
          setUsernameStatus('not-found');
          setFoundUser(null);
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [username, getFriendByUsername]);

  const handleSendRequest = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    if (usernameStatus !== 'found') {
      toast.error('User not found. Check the username.');
      return;
    }
    setLoading(true);
    try {
      await sendFriendRequest(username.trim().toLowerCase());
      setUsername('');
      setUsernameStatus('idle');
      setFoundUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  if (!open) return null;

  const tabs = [
    { id: 'friends' as const, label: 'Friends', count: friends.length, icon: <Users size={15} /> },
    { id: 'incoming' as const, label: 'Incoming', count: pendingRequests.length, icon: <Clock size={15} /> },
    { id: 'outgoing' as const, label: 'Outgoing', count: sentRequests.length, icon: <ArrowRight size={15} /> },
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'var(--bg-overlay)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '20px', backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass animate-entrance" style={{
        maxWidth: '560px', width: '100%', borderRadius: 'var(--radius-xl)',
        overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'relative'
      }}>
        {/* Header */}
        <div style={{ padding: 'clamp(20px, 5vw, 32px) clamp(20px, 5vw, 32px) 20px', position: 'relative', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--accent-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--accent-glow)' }}>
                <Users size={20} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Inner Circle</h2>
            </div>
            <button onClick={onClose} className="icon-btn" style={{ background: 'transparent', border: 'none' }}><X size={20} /></button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Manage your network and shared payments.</p>
        </div>

        {/* Content */}
        <div style={{ padding: 'clamp(20px, 5vw, 32px)', overflowY: 'auto', flex: 1, scrollbarWidth: 'none' }}>
          {/* Add Friend Input */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Add by Username</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <AtSign size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text" value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username" className="input-field"
                  style={{ 
                    paddingLeft: '48px', height: '48px', fontSize: '0.95rem',
                    borderColor: usernameStatus === 'found' ? 'var(--success)' : usernameStatus === 'not-found' ? 'var(--warning)' : 'var(--border)'
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && usernameStatus === 'found') handleSendRequest(); }}
                />
              </div>
              <button
                onClick={handleSendRequest} disabled={loading || usernameStatus !== 'found'}
                className="btn btn-primary" style={{ height: '48px', padding: '0 20px' }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Premium Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '10px 8px', border: 'none', borderRadius: '6px',
                  background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--accent-1)' : 'var(--text-muted)',
                  fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                  minWidth: '94px'
                }}
              >
                {tab.label}
                {tab.count > 0 && <span style={{ background: 'var(--accent-1)', color: 'white', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '0.65rem' }}>{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ minHeight: '200px' }}>
            {activeTab === 'friends' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {friends.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                    <Users size={48} style={{ marginBottom: '16px' }} />
                    <p>No friends in your circle yet.</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div key={friend.uid} className="glass card-hover" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="avatar avatar-md">{friend.username[0]}</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{friend.displayName}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{friend.username}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFriend(friend.uid)} className="icon-btn" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}><UserMinus size={16} /></button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'incoming' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingRequests.map((req) => (
                  <div key={req.uid} className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar avatar-md">{req.username[0]}</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{req.displayName}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{req.username}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => acceptFriendRequest(req.uid)} className="icon-btn" style={{ background: 'var(--success)', color: 'white' }}><CheckCircle size={16} /></button>
                        <button onClick={() => rejectFriendRequest(req.uid)} className="icon-btn" style={{ background: 'var(--error)', color: 'white' }}><X size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>No pending invites.</p>}
              </div>
            )}

            {activeTab === 'outgoing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sentRequests.map((req) => (
                  <div key={req.uid} className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', opacity: 0.8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar avatar-md">{req.username[0]}</div>
                        <p style={{ margin: 0, fontWeight: 700 }}>@{req.username}</p>
                      </div>
                      <span className="badge">Pending</span>
                    </div>
                  </div>
                ))}
                {sentRequests.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>No requests sent.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsModal;
