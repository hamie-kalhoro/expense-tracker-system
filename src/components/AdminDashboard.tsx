import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationsCenter from './NotificationsCenter';
import {
  Shield, Users, DollarSign, UserCheck, Star, Activity,
  Wallet, LogOut, Sun, Moon, Search, RefreshCw, ArrowLeft,
  TrendingUp, MessageSquare, Link2, ChevronRight, Eye,
  Mail, Calendar, BarChart3, AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { userProfile, signOut } = useAuth();
  const { stats, users, expenses, friendships, reviews, loading, error, refreshAll } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['Overview', 'Users', 'Expenses', 'Friendships', 'Reviews'];

  const getCategoryEmoji = (cat?: string) => {
    const map: Record<string, string> = {
      food: '🍽️', entertainment: '🎬', transport: '🚗',
      utilities: '💡', shopping: '🛍️', other: '📌',
    };
    return map[cat || 'other'] || '📌';
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q));
  }, [users, searchQuery]);

  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const q = searchQuery.toLowerCase();
    return expenses.filter(e => e.description.toLowerCase().includes(q) || e.payerUsername.toLowerCase().includes(q) || e.participantNames?.toLowerCase().includes(q));
  }, [expenses, searchQuery]);

  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  // ─── OVERVIEW TAB ───
  const renderOverview = () => (
    <div>
      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: <Users size={22} />, color: 'var(--accent-1)', bg: 'var(--accent-subtle)', sub: `${stats?.usersToday ?? 0} today` },
          { label: 'Total Expenses', value: stats?.totalExpenses ?? 0, icon: <DollarSign size={22} />, color: 'var(--success)', bg: 'var(--success-bg)', sub: `$${(stats?.totalExpenseAmount ?? 0).toFixed(2)} total` },
          { label: 'Friendships', value: stats?.acceptedFriendships ?? 0, icon: <UserCheck size={22} />, color: 'var(--info)', bg: 'var(--info-bg)', sub: `${stats?.pendingFriendships ?? 0} pending` },
          { label: 'Avg Rating', value: (stats?.avgRating ?? 0).toFixed(1), icon: <Star size={22} />, color: 'var(--warning)', bg: 'var(--warning-bg)', sub: `${stats?.totalReviews ?? 0} reviews` },
        ].map((kpi, i) => (
          <div key={i} className="glass animate-entrance" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '44px', height: '44px', background: kpi.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>{kpi.icon}</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{kpi.label}</span>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 6px', color: kpi.color }}>{kpi.value}</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly Activity + Recent Activity */}
      <div className="dashboard-grid" style={{ marginTop: '32px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px' }}>Weekly Snapshot</h3>
          <div className="glass" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
            {[
              { label: 'New Users This Week', value: stats?.usersThisWeek ?? 0, color: 'var(--accent-1)' },
              { label: 'Expenses This Week', value: stats?.expensesThisWeek ?? 0, color: 'var(--success)' },
              { label: 'Admin Accounts', value: stats?.adminUsers ?? 0, color: 'var(--warning)' },
              { label: 'Platform Volume', value: `$${(stats?.totalExpenseAmount ?? 0).toFixed(2)}`, color: 'var(--info)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px' }}>Recent Users</h3>
          <div className="glass" style={{ padding: '12px', borderRadius: 'var(--radius-lg)', maxHeight: '320px', overflowY: 'auto' }}>
            {users.slice(0, 6).map(u => (
              <div key={u.id} style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="avatar avatar-sm" style={{ fontSize: '0.7rem' }}>{u.username[0].toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{u.username}</p>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</p>
                </div>
                {u.role === 'admin' && <span className="badge" style={{ background: 'var(--accent-gradient)', color: 'white', fontSize: '0.6rem' }}>ADMIN</span>}
              </div>
            ))}
            {users.length === 0 && <p style={{ textAlign: 'center', padding: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No users yet</p>}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── USERS TAB ───
  const renderUsers = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>All Users ({users.length})</h3>
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="input-field" style={{ paddingLeft: '40px', height: '42px', fontSize: '0.85rem' }} />
        </div>
      </div>
      <div className="admin-table-wrapper glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th>Expenses</th><th>Total Paid</th><th>Friends</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar avatar-sm" style={{ width: '30px', height: '30px', fontSize: '0.65rem' }}>{u.username[0].toUpperCase()}</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem' }}>{u.displayName || u.username}</p>
                      <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--accent-1)' }}>@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td><span className="badge" style={u.role === 'admin' ? { background: 'var(--accent-gradient)', color: 'white' } : {}}>{u.role.toUpperCase()}</span></td>
                <td style={{ fontWeight: 700 }}>{u.expenseCount}</td>
                <td style={{ fontWeight: 700, color: 'var(--success)' }}>${u.totalPaid.toFixed(2)}</td>
                <td style={{ fontWeight: 700 }}>{u.friendCount}</td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No users found</p>}
      </div>
    </div>
  );

  // ─── EXPENSES TAB ───
  const renderExpenses = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>All Expenses ({expenses.length})</h3>
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search expenses..." className="input-field" style={{ paddingLeft: '40px', height: '42px', fontSize: '0.85rem' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredExpenses.map(exp => (
          <div key={exp.id} className="glass card-hover" style={{ padding: '18px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', minWidth: 0 }}>
              <div style={{ width: '42px', height: '42px', background: 'var(--bg-elevated)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{getCategoryEmoji(exp.category)}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Paid by <span style={{ color: 'var(--accent-1)', fontWeight: 700 }}>@{exp.payerUsername}</span> · {formatDate(exp.expenseDate || exp.createdAt)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Split</p>
                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700 }}>{exp.participantCount} users</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>${exp.amount.toFixed(2)}</p>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>{exp.category}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredExpenses.length === 0 && <div className="glass" style={{ textAlign: 'center', padding: '60px', borderRadius: 'var(--radius-lg)' }}><p style={{ color: 'var(--text-muted)' }}>No expenses found</p></div>}
      </div>
    </div>
  );

  // ─── FRIENDSHIPS TAB ───
  const renderFriendships = () => (
    <div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '24px' }}>All Friendships ({friendships.length})</h3>
      <div className="admin-table-wrapper glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr><th>Sender</th><th></th><th>Receiver</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {friendships.map(f => (
              <tr key={f.id}>
                <td>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem' }}>@{f.user1Username}</p>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)' }}>{f.user1Email}</p>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}><ChevronRight size={14} style={{ color: 'var(--text-muted)' }} /></td>
                <td>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem' }}>@{f.user2Username}</p>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)' }}>{f.user2Email}</p>
                  </div>
                </td>
                <td>
                  <span className="badge" style={{
                    background: f.status === 'accepted' ? 'var(--success-bg)' : f.status === 'pending' ? 'var(--warning-bg)' : 'var(--error-bg)',
                    color: f.status === 'accepted' ? 'var(--success)' : f.status === 'pending' ? 'var(--warning)' : 'var(--error)',
                    border: `1px solid ${f.status === 'accepted' ? 'var(--success-border)' : f.status === 'pending' ? 'var(--warning-border)' : 'var(--error-border)'}`,
                  }}>{f.status.toUpperCase()}</span>
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(f.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {friendships.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No friendships yet</p>}
      </div>
    </div>
  );

  // ─── REVIEWS TAB ───
  const renderReviews = () => (
    <div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '24px' }}>All Reviews ({reviews.length})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {reviews.map(r => (
          <div key={r.id} className="glass animate-entrance" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar avatar-sm" style={{ width: '32px', height: '32px', fontSize: '0.7rem' }}>{r.reviewerUsername[0].toUpperCase()}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem' }}>@{r.reviewerUsername}</p>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatDate(r.createdAt)}</p>
                </div>
              </div>
              <span style={{ fontSize: '1.1rem', color: 'var(--warning)', letterSpacing: '2px' }}>{renderStars(r.rating)}</span>
            </div>
            {r.suggestion && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>"{r.suggestion}"</p>}
            {!r.suggestion && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.6 }}>No written feedback</p>}
          </div>
        ))}
        {reviews.length === 0 && <div className="glass" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', borderRadius: 'var(--radius-lg)' }}><p style={{ color: 'var(--text-muted)' }}>No reviews yet</p></div>}
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Overview': return renderOverview();
      case 'Users': return renderUsers();
      case 'Expenses': return renderExpenses();
      case 'Friendships': return renderFriendships();
      case 'Reviews': return renderReviews();
      default: return renderOverview();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Admin Nav */}
      <nav className="glass animate-entrance nav-header" style={{
        padding: '0 40px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--header-border)',
      }}>
        <div className="nav-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(239,68,68,0.2)' }}>
                <Shield size={20} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1 }}>Admin <span style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Panel</span></h1>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SplitEase</p>
              </div>
            </div>

            <div className="nav-tabs" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(''); }} className="btn btn-ghost" style={{
                  border: 'none', padding: '8px 14px', fontSize: '0.82rem',
                  background: tab === activeTab ? 'rgba(239,68,68,0.08)' : 'transparent',
                  color: tab === activeTab ? '#ef4444' : 'var(--text-secondary)',
                }}>{tab}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={refreshAll} disabled={loading} className="icon-btn" style={{ width: '38px', height: '38px' }} title="Refresh">
              <RefreshCw size={16} className={loading ? 'spin-animation' : ''} />
            </button>
            <NotificationsCenter />
            <button onClick={toggleTheme} className="icon-btn theme-spin" style={{ width: '38px', height: '38px' }}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button onClick={() => navigate('/profile')} className="icon-btn" style={{ width: '38px', height: '38px' }} title="Back to App">
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      </nav>

      <main className="main-container">
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '4px' }}>
              {activeTab === 'Overview' ? 'Platform Overview' : activeTab}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500 }}>
              Monitoring all platform activity in real-time
            </p>
          </div>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--error-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--error-border)' }}>
              <AlertCircle size={14} style={{ color: 'var(--error)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--error)', fontWeight: 600 }}>{error}</span>
            </div>
          )}
        </div>

        {loading && !stats ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
            <span className="spinner" />
          </div>
        ) : (
          renderActiveTab()
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
