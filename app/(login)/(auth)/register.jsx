import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";

export default function RegisterView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const mismatch = touched && password && confirmPassword && password !== confirmPassword;
  const missing = (value) => touched && !value;

  const handleSignUp = () => {
    if (!name || !email || !password || !confirmPassword || password !== confirmPassword) {
      setTouched(true);
      return;
    }
    router.replace("/main");
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
            error={missing(email)}
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            textContentType="newPassword"
            autoComplete="password-new"
            error={missing(password)}
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
        </View>

        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={handleSignUp}
        >
          <Text style={styles.primaryBtnLabel}>Sign Up</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
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
