import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import { createUser } from '../src/services/usersService';
import { useAuth } from '../src/context/AuthContext';

const placeholders = {
  camera: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  gallery: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
};

const DriverVerificationScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    streetAddress: '',
    city: '',
    stateName: '',
    pinCode: '',
  });
  const [dlFrontImage, setDlFrontImage] = useState(null);
  const [dlBackImage, setDlBackImage] = useState(null);
  const [idProofImage, setIdProofImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [pickerModal, setPickerModal] = useState({ visible: false, target: null });
  const [successModal, setSuccessModal] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { loginDriverByPhone } = useAuth();

  const requiredLabel = (label) => (
    <Text style={styles.inputLabel}>
      {label}
      <Text style={styles.requiredMark}> *</Text>
    </Text>
  );

  const openPicker = (target) => {
    setPickerModal({ visible: true, target });
  };

  const assignImage = (sourceType) => {
    const uri = placeholders[sourceType];
    if (!uri) return;
    switch (pickerModal.target) {
      case 'dlFront':
        setDlFrontImage(uri);
        break;
      case 'dlBack':
        setDlBackImage(uri);
        break;
      case 'idProof':
        setIdProofImage(uri);
        break;
      case 'selfie':
        setSelfieImage(uri);
        break;
      default:
        break;
    }
    setPickerModal({ visible: false, target: null });
  };

  const removeImage = (key) => {
    if (key === 'dlFront') setDlFrontImage(null);
    if (key === 'dlBack') setDlBackImage(null);
    if (key === 'idProof') setIdProofImage(null);
    if (key === 'selfie') setSelfieImage(null);
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const fullName = profile.fullName?.trim();
    const phone = profile.phoneNumber?.trim();
    const city = profile.city?.trim();

    if (!fullName || !phone || phone.length !== 10 || !city) {
      setSubmitError('Please enter your name, a valid phone number, and city.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await createUser({
        name: fullName,
        phone,
        role: 'driver',
        city,
        aadhaarNumber: '',
        licenseNumber: '',
      });

      setSuccessModal(true);
    } catch (error) {
      console.log('Register error', error);
      if (error?.message === 'USER_ALREADY_EXISTS') {
        setSubmitError('This number is already registered. Please log in instead.');
      } else if (error?.message === 'PHONE_REQUIRED') {
        setSubmitError('Please enter a valid mobile number.');
      } else {
        setSubmitError('Something went wrong while creating your profile. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderUploadBox = (options) => {
    const { label, subtitle, value, onPress, onRemove, style } = options;
    return (
      <TouchableOpacity style={[styles.uploadBox, style]} onPress={onPress} activeOpacity={0.8}>
        {value ? (
          <View style={styles.uploadPreviewWrapper}>
            <Image source={{ uri: value }} style={styles.uploadPreview} />
            <TouchableOpacity style={styles.uploadRemove} onPress={onRemove}>
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.uploadChangeText}>Tap to change</Text>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Ionicons name="cloud-upload-outline" size={24} color="#9CA3AF" />
            <Text style={styles.uploadLabel}>{label}</Text>
            {subtitle ? <Text style={styles.uploadHint}>{subtitle}</Text> : null}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Driver Verification</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 140, 200) }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tell us about yourself</Text>
          <View style={styles.card}>
            {requiredLabel('Full Name')}
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={profile.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
            />

            {requiredLabel('Mobile Number')}
            <View style={styles.phoneInputWrapper}>
              <View style={styles.prefixPill}>
                <Text style={styles.prefixText}>IN +91</Text>
              </View>
              <View style={styles.divider} />
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter mobile number"
                keyboardType="number-pad"
                maxLength={10}
                value={profile.phoneNumber}
                onChangeText={(text) => handleInputChange('phoneNumber', text.replace(/[^0-9]/g, ''))}
              />
            </View>

            {requiredLabel('Email Address')}
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={profile.email}
              onChangeText={(text) => handleInputChange('email', text)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          <View style={styles.card}>
            {requiredLabel('Street Address')}
            <TextInput
              style={styles.input}
              placeholder="House / Flat / Street"
              value={profile.streetAddress}
              onChangeText={(text) => handleInputChange('streetAddress', text)}
            />

            {requiredLabel('City')}
            <TextInput
              style={styles.input}
              placeholder="City"
              value={profile.city}
              onChangeText={(text) => handleInputChange('city', text)}
            />

            {requiredLabel('State')}
            <TextInput
              style={styles.input}
              placeholder="State"
              value={profile.stateName}
              onChangeText={(text) => handleInputChange('stateName', text)}
            />

            {requiredLabel('PIN Code')}
            <TextInput
              style={styles.input}
              placeholder="PIN Code"
              keyboardType="number-pad"
              maxLength={6}
              value={profile.pinCode}
              onChangeText={(text) => handleInputChange('pinCode', text.replace(/[^0-9]/g, ''))}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Driving License</Text>
          <View style={styles.card}>
            <View style={styles.uploadRow}>
              {renderUploadBox({
                label: 'Upload Front',
                subtitle: 'JPEG, PNG, PDF',
                value: dlFrontImage,
                onPress: () => openPicker('dlFront'),
                onRemove: () => removeImage('dlFront'),
                style: { flex: 1 },
              })}
              {renderUploadBox({
                label: 'Upload Back',
                subtitle: 'JPEG, PNG, PDF',
                value: dlBackImage,
                onPress: () => openPicker('dlBack'),
                onRemove: () => removeImage('dlBack'),
                style: { flex: 1 },
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload ID Proof</Text>
          <View style={styles.card}>
            {renderUploadBox({
              label: 'Upload Aadhaar / PAN',
              subtitle: 'JPEG, PNG, PDF',
              value: idProofImage,
              onPress: () => openPicker('idProof'),
              onRemove: () => removeImage('idProof'),
              style: { width: '100%' },
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selfie Verification</Text>
          <View style={styles.card}>
            {renderUploadBox({
              label: 'Take Live Selfie',
              subtitle: 'Ensure your face is clearly visible.',
              value: selfieImage,
              onPress: () => openPicker('selfie'),
              onRemove: () => removeImage('selfie'),
              style: { width: '100%', height: 190 },
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}>
        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        <TouchableOpacity
          style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? 'Creating profile…' : 'Create Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal transparent animationType="fade" visible={pickerModal.visible}>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.modalTitle}>Choose an option</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => assignImage('camera')}>
              <Ionicons name="camera-outline" size={18} color="#0066FF" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => assignImage('gallery')}>
              <Ionicons name="image-outline" size={18} color="#0066FF" />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setPickerModal({ visible: false, target: null })}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={successModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
            <Text style={styles.successTitle}>Profile submitted</Text>
            <Text style={styles.successText}>
              Our team will verify your documents within 24 hours. You can log in once KYC is approved.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setSuccessModal(false);
                navigation.replace('MobileOtpLogin');
              }}
            >
              <Text style={styles.successButtonText}>Go to Login</Text>
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
    backgroundColor: '#F9FBFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  inputLabel: {
    ...FONTS.body3,
    color: '#111827',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  requiredMark: {
    color: '#EF4444',
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },
  phoneInputWrapper: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  prefixPill: {
    backgroundColor: '#E5ECFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  prefixText: {
    fontSize: 12,
    color: '#0066FF',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadLabel: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    marginTop: 8,
  },
  uploadHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  uploadPreviewWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  uploadPreview: {
    width: '100%',
    height: '100%',
  },
  uploadRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(17,24,39,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadChangeText: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(249, 251, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
    gap: 12,
  },
  modalOptionText: {
    fontSize: 14,
    color: '#111827',
  },
  modalCancel: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  modalCancelText: {
    color: '#0066FF',
    fontWeight: '600',
  },
  successCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  successText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
  successButton: {
    marginTop: 16,
    backgroundColor: '#0066FF',
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  successButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default DriverVerificationScreen;
