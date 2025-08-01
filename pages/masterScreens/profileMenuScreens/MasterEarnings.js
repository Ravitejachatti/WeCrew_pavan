import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, SafeAreaView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../../constants/constants";
import LoadingBars from "../../../components/reuableComponents/loadingBars";
import { Ionicons } from '@expo/vector-icons';
import {  useNavigation } from "@react-navigation/native";


export default function MasterEarnings() {
  const navigation = useNavigation(); 
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const analyticsStr = await AsyncStorage.getItem("MasterAnalytics");
        if (analyticsStr) {
          const analytics = JSON.parse(analyticsStr);
          if (Array.isArray(analytics.completed)) {
            // Sort by date descending
            const sorted = analytics.completed.sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            );
            setCompleted(sorted);
          } else {
            setCompleted([]);
          }
        } else {
          setCompleted([]);
        }
      } catch (e) {
        setCompleted([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.serviceType}>{item.serviceType || "---"}</Text>
        <Text style={styles.amount}>₹ {item.amount || "0"}</Text>
      </View>
      <Text style={styles.date}>
        {item.date ? new Date(item.date).toLocaleString() : "---"}
      </Text>
      {item.userRating && (
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>User Rating:</Text>
          <Text style={styles.ratingValue}>{item.userRating} ⭐</Text>
        </View>
      )}
      {item.userFeedback && (
        <Text style={styles.feedback}>"{item.userFeedback}"</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <LoadingBars color={COLORS.primary} size={36} />
        <Text style={{ color: "#007BFF", marginTop: 10 }}>Loading earnings...</Text>
      </View>
    );
  }



  return (
<SafeAreaView style={styles.container}>
    <TouchableOpacity onPress={navigation.goBack} style={styles.backArrow}>
      <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
    </TouchableOpacity>

    {loading ? (
      <View style={styles.centered}>
        <LoadingBars color={COLORS.primary} size={36} />
        <Text style={{ color: "#007BFF", marginTop: 10 }}>Loading earnings...</Text>
      </View>
    ) : completed.length === 0 ? (
      <View style={styles.centered}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/4076/4076500.png" }}
          style={{ width: 120, height: 120, marginBottom: 20, opacity: 0.7 }}
        />
        <Text style={styles.emptyText}>No completed repairs yet.</Text>
      </View>
    ) : (
      <>
        <Text style={styles.header}>Earnings History</Text>
        <FlatList
          data={completed}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      </>
    )}
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    padding: SIZES.padding 
  },
  header: {
    fontSize: FONTS.large,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
    marginBottom: SIZES.margin - 2,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding - 2,
    marginBottom: SIZES.margin - 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  serviceType: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.toggleActive,
  },
  date: {
    fontSize: FONTS.small,
    color: COLORS.text,
    marginBottom: 4,
    fontStyle: "italic",
    fontFamily: FONT_FAMILY.regular,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  ratingLabel: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginRight: 4,
    fontFamily: FONT_FAMILY.regular,
  },
  ratingValue: {
    fontSize: FONTS.small,
    color: "#FFD700",
    fontFamily: FONT_FAMILY.bold,
  },
  feedback: {
    fontSize: FONTS.medium,
    color: COLORS.textDark,
    marginTop: 4,
    fontStyle: "italic",
    fontFamily: FONT_FAMILY.regular,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
    textAlign: "center",
    fontFamily: FONT_FAMILY.bold,
  },
backArrow: {
  position: 'absolute',
  top: 10, // or use useSafeAreaInsets().top + 10 if available
  left: 16,
  zIndex: 10,
  padding: 8,
},
});
