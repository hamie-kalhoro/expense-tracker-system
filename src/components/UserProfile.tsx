import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useFriends } from '../contexts/FriendsContext';
import { useTheme } from '../contexts/ThemeContext';
import FriendsModal from './FriendsModal';
import AddExpenseModal from './AddExpenseModal';
import NotificationsCenter from './NotificationsCenter';
import {
  User, Users, Wallet, DollarSign, Activity, Settings, LogOut, Sun, Moon,
  Send, CheckCircle, X, Clock, AtSign, ChevronRight, Plus, BarChart, UserPlus, Mail,
  ArrowRight, Edit3, Trash2, UserCheck, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../supabase/config';

const UserProfile: React.FC = () => {
  const { user, userProfile, signOut, updateProfile } = useAuth();
  const { expenses, totalSpent, myBalance } = useData();
  const { friends, pendingRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendByUsername } = useFriends();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showFriends, setShowFriends] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'found' | 'not-found'>('idle');

  useEffect(() => {
    if (!friendUsername.trim() || friendUsername.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timeOutId = setTimeout(async () => {
      try {
        const friend = await getFriendByUsername(friendUsername.trim().toLowerCase());
        if (friend) {
          setUsernameStatus('found');
        } else {
          setUsernameStatus('not-found');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [friendUsername, getFriendByUsername]);
  
  // Profile Edit State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(userProfile?.bio || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const wordCount = (text: string) => text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file type and size (e.g., max 2MB)
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 3. Update User Profile
      await updateProfile({ photoURL: publicUrl });
      toast.success('Avatar updated!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload image. (Buckets might not be set up)');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async () => {
    const words = wordCount(bioInput);
    if (words > 15) {
      toast.error('Bio must be 15 words or less!');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({ bio: bioInput });
      setIsEditingBio(false);
      toast.success('Bio updated!');
    } catch (err) {
      toast.error('Failed to update bio');
    } finally {
      setIsUpdating(false);
    }
  };

  const username = userProfile?.username || 'user';
  const displayName = userProfile?.displayName || user?.user_metadata?.full_name || 'SplitEase User';
  const email = userProfile?.email || user?.email || '';
  const joinDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt as any).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  const handleSendRequest = async () => {
    if (!friendUsername.trim()) {
      toast.error('Enter a username');
      return;
    }
    setSendingRequest(true);
    try {
      await sendFriendRequest(friendUsername.trim().toLowerCase());
      setFriendUsername('');
    } finally {
      setSendingRequest(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Premium Navigation */}
      <nav className="glass animate-entrance nav-header" style={{
        padding: '0 40px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--header-border)'
      }}>
        <div className="nav-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              <div className="blob" style={{ width: '40px', height: '40px', background: 'var(--accent-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px var(--accent-glow)' }}>
                <Wallet size={20} color="white" />
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Split<span className="gradient-text">Ease</span></h1>
            </div>
            <div className="nav-tabs" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ fontSize: '0.85rem', border: 'none' }}>Dashboard</button>
              <button className="btn btn-ghost" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-1)', fontSize: '0.85rem', border: 'none' }}>Account</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NotificationsCenter />
            <button onClick={toggleTheme} className="icon-btn" style={{ width: '40px', height: '40px' }}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="nav-tabs">
              <button onClick={async () => await signOut()} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                <LogOut size={14} /> Exit
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-container">
        {/* Profile Hero */}
        <div className="glass animate-entrance" style={{
          padding: 'clamp(24px, 5vw, 48px)', borderRadius: 'var(--radius-xl)', marginBottom: '40px',
          display: 'flex', alignItems: 'center', gap: 'clamp(20px, 5vw, 40px)', position: 'relative', overflow: 'hidden',
          flexWrap: 'wrap'
        }}>
          <div className="blob" style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', opacity: 0.1 }} />

          <div style={{ position: 'relative' }}>
            <div className="avatar avatar-xl" style={{
              width: 'clamp(80px, 20vw, 140px)', height: 'clamp(80px, 20vw, 140px)', fontSize: 'clamp(2rem, 5vw, 3rem)',
              boxShadow: '0 20px 40px var(--accent-glow)', border: '4px solid var(--bg-card)',
              overflow: 'hidden'
            }}>
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                username[0].toUpperCase()
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdating}
              style={{ 
                position: 'absolute', bottom: '5px', right: '5px', background: 'var(--bg-card)', 
                width: '36px', height: '36px', borderRadius: '12px', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-1)',
                cursor: 'pointer', boxShadow: 'var(--shadow-md)'
              }}
              title="Upload from Gallery"
            >
              {isUpdating ? <span className="spinner-small" /> : <Edit3 size={16} />}
            </button>
          </div>

          <div style={{ flex: '1 1 300px' }}>
            <div style={{ marginBottom: '8px' }}>
              <h1 style={{ 
                fontSize: 'clamp(1.75rem, 6vw, 3rem)', 
                fontWeight: 900, 
                margin: 0, 
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)'
              }}>
                {displayName}
              </h1>
              <h2 style={{ 
                fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', 
                fontWeight: 600, 
                margin: '4px 0 0', 
                color: 'var(--accent-1)',
                opacity: 0.9
              }}>
                @{username}
              </h2>
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} /> {email}
            </p>

            {/* Bio Section */}
            <div style={{ marginBottom: '24px' }}>
              {isEditingBio ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea 
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Short bio (15 words max)..."
                    className="input-field"
                    style={{ height: '80px', minWidth: '100%', fontSize: '0.9rem' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: wordCount(bioInput) > 15 ? 'var(--error)' : 'var(--text-muted)' }}>
                      {wordCount(bioInput)}/15 words
                    </span>
                    <button onClick={handleUpdateProfile} disabled={isUpdating} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
                      {isUpdating ? 'Saving...' : 'Save Bio'}
                    </button>
                    <button onClick={() => setIsEditingBio(false)} className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, opacity: 0.9 }}>
                    "{userProfile.bio || "SplitEase Enthusiast. Managing group finances with style."}"
                  </p>
                  <button 
                    onClick={() => setIsEditingBio(true)}
                    className="btn btn-ghost"
                    style={{ width: '28px', height: '28px', padding: 0 }}
                    title="Edit Bio"
                  >
                    <Edit3 size={12} />
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ padding: '10px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{joinDate}</span>
              </div>
              <div style={{ padding: '10px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{friends.length} Network</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="analytics-grid">
          {[
            { label: 'Total Spending', value: `$${totalSpent.toFixed(2)}`, icon: <DollarSign size={24} />, color: 'var(--info)' },
            { label: 'Net Balance', value: `${myBalance >= 0 ? '+' : '-'}$${Math.abs(myBalance).toFixed(2)}`, icon: <Activity size={24} />, color: myBalance >= 0 ? 'var(--success)' : 'var(--error)' },
            { label: 'Verified Network', value: friends.length, icon: <Users size={24} />, color: 'var(--accent-1)' }
          ].map((stat, i) => (
            <div key={i} className="glass animate-entrance" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', animationDelay: `${i * 0.1}s` }}>
              <div style={{ color: stat.color, marginBottom: '16px' }}>{stat.icon}</div>
              <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{stat.label}</p>
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: stat.color }}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Split Section */}
        <div className="dashboard-grid">
          {/* Recent Activity */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Global Footprint</h3>
              <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ fontSize: '0.8rem' }}>Full History</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expenses.slice(0, 5).map((exp) => (
                <div key={exp.id} className="glass card-hover" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--bg-elevated)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={18} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{exp.description}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>via {exp.paidByName}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-1)' }}>${exp.amount.toFixed(2)}</span>
                </div>
              ))}
              {expenses.length === 0 && <p style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>No shared expenses documented.</p>}
            </div>
          </section>

          {/* Social Control */}
          <section>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Network Hub</h3>
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expand Circle</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', alignItems: 'flex-start' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                  <AtSign size={16} style={{ position: 'absolute', left: '14px', top: '24px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text" value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username" className="input-field"
                    style={{ 
                      paddingLeft: '42px', height: '48px', fontSize: '0.85rem', width: '100%',
                      borderColor: usernameStatus === 'found' ? 'var(--success)' : usernameStatus === 'not-found' ? 'var(--warning)' : 'var(--border)'
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && usernameStatus === 'found') handleSendRequest(); }}
                  />
                  {usernameStatus !== 'idle' && (
                    <p style={{ 
                      margin: '6px 0 0 4px', fontSize: '0.65rem', fontWeight: 700,
                      color: usernameStatus === 'checking' ? 'var(--text-muted)' : usernameStatus === 'found' ? 'var(--success)' : 'var(--warning)',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      {usernameStatus === 'checking' && 'Checking...'}
                      {usernameStatus === 'found' && <><UserCheck size={10} /> Found!</>}
                      {usernameStatus === 'not-found' && <><AlertCircle size={10} /> Not found.</>}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSendRequest} disabled={sendingRequest || usernameStatus !== 'found'}
                  className="btn btn-primary" style={{ height: '48px', width: '48px', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Send size={18} />
                </button>
              </div>

              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--warning)" /> Requests Pending
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingRequests.map(req => (
                  <div key={req.uid} className="glass" style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="avatar avatar-sm" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>{req.username[0].toUpperCase()}</div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>@{req.username}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => acceptFriendRequest(req.uid)} className="icon-btn" style={{ background: 'var(--success)', color: 'white', width: '28px', height: '28px' }}><CheckCircle size={12} /></button>
                        <button onClick={() => rejectFriendRequest(req.uid)} className="icon-btn" style={{ background: 'var(--error)', color: 'white', width: '28px', height: '28px' }}><X size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>All caught up.</p>}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '24px 0' }} />

              <button
                onClick={() => setShowFriends(true)}
                className="btn btn-ghost" style={{ width: '100%', justifyContent: 'space-between', padding: '12px', fontSize: '0.85rem', border: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={16} /> <span>Manage All Friends</span>
                </div>
                <ChevronRight size={14} />
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Modals */}
      <FriendsModal open={showFriends} onClose={() => setShowFriends(false)} />
      <AddExpenseModal open={showAddExpense} onClose={() => setShowAddExpense(false)} friends={friends} />
    </div>
  );
};

export default UserProfile;
