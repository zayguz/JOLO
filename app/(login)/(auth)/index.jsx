import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "@rneui/themed";
import { Link, router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getAuthErrorMessage, useAuth } from "@/context/AuthContext";

export default function LoginView() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await signIn(email, password);
      // No navigation here: the root layout redirects once Firebase reports
      // the signed-in user.
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
            Welcome back
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
            autoComplete="current-password"
            textContentType="password"
            disabled={submitting}
            onSubmitEditing={handleLogin}
            returnKeyType="go"
          />

          {error ? (
            <ThemedText style={styles.error}>{error}</ThemedText>
          ) : null}

          <Button title="Login" onPress={handleLogin} loading={submitting} />
          <Button
            title="Register"
            type="outline"
            containerStyle={styles.secondaryButton}
            disabled={submitting}
            onPress={() => router.push("/register")}
          />

          <Link href="/forgot-password" style={styles.link}>
            <ThemedText type="link">Forgot Password?</ThemedText>
          </Link>
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
  link: { marginTop: 24, textAlign: "center" },
});
