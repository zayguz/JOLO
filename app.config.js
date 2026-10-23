// APP_VARIANT picks the environment: "development" (the default, for local and
// dev-client builds) or "production". Each variant has its own bundle ID, so the
// two apps install side by side and each is registered with its own Firebase
// project. See docs/rnfirebase-migration.md.
const VARIANTS = {
  development: {
    name: "JOLO (Dev)",
    bundleId: "com.zayguz.jolo.dev",
    scheme: "joloapp-dev",
  },
  production: {
    name: "JOLO",
    bundleId: "com.zayguz.jolo",
    scheme: "joloapp",
  },
};

const variantName = process.env.APP_VARIANT ?? "development";
const variant = VARIANTS[variantName];
if (!variant) {
  throw new Error(
    `Unknown APP_VARIANT "${variantName}". Use one of: ${Object.keys(VARIANTS).join(", ")}.`,
  );
}

module.exports = {
  expo: {
    name: variant.name,
    slug: "jolo",
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
    },
    android: {
      package: variant.bundleId,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
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
    },
  },
};
