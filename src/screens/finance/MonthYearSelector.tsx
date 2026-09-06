import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';

interface MonthYearSelectorProps {
	month: number;
	year: number;
	onChange: (month: number, year: number) => void;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthYearSelector({ month, year, onChange }: MonthYearSelectorProps) {
	const [visible, setVisible] = useState(false);
	const [draftMonth, setDraftMonth] = useState(month);
	const [draftYear, setDraftYear] = useState(year);
	const [yearOpen, setYearOpen] = useState(false);
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;
	const currentYear = currentDate.getFullYear();
	const selectableYears = Array.from({ length: 5 }, (_, index) => currentYear - index);

	useEffect(() => {
		setDraftMonth(month);
		setDraftYear(year);
	}, [month, year]);

	const openSelector = () => {
		setDraftMonth(month);
		setDraftYear(year);
		setVisible(true);
	};

	const applySelection = () => {
		onChange(draftMonth, draftYear);
		setVisible(false);
		setYearOpen(false);
	};

	const changeMonth = (offset: number) => {
		const nextDate = new Date(year, month - 1 + offset, 1);
		if (nextDate > new Date(currentYear, currentMonth - 1, 1)) return;
		onChange(nextDate.getMonth() + 1, nextDate.getFullYear());
	};

	const isCurrentMonth = month === currentMonth && year === currentYear;

	const selectYear = (selectedYear: number) => {
		setDraftYear(selectedYear);
		if (selectedYear === currentYear && draftMonth > currentMonth) {
			setDraftMonth(currentMonth);
		}
		setYearOpen(false);
	};

	return (
		<>
			<View style={styles.selector}>
				<TouchableOpacity style={styles.arrowButton} onPress={() => changeMonth(-1)}>
					<Icon name="chevron-left" size={20} color={colors.textDark} />
				</TouchableOpacity>
				<TouchableOpacity onPress={openSelector} activeOpacity={0.8} style={styles.periodButton}>
					<Text style={styles.selectorText}>{months[month - 1]} {year}</Text>
				</TouchableOpacity>
				<TouchableOpacity disabled={isCurrentMonth} style={[styles.arrowButton, isCurrentMonth && styles.arrowButtonDisabled]} onPress={() => changeMonth(1)}>
					<Icon name="chevron-right" size={20} color={isCurrentMonth ? colors.textMuted : colors.textDark} />
				</TouchableOpacity>
			</View>

			<Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
				<View style={styles.overlay}>
					<TouchableOpacity style={styles.backdrop} onPress={() => setVisible(false)} />
					<View style={styles.sheet}>
						<View style={styles.sheetHeader}>
							<Text style={styles.sheetTitle}>Select Month & Year</Text>
							<TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
								<Icon name="x" size={18} color={colors.textDark} />
							</TouchableOpacity>
						</View>

						<View style={styles.yearHeader}>
							<Text style={styles.fieldLabel}>Year</Text>
							<TouchableOpacity style={styles.yearDropdown} onPress={() => setYearOpen(!yearOpen)}>
								<Text style={styles.yearText}>{draftYear}</Text>
								<Icon name={yearOpen ? 'chevron-up' : 'chevron-down'} size={17} color={colors.textLight} />
							</TouchableOpacity>
						</View>
						{yearOpen && <View style={styles.yearOptions}>{selectableYears.map((item) => <TouchableOpacity key={item} style={styles.yearOption} onPress={() => selectYear(item)}><Text style={[styles.yearOptionText, item === draftYear && styles.yearOptionSelected]}>{item}</Text>{item === draftYear && <Icon name="check" size={16} color={colors.primary} />}</TouchableOpacity>)}</View>}

						<View style={styles.monthGrid}>
							{months.map((monthLabel, index) => {
								const monthNumber = index + 1;
								const selected = draftMonth === monthNumber;
								const disabled = draftYear === currentYear && monthNumber > currentMonth;
								return (
									<TouchableOpacity key={monthLabel} disabled={disabled} style={[styles.monthButton, selected && styles.monthButtonSelected, disabled && styles.monthButtonDisabled]} onPress={() => setDraftMonth(monthNumber)}>
										<Text style={[styles.monthText, selected && styles.monthTextSelected, disabled && styles.monthTextDisabled]}>{monthLabel}</Text>
									</TouchableOpacity>
								);
							})}
						</View>

						<TouchableOpacity style={styles.applyButton} onPress={applySelection}>
							<Text style={styles.applyText}>Apply</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	selector: { height: 48, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceMuted, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
	arrowButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
	arrowButtonDisabled: { opacity: 0.55 },
	periodButton: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' },
	selectorText: { color: colors.textDark, fontSize: 14, fontWeight: '800' },
	overlay: { flex: 1, justifyContent: 'flex-end' },
	backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.42)' },
	sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 30 },
	sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
	sheetTitle: { color: colors.textDark, fontSize: 17, fontWeight: '800' },
	closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
	yearHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
	fieldLabel: { color: colors.textDark, fontSize: 13, fontWeight: '700' },
	yearDropdown: { minWidth: 105, height: 40, borderRadius: 9, borderWidth: 1, borderColor: colors.surfaceMuted, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	yearText: { color: colors.textDark, fontSize: 14, fontWeight: '800' },
	yearOptions: { backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.surfaceMuted, marginBottom: 16, overflow: 'hidden' },
	yearOption: { height: 40, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surfaceMuted },
	yearOptionText: { color: colors.textMedium, fontSize: 13 },
	yearOptionSelected: { color: colors.primary, fontWeight: '800' },
	monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
	monthButton: { width: '22%', height: 42, borderRadius: 9, borderWidth: 1, borderColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
	monthButtonDisabled: { backgroundColor: colors.surfaceMuted, borderColor: colors.surfaceMuted },
	monthButtonSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
	monthText: { color: colors.textMedium, fontSize: 12, fontWeight: '700' },
	monthTextSelected: { color: '#FFFFFF' },
	monthTextDisabled: { color: colors.textMuted },
	applyButton: { height: 52, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
	applyText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
