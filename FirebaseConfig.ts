import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";

// React Native Firebase uses the native iOS and Android SDKs, which read the
// project from GoogleService-Info.plist / google-services.json at build time
// (see app.config.js), so there is no config object here. Sessions persist
// natively, and Firestore keeps an offline cache by default.
export const app = getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
