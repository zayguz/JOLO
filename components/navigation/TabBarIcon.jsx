import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/Colors";

export function TabBarIcon({ name, color, focused }) {
  return (
    <View style={[styles.wrap, focused && styles.wrapFocused]}>
      <Ionicons size={22} name={name} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 56,
    height: 32,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  wrapFocused: {
    backgroundColor: Palette.secondaryContainer,
  },
});
