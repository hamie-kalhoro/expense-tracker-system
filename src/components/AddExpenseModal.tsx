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

    setLoading(true);
    try {
      const selectedFriendsNames = friends
        .filter(f => selectedFriends.includes(f.uid))
        .map(f => f.username);

      await addExpense(
        description.trim(),
        numAmount,
        selectedFriends,
        selectedFriendsNames,
        date,
        category
      );

      toast.success('Expense added successfully! 💰');
      setDescription('');
      setAmount('');
      setCategory('other');
      setSelectedFriends([]);
      onClose();
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Check your internet or database permissions'}`);
      console.error('Submission Error:', error);
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
        zIndex: 200, padding: '20px', backdropFilter: 'blur(8px)',
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
        <div style={{ padding: 'clamp(20px, 5vw, 32px) clamp(20px, 5vw, 32px) 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>New Expense</h2>
            <button onClick={onClose} className="icon-btn" style={{ background: 'transparent', border: 'none' }}><X size={20} /></button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Enter details for your shared payment.</p>
        </div>

        <form id="add-expense-form" onSubmit={handleSubmit} style={{ 
          padding: '0 clamp(20px, 5vw, 32px) clamp(20px, 5vw, 32px)', 
          maxHeight: 'calc(95vh - 120px)', 
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}>
          {/* Big Amount Input */}
          <div style={{ 
            textAlign: 'center', 
            padding: '32px 0 40px', 
            borderBottom: '1px solid var(--border-subtle)', 
            marginBottom: '32px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            margin: '0 0 32px 0'
          }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount to Split</label>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-1)' }}>$</span>
              <input
                type="number" step="0.01" min="0" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" required autoFocus
                className="amount-input"
                style={{
                  background: 'transparent', border: 'none', fontSize: '3.5rem', fontWeight: 800,
                  color: 'var(--text-primary)', width: '220px', outline: 'none', padding: 0,
                  fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em',
                  textAlign: 'left'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Description - RESTORED */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expense Title</label>
              <div style={{ position: 'relative' }}>
                <Tag size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was this for? (e.g. Dinner, Rent)" className="input-field"
                  style={{ 
                    paddingLeft: '48px', height: '56px', fontSize: '1rem', 
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)' 
                  }} required
                />
              </div>
            </div>

            {/* Premium Date Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
              <div style={{ 
                display: 'flex', gap: '10px', overflowX: 'auto', padding: '4px 2px', scrollbarWidth: 'none' 
              }}>
                {/* Visual date quick-picks */}
                {[0, 1, 2, 3, 4].map(daysAgo => {
                  const d = new Date();
                  d.setDate(d.getDate() - daysAgo);
                  const dateStr = d.toISOString().split('T')[0];
                  const isSelected = date === dateStr;
                  const label = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : d.toLocaleDateString(undefined, { weekday: 'short' });
                  
                  return (
                    <button
                      key={daysAgo} type="button"
                      onClick={() => setDate(dateStr)}
                      style={{
                        padding: '10px 16px', borderRadius: '12px', flexShrink: 0, border: '1px solid var(--border)',
                        background: isSelected ? 'var(--accent-gradient)' : 'var(--bg-elevated)',
                        color: isSelected ? 'white' : 'var(--text-secondary)',
                        fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '85px'
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', opacity: isSelected ? 0.9 : 0.6 }}>{label}</span>
                      <span>{d.getDate()} {d.toLocaleDateString(undefined, { month: 'short' })}</span>
                    </button>
                  );
                })}
                
                {/* Custom Date Picker Trigger */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                   <input
                    type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    style={{
                      position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%'
                    }}
                  />
                  <div style={{
                    padding: '10px 16px', borderRadius: '12px', border: '1px dashed var(--border)',
                    background: 'var(--bg-card)', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: '8px', height: '100%', minWidth: '120px'
                  }}>
                    <Calendar size={16} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Custom</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Grid */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
              <div className="grid-cols-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '12px 8px', borderRadius: 'var(--radius-md)',
                      background: category === cat.id ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                      border: `1.5px solid ${category === cat.id ? 'var(--accent-1)' : 'transparent'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: category === cat.id ? 'var(--accent-1)' : 'var(--text-secondary)' }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Split Logic */}
            <div style={{ 
              padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} /> Split With
                </h4>
                {parseFloat(amount) > 0 && (
                  <span className="badge-accent" style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '0.75rem' }}>
                    ${splitAmount.toFixed(2)} EACH
                  </span>
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
                      padding: '10px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
                      background: selectedFriends.includes(friend.uid) ? 'var(--accent-gradient)' : 'var(--bg-card)',
                      color: selectedFriends.includes(friend.uid) ? 'white' : 'var(--text-primary)',
                      fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <div className="avatar avatar-sm" style={{ width: '20px', height: '20px', fontSize: '0.6rem', border: '1px solid rgba(255,255,255,0.2)' }}>{friend.username[0]}</div>
                    @{friend.username}
                  </button>
                ))}
                {friends.length === 0 && (
                  <div style={{ textAlign: 'center', width: '100%', padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Personal expense (tracking only)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexDirection: 'row' }} className="grid-mobile-stack">
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1, padding: '14px' }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, padding: '14px', position: 'relative' }}>
              {loading ? <div className="spinner" style={{ borderTopColor: 'white', width: '20px', height: '20px' }} /> : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
