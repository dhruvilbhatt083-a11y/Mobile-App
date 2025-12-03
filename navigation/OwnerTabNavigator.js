import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import OwnerHomeDashboard from '../screens/OwnerHomeDashboard';
import OwnerBookingsScreen from '../screens/OwnerBookingsScreen';
import OwnerProfileScreen from '../screens/OwnerProfileScreen';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();

const OwnerTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 6,
          height: 56 + Math.max(insets.bottom, 10),
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'OwnerHome') iconName = 'home-outline';
          else if (route.name === 'OwnerBookings') iconName = 'calendar-outline';
          else if (route.name === 'OwnerProfile') iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="OwnerHome" component={OwnerHomeDashboard} options={{ title: 'Home' }} />
      <Tab.Screen name="OwnerBookings" component={OwnerBookingsScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="OwnerProfile" component={OwnerProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default OwnerTabNavigator;
