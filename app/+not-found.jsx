import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root}>
        <View style={styles.body}>
          <View style={styles.iconWrap}>
            <Ionicons name="cafe-outline" size={40} color={Palette.primary} />
          </View>
          <Text style={styles.title}>Page not found</Text>
          <Text style={styles.subtitle}>
            This screen doesn't exist. Let's get you back on track.
          </Text>
          <Link href="/main" style={styles.link}>
            <Text style={styles.linkLabel}>Back to Home</Text>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.marginMain,
    gap: Spacing.stackSm,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Palette.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
  },
  link: {
    marginTop: Spacing.sm,
    backgroundColor: Palette.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRadius: Radius.full,
  },
  linkLabel: {
    ...Typography.labelLg,
    color: Palette.onPrimary,
  },
});
