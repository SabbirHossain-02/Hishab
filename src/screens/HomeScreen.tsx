import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { tokens } from '../theme/tokens';
import { ArrowDownLeft, ArrowUpRight, Plus, Activity, HeartPulse, Menu } from 'lucide-react-native';
import { sqliteDb } from '../database';
import { calculateHealthScore, HealthScore } from '../services/healthScoreService';

const useAnimatedNumber = (value: number) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
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
  const [balance, setBalance] = useState<number>(0);
  const [spend, setSpend] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>('Good Morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const animatedBalance = useAnimatedNumber(balance);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accountsResult = await sqliteDb.getAllAsync<{ current_balance: number }>('SELECT current_balance FROM accounts');
      const totalBalance = accountsResult.reduce((sum, acc) => sum + acc.current_balance, 0);
      setBalance(totalBalance);

      const spendResult = await sqliteDb.getAllAsync<{ amount: number }>(`SELECT amount FROM transactions WHERE type = 'out'`);
      const totalSpend = spendResult.reduce((sum, t) => sum + t.amount, 0);
      setSpend(totalSpend);

      const recentTx = await sqliteDb.getAllAsync(`SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 20`);
      setTransactions(recentTx);

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
      <View style={styles.greetingHeader}>
        <View>
          <Text variant="base" muted>{greeting},</Text>
          <Text variant="xl" weight="bold">Sabbir Hossain</Text>
        </View>
        <View style={styles.headerRightControls}>
          <View style={styles.profileAvatar} />
          <TouchableOpacity 
            style={styles.menuBtn}
            onPress={() => {}}
          >
            <Menu size={24} color={tokens.colors.tealNeutral.textDark} />
          </TouchableOpacity>
        </View>
      </View>

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
        <View style={styles.cardFooter}>
          <Text variant="sm" style={styles.cardFooterText}>4756 •••• •••• 9013</Text>
          <View style={styles.cardLogoCircle} />
        </View>
      </LinearGradient>

      <View style={styles.quickActions}>
        <Card variant="elevated" style={styles.actionCard}>
          <View style={[styles.actionIconBg, { backgroundColor: 'rgba(255, 145, 0, 0.1)' }]}>
            <ArrowUpRight size={20} color={tokens.colors.semantic.warning} />
          </View>
          <Text variant="sm" weight="bold">Spend</Text>
          <Text variant="sm" muted>৳ {spend.toLocaleString('en-IN')}</Text>
        </Card>

        {healthScore && (
          <Card variant="elevated" style={styles.actionCard}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(0, 200, 83, 0.1)' }]}>
              <HeartPulse size={20} color={tokens.colors.semantic.success} />
            </View>
            <Text variant="sm" weight="bold">Health</Text>
            <Text variant="sm" muted>{healthScore.totalScore}/100</Text>
          </Card>
        )}
      </View>
      
      <View style={styles.sectionHeader}>
        <Text variant="lg" weight="bold">Payment history</Text>
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
      <View style={styles.transactionCard}>
        <View style={[styles.txIcon, { backgroundColor: isIncome ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 23, 68, 0.1)' }]}>
          {isIncome ? (
            <ArrowDownLeft size={20} color={tokens.colors.semantic.success} />
          ) : (
            <ArrowUpRight size={20} color={tokens.colors.semantic.error} />
          )}
        </View>
        <View style={styles.txDetails}>
          <Text variant="base" weight="bold" numberOfLines={1}>{item.merchant_text || (isIncome ? 'Deposit' : 'Withdrawal')}</Text>
          <Text variant="sm" muted>{item.account_id.toUpperCase()} • {new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>
        <Text variant="base" weight="bold" color={isIncome ? tokens.colors.semantic.success : tokens.colors.semantic.error}>
          {isIncome ? '+' : '-'} ৳{item.amount}
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
    backgroundColor: tokens.colors.tealNeutral[50], // Very soft light background
  },
  listContent: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl,
  },
  headerContainer: {
    marginBottom: tokens.spacing.sm,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
    marginTop: tokens.spacing.sm,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    padding: tokens.spacing.xs,
    marginLeft: tokens.spacing.sm,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D9D9D9',
  },
  balanceCard: {
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    ...tokens.shadows.lg,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: tokens.spacing.xs,
  },
  balanceText: {
    color: '#ffffff',
    marginBottom: tokens.spacing.xl,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterText: {
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
  },
  cardLogoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },
  actionCard: {
    flex: 1,
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    alignItems: 'center',
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  sectionHeader: {
    marginBottom: tokens.spacing.md,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.tealNeutral[800], // White
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    marginBottom: tokens.spacing.sm,
    ...tokens.shadows.sm,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  }
});
