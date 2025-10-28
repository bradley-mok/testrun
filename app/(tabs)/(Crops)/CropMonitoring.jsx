import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Leaf, MapPin, Plus, X, BookOpen } from "lucide-react-native";
import { CropLogDialog } from "../../../components/CropLogDialog";
import { CropLogTimelineDialog } from "../../../components/CropLogTimelineDialog";
import { AddCropDialog } from "../../../components/AddCropDialog";  

export default function CropMonitoring() {
  // Change crops to state so we can update it
  const [crops, setCrops] = useState([
    {
      id: 1,
      name: "Tomatoes",
      variety: "Roma",
      plantedDate: "2024-03-15",
      status: "healthy",
      growth: 85,
      lastWatered: "2024-04-10",
      notes: "Looking great, flowers starting to appear",
      image:
        "https://images.unsplash.com/photo-1659817673498-3c45390f7c61?auto=format&fit=crop&w=1080&q=80",
      location: "Field A2",
      daysToHarvest: 24,
    },
    {
      id: 2,
      name: "Corn",
      variety: "Sweet Corn",
      plantedDate: "2024-03-20",
      status: "warning",
      growth: 65,
      lastWatered: "2024-04-08",
      notes: "Some pest activity detected on leaves",
      image:
        "https://images.unsplash.com/photo-1599138900450-3d06e89ad309?auto=format&fit=crop&w=1080&q=80",
      location: "Field B1",
      daysToHarvest: 45,
    },
    {
      id: 3,
      name: "Lettuce",
      variety: "Butterhead",
      plantedDate: "2024-04-01",
      status: "healthy",
      growth: 90,
      lastWatered: "2024-04-10",
      notes: "Ready for first harvest soon",
      image:
        "https://images.unsplash.com/photo-1595739431055-6c308d9f5af3?auto=format&fit=crop&w=1080&q=80",
      location: "Greenhouse 1",
      daysToHarvest: 3,
    },
    {
      id: 4,
      name: "Bell Peppers",
      variety: "Red Bell",
      plantedDate: "2024-03-10",
      status: "critical",
      growth: 40,
      lastWatered: "2024-04-06",
      notes: "Yellowing leaves, possible nutrient deficiency",
      image:
        "https://images.unsplash.com/photo-1691384630414-09dad88b297b?auto=format&fit=crop&w=1080&q=80",
      location: "Field C3",
      daysToHarvest: 60,
    },
  ]);

  // NEW: Log management state - UPDATED to use consistent structure
  const [logs, setLogs] = useState([
    {
      id: '1',
      date: '2024-04-10',
      activityType: 'Watering',
      description: 'Regular watering with added nutrients',
      plantCondition: 'Leaves are vibrant green and perky',
      image: null,
      cropId: 1
    },
    {
      id: '2',
      date: '2024-04-09',
      activityType: 'Inspection',
      description: 'Noticed some yellowing leaves, need to monitor',
      plantCondition: 'Minor yellowing on lower leaves, otherwise healthy',
      image: null,
      cropId: 1
    },
    {
      id: '3',
      date: '2024-04-10',
      activityType: 'Harvesting',
      description: 'Harvested fresh lettuce for market',
      plantCondition: 'Leaves are tender and ready for harvest',
      image: null,
      cropId: 3
    },
    {
      id: '4',
      date: '2024-04-08',
      activityType: 'Watering',
      description: 'Deep watering session after dry spell',
      plantCondition: 'Soil was dry, leaves slightly wilted before watering',
      image: null,
      cropId: 2
    }
  ]);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isViewLogsModalOpen, setIsViewLogsModalOpen] = useState(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false); // NEW: Add Crop modal state
  const [selectedCrop, setSelectedCrop] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "#22c55e";
      case "warning":
        return "#eab308";
      case "critical":
        return "#ef4444";
      default:
        return "#9ca3af";
    }
  };

  // NEW: Handle adding new crop
  const handleAddCrop = (newCropData) => {
    const newCrop = {
      id: Date.now(),
      name: newCropData.name,
      variety: newCropData.variety,
      plantedDate: newCropData.plantedDate.toISOString().split('T')[0],
      status: "healthy", // Default status
      growth: 10, // Default growth
      lastWatered: new Date().toISOString().split('T')[0], // Today
      notes: newCropData.notes || "Newly planted crop",
      image: newCropData.image || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1080&q=80", // Default plant image
      location: newCropData.location,
      daysToHarvest: Math.ceil((newCropData.expectedHarvestDate - newCropData.plantedDate) / (1000 * 60 * 60 * 24))
    };

    setCrops(prev => [newCrop, ...prev]);
    setIsAddCropModalOpen(false);
    Alert.alert("Success", `${newCropData.name} added successfully!`);
  };

  // NEW: Handle log creation from CropLogDialog - UPDATED with safety checks
  const handleSaveLog = (newLogData) => {
    // Add safety check
    if (!selectedCrop) {
      console.error("No crop selected");
      Alert.alert("Error", "No crop selected. Please try again.");
      return;
    }

    const log = {
      id: Date.now().toString(),
      date: newLogData.date || new Date(),
      activityType: newLogData.activityType || 'Observation',
      description: newLogData.description || '',
      plantCondition: newLogData.plantCondition || '',
      image: newLogData.image || null,
      cropId: selectedCrop.id
    };

    setLogs(prev => [log, ...prev]);
    setIsLogModalOpen(false);
  };

  // Filter logs for current crop
  const currentCropLogs = selectedCrop ? logs.filter(log => log.cropId === selectedCrop.id) : [];

  const renderCrop = ({ item }) => (
    <View style={[styles.card, { borderColor: getStatusColor(item.status) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.variety}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.location}>{item.location}</Text>
          </View>
        </View>
        <Text
          style={[
            styles.badge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          {item.status}
        </Text>
      </View>

      {/* Image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.image} />
        {item.daysToHarvest && item.daysToHarvest <= 7 && (
          <View style={styles.harvestBadge}>
            <Text style={styles.harvestText}>
              {item.daysToHarvest} days to harvest
            </Text>
          </View>
        )}
      </View>

      {/* Growth */}
      <View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Growth Progress</Text>
          <Text style={styles.progressValue}>{item.growth}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBar,
              { width: `${item.growth}%`, backgroundColor: getStatusColor(item.status) },
            ]}
          />
        </View>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Planted</Text>
          <Text style={styles.infoValue}>
            {new Date(item.plantedDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Last Watered</Text>
          <Text style={styles.infoValue}>
            {new Date(item.lastWatered).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.notesBox}>
        <Text style={styles.infoLabel}>Notes</Text>
        <Text style={styles.infoValue}>{item.notes}</Text>
      </View>

      {/* Buttons - REMOVED Photo and Water buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => {
            setSelectedCrop(item);
            setIsLogModalOpen(true);
          }}
        >
          <Leaf size={16} color="#065f46" />
          <Text style={styles.actionText}>Create Log</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.viewLogsBtn]}
          onPress={() => {
            setSelectedCrop(item);
            setIsViewLogsModalOpen(true);
          }}
        >
          <BookOpen size={16} color="#065f46" />
          <Text style={styles.actionText}>View Logs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>My Crops</Text>
          <Text style={styles.pageSubtitle}>
            Monitor your crops health 
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setIsAddCropModalOpen(true)} // UPDATED: Connect to modal
        >
          <Plus size={16} color="white" />
          <Text style={styles.addText}>Add Crop</Text>
        </TouchableOpacity>
      </View>

      {/* List with footer for tips so the FlatList remains the single scrollable container */}
      <FlatList
        data={crops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCrop}
        contentContainerStyle={{ paddingBottom: 20, gap: 16 }}
        ListFooterComponent={() => (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Growing Tips</Text>
            <Text style={styles.tip}>• Water early morning for best absorption</Text>
            <Text style={styles.tip}>• Check for pests weekly during growing season</Text>
            <Text style={styles.tip}>• Harvest lettuce when leaves are tender</Text>
          </View>
        )}
      />

      {/* CropLogDialog Component */}
      <CropLogDialog
        open={isLogModalOpen}
        onOpenChange={setIsLogModalOpen}
        cropName={selectedCrop?.name || ""}
        onSave={handleSaveLog}
      />

      {/* CropLogTimelineDialog Component */}
      <CropLogTimelineDialog
        open={isViewLogsModalOpen}
        onOpenChange={setIsViewLogsModalOpen}
        cropName={selectedCrop?.name || ""}
        logs={currentCropLogs}
      />

      {/* NEW: AddCropDialog Component */}
      <AddCropDialog
        open={isAddCropModalOpen}
        onOpenChange={setIsAddCropModalOpen}
        onAddCrop={handleAddCrop}
      />
    </View>
  );
}

// ... keep your existing styles the same
const styles = StyleSheet.create({
  container: { padding: 5, gap: 5, flex: 1, marginBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#065f46" },
  pageSubtitle: { fontSize: 14, color: "#16a34a" },
  addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#16a34a", padding: 8, borderRadius: 6 },
  addText: { color: "white", marginLeft: 4 },
  card: { backgroundColor: "white", borderWidth: 1, borderRadius: 10, padding: 12, gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { fontSize: 12, color: "#6b7280" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 12, color: "#6b7280" },
  badge: { color: "white", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontSize: 12 },
  imageWrapper: { borderRadius: 10, overflow: "hidden", position: "relative" },
  image: { width: "100%", height: 150, borderRadius: 10 },
  harvestBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "#f97316", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  harvestText: { fontSize: 12, color: "white" },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  progressLabel: { fontSize: 12 },
  progressValue: { fontSize: 12, fontWeight: "600" },
  progressBarBg: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 6, overflow: "hidden" },
  progressBar: { height: "100%" },
  infoGrid: { flexDirection: "row", gap: 8 },
  infoBox: { flex: 1, backgroundColor: "#f9fafb", borderRadius: 8, padding: 8 },
  infoLabel: { fontSize: 12, color: "#6b7280" },
  infoValue: { fontSize: 12, fontWeight: "500" },
  notesBox: { backgroundColor: "#f9fafb", borderRadius: 8, padding: 8 },
  actions: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 8, 
    gap: 8 
  },
  actionBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    flex: 1, 
    justifyContent: "center", 
    gap: 4, 
    backgroundColor: "#f3f4f6", 
    padding: 12, 
    borderRadius: 8 
  },
  viewLogsBtn: {
    flex: 1,
  },
  actionText: { fontSize: 12, color: "#065f46", fontWeight: "500" },
  tipsCard: { backgroundColor: "#e0f2fe", borderRadius: 10, padding: 12, marginTop: 16 },
  tipsTitle: { fontWeight: "600", color: "#1e3a8a", marginBottom: 8 },
  tip: { fontSize: 12, color: "#1e40af" },
});