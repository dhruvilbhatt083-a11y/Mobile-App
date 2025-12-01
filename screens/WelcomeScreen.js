import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';

const benefitCards = [
  {
    icon: '🚕',
    title: 'Daily Car Access',
    subtitle: 'Get taxi-ready cars instantly',
  },
  {
    icon: '💰',
    title: 'Earn Daily',
    subtitle: 'Work with Ola, Uber or private rides',
  },
  {
    icon: '🛡',
    title: 'Verified Owners',
    subtitle: 'All cars are verified and insured',
  },
];

const WelcomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const cards = useMemo(() => benefitCards, []);

  const handleStart = () => {
    navigation.navigate('DriverVerification');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <ScrollView
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBlock}>
          <Text style={styles.brandText}>UrbanFleet X</Text>
          <Text style={styles.mainTitle}>Welcome to UrbanFleet X</Text>
          <Text style={styles.subtitle}>Let’s get you started in just 2 minutes</Text>
        </View>

        <View style={styles.cardsStack}>
          {cards.map((card) => (
            <View key={card.title} style={styles.card}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>{card.icon}</Text>
              </View>
              <View style={styles.cardTextBlock}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 8, 24) }] }>
        <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
          <Text style={styles.primaryButtonLabel}>Start Registration</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFF',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  topBlock: {
    alignItems: 'center',
    marginTop: 60,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0066FF',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
  cardsStack: {
    marginTop: 24,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F3F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTextBlock: {
    flex: 1,
  },
  cardTitle: {
    ...FONTS.h4,
    color: '#0F172A',
  },
  cardSubtitle: {
    ...FONTS.body3,
    color: '#6B7280',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(249, 251, 255, 0.9)',
  },
  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
