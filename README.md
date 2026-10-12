# JOLO

A café-finder and coffee-social app for iOS and Android, built with Expo Router, React Native, and Firebase. Sign in, find independent coffee shops near you on a live map, and see what people are drinking.

The café directory is seeded from OpenStreetMap and currently covers **Union County, New Jersey** (71 cafés). The import pipeline works for any county with an OSM boundary.

## Features

| Tab | What it does | Status |
| --- | --- | --- |
| **Finder** | Map and list of nearby cafés, with search, distance from you, open/closed status from parsed opening hours, and one-tap directions in Apple or Google Maps | Live: reads the `cafes` collection in Firestore |
| **Social** | Trending drinks and a feed of drink reviews with a composer for new posts | UI only: uses built-in sample data, and new posts are not saved |
| **Favorites** | Your saved drinks and spots, plus community picks | UI only: uses built-in sample data |
| **Profile** | Your name and email, account settings, sign out | Live: reads from Firebase Auth; most settings rows aren't wired up yet |

Sign-up, sign-in, and password reset use Firebase Authentication (email/password). On first sign-in the app creates a public profile at `users/{uid}` and a private document at `users/{uid}/private/account`.

## Tech stack

- [Expo](https://expo.dev/) SDK 54 with [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing, typed routes)
- React Native 0.81 (New Architecture) and React 19
- Firebase Authentication, and Cloud Firestore through the **Lite SDK** (`firebase/firestore/lite`). The full SDK's streaming transport can't connect from React Native in this setup. See the comment in [FirebaseConfig.ts](FirebaseConfig.ts). Lite does one-shot reads and writes only, so there are no realtime listeners or offline cache. Always import from `firebase/firestore/lite`.
- `react-native-maps` for the map, `expo-location` for the user's position, and `@gorhom/bottom-sheet` for sheets

## Prerequisites

- Node.js 20+ and npm
- The [Expo Go](https://expo.dev/go) app (the quickest way to run on a physical device), or Xcode / Android Studio for `npm run ios` / `npm run android`
- A [Firebase](https://console.firebase.google.com/) project with **Authentication (Email/Password provider)** and **Firestore** enabled
- Optional: the [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`) to deploy `firestore.rules` and run the local emulators

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template, then fill in your Firebase web app's config. You'll find it in the Firebase console under Project settings → General → Your apps → Web app → SDK setup and configuration.

   ```bash
   cp .env.example .env.local
   ```

   Expo loads `.env`, `.env.local`, and `.env.*.local` automatically. All of them are git-ignored, but `.env.local` makes it clear the copy is yours. If a value is missing, the app throws an error naming it at startup. Restart Expo after you edit the file.

3. Start the dev server:

   ```bash
   npm start
   ```

   Then open the project in Expo Go, or run `npm run ios` / `npm run android` for a native build.

> The Finder map uses `react-native-maps`, which targets iOS and Android. `npm run web` is available, but web isn't a supported target for the map.

## Firebase setup

- **Auth**: in the Firebase console, enable the Email/Password sign-in provider (Authentication → Sign-in method).
- **Firestore**: create a database in production mode, then deploy [firestore.rules](firestore.rules):

  ```bash
  firebase login
  firebase use --add          # pick your Firebase project (once per machine)
  firebase deploy --only firestore:rules
  ```

  The rules allow:

  | Path | Read | Write |
  | --- | --- | --- |
  | `cafes/{cafeId}` | Anyone | Nobody. Only the upload script writes, through the Admin SDK |
  | `users/{uid}` | Signed-in users | The owner (create/update; no deletes) |
  | `users/{uid}/private/{doc}` | The owner | The owner |
  | Everything else | Nobody | Nobody |

- **Local emulators** (optional, so testing doesn't touch real user data): `firebase emulators:start` uses [firebase.json](firebase.json), with Auth on port 9099, Firestore on port 8080, and the Emulator UI enabled.

## Seeding café data

The Finder reads from the Firestore `cafes` collection. Seeding has two steps: fetch from OpenStreetMap into a JSON file you can review, then upload that file.

### 1. Fetch from OpenStreetMap

```bash
node scripts/cafes/fetch-osm-cafes.mjs
```

This queries the [Overpass API](https://overpass-api.de/) for `amenity=cafe`, `shop=coffee`, and coffee-shop `fast_food` within the county boundary. It parses opening hours, flags chains, and writes `data/cafes/union-county-nj.json`. It also prints a report of cafés with unparseable hours or a missing address.

To import a different county, pass its OSM relation ID:

```bash
node scripts/cafes/fetch-osm-cafes.mjs --relation <osm-relation-id> --slug <file-name> --label "<Display Name>"
```

Set `OVERPASS_URL` to use a different Overpass endpoint.

Put manual corrections in [data/cafes/overrides.json](data/cafes/overrides.json), keyed by café ID. The fetch script re-applies them on every run.

```json
{
  "osm-node-123": { "name": "Corrected Name", "website": "https://example.com" },
  "osm-node-456": { "hoursRaw": "Mo-Fr 07:00-15:00" },
  "osm-node-789": { "exclude": true, "reason": "Campus café, not open to the public" }
}
```

### 2. Upload to Firestore

You need a service account key. Generate one in the Firebase console under Project settings → Service accounts → Generate new private key. Files named `service-account*.json` are git-ignored; never commit one.

```bash
node scripts/cafes/upload-cafes.mjs --service-account ./service-account.json --dry-run
node scripts/cafes/upload-cafes.mjs --service-account ./service-account.json
```

Use `--file <path>` to upload a seed file other than the Union County one. You can set `GOOGLE_APPLICATION_CREDENTIALS` instead of passing `--service-account`.

New cafés start with zeroed counters (`ratingSum`, `ratingCount`, `postCount`, `favoriteCount`). Re-running the upload refreshes only the OSM-sourced fields of existing cafés, so their ratings and counts are never overwritten.

## Project structure

```
app/
  _layout.jsx           Root layout: fonts, auth gate, providers
  (login)/              Signed-out screens: sign in, register, forgot password
  main/                 Signed-in tabs: Finder (index), Social, Favorites, Profile
components/             Shared UI (notifications panel, themed text/view, tab icons)
constants/              Design tokens (Colors, Typography)
hooks/                  useCafes (Firestore), useUserLocation (expo-location)
lib/                    Auth context, Firebase error messages, geo and opening-hours helpers
data/cafes/             Seed data and manual overrides
scripts/cafes/          OSM fetch → review → Firestore upload pipeline
FirebaseConfig.ts       Firebase app, Auth (persisted with AsyncStorage), and Firestore Lite
firestore.rules         Firestore security rules
firebase.json           Firebase CLI and emulator config
```

The `@/` import alias points to the project root (see `babel.config.js` and `tsconfig.json`).

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run ios` | Build and run on iOS (`expo run:ios`) |
| `npm run android` | Build and run on Android (`expo run:android`) |
| `npm run web` | Start the Expo web dev server |

## Data attribution

Café data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the [Open Database License (ODbL 1.0)](https://opendatacommons.org/licenses/odbl/).
