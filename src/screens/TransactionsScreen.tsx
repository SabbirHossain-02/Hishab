import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { tokens } from '../theme/tokens';
import { sqliteDb } from '../database';
import { ArrowDownLeft, ArrowUpRight, Search, Filter } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { DEFAULT_CATEGORIES } from '../services/categorizationService';

export const TransactionsScreen = () => {
  const isDark = useColorScheme() === 'dark';
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      let query = `
        SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (searchQuery) {
        query += ` AND t.merchant_text LIKE ?`;
        params.push(`%${searchQuery}%`);
      }

      if (selectedCategory) {
        query += ` AND t.category_id = ?`;
        params.push(selectedCategory);
      }

      query += ` ORDER BY t.timestamp DESC`;

      const result = await sqliteDb.getAllAsync(query, params);
      setTransactions(result);
    } catch (err) {
      console.error(err);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleOverrideCategory = async (txId: string, newCategoryId: string) => {
    try {
      await sqliteDb.execAsync(`UPDATE transactions SET category_id = '${newCategoryId}' WHERE id = '${txId}'`);
      setExpandedTxId(null);
      fetchTransactions(); // Refresh list to reflect new category
    } catch (err) {
      console.error(err);
    }
  };

  const renderTransaction = ({ item }: { item: any }) => {
    const isIncome = item.type === 'in';
    const isExpanded = expandedTxId === item.id;

    return (
      <View style={styles.transactionWrapper}>
        <TouchableOpacity 
          style={styles.transactionRow} 
          onPress={() => setExpandedTxId(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.txIcon, { backgroundColor: item.category_color ? item.category_color + '20' : tokens.colors.tealNeutral[100] }]}>
            {/* We'd use dynamic Lucide icons here based on item.category_icon, but for MVP we just use the in/out arrows as fallback or standard */}
            {isIncome ? (
              <ArrowDownLeft size={20} color={item.category_color || tokens.colors.semantic.success} />
            ) : (
              <ArrowUpRight size={20} color={item.category_color || tokens.colors.semantic.error} />
            )}
          </View>
          <View style={styles.txDetails}>
            <Text variant="base" weight="bold" numberOfLines={1}>{item.merchant_text}</Text>
            <Text variant="sm" muted>
              {item.category_name || 'Uncategorized'} • {new Date(item.timestamp).toLocaleDateString()}
            </Text>
          </View>
          <Text variant="base" weight="bold" color={isIncome ? tokens.colors.semantic.success : undefined}>
            {isIncome ? '+' : '-'}৳ {item.amount}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.overrideContainer}>
            <Text variant="sm" weight="bold" style={styles.overrideLabel}>Re-categorize as:</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={DEFAULT_CATEGORIES}
              keyExtractor={cat => cat.id}
              renderItem={({ item: cat }) => (
                <TouchableOpacity 
                  style={[styles.overrideChip, { borderColor: cat.color }]}
                  onPress={() => handleOverrideCategory(item.id, cat.id)}
                >
                  <Text variant="sm" style={{ color: cat.color }}>{cat.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    );
  };

  const inputBg = isDark ? tokens.colors.tealNeutral[800] : tokens.colors.tealNeutral[100];
  const textColor = isDark ? tokens.colors.tealNeutral.textLight : tokens.colors.tealNeutral.textDark;

  return (
    <Screen safeArea>
      <View style={styles.header}>
        <Text variant="xl" weight="bold">Transactions</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: inputBg }]}>
          <Search size={20} color={tokens.colors.tealNeutral.textMutedLight} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search merchants..."
            placeholderTextColor={tokens.colors.tealNeutral.textMutedLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'All' }, ...DEFAULT_CATEGORIES]}
          keyExtractor={item => item.id || 'all'}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity 
                style={[
                  styles.filterChip, 
                  isSelected && { backgroundColor: tokens.colors.gradient.primary[0], borderColor: tokens.colors.gradient.primary[0] }
                ]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text variant="sm" weight={isSelected ? "bold" : "medium"} color={isSelected ? '#fff' : undefined}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: tokens.spacing.md }}
        />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="base" muted>No transactions found.</Text>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.borderRadius.md,
    paddingHorizontal: tokens.spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: tokens.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.size.base,
  },
  filterContainer: {
    marginBottom: tokens.spacing.md,
  },
  filterChip: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tokens.colors.tealNeutral[100],
    marginRight: tokens.spacing.sm,
  },
  listContent: {
    padding: tokens.spacing.md,
    paddingBottom: tokens.spacing.xxl,
  },
  transactionWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
  },
  overrideContainer: {
    paddingBottom: tokens.spacing.md,
    paddingLeft: 48 + tokens.spacing.md, // align with text
  },
  overrideLabel: {
    marginBottom: tokens.spacing.xs,
  },
  overrideChip: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: tokens.spacing.sm,
    backgroundColor: 'transparent',
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
    padding: tokens.spacing.xl,
    alignItems: 'center',
  }
});
