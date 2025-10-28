// ActivityTracker.jsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Bell, Bug, Calendar, Check, Circle, Clock, Download, Droplets, File, FileText, Filter, Pencil, Play, Plus, Scissors, Sprout, Trash2 } from "lucide-react-native";
import { useContext, useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { Badge, Button, Card, Checkbox, Dialog, Text as PaperText, Portal, } from "react-native-paper";
import ScreenWrapper from "../../components/ScreenWrapper";
import { AppDataContext } from '../../context/AppDataProvider';
import { hp, wp } from "../../helpers/dimensions";

// Helper toast function (Android: ToastAndroid; iOS: Alert fallback)
const showToast = (message, description) => {
  const full = description ? `${message}\n${description}` : message;
  if (Platform.OS === "android") {
    ToastAndroid.show(full, ToastAndroid.LONG);
  } else {
    Alert.alert(message, description);
  }
};

// ActivityTracker component in plain JS (JSX)
export default function ActivityTracker({ onActivitiesChange }) {
  // ActivityStatus: "not_done" | "in_progress" | "done"
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "watering",
      crop: "Tomatoes",
      description: "Deep watering session",
      date: "2025-10-15",
      duration: 30,
      notes: "Plants looking healthy after watering",
      status: "done",
    },
    {
      id: 2,
      type: "pest_control",
      crop: "Corn",
      description: "Applied organic pest spray",
      date: "2025-10-14",
      duration: 45,
      notes: "Found aphids on several plants",
      status: "done",
    },
    {
      id: 3,
      type: "harvesting",
      crop: "Lettuce",
      description: "First harvest of the season",
      date: "2025-10-13",
      duration: 60,
      notes: "Harvested 2kg of fresh lettuce",
      status: "done",
    },
    {
      id: 4,
      type: "fertilizing",
      crop: "Peppers",
      description: "Apply compost fertilizer",
      date: "2025-10-15",
      duration: 20,
      notes: "Add organic compost around base",
      status: "in_progress",
    },
    {
      id: 5,
      type: "pruning",
      crop: "Tomatoes",
      description: "Remove lower branches",
      date: "2025-10-16",
      duration: 40,
      notes: "Prune to improve air circulation",
      status: "not_done",
    },
    {
      id: 6,
      type: "weeding",
      crop: "Carrots",
      description: "Clear weeds from carrot patch",
      date: "2025-10-16",
      duration: 35,
      notes: "Remove all weeds before they spread",
      status: "not_done",
    },
  ]);

  // dialogs/modals state
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isExportVisible, setIsExportVisible] = useState(false);
  const [deleteActivityId, setDeleteActivityId] = useState(null);

  // editing/new activity states
  const [editingActivity, setEditingActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({
    type: "",
    crop: "",
    description: "",
    duration: "",
    date: new Date().toISOString(),
    notes: "",
  });

  const [exportOptions, setExportOptions] = useState({
    includeCompleted: true,
    includePending: true,
    includeNotes: true,
  });

  // App-wide data (if provider present)
  const appData = useContext(AppDataContext);
  // If provider provides activities, keep local state in sync
  useEffect(() => {
    if (appData && Array.isArray(appData.activities)) {
      setActivities(appData.activities);
    }
  }, [appData?.activities]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterCrop, setFilterCrop] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
    // Show reminder notifications for today's pending activities
    const source = appData && Array.isArray(appData.activities) ? appData.activities : activities;
    const pendingActivities = source.filter(
      (a) => a.status === "not_done" || a.status === "in_progress",
    );
    const todayActivities = pendingActivities.filter((a) => {
      const activityDate = new Date(a.date);
      const today = new Date();
      return activityDate.toDateString() === today.toDateString();
    });

    if (todayActivities.length > 0) {
      // small delay to avoid clashing with initial render
      setTimeout(() => {
        showToast(
          `You have ${todayActivities.length} pending ${todayActivities.length === 1 ? "activity" : "activities"} scheduled for today!`,
          todayActivities.map((t) => `• ${t.description}`).join("\n"),
        );
      }, 500);
    }
  }, []);

  // icons mapping
  const getActivityIcon = (type, size = 18) => {
    switch (type) {
      case "watering":
        return <Droplets width={size} height={size} />;
      case "planting":
        return <Sprout width={size} height={size} />;
      case "harvesting":
        return <Scissors width={size} height={size} />;
      case "pruning":
        return <Scissors width={size} height={size} />;
      case "pest_control":
        return <Bug width={size} height={size} />;
      case "fertilizing":
        return <Sprout width={size} height={size} />;
      case "weeding":
        return <Sprout width={size} height={size} />;
      default:
        return <Calendar width={size} height={size} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "watering":
        return styles.tagBlue;
      case "planting":
        return styles.tagGreen;
      case "harvesting":
        return styles.tagOrange;
      case "pruning":
        return styles.tagPurple;
      case "pest_control":
        return styles.tagRed;
      case "fertilizing":
        return styles.tagYellow;
      case "weeding":
        return styles.tagBrown;
      default:
        return styles.tagGray;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "not_done":
        return { text: "Not Done", style: styles.badgeGray, icon: <Circle width={12} height={12} /> };
      case "in_progress":
        return { text: "In Progress", style: styles.badgeBlue, icon: <Play width={12} height={12} /> };
      case "done":
        return { text: "Done", style: styles.badgeGreen, icon: <Check width={12} height={12} /> };
      default:
        return { text: status, style: styles.badgeGray, icon: null };
    }
  };

  const activityTypes = [
    { value: "watering", label: "Watering" },
    { value: "planting", label: "Planting" },
    { value: "harvesting", label: "Harvesting" },
    { value: "pruning", label: "Pruning" },
    { value: "pest_control", label: "Pest Control" },
    { value: "fertilizing", label: "Fertilizing" },
    { value: "weeding", label: "Weeding" },
  ];

  const crops = ["Tomatoes", "Corn", "Lettuce", "Peppers", "Carrots", "Beans"];

  // Filtering (use context activities when available)
  const sourceActivities = appData && Array.isArray(appData.activities) ? appData.activities : activities;
  const filteredActivities = sourceActivities.filter((activity) => {
    if (filterCrop !== "all" && activity.crop !== filterCrop) return false;
    if (filterDateFrom && activity.date < filterDateFrom) return false;
    if (filterDateTo && activity.date > filterDateTo) return false;
    return true;
  });

  const pendingActivities = filteredActivities.filter(
    (a) => a.status === "not_done" || a.status === "in_progress",
  );
  const completedActivities = filteredActivities.filter((a) => a.status === "done");
  const totalCompletedMinutes = completedActivities.reduce((sum, activity) => sum + activity.duration, 0);

  const clearFilters = () => {
    setFilterCrop("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    showToast("Filters cleared");
  };

  // Update status handler
  const handleStatusChange = (activityId, newStatus) => {
    // prefer context update methods
    if (appData && typeof appData.updateActivity === 'function') {
      const activity = (appData.activities || activities).find((a) => a.id === activityId);
      if (activity) appData.updateActivity({ ...activity, status: newStatus });
    } else {
      setActivities((prevActivities) => prevActivities.map((activity) => (activity.id === activityId ? { ...activity, status: newStatus } : activity)));
    }

    // Notify parent and show toast
    const source = appData && Array.isArray(appData.activities) ? appData.activities : activities;
    const updatedList = source.map((a) => (a.id === activityId ? { ...a, status: newStatus } : a));
    const completedActivitiesLocal = updatedList.filter((a) => a.status === 'done');
    const totalMinutes = completedActivitiesLocal.reduce((sum, a) => sum + a.duration, 0);
    if (onActivitiesChange) onActivitiesChange(completedActivitiesLocal.length, totalMinutes);
    const activity = updatedList.find((a) => a.id === activityId);
    if (activity) {
      if (newStatus === 'done') showToast('Activity completed', `${activity.description} — ${activity.crop} (${activity.duration} min)`);
      else if (newStatus === 'in_progress') showToast('Activity started', activity.description);
    }
  };

  // Add activity
  const handleAddActivity = () => {
    if (!newActivity.type || !newActivity.crop || !newActivity.description) {
      showToast("Please fill in all required fields");
      return;
    }

    const activity = {
      id: Date.now(),
      type: newActivity.type,
      crop: newActivity.crop,
      description: newActivity.description,
      // store full ISO timestamp to avoid timezone-only date mismatches
      date: newActivity.date || new Date().toISOString(),
      duration: parseInt(newActivity.duration) || 30,
      notes: newActivity.notes,
      status: "not_done",
    };

  if (appData && typeof appData.addActivity === 'function') appData.addActivity(activity);
  else setActivities((prev) => [activity, ...prev]);
    setNewActivity({
      type: "",
      crop: "",
      description: "",
      duration: "",
      date: new Date().toISOString(),
      notes: "",
    });
    setIsAddVisible(false);
    showToast("Activity added successfully!", `${activity.description} — ${activity.crop}`);
  };

  // Edit activity
  const handleEditActivity = () => {
    if (!editingActivity) return;
    if (!editingActivity.type || !editingActivity.crop || !editingActivity.description) {
      showToast("Please fill in all required fields");
      return;
    }

  if (appData && typeof appData.updateActivity === 'function') appData.updateActivity(editingActivity);
  else setActivities((prev) => prev.map((a) => (a.id === editingActivity.id ? editingActivity : a)));
    setIsEditVisible(false);
    setEditingActivity(null);
    showToast("Activity updated successfully!");
  };

  // Delete
  const handleDeleteActivity = (activityId) => {
    const activity = activities.find((a) => a.id === activityId);
  if (appData && typeof appData.deleteActivity === 'function') appData.deleteActivity(activityId);
  else setActivities((prev) => prev.filter((a) => a.id !== activityId));
    setDeleteActivityId(null);

    // Notify parent with recalculated totals
  const source = appData && Array.isArray(appData.activities) ? appData.activities : activities;
  const completedActivitiesLocal = source.filter((a) => a.status === 'done' && a.id !== activityId);
    const totalMinutes = completedActivitiesLocal.reduce((sum, a) => sum + a.duration, 0);
    if (onActivitiesChange) onActivitiesChange(completedActivitiesLocal.length, totalMinutes);

    showToast("Activity deleted", activity ? activity.description : "Removed");
  };

  const openEditDialog = (activity) => {
    setEditingActivity({ ...activity });
    setIsEditVisible(true);
  };

  // Export placeholders (CSV / PDF). In RN you need file system & share modules — keep placeholders here.
  const getExportableActivities = () => {
    return filteredActivities.filter((activity) => {
      if (activity.status === "done" && !exportOptions.includeCompleted) return false;
      if ((activity.status === "not_done" || activity.status === "in_progress") && !exportOptions.includePending) return false;
      return true;
    });
  };

  const exportToCSV = () => {
    const exportActivities = getExportableActivities();
    if (exportActivities.length === 0) {
      showToast("No activities to export", "Adjust your export options.");
      return;
    }

    // Placeholder: implement with react-native-fs / share
    showToast("CSV export placeholder", `${exportActivities.length} activities would be exported.`);
    setIsExportVisible(false);
  };

  const exportToPDF = () => {
    const exportActivities = getExportableActivities();
    if (exportActivities.length === 0) {
      showToast("No activities to export", "Adjust your export options.");
      return;
    }

    // Placeholder: implement with a PDF lib and RN file APIs
    showToast("PDF export placeholder", `${exportActivities.length} activities would be exported as PDF.`);
    setIsExportVisible(false);
  };


  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState(""); // "from" or "to"
  const [tempDate, setTempDate] = useState(new Date());

  const openPicker = (type) => {
    setPickerType(type);
    setTempDate(new Date());
    setShowPicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      if (event.type === "set" && selectedDate) {
        confirmDate(selectedDate);
      } else {
        setShowPicker(false);
      }
    } else {
      setTempDate(selectedDate || tempDate);
    }
  };

  const confirmDate = (date) => {
    const formatted = date.toISOString().split("T")[0];
    if (pickerType === "from") setFilterDateFrom(formatted);
    if (pickerType === "to") setFilterDateTo(formatted);
    setShowPicker(false);
  };
  // UI pieces
  const renderActivityItem = ({ item }) => {
    return (
      <View style={[ styles.activityCard,styles.shadow,item.status === "done"
      ? { borderLeftColor: "#16a34a" }
      : { borderLeftColor: "#dc2626" },]}>

        <View style={styles.row}>
          <View style={styles.iconContainer}>{getActivityIcon(item.type, 20)}</View>
          <View style={styles.activityBody}>
            <View style={styles.rowBetween}>
              <View style={{ width: 190 }}> 
                <Text style={styles.activityTitle}>
                  {item.description}
                </Text>
              </View>
              <Badge style={[styles.smallBadge, getActivityColor(item.type)]}>
                {item.type.replace("_", " ")}
              </Badge>
            </View>
            <Text style={styles.subText}>
              {item.crop} • {new Date(item.date).toLocaleDateString()}
            </Text>

            <View style={[styles.row, styles.metaRow]}>
              <View style={styles.metaItem}>
                <Clock width={14} height={14} />
                <Text style={styles.metaText}>{item.duration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Calendar width={14} height={14} />
                <Text style={styles.metaText}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
            </View>

            {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}

            <View style={[styles.row, styles.statusRow]}>
              <Text style={styles.statusLabel}>Status:</Text>

              <TouchableOpacity
                style={[styles.statusButton, item.status === "not_done" ? styles.statusActive : styles.statusOutline]}
                onPress={() => handleStatusChange(item.id, "not_done")}
              >
                <Circle width={12} height={12} />
                <Text style={styles.statusButtonText}>Not Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusButton, item.status === "in_progress" ? styles.statusActive : styles.statusOutline]}
                onPress={() => handleStatusChange(item.id, "in_progress")}
              >
                <Play width={12} height={12} />
                <Text style={styles.statusButtonText}>In Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusButton, styles.markDoneButton]}
                onPress={() => handleStatusChange(item.id, "done")}
              >
                <Check width={12} height={12} />
                <Text style={[styles.statusButtonText, styles.whiteText]}>Mark Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
                {/* Edit Button */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditDialog(item)}
                >
                  <Pencil width={14} height={14} color="#007BFF" />
                  <Text style={[styles.buttonText, { color: "#007BFF" }]}>Edit</Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => setDeleteActivityId(item.id)}
                >
                  <Trash2 width={14} height={14} color="#D9534F" />
                  <Text style={[styles.buttonText, { color: "#D9534F" }]}>Delete</Text>
                </TouchableOpacity>
                </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper bg="#EFFDF4">
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: hp(10) }}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Farm Activities</Text>
    
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, filteredActivities.length === 0 && styles.disabledButton]}
            onPress={() => setIsExportVisible(true)}
            disabled={filteredActivities.length === 0}
          >
            <Download width={14} height={14} color="#309B48" />
            <Text style={styles.buttonText}>Export</Text>
          </TouchableOpacity>
    
          <TouchableOpacity
            style={[
              styles.button,
              showFilters && styles.activeButton
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter width={14} height={14} color={showFilters ? "#fff" : "#309B48"} />
            <Text style={[styles.buttonText, showFilters && { color: "#fff" }]}>Filter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.activeButton]} onPress={() => setIsAddVisible(true)}>
            <Plus width={14} height={14} color="#fff" />
            <Text style={[styles.buttonText, { color: "#fff" }]}>Log Activity</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <Card style={[styles.card, styles.filtersCard]}>
          <Card.Content>
           <View style={styles.filterRow}>
            {/* Crop Type */}
              <View style={styles.filterCol}>
                <PaperText style={[styles.subtitle, { color: "#147affff" }]}>Crop</PaperText>
                <Picker
                  selectedValue={filterCrop}
                  onValueChange={(val) => setFilterCrop(val)}
                  style={styles.picker}
                  dropdownIconColor="#0050c0ff" 
                >
                  <Picker.Item label="All Crops" value="all" />
                  {crops.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>

              </View>
            {/* FROM DATE */}
            <View style={styles.filterCol}>
              <PaperText style={[styles.subtitle, { color: "#147affff" }]}>From Date:</PaperText>
              <TouchableOpacity onPress={() => openPicker("from")}>
                <TextInput
                  value={filterDateFrom}
                  placeholder="YYYY-MM-DD"
                  style={styles.smallInput}
                  editable={false}
                />
              </TouchableOpacity>
            </View>

            {/* TO DATE */}
            <View style={styles.filterCol}>
              <PaperText style={[styles.subtitle, { color: "#147affff" }]} >To Date:</PaperText>
              <TouchableOpacity onPress={() => openPicker("to")}>
                <TextInput
                  value={filterDateTo}
                  placeholder="YYYY-MM-DD"
                  style={styles.smallInput}
                  editable={false}
                />
              </TouchableOpacity>
            </View>

            {/* MODAL PICKER */}
            <Modal transparent visible={showPicker} animationType="fade">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                  />
                  <View style={styles.modalButtons}>
                    <Button mode="text" onPress={() => setShowPicker(false)}>
                      Cancel
                    </Button>
                    <Button mode="contained" onPress={() => confirmDate(tempDate)}>
                      Confirm
                    </Button>
                  </View>
                </View>
              </View>
            </Modal>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={[styles.card, styles.summaryCard]}>
        <Card.Content>
          <Text style={styles.subtitle} >This Week's Summary</Text>
          <View style={styles.summaryRow}>
              <View style={[styles.summaryCol, styles.summaryCompleted]}>
                <Text style={styles.summaryNumber}>{completedActivities.length}</Text>
                <Text>Completed</Text>
              </View>
              <View style={[styles.summaryCol, styles.summaryPending]}>
                <Text style={styles.summaryNumber}>{pendingActivities.length}</Text>
                <Text>Pending</Text>
              </View>
              <View style={[styles.summaryCol, styles.summaryMinutes]}>
                <Text style={styles.summaryNumber}>{totalCompletedMinutes}</Text>
                <Text>Minutes</Text>
              </View>
            </View>
        </Card.Content>
      </Card>

      {pendingActivities.length > 0 && (
        <Card style={[styles.card, styles.sectionCard]}>
          <Card.Content>
            <View style={styles.rowBetween}>
              <Text style={styles.subtitle}>Active & Upcoming Tasks</Text>
              <Badge style={styles.badgeOrange}>
                <Bell style={styles.badgeIcon} width={20} height={20} />
                {pendingActivities.length}
              </Badge>
            </View>

            <FlatList data={pendingActivities} keyExtractor={(i) => `${i.id}`} renderItem={renderActivityItem} scrollEnabled={false} />
          </Card.Content>
        </Card>
      )}

      {completedActivities.length > 0 && (
        <Card style={[styles.card, styles.sectionCard]}>
          <Card.Content>
            <View style={styles.rowBetween}>
              <Text style={styles.subtitle} >Recent Completed Activities</Text>
              <Check width={18} height={18} />
            </View>

            <FlatList data={completedActivities} keyExtractor={(i) => `${i.id}`} renderItem={renderActivityItem} scrollEnabled={false} />
          </Card.Content>
        </Card>
      )}

      {filteredActivities.length === 0 && (
        <Card style={[styles.card, styles.centerCard]}>
          <Card.Content style={styles.centerContent}>
            <Calendar width={48} height={48} />
            <Text style={{ ...styles.subtitle, fontSize: 10, color:"red" }} >No activities found matching your filters</Text>
            {(filterCrop !== "all" || filterDateFrom || filterDateTo) && (
              <Button mode="text" onPress={clearFilters}>
                Clear filters
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Add Dialog */}
      <Portal>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}style={{ flex: 1 }}>
        <Dialog visible={isAddVisible} onDismiss={() => setIsAddVisible(false)}>
          <Dialog.Title style={{ ...styles.subtitle, fontSize: 20 }}>Log New Activity</Dialog.Title>
          <Dialog.Content>
            <PaperText>Activity Type:</PaperText>
            <Picker selectedValue={newActivity.type} onValueChange={(val) => setNewActivity({ ...newActivity, type: val })}>
              <Picker.Item label="Select type..." value="" />
              {activityTypes.map((t) => (
                <Picker.Item key={t.value} label={t.label} value={t.value} />
              ))}
            </Picker>

            <PaperText>Crop:</PaperText>
            <Picker selectedValue={newActivity.crop} onValueChange={(val) => setNewActivity({ ...newActivity, crop: val })}>
              <Picker.Item label="Select crop..." value="" />
              {crops.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>

            <PaperText>Description:</PaperText>
            <TextInput
              style={styles.input}
              placeholder="Brief description"
              value={newActivity.description}
              onChangeText={(text) => setNewActivity({ ...newActivity, description: text })}
            />

            <PaperText>Date:</PaperText>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={newActivity.date} onChangeText={(v) => setNewActivity({ ...newActivity, date: v })} />

            <PaperText>Duration (minutes):</PaperText>
            <TextInput
              style={styles.input}
              placeholder="30"
              keyboardType="numeric"
              value={newActivity.duration}
              onChangeText={(text) => setNewActivity({ ...newActivity, duration: text })}
            />

            <PaperText>Notes:</PaperText>
            <TextInput style={[styles.input, styles.textarea]} placeholder="Additional notes..." multiline value={newActivity.notes} onChangeText={(text) => setNewActivity({ ...newActivity, notes: text })} />
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={handleAddActivity}>Save Activity</Button>
            <Button onPress={() => setIsAddVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
       </KeyboardAvoidingView>
      </Portal>

      {/* Edit Dialog */}
      <Portal>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}style={{ flex: 1 }}>
        <Dialog visible={isEditVisible} onDismiss={() => setIsEditVisible(false)}>
          <Dialog.Title>Edit Activity</Dialog.Title>
          <Dialog.Content>
            {editingActivity && (
              <>
                <PaperText>Activity Type: </PaperText>
                <Picker selectedValue={editingActivity.type} onValueChange={(val) => setEditingActivity({ ...editingActivity, type: val })}>
                  {activityTypes.map((t) => (
                    <Picker.Item key={t.value} label={t.label} value={t.value} />
                  ))}
                </Picker>

                <PaperText>Crop: </PaperText>
                <Picker selectedValue={editingActivity.crop} onValueChange={(val) => setEditingActivity({ ...editingActivity, crop: val })}>
                  {crops.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>

                <PaperText>Description: </PaperText>
                <TextInput style={styles.input} value={editingActivity.description} onChangeText={(t) => setEditingActivity({ ...editingActivity, description: t })} />

                <PaperText>Date: </PaperText>
                <TextInput style={styles.input} value={editingActivity.date} onChangeText={(t) => setEditingActivity({ ...editingActivity, date: t })} />

                <PaperText>Duration (minutes)</PaperText>
                <TextInput style={styles.input} keyboardType="numeric" value={`${editingActivity.duration}`} onChangeText={(t) => setEditingActivity({ ...editingActivity, duration: parseInt(t) || 0 })} />

                <PaperText>Notes:</PaperText>
                <TextInput style={[styles.input, styles.textarea]} multiline value={editingActivity.notes} onChangeText={(t) => setEditingActivity({ ...editingActivity, notes: t })} />
              </>
            )}
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={handleEditActivity}>Save Changes</Button>
            <Button onPress={() => setIsEditVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
        </KeyboardAvoidingView>
      </Portal>

      {/* Export Dialog */}
      <Portal>
        <Dialog visible={isExportVisible} onDismiss={() => setIsExportVisible(false)}>
          <Dialog.Title>Export Activities Report</Dialog.Title>
          <Dialog.Content>
            <View style={styles.exportRow}>
              <Checkbox
                status={exportOptions.includeCompleted ? "checked" : "unchecked"}
                onPress={() => setExportOptions((p) => ({ ...p, includeCompleted: !p.includeCompleted }))}
              />
              <Text style={styles.exportText}>Include completed activities</Text>
            </View>

            <View style={styles.exportRow}>
              <Checkbox
                status={exportOptions.includePending ? "checked" : "unchecked"}
                onPress={() => setExportOptions((p) => ({ ...p, includePending: !p.includePending }))}
              />
              <Text style={styles.exportText}>Include pending activities</Text>
            </View>

            <View style={styles.exportRow}>
              <Checkbox
                status={exportOptions.includeNotes ? "checked" : "unchecked"}
                onPress={() => setExportOptions((p) => ({ ...p, includeNotes: !p.includeNotes }))}
              />
              <Text style={styles.exportText}>Include notes</Text>
            </View>

            <Text style={{ marginTop: 8 }}>{getExportableActivities().length} activities will be exported</Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={exportToCSV} icon={() => <File width={14} height={14} />}>
              Export CSV
            </Button>
            <Button onPress={exportToPDF} icon={() => <FileText width={14} height={14} />}>
              Export PDF
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete confirm  */}
      <Portal>
        <Dialog visible={deleteActivityId !== null} onDismiss={() => setDeleteActivityId(null)}>
          <Dialog.Title> <Trash2 width={25} height={25} color="#D9534F" /> Are you sure?</Dialog.Title>
          <Dialog.Content>
            <Text  style={styles.paragraph}>This action cannot be undone. This will permanently delete the activity from your records.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteActivityId(null)}>Cancel</Button>
            <Button
              onPress={() => {
                if (deleteActivityId) handleDeleteActivity(deleteActivityId);
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  headerContainer: {
    marginBottom: 10,
  },

  title: {
    fontSize: 22,
    color: "#166534", 
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#16A34A", 
    fontWeight: "600",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#309B48",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  buttonText: {
    fontSize: 13,
    color: "#309B48",
    marginLeft: 4,
  },
  activeButton: {
    backgroundColor: "#309B48",
    borderColor: "#309B48",
  },
  disabledButton: {
    opacity: 0.5,
  },

  card: {
    marginTop: 12,
    borderRadius: 8,
  },
  filtersCard: {
    backgroundColor: "#EFF5FF",
    borderWidth: 1,
    borderColor: "#90cdf4",
  },
  summaryCard: {
    backgroundColor: "#EEFDF4",
    borderWidth: 1,
    borderColor: "#2be76aff",
  },
  sectionCard: {backgroundColor: "#fff",},
  centerCard: { marginTop: 12 },
  centerContent: { alignItems: "center", justifyContent: "center" },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  filterCol: {
    flex: 1,
  },

picker: {
    height: 150,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2371e7ff', // light gray border
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#eef6ffff', // very light gray background
    color: '#1f2937', // text color
    fontSize: 12,
    paddingVertical: 8,

  },

  smallInput: {
    fontSize: 12,
    paddingHorizontal: 4,
    height: 38,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#147affff",
    borderRadius: 6,

  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    width: 280,
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: 10,
  },
  textarea: { height: 80, textAlignVertical: "top" },
  filterInfo: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, alignItems: "center" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },

summaryCol: {
  flex: 1,
  alignItems: "center",
  borderWidth: 1.5,
  borderRadius: 10,
  paddingVertical: 10,
  marginHorizontal: 2,
},
summaryNumber: { fontSize: 20, fontWeight: "700" },


summaryCompleted: {
  backgroundColor: "#d1fae5",
  borderColor: "#16a34a",
  borderWidth: 0.5
  
},
summaryPending: {
  backgroundColor: "#fee2e2",
  borderColor: "#dc2626",
  borderWidth: 0.5},

summaryMinutes: {
  backgroundColor: "#bfdbfe",
  borderColor: "#2563eb",
  borderWidth: 0.5
},

badgeOrange: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fff7ed",
  borderColor: "#f97316",
  borderWidth: 1.5,
  borderRadius: 16,
  paddingHorizontal: 10,
  paddingVertical: 3,
  alignSelf: "flex-start",
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
},
badgeIcon: {
  marginRight: 5,
  color: "#f97316",
},
badgeText: {
  color: "#f97316",
  fontWeight: "600",
  fontSize: 12,
},

  activityCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#3bf644ff",
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "flex-start" },
  rowBetween: { flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" },
  iconContainer: { marginRight: 10, justifyContent: "center", alignItems: "center" },
  activityBody: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: "600", color: "#166534" },
  subText: { color: "#6b7280", marginTop: 4, fontSize: 12 },
  metaRow: { marginTop: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  metaText: { marginLeft: 6, fontSize: 12, color: "#6b7280" },
  notesText: { marginTop: 8, color: "#374151" },
  statusRow: { marginTop: 10, flexWrap: "wrap" },
  statusLabel: { marginRight: 8, },
  statusButton: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
    margin: 4,
  },
  statusButtonText: { marginLeft: 6, fontSize: 12 , color: "#374151"},
  statusActive: { backgroundColor: "#c1f5baff", borderWidth: 0.5, borderColor: "#22c55e" },
  statusOutline: { borderWidth: 1, borderColor: "#e5e7eb" },
  markDoneButton: { backgroundColor: "#309B48", color: "#fff" },
  whiteText: { color: "#fff" },
 actionRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontWeight: "600",
  },
  editButton: {
    borderColor: "#007BFF",
  },
  deleteButton: {
    borderColor: "#D9534F",
  },
  buttonText: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "500",
  },

  // badges and tags
  smallBadge: { alignSelf: "flex-start", paddingHorizontal: 6, marginLeft: 8 },
  // Tags (softer, relatable background colors)
  tagBlue: { backgroundColor: "#bfdbfe" },      // soft sky blue
  tagGreen: { backgroundColor: "#bbf7d0" },     // mint green
  tagOrange: { backgroundColor: "#fed7aa" },    // peachy orange
  tagPurple: { backgroundColor: "#d8b4fe" },    // lavender
  tagRed: { backgroundColor: "#fecaca" },       // soft pink/red
  tagYellow: { backgroundColor: "#fef08a" },    // pastel yellow
  tagBrown: { backgroundColor: "#e6d7c3" },     // light beige
  tagGray: { backgroundColor: "#e5e7eb" },      // light gray
  
  // Badges (stronger, slightly more saturated for emphasis)
  badgeGray: { backgroundColor: "#d1d5db", padding: 6 },   // muted gray
  badgeBlue: { backgroundColor: "#3b82f6", padding: 6 },   // bright blue
  badgeGreen: { backgroundColor: "#10b981", padding: 6 },  // vivid green
  badgeRed: { backgroundColor: "#ef4444", padding: 6 },    // bright red
  badgePurple: { backgroundColor: "#8b5cf6", padding: 6 }, // vivid purple
  badgeYellow: { backgroundColor: "#facc15", padding: 6 }, // bright yellow


});
