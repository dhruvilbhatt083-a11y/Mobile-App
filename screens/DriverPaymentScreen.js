// src/screens/DriverPaymentScreen.js

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { getFirestore, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../src/context/AuthContext';

const db = getFirestore();

/**
 * Atomically mark deposit as paid and move booking to 'in_use'.
 * bookingId: string, method: 'cash_at_pickup'|'online', userId: id of actor
 */
async function markDepositPaidAndStartRental(bookingId, method = 'cash_at_pickup', userId = 'system') {
  const ref = doc(db, 'bookings', bookingId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Booking not found');
    const data = snap.data();

    // Build new payment object
    const payment = {
      ...(data.payment || {}),
      depositMethod: method,
      depositPaid: true,
    };

    // Append statusHistory entry
    const from = data.status || null;
    const history = [
      ...(data.statusHistory || []),
      {
        from,
        to: 'in_use',
        changedBy: userId,
        changedAt: serverTimestamp(),
        note: 'Deposit collected — starting rental',
      },
    ];

    tx.update(ref, {
      payment,
      status: 'in_use',
      statusHistory: history,
      lastStatusChangeAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

const DriverPaymentScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const {
    bookingId,
    car,
    bookingDate,
    bookingTime,
    durationDays,
    depositAmount: paramDepositAmount,
  } = route?.params || {};

  const dailyRateRaw =
    car?.driverPricePerDay ??
    car?.pricePerDay ??
    (typeof car?.price === 'string'
      ? Number(car.price.replace(/[^\d.]/g, ''))
      : car?.price ?? 0);

  const dailyRate = Number.isFinite(dailyRateRaw) ? dailyRateRaw : 0;
  const safeDuration = Number.isFinite(durationDays) ? durationDays : 5;
  const depositAmount =
    typeof paramDepositAmount === 'number'
      ? paramDepositAmount
      : Number(car?.depositAmount || 0);
  const totalRentEstimate = dailyRate * safeDuration;
  const carName = car?.name || car?.title || car?.carName || 'Selected car';

  const [onlineLoading, setOnlineLoading] = useState(false);
  const [cashLoading, setCashLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canProceed = !!bookingId;

  const handlePayOnline = () => {
    if (!bookingId) {
      setErrorMsg('Something is missing in this booking. Please go back and try again.');
      return;
    }

    setErrorMsg('');

    navigation.navigate('OnlinePayment', {
      bookingId,
      car,
      bookingDate,
      bookingTime,
      durationDays: safeDuration,
      depositAmount,
    });
  };

  const handleCashAtPickup = async () => {
    if (!canProceed) return;
    setErrorMsg('');
    setCashLoading(true);

    try {
      const currentUserId = user?.id || user?.uid || 'driver_app';
      await markDepositPaidAndStartRental(bookingId, 'cash_at_pickup', currentUserId);

      navigation.replace('BookingConfirmation', {
        bookingId,
        car,
        pickupDate: bookingDate,
        pickupTime: bookingTime,
        durationDays: safeDuration,
        depositAmount,
        depositPaid: false,
        paymentMode: 'cash_at_pickup',
      });
    } catch (err) {
      console.log('❌ Error updating booking for cash deposit:', err);
      setErrorMsg('Could not mark your cash deposit choice. Please try again.');
    } finally {
      setCashLoading(false);
    }
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
        <Text style={styles.headerTitle}>Confirm Deposit & Payment</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.sectionLabel}>Booking summary</Text>
          <Text style={styles.carName}>{carName}</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Start date</Text>
            <Text style={styles.value}>{bookingDate || 'Not set'}</Text>
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
              {safeDuration} day{safeDuration > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>Price details</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Daily rent (driver)</Text>
            <Text style={styles.value}>
              ₹{dailyRate.toLocaleString('en-IN')}/day
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Approx. rent for {safeDuration} days</Text>
            <Text style={styles.mutedValue}>
              ~₹{totalRentEstimate.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Refundable deposit</Text>
            <Text style={styles.value}>
              ₹{depositAmount.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.infoBadge, { marginTop: 10 }]}
          >
            <Ionicons name="information-circle-outline" size={16} color="#1d4ed8" />
            <Text style={styles.infoBadgeText}>
              Deposit is fully refundable by the owner when the car is returned in
              good condition.
            </Text>
          </View>
        </View>

        <View style={styles.noticeBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#4b5563" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.noticeTitle}>How payment works</Text>
            <Text style={styles.noticeText}>
              1) Pay or commit the deposit now. 2) Owner confirms your booking. 3)
              You settle the daily rent directly with the owner as per your agreement.
            </Text>
          </View>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!canProceed || onlineLoading) && styles.disabledButton,
            ]}
            onPress={handlePayOnline}
            disabled={!canProceed || onlineLoading || cashLoading}
            activeOpacity={0.85}
          >
            {onlineLoading ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <>
                <Ionicons
                  name="card-outline"
                  size={18}
                  color={COLORS.background}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.primaryLabel}>Pay deposit online</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (!canProceed || cashLoading) && styles.disabledSecondary,
            ]}
            onPress={handleCashAtPickup}
            disabled={!canProceed || onlineLoading || cashLoading}
            activeOpacity={0.9}
          >
            {cashLoading ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              <>
                <Ionicons
                  name="cash-outline"
                  size={18}
                  color="#111827"
                  style={{ marginRight: 6 }}
                />
                <View>
                  <Text style={styles.secondaryLabel}>Pay cash at pickup</Text>
                  <Text style={styles.secondarySubLabel}>
                    Booking stays on hold until deposit is handed over.
                  </Text>
                </View>
              </>
            )}
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
  summaryCard: {
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
  mutedValue: {
    ...FONTS.body3,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e0ecff',
    borderRadius: 12,
    padding: 8,
  },
  infoBadgeText: {
    ...FONTS.body4,
    color: '#1d4ed8',
    marginLeft: 6,
    flex: 1,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SIZES.padding,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noticeTitle: {
    ...FONTS.body3,
    fontWeight: '600',
    marginBottom: 2,
  },
  noticeText: {
    ...FONTS.body4,
    color: '#4b5563',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    ...FONTS.body4,
    color: '#b91c1c',
    marginLeft: 6,
    flex: 1,
  },
  actionsContainer: {
    marginTop: SIZES.padding * 1.5,
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
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
  },
  secondaryLabel: {
    ...FONTS.body2,
    color: '#111827',
    fontWeight: '600',
  },
  secondarySubLabel: {
    ...FONTS.body4,
    color: '#6b7280',
    marginTop: 2,
  },
  disabledSecondary: {
    opacity: 0.6,
  },
});

export default DriverPaymentScreen;
