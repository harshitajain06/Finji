import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import InfoIcon from "../../components/InfoIcon";

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const [impactStats, setImpactStats] = useState({
    peopleReached: 0,
    loansFunded: 0,
    repaymentRate: 0
  });

  useEffect(() => {
    // later: fetch from Kiva API or Firebase
    setLoading(false);
    
    // Animate impact stats
    const animateStats = () => {
      const targetStats = {
        peopleReached: 1000,
        loansFunded: 20000, //500 Dollars
        repaymentRate: 86
      };
      
      let currentStats = { ...targetStats };
      Object.keys(currentStats).forEach(key => {
        currentStats[key] = 0;
      });
      
      const duration = 2000;
      const steps = 60;
      const increment = duration / steps;
      
      const timer = setInterval(() => {
        Object.keys(currentStats).forEach(key => {
          const target = targetStats[key];
          const current = currentStats[key];
          const step = target / steps;
          
          if (current < target) {
            currentStats[key] = Math.min(current + step, target);
          }
        });
        
        setImpactStats({ ...currentStats });
        
        if (Object.values(currentStats).every(val => val >= Object.values(targetStats)[Object.values(currentStats).indexOf(val)])) {
          clearInterval(timer);
        }
      }, increment);
    };
    
    setTimeout(animateStats, 500);
  }, []);

  const successStories = [
    {
      id: 1,
      name: "Eufemia",
      location: "Miami, U.S.",
      story: "With these funds, I was able to keep my family afloat. Now we don't really worry about food on the table, because business is thriving.",
      business: "Convenience store owner and refugee",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Manal",
      location: "Denver, U.S.",
      story: "I used the funds to buy sewing machines and started running my business. I even employed my daughter, and my income increased.",
      business: "Tailor",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Carmen",
      location: "California, U.S.",
      story: "I was born in Guatemala and don't have a long enough credit history to get a loan here. This Finji loan bought a van and expanded my business.",
      business: "Florist",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const featuredCategories = [
    { name: "Women", icon: "👩", color: "#FF6B9D", count: "2.8M+" },
    { name: "Education", icon: "🏠", color: "#4ECDC4", count: "450K+" },
    { name: "Climate", icon: "🌱", color: "#45B7D1", count: "180K+" },
    { name: "U.S. Entrepreneurs", icon: "🇺🇸", color: "#96CEB4", count: "320K+" }
  ];

  const almostFundedLoans = [
    {
      id: 1,
      name: "Sabina",
      location: "Seattle, U.S.",
      business: "Food Market",
      category: "Food & Beverage",
      amount: 1125,
      remaining: 70,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop"
    },
    {
      id: 2,
      name: "Angel Forrest",
      location: "Los Angeles, U.S.",
      business: "Phone Repair",
      category: "Eco-friendly",
      amount: 275,
      remaining: 100,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop"
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroTitleContainer}>
          <Text style={styles.heroTitle}>Finji</Text>
          <InfoIcon 
            tooltip="Finji is a micro-lending platform that connects investors with entrepreneurs who need small loans to grow their businesses. Start with as little as $25 to make a real impact."
            position="right"
            style={styles.heroInfoIcon}
          />
        </View>
        <Text style={styles.heroSubtitle}>
          Lend as little as $25 to create a more equitable world.
        </Text>
        <TouchableOpacity style={styles.heroButton}>
          <Text style={styles.heroButtonText}>Real people, real solutions</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Categories */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Featured Categories</Text>
          <InfoIcon 
            tooltip="Browse loan categories to find causes you care about. Each category shows the number of people helped through micro-loans in that area."
            position="right"
            style={styles.sectionInfoIcon}
          />
        </View>
        <View style={styles.categoriesGrid}>
          {featuredCategories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryCard}>
              <Text style={[styles.categoryIcon, { color: category.color }]}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Almost Funded Section */}
      <View style={styles.almostFundedSection}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Almost there! Fund the last few dollars they need</Text>
          <InfoIcon 
            tooltip="These loans are almost fully funded! Your contribution can help complete their funding goal and get them started on their business journey."
            position="right"
            style={styles.sectionInfoIcon}
          />
        </View>
        <View style={styles.loansGrid}>
          {almostFundedLoans.map((loan) => (
            <View key={loan.id} style={styles.loanCard}>
              <Image source={{ uri: loan.image }} style={styles.loanImage} />
              <View style={styles.loanContent}>
                <Text style={styles.loanName}>{loan.name}</Text>
                <Text style={styles.loanLocation}>{loan.location}</Text>
                <Text style={styles.loanBusiness}>{loan.business}</Text>
                <Text style={styles.loanCategory}>{loan.category}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((loan.amount - loan.remaining) / loan.amount) * 100}%` }]} />
                  </View>
                </View>
                <Text style={styles.remainingAmount}>${loan.remaining} to go!</Text>
                <TouchableOpacity style={styles.viewLoanButton}>
                  <Text style={styles.viewLoanText}>View Loan</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Success Stories */}
      <View style={styles.successStoriesSection}>
        <Text style={styles.sectionTitle}>Success Stories</Text>
        <Text style={styles.sectionSubtitle}>100% of your loan goes to supporting borrowers</Text>
        
        <View style={styles.storiesContainer}>
          {successStories.map((story, index) => (
            <View key={story.id} style={styles.storyCard}>
              <Image source={{ uri: story.image }} style={styles.storyImage} />
              <View style={styles.storyContent}>
                <Text style={styles.storyQuote}>"{story.story}"</Text>
                <Text style={styles.storyAuthor}>— {story.name}, {story.business}</Text>
                <Text style={styles.storyLocation}>{story.location}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Impact Statistics */}
      <View style={styles.impactSection}>
        <Text style={styles.sectionTitle}>Our Community Impact</Text>
        <Text style={styles.sectionSubtitle}>Finji helps people improve their livelihoods</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{impactStats.peopleReached.toLocaleString()}</Text>
            <Text style={styles.statLabel}>People Reached</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${(impactStats.loansFunded / 1000000000).toFixed(1)}B</Text>
            <Text style={styles.statLabel}>Loans Funded</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{impactStats.repaymentRate}%</Text>
            <Text style={styles.statLabel}>Repayment Rate</Text>
          </View>
        </View>
      </View>

      {/* Relend Cycle */}
      <View style={styles.relendSection}>
        <Text style={styles.sectionTitle}>Multiply Your Impact</Text>
        <Text style={styles.sectionSubtitle}>Relend money you get back to help another person</Text>
        <Text style={styles.relendText}>Just $25 can help many people over time.</Text>
        
        <View style={styles.relendVisual}>
          <View style={styles.relendStep}>
            <View style={styles.relendIcon}>
              <Text style={{ fontSize: 20 }}>💰</Text>
            </View>
            <Text style={styles.relendStepText}>Lend $25</Text>
          </View>
          <View style={styles.relendArrow}>
            <Text style={{ fontSize: 16 }}>→</Text>
          </View>
          <View style={styles.relendStep}>
            <View style={styles.relendIcon}>
              <Text style={{ fontSize: 20 }}>🌍</Text>
            </View>
            <Text style={styles.relendStepText}>Help someone</Text>
          </View>
          <View style={styles.relendArrow}>
            <Text style={{ fontSize: 16 }}>→</Text>
          </View>
          <View style={styles.relendStep}>
            <View style={styles.relendIcon}>
              <Text style={{ fontSize: 20 }}>🔄</Text>
            </View>
            <Text style={styles.relendStepText}>Get repaid</Text>
          </View>
          <View style={styles.relendArrow}>
            <Text style={{ fontSize: 16 }}>→</Text>
          </View>
          <View style={styles.relendStep}>
            <View style={styles.relendIcon}>
              <Text style={{ fontSize: 20 }}>💝</Text>
            </View>
            <Text style={styles.relendStepText}>Relend again</Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutBox}>
        <Text style={styles.sectionTitle}>About Finji</Text>
        <Text style={styles.aboutText}>
          Finji connects people who want to make a difference with borrowers around the world. 
          By lending as little as $25, you help entrepreneurs, farmers, and families 
          access opportunities that change their lives. 100% of your loan goes directly to funding dreams.
        </Text>
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorks}>
        <Text style={styles.sectionTitle}>How it Works</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="search-outline" size={22} color="#1E88E5" />
            </View>
            <Text style={styles.stepText}>Browse borrowers and their stories</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="card-outline" size={22} color="#43A047" />
            </View>
            <Text style={styles.stepText}>Lend as little as $25 securely</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="reload-outline" size={22} color="#FB8C00" />
            </View>
            <Text style={styles.stepText}>Get repaid and re-lend to others</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="heart-outline" size={22} color="#D81B60" />
            </View>
            <Text style={styles.stepText}>See the real impact you've made</Text>
          </View>
        </View>
      </View>

      {/* Trust Indicators */}
      <View style={styles.trustSection}>
        <Text style={styles.sectionTitle}>Give with Confidence</Text>
        <View style={styles.trustGrid}>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>⭐</Text>
            <Text style={styles.trustText}>Charity Navigator</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>🏆</Text>
            <Text style={styles.trustText}>Great Nonprofits</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>📊</Text>
            <Text style={styles.trustText}>Candid</Text>
          </View>
        </View>
      </View>

    
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  scrollContainer: { 
    alignItems: "center",
    paddingHorizontal: isWeb ? 40 : 20,
    paddingBottom: isWeb ? 60 : 40,
  },
  

  // Hero Section
  heroSection: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: isWeb ? 60 : 40,
    borderRadius: 20,
    width: '100%',
    maxWidth: isWeb ? 900 : "90%",
    alignItems: 'center',
    marginVertical: isWeb ? 30 : 20,
    ...(isWeb && {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
    }),
  },
  heroTitle: {
    fontSize: isWeb ? 42 : 32,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 15,
  },
  heroSubtitle: {
    fontSize: isWeb ? 20 : 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  heroButton: {
    backgroundColor: '#fff',
    paddingHorizontal: isWeb ? 40 : 30,
    paddingVertical: isWeb ? 18 : 15,
    borderRadius: 50,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
      }
    }),
  },
  heroButtonText: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: isWeb ? 18 : 16,
  },

  // Categories Section
  categoriesSection: {
    width: '100%',
    maxWidth: isWeb ? 900 : "90%",
    marginVertical: isWeb ? 40 : 25,
  },
  categoriesGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    flexWrap: isWeb ? 'wrap' : 'nowrap',
    justifyContent: 'space-between',
    gap: isWeb ? 20 : 15,
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: isWeb ? 25 : 20,
    borderRadius: 16,
    alignItems: 'center',
    flex: isWeb ? 1 : undefined,
    minWidth: isWeb ? 180 : undefined,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      ':hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      }
    }),
  },
  categoryIcon: {
    fontSize: isWeb ? 48 : 40,
    marginBottom: 15,
  },
  categoryName: {
    fontSize: isWeb ? 18 : 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: isWeb ? 16 : 14,
    color: '#666',
    fontWeight: '600',
  },

  // Almost Funded Section
  almostFundedSection: {
    width: '100%',
    maxWidth: isWeb ? 900 : "90%",
    marginVertical: isWeb ? 40 : 25,
  },
  loansGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: isWeb ? 20 : 15,
  },
  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    flex: isWeb ? 1 : undefined,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      ':hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      }
    }),
  },
  loanImage: {
    width: '100%',
    height: isWeb ? 180 : 150,
  },
  loanContent: {
    padding: isWeb ? 25 : 20,
  },
  loanName: {
    fontSize: isWeb ? 20 : 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  loanLocation: {
    fontSize: isWeb ? 14 : 13,
    color: '#666',
    marginBottom: 8,
  },
  loanBusiness: {
    fontSize: isWeb ? 16 : 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  loanCategory: {
    fontSize: isWeb ? 13 : 12,
    color: '#888',
    marginBottom: 15,
  },
  progressContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 8,
    marginBottom: 10,
  },
  progressBar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#28a745',
    height: 8,
    borderRadius: 8,
  },
  remainingAmount: {
    fontSize: isWeb ? 16 : 14,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 15,
  },
  viewLoanButton: {
    backgroundColor: '#28a745',
    padding: isWeb ? 12 : 10,
    borderRadius: 8,
    alignItems: 'center',
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: '#218838',
      }
    }),
  },
  viewLoanText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: isWeb ? 14 : 13,
  },

  // Success Stories Section
  successStoriesSection: {
    width: '100%',
    maxWidth: isWeb ? 900 : "90%",
    marginVertical: isWeb ? 40 : 25,
  },
  sectionSubtitle: {
    fontSize: isWeb ? 16 : 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: isWeb ? 30 : 20,
  },
  storiesContainer: {
    gap: isWeb ? 25 : 20,
  },
  storyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: isWeb ? 25 : 20,
    flexDirection: isWeb ? 'row' : 'column',
    alignItems: isWeb ? 'flex-start' : 'center',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    }),
  },
  storyImage: {
    width: isWeb ? 80 : 70,
    height: isWeb ? 80 : 70,
    borderRadius: 40,
    marginRight: isWeb ? 20 : 0,
    marginBottom: isWeb ? 0 : 15,
  },
  storyContent: {
    flex: 1,
    alignItems: isWeb ? 'flex-start' : 'center',
  },
  storyQuote: {
    fontSize: isWeb ? 16 : 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: isWeb ? 24 : 20,
    marginBottom: 15,
    textAlign: isWeb ? 'left' : 'center',
  },
  storyAuthor: {
    fontSize: isWeb ? 15 : 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  storyLocation: {
    fontSize: isWeb ? 13 : 12,
    color: '#666',
  },

  // Impact Statistics Section
  impactSection: {
    width: '100%',
    maxWidth: isWeb ? 900 : "90%",
    marginVertical: isWeb ? 40 : 25,
  },
  statsGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: isWeb ? 20 : 15,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: isWeb ? 30 : 25,
    borderRadius: 16,
    alignItems: 'center',
    flex: isWeb ? 1 : undefined,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'default',
      ':hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      }
    }),
  },
  statNumber: {
    fontSize: isWeb ? 36 : 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: isWeb ? 16 : 14,
    color: '#666',
    textAlign: 'center',
  },

  // Relend Section
  relendSection: {
    backgroundColor: '#E8F5E9',
    padding: isWeb ? 40 : 25,
    borderRadius: 20,
    width: '100%',
    maxWidth: isWeb ? 900 : "90%",
    alignItems: 'center',
    marginVertical: isWeb ? 40 : 25,
  },
  relendText: {
    fontSize: isWeb ? 18 : 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  relendVisual: {
    flexDirection: isWeb ? 'row' : 'column',
    alignItems: 'center',
    gap: isWeb ? 20 : 15,
  },
  relendStep: {
    alignItems: 'center',
  },
  relendIcon: {
    fontSize: isWeb ? 40 : 32,
    marginBottom: 10,
  },
  relendStepText: {
    fontSize: isWeb ? 14 : 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  relendArrow: {
    fontSize: isWeb ? 24 : 20,
    color: '#666',
    fontWeight: 'bold',
  },

  // Trust Section
  trustSection: {
    width: '100%',
    maxWidth: isWeb ? 900 : "90%",
    marginVertical: isWeb ? 40 : 25,
  },
  trustGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    justifyContent: 'space-around',
    gap: isWeb ? 20 : 15,
  },
  trustItem: {
    alignItems: 'center',
    flex: isWeb ? 1 : undefined,
  },
  trustIcon: {
    fontSize: isWeb ? 32 : 28,
    marginBottom: 10,
  },
  trustText: {
    fontSize: isWeb ? 14 : 13,
    color: '#666',
    fontWeight: '500',
  },

  // CTA Section
  ctaSection: {
    backgroundColor: '#667eea',
    padding: isWeb ? 50 : 35,
    borderRadius: 20,
    width: '100%',
    maxWidth: isWeb ? 900 : "90%",
    alignItems: 'center',
    marginVertical: isWeb ? 40 : 25,
    ...(isWeb && {
      boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)',
    }),
  },
  ctaTitle: {
    fontSize: isWeb ? 32 : 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: isWeb ? 18 : 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: isWeb ? 40 : 30,
    paddingVertical: isWeb ? 18 : 15,
    borderRadius: 50,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
      }
    }),
  },
  ctaButtonText: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: isWeb ? 18 : 16,
  },

  // Existing styles
  header: { 
    padding: isWeb ? 40 : 20, 
    alignItems: "center",
    width: '100%',
    maxWidth: isWeb ? 800 : '100%',
  },
  logo: { 
    fontSize: isWeb ? 48 : 30, 
    fontWeight: "bold", 
    color: "#1E88E5",
    textAlign: 'center',
  },
  tagline: { 
    fontSize: isWeb ? 20 : 15, 
    color: "#555", 
    marginTop: isWeb ? 12 : 6, 
    textAlign: "center",
    maxWidth: isWeb ? 500 : '100%',
  },

  aboutBox: { 
    backgroundColor: "#fff", 
    marginVertical: isWeb ? 30 : 15, 
    padding: isWeb ? 40 : 20, 
    borderRadius: 16, 
    width: "100%", 
    maxWidth: isWeb ? 800 : "90%", 
    alignItems: "center", 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4,
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      }
    }),
  },
  aboutText: { 
    fontSize: isWeb ? 16 : 14, 
    color: "#444", 
    marginTop: 15, 
    lineHeight: isWeb ? 26 : 20, 
    textAlign: "center",
    maxWidth: isWeb ? 600 : '100%',
  },

  howItWorks: { 
    backgroundColor: "#E8F5E9", 
    marginVertical: isWeb ? 30 : 15, 
    padding: isWeb ? 40 : 20, 
    borderRadius: 16, 
    width: "100%", 
    maxWidth: isWeb ? 800 : "90%", 
    alignItems: "center",
    ...(isWeb && {
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }),
  },
  stepsContainer: {
    width: '100%',
    maxWidth: isWeb ? 600 : '100%',
  },
  step: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginVertical: isWeb ? 16 : 8,
    paddingHorizontal: isWeb ? 20 : 10,
    paddingVertical: isWeb ? 12 : 8,
    backgroundColor: isWeb ? 'rgba(255,255,255,0.6)' : 'transparent',
    borderRadius: isWeb ? 12 : 0,
    ...(isWeb && {
      transition: 'all 0.2s ease',
      cursor: 'default',
      ':hover': {
        backgroundColor: 'rgba(255,255,255,0.8)',
        transform: 'translateX(8px)',
      }
    }),
  },
  stepIcon: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 25,
    padding: 8,
    marginRight: 15,
    ...(isWeb && {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }),
  },
  stepText: { 
    fontSize: isWeb ? 16 : 14, 
    color: "#333", 
    textAlign: "left",
    flex: 1,
    fontWeight: '500',
  },

  sectionTitle: { 
    fontSize: isWeb ? 28 : 22, 
    fontWeight: "bold", 
    marginVertical: isWeb ? 25 : 15, 
    textAlign: "center",
    color: '#2c3e50',
  },

  // Info Icon Styles
  heroTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroInfoIcon: {
    marginLeft: 10,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sectionInfoIcon: {
    marginLeft: 10,
  },
});
