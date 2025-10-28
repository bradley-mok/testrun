import PropTypes from 'prop-types';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { uploadMediaToSupabase } from "../services/imageService";
import { saveUserProfile } from '../services/userService';
import { storeData } from '../utilities/asyncStorage';

export function ProfileDialog({ open, onOpenChange }) {
  const { userData, saveUserProfile: saveAuthProfile } = useAuth();
  const [tab, setTab] = useState("personal");
  const [loading, setLoading] = useState(false);

  // Format "Member Since" date
  const date = new Date(userData?.created_at);
  const formattedDate = date.toLocaleString("en-US", { month: "long", year: "numeric" });

  // Split full name
  const userID = userData?.id || "";
  const fullName = userData?.full_name || "";
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] || "";
  const surname = nameParts.slice(1).join(" ") || "";

  const [profileData, setProfileData] = useState({
    first_name: firstName,
    last_name: surname,
    email: userData?.email || "",
    phone_number: userData?.phone_number || "",
    bio: userData?.bio || "",
    location: userData?.location || "",
    profile_image: userData?.profile_image || "",
    created_at: formattedDate || "",
    farmcount: userData?.farm_count || 0,
    account_type: userData?.account_type || "farmer",
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need gallery permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileData(prev => ({ ...prev, profile_image: result.assets[0].uri }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileData(prev => ({ ...prev, profile_image: result.assets[0].uri }));
    }
  };

const handleSaveProfile = async () => {
  if (loading) return;
  
  try {
    setLoading(true);
    let profileImageUrl = profileData.profile_image;

    console.log("Saving profile with image URL:", profileImageUrl);

    // Upload new image if it's a local URI
    if (profileImageUrl && profileImageUrl.startsWith("file://")) {
      const imageUrl = await uploadMediaToSupabase(
        profileImageUrl,
        userData?.id,
        "profilePictures",
        "image"
      );

      if (imageUrl) {
        profileImageUrl = imageUrl;
      } else {
        throw new Error("Image upload failed");
      }
    }

    // Prepare user updates
    const updates = {
      full_name: `${profileData.first_name} ${profileData.last_name}`.trim(),
      email: profileData.email,
      phone_number: profileData.phone_number,
      bio: profileData.bio,
      location: profileData.location,
      account_type: profileData.account_type,
      profile_image: profileImageUrl,
      updated_at: new Date().toISOString(),
    };

    // Update profile using AuthContext function
    const res = await saveAuthProfile(userID, updates);
    if (!res.success) {
      throw new Error(res.error || "Profile update failed");
    }

    Alert.alert("Profile Updated", "Your profile was updated successfully.");
    onOpenChange(false);
  } catch (err) {
    console.error("Save profile error:", err);
    Alert.alert("Error", err.message || "An unexpected error occurred.");
  } finally {
    setLoading(false);
  }
};
// Remove profile picture handler
const removeProfilePicture = () => {
  setProfileData((prev) => ({ ...prev, profile_image: null }));
};


  return (
    <Modal visible={!!open} animationType="slide" transparent onRequestClose={() => onOpenChange(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Edit Profile</Text>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {['personal', 'contact', 'about'].map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabButton, tab === t && styles.tabActive]}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.content}>
            {/* Profile Image */}
            <View style={styles.profilePictureSection}>
              <Text style={styles.sectionTitle}>Profile Picture</Text>
              <View style={styles.profilePictureContainer}>
                {profileData.profile_image ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: profileData.profile_image }} style={styles.profileImage} />
                    <TouchableOpacity style={styles.removeButton} onPress={removeProfilePicture}>
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <User size={32} color="#6b7280" />
                  </View>
                )}

                <View style={styles.uploadButtons}>
                  <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text style={styles.uploadButtonText}>Choose Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.uploadButton, styles.cameraButton]} onPress={takePhoto}>
                    <Camera size={16} color="#fff" />
                    <Text style={styles.uploadButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Tabs content */}
            {tab === 'personal' && (
              <>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  value={profileData.first_name}
                  onChangeText={(v) => handleInputChange("first_name", v)}
                  style={styles.input}
                />

                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  value={profileData.last_name}
                  onChangeText={(v) => handleInputChange("last_name", v)}
                  style={styles.input}
                />
              </>
            )}

            {tab === 'contact' && (
              <>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={profileData.email}
                  onChangeText={(v) => handleInputChange("email", v)}
                  style={styles.input}
                  keyboardType="email-address"
                />
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  value={profileData.phone_number}
                  onChangeText={(v) => handleInputChange("phone_number", v)}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
                <Text style={styles.label}>Address</Text>
                <TextInput
                  value={profileData.location}
                  onChangeText={(v) => handleInputChange("location", v)}
                  style={styles.input}
                />
              </>
            )}

            {tab === 'about' && (
              <>
                <Text style={styles.label}>Account Type</Text>
                <TextInput
                  value={profileData.account_type}
                  onChangeText={(v) => handleInputChange("account_type", v)}
                  style={styles.input}
                />
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  value={profileData.bio}
                  onChangeText={(v) => handleInputChange("bio", v)}
                  style={[styles.input, styles.textarea]}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.accountBox}>
                  <Text style={styles.accountTitle}>Account Status</Text>
                  <View style={styles.rowBetween}><Text>Plan:</Text><Text style={styles.bold}>Premium Farmer</Text></View>
                  <View style={styles.rowBetween}><Text>Member Since:</Text><Text style={styles.bold}>{profileData.created_at}</Text></View>
                  <View style={styles.rowBetween}><Text>Farms Managed:</Text><Text style={styles.bold}>{profileData.farmcount} Active</Text></View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnOutline]} 
              onPress={() => onOpenChange(false)}
              disabled={loading}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]} 
              onPress={handleSaveProfile}
              disabled={loading}
            >
              <Text style={styles.btnPrimaryText}>
                {loading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

ProfileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: 'white', borderRadius: 12, maxHeight: '90%', overflow: 'hidden' },
  title: { fontSize: 18, fontWeight: '700', padding: 16 },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tabButton: { flex: 1, padding: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#16a34a' },
  tabText: { color: '#6b7280' },
  tabTextActive: { color: '#065f46', fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingVertical: 12 },
  // Profile Picture Styles
  profilePictureSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  profilePictureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  imageContainer: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  uploadButtons: {
    flex: 1,
    gap: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cameraButton: {
    backgroundColor: '#2563eb',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Existing styles
  label: { fontSize: 13, color: '#374151', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, padding: 8, marginTop: 6 },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  accountBox: { backgroundColor: '#ecfdf5', borderColor: '#bbf7d0', padding: 12, borderRadius: 8, marginTop: 12 },
  accountTitle: { fontWeight: '700', color: '#065f46', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  bold: { fontWeight: '700' },
  buttonsRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  btn: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 6 },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1fae5', marginRight: 8 },
  btnPrimary: { backgroundColor: '#16a34a' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});