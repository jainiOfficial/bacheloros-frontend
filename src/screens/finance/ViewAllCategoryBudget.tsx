import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';
import { BudgetOverviewResponse, getBudgetOverview } from '../../services/api/financeApi';
import { useAppSelector } from '../../store/hooks';

const categoryColors = ['#10B981', '#F97316', '#F59E0B', '#8B5CF6', '#2563EB'];
const categoryIcons = ['shopping-cart', 'truck', 'coffee', 'film', 'more-horizontal'];

export default function ViewAllCategoryBudget({ navigation }: any) {
  const month=useAppSelector((state) => state.budget.selectedMonth);
  const year=useAppSelector((state) => state.budget.selectedYear);
  const [overview, setOverview] = useState<BudgetOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const monthLabel = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await getBudgetOverview(month, year);
      setOverview(response.data);
    } catch {
      setOverview(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>All Categories</Text>
          <Text style={styles.subtitle}>Budget details for {monthLabel}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.state}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.stateText}>Unable to load budget categories.</Text>
          <TouchableOpacity onPress={loadOverview}><Text style={styles.retry}>Try Again</Text></TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Category Summary</Text>
          {overview?.categories.map((item, index) => {
            const color = categoryColors[index % categoryColors.length];
            const icon = categoryIcons[index % categoryIcons.length];
            const percentage = item.allocatedAmount ? Math.round((item.spentAmount / item.allocatedAmount) * 100) : 0;

            return (
              <TouchableOpacity
                key={item.category}
                style={styles.categoryCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('BudgetCategoryOverview', {
                  category: item.category,
                  allocatedAmount: item.allocatedAmount,
                  spentAmount: item.spentAmount,
                  remainingAmount: item.remainingAmount,
                  month,
                  year,
                })}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${color}18` }]}>
                  <Icon name={icon} size={17} color={color} />
                </View>
                <View style={styles.categoryBody}>
                  <View style={styles.categoryTop}>
                    <Text style={styles.categoryName}>{item.category}</Text>
                    <Text style={styles.categoryAmount}>{formatCurrency(item.spentAmount)} / {formatCurrency(item.allocatedAmount)}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }]} />
                  </View>
                </View>
                <Text style={styles.categoryPercent}>{percentage}%</Text>
                <Icon name="chevron-right" size={17} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  backButton: { width: 34, justifyContent: 'center' },
  headerCopy: { flex: 1, marginLeft: 14 },
  title: { color: colors.textDark, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.textLight, fontSize: 12, marginTop: 3 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  sectionTitle: { color: colors.textDark, fontSize: 15, fontWeight: '800', marginBottom: 12 },
  categoryCard: { minHeight: 64, backgroundColor: colors.surface, borderRadius: 12, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  categoryBody: { flex: 1 },
  categoryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  categoryName: { color: colors.textDark, fontSize: 12, fontWeight: '800' },
  categoryAmount: { color: colors.textLight, fontSize: 10 },
  progressTrack: { height: 5, backgroundColor: colors.surfaceMuted, borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: 5, borderRadius: 3 },
  categoryPercent: { width: 34, textAlign: 'right', color: colors.textDark, fontSize: 10, fontWeight: '800', marginLeft: 8 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  stateText: { color: colors.textLight, fontSize: 13 },
  retry: { color: colors.primary, fontSize: 13, fontWeight: '800' },
});
