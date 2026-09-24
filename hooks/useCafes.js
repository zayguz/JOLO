import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "@/FirebaseConfig";

function toCafe(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    municipality: data.municipality,
    address: data.address,
    isChain: data.isChain,
    hours: data.hours,
    website: data.website,
    phone: data.phone,
    amenities: data.amenities,
    coordinate: { latitude: data.location.latitude, longitude: data.location.longitude },
    rating: data.ratingCount > 0 ? data.ratingSum / data.ratingCount : null,
    ratingCount: data.ratingCount ?? 0,
  };
}

// The seeded county is small (~70 cafés), so one read of the whole collection is
// cheaper and simpler than geo queries.
export function useCafes() {
  const [state, setState] = useState({ cafes: [], loading: true, error: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const snapshot = await getDocs(collection(db, "cafes"));
      setState({ cafes: snapshot.docs.map(toCafe), loading: false, error: null });
    } catch (error) {
      setState({ cafes: [], loading: false, error });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
