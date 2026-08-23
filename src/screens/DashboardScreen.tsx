import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {

  const { userDetails } = useAuth();
  console.log('User details in DashboardScreen:', userDetails?.name || 'No user details available');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>user: {userDetails?.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
});