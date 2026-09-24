import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/Colors";
import { Radius, Typography } from "@/constants/Typography";

// No notification source exists yet (no likes/comments/friend-request
// events are generated anywhere) — this is an honest empty state rather
// than placeholder content.
export function NotificationsPanel({ visible, onClose, style }) {
  if (!visible) return null;

  return (
    <View style={[styles.panel, style]}>
      <View style={styles.head}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={18} color={Palette.onSurfaceVariant} />
        </Pressable>
      </View>
      <View style={styles.empty}>
        <Ionicons name="notifications-outline" size={22} color={Palette.onSurfaceVariant} />
        <Text style={styles.emptyText}>You're all caught up</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    width: 260,
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.4)",
    shadowColor: "#1e0f0a",
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    overflow: "hidden",
    zIndex: 30,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.surfaceContainerHigh,
  },
  title: {
    ...Typography.labelLg,
    color: Palette.onSurface,
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  emptyText: {
    ...Typography.labelMd,
    color: Palette.onSurfaceVariant,
  },
});
