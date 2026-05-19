import { Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export function ThemedText({ style, type = "default", ...rest }) {
  const theme = useColorScheme();
  const color = Colors[theme].text;

  return (
    <Text
      style={[
        { color },
        type === "title" && styles.title,
        type === "defaultSemiBold" && styles.defaultSemiBold,
        type === "subtitle" && styles.subtitle,
        type === "link" && styles.link,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    fontSize: 16,
    color: "#0a7ea4",
  },
});
