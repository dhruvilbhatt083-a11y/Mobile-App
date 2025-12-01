import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const AddCarScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    type: 'Sedan',
    price: '',
    location: '',
    description: '',
    features: [],
  });

  const carTypes = ['Sedan', 'SUV', 'Luxury', 'Electric', 'Sports', 'Truck', 'Van'];
  const availableFeatures = [
    'GPS', 'Bluetooth', 'USB Charging', 'Leather Seats', 
    'Sunroof', 'Automatic', 'Manual', 'AWD', 'Hybrid',
    'Cruise Control', 'Parking Sensors', 'Backup Camera'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = () => {
    // TODO: Implement Firebase save functionality
    Alert.alert(
      'Success!',
      'Your car has been listed successfully.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>List Your Car</Text>
        <Text style={styles.subtitle}>
          Fill in the details to list your car for rent
        </Text>

        {/* Basic Information */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Car Make"
            placeholder="e.g., Toyota, Honda, BMW"
            value={formData.make}
            onChangeText={(value) => handleInputChange('make', value)}
          />
          
          <Input
            label="Car Model"
            placeholder="e.g., Camry, Civic, X5"
            value={formData.model}
            onChangeText={(value) => handleInputChange('model', value)}
          />
          
          <Input
            label="Year"
            placeholder="e.g., 2022"
            value={formData.year}
            onChangeText={(value) => handleInputChange('year', value)}
            keyboardType="numeric"
          />
          
          <Input
            label="Daily Price ($)"
            placeholder="e.g., 50"
            value={formData.price}
            onChangeText={(value) => handleInputChange('price', value)}
            keyboardType="numeric"
          />
        </Card>

        {/* Car Type */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Car Type</Text>
          <View style={styles.typeGrid}>
            {carTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  formData.type === type && styles.typeChipActive,
                ]}
                onPress={() => handleInputChange('type', type)}
              >
                <Text style={[
                  styles.typeText,
                  formData.type === type && styles.typeTextActive,
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Location */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Input
            label="Pickup Location"
            placeholder="Enter address or area"
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
          />
        </Card>

        {/* Features */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            {availableFeatures.map((feature) => (
              <TouchableOpacity
                key={feature}
                style={[
                  styles.featureChip,
                  formData.features.includes(feature) && styles.featureChipActive,
                ]}
                onPress={() => toggleFeature(feature)}
              >
                <Text style={[
                  styles.featureText,
                  formData.features.includes(feature) && styles.featureTextActive,
                ]}>
                  {feature}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Input
            label="Car Description"
            placeholder="Describe your car, condition, and any special features..."
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={4}
          />
        </Card>

        {/* Submit Button */}
        <Button
          title="List My Car"
          onPress={handleSubmit}
          size="large"
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h1,
    marginBottom: SIZES.base,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding * 2,
  },
  card: {
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: SIZES.padding,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.base / 2,
  },
  typeChip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    margin: SIZES.base / 2,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  typeTextActive: {
    color: COLORS.background,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.base / 2,
  },
  featureChip: {
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    margin: SIZES.base / 2,
  },
  featureChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  featureText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  featureTextActive: {
    color: COLORS.background,
  },
  submitButton: {
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding * 2,
  },
});

export default AddCarScreen;
