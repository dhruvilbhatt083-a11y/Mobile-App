import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import { CURRENT_OWNER_ID } from '../constants/currentUser';
import { getBookingsByOwner } from '../services/bookingsService';

const statusStyles = {
  pending: { background: '#fff4e5', text: '#f97316', label: 'Pending' },
  confirmed: { background: '#dbeafe', text: '#1d4ed8', label: 'Confirmed' },
  completed: { background: '#dcfce7', text: '#15803d', label: 'Completed' },
  cancelled: { background: '#fee2e2', text: '#b91c1c', label: 'Cancelled' },
};

const OwnerBookingsScreen = ({ route }) => {
  const insets = useSafeAreaInsets();
  const { carId, carTitle, plateNumber } = route.params || {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const remoteBookings = await getBookingsByOwner(CURRENT_OWNER_ID);

        if (!Array.isArray(remoteBookings)) {
          setError('Unable to load bookings right now.');
          setBookings([]);
          return;
        }

        const filtered = carId
          ? remoteBookings.filter((booking) => booking.carId === carId)
          : remoteBookings;

        setBookings(filtered);
      } catch (err) {
        console.error('OwnerBookings load error:', err);
        setError('Unable to load bookings right now.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [carId]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.helperText}>Loading bookings…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.helperText}>{error}</Text>
        </View>
      );
    }

    if (!bookings.length) {
      return (
        <View style={styles.centered}>
          <Text style={styles.helperText}>No bookings found for this car yet.</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {bookings.map((booking) => {
          const normalizedStatus = (booking.status || 'pending').toLowerCase();
          const statusStyle = statusStyles[normalizedStatus] || statusStyles.pending;

          return (
            <View key={booking.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.driverName}>
                    {booking.driverName || booking.userName || 'Driver'}
                  </Text>
                  <Text style={styles.driverContact}>
                    {booking.driverPhone || booking.userPhone || 'Contact n/a'}
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusStyle.background }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {statusStyle.label}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pickup</Text>
                <Text style={styles.detailValue}>
                  {booking.bookingDate || '-'}
                  {booking.bookingTime ? ` • ${booking.bookingTime}` : ''}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price / day</Text>
                <Text style={styles.priceValue}>
                  {booking.price ? `₹${booking.price}` : '₹0'}
                </Text>
              </View>

              {booking.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Notes</Text>
                  <Text style={styles.notesText}>{booking.notes}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{carTitle || 'Car bookings'}</Text>
        <Text style={styles.subtitle}>{plateNumber || carId || '—'}</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    ...FONTS.h2,
    marginBottom: 4,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  list: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#00000010',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  driverName: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  driverContact: {
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
  statusText: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  priceValue: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '700',
  },
  notesBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f7fb',
    borderRadius: 12,
  },
  notesLabel: {
    ...FONTS.body4,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
});

export default OwnerBookingsScreen;
