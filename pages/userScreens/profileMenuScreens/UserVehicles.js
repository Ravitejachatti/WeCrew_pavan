import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../../constants/constants";

const VEHICLE_ICONS = {
  Bike: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
  Car: "https://cdn-icons-png.flaticon.com/512/743/743007.png",
  Truck: "https://cdn-icons-png.flaticon.com/512/1995/1995476.png",
  Default: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
};

export default function UserVehicles({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  const fetchVehicles = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userData');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const vehicleDetailsStr = await AsyncStorage.getItem('UserVehicleDetails');
      const vehicleDetails = vehicleDetailsStr ? JSON.parse(vehicleDetailsStr) : null;

      console.log("userVehicle Details", vehicleDetails);
      console.log("userData ", user);

      if (Array.isArray(vehicleDetails) && vehicleDetails.length > 0) {
        setVehicles(vehicleDetails);
        setError("");
      } else if (user && Array.isArray(user.VehicleDetails) && user.VehicleDetails.length > 0) {
        setVehicles(user.VehicleDetails);
        setError("");
      } else {
        setVehicles([]);
        setError("No vehicles found for this user.");
      }
    } catch (err) {
      setError("Failed to load vehicles. Please try again later.");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  fetchVehicles();
}, []);

  const renderItem = ({ item }) => {
    const icon =
      VEHICLE_ICONS[item.vehicleType] || VEHICLE_ICONS.Default;
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Image source={{ uri: icon }} style={styles.vehicleIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {item.model} <Text style={styles.regNumber}>({item.registrationNumber})</Text>
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Brand</Text>
              <Text style={styles.value}>{item.brand}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fuel</Text>
              <Text style={styles.value}>{item.fuelType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Type</Text>
              <Text style={styles.value}>{item.vehicleType}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditVehicle', { vehicle: item })}
          >
            <Ionicons name="pencil" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Added on: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "---"}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ color: "#007BFF", marginTop: 10 }}>Loading your vehicles...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/4076/4076500.png" }}
          style={{ width: 120, height: 120, marginBottom: 20, opacity: 0.7 }}
        />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vehicles</Text>
      </View>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/4076/4076500.png" }}
              style={{ width: 120, height: 120, marginBottom: 20, opacity: 0.7 }}
            />
            <Text style={styles.errorText}>No vehicles found.</Text>
          </View>
        }
      />

      {/* Add Vehicle Button BELOW the list */}
    <View style={styles.addButtonWrapper}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddVehicle')}
      >
        <Ionicons name="add" size={24} color={COLORS.secondary} />
        <Text style={styles.addButtonText}>Add Vehicle</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 18,
  position: 'relative',
},

backButton: {
  position: 'absolute',
  left: 0,
  padding: 8,
  zIndex: 10,
},

headerTitle: {
  flex: 1,
  textAlign: 'center',
  fontSize: 24,
  fontWeight: 'bold',
  color: "#007BFF",
  letterSpacing: 0.5,
},
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8FAFF",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#007BFF",
    letterSpacing: 1,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
    marginBottom: 18,
    elevation: 4,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleIcon: {
    width: 60,
    height: 60,
    marginRight: 18,
    borderRadius: 14,
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#B3E5FC",
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  regNumber: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#888",
    width: 60,
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#E3F2FD",
    marginVertical: 10,
    borderRadius: 2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFF",
  },
  errorText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    fontWeight: "bold",
  },
  addButtonWrapper: {
  alignItems: 'center',
  marginTop: 10,
  marginBottom: 30,
},
addButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: COLORS.primary,
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 25,
  elevation: 3,
},
addButtonText: {
  marginLeft: 10,
  color: COLORS.secondary,
  fontSize: 16,
  fontWeight: 'bold',
},
});