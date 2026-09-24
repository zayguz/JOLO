import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";
import { useAuth } from "@/lib/auth";
import { authErrorMessage } from "@/lib/auth-errors";

export default function LoginView() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Enter your email and password to sign in.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      // The root layout swaps to the main tabs once the session exists.
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.watermark} pointerEvents="none">
        {["J", "O", "L", "O"].map((letter, i) => (
          <Text key={i} style={styles.watermarkLetter}>
            {letter}
          </Text>
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.brand}>JOLO</Text>

        <BlurView intensity={30} tint="light" style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={[styles.inputWrap, error && !email && styles.inputWrapError]}>
              <Ionicons name="mail-outline" size={16} color={Palette.onSurfaceVariant} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="rgba(79,68,66,0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[styles.inputWrap, error && !password && styles.inputWrapError]}>
              <Ionicons name="lock-closed-outline" size={16} color={Palette.onSurfaceVariant} />
              <TextInput
                style={styles.input}
                placeholder="Your password"
                placeholderTextColor="rgba(79,68,66,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
              />
            </View>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#410002" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, busy && styles.btnBusy]}
            onPress={handleSignIn}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={Palette.onPrimary} />
            ) : (
              <Text style={styles.primaryBtnLabel}>Sign In with Email</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}
            onPress={() => router.push("/register")}
            disabled={busy}
          >
            <Text style={styles.outlineBtnLabel}>Create New Account</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.forgotBtn, pressed && styles.pressed]}
            onPress={() => router.push("/forgot-password")}
            hitSlop={8}
          >
            <Text style={styles.forgotLabel}>Forgot password?</Text>
          </Pressable>
        </BlurView>

        <Text style={styles.footer}>
          By signing up, you agree to our{" "}
          <Text style={styles.footerLink}>Terms of Service</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    top: "8%",
    left: -28,
    flexDirection: "column",
  },
  watermarkLetter: {
    fontFamily: "Montserrat_900Black",
    fontSize: 180,
    lineHeight: 150,
    color: Palette.watermark,
    opacity: 0.55,
    letterSpacing: -8,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.marginMain,
    paddingBottom: Spacing.xl,
    gap: Spacing.stackLg,
  },
  brand: {
    ...Typography.headlineXl,
    color: "#2c1b17",
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.cardPadding,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(252,249,248,0.55)",
    gap: Spacing.sm,
    shadowColor: "#100403",
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  field: { gap: 6 },
  fieldLabel: {
    ...Typography.labelMd,
    color: Palette.onSurfaceVariant,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: "rgba(129,116,113,0.4)",
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputWrapError: {
    borderColor: Palette.error,
  },
  input: {
    flex: 1,
    ...Typography.bodyMd,
    color: Palette.onSurface,
    padding: 0,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.errorContainer,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  errorText: {
    ...Typography.labelMd,
    color: "#410002",
    flexShrink: 1,
  },
  primaryBtn: {
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
  btnBusy: {
    opacity: 0.7,
  },
  outlineBtn: {
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Palette.primary,
    backgroundColor: "transparent",
  },
  outlineBtnLabel: {
    ...Typography.labelLg,
    color: Palette.primary,
  },
  forgotBtn: {
    alignItems: "center",
    paddingTop: 4,
  },
  forgotLabel: {
    ...Typography.labelMd,
    color: Palette.primary,
  },
  footer: {
    ...Typography.bodySm,
    textAlign: "center",
    color: "rgba(44,27,23,0.7)",
  },
  footerLink: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#2c1b17",
    textDecorationLine: "underline",
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});
