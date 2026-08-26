import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BillItem, createBill, CreateBillPayload, createExpense, CreateExpensePayload, deleteBillById, getBillById, markBillAsPaid } from '../../services/api/financeApi';
import { colors } from '../../theme/colors';

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Health', 'Other'];
const paymentTypes = ['Cash', 'UPI', 'Card', 'Net Banking', 'Other'];



const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getBillDate = (value: string) => {
    const datePart = value.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    if (year && month && day) return new Date(year, month - 1, day);
    return new Date(value);
};

const formatDueDate = (value: string) => {
    const dueDate = getBillDate(value);
    if (Number.isNaN(dueDate.getTime())) return value;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const differenceInDays = Math.round((dueDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

    if (differenceInDays === 0) return 'Today';
    if (differenceInDays === 1) return 'Tomorrow';
    return formatDate(value);
};

const formatRecurrence = (bill: BillItem) => bill.recurring ? bill.recurrenceType || 'Recurring' : 'One-time';

export default function BillDetailsScreen({ route }: any) {
    const { billId } = route.params;
    const navigation = useNavigation<any>();
    const [bill, setBill] = useState<BillItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [category, setCategory] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [selectionError, setSelectionError] = useState('');
    const [addNextBill, setAddNextBill] = useState(false);
    const loadBill = useCallback(async () => {
        try {
            const response = await getBillById(billId);
            setBill(response.data);
        } catch {
            Alert.alert('Unable to load bill', 'Please try again later.', [{ text: 'Go Back', onPress: () => navigation.goBack() }]);
        } finally {
            setLoading(false);
        }
    }, [billId, navigation]);
    useFocusEffect(useCallback(() => {
        loadBill();
    }, [loadBill]));
     
    const updateExpense = async (expensePayload: CreateExpensePayload) => {
        try {
            await createExpense(expensePayload);
        } catch {
            Alert.alert('Unable to create expense', 'Please try again later.');
        }
    };
    const updateBill = async (billPayload: CreateBillPayload) => {
        try {
            await createBill(billPayload);
        } catch {
            Alert.alert('Unable to create recurring bill', 'Please try again later.');
        }
    };
    const handleMarkAsPaid = async () => {
        if (!bill || bill.paid) return;
        if (!category || !paymentType) {
            setSelectionError('Please select a category and payment type.');
            return;
        }
        const expensePayload: CreateExpensePayload = {
            title: bill.title,
            description: bill.description,
            category,
            amount: bill.amount,
            date: new Date().toISOString(),
            paymentType,
            paymentTo: bill.paidTo,
        };
        setActionLoading(true);
        try {
            await markBillAsPaid(bill.id);
            await updateExpense(expensePayload);
            let nextBillPayload: CreateBillPayload | null = bill;
            if (bill.recurrenceType && addNextBill) {
                const nextDueDate = new Date(getBillDate(bill.dueDate));
                switch (bill.recurrenceType) {
                    case 'WEEKLY':
                        nextDueDate.setDate(nextDueDate.getDate() + 7);
                        break;
                    case 'MONTHLY':
                        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                        break;
                    case 'YEARLY':
                        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                        break;
                    default:
                        break;
                }
                nextBillPayload = {
                    title: bill.title,
                    description: bill.description,
                    amount: bill.amount,
                    paidTo: bill.paidTo,
                    dueDate: nextDueDate.toISOString(),
                    recurring: true,
                    recurrenceType: bill.recurrenceType,
                };
                await updateBill(nextBillPayload);
            }
            navigation.navigate('BillPaidSuccess', { billPayload: nextBillPayload });
            setBill({ ...bill, paid: true });
        } catch {
            Alert.alert('Unable to update bill', 'Please try again later.');
        } finally {
            setActionLoading(false);
            setSelectionError('');
            
        }
    };

    const openPaymentModal = () => {
        setSelectionError('');
        setPaymentModalVisible(true);
    };

    const handleDelete = () => {
        if (!bill) return;
        Alert.alert('Delete bill?', 'This bill will be permanently removed.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    setActionLoading(true);
                    try {
                        await deleteBillById(bill.id);
                        navigation.goBack();
                    } catch {
                        Alert.alert('Unable to delete bill', 'Please try again later.');
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    const formatPaidOnDate = (paidOn: string) => {
        const date = new Date(paidOn);
        if (Number.isNaN(date.getTime())) return paidOn;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    if (!bill) return null;

    const detailRows = [
        { icon: 'file-text', label: 'Title', value: bill.title },
        { icon: 'align-left', label: 'Description', value: bill.description || 'Not provided' },
        { icon: 'user', label: 'Paid To', value: bill.paidTo },
        { icon: 'calendar', label: 'Due Date', value: formatDate(bill.dueDate) },
        { icon: 'repeat', label: 'Recurring', value: formatRecurrence(bill) },
        { icon: 'check-circle', label: 'Payment Status', value: bill.paid ? 'Paid' : 'Unpaid' },
        ...(bill.paid && bill.paidOn ? [{ icon: 'calendar' as const, label: 'Paid On', value: formatDate(bill.paidOn) }] : []),
        { icon: 'hash', label: 'Bill ID', value: String(bill.id) },
        { icon: 'credit-card', label: 'Amount', value: formatCurrency(bill.amount) },
    ] as const;
    const dueDateLabel = formatDueDate(bill.dueDate);
    const isDueSoon = dueDateLabel === 'Today' || dueDateLabel === 'Tomorrow';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color={colors.textDark} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Bill Details</Text>
                <View style={styles.headerButton} />
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryCard}>
                    <View style={styles.billIcon}><Icon name="file-text" size={31} color={colors.primary} /></View>
                    <View style={styles.summaryCopy}><Text style={styles.billTitle}>{bill.title}</Text><Text style={styles.billProvider}>{bill.paidTo}</Text><Text style={[styles.dueText, isDueSoon && !bill.paid && !bill.paidOn && styles.dueTextDanger]}>{bill.paid && bill.paidOn ? `Paid on ${formatPaidOnDate(bill.paidOn)}` : `Due ${dueDateLabel}`}</Text></View>
                    <View style={styles.summaryAmount}><View style={[styles.statusPill, bill.paid && styles.paidPill]}><Text style={[styles.statusText, bill.paid && styles.paidText]}>{bill.paid ? 'PAID' : 'DUE'}</Text></View><Text style={styles.amount}>{formatCurrency(bill.amount)}</Text></View>
                </View>
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Bill Information</Text>
                    {detailRows.map((row, index) => <View key={row.label} style={[styles.detailRow, index === detailRows.length - 1 && styles.lastRow]}><Icon name={row.icon} size={19} color={colors.textLight} /><Text style={styles.detailLabel}>{row.label}</Text><Text style={styles.detailValue}>{row.value}</Text></View>)}
                </View>
                {!bill.paid && <TouchableOpacity style={[styles.primaryButton, actionLoading && styles.disabledButton]} onPress={openPaymentModal} disabled={actionLoading}><Text style={styles.primaryButtonText}>Mark as Paid</Text></TouchableOpacity>}
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={actionLoading}><Icon name="trash-2" size={18} color={colors.danger} /><Text style={styles.deleteButtonText}>Delete Bill</Text></TouchableOpacity>
            </ScrollView>
            <Modal visible={paymentModalVisible} transparent animationType="slide" onRequestClose={() => setPaymentModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}><Text style={styles.modalTitle}>Mark Bill as Paid</Text><TouchableOpacity onPress={() => setPaymentModalVisible(false)}><Icon name="x" size={22} color={colors.textDark} /></TouchableOpacity></View>
                        <Text style={styles.modalSubtitle}>Select details for the expense entry.</Text>
                        <Text style={styles.modalLabel}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
                            {categories.map((item) => <TouchableOpacity key={item} style={[styles.option, category === item && styles.selectedOption]} onPress={() => { setCategory(item); setSelectionError(''); }}><Text style={[styles.optionText, category === item && styles.selectedOptionText]}>{item}</Text></TouchableOpacity>)}
                        </ScrollView>
                        <Text style={styles.modalLabel}>Payment Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
                            {paymentTypes.map((item) => <TouchableOpacity key={item} style={[styles.option, paymentType === item && styles.selectedOption]} onPress={() => { setPaymentType(item); setSelectionError(''); }}><Text style={[styles.optionText, paymentType === item && styles.selectedOptionText]}>{item}</Text></TouchableOpacity>)}
                        </ScrollView>
                        {!!selectionError && <Text style={styles.selectionError}>{selectionError}</Text>}
                        {bill.recurrenceType && (
                            <View style={styles.recurringQuestion}>
                                <Text style={styles.recurringQuestionText}>Its a recurring bill. Do you want to add this bill for the next period?</Text>
                                <View style={styles.recurringOptions}>
                                    <TouchableOpacity style={[styles.recurringOption, addNextBill && styles.selectedOption]} onPress={() => setAddNextBill(true)}>
                                        <Text style={[styles.optionText, addNextBill && styles.selectedOptionText]}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.recurringOption, !addNextBill && styles.selectedOption]} onPress={() => setAddNextBill(false)}>
                                        <Text style={[styles.optionText, !addNextBill && styles.selectedOptionText]}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        <TouchableOpacity style={[styles.confirmButton, actionLoading && styles.disabledButton]} onPress={()=>{navigation.goBack(); handleMarkAsPaid();}} disabled={actionLoading}><Text style={styles.primaryButtonText}>{actionLoading ? 'Saving...' : 'Confirm & Mark Paid'}</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 18 },
    headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textDark },
    content: { paddingHorizontal: 20, paddingBottom: 34 },
    summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 22, padding: 20, marginBottom: 22, shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
    billIcon: { width: 66, height: 66, borderRadius: 17, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    summaryCopy: { flex: 1 },
    billTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
    billProvider: { fontSize: 13, color: colors.textLight, marginTop: 5 },
    dueText: { fontSize: 12, color: colors.textLight, marginTop: 8 },
    dueTextDanger: { color: colors.danger, fontWeight: '700' },
    summaryAmount: { alignItems: 'flex-end', marginLeft: 8 },
    statusPill: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    paidPill: { backgroundColor: '#D1FAE5' },
    statusText: { color: colors.danger, fontSize: 11, fontWeight: '800' },
    paidText: { color: colors.success },
    amount: { fontSize: 21, fontWeight: '800', color: colors.textDark, marginTop: 12 },
    detailsCard: { backgroundColor: colors.surface, borderRadius: 22, paddingHorizontal: 18, paddingTop: 22, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark, marginBottom: 8 },
    detailRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    lastRow: { borderBottomWidth: 0 },
    detailLabel: { flex: 1, color: colors.textLight, fontSize: 14, marginLeft: 14 },
    detailValue: { maxWidth: '53%', color: colors.textDark, fontSize: 14, fontWeight: '600', textAlign: 'right' },
    primaryButton: { height: 54, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
    disabledButton: { opacity: 0.7 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
    deleteButton: { height: 54, borderRadius: 15, borderWidth: 1, borderColor: '#FCA5A5', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
    deleteButtonText: { color: colors.danger, fontSize: 17, fontWeight: '800' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 34 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark },
    modalSubtitle: { color: colors.textLight, fontSize: 13, marginTop: 5 },
    modalLabel: { color: colors.textMedium, fontSize: 14, fontWeight: '700', marginTop: 22, marginBottom: 10 },
    optionsRow: { gap: 8 },
    option: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 },
    selectedOption: { backgroundColor: colors.primary, borderColor: colors.primary },
    optionText: { color: colors.textMedium, fontSize: 13 },
    selectedOptionText: { color: '#FFFFFF', fontWeight: '700' },
    selectionError: { color: colors.danger, fontSize: 12, marginTop: 14 },
    recurringQuestion: { marginTop: 22 },
    recurringQuestionText: { color: colors.textMedium, fontSize: 14, fontWeight: '700', marginBottom: 10 },
    recurringOptions: { flexDirection: 'row', gap: 8 },
    recurringOption: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    confirmButton: { height: 52, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
});