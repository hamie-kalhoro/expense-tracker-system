import { db } from './config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

export interface ExpenseData {
  description: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  splitWith: string[];
  splitWithNames: string[];
  date: Timestamp | Date;
  groupId: string;
  category?: string;
  notes?: string;
}

/**
 * Add a new expense to Firestore
 */
export const createExpense = async (data: Omit<ExpenseData, 'date'>) => {
  if (!db) throw new Error('Firestore not initialized');

  return addDoc(collection(db, 'expenses'), {
    ...data,
    date: serverTimestamp()
  });
};

/**
 * Update an existing expense (for manual corrections)
 */
export const updateExpense = async (expenseId: string, updates: Partial<ExpenseData>) => {
  if (!db) throw new Error('Firestore not initialized');

  const ref = doc(db, 'expenses', expenseId);
  return updateDoc(ref, updates);
};

/**
 * Delete an expense
 */
export const removeExpense = async (expenseId: string) => {
  if (!db) throw new Error('Firestore not initialized');

  const ref = doc(db, 'expenses', expenseId);
  return deleteDoc(ref);
};

/**
 * Subscribe to real-time expense updates for the current user
 */
export const subscribeToExpenses = (
  userId: string,
  callback: (expenses: (ExpenseData & { id: string })[]) => void
) => {
  if (!db) return () => {};

  const q = query(
    collection(db, 'expenses'),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const expenses: (ExpenseData & { id: string })[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as ExpenseData;
      // Only include expenses where the user is a participant
      if (data.paidBy === userId || data.splitWith?.includes(userId)) {
        expenses.push({ id: doc.id, ...data });
      }
    });
    callback(expenses);
  });
};

/**
 * Calculate net balances between users from a list of expenses.
 * Returns a map: userId → net balance (positive = owed money, negative = owes money)
 */
export const calculateNetBalances = (
  expenses: (ExpenseData & { id: string })[]
): Record<string, number> => {
  const balances: Record<string, number> = {};

  expenses.forEach(exp => {
    const perPerson = exp.amount / exp.splitWith.length;

    // The payer gains credit
    if (!balances[exp.paidBy]) balances[exp.paidBy] = 0;
    balances[exp.paidBy] += exp.amount;

    // Each participant owes their share
    exp.splitWith.forEach(uid => {
      if (!balances[uid]) balances[uid] = 0;
      balances[uid] -= perPerson;
    });
  });

  return balances;
};

/**
 * Calculate suggested settlements: a list of transfers to equalize all balances.
 * Uses a greedy approach to minimize number of transfers.
 */
export const calculateSettlements = (
  balances: Record<string, number>
): { from: string; to: string; amount: number }[] => {
  const debtors: { uid: string; amount: number }[] = [];
  const creditors: { uid: string; amount: number }[] = [];

  Object.entries(balances).forEach(([uid, balance]) => {
    if (balance < -0.01) debtors.push({ uid, amount: -balance });
    if (balance > 0.01) creditors.push({ uid, amount: balance });
  });

  // Sort descending by amount for efficiency
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: { from: string; to: string; amount: number }[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const transfer = Math.min(debtors[i].amount, creditors[j].amount);
    if (transfer > 0.01) {
      settlements.push({
        from: debtors[i].uid,
        to: creditors[j].uid,
        amount: Math.round(transfer * 100) / 100
      });
    }
    debtors[i].amount -= transfer;
    creditors[j].amount -= transfer;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return settlements;
};
