// Metro loads Firebase's React Native auth build, which exports
// getReactNativePersistence, but the package's "types" export condition is listed
// before "react-native", so TypeScript only ever sees the web typings.
import type { Persistence } from "firebase/auth";

declare module "firebase/auth" {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
