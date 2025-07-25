import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const bikeBrands = [
  { name: "Aprilia", image: require("../../assets/bikes/aprilia.png")},
  { name: "Bajaj", image: require("../../assets/bikes/bajaj.png") },
  { name: "Benelli", image: require("../../assets/bikes/benelli.png") },
  { name: "BMW", image: require("../../assets/bikes/bmw.png") },
  { name: "Ducati", image: require("../../assets/bikes/ducati.png") },
  { name: "Harleydavidson", image: require("../../assets/bikes/harleydavidson.png") },
  { name: "Hero", image: require("../../assets/bikes/hero.png") },
  { name: "Honda", image: require("../../assets/bikes/honda.png") },
  { name: "Jawa", image: require("../../assets/bikes/jawa.png") },
  { name: "Ktm", image: require("../../assets/bikes/ktm.png") },
  { name: "Mahindra", image: require("../../assets/bikes/mahindra.png") },
  { name: "Royal Enfield", image: require("../../assets/bikes/royalenfield.png")},
  { name: "Suzuki", image: require("../../assets/bikes/suzuki.png")},
  { name: "TVS", image: require("../../assets/bikes/tvs.png")},
  { name: "Yamaha", image: require("../../assets/bikes/yamaha.png")}
];

export default function BikeBrandScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedBrand, setSelectedBrand] = useState(null);

  const handleNext = () => {
    if (!selectedBrand) {
      alert("Please select a brand");
      return;
    }
    navigation.navigate("BikeModel", { ...route.params, selectedBrand });
  };

  return (
   <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bike Brand</Text>

      <View style={styles.formContainer}>
        <View style={styles.DetailsSection}>
        <Text style={styles.subtitle}>Select your bike brand</Text>
        {/* <Text style={styles.subtitletext}>We’ll text a code to verify your phone number</Text> */}
        </View>

        <FlatList
            data={bikeBrands}
            keyExtractor={(item) => item.name}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.brand, selectedBrand === item.name && styles.selected]}
                onPress={() => setSelectedBrand(item.name)}
              >
                <Image source={item.image} style={styles.brandImage} resizeMode="contain" />
              </TouchableOpacity>
            )}
          />
        {/* Footer - Fixed Bottom Button */}
            <View style={styles.footer}>
              <Text style={styles.note}>
                Note: Your data is safe and securely protected with us, ensuring privacy and confidentiality.
              </Text>

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
      </View>
    </SafeAreaView>
  );
}

// ...existing code...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONTS.large,
    textAlign: "center",
    marginTop: SIZES.margin,
    color: COLORS.textDark,
    fontFamily: FONT_FAMILY.bold,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    marginTop: 40,
    gap: 10,
  },
  subtitle: {
    textAlign: "left",
    color: COLORS.textDark,
    fontSize: FONTS.extraLarge,
    marginBottom: 5,
    fontFamily: FONT_FAMILY.bold,
  },
  subtitletext: {
    color: COLORS.text,
    marginBottom: 30,
    fontFamily: FONT_FAMILY.regular,
  },
  brandImage: {
    width: SIZES.avatarSize + 10,
    height: SIZES.avatarSize + 10,
  },
  brand: {
    width: "30%",
    borderWidth: 1,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary,
    margin: 5,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
    marginBottom: 10,
  },
  selected: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  brandText: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  note: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    textAlign: "left",
    marginBottom: 10,
    fontFamily: FONT_FAMILY.regular,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.secondary,
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: "bold",
  },
});
// ...existing