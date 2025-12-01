import React, { useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useAuth } from '../context/AuthContext';

const normalizeKyc = (kyc) => ({
  overallStatus: kyc?.overallStatus || kyc?.overall || 'pending',
  licenceStatus: kyc?.licenceStatus || 'pending',
  aadharStatus: kyc?.aadharStatus || kyc?.aadhaarStatus || 'pending',
  photoStatus: kyc?.photoStatus || 'pending',
});

const statusLabel = (status, verifiedLabel = 'Verified') => {
  const normalized = (status || 'pending').toString().toLowerCase();
  if (normalized === 'verified') return verifiedLabel;
  if (normalized === 'rejected') return 'Rejected';
  return 'Pending';
};

const statusColors = (status) => {
  const normalized = (status || '').toString().toLowerCase();
  switch (normalized) {
    case 'verified':
      return { bg: '#dcfce7', text: '#166534' };
    case 'rejected':
      return { bg: '#fee2e2', text: '#b91c1c' };
    default:
      return { bg: '#fef3c7', text: '#92400e' };
  }
};

const DriverDocumentsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const kyc = useMemo(() => normalizeKyc(user?.kyc || {}), [user?.kyc]);
  const overallLabel = statusLabel(kyc.overallStatus, 'Verified');
  const licenceLabel = statusLabel(kyc.licenceStatus, 'Approved');
  const aadharLabel = statusLabel(kyc.aadharStatus, 'Approved');
  const photoLabel = statusLabel(kyc.photoStatus, 'Approved');
  const pillColor = statusColors(kyc.overallStatus);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC & documents</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Verification status</Text>
          <View style={[styles.statusPill, { backgroundColor: pillColor.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: pillColor.text }]} />
            <Text style={[styles.statusText, { color: pillColor.text }]}>{overallLabel}</Text>
          </View>
          <Text style={styles.statusSubtitle}>
            Once all documents are verified, you can book cars without delays.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your documents</Text>

          <DocRow
            icon="card-outline"
            title="Driving licence"
            subtitle="Front + back image"
            status={licenceLabel}
          />
          <DocRow
            icon="id-card-outline"
            title="ID proof (Aadhaar / PAN)"
            subtitle="Government ID to verify identity"
            status={aadharLabel}
          />
          <DocRow
            icon="person-circle-outline"
            title="Profile photo"
            subtitle="Clear photo with face visible"
            status={photoLabel}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#4b5563" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.infoTitle}>Why documents are needed</Text>
            <Text style={styles.infoText}>
              We verify every driver to protect car owners and keep the platform safe.
              Your documents are securely stored and only used for verification.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DocRow = ({ icon, title, subtitle, status }) => {
  const isVerified = status === 'Verified';
  const isPending = status === 'Pending';

  const statusColor = isVerified ? '#16a34a' : isPending ? '#ea580c' : '#b91c1c';

  return (
    <View style={styles.docRow}>
      <View style={styles.docIconCircle}>
        <Ionicons name={icon} size={20} color="#1f7cff" />
      </View>
      <View style={styles.docTextBlock}>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={styles.docSubtitle}>{subtitle}</Text>
      </View>
      <Text style={[styles.docStatus, { color: statusColor }]}>{status}</Text>
    </View>
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
  statusCard: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SIZES.padding,
    shadowColor: '#9fb5d6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 4,
  },
  statusTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...FONTS.body4,
    fontWeight: '600',
  },
  statusSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  section: {
    marginHorizontal: SIZES.padding,
    marginTop: 20,
  },
  sectionTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: 8,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  docIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0ecff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  docTextBlock: {
    flex: 1,
  },
  docTitle: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  docSubtitle: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  docStatus: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SIZES.padding,
    marginTop: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    ...FONTS.body3,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoText: {
    ...FONTS.body4,
    color: '#4b5563',
  },
});

export default DriverDocumentsScreen;
