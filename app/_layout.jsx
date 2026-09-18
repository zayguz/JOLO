import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { lightColors, createTheme, ThemeProvider as RNEThemeProvider } from "@rneui/themed";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemedView } from "@/components/ThemedView";

const theme = createTheme({
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.android,
      ios: lightColors.platform.ios,
    }),
  },
});

function RootNavigator() {
  const { user, initializing } = useAuth();

  // Hold here until Firebase restores the persisted session, so a signed-in
  // user never sees the login screen flash on a cold start.
  if (initializing) {
    return (
      <ThemedView style={styles.loading}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  // Stack.Protected makes the guarded routes unreachable when the guard is
  // false, so auth state alone decides which stack is mounted — no manual
  // redirects to race with navigation.
  return (
    <Stack>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(login)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!!user}>
        <Stack.Screen name="main" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <RNEThemeProvider theme={theme}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </RNEThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    justifyContent: "center",
  },
});
