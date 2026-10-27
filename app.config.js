// APP_VARIANT picks the environment: "development" (the default, for local and
// dev-client builds) or "production". Each variant has its own bundle ID, so the
// two apps install side by side and each is registered with its own Firebase
// project. See docs/rnfirebase-migration.md.
const VARIANTS = {
  development: {
    name: "JOLO (Dev)",
    bundleId: "com.zayguz.jolo.dev",
    scheme: "joloapp-dev",
    firebaseDir: "./firebase/dev",
  },
  production: {
    name: "JOLO",
    bundleId: "com.zayguz.jolo",
    scheme: "joloapp",
    firebaseDir: "./firebase/prod",
  },
};

const variantName = process.env.APP_VARIANT ?? "development";
const variant = VARIANTS[variantName];
if (!variant) {
  throw new Error(
    `Unknown APP_VARIANT "${variantName}". Use one of: ${Object.keys(VARIANTS).join(", ")}.`,
  );
}

// The native Firebase SDK reads its project from these files, which are
// git-ignored. Local builds use firebase/<env>/; EAS builds point these env vars
// at file environment variables instead.
const googleServicesPlist =
  process.env.GOOGLE_SERVICES_PLIST ?? `${variant.firebaseDir}/GoogleService-Info.plist`;
const googleServicesJson =
  process.env.GOOGLE_SERVICES_JSON ?? `${variant.firebaseDir}/google-services.json`;

module.exports = {
  expo: {
    name: variant.name,
    slug: "jolo",
    owner: "zayguz",
    scheme: variant.scheme,
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    experiments: {
      typedRoutes: true,
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: variant.bundleId,
      googleServicesFile: googleServicesPlist,
    },
    android: {
      package: variant.bundleId,
      googleServicesFile: googleServicesJson,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    plugins: [
      "expo-router",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      [
        "expo-build-properties",
        {
          // The Firebase iOS SDK installs through Swift Package Manager, which
          // needs dynamic frameworks. See docs/rnfirebase-migration.md.
          // react-native-maps fails to link as a dynamic framework (undefined
          // React symbols such as RCTViewManager), so it stays static.
          ios: { useFrameworks: "dynamic", forceStaticLinking: ["react-native-maps"] },
        },
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "JOLO uses your location to show cafés near you and how far away they are.",
        },
      ],
    ],
    extra: {
      appVariant: variantName,
      eas: {
        // https://expo.dev/accounts/zayguz/projects/jolo
        projectId: "13890eef-f2aa-4082-b767-001def140411",
      },
    },
  },
};
