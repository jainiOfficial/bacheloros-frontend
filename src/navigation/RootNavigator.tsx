import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import MainStackNavigator from './MainStackNavigator';

export default function RootNavigator() {
    const { isLoggedIn, isLoading } = useAuth();
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );  // or a loading spinner
    }

    return (
        <NavigationContainer>
            {isLoggedIn ? <MainStackNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}