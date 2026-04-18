import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  friends: any[];
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ open, onClose, friends }) => {
  const { addExpense } = useData();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [category, setCategory] = useState('food');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleToggleFriend = (friendName: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendName)
        ? prev.filter(f => f !== friendName)
        : [...prev, friendName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || selectedFriends.length === 0) {
      toast.error('Fill all fields and select at least one friend.');
      return;
    }
    setLoading(true);
    try {
      await addExpense(description.trim(), parseFloat(amount), selectedFriends, category);
      toast.success('Expense added successfully! 🎉');
      setDescription('');
      setAmount('');
      setSelectedFriends([]);
      setCategory('food');
      onClose();
    } catch {
      toast.error('Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'food', label: '🍽️ Food', color: '#fbbf24' },
    { value: 'entertainment', label: '🎬 Entertainment', color: '#8b5cf6' },
    { value: 'transport', label: '🚗 Transport', color: '#3b82f6' },
    { value: 'utilities', label: '💡 Utilities', color: '#10b981' },
    { value: 'shopping', label: '🛍️ Shopping', color: '#ec4899' },
    { value: 'other', label: '📌 Other', color: '#6b7280' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '2px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
            <Plus size={28} />
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Add Expense</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#1f2937' }}>
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you spend on?"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#1f2937' }}>
              Amount ($)
            </label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
              />
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#1f2937' }}>
              Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  style={{
                    padding: '10px',
                    border: category === cat.value ? '2px solid #667eea' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    background: category === cat.value ? '#f3f4f6' : 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: category === cat.value ? '600' : '500',
                    color: '#1f2937',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Select Friends */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#1f2937' }}>
              Split With ({selectedFriends.length} selected)
            </label>
            {friends.length === 0 ? (
              <div style={{ 
                padding: '16px', 
                background: '#fef3c7', 
                borderRadius: '10px', 
                color: '#92400e',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                📌 No friends added yet. Add friends in the Friends section to split expenses!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflow: 'auto' }}>
                {friends.map(friend => (
                  <label
                    key={friend.uid}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: selectedFriends.includes(friend.displayName) ? '#f0f9ff' : 'white',
                      borderColor: selectedFriends.includes(friend.displayName) ? '#667eea' : '#e5e7eb'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend.displayName)}
                      onChange={() => handleToggleFriend(friend.displayName)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                        {friend.displayName}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                        {friend.email}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || friends.length === 0}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>

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

export default AddExpenseModal;
