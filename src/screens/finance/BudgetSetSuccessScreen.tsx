import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';

export default function BudgetSetSuccessScreen({ navigation, route }: any) {
  const { month, year, totalAmount } = route.params;
  const monthLabel = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' });
  const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.celebration}>
          <View style={[styles.dot, styles.dotTop]} />
          <View style={[styles.dot, styles.dotLeft]} />
          <View style={[styles.dot, styles.dotRight]} />
          <View style={[styles.dot, styles.dotBottom]} />
          <View style={[styles.dot, styles.dotTopRight]} />
          <View style={styles.checkCircle}>
            <Icon name="check" size={42} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Budget Set Successfully!</Text>
        <Text style={styles.description}>
          Your budget of {formatCurrency(totalAmount)} for {monthLabel} {year} has been set.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.popToTop()}>
          <Text style={styles.primaryText}>Go to Overview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topBar: { paddingTop: 58, paddingHorizontal: 24 },
  backButton: { width: 34, height: 34, justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  celebration: { width: 190, height: 190, alignItems: 'center', justifyContent: 'center', marginBottom: 34 },
  checkCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: colors.warning },
  dotTop: { top: 20, left: 92 },
  dotLeft: { left: 32, top: 94, backgroundColor: colors.primary },
  dotRight: { right: 26, top: 92, backgroundColor: colors.accentPurple },
  dotBottom: { bottom: 28, left: 82, backgroundColor: colors.danger },
  dotTopRight: { top: 42, right: 52, backgroundColor: '#FDE68A' },
  title: { textAlign: 'center', color: colors.textDark, fontSize: 20, fontWeight: '800' },
  description: { textAlign: 'center', color: colors.textLight, fontSize: 14, lineHeight: 22, marginTop: 12 },
  footer: { paddingHorizontal: 24, paddingBottom: 28 },
  primaryButton: { height: 54, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});