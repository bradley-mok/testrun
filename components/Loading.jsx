import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { hp, wp } from "../helpers/dimensions";

const Loading = ({ size = "large", color = "#16a34a", message }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ECFDF6",
    width:wp(100)
  },
});

export default Loading;
