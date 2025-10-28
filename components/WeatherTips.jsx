import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Card from "../components/Card";
import { generateTips } from "../helpers/weatherProfiles";

export default function WeatherTips({ forecast }) {
  const dailyTips = generateTips(forecast);

  const severityColors = {
    low: "#10B981",     // green - suitable/good conditions
    medium: "#FBBF24",  // yellow - sunny/warning
    high: "#EF4444"     // red - heavy rain/danger
  };

  return (
    <Card style={styles.tipsCard}>
      <Card.Header>
        <Text style={styles.tipsTitle}>🌱 Weather-Based Tips</Text>
      </Card.Header>

      <Card.Content>
        <ScrollView contentContainerStyle={{ gap: 12 }}>
          {dailyTips.map(day => (
            <View key={day.date} style={{ gap: 6 }}>
              <Text style={styles.dayTitle}>
                {new Date(day.date).toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
              </Text>

              {day.tips.length > 0 ? (
                day.tips.map((tip, index) => (
                  <View key={index} style={[styles.tipItem, { borderLeftColor: severityColors[tip.severity] }]}>
                    <Text style={{ fontSize: 16, marginLeft: 6 }}>{tip.emoji}</Text>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text 
                        style={[
                          styles.tipHeading, 
                          { color: severityColors[tip.severity], fontSize: 13 }
                        ]}
                      >
                        {tip.tip}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ color: "#6B7280", fontStyle: "italic", fontSize: 12 }}>
                  No significant tips for this day.
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  tipsCard: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    marginVertical: 10,
  },
  tipsTitle: { fontSize: 16, fontWeight: "700", color: "#065F46" },
  dayTitle: { fontWeight: "600", fontSize: 14, color: "#065F46" },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    gap: 4,
  },
  tipHeading: { fontWeight: "600" },
});


const weatherTipColors = {
  low: "#10B981",     // green - suitable/good conditions
  medium: "#FBBF24",  // yellow - sunny/warning
  high: "#EF4444"     // red - heavy rain/danger
};  
export { weatherTipColors };