import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { AlertTriangle, Camera, CheckCircle, Clock, Droplets, Leaf, MapPin, MessageCircle, ScanLine, Search, Send, Sun, Thermometer, Upload, X } from "lucide-react-native";
import { useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { analyzeCropImage, sendMessageToChatGPT } from "../../../chatapi/chatbot";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { Separator } from "../../../components/Separator";

export default function CropInformation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [newMessage, setNewMessage] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const cameraRef = useRef(null);

  // NEW: Track chat histories for each crop individually
  const [cropChatHistories, setCropChatHistories] = useState({});

  // Get current crop's chat messages
  const currentChatMessages = selectedCrop ? (cropChatHistories[selectedCrop.id] || []) : [];

  const cropsData = [
    {
      id: "tomatoes",
      name: "Tomatoes",
      category: "Fruit Vegetables",
      description: "Popular warm-season crop that produces red, juicy fruits perfect for fresh eating and cooking.",
      growthPeriod: "70-85 days",
      difficulty: "Medium",
      season: ["Spring", "Summer"],
      waterRequirement: "Medium",
      sunRequirement: "Full Sun",
      temperature: "18-25°C",
      spacing: "45-60cm apart",
      image: "https://images.unsplash.com/photo-1659817673498-3c45390f7c61?ixlib=rb-4.1.0&q=80&w=1080",
      pests: [
        {
          name: "Aphids",
          description: "Small insects that feed on plant sap",
          symptoms: ["Curled leaves", "Yellowing"],
          solutions: ["Spray with water", "Use insecticidal soap"],
          severity: "Medium",
        },
        {
          name: 'Tomato Hornworm',
          description: 'Large green caterpillars that can defoliate plants quickly',
          symptoms: ['Large holes in leaves', 'Black droppings', 'Stripped stems'],
          solutions: ['Hand picking', 'Bt spray', 'Encourage parasitic wasps'],
          severity: 'High'
        },
        {
          name: 'Early Blight',
          description: 'Fungal disease causing dark spots on leaves',
          symptoms: ['Dark spots with rings', 'Yellow halos', 'Defoliation'],
          solutions: ['Remove affected leaves', 'Apply fungicide', 'Improve air circulation'],
          severity: 'Medium'
        }
      ],
      nutrients: ["Nitrogen", "Phosphorus", "Potassium"],
      tips: ["Provide support with stakes", "Water at soil level"],
    },
    {
      id: "lettuce",
      name: "Lettuce",
      category: "Leafy Greens",
      description: "Cool-season crop that grows quickly and provides fresh salad greens.",
      growthPeriod: "45-65 days",
      difficulty: "Easy",
      season: ["Spring", "Fall"],
      waterRequirement: "Medium",
      sunRequirement: "Partial",
      temperature: "10-20°C",
      spacing: "15-20cm apart",
      image: "https://images.unsplash.com/photo-1595739431055-6c308d9f5af3?ixlib=rb-4.1.0&q=80&w=1080",
      pests: [],
      nutrients: ["Nitrogen", "Potassium"],
      tips: ["Plant in succession", "Harvest outer leaves first"],
    },
    {
      id: 'corn',
      name: 'Sweet Corn',
      category: 'Grains',
      description: 'Tall warm-season crop that produces sweet, tender kernels.',
      growthPeriod: '60-90 days',
      difficulty: 'Medium',
      season: ['Spring', 'Summer'],
      waterRequirement: 'High',
      sunRequirement: 'Full Sun',
      temperature: '15-30°C',
      spacing: '30cm apart',
      image: 'https://images.unsplash.com/photo-1599138900450-3d06e89ad309?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwZmllbGQlMjBncmVlbiUyMHJvd3N8ZW58MXx8fHwxNzU1MDUzNjY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      pests: [
        {
          name: 'Corn Earworm',
          description: 'Caterpillars that feed on corn kernels',
          symptoms: ['Holes in kernels', 'Frass in ears', 'Damaged husks'],
          solutions: ['Bt spray', 'Oil ear tips', 'Pheromone traps'],
          severity: 'High'
        },
        {
          name: 'Cutworms',
          description: 'Ground-dwelling caterpillars that cut young plants',
          symptoms: ['Cut stems', 'Wilted plants', 'Missing seedlings'],
          solutions: ['Collar barriers', 'Bt soil treatment', 'Hand picking'],
          severity: 'Medium'
        }
      ],
      nutrients: ['Nitrogen', 'Phosphorus', 'Potassium'],
      tips: [
        'Plant in blocks for better pollination',
        'Water deeply but less frequently',
        'Side-dress with compost mid-season',
        'Harvest when kernels are milky'
      ]
    }
  ];

  const filteredCrops = cropsData.filter(
    (crop) =>
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // NEW: Handle crop selection with chat history management
  const handleCropSelect = (crop) => {
    setSelectedCrop(crop);
    setActiveTab("overview"); // Reset to overview tab when selecting new crop
  };

  // NEW: Handle closing modal
  const handleCloseModal = () => {
    setSelectedCrop(null);
  };

  // UPDATED: Handle sending messages with crop-specific history
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCrop) return;

    const userMessage = {
      id: Date.now().toString(),
      content: newMessage,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update chat history for current crop
    const updatedMessages = [...currentChatMessages, userMessage];
    setCropChatHistories(prev => ({
      ...prev,
      [selectedCrop.id]: updatedMessages
    }));
    
    setNewMessage('');

    try {
      const loadingMessage = {
        id: 'loading',
        content: 'Thinking...',
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Add loading message to current crop's chat
      setCropChatHistories(prev => ({
        ...prev,
        [selectedCrop.id]: [...updatedMessages, loadingMessage]
      }));

      const aiResponse = await sendMessageToChatGPT(newMessage, selectedCrop.name);

      // Replace loading message with actual response
      setCropChatHistories(prev => ({
        ...prev,
        [selectedCrop.id]: updatedMessages.concat({
          id: Date.now().toString(),
          content: aiResponse,
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }));
    } catch (error) {
      // Replace loading message with error
      setCropChatHistories(prev => ({
        ...prev,
        [selectedCrop.id]: updatedMessages.concat({
          id: Date.now().toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }));
    }
  };

  // UPDATED: Handle image analysis with crop-specific chat history
  const analyzeImage = async () => {
    if (!capturedImage?.base64) return;
    
    setIsAnalyzing(true);
    try {
      // Use the actual image data for analysis
      const result = await analyzeCropImage(capturedImage.base64, selectedCrop?.name || '');
      setAnalysisResult(result);
      
      const analysisMessage = {
        id: Date.now().toString(),
        content: result, // This now contains real AI analysis
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Add analysis to current crop's chat history
      setCropChatHistories(prev => ({
        ...prev,
        [selectedCrop.id]: [...currentChatMessages, analysisMessage]
      }));
      
    } catch (error) {
      alert('Failed to analyze image. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: false
        });
        setCapturedImage(photo);
      } catch (error) {
        console.error('Error taking picture:', error);
        alert('Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setCapturedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return { backgroundColor: "#bbf7d0" };
      case "Medium": return { backgroundColor: "#fef08a" };
      case "Hard": return { backgroundColor: "#fecaca" };
      default: return { backgroundColor: "#e5e7eb" };
    }
  };

  const renderCropItem = ({ item: crop }) => (
    <View style={styles.card}>
      <Image source={{ uri: crop.image }} style={styles.cropImage} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.cropName}>{crop.name}</Text>
            <Text style={styles.cropCategory}>{crop.category}</Text>
          </View>
          <View style={[styles.badge, getDifficultyColor(crop.difficulty)]}>
            <Text style={styles.badgeText}>{crop.difficulty}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.infoRow}>
              <Clock size={14} color="#6b7280" />
              <Text style={styles.infoText}>{crop.growthPeriod}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoRow}>
              <Droplets size={14} color="#06b6d4" />
              <Text style={styles.infoText}>{crop.waterRequirement} water</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoRow}>
              <Sun size={14} color="#f59e0b" />
              <Text style={styles.infoText}>{crop.sunRequirement}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoRow}>
              <Thermometer size={14} color="#ef4444" />
              <Text style={styles.infoText}>{crop.temperature}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.viewButton} onPress={() => handleCropSelect(crop)}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenWrapper bg={"FF2F2F2"}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredCrops}
          keyExtractor={(item) => item.id}
          renderItem={renderCropItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <Modal visible={!!selectedCrop} animationType="slide">
          {selectedCrop && (
            <KeyboardAvoidingView 
              style={styles.modalContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Leaf size={20} color="#16a34a" />
                  <Text style={styles.modalTitle}>{selectedCrop.name}</Text>
                </View>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Text style={{ color: "red" }}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tabRow}>
                {["overview", "pests", "chat", "scan"].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={{ color: activeTab === tab ? "white" : "#333", fontSize: 11, fontWeight: "600" }}>
                      {tab.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flex: 1, width: "100%", paddingHorizontal: 16,borderRadius: 8, marginBottom: 30 }}>
                {activeTab === "overview" && (
                  <ScrollView style={{ flex: 1, marginTop: 10 }} contentContainerStyle={{ paddingBottom: 24 }}>
                    <Image source={{ uri: selectedCrop.image }} style={styles.detailImage} />
                    <Text style={{ marginBottom: 8 }}>{selectedCrop.description}</Text>

                    <View style={[styles.detailGrid, { backgroundColor: "#f0fdf4" }]}>
                      <View style={styles.detailCol}>
                        <View style={styles.detailRow}>
                          <Clock size={16} color="#16a34a" />
                          <Text style={styles.detailLabel}>Growth Period:</Text>
                          <Text style={styles.detailValue}>{selectedCrop.growthPeriod}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Droplets size={16} color="#06b6d4" />
                          <Text style={styles.detailLabel}>Water:</Text>
                          <Text style={styles.detailValue}>{selectedCrop.waterRequirement}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Sun size={16} color="#f59e0b" />
                          <Text style={styles.detailLabel}>Sun:</Text>
                          <Text style={styles.detailValue}>{selectedCrop.sunRequirement}</Text>
                        </View>
                      </View>
                      <View style={styles.detailCol}>
                        <View style={styles.detailRow}>
                          <Thermometer size={16} color="#ef4444" />
                          <Text style={styles.detailLabel}>Temperature:</Text>
                          <Text style={styles.detailValue}>{selectedCrop.temperature}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <MapPin size={16} color="#f97316" />
                          <Text style={styles.detailLabel}>Spacing:</Text>
                          <Text style={styles.detailValue}>{selectedCrop.spacing}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={{ marginTop: 12 }}>
                      <Text style={{ fontWeight: "600", marginBottom: 6 }}>Growing Tips:</Text>
                      {selectedCrop.tips.map((tip, i) => (
                        <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                          <CheckDot />
                          <Text style={{ flex: 1 }}>{tip}</Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}

                {activeTab === "pests" && (
                  <ScrollView style={{ flex: 1, marginTop: 10 }} contentContainerStyle={{ paddingBottom: 24 }}>
                    {selectedCrop.pests.map((pest, idx) => (
                      <View key={idx} style={styles.pestCard}>
                        <Text style={{ fontWeight: "600", marginBottom: 4 }}>{pest.name}</Text>
                        <Text style={{ fontSize: 12, marginBottom: 6 }}>{pest.description}</Text>
                        <AlertTriangle size={20} color={"#F0B100"} />
                        <Text style={{ fontWeight: "600", marginBottom: 4 }}>Symptoms:</Text>
                        {pest.symptoms.map((s, i) => (
                          <Text key={i} style={{ marginLeft: 8 }}>• {s}</Text>
                        ))}
                        <Separator/>
                        <View style={{ height: 8 }} />
                        <CheckCircle size={20} color={"#39BE6E"}/>
                        <Text style={{ fontWeight: "600", marginBottom: 4 }}>Solutions:</Text>
                        {pest.solutions.map((s, i) => (
                          <Text key={i} style={{ marginLeft: 8 }}>• {s}</Text>
                        ))}
                      </View>
                    ))}
                  </ScrollView>
                )}

                {activeTab === "chat" && (
                  <View style={styles.chatContainer}>
                    <ScrollView 
                      style={styles.chatMessages}
                      contentContainerStyle={styles.chatMessagesContent}
                      ref={ref => {
                        // Auto-scroll to bottom when new messages are added
                        if (ref && currentChatMessages.length > 0) {
                          setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
                        }
                      }}
                    >
                      <Text style={{ textAlign: "Left", color: "#16a34a", fontWeight: "600", marginBottom: 8 }}>Crop Assistant - {selectedCrop.name}</Text>
                      <Separator />
                      {currentChatMessages.length === 0 && (
                        <View style={{ alignItems: "center", padding: 20 }}>
                          <MessagePlaceholder />
                          <Text style={{ color: "#666", marginTop: 8 }}>Ask me anything about {selectedCrop.name}!</Text>
                        </View>
                      )}
                      {currentChatMessages.map((msg) => (
                        <View key={msg.id} style={[styles.chatMessage, msg.isBot ? styles.botMessage : styles.userMessage]}>
                          <Text style={{ color: msg.isBot ? "#000" : "#fff" }}>{msg.content}</Text>
                          <Text style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>{msg.timestamp}</Text>
                        </View>
                      ))}
                    </ScrollView>

                    <View style={styles.chatInputContainer}>
                      <TextInput
                        style={styles.chatInput}
                        placeholder={`Ask about ${selectedCrop.name}...`}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                        maxLength={500}
                      />
                      <TouchableOpacity 
                        onPress={handleSendMessage} 
                        style={[
                          styles.sendButton,
                          !newMessage.trim() && styles.sendButtonDisabled
                        ]}
                        disabled={!newMessage.trim()}
                      >
                        <Send size={20} color={newMessage.trim() ? "#16a34a" : "#ccc"} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {activeTab === "scan" && (
                  <ScrollView style={{ flex: 1, marginTop: 10 }} contentContainerStyle={styles.scanBox}>
                    <Camera size={40} color="#16a34a" />
                    <Text style={{ marginTop: 8, textAlign: "center" }}>Crop Health Scanner</Text>
                    <TouchableOpacity style={styles.scanButton} onPress={() => setIsCameraOpen(true)}>
                      <ScanLine size={16} color="#fff" />
                      <Text style={{ color: "white", marginLeft: 6 }}>Start Camera Scan</Text>
                    </TouchableOpacity>

                    {/* Camera Modal - Now properly placed inside scan tab */}
                    <Modal visible={isCameraOpen} animationType="slide">
                      <View style={styles.cameraModalContainer}>
                        <View style={styles.cameraHeader}>
                          <Text style={styles.cameraTitle}>Crop Health Scanner</Text>
                          <TouchableOpacity onPress={() => {
                            setIsCameraOpen(false);
                            resetCamera();
                          }} style={styles.closeButton}>
                            <X size={24} color="#fff" />
                          </TouchableOpacity>
                        </View>

                        {!permission?.granted ? (
                          <View style={styles.permissionContainer}>
                            <Text style={styles.permissionText}>Camera permission is required to scan crops</Text>
                            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                              <Text style={styles.permissionButtonText}>Grant Permission</Text>
                            </TouchableOpacity>
                          </View>
                        ) : capturedImage ? (
                          <View style={styles.previewContainer}>
                            <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
                            
                            {analysisResult ? (
                              <ScrollView style={styles.analysisResult}>
                                <Text style={styles.analysisTitle}>Analysis Result</Text>
                                <Text style={styles.analysisText}>{analysisResult}</Text>
                                <View style={styles.previewButtons}>
                                  <TouchableOpacity style={[styles.cameraButton, { backgroundColor: '#16a34a' }]} onPress={retakePhoto}>
                                    <Text style={styles.buttonText}>Scan Another</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={[styles.cameraButton, { backgroundColor: '#3b82f6' }]} onPress={() => {
                                    setIsCameraOpen(false);
                                    resetCamera();
                                    setActiveTab('chat');
                                  }}>
                                    <Text style={styles.buttonText}>View in Chat</Text>
                                  </TouchableOpacity>
                                </View>
                              </ScrollView>
                            ) : (
                              <View style={styles.previewActions}>
                                {isAnalyzing ? (
                                  <View style={styles.analyzingContainer}>
                                    <ActivityIndicator size="large" color="#16a34a" />
                                    <Text style={styles.analyzingText}>Analyzing crop health...</Text>
                                  </View>
                                ) : (
                                  <>
                                    <TouchableOpacity style={[styles.cameraButton, { backgroundColor: '#ef4444' }]} onPress={retakePhoto}>
                                      <Text style={styles.buttonText}>Retake</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.cameraButton, { backgroundColor: '#16a34a' }]} onPress={analyzeImage}>
                                      <Text style={styles.buttonText}>Analyze Crop</Text>
                                    </TouchableOpacity>
                                  </>
                                )}
                              </View>
                            )}
                          </View>
                        ) : (
                          <View style={styles.cameraContainer}>
                            {/* Fixed CameraView - no children, using overlay instead */}
                            <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
                            
                            {/* Camera controls positioned absolutely over the camera */}
                            <View style={styles.cameraOverlay}>
                              <View style={styles.cameraControls}>
                                <TouchableOpacity style={styles.flipButton} onPress={() => setFacing(current => current === 'back' ? 'front' : 'back')}>
                                  <Text style={styles.flipText}>Flip Camera</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                            
                            <View style={styles.cameraActions}>
                              <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                                <Upload size={24} color="#fff" />
                                <Text style={styles.galleryText}>Gallery</Text>
                              </TouchableOpacity>
                              
                              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                                <View style={styles.captureCircle} />
                              </TouchableOpacity>
                              
                              <View style={styles.placeholder} />
                            </View>
                          </View>
                        )}
                      </View>
                    </Modal>
                  </ScrollView>
                )}
              </View>
            </KeyboardAvoidingView>
          )}
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

function CheckDot() {
  return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#16a34a", marginTop: 6, marginRight: 8 }} />;
}

function MessagePlaceholder() {
  return <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}><MessageCircle size={28} color="#94a3b8" /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  cropImage: { width: 100, height: 100, borderRadius: 6 },
  cropName: { fontWeight: "600", fontSize: 16 },
  cropCategory: { fontSize: 12, color: "#666" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  infoGrid: { marginTop: 4, flexDirection: "row", flexWrap: "wrap" },
  infoItem: { width: "50%", paddingRight:4, paddingBottom: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { marginLeft: 2, color: "#374151", fontSize: 10 },
  viewButton: {
    marginTop: 8,
    backgroundColor: "#16a34a",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  viewButtonText: { color: "#fff", fontWeight: "600" },
  modalContainer: { 
    flex: 1, 
    padding: 16, 
    paddingTop: Platform.OS === 'ios' ? 60 : 80, 
    backgroundColor: "#fff" 
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  tabRow: { flexDirection: "row", marginTop: 10 },
  tabButton: {
    flex: 1,
    paddingHorizontal: 4,
    borderRadius: 6,
    paddingVertical: 6,
    marginRight: 6,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tabButtonActive: { 
    backgroundColor: "#16a34a", 
    borderColor: "#16a34a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  detailImage: { width: "100%", height: 150, borderRadius: 8, marginBottom: 8 },
  detailGrid: { flexDirection: "column", padding: 10, borderRadius: 6 },
  detailCol: { flex: 1 },
  detailRow: { flexDirection: "row", alignItems: "center", gap:10, marginBottom: 8 },
  detailLabel: { fontWeight: "600", marginLeft: 4, flex: 1 },
  detailValue: { flex: 1 },
  pestCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderColor: "#69d63dff",
    borderWidth: 1,
    borderLeftColor: "#FFC9C9",
    borderLeftWidth: 6,
    borderRadius: 12,
    marginBottom: 6,
  },
  // UPDATED: Chat styles for better keyboard handling
  chatContainer: {
    flex: 1,
    marginTop: 10,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    paddingBottom: 10,
  },
  chatMessage: { 
    padding: 12, 
    borderRadius: 12, 
    marginVertical: 4, 
    marginHorizontal: 8,
    maxWidth: "85%",
  },
  botMessage: { 
    backgroundColor: "#f3f4f6", 
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  userMessage: { 
    backgroundColor: "#16a34a", 
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: Platform.OS === 'ios' ? 0 : 12,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: '#fff',
  },
  chatInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: "#d1d5db", 
    borderRadius: 24, 
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    marginRight: 8,
    maxHeight: 50,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  sendButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  scanBox: { 
    alignItems: "center", 
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  cameraModalContainer: { flex: 1, backgroundColor: '#000' },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#000',
  },
  cameraTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeButton: { padding: 5 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  permissionButton: { backgroundColor: '#16a34a', padding: 15, borderRadius: 10 },
  permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cameraContainer: { 
    flex: 1,
    position: 'relative', // Important for absolute positioning
  },
  camera: { 
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none', // Allows touches to pass through to camera
  },
  cameraControls: {
    flex: 1,
    padding: 20,
  },
  flipButton: { 
    alignSelf: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: 10, 
    borderRadius: 5 
  },
  flipText: { 
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  galleryButton: { alignItems: 'center' },
  galleryText: { color: '#fff', fontSize: 12, marginTop: 5 },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
  },
  placeholder: { width: 60 },
  previewContainer: { flex: 1, backgroundColor: '#000' },
  previewImage: { flex: 1, width: '100%' },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#000',
  },
  cameraButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  analyzingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#000',
  },
  analyzingText: { color: '#fff', fontSize: 18, marginTop: 20 },
  analysisResult: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 20,
    maxHeight: '50%',
  },
  analysisTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15,
    color: '#16a34a',
  },
  analysisText: { 
    fontSize: 16, 
    lineHeight: 24,
    color: '#333',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});