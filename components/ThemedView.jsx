import { View } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export function ThemedView({ style, ...rest }) {
  const theme = useColorScheme();
  const backgroundColor = Colors[theme].background;

  return <View style={[{ backgroundColor, flex: 1 }, style]} {...rest} />;
}
