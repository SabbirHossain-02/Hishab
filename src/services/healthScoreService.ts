import { sqliteDb } from '../database';

export interface HealthScore {
  totalScore: number;
  savingsRateScore: number;
  budgetDisciplineScore: number;
  insight: string;
}

export const calculateHealthScore = async (): Promise<HealthScore> => {
  try {
    // 1. Get Income vs Expense for the current month
    const currentMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
    
    // In a real app we'd filter by timestamp > startOfMonth. For MVP we'll just sum all.
    // Or we can do a simple timestamp filter if we assume all DB transactions are recent.
    
    const totals = await sqliteDb.getAllAsync<{ type: string, total: number }>(`
      SELECT type, SUM(amount) as total 
      FROM transactions 
      GROUP BY type
    `);

    let income = 0;
    let expense = 0;
    
    for (const row of totals) {
      if (row.type === 'in') income += row.total;
      if (row.type === 'out') expense += row.total;
    }

    // Savings Rate (Max 50 points)
    // Goal: save at least 20% of income. 
    // Score calculation: (Savings / Income) / 0.20 * 50
    let savingsRateScore = 0;
    if (income > 0) {
      const savingsRate = (income - expense) / income;
      if (savingsRate > 0) {
        savingsRateScore = Math.min(50, (savingsRate / 0.20) * 50);
      }
    } else if (expense === 0) {
      savingsRateScore = 50; // No income, no expense = neutral
    }

    // 2. Get Budget Discipline (Max 50 points)
    // Goal: don't exceed category limits.
    const budgetData = await sqliteDb.getAllAsync<{ limit_amt: number, spent: number }>(`
      SELECT 
        c.monthly_budget_limit as limit_amt,
        COALESCE(SUM(t.amount), 0) as spent
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND t.type = 'out'
      WHERE c.monthly_budget_limit IS NOT NULL
      GROUP BY c.id
    `);

    let budgetDisciplineScore = 50;
    let overageCount = 0;

    for (const b of budgetData) {
      if (b.limit_amt > 0 && b.spent > b.limit_amt) {
        overageCount++;
        budgetDisciplineScore -= 10; // Penalize 10 points per over-budget category
      }
    }
    budgetDisciplineScore = Math.max(0, budgetDisciplineScore);

    const totalScore = Math.round(savingsRateScore + budgetDisciplineScore);
    
    let insight = "Keep tracking to build your score.";
    if (totalScore >= 80) insight = "Excellent financial discipline! 🎉";
    else if (totalScore >= 50) insight = "On track, but watch your category budgets.";
    else if (totalScore > 0) insight = "Warning: Expenses are eating into your savings.";

    return {
      totalScore,
      savingsRateScore: Math.round(savingsRateScore),
      budgetDisciplineScore: Math.round(budgetDisciplineScore),
      insight
    };
  } catch (err) {
    console.error("Error calculating health score:", err);
    return { totalScore: 0, savingsRateScore: 0, budgetDisciplineScore: 0, insight: "Not enough data yet." };
  }
};
