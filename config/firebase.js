import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDUObP3hHjRDHkus6--nheX5xPDLFzNZm0",
  authDomain: "finji-b742e.firebaseapp.com",
  projectId: "finji-b742e",
  storageBucket: "finji-b742e.firebasestorage.app",
  messagingSenderId: "49218151224",
  appId: "1:49218151224:web:d514d9c324a3d97b0257cd",
  measurementId: "G-DSLHMNK19H"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Use correct auth initialization based on platform
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app); // Use standard web auth
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

export const db = getFirestore(app);
export const storage = getStorage(app);
export const usersRef = collection(db, 'users');
