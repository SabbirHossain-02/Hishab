import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { ArrowDownLeft, ArrowUpRight, Bell, Search, Send, Download, Repeat, MoreHorizontal } from 'lucide-react-native';
import { sqliteDb } from '../database';
import { calculateHealthScore, HealthScore } from '../services/healthScoreService';
import { tokens } from '../theme/tokens';

// Dark Forest Theme Constants
const theme = {
  bg: '#0F1A15', // Main dark background
  cardTop: '#243F32', // Darker green for card
  cardBottom: '#9FDD38', // Neon green
  surface: '#1A2A22', // Quick action buttons
  sheet: '#F4F6F5', // Whiteish bottom sheet
  textLight: '#FFFFFF',
  textMuted: '#849B90',
  textDark: '#0D1612',
};

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
    <View style={styles.topContainer}>
      <View style={styles.headerRow}>
        <View style={styles.profileRow}>
          <View style={styles.avatar} />
          <View>
            <Text variant="sm" style={{ color: theme.textMuted }}>Welcome Back</Text>
            <Text variant="base" weight="bold" style={{ color: theme.textLight }}>Sabbir Hossain</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={20} color={theme.textLight} />
        </TouchableOpacity>
      </TouchableOpacity>

      <Text variant="sm" style={styles.balanceLabel}>Total Balance</Text>
      <Text variant="display" weight="bold" style={styles.balanceValue}>
        ৳ {animatedBalance.toLocaleString('en-IN')}
      </Text>

      {/* Credit Card Graphic */}
      <View style={styles.cardContainer}>
        <View style={styles.cardTopHalf}>
          <View style={styles.cardCircles}>
            <View style={[styles.cardCircle, { backgroundColor: '#EB001B', left: 0 }]} />
            <View style={[styles.cardCircle, { backgroundColor: '#F79E1B', left: 18 }]} />
          </View>
          <Text style={styles.cardNumber}>••••  ••••  ••••  9013</Text>
        </View>
        <View style={styles.cardBottomHalf}>
          <View>
            <Text style={styles.cardInfoLabel}>Cardholder</Text>
            <Text style={styles.cardInfoValue}>Sabbir Rahman</Text>
          </View>
          <View>
            <Text style={styles.cardInfoLabel}>Exp</Text>
            <Text style={styles.cardInfoValue}>09/28</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionBtnActive}>
            <ArrowUpRight size={20} color={theme.bg} />
          </TouchableOpacity>
          <Text variant="xs" style={{ color: theme.textLight, marginTop: 8 }}>Spend</Text>
        </View>
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionBtn}>
            <Download size={20} color={theme.textLight} />
          </TouchableOpacity>
          <Text variant="xs" style={{ color: theme.textMuted, marginTop: 8 }}>Income</Text>
        </View>
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionBtn}>
            <Repeat size={20} color={theme.textLight} />
          </TouchableOpacity>
          <Text variant="xs" style={{ color: theme.textMuted, marginTop: 8 }}>Exchange</Text>
        </View>
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionBtn}>
            <MoreHorizontal size={20} color={theme.textLight} />
          </TouchableOpacity>
          <Text variant="xs" style={{ color: theme.textMuted, marginTop: 8 }}>More</Text>
        </View>
      </View>
      {/* Sheet Handle Area */}
      <View style={styles.sheetTopRadius}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeaderRow}>
          <Text variant="base" weight="bold" style={{ color: theme.textDark }}>Transaction History</Text>
          <Text variant="sm" style={{ color: theme.textMuted }}>View all ›</Text>
        </View>
      </View>
    </View>
  );

  const renderTransaction = ({ item }: { item: any }) => {
    const isIncome = item.type === 'in';
    return (
      <View style={styles.txItem}>
        <View style={styles.txIconWrapper}>
          <View style={styles.txAvatarPlaceholder}>
            <Text variant="sm" weight="bold" style={{ color: theme.textLight }}>
              {item.merchant_text ? item.merchant_text.substring(0, 2).toUpperCase() : (isIncome ? 'IN' : 'OUT')}
            </Text>
          </View>
        </View>
        <View style={styles.txDetails}>
          <Text variant="base" weight="bold" style={{ color: theme.textDark }}>
            {item.merchant_text || (isIncome ? 'Deposit' : 'Withdrawal')}
          </Text>
          <Text variant="sm" style={{ color: theme.textMuted }}>
            {new Date(item.timestamp).toLocaleDateString()} • {item.account_id.toUpperCase()}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="base" weight="bold" style={{ color: theme.textDark }}>
            {isIncome ? '+' : '-'}${item.amount.toLocaleString('en-IN')}
          </Text>
          <Text variant="xs" style={{ color: theme.textMuted }}>Receive</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={theme.cardBottom} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  topContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: 60, // Safe area roughly
    paddingBottom: tokens.spacing.xl,
    backgroundColor: theme.bg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    marginRight: tokens.spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    color: theme.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  balanceValue: {
    color: theme.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  cardContainer: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  cardTopHalf: {
    flex: 0.6,
    backgroundColor: theme.cardTop,
    padding: tokens.spacing.lg,
    justifyContent: 'space-between',
  },
  cardBottomHalf: {
    flex: 0.4,
    backgroundColor: theme.cardBottom,
    padding: tokens.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCircles: {
    height: 30,
    width: 50,
  },
  cardCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    position: 'absolute',
    opacity: 0.8,
  },
  cardNumber: {
    color: theme.textMuted,
    fontSize: 16,
    letterSpacing: 2,
    marginTop: 10,
  },
  cardInfoLabel: {
    color: 'rgba(13, 22, 18, 0.5)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardInfoValue: {
    color: theme.textDark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.sm,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnActive: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.cardBottom,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTopRadius: {
    backgroundColor: theme.sheet,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 16,
    marginTop: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
  },
  listContent: {
    paddingBottom: 100, // Space for tab bar
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.sheet,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
  },
  txIconWrapper: {
    marginRight: tokens.spacing.md,
  },
  txAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txDetails: {
    flex: 1,
  }
});
