import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, StyleSheet, Modal, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DashboardScreen from '../screens/DashboardScreen';
import PlannerScreen from '../screens/PlannerScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function AddPlaceholder() {
  return null;
}

export default function MainTabNavigator() {
  const [menuVisible, setMenuVisible] = useState(false);
  const quickAddItems = [
    { title: 'Add Expense', subtitle: 'Track your daily expenses', icon: 'dollar-sign', color: '#10B981', enabled: true },
    { title: 'Add Bill', subtitle: 'Add and manage your bills', icon: 'file-text', color: '#F59E0B', enabled: true },
    { title: 'Add Document', subtitle: 'Upload important documents', icon: 'file', color: '#3B82F6', enabled: false },
    { title: 'Add Grocery', subtitle: 'Add items to your list', icon: 'shopping-cart', color: '#F97316', enabled: false },
    { title: 'Create Reminder', subtitle: 'Set reminder for important tasks', icon: 'bell', color: '#8B5CF6', enabled: false },
    { title: 'Add Income', subtitle: 'Track your income', icon: 'trending-up', color: '#059669', enabled: false },
  ];

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#94A3B8',
        }}
      >
        <Tab.Screen
          name="Home"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Planner"
          component={PlannerScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Add"
          component={AddPlaceholder}
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                style={styles.addButtonWrapper}
                onPress={() => setMenuVisible(true)}
              >
                <View style={styles.addButton}>
                  <Icon name="plus" color="#FFFFFF" size={26} />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="AIAssistant"
          component={AIAssistantScreen}
          options={{
            title: 'AI Assistant',
            tabBarIcon: ({ color, size }) => <Icon name="cpu" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>

      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>//onStartShouldSetResponder prevents the modal from closing when tapping inside it
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quick Add</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeButton}>
                <Icon name="x" size={18} color="#334155" />
              </TouchableOpacity>
            </View>

            {quickAddItems.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={[styles.listItem, !item.enabled && styles.listItemDisabled]}
                onPress={() => item.enabled && setMenuVisible(false)}
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
    </>
  );
}

const styles = StyleSheet.create({
  addButtonWrapper: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 14,
  },
  modalContent: {
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#CBD5E1',
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
    color: '#0F172A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    color: '#0F172A',
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  plusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  menuCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },

});