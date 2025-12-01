import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';

const PLACEHOLDER = 'https://i.pravatar.cc/150?img=32';

const statusMeta = (status) => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'approved':
    case 'verified':
      return { label: 'Verified', bg: '#ECFDF5', color: '#059669', icon: 'shield-checkmark' };
    case 'under_review':
      return { label: 'Under review', bg: '#E0F2FE', color: '#0369A1', icon: 'time' };
    case 'rejected':
      return { label: 'Rejected', bg: '#FEE2E2', color: '#B91C1C', icon: 'alert-circle' };
    default:
      return { label: 'Pending', bg: '#FFF7ED', color: '#C2410C', icon: 'time' };
  }
};

const ProfileHeader = ({ user, onEdit, onDocuments, onNotifications }) => {
  const avatarUrl = user?.avatarUrl;
  const name = user?.name || 'Driver';
  const role = (user?.role || 'Driver').replace(/(^|\s)\S/g, (c) => c.toUpperCase());
  const city = user?.city || 'City not set';
  const overallStatus = user?.kyc?.overallStatus || user?.kycStatus;
  const meta = statusMeta(overallStatus);

  return (
    <View style={styles.header}>
      <Image source={{ uri: avatarUrl || PLACEHOLDER }} style={styles.avatar} />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.role}>{role} • {city}</Text>

        <View style={styles.badgeRow}>
          <TouchableOpacity
            style={[styles.kycPill, { backgroundColor: meta.bg }]}
            activeOpacity={0.8}
            onPress={onDocuments}
          >
            <Ionicons name={meta.icon} size={14} color={meta.color} />
            <Text style={[styles.kycText, { color: meta.color }]}>{meta.label}</Text>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            {onNotifications ? (
              <TouchableOpacity style={styles.iconBtn} onPress={onNotifications}>
                <Ionicons name="notifications-outline" size={16} color="#0f172a" />
              </TouchableOpacity>
            ) : null}

            {onEdit ? (
              <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
                <Ionicons name="pencil" size={16} color="#0f172a" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#A7C6FF',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginRight: 16,
    backgroundColor: '#E5E7EB',
  },
  info: {
    flex: 1,
  },
  name: {
    ...FONTS.h3,
    fontWeight: '700',
    color: '#0f172a',
  },
  role: {
    ...FONTS.body3,
    color: '#6B7280',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
    justifyContent: 'space-between',
  },
  kycPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  kycText: {
    ...FONTS.body4,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
});

export default ProfileHeader;
