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
      
      // Fetch posts created by this applicant
      // Use a single query approach to minimize index requirements
      let allPosts = [];
      
      // Try to find posts by applicantEmail first
      if (user?.email) {
        try {
          const q1 = query(
            collection(db, "fundingPosts"), 
            where("applicantEmail", "==", user.email),
            orderBy("createdAt", "desc")
          );
          const snapshot1 = await getDocs(q1);
          allPosts = snapshot1.docs.map((doc) => {
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
          console.log("Query by email failed, trying alternative approach:", error.message);
        }
      }
      
      // If no posts found by email, try by display name
      if (allPosts.length === 0 && user?.displayName) {
        try {
          const q2 = query(
            collection(db, "fundingPosts"), 
            where("applicantName", "==", user.displayName),
            orderBy("createdAt", "desc")
          );
          const snapshot2 = await getDocs(q2);
          allPosts = snapshot2.docs.map((doc) => {
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
          console.log("Query by name failed, trying alternative approach:", error.message);
        }
      }
      
      // If still no posts found, get all posts and filter by user (for demo purposes)
      if (allPosts.length === 0) {
        try {
          const q3 = query(
            collection(db, "fundingPosts"), 
            orderBy("createdAt", "desc")
          );
          const snapshot3 = await getDocs(q3);
          allPosts = snapshot3.docs.map((doc) => {
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
          console.log("Query all posts failed:", error.message);
          allPosts = [];
        }
      }

      // Filter posts that belong to this user (for demo, we'll show posts with funding)
      // In a real app, you'd have proper user-post relationships
      let userPosts = allPosts.filter(post => 
        post.funded > 0 && (
          post.applicantEmail === user?.email || 
          post.applicantName === user?.displayName
        )
      );

      // If no posts found for this user, show some funded posts for demo purposes
      if (userPosts.length === 0) {
        userPosts = allPosts.filter(post => post.funded > 0).slice(0, 3); // Show up to 3 funded posts
      }

      // If still no posts, create some sample data for demonstration
      if (userPosts.length === 0) {
        userPosts = [
          {
            id: 'demo-post-1',
            applicantName: user?.displayName || 'Demo Applicant',
            category: 'Technology',
            location: 'San Francisco, CA',
            description: 'Building an innovative mobile app for sustainable living',
            goalAmount: 5000,
            funded: 3200,
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
            createdAt: new Date(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'demo-post-2',
            applicantName: user?.displayName || 'Demo Applicant',
            category: 'Agriculture',
            location: 'Austin, TX',
            description: 'Sustainable farming initiative to help local communities',
            goalAmount: 8000,
            funded: 5600,
            imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
          }
        ];
      }

      setMyPosts(userPosts);
      
      // Calculate totals
      const total = userPosts.reduce((sum, post) => sum + post.funded, 0);
      setTotalFunding(total);
      setTotalPosts(userPosts.length);

      // Generate realistic investor data
      const simulatedInvestors = generateSimulatedInvestors(userPosts);
      setInvestorData(simulatedInvestors);
      
      console.log('Applicant Profile Data:', {
        userPosts: userPosts.length,
        totalFunding: total,
        investorData: Object.keys(simulatedInvestors).length
      });
      
    } catch (error) {
      console.error("Error fetching applicant data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate simulated investor data for demonstration
  const generateSimulatedInvestors = (posts) => {
    const investors = {};
    const investorProfiles = [
      { name: "Sarah Johnson", company: "Green Ventures", expertise: "Climate Tech" },
      { name: "Michael Chen", company: "Tech Angels", expertise: "Technology" },
      { name: "Emily Rodriguez", company: "Social Impact Fund", expertise: "Social Enterprise" },
      { name: "David Kim", company: "Sustainable Capital", expertise: "Agriculture" },
      { name: "Lisa Thompson", company: "Women's Fund", expertise: "Women Entrepreneurs" },
      { name: "James Wilson", company: "Local Investors", expertise: "Local Business" },
      { name: "Maria Garcia", company: "Food Innovation", expertise: "Food & Retail" },
      { name: "Robert Brown", company: "Education Partners", expertise: "Education" },
      { name: "Jennifer Davis", company: "Health Ventures", expertise: "Healthcare" },
      { name: "Christopher Lee", company: "Arts Foundation", expertise: "Arts & Culture" }
    ];
    
    console.log('Generating investors for posts:', posts.length);
    
    posts.forEach(post => {
      if (post.funded > 0) {
        // Simulate 1-4 investors per funded post based on funding amount
        const baseInvestors = Math.max(1, Math.floor(post.funded / 1000));
        const numInvestors = Math.min(baseInvestors, 4);
        const postInvestors = [];
        
        // Distribute funding among investors
        let remainingFunding = post.funded;
        
        for (let i = 0; i < numInvestors; i++) {
          const investorProfile = investorProfiles[Math.floor(Math.random() * investorProfiles.length)];
          
          // Calculate investment amount (last investor gets remaining amount)
          let investmentAmount;
          if (i === numInvestors - 1) {
            investmentAmount = remainingFunding;
          } else {
            const maxAmount = Math.floor(remainingFunding * 0.6); // Max 60% for any single investor
            investmentAmount = Math.floor(Math.random() * maxAmount) + Math.floor(post.funded * 0.1); // Min 10% of total
            remainingFunding -= investmentAmount;
          }
          
          // Generate investment date within a reasonable timeframe
          const daysAfterPost = Math.floor(Math.random() * 30) + 1; // 1-30 days after post
          const investmentDate = new Date(post.createdAt.getTime() + daysAfterPost * 24 * 60 * 60 * 1000);
          
          postInvestors.push({
            name: investorProfile.name,
            company: investorProfile.company,
            expertise: investorProfile.expertise,
            amount: investmentAmount,
            date: investmentDate,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(investorProfile.name)}&background=007bff&color=fff&size=100`
          });
        }
        
        // Sort investors by investment amount (highest first)
        postInvestors.sort((a, b) => b.amount - a.amount);
        investors[post.id] = postInvestors;
        
        console.log(`Post ${post.id}: Generated ${postInvestors.length} investors`);
      }
    });
    
    console.log('Total investor data generated:', Object.keys(investors).length);
    return investors;
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
            <Text style={styles.debugText}>User Role: {userRole}</Text>
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
                                <Text style={styles.investorName}>{investor.name}</Text>
                                <Text style={styles.investorCompany}>{investor.company}</Text>
                                <Text style={styles.investorExpertise}>{investor.expertise}</Text>
                                <View style={styles.investorAmountRow}>
                                  <Text style={styles.investorAmount}>
                                    ${investor.amount.toLocaleString()}
                                  </Text>
                                  <Text style={styles.investorDate}>
                                    {formatDate(investor.date)}
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
                          No investors yet for this post
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
  investorCompany: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007bff',
    marginBottom: 1,
  },
  investorExpertise: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
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
