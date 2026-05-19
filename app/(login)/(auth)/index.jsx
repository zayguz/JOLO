import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@rneui/base";
import { Link } from "expo-router";
import { router } from "expo-router";

export default function LoginView() {
  return (
    <SafeAreaProvider>
      <ThemedView>
        <SafeAreaView>
          <ThemedText type="title">Login view</ThemedText>
          <Link href="/forgot-password">Forgot Password?</Link>
          <Button
            // title="Go to Main"
            onPress={() => {
              router.replace("/main");
            }}
          >
            Login
          </Button>
          <Button
            type="outline"
            onPress={() => {
              router.push("/register");
            }}
          >
            Register
          </Button>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
