import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function ForgotPasswordScreen() {
  return (
    <SafeAreaProvider>
      <ThemedView>
        <SafeAreaView>
          <ThemedText type="title">Forgot Password view</ThemedText>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
