import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, FONTS } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchCars } from "../services/carsService";
import DriverBottomNav from "../components/DriverBottomNav";
import { useAuth } from "../src/context/AuthContext";

// 🔹 Your existing local sample cars (kept as fallback)
const sampleCars = [
  {
    id: 1,
    name: "Maruti Suzuki Dzire",
    fuel: "Petrol",
    location: "Ahmedabad",
    year: 2019,
    price: "₹900/day",
    kmDriven: "82,000",
    transmission: "Manual",
    description:
      "Well maintained car ideal for daily taxi rides. Comfortable seating and excellent mileage.",
    image:
      "https://images.unsplash.com/photo-1610465299996-866cbd9d753e?auto=format&fit=crop&w=600&q=60",
  },
  {
    id: 2,
    name: "Honda Amaze",
    fuel: "Petrol",
    location: "Ahmedabad",
    year: 2020,
    price: "₹880/day",
    kmDriven: "64,500",
    transmission: "Automatic",
    description:
      "Reliable sedan with spacious interior, great for city commutes and long drives.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=60",
  },
  {
    id: 3,
    name: "WagonR",
    fuel: "Petrol",
    location: "Ahmedabad",
    year: 2018,
    price: "₹750/day",
    kmDriven: "95,000",
    transmission: "Manual",
    description:
      "Compact yet roomy hatchback, perfect for city runs with great fuel efficiency.",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=60",
  },
  {
    id: 4,
    name: "Toyota Etios",
    fuel: "Diesel",
    location: "Ahmedabad",
    year: 2019,
    price: "₹820/day",
    kmDriven: "70,200",
    transmission: "Manual",
    description:
      "Trusted sedan with strong suspension and low maintenance, ideal for highway trips.",
    image:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=60",
  },
  {
    id: 5,
    name: "Hyundai Aura",
    fuel: "Petrol",
    location: "Ahmedabad",
    year: 2021,
    price: "₹940/day",
    kmDriven: "38,400",
    transmission: "Automatic",
    description:
      "Premium compact sedan with connected features and plush interiors.",
    image:
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=600&q=60",
  },
  {
    id: 6,
    name: "Swift Dzire",
    fuel: "CNG",
    location: "Ahmedabad",
    year: 2017,
    price: "₹720/day",
    kmDriven: "1,05,000",
    transmission: "Manual",
    description:
      "Economical CNG option with low running cost, best for daily rentals.",
    image:
      "https://images.unsplash.com/photo-1529429617124-aee711a70412?auto=format&fit=crop&w=600&q=60",
  },
];

const DriverHomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const displayName = user?.name?.trim() || "Driver";
  const hasLicence = !!user?.licenseNumber && user.licenseNumber.trim() !== "";
  const hasAadhaar = !!user?.aadhaarNumber && user.aadhaarNumber.trim() !== "";
  const isKycBasicComplete = hasLicence && hasAadhaar;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "D";

  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCars();
        setCars(data);
      } catch (err) {
        console.error("Error loading cars:", err);
        setError("Could not load cars. Showing sample data.");
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  const handleViewDetails = (car) => {
    navigation.navigate("CarDetail", { car });
  };

  const handleBookNow = (car) => {
    if (!isKycBasicComplete) {
      Alert.alert(
        "Complete KYC",
        "Please add your licence and Aadhaar details in Profile before booking a car.",
        [
          { text: "Later", style: "cancel" },
          {
            text: "Go to Profile",
            onPress: () => navigation.navigate("DriverProfile"),
          },
        ],
      );
      return;
    }

    navigation.navigate("Booking", { car });
  };

  const sourceCars = cars.length ? cars : sampleCars;
  const filteredCars = sourceCars.filter((car) => {
    if (!search.trim()) return true;
    const text = search.toLowerCase();
    const haystack = `${car.name || car.title || ""} ${
      car.location || car.city || ""
    } ${car.plate || car.numberPlate || ""}`.toLowerCase();
    return haystack.includes(text);
  });

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.contentArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.welcome}>Welcome, {displayName}</Text>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={COLORS.textSecondary} />
            <TextInput
              placeholder="Search model, city, plate"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Section title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Cars</Text>
            <Text style={styles.sectionSubtitle}>
              Cars available for today’s shift near you
            </Text>
          </View>

          {/* Error / Loading / List */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {loading ? (
            <Text style={styles.loadingText}>Loading cars...</Text>
          ) : filteredCars.length === 0 ? (
            <Text style={styles.emptyText}>No cars found.</Text>
          ) : (
            filteredCars.map((car) => (
              <TouchableOpacity
                key={car.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => handleViewDetails(car)}
              >
                <Image
                  source={{ uri: car.image || car.imageUrl }}
                  style={styles.carImage}
                />
                <View style={styles.cardContent}>
                  <View style={styles.carRow}>
                    <Text style={styles.carName}>
                      {car.name || car.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="water-outline"
                          size={14}
                          color={COLORS.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {car.fuel || car.fuelType || "-"}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={COLORS.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {car.location || car.city || "-"}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={COLORS.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {car.year || "-"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.price}>
                    {car.price || `₹${car.pricePerDay || "0"}/day`}
                  </Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => handleViewDetails(car)}>
                      <Text style={styles.detailsLink}>Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() => handleBookNow(car)}
                    >
                      <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <DriverBottomNav activeTab="home" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },
  contentArea: {
    flex: 1,
    paddingTop: SIZES.base,
  },
  scrollContent: {
    paddingBottom: SIZES.padding * 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.base,
    backgroundColor: COLORS.background,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d9e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.base,
  },
  avatarText: {
    ...FONTS.body2,
    color: "#1f7cff",
    fontWeight: "600",
  },
  welcome: {
    flex: 1,
    ...FONTS.h3,
    color: COLORS.text,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: "#e6eaf0",
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.base,
    ...FONTS.body2,
    color: COLORS.text,
  },
  sectionHeader: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 10,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: "#95a8c5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  carImage: {
    width: 92,
    height: 74,
    borderRadius: 16,
    marginRight: SIZES.padding,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  carRow: {
    marginBottom: 6,
  },
  carName: {
    ...FONTS.body1,
    fontWeight: "600",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.base,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  price: {
    ...FONTS.body1,
    color: "#1f7cff",
    fontWeight: "700",
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailsLink: {
    ...FONTS.body3,
    color: "#1f7cff",
    fontWeight: "600",
  },
  bookButton: {
    backgroundColor: "#1f7cff",
    borderRadius: 14,
    paddingHorizontal: SIZES.padding * 0.9,
    paddingVertical: SIZES.base * 0.9,
  },
  bookButtonText: {
    ...FONTS.body3,
    color: COLORS.background,
    fontWeight: "600",
  },
  loadingText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.padding,
  },
  emptyText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.padding,
  },
  errorText: {
    ...FONTS.body3,
    color: "red",
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
});

export default DriverHomeScreen;
