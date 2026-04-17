import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData, type Expense, type Settlement } from '../contexts/DataContext';
import {
  LogOut, Plus, Activity, Users, Wallet, X, Calendar, DollarSign,
  Tag, UserPlus, TrendingUp, TrendingDown, Edit2, Trash2, ArrowRight,
  CreditCard, CheckCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ════════════════════════════════════════════════════════════
   ADD EXPENSE MODAL
   ════════════════════════════════════════════════════════════ */
const AddExpenseModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { addExpense } = useData();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [friendName, setFriendName] = useState('');
  const [friends, setFriends] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleAddFriend = () => {
    const trimmed = friendName.trim();
    if (trimmed && !friends.includes(trimmed)) {
      setFriends([...friends, trimmed]);
      setFriendName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || friends.length === 0) {
      toast.error('Fill all fields and add at least one friend.');
      return;
    }
    setLoading(true);
    try {
      await addExpense(description.trim(), parseFloat(amount), friends, category || undefined);
      toast.success('Expense added!');
      setDescription(''); setAmount(''); setFriends([]); setCategory('');
      onClose();
    } catch {
      toast.error('Failed to add expense.');
    } finally { setLoading(false); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: 480, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button className="btn btn-secondary" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, padding: 6 }}><X size={18} /></button>
        <h2 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={22} className="text-primary" /> New Expense
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><Tag size={14} style={{ marginRight: 4 }} />Description</label>
            <input className="input-field" placeholder="e.g. Dinner at Marco's" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="input-group">
            <label><DollarSign size={14} style={{ marginRight: 4 }} />Amount ($)</label>
            <input className="input-field" type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="input-group">
            <label><CreditCard size={14} style={{ marginRight: 4 }} />Category (optional)</label>
            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select…</option>
              <option value="food">🍔 Food & Drinks</option>
              <option value="transport">🚗 Transport</option>
              <option value="entertainment">🎬 Entertainment</option>
              <option value="groceries">🛒 Groceries</option>
              <option value="rent">🏠 Rent & Bills</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
          <div className="input-group">
            <label><UserPlus size={14} style={{ marginRight: 4 }} />Split with</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input-field" style={{ flex: 1 }} placeholder="Friend's name" value={friendName} onChange={e => setFriendName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFriend(); } }} />
              <button type="button" className="btn btn-secondary" onClick={handleAddFriend} style={{ padding: '10px 14px' }}><Plus size={16} /></button>
            </div>
            {friends.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {friends.map(f => (
                  <span key={f} style={chipStyle}>
                    {f}
                    <button type="button" onClick={() => setFriends(friends.filter(x => x !== f))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, marginLeft: 4 }}><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8, padding: 14 }} disabled={loading}>
            {loading ? 'Adding…' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   EDIT EXPENSE MODAL
   ════════════════════════════════════════════════════════════ */
const EditExpenseModal: React.FC<{ expense: Expense | null; onClose: () => void }> = ({ expense, onClose }) => {
  const { updateExpense, deleteExpense } = useData();
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount.toString() || '');
  const [loading, setLoading] = useState(false);

  if (!expense) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) { toast.error('Fill all fields.'); return; }
    setLoading(true);
    try {
      await updateExpense(expense.id, description.trim(), parseFloat(amount));
      toast.success('Expense updated!');
      onClose();
    } catch { toast.error('Update failed.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(expense.id);
      toast.success('Expense deleted.');
      onClose();
    } catch { toast.error('Delete failed.'); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: 420, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button className="btn btn-secondary" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, padding: 6 }}><X size={18} /></button>
        <h2 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Edit2 size={20} className="text-primary" /> Edit Expense
        </h2>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label>Description</label>
            <input className="input-field" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Amount ($)</label>
            <input className="input-field" type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" style={{ flex: 1, padding: 14 }} disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button className="btn btn-danger" type="button" onClick={handleDelete} style={{ padding: '14px 18px' }}>
              <Trash2 size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   EXPENSE LIST ITEM
   ════════════════════════════════════════════════════════════ */
const categoryEmoji: Record<string, string> = {
  food: '🍔', transport: '🚗', entertainment: '🎬',
  groceries: '🛒', rent: '🏠', other: '📦'
};

const ExpenseItem: React.FC<{ expense: Expense; onEdit: () => void }> = ({ expense, onEdit }) => {
  const d = expense.date as any;
  const dateStr = d instanceof Date
    ? d.toLocaleDateString()
    : d?.toDate
      ? d.toDate().toLocaleDateString()
      : 'Just now';
  const perPerson = (expense.amount / expense.splitWithNames.length).toFixed(2);
  const emoji = categoryEmoji[expense.category || ''] || '💰';

  return (
    <div className="expense-item" style={{ cursor: 'pointer' }} onClick={onEdit}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: '1.5rem', width: 40, textAlign: 'center' }}>{emoji}</div>
        <div className="expense-details">
          <span style={{ fontWeight: 600 }}>{expense.description}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} /> {dateStr} · Paid by {expense.paidByName} · {expense.splitWithNames.length} people · ${perPerson}/each
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="expense-amount text-accent">${expense.amount.toFixed(2)}</span>
        <Edit2 size={14} style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SETTLEMENT ITEM
   ════════════════════════════════════════════════════════════ */
const SettlementItem: React.FC<{ settlement: Settlement }> = ({ settlement }) => (
  <div className="expense-item">
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
        {settlement.fromName.charAt(0)}
      </div>
      <span style={{ fontWeight: 500 }}>{settlement.fromName}</span>
      <ArrowRight size={16} className="text-primary" />
      <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--accent), #059669)' }}>
        {settlement.toName.charAt(0)}
      </div>
      <span style={{ fontWeight: 500 }}>{settlement.toName}</span>
    </div>
    <span className="text-accent" style={{ fontWeight: 600, fontSize: '1.05rem' }}>${settlement.amount.toFixed(2)}</span>
  </div>
);

