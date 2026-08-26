import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../../services/api/client';
import { colors } from '../../theme/colors';
import ReceiptAttachmentModal from '../../components/modals/ReceiptAttachmentModal';
import { createExpense } from '../../services/api/financeApi';

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Health', 'Other'];
const paymentTypes = ['Cash', 'UPI', 'Card', 'Net Banking', 'Other'];

export default function AddExpenseScreen({ navigation }: any) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [paymentType, setPaymentType] = useState('');
    const [paymentTo, setPaymentTo] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [categoryExpanded, setCategoryExpanded] = useState(false);
    const [paymentExpanded, setPaymentExpanded] = useState(false);
    const [receiptModalVisible, setReceiptModalVisible] = useState(false);

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }

        const numericAmount = parseFloat(amount);

        if (!amount.trim()) {
            newErrors.amount = 'Amount is required';
        } else if (Number.isNaN(numericAmount) || numericAmount <= 0) {
            newErrors.amount = 'Enter a valid amount';
        }

        if (!category) {
            newErrors.category = 'Please select a category';
        }

        if (!paymentType) {
            newErrors.paymentType = 'Please select a payment type';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            await createExpense({
                title: title.trim(),
                description: description.trim(),
                category,
                amount: numericAmount,
                date: date.toISOString().split('T')[0],
                paymentType,
                paymentTo: paymentTo.trim(),
            });

            Alert.alert('Expense Added', 'Your expense has been added successfully.', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Expense save nahi ho saka. Please try again.');
            console.log('Failed to save expense:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={22} color={colors.textDark} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Add Expense</Text>
                    <Text style={styles.headerSubtitle}>Track your daily spending</Text>
                </View>
                <TouchableOpacity
                    style={styles.receiptButton}
                    onPress={() => setReceiptModalVisible(true)}
                >
                    <Icon name="file-text" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Title *</Text>
                <TextInput style={styles.input} placeholder="e.g. Dinner" value={title} onChangeText={(value) => {
                    setTitle(value);
                    setErrors((current) => ({ ...current, title: '' }));
                }} />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={(value) => {
                        setAmount(value);
                        setErrors((current) => ({ ...current, amount: '' }));
                    }}
                />
                {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

                <Text style={styles.label}>Category *</Text>
                <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setCategoryExpanded(!categoryExpanded)}
                >
                    <Text style={category ? styles.selectText : styles.placeholderText}>
                        {category || 'Select category'}
                    </Text>
                    <Icon name={categoryExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textLight} />
                </TouchableOpacity>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                {categoryExpanded && (
                    <View style={styles.optionsList}>
                        {categories.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={styles.optionRow}
                                onPress={() => {
                                    setCategory(c);
                                    setErrors((current) => ({ ...current, category: '' }));
                                    setCategoryExpanded(false);
                                }}
                            >
                                <Text style={[styles.optionText, category === c && styles.optionTextSelected]}>{c}</Text>
                                {category === c && <Icon name="check" size={16} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Add a note (optional)"
                    value={description}
                    onChangeText={(value) => {
                        setDescription(value);
                    }}
                    multiline
                />

                <Text style={styles.label}>Date *</Text>
                <TouchableOpacity style={styles.selectInput} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.selectText}>{date.toDateString()}</Text>
                    <Icon name="calendar" size={18} color={colors.textLight} />
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDate(selectedDate);
                        }}
                    />
                )}

                <Text style={styles.label}>paymentType *</Text>
                <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setPaymentExpanded(!paymentExpanded)}
                >
                    <Text style={paymentType ? styles.selectText : styles.placeholderText}>
                        {paymentType || 'Select payment type'}
                    </Text>
                    <Icon name={paymentExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textLight} />
                </TouchableOpacity>
                {errors.paymentType && <Text style={styles.errorText}>{errors.paymentType}</Text>}
                {paymentExpanded && (
                    <View style={styles.optionsList}>
                        {paymentTypes.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={styles.optionRow}
                                onPress={() => {
                                    setPaymentType(c);
                                    setPaymentExpanded(false);
                                    setErrors((current) => ({ ...current, paymentType: '' }));
                                }}
                            >
                                <Text style={[styles.optionText, paymentType === c && styles.optionTextSelected]}>{c}</Text>
                                {paymentType === c && <Icon name="check" size={16} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.label}>Paid To</Text>
                <TextInput style={styles.input} placeholder="e.g. Swiggy" value={paymentTo} onChangeText={(value) => {
                    setPaymentTo(value);
                    setErrors((current) => ({ ...current, paymentTo: '' }));
                }} />
                {errors.paymentTo && <Text style={styles.errorText}>{errors.paymentTo}</Text>}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Icon name="save" size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
            <ReceiptAttachmentModal
                visible={receiptModalVisible}
                onClose={() => setReceiptModalVisible(false)}
            />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 70 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
    headerSubtitle: { fontSize: 12, color: colors.textLight },
    form: { paddingBottom: 40 },
    label: { fontSize: 13, fontWeight: '600', color: colors.textMedium, marginBottom: 6, marginTop: 14 },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.textDark,
    },
    selectInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    selectText: { fontSize: 15, color: colors.textDark },
    placeholderText: { fontSize: 15, color: colors.textMuted },
    saveButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 15,
        marginTop: 24,
        gap: 8,
    },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    cancelButton: {
        borderRadius: 14,
        paddingVertical: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
    },
    cancelButtonText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surfaceMuted },
    modalOptionText: { fontSize: 15, color: colors.textDark },
    optionsList: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: 6,
        overflow: 'hidden',
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceMuted,
    },
    optionText: {
        fontSize: 14,
        color: colors.textDark,
    },
    optionTextSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    inputError: {
        borderColor: colors.danger,
    },

    errorText: {
        color: colors.danger,
        fontSize: 12,
        marginTop: 5,
        marginLeft: 4,
    },
    receiptButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});