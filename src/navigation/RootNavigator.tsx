import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthNavigator from './AuthNavigator';
import MainStackNavigator from './MainStackNavigator';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, restoreSession, setLoading } from '../store/slices/authSlice';
import apiClient from '../services/api/client';

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  useEffect(() => {
    const loadSession = async () => {
      try {
        // await AsyncStorage.removeItem('token');
        const savedToken = await AsyncStorage.getItem('token');

        if (!savedToken) {
          dispatch(setLoading(false));
          return;
        }

        const response = await apiClient.get('/users/me');

        dispatch(
          restoreSession({
            token: savedToken,
            user: response.data ?? null,
          })
        );
      } catch (error: any) {
        console.error('Session restore failed:', error?.message ?? error);
        await AsyncStorage.removeItem('token');
        dispatch(logout());
      }
    };

    loadSession();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainStackNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}