import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../../constants/constants";

const TABS = [
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "missed", label: "Missed" },
];

export default function MasterRepairHistory() {
  const [selectedTab, setSelectedTab] = useState("completed");
  const [history, setHistory] = useState({ completed: [], cancelled: [], missed: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const analyticsStr = await AsyncStorage.getItem("MasterAnalytics");
        if (analyticsStr) {
          const analytics = JSON.parse(analyticsStr);
          setHistory({
            completed: Array.isArray(analytics.completed) ? analytics.completed : [],
            cancelled: Array.isArray(analytics.cancelled) ? analytics.cancelled : [],
            missed: Array.isArray(analytics.missed) ? analytics.missed : [],
          });
        } else {
          setHistory({ completed: [], cancelled: [], missed: [] });
        }
      } catch (e) {
        setHistory({ completed: [], cancelled: [], missed: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const renderCompleted = ({ item }) => (
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
      {/* {item.userFeedback && (
        <Text style={styles.feedback}>"{item.userFeedback}"</Text>
      )} */}
    </View>
  );

  const renderCancelled = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.serviceType}>{item.serviceType || "---"}</Text>
        <Text style={[styles.amount, { color: "#FF3B30" }]}>₹ {item.amount || "0"}</Text>
      </View>
      <Text style={styles.date}>
        {item.date ? new Date(item.date).toLocaleString() : "---"}
      </Text>
      {/* <Text style={styles.cancelReason}>
        Reason: {item.cancelReason || "Not specified"}
      </Text> */}
    </View>
  );

  const renderMissed = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.serviceType}>{item.serviceType || "---"}</Text>
        <Text style={[styles.amount, { color: "#888" }]}>₹ {item.amount || "0"}</Text>
      </View>
      <Text style={styles.date}>
        {item.date ? new Date(item.date).toLocaleString() : "---"}
      </Text>
      <Text style={styles.missedText}>Missed Opportunity</Text>
    </View>
  );

  const renderList = () => {
    const data = history[selectedTab] || [];
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={{ color: "#007BFF", marginTop: 10 }}>Loading...</Text>
        </View>
      );
    }
    if (!data.length) {
      return (
        <View style={styles.centered}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/4076/4076500.png" }}
            style={{ width: 120, height: 120, marginBottom: 20, opacity: 0.7 }}
          />
          <Text style={styles.emptyText}>No records found.</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={data}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={
          selectedTab === "completed"
            ? renderCompleted
            : selectedTab === "cancelled"
            ? renderCancelled
            : renderMissed
        }
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Repair History</Text>
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              selectedTab === tab.key && styles.tabItemActive,
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>{renderList()}</View>
    </View>
  );
}

// ...existing code...
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD", // You can add a tabBar color to constants if you want
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.margin - 2,
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#E3F2FD",
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.medium,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: COLORS.secondary,
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
    fontSize: FONTS.medium + 1,
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
  cancelReason: {
    fontSize: FONTS.medium,
    color: "#FF3B30",
    marginTop: 4,
    fontStyle: "italic",
  },
  missedText: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
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
});
