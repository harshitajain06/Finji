import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
    ActivityIndicator, Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { auth } from '../../config/firebase';

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function AuthPage() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [user, loading, error] = useAuthState(auth);

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigation.replace('Drawer');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      if (isWeb) {
        alert('Please fill all fields.');
      } else {
        Alert.alert('Error', 'Please fill all fields.');
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
        alert('Login Failed: ' + error.message);
      } else {
        Alert.alert('Login Failed', error.message);
      }
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      if (isWeb) {
        alert('Please fill all fields.');
      } else {
        Alert.alert('Error', 'Please fill all fields.');
      }
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      await updateProfile(userCredential.user, {
        displayName: registerName,
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (isWeb) {
        alert('Registration Failed: ' + error.message);
      } else {
        Alert.alert('Registration Failed', error.message);
      }
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isDarkMode && { backgroundColor: '#121212' },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contentWrapper}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🛡️</Text>
          </View>
        </View>
        <Text style={[styles.title, isDarkMode && { color: '#fff' }]}>
          Welcome to Finji
        </Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setMode('login')}
            style={[styles.tab, mode === 'login' && styles.activeTabBackground]}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('register')}
            style={[styles.tab, mode === 'register' && styles.activeTabBackground]}
          >
            <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Forms */}
        {mode === 'login' ? (
          <View style={styles.form}>
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
            <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
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
            <TouchableOpacity onPress={handleRegister} style={styles.button} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* OAuth Buttons */}
        <OAuthButtons />

        <TouchableOpacity>
          <Text style={styles.privacyPolicy}>Privacy Policy.</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function OAuthButtons() {
  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 12, color: '#6c757d' }}>Or continue with</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <TouchableOpacity style={styles.oauthButton} onPress={() => alert('Facebook login coming soon')}>
          <Text style={styles.oauthButtonText}>Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oauthButton} onPress={() => alert('Google login coming soon')}>
          <Text style={styles.oauthButtonText}>Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: isWeb ? 40 : 24,
    paddingTop: isWeb ? 80 : 60,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  contentWrapper: {
    maxWidth: isWeb ? 500 : '100%',
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: isWeb ? 24 : 16,
  },
  iconCircle: {
    backgroundColor: '#e6f0ff',
    padding: isWeb ? 16 : 12,
    borderRadius: 999,
    ...(isWeb && {
      transition: 'transform 0.2s ease',
      cursor: 'default',
      ':hover': {
        transform: 'scale(1.05)',
      }
    }),
  },
  icon: {
    fontSize: isWeb ? 40 : 32,
    color: '#007bff',
  },
  title: {
    fontSize: isWeb ? 32 : 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: isWeb ? 40 : 30,
  },
  
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: isWeb ? 32 : 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    ...(isWeb && {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: isWeb ? 16 : 12,
    alignItems: 'center',
    borderRadius: 12,
    cursor: isWeb ? 'pointer' : 'default',
    transition: isWeb ? 'all 0.2s ease' : undefined,
    ...(isWeb && {
      ':hover': {
        backgroundColor: '#e0e0e0',
      }
    }),
  },
  activeTabBackground: {
    backgroundColor: '#e6f0ff',
  },
  tabText: {
    fontSize: isWeb ? 18 : 16,
    color: '#6c757d',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#007bff',
  },
  label: {
    marginBottom: isWeb ? 8 : 6,
    fontWeight: '500',
    color: '#212529',
    fontSize: isWeb ? 16 : 14,
  },
  form: {
    marginBottom: isWeb ? 40 : 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: isWeb ? 16 : 12,
    borderRadius: 8,
    marginBottom: isWeb ? 16 : 12,
    borderWidth: 1,
    borderColor: '#ced4da',
    fontSize: isWeb ? 16 : 16,
    ...(isWeb && {
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      cursor: 'text',
      ':focus': {
        borderColor: '#007bff',
        boxShadow: '0 0 0 3px rgba(0,123,255,0.1)',
      }
    }),
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: isWeb ? 20 : 16,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: isWeb ? 14 : 13,
    cursor: isWeb ? 'pointer' : 'default',
    ...(isWeb && {
      transition: 'color 0.2s ease',
      ':hover': {
        color: '#0056b3',
        textDecoration: 'underline',
      }
    }),
  },
  button: {
    backgroundColor: '#cce0ff',
    padding: isWeb ? 18 : 14,
    borderRadius: 8,
    alignItems: 'center',
    cursor: isWeb ? 'pointer' : 'default',
    transition: isWeb ? 'all 0.2s ease' : undefined,
    ...(isWeb && {
      ':hover': {
        backgroundColor: '#b3d9ff',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,123,255,0.2)',
      },
      ':active': {
        transform: 'translateY(0)',
      }
    }),
  },
  buttonText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: isWeb ? 18 : 16,
  },
  oauthButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingVertical: isWeb ? 14 : 12,
    paddingHorizontal: isWeb ? 12 : 10,
    flex: 1,
    alignItems: 'center',
    cursor: isWeb ? 'pointer' : 'default',
    transition: isWeb ? 'all 0.2s ease' : undefined,
    ...(isWeb && {
      ':hover': {
        backgroundColor: '#f8f9fa',
        borderColor: '#007bff',
        transform: 'translateY(-1px)',
      }
    }),
  },
  oauthButtonText: {
    fontSize: isWeb ? 15 : 14,
    fontWeight: '600',
    color: '#343a40',
  },
  updateText: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
    color: '#6c757d',
  },
  privacyPolicy: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: isWeb ? 13 : 12,
    color: '#007bff',
    textDecorationLine: 'underline',
    cursor: isWeb ? 'pointer' : 'default',
    ...(isWeb && {
      transition: 'color 0.2s ease',
      ':hover': {
        color: '#0056b3',
      }
    }),
  },
});
