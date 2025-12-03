import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import { uploadFileAsync } from '../src/services/storageService';
import { addCar } from '../src/services/carsService';
import { AuthContext } from '../src/context/AuthContext';

const AddCarScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const ownerId = user?.id;

  const [title, setTitle] = useState('');
  const [numberPlate, setNumberPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [images, setImages] = useState([]);
  const [docs, setDocs] = useState({ rc: null, insurance: null });
  const [loading, setLoading] = useState(false);

  const pickImage = async (setter) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (result.cancelled) return;
      const next = { uri: result.uri, uploading: false, progress: 0, url: null };
      setter((prev) => [...prev, next]);
    } catch (e) {
      console.warn('pickImage error', e);
      Alert.alert('Error', 'Unable to open gallery.');
    }
  };

  const takePhoto = async (setter) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (result.cancelled) return;
      const next = { uri: result.uri, uploading: false, progress: 0, url: null };
      setter((prev) => [...prev, next]);
    } catch (e) {
      console.warn('takePhoto error', e);
      Alert.alert('Error', 'Unable to open camera.');
    }
  };

  const removeImageAt = (index, setter) => {
    setter((prev) => prev.filter((_, idx) => idx !== index));
  };

  const uploadAllFiles = async (ownerIdParam) => {
    const uploadedImages = [];
    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      if (item.url) {
        uploadedImages.push(item.url);
        continue;
      }

      images[i].uploading = true;
      const filename = `img_${Date.now()}_${i}.jpg`;
      const path = `cars/${ownerIdParam}/images/${filename}`;
      // eslint-disable-next-line no-await-in-loop
      const url = await uploadFileAsync(item.uri, path, (pct) => {
        images[i].progress = pct;
        setImages([...images]);
      });
      images[i].uploading = false;
      images[i].url = url;
      setImages([...images]);
      uploadedImages.push(url);
    }

    const uploadedDocs = { rc: null, insurance: null };
    for (const key of Object.keys(docs)) {
      const entry = docs[key];
      if (!entry) continue;
      if (typeof entry === 'string' && entry.startsWith('http')) {
        uploadedDocs[key] = entry;
        continue;
      }
      const filename = `${key}_${Date.now()}.jpg`;
      const path = `cars/${ownerIdParam}/docs/${filename}`;
      // eslint-disable-next-line no-await-in-loop
      const url = await uploadFileAsync(entry.uri || entry, path);
      uploadedDocs[key] = url;
    }

    return { images: uploadedImages, docs: uploadedDocs };
  };

  const handleSubmit = async () => {
    if (!ownerId) {
      Alert.alert('Not signed in', 'Please login as an owner first.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a car title.');
      return;
    }
    if (!numberPlate.trim()) {
      Alert.alert('Validation', 'Please enter the number plate.');
      return;
    }

    try {
      setLoading(true);
      const { images: imageUrls, docs: docUrls } = await uploadAllFiles(ownerId);

      const carPayload = {
        title: title.trim(),
        numberPlate: numberPlate.trim(),
        brand: brand.trim(),
        model: model.trim(),
        year: year ? Number(year) : null,
        pricePerDay: pricePerDay ? Number(pricePerDay) : 0,
        status: 'Available',
        isListed: true,
        images: imageUrls,
        docs: docUrls,
      };

      await addCar(ownerId, carPayload);
      Alert.alert('Success', 'Car listed successfully!', [
        {
          text: 'View Dashboard',
          onPress: () => navigation.navigate('OwnerHome'),
        },
      ]);
    } catch (error) {
      console.error('handleSubmit error', error);
      Alert.alert('Error', 'Failed to add car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>List Your Car</Text>
        <Text style={styles.subtitle}>Fill in the details to get your vehicle listed.</Text>

        <Text style={styles.inputLabel}>Car Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Maruti Suzuki Dzire"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.inputLabel}>Number Plate *</Text>
        <TextInput
          style={styles.input}
          placeholder="GJ01 AB 1234"
          value={numberPlate}
          autoCapitalize="characters"
          onChangeText={setNumberPlate}
        />

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => pickImage(setImages)}>
            <Ionicons name="ios-images" size={24} color={COLORS.text} />
            <Text style={styles.buttonText}>Pick Images</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => takePhoto(setImages)}>
            <Ionicons name="ios-camera" size={24} color={COLORS.text} />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            {image.uploading ? (
              <ActivityIndicator style={styles.uploading} size="small" color={COLORS.primary} />
            ) : (
              <TouchableOpacity style={styles.removeButton} onPress={() => removeImageAt(index, setImages)}>
                <Ionicons name="ios-close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <Text style={styles.inputLabel}>Brand</Text>
        <TextInput
          style={styles.input}
          placeholder="Maruti Suzuki"
          value={brand}
          onChangeText={setBrand}
        />

        <Text style={styles.inputLabel}>Model</Text>
        <TextInput
          style={styles.input}
          placeholder="Dzire"
          value={model}
          onChangeText={setModel}
        />

        <Text style={styles.inputLabel}>Year</Text>
        <TextInput
          style={styles.input}
          placeholder="2020"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>Price Per Day</Text>
        <TextInput
          style={styles.input}
          placeholder="500"
          value={pricePerDay}
          onChangeText={setPricePerDay}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>List My Car</Text>
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
  content: {
    padding: 20,
  },
  title: {
    ...FONTS.h1,
    marginBottom: 10,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  inputLabel: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 5,
  },
  input: {
    ...FONTS.body2,
    color: COLORS.text,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    ...FONTS.body2,
    color: COLORS.background,
    marginLeft: 10,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  uploading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    ...FONTS.body2,
    color: COLORS.background,
  },
});

export default AddCarScreen;
