import React, { useState } from 'react';
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
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const { expenses, totalSpent, myBalance } = useData();
  const { friends, pendingRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = useFriends();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showFriends, setShowFriends] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const username = userProfile?.username || user?.user_metadata?.full_name || 'user';
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

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-gradient)', backgroundAttachment: 'fixed' }}>
      {/* Premium Header */}
      <nav className="glass animate-entrance" style={{
        padding: '0 40px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--header-border)'
      }}>
        <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              <div className="blob" style={{ width: '40px', height: '40px', background: 'var(--accent-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px var(--accent-glow)' }}>
                <Wallet size={20} color="white" />
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Split<span className="gradient-text">Ease</span></h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ fontSize: '0.85rem' }}>Dashboard</button>
              <button className="btn btn-ghost" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-1)', fontSize: '0.85rem' }}>Account</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <NotificationsCenter />
             <button onClick={toggleTheme} className="icon-btn">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={async () => await signOut()} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '64px 20px' }}>
        {/* Profile Hero */}
        <div className="glass animate-entrance" style={{ 
          padding: '48px', borderRadius: 'var(--radius-xl)', marginBottom: '40px',
          display: 'flex', alignItems: 'center', gap: '40px', position: 'relative', overflow: 'hidden'
        }}>
          <div className="blob" style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', opacity: 0.1 }} />
          
          <div style={{ position: 'relative' }}>
            <div className="avatar avatar-xl" style={{ 
              width: '140px', height: '140px', fontSize: '3rem', 
              boxShadow: '0 20px 40px var(--accent-glow)', border: '4px solid var(--bg-card)'
            }}>
              {username[0]}
            </div>
            <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'var(--success)', width: '24px', height: '24px', borderRadius: '50%', border: '4px solid var(--bg-card)' }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>@{username}</h2>
              <span className="badge badge-accent" style={{ padding: '6px 16px' }}>Pro Member</span>
            </div>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} /> {email}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '12px 20px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={16} /> <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Member since {joinDate}</span>
              </div>
              <div style={{ padding: '12px 20px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={16} /> <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{friends.length} Network Connections</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {[
            { label: 'Total Contributions', value: `$${totalSpent.toFixed(2)}`, icon: <DollarSign size={24} />, color: 'var(--info)' },
            { label: 'Net Efficiency', value: `${myBalance >= 0 ? '+' : '-'}$${Math.abs(myBalance).toFixed(2)}`, icon: <Activity size={24} />, color: myBalance >= 0 ? 'var(--success)' : 'var(--error)' },
            { label: 'Verified Partners', value: friends.length, icon: <Users size={24} />, color: 'var(--accent-1)' }
          ].map((stat, i) => (
            <div key={i} className="glass animate-entrance" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', animationDelay: `${i * 0.1}s` }}>
              <div style={{ color: stat.color, marginBottom: '16px' }}>{stat.icon}</div>
              <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>{stat.label}</p>
              <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Split Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '40px' }}>
          {/* Recent Activity */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Global Footprint</h3>
              <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Full History <ArrowRight size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {expenses.slice(0, 5).map((exp) => (
                <div key={exp.id} className="glass card-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', background: 'var(--bg-elevated)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>{exp.description}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Managed by {exp.paidByName}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-1)' }}>${exp.amount.toFixed(2)}</span>
                </div>
              ))}
              {expenses.length === 0 && <p style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>No shared expenses documented.</p>}
            </div>
          </section>

          {/* Social Control */}
          <section>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Network Hub</h3>
            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expand Circle</label>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <AtSign size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text" value={friendUsername} 
                    onChange={(e) => setFriendUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="enter_username" className="input-field"
                    style={{ paddingLeft: '48px', height: '52px' }}
                  />
                </div>
                <button 
                  onClick={handleSendRequest} disabled={sendingRequest || !friendUsername.trim()}
                  className="btn btn-primary" style={{ padding: '0 20px', height: '52px' }}
                >
                  <Send size={18} />
                </button>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--warning)" /> Requests Pending
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingRequests.map(req => (
                  <div key={req.uid} className="glass" style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar avatar-sm">{req.username[0]}</div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>@{req.username}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => acceptFriendRequest(req.uid)} className="icon-btn" style={{ background: 'var(--success)', color: 'white' }}><CheckCircle size={14} /></button>
                        <button onClick={() => rejectFriendRequest(req.uid)} className="icon-btn" style={{ background: 'var(--error)', color: 'white' }}><X size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>All caught up.</p>}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '32px 0' }} />
              
              <button 
                onClick={() => setShowFriends(true)}
                className="btn btn-ghost" style={{ width: '100%', justifyContent: 'space-between', padding: '16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={18} /> <span>Manage All Friends</span>
                </div>
                <ChevronRight size={16} />
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
