import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";
import { useAuth } from "@/lib/auth";
import { authErrorMessage } from "@/lib/auth-errors";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterView() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const badEmail = touched && email.trim() !== "" && !EMAIL_PATTERN.test(email.trim());
  const shortPassword = touched && password !== "" && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = touched && password && confirmPassword && password !== confirmPassword;
  const missing = (value) => touched && !value;

  const handleSignUp = async () => {
    setTouched(true);
    setError(null);
    if (
      !name.trim() ||
      !EMAIL_PATTERN.test(email.trim()) ||
      password.length < MIN_PASSWORD_LENGTH ||
      password !== confirmPassword
    ) {
      return;
    }

    setBusy(true);
    try {
      await signUp(name, email, password);
      // Signing up signs the user in, and the root layout shows the main tabs.
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join JOLO to discover cafés and share what you're drinking</Text>

        <View style={styles.form}>
          <Field
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Jordan Lee"
            error={missing(name)}
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            autoComplete="email"
            error={missing(email) || badEmail}
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            textContentType="newPassword"
            autoComplete="password-new"
            error={missing(password) || shortPassword}
          />
          <View>
            <Field
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              textContentType="newPassword"
              autoComplete="password-new"
              error={missing(confirmPassword) || mismatch}
            />
            {mismatch && <Text style={styles.fieldError}>Passwords don't match.</Text>}
          </View>
          {badEmail && <Text style={styles.fieldError}>Enter a valid email address.</Text>}
          {shortPassword && (
            <Text style={styles.fieldError}>
              Passwords need to be at least {MIN_PASSWORD_LENGTH} characters.
            </Text>
          )}
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color="#410002" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, busy && styles.btnBusy]}
          onPress={handleSignUp}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={Palette.onPrimary} />
          ) : (
            <Text style={styles.primaryBtnLabel}>Sign Up</Text>
          )}
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.back()} hitSlop={8} disabled={busy}>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, error, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="rgba(79,68,66,0.5)"
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  flex: { flex: 1 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: Spacing.sm,
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
  btnBusy: {
    opacity: 0.7,
  },
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

  scroll: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },

  title: {
    ...Typography.headlineLgMobile,
    color: Palette.primary,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    marginTop: 6,
  },

  form: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
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
  inputError: {
    borderColor: Palette.error,
  },
  fieldError: {
    ...Typography.labelMd,
    fontSize: 12,
    color: Palette.error,
    marginTop: 6,
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
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  footerText: {
    ...Typography.bodySm,
    color: Palette.onSurfaceVariant,
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
