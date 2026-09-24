import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/Colors";
import { Radius, Typography } from "@/constants/Typography";

const NOTIFICATIONS = [
  {
    id: "post-like",
    icon: "star",
    title: "Priya rated Oat Cortado 5 stars",
    subtitle: "Bean & Leaf - Westside · 12 min ago",
  },
  {
    id: "friends-posted",
    icon: "people",
    title: "3 friends posted this week",
    subtitle: "Catch up on the feed · 1h ago",
  },
];

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
      {NOTIFICATIONS.map((item, i) => (
        <View key={item.id} style={[styles.row, i === NOTIFICATIONS.length - 1 && styles.rowLast]}>
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={16} color={Palette.primary} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
      ))}
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
  row: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.surfaceContainerLow,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    backgroundColor: Palette.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  rowTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    color: Palette.onSurface,
  },
  rowSubtitle: {
    ...Typography.labelMd,
    color: Palette.onSurfaceVariant,
    marginTop: 2,
  },
});
