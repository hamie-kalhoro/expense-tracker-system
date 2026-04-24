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
    const currentName = userProfile?.username || userProfile?.displayName || 'You';

    const spent = exps.reduce((s, e) => {
      // Amount I spent: Only count the amount I paid
      return e.paidByName === currentName ? s + e.amount : s;
    }, 0);
    setTotalSpent(spent);

    const netMap: Record<string, number> = {};

    exps.forEach(exp => {
      const perPerson = exp.amount / exp.splitWithNames.length;

      // Payer gets credit
      const payerName = exp.paidByName;
      netMap[payerName] = (netMap[payerName] || 0) + exp.amount;

      // Each participant owes their share
      exp.splitWithNames.forEach(name => {
        netMap[name] = (netMap[name] || 0) - perPerson;
      });
    });

    const balArr: UserBalance[] = Object.entries(netMap).map(([name, bal]) => ({
      userId: name,
      userName: name === currentName ? 'You' : name,
      balance: Math.round(bal * 100) / 100
    }));
    setBalances(balArr);

    const me = balArr.find(b => b.userName === 'You');
    setMyBalance(me ? me.balance : 0);

    // Greedy Settlements Algorithm
    const debtors: { name: string; amount: number }[] = [];
    const creditors: { name: string; amount: number }[] = [];

    Object.entries(netMap).forEach(([name, bal]) => {
      if (bal < -0.01) debtors.push({ name, amount: -bal });
      if (bal > 0.01) creditors.push({ name, amount: bal });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settArr: Settlement[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const transfer = Math.min(debtors[i].amount, creditors[j].amount);
      if (transfer > 0.01) {
        settArr.push({
          from: debtors[i].name,
          fromName: debtors[i].name === currentName ? 'You' : debtors[i].name,
          to: creditors[j].name,
          toName: creditors[j].name === currentName ? 'You' : creditors[j].name,
          amount: Math.round(transfer * 100) / 100,
        });
      }
      debtors[i].amount -= transfer;
      creditors[j].amount -= transfer;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }
    setSettlements(settArr);
  }, [userProfile]);

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
    await supabase.from('expenses').delete().eq('id', id);
    // Casading deletes in Postgres will clean up expense_participants automatically
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
