import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';
import ReceiptAttachmentModal from '../../components/modals/ReceiptAttachmentModal';

import apiClient from '../../services/api/client';
import { colors } from '../../theme/colors';
import { createBill } from '../../services/api/financeApi';

const recurrenceTypes = ['WEEKLY', 'MONTHLY', 'YEARLY'];

export default function AddBillScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [dueDate, setDueDate] = useState(new Date());

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('');
  const [recurrenceExpanded, setRecurrenceExpanded] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors(current => ({ ...current, [field]: '' }));
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    const numericAmount = parseFloat(amount);

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!paidTo.trim()) {
      newErrors.paidTo = 'Paid To is required';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }

    if (isRecurring && !recurrenceType) {
      newErrors.recurrenceType = 'Please select recurrence type';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await createBill({
        title: title.trim(),
        description: description.trim(),
        amount: numericAmount,
        paidTo: paidTo.trim(),
        dueDate: dueDate.toISOString().split('T')[0],
        recurring: isRecurring,
        recurrenceType: isRecurring ? recurrenceType : null,
      });

      Alert.alert('Bill Added', 'Your bill has been added successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log('Failed to save bill:', error);
      Alert.alert('Error', 'Bill save nahi ho saka. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={colors.textDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add Bill</Text>
          <Text style={styles.headerSubtitle}>Track your upcoming payments</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          placeholder="e.g. Electricity Bill"
          value={title}
          onChangeText={value => {
            setTitle(value);
            clearError('title');
          }}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

        <Text style={styles.label}>Amount *</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.inputError]}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={value => {
            setAmount(value);
            clearError('amount');
          }}
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

        <Text style={styles.label}>Paid To *</Text>

        <TextInput
          style={[styles.input, errors.paidTo && styles.inputError]}
          placeholder="e.g. BSES"
          value={paidTo}
          onChangeText={value => {
            setPaidTo(value);
            clearError('paidTo');
          }}
        />

        {errors.paidTo && (
          <Text style={styles.errorText}>{errors.paidTo}</Text>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Add a note (optional)"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Due Date *</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => setShowDatePicker(true)}>
          <Text style={styles.selectText}>{dueDate.toDateString()}</Text>
          <Icon name="calendar" size={18} color={colors.textLight} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);

              if (selectedDate) {
                setDueDate(selectedDate);
              }
            }}
          />
        )}

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>Recurring Bill</Text>
            <Text style={styles.switchSubtitle}>
              Repeat this bill automatically
            </Text>
          </View>

          <Switch
            value={isRecurring}
            onValueChange={value => {
              setIsRecurring(value);

              if (!value) {
                setRecurrenceType('');
                setRecurrenceExpanded(false);
                clearError('recurrenceType');
              }
            }}
            trackColor={{
              false: colors.border,
              true: colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        {isRecurring && (
          <>
            <Text style={styles.label}>Recurrence Type *</Text>

            <TouchableOpacity
              style={[
                styles.selectInput,
                errors.recurrenceType && styles.inputError,
              ]}
              onPress={() =>
                setRecurrenceExpanded(current => !current)
              }>
              <Text
                style={
                  recurrenceType
                    ? styles.selectText
                    : styles.placeholderText
                }>
                {recurrenceType || 'Select recurrence type'}
              </Text>

              <Icon
                name={recurrenceExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textLight}
              />
            </TouchableOpacity>

            {errors.recurrenceType && (
              <Text style={styles.errorText}>{errors.recurrenceType}</Text>
            )}

            {recurrenceExpanded && (
              <View style={styles.optionsList}>
                {recurrenceTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.optionRow}
                    onPress={() => {
                      setRecurrenceType(type);
                      setRecurrenceExpanded(false);
                      clearError('recurrenceType');
                    }}>
                    <Text
                      style={[
                        styles.optionText,
                        recurrenceType === type &&
                        styles.optionTextSelected,
                      ]}>
                      {type}
                    </Text>

                    {recurrenceType === type && (
                      <Icon name="check" size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Icon name="save" size={18} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Bill</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerSpacer: {
    width: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  form: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMedium,
    marginBottom: 6,
    marginTop: 14,
  },
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
  inputError: {
    borderColor: colors.danger,
  },
  descriptionInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectText: {
    fontSize: 15,
    color: colors.textDark,
  },
  placeholderText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    paddingVertical: 12,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
  },
  switchSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 3,
  },
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
    paddingVertical: 13,
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 26,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 15,
    marginTop: 10,
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
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