# JOLO

A café-finder and coffee-social app built with Expo Router, React Native, and Firebase. Sign in, browse nearby cafés on a live map (seeded from OpenStreetMap), and share what you're drinking.

See [docs/ROADMAP.md](docs/ROADMAP.md) for what's left before launch.

## Prerequisites

- Node.js 20+ and npm
- Xcode (iOS Simulator) and/or Android Studio, to build the development app. The app runs as a [development build](https://docs.expo.dev/develop/development-builds/introduction/), not in Expo Go, because it uses native Firebase modules ([React Native Firebase](https://rnfirebase.io/)). iOS, Android only; there is no web build.
- Access to the JOLO Firebase projects (below)
- An [Expo](https://expo.dev/) account for cloud builds (`npx eas-cli login`)
- Java 21+ (e.g. `brew install --cask temurin@21`) to run the Firestore emulator and `npm run test:rules`

## Environments

`APP_VARIANT` selects the environment. It defaults to `development`.

| `APP_VARIANT` | App name | Bundle ID / package | Firebase project (`.firebaserc` alias) |
| --- | --- | --- | --- |
| `development` | JOLO (Dev) | `com.zayguz.jolo.dev` | `jolo-ec76d` (`dev`) |
| `production` | JOLO | `com.zayguz.jolo` | not set up yet (`prod`) |

The two apps install side by side, and a dev build never talks to the production project.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Put the dev project's native config files (Firebase console → `jolo-ec76d` → Project settings → Your apps → the `com.zayguz.jolo.dev` apps) at `firebase/dev/GoogleService-Info.plist` and `firebase/dev/google-services.json`, named exactly that. The whole `firebase/` folder is git-ignored. The app reads its Firebase project from these files; there is no `.env` file to fill in. A production build (`APP_VARIANT=production`) reads `firebase/prod/` instead.

3. Build and launch the development app (the first build takes a few minutes):

   ```bash
   npm run ios
   ```

   Use `npm run android` for Android. After the first build, `npm start` is enough until native dependencies change.

   If `pod install` fails with `Unicode Normalization not appropriate for ASCII-8BIT`, your shell has no UTF-8 locale. Add `export LANG=en_US.UTF-8` to `~/.zshrc` and open a new terminal.

### Cloud builds (EAS)

Profiles live in [eas.json](eas.json): `development` (dev client on a device), `development-simulator`, `preview` (internal testing against production), and `production` (store builds). EAS builds can't see the git-ignored `firebase/` folder, so upload the config files as file environment variables for each EAS environment. [app.config.js](app.config.js) reads them from `GOOGLE_SERVICES_PLIST` and `GOOGLE_SERVICES_JSON`:

```bash
npx eas-cli env:create --environment development --type file --visibility sensitive --name GOOGLE_SERVICES_PLIST --value ./firebase/dev/GoogleService-Info.plist
```

```bash
npx eas-cli env:create --environment development --type file --visibility sensitive --name GOOGLE_SERVICES_JSON --value ./firebase/dev/google-services.json
```

Then build:

```bash
npx eas-cli build --profile development --platform android
```

## Firebase setup

- **Auth**: enable the Email/Password sign-in provider (Authentication → Sign-in method).
- **Firestore**: create a database in production mode, then deploy [firestore.rules](firestore.rules). Commands default to the dev project; target production explicitly with `-P prod`:

  ```bash
  npx firebase login
  npx firebase deploy --only firestore:rules
  ```

- **Local emulators** (optional, for testing without touching real user data): `npx firebase emulators:start` uses the config in [firebase.json](firebase.json) (Auth on port 9099, Firestore on port 8080).

## Seeding café data

The Finder tab reads from a `cafes` collection in Firestore, seeded from OpenStreetMap in two steps:

1. **Fetch** cafés for a county into a reviewable JSON file:

   ```bash
   node scripts/cafes/fetch-osm-cafes.mjs
   ```

   This writes `data/cafes/union-county-nj.json`. Manual corrections (a wrong name, a missing website) go in [data/cafes/overrides.json](data/cafes/overrides.json) and are re-applied every time the fetch script runs.

2. **Upload** the reviewed seed file to Firestore using a service account key (Firebase console → Project settings → Service accounts → Generate new private key — this file is git-ignored, never commit it):

   ```bash
   node scripts/cafes/upload-cafes.mjs --service-account ./service-account.json --dry-run
   node scripts/cafes/upload-cafes.mjs --service-account ./service-account.json
   ```

   Use the service account key of the project you're seeding: dev first, prod once it exists. Re-running the upload only refreshes OSM-sourced fields (name, hours, address) — ratings, post counts, and favorite counts on existing cafés are never overwritten.

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
| `npm start` | Start the dev server for an installed development build |
| `npm run ios` | Build and run the development app on iOS (`expo run:ios`) |
| `npm run android` | Build and run the development app on Android (`expo run:android`) |
| `npm run lint` | Lint with ESLint (`eslint-config-expo`) |
| `npm run format` | Format with Prettier (`format:check` to verify only) |
| `npm run typecheck` | Type-check the TypeScript files |
| `npm test` | Run the unit tests (Jest) |
| `npm run test:rules` | Test `firestore.rules` against the Firestore emulator (needs Java 21+) |

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs all of these checks, plus `expo-doctor` and an app config check for each variant, on every pull request.
