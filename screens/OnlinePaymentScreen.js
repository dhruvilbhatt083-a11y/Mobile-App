import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const OnlinePaymentScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();

  const {
    bookingId,
    car,
    bookingDate,
    bookingTime,
    durationDays,
    depositAmount,
  } = route?.params || {};

  const carName = car?.name || car?.title || car?.carName || 'Selected car';
  const safeDeposit =
    typeof depositAmount === 'number' ? depositAmount : Number(car?.depositAmount || 0);

  const handleOpenRazorpay = () => {
    const url = 'https://razorpay.com/';
    Linking.openURL(url).catch((err) => {
      console.log('Error opening Razorpay:', err);
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Deposit Online</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Booking</Text>
          <Text style={styles.carName}>{carName}</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.value}>{bookingId || '-'}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Start date</Text>
            <Text style={styles.value}>{bookingDate || '-'}</Text>
          </View>

          {bookingTime ? (
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Pickup time</Text>
              <Text style={styles.value}>{bookingTime}</Text>
            </View>
          ) : null}

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>
              {durationDays} day{durationDays > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>Deposit</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Refundable deposit</Text>
            <Text style={styles.value}>₹{safeDeposit.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#b45309" />
            <Text style={styles.infoText}>
              This screen is a placeholder. After full Razorpay integration, you will pay
              this deposit using UPI / card / netbanking and we will mark it as paid
              automatically.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.9}
            onPress={handleOpenRazorpay}
          >
            <Ionicons
              name="open-outline"
              size={18}
              color={COLORS.background}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.primaryLabel}>Continue to Razorpay (test)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryLabel}>Back to payment options</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SIZES.padding,
    shadowColor: '#9fb5d6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  sectionLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  carName: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  label: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  value: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  infoText: {
    ...FONTS.body4,
    color: '#92400e',
    marginLeft: 6,
    flex: 1,
  },
  actions: {
    marginTop: SIZES.padding * 1.8,
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f7cff',
    borderRadius: 999,
    paddingVertical: SIZES.base * 1.2,
  },
  primaryLabel: {
    ...FONTS.body1,
    color: COLORS.background,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryLabel: {
    ...FONTS.body3,
    color: '#4b5563',
    textDecorationLine: 'underline',
  },
});

export default OnlinePaymentScreen;
