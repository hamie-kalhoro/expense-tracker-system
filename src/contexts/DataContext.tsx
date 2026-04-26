import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationsContext';
import toast from 'react-hot-toast';

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
  addExpense: (description: string, amount: number, participantUids: string[], participantNames: string[], date: string, category?: string) => Promise<void>;
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

    // Direct Pairwise Settlements (Secure & Context-Aware)
    // This ensures users only settle with people they actually shared expenses with.
    const directDebts: Record<string, Record<string, number>> = {};
    
    exps.forEach(exp => {
      const perPerson = exp.amount / exp.splitWith.length;
      const payerId = exp.paidBy;
      
      exp.splitWith.forEach((uid) => {
        if (uid === payerId) return;
        
        if (!directDebts[uid]) directDebts[uid] = {};
        directDebts[uid][payerId] = (directDebts[uid][payerId] || 0) + perPerson;
      });
    });

    const settArr: Settlement[] = [];
    const processedPairs = new Set<string>();
    const allRelevantUids = Object.keys(nameMap);

    for (const u1 of allRelevantUids) {
      for (const u2 of allRelevantUids) {
        if (u1 === u2) continue;
        const pairId = [u1, u2].sort().join(':');
        if (processedPairs.has(pairId)) continue;
        processedPairs.add(pairId);

        const u1OwesU2 = directDebts[u1]?.[u2] || 0;
        const u2OwesU1 = directDebts[u2]?.[u1] || 0;
        const net = u1OwesU2 - u2OwesU1;

        if (Math.abs(net) > 0.01) {
          const from = net > 0 ? u1 : u2;
          const to = net > 0 ? u2 : u1;
          const amount = Math.abs(net);

          // We only show the settlement if it involves the current user
          // This adds a layer of privacy and focus.
          if (from === currentUid || to === currentUid) {
            settArr.push({
              from,
              fromName: from === currentUid ? 'You' : (nameMap[from] || 'User'),
              to,
              toName: to === currentUid ? 'You' : (nameMap[to] || 'User'),
              amount: Math.round(amount * 100) / 100,
            });
          }
        }
      }
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
          id, description, amount, paid_by, category, created_at, group_id, expense_date, participants_uids,
          payer:users!paid_by ( username )
        `)
        .or(`paid_by.eq.${user.id},participants_uids.cs.{${user.id}}`)
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
        const splitWithUid = parts.length > 0 ? parts.map(p => p.user_id) : (exp.participants_uids || []);
        const splitWithNames = parts.length > 0 ? parts.map(p => p.user?.username || 'Unknown') : splitWithUid.map(() => 'User');
        
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
  const addExpense = async (description: string, amount: number, participantUids: string[], participantNames: string[], date: string, category?: string) => {
    if (!user || !userProfile) return;

    // Ensure the payer (current user) is ALWAYS included as a participant for balance tracking
    const finalParticipantUids = Array.from(new Set([...participantUids, user.id]));
    const currentUsername = userProfile.username;

    // Calculate individual share
    const totalPeople = finalParticipantUids.length;
    const shareAmount = amount / totalPeople;

    try {
      // Use the atomic RPC function
      const { error: rpcError } = await supabase
        .rpc('add_expense_v3', {
          p_description: description,
          p_amount: amount,
          p_category: category || 'other',
          p_expense_date: date,
          p_participant_uids: finalParticipantUids
        });

      if (rpcError) throw new Error(rpcError.message || "Failed to create expense");

      // Send notifications to all other participants
      participantUids.forEach(async (uid, idx) => {
        if (uid === user.id) return;

        // Construct a clear list of other participants for the message
        const others = participantNames.filter((_, i) => participantUids[i] !== uid);
        const othersText = others.length > 0 ? ` with ${others.join(', ')}` : '';

        try {
          await addNotification({
            userId: uid,
            type: 'expense-added',
            title: 'New Split Payment 💸',
            message: `${currentUsername} added "${description}"${othersText}. Total: $${amount.toFixed(2)} | Your Share: $${shareAmount.toFixed(2)}`,
            fromName: currentUsername,
            fromUid: user.id,
            actionUrl: '/dashboard'
          });
        } catch (notifyError) {
          console.warn('Notification failed for user:', uid, notifyError);
        }
      });
    } catch (err: any) {
      console.error('Supabase addExpense error:', err);
      throw err;
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
