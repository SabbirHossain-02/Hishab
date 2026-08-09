import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { tokens } from '../theme/tokens';
import { sqliteDb } from '../database';
import { useColorScheme } from 'react-native';

export const BudgetsScreen = () => {
  const isDark = useColorScheme() === 'dark';
  const [budgets, setBudgets] = useState<any[]>([]);

  const fetchBudgets = useCallback(async () => {
    try {
      // For MVP, we will just show categories and their total spend this month.
      // If a budget_limit exists, we calculate progress.
      
      const query = `
        SELECT 
          c.id, c.name, c.color, c.monthly_budget_limit,
          COALESCE(SUM(t.amount), 0) as spent
        FROM categories c
        LEFT JOIN transactions t ON c.id = t.category_id AND t.type = 'out'
        GROUP BY c.id
        ORDER BY spent DESC
      `;
      const result = await sqliteDb.getAllAsync(query);
      setBudgets(result);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const renderBudgetCard = ({ item }: { item: any }) => {
    const limit = item.monthly_budget_limit || 0;
    const spent = item.spent || 0;
    
    // If no limit set, maybe show just spent, or a generic 0% progress
    const hasLimit = limit > 0;
    const progress = hasLimit ? Math.min((spent / limit) * 100, 100) : 0;
    
    // Determine color based on progress (red if > 90%)
    let progressColor = item.color || tokens.colors.gradient.primary[0];
    if (hasLimit && progress > 90) {
      progressColor = tokens.colors.semantic.error;
    } else if (hasLimit && progress > 75) {
      progressColor = tokens.colors.semantic.warning;
    }

    return (
      <Card variant="flat" style={styles.budgetCard}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryInfo}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text variant="base" weight="bold">{item.name}</Text>
          </View>
          <Text variant="sm" muted>
            {hasLimit ? `৳ ${spent} / ৳ ${limit}` : `৳ ${spent} spent`}
          </Text>
        </View>

        {hasLimit ? (
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progress}%`, backgroundColor: progressColor }
              ]} 
            />
          </View>
        ) : (
          <TouchableOpacity style={styles.setBudgetBtn}>
            <Text variant="sm" color={tokens.colors.gradient.primary[0]} weight="bold">
              + Set Budget
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  return (
    <Screen safeArea>
      <View style={styles.header}>
        <Text variant="xl" weight="bold">Budgets</Text>
        <Text variant="base" muted>This Month</Text>
      </View>

      <FlatList
        data={budgets}
        keyExtractor={item => item.id}
        renderItem={renderBudgetCard}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.sm,
  },
  listContent: {
    padding: tokens.spacing.md,
    paddingBottom: tokens.spacing.xxl,
  },
  budgetCard: {
    marginBottom: tokens.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: tokens.spacing.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(150,150,150,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  setBudgetBtn: {
    paddingTop: tokens.spacing.xs,
  }
});
