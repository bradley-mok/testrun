import { Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, CloudLightning, Wind, CloudFog, Snowflake, CloudHail, CloudSun,} from "lucide-react-native";
import { WEATHER_TIP_LIBRARY } from "../api/weatherLibrary/weatherLibrary";


export const getWeatherIcon = (condition, size = 28) => {
  const colorMap = {
    sunny: "#FBBF24",
    clear: "#FBBF24",
    cloudy: "#9CA3AF",
    overcast: "#6B7280",
    mist: "#A1A1AA",
    fog: "#A1A1AA",
    drizzle: "#38BDF8",
    rain: "#3B82F6",
    thunder: "#8B5CF6",
    snow: "#BFDBFE",
    sleet: "#60A5FA",
    hail: "#93C5FD",
  };

  const c = condition?.toLowerCase() || "";

  if (c.includes("thunder")) return <CloudLightning size={size} color={colorMap.thunder} />;
  if (c.includes("rain shower")) return <CloudRain size={size} color={colorMap.rain} />;
  if (c.includes("rain")) return <CloudRain size={size} color={colorMap.rain} />;
  if (c.includes("drizzle")) return <CloudDrizzle size={size} color={colorMap.drizzle} />;
  if (c.includes("snow")) return <CloudSnow size={size} color={colorMap.snow} />;
  if (c.includes("sleet")) return <Snowflake size={size} color={colorMap.sleet} />;
  if (c.includes("hail")) return <CloudHail size={size} color={colorMap.hail} />;
  if (c.includes("mist") || c.includes("fog")) return <CloudFog size={size} color={colorMap.fog} />;
  if (c.includes("overcast")) return <Cloud size={size} color={colorMap.overcast} />;
  if (c.includes("partly")) return <CloudSun size={size} color={colorMap.cloudy} />;
  if (c.includes("cloud")) return <Cloud size={size} color={colorMap.cloudy} />;
  if (c.includes("wind")) return <Wind size={size} color="#60A5FA" />;
  if (c.includes("clear") || c.includes("sunny")) return <Sun size={size} color={colorMap.sunny} />;

  // fallback
  return <Sun size={size} color="#FACC15" />;
};


export const getWeatherGradient = (condition) => {
  const c = condition?.toLowerCase() || "";

  if (c.includes("thunder")) return ["#8B5CF6", "#4F46E5", "#1E3A8A"]; // purple → blue
  if (c.includes("rain shower")) return ["#38BDF8", "#3B82F6", "#1D4ED8"]; // light blue
  if (c.includes("rain")) return ["#60A5FA", "#2563EB", "#1E40AF"]; // deep blue
  if (c.includes("drizzle")) return ["#93C5FD", "#3B82F6"]; // soft blue
  if (c.includes("snow")) return ["#E0F2FE", "#BAE6FD", "#93C5FD"]; // icy
  if (c.includes("sleet") || c.includes("hail")) return ["#C7D2FE", "#A5B4FC", "#818CF8"]; // lavender
  if (c.includes("fog") || c.includes("mist")) return ["#E5E7EB", "#9CA3AF", "#6B7280"]; // gray fog
  if (c.includes("overcast")) return ["#D1D5DB", "#9CA3AF", "#6B7280"]; // dark gray
  if (c.includes("partly")) return ["#FDE68A", "#FBBF24", "#F97316"]; // sunny + cloud
  if (c.includes("cloud")) return ["#E5E7EB", "#9CA3AF"]; // light gray
  if (c.includes("clear") || c.includes("sunny")) return ["#FDBA74", "#F97316"]; // warm orange
  if (c.includes("wind")) return ["#BFDBFE", "#93C5FD"]; // cool breeze

  // fallback gradient
  return ["#B9F8CF", "#64C50E"];
};


export const generateTips = (forecast) => {
  const dailyTips = forecast.map(day => {
    const tipsForDay = [];

    WEATHER_TIP_LIBRARY.forEach(tip => {
      if (tip.condition === "rain" && day.precipitation >= tip.threshold) {
        tipsForDay.push(tip);
      }

      // Storm-based tips
      if (tip.condition === "storm" && day.precipitation >= tip.threshold) {
        tipsForDay.push(tip);
      }

      // Temperature-based tips
      if (tip.condition === "hot" && day.high >= tip.threshold) {
        tipsForDay.push(tip);
      }

      if (tip.condition === "cold" && day.low <= tip.threshold) {
        tipsForDay.push(tip);
      }

      // Wind-based tips
      if (tip.condition === "wind" && day.windSpeed >= tip.threshold) {
        tipsForDay.push(tip);
      }

      // UV index tips
      if (tip.condition === "uv" && day.uvIndex >= tip.threshold) {
        tipsForDay.push(tip);
      }

      // Humidity-based tips
      if (tip.condition === "humidity" && day.humidity >= tip.threshold) {
        tipsForDay.push(tip);
      }
    });

    return {
      date: day.date,
      tips: tipsForDay
    };
  });

  return dailyTips;
};
