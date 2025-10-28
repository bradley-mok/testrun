import { AlertTriangle, Calendar, Clock, Eye, Sprout, Sun, TrendingUp, Wind, User } from "lucide-react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HamburgerMenu from '../../components/HamburgerMenu';
import ScreenWrapper from "../../components/ScreenWrapper";
import { AppDataContext } from '../../context/AppDataProvider';
import { useAuth } from "../../context/AuthContext";
import { hp, wp } from "../../helpers/dimensions";
import { fetchWeatherForecast, fetchAstronomyData } from "../../api/weatherApi";
import { storeData, getData } from "../../utilities/asyncStorage";

const formattedDate = new Date().toISOString().split('T')[0]; 

export default function Dashboard() {
  const { userData, onLogout } = useAuth();
  const { activities } = useContext(AppDataContext) || { activities: [] };

  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [astro, setAstro] = useState(null);
  const [location, setLocation] = useState(null);

  // Add debug logging
  useEffect(() => {
    console.log("Dashboard userData:", {
      hasUserData: !!userData,
      profile_image: userData?.profile_image,
      full_name: userData?.full_name,
      email: userData?.email
    });
  }, [userData]);

  useEffect(() => {
    if (!userData?.latitude || !userData?.longitude) return;

    const fetchAndStore = async () => {
      try {
        const coordinates = `${userData.latitude},${userData.longitude}`;

        const [weatherData, astroData] = await Promise.all([
          fetchWeatherForecast({ cityName: coordinates, days: 7 }),
          fetchAstronomyData({ cityName: coordinates, date: formattedDate }),
        ]);

        if (weatherData) await storeData("weatherData", weatherData);
        if (astroData) await storeData("astroData", astroData);
        await storeData("lastSearchedLocation", coordinates);

        console.log("AsyncStorage updated at", new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Error updating weather data:", err);
      }
    };

    // Initial fetch immediately
    fetchAndStore();

    // Set interval (e.g., 30 minutes = 1800000 ms)
    const interval = setInterval(fetchAndStore, 1800000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [userData?.latitude, userData?.longitude]);

  // Load weather data from AsyncStorage or fetch fresh
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Load from cache first
        const cachedWeather = await getData("weatherData");
        const cachedAstro = await getData("astroData");
        const lastLocation = await getData("lastSearchedLocation");

        if (cachedWeather && cachedAstro) {
          setWeather(cachedWeather);
          setAstro(cachedAstro);
          console.log("Loaded cached weather for:", lastLocation || "Coordinates");
        }

        // Then fetch new data from API if possible
        if (userData?.latitude && userData?.longitude) {
          const coordinates = `${userData.latitude},${userData.longitude}`;

          const [weatherData, astroData] = await Promise.all([
            fetchWeatherForecast({ cityName: coordinates, days: 7 }),
            fetchAstronomyData({ cityName: coordinates, date: formattedDate }),
          ]);

          if (weatherData) {
            setWeather(weatherData);
            await storeData("weatherData", weatherData);
          }

          if (astroData) {
            setAstro(astroData);
            await storeData("astroData", astroData);
          }

          await storeData("lastSearchedLocation", coordinates);
        }
      } catch (err) {
        console.error("Error loading weather:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userData?.latitude, userData?.longitude]);

  // Default fallback stats if no weather yet
  const stats = {
    totalCrops: 12,
    healthyCrops: 10,
    needsAttention: activities.filter(a => a.status !== 'done').length || 0,
    activitiesThisWeek: activities.filter(a => {
      const d = new Date(a.date);
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo && d <= now;
    }).length,
    weatherTemp: weather?.current?.temp_c || 22,
    humidity: weather?.current?.humidity || 65,
    rainfall: weather?.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain || 10,
    windSpeed: weather?.current?.wind_kph || 4.2,
    uvIndex: weather?.current?.uv || 6,
  };

  const todaysActivities = activities
    .filter(a => new Date(a.date).toDateString() === new Date().toDateString())
    .map(a => ({
      id: a.id,
      activity: a.description,
      time: new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: a.status === 'in_progress' ? 'In Progress' : a.status === 'done' ? 'Done' : 'Not Started',
      type: a.type
    }));

  const getActivityColor = (type) => {
    switch (type) {
      case "watering":
        return "#3b82f6";
      case "planting":
        return "#22c55e";
      case "harvesting":
        return "#f97316";
      default:
        return "#6b7280";
    }
  };

  const healthyProgress = (stats.healthyCrops / stats.totalCrops) * 100;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: healthyProgress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [healthyProgress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <ScreenWrapper bg="#ECFDF6">
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: hp(10) }}>
        {/* HEADER */}
        <View style={styles.hero}>
          <View style={styles.heroTopRight}>
            <HamburgerMenu onLogout={onLogout} />
          </View>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" }}
            style={styles.heroImage}
          />
          <View style={styles.overlay} />
          <View style={styles.heroContent}>
            {/* USER */}
            <View style={styles.userSection}>
              <View style={styles.userInfo}>
                {userData?.profile_image ? (
                  <Image 
                    source={{ 
                      uri: userData.profile_image + `?t=${new Date().getTime()}` // Cache busting
                    }} 
                    style={styles.profileImage} 
                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                  />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <User size={24} color="#16a34a" />
                  </View>
                )}
                <View style={styles.userText}>
                  <Text style={styles.greeting}>Hi, {userData?.full_name || "Farmer"}</Text>
                  <Text style={styles.subGreeting}>
                    {loading ? "Updating your farm..." : "Let's check your farm today 🌾"}
                  </Text>
                </View>
              </View>
            </View>

            {/* WEATHER */}
            <View style={styles.weatherCard}>
              <View style={styles.weatherLeft}>
                <Sun size={28} color="#facc15" />
                <View>
                  <Text style={styles.weatherTemp}>{stats.weatherTemp}°C</Text>
                  <Text style={styles.weatherSmall}>
                    {weather?.current?.condition?.text || "Fetching..."}
                  </Text>
                </View>
              </View>
              <View style={styles.weatherRight}>
                <Text style={styles.weatherSmall}>Humidity: {stats.humidity}%</Text>
                <Text style={styles.weatherSmall}>Wind: {stats.windSpeed} km/h</Text>
              </View>
            </View>
          </View>
        </View>

        {/* WEATHER STATS */}
        <View style={styles.row}>
          <View style={[styles.statCard, { backgroundColor: "#dbeafe", borderColor: "#2563eb" }]}>
            <Wind size={20} color="#2563eb" />
            <Text style={[styles.statValue, { color: "#1e3a8a" }]}>{stats.windSpeed}</Text>
            <Text style={[styles.statLabel, { color: "#1e3a8a" }]}>km/h Wind</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#ede9fe", borderColor: "#7c3aed" }]}>
            <Eye size={20} color="#9333ea" />
            <Text style={[styles.statValue, { color: "#6d28d9" }]}>{stats.humidity}</Text>
            <Text style={[styles.statLabel, { color: "#6d28d9" }]}>% Humidity</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#ffedd5", borderColor: "#f97316" }]}>
            <Sun size={20} color="#f97316" />
            <Text style={[styles.statValue, { color: "#c2410c" }]}>{stats.uvIndex}</Text>
            <Text style={[styles.statLabel, { color: "#c2410c" }]}>UV Index</Text>
          </View>
        </View>

        {/* Activities */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={18} color="#16a34a" />
            <Text style={styles.cardTitle}>Today's Activities</Text>
          </View>
          {todaysActivities.length > 0 ? (
            todaysActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: getActivityColor(activity.type) },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityText}>{activity.activity}</Text>
                  <View style={styles.activityTime}>
                    <Clock size={12} color="#6b7280" />
                    <Text style={styles.activityTimeText}>{activity.time}</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.status,
                    activity.status === "In Progress" && styles.statusActive,
                    activity.status === "Done" && styles.statusDone,
                  ]}
                >
                  {activity.status}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noActivitiesText}>No activities scheduled for today</Text>
          )}
        </View>

        {/* Crop Health */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Sprout size={18} color="#059669" />
            <Text style={styles.cardTitle}>Crop Health Overview</Text>
          </View>
          <Text style={styles.statLabel}>Total Crops: {stats.totalCrops}</Text>
          <Text style={styles.statLabel}>
            Healthy Crops: {stats.healthyCrops}/{stats.totalCrops}
          </Text>

          {/* Animated Progress Bar */}
          <View style={styles.progressBackground}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>

          {stats.needsAttention > 0 && (
            <View style={styles.alertBox}>
              <AlertTriangle size={16} color="#f97316" />
              <Text style={styles.alertText}>
                {stats.needsAttention} crops need attention
              </Text>
            </View>
          )}
        </View>

        {/* Weekly Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={18} color="#7c3aed" />
            <Text style={[styles.cardTitle, { color: "#7c3aed" }]}>This Week's Progress</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.statCard, { borderColor: "#a78bfa" }]}>
              <Text style={[styles.statValue, { color: "#7c3aed" }]}>{stats.activitiesThisWeek}</Text>
              <Text style={styles.statLabel}>Activities</Text>
            </View>
            <View style={[styles.statCard, { borderColor: "#4df588ff" }]}>
              <Text style={[styles.statValue, { color: "#7c3aed" }]}>50 XP</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 12, 
    backgroundColor: "#ECFDF6", 
    paddingBottom: 0,
  },
  hero: { 
    borderRadius: 16, 
    overflow: "hidden", 
    marginBottom: 12, 
    height: 200,
    position: 'relative',
  },
  heroImage: { 
    width: "100%",
    height: 200,
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)" 
  },
  heroContent: { 
    position: "absolute",
    top: 30, 
    bottom: 22, 
    left: 12,
    right: 12,
  },
  heroTopRight: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
  },
  userSection: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#f3f4f6',
  },
  profilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userText: {
    flex: 1,
  },
  greeting: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "white",
    marginBottom: 2,
  },
  subGreeting: { 
    color: "#d1fae5", 
    fontSize: 14,
  },
  weatherCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 12,
    width: "100%"
  },
  weatherLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },
  weatherRight: { 
    alignItems: "flex-end" 
  },
  weatherTemp: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "white" 
  },
  weatherSmall: { 
    fontSize: 12, 
    color: "#d1fae5" 
  },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginVertical: 2, 
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 0.5,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginTop: 4,
  },
  statLabel: { 
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  card: { 
    borderColor: "#4df588ff", 
    borderWidth: 1, 
    borderRadius: 12,
    padding: 16, 
    marginTop: 12,
    backgroundColor: 'white',
  },
  cardHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12, 
    gap: 6 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#111827" 
  },
  activityItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 10, 
    gap: 12,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    padding: 8,
    marginBottom: 6
  },
  dot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5 
  },
  activityText: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#111827" 
  },
  activityTime: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 4,
    marginTop: 2,
  },
  activityTimeText: { 
    fontSize: 12, 
    color: "#6b7280" 
  },
  status: { 
    fontSize: 12, 
    color: "#6b7280", 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    backgroundColor: "#e5e7eb",
    fontWeight: '500',
  },
  statusActive: { 
    backgroundColor: "#22c55e", 
    color: "white" 
  },
  statusDone: {
    backgroundColor: "#3b82f6",
    color: "white"
  },
  noActivitiesText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  alertBox: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    backgroundColor: "#fef3c7", 
    padding: 8, 
    borderRadius: 8, 
    marginTop: 8 
  },
  alertText: { 
    fontSize: 12, 
    color: "#b45309" 
  },
  progressBackground: {
    height: 12,
    width: "100%",
    backgroundColor: "#d1fae5",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 6,
  },
});