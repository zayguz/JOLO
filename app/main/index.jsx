import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";

export default function HomeView() {
  const { user } = useAuth();

  return (
    <ThemedView>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Home</ThemedText>
        <ThemedText style={styles.subtitle}>
          Signed in as {user?.email}
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 24 },
  subtitle: { marginTop: 12 },
});
