import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { declareCashRentPayment } from '../services/bookingsService';

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '₹0';
  }
  return `₹${numeric.toLocaleString('en-IN')}`;
};

const BookingDetailsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    car,
    pickupDate,
    pickupTime,
    durationDays = 1,
    notes,
    rentDueAmount,
    rentStatus,
    totalEstimatedRent,
    bookingId,
    displayBookingCode,
    booking,
  } = route.params || {};

  const [payingOnline, setPayingOnline] = useState(false);
  const [declaringCash, setDeclaringCash] = useState(false);

  const durationLabel = durationDays === 1 ? '1 day' : `${durationDays} days`;
  const rentMeta = useMemo(() => {
    const rentDue = rentDueAmount ?? totalEstimatedRent ?? 0;
    const normalizedRentDue = Number.isFinite(Number(rentDue)) ? Math.max(Number(rentDue), 0) : 0;
    const status = (rentStatus || (normalizedRentDue === 0 ? 'paid' : 'unpaid')).toLowerCase();
    const badgeColor = status === 'paid' ? '#16c163' : status === 'partial' ? '#f59e0b' : '#ef4444';
    const badgeBackground = status === 'paid' ? '#ecfdf5' : status === 'partial' ? '#fff7ed' : '#fee2e2';
    const badgeText = status === 'paid' ? 'Rent Paid' : status === 'partial' ? 'Rent Partial' : 'Rent Unpaid';

    return {
      rentDue: normalizedRentDue,
      status,
      badgeColor,
      badgeBackground,
      badgeText,
      totalRent: totalEstimatedRent ?? normalizedRentDue,
    };
  }, [rentDueAmount, rentStatus, totalEstimatedRent]);

  const handlePayRentOnline = async () => {
    if (!bookingId) {
      Alert.alert('Missing booking', 'Booking reference not found, please reopen this booking.');
      return;
    }

    setPayingOnline(true);
    try {
      // Placeholder Razorpay trigger: integrate actual SDK/order creation later.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      Alert.alert(
        'Payment Pending Confirmation',
        'Online rent payment flow placeholder completed. Call your secure backend (recordRentPaymentPrecise) here.',
      );
    } catch (error) {
      console.error('Failed to trigger online rent payment', error);
      Alert.alert('Payment failed', 'Could not start online rent payment. Please try again.');
    } finally {
      setPayingOnline(false);
    }
  };

  const handleDeclareCashPayment = async () => {
    if (!bookingId) {
      Alert.alert('Missing booking', 'Booking reference not found, please reopen this booking.');
      return;
    }

    setDeclaringCash(true);
    try {
      const txnId = await declareCashRentPayment(bookingId, rentMeta.rentDue, 'driver');
      Alert.alert(
        'Cash payment declared',
        `We notified the admin about your cash payment intent. Transaction ID: ${txnId}`,
      );
    } catch (error) {
      console.error('Failed to declare cash payment', error);
      Alert.alert('Error', 'Could not declare cash payment. Please try again later.');
    } finally {
      setDeclaringCash(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.carCard}>
          {car?.image && <Image source={{ uri: car.image }} style={styles.carImage} />}
          <View style={styles.carCardBody}>
            <Text style={styles.carName}>{car?.name || 'Maruti Suzuki Dzire'}</Text>
            <Text style={styles.carPrice}>{car?.price || '₹900/day'}</Text>
            <Text style={styles.carMeta}>
              {(car?.fuel || 'Petrol') + '   ·   ' + (car?.year || '2019') + '   ·   ' + (car?.transmission || 'Manual')}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Booking Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Date</Text>
            </View>
            <Text style={styles.infoValue}>{pickupDate || '20 Nov 2025'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Time</Text>
            </View>
            <Text style={styles.infoValue}>{pickupTime || '08:00 AM'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="stopwatch-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Duration</Text>
            </View>
            <Text style={styles.infoValue}>{durationLabel}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoLabel}>Status</Text>
            </View>
            <View style={styles.statusPillBlue}>
              <Text style={styles.statusPillText}>Upcoming</Text>
            </View>
          </View>

          {displayBookingCode ? (
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="pricetag-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.infoLabel}>Booking ID</Text>
              </View>
              <Text style={styles.infoValue}>#{displayBookingCode}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Driver Notes</Text>
          <Text style={styles.notesText}>
            {notes && notes.trim().length > 0 ? notes : 'No additional notes added.'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Rent & Payment</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="wallet-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Total Estimated Rent</Text>
            </View>
            <Text style={styles.infoValue}>{formatCurrency(rentMeta.totalRent)}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Rent Status</Text>
            </View>
            <View
              style={[styles.rentStatusPill, { backgroundColor: rentMeta.badgeBackground }]}
            >
              <Text style={[styles.rentStatusText, { color: rentMeta.badgeColor }]}> 
                {rentMeta.badgeText}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="cash-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Amount Due</Text>
            </View>
            <Text style={[styles.infoValue, styles.infoValueStrong]}>
              {formatCurrency(rentMeta.rentDue)}
            </Text>
          </View>

          {booking?.rentDueBreakdown ? (
            <View style={styles.breakdownBox}>
              <Text style={styles.breakdownTitle}>Breakdown</Text>
              {booking.rentDueBreakdown.map((item, idx) => (
                <View key={`${item.label}-${idx}`} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={styles.breakdownValue}>{formatCurrency(item.amount)}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.actionFooter, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handlePayRentOnline}
          disabled={payingOnline}
        >
          <Ionicons name="card-outline" size={18} color="#ffffff" />
          <Text style={styles.actionButtonText}>
            {payingOnline ? 'Processing…' : 'Pay Rent Online'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleDeclareCashPayment}
          disabled={declaringCash || rentMeta.rentDue <= 0}
        >
          <Ionicons name="cash-outline" size={18} color="#1f2937" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            {declaringCash ? 'Submitting…' : 'I will pay cash'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: Math.max(insets.bottom, SIZES.base) }} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fc',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base * 1.2,
    backgroundColor: COLORS.background,
    shadowColor: '#a5b4cf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4e7f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  carCard: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: SIZES.padding,
    shadowColor: '#a6bde2',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  carImage: {
    width: '100%',
    height: 180,
  },
  carCardBody: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base * 1.2,
  },
  carName: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: 4,
  },
  carPrice: {
    ...FONTS.body1,
    color: '#1f7cff',
    fontWeight: '700',
    marginBottom: 4,
  },
  carMeta: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: '#c1d0ea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  sectionTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: SIZES.base,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.base,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  infoValue: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  statusPillBlue: {
    backgroundColor: '#e1edff',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    ...FONTS.body3,
    color: '#1f7cff',
    fontWeight: '600',
  },
  notesText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: SIZES.base,
    lineHeight: 20,
  },
  rentStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  rentStatusText: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  infoValueStrong: {
    fontWeight: '700',
    color: '#0f172a',
  },
  breakdownBox: {
    marginTop: SIZES.base,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: SIZES.base,
    backgroundColor: '#f9fafb',
  },
  breakdownTitle: {
    ...FONTS.body3,
    fontWeight: '600',
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  breakdownLabel: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    ...FONTS.body4,
    fontWeight: '600',
  },
  actionFooter: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
  },
  primaryButton: {
    backgroundColor: '#1f7cff',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  actionButtonText: {
    ...FONTS.body2,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#1f2937',
  },
});

export default BookingDetailsScreen;
