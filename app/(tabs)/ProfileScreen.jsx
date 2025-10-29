import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { db } from "../../config/firebase";
import { useUserRole } from "../../contexts/UserRoleContext";

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const ProfileScreen = () => {
  const { user, userRole } = useUserRole();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userRole === 'investor') {
      fetchInvestorInvestments();
    }
  }, [userRole, user]);

  const fetchInvestorInvestments = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      if (!user?.uid) {
        setInvestments([]);
        setTotalInvested(0);
        setTotalProjects(0);
        setTotalPoints(0);
        return;
      }
      
      // Fetch investments from the current investor
      const q = query(
        collection(db, "investments"),
        where("investorId", "==", user.uid),
        orderBy("investedAt", "desc")
      );
      const investmentsSnapshot = await getDocs(q);
      
      // Fetch post details for each investment
      const investmentsWithPosts = [];
      for (const investmentDoc of investmentsSnapshot.docs) {
        const investmentData = investmentDoc.data();
        
        try {
          // Fetch the corresponding post
          const postRef = doc(db, "fundingPosts", investmentData.postId);
          const postSnap = await getDoc(postRef);
          
          if (postSnap.exists()) {
            const postData = postSnap.data();
            investmentsWithPosts.push({
              id: investmentDoc.id,
              investmentId: investmentDoc.id,
              postId: investmentData.postId,
              applicantName: postData.applicantName,
              category: postData.category,
              location: postData.location,
              description: postData.description,
              goalAmount: postData.goalAmount,
              funded: postData.funded || 0,
              deadline: postData.deadline ? new Date(postData.deadline.toDate()) : null,
              imageUrl: postData.imageUrl,
              investmentAmount: investmentData.amount,
              investmentDate: investmentData.investedAt ? new Date(investmentData.investedAt.toDate()) : new Date(),
            });
          }
        } catch (error) {
          console.error(`Error fetching post ${investmentData.postId}:`, error);
        }
      }

      setInvestments(investmentsWithPosts);
      
      // Calculate totals based on actual investment amounts
      const total = investmentsWithPosts.reduce((sum, inv) => sum + inv.investmentAmount, 0);
      const points = investmentsWithPosts.reduce((sum, inv) => sum + calculatePoints(inv.investmentAmount), 0);
      setTotalInvested(total);
      setTotalProjects(investmentsWithPosts.length);
      setTotalPoints(points);
      
      console.log('Investor investments fetched:', {
        totalInvestments: investmentsWithPosts.length,
        totalInvested: total,
        investorId: user.uid
      });
      
    } catch (error) {
      console.error("Error fetching investments:", error);
      setInvestments([]);
      setTotalInvested(0);
      setTotalProjects(0);
      setTotalPoints(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (userRole === 'investor') {
      fetchInvestorInvestments();
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString();
  };

  const calculateProgress = (funded, goal) => {
    return Math.min((funded / goal) * 100, 100);
  };

  // Calculate points based on investment amount (10 points per dollar)
  const calculatePoints = (amount) => {
    return Math.round(amount * 10);
  };

  if (userRole !== 'investor') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.accessDeniedText}>
            This section is only available for investors.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading your investments...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.headerSection}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0) || 'I'}
            </Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>
              {user?.displayName || 'Investor'}
            </Text>
            <Text style={styles.profileRole}>Investor Profile</Text>
          </View>
          <Pressable 
            style={styles.reloadButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Text style={styles.reloadIcon}>
              {refreshing ? '⟳' : '↻'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${totalInvested.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Invested</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalProjects}</Text>
          <Text style={styles.statLabel}>Projects Funded</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {totalPoints.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {totalProjects > 0 ? Math.round(totalInvested / totalProjects) : 0}
          </Text>
          <Text style={styles.statLabel}>Avg. Investment</Text>
        </View>
      </View>

      {/* Investments Section */}
      <View style={styles.investmentsSection}>
        <Text style={styles.sectionTitle}>Your Investments</Text>
        
        {investments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💼</Text>
            <Text style={styles.emptyStateTitle}>No Investments Yet</Text>
            <Text style={styles.emptyStateText}>
              Start investing in projects to see them here.
            </Text>
          </View>
        ) : (
          <View style={styles.investmentsList}>
            {investments.map((investment) => (
              <View key={investment.id} style={styles.investmentCard}>
                <View style={styles.investmentHeader}>
                  <View style={styles.investmentInfo}>
                    <Text style={styles.investmentTitle}>
                      {investment.applicantName}
                    </Text>
                    <Text style={styles.investmentCategory}>
                      {investment.category} • {investment.location}
                    </Text>
                  </View>
                  <View style={styles.investmentAmount}>
                    <Text style={styles.amountText}>
                      ${investment.investmentAmount.toLocaleString()}
                    </Text>
                    <Text style={styles.amountLabel}>invested</Text>
                    <Text style={styles.pointsText}>
                      ⭐ {calculatePoints(investment.investmentAmount).toLocaleString()} pts
                    </Text>
                  </View>
                </View>

                {investment.imageUrl && (
                  <Image
                    source={{ uri: investment.imageUrl }}
                    style={styles.investmentImage}
                  />
                )}

                <View style={styles.investmentDetails}>
                  <Text style={styles.investmentDescription} numberOfLines={2}>
                    {investment.description}
                  </Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${calculateProgress(
                              investment.funded,
                              investment.goalAmount
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      ${investment.funded.toLocaleString()} / ${investment.goalAmount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.investmentMeta}>
                    <Text style={styles.metaText}>
                      Goal: ${investment.goalAmount.toLocaleString()}
                    </Text>
                    <Text style={styles.metaText}>
                      Invested: {formatDate(investment.investmentDate)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    ...(isWeb && {
      minHeight: '100vh',
    }),
  },
  scrollContainer: {
    flex: 1,
    ...(isWeb && {
      minHeight: '100vh',
    }),
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  accessDeniedText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },

  // Header Section
  headerSection: {
    backgroundColor: '#007bff',
    padding: isWeb ? 40 : 20,
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(0, 123, 255, 0.3)',
      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    }),
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    ...(isWeb && {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    ...(isWeb && {
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'scale(1.05)',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
      }
    }),
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  reloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        transform: 'scale(1.05)',
      }
    }),
  },
  reloadIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
    ...(isWeb && {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  statCard: {
    minWidth: isWeb ? 200 : undefined,
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...(isWeb && {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'default',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }
    }),
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    ...(isWeb && {
      fontSize: 24,
      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }),
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    ...(isWeb && {
      fontSize: 14,
      fontWeight: '500',
    }),
  },

  // Investments Section
  investmentsSection: {
    padding: 20,
    ...(isWeb && {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    ...(isWeb && {
      fontSize: 24,
      marginBottom: 24,
      position: 'relative',
      '::after': {
        content: '""',
        position: 'absolute',
        bottom: '-8px',
        left: 0,
        width: '50px',
        height: '3px',
        backgroundColor: '#007bff',
        borderRadius: '2px',
      }
    }),
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...(isWeb && {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
    }),
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Investments List
  investmentsList: {
    gap: 16,
    ...(isWeb && {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px',
    }),
  },
  investmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...(isWeb && {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'default',
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      }
    }),
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  investmentCategory: {
    fontSize: 14,
    color: '#666',
  },
  investmentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
  },
  pointsText: {
    fontSize: 11,
    color: '#ff9800',
    fontWeight: '600',
    marginTop: 4,
  },
  investmentImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    ...(isWeb && {
      objectFit: 'cover',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'scale(1.02)',
      }
    }),
  },
  investmentDetails: {
    gap: 12,
  },
  investmentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    ...(isWeb && {
      transition: 'all 0.3s ease',
    }),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 3,
    ...(isWeb && {
      background: 'linear-gradient(90deg, #007bff 0%, #0056b3 100%)',
      transition: 'width 0.5s ease',
    }),
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  investmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProfileScreen;
