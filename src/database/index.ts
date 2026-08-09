import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import { seedCategories } from '../services/categorizationService';

// Open the database synchronously (supported in modern expo-sqlite)
export const sqliteDb = openDatabaseSync('hishab.db');

// Initialize Drizzle ORM
export const db = drizzle(sqliteDb, { schema });

export const setupDatabase = async () => {
  // For initial dev, let's just make sure the DB opens.
  console.log("Database initialized");
  
  // Seed default categories
  await seedCategories();
};
