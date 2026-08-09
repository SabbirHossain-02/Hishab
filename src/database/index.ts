import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import { seedCategories } from '../services/categorizationService';

// Open the database synchronously (supported in modern expo-sqlite)
export const sqliteDb = openDatabaseSync('hishab.db');

// Initialize Drizzle ORM
export const db = drizzle(sqliteDb, { schema });

export const setupDatabase = async () => {
  // Create tables using raw SQL for Expo SQLite
  await sqliteDb.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, provider TEXT NOT NULL, type TEXT NOT NULL, current_balance REAL NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT NOT NULL, color TEXT NOT NULL, user_editable INTEGER NOT NULL DEFAULT 1, monthly_budget_limit REAL);
    CREATE TABLE IF NOT EXISTS vendors (id TEXT PRIMARY KEY, normalized_name TEXT NOT NULL UNIQUE, first_seen INTEGER NOT NULL, price_history_info TEXT);
    CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, amount REAL NOT NULL, type TEXT NOT NULL, category_id TEXT, merchant_text TEXT, timestamp INTEGER NOT NULL, source TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS budgets (id TEXT PRIMARY KEY, category_id TEXT NOT NULL, month TEXT NOT NULL, limit_amount REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS health_score_snapshots (id TEXT PRIMARY KEY, month TEXT NOT NULL, score INTEGER NOT NULL, savings_rate REAL NOT NULL, consistency REAL NOT NULL, bill_punctuality REAL NOT NULL);
  `);
  console.log("Database tables initialized");
  
  // Seed default categories
  await seedCategories();
};
