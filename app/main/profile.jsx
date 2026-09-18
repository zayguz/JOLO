import { useState } from "react";
import { Alert, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@rneui/themed";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getAuthErrorMessage, useAuth } from "@/context/AuthContext";

export default function ProfileView() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();
      // The root layout sends us back to login once the user clears.
    } catch (e) {
      const message = getAuthErrorMessage(e);

      if (Platform.OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("Couldn't sign out", message);
      }

      setSigningOut(false);
    }
  }

  return (
    <ThemedView>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Profile</ThemedText>

        <ThemedText type="defaultSemiBold" style={styles.label}>
          Signed in as
        </ThemedText>
        <ThemedText>{user?.email ?? "Unknown"}</ThemedText>

        <ThemedText type="defaultSemiBold" style={styles.label}>
          Email verified
        </ThemedText>
        <ThemedText>{user?.emailVerified ? "Yes" : "No"}</ThemedText>

        <Button
          title="Sign out"
          type="outline"
          containerStyle={styles.signOut}
          onPress={handleSignOut}
          loading={signingOut}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 24 },
  label: { marginTop: 24 },
  signOut: { marginTop: 40 },
});
