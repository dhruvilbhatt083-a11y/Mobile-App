import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
// Use modular Firestore service for cars (shared with AddCarScreen)
import { fetchCars } from '../src/services/carsService';
import { getBookingsByOwner, getOwnerEarnings } from '../services/bookingsService';
import { useAuth } from '../src/context/AuthContext';

// 🔹 Local dummy as fallback ONLY if Firestore has nothing / fails
const fallbackCars = [
  {
    id: 'car-1',
    name: 'Maruti Suzuki Dzire',
    numberPlate: 'GJ 01 AB 3421',
    status: 'Available',
    pricePerDay: 900,
    imageUrl:
      'https://images.unsplash.com/photo-1610465299996-866cbd9d753e?auto=format&fit=crop&w=600&q=60',
  },
  {
    id: 'car-2',
    name: 'Hyundai Creta',
    numberPlate: 'MH 02 CD 5678',
    status: 'Booked',
    pricePerDay: 1200,
    imageUrl:
      'https://images.unsplash.com/photo-1613679074971-91fc27180061?auto=format&fit=crop&w=600&q=60',
  },
  {
    id: 'car-3',
    name: 'Tata Altroz',
    numberPlate: 'DL 03 EF 9012',
    status: 'Inactive',
    pricePerDay: 750,
    imageUrl:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=60',
  },
];

const statusMap = {
  Available: { background: '#dcfce7', text: '#15803d' },
  Booked: { background: '#e4efff', text: '#1f7cff' },
  Inactive: { background: '#f4f4f5', text: '#6b7280' },
};

