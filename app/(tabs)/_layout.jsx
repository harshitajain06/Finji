// src/navigation/StackLayout.jsx
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { signOut } from 'firebase/auth';
import React from "react";
import { Alert, Platform } from 'react-native';
import NotFoundScreen from "../+not-found";
import { auth } from "../../config/firebase";
import { Colors } from "../../constants/Colors";
import { useUserRole } from "../../contexts/UserRoleContext";
import { useColorScheme } from "../../hooks/useColorScheme";
import ApplicantProfileScreen from "./ApplicantProfileScreen";
import FundScreen from "./FundScreen";
import HomeScreen from "./HomeScreen";
import LoginRegister from './index';
import PostScreen from "./PostScreen";
import ProfileScreen from "./ProfileScreen";

const isWeb = Platform.OS === 'web';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Bottom Tab Navigator Component
const BottomTabs = () => {
  const colorScheme = useColorScheme();
  const { userRole, isLoading, user } = useUserRole();


  // Show loading state while determining user role
  if (isLoading) {
    return null; // or a loading component
  }

  // Force re-render when user role changes by using it in the component key
  const componentKey = `${user?.uid}-${userRole}`;

  return (
    <Tab.Navigator
      key={componentKey} // Force re-render when user role changes
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
          ...(isWeb && {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          }),
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Fund") {
            iconName = focused ? "cash" : "cash-outline";
          } else if (route.name === "Post") {
            iconName = focused ? "create" : "create-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        ...(isWeb && {
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
        }),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      {userRole === 'investor' ? (
        <Tab.Screen name="Fund" component={FundScreen} options={{ title: "Fund" }} />
      ) : (
        <Tab.Screen
          name="Post"
          component={PostScreen}
          options={{ title: "Post" }}
        />
      )}
    </Tab.Navigator>
  );
};

// Drawer Navigator Component
const DrawerNavigator = () => {
  const navigation = useNavigation();
  const { userRole, isLoading } = useUserRole();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Use reset instead of replace to clear the entire navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginRegister' }],
      });
    } catch (err) {
      console.error("Logout Error:", err);
      if (isWeb) {
        alert("Failed to logout. Please try again.");
      } else {
        Alert.alert("Error", "Failed to logout. Please try again.");
      }
    }
  };

  // Show loading state while determining user role
  if (isLoading) {
    return null;
  }

  return (
    <Drawer.Navigator 
      initialRouteName="MainTabs" 
      screenOptions={{
        ...(isWeb && {
          drawerStyle: {
            width: 280,
            backgroundColor: '#fff',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
          },
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '500',
            color: '#333',
          },
          drawerActiveBackgroundColor: '#e6f0ff',
          drawerActiveTintColor: '#007bff',
        }),
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={BottomTabs} 
        options={{ 
          title: `Home (${userRole === 'investor' ? 'Investor' : 'Applicant'})` 
        }} 
      />
      
      {userRole === 'investor' && (
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'My Investments',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      )}
      
      {userRole === 'applicant' && (
        <Drawer.Screen
          name="ApplicantProfile"
          component={ApplicantProfileScreen}
          options={{
            title: 'My Profile & Investors',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
      )}
      
      <Drawer.Screen
        name="Logout"
        component={() => null}
        options={{
          title: 'Logout',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      />
    </Drawer.Navigator>
  );
};

// Stack Navigator Component
export default function StackLayout() {
  const colorScheme = useColorScheme();

  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
            ...(isWeb && {
              minHeight: '100vh',
            }),
          },
        }}
      >
      <Stack.Screen name="LoginRegister" component={LoginRegister} />
        <Stack.Screen name="Drawer" component={DrawerNavigator} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
