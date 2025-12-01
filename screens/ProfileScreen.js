import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DriverBottomNav from '../components/DriverBottomNav';
import ProfileHeader from '../components/ProfileHeader';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../src/context/AuthContext';

const placeholderAvatar = 'https://i.pravatar.cc/150?img=32';

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const statusMeta = (status) => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'approved':
    case 'verified':
      return { label: 'Verified', bg: '#DCFCE7', color: '#166534' };
    case 'under_review':
    case 'review':
      return { label: 'Under review', bg: '#E0F2FE', color: '#0369A1' };
    case 'rejected':
      return { label: 'Rejected', bg: '#FEE2E2', color: '#B91C1C' };
    default:
      return { label: 'Pending', bg: '#FEF3C7', color: '#92400E' };
  }
};

const KycBadge = ({ label, status }) => {
  const meta = statusMeta(status);
  const icon = meta.label === 'Verified' ? 'checkmark-circle' : meta.label === 'Rejected' ? 'close-circle' : 'alert-circle';
  return (
    <View style={[styles.kycBadge, { backgroundColor: meta.bg, borderColor: meta.bg }]}> 
      <Ionicons name={icon} size={16} color={meta.color} />
      <Text style={[styles.kycLabel, { color: meta.color }]}>{label}</Text>
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const driver = user || {
    name: 'Driver Name',
    phone: '+91 9XXXXXXXX',
    avatarUrl: null,
    rating: 4.6,
    earningsSummary: { week: 8450, total: 85000 },
    kyc: {
      overallStatus: 'pending',
      licenceStatus: 'pending',
      aadharStatus: 'pending',
      photoStatus: 'pending',
    },
    joinedAt: null,
    stats: {
      totalBookings: 0,
      activeBookings: 0,
      daysRented: 0,
    },
  };

  const stats = {
    weeklyEarnings: driver.earningsSummary?.week ?? driver.earnings?.week ?? 0,
    lifetimeEarnings: driver.earningsSummary?.total ?? driver.earnings?.total ?? 0,
    totalBookings: driver.stats?.totalBookings ?? driver.totalBookings ?? 0,
    activeBookings: driver.stats?.activeBookings ?? driver.activeBookings ?? 0,
    daysRented: driver.stats?.daysRented ?? 0,
  };

  const kycStatuses = {
    overall: driver.kyc?.overallStatus || driver.kycStatus,
    licence: driver.kyc?.licenceStatus,
    aadhar: driver.kyc?.aadharStatus,
    photo: driver.kyc?.photoStatus,
  };

  const overallMeta = statusMeta(kycStatuses.overall);
  const kycNeedsAttention = overallMeta.label !== 'Verified';

  const documentTiles = [
    { key: 'licence', label: 'Driving licence', status: kycStatuses.licence },
    { key: 'aadhar', label: 'Aadhaar', status: kycStatuses.aadhar },
    { key: 'photo', label: 'Profile photo', status: kycStatuses.photo },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom + 80, 140) }]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          user={driver}
          onEdit={() => navigation.navigate('EditProfile')}
          onDocuments={() => navigation.navigate('KycDocuments')}
          onNotifications={() => navigation.navigate('Notifications')}
        />

        <View style={styles.statusStrip}>
          <View style={[styles.overallBadge, { backgroundColor: overallMeta.bg }]}
          >
            <Ionicons name={overallMeta.label === 'Verified' ? 'shield-checkmark' : 'alert-circle'} size={16} color={overallMeta.color} />
            <Text style={[styles.overallBadgeText, { color: overallMeta.color }]}>KYC {overallMeta.label}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('KycDocuments')}>
            <Text style={styles.kycActionText}>{overallMeta.label === 'Verified' ? 'View documents' : 'Upload documents'}</Text>
          </TouchableOpacity>
        </View>

        {kycNeedsAttention ? (
          <View style={styles.warningBanner}>
            <Ionicons name="alert-circle" size={18} color="#B45309" />
            <Text style={styles.warningText}>
              KYC pending — you cannot confirm bookings until documents are approved. Tap to upload.
            </Text>
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('MyBookings')}>
            <Text style={styles.statValue}>{stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Total bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('MyBookings')}>
            <Text style={styles.statValue}>{stats.activeBookings}</Text>
            <Text style={styles.statLabel}>Active bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('MyBookings')}>
            <Text style={styles.statValue}>{stats.daysRented}</Text>
            <Text style={styles.statLabel}>Days rented</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subStatCard}>
          <View>
            <Text style={styles.subStatLabel}>Lifetime earnings</Text>
            <Text style={styles.subStatValue}>{formatCurrency(stats.lifetimeEarnings)}</Text>
          </View>
          <View>
            <Text style={styles.subStatLabel}>This week</Text>
            <Text style={styles.subStatValue}>{formatCurrency(stats.weeklyEarnings)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KYC documents</Text>
          <Text style={styles.sectionSub}>Stay verified to keep receiving bookings</Text>
          <View style={styles.docGrid}>
            {documentTiles.map((doc) => {
              const meta = statusMeta(doc.status);
              const ctaLabel = meta.label === 'Verified' ? 'View' : 'Upload';
              return (
                <View key={doc.key} style={styles.docTile}>
                  <View style={[styles.docStatusPill, { backgroundColor: meta.bg }]}
                  >
                    <Ionicons name="document-text" size={14} color={meta.color} />
                    <Text style={[styles.docStatusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                  <Text style={styles.docLabel}>{doc.label}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('KycDocuments')}>
                    <Text style={styles.docCta}>{ctaLabel}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account info</Text>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={18} color="#1F7CFF" />
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{driver.phone || 'Not set'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#1F7CFF" />
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoLabel}>Joined</Text>
                <Text style={styles.infoValue}>
                  {driver.joinedAt ? new Date(driver.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="navigate-circle-outline" size={18} color="#1F7CFF" />
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoLabel}>City</Text>
                <Text style={styles.infoValue}>{driver.city || 'Not set'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('HelpAndSupport')}>
              <View style={styles.menuLeft}>
                <Ionicons name="help-circle" size={20} color="#1F7CFF" />
              </View>
              <Text style={styles.menuLabel}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuRow, styles.logoutRow]}
              onPress={() => {
                navigation.replace('Login');
              }}
            >
              <View style={styles.menuLeft}>
                <Ionicons name="log-out" size={20} color="#EF4444" />
              </View>
              <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Logout</Text>
              <Ionicons name="chevron-forward" size={20} color="#FCA5A5" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <DriverBottomNav activeTab="profile" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFF',
  },
  scroll: {
    padding: 16,
  },
  roleText: {
    ...FONTS.body3,
    color: '#6B7280',
    marginTop: 4,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#D5E3FF',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    marginHorizontal: 5,
  },
  statValue: {
    ...FONTS.h3,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  statLabel: {
    ...FONTS.body4,
    color: '#6B7280',
    marginTop: 6,
  },
  subStatCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#D5E3FF',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  subStatLabel: {
    ...FONTS.body3,
    color: '#6B7280',
  },
  subStatValue: {
    ...FONTS.h3,
    fontWeight: '700',
    marginTop: 4,
  },
  statusStrip: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  overallBadgeText: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  warningBanner: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  warningText: {
    ...FONTS.body3,
    color: '#92400E',
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    ...FONTS.body1,
    fontWeight: '700',
  },
  sectionSub: {
    ...FONTS.body3,
    color: '#6B7280',
    marginTop: 4,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  kycLabel: {
    marginLeft: 8,
    fontWeight: '600',
  },
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  docTile: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#E1E8F8',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  docStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
    alignSelf: 'flex-start',
  },
  docStatusText: {
    ...FONTS.caption,
    fontWeight: '600',
  },
  docLabel: {
    ...FONTS.body2,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  docCta: {
    color: '#1F7CFF',
    fontWeight: '700',
  },
  infoList: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#E1E8F8',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  infoTextBlock: {
    flex: 1,
  },
  infoLabel: {
    ...FONTS.body4,
    color: '#6B7280',
  },
  infoValue: {
    ...FONTS.body2,
    fontWeight: '600',
    marginTop: 2,
  },
  helperText: {
    ...FONTS.caption,
    color: '#9CA3AF',
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 12,
    paddingVertical: 4,
    shadowColor: '#E1E8F8',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  menuLeft: {
    width: 28,
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
    ...FONTS.body1,
  },
  logoutRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#FEE2E2',
  },
});

export default ProfileScreen;
