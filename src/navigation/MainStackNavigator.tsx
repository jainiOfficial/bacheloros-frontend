import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import AddExpenseScreen from '../screens/finance/AddExpenseScreen';
import AddBillScreen from '../screens/finance/AddBillScreen';
import BillScreen from '../screens/finance/BillScreen';
import BillDetailsScreen from  '../screens/finance/BillDetailsScreen';
import BillPaidSuccessScreen from '../screens/finance/BillPaidSuccessScreen';

type MainStackParamList = {
    mainTab: undefined;
    AddExpense: undefined;
    AddBill: undefined;
    Bills: undefined;
    BillDetails: undefined;
    BillPaidSuccess: undefined;
};
const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="mainTab" component={MainTabNavigator} />
            <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="AddBill" component={AddBillScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Bills" component={BillScreen} />
            <Stack.Screen name="BillDetails" component={BillDetailsScreen} />
            <Stack.Screen name="BillPaidSuccess" component={BillPaidSuccessScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
    )
}