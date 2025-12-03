import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../src/context/AuthContext';
import { findUserByPhone } from '../src/services/usersService';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const OWNER_OTP_LENGTH = 6;
const DRIVER_OTP_LENGTH = 4;
const RESEND_SECONDS = 30;
const OTP_TTL_MS = 5 * 60 * 1000;
const normalizePhone = (raw = '') => raw.replace(/\D/g, '').slice(-10);

const MobileOtpLoginScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const userRole = route?.params?.userRole === 'Owner' ? 'Owner' : 'Driver';
  const isOwner = userRole === 'Owner';
  const OTP_LENGTH = isOwner ? OWNER_OTP_LENGTH : DRIVER_OTP_LENGTH;
  const { loginDriverByPhone, loginOwnerByPhone, authLoading } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [otpSending, setOtpSending] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const buttonScale = useRef(new Animated.Value(0)).current;
  const otpInputRefs = useRef([]);

  const maskedNumber = useMemo(() => {
    if (phoneNumber.length < 3) return phoneNumber;
    const lastThree = phoneNumber.slice(-3);
    return `+91 XXXXXXX${lastThree}`;
  }, [phoneNumber]);

  const isPhoneValid = useMemo(() => /^\d{10}$/.test(phoneNumber), [phoneNumber]);
  const isOtpComplete = useMemo(() => otpDigits.every((digit) => digit !== ''), [otpDigits]);

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

  useEffect(() => {
    Animated.spring(buttonScale, {
      toValue: otpSent ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [otpSent, buttonScale]);

  const handleGetOtp = async () => {
    if (!isPhoneValid) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMessage('');

    const normalizedPhone = normalizePhone(phoneNumber);

    if (userRole === 'Driver') {
      try {
        const existing = await findUserByPhone(normalizedPhone);
        if (!existing) {
          setErrorMessage('User not found. Please register first.');
          return;
        }
        if ((existing.role || '').toLowerCase() !== 'driver') {
          setErrorMessage('This number is not registered as a driver.');
          return;
        }
      } catch (error) {
        console.log('lookup error', error);
        setErrorMessage('Something went wrong. Please try again.');
        return;
      }

      setOtpSent(true);
      setResendTimer(RESEND_SECONDS);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpInputRefs.current[0]?.focus();
      return;
    }

    try {
      setOtpSending(true);
      const existing = await findUserByPhone(normalizedPhone);
      if (!existing) {
        setErrorMessage('Owner not found. Please register first.');
        return;
      }
      setOwnerId(existing.id);
      await sendMockOtp(normalizedPhone, existing.id);
      setOtpSent(true);
      setResendTimer(RESEND_SECONDS);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpInputRefs.current[0]?.focus();
    } catch (error) {
      console.log('owner otp send error', error);
      setErrorMessage(error?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setOtpDigits((prev) => {
      const updated = [...prev];
      updated[index] = sanitized.slice(-1);
      return updated;
    });

    if (sanitized && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber) {
      setErrorMessage('Please enter your mobile number.');
      return;
    }

    const enteredOtp = otpDigits.join('').trim();
    if (enteredOtp.length < OTP_LENGTH) {
      setErrorMessage(
        isOwner ? 'Enter the 6-digit OTP shown in the console.' : 'Enter valid OTP (try 1234 for now).',
      );
      return;
    }
    setErrorMessage('');

    if (userRole === 'Driver') {
      try {
        await loginDriverByPhone(normalizedPhone);
        navigation.replace('DriverHome');
      } catch (error) {
        console.log('Login error', error);

        switch (error?.message) {
          case 'USER_NOT_FOUND':
            setErrorMessage('Driver not found. Please register first.');
            break;
          case 'NOT_DRIVER':
            setErrorMessage('This number is not registered as a driver.');
            break;
          case 'USER_BLOCKED':
            setErrorMessage('Your account is blocked. Contact support.');
            break;
          case 'KYC_NOT_APPROVED':
            setErrorMessage('Your KYC is not approved yet. Please wait for admin approval.');
            break;
          case 'PHONE_REQUIRED':
            setErrorMessage('Phone number is required.');
            break;
          default:
            setErrorMessage('Something went wrong. Please try again.');
        }
      }
      return;
    }

    const normalizedPhone = normalizePhone(phoneNumber);
    const verifiedOwnerId = await verifyOwnerOtp(normalizedPhone, enteredOtp);
    if (!verifiedOwnerId) {
      setErrorMessage('Invalid or expired OTP. Please try again.');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpInputRefs.current[0]?.focus();
      return;
    }

    try {
      await loginOwnerByPhone(normalizedPhone);
      navigation.replace('OwnerTabs');
    } catch (error) {
      console.log('Owner login error', error);
      switch (error?.message) {
        case 'USER_NOT_FOUND':
          setErrorMessage('Owner not found. Please register first.');
          break;
        case 'NOT_OWNER':
          setErrorMessage('This number is not registered as an owner.');
          break;
        case 'USER_BLOCKED':
          setErrorMessage('Your account is blocked. Contact support.');
          break;
        case 'KYC_NOT_APPROVED':
          setErrorMessage('Your KYC is not approved yet. Please wait for admin approval.');
          break;
        default:
          setErrorMessage('Something went wrong. Please try again.');
      }
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    if (isOwner) {
      handleGetOtp();
      return;
    }
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setResendTimer(RESEND_SECONDS);
  };

  const handleRegister = () => {
    if (userRole === 'Driver') {
      navigation.navigate('Welcome');
    } else {
      navigation.navigate('OwnerRegistration');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 20, 32) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.brandBlock}>
          <Text style={styles.brandTitle}>UrbanFleet X</Text>
          <Text style={styles.brandSubtitle}>Sign in to continue</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>
              {userRole === 'Driver' ? 'Logging In As Driver' : 'Logging In As Owner'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Login with Mobile</Text>
          <Text style={styles.cardHelper}>Enter your mobile number to receive an OTP.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.phoneInputWrapper}>
              <View style={styles.prefixBlock}>
                <Text style={styles.prefixText}>IN +91</Text>
              </View>
              <View style={styles.divider} />
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter mobile number"
                keyboardType="number-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text.replace(/[^0-9]/g, ''));
                  if (errorMessage) setErrorMessage('');
                }}
                editable={!otpSent}
              />
            </View>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {!otpSent ? (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!isPhoneValid || otpSending) && styles.primaryButtonDisabled,
              ]}
              onPress={handleGetOtp}
              disabled={!isPhoneValid || otpSending}
            >
              <Text style={styles.primaryButtonText}>{otpSending ? 'Sending…' : 'Get OTP'}</Text>
            </TouchableOpacity>
          ) : (
            <Animated.View style={{ transform: [{ scale: buttonScale.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }] }}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!isOtpComplete || authLoading) && styles.primaryButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={!isOtpComplete || authLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {authLoading ? 'Checking…' : 'Login / Continue'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {otpSent && (
            <View style={styles.otpBlock}>
              <Text style={styles.inputLabel}>Enter OTP</Text>
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

              <View style={styles.otpHelperRow}>
                <Text style={styles.otpHelperText}>OTP sent to {maskedNumber}</Text>
                <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
                  <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
                    {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>New to UrbanFleet X? </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>Register now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legalText}>By continuing, you agree to our Terms & Privacy Policy.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A7C6FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0066FF',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#6D6D6D',
    marginTop: 5,
  },
  rolePill: {
    marginTop: 8,
    backgroundColor: '#E0ECFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  rolePillText: {
    fontSize: 11,
    color: '#0066FF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  cardHelper: {
    ...FONTS.body3,
    color: '#6D6D6D',
    marginTop: 6,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: '#0A0A0A',
    marginBottom: 6,
    fontWeight: '600',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  prefixBlock: {
    backgroundColor: '#E5ECFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    backgroundColor: '#D6DAE6',
    marginHorizontal: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  primaryButton: {
    backgroundColor: '#0066FF',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  otpBlock: {
    marginTop: 18,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  otpInput: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  otpHelperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpHelperText: {
    fontSize: 11,
    color: '#6D6D6D',
  },
  resendText: {
    fontSize: 12,
    color: '#0066FF',
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#6D6D6D',
    fontSize: 13,
  },
  registerLink: {
    color: '#0066FF',
    fontSize: 13,
    fontWeight: '600',
  },
  legalText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 32,
  },
});

export default MobileOtpLoginScreen;

const sendMockOtp = async (targetPhoneNumber, targetOwnerId) => {
  if (!targetPhoneNumber) {
    throw new Error('PHONE_REQUIRED');
  }

  const db = firebase.firestore();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const payload = {
    phoneNumber: targetPhoneNumber,
    code,
    ownerId: targetOwnerId || null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    expiresAt: Date.now() + OTP_TTL_MS,
  };

  await db.collection('ownerOtps').add(payload);

  console.log('Owner login OTP', targetPhoneNumber, code);

  return code;
};

const verifyOwnerOtp = async (phoneNumber, code) => {
  try {
    const db = firebase.firestore();
    const snapshot = await db
      .collection('ownerOtps')
      .where('phoneNumber', '==', phoneNumber)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const otpDoc = snapshot.docs[0];
    const otpData = otpDoc.data();

    if (otpData.expiresAt && Date.now() > otpData.expiresAt) {
      return null;
    }

    if (otpData.code !== code) {
      return null;
    }

    try {
      await db.collection('ownerOtps').doc(otpDoc.id).delete();
    } catch (error) {
      console.warn('verifyOwnerOtp delete error', error);
    }

    return otpData.ownerId || null;
  } catch (error) {
    console.error('verifyOwnerOtp error', error);
    return null;
  }
};
