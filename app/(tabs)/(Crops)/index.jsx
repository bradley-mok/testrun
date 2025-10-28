import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { BookOpen, Sprout } from "lucide-react-native";
import CropInformation from "./CropInformation";
import CropMonitoring from "./CropMonitoring";
import ScreenWrapper from "../../../components/ScreenWrapper";

const { width: screenWidth } = Dimensions.get("window");

export default function Crops() {
  const [activeTab, setActiveTab] = useState("information");
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const tabWidth = screenWidth / 2 - 16; // considering padding/margin

  useEffect(() => {
    // Animate the indicator
    Animated.spring(indicatorAnim, {
      toValue: activeTab === "information" ? 0 : tabWidth + 8, // 8 is spacing between tabs
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  return (
    <ScreenWrapper bg="#ECFDF4">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crops</Text>
          <Text style={styles.subtitle}>Learn about crops and monitor your garden</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsList}>
            <TouchableOpacity
              style={styles.tabTrigger}
              onPress={() => setActiveTab("information")}
            >
              <BookOpen
                size={18}
                color={activeTab === "information" ? "#fff" : "#064e3b"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "information" && styles.activeTabText,
                ]}
              >
                Crop Information
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabTrigger}
              onPress={() => setActiveTab("monitoring")}
            >
              <Sprout
                size={18}
                color={activeTab === "monitoring" ? "#fff" : "#064e3b"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "monitoring" && styles.activeTabText,
                ]}
              >
                My Crops
              </Text>
            </TouchableOpacity>

            {/* Sliding Indicator */}
            <Animated.View
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

        {/* Tab Content - children handle their own scrolling (FlatList/ScrollView) */}
        <View style={[styles.tabContent, { flex: 1 }]}>
          {activeTab === "information" && <CropInformation />}
          {activeTab === "monitoring" && <CropMonitoring />}
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
  tabsWrapper: {
    marginBottom: 16,
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
  },
  tabTrigger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    color: "#064e3b",
    fontWeight: "500",
    
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
    right: 9,
    backgroundColor: "#16a34a",
    borderRadius: 50,
    zIndex: -1,
  },
  tabContent: {
    marginTop: 8,
   
  },
});
