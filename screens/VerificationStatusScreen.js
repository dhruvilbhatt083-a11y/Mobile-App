import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabs = ['Pending', 'Approved', 'Rejected'];
const documents = ['Driving License', 'ID Proof', 'Selfie Verification'];

const VerificationStatusScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setModalVisible] = useState(false);

  const handleBack = () => {
    navigation.navigate('MobileOtpLogin');
  };

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleBackToLogin = () => {
    setModalVisible(false);
    navigation.navigate('MobileOtpLogin');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <ScrollView contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 140, 200) }}>
        <View style={styles.tabsRow}>
          {tabs.map((tab) => (
            <View
              key={tab}
              style={[styles.tabPill, tab === 'Pending' ? styles.tabActive : styles.tabInactive]}
            >
              <Text style={[styles.tabText, tab === 'Pending' ? styles.tabTextActive : styles.tabTextInactive]}>
                {tab}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Verification Status</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.statusCenter}>
          <View style={styles.statusIconWrapper}>
            <Ionicons name="time-outline" size={42} color="#FFC107" />
          </View>
          <Text style={styles.statusHeading}>Verification Pending</Text>
          <Text style={styles.statusSubtext}>
            Your documents are under review. This usually takes 2–6 hours.
          </Text>
        </View>

        <View style={styles.card}>
          {documents.map((doc, index) => (
            <View key={doc} style={styles.cardRow}>
              <Ionicons name="time-outline" size={18} color="#9CA3AF" />
              <Text style={styles.cardRowText}>{doc}</Text>
              <Ionicons name="time-outline" size={16} color="#9CA3AF" />
              {index < documents.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}>
        <TouchableOpacity style={styles.secondaryButton} onPress={openModal}>
          <Text style={styles.secondaryButtonText}>Back to Login</Text>
        </TouchableOpacity>
        <View style={styles.disabledButton}>
          <Text style={styles.disabledButtonText}>Under Review</Text>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={isModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
              <Ionicons name="close" size={18} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Verification in Progress</Text>
            <Text style={styles.modalMessage}>
              The process is under review. You will get SMS when your account is verified. Please login with the same number to start earning.
            </Text>
            <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleBackToLogin}>
              <Text style={styles.modalPrimaryText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: '#FFC107',
  },
  tabInactive: {
    backgroundColor: '#F3F4F6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#111827',
  },
  tabTextInactive: {
    color: '#6B7280',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusCenter: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  statusIconWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFF7D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 18,
  },
  statusSubtext: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  cardRowText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  rowDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#F1F3F5',
  },
  bottomActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFC107',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#FFC107',
    fontWeight: '600',
  },
  disabledButton: {
    height: 50,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButtonText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 10,
    color: '#111827',
  },
  modalMessage: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  modalPrimaryButton: {
    marginTop: 18,
    backgroundColor: '#FFC107',
    borderRadius: 12,
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#111827',
    fontWeight: '600',
  },
});

export default VerificationStatusScreen;
