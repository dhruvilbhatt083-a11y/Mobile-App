import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { getOwnerEarnings } from '../services/bookingsService';

// TODO: later we will pull this from real auth / context
const CURRENT_OWNER_ID = 'owner_001';

const OwnerEarningsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [earningsBookings, setEarningsBookings] = useState([]);

  // For tabs: Daily / Weekly / Monthly (for now we just change label)
  const [activeTab, setActiveTab] = useState('Weekly');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorText('');

      try {
        console.log('🔢 Loading owner earnings for:', CURRENT_OWNER_ID);
        const { totalAmount, bookings } = await getOwnerEarnings(
          CURRENT_OWNER_ID
        );
        setTotalAmount(totalAmount);
        setEarningsBookings(bookings);
      } catch (err) {
        console.error('❌ Error loading owner earnings:', err);
        setErrorText('Could not load earnings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Simple derived values
  const formattedTotal = useMemo(
    () => `₹${totalAmount.toLocaleString('en-IN')}`,
    [totalAmount]
  );

  const completedCount = useMemo(
    () => earningsBookings.length,
    [earningsBookings]
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading earnings…</Text>
        </View>
      ) : errorText ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary card */}
          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>Total Earnings</Text>
              <Text style={styles.summaryAmount}>{formattedTotal}</Text>
              <Text style={styles.summarySub}>
                {completedCount} completed paid booking
                {completedCount === 1 ? '' : 's'}
              </Text>
            </View>
            <View style={styles.summaryIcon}>
              <Ionicons name="wallet-outline" size={22} color="#1f7cff" />
            </View>
          </View>

          {/* Tabs (Daily / Weekly / Monthly) – for now just visual */}
          <View style={styles.tabsRow}>
            {['Daily', 'Weekly', 'Monthly'].map((tab) => {
              const active = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabChip, active && styles.tabChipActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[styles.tabText, active && styles.tabTextActive]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bookings list */}
          <Text style={styles.sectionTitle}>Earnings by Booking</Text>
          {earningsBookings.length === 0 ? (
            <Text style={styles.emptyText}>
              No completed & paid bookings yet.
            </Text>
          ) : (
            earningsBookings.map((b) => {
              const rawPrice =
                typeof b.price === 'string' ? b.price : String(b.price ?? '0');
              const displayPrice = rawPrice.includes('₹')
                ? rawPrice
                : `₹${rawPrice}/day`;

              return (
                <View key={b.id} style={styles.bookingRow}>
                  <View style={styles.bookingLeft}>
                    <Text style={styles.bookingCarName}>
                      {b.carName || 'Car'}
                    </Text>
                    <Text style={styles.bookingMeta}>
                      {b.bookingDate || ''} • {b.bookingTime || ''}
                    </Text>
                    <Text style={styles.bookingMetaSmall}>
                      Status: {(b.status || '').toUpperCase()} • Payment:{' '}
                      {(b.paymentStatus || '').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.bookingAmount}>{displayPrice}</Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  errorText: {
    ...FONTS.body3,
    color: '#ef4444',
    textAlign: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  summaryAmount: {
    ...FONTS.h2,
    color: '#1f7cff',
    marginTop: 4,
  },
  summarySub: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e0edff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
  tabChipActive: {
    backgroundColor: '#1f7cff',
  },
  tabText: {
    ...FONTS.body3,
    color: '#4b5563',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  sectionTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  bookingLeft: {
    flex: 1,
    paddingRight: 8,
  },
  bookingCarName: {
    ...FONTS.body2,
    fontWeight: '600',
  },
  bookingMeta: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bookingMetaSmall: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bookingAmount: {
    ...FONTS.body2,
    color: '#111827',
    fontWeight: '600',
  },
});

export default OwnerEarningsScreen;
