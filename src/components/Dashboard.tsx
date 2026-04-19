import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useFriends } from '../contexts/FriendsContext';
import { useTheme } from '../contexts/ThemeContext';
import AddExpenseModal from './AddExpenseModal';
import FriendsModal from './FriendsModal';
import NotificationsCenter from './NotificationsCenter';
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

  const username = userProfile?.username || user?.user_metadata?.full_name || 'user';

  const getCategoryEmoji = (cat?: string) => {
    const map: Record<string, string> = {
      food: '🍽️', entertainment: '🎬', transport: '🚗',
      utilities: '💡', shopping: '🛍️', other: '📌',
    };
    return map[cat || 'other'] || '📌';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-gradient)', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Navigation */}
      <nav className="glass animate-entrance" style={{
        padding: '0 40px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--header-border)'
      }}>
        <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['Overview', 'Expenses', 'Friends', 'Activity'].map((tab) => (
                <button 
                  key={tab}
                  className="btn btn-ghost" 
                  style={{ 
                    border: 'none', background: tab === 'Overview' ? 'var(--accent-subtle)' : 'transparent',
                    color: tab === 'Overview' ? 'var(--accent-1)' : 'var(--text-secondary)',
                    padding: '8px 16px', fontSize: '0.85rem'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <NotificationsCenter />
            
            <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />
            
            <div 
              onClick={() => navigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', cursor: 'pointer' }}
              className="card-hover"
            >
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>{userProfile?.displayName || 'User'}</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>@{username}</p>
              </div>
              <div className="avatar avatar-md" style={{ borderRadius: '10px' }}>
                {username[0]}
              </div>
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  await signOut();
                }} 
                className="icon-btn" style={{ background: 'transparent', border: 'none' }}
              >
                <LogOut size={16} />
              </button>
            </div>
            
            <button onClick={toggleTheme} className="icon-btn">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
              Good morning, {userProfile?.displayName?.split(' ')[0] || 'friend'}!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              Here's what's happening with your shared expenses today.
            </p>
          </div>
          <button 
            onClick={() => setShowAddExpense(true)}
            className="btn btn-primary" 
            style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}
          >
            <Plus size={18} /> Record New Expense
          </button>
        </div>

        {/* Analytics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
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
                <div key={i} className="avatar avatar-sm" style={{ border: '2px solid var(--bg-card)', marginLeft: i > 0 ? '-10px' : 0 }}>{f.username[0]}</div>
              ))}
              {friends.length > 3 && <span style={{ marginLeft: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{friends.length - 3} more</span>}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div style={{ 
            background: 'var(--accent-gradient)', padding: '24px', borderRadius: 'var(--radius-lg)', color: 'white',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <Activity style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, transform: 'rotate(-15deg)', width: '120px', height: '120px' }} />
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Efficiency Score</h4>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0' }}>94%</div>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Settle debts faster than 90% of users</p>
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
          {/* Left Column: List of Expenses */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent Transactions</h3>
              <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>View History</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expenses.length === 0 ? (
                <div className="glass" style={{ padding: '60px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                  <div style={{ opacity: 0.2, marginBottom: '20px' }}><CreditCard size={64} /></div>
                  <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>No transactions found</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add an expense to start tracking with your friends.</p>
                </div>
              ) : (
                expenses.slice().reverse().map((expense, i) => (
                  <div key={expense.id} className="glass card-hover" style={{ 
                    padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    animationDelay: `${0.1 * i}s`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '48px', height: '48px', background: 'var(--bg-elevated)', borderRadius: '12px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' 
                      }}>
                        {getCategoryEmoji(expense.category)}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{expense.description}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {expense.paidBy === user?.id ? 'You paid' : `${expense.paidByName} paid`} · {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.125rem' }}>${expense.amount.toFixed(2)}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--accent-1)', fontWeight: 600 }}>SPLIT {expense.splitWithNames.length} WAYS</p>
                      </div>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="icon-btn" 
                        style={{ border: 'none', background: 'var(--error-bg)', color: 'var(--error)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Friend Activity & Settlements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Settlements */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Pending Settle</h3>
              <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                {settlements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <CheckCircle size={32} style={{ color: 'var(--success)', opacity: 0.5, marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>You're all squared up!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {settlements.map((s, idx) => (
                      <div key={idx} style={{ 
                        padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transfer</span>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--warning)' }}>${s.amount.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                          <span style={{ color: 'var(--text-primary)' }}>{s.fromName}</span>
                          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ color: 'var(--accent-1)' }}>{s.toName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Friend List Card */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Inner Circle</h3>
                <button onClick={() => setShowFriends(true)} className="icon-btn" style={{ borderRadius: 'var(--radius-full)' }}><Plus size={16} /></button>
              </div>
              <div className="glass" style={{ padding: '12px', borderRadius: 'var(--radius-lg)' }}>
                {friends.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lonely here. Invite friends!</p>
                ) : (
                  friends.map((friend) => (
                    <div key={friend.id} style={{ 
                      padding: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                      borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', borderRadius: 'var(--radius-md)'
                    }} className="card-hover">
                      <div className="avatar avatar-md">{friend.username[0]}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>{friend.displayName}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>● Online</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddExpenseModal open={showAddExpense} onClose={() => setShowAddExpense(false)} friends={friends} />
      <FriendsModal open={showFriends} onClose={() => setShowFriends(false)} />
    </div>
  );
};

export default Dashboard;
