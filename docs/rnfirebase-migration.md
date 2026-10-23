# Migration plan: Firestore Lite → React Native Firebase

Decided 2026-10-23 (roadmap items 6 and 12). **Starts once the `jolo-dev` and `jolo-prod` Firebase projects exist** (Part 0).

## Why

- **App Check (roadmap item 26)** needs native device attestation (App Attest on iOS, Play Integrity on Android). The JavaScript SDK can't do it in React Native.
- **Realtime and offline:** `onSnapshot` listeners for the feed, likes, comments, and notifications. The local cache keeps the app usable on a weak connection and cuts billed reads. Firestore Lite has neither.
- **Expo Go is going away anyway.** Remote push from `expo-notifications` doesn't work in Expo Go, and the Android Maps key needs a real build. So the main cost of React Native Firebase, needing dev builds, is coming regardless.
- **It's cheapest now.** Only [FirebaseConfig.ts](../FirebaseConfig.ts), [lib/auth.jsx](../lib/auth.jsx), and [hooks/useCafes.js](../hooks/useCafes.js) touch Firebase. Its modular API uses the same function names (`getDoc`, `setDoc`, `onAuthStateChanged`…), so most of the change is in imports and setup.

**What we give up:** Expo Go (use `npx expo run:ios` or an EAS dev build instead), and web support.

## Target setup

| | Development | Production |
|---|---|---|
| Firebase project | `jolo-dev` | `jolo-prod` |
| `APP_VARIANT` | `development` | `production` |
| App name | JOLO (Dev) | JOLO |
| iOS bundle ID / Android package | `com.zayguz.jolo.dev` | `com.zayguz.jolo` |
| Native config files | `firebase/dev/` | `firebase/prod/` |
| EAS build profiles | `development` | `preview`, `production` |

Different bundle IDs let the dev and prod apps sit side by side on one phone, and make it impossible for a dev build to write to production data.

