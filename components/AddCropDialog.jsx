import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Calendar, Upload, X, Sprout } from "lucide-react-native";

export function AddCropDialog({ open, onOpenChange, onAddCrop }) {
  const [name, setName] = useState("");
  const [variety, setVariety] = useState("");
  const [plantedDate, setPlantedDate] = useState(new Date());
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
  );
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showPlantedDatePicker, setShowPlantedDatePicker] = useState(false);
  const [showHarvestDatePicker, setShowHarvestDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!name || !variety || !location) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (expectedHarvestDate <= plantedDate) {
      Alert.alert("Error", "Expected harvest date must be after planted date");
      return;
    }

    const newCrop = {
      name: name,
      variety,
      plantedDate,
      expectedHarvestDate,
      location,
      notes,
      image: imageUrl
    };

    onAddCrop(newCrop);
    
    // Reset form
    setName("");
    setVariety("");
    setPlantedDate(new Date());
    setExpectedHarvestDate(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));
    setLocation("");
    setNotes("");
    setImageUrl("");
    
    onOpenChange(false);
    Alert.alert("Success", `${name} added successfully!`);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImagePick = async () => {
    // Placeholder for image picker functionality
    Alert.alert("Image Picker", "Image picker would open here in a real app");
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scrollView}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <Sprout size={20} color="#16a34a" />
                <Text style={styles.title}>Add New Crop</Text>
              </View>
              <Text style={styles.description}>
                Add a new crop to your monitoring system
              </Text>
            </View>

            {/* Crop Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Crop Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Tomatoes, Corn, Lettuce"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Variety */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Variety *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Roma, Cherry, Beefsteak"
                value={variety}
                onChangeText={setVariety}
              />
            </View>

            {/* Location */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Field A1, Greenhouse 2, Garden Plot 1"
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Date Grid */}
            <View style={styles.dateGrid}>
              {/* Planted Date */}
              <View style={styles.dateField}>
                <Text style={styles.label}>Planted Date *</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowPlantedDatePicker(true)}
                >
                  <Calendar size={16} color="#6b7280" />
                  <Text style={styles.dateText}>{formatDate(plantedDate)}</Text>
                </TouchableOpacity>
              </View>

              {/* Expected Harvest Date */}
              <View style={styles.dateField}>
                <Text style={styles.label}>Harvest Date *</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowHarvestDatePicker(true)}
                >
                  <Calendar size={16} color="#6b7280" />
                  <Text style={styles.dateText}>{formatDate(expectedHarvestDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Image Upload */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Photo (Optional)</Text>
              {imageUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setImageUrl("")}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.uploadArea}
                  onPress={handleImagePick}
                >
                  <Upload size={32} color="#9ca3af" />
                  <Text style={styles.uploadText}>Tap to upload crop image</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Notes */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textArea, styles.multilineInput]}
                placeholder="Add any additional notes about this crop (e.g., seed source, special requirements, goals...)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => onOpenChange(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.saveButtonText}>Add Crop</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  dateGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 20,
    padding: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#16a34a',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
};