import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/usersService';

const EditProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, loginDriverByPhone } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setCity(user?.city || '');
  }, [user?.name, user?.city]);

  const handleSave = () => {
    if (!user?.id) {
      setError('Unable to load your profile. Please log in again.');
      return;
    }

    const trimmedName = name?.trim();
    const trimmedCity = city?.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    if (!trimmedCity) {
      setError('Please enter your city.');
      return;
    }

    setSaving(true);
    setError('');

    const performUpdate = async () => {
      try {
        await updateUserProfile(user.id, {
          name: trimmedName,
          city: trimmedCity,
        });

        if (user.phone) {
          await loginDriverByPhone(user.phone);
        }

        navigation.goBack();
      } catch (updateError) {
        console.log('EditProfile update error', updateError);
        setError('Could not update your profile. Please try again.');
      } finally {
        setSaving(false);
      }
    };

    performUpdate();
  };

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
        <Text style={styles.headerTitle}>Edit profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.fieldLabel}>Full name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#9ca3af"
          editable={!saving}
        />

        <Text style={styles.fieldLabel}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Enter your city"
          placeholderTextColor="#9ca3af"
          editable={!saving}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color="#1d4ed8" />
          <Text style={styles.infoText}>
            We use your name and city to show relevant cars and bookings. Phone number is
            managed from your login.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveLabel}>{saving ? 'Saving...' : 'Save changes'}</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  fieldLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...FONTS.body3,
    color: COLORS.text,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoText: {
    ...FONTS.body4,
    color: '#1d4ed8',
    marginLeft: 6,
    flex: 1,
  },
  errorText: {
    ...FONTS.body4,
    color: '#b91c1c',
    marginTop: 12,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 999,
    backgroundColor: '#1f7cff',
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveLabel: {
    ...FONTS.body1,
    color: COLORS.background,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
