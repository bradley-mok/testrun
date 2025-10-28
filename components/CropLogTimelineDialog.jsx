import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  Droplets,
  Sprout,
  Scissors,
  Bug,
  Heart,
  Leaf,
  Trash2,
  Package,
  Move,
  Eye,
  Calendar,
  X,
} from "lucide-react-native";

export function CropLogTimelineDialog({
  open,
  onOpenChange,
  cropName,
  logs
}) {
  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case "Watering":
        return <Droplets size={20} color="#2563eb" />;
      case "Fertilizing":
        return <Sprout size={20} color="#16a34a" />;
      case "Pruning":
        return <Scissors size={20} color="#ea580c" />;
      case "Pest Control":
        return <Bug size={20} color="#dc2626" />;
      case "Disease Treatment":
        return <Heart size={20} color="#db2777" />;
      case "Weeding":
        return <Trash2 size={20} color="#ca8a04" />;
      case "Mulching":
        return <Leaf size={20} color="#d97706" />;
      case "Harvesting":
        return <Package size={20} color="#9333ea" />;
      case "Transplanting":
        return <Move size={20} color="#4f46e5" />;
      case "Observation":
        return <Eye size={20} color="#6b7280" />;
      default:
        return <Leaf size={20} color="#16a34a" />;
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case "Watering":
        return { backgroundColor: "#dbeafe", borderColor: "#bfdbfe" };
      case "Fertilizing":
        return { backgroundColor: "#dcfce7", borderColor: "#bbf7d0" };
      case "Pruning":
        return { backgroundColor: "#ffedd5", borderColor: "#fed7aa" };
      case "Pest Control":
        return { backgroundColor: "#fee2e2", borderColor: "#fecaca" };
      case "Disease Treatment":
        return { backgroundColor: "#fce7f3", borderColor: "#fbcfe8" };
      case "Weeding":
        return { backgroundColor: "#fef9c3", borderColor: "#fef08a" };
      case "Mulching":
        return { backgroundColor: "#fef3c7", borderColor: "#fde68a" };
      case "Harvesting":
        return { backgroundColor: "#f3e8ff", borderColor: "#e9d5ff" };
      case "Transplanting":
        return { backgroundColor: "#e0e7ff", borderColor: "#c7d2fe" };
      case "Observation":
        return { backgroundColor: "#f3f4f6", borderColor: "#e5e7eb" };
      default:
        return { backgroundColor: "#dcfce7", borderColor: "#bbf7d0" };
    }
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Crop Activity Log</Text>
              <Text style={styles.description}>
                Timeline of activities and observations for {cropName}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => onOpenChange(false)}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {sortedLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <Leaf size={64} color="#d1d5db" />
                <Text style={styles.emptyTitle}>No log entries yet</Text>
                <Text style={styles.emptyDescription}>
                  Start documenting your crop's journey by creating your first log entry
                </Text>
              </View>
            ) : (
              <View style={styles.timelineContainer}>
                <View style={styles.timelineLine} />
                
                <View style={styles.logsContainer}>
                  {sortedLogs.map((log, index) => (
                    <View key={log.id} style={styles.logItem}>
                      <View style={styles.timelineDot} />
                      
                      <View style={[styles.logCard, getActivityColor(log.activityType)]}>
                        <View style={styles.logHeader}>
                          <View style={styles.logHeaderLeft}>
                            <View style={styles.iconContainer}>
                              {getActivityIcon(log.activityType)}
                            </View>
                            <View>
                              <Text style={styles.activityType}>{log.activityType}</Text>
                              <View style={styles.dateContainer}>
                                <Calendar size={12} color="#6b7280" />
                                <Text style={styles.dateText}>
                                  {formatDate(log.date)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        {log.image && (
                          <View style={styles.imageContainer}>
                            <Image 
                              source={{ uri: log.image }} 
                              style={styles.image}
                            />
                          </View>
                        )}

                        <View style={styles.conditionContainer}>
                          <Text style={styles.sectionLabel}>Plant Condition</Text>
                          <Text style={styles.sectionText}>{log.plantCondition}</Text>
                        </View>

                        <View style={styles.descriptionContainer}>
                          <Text style={styles.sectionLabel}>Activity Performed</Text>
                          <Text style={styles.sectionText}>{log.description}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {sortedLogs.length > 0 && (
                  <View style={styles.plantedItem}>
                    <View style={styles.plantedDot} />
                    <View style={styles.plantedCard}>
                      <View style={styles.plantedContent}>
                        <Sprout size={20} color="#16a34a" />
                        <Text style={styles.plantedText}>
                          Planted on {formatDate(sortedLogs[sortedLogs.length - 1].date)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
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
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
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
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  timelineContainer: {
    paddingVertical: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: 35,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#4ade80',
  },
  logsContainer: {
    gap: 24,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#10b981',
    marginRight: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  logCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  conditionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  plantedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    marginTop: 24,
  },
  plantedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#bbf7d0',
    borderWidth: 4,
    borderColor: '#86efac',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  plantedCard: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#bbf7d0',
    padding: 16,
  },
  plantedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plantedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
};