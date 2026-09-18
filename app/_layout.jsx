import { useEffect } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { lightColors, createTheme, ThemeProvider as RNEThemeProvider } from "@rneui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_900Black,
} from "@expo-google-fonts/montserrat";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Palette } from "@/constants/Colors";
import { AuthProvider, useAuth } from "@/lib/auth";

SplashScreen.preventAutoHideAsync();

const theme = createTheme({
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.android,
      ios: lightColors.platform.ios,
    }),
    primary: Palette.primary,
    secondary: Palette.secondary,
    background: Palette.background,
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_900Black,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RNEThemeProvider theme={theme}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </RNEThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    // Hold the splash screen until we know whether a session was restored,
    // so the login screen never flashes for a signed-in user.
    if (!initializing) SplashScreen.hideAsync();
  }, [initializing]);

  if (initializing) return null;

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: Palette.background } }}>
      {/* The router keeps each group unreachable in the wrong state, so /main
          can't be opened by deep link while signed out. */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(login)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="main" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
