import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function ProfileView() {
  return (
    <SafeAreaProvider>
      <ThemedView>
        <SafeAreaView>
          <ThemedText type="title">Profile view</ThemedText>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
