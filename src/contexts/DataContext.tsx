import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  splitWith: string[];
  splitWithNames: string[];
  date: unknown;
  groupId: string;
  category?: string;
  notes?: string;
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
  addExpense: (description: string, amount: number, splitWithNames: string[], category?: string) => Promise<void>;
  updateExpense: (id: string, description: string, amount: number) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  totalSpent: number;
  myBalance: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ─── Mock storage ───
let mockExpenses: Expense[] = [];
let mockIdCounter = 1;

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isMockMode } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [myBalance, setMyBalance] = useState(0);

  // ─── Recalculate whenever expenses change ───
  const recalculate = React.useCallback((exps: Expense[]) => {
    const spent = exps.reduce((s, e) => s + e.amount, 0);
    setTotalSpent(spent);

    // Net balance per name
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

    const currentName = user?.displayName || 'You';

    const balArr: UserBalance[] = Object.entries(netMap).map(([name, bal]) => ({
      userId: name,
      userName: name === currentName ? 'You' : name,
      balance: Math.round(bal * 100) / 100
    }));
    setBalances(balArr);

    const me = balArr.find(b => b.userName === 'You');
    setMyBalance(me ? me.balance : 0);

    // ─── Settlements (greedy) ───
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
  }, [user?.displayName]);

  // ─── Real-time sync ───
  useEffect(() => {
    if (!user) return;

    if (isMockMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpenses(mockExpenses);
      recalculate(mockExpenses);
      return;
    }

    if (!db) return;

    const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const exps: Expense[] = [];
      snapshot.forEach((d) => {
        exps.push({ id: d.id, ...d.data() } as Expense);
      });
      setExpenses(exps);
      recalculate(exps);
    });

    return unsubscribe;
  }, [user, isMockMode, recalculate]);

  // ─── CRUD ───
  const addExpense = async (description: string, amount: number, splitWithNames: string[], category?: string) => {
    if (!user) return;
    const currentName = user.displayName || 'You';
    const allNames = [currentName, ...splitWithNames];

    if (isMockMode) {
      const newExp: Expense = {
        id: `mock-${mockIdCounter++}`,
        description,
        amount,
        paidBy: user.uid,
        paidByName: currentName,
        splitWith: allNames,
        splitWithNames: allNames,
        date: new Date(),
        groupId: 'default',
        category
      };
      mockExpenses = [newExp, ...mockExpenses];
      setExpenses([...mockExpenses]);
      recalculate(mockExpenses);
      return;
    }

    if (!db) return;
    await addDoc(collection(db, 'expenses'), {
      description,
      amount,
      paidBy: user.uid,
      paidByName: currentName,
      splitWith: allNames,
      splitWithNames: allNames,
      date: serverTimestamp(),
      groupId: 'default',
      category
    });
  };

  const updateExpense = async (id: string, description: string, amount: number) => {
    if (isMockMode) {
      mockExpenses = mockExpenses.map(e => e.id === id ? { ...e, description, amount } : e);
      setExpenses([...mockExpenses]);
      recalculate(mockExpenses);
      return;
    }
    if (!db) return;
    await updateDoc(doc(db, 'expenses', id), { description, amount });
  };

  const deleteExpense = async (id: string) => {
    if (isMockMode) {
      mockExpenses = mockExpenses.filter(e => e.id !== id);
      setExpenses([...mockExpenses]);
      recalculate(mockExpenses);
      return;
    }
    if (!db) return;
    await deleteDoc(doc(db, 'expenses', id));
  };

  return (
    <DataContext.Provider value={{ expenses, balances, settlements, addExpense, updateExpense, deleteExpense, totalSpent, myBalance }}>
      {children}
    </DataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
