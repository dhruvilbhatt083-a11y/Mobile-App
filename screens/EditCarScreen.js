import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const mockCars = [
  {
    id: 'car-1',
    title: 'Maruti Suzuki Dzire 2019',
    year: '2019',
    fuelType: 'Petrol',
    transmission: 'Manual',
    location: 'Ahmedabad',
    plateNumber: 'GJ 01 AB 3421',
    pricePerDay: '900',
    description:
      'Well maintained car used for daily taxi rentals. Great mileage and comfortable.',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1610465299996-866cbd9d753e?auto=format&fit=crop&w=600&q=60',
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=60',
    ],
    rcDocument: 'RC_Book.pdf',
    insuranceDocument: 'Insurance_2025.pdf',
    permitDocument: null,
    ownerId: 'owner-123',
  },
];

const years = Array.from({ length: 11 }, (_, idx) => `${2015 + idx}`);
const fuelOptions = ['Petrol', 'Diesel', 'CNG', 'Electric'];
const transmissionOptions = ['Manual', 'Automatic'];
const statuses = ['Available', 'Booked', 'Inactive'];

const EditCarScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { carId } = route.params || {};
  const carData = useMemo(() => mockCars.find((car) => car.id === carId) || mockCars[0], [carId]);

  const [images, setImages] = useState(carData.images || []);
  const [form, setForm] = useState({
    title: carData.title || '',
    year: carData.year || '',
    fuelType: carData.fuelType || '',
    transmission: carData.transmission || '',
    location: carData.location || '',
    plateNumber: carData.plateNumber || '',
    pricePerDay: carData.pricePerDay || '',
    description: carData.description || '',
  });
  const [status, setStatus] = useState(carData.status || 'Available');
  const [documents, setDocuments] = useState({
    rcDocument: carData.rcDocument,
    insuranceDocument: carData.insuranceDocument,
    permitDocument: carData.permitDocument,
  });
  const [pickerModal, setPickerModal] = useState({ visible: false, field: null, options: [] });
  const [feedbackModal, setFeedbackModal] = useState({ visible: false, success: true, message: '' });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const openPicker = (field, options) => {
    setPickerModal({ visible: true, field, options });
  };

  const handleSelectOption = (value) => {
    if (pickerModal.field) {
      setForm((prev) => ({ ...prev, [pickerModal.field]: value }));
    }
    setPickerModal({ visible: false, field: null, options: [] });
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddPhoto = () => {
    if (images.length >= 6) return;
    setImages((prev) => [...prev, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=60']);
  };

  const handleRemovePhoto = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDocumentAction = (key) => {
    setDocuments((prev) => ({ ...prev, [key]: prev[key] ? null : `${key}.pdf` }));
  };

  const validateForm = () => {
    const required = ['title', 'year', 'fuelType', 'transmission', 'location', 'plateNumber', 'pricePerDay'];
    return required.every((key) => form[key] && String(form[key]).trim().length > 0);
  };

  const handleSave = () => {
    if (!validateForm()) {
      setFeedbackModal({ visible: true, success: false, message: 'Please fill all required fields.' });
      return;
    }
    const payload = {
      id: carId,
      ...form,
      status,
      images,
      ...documents,
    };
    console.log('Saving car', payload);
    setFeedbackModal({ visible: true, success: true, message: 'Changes Saved!\nYour car listing has been updated.' });
  };

  const handleDelete = () => {
    setDeleteModalVisible(false);
    console.log('Deleting car', carId);
    navigation.navigate('OwnerHome');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Car</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Car Photos</Text>
          <View style={styles.photoGrid}>
            {images.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.photoTile}>
                <Image source={{ uri }} style={styles.photoImage} />
                <TouchableOpacity style={styles.photoDelete} onPress={() => handleRemovePhoto(index)}>
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 6 && (
              <TouchableOpacity style={styles.photoPlaceholder} onPress={handleAddPhoto}>
                <Ionicons name="cloud-upload-outline" size={24} color="#9ca3af" />
                <Text style={styles.photoPlaceholderText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Car Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Car Title / Model</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(text) => updateField('title', text)}
              placeholder="Maruti Suzuki Dzire 2019"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Year</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => openPicker('year', years)}>
              <Text style={styles.dropdownValue}>{form.year || 'Select year'}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Fuel Type</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => openPicker('fuelType', fuelOptions)}>
              <Text style={styles.dropdownValue}>{form.fuelType || 'Select fuel type'}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Transmission</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => openPicker('transmission', transmissionOptions)}
            >
              <Text style={styles.dropdownValue}>{form.transmission || 'Select transmission'}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={(text) => updateField('location', text)}
              placeholder="Ahmedabad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Plate Number</Text>
            <TextInput
              style={styles.input}
              value={form.plateNumber}
              onChangeText={(text) => updateField('plateNumber', text)}
              placeholder="GJ 01 AB 3421"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Price Per Day (₹)</Text>
            <TextInput
              style={styles.input}
              value={form.pricePerDay}
              onChangeText={(text) => updateField('pricePerDay', text)}
              placeholder="900"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              multiline
              value={form.description}
              onChangeText={(text) => updateField('description', text)}
              placeholder="Well maintained car used for daily taxi rentals..."
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Availability Status</Text>
          <View style={styles.statusRow}>
            {statuses.map((statusOption) => {
              const isActive = status === statusOption;
              return (
                <TouchableOpacity
                  key={statusOption}
                  style={[styles.statusPill, isActive && styles.statusPillActive]}
                  onPress={() => setStatus(statusOption)}
                >
                  <Text style={[styles.statusPillText, isActive && styles.statusPillTextActive]}>{statusOption}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Car Documents</Text>
          <View style={styles.documentsRow}>
            {['rcDocument', 'insuranceDocument', 'permitDocument'].map((key) => (
              <View key={key} style={styles.documentTile}>
                <View style={styles.documentHeader}>
                  <Text style={styles.documentLabel}>{
                    key === 'rcDocument' ? 'RC Book' : key === 'insuranceDocument' ? 'Insurance' : 'Permit'
                  }</Text>
                  {documents[key] && (
                    <TouchableOpacity onPress={() => handleDocumentAction(key)}>
                      <Ionicons name="close" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity style={styles.documentBody} onPress={() => handleDocumentAction(key)}>
                  {documents[key] ? (
                    <>
                      <Ionicons name="document-text-outline" size={28} color="#2563eb" />
                      <Text style={styles.documentFile}>{documents[key]}</Text>
                      <Text style={styles.documentAction}>Replace</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={24} color="#9ca3af" />
                      <Text style={styles.documentPlaceholder}>Upload</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
          <Text style={styles.deleteButtonText}>Delete Car</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={pickerModal.visible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select {pickerModal.field}</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {pickerModal.options.map((option) => (
                <TouchableOpacity key={option} style={styles.modalOption} onPress={() => handleSelectOption(option)}>
                  <Text style={styles.modalOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setPickerModal({ visible: false, field: null, options: [] })}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={feedbackModal.visible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackCard}>
            <Ionicons
              name={feedbackModal.success ? 'checkmark-circle-outline' : 'alert-circle-outline'}
              size={48}
              color={feedbackModal.success ? '#22c55e' : '#ef4444'}
            />
            <Text style={styles.feedbackText}>{feedbackModal.message}</Text>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => {
                setFeedbackModal({ visible: false, success: true, message: '' });
                if (feedbackModal.success) {
                  navigation.navigate('OwnerHome');
                }
              }}
            >
              <Text style={styles.feedbackButtonLabel}>{feedbackModal.success ? 'Go Back' : 'Close'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={deleteModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackCard}>
            <Ionicons name="warning-outline" size={48} color="#ef4444" />
            <Text style={styles.feedbackText}>Delete this car?</Text>
            <Text style={styles.feedbackSub}>This action cannot be undone. All future bookings for this car may be affected.</Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerButton} onPress={handleDelete}>
                <Text style={styles.dangerButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
    marginTop: 16,
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
  photoTile: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoDelete: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    ...FONTS.body3,
    color: '#9ca3af',
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusPillActive: {
    backgroundColor: '#0066ff',
    borderColor: '#0066ff',
  },
  statusPillText: {
    ...FONTS.body3,
    color: '#6b7280',
    fontWeight: '600',
  },
  statusPillTextActive: {
    color: '#fff',
  },
  documentsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  documentTile: {
    width: '30%',
    minWidth: 110,
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  documentLabel: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  documentBody: {
    alignItems: 'center',
    gap: 6,
  },
  documentFile: {
    ...FONTS.body3,
    color: COLORS.text,
    marginTop: 4,
  },
  documentAction: {
    ...FONTS.body3,
    color: '#1f7cff',
    marginTop: 4,
  },
  documentPlaceholder: {
    ...FONTS.body3,
    color: '#9ca3af',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButton: {
    flex: 0.7,
    backgroundColor: '#0066ff',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveButtonText: {
    ...FONTS.body1,
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 0.3,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  deleteButtonText: {
    ...FONTS.body2,
    color: '#ef4444',
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
    textAlign: 'center',
    marginTop: 12,
  },
  feedbackButton: {
    marginTop: 16,
    backgroundColor: '#0066ff',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  feedbackButtonLabel: {
    ...FONTS.body3,
    color: '#fff',
    fontWeight: '600',
  },
  feedbackSub: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  deleteActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 16,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  dangerButtonText: {
    ...FONTS.body3,
    color: '#fff',
    fontWeight: '600',
  },
});

export default EditCarScreen;
