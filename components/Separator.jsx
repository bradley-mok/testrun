import { View, StyleSheet } from "react-native";

export function Separator({ orientation = "horizontal", style }) {
  return (
    <View
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: "100%",
    backgroundColor: "#DCFCE7", 
    marginVertical: 8,
  },
  vertical: {
    width: 1,
    height: "100%",
    backgroundColor: "#DCFCE7",
    marginHorizontal: 8,
  },
});
