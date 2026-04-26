import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { useAuth } from './AuthContext';

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  role: string;
  createdAt: string;
  expenseCount: number;
  totalPaid: number;
  friendCount: number;
}

export interface AdminExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  payerUsername: string;
  payerEmail: string;
  category: string;
  expenseDate: string;
  createdAt: string;
  participantCount: number;
  participantNames: string;
}

export interface AdminFriendship {
  id: string;
  user1Username: string;
  user1Email: string;
  user2Username: string;
  user2Email: string;
  status: string;
  createdAt: string;
}

export interface AdminReview {
  id: string;
  userId: string;
  reviewerUsername: string;
  reviewerEmail: string;
  rating: number;
  suggestion: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  totalExpenses: number;
  totalExpenseAmount: number;
  totalFriendships: number;
  pendingFriendships: number;
  acceptedFriendships: number;
  totalReviews: number;
  avgRating: number;
  usersToday: number;
  expensesToday: number;
  usersThisWeek: number;
  expensesThisWeek: number;
}

interface AdminContextType {
  stats: AdminStats | null;
  users: AdminUser[];
  expenses: AdminExpense[];
  friendships: AdminFriendship[];
  reviews: AdminReview[];
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
  refreshFriendships: () => Promise<void>;
  refreshReviews: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// ═══════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [expenses, setExpenses] = useState<AdminExpense[]>([]);
  const [friendships, setFriendships] = useState<AdminFriendship[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      const { data, error: rpcError } = await supabase.rpc('admin_get_stats');
      if (rpcError) throw rpcError;
      if (data && data.length > 0) {
        const row = data[0];
        setStats({
          totalUsers: Number(row.total_users),
          adminUsers: Number(row.admin_users),
          totalExpenses: Number(row.total_expenses),
          totalExpenseAmount: Number(row.total_expense_amount),
          totalFriendships: Number(row.total_friendships),
          pendingFriendships: Number(row.pending_friendships),
          acceptedFriendships: Number(row.accepted_friendships),
          totalReviews: Number(row.total_reviews),
          avgRating: Number(row.avg_rating),
          usersToday: Number(row.users_today),
          expensesToday: Number(row.expenses_today),
          usersThisWeek: Number(row.users_this_week),
          expensesThisWeek: Number(row.expenses_this_week),
        });
      }
    } catch (e: any) {
      console.error('Admin stats error:', e);
      setError(e.message);
    }
  }, [user, isAdmin]);

  const refreshUsers = useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      const { data, error: rpcError } = await supabase.rpc('admin_get_all_users');
      if (rpcError) throw rpcError;
      setUsers((data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        displayName: u.display_name,
        photoUrl: u.photo_url || undefined,
        bio: u.bio || undefined,
        role: u.role,
        createdAt: u.created_at,
        expenseCount: Number(u.expense_count),
        totalPaid: Number(u.total_paid),
        friendCount: Number(u.friend_count),
      })));
    } catch (e: any) {
      console.error('Admin users error:', e);
      setError(e.message);
    }
  }, [user, isAdmin]);

  const refreshExpenses = useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      const { data, error: rpcError } = await supabase.rpc('admin_get_all_expenses');
      if (rpcError) throw rpcError;
      setExpenses((data || []).map((e: any) => ({
        id: e.id,
        description: e.description,
        amount: Number(e.amount),
        paidBy: e.paid_by,
        payerUsername: e.payer_username,
        payerEmail: e.payer_email,
        category: e.category,
        expenseDate: e.expense_date,
        createdAt: e.created_at,
        participantCount: Number(e.participant_count),
        participantNames: e.participant_names || '',
      })));
    } catch (e: any) {
      console.error('Admin expenses error:', e);
      setError(e.message);
    }
  }, [user, isAdmin]);

  const refreshFriendships = useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      const { data, error: rpcError } = await supabase.rpc('admin_get_all_friendships');
      if (rpcError) throw rpcError;
      setFriendships((data || []).map((f: any) => ({
        id: f.id,
        user1Username: f.user1_username,
        user1Email: f.user1_email,
        user2Username: f.user2_username,
        user2Email: f.user2_email,
        status: f.status,
        createdAt: f.created_at,
      })));
    } catch (e: any) {
      console.error('Admin friendships error:', e);
      setError(e.message);
    }
  }, [user, isAdmin]);

  const refreshReviews = useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      const { data, error: rpcError } = await supabase.rpc('admin_get_all_reviews');
      if (rpcError) throw rpcError;
      setReviews((data || []).map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        reviewerUsername: r.reviewer_username,
        reviewerEmail: r.reviewer_email,
        rating: Number(r.rating),
        suggestion: r.suggestion || '',
        createdAt: r.created_at,
      })));
    } catch (e: any) {
      console.error('Admin reviews error:', e);
      setError(e.message);
    }
  }, [user, isAdmin]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([
      refreshStats(),
      refreshUsers(),
      refreshExpenses(),
      refreshFriendships(),
      refreshReviews(),
    ]);
    setLoading(false);
  }, [refreshStats, refreshUsers, refreshExpenses, refreshFriendships, refreshReviews]);

  // Auto-load on mount if admin
  useEffect(() => {
    if (user && isAdmin) {
      refreshAll();
    }
  }, [user, isAdmin, refreshAll]);

  // Real-time refresh when data changes
  useEffect(() => {
    if (!user || !isAdmin) return;

    const channel = supabase.channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        refreshUsers();
        refreshStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        refreshExpenses();
        refreshStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        refreshFriendships();
        refreshStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        refreshReviews();
        refreshStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, refreshUsers, refreshExpenses, refreshFriendships, refreshReviews, refreshStats]);

  return (
    <AdminContext.Provider value={{
      stats, users, expenses, friendships, reviews,
      loading, error,
      refreshAll, refreshStats, refreshUsers, refreshExpenses, refreshFriendships, refreshReviews,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
