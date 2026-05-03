import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../config/firebase";

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
      <View style={styles.bgAccentOne} />
      <View style={styles.bgAccentTwo} />

      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Welcome to</Text>
          <Text style={styles.title}>Finji</Text>
          <Text style={styles.subtitle}>
            Connect applicants and investors in one place—share your story,
            discover opportunities, and fund goals faster.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <View style={[styles.dot, { backgroundColor: "#7c3aed" }]} />
            <Text style={styles.featureText}>Raise funds with a simple profile</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.dot, { backgroundColor: "#06b6d4" }]} />
            <Text style={styles.featureText}>Track updates and investor interest</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.dot, { backgroundColor: "#f59e0b" }]} />
            <Text style={styles.featureText}>Role-based experience (Applicant / Investor)</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.bottomHint}>Get started</Text>
          <View style={styles.linksRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginRegister", { mode: "login" })}
              disabled={loading}
            >
              <Text style={styles.linkText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.divider}>•</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("LoginRegister", { mode: "register" })
              }
              disabled={loading}
            >
              <Text style={styles.linkText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  bgAccentOne: {
    position: "absolute",
    top: -120,
    left: -140,
    width: 320,
    height: 320,
    borderRadius: 200,
    backgroundColor: "#7c3aed",
    opacity: 0.35,
  },
  bgAccentTwo: {
    position: "absolute",
    bottom: -140,
    right: -160,
    width: 360,
    height: 360,
    borderRadius: 220,
    backgroundColor: "#06b6d4",
    opacity: 0.28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 22,
    justifyContent: "space-between",
    ...(isWeb && {
      maxWidth: 520,
      width: "100%",
      alignSelf: "center",
      paddingTop: 40,
    }),
  },
  hero: {
    paddingTop: 8,
  },
  kicker: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  title: {
    marginTop: 6,
    fontSize: 40,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.82)",
    maxWidth: 520,
  },
  features: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    ...(isWeb && {
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    }),
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  featureText: {
    flex: 1,
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  bottom: {
    alignItems: "center",
    paddingTop: 8,
  },
  bottomHint: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "700",
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  linkText: {
    color: "#ffd166",
    fontSize: 14,
    fontWeight: "900",
    textDecorationLine: "underline",
    ...(isWeb && {
      cursor: "pointer",
    }),
  },
  divider: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 16,
    fontWeight: "900",
    marginHorizontal: 6,
  },
});
