// screens/FundingPostsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import { db } from "../../config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const FundingPostsScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [supportAmount, setSupportAmount] = useState("");

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "fundingPosts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const postList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        funded: doc.data().funded || 0, // default funded amount
      }));
      setPosts(postList);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSupport = (amount) => {
    // In real app → update DB with funded amount
    alert(`Thank you for supporting with $${amount}!`);
    setSupportAmount("");
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {posts.length === 0 ? (
          <Text style={styles.noData}>No funding requests yet.</Text>
        ) : (
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.card}
              onPress={() => setSelectedPost(post)}
            >
              {post.imageUrl ? (
                <Image source={{ uri: post.imageUrl }} style={styles.image} />
              ) : null}
              <Text style={styles.name}>{post.applicantName}</Text>
              <Text style={styles.detail}>📍 {post.location}</Text>
              {post.category ? (
                <Text style={styles.detail}>🏷️ {post.category}</Text>
              ) : null}
              <Text style={styles.detail}>💰 Goal: ${post.goalAmount}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ✅ Modal for details */}
      {selectedPost && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedPost}
          onRequestClose={() => setSelectedPost(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {selectedPost.imageUrl && (
                  <Image
                    source={{ uri: selectedPost.imageUrl }}
                    style={styles.modalImage}
                  />
                )}
                <Text style={styles.modalName}>{selectedPost.applicantName}</Text>
                <Text style={styles.modalCategory}>
                  {selectedPost.category} • {selectedPost.location}
                </Text>

                {/* ✅ Progress bar */}
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${
                          (selectedPost.funded / selectedPost.goalAmount) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {selectedPost.daysRemaining} days remaining • $
                  {selectedPost.goalAmount - selectedPost.funded} to go
                </Text>

                {/* ✅ About */}
                <Text style={styles.sectionTitle}>How this money helps</Text>
                <Text style={styles.paragraph}>{selectedPost.useOfFunds}</Text>

                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.paragraph}>{selectedPost.description}</Text>

                {/* ✅ Support Options */}
                <Text style={styles.sectionTitle}>Support this request</Text>
                <View style={styles.amountRow}>
                  {[25, 50, 100].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={styles.amountButton}
                      onPress={() => handleSupport(amt)}
                    >
                      <Text style={styles.amountText}>${amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Other amount"
                  value={supportAmount}
                  onChangeText={setSupportAmount}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.supportButton}
                  onPress={() => handleSupport(supportAmount || 0)}
                >
                  <Text style={styles.supportText}>
                    Support {selectedPost.applicantName}
                  </Text>
                </TouchableOpacity>

                <Pressable
                  style={styles.closeButton}
                  onPress={() => setSelectedPost(null)}
                >
                  <Text style={{ color: "#fff" }}>Close</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default FundingPostsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noData: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detail: {
    fontSize: 14,
    color: "#555",
  },

  // ✅ Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 10,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    maxHeight: "90%",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  modalName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  modalCategory: {
    color: "#777",
    marginBottom: 10,
  },

  progressContainer: {
    backgroundColor: "#eee",
    borderRadius: 8,
    height: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  progressBar: {
    backgroundColor: "#28a745",
    height: 10,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 13,
    color: "#444",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
  },
  paragraph: {
    fontSize: 14,
    color: "#333",
  },

  // ✅ Support buttons
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  amountButton: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  amountText: {
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  supportButton: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  supportText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#777",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
