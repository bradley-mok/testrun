import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Home, Sprout, CloudRain, Calendar, TrendingUp, Users } from "lucide-react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = "#25963eff";
const SECONDARY_COLOR = "#fff";

const HIDDEN_ROUTES = ["_sitemap", "+not-found", "_layout", "()"];

const CustomNavBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: insets.bottom > 0 ? 0 : 40 }]}>
      {state.routes.map((route, index) => {
        if (HIDDEN_ROUTES.includes(route.name)) return null;

        const segments = route.name.split("/");
        if (segments.length > 1 && segments[segments.length - 1] !== "index") {
          return null;
        }

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel ??
          options.title ??
          route.name
            .replace("/index", "")
            .replace("index", "")
            .replace(/[()]/g, "");

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.5)}
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              { backgroundColor: isFocused ? SECONDARY_COLOR : "transparent" },
            ]}
          >
            {getIconByRouteName(
              label, // pass the cleaned label instead of raw routeName
              isFocused ? PRIMARY_COLOR : SECONDARY_COLOR
            )}
            {isFocused && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={styles.text}
              >
                {label}
              </Animated.Text>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
};

function getIconByRouteName(routeName, color) {
  switch (routeName) {
    case "Dashboard":
      return <Home size={22} color={color} />;
    case "Crops":
      return <Sprout size={22} color={color} />;
    case "Weather":
      return <CloudRain size={22} color={color} />;
    case "Activity":
      return <Calendar size={22} color={color} />;
    case "Market":
      return <TrendingUp size={22} color={color} />;
    case "Community":
      return <Users size={22} color={color} />;
    default:
      return <Home size={22} color={color} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    width: "100%",
    alignSelf: "center",
    opacity: 0.95,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    position: "absolute", 
  },
  tabItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 45,
    paddingHorizontal: 12,
    borderRadius: 30,
  },
  text: {
    color: PRIMARY_COLOR,
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default CustomNavBar;
