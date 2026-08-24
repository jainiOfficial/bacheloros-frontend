import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';
export default function DashboardScreen() {

  const { userDetails } = useAuth();
  const allModules = ['Finance', 'Documents', 'Home', 'Kitchen', 'Health', 'Goals'];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIconWrapper}>
            <Icon name="graduation-cap" size={30} color="#000" />
          </View>
          <Text style={styles.logo}>
            Bachelor<Text style={styles.logoBlue}>OS</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.bellWrapper}>
          <Icon name="bell" size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <Text style={styles.greeting}>
        {getGreeting()}, {userDetails?.name ?? ''} 👋
      </Text>
      <Text style={styles.subGreeting}>Let's finish your tasks for today!</Text>

      {/* Today's Focus - placeholder */}
      <View style={styles.focusCard}>
        <Image
          source={require('../../assets/images/dashborad-screen-todays-focus-bg-img.jpeg')}
          style={styles.focusImage}
          resizeMode="cover"
        />
        <View style={styles.focusOverlay}>
          <Text style={styles.focusTitle}>🎯 Today's Focus</Text>
          <Text style={styles.placeholderTextLight}>Coming soon</Text>
        </View>
      </View>

      {/* My Life Modules - placeholder grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Life Modules</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All ›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.moduleGrid}>
        {allModules.slice(0, 3).map((mod) => (
          <View key={mod} style={styles.moduleCard}>
            <Text style={styles.moduleText}>{mod}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming - placeholder */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming</Text>
        <Text style={styles.placeholderText}>Coming soon</Text>
      </View>

      {/* AI Assistant - placeholder */}
      <View style={styles.aiCard}>
        <Text style={styles.cardTitle}>🤖 AI Assistant</Text>
        <Text style={styles.placeholderText}>Coming soon</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 75,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconWrapper: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bellWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBlue: {
    color: '#2563EB',
  },
  bellIcon: {
    fontSize: 22,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  subGreeting: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 20,
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moduleCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  focusContent: {
    flex: 1,
  },
  placeholderTextLight: {
    fontSize: 13,
    color: '#C7D2FE',
  },
  focusCardImage: {
    borderRadius: 18,
  },
  focusCard: {
    borderRadius: 18,
    marginBottom: 24,
    minHeight: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  focusImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  focusOverlay: {
    padding: 18,
    flex: 1,
    justifyContent: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#38393a',
    marginBottom: 12,
  },
});