import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // or Lucide icons alternative

export default function LocationSearchBar({
  detectCurrentLocation,
  isDetectingLocation,
  filteredLocations = [],
  handleLocationSelect,
  selectedLocation,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
      {!isSearchOpen ? (
        <TouchableOpacity
          onPress={() => setIsSearchOpen(true)}
          style={styles.searchButton}
        >
          <Ionicons name="search" size={22} color="#15803d" />
        </TouchableOpacity>
      ) : (
        <View style={styles.dropdown}>
          {/* Search Input */}
          <View style={styles.inputRow}>
            <Ionicons name="search" size={18} color="#16a34a" />
            <TextInput
              placeholder="Search location..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.input}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Use My Location Button */}
          <TouchableOpacity
            onPress={detectCurrentLocation}
            disabled={isDetectingLocation}
            style={styles.locationButton}
          >
            {isDetectingLocation ? (
              <ActivityIndicator size="small" color="#15803d" />
            ) : (
              <Ionicons name="navigate" size={16} color="#15803d" />
            )}
            <Text style={styles.locationButtonText}>
              {isDetectingLocation ? "Detecting location..." : "Use my location"}
            </Text>
          </TouchableOpacity>

          {/* Location Dropdown */}
          {searchQuery.length > 0 ? (
            <FlatList
              data={filteredLocations}
              keyExtractor={(item, index) => index.toString()}
              style={{ maxHeight: 200 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleLocationSelect(item)}
                  style={styles.locationItem}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#16a34a"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.locationText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No locations found</Text>
                </View>
              }
            />
          ) : (
            <View style={styles.currentLocationRow}>
              <Ionicons name="location" size={16} color="#16a34a" />
              <Text style={styles.currentLabel}>Current:</Text>
              <Text style={styles.currentValue}>{selectedLocation}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
 
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0fdf4",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 50,
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#dcfce7",
  },
  input: {
    flex: 1,
    height: 36,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#374151",
  },
  closeButton: {
    padding: 6,
    borderRadius: 6,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    marginHorizontal: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 8,
    backgroundColor: "#f0fdf4",
  },
  locationButtonText: {
    fontSize: 13,
    color: "#15803d",
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  locationText: {
    fontSize: 14,
    color: "#374151",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
  currentLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#dcfce7",
  },
  currentLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 6,
  },
  currentValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#15803d",
    marginLeft: 4,
  },
});
