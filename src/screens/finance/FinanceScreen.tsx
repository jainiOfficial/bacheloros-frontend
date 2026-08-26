import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { getFinanceOverview, PeriodType } from '../../services/api/financeApi';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const PERIOD_LABELS: Record<PeriodType, string> = {
  WEEK: 'This Week',
  MONTH: 'This Month',
  YEAR: 'This Year',
};

interface FinanceOverview {
  billsPendingCount: number;
  budgetRemaining: number;
  periodExpense: number;
  percentChangeVsLastPeriod: number | null;
  overdueBillsAmount: number;
  overdueBillsCount: number;
}

export default function FinanceScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('MONTH');
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setError(null);
      const response = await getFinanceOverview(period);
      setOverview(response.data);
    } catch (err) {
      setError('Could not load finance overview');
      console.log('Failed to load finance overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

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


  const cyclePeriod = () => {
    const order: PeriodType[] = ['WEEK', 'MONTH', 'YEAR'];
    const nextIndex = (order.indexOf(period) + 1) % order.length;

    setPeriod(order[nextIndex]);
  };

  const formatCurrency = (value: number) =>
    `₹${Math.round(value).toLocaleString('en-IN')}`;

  // AddExpense/AddBill FinanceScreen ke immediate navigator (HomeStack) mein
  // nahi hain - woh ek level upar, MainStackNavigator mein hain.
  // isliye getParent() se ek level upar jaana padega.
  const goToAddExpense = () => navigation.navigate('AddExpense');
  const goToAddBill = () => navigation.navigate('AddBill');

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Finance</Text>
          <Text style={styles.subtitle}>Manage your money smartly</Text>
        </View>
        <Icon name="bell" size={24} color={colors.textDark} />
      </View>

      {/* Overview */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <TouchableOpacity style={styles.periodPicker} onPress={cyclePeriod}>
          <Text style={styles.periodPickerText}>{PERIOD_LABELS[period]}</Text>
          <Icon name="chevron-down" size={16} color={colors.textDark} />
        </TouchableOpacity>
      </View>
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

          <View style={[styles.card, { backgroundColor: '#ECFDF5' }]}>
            <View style={[styles.iconBadge, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="credit-card" size={20} color={colors.success} />
            </View>
            <Text style={styles.cardLabel}>Budget Remaining</Text>
            <Text style={styles.cardValue}>{formatCurrency(overview.budgetRemaining)}</Text>
            <Text style={[styles.cardFooter, { color: colors.success }]}>Left to spend</Text>
          </View>

          <View style={[styles.card, { backgroundColor: '#FEF2F2' }]}>
            <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="shopping-bag" size={20} color="#DC2626" />
            </View>
            <Text style={styles.cardLabel}>{PERIOD_LABELS[period]} Expense</Text>
            <Text style={styles.cardValue}>{formatCurrency(overview.periodExpense)}</Text>
            {overview.percentChangeVsLastPeriod !== null && (
              <Text style={[styles.cardFooter, { color: '#DC2626' }]}>
                {overview.percentChangeVsLastPeriod >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(overview.percentChangeVsLastPeriod).toFixed(0)}% vs last {period.toLowerCase()}
              </Text>
            )}
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

        <TouchableOpacity style={styles.quickAction} disabled>
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
          { title: 'Budget', subtitle: 'Plan and track your budget', icon: 'pie-chart' ,route: 'Budget'},
          { title: 'Reports', subtitle: 'Insights & analytics', icon: 'bar-chart-2' ,route: 'Reports'},
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20, paddingTop: 40
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 12 },
  periodPicker: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12,
    paddingVertical: 6, gap: 4,
  },
  periodPickerText: { fontSize: 13, fontWeight: '600', color: colors.textDark },
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