import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "@rneui/themed";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getAuthErrorMessage, useAuth } from "@/context/AuthContext";

// Firebase rejects anything shorter, so fail fast instead of round-tripping.
const MIN_PASSWORD_LENGTH = 6;

export default function RegisterView() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await signUp(email, password);
      // Firebase signs the new user in automatically; the root layout
      // redirects into the app from here.
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ThemedText type="title" style={styles.heading}>
            Create account
          </ThemedText>

          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            disabled={submitting}
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            disabled={submitting}
          />
          <Input
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            disabled={submitting}
            onSubmitEditing={handleRegister}
            returnKeyType="go"
          />

          {error ? (
            <ThemedText style={styles.error}>{error}</ThemedText>
          ) : null}

          <Button
            title="Create account"
            onPress={handleRegister}
            loading={submitting}
          />
          <Button
            title="Back to login"
            type="clear"
            containerStyle={styles.secondaryButton}
            disabled={submitting}
            onPress={() => router.back()}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  heading: { marginBottom: 24, textAlign: "center" },
  error: { color: "#d32f2f", marginBottom: 12, textAlign: "center" },
  secondaryButton: { marginTop: 12 },
});
