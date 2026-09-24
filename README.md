# JOLO

A café-finder and coffee-social app built with Expo Router, React Native, and Firebase. Sign in, browse nearby cafés on a live map (seeded from OpenStreetMap), and share what you're drinking.

## Prerequisites

- Node.js 20+ and npm
- The [Expo Go](https://expo.dev/go) app (for the fastest way to run this on a physical device), or Xcode/Android Studio if you want to run `expo run:ios` / `expo run:android`
- A [Firebase](https://console.firebase.google.com/) project with **Authentication (Email/Password provider)** and **Firestore** enabled
- Optionally, the [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`) to deploy `firestore.rules` and run local emulators

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in your Firebase web app's config values (Firebase console → Project settings → General → Your apps → Web app → SDK setup and configuration):

   ```bash
   cp .env.example .env.local
   ```

   Expo automatically loads `.env`, `.env.local`, and their `.env.*.local` variants — `.env.local` is recommended so it's unambiguously your personal, git-ignored copy.

3. Start the dev server:

   ```bash
   npm start
   ```

   Then open the project in Expo Go, or run `npm run ios` / `npm run android` for a native build.

## Firebase setup

- **Auth**: enable the Email/Password sign-in provider in the Firebase console (Authentication → Sign-in method).
- **Firestore**: create a database (production mode), then deploy the rules in [firestore.rules](firestore.rules) so profiles and café data are locked down correctly:

  ```bash
  firebase login
  firebase use --add          # pick your Firebase project once, per machine
  firebase deploy --only firestore:rules
  ```

- **Local emulators** (optional, for testing without touching real user data): `firebase emulators:start` uses the config in [firebase.json](firebase.json) (Auth on port 9099, Firestore on port 8080).

## Seeding café data

The Finder tab reads from a `cafes` collection in Firestore, seeded from OpenStreetMap in two steps:

1. **Fetch** cafés for a county into a reviewable JSON file:

   ```bash
   node scripts/cafes/fetch-osm-cafes.mjs
   ```

   This writes `data/cafes/union-county-nj.json`. Manual corrections (a wrong name, a missing website) go in [data/cafes/overrides.json](data/cafes/overrides.json) and are re-applied every time the fetch script runs.

2. **Upload** the reviewed seed file to Firestore using a service account key (Firebase console → Project settings → Service accounts → Generate new private key — this file is git-ignored, never commit it):

   ```bash
   npm install --save-dev firebase-admin
   node scripts/cafes/upload-cafes.mjs --service-account ./service-account.json --dry-run
   node scripts/cafes/upload-cafes.mjs --service-account ./service-account.json
   ```

   Re-running the upload only refreshes OSM-sourced fields (name, hours, address) — ratings, post counts, and favorite counts on existing cafés are never overwritten.

## Project structure

```
app/                  Expo Router screens ((login) = signed-out, main = signed-in tabs)
components/           Shared UI components
constants/            Design tokens (Colors, Typography)
hooks/                Data hooks (useCafes, useUserLocation)
lib/                  Auth context, geo/hours helpers, Firebase auth error messages
data/cafes/           Seeded café data + manual overrides
scripts/cafes/        OSM fetch → review → Firestore upload pipeline
firestore.rules        Firestore security rules
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run ios` | Build and run on iOS (`expo run:ios`) |
| `npm run android` | Build and run on Android (`expo run:android`) |
| `npm run web` | Start the Expo web dev server |
