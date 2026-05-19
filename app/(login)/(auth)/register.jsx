import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function RegisterView() {
  return (
    <SafeAreaProvider>
      <ThemedView>
        <SafeAreaView>
          <ThemedText type="title">Hello from Register view</ThemedText>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
