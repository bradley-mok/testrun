import React from "react";
import { View, Text, StyleSheet } from "react-native";

function Card({ style, children, ...props }) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

// ----- Subcomponents -----
Card.Header = function CardHeader({ style, children, ...props }) {
  return (
    <View style={[styles.cardHeader, style]} {...props}>
      {children}
    </View>
  );
};

Card.Title = function CardTitle({ style, children, ...props }) {
  return (
    <Text style={[styles.cardTitle, style]} {...props}>
      {children}
    </Text>
  );
};

Card.Description = function CardDescription({ style, children, ...props }) {
  return (
    <Text style={[styles.cardDescription, style]} {...props}>
      {children}
    </Text>
  );
};

Card.Content = function CardContent({ style, children, ...props }) {
  return (
    <View style={[styles.cardContent, style]} {...props}>
      {children}
    </View>
  );
};

Card.Action = function CardAction({ style, children, ...props }) {
  return (
    <View style={[styles.cardAction, style]} {...props}>
      {children}
    </View>
  );
};

Card.Footer = function CardFooter({ style, children, ...props }) {
  return (
    <View style={[styles.cardFooter, style]} {...props}>
      {children}
    </View>
  );
};

export default Card;

// ----- Styles -----
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280", // muted gray
  },
  cardAction: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
