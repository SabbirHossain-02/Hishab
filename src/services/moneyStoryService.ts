import { sqliteDb } from '../database';

export interface MoneyStoryStats {
  totalSpend: number;
  topCategory: string;
  topCategorySpend: number;
  mostFrequentMerchant: string;
  count: number;
  month: string;
}

const getMonthlyStats = async (): Promise<MoneyStoryStats | null> => {
  try {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    // Total Spend
    const totalResult = await sqliteDb.getAllAsync<{total: number}>(`SELECT SUM(amount) as total FROM transactions WHERE type = 'out'`);
    const totalSpend = totalResult[0]?.total || 0;

    if (totalSpend === 0) return null;

    // Top Category
    const topCatResult = await sqliteDb.getAllAsync<{name: string, total: number}>(`
      SELECT c.name, SUM(t.amount) as total 
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'out'
      GROUP BY c.id
      ORDER BY total DESC
      LIMIT 1
    `);
    
    // Most Frequent Merchant
    const topMerchantResult = await sqliteDb.getAllAsync<{merchant_text: string, count: number}>(`
      SELECT merchant_text, COUNT(*) as count 
      FROM transactions
      WHERE type = 'out'
      GROUP BY UPPER(TRIM(merchant_text))
      ORDER BY count DESC
      LIMIT 1
    `);

    return {
      totalSpend,
      topCategory: topCatResult[0]?.name || 'Unknown',
      topCategorySpend: topCatResult[0]?.total || 0,
      mostFrequentMerchant: topMerchantResult[0]?.merchant_text || 'Unknown',
      count: topMerchantResult[0]?.count || 0,
      month: currentMonth
    };
  } catch (err) {
    console.error("Failed to aggregate stats for Money Story", err);
    return null;
  }
};

export const fetchMoneyStory = async (): Promise<string> => {
  const stats = await getMonthlyStats();
  
  if (!stats) {
    return "Keep tracking your transactions to unlock your first Money Story next month!";
  }

  try {
    // Call the local Node.js backend (10.0.2.2 is Android emulator localhost)
    const response = await fetch('http://10.0.2.2:3000/api/money-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
    });

    if (!response.ok) throw new Error("Backend not reachable");

    const data = await response.json();
    return data.story;

  } catch (err) {
    console.log("Falling back to local template for Money Story", err);
    // Offline / Backend down fallback
    return `You spent ৳${stats.totalSpend.toLocaleString('en-IN')} this month, with most of it going to ${stats.topCategory}. Oh, and you really love ${stats.mostFrequentMerchant} — you visited them ${stats.count} times!`;
  }
};
