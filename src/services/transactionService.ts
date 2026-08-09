import { sqliteDb } from '../database';
import { parseSms } from './smsParser';
import { autoCategorize } from './categorizationService';
import { checkBudgetAndNotify } from './notificationService';

// Fallback UUID generator if uuid package isn't working in Expo without polyfills
const generateId = () => {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const saveParsedTransaction = async (sender: string, body: string, timestamp: number) => {
  const parsed = parseSms(sender, body, timestamp);
  
  if (!parsed) {
    console.log("Could not parse SMS:", body);
    return false;
  }

  // Ensure account exists
  // In a real app with Drizzle, we'd use db.insert(...).onConflictDoNothing()
  // For raw expo-sqlite (if Drizzle isn't fully synced), we can run raw SQL:
  await sqliteDb.execAsync(`
    INSERT OR IGNORE INTO accounts (id, provider, type, current_balance) 
    VALUES ('${parsed.accountId}', '${parsed.accountId}', 'MFS', 0);
  `);

  const categoryId = autoCategorize(parsed.merchantText, parsed.type);

  // Insert transaction
  await sqliteDb.execAsync(`
    INSERT INTO transactions (id, account_id, amount, type, category_id, merchant_text, timestamp, source)
    VALUES ('${generateId()}', '${parsed.accountId}', ${parsed.amount}, '${parsed.type}', '${categoryId}', '${parsed.merchantText.replace(/'/g, "''")}', ${parsed.timestamp}, 'auto-parsed');
  `);

  // Update account balance
  const balanceModifier = parsed.type === 'in' ? parsed.amount : -parsed.amount;
  await sqliteDb.execAsync(`
    UPDATE accounts 
    SET current_balance = current_balance + ${balanceModifier}
    WHERE id = '${parsed.accountId}';
  `);

  if (parsed.type === 'out') {
    await checkBudgetAndNotify(categoryId, parsed.amount);
  }

  console.log("Saved transaction:", parsed);
  return true;
};
