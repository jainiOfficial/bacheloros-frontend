import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, StyleSheet, Modal, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import PlannerScreen from '../screens/planner/PlannerScreen';
import AIAssistantScreen from '../screens/ai/AIAssistantScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import QuickAddModal from '../components/modals/QuickAddModal';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import HomeStackNavigator from './HomeStackNavigator';

const Tab = createBottomTabNavigator();

function AddPlaceholder() {
  return null;
}

export default function MainTabNavigator({navigation}: any) {
  const [menuVisible, setMenuVisible] = useState(false);
  // const navigation = useNavigation<any>();

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#94A3B8',
        }}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator}options={{
            tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
          }}  />
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
      <QuickAddModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={(route) => navigation.navigate(route)}
      />
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});