const OwnerHomeDashboard = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const ownerId = user?.id || route?.params?.ownerId || null;

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [earningsCard, setEarningsCard] = useState({
    amount: '₹0',
    summary: 'From 0 completed paid bookings',
  });

  const loadData = useCallback(async ({ skipSpinner = false } = {}) => {
    if (!ownerId) {
      console.warn('OwnerHomeDashboard: no ownerId available in context/route');
      setError('No owner ID — please log in again.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setError(null);
    try {
      if (!skipSpinner) {
        setLoading(true);
      }

      const remoteCars = await fetchCars(ownerId);

      const normalizedCars = (Array.isArray(remoteCars) ? remoteCars : []).map((car) => ({
        id: car.id,
        name: car.name || car.title || 'Car',
        numberPlate:
          car.numberPlate || car.plateNumber || car.registration || '—',
        status: car.status || 'Available',
        pricePerDay: Number(car.pricePerDay || car.price || 0),
        imageUrl:
          car.imageUrl ||
          car.image ||
          'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=60',
      }));

      setCars(normalizedCars);

      const ownerBookings = await getBookingsByOwner(ownerId);
      setBookings(ownerBookings || []);

      const earningsResult = await getOwnerEarnings(ownerId);
      const formattedAmount = `₹${Number(
        earningsResult.totalAmount || 0,
      ).toLocaleString('en-IN')}`;
      const completedCount = earningsResult.bookings?.length || 0;
      const summaryText = `From ${completedCount} completed paid booking${
        completedCount === 1 ? '' : 's'
      }`;
      setEarningsCard({ amount: formattedAmount, summary: summaryText });
    } catch (error) {
      console.error('Owner dashboard load error', error);
      setError('Failed to load dashboard. Pull to retry.');
      setCars(fallbackCars);
      setBookings([]);
      setEarningsCard({
        amount: '₹0',
        summary: 'From 0 completed paid bookings',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ownerId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData({ skipSpinner: true });
  }, [loadData]);

  const handleAddCar = () => {
    navigation.navigate('AddNewCar');
  };

  const handleViewBookings = (car) => {
    navigation.navigate('CarBookings', {
      carId: car.id, // Firestore car doc id
      carTitle: car.name,
      plateNumber: car.numberPlate,
    });
  };

  const handleEditCar = (car) => {
    navigation.navigate('EditCar', {
      carId: car.id,
      carTitle: car.name,
      plateNumber: car.numberPlate,
    });
  };

  const bookingsByCarId = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(bookings)) return map;
    bookings.forEach((booking) => {
      if (!booking?.carId) return;
      const status = (booking.status || '').toLowerCase();
      const isActive = status !== 'completed' && status !== 'cancelled';
      if (isActive && !map.has(booking.carId)) {
        map.set(booking.carId, booking);
      }
    });
    return map;
  }, [bookings]);

  const renderCarCard = ({ item }) => {
    const activeBooking = bookingsByCarId.get(item.id) || null;

    const effectiveStatus = activeBooking ? 'Booked' : item.status || 'Available';
    const badge = statusMap[effectiveStatus] || statusMap.Available;

    const driverLabel =
      activeBooking?.driverName ||
      activeBooking?.userName ||
      activeBooking?.userId ||
      null;

    return (
      <View style={styles.carCard}>
        <Image source={{ uri: item.imageUrl }} style={styles.carImage} />
        <View style={styles.carInfoWrapper}>
          <View style={styles.carHeaderRow}>
            <View>
              <Text style={styles.carName}>{item.name}</Text>
              <Text style={styles.carNumber}>{item.numberPlate}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: badge.background },
              ]}
            >
              <Text
                style={[styles.statusBadgeText, { color: badge.text }]}
              >
                {effectiveStatus}
              </Text>
            </View>
          </View>

          <Text style={styles.carPrice}>{`₹${item.pricePerDay}/day`}</Text>

          {/* 🔹 Show who booked this car, if there is an active booking */}
          {activeBooking && (
            <Text style={styles.bookedByText}>
              Booked by: {driverLabel || 'Driver'}
            </Text>
          )}

          <View style={styles.cardActionsRow}>
            <TouchableOpacity onPress={() => handleViewBookings(item)}>
              <Text style={styles.linkText}>View Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditCar(item)}
            >
              <Text style={styles.editButtonText}>Edit Car</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="car-outline" size={56} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No cars listed yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first car to start earning daily.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={handleAddCar}>
        <Text style={styles.primaryButtonText}>Add Car</Text>
      </TouchableOpacity>
    </View>
  );

  if (!ownerId) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={{ padding: 24 }}>
          <Text style={{ ...FONTS.body1, marginBottom: 12 }}>Owner not signed in</Text>
          <Text style={{ ...FONTS.body3, color: COLORS.textSecondary }}>
            Please login as an owner to see your dashboard.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={20} color="#1f7cff" />
        </View>
        <Text style={styles.headerTitle}>Welcome, Owner</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.earningsCard}>
        <View>
          <Text style={styles.earningsLabel}>This Week’s Earnings</Text>
          <Text style={styles.earningsAmount}>{earningsCard.amount}</Text>
          <Text style={styles.earningsSummary}>{earningsCard.summary}</Text>
        </View>
        <View style={styles.earningsActions}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadData}
            accessibilityLabel="Refresh earnings"
          >
            <Ionicons name="refresh-outline" size={18} color="#1f7cff" />
          </TouchableOpacity>
          <View style={styles.trendIcon}>
            <Ionicons name="trending-up-outline" size={20} color="#1f7cff" />
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Your Cars</Text>
          <Text style={styles.sectionSubtitle}>
            Manage listed cars and availability
          </Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ ...FONTS.body3, color: COLORS.textSecondary, marginTop: 8 }}>
            Loading your cars…
          </Text>
          {error ? (
            <TouchableOpacity onPress={loadData} style={{ marginTop: 12 }}>
              <Text style={{ color: '#1f7cff' }}>Retry</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderCarCard}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={11}
        />
      )}

      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: Math.max(insets.bottom + 16, 24) },
        ]}
        onPress={handleAddCar}
      >
        <Ionicons name="add" size={26} color={COLORS.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fbff',
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.base,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0edff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h3,
    color: '#0a0a0a',
  },
  earningsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  earningsLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  earningsAmount: {
    ...FONTS.h2,
    color: '#0066ff',
    marginTop: 6,
  },
  earningsSummary: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  trendIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  sectionSubtitle: {
    ...FONTS.body3,
    color: '#6d6d6d',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 140,
  },
  carCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 12,
  },
  carImage: {
    width: 120,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  carInfoWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  carHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  carName: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  carNumber: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  carPrice: {
    ...FONTS.body2,
    color: '#0a0a0a',
    fontWeight: '600',
    marginTop: 8,
  },
  bookedByText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardActionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    ...FONTS.body3,
    color: '#1f7cff',
    fontWeight: '600',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#d5dbec',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  editButtonText: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: '#1f7cff',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 16,
  },
  primaryButtonText: {
    ...FONTS.body2,
    color: COLORS.background,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1f7cff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
});

export default OwnerHomeDashboard;
