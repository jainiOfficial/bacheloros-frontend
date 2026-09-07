import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { ExpenseItem, getExpensesByCategoryAndMonth } from '../../services/api/financeApi';
import { colors } from '../../theme/colors';

export default function BudgetCategoryOverviewScreen({ navigation, route }: any) {
  const { category, allocatedAmount, spentAmount, remainingAmount, month, year } = route.params;
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const percentage = allocatedAmount ? Math.round((spentAmount / allocatedAmount) * 100) : 0;
  const monthLabel = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await getExpensesByCategoryAndMonth(category, month, year);
      setExpenses(response.data);
    } catch {
      setExpenses([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [category, month, year]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={22} color={colors.textDark} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{category}</Text>
            <Text style={styles.subtitle}>Budget details for {monthLabel}</Text>
          </View>
          <Icon name="edit-2" size={19} color={colors.textDark} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Spent</Text>
          <View style={styles.amountRow}>
            <Text style={styles.spentAmount}>{formatCurrency(spentAmount)}</Text>
            <Text style={styles.totalAmount}>of {formatCurrency(allocatedAmount)}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${Math.min(percentage, 100)}%` }]} />
          </View>
          <View style={styles.summaryFooter}>
            <Text style={styles.percentage}>{percentage}% used</Text>
            <Text style={styles.remaining}>Remaining {formatCurrency(remainingAmount)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Transactions</Text>
        <Text style={styles.sectionSubtitle}>Showing transactions for {monthLabel}</Text>
        {loading ? (
          <View style={styles.state}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : error ? (
          <View style={styles.state}><Text style={styles.stateText}>Unable to load transactions.</Text><TouchableOpacity onPress={loadExpenses}><Text style={styles.retry}>Try Again</Text></TouchableOpacity></View>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(expense) => String(expense.id)}
            style={styles.transactionList}
            contentContainerStyle={styles.transactionListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<View style={styles.state}><Icon name="inbox" size={36} color={colors.textMuted} /><Text style={styles.stateText}>No transactions in this category.</Text></View>}
            renderItem={({ item: expense }) => (
              <TouchableOpacity style={styles.transactionRow} onPress={() => navigation.navigate('ExpenseDetails', { expense })}>
                <View style={styles.transactionIcon}><Icon name="shopping-bag" size={17} color={colors.primary} /></View>
                <View style={styles.transactionBody}><Text style={styles.transactionTitle}>{expense.title}</Text><Text style={styles.transactionDate}>{formatDate(expense.date)}</Text></View>
                <Text style={styles.transactionAmount}>- {formatCurrency(expense.amount)}</Text><Icon name="chevron-right" size={17} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  backButton: { width: 34, justifyContent: 'center' },
  headerCopy: { flex: 1, marginLeft: 14 },
  title: { color: colors.textDark, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.textLight, fontSize: 12, marginTop: 4 },
  summaryCard: { backgroundColor: '#EFFAF7', borderRadius: 14, padding: 18 },
  summaryLabel: { color: colors.textMedium, fontSize: 12, fontWeight: '700' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 },
  spentAmount: { color: colors.textDark, fontSize: 25, fontWeight: '900' },
  totalAmount: { color: colors.textLight, fontSize: 12 },
  progressTrack: { height: 8, backgroundColor: '#D8E9E4', borderRadius: 4, overflow: 'hidden', marginTop: 16 },
  progressBar: { height: 8, backgroundColor: colors.success, borderRadius: 4 },
  summaryFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  percentage: { color: colors.success, fontSize: 12, fontWeight: '800' },
  remaining: { color: colors.textLight, fontSize: 12 },
  sectionTitle: { color: colors.textDark, fontSize: 15, fontWeight: '800', marginTop: 26, marginBottom: 10 },
  sectionSubtitle: { color: colors.textLight, fontSize: 12, marginTop: -5, marginBottom: 12 },
  transactionList: { flex: 1 },
  transactionListContent: { paddingBottom: 20 },
  state: { alignItems: 'center', justifyContent: 'center', paddingVertical: 55, gap: 10 },
  stateText: { color: colors.textLight, fontSize: 13 },
  retry: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  transactionRow: { minHeight: 72, backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  transactionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF3FF', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  transactionBody: { flex: 1 },
  transactionTitle: { color: colors.textDark, fontSize: 13, fontWeight: '800' },
  transactionDate: { color: colors.textLight, fontSize: 11, marginTop: 4 },
  transactionAmount: { color: colors.textDark, fontSize: 13, fontWeight: '800', marginRight: 8 },
});