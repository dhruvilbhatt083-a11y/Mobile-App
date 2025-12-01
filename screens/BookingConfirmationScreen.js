import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { createBooking } from '../services/bookingsService';

const BookingConfirmationScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();

  const {
    car,
    pickupDate,
    pickupTime,
    durationDays = 1,
    notes = '',
    bookingId: existingBookingId,
    depositPaid = true,
    depositAmount: incomingDepositAmount,
    paymentMode = 'pending',
  } = route.params || {};

  const [bookingId, setBookingId] = useState(existingBookingId || null);
  const [hasSaved, setHasSaved] = useState(!!existingBookingId);

  // 🔁 Create booking in Firestore when this screen opens (only once)
  useEffect(() => {
    const saveBooking = async () => {
      // already saved or no car -> do nothing
      if (hasSaved || !car) return;

      try {
        const bookingData = {
          // TEMP: hard-coded IDs so we can test
          userId: 'user_001',          // driver
          ownerId: 'owner_001',        // owner
          carId: car.id || 'car_001',

          // car info (just for convenience)
          carName: car.name || car.title || 'Booked car',
          imageUrl: car.image || car.imageUrl || '',

          // booking info
          bookingDate: pickupDate || '2025-11-22',
          bookingTime: pickupTime || '08:00 AM',
          price: car.priceNumeric || car.price || '900',

          status: 'pending',
          paymentStatus: 'unpaid',
          paymentMethod: 'pending',
          cancelled: false,
          completed: false,

          notes,
        };

        console.log('📩 Saving booking from confirmation screen:', bookingData);

        const newId = await createBooking(bookingData);

        console.log('✅ Booking saved with ID:', newId);
        setBookingId(newId);
        setHasSaved(true);
      } catch (error) {
        console.error('❌ Error saving booking from confirmation screen:', error);
      }
    };

    saveBooking();
  }, [hasSaved, car, pickupDate, pickupTime, notes]);

  const displayDateTime = pickupDate && pickupTime ? `${pickupDate} — ${pickupTime}` : '';
  const dailyPriceText = car?.price || '₹0/day';
  const safeDepositAmount = Number.isFinite(Number(incomingDepositAmount))
    ? Number(incomingDepositAmount)
    : 0;
  const isDepositPaid = !!depositPaid;
  const depositText = safeDepositAmount
    ? `₹${safeDepositAmount.toLocaleString('en-IN')}`
    : 'the deposit';
  const isCashPickup = paymentMode === 'cash_at_pickup';
  const statusText = isDepositPaid ? 'Confirmed' : 'Pending deposit';
  const statusPillStyle = isDepositPaid ? styles.statusPill : [styles.statusPill, styles.statusPillPending];
  const statusDotStyle = isDepositPaid ? styles.statusDot : [styles.statusDot, styles.statusDotPending];
  const statusTextStyle = isDepositPaid ? styles.statusText : [styles.statusText, styles.statusTextPending];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <View style={[styles.inner, { paddingBottom: Math.max(insets.bottom + 16, SIZES.padding * 2) }]}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <Ionicons name="checkmark" size={38} color={COLORS.background} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>{isDepositPaid ? 'Booking Confirmed!' : 'Deposit Pending'}</Text>
        <Text style={styles.subtitle}>
          {isDepositPaid
            ? 'Your car is booked successfully. The owner will contact you shortly.'
            : `We’re holding your booking, but the owner will only release the car after you hand over ${depositText} in cash during pickup.`}
        </Text>

        <View style={styles.card}>
          <Text style={styles.carName}>{car?.name || 'Car Name'}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>Booking Date & Time</Text>
              <Text style={styles.infoValue}>{displayDateTime || '20 Nov 2025 — 08:00 AM'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="pricetag-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>Rental Price</Text>
              <Text style={styles.priceValue}>{dailyPriceText}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={statusPillStyle}>
              <View style={statusDotStyle} />
              <Text style={statusTextStyle}>{statusText}</Text>
            </View>
          </View>
          {!isDepositPaid && (
            <View style={styles.warningBanner}>
              <Ionicons name="alert-circle" size={18} color="#b45309" style={{ marginRight: 8 }} />
              <Text style={styles.warningText}>
                Deposit not received. Carry {depositText} and pay it {isCashPickup ? 'in cash ' : ''}directly to the
                owner at pickup; otherwise the car won’t be handed over.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomArea}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.primaryButton}
            onPress={() => navigation.navigate('DriverHome')}
          >
            <Ionicons name="arrow-back" size={18} color={COLORS.background} style={styles.primaryIcon} />
            <Text style={styles.primaryLabel}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              navigation.navigate('BookingDetails', {
                car,
                pickupDate,
                pickupTime,
                durationDays,
                notes,
              });
            }}
          >
            <Text style={styles.linkText}>View Booking Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f7ff',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  iconWrapper: {
    marginTop: SIZES.padding * 2.2,
    marginBottom: SIZES.padding * 1.4,
  },
  iconCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e3f9ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#16c163',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...FONTS.h2,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.padding * 1.6,
    maxWidth: 260,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding * 0.9,
    shadowColor: '#a6bde2',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  carName: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: SIZES.padding,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base * 1.2,
  },
  infoIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e7f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.base,
  },
  infoTextBlock: {
    flex: 1,
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  infoValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  priceValue: {
    ...FONTS.body2,
    color: '#1f7cff',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e3e8f3',
    marginVertical: SIZES.padding * 0.8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e4f9ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillPending: {
    backgroundColor: '#fef3c7',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16c163',
    marginRight: 6,
  },
  statusDotPending: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    ...FONTS.body3,
    color: '#16c163',
    fontWeight: '600',
  },
  statusTextPending: {
    color: '#b45309',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  warningText: {
    flex: 1,
    ...FONTS.body3,
    color: '#b45309',
    lineHeight: 18,
  },
  bottomArea: {
    marginTop: SIZES.padding * 2,
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#1f7cff',
    borderRadius: 999,
    paddingVertical: SIZES.base * 1.2,
    marginBottom: SIZES.base,
  },
  primaryIcon: {
    marginRight: 6,
  },
  primaryLabel: {
    ...FONTS.body1,
    color: COLORS.background,
    fontWeight: '700',
  },
  linkText: {
    ...FONTS.body3,
    color: '#1f7cff',
    textDecorationLine: 'underline',
  },
});

export default BookingConfirmationScreen;
