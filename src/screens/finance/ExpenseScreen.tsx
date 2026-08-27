import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ExpenseItem, getExpenses } from '../../services/api/financeApi';
import { colors } from '../../theme/colors';

const categories = ['All', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Health', 'Other'];
const monthLabels = ['This Month', 'Last Month', 'All Time'];

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

export default function ExpenseScreen() {
    const navigation = useNavigation<any>();//
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);//
    const [category, setCategory] = useState('All');
    const [monthIndex, setMonthIndex] = useState(0);
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
        const now = new Date();
        return expenses.filter((expense) => {
            const expenseDate = getDate(expense.date);
            const matchesCategory = category === 'All' || expense.category === category;
            if (monthIndex === 2) return matchesCategory;
            const targetDate = new Date(now.getFullYear(), now.getMonth() + (monthIndex === 0 ? 0 : -1), 1);
            return matchesCategory && expenseDate.getMonth() === targetDate.getMonth() && expenseDate.getFullYear() === targetDate.getFullYear();
        });
    }, [category, expenses, monthIndex]);

    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Icon name="arrow-left" size={22} color={colors.textDark} /></TouchableOpacity>
                <Text style={styles.title}>Expenses</Text>
                <TouchableOpacity style={styles.monthPicker} onPress={() => setMonthIndex((monthIndex + 1) % monthLabels.length)}><Text style={styles.monthText}>{monthLabels[monthIndex]}</Text><Icon name="chevron-down" size={16} color={colors.textDark} /></TouchableOpacity>
            </View>
            <FlatList
                data={filteredExpenses}
                keyExtractor={(item) => String(item.id)}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadExpenses(); }} />}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={<>
                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, styles.totalCard]}><Text style={styles.summaryLabel}>Total Expenses</Text><Text style={styles.summaryValue}>{formatCurrency(total)}</Text><Text style={styles.summaryFooter}>{filteredExpenses.length} entries</Text></View>
                        <View style={[styles.summaryCard, styles.countCard]}><Text style={styles.summaryLabel}>Total Entries</Text><Text style={styles.summaryValue}>{filteredExpenses.length}</Text><Text style={[styles.summaryFooter, styles.countFooter]}>Tracked expenses</Text></View>
                    </View>
                    <FlatList horizontal data={categories} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList} renderItem={({ item }) => <TouchableOpacity style={[styles.categoryChip, category === item && styles.categoryChipActive]} onPress={() => setCategory(item)}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></TouchableOpacity>} />
                </>}
                ListEmptyComponent={<Text style={styles.emptyText}>No expenses found</Text>}
                renderItem={({ item }) => <TouchableOpacity style={styles.expenseRow} onPress={() => navigation.navigate('ExpenseDetails', { expense: item })} activeOpacity={0.7}>
                    <View style={[styles.expenseIcon, item.fromBill && styles.billExpenseIcon]}><Icon name={iconForExpense(item)} size={19} color={item.fromBill ? colors.primary : colors.success} /></View>
                    <View style={styles.expenseDetails}><Text style={styles.expenseTitle}>{item.title}</Text><Text style={styles.expenseDate}>{formatDate(item.date)}</Text><Text style={styles.expenseCategory}>{item.category}{item.fromBill ? '  •  From Bill' : ''}</Text></View>
                    <View style={styles.expenseAmount}><Text style={styles.amountText}>{formatCurrency(item.amount)}</Text><Icon name="chevron-right" size={18} color={colors.textMuted} /></View>
                </TouchableOpacity>}
            />
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddExpense')}><Icon name="plus" size={18} color="#FFFFFF" /><Text style={styles.addButtonText}>Add Expense</Text></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 52, paddingBottom: 20 },
    backButton: { width: 34, height: 34, justifyContent: 'center' },
    title: { flex: 1, fontSize: 24, fontWeight: '800', color: colors.textDark, marginLeft: 16 },
    monthPicker: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceMuted },
    monthText: { color: colors.textDark, fontSize: 12, fontWeight: '700' },
    listContent: { paddingHorizontal: 24, paddingBottom: 92 },
    summaryRow: { flexDirection: 'row', gap: 10 },
    summaryCard: { flex: 1, minHeight: 112, borderRadius: 15, padding: 15 },
    totalCard: { backgroundColor: '#EFF6FF' },
    countCard: { backgroundColor: '#EFFAF4' },
    summaryLabel: { color: colors.textLight, fontSize: 12, fontWeight: '600' },
    summaryValue: { color: colors.textDark, fontSize: 21, fontWeight: '800', marginTop: 12 },
    summaryFooter: { color: '#2563EB', fontSize: 11, marginTop: 7 },
    countFooter: { color: '#25875C' },
    categoryList: { gap: 8, paddingVertical: 22 },
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
    addButton: { position: 'absolute', left: 24, right: 24, bottom: 18, height: 54, borderRadius: 15, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 4 },
    addButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});