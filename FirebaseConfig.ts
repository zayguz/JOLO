import { Platform } from "react-native";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
// The Lite SDK talks to Firestore over ordinary HTTPS requests. The full SDK's
// streaming transport (WebChannel) cannot connect from React Native here — it
// fails with "RPC 'Listen' stream transport errored" and the client stays
// offline, even with experimentalForceLongPolling. Lite has no realtime
// listeners or offline cache; the app only does one-shot reads and writes.
// Import Firestore from "firebase/firestore/lite" everywhere: mixing the two
// SDKs in one app is not supported.
import { getFirestore } from "firebase/firestore/lite";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Values come from .env.local (see .env.example). Expo only inlines EXPO_PUBLIC_*
// variables when they are read with direct property access, so list each one.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);
if (missing.length > 0) {
  throw new Error(
    `Firebase config is missing: ${missing.join(", ")}. ` +
      "Copy .env.example to .env.local, fill in the values, and restart Expo."
  );
}

// Reuse the existing instances on Fast Refresh instead of initializing twice.
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth(): Auth {
  if (Platform.OS === "web") return getAuth(app);
  try {
    // Keeps users signed in between app launches on iOS/Android.
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
