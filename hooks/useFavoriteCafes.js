import { useCallback, useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, setDoc, serverTimestamp } from "firebase/firestore/lite";
import { db } from "@/FirebaseConfig";
import { useAuth } from "@/lib/auth";

// Doc ID is the café ID under users/{uid}/favoriteCafes, so presence of the
// doc is the favorite — no fields to read besides which IDs exist.
export function useFavoriteCafes() {
  const { user } = useAuth();
  const [state, setState] = useState({ favoriteIds: new Set(), loading: true, error: null });

  const load = useCallback(async () => {
    if (!user) {
      setState({ favoriteIds: new Set(), loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const snapshot = await getDocs(collection(db, "users", user.uid, "favoriteCafes"));
      setState({ favoriteIds: new Set(snapshot.docs.map((d) => d.id)), loading: false, error: null });
    } catch (error) {
      setState({ favoriteIds: new Set(), loading: false, error });
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavorite = useCallback(
    async (cafeId) => {
      if (!user) return;
      const ref = doc(db, "users", user.uid, "favoriteCafes", cafeId);
      const isFavorite = state.favoriteIds.has(cafeId);

      // Update local state immediately; a failed write is corrected on reload.
      setState((prev) => {
        const next = new Set(prev.favoriteIds);
        isFavorite ? next.delete(cafeId) : next.add(cafeId);
        return { ...prev, favoriteIds: next };
      });

      try {
        if (isFavorite) await deleteDoc(ref);
        else await setDoc(ref, { createdAt: serverTimestamp() });
      } catch (error) {
        setState((prev) => ({ ...prev, error }));
        await load();
      }
    },
    [user, state.favoriteIds, load]
  );

  return { ...state, toggleFavorite, reload: load };
}
