import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import MobileOtpLoginScreen from '../screens/MobileOtpLoginScreen';
import OwnerRegistrationScreen from '../screens/OwnerRegistrationScreen';
import DriverVerificationScreen from '../screens/DriverVerificationScreen';
import VerificationStatusScreen from '../screens/VerificationStatusScreen';
import HomeScreen from '../screens/HomeScreen';
import CarListScreen from '../screens/CarListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DriverProfileScreen from '../src/screens/DriverProfileScreen';
import EditDriverProfileScreen from '../src/screens/EditDriverProfileScreen';
import DriverDocumentsScreen from '../src/screens/DriverDocumentsScreen';
import HelpSupportScreen from '../src/screens/HelpSupportScreen';
import DriverNotificationsScreen from '../src/screens/DriverNotificationsScreen';
import AddCarScreen from '../screens/AddCarScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import DriverHomeScreen from '../screens/DriverHomeScreen';
import BookingScreen from '../screens/BookingScreen';
import DriverPaymentScreen from '../screens/DriverPaymentScreen';
import OnlinePaymentScreen from '../screens/OnlinePaymentScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ChatWithOwnerScreen from '../screens/ChatWithOwnerScreen';
import ChatWithDriverScreen from '../screens/ChatWithDriverScreen';
import OwnerHomeDashboard from '../screens/OwnerHomeDashboard';
import OwnerBookingsScreen from '../screens/OwnerBookingsScreen';
import EditCarScreen from '../screens/EditCarScreen';
import AddNewCarScreen from '../screens/AddNewCarScreen';
import CarBookingsScreen from '../screens/CarBookingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cars') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'AddCar') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Cars" 
        component={CarListScreen}
        options={{ title: 'Available Cars' }}
      />
      <Tab.Screen 
        name="AddCar" 
        component={AddCarScreen}
        options={{ title: 'List Your Car' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RoleSelection" 
        component={RoleSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MobileOtpLogin" 
        component={MobileOtpLoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="OwnerRegistration" 
        component={OwnerRegistrationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DriverVerification" 
        component={DriverVerificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="VerificationStatus" 
        component={VerificationStatusScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DriverHome" 
        component={DriverHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CarDetail" 
        component={CarDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Booking" 
        component={BookingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DriverPayment" 
        component={DriverPaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="OnlinePayment" 
        component={OnlinePaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="BookingConfirmation" 
        component={BookingConfirmationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="BookingDetails" 
        component={BookingDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MyBookings" 
        component={MyBookingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DriverProfile" 
        component={DriverProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditDriverProfile" 
        component={EditDriverProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DriverDocuments" 
        component={DriverDocumentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={DriverNotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="OwnerHome" 
        component={OwnerHomeDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="OwnerBookings" 
        component={OwnerBookingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditCar" 
        component={EditCarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddNewCar" 
        component={AddNewCarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CarBookings" 
        component={CarBookingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ChatWithOwner" 
        component={ChatWithOwnerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ChatWithDriver" 
        component={ChatWithDriverScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
