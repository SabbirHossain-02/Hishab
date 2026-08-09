import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { tokens } from '../theme/tokens';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { sqliteDb } from '../database';
import { getUpcomingBills, PredictedBill } from '../services/predictiveBillService';
import { Button } from '../components/Button';
import { Sparkles } from 'lucide-react-native';

export const AnalyticsScreen = ({ navigation }: any) => {
  const isDark = useColorScheme() === 'dark';
  
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<PredictedBill[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);

  const fetchAnalytics = useCallback(async () => {
    try {
      // 1. Fetch Expense Breakdown for Pie Chart (Current Month)
      const expenses = await sqliteDb.getAllAsync<{ name: string, color: string, total: number }>(`
        SELECT c.name, c.color, SUM(t.amount) as total
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.type = 'out'
        GROUP BY c.id
        ORDER BY total DESC
      `);
      
      let sum = 0;
      const formattedPie = expenses.map(e => {
        sum += e.total;
        return {
          value: e.total,
          color: e.color || tokens.colors.gradient.primary[0],
          text: e.name
        };
      });
      setTotalSpend(sum);
      setPieData(formattedPie);

      // 2. Fetch 6-Month Income vs Expense Trend for Bar Chart
      // SQLite date functions to group by month
      const trendQuery = `
        SELECT 
          strftime('%Y-%m', datetime(timestamp/1000, 'unixepoch')) as month,
          SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END) as expense
        FROM transactions
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6
      `;
      const trendResult = await sqliteDb.getAllAsync<{ month: string, income: number, expense: number }>(trendQuery);
      
      const formattedBar: any[] = [];
      // Reverse to show chronological order
      trendResult.reverse().forEach(row => {
        // month is 'YYYY-MM', let's format to 'MMM'
        const date = new Date(row.month + '-01');
        const monthLabel = date.toLocaleString('default', { month: 'short' });
        
        formattedBar.push({
          value: row.income,
          label: monthLabel,
          frontColor: tokens.colors.semantic.success,
          spacing: 2,
        });
        formattedBar.push({
          value: row.expense,
          frontColor: tokens.colors.semantic.error,
        });
      });
      
      // Add dummy data if empty for MVP visual purposes
      if (formattedBar.length === 0) {
        formattedBar.push({ value: 5000, label: 'Jan', frontColor: tokens.colors.semantic.success, spacing: 2 });
        formattedBar.push({ value: 3000, frontColor: tokens.colors.semantic.error });
      }

      setBarData(formattedBar);

      // 3. Fetch Predictive Bills
      const bills = await getUpcomingBills();
      setUpcomingBills(bills);

    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <Screen safeArea>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="xl" weight="bold">Analytics</Text>
          <Text variant="base" muted>Your Money Story</Text>
        </View>

        <Button 
          title="View this month's Money Story" 
          variant="primary" 
          icon={<Sparkles size={20} color="#FFF" />} 
          style={styles.storyButton}
          onPress={() => navigation.navigate('MoneyStory')}
        />

        <Card variant="elevated" style={styles.chartCard}>
          <Text variant="base" weight="bold" style={styles.chartTitle}>Expense Breakdown</Text>
          <Text variant="sm" muted style={styles.chartSubtitle}>This Month</Text>
          
          <View style={styles.pieContainer}>
            {pieData.length > 0 ? (
              <PieChart
                donut
                innerRadius={70}
                data={pieData}
                centerLabelComponent={() => {
                  return (
                    <View style={styles.centerLabel}>
                      <Text variant="sm" muted>Total Spend</Text>
                      <Text variant="lg" weight="bold">৳{totalSpend.toLocaleString('en-IN')}</Text>
                    </View>
                  );
                }}
              />
            ) : (
              <View style={styles.emptyChart}>
                <Text variant="base" muted>No expenses this month</Text>
              </View>
            )}
          </View>
          
          {/* Legend */}
          <View style={styles.legendContainer}>
            {pieData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text variant="sm" style={styles.legendText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card variant="elevated" style={styles.chartCard}>
          <Text variant="base" weight="bold" style={styles.chartTitle}>Income vs Expense</Text>
          <Text variant="sm" muted style={styles.chartSubtitle}>Last 6 Months</Text>
          
          <View style={styles.barContainer}>
            <BarChart
              data={barData}
              barWidth={12}
              spacing={20}
              roundedTop
              roundedBottom
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: isDark ? tokens.colors.tealNeutral.textMutedDark : tokens.colors.tealNeutral.textMutedLight, fontSize: 10 }}
              noOfSections={4}
              maxValue={Math.max(...barData.map(d => d.value)) * 1.2 || 10000}
              rulesColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(150,150,150,0.1)"}
              xAxisLabelTextStyle={{ color: isDark ? tokens.colors.tealNeutral.textMutedDark : tokens.colors.tealNeutral.textMutedLight, fontSize: 10 }}
            />
          </View>
          <View style={styles.barLegend}>
             <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: tokens.colors.semantic.success }]} />
                <Text variant="sm">Income</Text>
              </View>
              <View style={[styles.legendItem, { marginLeft: tokens.spacing.md }]}>
                <View style={[styles.legendDot, { backgroundColor: tokens.colors.semantic.error }]} />
                <Text variant="sm">Expense</Text>
              </View>
          </View>
        </Card>

        {/* Predictive Bills Widget */}
        <Card variant="flat" style={[styles.billsCard, { borderColor: isDark ? tokens.colors.tealNeutral[700] : tokens.colors.tealNeutral[100] }]}>
          <Text variant="base" weight="bold" style={styles.chartTitle}>Upcoming Bills</Text>
          <Text variant="sm" muted style={styles.chartSubtitle}>Based on your past transactions</Text>
          
          {upcomingBills.length > 0 ? (
            upcomingBills.map((bill, index) => {
              const dueString = bill.daysUntil < 0 
                ? `Overdue by ${Math.abs(bill.daysUntil)} days` 
                : bill.daysUntil === 0 ? "Due today" : `Due in ${bill.daysUntil} days`;
                
              return (
                <View key={index} style={[styles.billItem, { borderBottomColor: isDark ? tokens.colors.tealNeutral[700] : tokens.colors.tealNeutral[100] }]}>
                  <View>
                    <Text variant="base">{bill.merchantText}</Text>
                    <Text variant="xs" muted>{dueString}</Text>
                  </View>
                  <Text variant="base" weight="bold">~৳ {bill.predictedAmount.toLocaleString('en-IN')}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyBillState}>
              <Text variant="sm" muted>Not enough history yet to predict upcoming bills. Keep using Hishab to train the model!</Text>
            </View>
          )}
        </Card>

      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    paddingBottom: tokens.spacing.xxl,
  },
  header: {
    paddingHorizontal: tokens.spacing.xs,
    paddingBottom: tokens.spacing.md,
  },
  storyButton: {
    marginBottom: tokens.spacing.lg,
  },
  chartCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  chartTitle: {
    marginBottom: 2,
  },
  chartSubtitle: {
    marginBottom: tokens.spacing.lg,
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: tokens.spacing.md,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChart: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: tokens.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
    marginBottom: tokens.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  barContainer: {
    marginTop: tokens.spacing.sm,
    marginLeft: -tokens.spacing.sm, // pull back slightly to align Y axis
  },
  barLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: tokens.spacing.lg,
  },
  billsCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.lg,
    borderWidth: 1,
    backgroundColor: 'transparent'
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emptyBillState: {
    paddingVertical: tokens.spacing.md,
  }
});
