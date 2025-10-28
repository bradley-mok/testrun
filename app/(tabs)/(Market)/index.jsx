import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { ShoppingCart, BarChart } from "lucide-react-native";
import MarketPlace from "./MarketPlace";
import MarketPrice from "./MarketPrice";
import ScreenWrapper from "../../../components/ScreenWrapper";

const { width: screenWidth } = Dimensions.get("window");

export default function Market() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  // mirror Crops tab sizing and animation behavior
  const tabWidth = screenWidth / 2 - 16; // considering horizontal padding

  useEffect(() => {
    const toValue = activeTab === "marketplace" ? 0 : tabWidth + 8; // 8 px spacing between tabs
    Animated.spring(indicatorAnim, {
      toValue,
      useNativeDriver: false,
      stiffness: 200,
      damping: 16,
    }).start();
  }, [activeTab, indicatorAnim, tabWidth]);

  return (
    <ScreenWrapper bg="#ECFDF4">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Market</Text>
          <Text style={styles.subtitle}>Buy, sell and check prices</Text>
        </View>

        <View style={styles.tabsWrapper}>
          <View style={styles.tabsList}>
            <TouchableOpacity
              style={styles.tabTrigger}
              onPress={() => setActiveTab("marketplace")}
              activeOpacity={0.85}
            >
              <ShoppingCart size={18} color={activeTab === "marketplace" ? "#fff" : "#064e3b"} />
              <Text style={[styles.tabText, activeTab === "marketplace" && styles.activeTabText]}>Marketplace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabTrigger}
              onPress={() => setActiveTab("prices")}
              activeOpacity={0.85}
            >
              <BarChart size={18} color={activeTab === "prices" ? "#fff" : "#064e3b"} />
              <Text style={[styles.tabText, activeTab === "prices" && styles.activeTabText]}>Prices</Text>
            </TouchableOpacity>

            {/* sliding indicator (behind buttons) */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicator,
                {
                  width: tabWidth,
                  transform: [{ translateX: indicatorAnim }],
                },
              ]}
            />
          </View>
        </View>

        <View style={[styles.tabContent, { flex: 1 }]}>
          {activeTab === "marketplace" && <MarketPlace />}
          {activeTab === "prices" && <MarketPrice />}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECFDF4",
    paddingHorizontal: 12,
    marginBottom: 60,
    paddingBottom: 0,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#064e3b",
  },
  subtitle: {
    fontSize: 14,
    color: "#064e3b80",
  },

  // Tabs
  tabsWrapper: {
    marginBottom: 0,
  },
  tabsList: {
    flexDirection: "row",
    position: "relative",
    backgroundColor: "#DCFCE7",
    borderRadius: 50,
    padding: 4,
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 8,
  },
  tabTrigger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 999, // round look
    gap: 8,
    zIndex: 1, // ensure on top of indicator
  },
  tabText: {
    fontSize: 13,
    color: "#064e3b",
    fontWeight: "600",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#fff",
  },
  indicator: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#16a34a",
    top: 4,
    left: 4,
    borderRadius: 999,
    zIndex: 0,
  },

  tabContent: {
    marginTop: 8,
  },
});
