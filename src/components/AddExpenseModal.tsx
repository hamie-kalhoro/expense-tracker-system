import React, { useState } from 'react';
import { useAuth, type UserProfile } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { X, DollarSign, Users, Tag, Divide, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  friends: UserProfile[];
}

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'entertainment', label: 'Fun', icon: '🎬' },
  { id: 'transport', label: 'Transit', icon: '🚗' },
  { id: 'utilities', label: 'Bills', icon: '💡' },
  { id: 'shopping', label: 'Shop', icon: '🛍️' },
  { id: 'other', label: 'Other', icon: '📌' },
];

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ open, onClose, friends }) => {
  const { user, userProfile } = useAuth();
  const { addExpense } = useData();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (selectedFriends.length === 0) {
      toast.error('Please select at least one friend to split with');
      return;
    }

    setLoading(true);
    try {
      await addExpense(
        description.trim(),
        numAmount,
        selectedFriends,
        date,
        category
      );

      toast.success('Expense added successfully! 💰');
      setDescription('');
      setAmount('');
      setCategory('other');
      setSelectedFriends([]);
      onClose();
    } catch (error) {
      toast.error('Failed to add expense');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const splitAmount = parseFloat(amount) > 0 ? parseFloat(amount) / (selectedFriends.length + 1) : 0;

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
        maxWidth: '520px', width: '100%', borderRadius: 'var(--radius-xl)',
        overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'relative'
      }}>
        {/* Header */}
        <div style={{ padding: '32px 32px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>New Expense</h2>
            <button onClick={onClose} className="icon-btn" style={{ background: 'transparent', border: 'none' }}><X size={20} /></button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Enter the details of your shared payment.</p>
        </div>

        <form id="add-expense-form" onSubmit={handleSubmit} style={{ padding: '0 32px 32px' }}>
          {/* Big Amount Input */}
          <div style={{ 
            textAlign: 'center', padding: '40px 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: '32px'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, opacity: 0.3 }}>$</span>
              <input
                type="number" step="0.01" min="0" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" required autoFocus
                style={{
                  background: 'transparent', border: 'none', fontSize: '4.5rem', fontWeight: 800,
                  color: 'var(--text-primary)', width: '240px', outline: 'none', padding: 0,
                  fontFamily: "'Inter', sans-serif", letterSpacing: '-0.04em'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expense Title</label>
              <div style={{ position: 'relative' }}>
                <Tag size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was this for?" className="input-field"
                  style={{ paddingLeft: '48px', height: '52px', fontSize: '1rem' }} required
                />
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '48px', height: '52px', fontSize: '1rem' }} required
                />
              </div>
            </div>

            {/* Category Grid */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '16px 12px', borderRadius: 'var(--radius-md)',
                      background: category === cat.id ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                      border: `2px solid ${category === cat.id ? 'var(--accent-1)' : 'transparent'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: category === cat.id ? 'var(--accent-1)' : 'var(--text-secondary)' }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Split Logic */}
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} /> Split With
                </h4>
                {splitAmount > 0 && selectedFriends.length > 0 && (
                  <span className="badge badge-accent" style={{ padding: '6px 12px' }}>${splitAmount.toFixed(2)} each</span>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {friends.map((friend) => (
                  <button
                    key={friend.uid} type="button"
                    onClick={() => {
                      if (selectedFriends.includes(friend.uid)) {
                        setSelectedFriends(selectedFriends.filter(id => id !== friend.uid));
                      } else {
                        setSelectedFriends([...selectedFriends, friend.uid]);
                      }
                    }}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
                      background: selectedFriends.includes(friend.uid) ? 'var(--accent-gradient)' : 'var(--bg-card)',
                      color: selectedFriends.includes(friend.uid) ? 'white' : 'var(--text-primary)',
                      fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <div className="avatar avatar-sm" style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}>{friend.username[0]}</div>
                    @{friend.username}
                  </button>
                ))}
                {friends.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No friends connected yet.</p>}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1, padding: '14px' }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, padding: '14px' }}>
              {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : 'Confirm Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
