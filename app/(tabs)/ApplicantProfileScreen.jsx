import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { db } from "../../config/firebase";
import { useUserRole } from "../../contexts/UserRoleContext";

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const ApplicantProfileScreen = () => {
  const { user, userRole } = useUserRole();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalFunding, setTotalFunding] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [investorData, setInvestorData] = useState({});

  useEffect(() => {
    if (userRole === 'applicant') {
      fetchApplicantData();
    }
  }, [userRole, user]);

  const fetchApplicantData = async () => {
    try {
      setLoading(true);
      
      // Fetch posts created by this applicant using userId
      let userPosts = [];
      
      if (user?.uid) {
        try {
          const q = query(
            collection(db, "fundingPosts"), 
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const snapshot = await getDocs(q);
          userPosts = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              funded: data.funded || 0,
              deadline: data.deadline ? new Date(data.deadline.toDate()) : null,
              createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
            };
          });
        } catch (error) {
          console.log("Query by userId failed:", error.message);
        }
      }

      setMyPosts(userPosts);
      
      // Calculate totals
      const total = userPosts.reduce((sum, post) => sum + post.funded, 0);
      setTotalFunding(total);
      setTotalPosts(userPosts.length);

      // Fetch investor data for each post
      await fetchInvestorData(userPosts);
      
      console.log('Applicant Profile Data:', {
        userPosts: userPosts.length,
        totalFunding: total,
        userId: user?.uid
      });
      
    } catch (error) {
      console.error("Error fetching applicant data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestorData = async (posts) => {
    try {
      const investors = {};
      
      // Fetch investments for each post
      for (const post of posts) {
        if (post.funded > 0) {
          try {
            const q = query(
              collection(db, "investments"),
              where("postId", "==", post.id),
              orderBy("investedAt", "desc")
            );
            const snapshot = await getDocs(q);
            
            const postInvestors = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                investorName: data.investorName,
                investorEmail: data.investorEmail,
                amount: data.amount,
                investedAt: data.investedAt ? new Date(data.investedAt.toDate()) : new Date(),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.investorName)}&background=007bff&color=fff&size=100`
              };
            });
            
            investors[post.id] = postInvestors;
          } catch (error) {
            console.log(`Error fetching investors for post ${post.id}:`, error.message);
            investors[post.id] = [];
          }
        } else {
          investors[post.id] = [];
        }
      }
      
      setInvestorData(investors);
      console.log('Investor data fetched:', Object.keys(investors).length, 'posts with investors');
    } catch (error) {
      console.error("Error fetching investor data:", error);
      setInvestorData({});
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString();
  };

  const calculateProgress = (funded, goal) => {
    return Math.min((funded / goal) * 100, 100);
  };

  if (userRole !== 'applicant') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.accessDeniedText}>
            This section is only available for applicants.
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
          <Text style={styles.loadingText}>Loading your profile...</Text>
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
                {user?.displayName?.charAt(0) || 'A'}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {user?.displayName || 'Applicant'}
              </Text>
              <Text style={styles.profileRole}>Applicant Profile</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalFunding.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Funding Received</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalPosts}</Text>
            <Text style={styles.statLabel}>Posts Created</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Object.values(investorData).reduce((total, investors) => total + investors.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Investors</Text>
          </View>
        </View>

        {/* Debug Section - Remove in production */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Debug Info</Text>
            <Text style={styles.debugText}>Posts: {myPosts.length}</Text>
            <Text style={styles.debugText}>Investor Data Keys: {Object.keys(investorData).length}</Text>
            <Text style={styles.debugText}>Total Investors: {Object.values(investorData).reduce((total, investors) => total + investors.length, 0)}</Text>
            <Text style={styles.debugText}>User Role: {userRole}</Text>
            <Text style={styles.debugText}>User ID: {user?.uid}</Text>
            <Text style={styles.debugText}>User Email: {user?.email}</Text>
          </View>
        )}

        {/* My Posts Section */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>My Funding Posts</Text>
          
          {myPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📝</Text>
              <Text style={styles.emptyStateTitle}>No Posts Yet</Text>
              <Text style={styles.emptyStateText}>
                Create your first funding post to get started.
              </Text>
            </View>
          ) : (
            <View style={styles.postsList}>
              {myPosts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.postInfo}>
                      <Text style={styles.postTitle}>
                        {post.applicantName}
                      </Text>
                      <Text style={styles.postCategory}>
                        {post.category} • {post.location}
                      </Text>
                    </View>
                    <View style={styles.postAmount}>
                      <Text style={styles.amountText}>
                        ${post.funded.toLocaleString()}
                      </Text>
                      <Text style={styles.amountLabel}>funded</Text>
                    </View>
                  </View>

                  {post.imageUrl && (
                    <Image
                      source={{ uri: post.imageUrl }}
                      style={styles.postImage}
                    />
                  )}

                  <View style={styles.postDetails}>
                    <Text style={styles.postDescription} numberOfLines={2}>
                      {post.description}
                    </Text>
                    
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${calculateProgress(
                                post.funded,
                                post.goalAmount
                              )}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        ${post.funded.toLocaleString()} / ${post.goalAmount.toLocaleString()}
                      </Text>
                    </View>

                    {/* Investors Section */}
                    {investorData[post.id] && investorData[post.id].length > 0 ? (
                      <View style={styles.investorsSection}>
                        <Text style={styles.investorsTitle}>
                          Investors ({investorData[post.id].length})
                        </Text>
                        <View style={styles.investorsList}>
                          {investorData[post.id].map((investor, index) => (
                            <View key={index} style={styles.investorCard}>
                              <Image
                                source={{ uri: investor.avatar }}
                                style={styles.investorAvatar}
                              />
                              <View style={styles.investorInfo}>
                                <Text style={styles.investorName}>{investor.investorName}</Text>
                                <Text style={styles.investorEmail}>{investor.investorEmail}</Text>
                                <View style={styles.investorAmountRow}>
                                  <Text style={styles.investorAmount}>
                                    ${investor.amount.toLocaleString()}
                                  </Text>
                                  <Text style={styles.investorDate}>
                                    {formatDate(investor.investedAt)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <View style={styles.investorsSection}>
                        <Text style={styles.noInvestorsText}>
                          {post.funded > 0 
                            ? `This post has received $${post.funded.toLocaleString()} in funding`
                            : "No funding received yet for this post"
                          }
                        </Text>
                      </View>
                    )}
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
    backgroundColor: '#28a745',
    padding: isWeb ? 40 : 20,
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(40, 167, 69, 0.3)',
      backgroundImage: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
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

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    padding: 20,
    ...(isWeb && {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
      gap: '12px',
    }),
  },
  statCard: {
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
      backgroundImage: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
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

  // Posts Section
  postsSection: {
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
        backgroundColor: '#28a745',
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

  // Posts List
  postsList: {
    ...(isWeb && {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px',
    }),
  },
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postInfo: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  postCategory: {
    fontSize: 14,
    color: '#666',
  },
  postAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
  },
  postImage: {
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
  postDetails: {
    ...(isWeb && {
      gap: '12px',
    }),
  },
  postDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressContainer: {
    ...(isWeb && {
      gap: '8px',
    }),
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
    backgroundColor: '#28a745',
    borderRadius: 3,
    ...(isWeb && {
      backgroundImage: 'linear-gradient(90deg, #28a745 0%, #1e7e34 100%)',
      transition: 'width 0.5s ease',
    }),
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },

  // Investors Section
  investorsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  investorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  investorsList: {
    ...(isWeb && {
      gap: '8px',
    }),
  },
  investorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    ...(isWeb && {
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#e9ecef',
      }
    }),
  },
  investorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  investorInfo: {
    flex: 1,
  },
  investorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  investorEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  investorAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investorAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#28a745',
  },
  investorDate: {
    fontSize: 11,
    color: '#666',
  },
  noInvestorsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  },
  debugSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
});

export default ApplicantProfileScreen;
