import { Tabs } from "expo-router";
import { Provider as PaperProvider } from 'react-native-paper';
import CustomNavBar from "../../components/CustomNavBar";
import AppDataProvider from '../../context/AppDataProvider';
import { WeatherProvider } from "../../context/weatherContext";

export default function TabsLayout() {
  return (
    <PaperProvider>
      <WeatherProvider>
      <AppDataProvider>
        <Tabs
        tabBar={(props) => <CustomNavBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="Dashboard" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="(Crops)/index" options={{ title: "Crops" }} />
        <Tabs.Screen name="Weather" options={{ title: "Weather" }} />
        <Tabs.Screen name="Activity" options={{ title: "Activity" }} />
        <Tabs.Screen name="(Market)/index" options={{ title: "Market" }} />
        <Tabs.Screen name="Community" options={{ title: "Community" }} />
      </Tabs>
      </AppDataProvider>
      </WeatherProvider>
    </PaperProvider>
  );
}