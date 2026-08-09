import { sqliteDb } from '../database';

export const DEFAULT_CATEGORIES = [
  { id: 'cat-food', name: 'Food', icon: 'pizza', color: '#FF9800' },
  { id: 'cat-transport', name: 'Transport', icon: 'car', color: '#2196F3' },
  { id: 'cat-bills', name: 'Bills', icon: 'file-text', color: '#E91E63' },
  { id: 'cat-recharge', name: 'Mobile Recharge', icon: 'smartphone', color: '#9C27B0' },
  { id: 'cat-shopping', name: 'Shopping', icon: 'shopping-bag', color: '#00BCD4' },
  { id: 'cat-family', name: 'Family', icon: 'users', color: '#4CAF50' },
  { id: 'cat-income', name: 'Salary/Income', icon: 'dollar-sign', color: '#8BC34A' },
  { id: 'cat-others', name: 'Others', icon: 'more-horizontal', color: '#9E9E9E' },
];

export const seedCategories = async () => {
  // Check if categories already exist
  const existing = await sqliteDb.getAllAsync<{ count: number }>(`SELECT COUNT(*) as count FROM categories`);
  if (existing[0].count === 0) {
    console.log("Seeding default categories...");
    
    // Using a transaction for batch insert
    const statement = await sqliteDb.prepareAsync(
      `INSERT INTO categories (id, name, icon, color, user_editable, monthly_budget_limit) VALUES (?, ?, ?, ?, ?, ?)`
    );
    
    for (const cat of DEFAULT_CATEGORIES) {
      await statement.executeAsync([cat.id, cat.name, cat.icon, cat.color, 1, null]);
    }
    
    await statement.finalizeAsync();
    console.log("Default categories seeded.");
  }
};

// Keyword based rules for offline auto-categorization
const CATEGORY_RULES: Record<string, string[]> = {
  'cat-food': ['foodpanda', 'kacchi', 'restaurant', 'cafe', 'burger', 'pizza', 'hungrynaki', 'pathao food'],
  'cat-transport': ['uber', 'pathao', 'obhai', 'shohoz', 'bus', 'train', 'flight', 'cng'],
  'cat-bills': ['desko', 'dpdc', 'wasa', 'titas', 'internet', 'wifi', 'link3', 'carnival', 'bill'],
  'cat-recharge': ['grameenphone', 'banglalink', 'robi', 'airtel', 'teletalk', 'recharge', 'flexiload'],
  'cat-shopping': ['daraz', 'chaladal', 'chaldal', 'aarong', 'super shop', 'shwapno', 'meena bazar', 'agora'],
  'cat-income': ['salary', 'bonus', 'payroll', 'remittance'],
};

export const autoCategorize = (merchantText: string, type: 'in' | 'out'): string => {
  const normalized = merchantText.toLowerCase();
  
  // If it's a number and a Send Money / Cash In, it might be family or P2P
  const isPhoneNumber = /^01\d{9}$/.test(normalized.replace(/[^0-9]/g, ''));
  if (isPhoneNumber) {
    return 'cat-family';
  }

  for (const [categoryId, keywords] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return categoryId;
      }
    }
  }

  // Fallbacks based on transaction type
  if (type === 'in') return 'cat-income';
  
  return 'cat-others';
};
