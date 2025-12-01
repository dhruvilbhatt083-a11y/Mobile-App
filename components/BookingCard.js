import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';

const PLACEHOLDER = 'https://via.placeholder.com/120x90?text=Car';

const BookingCard = ({ booking, onView, onChat, onPay }) => {
  const {
    carImage,
    carName,
    bookingTime,
    durationDays,
    bookingId,
    depositPaid,
    depositStatus,
    totalEstimatedRent,
    status,
    balanceDue,
    canChat,
    showPay,
  } = booking;

  const statusColor = (() => {
    switch ((status || '').toLowerCase()) {
      case 'active':
      case 'confirmed':
        return '#16A34A';
      case 'pending':
      case 'requested':
        return '#F59E0B';
      case 'completed':
        return '#0369A1';
      default:
        return '#EF4444';
    }
  })();

  const depositLabel = depositPaid ? 'Deposit paid' : (depositStatus || 'Deposit pending');

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={{ uri: carImage || PLACEHOLDER }}
          style={styles.thumb}
        />

        <View style={styles.middle}>
          <Text numberOfLines={1} style={styles.title}>{carName || 'Car'}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {bookingTime || '—'}
            {durationDays ? ` • ${durationDays} days` : ''}
          </Text>
          {bookingId ? (
            <Text style={styles.metaSmall} numberOfLines={1}>ID {bookingId}</Text>
          ) : null}

          <View style={styles.badgeInline}>
            <Ionicons
              name={depositPaid ? 'checkmark-circle' : 'time'}
              size={14}
              color={depositPaid ? '#16A34A' : '#F59E0B'}
            />
            <Text style={[styles.badgeText, { color: depositPaid ? '#16A34A' : '#F59E0B' }]}>
              {`  ${depositLabel}`}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.amount}>{totalEstimatedRent ? `₹${Number(totalEstimatedRent).toLocaleString('en-IN')}` : '₹0'}</Text>
          <View style={[styles.statusPill, { borderColor: statusColor, backgroundColor: `${statusColor}20` }]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>{(status || 'unknown').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.balance} numberOfLines={1}>
          {`Balance: ₹${Number(balanceDue || 0).toLocaleString('en-IN')}`}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnOutline} onPress={onView}>
            <Text style={styles.btnOutlineText}>View</Text>
          </TouchableOpacity>

          {showPay ? (
            <TouchableOpacity style={styles.btnPrimary} onPress={onPay}>
              <Text style={styles.btnPrimaryText}>Pay</Text>
            </TouchableOpacity>
          ) : null}

          {canChat ? (
            <TouchableOpacity style={styles.iconBtn} onPress={onChat}>
              <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginRight: 14,
  },
  middle: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    ...FONTS.body1,
    fontWeight: '700',
    color: '#0f172a',
  },
  meta: {
    ...FONTS.body3,
    color: '#6b7280',
    marginTop: 4,
  },
  metaSmall: {
    ...FONTS.caption,
    color: '#9ca3af',
    marginTop: 2,
  },
  badgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  badgeText: {
    ...FONTS.body4,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    ...FONTS.h4,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusPill: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balance: {
    ...FONTS.body3,
    color: '#4b5563',
    fontWeight: '600',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  btnOutlineText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
});

export default BookingCard;
