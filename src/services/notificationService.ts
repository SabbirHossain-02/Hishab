import * as Notifications from 'expo-notifications';
import { sqliteDb } from '../database';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

export const checkBudgetAndNotify = async (categoryId: string, newTransactionAmount: number) => {
  try {
    // 1. Get the category's budget limit and total spent so far
    const query = `
      SELECT 
        c.name as category_name,
        c.monthly_budget_limit,
        COALESCE(SUM(t.amount), 0) as spent
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND t.type = 'out'
      WHERE c.id = ?
      GROUP BY c.id
    `;
    const result = await sqliteDb.getAllAsync<{category_name: string, monthly_budget_limit: number, spent: number}>(query, [categoryId]);
    
    if (result.length > 0) {
      const category = result[0];
      
      // Only proceed if a budget limit is set
      if (category.monthly_budget_limit > 0) {
        const spent = category.spent;
        const limit = category.monthly_budget_limit;
        
        // If the *previous* spend was under the limit, but this new transaction pushed it over
        const previousSpent = spent - newTransactionAmount;
        
        if (spent > limit && previousSpent <= limit) {
          // Trigger local push notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "⚠️ Budget Exceeded",
              body: `You've exceeded your monthly budget for ${category.category_name}.`,
              sound: true,
            },
            trigger: null, // trigger immediately
          });
        }
        // Alternatively, we could notify at 90%
        else if (spent >= limit * 0.9 && previousSpent < limit * 0.9) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Budget Warning",
              body: `You are nearing your monthly budget limit for ${category.category_name}.`,
              sound: true,
            },
            trigger: null,
          });
        }
      }
    }
  } catch (err) {
    console.error("Failed to check budgets for notifications:", err);
  }
};
