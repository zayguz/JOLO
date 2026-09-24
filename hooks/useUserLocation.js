import { useEffect, useState } from "react";
import * as Location from "expo-location";

/**
 * Asks for foreground location once and resolves the user's position.
 * `coords` stays null if permission is denied or the lookup fails.
 */
export function useUserLocation() {
  const [state, setState] = useState({ status: "pending", coords: null });

  useEffect(() => {
    let cancelled = false;
    const update = (next) => !cancelled && setState(next);

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return update({ status: "denied", coords: null });

      // Show something quickly from the cached fix, then refine.
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) update({ status: "granted", coords: lastKnown.coords });

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      update({ status: "granted", coords: current.coords });
    })().catch(() => {
      // Keep a last-known fix if we got one; otherwise report the lookup as unavailable.
      if (!cancelled) setState((prev) => (prev.coords ? prev : { status: "unavailable", coords: null }));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
