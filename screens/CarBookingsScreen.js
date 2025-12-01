// src/screens/CarBookingsScreen.js

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import {
  getBookingsByOwner,
  updateBookingStatus,
  updateBookingPayment,
} from '../services/bookingsService';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const CarBookingsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();

  const carId = route?.params?.carId || null;
  const carTitle = route?.params?.carTitle || 'Car';
  const plateNumber = route?.params?.plateNumber || '';

  const ownerId = 'owner_001';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading bookings for owner:', ownerId);
      const allOwnerBookings = await getBookingsByOwner(ownerId);
      console.log('🔥 Owner bookings in CarBookingsScreen:', allOwnerBookings);

      const filtered =
        carId && Array.isArray(allOwnerBookings)
          ? allOwnerBookings.filter((b) => b.carId === carId)
          : allOwnerBookings || [];

      setBookings(filtered);
    } catch (err) {
      console.error('❌ Error loading car bookings:', err);
      setError('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [ownerId, carId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handlePaymentUpdate = async (bookingId, method) => {
    try {
      if (!bookingId) return;
      setPaymentLoadingId(bookingId);
      await updateBookingPayment(bookingId, 'paid', method);
      await loadBookings();
    } catch (err) {
      console.error('❌ Error updating payment status:', err);
      alert('Failed to update payment status');
    } finally {
      setPaymentLoadingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    if (activeFilter === 'all') return bookings;

    return bookings.filter((booking) => {
      const status = (booking.status || '').toLowerCase();
      if (activeFilter === 'upcoming') {
        return status === 'pending';
      }
      if (activeFilter === 'ongoing') {
        return status === 'confirmed';
      }
      if (activeFilter === 'completed') {
        return status === 'completed';
      }
      if (activeFilter === 'cancelled') {
        return status === 'cancelled';
      }
      return true;
    });
  }, [bookings, activeFilter]);

  const hasBookings = useMemo(
    () => !loading && !error && filteredBookings.length > 0,
    [loading, error, filteredBookings],
  );

  const totalEarningsForCar = useMemo(() => {
    if (!bookings.length) return 0;
    return bookings.reduce((sum, booking) => {
      const payment = (booking.paymentStatus || '').toLowerCase();
      if (payment === 'paid') {
        const raw = typeof booking.price === 'string' ? booking.price : String(booking.price ?? '0');
        const numeric = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
        return sum + numeric;
      }
      return sum;
    }, 0);
  }, [bookings]);

  const renderStatusPill = (statusRaw) => {
    const status = (statusRaw || '').toLowerCase();
    let background = '#e4efff';
    let textColor = '#1f7cff';
    let label = 'Pending';

    if (status === 'confirmed') {
      background = '#dbeafe';
      textColor = '#1d4ed8';
      label = 'Confirmed';
    } else if (status === 'completed') {
      background = '#dcfce7';
      textColor = '#16a34a';
      label = 'Completed';
    } else if (status === 'cancelled') {
      background = '#fee2e2';
      textColor = '#b91c1c';
      label = 'Cancelled';
    }

    return (
      <View style={[styles.statusPill, { backgroundColor: background }]}>
        <Text style={[styles.statusPillText, { color: textColor }]}>
          {label}
        </Text>
      </View>
    );
  };

  // 🔹 Owner actions: confirm / complete / cancel
  const handleStatusChange = async (bookingId, currentStatus, targetStatus) => {
    try {
      if (!bookingId) return;
      setActionLoadingId(bookingId);

      console.log(
        `🔁 Changing booking ${bookingId} status from ${currentStatus} → ${targetStatus}`,
      );

      await updateBookingStatus(bookingId, targetStatus);

      // Update local state so UI reflects change immediately
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: targetStatus,
                cancelled: targetStatus === 'cancelled',
                completed: targetStatus === 'completed',
              }
            : b,
        ),
      );
    } catch (err) {
      console.error('❌ Error updating booking status:', err);
      alert('Failed to update booking status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderActionsForBooking = (booking) => {
    const status = (booking.status || '').toLowerCase();
    const isBusy = actionLoadingId === booking.id;

    if (status === 'completed' || status === 'cancelled') {
      return null;
    }

    return (
      <View style={styles.actionsRow}>
        {status === 'pending' && (
          <>
            <TouchableOpacity
              style={styles.primaryAction}
              disabled={isBusy}
              onPress={() =>
                handleStatusChange(booking.id, status, 'confirmed')
              }
            >
              <Text style={styles.primaryActionText}>
                {isBusy ? 'Updating…' : 'Confirm Booking'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              disabled={isBusy}
              onPress={() =>
                handleStatusChange(booking.id, status, 'cancelled')
              }
            >
              <Text style={styles.secondaryActionText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <TouchableOpacity
              style={styles.primaryAction}
              disabled={isBusy}
              onPress={() =>
                handleStatusChange(booking.id, status, 'completed')
              }
            >
              <Text style={styles.primaryActionText}>
                {isBusy ? 'Updating…' : 'Mark Completed'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              disabled={isBusy}
              onPress={() =>
                handleStatusChange(booking.id, status, 'cancelled')
              }
            >
              <Text style={styles.secondaryActionText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const renderBookingCard = (booking) => {
    const driverLabel =
      booking.driverName || booking.userName || booking.userId || 'Driver';
    const driverPhone = booking.driverPhone || booking.userPhone || '';
    const canChatStatuses = ['pending', 'confirmed'];
    const showContactRow = canChatStatuses.includes((booking.status || '').toLowerCase());
    const paymentStatus = (booking.paymentStatus || 'unpaid').toLowerCase();
    const paymentMethod = booking.paymentMethod || 'pending';
    const paymentBusy = paymentLoadingId === booking.id;
    const formattedDate = booking.bookingDate || '--';
    const formattedTime = booking.bookingTime || '--';
    const duration = booking.duration || booking.bookingDuration || '1 Day Rental';
    const priceLabel = booking.price ? `₹${booking.price}/day` : '₹0/day';

    return (
      <View key={booking.id} style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{`Driver: ${driverLabel}`}</Text>
            {driverPhone ? (
              <Text style={styles.cardSubline}>{driverPhone}</Text>
            ) : null}
            <Text style={styles.cardSubline}>
              {carTitle} {plateNumber ? `• ${plateNumber}` : ''}
            </Text>
          </View>
          {renderStatusPill(booking.status)}
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{formattedTime}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{duration}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={[styles.detailValue, { color: '#0066ff' }]}>{priceLabel}</Text>
          </View>
        </View>

        <View style={styles.paymentMetaRow}>
          <Text style={styles.metaLabel}>Payment</Text>
          <Text style={styles.metaValue}>
            {paymentStatus.toUpperCase()} ({paymentMethod})
          </Text>
        </View>

        {paymentStatus !== 'paid' && (
          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                styles.paymentButtonCash,
                paymentBusy && styles.paymentButtonDisabled,
              ]}
              disabled={paymentBusy}
              onPress={() => handlePaymentUpdate(booking.id, 'cash')}
            >
              <Ionicons name="cash-outline" size={16} color="#166534" />
              <Text style={styles.paymentButtonText}>
                {paymentBusy ? 'Updating…' : 'Mark Paid (Cash)'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                styles.paymentButtonOnline,
                paymentBusy && styles.paymentButtonDisabled,
              ]}
              disabled={paymentBusy}
              onPress={() => handlePaymentUpdate(booking.id, 'online')}
            >
              <Ionicons name="card-outline" size={16} color="#1d4ed8" />
              <Text style={styles.paymentButtonText}>
                {paymentBusy ? 'Updating…' : 'Mark Paid (Online)'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {showContactRow && (
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaButtonPrimary]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('ChatWithDriver', {
                  bookingId: booking.id,
                  carName: carTitle,
                  driverName: driverLabel,
                  driverPhone,
                  userId: booking.userId || booking.driverId,
                  ownerId: booking.ownerId || ownerId,
                })
              }
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#0066FF" />
              <Text style={[styles.ctaText, { color: '#0066FF' }]}>Chat Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaButtonPrimary]}
              activeOpacity={0.85}
              disabled={!driverPhone}
              onPress={() => driverPhone && Linking.openURL(`tel:${driverPhone}`)}
            >
              <Ionicons name="call-outline" size={16} color="#0066FF" />
              <Text style={[styles.ctaText, { color: '#0066FF' }]}>
                {driverPhone ? 'Call Driver' : 'No phone'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {renderActionsForBooking(booking)}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Car Bookings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.selectorCard}>
          <Text style={styles.selectorLabel}>Select Car</Text>
          <View style={styles.selectorField}>
            <Text style={styles.selectorValue}>
              {plateNumber ? `${carTitle} — ${plateNumber}` : carTitle}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6b7280" />
          </View>
        </View>

        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Total earnings on this car</Text>
          <Text style={styles.earningsAmount}>
            ₹{totalEarningsForCar.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={styles.filterTabsRow}>
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text
                  style={[styles.filterChipText, active && styles.filterChipTextActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.centerText}>Loading bookings…</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !hasBookings && (
          <View style={styles.centerBox}>
            <Ionicons name="calendar-outline" size={40} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>
              When drivers book this car, you’ll see them listed here.
            </Text>
          </View>
        )}

        {!loading && !error && hasBookings && (
          <View style={{ gap: 12 }}>
            {filteredBookings.map(renderBookingCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 10,
  },
  paymentButtonCash: {
    backgroundColor: '#ecfdf5',
  },
  paymentButtonOnline: {
    backgroundColor: '#eef2ff',
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  paymentButtonText: {
    ...FONTS.body3,
    fontWeight: '600',
    color: '#111827',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  headerSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  errorText: {
    ...FONTS.body3,
    color: '#b91c1c',
    textAlign: 'center',
  },
  emptyTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginTop: 10,
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: SIZES.padding * 2,
    gap: 14,
  },
  selectorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  selectorLabel: {
    ...FONTS.body3,
    color: '#6b7280',
    marginBottom: 8,
  },
  selectorField: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorValue: {
    ...FONTS.body2,
    color: '#111827',
  },
  earningsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  earningsLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  earningsAmount: {
    ...FONTS.h3,
    marginTop: 6,
    color: '#1f7cff',
  },
  filterTabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#1f7cff',
  },
  filterChipText: {
    ...FONTS.body3,
    color: '#4b5563',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  cardSubline: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  detailColumn: {
    width: '48%',
  },
  detailLabel: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...FONTS.body2,
    marginTop: 2,
  },
  paymentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  metaLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  metaValue: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  ctaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#cfe1ff',
    backgroundColor: '#f1f5ff',
  },
  ctaButtonPrimary: {
    backgroundColor: '#f5f8ff',
  },
  ctaText: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  notesLine: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#1f7cff',
    paddingVertical: 8,
    alignItems: 'center',
  },
  primaryActionText: {
    ...FONTS.body3,
    color: COLORS.background,
    fontWeight: '600',
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryActionText: {
    ...FONTS.body3,
    color: '#4b5563',
    fontWeight: '600',
  },
});

export default CarBookingsScreen;
