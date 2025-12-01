import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const CarListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');

  const categories = ['All', 'Sedan', 'SUV', 'Luxury', 'Electric', 'Sports'];
  
  const cars = [
    {
      id: 1,
      name: 'Toyota Camry',
      type: 'Sedan',
      price: 45,
      rating: 4.5,
      reviews: 89,
      image: '🚗',
      available: true,
      features: ['Automatic', 'GPS', 'Bluetooth'],
      owner: 'John Smith',
      location: '2 miles away'
    },
    {
      id: 2,
      name: 'Honda CR-V',
      type: 'SUV',
      price: 65,
      rating: 4.7,
      reviews: 124,
      image: '🚙',
      available: true,
      features: ['AWD', 'GPS', 'Leather Seats'],
      owner: 'Sarah Johnson',
      location: '3 miles away'
    },
    {
      id: 3,
      name: 'Tesla Model 3',
      type: 'Electric',
      price: 85,
      rating: 4.9,
      reviews: 201,
      image: '🚕',
      available: false,
      features: ['Autopilot', 'Electric', 'Premium Audio'],
      owner: 'Mike Chen',
      location: '5 miles away'
    },
    {
      id: 4,
      name: 'BMW 3 Series',
      type: 'Luxury',
      price: 95,
      rating: 4.8,
      reviews: 156,
      image: '🏎️',
      available: true,
      features: ['Sport Mode', 'Leather', 'Premium Sound'],
      owner: 'David Wilson',
      location: '1 mile away'
    },
  ];

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || car.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const CarCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.carCard}
      onPress={() => navigation.navigate('CarDetail', { carId: item.id })}
    >
      <View style={styles.carImageContainer}>
        <Text style={styles.carImage}>{item.image}</Text>
        <View style={[styles.availabilityBadge, { 
          backgroundColor: item.available ? COLORS.success : COLORS.accent 
        }]}>
          <Text style={styles.availabilityText}>
            {item.available ? 'Available' : 'Rented'}
          </Text>
        </View>
      </View>
      
      <View style={styles.carInfo}>
        <View style={styles.carHeader}>
          <Text style={styles.carName}>{item.name}</Text>
          <Text style={styles.carPrice}>${item.price}/day</Text>
        </View>
        
        <View style={styles.carMeta}>
          <Text style={styles.carType}>{item.type}</Text>
          <View style={styles.rating}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
        </View>
        
        <View style={styles.carFeatures}>
          {item.features.slice(0, 2).map((feature, index) => (
            <View key={index} style={styles.featureTag}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.carFooter}>
          <View style={styles.ownerInfo}>
            <Ionicons name="person" size={14} color={COLORS.textSecondary} />
            <Text style={styles.ownerText}>{item.owner}</Text>
          </View>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={14} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder="Search cars..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        
        <View style={styles.filterRow}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredCars}
        renderItem={({ item }) => <CarCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.carList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No cars found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    marginBottom: SIZES.padding,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriesContainer: {
    flex: 1,
    marginRight: SIZES.base,
  },
  categoryChip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  categoryTextActive: {
    color: COLORS.background,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  carList: {
    padding: SIZES.padding,
  },
  carCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  carImageContainer: {
    height: 150,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  carImage: {
    fontSize: 60,
  },
  availabilityBadge: {
    position: 'absolute',
    top: SIZES.base,
    right: SIZES.base,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius,
  },
  availabilityText: {
    ...FONTS.body3,
    color: COLORS.background,
    fontWeight: '600',
  },
  carInfo: {
    padding: SIZES.padding,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  carName: {
    ...FONTS.body1,
    fontWeight: '600',
    flex: 1,
  },
  carPrice: {
    ...FONTS.body1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  carMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  carType: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  reviewsText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: SIZES.base / 2,
  },
  carFeatures: {
    flexDirection: 'row',
    marginBottom: SIZES.base,
  },
  featureTag: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius / 2,
    marginRight: SIZES.base / 2,
  },
  featureText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  carFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: SIZES.base / 2,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: SIZES.base / 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 4,
  },
  emptyText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    marginTop: SIZES.base,
  },
  emptySubtext: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: SIZES.base / 2,
  },
});

export default CarListScreen;
