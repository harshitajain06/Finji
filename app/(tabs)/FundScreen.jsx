// screens/FundingPostsScreen.js
import { addDoc, collection, doc, getDocs, increment, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase";
import { useUserRole } from "../../contexts/UserRoleContext";

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const FundingPostsScreen = () => {
  const { user } = useUserRole();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [supportAmount, setSupportAmount] = useState("");
  const [updating, setUpdating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("urgency"); // urgency, amount, recent
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(0);

  const categories = [
    "All", "Women", "Climate", "Agriculture", "Education", 
    "Health", "Retail", "Food", "Technology", "Arts", "Transportation"
  ];

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "fundingPosts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const postList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          funded: data.funded || 0, // default funded amount
          deadline: data.deadline ? new Date(data.deadline.toDate()) : null, // convert Firestore timestamp
        };
      });
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

  // Calculate remaining days
  const calculateRemainingDays = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  // Filter and sort posts
  const getFilteredAndSortedPosts = () => {
    let filteredPosts = posts;
    
    // Filter by category
    if (selectedCategory !== "All") {
      filteredPosts = posts.filter(post => 
        post.category && post.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    // Sort posts
    switch (sortBy) {
      case "urgency":
        return filteredPosts.sort((a, b) => {
          const daysA = calculateRemainingDays(a.deadline) || 999;
          const daysB = calculateRemainingDays(b.deadline) || 999;
          return daysA - daysB;
        });
      case "amount":
        return filteredPosts.sort((a, b) => (b.goalAmount - b.funded) - (a.goalAmount - a.funded));
      case "recent":
        return filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return filteredPosts;
    }
  };

  // Handle support - show confirmation modal
  const handleSupport = (amount) => {
    if (!selectedPost || !amount || amount <= 0) {
      if (isWeb) {
        alert("Please enter a valid amount to support.");
      } else {
        Alert.alert("Invalid Amount", "Please enter a valid amount to support.");
      }
      return;
    }

    setInvestmentAmount(amount);
    setShowConfirmation(true);
  };

  // Process the actual investment after confirmation
  const processInvestment = async () => {
    if (!selectedPost || !investmentAmount || investmentAmount <= 0 || !user) {
      return;
    }

    setUpdating(true);
    setShowConfirmation(false);
    try {
      // Create investment record
      const investmentData = {
        postId: selectedPost.id,
        postTitle: selectedPost.applicantName,
        investorId: user.uid,
        investorName: user.displayName || 'Anonymous Investor',
        investorEmail: user.email,
        amount: parseFloat(investmentAmount),
        investedAt: serverTimestamp(),
        postApplicantName: selectedPost.applicantName,
        postCategory: selectedPost.category,
        postLocation: selectedPost.location
      };

      // Add investment record to investments collection
      await addDoc(collection(db, "investments"), investmentData);

      // Update the funded amount in Firestore
      const postRef = doc(db, "fundingPosts", selectedPost.id);
      await updateDoc(postRef, {
        funded: increment(parseFloat(investmentAmount))
      });

      // Update local state
      const updatedPosts = posts.map(post => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            funded: post.funded + parseFloat(investmentAmount)
          };
        }
        return post;
      });
      setPosts(updatedPosts);

      // Update selected post for modal display
      setSelectedPost(prev => ({
        ...prev,
        funded: prev.funded + parseFloat(investmentAmount)
      }));

      if (isWeb) {
        alert(`Thank you for supporting with $${investmentAmount}!`);
      } else {
        Alert.alert("Success!", `Thank you for supporting with $${investmentAmount}!`);
      }
      setSupportAmount("");
    } catch (error) {
      console.error("Error updating support:", error);
      if (isWeb) {
        alert("Failed to process support. Please try again.");
      } else {
        Alert.alert("Error", "Failed to process support. Please try again.");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  const filteredPosts = getFilteredAndSortedPosts();

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Browse Loans</Text>
        <Text style={styles.headerSubtitle}>Choose a person to support and make a difference</Text>
      </View>

      {/* Filters and Sort Section */}
      <View style={styles.filtersSection}>
        <View style={styles.categoryFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryFilter,
                  selectedCategory === category && styles.categoryFilterActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryFilterText,
                  selectedCategory === category && styles.categoryFilterTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === "urgency" && styles.sortButtonActive]}
            onPress={() => setSortBy("urgency")}
          >
            <Text style={[styles.sortButtonText, sortBy === "urgency" && styles.sortButtonTextActive]}>
              Urgency
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === "amount" && styles.sortButtonActive]}
            onPress={() => setSortBy("amount")}
          >
            <Text style={[styles.sortButtonText, sortBy === "amount" && styles.sortButtonTextActive]}>
              Amount
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === "recent" && styles.sortButtonActive]}
            onPress={() => setSortBy("recent")}
          >
            <Text style={[styles.sortButtonText, sortBy === "recent" && styles.sortButtonTextActive]}>
              Recent
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredPosts.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataIcon}>🤝</Text>
            <Text style={styles.noDataTitle}>No loans found</Text>
            <Text style={styles.noDataText}>
              {selectedCategory !== "All" 
                ? `No loans available in the "${selectedCategory}" category.`
                : "No funding requests available at the moment."
              }
            </Text>
          </View>
        ) : (
          <View style={styles.postsGrid}>
            {filteredPosts.map((post) => {
              const fundedPercent = (post.funded / post.goalAmount) * 100;
              const remaining = post.goalAmount - post.funded;
              const remainingDays = calculateRemainingDays(post.deadline);
              const isUrgent = remainingDays !== null && remainingDays <= 7;
              const isAlmostFunded = fundedPercent >= 80;

              return (
                <View key={post.id} style={[
                  styles.card,
                  isUrgent && styles.urgentCard,
                  isAlmostFunded && styles.almostFundedCard
                ]}>
                  {/* Urgency Badge */}
                  {isUrgent && (
                    <View style={styles.urgencyBadge}>
                      <Text style={styles.urgencyText}>🔥 URGENT</Text>
                    </View>
                  )}
                  
                  {/* Almost Funded Badge */}
                  {isAlmostFunded && !isUrgent && (
                    <View style={styles.almostFundedBadge}>
                      <Text style={styles.almostFundedText}>🎯 Almost There!</Text>
                    </View>
                  )}

                  {post.imageUrl ? (
                    <Image source={{ uri: post.imageUrl }} style={styles.image} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>📸</Text>
                    </View>
                  )}
                  
                  <View style={styles.cardContent}>
                    <Text style={styles.name}>{post.applicantName}</Text>
                    <Text style={styles.detail}>📍 {post.location}</Text>
                    {post.category ? (
                      <View style={styles.categoryContainer}>
                        <Text style={styles.categoryTag}>{post.category}</Text>
                      </View>
                    ) : null}

                    {/* Progress bar */}
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${Math.min(fundedPercent, 100)}%` },
                        ]}
                      />
                    </View>
                    
                    <View style={styles.progressInfo}>
                      <Text style={styles.remainingText}>
                        ${remaining.toLocaleString()} to go
                      </Text>
                      <Text style={styles.fundedPercent}>
                        {Math.round(fundedPercent)}% funded
                      </Text>
                    </View>
                    
                    {/* Days remaining */}
                    {remainingDays !== null && (
                      <View style={styles.daysContainer}>
                        <Text style={[
                          styles.daysText,
                          isUrgent && styles.urgentDaysText
                        ]}>
                          {remainingDays} days remaining
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => setSelectedPost(post)}
                    >
                      <Text style={styles.viewText}>View Loan</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      {selectedPost && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedPost}
          onRequestClose={() => setSelectedPost(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isWeb && styles.modalContentWeb]}>
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

                {/* Progress */}
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(
                          (selectedPost.funded / selectedPost.goalAmount) * 100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {calculateRemainingDays(selectedPost.deadline) || 'No deadline'} days remaining • $
                  {selectedPost.goalAmount - selectedPost.funded} to go
                </Text>

                {/* Info */}
                <Text style={styles.sectionTitle}>How this money helps</Text>
                <Text style={styles.paragraph}>{selectedPost.useOfFunds}</Text>

                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.paragraph}>{selectedPost.description}</Text>

                {/* Support Options */}
                <Text style={styles.sectionTitle}>Support this request</Text>
                <View style={styles.amountRow}>
                  {[25, 50, 100].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={styles.amountButton}
                      onPress={() => handleSupport(amt)}
                      disabled={updating}
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
                  editable={!updating}
                />
                <TouchableOpacity
                  style={[styles.supportButton, updating && styles.disabledButton]}
                  onPress={() => handleSupport(supportAmount || 0)}
                  disabled={updating}
                >
                  <Text style={styles.supportText}>
                    {updating ? "Processing..." : `Support ${selectedPost.applicantName}`}
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

      {/* Confirmation Checkout Modal */}
      {showConfirmation && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showConfirmation}
          onRequestClose={() => setShowConfirmation(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.confirmationModal, isWeb && styles.confirmationModalWeb]}>
              <View style={styles.confirmationHeader}>
                <Text style={styles.confirmationTitle}>Confirm Investment</Text>
                <TouchableOpacity
                  onPress={() => setShowConfirmation(false)}
                  style={styles.closeConfirmationButton}
                >
                  <Text style={styles.closeConfirmationText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.confirmationContent}>
                <View style={styles.investmentSummary}>
                  <Text style={styles.summaryLabel}>Investment Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>Project:</Text>
                    <Text style={styles.summaryValue}>{selectedPost?.applicantName}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>Category:</Text>
                    <Text style={styles.summaryValue}>{selectedPost?.category}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>Location:</Text>
                    <Text style={styles.summaryValue}>{selectedPost?.location}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>Current Funding:</Text>
                    <Text style={styles.summaryValue}>
                      ${selectedPost?.funded || 0} / ${selectedPost?.goalAmount}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.investmentAmountLabel}>Your Investment:</Text>
                    <Text style={styles.investmentAmountValue}>${investmentAmount}</Text>
                  </View>
                </View>

                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>Payment Information</Text>
                  <Text style={styles.paymentNote}>
                    This is a demo. In a real application, you would be redirected to a secure payment processor.
                  </Text>
                </View>

                <View style={styles.confirmationButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowConfirmation(false)}
                    disabled={updating}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.confirmButton, updating && styles.disabledButton]}
                    onPress={processInvestment}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Confirm Investment</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
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
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  
  // Header Section
  headerSection: {
    backgroundColor: '#667eea',
    padding: isWeb ? 30 : 20,
    alignItems: 'center',
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
    }),
  },
  headerTitle: {
    fontSize: isWeb ? 32 : 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: isWeb ? 16 : 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },

  // Filters Section
  filtersSection: {
    backgroundColor: '#fff',
    padding: isWeb ? 20 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    ...(isWeb && {
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    }),
  },
  categoryFilters: {
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  categoryFilter: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: isWeb ? 20 : 15,
    paddingVertical: isWeb ? 12 : 10,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#e8e8e8',
      }
    }),
  },
  categoryFilterActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryFilterText: {
    fontSize: isWeb ? 14 : 13,
    color: '#666',
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: '#fff',
  },
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  sortLabel: {
    fontSize: isWeb ? 14 : 13,
    color: '#666',
    fontWeight: '500',
  },
  sortButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: isWeb ? 16 : 12,
    paddingVertical: isWeb ? 8 : 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#e8e8e8',
      }
    }),
  },
  sortButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  sortButtonText: {
    fontSize: isWeb ? 12 : 11,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#fff',
  },

  scrollContainer: {
    padding: isWeb ? 20 : 15,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // No Data Container
  noDataContainer: {
    alignItems: 'center',
    padding: isWeb ? 60 : 40,
    marginTop: 40,
  },
  noDataIcon: {
    fontSize: isWeb ? 64 : 48,
    marginBottom: 20,
  },
  noDataTitle: {
    fontSize: isWeb ? 24 : 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: isWeb ? 16 : 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: isWeb ? 24 : 20,
  },

  postsGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    flexWrap: isWeb ? 'wrap' : 'nowrap',
    justifyContent: isWeb ? 'flex-start' : 'center',
    gap: isWeb ? 20 : 0,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: isWeb ? 0 : 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: isWeb ? (screenWidth > 1200 ? 350 : screenWidth > 768 ? 300 : 280) : '100%',
    maxWidth: isWeb ? 400 : undefined,
    cursor: isWeb ? 'pointer' : 'default',
    transition: isWeb ? 'all 0.2s ease' : undefined,
    overflow: 'hidden',
    position: 'relative',
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      }
    }),
  },
  urgentCard: {
    borderWidth: 2,
    borderColor: '#e74c3c',
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(231, 76, 60, 0.2)',
    }),
  },
  almostFundedCard: {
    borderWidth: 2,
    borderColor: '#f39c12',
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(243, 156, 18, 0.2)',
    }),
  },

  // Badges
  urgencyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 1,
  },
  urgencyText: {
    color: '#fff',
    fontSize: isWeb ? 12 : 11,
    fontWeight: 'bold',
  },
  almostFundedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 1,
  },
  almostFundedText: {
    color: '#fff',
    fontSize: isWeb ? 12 : 11,
    fontWeight: 'bold',
  },

  image: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderImage: {
    width: "100%",
    height: 160,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderText: {
    fontSize: isWeb ? 48 : 40,
    color: '#ccc',
  },
  cardContent: {
    padding: isWeb ? 20 : 15,
  },
  name: {
    fontSize: isWeb ? 20 : 18,
    fontWeight: "bold",
    color: '#333',
    marginBottom: 8,
  },
  detail: {
    fontSize: isWeb ? 14 : 13,
    color: "#666",
    marginBottom: 10,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryTag: {
    backgroundColor: "#667eea",
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    fontSize: isWeb ? 12 : 11,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    height: 8,
    marginBottom: 10,
  },
  progressBar: {
    backgroundColor: "#28a745",
    height: 8,
    borderRadius: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  remainingText: {
    fontSize: isWeb ? 14 : 13,
    fontWeight: "600",
    color: "#333",
  },
  fundedPercent: {
    fontSize: isWeb ? 12 : 11,
    color: "#666",
    fontWeight: '500',
  },
  daysContainer: {
    marginBottom: 15,
  },
  daysText: {
    fontSize: isWeb ? 12 : 11,
    color: "#666",
    fontStyle: "italic",
  },
  urgentDaysText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: "#28a745",
    padding: isWeb ? 14 : 12,
    borderRadius: 8,
    alignItems: "center",
    cursor: isWeb ? 'pointer' : 'default',
    transition: isWeb ? 'background-color 0.2s ease' : undefined,
    ...(isWeb && {
      ':hover': {
        backgroundColor: '#218838',
      }
    }),
  },
  viewText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: isWeb ? 14 : 13,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: isWeb ? 20 : 10,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    maxHeight: "90%",
    width: '100%',
    maxWidth: isWeb ? 600 : '95%',
  },
  modalContentWeb: {
    maxWidth: 600,
    width: '100%',
    margin: '0 auto',
    maxHeight: '80vh',
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
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
    gap: 10,
  },
  amountButton: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    cursor: isWeb ? 'pointer' : 'default',
    transition: isWeb ? 'background-color 0.2s ease' : undefined,
    ...(isWeb && {
      ':hover': {
        backgroundColor: '#ddd',
      }
    }),
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
    fontSize: isWeb ? 16 : undefined, // Prevent zoom on iOS
  },
  supportButton: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    cursor: isWeb ? 'pointer' : 'default',
    transition: isWeb ? 'background-color 0.2s ease' : undefined,
    ...(isWeb && {
      ':hover': {
        backgroundColor: '#218838',
      }
    }),
  },
  disabledButton: {
    backgroundColor: "#ccc",
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
    cursor: isWeb ? 'pointer' : 'default',
    transition: isWeb ? 'background-color 0.2s ease' : undefined,
    ...(isWeb && {
      ':hover': {
        backgroundColor: '#666',
      }
    }),
  },

  // Confirmation Modal Styles
  confirmationModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 0,
    maxHeight: "90%",
    width: "100%",
    maxWidth: isWeb ? 500 : '95%',
  },
  confirmationModalWeb: {
    maxWidth: 500,
    width: '100%',
    margin: '0 auto',
    maxHeight: '80vh',
  },
  confirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeConfirmationButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeConfirmationText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  confirmationContent: {
    padding: 20,
  },
  investmentSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  investmentAmountLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  investmentAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  paymentInfo: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  paymentNote: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    ...(isWeb && {
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#0056b3',
      }
    }),
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
