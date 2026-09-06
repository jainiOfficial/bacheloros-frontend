import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';
import MonthYearSelector from './MonthYearSelector';
import { BudgetOverviewResponse, getBudgetOverview } from '../../services/api/financeApi';

const categoryColors = ['#10B981', '#F97316', '#F59E0B', '#8B5CF6', '#2563EB'];
const categoryIcons = ['shopping-cart', 'truck', 'coffee', 'film', 'more-horizontal'];

export default function BudgetOverviewScreen({ navigation }: any) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [overview, setOverview] = useState<BudgetOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const selectedMonthLabel = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await getBudgetOverview(selectedMonth, selectedYear);
      setOverview(response.data);
    } catch {
      setOverview(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

    useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handlePeriodChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const spentPercentage = overview?.totalAmount ? Math.round((overview.totalSpent / overview.totalAmount) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Icon name="arrow-left" size={22} color={colors.textDark} /></TouchableOpacity>
          <View style={styles.headerCopy}><Text style={styles.title}>Budget</Text><Text style={styles.subtitle}>Plan smart. Spend better.</Text></View>
          <Icon name="info" size={20} color={colors.textDark} />
        </View>

        <MonthYearSelector month={selectedMonth} year={selectedYear} onChange={handlePeriodChange} />

        {loading ? (
          <View style={styles.loadingState}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : !overview || overview.totalAmount === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Icon name="calendar" size={54} color={colors.primary} /></View>
            <Text style={styles.emptyTitle}>No Budget Set</Text>
            <Text style={styles.emptyDescription}>{error ? 'Unable to load budget details right now.' : `You haven't set any budget for ${selectedMonthLabel}.`}</Text>
          </View>
        ) : (
          <View>
            <View style={styles.summaryCard}>
              <View><Text style={styles.summaryLabel}>Total Budget</Text><Text style={styles.summaryAmount}>{formatCurrency(overview.totalAmount)}</Text><Text style={styles.monthly}>Monthly</Text></View>
              <View style={styles.progressRing}><Text style={styles.progressValue}>{spentPercentage}%</Text><Text style={styles.progressLabel}>Spent</Text></View>
            </View>
            <View style={styles.statsRow}><Stat label="Spent" value={overview.totalSpent} note={`${spentPercentage}%`} color={colors.primary} /><Stat label="Remaining" value={overview.totalRemaining} note={`${100 - spentPercentage}%`} color={colors.success} /><Stat label="Budget" value={overview.totalAmount} note="100%" color={colors.textDark} /></View>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Category Summary</Text><TouchableOpacity><Text style={styles.viewAll}>View All ›</Text></TouchableOpacity></View>
            {overview.categories.slice(4).map((item, index) => renderCategoryCard(item, index, formatCurrency))}
            <TouchableOpacity style={styles.editButton}><Icon name="edit-2" size={16} color={colors.primary} /><Text style={styles.editText}>Edit Budget</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, note, color }: { label: string; value: number; note: string; color: string }) {
  return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>₹{value.toLocaleString('en-IN')}</Text><Text style={[styles.statNote, { color }]}>{note}</Text></View>;
}

function renderCategoryCard(
  item: BudgetOverviewResponse['categories'][number],
  index: number,
  formatCurrency: (value: number) => string,
) {
  const color = categoryColors[index % categoryColors.length];
  const icon = categoryIcons[index % categoryIcons.length];
  const percentage = item.allocatedAmount
    ? Math.round((item.spentAmount / item.allocatedAmount) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.categoryCard} key={item.category} activeOpacity={0.7}>
      <View style={[styles.categoryIcon, { backgroundColor: `${color}18` }]}>
        <Icon name={icon} size={17} color={color} />
      </View>

      <View style={styles.categoryBody}>
        <View style={styles.categoryTop}>
          <Text style={styles.categoryName}>{item.category}</Text>
          <Text style={styles.categoryAmount}>
            {formatCurrency(item.spentAmount)} / {formatCurrency(item.allocatedAmount)}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.categoryPercent}>{percentage}%</Text>
      <Icon name="chevron-right" size={17} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 56, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { width: 34, justifyContent: 'center' },
  headerCopy: { flex: 1, marginLeft: 14 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  subtitle: { color: colors.textLight, fontSize: 12, marginTop: 3 },
  emptyState: { alignItems: 'center', paddingTop: 70 },
  loadingState: { paddingTop: 100, alignItems: 'center' },
  emptyIcon: { width: 116, height: 116, borderRadius: 24, backgroundColor: '#EEF3FF', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.textDark, fontSize: 18, fontWeight: '800', marginTop: 25 },
  emptyDescription: { color: colors.textLight, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8, paddingHorizontal: 36 },
  tip: { flexDirection: 'row', backgroundColor: '#EEF3FF', borderRadius: 12, padding: 13, marginTop: 28, width: '100%', alignItems: 'center' },
  tipText: { flex: 1, color: colors.textLight, fontSize: 11, lineHeight: 16, marginLeft: 9 },
  addButton: { height: 52, borderRadius: 12, backgroundColor: colors.primary, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 76 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  summaryCard: { backgroundColor: '#EFFAF7', borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: colors.textMedium, fontSize: 12, fontWeight: '700' },
  summaryAmount: { color: colors.textDark, fontSize: 25, fontWeight: '900', marginTop: 5 },
  monthly: { color: colors.textLight, fontSize: 11, marginTop: 3 },
  progressRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 9, borderColor: '#DDE5E3', borderTopColor: colors.success, borderRightColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  progressValue: { color: colors.textDark, fontSize: 19, fontWeight: '900' },
  progressLabel: { color: colors.textLight, fontSize: 10 },
  statsRow: { backgroundColor: colors.surface, borderRadius: 12, flexDirection: 'row', marginTop: 10, paddingVertical: 13 },
  stat: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.surfaceMuted },
  statLabel: { color: colors.textLight, fontSize: 10 },
  statValue: { color: colors.textDark, fontSize: 12, fontWeight: '800', marginTop: 5 },
  statNote: { fontSize: 10, fontWeight: '700', marginTop: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  sectionTitle: { color: colors.textDark, fontSize: 14, fontWeight: '800' },
  viewAll: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  categoryCard: { minHeight: 58, backgroundColor: colors.surface, borderRadius: 12, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  categoryBody: { flex: 1 },
  categoryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  categoryName: { color: colors.textDark, fontSize: 11, fontWeight: '800' },
  categoryAmount: { color: colors.textLight, fontSize: 9 },
  progressTrack: { height: 5, backgroundColor: colors.surfaceMuted, borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: 5, borderRadius: 3 },
  categoryPercent: { width: 32, textAlign: 'right', color: colors.textDark, fontSize: 10, fontWeight: '800', marginLeft: 8 },
  editButton: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14 },
  editText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
});