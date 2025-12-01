import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const RoleSelectionScreen = ({ navigation }) => {
  const handleSelectRole = (role) => {
    if (role === 'driver') {
      navigation.navigate('MobileOtpLogin', { userRole: 'Driver' });
    } else {
      navigation.navigate('MobileOtpLogin', { userRole: 'Owner' });
    }
  };

  return (
    <LinearGradient colors={["#f7fbff", "#eef4ff"]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.contentWrapper}>
            <Text style={styles.appName}>UrbanFleet X</Text>
            <Text style={styles.subtitle}>Choose how you want to use the app</Text>

            <View style={styles.cardStack}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.roleCard}
                onPress={() => handleSelectRole('driver')}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="car-sport" size={28} color={COLORS.background} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>I am a Driver</Text>
                  <Text style={styles.cardDescription}>Find cars on daily rental</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#1f7cff" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.roleCard}
                onPress={() => handleSelectRole('owner')}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="key" size={26} color={COLORS.background} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>I am a Car Owner</Text>
                  <Text style={styles.cardDescription}>List your car and earn daily</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#1f7cff" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footerText}>
            By continuing, you agree to our <Text style={styles.footerLink}>Terms & Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 320,
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  contentWrapper: {
    flexGrow: 1,
    paddingTop: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    ...FONTS.h1,
    color: '#1f7cff',
    marginBottom: SIZES.base * 0.5,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding * 1.8,
    textAlign: 'center',
  },
  cardStack: {
    width: '100%',
    gap: SIZES.padding,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    borderRadius: 24,
    shadowColor: '#a7c6ff',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 5,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#1f7cff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  footerText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.padding * 2.5,
  },
  footerLink: {
    color: '#1f7cff',
    fontWeight: '600',
  },
});

export default RoleSelectionScreen;
