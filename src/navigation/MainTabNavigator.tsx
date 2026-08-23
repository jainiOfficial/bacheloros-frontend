import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import React from 'react'
import ProfileScreen from '../screens/ProfileScreen'
import MoreScreen from '../screens/MoreScreen'
import FinanceScreen from '../screens/FinanceScreen'
import DashboardScreen from '../screens/DashboardScreen'

const Tab = createBottomTabNavigator()

export default function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Finance" component={FinanceScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}