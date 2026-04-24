import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationsContext';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // User ID of payer
  paidByName: string; // We'll compute this from users table
  splitWith: string[]; // User IDs of participants
  splitWithNames: string[]; // User names of participants
  date: string;
  groupId: string;
  category?: string;
}

export interface UserBalance {
  userId: string;
  userName: string;
  balance: number;
}

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

interface DataContextType {
  expenses: Expense[];
  balances: UserBalance[];
  settlements: Settlement[];
  addExpense: (description: string, amount: number, participantUids: string[], date: string, category?: string) => Promise<void>;
  updateExpense: (id: string, description: string, amount: number) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  totalSpent: number;
  myBalance: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [myBalance, setMyBalance] = useState(0);

  // Recalculate logic based strictly on the structured Expense[] array
  const recalculate = React.useCallback((exps: Expense[]) => {
    if (!user) return;
    const currentUid = user.id;

    // Total Spent: How much I have physically paid out of my pocket
    const spent = exps.reduce((s, e) => {
      return e.paidBy === currentUid ? s + e.amount : s;
    }, 0);
    setTotalSpent(spent);

    const netMap: Record<string, number> = {};
    const nameMap: Record<string, string> = {};

    exps.forEach(exp => {
      const perPerson = exp.amount / exp.splitWith.length;

      // Payer gets credit
      const payerId = exp.paidBy;
      netMap[payerId] = (netMap[payerId] || 0) + exp.amount;
      nameMap[payerId] = exp.paidByName;

      // Each participant owes their share
      exp.splitWith.forEach((uid, idx) => {
        netMap[uid] = (netMap[uid] || 0) - perPerson;
        if (!nameMap[uid]) nameMap[uid] = exp.splitWithNames[idx];
      });
    });

    const balArr: UserBalance[] = Object.entries(netMap).map(([uid, bal]) => ({
      userId: uid,
      userName: uid === currentUid ? 'You' : (nameMap[uid] || 'Unknown'),
      balance: Math.round(bal * 100) / 100
    }));
    setBalances(balArr);

    const me = balArr.find(b => b.userId === currentUid);
    setMyBalance(me ? me.balance : 0);

    // Greedy Settlements Algorithm
    const debtors: { uid: string; name: string; amount: number }[] = [];
    const creditors: { uid: string; name: string; amount: number }[] = [];

    Object.entries(netMap).forEach(([uid, bal]) => {
      const name = nameMap[uid] || uid;
      if (bal < -0.01) debtors.push({ uid, name, amount: -bal });
      if (bal > 0.01) creditors.push({ uid, name, amount: bal });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settArr: Settlement[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const transfer = Math.min(debtors[i].amount, creditors[j].amount);
      if (transfer > 0.01) {
        settArr.push({
          from: debtors[i].uid,
          fromName: debtors[i].uid === currentUid ? 'You' : debtors[i].name,
          to: creditors[j].uid,
          toName: creditors[j].uid === currentUid ? 'You' : creditors[j].name,
          amount: Math.round(transfer * 100) / 100,
        });
      }
      debtors[i].amount -= transfer;
      creditors[j].amount -= transfer;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }
    setSettlements(settArr);
  }, [user]);

  // Fetch expenses mapping to Supabase
  const loadExpenses = React.useCallback(async () => {
    if (!user) return;
    
    // We will fetch expenses via RPC or multiple joins
    try {
      // 1. Fetch expenses where user is payer OR participant
      // We rely on RLS to only return expenses the user is part of.
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id, description, amount, paid_by, category, created_at, group_id, expense_date,
          payer:users!paid_by ( username )
        `)
        .order('expense_date', { ascending: false });

      if (expensesError) throw expensesError;

      // 2. We need participants for each expense to calculate splits.
      // In a real prod environment we would use a unified Supabase view, but for MVP we fetch participants:
      const expenseIds = expensesData?.map(e => e.id) || [];
      
      let participantsData: any[] = [];
      if (expenseIds.length > 0) {
        const { data: pData, error: pError } = await supabase
          .from('expense_participants')
          .select(`
            expense_id, 
            user_id,
            user:users!user_id ( username )
          `)
          .in('expense_id', expenseIds);
          
        if (pError) throw pError;
        participantsData = pData || [];
      }

      const formattedExps: Expense[] = (expensesData || []).map((exp: any) => {
        // Find participants for this expense
        const parts = participantsData.filter(p => p.expense_id === exp.id);
        const splitWithUid = parts.map(p => p.user_id);
        const splitWithNames = parts.map(p => p.user?.username || 'Unknown');
        
        // Ensure payer is in the split if they were part of the participants (which they usually are)
        return {
          id: exp.id,
          description: exp.description,
          amount: parseFloat(exp.amount),
          paidBy: exp.paid_by,
          paidByName: exp.payer?.username || 'Unknown',
          splitWith: splitWithUid,
          splitWithNames: splitWithNames,
          date: exp.expense_date || exp.created_at,
          groupId: exp.group_id,
          category: exp.category
        };
      });

      setExpenses(formattedExps);
      recalculate(formattedExps);
      
    } catch (e) {
      console.error('Error fetching expenses:', e);
    }
  }, [user, recalculate]);

  useEffect(() => {
    if (!user) return;
    loadExpenses();

    // Subscribe to realtime updates on expenses and participants
    const expensesSub = supabase.channel('expenses_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadExpenses();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_participants' }, () => {
        loadExpenses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(expensesSub);
    };
  }, [user, loadExpenses]);

  // CRUD
  const addExpense = async (description: string, amount: number, participantUids: string[], date: string, category?: string) => {
    if (!user || !userProfile) return;

    // Ensure the payer (current user) is ALWAYS included as a participant for balance tracking
    const finalParticipantUids = Array.from(new Set([...participantUids, user.id]));

    // Calculate individual share for the notification message
    const shareAmount = amount / finalParticipantUids.length;

    try {
      // Use the atomic RPC function for production-ready reliability
      const { error: rpcError } = await supabase
        .rpc('add_expense_v3', {
          p_description: description,
          p_amount: amount,
          p_category: category || 'other',
          p_expense_date: date,
          p_participant_uids: finalParticipantUids
        });

      if (rpcError) {
        throw new Error(rpcError.message || "Failed to create expense via RPC");
      }

      // 3. Send notifications to all other participants (except the payer)
      // Logic remains the same, triggered after successful atomic insert
      finalParticipantUids.forEach(async (uid) => {
        if (uid !== user.id) {
          try {
            await addNotification({
              userId: uid,
              type: 'expense-added',
              title: 'New Shared Expense 💸',
              message: `${userProfile.username} added "${description}" - Your share: $${shareAmount.toFixed(2)}`,
              fromName: userProfile.username,
              fromUid: user.id,
              actionUrl: '/dashboard'
            });
          } catch (notifyError) {
            console.warn('Notification failed for user:', uid, notifyError);
          }
        }
      });
    } catch (err: any) {
      console.error('Supabase addExpense error:', err);
      throw err; // Re-throw to be caught by the UI
    }
  };

  const updateExpense = async (id: string, description: string, amount: number) => {
    await supabase.from('expenses').update({ description, amount }).eq('id', id);
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete expense');
    } else {
      toast.success('Expense removed');
      await loadExpenses(); // Immediate refresh
    }
  };

  return (
    <DataContext.Provider value={{ expenses, balances, settlements, addExpense, updateExpense, deleteExpense, totalSpent, myBalance }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
