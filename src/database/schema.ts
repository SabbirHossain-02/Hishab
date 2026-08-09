import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(), // bKash, Nagad, etc.
  type: text('type').notNull(), // MFS, bank, cash
  currentBalance: real('current_balance').notNull().default(0),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  userEditable: integer('user_editable', { mode: 'boolean' }).notNull().default(true),
  monthlyBudgetLimit: real('monthly_budget_limit'),
});

export const vendors = sqliteTable('vendors', {
  id: text('id').primaryKey(),
  normalizedName: text('normalized_name').notNull().unique(),
  firstSeen: integer('first_seen', { mode: 'timestamp_ms' }).notNull(),
  // price_history can be derived, or stored as JSON string
  priceHistoryInfo: text('price_history_info'), 
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  amount: real('amount').notNull(),
  type: text('type').notNull(), // 'in' | 'out'
  categoryId: text('category_id').references(() => categories.id),
  merchantText: text('merchant_text'), // raw parsed text
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull(),
  source: text('source').notNull(), // 'auto-parsed' | 'manual'
});

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => categories.id),
  month: text('month').notNull(), // YYYY-MM
  limitAmount: real('limit_amount').notNull(),
});

export const healthScoreSnapshots = sqliteTable('health_score_snapshots', {
  id: text('id').primaryKey(),
  month: text('month').notNull(), // YYYY-MM
  score: integer('score').notNull(),
  savingsRate: real('savings_rate').notNull(),
  consistency: real('consistency').notNull(),
  billPunctuality: real('bill_punctuality').notNull(),
});
