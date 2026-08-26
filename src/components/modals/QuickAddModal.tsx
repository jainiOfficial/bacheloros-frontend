import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';


interface QuickAddModalProps {
    visible: boolean;
    onClose: () => void;
    onNavigate: (route: string) => void;
}


export default function QuickAddModal({ visible, onClose, onNavigate }: QuickAddModalProps) {
    const quickAddItems = [
        { title: 'Add Expense', subtitle: 'Add your daily expenses', icon: 'dollar-sign', color: colors.success, enabled: true, route: 'AddExpense' },
        { title: 'Add Bill', subtitle: 'Add your Bills to pay', icon: 'file-text', color: colors.warning, enabled: true, route: 'AddBill' },
        { title: 'Add Document', subtitle: 'Upload important documents', icon: 'file', color: colors.info, enabled: false },
        { title: 'Add Grocery', subtitle: 'Add items to your list', icon: 'shopping-cart', color: '#F97316', enabled: false },
        { title: 'Create Reminder', subtitle: 'Set reminder for important tasks', icon: 'bell', color: colors.accentPurple, enabled: false },
        { title: 'Add Income', subtitle: 'Track your income', icon: 'trending-up', color: '#059669', enabled: false },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                {/* onStartShouldSetResponder prevents the modal from closing when tapping inside it */}
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    <View style={styles.dragHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Quick Add</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="x" size={18} color="#334155" />
                        </TouchableOpacity>
                    </View>

                    {quickAddItems.map((item) => (
                        <TouchableOpacity
                            key={item.title}
                            style={[styles.listItem, !item.enabled && styles.listItemDisabled]}
                            onPress={() => {
                                if (item.enabled && item.route) {
                                    onClose();
                                    onNavigate(item.route);
                                }
                            }}
                            disabled={!item.enabled}
                        >
                            <View style={[styles.iconBadge, { backgroundColor: item.color + '22' }]}>
                                <Icon name={item.icon} size={20} color={item.color} />
                            </View>
                            <View style={styles.listItemText}>
                                <Text style={styles.listItemTitle}>{item.title}</Text>
                                <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Icon name="chevron-right" size={20} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 30,
        maxHeight: '80%',
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginBottom: 14,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textDark,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
    },
    listItemDisabled: {
        opacity: 0.5,
    },
    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    listItemText: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textDark,
    },
    listItemSubtitle: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2,
    },
});