The repo is **public**, so `GoogleService-Info.plist` and `google-services.json` stay out of git. They aren't secrets, but there's no reason to publish them. Locally they live in git-ignored `firebase/dev/` and `firebase/prod/` folders. EAS builds get them from [file environment variables](https://docs.expo.dev/eas/environment-variables/).

---

## Part 0: Your setup (Firebase console, Expo, Apple)

- [ ] **Create two Firebase projects:** `jolo-dev` and `jolo-prod`. In each one:
  - [ ] Authentication → Sign-in method → enable **Email/Password**.
  - [ ] Firestore → create database in **production mode**. Pick the **same location in both** (e.g. `nam5`). It can't be changed later.
  - [ ] Project settings → add an **iOS app**: `com.zayguz.jolo.dev` in dev, `com.zayguz.jolo` in prod. Download `GoogleService-Info.plist`.
  - [ ] Add an **Android app** with the same IDs. Download `google-services.json`.
  - [ ] Turn on **billing budget alerts** (Usage and billing). The Spark plan has no bill, but set alerts before moving to Blaze.
- [ ] **Put the four config files** at `firebase/dev/GoogleService-Info.plist`, `firebase/dev/google-services.json`, `firebase/prod/GoogleService-Info.plist`, `firebase/prod/google-services.json`.
- [ ] **Expo account:** sign up at expo.dev, then run `npx eas-cli login`.
- [ ] **Apple Developer Program** ($99/yr) to install builds on a real iPhone. The iOS Simulator works without it.
- [ ] **Hand-off:** send Claude the two project IDs.

## Part 1: Environments and dev builds (PR A, still on the JS SDK)

Get dev builds working **before** swapping the SDK. Then a build failure and an SDK bug can't be mistaken for each other.

- [ ] Replace `app.json` with `app.config.js`, which reads `APP_VARIANT` to set the name, bundle ID, package, and `googleServicesFile` paths. Local builds default to `development`. EAS builds read the file paths from env vars (`GOOGLE_SERVICES_PLIST`, `GOOGLE_SERVICES_JSON`).
- [ ] Git-ignore `firebase/*/`. Add `.firebaserc` with `dev` and `prod` aliases.
- [ ] Deploy the rules to both projects: `npx firebase deploy --only firestore:rules -P dev`, and the same with `-P prod`.
- [ ] Seed cafés into each project with [upload-cafes.mjs](../scripts/cafes/upload-cafes.mjs), using that project's service account key (git-ignored).
- [ ] `npx expo install expo-dev-client`. Add `eas.json` with these profiles:
  - `development`: `developmentClient: true`, internal distribution, `APP_VARIANT=development`, plus a simulator variant for iOS
  - `preview`: internal distribution against `jolo-prod`, for TestFlight-style testing
  - `production`: store builds with `autoIncrement`
- [ ] Run `npx eas-cli init` to add the EAS `projectId`. Upload the config files as EAS file env vars, one set per environment.
- [ ] Build and smoke-test the dev client: `npx expo run:ios` on the simulator, plus an EAS `development` build on an Android phone.
- [ ] Update the README: Expo Go is gone, plus the new setup steps.

## Part 2: Swap the SDK (PR B)

- [ ] `npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore expo-build-properties` (v27.x at time of writing).
- [ ] Config plugins: `"@react-native-firebase/app"`, `"@react-native-firebase/auth"`, `["expo-build-properties", { "ios": { "useFrameworks": "dynamic" } }]`.
  - ⚠️ **Riskiest step.** The current [RNFirebase Expo docs](https://rnfirebase.io/) use **dynamic** frameworks. The Firebase iOS SDK 13+ installs through Swift Package Manager (SPM), and static frameworks break SPM mode ([invertase/react-native-firebase#9161](https://github.com/invertase/react-native-firebase/issues/9161)). If `react-native-maps` or another pod won't build with dynamic frameworks, the fallback is static frameworks plus `forceStaticLinking` for the `RNFB*` pods, with SPM disabled.
  - Uninstall any dev build made before this step. A stale one fails with `RNFBAppModule not found`.
- [ ] **[FirebaseConfig.ts](../FirebaseConfig.ts):** the native SDK reads the config files, so remove the `EXPO_PUBLIC_FIREBASE_*` env vars, the missing-config check, the AsyncStorage persistence (auth persists natively), and the Lite comment. Export `getAuth()` and `getFirestore()` from `@react-native-firebase/*`.
- [ ] **[lib/auth.jsx](../lib/auth.jsx):** swap the imports to the `@react-native-firebase/auth` and `/firestore` modular APIs. Check whether `snapshot.exists` is a method or a property in the installed version.
- [ ] **[hooks/useCafes.js](../hooks/useCafes.js):** same import swap. Keep a one-time `getDocs` (cafés rarely change); it now benefits from the offline cache.
- [ ] **Clean up:**
  - Move `firebase` to `devDependencies`; the rules tests still use the JS SDK against the emulator.
  - Remove `@react-native-async-storage/async-storage` if nothing else uses it.
  - Delete [types/firebase-auth-react-native.d.ts](../types/firebase-auth-react-native.d.ts) and the `EXPO_PUBLIC_FIREBASE_*` lines in `.env.example`.
  - Remove the `web` script and web config.
- [ ] Add Jest mocks for `@react-native-firebase/*` in a setup file. Today's unit tests don't import Firebase, but component tests will.
- [ ] CI: add a job that runs `APP_VARIANT=production npx expo config --type public`, to catch broken app config without a full native build.

### Verify on a dev build (against `jolo-dev`)

- [ ] Sign up creates `users/{uid}` and `users/{uid}/private/account` in **jolo-dev**, not prod.
- [ ] Sign in, sign out, and the password-reset email all work.
- [ ] The session survives killing and relaunching the app.
- [ ] Finder loads cafés. Relaunching in airplane mode still shows them (cache).
- [ ] An Android build from EAS works with the same checks.
- [ ] A `production`-profile build points at `jolo-prod` (check the project ID in a debug log or the Firebase console).

## Part 3: After the swap

- [ ] Rebase zayguz/JOLO#4 (Social and Favorites on Firestore) onto the new SDK. It mostly needs import changes, plus fixing conflicts with the Prettier formatting.
- [ ] **Phase 1 data model:** use one-way follows (`users/{uid}/following/{targetUid}`, mirrored to `followers` by a Cloud Function), not friend requests.
- [ ] **Later roadmap items this unlocks:**
  - App Check: `@react-native-firebase/app-check` (item 26)
  - Crashlytics (item 27)
  - Realtime feed and notification lists (items 13 and 17)
