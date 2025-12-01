import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { PLATFORM_DEPOSIT_UPLIFT, DEFAULT_DEPOSIT_AMOUNT } from '../src/constants/pricing';

const parseAmount = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const numeric = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (!Number.isNaN(numeric)) return numeric;
  }
  return null;
};

const CarDetailScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { car } = route?.params || {};

  const safeBottom = Math.max(insets.bottom, 18);

  if (!car) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: safeBottom,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={{ marginTop: 16, ...FONTS.body2 }}>No car data found.</Text>
      </SafeAreaView>
    );
  }

  const carName = car?.name || car?.title || car?.carName || 'Car';
  const numberPlate = car?.numberPlate || car?.plateNumber || 'Not provided';
  const city = car?.city || 'Ahmedabad';
  const year = car?.year || car?.yearOfManufacture || '–';
  const fuelType = car?.fuelType || '–';
  const transmission = car?.transmission || '–';
  const kmDriven = car?.kmDriven || car?.kms || '–';
  const seats = car?.seats || car?.seatCount || '–';

  const dailyRate =
    parseAmount(car?.driverPricePerDay) ??
    parseAmount(car?.ownerPricePerDay) ??
    parseAmount(car?.ownerPrice) ??
    parseAmount(car?.pricePerDay) ??
    parseAmount(car?.price) ??
    0;

  const ownerDeposit =
    parseAmount(car?.ownerDeposit) ??
    parseAmount(car?.depositAmount) ??
    DEFAULT_DEPOSIT_AMOUNT;

  const depositAmount = Number.isFinite(ownerDeposit)
    ? ownerDeposit + PLATFORM_DEPOSIT_UPLIFT
    : DEFAULT_DEPOSIT_AMOUNT + PLATFORM_DEPOSIT_UPLIFT;

  const imageUrl =
    car?.imageUrl ||
    car?.image ||
    'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=60';

  const description =
    car?.description ||
    'Well maintained taxi-passing car, ideal for daily ride-hailing or local city usage.';

  const handleBookNow = () => {
    navigation.navigate('Booking', { car });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: safeBottom }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Car details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 140 + safeBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.carImage} />
          <View style={styles.tagBadge}>
            <Ionicons name="ribbon-outline" size={14} color="#1f2937" />
            <Text style={styles.tagText}>Taxi passing</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.carName}>{carName}</Text>
          <Text style={styles.numberPlate}>{numberPlate}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.locationText}>{city}</Text>
          </View>
        </View>

        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>Driver rent per day</Text>
            <Text style={styles.priceValue}>
              {dailyRate > 0 ? `₹${dailyRate.toLocaleString('en-IN')}` : '–'}
              {dailyRate > 0 && <Text style={styles.priceSuffix}> / day</Text>}
            </Text>
          </View>
          <View style={styles.depositBadge}>
            <Text style={styles.depositLabel}>Refundable deposit</Text>
            <Text style={styles.depositValue}>
              {depositAmount > 0 ? `₹${depositAmount.toLocaleString('en-IN')}` : '–'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key details</Text>
          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Ionicons name="calendar-outline" size={18} color="#1f7cff" />
              <Text style={styles.specLabel}>Year</Text>
              <Text style={styles.specValue}>{year}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={18} color="#1f7cff" />
              <Text style={styles.specLabel}>Fuel</Text>
              <Text style={styles.specValue}>{fuelType}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="swap-horizontal-outline" size={18} color="#1f7cff" />
              <Text style={styles.specLabel}>Transmission</Text>
              <Text style={styles.specValue}>{transmission}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="speedometer-outline" size={18} color="#1f7cff" />
              <Text style={styles.specLabel}>KM driven</Text>
              <Text style={styles.specValue}>
                {kmDriven === '–' ? kmDriven : `${kmDriven} km`}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="people-outline" size={18} color="#1f7cff" />
              <Text style={styles.specLabel}>Seats</Text>
              <Text style={styles.specValue}>{seats}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this car</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        <View style={styles.noticeBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#4b5563" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.noticeTitle}>Business usage only</Text>
            <Text style={styles.noticeText}>
              This car is taxi-passing and should be used strictly for commercial
              driving: ride-hailing, local taxi, and related services as per RTO rules.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: safeBottom }]}>
        <View style={styles.bottomPriceBlock}>
          <Text style={styles.bottomLabel}>Driver rent / day</Text>
          <Text style={styles.bottomPrice}>
            {dailyRate > 0 ? `₹${dailyRate.toLocaleString('en-IN')}` : '–'}
            {dailyRate > 0 && <Text style={styles.bottomPriceSuffix}> / day</Text>}
          </Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonLabel}>Book this car</Text>
        </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  imageWrapper: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: 190,
  },
  tagBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    ...FONTS.body4,
    marginLeft: 4,
    color: '#1f2937',
    fontWeight: '600',
  },
  titleBlock: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 10,
  },
  carName: {
    ...FONTS.h3,
    marginBottom: 2,
  },
  numberPlate: {
    ...FONTS.body3,
    color: '#4b5563',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...FONTS.body4,
    color: '#6b7280',
    marginLeft: 4,
  },
  priceCard: {
    marginHorizontal: SIZES.padding,
    marginTop: 12,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#cbd5f5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 3,
  },
  priceLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  priceValue: {
    ...FONTS.body1,
    fontWeight: '700',
    marginTop: 4,
  },
  priceSuffix: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  depositBadge: {
    alignItems: 'flex-end',
  },
  depositLabel: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  depositValue: {
    ...FONTS.body3,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginHorizontal: SIZES.padding,
    marginTop: 16,
  },
  sectionTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: 8,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specItem: {
    width: '48%',
    borderRadius: 14,
    backgroundColor: '#edf2ff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  specLabel: {
    ...FONTS.body4,
    color: '#4b5563',
    marginTop: 4,
  },
  specValue: {
    ...FONTS.body3,
    fontWeight: '600',
    marginTop: 2,
  },
  descriptionText: {
    ...FONTS.body3,
    color: '#4b5563',
    lineHeight: 20,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SIZES.padding,
    marginTop: 16,
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
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SIZES.padding,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomPriceBlock: {
    flex: 1,
  },
  bottomLabel: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  bottomPrice: {
    ...FONTS.body1,
    fontWeight: '700',
  },
  bottomPriceSuffix: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  bookButton: {
    borderRadius: 999,
    backgroundColor: '#1f7cff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginLeft: 10,
  },
  bookButtonLabel: {
    ...FONTS.body2,
    color: COLORS.background,
    fontWeight: '600',
  },
});

export default CarDetailScreen;
