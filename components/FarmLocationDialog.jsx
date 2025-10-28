import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FarmLocationDialog({ open, onOpenChange }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  const [farmLocations, setFarmLocations] = useState([
    {
      id: "1",
      name: "Green Valley Farm",
      address: "Stellenbosch, Western Cape",
      coordinates: '19°29\'31.7"E, 33°56\'12.4"S',
      size: "25 hectares",
      crops: ["Wheat", "Corn", "Vegetables"],
      divisions: [
        { id: "d1", name: "Field A", size: "5 ha", cropType: "Wheat", status: "Active" },
        { id: "d2", name: "Field B", size: "8 ha", cropType: "Corn", status: "Active" },
      ],
    },
  ]);

  const [newFarm, setNewFarm] = useState({
    name: "",
    address: "",
    coordinates: "",
    size: "",
    crops: "",
    divisionName: "",
    divisionSize: "",
    divisionCrop: "",
  });

  const [newDivision, setNewDivision] = useState({
    farmId: "",
    name: "",
    size: "",
    cropType: "",
  });

  const handleAddFarm = () => {
    if (!newFarm.name || !newFarm.address) {
      Alert.alert("Error", "Please fill in farm name and address");
      return;
    }

    const farm = {
      id: Date.now().toString(),
      name: newFarm.name,
      address: newFarm.address,
      coordinates: newFarm.coordinates,
      size: newFarm.size,
      crops: newFarm.crops
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c),
      divisions: newFarm.divisionName
        ? [
            {
              id: `d${Date.now()}`,
              name: newFarm.divisionName,
              size: newFarm.divisionSize,
              cropType: newFarm.divisionCrop,
              status: "Active",
            },
          ]
        : [],
    };

    setFarmLocations([...farmLocations, farm]);
    setNewFarm({
      name: "",
      address: "",
      coordinates: "",
      size: "",
      crops: "",
      divisionName: "",
      divisionSize: "",
      divisionCrop: "",
    });
    setShowAddForm(false);
    Alert.alert("Success", "Farm location added successfully!");
  };

  const handleAddDivision = (farmId) => {
    if (!newDivision.name || !newDivision.cropType) {
      Alert.alert("Error", "Please fill in division name and crop type");
      return;
    }

    setFarmLocations(
      farmLocations.map((farm) =>
        farm.id === farmId
          ? {
              ...farm,
              divisions: [
                ...farm.divisions,
                {
                  id: `d${Date.now()}`,
                  name: newDivision.name,
                  size: newDivision.size,
                  cropType: newDivision.cropType,
                  status: "Active",
                },
              ],
            }
          : farm
      )
    );

    setNewDivision({ farmId: "", name: "", size: "", cropType: "" });
    Alert.alert("Success", "Division added successfully!");
  };

  const handleDeleteFarm = (farmId) => {
    setFarmLocations(farmLocations.filter((f) => f.id !== farmId));
    Alert.alert("Deleted", "Farm location deleted");
  };

  const handleDeleteDivision = (farmId, divisionId) => {
    setFarmLocations(
      farmLocations.map((farm) =>
        farm.id === farmId
          ? {
              ...farm,
              divisions: farm.divisions.filter((d) => d.id !== divisionId),
            }
          : farm
      )
    );
    Alert.alert("Deleted", "Division deleted");
  };

  // Fixed: Use 'open' prop for visibility and 'onOpenChange' for closing
  return (
    <Modal 
      visible={open} 
      animationType="slide" 
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="location-outline" size={24} color="#16a34a" />
          <Text style={styles.title}>Farm Locations Management</Text>
        </View>
        <Text style={styles.subtitle}>Manage your farm locations, crops, and field divisions</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {!showAddForm && (
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={() => setShowAddForm(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.buttonText}>Add New Farm Location</Text>
            </TouchableOpacity>
          )}

          {showAddForm && (
            <View style={[styles.card, styles.addFormCard]}>
              <Text style={styles.sectionTitle}>New Farm Location</Text>

              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Farm Name *</Text>
                  <TextInput
                    placeholder="e.g., Green Valley Farm"
                    style={styles.input}
                    value={newFarm.name}
                    onChangeText={(text) => setNewFarm({ ...newFarm, name: text })}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Total Size</Text>
                  <TextInput
                    placeholder="e.g., 25 hectares"
                    style={styles.input}
                    value={newFarm.size}
                    onChangeText={(text) => setNewFarm({ ...newFarm, size: text })}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Address *</Text>
                <TextInput
                  placeholder="e.g., Stellenbosch, Western Cape"
                  style={styles.input}
                  value={newFarm.address}
                  onChangeText={(text) => setNewFarm({ ...newFarm, address: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="map-outline" size={16} color="#16a34a" />
                  <Text style={styles.label}>GPS Coordinates</Text>
                </View>
                <TextInput
                  placeholder={`e.g., 19°29'31.7"E, 33°56'12.4"S`}
                  style={styles.input}
                  value={newFarm.coordinates}
                  onChangeText={(text) => setNewFarm({ ...newFarm, coordinates: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="leaf-outline" size={16} color="#16a34a" />
                  <Text style={styles.label}>Crop Types (comma-separated)</Text>
                </View>
                <TextInput
                  placeholder="e.g., Wheat, Corn, Vegetables"
                  style={styles.input}
                  value={newFarm.crops}
                  onChangeText={(text) => setNewFarm({ ...newFarm, crops: text })}
                />
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionSubtitle}>First Division (Optional)</Text>

              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Division Name</Text>
                  <TextInput
                    placeholder="e.g., Field A"
                    style={styles.input}
                    value={newFarm.divisionName}
                    onChangeText={(text) => setNewFarm({ ...newFarm, divisionName: text })}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Size</Text>
                  <TextInput
                    placeholder="e.g., 5 ha"
                    style={styles.input}
                    value={newFarm.divisionSize}
                    onChangeText={(text) => setNewFarm({ ...newFarm, divisionSize: text })}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Crop Type</Text>
                  <TextInput
                    placeholder="e.g., Wheat"
                    style={styles.input}
                    value={newFarm.divisionCrop}
                    onChangeText={(text) => setNewFarm({ ...newFarm, divisionCrop: text })}
                  />
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelBtn]}
                  onPress={() => {
                    setShowAddForm(false);
                    setNewFarm({
                      name: "",
                      address: "",
                      coordinates: "",
                      size: "",
                      crops: "",
                      divisionName: "",
                      divisionSize: "",
                      divisionCrop: "",
                    });
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleAddFarm}
                >
                  <Ionicons name="save-outline" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Save Farm</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.farmList}>
            {farmLocations.map((farm) => (
              <View key={farm.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.farmInfo}>
                    <Text style={styles.farmName}>{farm.name}</Text>
                    <View style={styles.farmDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={12} color="#6b7280" />
                        <Text style={styles.detailText}>{farm.address}</Text>
                      </View>
                      {farm.coordinates && (
                        <Text style={styles.coordinates}>📍 {farm.coordinates}</Text>
                      )}
                      {farm.size && (
                        <Text style={styles.detailText}>📏 {farm.size}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => setEditingFarm(farm.id === editingFarm ? null : farm.id)}
                      style={styles.iconButton}
                    >
                      <Ionicons name="create-outline" size={18} color="#16a34a" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteFarm(farm.id)}
                      style={styles.iconButton}
                    >
                      <Ionicons name="trash-outline" size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>

                {farm.crops.length > 0 && (
                  <View style={styles.cropsSection}>
                    <View style={styles.labelRow}>
                      <Ionicons name="leaf-outline" size={16} color="#16a34a" />
                      <Text style={styles.sectionLabel}>Crops Planted</Text>
                    </View>
                    <View style={styles.chipContainer}>
                      {farm.crops.map((crop, idx) => (
                        <View key={idx} style={styles.chip}>
                          <Text style={styles.chipText}>{crop}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.divisionsSection}>
                  <View style={styles.labelRow}>
                    <Ionicons name="grid-outline" size={16} color="#16a34a" />
                    <Text style={styles.sectionLabel}>
                      Farm Divisions ({farm.divisions.length})
                    </Text>
                  </View>
                  
                  {farm.divisions.length > 0 && (
                    <View style={styles.divisionList}>
                      {farm.divisions.map((division) => (
                        <View key={division.id} style={styles.divisionItem}>
                          <View style={styles.divisionInfo}>
                            <Text style={styles.divisionName}>{division.name}</Text>
                            <Text style={styles.divisionDetails}>
                              {division.size} • {division.cropType}
                            </Text>
                          </View>
                          <View style={styles.divisionActions}>
                            <View style={[styles.statusBadge, styles.activeBadge]}>
                              <Text style={styles.statusText}>{division.status}</Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleDeleteDivision(farm.id, division.id)}
                              style={styles.iconButton}
                            >
                              <Ionicons name="trash-outline" size={16} color="#dc2626" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {editingFarm === farm.id ? (
                    <View style={styles.addDivisionForm}>
                      <Text style={styles.addDivisionTitle}>Add New Division</Text>
                      <View style={styles.row}>
                        <TextInput
                          placeholder="Division name"
                          style={[styles.input, styles.flex1]}
                          value={newDivision.name}
                          onChangeText={(text) => setNewDivision({ 
                            ...newDivision, 
                            farmId: farm.id,
                            name: text 
                          })}
                        />
                        <TextInput
                          placeholder="Size"
                          style={[styles.input, styles.flex1]}
                          value={newDivision.size}
                          onChangeText={(text) => setNewDivision({ 
                            ...newDivision, 
                            farmId: farm.id,
                            size: text 
                          })}
                        />
                        <TextInput
                          placeholder="Crop type"
                          style={[styles.input, styles.flex1]}
                          value={newDivision.cropType}
                          onChangeText={(text) => setNewDivision({ 
                            ...newDivision, 
                            farmId: farm.id,
                            cropType: text 
                          })}
                        />
                      </View>
                      <TouchableOpacity
                        style={[styles.button, styles.addDivisionButton]}
                        onPress={() => handleAddDivision(farm.id)}
                      >
                        <Ionicons name="add" size={16} color="#fff" />
                        <Text style={styles.buttonText}>Add Division</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.button, styles.addDivisionTrigger]}
                      onPress={() => setEditingFarm(farm.id)}
                    >
                      <Ionicons name="add" size={16} color="#16a34a" />
                      <Text style={styles.addDivisionText}>Add Division to {farm.name}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {farmLocations.length === 0 && !showAddForm && (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No farm locations yet. Add your first farm location above.</Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => onOpenChange(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#f0fdf4",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#166534",
    marginLeft: 8,
  },
  subtitle: { 
    fontSize: 14, 
    color: "#065f46", 
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addFormCard: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  farmInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 4,
  },
  farmDetails: {
    gap: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#6b7280",
  },
  coordinates: {
    fontSize: 11,
    color: "#6b7280",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  cropsSection: {
    marginBottom: 12,
  },
  divisionsSection: {
    marginTop: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065f46",
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "500",
  },
  divisionList: {
    gap: 8,
    marginBottom: 12,
  },
  divisionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  divisionInfo: {
    flex: 1,
  },
  divisionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  divisionDetails: {
    fontSize: 12,
    color: "#6b7280",
  },
  divisionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#16a34a",
  },
  statusText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  addDivisionForm: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#93c5fd",
    gap: 8,
  },
  addDivisionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e40af",
  },
  addDivisionButton: {
    backgroundColor: "#2563eb",
  },
  addDivisionTrigger: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#86efac",
    borderStyle: "dashed",
  },
  addDivisionText: {
    color: "#16a34a",
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  addButton: {
    backgroundColor: "#16a34a",
  },
  saveButton: {
    backgroundColor: "#16a34a",
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d1d5db",
    flex: 1,
  },
  cancelText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "#e5e7eb",
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  closeButtonText: {
    textAlign: "center",
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#d1d5db",
    marginVertical: 16,
  },
  farmList: {
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },
});