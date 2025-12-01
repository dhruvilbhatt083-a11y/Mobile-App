import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const years = Array.from({ length: 11 }, (_, idx) => 2015 + idx);
const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Electric'];
const transmissions = ['Manual', 'Automatic'];

const AddNewCarScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [carImages, setCarImages] = useState(Array(6).fill(null));
  const [form, setForm] = useState({
    title: '',
    year: '',
    fuelType: '',
    transmission: '',
    location: '',
    plateNumber: '',
    pricePerDay: '',
    description: '',
  });
  const [documents, setDocuments] = useState({
    rcDocument: null,
    insuranceDocument: null,
    permitDocument: null,
  });
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({ visible: false, message: '', isError: false });

  const pickerOptions = useMemo(() => {
    if (pickerType === 'year') return years.map(String);
    if (pickerType === 'fuelType') return fuelTypes;
    if (pickerType === 'transmission') return transmissions;
    return [];
  }, [pickerType]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOpenPicker = (type) => {
    setPickerType(type);
    setPickerVisible(true);
  };

  const handleSelectOption = (value) => {
    setForm((prev) => ({ ...prev, [pickerType]: value }));
    setPickerVisible(false);
  };

  const handleUploadImage = (index) => {
    setCarImages((prev) => {
      const copy = [...prev];
      copy[index] = copy[index] || 'local-placeholder';
      return copy;
    });
  };

  const handleUploadDocument = (key) => {
    setDocuments((prev) => ({ ...prev, [key]: prev[key] || 'uploaded' }));
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const requiredKeys = ['title', 'year', 'fuelType', 'transmission', 'location', 'plateNumber', 'pricePerDay', 'description'];
    const missing = requiredKeys.some((key) => !form[key] || form[key].trim().length === 0);
    if (missing) {
      setFeedbackModal({ visible: true, message: 'Please fill all required fields.', isError: true });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      ...form,
      pricePerDay: Number(form.pricePerDay),
      images: carImages.filter(Boolean),
      documents,
      status: 'Inactive',
      ownerId: 'owner-123',
    };

    console.log('Submitting car listing', payload);
    setFeedbackModal({ visible: true, message: 'Car added successfully!', isError: false });
    setTimeout(() => {
      setFeedbackModal({ visible: false, message: '', isError: false });
      navigation.navigate('OwnerHome');
    }, 1200);
  };

  const renderImageSlots = () => {
    return carImages.map((img, index) => (
      <TouchableOpacity key={index} style={styles.uploadSlot} onPress={() => handleUploadImage(index)}>
        <Ionicons name={img ? 'image' : 'cloud-upload-outline'} size={24} color="#9ca3af" />
        <Text style={styles.uploadLabel}>{img ? 'Uploaded' : 'Upload'}</Text>
      </TouchableOpacity>
    ));
  };

  const renderDocumentSlot = (label, key) => (
    <TouchableOpacity key={key} style={styles.documentSlot} onPress={() => handleUploadDocument(key)}>
      <Ionicons name={documents[key] ? 'document-text' : 'cloud-upload-outline'} size={22} color="#9ca3af" />
      <Text style={styles.documentLabel}>{documents[key] ? 'Uploaded' : label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Car</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Car Photos</Text>
          <View style={styles.photoGrid}>{renderImageSlots()}</View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Car Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Car Title / Model</Text>
            <TextInput
              style={styles.input}
              placeholder="Maruti Suzuki Dzire"
              placeholderTextColor={COLORS.textSecondary}
              value={form.title}
              onChangeText={(text) => updateField('title', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Year</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => handleOpenPicker('year')}>
              <Text style={styles.dropdownValue}>{form.year || 'Select year'}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Fuel Type</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => handleOpenPicker('fuelType')}>
              <Text style={styles.dropdownValue}>{form.fuelType || 'Select fuel type'}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Transmission</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => handleOpenPicker('transmission')}>
              <Text style={styles.dropdownValue}>{form.transmission || 'Select transmission'}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Ahmedabad"
              placeholderTextColor={COLORS.textSecondary}
              value={form.location}
              onChangeText={(text) => updateField('location', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Plate Number</Text>
            <TextInput
              style={styles.input}
              placeholder="GJ 01 AB 1234"
              placeholderTextColor={COLORS.textSecondary}
              value={form.plateNumber}
              onChangeText={(text) => updateField('plateNumber', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Price Per Day (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="900"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              value={form.pricePerDay}
              onChangeText={(text) => updateField('pricePerDay', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
              placeholder="Describe your car, condition, and any extra services."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              value={form.description}
              onChangeText={(text) => updateField('description', text)}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Car Documents</Text>
          <View style={styles.documentsRow}>
            {renderDocumentSlot('RC Book', 'rcDocument')}
            {renderDocumentSlot('Insurance', 'insuranceDocument')}
            {renderDocumentSlot('Permit', 'permitDocument')}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Car Listing</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={pickerVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select {pickerType}</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {pickerOptions.map((option) => (
                <TouchableOpacity key={option} style={styles.modalOption} onPress={() => handleSelectOption(option)}>
                  <Text style={styles.modalOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setPickerVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={feedbackModal.visible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackCard}>
            <Ionicons
              name={feedbackModal.isError ? 'alert-circle' : 'checkmark-circle'}
              size={48}
              color={feedbackModal.isError ? '#ef4444' : '#22c55e'}
            />
            <Text style={styles.feedbackText}>{feedbackModal.message}</Text>
            {!feedbackModal.isError && (
              <Text style={styles.feedbackSub}>Redirecting to dashboard...</Text>
            )}
            {feedbackModal.isError && (
              <TouchableOpacity style={styles.modalClose} onPress={() => setFeedbackModal({ visible: false, message: '', isError: false })}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fbff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.base,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4e7f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.body1,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  cardTitle: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  uploadSlot: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdfdff',
  },
  uploadLabel: {
    ...FONTS.body3,
    color: '#6b7280',
    marginTop: 6,
  },
  formGroup: {
    marginTop: 12,
  },
  label: {
    ...FONTS.body3,
    color: COLORS.text,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    ...FONTS.body2,
    color: COLORS.text,
  },
  dropdown: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  documentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  documentSlot: {
    flex: 1,
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdfdff',
  },
  documentLabel: {
    ...FONTS.body3,
    color: '#6b7280',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButton: {
    backgroundColor: '#0066ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    ...FONTS.body1,
    color: COLORS.background,
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
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 16,
  },
  modalTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f4f7',
  },
  modalOptionText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  modalClose: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  modalCloseText: {
    ...FONTS.body3,
    color: '#1f7cff',
    fontWeight: '600',
  },
  feedbackCard: {
    width: '85%',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  feedbackText: {
    ...FONTS.body1,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  feedbackSub: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
});

export default AddNewCarScreen;
