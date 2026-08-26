import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { CreateBillPayload } from '../../services/api/financeApi';
import { colors } from '../../theme/colors';

const billPaidSuccessImage = require('../../assets/images/Bill-paid-succesfully.png');

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const getBillDate = (value: string) => {
    const datePart = value.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    if (year && month && day) return new Date(year, month - 1, day);
    return new Date(value);
};
const formatDate = (bill?: CreateBillPayload) => {
    if (!bill) return 'Not available';
    if (bill.recurring) {
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
        return nextDueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
};

export default function BillPaidSuccessScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const { billPayload } = route?.params;

    return (
        <View style={styles.screen}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()
                
            }>
                <Icon name="arrow-left" size={24} color={colors.textDark} />
            </TouchableOpacity>
            <View style={styles.card}>
                <View style={styles.celebration}>
                    <Image source={billPaidSuccessImage} style={styles.successImage} resizeMode="contain" />
                </View>
                <Text style={styles.title}>Bill Paid Successfully!</Text>
                <Text style={styles.subtitle}>Your payment has been recorded.</Text>
                <View style={[styles.infoBox, styles.expenseBox]}>
                    <View style={[styles.infoIcon, styles.expenseIcon]}><Icon name="shopping-bag" size={22} color="#16A36A" /></View>
                    <View><Text style={styles.infoTitle}>Expense created</Text><Text style={styles.infoText}>{billPayload ? `${formatCurrency(billPayload.amount)} added to Expenses` : 'Payment added to Expenses'}</Text></View>
                </View>
                {billPayload?.recurring && (
                    <View style={[styles.infoBox, styles.nextBillBox]}>
                        <View style={[styles.infoIcon, styles.nextBillIcon]}><Icon name="calendar" size={22} color={colors.primary} /></View>
                        <View><Text style={[styles.infoTitle, styles.nextBillTitle]}>Next bill generated</Text><Text style={[styles.infoText, styles.nextBillText]}>Next due date: {formatDate(billPayload)}</Text></View>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', paddingHorizontal: 24 },
    backButton: { position: 'absolute', top: 54, left: 20, width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', elevation: 2, zIndex: 1 },
    card: { backgroundColor: colors.surface, borderRadius: 25, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 20, paddingTop: 26, paddingBottom: 32, alignItems: 'center' },
    celebration: { width: '100%', height: 158, alignItems: 'center', justifyContent: 'center' },
    successImage: { width: '100%', height: 158 },
    title: { color: colors.textDark, fontSize: 20, fontWeight: '800', textAlign: 'center' },
    subtitle: { color: colors.textLight, fontSize: 14, marginTop: 10, textAlign: 'center' },
    infoBox: { width: '100%', minHeight: 78, borderRadius: 13, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 24 },
    expenseBox: { backgroundColor: '#F0FDF4', borderColor: '#BBE8D1' },
    nextBillBox: { backgroundColor: '#EFF6FF', borderColor: '#C7DBFF', marginTop: 18 },
    infoIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    expenseIcon: { backgroundColor: '#DCFCE7', borderRadius: 8 },
    nextBillIcon: { backgroundColor: '#DBEAFE', borderRadius: 8 },
    infoTitle: { color: '#16794F', fontSize: 14, fontWeight: '800' },
    infoText: { color: '#32936C', fontSize: 13, marginTop: 7 },
    nextBillTitle: { color: '#1554C0' },
    nextBillText: { color: '#3B6FCB' },
    primaryButton: { width: '100%', height: 44, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    secondaryButton: { width: '100%', height: 44, borderRadius: 10, borderWidth: 2, borderColor: '#82AAFF', alignItems: 'center', justifyContent: 'center', marginTop: 13 },
    secondaryButtonText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
});