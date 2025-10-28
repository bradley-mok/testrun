import React, { useCallback, useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { MapPin, Search,Droplets,Wind,Eye,Sun,Gauge,Sunrise,Sunset, } from "lucide-react-native";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast, fetchAstronomyData } from "../../api/weatherApi";
import ScreenWrapper from "../../components/ScreenWrapper";
import Card from "../../components/Card";
import WeatherTips from "../../components/WeatherTips";
import Loading from "../../components/Loading";
import { hp, wp } from "../../helpers/dimensions";
import { getWeatherIcon, getWeatherGradient } from "../../helpers/weatherProfiles";
import { LinearGradient } from "expo-linear-gradient";
import { storeData, getData } from "../../utilities/asyncStorage";

//  Simulate user location (replace this with your real user data or context)
const userData = {
  latitude: -26.2041, // Johannesburg latitude
  longitude: 28.0473, // Johannesburg longitude
};

export default function WeatherForecast() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [astro, setAstro] = useState({});
  const [loading, setLoading] = useState(false); 

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cachedWeather = await getData("weatherData");
        const cachedAstro = await getData("astroData");
        const lastLocation = await getData("lastSearchedLocation");

        // If cached data exists, use it immediately
        if (cachedWeather && cachedAstro) {
          setWeather(cachedWeather);
          setAstro(cachedAstro);
          console.log("Loaded cached data for:", lastLocation || "Coordinates");
        }

        // Fetch new data if user has coordinates
        if (userData.latitude && userData.longitude) {
          const coordinates = `${userData.latitude},${userData.longitude}`;
          const astroData = await fetchAstronomyData({
            cityName: coordinates,
            date: formattedDate,
          });
          setAstro(astroData);
          await storeData("astroData", astroData);

          const weatherData = await fetchWeatherForecast({
            cityName: coordinates,
            days: 7,
          });
          setWeather(weatherData);
          await storeData("weatherData", weatherData);

          await storeData("lastSearchedLocation", coordinates);
        }
      } catch (error) {
        console.error("Error fetching weather by coordinates:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const handleLocation = async (loc) => {
    setLoading(true);
    setLocations([]);
    toggleSearch(false);

    try {
      const astroData = await fetchAstronomyData({
        cityName: loc,
        date: formattedDate,
      });
      setAstro(astroData);
      await storeData("astroData", astroData);

      const weatherData = await fetchWeatherForecast({
        cityName: loc,
        days: 7,
      });
      setWeather(weatherData);
      await storeData("weatherData", weatherData);

      await storeData("lastSearchedLocation", loc);
    } catch (error) {
      console.error("Error fetching data for location:", error);
    } finally {
      setLoading(false);
    }
  
    storeData("lastSearchedLocation", loc);

  };

  const handleSearch = useCallback(async (value) => {
    if (value.length > 2) {
      try {
        const data = await fetchLocations({ cityName: value });
        if (data) {
          const locationNames = data.map((loc) => loc.name);
          setLocations(locationNames);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    } else {
      setLocations([]);
    }
  }, []);

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  useEffect(() => {
    return () => {
      handleTextDebounce.cancel();
    };
  }, [handleTextDebounce]);


  const current = weather?.current || null;
  const location = weather?.location || null;

  console.log("Weather Data:", current, location);
  const currentWeather = {
    temperature: current ? current.temp_c : "--",
    condition: current ? current.condition.text.toLowerCase() : "unknown",
    humidity: current ? current.humidity : "--",
    windSpeed: current ? current.wind_kph : "--",
    visibility: current ? current.vis_km : "--",
    uvIndex: current ? current.uv : "--",
    precipitation: current ? current.precip_mm : "--",
    feelsLike: current ? current.feelslike_c : "--",
    sunrise: astro?.astronomy?.astro?.sunrise || "--",
    sunset: astro?.astronomy?.astro?.sunset || "--",
    pressure: current ? current.pressure_mb : "--",
  };

  const forecastData =
    weather?.forecast?.forecastday?.map((day) => ({
      date: day.date,
      high: day.day.maxtemp_c,
      low: day.day.mintemp_c,
      condition: day.day.condition.text.toLowerCase(),
      precipitation: day.day.daily_chance_of_rain,
      humidity: day.day.avghumidity,
      windSpeed: day.day.maxwind_kph,
    })) || [];

  return (
    <ScreenWrapper bg="#EEFDF4">
      {
        loading ? (<Loading />) : (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: hp(10) }}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Weather Forecast</Text>
        <Text style = {styles.locationName}>
          <MapPin size={16} color="#16a34a" />
          {location ? `${location.name}, ${location.country}` : "Current Location"}
        </Text>
        <Text style={styles.subtitle}>Stay updated with weather conditions</Text>
      </View>
      {/* SearchBar Component */}
      
    <View
      style={[
        styles.searchBar,
        { backgroundColor: showSearch ? "transparent" : "#F0FDF4" },
      ]}
    >
      {showSearch ? (
        <TextInput
          onChangeText={handleTextDebounce}
          style={styles.searchInput}
          placeholder="Search location..."
          placeholderTextColor="#9ca3af"
        />
      ) : null}
    
      <TouchableOpacity
        onPress={() => toggleSearch(!showSearch)}
        style={[
          styles.searchIcon,
          showSearch ? styles.iconInsideBar : styles.iconTopRight,
        ]}
      >
        <Search size={20} color="#16a34a" />
      </TouchableOpacity>
    </View>
      
    {showSearch && locations.length > 0 ? (
        <View style={styles.locationList}>
          {locations.map((loc, index) => {
            const showBorder = index !== locations.length - 1;
            return (
              <TouchableOpacity
                onPress={() => {handleLocation(loc)}}
                key={index}
                style={[
                  styles.locationItem,
                  showBorder && { borderBottomWidth: 1, borderBottomColor: "#d1fae5" },
                ]}
              >
                <MapPin size={16} color="#16a34a" />
                <Text style={styles.locationText}>{loc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}


  {/* Current Weather - Hero Style */}
    <Card style={styles.weatherCard}>
  {/* Gradient Header */}
     <LinearGradient
      colors={getWeatherGradient(currentWeather.condition)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.weatherHeader}
    >
    <View style={styles.weatherHeaderTop}>
      <View style={styles.weatherConditionRow}>
        {/* {getWeatherIcon(currentWeather.condition, 48, "#fff")} */}
        {getWeatherIcon(currentWeather.condition, 48)}
        <View>
          <Text style={styles.weatherTitle}>Current Weather</Text>
          <Text style={styles.weatherSubtitle}>{currentWeather.condition}</Text>
        </View>
      </View>

      <View style={styles.weatherTempRight}>
        <Text style={styles.weatherTemp}>{currentWeather.temperature}°C</Text>
        <Text style={styles.feelsLike}>Feels like {currentWeather.feelsLike}°C</Text>
      </View>
    </View>

    {/* Weather Details */}
    <View style={styles.detailsGrid}>
      <View style={styles.detailBox}>
        <View style={styles.detailLabelRow}>
          <Droplets size={16} color="#fff" />
          <Text style={styles.detailLabel}>Humidity</Text>
        </View>
        <Text style={styles.detailValue}>{currentWeather.humidity}%</Text>
      </View>

      <View style={styles.detailBox}>
        <View style={styles.detailLabelRow}>
          <Wind size={16} color="#fff" />
          <Text style={styles.detailLabel}>Wind</Text>
        </View>
        <Text style={styles.detailValue}>{currentWeather.windSpeed} km/h</Text>
      </View>
    </View>
  </LinearGradient>

    
    {/* Additional Details */}
    
    <Card.Content style={styles.extraDetails}>
    <View style={[styles.extraBox, { backgroundColor: "#EFF6FF" }]}>
      <Eye size={20} color="#2563EB" />
      <Text style={[styles.extraValue, { color: "#1E40AF" }]}>
        {currentWeather.visibility} km
      </Text>
      <Text style={[styles.extraLabel, { color: "#2563EB" }]}>Visibility</Text>
    </View>

    <View style={[styles.extraBox, { backgroundColor: "#FFF7ED" }]}>
      <Sun size={20} color="#EA580C" />
      <Text style={[styles.extraValue, { color: "#9A3412" }]}>
        UV {currentWeather.uvIndex}
      </Text>
      <Text style={[styles.extraLabel, { color: "#EA580C" }]}>UV Index</Text>
    </View>

    <View style={[styles.extraBox, { backgroundColor: "#F5F3FF" }]}>
      <Gauge size={20} color="#7C3AED" />
      <Text style={[styles.extraValue, { color: "#5B21B6" }]}>
        {currentWeather.pressure}
      </Text>
      <Text style={[styles.extraLabel, { color: "#7C3AED" }]}>Pressure</Text>
    </View>
    
    </Card.Content>
    
    </Card>

    
    {/* Sun Times */}
    <View style={styles.sunGrid}>
      {/* Sunrise Card */}
      <Card style={[styles.sunCard, styles.sunriseCard, styles.shadow]}>
        <Card.Content style={styles.sunContent}>
          <Sunrise size={32} color="#F97316" style={{ marginBottom: hp(0.5) }} />
          <Text style={[styles.sunTime, { color: "#C2410C" }]}>{currentWeather.sunrise}</Text>
          <Text style={[styles.sunLabel, { color: "#FB923C" }]}>Sunrise</Text>
        </Card.Content>
      </Card>
        
      {/* Sunset Card */}
      <Card style={[styles.sunCard, styles.sunsetCard, styles.shadow]}>
        <Card.Content style={styles.sunContent}>
          <Sunset size={32} color="#8B5CF6" style={{ marginBottom: hp(0.5) }} />
          <Text style={[styles.sunTime, { color: "#6D28D9" }]}>{currentWeather.sunset}</Text>
          <Text style={[styles.sunLabel, { color: "#A78BFA" }]}>Sunset</Text>
        </Card.Content>
      </Card>
    
    </View>


{/* 7-Day Forecast */}
  <Card style={styles.forecastCard}>
    <Card.Header>
      <Text style={styles.forecastTitle}>7-Day Forecast</Text>
    </Card.Header>

  <Card.Content>
    <View style={{ gap: 10 }}>
      {forecastData.map((day, index) => (
        <View key={day.date} style={[styles.dayContainer, styles.shadow]}>
          <View style={styles.dayLeft}>
            {getWeatherIcon(day.condition, 24)}
            <View>
              <Text style={styles.dayName}>
                {index === 0
                  ? "Today"
                  : new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
              </Text>
              <View style={styles.dayDetails}>
                <Droplets size={12} color="#3B82F6" />
                <Text style={styles.detailText}>{day.precipitation}%</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.detailText}>{day.humidity}% humidity</Text>
              </View>
            </View>
          </View>

          <View style={styles.dayRight}>
            <Text style={styles.highTemp}>{day.high}°</Text>
            <Text style={styles.lowTemp}>{day.low}°</Text>
          </View>
        </View>
      ))}
    </View>
  </Card.Content>
  </Card>


    {/* Farming Tips */}
    <WeatherTips forecast={forecastData} />
    </ScrollView>)
      }
    
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: wp(4), paddingTop: hp(2)},
 headerSection: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    color: "#166534", // green-800
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    color: "#16A34A", 
  },

  searchBar: {
    marginBottom: hp(1.5),
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderRadius: 9999,
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    paddingLeft: wp(4),
    height: hp(5),
    width: wp(90),
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    fontSize: wp(3.5),
    shadowColor: "#03ce25ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  searchIcon: {
  position: "absolute",
  padding: 10,
},

iconTopRight: {
  top: hp(-9), 
},


locationList: {
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  marginTop: hp(-1),
  marginBottom: hp(2),
  marginHorizontal: wp(2),
  paddingVertical: hp(1),
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
},

locationItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: hp(1),
  paddingHorizontal: wp(4),
},

locationText: {
  marginLeft: wp(2),
  color: "#065f46",
  fontSize: wp(3.5),
},
locationName: {
  flexDirection: "row",
  alignItems: "center",
  color: "#16a34a",
  fontSize: wp(4),
  marginTop: hp(0.5),
  marginBottom: hp(0.5),
  fontWeight: "700",
},

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  alertTitle: {
    color: "#9A3412", // orange-800
    fontWeight: "600",
    fontSize: 16,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  icon: {
    marginTop: 2,
    marginRight: 8,
  },
  alertText: {
    color: "#9A3412",
    fontSize: 14,
    flex: 1,
  },

weatherCard: {
  borderRadius: 16,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 5,
  marginTop: hp(-0.75),
},

weatherHeader: {
  padding: hp(2.5),
  marginTop: hp(-1.5),
},

weatherHeaderTop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: hp(1.5),
},

weatherConditionRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: wp(2),
},

weatherTitle: {
  color: "#fff",
  fontSize: wp(4),
  fontWeight: "600",
},

weatherSubtitle: {
  color: "rgba(255,255,255,0.8)",
  textTransform: "capitalize",
  fontSize: wp(3.2),
},

weatherTempRight: {
  alignItems: "flex-end",
},

weatherTemp: {
  fontSize: wp(10),
  fontWeight: "bold",
  color: "#fff",
  marginBottom: hp(0.5),
},

feelsLike: {
  color: "rgba(255,255,255,0.8)",
  fontSize: wp(3),
},

detailsGrid: {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: wp(3),
},

detailBox: {
  flex: 1,
  backgroundColor: "rgba(255,255,255,0.2)",
  borderRadius: 10,
  padding: hp(1.5),
  backdropFilter: "blur(6px)", // iOS
},

detailLabelRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: wp(1),
  marginBottom: hp(0.5),
},

detailLabel: {
  color: "rgba(255,255,255,0.9)",
  fontSize: wp(3),
},

detailValue: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: wp(4),
},

extraDetails: {
  flexDirection: "row",
  justifyContent: "space-between",
  padding: hp(2),
  gap: wp(2),
},

extraBox: {
  flex: 1,
  alignItems: "center",
  borderRadius: 12,
  paddingVertical: hp(1.5),
  paddingHorizontal: wp(2),
},

extraValue: {
  fontWeight: "600",
  fontSize: wp(3.8),
  marginTop: hp(0.5),
},

extraLabel: {
  fontSize: wp(2.8),
},


detailsGrid: {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: wp(3),
},

detailBox: {
  flex: 1,
  backgroundColor: "rgba(255,255,255,0.2)",
  borderRadius: 10,
  padding: hp(1.5),
  backdropFilter: "blur(6px)", // iOS
},

detailLabelRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: wp(1),
  marginBottom: hp(0.5),
},

detailLabel: {
  color: "rgba(255,255,255,0.9)",
  fontSize: wp(3),
},

detailValue: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: wp(4),
},

