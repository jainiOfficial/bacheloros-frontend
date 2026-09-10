import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ExpenseItem, getExpenses } from '../../services/api/financeApi';
import { colors } from '../../theme/colors';
import MonthYearSelector from './MonthYearSelector';

const categories = ['All', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Health', 'Other'];

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const getDate = (value: string) => {
    const datePart = value.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : new Date(value);
};

const formatDate = (value: string) => {
    const date = getDate(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const iconForExpense = (expense: ExpenseItem) => {
    if (expense.fromBill) return 'zap';
    if (expense.category === 'Food') return 'coffee';
    if (expense.category === 'Travel') return 'map';
    if (expense.category === 'Health') return 'heart';
    return 'shopping-bag';
};

export default function ExpenseScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const today = new Date();
    const initialMonth = route?.params?.month ?? today.getMonth() + 1;
    const initialYear = route?.params?.year ?? today.getFullYear();
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [category, setCategory] = useState(route?.params?.category ?? 'All');
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadExpenses = useCallback(async () => {
        try {
            const response = await getExpenses();
            setExpenses(response.data);
        } catch {
            Alert.alert('Unable to load expenses', 'Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { loadExpenses(); }, [loadExpenses]));

    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => {
            const expenseDate = getDate(expense.date);
            const matchesCategory = category === 'All' || expense.category === category;
            return matchesCategory && expenseDate.getMonth() === selectedMonth - 1 && expenseDate.getFullYear() === selectedYear;
        });
    }, [category, expenses, selectedMonth, selectedYear]);

    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Icon name="arrow-left" size={22} color={colors.textDark} /></TouchableOpacity>
                <View style={styles.headerCopy}><Text style={styles.title}>Expenses</Text><Text style={styles.subtitle}>Track where your money goes.</Text></View>
                <TouchableOpacity style={styles.addIconButton} onPress={() => navigation.navigate('AddExpense')} accessibilityLabel="Add expense">
                    <Icon name="plus" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredExpenses}
                keyExtractor={(item) => String(item.id)}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadExpenses(); }} />}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={<>
                    <MonthYearSelector month={selectedMonth} year={selectedYear} onChange={(month, year) => { setSelectedMonth(month); setSelectedYear(year); }} />
                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, styles.totalCard]}><Text style={styles.summaryLabel}>Total Expenses</Text><Text style={styles.summaryValue}>{formatCurrency(total)}</Text><Text style={styles.summaryFooter}>{filteredExpenses.length} entries</Text></View>
                        <View style={[styles.summaryCard, styles.countCard]}><Text style={styles.summaryLabel}>Total Entries</Text><Text style={styles.summaryValue}>{filteredExpenses.length}</Text><Text style={[styles.summaryFooter, styles.countFooter]}>Tracked expenses</Text></View>
                    </View>
                    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Expense History</Text><Text style={styles.resultText}>{filteredExpenses.length} records</Text></View>
                    <FlatList horizontal data={categories} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList} renderItem={({ item }) => <TouchableOpacity style={[styles.categoryChip, category === item && styles.categoryChipActive]} onPress={() => setCategory(item)}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></TouchableOpacity>} />
                </>}
                ListEmptyComponent={<Text style={styles.emptyText}>No expenses found</Text>}
                renderItem={({ item }) => <TouchableOpacity style={styles.expenseRow} onPress={() => navigation.navigate('ExpenseDetails', { expense: item })} activeOpacity={0.7}>
                    <View style={[styles.expenseIcon, item.fromBill && styles.billExpenseIcon]}><Icon name={iconForExpense(item)} size={19} color={item.fromBill ? colors.primary : colors.success} /></View>
                    <View style={styles.expenseDetails}><Text style={styles.expenseTitle}>{item.title}</Text><Text style={styles.expenseDate}>{formatDate(item.date)}</Text><Text style={styles.expenseCategory}>{item.category}{item.fromBill ? '  •  From Bill' : ''}</Text></View>
                    <View style={styles.expenseAmount}><Text style={styles.amountText}>{formatCurrency(item.amount)}</Text><Icon name="chevron-right" size={18} color={colors.textMuted} /></View>
                </TouchableOpacity>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
    backButton: { width: 34, height: 34, justifyContent: 'center' },
    headerCopy: { flex: 1, marginLeft: 14 },
    title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
    subtitle: { color: colors.textLight, fontSize: 12, marginTop: 3 },
    addIconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    listContent: { paddingHorizontal: 20, paddingBottom: 92 },
    summaryRow: { flexDirection: 'row', gap: 10 },
    summaryCard: { flex: 1, minHeight: 112, borderRadius: 15, padding: 15 },
    totalCard: { backgroundColor: '#EFF6FF' },
    countCard: { backgroundColor: '#EFFAF4' },
    summaryLabel: { color: colors.textLight, fontSize: 12, fontWeight: '600' },
    summaryValue: { color: colors.textDark, fontSize: 21, fontWeight: '800', marginTop: 12 },
    summaryFooter: { color: '#2563EB', fontSize: 11, marginTop: 7 },
    countFooter: { color: '#25875C' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 2 },
    sectionTitle: { color: colors.textDark, fontSize: 14, fontWeight: '800' },
    resultText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
    categoryList: { gap: 8, paddingVertical: 12 },
    categoryChip: { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.surfaceMuted },
    categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    categoryText: { color: colors.textLight, fontSize: 12, fontWeight: '700' },
    categoryTextActive: { color: '#FFFFFF' },
    expenseRow: { flexDirection: 'row', alignItems: 'center', minHeight: 88, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surfaceMuted },
    expenseIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    billExpenseIcon: { backgroundColor: '#DBEAFE' },
    expenseDetails: { flex: 1 },
    expenseTitle: { color: colors.textDark, fontSize: 15, fontWeight: '800' },
    expenseDate: { color: colors.textLight, fontSize: 12, marginTop: 4 },
    expenseCategory: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
    expenseAmount: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    amountText: { color: colors.textDark, fontSize: 15, fontWeight: '800' },
    emptyText: { color: colors.textLight, textAlign: 'center', marginTop: 40 },
});