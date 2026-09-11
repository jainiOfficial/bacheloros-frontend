import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { getFinanceOverview, PeriodType } from '../../services/api/financeApi';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface FinanceOverview {
  billsPendingCount: number;
  budgetRemaining: number;
  monthExpense: number;
  percentChangeVsLastPeriod: number | null;
  overdueBillsAmount: number;
  overdueBillsCount: number;
}

export default function FinanceScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchOverview = useCallback(async () => {
    try {
      setError(null);
      const response = await getFinanceOverview();
      setOverview(response.data);
    } catch (err) {
      setError('Could not load finance overview');
      console.log('Failed to load finance overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };
  // screen dobara focus hone par bhi refresh - taaki AddExpense/AddBill se
  // wapas aane par numbers turant update dikhein
  useFocusEffect(
    useCallback(() => {
      fetchOverview();
    }, [fetchOverview])
  );

  useEffect(() => {
    setLoading(true);
    fetchOverview();
  }, [fetchOverview]);


  const formatCurrency = (value: number) =>
    `₹${Math.round(value).toLocaleString('en-IN')}`;

  const monthlyBudget = overview ? overview.budgetRemaining : 0;
  const monthlySpentPercentage = monthlyBudget
    ? Math.min(Math.round((overview!.monthExpense / monthlyBudget) * 100), 100)
    : 0;
  const currentMonthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // AddExpense/AddBill FinanceScreen ke immediate navigator (HomeStack) mein
  // nahi hain - woh ek level upar, MainStackNavigator mein hain.
  // isliye getParent() se ek level upar jaana padega.
  const goToAddExpense = () => navigation.navigate('AddExpense');
  const goToAddBill = () => navigation.navigate('AddBill');
  const goToAddMonthlyBudget = () => navigation.navigate('AddMonthlyBudget');

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Finance</Text>
          <Text style={styles.subtitle}>Manage your money smartly</Text>
        </View>
        <Icon name="bell" size={24} color={colors.textDark} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Overview */}
        <Text style={styles.sectionTitle}>Overview</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {overview && (
          <View style={styles.cardGrid}>
          <View style={[styles.card, { backgroundColor: '#EFF6FF' }]}>
            <View style={[styles.iconBadge, { backgroundColor: '#DBEAFE' }]}>
              <Icon name="file-text" size={20} color="#2563EB" />
            </View>
            <Text style={styles.cardLabel}>Bill Pending</Text>
            <Text style={styles.cardValue}>{overview.billsPendingCount}</Text>
            <Text style={[styles.cardFooter, { color: '#2563EB' }]}>Pending bills</Text>
          </View>

          <View style={[styles.card, { backgroundColor: '#FFFBEB' }]}>
            <View style={[styles.iconBadge, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="alert-triangle" size={20} color={colors.warning} />
            </View>
            <Text style={styles.cardLabel}>Overdue Bills</Text>
            <Text style={styles.cardValue}>{formatCurrency(overview.overdueBillsAmount)}</Text>
            <Text style={[styles.cardFooter, { color: colors.warning }]}>
              {overview.overdueBillsCount} Bills overdue
            </Text>
          </View>
          </View>
        )}

        {overview && (
          <View style={styles.monthlySummary}>
            <Text style={styles.monthlySummaryTitle}>Monthly Summary</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryMetrics}>
                <View style={styles.summaryMetric}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#DBEAFE' }]}>
                    <Icon name="credit-card" size={16} color="#2563EB" />
                  </View>
                  <Text style={styles.summaryLabel}>Total Spent</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(overview.monthExpense)}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryMetric}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#D1FAE5' }]}>
                    <Icon name="target" size={16} color={colors.success} />
                  </View>
                  <Text style={styles.summaryLabel}>Budget</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(monthlyBudget)}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryMetric}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Icon name="briefcase" size={16} color={colors.warning} />
                  </View>
                  <Text style={styles.summaryLabel}>Remaining</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(overview.budgetRemaining)}</Text>
                </View>
              </View>
              <View style={styles.progressRing}>
                <View style={styles.progressRingInner}>
                  <Text style={styles.progressPercentage}>{monthlySpentPercentage}%</Text>
                  <Text style={styles.progressLabel}>Spent</Text>
                </View>
              </View>
            </View>
            <Text style={styles.summaryPeriod}>{currentMonthLabel}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickAction} onPress={goToAddExpense}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="plus-circle" size={22} color={colors.success} />
            </View>
            <Text style={styles.quickActionText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={goToAddBill}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="file-plus" size={22} color={colors.warning} />
            </View>
            <Text style={styles.quickActionText}>Add Bill</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={goToAddMonthlyBudget}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#EDE9FE' }]}>
              <Icon name="pie-chart" size={22} color={colors.accentPurple} />
            </View>
            <Text style={styles.quickActionText}>Set Budget</Text>
          </TouchableOpacity>
        </View>

        {/* Finance Sections - placeholder, coming soon */}
        <Text style={styles.sectionTitle}>Finance Sections</Text>
        <View style={styles.sectionsList}>
          {[
            { title: 'Expenses', subtitle: 'Track and manage your spending', icon: 'shopping-bag' ,route: 'Expenses'},
            { title: 'Bills', subtitle: 'View and manage your bills', icon: 'file-text' ,route: 'Bills'},
            { title: 'Budget', subtitle: 'Plan and track your budget', icon: 'pie-chart' ,route: 'BudgetOverview'},
          ].map((item) => (
            <TouchableOpacity key={item.title} style={styles.sectionItem} onPress={() => navigation.navigate(item.route)}>
              <View style={styles.sectionItemIcon}>
                <Icon name={item.icon} size={18} color={colors.textLight} />
              </View>
              <View style={styles.sectionItemText}>
                <Text style={styles.sectionItemTitle}>{item.title}</Text>
                <Text style={styles.sectionItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.border} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20, paddingHorizontal: 20, paddingTop: 40
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 12 },
  errorText: { color: '#DC2626', marginBottom: 12 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  card: { width: '47%', borderRadius: 16, padding: 14 },
  iconBadge: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  cardLabel: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '800', color: colors.textDark, marginBottom: 4 },
  cardFooter: { fontSize: 11, fontWeight: '600' },
  monthlySummary: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: '#E8EEF5',
  },
  monthlySummaryTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark, marginBottom: 14 },
  summaryContent: { flexDirection: 'row', alignItems: 'center' },
  summaryMetrics: { flex: 1, flexDirection: 'row', alignItems: 'stretch' },
  summaryMetric: { flex: 1 },
  summaryDivider: { width: 1, backgroundColor: '#E8EEF5', marginHorizontal: 8 },
  summaryIcon: {
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  summaryLabel: { fontSize: 11, color: colors.textLight, marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  progressRing: {
    width: 82, height: 82, borderRadius: 41, borderWidth: 9, borderColor: '#E8EEF5',
    justifyContent: 'center', alignItems: 'center', marginLeft: 12,
  },
  progressRingInner: { alignItems: 'center' },
  progressPercentage: { fontSize: 17, fontWeight: '800', color: colors.textDark },
  progressLabel: { fontSize: 10, color: colors.textLight, marginTop: 1 },
  summaryPeriod: { fontSize: 11, color: colors.textLight, marginTop: 12 },
  quickActionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  quickAction: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  quickActionIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  quickActionText: { fontSize: 12, fontWeight: '700', color: colors.textDark },
  sectionsList: { backgroundColor: colors.surface, borderRadius: 16, marginBottom: 24 },
  sectionItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  sectionItemIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  sectionItemText: { flex: 1 },
  sectionItemTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  sectionItemSubtitle: { fontSize: 12, color: colors.textLight, marginTop: 2 },
});