extraDetails: {
  flexDirection: "row",
  justifyContent: "space-between",
  padding: hp(2),
  gap: wp(2),
},

extraBox: {
  flex: 1,
  alignItems: "center",
  borderRadius: 12,
  paddingVertical: hp(1.5),
  paddingHorizontal: wp(2),
},

extraValue: {
  fontWeight: "600",
  fontSize: wp(3.8),
  marginTop: hp(0.5),
},

extraLabel: {
  fontSize: wp(2.8),
},


sunGrid: {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: wp(4),
},

sunCard: {
  flex: 1,
  borderWidth: 1,
  borderRadius: 16,
  paddingVertical: hp(1.5),
},

sunriseCard: {
  backgroundColor: "#FFF7ED", // from-orange-50
  borderColor: "#FDBA74", // border-orange-200
},

sunsetCard: {
  backgroundColor: "#F5F3FF", // from-purple-50
  borderColor: "#C4B5FD", // border-purple-200
},

sunContent: {
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: hp(1),
},

sunTime: {
  fontWeight: "700",
  fontSize: wp(4),
  marginTop: hp(0.5),
},

sunLabel: {
  fontSize: wp(3),
  fontWeight: "500",
},

shadow: {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 5,
  elevation: 5,
},

forecastCard: {
  backgroundColor: "#EFF6FF", 
  borderColor: "#93C5FD",
  borderWidth: 1,
  borderRadius: 18,
  paddingVertical: hp(1),
  marginTop: hp(1),
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 5,
},

