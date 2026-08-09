import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { tokens } from '../theme/tokens';
import { ArrowDownLeft, ArrowUpRight, Plus, Activity, HeartPulse } from 'lucide-react-native';
import { sqliteDb } from '../database';
import { calculateHealthScore, HealthScore } from '../services/healthScoreService';

// A simple hook for animating numbers (placeholder for react-native-reanimated logic in full prod)
const useAnimatedNumber = (value: number) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    // Basic count up animation
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return displayValue;
};

export const HomeScreen = () => {
  const isDark = useColorScheme() === 'dark';
  
  const [balance, setBalance] = useState<number>(0);
  const [spend, setSpend] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const animatedBalance = useAnimatedNumber(balance);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch total balance across all MFS
      const accountsResult = await sqliteDb.getAllAsync<{ current_balance: number }>('SELECT current_balance FROM accounts');
      const totalBalance = accountsResult.reduce((sum, acc) => sum + acc.current_balance, 0);
      setBalance(totalBalance);

      // Fetch this month's spend
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      // In SQLite we can filter by timestamp roughly, for MVP let's just get all 'out' transactions
      const spendResult = await sqliteDb.getAllAsync<{ amount: number }>(`SELECT amount FROM transactions WHERE type = 'out'`);
      const totalSpend = spendResult.reduce((sum, t) => sum + t.amount, 0);
      setSpend(totalSpend);

      // Fetch recent transactions
      const recentTx = await sqliteDb.getAllAsync(`SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 20`);
      setTransactions(recentTx);

      // Fetch health score
      const score = await calculateHealthScore();
      setHealthScore(score);
    } catch (err) {
      console.error(err);
      setError("Failed to load data from local database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={tokens.colors.gradient.primary as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <Text variant="sm" weight="medium" style={styles.balanceLabel}>Total Balance</Text>
        <Text variant="display" weight="bold" style={styles.balanceText}>
          ৳ {animatedBalance.toLocaleString('en-IN')}
        </Text>
      </LinearGradient>

      {healthScore && (
        <Card variant="flat" style={[styles.healthCard, { borderColor: isDark ? tokens.colors.tealNeutral[700] : tokens.colors.tealNeutral[100] }]}>
          <View style={styles.healthHeader}>
            <View style={styles.healthTitleContainer}>
              <HeartPulse size={18} color={tokens.colors.semantic.success} style={{marginRight: tokens.spacing.xs}} />
              <Text variant="base" weight="bold">Health Score</Text>
            </View>
            <Text variant="lg" weight="bold" color={tokens.colors.semantic.success}>{healthScore.totalScore}/100</Text>
          </View>
          <Text variant="sm" muted>{healthScore.insight}</Text>
        </Card>
      )}

      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text variant="base" weight="bold">This Month</Text>
          <Activity size={20} color={tokens.colors.semantic.warning} />
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={[styles.iconCircle, { backgroundColor: tokens.colors.semantic.error + '20' }]}>
              <ArrowUpRight size={16} color={tokens.colors.semantic.error} />
            </View>
            <View>
              <Text variant="sm" muted>Spend</Text>
              <Text variant="base" weight="bold">৳ {spend.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>
      </Card>
      
      <View style={styles.sectionHeader}>
        <Text variant="lg" weight="bold">Recent Transactions</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="lg" weight="bold" style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text variant="base" muted style={styles.emptyDesc}>
        Hishab is waiting for your next bKash or Nagad SMS.
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Text variant="lg" weight="bold" color={tokens.colors.semantic.error}>Something went wrong</Text>
      <Text variant="base" muted style={styles.emptyDesc}>{error}</Text>
      <Button title="Retry" variant="primary" onPress={fetchData} />
    </View>
  );

  const renderTransaction = ({ item }: { item: any }) => {
    const isIncome = item.type === 'in';
    return (
      <View style={styles.transactionRow}>
        <View style={[styles.txIcon, { backgroundColor: isIncome ? tokens.colors.semantic.success + '20' : tokens.colors.semantic.error + '20' }]}>
          {isIncome ? (
            <ArrowDownLeft size={20} color={tokens.colors.semantic.success} />
          ) : (
            <ArrowUpRight size={20} color={tokens.colors.semantic.error} />
          )}
        </View>
        <View style={styles.txDetails}>
          <Text variant="base" weight="bold" numberOfLines={1}>{item.merchant_text}</Text>
          <Text variant="sm" muted>{item.account_id.toUpperCase()} • {new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>
        <Text variant="base" weight="bold" color={isIncome ? tokens.colors.semantic.success : undefined}>
          {isIncome ? '+' : '-'}৳ {item.amount}
        </Text>
      </View>
    );
  };

  if (error && !loading && transactions.length === 0) {
    return <Screen>{renderErrorState()}</Screen>;
  }

  return (
    <Screen style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={tokens.colors.gradient.primary[0]} />
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: tokens.spacing.md,
    paddingBottom: tokens.spacing.xxl,
  },
  headerContainer: {
    marginBottom: tokens.spacing.md,
  },
  balanceCard: {
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    ...tokens.shadows.lg,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: tokens.spacing.xs,
  },
  balanceText: {
    color: '#ffffff',
  },
  healthCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.md,
    borderWidth: 1,
    backgroundColor: 'transparent'
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  healthTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCard: {
    marginBottom: tokens.spacing.xl,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  sectionHeader: {
    marginBottom: tokens.spacing.md,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  txDetails: {
    flex: 1,
    paddingRight: tokens.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginBottom: tokens.spacing.sm,
  },
  emptyDesc: {
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  simulateBtn: {
    marginTop: tokens.spacing.lg,
  }
});
