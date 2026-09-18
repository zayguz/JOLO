import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore/lite";
import { auth, db } from "@/FirebaseConfig";

const AuthContext = createContext(null);

/**
 * Creates the user's Firestore profile the first time we see them signed in, so
 * an interrupted sign-up (or an account made outside the app) still gets one.
 */
async function ensureUserProfile({ uid, email, displayName }) {
  const ref = doc(db, "users", uid);
  if ((await getDoc(ref)).exists()) return;

  await setDoc(ref, {
    displayName: displayName ?? "JOLO member",
    avatarPath: null,
    stats: { postCount: 0, cafesVisitedCount: 0, friendCount: 0 },
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, "users", uid, "private", "account"), {
    email,
    settings: {
      notifications: { friendPosts: true, likes: true, comments: true, friendRequests: true },
    },
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        setInitializing(false);
        // Don't block sign-in on this; a failed write is retried next launch.
        if (nextUser) {
          const { uid, email, displayName } = nextUser;
          ensureUserProfile({ uid, email, displayName }).catch((error) => {
            // Not fatal: retried on the next launch. Logged so a failing write
            // is diagnosable instead of silently missing.
            console.warn(`[jolo] profile sync failed: ${error?.code ?? "unknown"} — ${error?.message}`);
          });
        }
      }),
    []
  );

  const value = useMemo(
    () => ({
      user,
      initializing,
      signIn: (email, password) => signInWithEmailAndPassword(auth, email.trim(), password),
      signUp: async (name, email, password) => {
        const { user: created } = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const displayName = name.trim();
        await updateProfile(created, { displayName });
        await ensureUserProfile({ uid: created.uid, email: created.email, displayName }).catch(
          (error) => {
            console.warn(`[jolo] profile create failed: ${error?.code ?? "unknown"} — ${error?.message}`);
          }
        );
      },
      signOut: () => firebaseSignOut(auth),
      resetPassword: (email) => sendPasswordResetEmail(auth, email.trim()),
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
