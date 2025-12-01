import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/usersService';
import { COLORS, FONTS } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker';

const EditDriverProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [licence, setLicence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localPhoto, setLocalPhoto] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAadhaar(user.aadhaarNumber || '');
      setLicence(user.licenseNumber || '');
    }
  }, [user]);

  const pickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission?.status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo access to select a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri;
        setLocalPhoto(uri || null);
      }
    } catch (pickerError) {
      console.log('Image picker error', pickerError);
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    const trimmedName = name?.trim();
    const trimmedAadhaar = aadhaar?.trim();
    const trimmedLicence = licence?.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    if (!trimmedAadhaar || !trimmedLicence) {
      setError('Aadhaar and licence numbers are required to book cars.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateUserProfile(user.id, {
        name: trimmedName,
        aadhaarNumber: trimmedAadhaar,
        licenseNumber: trimmedLicence,
      });
      await refreshUser();

      navigation.goBack();
    } catch (err) {
      console.log('Update error', err);
      setError('We could not save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const photoSource = localPhoto
    ? { uri: localPhoto }
    : user?.photoUrl
    ? { uri: user.photoUrl }
    : null;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.photoSection}>
          {photoSource ? (
            <Image source={photoSource} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoInitials}>{user?.name ? user.name[0]?.toUpperCase() : 'D'}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
            <Text style={styles.photoButtonText}>Add / Change Photo</Text>
          </TouchableOpacity>
          {localPhoto ? (
            <Text style={styles.photoHint}>Preview is local-only until Storage is enabled.</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phone} editable={false} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Aadhaar Number</Text>
          <TextInput
            style={styles.input}
            value={aadhaar}
            onChangeText={setAadhaar}
            placeholder="Enter Aadhaar Number"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Driving Licence Number</Text>
          <TextInput
            style={styles.input}
            value={licence}
            onChangeText={setLicence}
            placeholder="Enter Licence Number"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    padding: 20,
  },
  title: {
    ...FONTS.h2,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  photoSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  photoPreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitials: {
    ...FONTS.h2,
    color: '#1f3a8a',
    fontWeight: '700',
  },
  photoButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1f7cff',
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  photoHint: {
    marginTop: 6,
    ...FONTS.body4,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  label: {
    ...FONTS.body3,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  errorText: {
    ...FONTS.body4,
    color: '#b91c1c',
    marginTop: 6,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#1f7cff',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default EditDriverProfileScreen;
