import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    // later: fetch from Kiva API or Firebase
    setLoading(false);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: "center" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Finji</Text>
        <Text style={styles.tagline}>Lend a little, change a life</Text>
      </View>


      {/* About Section */}
      <View style={styles.aboutBox}>
        <Text style={styles.sectionTitle}>About Finji</Text>
        <Text style={styles.aboutText} textAlign="center">
          Finji connects people who want to make a difference with borrowers around the world. 
          By lending as little as $25, you help entrepreneurs, farmers, and families 
          access opportunities that change their lives. 100% of your loan goes directly to funding dreams.
        </Text>
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorks}>
        <Text style={styles.sectionTitle}>How it Works</Text>
        <View style={styles.step}>
          <Ionicons name="search-outline" size={22} color="#1E88E5" />
          <Text style={styles.stepText}>Browse borrowers and their stories</Text>
        </View>
        <View style={styles.step}>
          <Ionicons name="card-outline" size={22} color="#43A047" />
          <Text style={styles.stepText}>Lend as little as $25 securely</Text>
        </View>
        <View style={styles.step}>
          <Ionicons name="reload-outline" size={22} color="#FB8C00" />
          <Text style={styles.stepText}>Get repaid and re-lend to others</Text>
        </View>
        <View style={styles.step}>
          <Ionicons name="heart-outline" size={22} color="#D81B60" />
          <Text style={styles.stepText}>See the real impact you’ve made</Text>
        </View>
      </View>

      

      {/* Impact Section */}
      <View style={styles.impactBox}>
        <Text style={styles.impactTitle}>🌍 Our Global Impact</Text>
        <Text style={styles.impactText}>$2B+ in loans, 5M+ borrowers reached</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: { padding: 20, alignItems: "center" },
  logo: { fontSize: 30, fontWeight: "bold", color: "#1E88E5" },
  tagline: { fontSize: 15, color: "#555", marginTop: 6, textAlign: "center" },

  quickActions: { flexDirection: "row", justifyContent: "space-around", width: "90%", marginVertical: 20 },
  actionCard: { alignItems: "center", justifyContent: "center", width: 80 },
  actionText: { marginTop: 6, fontSize: 14, fontWeight: "500", textAlign: "center" },

  aboutBox: { backgroundColor: "#fff", marginVertical: 15, padding: 20, borderRadius: 12, width: "90%", alignItems: "center", shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  aboutText: { fontSize: 14, color: "#444", marginTop: 10, lineHeight: 20, textAlign: "center" },

  howItWorks: { backgroundColor: "#E8F5E9", marginVertical: 15, padding: 20, borderRadius: 12, width: "90%", alignItems: "center" },
  step: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  stepText: { marginLeft: 10, fontSize: 14, color: "#333", textAlign: "center" },

  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 12, textAlign: "center" },

  placeholderBox: { backgroundColor: "#fff", padding: 25, borderRadius: 12, width: "90%", alignItems: "center" },
  placeholderText: { fontSize: 14, color: "#666", textAlign: "center" },

  impactBox: { backgroundColor: "#E3F2FD", marginVertical: 20, padding: 20, borderRadius: 12, width: "90%", alignItems: "center" },
  impactTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 6, textAlign: "center" },
  impactText: { fontSize: 14, color: "#333", textAlign: "center" },
});