/* ════════════════════════════════════════════════════════════
   BALANCE ITEM
   ════════════════════════════════════════════════════════════ */
const BalanceItem: React.FC<{ name: string; balance: number }> = ({ name, balance }) => {
  const isPositive = balance >= 0;
  return (
    <div className="expense-item">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>{name.charAt(0)}</div>
        <span style={{ fontWeight: 500 }}>{name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isPositive ? <TrendingUp size={16} className="text-accent" /> : <TrendingDown size={16} className="text-danger" />}
        <span className={isPositive ? 'text-accent' : 'text-danger'} style={{ fontWeight: 600, fontSize: '1.1rem' }}>
          {isPositive ? '+' : '-'}${Math.abs(balance).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════════════════════════ */
const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { expenses, balances, settlements, totalSpent, myBalance } = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const friendBalances = balances.filter(b => b.userName !== 'You');
  const allSettled = settlements.length === 0 && expenses.length > 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Navbar ─── */}
      <nav className="nav-bar">
        <div className="logo">
          <Wallet size={24} />
          SplitEase
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user?.displayName || 'User'}</span>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="avatar">{(user?.displayName || 'U').charAt(0)}</div>
          )}
          <button className="btn btn-secondary" onClick={signOut} style={{ padding: '8px 12px' }} title="Sign out"><LogOut size={16} /></button>
        </div>
      </nav>

      {/* ─── Main ─── */}
      <main className="container" style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="animate-fade-in" style={{ fontSize: '2rem' }}>Overview</h1>
            <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>Track your shared expenses and balances.</p>
          </div>
          <button className="btn btn-primary animate-fade-in" style={{ animationDelay: '0.15s' }} onClick={() => setAddOpen(true)}>
            <Plus size={20} /> Add Expense
          </button>
        </div>

        {/* ─── Summary Cards ─── */}
        <div className="grid-2" style={{ marginBottom: 32 }}>
          {/* Total Spent */}
          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: 12, borderRadius: 12 }}>
                <Activity size={24} className="text-accent" />
              </div>
              <h3 style={{ margin: 0 }}>Total Spent</h3>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>${totalSpent.toFixed(2)}</div>
            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>{expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded</p>
          </div>

          {/* Your Balance */}
          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: 12, borderRadius: 12 }}>
                <DollarSign size={24} className="text-primary" />
              </div>
              <h3 style={{ margin: 0 }}>Your Balance</h3>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: myBalance >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
              {myBalance >= 0 ? '+' : '-'}${Math.abs(myBalance).toFixed(2)}
            </div>
            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>
              {myBalance === 0 && expenses.length === 0 ? 'Add expenses to start tracking' : myBalance === 0 ? "You're all settled!" : myBalance > 0 ? 'Friends owe you' : 'You owe friends'}
            </p>
          </div>
        </div>

        {/* ─── Suggested Settlements ─── */}
        {(settlements.length > 0 || allSettled) && (
          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.35s', marginBottom: 32 }}>
            <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              {allSettled ? <CheckCircle size={20} className="text-accent" /> : <AlertCircle size={20} style={{ color: '#f59e0b' }} />}
              {allSettled ? 'All Settled Up!' : 'Suggested Settlements'}
            </h3>
            {allSettled ? (
              <p>Everyone is even. No payments needed! 🎉</p>
            ) : (
              <div className="expense-list">
                {settlements.map((s, i) => <SettlementItem key={i} settlement={s} />)}
              </div>
            )}
          </div>
        )}

        {/* ─── Content Grid ─── */}
        <div className="grid-2">
          {/* Recent Expenses */}
          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={20} className="text-primary" />
              Recent Expenses
            </h3>
            <div className="expense-list">
              {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <DollarSign size={32} style={{ marginBottom: 8, opacity: 0.3 }} /><br />
                  No expenses yet. Add one to get started!
                </div>
              ) : (
                expenses.slice(0, 10).map(exp => (
                  <ExpenseItem key={exp.id} expense={exp} onEdit={() => setEditingExpense(exp)} />
                ))
              )}
            </div>
          </div>

          {/* Friend Balances */}
          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} style={{ color: 'var(--secondary)' }} />
              Friend Balances
            </h3>
            <div className="expense-list">
              {friendBalances.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Users size={32} style={{ marginBottom: 8, opacity: 0.3 }} /><br />
                  Add expenses with friends to see balances.
                </div>
              ) : (
                friendBalances.map(b => <BalanceItem key={b.userId} name={b.userName} balance={b.balance} />)
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        SplitEase &copy; {new Date().getFullYear()} &mdash; Built for students, by students
      </footer>

      {/* ─── Modals ─── */}
      <AddExpenseModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} />
    </div>
  );
};

/* ────────── Shared Inline Styles ────────── */
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 200, padding: 24,
};

const chipStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
  borderRadius: 999, padding: '4px 12px', fontSize: '0.85rem', color: '#93c5fd',
};

export default Dashboard;
