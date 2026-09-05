import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { createMonthlyBudget } from '../../services/api/financeApi';
import { colors } from '../../theme/colors';

const categoryNames = ['Groceries', 'Transport', 'Food & Dining', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Others'];
const categoryIcons = ['shopping-bag', 'truck', 'coffee', 'film', 'shopping-cart', 'home', 'heart', 'more-horizontal'];

export default function AddCategoryWiseMonthlyBudgetScreen({ navigation, route }: any) {
  const { month, year, totalAmount } = route.params;
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(categoryNames.map((name) => [name, '0'])));
  const [saving, setSaving] = useState(false);
  const allocated = useMemo(() => categoryNames.reduce((sum, category) => sum + (Number(values[category]) || 0), 0), [values]);
  const remaining = totalAmount - allocated;

  const saveBudget = async () => {
    if (allocated > totalAmount) {
      Alert.alert('Invalid allocation', 'Category allocation total budget se zyada nahi ho sakta.');
      return;
    }
    setSaving(true);
    try {
      await createMonthlyBudget({ month, year, totalAmount, categories: categoryNames.map((category) => ({ category, allocatedAmount: Number(values[category]) || 0 })) });
      navigation.replace('BudgetSetSuccess', { month, year, totalAmount });
    } catch (error) {
      Alert.alert('Unable to save budget', 'Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Icon name="arrow-left" size={22} color={colors.textDark} /></TouchableOpacity>
          <View style={styles.headerCopy}><Text style={styles.title}>Allocate Categories</Text><Text style={styles.subtitle}>Distribute your budget across categories</Text></View>
          <TouchableOpacity onPress={() => setValues(Object.fromEntries(categoryNames.map((name) => [name, '0'])))}><Text style={styles.reset}>Reset</Text></TouchableOpacity>
        </View>

        {categoryNames.map((category, index) => <View style={styles.categoryRow} key={category}>
          <View style={[styles.categoryIcon, { backgroundColor: index % 2 === 0 ? '#ECFDF5' : '#EEF3FF' }]}><Icon name={categoryIcons[index]} size={17} color={index % 2 === 0 ? colors.success : colors.primary} /></View>
          <Text style={styles.categoryName}>{category}</Text>
          <View style={styles.categoryInput}><Text style={styles.currency}>₹</Text><TextInput value={values[category]} onChangeText={(value) => setValues((current) => ({ ...current, [category]: value.replace(/[^0-9]/g, '') }))} keyboardType="numeric" style={styles.input} /></View>
          <Text style={styles.percent}>{totalAmount ? `${Math.round(((Number(values[category]) || 0) / totalAmount) * 100)}%` : '0%'}</Text>
        </View>)}

        <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Allocated</Text><Text style={styles.totalValue}>₹{allocated.toLocaleString('en-IN')}</Text><Text style={styles.totalPercent}>{totalAmount ? `${Math.round((allocated / totalAmount) * 100)}%` : '0%'}</Text></View>
        <View style={[styles.remainingBox, remaining < 0 && styles.remainingDanger]}><Text style={styles.remainingLabel}>{remaining < 0 ? 'Over allocated' : 'Remaining to allocate'}</Text><Text style={[styles.remainingValue, remaining < 0 && styles.dangerText]}>₹{Math.abs(remaining).toLocaleString('en-IN')}</Text></View>
      </ScrollView>
      <View style={styles.footer}><TouchableOpacity style={[styles.saveButton, (saving || remaining < 0) && styles.disabledButton]} disabled={saving || remaining < 0} onPress={saveBudget}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <><Icon name="save" size={18} color="#FFFFFF" /><Text style={styles.saveText}>Save Budget</Text></>}</TouchableOpacity></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 58, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: { width: 34, height: 34, justifyContent: 'center' },
  headerCopy: { flex: 1, marginLeft: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  reset: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  categoryRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surfaceMuted },
  categoryIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  categoryName: { flex: 1, color: colors.textDark, fontSize: 12, fontWeight: '600' },
  categoryInput: { width: 82, height: 36, borderWidth: 1, borderColor: colors.surfaceMuted, borderRadius: 8, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7 },
  currency: { color: colors.textLight, fontSize: 12 },
  input: { flex: 1, padding: 0, textAlign: 'right', color: colors.textDark, fontSize: 12, fontWeight: '700' },
  percent: { width: 38, textAlign: 'right', color: colors.textLight, fontSize: 11 },
  totalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  totalLabel: { flex: 1, color: colors.textDark, fontSize: 12, fontWeight: '800' },
  totalValue: { color: colors.textDark, fontSize: 13, fontWeight: '800', marginRight: 14 },
  totalPercent: { color: colors.textLight, fontSize: 12, fontWeight: '700' },
  remainingBox: { backgroundColor: '#EEF3FF', borderRadius: 12, padding: 14, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remainingDanger: { backgroundColor: '#FEF2F2' },
  remainingLabel: { color: colors.textLight, fontSize: 12 },
  remainingValue: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  dangerText: { color: colors.danger },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 20, padding: 40, backgroundColor: colors.background },
  saveButton: { height: 54, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  disabledButton: { opacity: 0.5 },
  saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});