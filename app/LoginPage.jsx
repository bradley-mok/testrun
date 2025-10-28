import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert} from "react-native";
import { useRouter } from "expo-router";
import { Sprout, Mail, Lock, User, Phone } from "lucide-react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { hp, wp } from "../helpers/dimensions";
import { supabase } from "../lib/supabase"; 
import * as Location from "expo-location";


export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState("login");

  // form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(null);

  // Request location permission on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required to continue.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);

  // ---- LOGIN FUNCTION ----
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      Alert.alert("Login Failed", error.message);
    } else {
      router.replace("/Dashboard");
    }
  };

  // ---- SIGNUP FUNCTION ----
  const handleSignup = async () => {
    if (!email || !password || !fullName || !phone) {
      Alert.alert("Error", "Please fill in all fields.");
      
      return;
    }

    setIsLoading(true);

    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
            full_name: fullName,
            phone, 
            longitude: location.longitude,
            latitude: location.latitude,
          },
      },
    });
   
    console.log("session", session)
    setIsLoading(false);

    if (error) {
      Alert.alert("Signup Failed", error.message);
    } else {
      Alert.alert("Success", "Please check your email for confirmation.");
      setTab("login");
    }
  };

  return (
    <ScreenWrapper bg="#F0FDF4">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}>
                <Sprout color="white" size={wp(6)} />
              </View>
              <Text style={styles.logoText}>FarmConnect</Text>
            </View>
            <Text style={styles.subtitle}>Your digital farming companion</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabButton, tab === "login" && styles.activeTab]}
              onPress={() => setTab("login")}
            >
              <Text
                style={[styles.tabText, tab === "login" && styles.activeTabText]}
              >
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, tab === "signup" && styles.activeTab]}
              onPress={() => setTab("signup")}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "signup" && styles.activeTabText,
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* LOGIN FORM */}
          {tab === "login" && (
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputBox}>
                <Mail color="#999" size={18} style={styles.icon} />
                <TextInput
                  placeholder="hazel@example.com"
                  style={styles.input}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputBox}>
                <Lock color="#999" size={18} style={styles.icon} />
                <TextInput
                  placeholder="••••••••"
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* SIGNUP FORM */}
          {tab === "signup" && (
            <View style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputBox}>
                <User color="#999" size={18} style={styles.icon} />
                <TextInput
                  placeholder="Hazel Johnson"
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <Text style={styles.label}>Email</Text>
              <View style={styles.inputBox}>
                <Mail color="#999" size={18} style={styles.icon} />
                <TextInput
                  placeholder="hazel@example.com"
                  style={styles.input}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputBox}>
                <Phone color="#999" size={18} style={styles.icon} />
                <TextInput
                  placeholder="+27 82 123 4567"
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputBox}>
                <Lock color="#999" size={18} style={styles.icon} />
                <TextInput
                  placeholder="••••••••"
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(8),
    paddingBottom: hp(5),
    paddingTop: hp(3),
    display: "flex",
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: hp(3),
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  logoCircle: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
  },
  logoText: {
    fontSize: wp(6),
    fontWeight: "700",
    color: "#065F46",
  },
  subtitle: {
    color: "#16A34A",
    fontSize: wp(3.5),
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#D1FAE5",
    borderRadius: wp(10),
    overflow: "hidden",
    width: "100%",
    marginBottom: hp(2),
  },
  tabButton: {
    flex: 1,
    paddingVertical: hp(1.3),
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#16A34A",
    borderRadius: wp(10),
  },
  tabText: {
    color: "#065F46",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  form: {
    width: "100%",
  },
  label: {
    marginBottom: hp(0.5),
    color: "#065F46",
    fontWeight: "600",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    backgroundColor: "#fff",
    marginBottom: hp(1),
  },
  icon: {
    marginRight: wp(2),
  },
  input: {
    flex: 1,
    paddingVertical: hp(1.2),
    fontSize: wp(4),
  },
  button: {
    backgroundColor: "#16A34A",
    paddingVertical: hp(1.8),
    borderRadius: wp(2),
    alignItems: "center",
    marginTop: hp(1),
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: wp(4),
  },
  
});
