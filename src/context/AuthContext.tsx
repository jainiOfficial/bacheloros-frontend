import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/api/client';


const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    const loadToken = async () => {
      // logout(); // Clear any existing token on app start
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        await fetchUser();
      }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const login = async (newToken: string) => {
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
    await fetchUser();
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  const fetchUser=async () => {
    try {
      console.log('Fetching user details...');
      const response = await apiClient.get('/users/me');
      console.log('User details fetched:', response.data);
      setUserDetails(response.data);
    } catch (error: any) {
      console.error('Error fetching user details:', error.response?.status, error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, isLoading, login, logout, userDetails }}>
      {children}
    </AuthContext.Provider>
  );
}
//store ka use kar rahe iss function se
export function useAuth() {
  return useContext(AuthContext);
}