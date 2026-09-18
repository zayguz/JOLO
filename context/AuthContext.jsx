import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/FirebaseConfig";

const AuthContext = createContext(null);

// Firebase error codes are not user-facing, so translate the ones a person can
// actually hit. Anything unmapped falls back to a generic message.
const ERROR_MESSAGES = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with that email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/invalid-api-key": "The app is not configured correctly. Check your .env file.",
};

export function getAuthErrorMessage(error) {
  return (
    ERROR_MESSAGES[error?.code] ?? "Something went wrong. Please try again."
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True until Firebase reports the restored session, so we don't flash the
  // login screen at an already signed-in user on cold start.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      signIn: (email, password) =>
        signInWithEmailAndPassword(auth, email.trim(), password),
      signUp: (email, password) =>
        createUserWithEmailAndPassword(auth, email.trim(), password),
      resetPassword: (email) => sendPasswordResetEmail(auth, email.trim()),
      signOut: () => signOut(auth),
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }

  return context;
}
