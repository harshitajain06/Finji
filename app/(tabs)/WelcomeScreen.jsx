import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../config/firebase";
import HomeScreen from "./HomeScreen";

const isWeb = Platform.OS === "web";

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && user) {
      navigation.replace("Drawer");
    }
  }, [loading, user, navigation]);

  return (
    <View style={styles.container}>
      {/* Login to Apply Button at Top - Fixed Position */}
      <View style={styles.topButtonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("LoginRegister", { mode: "login" })}
          style={styles.loginToApplyButton}
          disabled={loading}
        >
          <Text style={styles.loginToApplyText}>Login to Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Home Screen Content */}
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topButtonContainer: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },
  loginToApplyButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...(isWeb && {
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
      transition: "all 0.3s ease",
      ":hover": {
        backgroundColor: "#218838",
        boxShadow: "0 6px 16px rgba(40, 167, 69, 0.4)",
      },
    }),
  },
  loginToApplyText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});

