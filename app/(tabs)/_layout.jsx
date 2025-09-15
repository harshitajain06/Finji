// src/navigation/StackLayout.jsx
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { signOut } from 'firebase/auth';
import React from "react";
import { Alert, Platform } from 'react-native';
import { auth } from "../../config/firebase";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import FundScreen from "./FundScreen";
import HomeScreen from "./HomeScreen";
import PostScreen from "./PostScreen";
import LoginRegister from './index';

const isWeb = Platform.OS === 'web';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Bottom Tab Navigator Component
const BottomTabs = () => {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
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
      <Tab.Screen name="Fund" component={FundScreen} options={{ title: "Fund" }} />
      <Tab.Screen
        name="Post"
        component={PostScreen}
        options={{ title: "Post" }}
      />
    </Tab.Navigator>
  );
};

// Drawer Navigator Component
const DrawerNavigator = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("LoginRegister");
      })
      .catch((err) => {
        console.error("Logout Error:", err);
        if (isWeb) {
          alert("Failed to logout. Please try again.");
        } else {
          Alert.alert("Error", "Failed to logout. Please try again.");
        }
      });
  };

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
      <Drawer.Screen name="MainTabs" component={BottomTabs} options={{ title: 'Home' }} />
      
      <Drawer.Screen
        name="Logout"
        component={BottomTabs}
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
    </Stack.Navigator>
  );
}