forecastTitle: {
  fontWeight: "700",
  color: "#1E3A8A",
  fontSize: wp(4.5),
  marginBottom: hp(1),
},
dayContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.9)",
  borderRadius: 12,
  paddingVertical: hp(1.2),
  paddingHorizontal: wp(3),
},
dayLeft: {
  flexDirection: "row",
  alignItems: "center",
  gap: wp(2),
},
dayName: {
  fontWeight: "600",
  color: "#1F2937",
  fontSize: wp(3.6),
},
dayDetails: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  marginTop: 2,
},
detailText: {
  fontSize: wp(2.8),
  color: "#6B7280",
},
dot: {
  color: "#9CA3AF",
  fontSize: wp(3),
},
dayRight: {
  flexDirection: "row",
  alignItems: "center",
  gap: wp(2),
},
highTemp: {
  fontWeight: "700",
  color: "#1F2937",
  fontSize: wp(3.8),
},
lowTemp: {
  color: "#6B7280",
  fontSize: wp(3.5),
},
shadow: {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 5,
  elevation: 3,
},

  tipsCard: {
  backgroundColor: "#ECFDF5", // soft green gradient base
  borderColor: "#A7F3D0",
  borderWidth: 1,
  borderRadius: 16,
  paddingVertical: 6,
  marginVertical: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 5,
},
tipsTitle: {
  fontSize: wp(4.5),
  fontWeight: "700",
  color: "#065F46",
},
tipItem: {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: wp(3),
  backgroundColor: "rgba(255,255,255,0.8)",
  borderRadius: 12,
  padding: wp(3),
},
tipHeading: {
  fontWeight: "600",
  fontSize: wp(3.6),
},
tipText: {
  fontSize: wp(3),
  marginTop: 2,
},

})
