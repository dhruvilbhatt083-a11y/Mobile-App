import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CITY_OPTIONS = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'];

const OwnerRegistrationScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(CITY_OPTIONS[0]);
  const [businessType, setBusinessType] = useState('Individual');

  const [idProofFile, setIdProofFile] = useState(null);
  const [addressProofFile, setAddressProofFile] = useState(null);
  const [bankProofFile, setBankProofFile] = useState(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));

  const [uploadModal, setUploadModal] = useState({ visible: false, target: null });
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const otpInputRefs = useRef([]);

  const isPhoneValid = useMemo(() => /^\d{10}$/.test(phoneNumber), [phoneNumber]);
  const maskedNumber = useMemo(() => {
    if (phoneNumber.length < 4) return phoneNumber;
    return `+91 XXXXX${phoneNumber.slice(-4)}`;
  }, [phoneNumber]);

  useEffect(() => {
    if (!otpSent || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const handleSendOtp = () => {
    if (!isPhoneValid) return;
    setOtpSent(true);
    setResendTimer(30);
    setOtpDigits(Array(6).fill(''));
    otpInputRefs.current[0]?.focus();
  };

  const handleOtpChange = (value, index) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setOtpDigits((prev) => {
      const copy = [...prev];
      copy[index] = digit;
      return copy;
    });
    if (digit && index < otpDigits.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    handleSendOtp();
  };

  const openUploadModal = (target) => {
    setUploadModal({ visible: true, target });
  };

  const assignUpload = (sourceLabel) => {
    const fileLabel = `${sourceLabel} selected at ${new Date().toLocaleTimeString()}`;
    switch (uploadModal.target) {
      case 'idProof':
        setIdProofFile(fileLabel);
        break;
      case 'addressProof':
        setAddressProofFile(fileLabel);
        break;
      case 'bankProof':
        setBankProofFile(fileLabel);
        break;
      default:
        break;
    }
    setUploadModal({ visible: false, target: null });
  };

  const renderUploadBlock = (label, subtitle, value, onPress) => (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.uploadLabel}>{label}</Text>
      {subtitle ? <Text style={styles.uploadSub}>{subtitle}</Text> : null}
      <TouchableOpacity style={styles.uploadBox} onPress={onPress} activeOpacity={0.85}>
        {value ? (
          <Text style={styles.uploadValue}>{value}</Text>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Ionicons name="cloud-upload-outline" size={22} color="#9CA3AF" />
            <Text style={styles.uploadPlaceholderText}>Upload {label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const handleSubmit = () => {
    setSuccessModal(true);
  };

  const businessOption = (option) => (
    <TouchableOpacity
      key={option}
      style={[styles.segmentButton, businessType === option && styles.segmentButtonActive]}
      onPress={() => setBusinessType(option)}
    >
      <Text
        style={[styles.segmentText, businessType === option && styles.segmentTextActive]}
      >
        {option}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Create Owner Account</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 80, 140) }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Details</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.fieldLabel}>City</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setCityModalVisible(true)}>
              <Text style={styles.dropdownText}>{city} ▼</Text>
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Business Type</Text>
            <View style={styles.segmentWrapper}>{['Individual', 'Fleet Owner'].map(businessOption)}</View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Verification Documents</Text>
          <View style={styles.card}>
            {renderUploadBlock('ID Proof', 'Aadhaar or PAN Card', idProofFile, () => openUploadModal('idProof'))}
            {renderUploadBlock('Address Proof (Optional)', null, addressProofFile, () => openUploadModal('addressProof'))}
            {renderUploadBlock('Bank Proof (Optional)', null, bankProofFile, () => openUploadModal('bankProof'))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verify Mobile Number</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.prefix}>+91</Text>
              <View style={styles.divider} />
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter mobile number"
                keyboardType="number-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, !isPhoneValid && styles.primaryButtonDisabled]}
              disabled={!isPhoneValid}
              onPress={handleSendOtp}
            >
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            </TouchableOpacity>

            {otpSent && (
              <View style={{ marginTop: 18 }}>
                <Text style={styles.otpTitle}>Enter OTP</Text>
                <Text style={styles.otpSubtitle}>We sent a code to {maskedNumber}</Text>
                <View style={styles.otpRow}>
                  {otpDigits.map((digit, index) => (
                    <TextInput
                      key={`otp-${index}`}
                      ref={(ref) => (otpInputRefs.current[index] = ref)}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(event) => handleOtpKeyPress(event, index)}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.resendWrapper}
                  onPress={handleResend}
                  disabled={resendTimer > 0}
                >
                  <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit for Verification</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent animationType="fade" visible={uploadModal.visible}>
        <View style={styles.modalOverlay}>
          <View style={styles.actionSheet}>
            <Text style={styles.actionSheetTitle}>Upload Document</Text>
            <TouchableOpacity style={styles.actionRow} onPress={() => assignUpload('Photo')}>
              <Ionicons name="camera-outline" size={18} color="#0066FF" />
              <Text style={styles.actionRowText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} onPress={() => assignUpload('Gallery')}>
              <Ionicons name="images-outline" size={18} color="#0066FF" />
              <Text style={styles.actionRowText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} onPress={() => assignUpload('File')}>
              <Ionicons name="document-outline" size={18} color="#0066FF" />
              <Text style={styles.actionRowText}>Choose File</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCancel}
              onPress={() => setUploadModal({ visible: false, target: null })}
            >
              <Text style={styles.actionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={cityModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.cityCard}>
            <Text style={styles.actionSheetTitle}>Select City</Text>
            {CITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.actionRow}
                onPress={() => {
                  setCity(option);
                  setCityModalVisible(false);
                }}
              >
                <Text style={styles.actionRowText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.actionCancel} onPress={() => setCityModalVisible(false)}>
              <Text style={styles.actionCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={successModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
            <Text style={styles.successTitle}>Submitted!</Text>
            <Text style={styles.successText}>Your registration has been sent for verification.</Text>
            <TouchableOpacity style={styles.successBtn} onPress={() => setSuccessModal(false)}>
              <Text style={styles.successBtnText}>Close</Text>
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
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },
  dropdown: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  segmentWrapper: {
    flexDirection: 'row',
    backgroundColor: '#EFF1F5',
    borderRadius: 12,
    padding: 3,
    marginTop: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#0066FF',
  },
  segmentText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  uploadLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  uploadSub: {
    fontSize: 12,
    color: '#6B7180',
    marginTop: 2,
  },
  uploadBox: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadPlaceholderText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  uploadValue: {
    fontSize: 13,
    color: '#111827',
    textAlign: 'center',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
  },
  prefix: {
    fontWeight: '600',
    color: '#0066FF',
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
  primaryButton: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#BFD4FF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  otpTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  otpSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  otpInput: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  resendWrapper: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  resendText: {
    fontSize: 12,
    color: '#0066FF',
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
  submitButton: {
    marginTop: 24,
    marginHorizontal: 16,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  actionSheet: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
  },
  cityCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    gap: 12,
  },
  actionRowText: {
    fontSize: 14,
    color: '#111827',
  },
  actionCancel: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  actionCancelText: {
    color: '#0066FF',
    fontWeight: '600',
  },
  successCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 18,
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
    marginTop: 8,
  },
  successBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#0066FF',
  },
  successBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default OwnerRegistrationScreen;
