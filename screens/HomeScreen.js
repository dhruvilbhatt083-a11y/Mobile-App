import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import Card from '../components/Card';
import Button from '../components/Button';

const HomeScreen = ({ navigation }) => {
  const stats = [
    { title: 'Available Cars', value: '24', icon: 'car', color: COLORS.primary },
    { title: 'Active Rentals', value: '8', icon: 'checkmark-circle', color: COLORS.success },
    { title: 'Total Earnings', value: '$1,250', icon: 'wallet', color: COLORS.warning },
  ];

  const recentActivity = [
    { id: 1, car: 'Toyota Camry', action: 'Rented', time: '2 hours ago', status: 'active' },
    { id: 2, car: 'Honda Civic', action: 'Returned', time: '5 hours ago', status: 'completed' },
    { id: 3, car: 'BMW X5', action: 'Booked', time: '1 day ago', status: 'pending' },
  ];

  const StatCard = ({ item }) => (
    <Card style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
    </Card>
  );

  const ActivityItem = ({ item }) => (
    <TouchableOpacity style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Ionicons 
          name="car" 
          size={20} 
          color={item.status === 'active' ? COLORS.success : COLORS.textSecondary} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityCar}>{item.car}</Text>
        <Text style={styles.activityAction}>{item.action}</Text>
      </View>
      <View style={styles.activityTime}>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userName}>John Driver</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {stats.map((item, index) => (
            <StatCard key={index} item={item} />
          ))}
        </View>

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Cars')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="search" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Browse Cars</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('AddCar')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>List Car</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="settings" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentActivity.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </Card>

        {/* Featured Cars */}
        <Card style={styles.featuredCard}>
          <Text style={styles.sectionTitle}>Featured Cars</Text>
          <TouchableOpacity 
            style={styles.featuredCar}
            onPress={() => navigation.navigate('CarDetail')}
          >
            <View style={styles.featuredCarImage}>
              <Ionicons name="car" size={40} color={COLORS.primary} />
            </View>
            <View style={styles.featuredCarInfo}>
              <Text style={styles.featuredCarName}>Mercedes-Benz C-Class</Text>
              <Text style={styles.featuredCarPrice}>$85/day</Text>
              <Text style={styles.featuredCarRating}>⭐ 4.8 (124 reviews)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  header: {
    marginBottom: SIZES.padding * 2,
  },
  welcomeText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  userName: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding * 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.padding,
    marginHorizontal: SIZES.base / 2,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.base,
  },
  statValue: {
    ...FONTS.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.base / 4,
  },
  statTitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  quickActionsCard: {
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: SIZES.padding,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.padding,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.base,
  },
  quickActionText: {
    ...FONTS.body3,
    textAlign: 'center',
  },
  activityCard: {
    marginBottom: SIZES.padding,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  viewAllText: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding,
  },
  activityContent: {
    flex: 1,
  },
  activityCar: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  activityAction: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  activityTime: {
    marginLeft: SIZES.base,
  },
  timeText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  featuredCard: {
    marginBottom: SIZES.padding,
  },
  featuredCar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredCarImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding,
  },
  featuredCarInfo: {
    flex: 1,
  },
  featuredCarName: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: SIZES.base / 4,
  },
  featuredCarPrice: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SIZES.base / 4,
  },
  featuredCarRating: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
