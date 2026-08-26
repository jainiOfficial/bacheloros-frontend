import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/home/DashboardScreen';
import FinanceScreen from '../screens/finance/FinanceScreen';
import BillScreen from '../screens/finance/BillScreen';

export type HomeStackParamList = {
  Dashboard: undefined;
  Finance: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
        />
      <Stack.Screen name="Finance" component={FinanceScreen} />
      
      
    </Stack.Navigator>
  );
}