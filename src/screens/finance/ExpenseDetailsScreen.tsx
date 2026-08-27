import React ,{ useCallback, useState }from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View ,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { ExpenseItem,deleteExpenseById } from '../../services/api/financeApi';
import { colors } from '../../theme/colors';

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};




export default function ExpenseDetailsScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const expense = route.params.expense as ExpenseItem;
    const [actionLoading, setActionLoading] = useState(false);
    const detailRows = [
        { icon: 'shopping-bag', label: 'Category', value: expense.category },
        { icon: 'calendar', label: 'Date', value: `${formatDate(expense.date)}` },
        { icon: 'credit-card', label: 'Payment Type', value: expense.paymentType },
        { icon: 'user', label: 'Paid To', value: expense.paymentTo || 'Not provided' },
        { icon: 'align-left', label: 'Description', value: expense.description || 'Not provided' },
        { icon: 'dollar-sign', label: 'Amount', value: formatCurrency(expense.amount) },
    ] as const;


    const handleDelete = () => {
        if (!expense) return;
        Alert.alert('Delete Expense?', 'This Expense will be permanently removed.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    setActionLoading(true);
                    try {
                        await deleteExpenseById(expense.id);
                        navigation.goBack();
                    } catch {
                        Alert.alert('Unable to delete Expense', 'Please try again later.');
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color={colors.textDark} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Expense Details</Text>
                <View style={styles.headerButton} />
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryCard}>
                    <View style={styles.expenseIcon}><Icon name={expense.fromBill ? 'zap' : 'shopping-bag'} size={30} color={colors.primary} /></View>
                    <View style={styles.summaryCopy}>
                        <Text style={styles.expenseTitle}>{expense.title}</Text>
                        <Text style={styles.expenseSource}>{expense.fromBill ? 'Created from bill' : expense.paymentTo || 'Personal expense'}</Text>
                        <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                    </View>
                    <View style={styles.summaryAmount}><View style={styles.statusPill}><Text style={styles.statusText}>PAID</Text></View><Text style={styles.amount}>{formatCurrency(expense.amount)}</Text></View>
                </View>
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Expense Information</Text>
                    {detailRows.map((row, index) => <View key={row.label} style={[styles.detailRow, index === detailRows.length - 1 && styles.lastRow]}><Icon name={row.icon} size={19} color={colors.textLight} /><Text style={styles.detailLabel}>{row.label}</Text><Text style={styles.detailValue}>{row.value}</Text></View>)}
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={actionLoading}><Icon name="trash-2" size={18} color={colors.danger} /><Text style={styles.deleteButtonText}>Delete Expense</Text></TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 52, paddingBottom: 20 },
    headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textDark },
    content: { paddingHorizontal: 24, paddingBottom: 34 },
    summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 22, padding: 20, marginBottom: 22, shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
    expenseIcon: { width: 66, height: 66, borderRadius: 17, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    summaryCopy: { flex: 1 },
    expenseTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
    expenseSource: { fontSize: 13, color: colors.textLight, marginTop: 5 },
    expenseDate: { fontSize: 12, color: colors.textLight, marginTop: 8 },
    summaryAmount: { alignItems: 'flex-end', marginLeft: 8 },
    statusPill: { backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    statusText: { color: colors.success, fontSize: 11, fontWeight: '800' },
    amount: { fontSize: 21, fontWeight: '800', color: colors.textDark, marginTop: 12 },
    detailsCard: { backgroundColor: colors.surface, borderRadius: 22, paddingHorizontal: 18, paddingTop: 22, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark, marginBottom: 8 },
    detailRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    lastRow: { borderBottomWidth: 0 },
    detailLabel: { flex: 1, color: colors.textLight, fontSize: 14, marginLeft: 14 },
    detailValue: { maxWidth: '53%', color: colors.textDark, fontSize: 14, fontWeight: '600', textAlign: 'right' },
    deleteButton: { height: 54, borderRadius: 15, borderWidth: 1, borderColor: '#FCA5A5', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
    deleteButtonText: { color: colors.danger, fontSize: 17, fontWeight: '800' },
});