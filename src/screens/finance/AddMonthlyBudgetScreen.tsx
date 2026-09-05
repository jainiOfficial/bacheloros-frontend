import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';

export default function AddMonthlyBudgetScreen({ navigation }: any) {
  const currentDate = new Date();
  const [amount, setAmount] = useState('');
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const currentMonthLabel = currentDate.toLocaleString('en-US', { month: 'long' });

  const continueToCategories = () => {
    const totalAmount = Number(amount.replace(/,/g, ''));
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      Alert.alert('Enter budget amount', 'Please enter a valid total budget amount.');
      return;
    }

    navigation.navigate('AddCategoryWiseMonthlyBudget', {
      month: currentMonth,
      year: currentYear,
      totalAmount,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={22} color={colors.textDark} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Set Budget</Text>
            <Text style={styles.subtitle}>Set your total budget</Text>
          </View>
        </View>

        <Text style={styles.label}>Month</Text>
        <View style={styles.lockedSelect}>
          <Text style={styles.selectText}>{currentMonthLabel}</Text>
          <Icon name="lock" size={16} color={colors.textMuted} />
        </View>

        <Text style={styles.label}>Year</Text>
        <View style={styles.lockedSelect}>
          <Text style={styles.selectText}>{currentYear}</Text>
          <Icon name="lock" size={16} color={colors.textMuted} />
        </View>

        <Text style={styles.label}>Total Budget Amount</Text>
        <View style={styles.amountInput}>
          <Text style={styles.currency}>₹</Text>
          <TextInput value={amount} onChangeText={setAmount} placeholder="50,000" placeholderTextColor={colors.textMuted} keyboardType="numeric" style={styles.input} />
        </View>

        <View style={styles.infoBox}>
          <Icon name="info" size={16} color={colors.info} />
          <Text style={styles.infoText}>This budget will help you track your spending and stay on target.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={continueToCategories}>
          <Text style={styles.continueText}>Continue</Text>
          <Icon name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 58, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 34 },
  backButton: { width: 34, height: 34, justifyContent: 'center' },
  headerCopy: { marginLeft: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textDark, marginBottom: 8, marginTop: 20 },
  lockedSelect: { minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceMuted, backgroundColor: colors.surfaceMuted, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { color: colors.textDark, fontSize: 14, fontWeight: '600' },
  amountInput: { minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceMuted, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  currency: { color: colors.textDark, fontSize: 17, fontWeight: '700', marginRight: 8 },
  input: { flex: 1, color: colors.textDark, fontSize: 16, fontWeight: '600' },
  infoBox: { backgroundColor: '#EEF3FF', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  infoText: { flex: 1, color: colors.textLight, fontSize: 12, lineHeight: 18, marginLeft: 10 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 20, padding: 40, backgroundColor: colors.background },
  continueButton: { height: 54, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  continueText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});