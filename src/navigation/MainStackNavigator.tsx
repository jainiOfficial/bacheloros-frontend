import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import AddExpenseScreen from '../screens/finance/AddExpenseScreen';
import AddBillScreen from '../screens/finance/AddBillScreen';
import BillScreen from '../screens/finance/BillScreen';
import BillDetailsScreen from  '../screens/finance/BillDetailsScreen';
import BillPaidSuccessScreen from '../screens/finance/BillPaidSuccessScreen';
import ExpenseScreen from '../screens/finance/ExpenseScreen';
import ExpenseDetailsScreen from '../screens/finance/ExpenseDetailsScreen';
import AddMonthlyBudgetScreen from '../screens/finance/AddMonthlyBudgetScreen';
import AddCategoryWiseMonthlyBudgetScreen from '../screens/finance/AddCategoryWiseMonthlyBudgetScreen';
import BudgetSetSuccessScreen from '../screens/finance/BudgetSetSuccessScreen';
import BudgetOverviewScreen from '../screens/finance/BudgetOverviewScreen';
import BudgetCategoryOverviewScreen from '../screens/finance/BudgetCategoryOverviewScreen';
import ViewAllCategoryBudget from '../screens/finance/ViewAllCategoryBudget';

type MainStackParamList = {
    mainTab: undefined;
    AddExpense: undefined;
    AddBill: undefined;
    Bills: undefined;
    BillDetails: undefined;
    BillPaidSuccess: undefined;
    Expenses:undefined;
    ExpenseDetails: undefined;
    AddMonthlyBudget: undefined;
    BudgetOverview: undefined;
    BudgetCategoryOverview: {
        category: string;
        allocatedAmount: number;
        spentAmount: number;
        remainingAmount: number;
        month: number;
        year: number;
    };
    ViewAllCategoryBudget: {
        month: number;
        year: number;
    };
    AddCategoryWiseMonthlyBudget: {
        month: number;
        year: number;
        totalAmount: number;
    };
    BudgetSetSuccess: {
        month: number;
        year: number;
        totalAmount: number;
    };
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
            <Stack.Screen name="Expenses" component={ExpenseScreen} options={{ presentation: 'modal' }}/>
            <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} />
            <Stack.Screen name="AddMonthlyBudget" component={AddMonthlyBudgetScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="AddCategoryWiseMonthlyBudget" component={AddCategoryWiseMonthlyBudgetScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="BudgetSetSuccess" component={BudgetSetSuccessScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="BudgetOverview" component={BudgetOverviewScreen} />
            <Stack.Screen name="BudgetCategoryOverview" component={BudgetCategoryOverviewScreen} />
            <Stack.Screen name="ViewAllCategoryBudget" component={ViewAllCategoryBudget} />
        </Stack.Navigator>
    )
}