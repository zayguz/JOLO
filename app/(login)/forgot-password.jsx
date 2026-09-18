import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "@rneui/themed";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getAuthErrorMessage, useAuth } from "@/context/AuthContext";

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      setError("Enter the email you signed up with.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (e) {
      // Don't confirm whether an email is registered — reporting
      // "user not found" would leak which accounts exist.
      if (e?.code === "auth/user-not-found") {
        setSent(true);
      } else {
        setError(getAuthErrorMessage(e));
      }
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
            Reset password
          </ThemedText>

          {sent ? (
            <ThemedText style={styles.message}>
              If an account exists for {email.trim()}, a reset link is on its
              way. Check your inbox and spam folder.
            </ThemedText>
          ) : (
            <>
              <ThemedText style={styles.message}>
                Enter your email and we'll send you a link to reset your
                password.
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
                onSubmitEditing={handleReset}
                returnKeyType="send"
              />

              {error ? (
                <ThemedText style={styles.error}>{error}</ThemedText>
              ) : null}

              <Button
                title="Send reset link"
                onPress={handleReset}
                loading={submitting}
              />
            </>
          )}

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
  heading: { marginBottom: 16, textAlign: "center" },
  message: { marginBottom: 24, textAlign: "center" },
  error: { color: "#d32f2f", marginBottom: 12, textAlign: "center" },
  secondaryButton: { marginTop: 12 },
});
