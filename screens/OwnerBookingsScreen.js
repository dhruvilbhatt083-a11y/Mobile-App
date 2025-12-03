import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SIZES } from '../constants/theme';
import { useAuth } from '../src/context/AuthContext';
import {
  getBookingsByOwner,
  updateBookingPayment,
  updateBookingStatus,
} from '../services/bookingsService';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Upcoming' },
  { key: 'confirmed', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_META = {
  pending: { background: '#fff4e5', text: '#f97316', label: 'Upcoming' },
  confirmed: { background: '#dbeafe', text: '#1d4ed8', label: 'Ongoing' },
  completed: { background: '#dcfce7', text: '#15803d', label: 'Completed' },
  cancelled: { background: '#fee2e2', text: '#b91c1c', label: 'Cancelled' },
};

const OwnerBookingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const ownerId = user?.id;

  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);

  const loadBookings = useCallback(async () => {
    if (!ownerId) {
      setError('Owner not signed in.');
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const allBookings = await getBookingsByOwner(ownerId);
      setBookings(Array.isArray(allBookings) ? allBookings : []);
    } catch (err) {
      console.error("❌ Failed to load owner's bookings", err);
      setError('Failed to load bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  React.useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    if (activeFilter === 'all') {
      return bookings;
    }
    return bookings.filter((b) => (b.status || '').toLowerCase() === activeFilter);
  }, [bookings, activeFilter]);

  const handleStatusChange = async (bookingId, currentStatus, targetStatus) => {
    if (currentStatus === targetStatus) return;
    try {
      setActionLoadingId(bookingId);
      await updateBookingStatus(bookingId, targetStatus);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: targetStatus } : booking,
        ),
      );
    } catch (err) {
      console.error('Failed to update booking status', err);
      alert('Failed to update booking status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePaymentUpdate = async (bookingId, method) => {
    try {
      setPaymentLoadingId(bookingId);
      await updateBookingPayment(bookingId, 'paid', method);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, paymentStatus: 'paid', paymentMethod: method }
            : booking,
        ),
      );
    } catch (err) {
      console.error('Failed to update payment status', err);
      alert('Failed to update payment status.');
    } finally {
      setPaymentLoadingId(null);
    }
  };

  const handleChat = (booking) => {
    navigation.navigate('ChatWithDriver', {
      bookingId: booking.id,
      driverName: booking.driverName || booking.userName,
      driverPhone: booking.driverPhone || booking.userPhone,
      ownerId,
      userId: booking.userId,
    });
  };

  const handleCall = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const renderStatusPill = (statusRaw) => {
    const meta = STATUS_META[statusRaw] || STATUS_META.pending;
    return (
      <View style={[styles.statusPill, { backgroundColor: meta.background }]}>
        <Text style={[styles.statusPillText, { color: meta.text }]}>{meta.label}</Text>
      </View>
    );
  };

  const renderBookingCard = (booking) => {
    const status = (booking.status || '').toLowerCase();
    const isBusy = actionLoadingId === booking.id;
    const isPaying = paymentLoadingId === booking.id;
    const driverName = booking.driverName || booking.userName || 'Driver';
    const driverPhone = booking.driverPhone || booking.userPhone || '';
    const showContact = ['pending', 'confirmed'].includes(status);
    const priceText = booking.price ? `₹${booking.price}/day` : '₹0/day';

    return (
      <TouchableOpacity
        key={booking.id}
        activeOpacity={0.9}
        style={styles.card}
        onPress={() =>
          navigation.navigate('CarBookings', {
            carId: booking.carId,
            carTitle: booking.carName || booking.carTitle || 'Car',
            plateNumber: booking.plateNumber || booking.carPlate || '',
          })
        }
      >
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{driverName}</Text>
            {!!driverPhone && <Text style={styles.cardSubline}>{driverPhone}</Text>}
            <Text style={styles.cardSubline}>
              {booking.carName || booking.carTitle || 'Car'} • {booking.plateNumber || '—'}
            </Text>
          </View>
          {renderStatusPill(status)}
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{booking.bookingDate || '—'}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{booking.bookingTime || '—'}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{booking.duration || '1 day'}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={[styles.detailValue, { color: COLORS.primary }]}>{priceText}</Text>
          </View>
        </View>

        <View style={styles.paymentMetaRow}>
          <Text style={styles.metaLabel}>Payment</Text>
          <Text style={styles.metaValue}>
            {(booking.paymentStatus || 'unpaid').toUpperCase()} ({
              booking.paymentMethod || 'pending'
            })
          </Text>
        </View>

        {booking.paymentStatus !== 'paid' && (
          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[styles.paymentButton, styles.paymentButtonCash]}
              disabled={isPaying}
              onPress={() => handlePaymentUpdate(booking.id, 'cash')}
            >
              <Ionicons name="cash-outline" size={16} color="#166534" />
              <Text style={styles.paymentButtonText}>{isPaying ? 'Updating…' : 'Paid (Cash)'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentButton, styles.paymentButtonOnline]}
              disabled={isPaying}
              onPress={() => handlePaymentUpdate(booking.id, 'online')}
            >
              <Ionicons name="card-outline" size={16} color="#1d4ed8" />
              <Text style={styles.paymentButtonText}>{isPaying ? 'Updating…' : 'Paid (Online)'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showContact && (
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.ctaButton} onPress={() => handleChat(booking)}>
              <Ionicons name="chatbubble-outline" size={16} color={COLORS.primary} />
              <Text style={styles.ctaButtonText}>Chat</Text>
            </TouchableOpacity>
            {!!driverPhone && (
              <TouchableOpacity style={styles.ctaButton} onPress={() => handleCall(driverPhone)}>
                <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                <Text style={styles.ctaButtonText}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {status !== 'completed' && status !== 'cancelled' && (
          <View style={styles.actionsRow}>
            {status === 'pending' && (
              <TouchableOpacity
                style={styles.primaryAction}
                disabled={isBusy}
                onPress={() => handleStatusChange(booking.id, status, 'confirmed')}
              >
                <Text style={styles.primaryActionText}>{isBusy ? 'Updating…' : 'Confirm'}</Text>
              </TouchableOpacity>
            )}

            {status === 'confirmed' && (
              <TouchableOpacity
                style={styles.primaryAction}
                disabled={isBusy}
                onPress={() => handleStatusChange(booking.id, status, 'completed')}
              >
                <Text style={styles.primaryActionText}>{isBusy ? 'Updating…' : 'Mark Completed'}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.secondaryAction}
              disabled={isBusy}
              onPress={() => handleStatusChange(booking.id, status, 'cancelled')}
            >
              <Text style={styles.secondaryActionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.centerText}>Loading bookings…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!filteredBookings.length) {
      return (
        <View style={styles.centerBox}>
          <Ionicons name="calendar-outline" size={42} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>When drivers book your cars, they will appear here.</Text>
        </View>
      );
    }

    return (
      <View style={{ gap: 14 }}>
        {filteredBookings.map((booking) => renderBookingCard(booking))}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Your Bookings</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabsRow}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    ...FONTS.h3,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterTabsRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#1f7cff',
  },
  filterChipText: {
    ...FONTS.body3,
    fontWeight: '600',
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  centerBox: {
    marginTop: 60,
    alignItems: 'center',
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
    marginTop: 12,
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#00000012',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
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
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginTop: 12,
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
    color: COLORS.text,
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
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  paymentButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paymentButtonCash: {
    backgroundColor: '#ecfdf5',
  },
  paymentButtonOnline: {
    backgroundColor: '#eef2ff',
  },
  paymentButtonText: {
    ...FONTS.body3,
    fontWeight: '600',
    color: COLORS.text,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  ctaButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: '#f1f5ff',
    borderWidth: 1,
    borderColor: '#cfe1ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaButtonText: {
    ...FONTS.body3,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 10,
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
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  secondaryActionText: {
    ...FONTS.body3,
    fontWeight: '600',
    color: '#4b5563',
  },
});

export default OwnerBookingsScreen;
