import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useFriends } from '../contexts/FriendsContext';
import { useNotifications } from '../contexts/NotificationsContext';
import AddExpenseModal from './AddExpenseModal';
import FriendsModal from './FriendsModal';
import NotificationsCenter from './NotificationsCenter';
import {
  LogOut,
  Plus,
  Activity,
  Users,
  Wallet,
  Menu,
  DollarSign,
  Trash2,
  ArrowRight,
  CheckCircle,
  TrendingDown,
  CreditCard,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════════════════════ */
const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { expenses, balances, settlements, deleteExpense, totalSpent, myBalance } = useData();
  const { friends, loadFriendsData, pendingRequests } = useFriends();
  const { addNotification } = useNotifications();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadFriendsData();
  }, [loadFriendsData]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 24px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              }}
            >
              <Wallet size={28} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>SplitEase</h1>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>Split expenses effortlessly</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowFriends(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                color: '#1f2937',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
            >
              <Users size={18} />
              Friends
            </button>

            <NotificationsCenter />

            <button
              onClick={() => setShowAddExpense(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                color: 'white',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              <Plus size={18} />
              Add Expense
            </button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  padding: '10px',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  color: '#1f2937',
                }}
              >
                <Menu size={18} />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                  }}
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleSignOut();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#dc2626',
                      fontWeight: '600',
                      fontSize: '14px',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {/* Total Spent */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#9ca3af',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  Total Spent
                </p>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  background: '#fef3c7',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CreditCard size={24} color="#f59e0b" />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>${totalSpent.toFixed(2)}</p>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#10b981' }}>
              <TrendingDown size={14} style={{ display: 'inline', marginRight: '4px' }} />
              across {expenses.length} expenses
            </p>
          </div>

          {/* Your Balance */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#9ca3af',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  Your Balance
                </p>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  background: myBalance >= 0 ? '#dcfce7' : '#fee2e2',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wallet size={24} color={myBalance >= 0 ? '#16a34a' : '#dc2626'} />
              </div>
            </div>
            <p
              style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: myBalance >= 0 ? '#16a34a' : '#dc2626' }}
            >
              {myBalance >= 0 ? '+' : '-'}${Math.abs(myBalance).toFixed(2)}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>
              {myBalance >= 0 ? '✓ You are owed money' : '⚠️ You owe money'}
            </p>
          </div>

          {/* Friends Count */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#9ca3af',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  Active Friends
                </p>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  background: '#dbeafe',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={24} color="#3b82f6" />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>{friends.length}</p>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>in your group</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Expenses Section */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
            }}
          >
            <h2
              style={{
                margin: '0 0 20px',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Activity size={20} color="#667eea" />
              Recent Expenses
            </h2>

            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af' }}>
                <DollarSign size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '14px' }}>No expenses yet. Add one to get started!</p>
              </div>
            ) : (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflow: 'auto' }}
              >
                {expenses
                  .slice()
                  .reverse()
                  .map((expense) => (
                    <div
                      key={expense.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9fafb';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                          {expense.description}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                          paid by {expense.paidByName}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#667eea' }}>
                          ${expense.amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          style={{
                            padding: '6px',
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#dc2626',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fecaca')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#fee2e2')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Settlements Section */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
            }}
          >
            <h2
              style={{
                margin: '0 0 20px',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ArrowRight size={20} color="#10b981" />
              Settlements
            </h2>

            {settlements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af' }}>
                <CheckCircle size={48} style={{ opacity: 0.3, margin: '0 auto 12px', color: '#10b981' }} />
                <p style={{ margin: 0, fontSize: '14px' }}>All settled! 🎉</p>
              </div>
            ) : (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflow: 'auto' }}
              >
                {settlements.map((settlement, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#fef3c7',
                      borderRadius: '10px',
                      border: '1px solid #fcd34d',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                        {settlement.fromName} → {settlement.toName}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#92400e' }}>Transfer funds to settle</p>
                    </div>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f59e0b' }}>
                      ${settlement.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddExpenseModal open={showAddExpense} onClose={() => setShowAddExpense(false)} friends={friends} />
      <FriendsModal open={showFriends} onClose={() => setShowFriends(false)} />

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
      `}</style>
    </div>
  );
};

export default Dashboard;
