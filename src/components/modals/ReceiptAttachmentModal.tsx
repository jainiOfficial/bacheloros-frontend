import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ReceiptAttachmentModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.content} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Attach Receipt</Text>

          <TouchableOpacity style={styles.option}>
            <Icon name="camera" size={22} color={colors.primary} />
            <Text>Take a Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Icon name="image" size={22} color={colors.primary} />
            <Text>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Icon name="file" size={22} color={colors.primary} />
            <Text>Choose PDF</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
const styles = StyleSheet.create({
  receiptModalContent: {
  backgroundColor: colors.surface,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 20,
  paddingBottom: 32,
},

dragHandle: {
  width: 40,
  height: 4,
  borderRadius: 2,
  backgroundColor: colors.border,
  alignSelf: 'center',
  marginBottom: 18,
},

receiptTitle: {
  fontSize: 20,
  fontWeight: '800',
  color: colors.textDark,
  marginBottom: 16,
},

attachOption: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
  borderRadius: 14,
  backgroundColor: colors.background,
  marginBottom: 12,
},

attachOptionText: {
  marginLeft: 14,
  fontSize: 15,
  fontWeight: '600',
  color: colors.textDark,
},
overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },

  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 18,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.background,
    marginBottom: 12,
  },

  optionText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
}); 