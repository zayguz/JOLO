import { Stack } from "expo-router";
import { Platform } from "react-native";
import { lightColors, createTheme, ThemeProvider as RNEThemeProvider } from "@rneui/themed";

const theme = createTheme({
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.android,
      ios: lightColors.platform.ios,
    }),
  },
});

export default function RootLayout() {
  return (
    <RNEThemeProvider theme={theme}>
      <Stack>
        <Stack.Screen name="(login)" options={{ headerShown: false }} />
        <Stack.Screen name="main" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </RNEThemeProvider>
  );
}
