import { useColorScheme } from "@/hooks/useColorScheme";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import {
    createUserWithEmailAndPassword,
    reload,
    signInWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { auth } from "../../config/firebase";
import { useUserRole } from "../../contexts/UserRoleContext";

const { width: screenWidth } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallScreen = screenWidth < 380;

export default function AuthPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { setUserRole } = useUserRole();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Web "5-inch" viewport tuning (mobile browser/device mode)
  const isWebMobileViewport = isWeb && windowWidth <= 430;
  const isWebShortViewport = isWebMobileViewport && windowHeight <= 700;
  const isWebUltraShortViewport = isWebMobileViewport && windowHeight <= 620;

  const [user, loading, error] = useAuthState(auth);

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("applicant");

  useEffect(() => {
    const requestedMode = route?.params?.mode;
    if (requestedMode === "login" || requestedMode === "register") {
      setMode(requestedMode);
    }
  }, [route?.params?.mode]);

  useEffect(() => {
    if (user) {
      // Add a small delay to ensure profile is fully updated
      setTimeout(() => {
        navigation.replace("Drawer");
      }, 100);
    }
  }, [user]);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      if (isWeb) {
        alert("Please fill all fields.");
      } else {
        Alert.alert("Error", "Please fill all fields.");
      }
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (isWeb) {
        alert("Login Failed: " + error.message);
      } else {
        Alert.alert("Login Failed", error.message);
      }
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      if (isWeb) {
        alert("Please fill all fields.");
      } else {
        Alert.alert("Error", "Please fill all fields.");
      }
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword,
      );
      await updateProfile(userCredential.user, {
        displayName: registerName,
        photoURL: registerRole, // Using photoURL to store role temporarily
      });

      // Reload user to ensure profile changes are reflected
      await reload(userCredential.user);

      // Immediately set the role in context for instant UI update
      setUserRole(registerRole);

      // Force a small delay to ensure the profile is fully updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Registration error:", error);
      if (isWeb) {
        alert("Registration Failed: " + error.message);
      } else {
        Alert.alert("Registration Failed", error.message);
      }
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isWebShortViewport && styles.containerWebShort,
        isWebUltraShortViewport && styles.containerWebUltraShort,
        isDarkMode && { backgroundColor: "#121212" },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.contentWrapper,
          isWebShortViewport && styles.contentWrapperWebShort,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            isWebShortViewport && styles.iconContainerWebShort,
          ]}
        >
          <View
            style={[
              styles.logoContainer,
              isWebShortViewport && styles.logoContainerWebShort,
            ]}
          >
            <Image
              source={require("../../assets/images/Logo.jpeg")}
              style={[styles.logo, isWebShortViewport && styles.logoWebShort]}
              resizeMode="contain"
            />
          </View>
        </View>
        <Text
          style={[
            styles.title,
            isWebShortViewport && styles.titleWebShort,
            isDarkMode && { color: "#fff" },
          ]}
        >
          Welcome to Finji
        </Text>

        {/* Tabs */}
        <View
          style={[
            styles.tabContainer,
            isWebShortViewport && styles.tabContainerWebShort,
          ]}
        >
          <TouchableOpacity
            onPress={() => setMode("login")}
            style={[styles.tab, mode === "login" && styles.activeTabBackground]}
          >
            <Text
              style={[
                styles.tabText,
                isWebShortViewport && styles.tabTextWebShort,
                mode === "login" && styles.activeTabText,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("register")}
            style={[
              styles.tab,
              mode === "register" && styles.activeTabBackground,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                isWebShortViewport && styles.tabTextWebShort,
                mode === "register" && styles.activeTabText,
              ]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Forms */}
        {mode === "login" ? (
          <View
            style={[styles.form, isWebShortViewport && styles.formWebShort]}
          >
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="name@example.com"
              style={styles.input}
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="••••••••"
              secureTextEntry
              style={styles.input}
              value={loginPassword}
              onChangeText={setLoginPassword}
            />
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogin}
              style={styles.button}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[styles.form, isWebShortViewport && styles.formWebShort]}
          >
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="John Doe"
              style={styles.input}
              value={registerName}
              onChangeText={setRegisterName}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="name@example.com"
              style={styles.input}
              value={registerEmail}
              onChangeText={setRegisterEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="••••••••"
              secureTextEntry
              style={styles.input}
              value={registerPassword}
              onChangeText={setRegisterPassword}
            />
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                onPress={() => setRegisterRole("investor")}
                style={[
                  styles.roleButton,
                  registerRole === "investor" && styles.activeRoleButton,
                ]}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    registerRole === "investor" && styles.activeRoleButtonText,
                  ]}
                >
                  Investor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRegisterRole("applicant")}
                style={[
                  styles.roleButton,
                  registerRole === "applicant" && styles.activeRoleButton,
                ]}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    registerRole === "applicant" && styles.activeRoleButtonText,
                  ]}
                >
                  Applicant
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleRegister}
              style={styles.button}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create account</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: isWeb ? 28 : isSmallScreen ? 16 : 20,
    paddingTop: isWeb ? 32 : isSmallScreen ? 18 : 34,
    // Extra bottom space so the last items never look "cut off" on short screens
    paddingBottom: isWeb ? 24 : isSmallScreen ? 44 : 36,
    backgroundColor: "#fff",
    minHeight: "100%",
  },
  // Compact web-mobile viewport (helps fit all content on ~5" screens)
  containerWebShort: {
    padding: 14,
    paddingTop: 10,
    paddingBottom: 18,
  },
  containerWebUltraShort: {
    paddingTop: 8,
    paddingBottom: 14,
  },
  contentWrapper: {
    maxWidth: isWeb ? 420 : "100%",
    width: "100%",
    alignSelf: "center",
  },
  contentWrapperWebShort: {
    maxWidth: 360,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: isWeb ? 12 : isSmallScreen ? 6 : 10,
  },
  iconContainerWebShort: {
    marginBottom: 4,
  },
  logoContainer: {
    backgroundColor: "#e6f0ff",
    padding: isWeb ? 12 : isSmallScreen ? 10 : 12,
    borderRadius: 999,
    ...(isWeb && {
      transition: "transform 0.2s ease",
      cursor: "default",
      ":hover": {
        transform: "scale(1.05)",
      },
    }),
  },
  logoContainerWebShort: {
    padding: 8,
  },
  logo: {
    width: isWeb ? 64 : isSmallScreen ? 52 : 60,
    height: isWeb ? 64 : isSmallScreen ? 52 : 60,
    borderRadius: isWeb ? 32 : isSmallScreen ? 26 : 30,
  },
  logoWebShort: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  title: {
    fontSize: isWeb ? 26 : isSmallScreen ? 20 : 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: isWeb ? 16 : isSmallScreen ? 12 : 18,
  },
  titleWebShort: {
    fontSize: 20,
    marginBottom: 10,
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: isWeb ? 14 : isSmallScreen ? 14 : 18,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    ...(isWeb && {
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }),
  },
  tabContainerWebShort: {
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: isWeb ? 12 : isSmallScreen ? 10 : 12,
    alignItems: "center",
    borderRadius: 12,
    cursor: isWeb ? "pointer" : "default",
    transition: isWeb ? "all 0.2s ease" : undefined,
    ...(isWeb && {
      ":hover": {
        backgroundColor: "#e0e0e0",
      },
    }),
  },
  activeTabBackground: {
    backgroundColor: "#e6f0ff",
  },
  tabText: {
    fontSize: isWeb ? 15 : isSmallScreen ? 14 : 15,
    color: "#6c757d",
    fontWeight: "600",
  },
  tabTextWebShort: {
    fontSize: 13,
  },
  activeTabText: {
    color: "#007bff",
  },
  label: {
    marginBottom: isWeb ? 8 : isSmallScreen ? 4 : 6,
    fontWeight: "500",
    color: "#212529",
    fontSize: isWeb ? 14 : isSmallScreen ? 13 : 14,
  },
  form: {
    marginBottom: isWeb ? 16 : isSmallScreen ? 14 : 20,
  },
  formWebShort: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#fff",
    padding: isWeb ? 12 : isSmallScreen ? 10 : 12,
    borderRadius: 8,
    marginBottom: isWeb ? 12 : isSmallScreen ? 10 : 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    fontSize: isWeb ? 14 : 16,
    ...(isWeb && {
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      cursor: "text",
      ":focus": {
        borderColor: "#007bff",
        boxShadow: "0 0 0 3px rgba(0,123,255,0.1)",
      },
    }),
  },
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: isWeb ? 14 : isSmallScreen ? 10 : 14,
  },
  forgotPasswordText: {
    color: "#007bff",
    fontSize: isWeb ? 13 : isSmallScreen ? 12 : 13,
    cursor: isWeb ? "pointer" : "default",
    ...(isWeb && {
      transition: "color 0.2s ease",
      ":hover": {
        color: "#0056b3",
        textDecoration: "underline",
      },
    }),
  },
  button: {
    backgroundColor: "#cce0ff",
    padding: isWeb ? 14 : isSmallScreen ? 12 : 14,
    borderRadius: 8,
    alignItems: "center",
    cursor: isWeb ? "pointer" : "default",
    transition: isWeb ? "all 0.2s ease" : undefined,
    ...(isWeb && {
      ":hover": {
        backgroundColor: "#b3d9ff",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 12px rgba(0,123,255,0.2)",
      },
      ":active": {
        transform: "translateY(0)",
      },
    }),
  },
  buttonText: {
    color: "#007bff",
    fontWeight: "bold",
    fontSize: isWeb ? 15 : isSmallScreen ? 14 : 16,
  },
  updateText: {
    marginTop: 16,
    fontSize: 12,
    textAlign: "center",
    color: "#6c757d",
  },
  roleContainer: {
    flexDirection: "row",
    marginBottom: isWeb ? 16 : isSmallScreen ? 10 : 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: isWeb ? 12 : isSmallScreen ? 9 : 10,
    paddingHorizontal: isWeb ? 16 : isSmallScreen ? 10 : 12,
    alignItems: "center",
    borderRadius: 6,
    cursor: isWeb ? "pointer" : "default",
    transition: isWeb ? "all 0.2s ease" : undefined,
    ...(isWeb && {
      ":hover": {
        backgroundColor: "#e0e0e0",
      },
    }),
  },
  activeRoleButton: {
    backgroundColor: "#e6f0ff",
  },
  roleButtonText: {
    fontSize: isWeb ? 14 : isSmallScreen ? 12 : 13,
    color: "#6c757d",
    fontWeight: "600",
  },
  activeRoleButtonText: {
    color: "#007bff",
  },
});
