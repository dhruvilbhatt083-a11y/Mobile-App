import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { createBooking } from '../services/bookingsService';
import { DEV_DRIVER_ID, DEV_OWNER_ID } from '../src/config/currentUser';
import { useAuth } from '../src/context/AuthContext';
import {
  DEFAULT_DEPOSIT_AMOUNT,
  PLATFORM_DAILY_UPLIFT,
  PLATFORM_DEPOSIT_UPLIFT,
} from '../src/constants/pricing';

const parseAmount = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const numeric = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (!Number.isNaN(numeric)) return numeric;
  }
  return null;
};

const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30];

const defaultCar = {
  name: 'Maruti Suzuki Dzire',
  price: '₹900/day',
  image: 'https://images.unsplash.com/photo-1610465299996-866cbd9d753e?auto=format&fit=crop&w=600&q=60',
};

const BookingScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const car = route.params?.car || defaultCar;
  const { user } = useAuth();

  const driverId = user?.id || DEV_DRIVER_ID;
  const driverName = user?.name?.trim() || 'Driver';
  const driverPhone = user?.phone || '';

  const normalizedLicenceStatus = (user?.kyc?.licenceStatus || '').toLowerCase();
  const normalizedAadhaarStatus = (user?.kyc?.aadharStatus || user?.kyc?.aadhaarStatus || '').toLowerCase();
  const normalizedOverallStatus = (
    user?.kyc?.overallStatus ||
    user?.kycStatus ||
    user?.verificationStatus ||
    ''
  ).toLowerCase();

  const hasLicence = normalizedLicenceStatus === 'verified' || (!!user?.licenseNumber && user.licenseNumber.trim() !== '');
  const hasAadhaar = normalizedAadhaarStatus === 'verified' || (!!user?.aadhaarNumber && user.aadhaarNumber.trim() !== '');
  const isKycApproved = ['approved', 'verified'].includes(normalizedOverallStatus);
  const isKycBasicComplete = isKycApproved || (hasLicence && hasAadhaar);

  const [pickupDate, setPickupDate] = useState('20 Nov 2025');
  const [pickupTime, setPickupTime] = useState('08:00 AM');
  const [durationDays, setDurationDays] = useState(DURATION_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const durationLabel = durationDays === 1 ? '1 day' : `${durationDays} days`;

  const dailyRate = useMemo(() => {
    const numeric = parseInt(String(car.price).replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(numeric) ? 0 : numeric;
  }, [car.price]);

  const ownerPricePerDay = useMemo(() => {
    const explicit = parseAmount(car.ownerPricePerDay);
    if (typeof explicit === 'number') return explicit;
    const fallback = parseAmount(car.pricePerDay ?? car.price ?? 0);
    return typeof fallback === 'number' ? fallback : dailyRate;
  }, [car.ownerPricePerDay, car.pricePerDay, car.price, dailyRate]);

  const driverPricePerDay = ownerPricePerDay + PLATFORM_DAILY_UPLIFT;
  const ownerDeposit = useMemo(() => {
    const explicit = parseAmount(car.ownerDeposit);
    if (typeof explicit === 'number') return explicit;
    const secondary = parseAmount(car.depositAmount);
    if (typeof secondary === 'number') return secondary;
    return DEFAULT_DEPOSIT_AMOUNT;
  }, [car.ownerDeposit, car.depositAmount]);

  const depositAmount = ownerDeposit + PLATFORM_DEPOSIT_UPLIFT;

  const estimatedRentTotal = driverPricePerDay * durationDays;

  const handleComingSoon = (label) => {
    Alert.alert(label, 'Selection options will be added in the next step.');
  };

  const handleConfirmBooking = async () => {
    if (submitting) return;

    const ownerId =
      car.ownerId ||
      car.ownerID ||
      car.owner?.id ||
      car.owner?.ownerId ||
      DEV_OWNER_ID;

    if (!ownerId) {
      Alert.alert('Missing owner', 'This car is missing an owner id. Please try another car.');
      return;
    }

    const carId = car.id || car.carId || car.documentId;
    if (!carId) {
      Alert.alert('Missing car id', 'Unable to find this car’s id.');
      return;
    }

    const carImageRaw =
      car.image ||
      car.imageUrl ||
      car.photoUrl ||
      car.thumbnail ||
      car.imageURI ||
      '';
    const carImage = typeof carImageRaw === 'string' ? carImageRaw.trim() : '';

    if (!carImage) {
      console.log('[BOOKING] No image found for car', {
        carId,
        carName: car.name || car.title || car.carName || 'Car',
      });
    }

    const bookingPayload = {
      userId: driverId,
      userName: driverName,
      userPhone: driverPhone,
      ownerId,
      carId,
      carName: car.name || car.title || car.carName || 'Car',
      carImage,
      image: carImage,
      bookingDate: pickupDate,
      bookingTime: pickupTime,
      durationDays,
      ownerPricePerDay,
      driverPricePerDay,
      platformDailyUplift: PLATFORM_DAILY_UPLIFT,
      depositAmount,
      depositPaid: false,
      depositPaymentMode: 'pending',
      paymentMode: 'pending',
      totalEstimatedRent: estimatedRentTotal,
      status: 'requested',
      depositStatus: 'pending',
      paymentStatus: 'deposit_pending',
      paymentMethod: 'pending',
      notes,
    };

    try {
      setSubmitting(true);
      const bookingId = await createBooking(bookingPayload);

      navigation.navigate('DriverPayment', {
        bookingId,
        bookingDate: pickupDate,
        bookingTime: pickupTime,
        durationDays,
        notes,
        car: {
          ...car,
          ownerPricePerDay,
          driverPricePerDay,
          depositAmount,
          ownerDeposit,
        },
      });
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      Alert.alert('Booking failed', 'We could not place your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Your Ride</Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.carCard}>
          <Image source={{ uri: car.image }} style={styles.carImage} />
          <View style={styles.carInfo}>
            <Text style={styles.carName}>{car.name}</Text>
            <Text style={styles.carPrice}>{car.price}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <Text style={styles.infoBanner}>
            Business-only rentals for taxi-passing cars. Choose a multi-day package to run Ola / Uber / local taxi work.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pickup Date</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inputField}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputValue}>{pickupDate}</Text>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pickup Time</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inputField}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.inputValue}>{pickupTime}</Text>
              <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rental Duration (days)</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inputField}
              onPress={() => setShowDurationPicker(true)}
            >
              <Text style={styles.inputValue}>{durationLabel}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special requests or instructions..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              style={styles.notesInput}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{`
₹${driverPricePerDay.toLocaleString('en-IN')} x ${durationDays} day${durationDays > 1 ? 's' : ''}`}</Text>
            <Text style={styles.summaryValue}>{`₹${estimatedRentTotal.toLocaleString('en-IN')}`}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Refundable deposit</Text>
            <Text style={styles.summaryValue}>{`₹${depositAmount.toLocaleString('en-IN')}`}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.summaryHint}>
            Deposit is paid now. Daily rent settles directly with the owner at the end of each work day.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SIZES.base) }]}>
        {!isKycBasicComplete && (
          <View style={styles.kycBanner}>
            <Text style={styles.kycBannerTitle}>KYC incomplete</Text>
            <Text style={styles.kycBannerText}>
              To book this car, please add your driving licence and Aadhaar details from the Profile screen.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('DriverProfile')}
              style={styles.kycBannerButton}
            >
              <Text style={styles.kycBannerButtonText}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!isKycBasicComplete || submitting) && styles.confirmButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={() => {
            if (!isKycBasicComplete || submitting) return;
            handleConfirmBooking();
          }}
          disabled={!isKycBasicComplete || submitting}
        >
          <Text style={styles.confirmText}>
            {submitting ? 'Placing booking…' : isKycBasicComplete ? 'Confirm Booking' : 'Complete KYC to Book'}
          </Text>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeaderRow}>
              <Text style={styles.pickerTitle}>Select Pickup Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.calendarHeaderRow}>
              <Text style={styles.calendarMonth}>November 2025</Text>
              <Text style={styles.calendarHint}>Tap a date</Text>
            </View>
            <View style={styles.weekdaysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
                <Text key={`${d}-${index}`} style={styles.weekdayLabel}>{d}</Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {[...Array(30)].map((_, index) => {
                const dayNum = index + 1;
                const label = dayNum.toString();
                const isSelected = pickupDate.startsWith(label + ' ');
                return (
                  <TouchableOpacity
                    key={dayNum}
                    style={[styles.calendarCell, isSelected && styles.calendarCellSelected]}
                    onPress={() => {
                      setPickupDate(label + ' Nov 2025');
                      setShowDatePicker(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.calendarCellText, isSelected && styles.calendarCellTextSelected]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}
      {showTimePicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeaderRow}>
              <Text style={styles.pickerTitle}>Select Pickup Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.calendarHint}>Tap a time slot</Text>
            <View style={styles.timeGrid}>
              {['06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'].map((time) => {
                const isSelected = pickupTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeCell, isSelected && styles.timeCellSelected]}
                    onPress={() => {
                      setPickupTime(time);
                      setShowTimePicker(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.timeCellText, isSelected && styles.timeCellTextSelected]}>{time}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}
      {showDurationPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeaderRow}>
              <Text style={styles.pickerTitle}>Select Duration</Text>
              <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.calendarHint}>Tap number of days</Text>
            <View style={styles.durationGrid}>
              {DURATION_OPTIONS.map((option) => {
                const isSelected = durationDays === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.durationCell, isSelected && styles.durationCellSelected]}
                    onPress={() => {
                      setDurationDays(option);
                      setShowDurationPicker(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.durationCellText, isSelected && styles.durationCellTextSelected]}>
                      {option} days
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6fb',
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 0.8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e6e9f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  carCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    shadowColor: '#b7c9ea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 3,
    marginBottom: SIZES.padding,
  },
  carImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginRight: SIZES.padding,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: 4,
  },
  carPrice: {
    ...FONTS.body2,
    color: '#1f7cff',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: SIZES.padding,
    shadowColor: '#cad7ee',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: SIZES.base,
  },
  inputGroup: {
    marginTop: SIZES.padding * 0.8,
  },
  inputLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e3e8f2',
    borderRadius: 16,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base * 0.9,
    backgroundColor: '#fdfdff',
  },
  inputValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e3e8f2',
    borderRadius: 16,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    minHeight: 80,
    backgroundColor: '#fdfdff',
    textAlignVertical: 'top',
    ...FONTS.body2,
    color: COLORS.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  summaryLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...FONTS.body2,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e8edf5',
    marginVertical: SIZES.base,
  },
  totalLabel: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  totalValue: {
    ...FONTS.body1,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#e5e9f2',
  },
  confirmButton: {
    backgroundColor: '#1f7cff',
    borderRadius: 999,
    paddingVertical: SIZES.base * 1.2,
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  confirmButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  confirmText: {
    ...FONTS.body1,
    color: COLORS.background,
    fontWeight: '700',
  },
  kycBanner: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  kycBannerTitle: {
    ...FONTS.body2,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  kycBannerText: {
    ...FONTS.body3,
    color: '#92400e',
    marginBottom: 8,
  },
  kycBannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fbbf24',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  kycBannerButtonText: {
    ...FONTS.body3,
    fontWeight: '600',
    color: '#78350f',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCard: {
    width: '88%',
    maxHeight: '78%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: SIZES.padding,
    shadowColor: '#7c90b5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  pickerTitle: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  calendarMonth: {
    ...FONTS.body2,
  },
  calendarHint: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.base,
    marginBottom: SIZES.base * 0.5,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.base * 0.5,
  },
  calendarCell: {
    width: '14.28%',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  calendarCellSelected: {
    backgroundColor: '#1f7cff',
  },
  calendarCellText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  calendarCellTextSelected: {
    color: COLORS.background,
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.base,
  },
  timeCell: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e0e5f1',
    marginRight: 6,
    marginBottom: 6,
  },
  timeCellSelected: {
    backgroundColor: '#1f7cff',
    borderColor: '#1f7cff',
  },
  timeCellText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  timeCellTextSelected: {
    color: COLORS.background,
    fontWeight: '600',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.base,
  },
  durationCell: {
    width: '16.66%',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e0e5f1',
    marginBottom: 6,
  },
  durationCellSelected: {
    backgroundColor: '#1f7cff',
    borderColor: '#1f7cff',
  },
  durationCellText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  durationCellTextSelected: {
    color: COLORS.background,
    fontWeight: '600',
  },
});

export default BookingScreen;
