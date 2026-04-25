import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useFriends } from '../contexts/FriendsContext';
import { useTheme } from '../contexts/ThemeContext';
import AddExpenseModal from './AddExpenseModal';
import FriendsModal from './FriendsModal';
import NotificationsCenter from './NotificationsCenter';
import ReviewModal from './ReviewModal';
import {
  LogOut, Plus, Activity, Users, Wallet, DollarSign, Trash2,
  ArrowRight, CheckCircle, TrendingDown, CreditCard, Sun, Moon,
  ArrowLeft, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const { expenses, settlements, deleteExpense, totalSpent, myBalance } = useData();
  const { friends, pendingRequests } = useFriends();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  // Calculate dynamic efficiency based on user's involvement in expenses
  const calculateEfficiency = () => {
    if (expenses.length === 0) return 50;
    const score = 50 + (expenses.length * 3) + (settlements.length * 2);
    return Math.min(score, 99);
  };
  const efficiencyScore = calculateEfficiency();

  const username = userProfile?.username || user?.user_metadata?.full_name || 'user';

  const getCategoryEmoji = (cat?: string) => {
    const map: Record<string, string> = {
      food: '🍽️', entertainment: '🎬', transport: '🚗',
      utilities: '💡', shopping: '🛍️', other: '📌',
    };
    return map[cat || 'other'] || '📌';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Premium Navigation */}
      <nav className="glass animate-entrance nav-header" style={{
        padding: '0 40px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--header-border)'
      }}>
        <div className="nav-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="blob" style={{
                width: '40px', height: '40px', background: 'var(--accent-gradient)',
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px var(--accent-glow)'
              }}>
                <Wallet size={20} color="white" />
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Split<span className="gradient-text">Ease</span>
              </h1>
            </div>

            <div className="nav-tabs" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['Overview', 'Expenses', 'Friends', 'Activity'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="btn btn-ghost" 
                  style={{ 
                    border: 'none', background: tab === activeTab ? 'var(--accent-subtle)' : 'transparent',
                    color: tab === activeTab ? 'var(--accent-1)' : 'var(--text-secondary)',
                    padding: '8px 16px', fontSize: '0.85rem'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NotificationsCenter />
            
            <div className="nav-tabs" style={{ height: '24px', width: '1px', background: 'var(--border)' }} />
            
            <div 
              onClick={() => navigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 6px', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', cursor: 'pointer' }}
              className="card-hover"
            >
              <div className="nav-tabs" style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700 }}>{userProfile?.displayName?.split(' ')[0] || 'User'}</p>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>@{username}</p>
              </div>
              <div className="avatar avatar-md" style={{ width: '34px', height: '34px', borderRadius: '10px', fontSize: '0.8rem' }}>
                {username[0].toUpperCase()}
              </div>
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  await signOut();
                }} 
                className="icon-btn" style={{ background: 'transparent', border: 'none', width: '34px', height: '34px' }}
              >
                <LogOut size={14} />
              </button>
            </div>
            
            <button onClick={toggleTheme} className="icon-btn" style={{ width: '40px', height: '40px' }}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-container">
        {/* Welcome Header */}
        <div className="welcome-header" style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '8px' }}>
              Good morning, {userProfile?.displayName?.split(' ')[0] || 'friend'}!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>
              Here's what's happening with your shared expenses today.
            </p>
          </div>
          <button 
            onClick={() => setShowAddExpense(true)}
            className="btn btn-primary" 
            style={{ width: 'auto', padding: '14px 28px' }}
          >
            <Plus size={18} /> Record Expense
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="analytics-grid">
          <div className="glass animate-entrance" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--info-bg)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
                <Activity size={20} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Spending</span>
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>${totalSpent.toFixed(2)}</h3>
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingDown size={14} /> 12% from last month
            </div>
          </div>

          <div className="glass animate-entrance" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: myBalance >= 0 ? 'var(--success-bg)' : 'var(--error-bg)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: myBalance >= 0 ? 'var(--success)' : 'var(--error)' }}>
                <Wallet size={20} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Net Balance</span>
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: myBalance >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {myBalance >= 0 ? '+' : '-'}${Math.abs(myBalance).toFixed(2)}
            </h3>
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {myBalance >= 0 ? 'You are owed' : 'You owe others'}
            </div>
          </div>

          <div className="glass animate-entrance" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--accent-subtle)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-1)' }}>
                <Users size={20} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Peers</span>
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{friends.length}</h3>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '-8px' }}>
              {friends.slice(0, 3).map((f, i) => (
                <div key={i} className="avatar avatar-sm" style={{ border: '2px solid var(--bg-card)', marginLeft: i > 0 ? '-10px' : 0 }}>{f.username[0].toUpperCase()}</div>
              ))}
              {friends.length > 3 && <span style={{ marginLeft: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{friends.length - 3}</span>}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="animate-entrance" style={{ 
            background: 'var(--accent-gradient)', padding: '24px', borderRadius: 'var(--radius-lg)', color: 'white',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden',
            animationDelay: '0.4s'
          }}>
            <Activity style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, transform: 'rotate(-15deg)', width: '120px', height: '120px' }} />
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', opacity: 0.9 }}>Efficiency</h4>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0' }}>{efficiencyScore}%</div>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8 }}>Faster than {efficiencyScore - 4}% of peers</p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="dashboard-grid">
          {/* Left Column: List of Expenses */}
          {(activeTab === 'Overview' || activeTab === 'Expenses') && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent Transactions</h3>
              <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>History</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expenses.length === 0 ? (
                <div className="glass" style={{ padding: '60px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                  <div style={{ opacity: 0.1, marginBottom: '20px' }}><CreditCard size={64} /></div>
                  <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>No transactions</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Splits will appear here.</p>
                </div>
              ) : (
                expenses.slice().reverse().map((expense, i) => (
                  <div key={expense.id} className="glass card-hover" style={{ 
                    padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    animationDelay: `${0.1 * i}s`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{ 
                        width: '44px', height: '44px', background: 'var(--bg-elevated)', borderRadius: '12px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' 
                      }}>
                        {getCategoryEmoji(expense.category)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{expense.description}</h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {expense.paidBy === user?.id ? 'You' : expense.paidByName} · {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>${expense.amount.toFixed(2)}</p>
                        <p style={{ margin: '1px 0 0', fontSize: '0.65rem', color: 'var(--accent-1)', fontWeight: 700, letterSpacing: '0.02em' }}>{expense.splitWithNames.length} USERS</p>
                      </div>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="icon-btn" 
                        style={{ border: 'none', background: 'var(--error-bg)', color: 'var(--error)', width: '32px', height: '32px' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          )}

          {/* Right Column: Friend Activity & Settlements */}
          {(activeTab === 'Overview' || activeTab === 'Friends' || activeTab === 'Activity') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Settlements */}
            {(activeTab === 'Overview' || activeTab === 'Activity') && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Smart Settle</h3>
              <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                {settlements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <CheckCircle size={32} style={{ color: 'var(--success)', opacity: 0.5, marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>All squared up!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {settlements.map((s, idx) => (
                      <div key={idx} style={{ 
                        padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Send</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--warning)' }}>${s.amount.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                          <span style={{ color: 'var(--text-primary)' }}>{s.fromName}</span>
                          <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ color: 'var(--accent-1)' }}>{s.toName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Friend List Card */}
            {(activeTab === 'Overview' || activeTab === 'Friends') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Inner Circle</h3>
                <button onClick={() => setShowFriends(true)} className="icon-btn" style={{ borderRadius: 'var(--radius-full)', width: '32px', height: '32px' }}><Plus size={14} /></button>
              </div>
              <div className="glass" style={{ padding: '8px', borderRadius: 'var(--radius-lg)' }}>
                {friends.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Invite your friends!</p>
                ) : (
                  friends.map((friend) => (
                    <div key={friend.uid} style={{ 
                      padding: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                      borderBottom: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)'
                    }} className="card-hover">
                      <div className="avatar avatar-md" style={{ width: '40px', height: '40px', fontSize: '0.9rem', overflow: 'hidden' }}>
                        {friend.photoURL ? (
                          <img src={friend.photoURL} alt={friend.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          friend.username[0].toUpperCase()
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>{friend.displayName}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                          {friend.bio || "No bio added yet."}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}
          </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddExpenseModal open={showAddExpense} onClose={() => setShowAddExpense(false)} friends={friends} />
      <FriendsModal open={showFriends} onClose={() => setShowFriends(false)} />
      <ReviewModal />
    </div>
  );
};

export default Dashboard;
