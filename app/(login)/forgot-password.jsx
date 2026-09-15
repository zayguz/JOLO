import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={Palette.primary} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="key-outline" size={28} color={Palette.primary} />
        </View>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Enter the email associated with your account and we'll send you a link to reset your
          password.
        </Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="rgba(79,68,66,0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {sent && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color={Palette.secondary} />
            <Text style={styles.successText}>Reset link sent. Check your inbox.</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => setSent(true)}
        >
          <Text style={styles.primaryBtnLabel}>Send Reset Link</Text>
        </Pressable>

        <Pressable style={styles.footerRow} onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.footerLink}>Back to Sign In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  header: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.surfaceContainer,
  },

  body: {
    flex: 1,
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Palette.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.headlineLgMobile,
    color: Palette.primary,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    marginTop: 8,
    marginBottom: Spacing.lg,
  },

  field: { gap: 6 },
  fieldLabel: {
    ...Typography.labelMd,
    color: Palette.onSurfaceVariant,
  },
  input: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.6)",
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: Spacing.sm,
    backgroundColor: Palette.secondaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  successText: {
    ...Typography.labelMd,
    color: Palette.onSecondaryContainer,
    flexShrink: 1,
  },

  primaryBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Palette.primary,
    paddingVertical: 16,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnLabel: {
    ...Typography.labelLg,
    color: Palette.onPrimary,
  },

  footerRow: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  footerLink: {
    ...Typography.bodySm,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Palette.primary,
  },

  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
});
