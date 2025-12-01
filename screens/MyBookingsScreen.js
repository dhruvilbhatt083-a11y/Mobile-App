import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useAuth } from '../src/context/AuthContext';
import { getBookingsByUser } from '../services/bookingsService';
import BookingCard from '../components/BookingCard';
import DriverBottomNav from '../components/DriverBottomNav';

const shouldShowPayButton = (booking) => {
  const depositPending = !booking.depositPaid;
  const mode = (booking.paymentMode || '').toLowerCase();
  const isOnlineMode = ['card', 'razorpay', 'online'].includes(mode);
  return (depositPending && isOnlineMode) || Number(booking.rentDueAmount) > 0;
};

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      return value.toDate();
    }
    if (typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000);
    }
  }
  return null;
};

const formatDateLabel = (value) => {
  const date = toDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTimeLabel = (value) => {
  const date = toDate(value);
  if (date) {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (typeof value === 'string') return value;
  return '';
};

const tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const MyBookingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    const load = async () => {
      if (!user?.id && !user?.uid) {
        setLoading(false);
        setLoadError('User not found in auth context.');
        return;
      }

      try {
        setLoading(true);
        setLoadError('');

        const driverId = user.id || user.uid;
        const remote = await getBookingsByUser(driverId);

        const normalized = (remote || []).map((b) => {
          const normalizedStatus = (b.status || b.bookingStatus || 'pending')
            .toString()
            .trim()
            .toLowerCase();
          const depositStatus = (
            b.depositStatus ||
            (b.depositPaid ? 'paid' : 'pending')
          )
            .toString()
            .trim()
            .toLowerCase();
          const depositPaid = depositStatus === 'paid' || depositStatus === 'adjusted';
          const displayBookingId = b.bookingId || b.bookingCode || b.id;
          const totalEstimatedRent = Number(
            b.totalEstimatedRent ?? b.totalRent ?? b.price ?? b.estimatedRent ?? 0,
          );
          const rentDueAmount = Number(
            b.rentDueAmount ?? (typeof b.rentPaidAmount === 'number' ? totalEstimatedRent - b.rentPaidAmount : totalEstimatedRent),
          );
          const paymentMode = (b.paymentMode || '').toLowerCase();

          const bookingDateValue =
            b.bookingDate ||
            b.startDate ||
            b.pickupDate ||
            b.confirmedAt ||
            b.createdAt ||
            null;
          const bookingTimeValue = b.bookingTime || b.pickupTime || bookingDateValue;
          const canChat = normalizedStatus === 'confirmed' || normalizedStatus === 'active';
          const balanceDue = Number(rentDueAmount) > 0
            ? rentDueAmount
            : Number.isFinite(b.depositRemaining)
            ? b.depositRemaining
            : Number.isFinite(b.depositAmount)
            ? b.depositAmount
            : 0;
          const showPay = shouldShowPayButton({ depositPaid, paymentMode, rentDueAmount });

          return {
            id: b.id,
            bookingId: displayBookingId,
            carName: b.carName || b.title || b.car?.title || 'Car',
            carImage: b.carImage || b.image || b.car?.image || null,
            bookingDate: formatDateLabel(bookingDateValue),
            bookingTime: formatTimeLabel(bookingTimeValue),
            status: normalizedStatus,
            depositStatus,
            depositPaid,
            depositRemaining:
              typeof b.depositRemaining === 'number'
                ? b.depositRemaining
                : typeof b.depositAmount === 'number'
                ? b.depositAmount
                : null,
            durationDays: b.durationDays || b.duration || null,
            city: b.city || b.location || '',
            totalEstimatedRent,
            rentDueAmount: Number.isFinite(rentDueAmount) ? Math.max(rentDueAmount, 0) : 0,
            ownerPhone: canChat ? b.ownerPhoneNumber || b.ownerPhone || '' : '',
            ownerId: b.ownerId,
            paymentMode,
            balanceDue,
            canChat,
            showPay,
            raw: b,
          };
        });

        setBookings(normalized);
      } catch (error) {
        console.log('Error loading bookings', error);
        setLoadError('Could not load bookings. Pull to refresh or try again later.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id, user?.uid]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') return bookings;
    const key = activeTab.toLowerCase();
    return bookings.filter((b) => b.status === key);
  }, [activeTab, bookings]);

  const handleViewDetails = (booking) => {
    navigation.navigate('BookingDetails', {
      booking: booking.raw,
      bookingId: booking.id,
      displayBookingCode: booking.bookingId,
      rentDueAmount: booking.rentDueAmount,
      rentStatus: booking.raw?.rentStatus || (booking.rentDueAmount === 0 ? 'paid' : 'unpaid'),
      totalEstimatedRent: booking.totalEstimatedRent,
      car: {
        name: booking.carName,
        image: booking.carImage,
      },
      pickupDate: booking.bookingDate,
      pickupTime: booking.bookingTime,
    });
  };

  const handleChat = (booking) => {
    navigation.navigate('ChatWithOwner', {
      bookingId: booking.bookingId,
      ownerId: booking.ownerId,
      carName: booking.carName,
      ownerPhone: booking.ownerPhone,
    });
  };

  const handlePayNow = (booking) => {
    if (!booking?.id) return;

    const depositAmount =
      Number(booking.raw?.depositAmount) ||
      Number(booking.depositRemaining) ||
      Number(booking.raw?.deposit || 0);

    navigation.navigate('DriverPayment', {
      bookingId: booking.id,
      car: {
        name: booking.carName,
        title: booking.carName,
        image: booking.carImage,
        pricePerDay: booking.raw?.driverPricePerDay || booking.raw?.pricePerDay,
        depositAmount,
      },
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      durationDays: booking.durationDays,
      depositAmount,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading bookings…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 80) }}
        >
          {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {tabs.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabChip, isActive && styles.tabChipActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.listWrapper}>
            {filteredBookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-sport" size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No bookings yet</Text>
                <Text style={styles.emptySubtitle}>Browse cars and create your first booking.</Text>
              </View>
            ) : (
              filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onView={() => handleViewDetails(booking)}
                  onChat={() => handleChat(booking)}
                  onPay={() => handlePayNow(booking)}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
      <DriverBottomNav activeTab="bookings" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  header: {
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
    borderColor: '#E8ECF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  errorText: {
    ...FONTS.body3,
    color: '#B91C1C',
    paddingHorizontal: SIZES.padding,
    marginTop: 12,
  },
  tabsRow: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E9EDF6',
    marginRight: 10,
  },
  tabChipActive: {
    backgroundColor: '#1F7CFF',
  },
  tabText: {
    ...FONTS.body3,
    color: '#5A6475',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listWrapper: {
    paddingHorizontal: SIZES.padding,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    ...FONTS.body1,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    ...FONTS.body3,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default MyBookingsScreen;
