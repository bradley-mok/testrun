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
import { Calendar, Upload, X } from "lucide-react-native";

export function CropLogDialog({ open, onOpenChange, cropName, onSave }) {
  const [date, setDate] = useState(new Date());
  const [activityType, setActivityType] = useState("");
  const [description, setDescription] = useState("");
  const [plantCondition, setPlantCondition] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const activityTypes = [
    "Watering",
    "Fertilizing",
    "Pruning",
    "Pest Control",
    "Disease Treatment",
    "Weeding",
    "Mulching",
    "Harvesting",
    "Transplanting",
    "Observation"
  ];

  const handleSubmit = () => {
    if (!activityType || !description || !plantCondition) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const newLog = {
      date,
      activityType,
      description,
      plantCondition,
      image: imageUrl
    };

    onSave(newLog);
    
    // Reset form
    setDate(new Date());
    setActivityType("");
    setDescription("");
    setPlantCondition("");
    setImageUrl("");
    
    onOpenChange(false);
    Alert.alert("Success", "Log entry created successfully!");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImagePick = async () => {
    // For React Native, you would use expo-image-picker here
    // This is a placeholder for image picking functionality
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
              <Text style={styles.title}>Create Log Entry</Text>
              <Text style={styles.description}>
                Document the progress and activities for {cropName}
              </Text>
            </View>

            {/* Date Picker */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            </View>

            {/* Activity Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Activity Type *</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.activityTypeScroll}
              >
                <View style={styles.activityTypeContainer}>
                  {activityTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.activityTypeButton,
                        activityType === type && styles.activityTypeButtonActive
                      ]}
                      onPress={() => setActivityType(type)}
                    >
                      <Text style={[
                        styles.activityTypeText,
                        activityType === type && styles.activityTypeTextActive
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Photo Upload */}
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
                  <Text style={styles.uploadText}>Tap to upload image</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Plant Condition */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Plant Condition *</Text>
              <TextInput
                style={[styles.textArea, styles.multilineInput]}
                placeholder="Describe what the plant looks like today (e.g., leaves are bright green, new shoots appearing, flowers budding...)"
                value={plantCondition}
                onChangeText={setPlantCondition}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Activity Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Activity Description *</Text>
              <TextInput
                style={[styles.textArea, styles.multilineInput]}
                placeholder="Describe what you did (e.g., applied 500ml water, added organic fertilizer, removed dead leaves...)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Buttons */}
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
                <Text style={styles.saveButtonText}>Save Log Entry</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
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
  activityTypeScroll: {
    marginHorizontal: -20,
  },
  activityTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  activityTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  activityTypeButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  activityTypeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activityTypeTextActive: {
    color: '#fff',
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