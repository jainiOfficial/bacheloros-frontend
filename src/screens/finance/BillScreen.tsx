import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl } from 'react-native'
import React, { useCallback, useState } from 'react'
import { colors } from '../../theme/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { BillItem, BillListResponse, BillStatus, getBills } from '../../services/api/financeApi';

const TABS: { key: BillStatus; label: string }[] = [
    { key: 'UPCOMING', label: 'Upcoming' },
    { key: 'PAID', label: 'Paid' },
    { key: 'OVERDUE', label: 'Overdue' },
];
export default function BillScreen() {
    const navigation = useNavigation<any>();
    const [status, setStatus] = useState<BillStatus>('UPCOMING');
    const [data, setData] = useState<BillListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBills = useCallback(async (currentStatus: BillStatus) => {
        try {
            const response = await getBills(currentStatus);
            setData(response.data);
        } catch (err) {
            console.log('Failed to load bills:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // status badalte hi refetch
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchBills(status);
        }, [status, fetchBills])
    );
    const onRefresh = () => {
        setRefreshing(true);
        fetchBills(status);
    };

    const badgeCount = (key: BillStatus) => {
        if (!data) return 0;
        if (key === 'UPCOMING') return data.upcomingCount;
        if (key === 'PAID') return data.paidCount;
        return data.overdueCount;
    };

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

    const formatPaidOnDate = (paidOn: string) => {
        const date = new Date(paidOn);
        if (Number.isNaN(date.getTime())) return paidOn;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatDueDate = (dueDate: string) => {
        const datePart = dueDate.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        const due = year && month && day ? new Date(year, month - 1, day) : new Date(dueDate);
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const differenceInDays = Math.round((due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

        if (differenceInDays === 0) return 'Today';
        if (differenceInDays === 1) return 'Tomorrow';
        return due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const renderBillCard = ({ item }: { item: BillItem }) => {
        const isOverdue = status === 'OVERDUE';
        const isPaidTab = status === 'PAID';
        const dueDateLabel = formatDueDate(item.dueDate);
        const isDueSoon = dueDateLabel === 'Today' || dueDateLabel === 'Tomorrow';

        return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BillDetails', { billId: item.id })}>
                <View style={styles.cardIcon}>
                    <Icon name="file-text" size={20} color={colors.primary} />
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.paidTo}</Text>
                    <View style={styles.cardDateRow}>
                        <Icon name="calendar" size={12} color={colors.textLight} />
                        <Text style={[styles.cardDate, isDueSoon && !item.paid && !item.paidOn && styles.cardDateDanger]}>{item.paid && item.paidOn ? `Paid on ${formatPaidOnDate(item.paidOn)}` : `Due ${dueDateLabel}`}</Text>
                    </View>
                </View>
                <View style={styles.cardRight}>
                    <Text style={styles.cardAmount}>{formatCurrency(item.amount)}</Text>
                    <View style={[
                        styles.statusPill,
                        isOverdue && styles.statusPillOverdue,
                        isPaidTab && styles.statusPillPaid,
                    ]}>
                        <Text style={[
                            styles.statusPillText,
                            isOverdue && styles.statusPillTextOverdue,
                            isPaidTab && styles.statusPillTextPaid,
                        ]}>
                            {isPaidTab ? 'Paid' : isOverdue ? 'Overdue' : 'Upcoming'}
                        </Text>
                    </View>
                </View>
                <Icon name="chevron-right" size={18} color={colors.border} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={22} color={colors.textDark} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Bills</Text>
                    <Text style={styles.headerSubtitle}>Manage and track all your bills</Text>
                </View>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('AddBill')}
                >
                    <Icon name="plus" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsRow}>
                {TABS.map((tab) => {
                    const active = tab.key === status;
                    const count = badgeCount(tab.key);
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, active && styles.tabActive]}
                            onPress={() => setStatus(tab.key)}
                        >
                            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                            {tab.key === 'OVERDUE' && count > 0 && (
                                <View style={styles.tabBadge}>
                                    <Text style={styles.tabBadgeText}>{count}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
            {/* {DATA} */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={data?.bills ?? []}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderBillCard}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No {status.toLowerCase()} bills</Text>
                    }
                />
            )}
        </View>
    )
}



const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingTop: 52, paddingBottom: 20,
    },
    headerCenter: { flex: 1, marginLeft: 16 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textDark },
    headerSubtitle: { fontSize: 14, color: colors.textLight, marginTop: 4 },
    iconButton: {
        width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: '#94A3B8',
        justifyContent: 'center', alignItems: 'center',
    },
    tabsRow: {
        flexDirection: 'row', backgroundColor: colors.surface, marginHorizontal: 24,
        borderRadius: 30, padding: 4, marginBottom: 16,
    },
    tab: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 13, borderRadius: 24, gap: 6,
    },
    tabActive: { backgroundColor: colors.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
    tabTextActive: { color: '#FFFFFF' },
    tabBadge: {
        backgroundColor: '#FEE2E2', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1,
    },
    tabBadgeText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
    listContent: { paddingHorizontal: 24, paddingBottom: 100 },
    card: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
        borderRadius: 20, padding: 18, marginBottom: 16, minHeight: 114,
    },
    cardIcon: {
        width: 60, height: 60, borderRadius: 16, backgroundColor: '#EFF6FF',
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
    },
    cardBody: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: '800', color: colors.textDark },
    cardSubtitle: { fontSize: 14, color: colors.textLight, marginTop: 4 },
    cardDateRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
    cardDate: { fontSize: 13, color: colors.textLight },
    cardDateDanger: { color: colors.danger, fontWeight: '700' },
    cardRight: { alignItems: 'flex-end', marginRight: 8 },
    cardAmount: { fontSize: 17, fontWeight: '800', color: colors.textDark, marginBottom: 7 },
    statusPill: { backgroundColor: '#EFF6FF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
    statusPillOverdue: { backgroundColor: '#FEE2E2' },
    statusPillPaid: { backgroundColor: '#D1FAE5' },
    statusPillText: { fontSize: 12, fontWeight: '700', color: colors.primary },
    statusPillTextOverdue: { color: '#DC2626' },
    statusPillTextPaid: { color: colors.success },
    emptyText: { textAlign: 'center', color: colors.textLight, marginTop: 40 },
    summaryBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
        padding: 16, borderTopWidth: 1, borderTopColor: colors.border,
    },
    summaryIcon: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    summaryText: { flex: 1 },
    summaryTitle: { fontSize: 13, fontWeight: '700', color: colors.textDark },
    summarySubtitle: { fontSize: 12, color: colors.textLight, marginTop: 2 },
});