import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from "../../constants/constants";

const bikeModels = {
   "Aprilia": [
    {
      name: "RS 457",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/rs-457-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "RSV4",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/rsv4-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Tuono V4",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/tuono-v4-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Tuono 660",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/tuono-660-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "RS 660",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/rs-660-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Tuareg 660",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/tuareg-660-right-side-view.jpeg?isig=0&q=80"
    }
  ],
   "Bajaj": [
    {
      name: "Pulsar 150",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/pulsar-150-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Pulsar 220F",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/pulsar-220f-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Avenger Cruise 220",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/avenger-cruise-220-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Dominar 400",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/dominar-400-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Platina 110",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/platina-110-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "CT 100",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/ct-100-right-side-view.jpeg?isig=0&q=80"
    }
  ],
  "Benelli": [
    {
      name: "TRK 502",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/trk-502-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "TRK 502X",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/trk-502x-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "502C",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/502c-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Leoncino 500",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/leoncino-500-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Imperiale 400",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/imperiale-400-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "TRK 251",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/trk-251-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "TNT 300",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/tnt-300-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "TNT 600i",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/tnt-600i-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "752S",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/752s-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "302R",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/302r-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Leoncino 800",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/leoncino-800-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "TRK 702",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/trk-702-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Tornado 402R",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/tornado-402r-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "600 RR",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/600-rr-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "320 S",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/320-s-right-side-view.jpeg?isig=0&q=80"
    }
  ],
  "Honda": [
    {
      name: "CB750 Hornet",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/cb750-hornet-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "CB1000 Hornet SP",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/cb1000-hornet-sp-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "X-ADV",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/x-adv-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Rebel 500",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/rebel-500-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "CB650R",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/cb650r-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "CBR650R",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/cbr650r-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Dio 125",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/dio-125-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Shine 100",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/shine-100-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Hornet 2.0",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/hornet-2-0-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "NX200",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/nx200-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "CB350",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/cb350-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "CB350 H'ness",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/cb350-hness-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "CB350RS",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/cb350rs-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "CB300F",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/cb300f-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "CB300R",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/cb300r-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "GoldWing Tour",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/goldwing-tour-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "NX500",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/nx500-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Transalp",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/transalp-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "SP160",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/sp160-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Shine 125",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/shine-125-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Unicorn",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/unicorn-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "Livo",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/livo-right-side-view.jpeg?isig=0&q=80"
    },
    {
      name: "SP125",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115407/sp125-right-side-view.jpeg?isig=0&q=80"
    }
  ],

  "Royal Enfield": [
    { name: "Bullet 350", image: require("../../assets/bullet350.png") },
    { name: "Classic 350", image: require("../../assets/bullet350.png") },
    { name: "Meteor 350", image: require("../../assets/bullet350.png") },
    { name: "Interceptor 650", image: require("../../assets/bullet350.png") },
    
  ],
  "Yamaha": [
    { name: "R15 V4", image: require("../../assets/bullet350.png") },
    { name: "MT-15", image: require("../../assets/bullet350.png") },
    { name: "FZ-X", image: require("../../assets/bullet350.png") },
    { name: "FZ-S", image: require("../../assets/bullet350.png") },
  ],
  "KTM": [
    { name: "Duke 200", image: require("../../assets/bullet350.png") },
    { name: "RC 390", image: require("../../assets/bullet350.png") },
    { name: "Adventure 390", image: require("../../assets/bullet350.png") },
  ],
};

export default function BikeModelScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedBrand } = route.params;

  const [selectedModel, setSelectedModel] = useState(null);

  const handleNext = async () => {
    if (!selectedModel) {
      alert("Please select a bike model");
      return;
    }
  
    try {
      const storedUser = await AsyncStorage.getItem('userData');
  
      if (!storedUser) {
        console.error('No user data found in storage');
        alert("User not logged in");
        return;
      }
  
      const parsedUser = JSON.parse(storedUser);
      
      const userId = parsedUser._id;
      console.log("userId ",userId)  
     
  
      // Construct the vehicle object
      const vehicleData = {
        vehicleType: route.params.selectedVehicle,
        fuelType: route.params.selectVehicleType,
        brand: selectedBrand,
        model: selectedModel.name,
        registrationNumber: route.params.vehicleNo,
      };
      console.log("Vehicle Data:", vehicleData);
      
      const response = await axios.post(
        `${API}/vehicle/${userId}/vehicles`,  // Updated endpoint
        vehicleData
      );
      
      if (response.status === 200 || response.status === 201) {
        const vehicleDetails = response?.data?.data; // This is the array of vehicles
        console.log('response.data ', response.data);
        await AsyncStorage.setItem("UserVehicleDetails", JSON.stringify(vehicleDetails));
        alert("Vehicle details saved successfully!");
        navigation.navigate('UserHome');
      } else {
        console.error('Failed to upload vehicle details:', response.data);
        alert("Failed to save vehicle details");
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
      alert("An error occurred. Please try again.");
    }
  };
  

  return (
   <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bike Model</Text>

      <View style={styles.formContainer}>
        <View style={styles.DetailsSection}>
        <Text style={styles.subtitle}>Select Your {selectedBrand} Model</Text>
        {/* <Text style={styles.subtitletext}>We’ll text a code to verify your phone number</Text> */}
        </View>

        <FlatList
          key={3} // ⬅️ force FlatList to re-render using 3 columns
          numColumns={3}
          data={bikeModels[selectedBrand] || []}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.modelCard,
                selectedModel?.name === item.name && styles.selectedModel
              ]}
              onPress={() => setSelectedModel(item)}
            >
              <Image source={item.image} style={styles.bikeImage} />
              <Text style={styles.modelText}>{item.name}</Text>
            </TouchableOpacity>
            )}
          />

        {/* Footer - Fixed Bottom Button */}
            <View style={styles.footer}>
              <Text style={styles.note}>
                Note: Your data is safe and securely protected with us, ensuring privacy and confidentiality.
              </Text>

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
      </View>
    </SafeAreaView>
  );
}

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
  grid: {
    justifyContent: "space-between",
    paddingBottom: 100,
  },
  modelCard: {
    width: "28%",
    margin: 8,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    padding: 5,
  },
  selectedModel: {
    borderColor: COLORS.primary,
  },
  bikeImage: {
    width: "100%",
    height: SIZES.avatarSize + 10,
    marginBottom: 5,
    resizeMode: 'cover',
  },
  modelText: {
    fontSize: FONTS.small,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.regular,
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
