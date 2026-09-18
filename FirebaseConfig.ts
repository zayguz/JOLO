import { Platform } from "react-native";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  type Auth,
  type Persistence,
} from "firebase/auth";
import * as firebaseAuth from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.warn(
    "Firebase is not configured. Copy .env.example to .env, fill in your " +
      "project's values, and restart the dev server with `npx expo start -c`."
  );
}

// Metro re-evaluates modules on fast refresh, so guard against double init.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// getReactNativePersistence only exists in the React Native bundle of
// firebase/auth, and it is missing from the published type definitions.
const { getReactNativePersistence } = firebaseAuth as unknown as {
  getReactNativePersistence: (storage: unknown) => Persistence;
};

function createAuth(): Auth {
  // On web, getAuth() already persists the session in localStorage.
  if (Platform.OS === "web") return getAuth(app);

  try {
    // Without AsyncStorage, React Native falls back to in-memory persistence
    // and the user is signed out every time the app restarts.
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Only a repeat initialization is safe to swallow — anything else (a bad
    // API key, say) should surface instead of being retried and rethrown.
    if ((error as { code?: string })?.code !== "auth/already-initialized") {
      throw error;
    }

    return getAuth(app);
  }
}

export const auth = createAuth();

// Point at a local Auth emulator when one is configured, so development and
// testing never touch real accounts. Example: localhost:9099
const emulatorHost = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;

if (emulatorHost) {
  connectAuthEmulator(auth, `http://${emulatorHost}`, { disableWarnings: true });
}
