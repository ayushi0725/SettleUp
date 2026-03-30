export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export interface UserBalance {
  userId: string;
  balance: number; // net = total_paid - total_owed
}

/**
 * Minimum transactions greedy algorithm:
 * 1. Aggregate all expense_splits: for each user, sum amount_owed and subtract amounts they paid.
 * 2. Compute net balance per user: net = total_paid - total_owed.
 * 3. Split into two sorted lists: creditors (net > 0) and debtors (net < 0).
 * 4. Greedily match the largest debtor to the largest creditor.
 * 5. Create a settlement for min(|debtor|, creditor).
 * 6. Reduce both balances.
 * 7. Repeat until all balances reach zero.
 */
export function calculateSettlements(balances: UserBalance[]): Transaction[] {
  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);
  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance);

  const transactions: Transaction[] = [];

  let i = 0; // creditor index
  let j = 0; // debtor index

  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].balance, Math.abs(debtors[j].balance));
    
    if (amount > 0.01) {
      transactions.push({
        from: debtors[j].userId,
        to: creditors[i].userId,
        amount: Number(amount.toFixed(2)),
      });
    }

    creditors[i].balance -= amount;
    debtors[j].balance += amount;

    if (creditors[i].balance < 0.01) i++;
    if (Math.abs(debtors[j].balance) < 0.01) j++;
  }

  return transactions;
}
