import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home', route: 'DriverHome' },
  {
    key: 'bookings',
    label: 'Bookings',
    icon: 'calendar-outline',
    iconActive: 'calendar',
    route: 'MyBookings',
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
    route: 'DriverProfile',
  },
];

const DriverBottomNav = ({ activeTab, navigation }) => {
  const insets = useSafeAreaInsets();

  const handleNavigate = (tab) => {
    if (!navigation?.navigate || activeTab === tab.key) return;
    navigation.navigate(tab.route);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => handleNavigate(tab)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={22}
              color={isActive ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e4e8f0',
    backgroundColor: COLORS.background,
  },
  tab: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default DriverBottomNav;
