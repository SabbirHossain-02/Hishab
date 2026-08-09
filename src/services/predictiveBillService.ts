import { sqliteDb } from '../database';

export interface PredictedBill {
  merchantText: string;
  predictedAmount: number;
  predictedDateMs: number;
  daysUntil: number;
}

export const getUpcomingBills = async (): Promise<PredictedBill[]> => {
  try {
    // 1. Fetch all outgoing transactions
    const transactions = await sqliteDb.getAllAsync<{ merchant_text: string, amount: number, timestamp: number }>(`
      SELECT merchant_text, amount, timestamp 
      FROM transactions 
      WHERE type = 'out' 
      ORDER BY timestamp ASC
    `);

    // 2. Group by merchant
    const merchantGroups: Record<string, { amounts: number[], timestamps: number[] }> = {};
    
    for (const tx of transactions) {
      // Basic normalization to group similar merchants
      const normalized = tx.merchant_text.trim().toUpperCase();
      if (!merchantGroups[normalized]) {
        merchantGroups[normalized] = { amounts: [], timestamps: [] };
      }
      merchantGroups[normalized].amounts.push(tx.amount);
      merchantGroups[normalized].timestamps.push(tx.timestamp);
    }

    const predictions: PredictedBill[] = [];
    const now = Date.now();
    const msInDay = 1000 * 60 * 60 * 24;

    // 3. Analyze patterns
    for (const [merchant, data] of Object.entries(merchantGroups)) {
      if (data.timestamps.length >= 2) {
        // Calculate gaps between consecutive transactions
        let totalGapMs = 0;
        let validGaps = 0;
        
        for (let i = 1; i < data.timestamps.length; i++) {
          const gapMs = data.timestamps[i] - data.timestamps[i - 1];
          const gapDays = gapMs / msInDay;
          
          // Check if gap is roughly monthly (e.g. 25 to 35 days)
          if (gapDays >= 25 && gapDays <= 35) {
            totalGapMs += gapMs;
            validGaps++;
          }
        }

        // If we found a consistent monthly pattern
        if (validGaps > 0 && validGaps >= data.timestamps.length - 1) {
          const avgGapMs = totalGapMs / validGaps;
          
          // Average amount
          const avgAmount = data.amounts.reduce((sum, val) => sum + val, 0) / data.amounts.length;
          
          // Next predicted date is the last occurrence + avg gap
          const lastOccurrence = data.timestamps[data.timestamps.length - 1];
          const nextPredictedDate = lastOccurrence + avgGapMs;
          
          // Only include if it's upcoming in the next 15 days or overdue by no more than 5 days
          const daysUntil = (nextPredictedDate - now) / msInDay;
          
          if (daysUntil >= -5 && daysUntil <= 15) {
            predictions.push({
              merchantText: merchant,
              predictedAmount: Math.round(avgAmount),
              predictedDateMs: nextPredictedDate,
              daysUntil: Math.round(daysUntil),
            });
          }
        }
      }
    }

    // Sort by soonest
    return predictions.sort((a, b) => a.daysUntil - b.daysUntil);

  } catch (err) {
    console.error("Failed to predict bills:", err);
    return [];
  }
};
