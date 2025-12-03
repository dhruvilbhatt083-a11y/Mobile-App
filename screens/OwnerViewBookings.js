import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../constants/theme';
import { getBookingsByOwner } from '../services/bookingsService';
import { useAuth } from '../src/context/AuthContext';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const OwnerViewBookings = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const ownerId = user?.id;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const loadBookings = useCallback(async () => {
    if (!ownerId) {
      setError('Owner not signed in.');
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const ownerBookings = await getBookingsByOwner(ownerId);
      setBookings(Array.isArray(ownerBookings) ? ownerBookings : []);
    } catch (err) {
      console.error('OwnerViewBookings load error', err);
      setError('Unable to load bookings right now.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings]),
  );

  const filteredBookings = useMemo(() => {
    if (activeFilter === 'all') {
      return bookings;
    }

    return bookings.filter((booking) => {
      const status = (booking.status || '').toLowerCase();
      if (activeFilter === 'upcoming') {
        return status === 'pending';
      }
      return status === activeFilter;
    });
  }, [bookings, activeFilter]);

  const handleSelectBooking = (booking) => {
    if (!booking?.carId) {
      return;
    }

    navigation.navigate('CarBookings', {
      carId: booking.carId,
      carTitle: booking.carName || booking.carTitle || 'Car',
      plateNumber: booking.carPlate || booking.carNumber || booking.plateNumber || '—',
      ownerId,
    });
  };

  const renderBookingCard = ({ item }) => {
    const status = (item.status || 'pending').toLowerCase();
    const statusStyles = STATUS_MAP[status] || STATUS_MAP.pending;

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleSelectBooking(item)}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.carName}>{item.carName || 'Car'}</Text>
            <Text style={styles.carPlate}>{item.plateNumber || item.carPlate || item.carId || '—'}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusStyles.background }]}>
            <Text style={[styles.statusText, { color: statusStyles.text }]}>{statusStyles.label}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{item.driverName || item.userName || 'Driver'}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="call-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{item.driverPhone || item.userPhone || 'N/A'}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>
            {item.bookingDate || '—'}
            {item.bookingTime ? ` • ${item.bookingTime}` : ''}
          </Text>
        </View>

        {item.price ? (
          <Text style={styles.priceLabel}>{`₹${item.price}`}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} />
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

    if (!filteredBookings.length) {
      return (
        <View style={styles.centered}>
          <Ionicons name="calendar-outline" size={48} color={COLORS.textSecondary} />
          <Text style={[styles.helperText, { marginTop: 12 }]}>No bookings found.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 40) }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>See every car booking in one place.</Text>
      </View>

      <View style={styles.tabsRow}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text style={[styles.tabPillText, isActive && styles.tabPillTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

const STATUS_MAP = {
  pending: { background: '#fff4e5', text: '#f97316', label: 'Upcoming' },
  upcoming: { background: '#fff4e5', text: '#f97316', label: 'Upcoming' },
  confirmed: { background: '#dbeafe', text: '#1d4ed8', label: 'Confirmed' },
  completed: { background: '#dcfce7', text: '#15803d', label: 'Completed' },
  cancelled: { background: '#fee2e2', text: '#b91c1c', label: 'Cancelled' },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fbff',
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    ...FONTS.h3,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
  tabPillActive: {
    backgroundColor: '#1f7cff',
  },
  tabPillText: {
    ...FONTS.body3,
    color: '#111827',
    fontWeight: '600',
  },
  tabPillTextActive: {
    color: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#00000010',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  carName: {
    ...FONTS.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  carPlate: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  metaText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  priceLabel: {
    marginTop: 12,
    ...FONTS.body2,
    color: '#111827',
    fontWeight: '700',
  },
});

export default OwnerViewBookings;
