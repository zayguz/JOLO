import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";
import { useAuth } from "@/lib/auth";

export default function ProfileView() {
  const { user, signOut } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSignOut = async () => {
    setConfirmOpen(false);
    // The root layout returns to the login screens once the session clears.
    await signOut();
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.idCard}>
          <View style={styles.avatarLg}>
            <Ionicons name="person" size={40} color={Palette.primary} />
            <Pressable style={({ pressed }) => [styles.editBadge, pressed && styles.pressed]}>
              <Ionicons name="pencil" size={14} color={Palette.onPrimary} />
            </Pressable>
          </View>
          <Text style={styles.idName}>{user?.displayName ?? "JOLO member"}</Text>
          <Text style={styles.idEmail}>{user?.email ?? ""}</Text>
          <View style={styles.statPill}>
            <Ionicons name="location" size={14} color={Palette.onSecondaryContainer} />
            <Text style={styles.statPillText}>0 posts · 0 cafés visited</Text>
          </View>
        </View>

        <Group title="Account">
          <Row icon="person-outline" label="Personal Information" />
          <Row icon="notifications-outline" label="Notifications" value="On" />
        </Group>

        <Group title="Activity">
          <Row icon="list-outline" label="Your Posts" />
          <Row icon="location-outline" label="Saved Cafés" />
        </Group>

        <Group title="Support">
          <Row icon="help-circle-outline" label="Help Center" last />
        </Group>

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}
          onPress={() => setConfirmOpen(true)}
        >
          <Ionicons name="log-out-outline" size={18} color={Palette.error} />
          <Text style={styles.signOutLabel}>Sign Out</Text>
        </Pressable>
        <Text style={styles.version}>JOLO · Aroma & Crema · v1.0.0</Text>
      </ScrollView>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <Ionicons name="log-out-outline" size={24} color={Palette.error} />
            </View>
            <Text style={styles.confirmTitle}>Sign out of JOLO?</Text>
            <Text style={styles.confirmSub}>You'll need to sign back in to post and save favorites.</Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={({ pressed }) => [styles.confirmBtn, styles.confirmCancel, pressed && styles.pressed]}
                onPress={() => setConfirmOpen(false)}
              >
                <Text style={styles.confirmCancelLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.confirmBtn, styles.confirmSignOut, pressed && styles.pressed]}
                onPress={handleSignOut}
              >
                <Text style={styles.confirmSignOutLabel}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Group({ title, children }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

function Row({ icon, label, value, last }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && styles.rowPressed]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={Palette.primary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={16} color={Palette.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  headerSafe: { backgroundColor: Palette.background },
  header: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 24,
    color: Palette.primary,
  },

  scroll: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: 8,
    paddingBottom: 40,
  },

  idCard: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  avatarLg: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    backgroundColor: Palette.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Palette.background,
  },
  idName: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 20,
    color: Palette.onSurface,
    marginTop: 12,
  },
  idEmail: {
    ...Typography.bodySm,
    fontSize: 13,
    color: Palette.onSurfaceVariant,
    marginTop: 2,
  },
  statPill: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.secondaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  statPillText: {
    ...Typography.labelMd,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Palette.onSecondaryContainer,
  },

  group: { marginTop: 8 },
  groupTitle: {
    ...Typography.labelMd,
    fontFamily: "PlusJakartaSans_600SemiBold",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: Palette.onSurfaceVariant,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.4)",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.surfaceContainerLow,
  },
  rowPressed: {
    backgroundColor: Palette.surfaceContainerLow,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: Palette.onSurface,
    flex: 1,
  },
  rowValue: {
    ...Typography.bodySm,
    fontSize: 13,
    color: Palette.onSurfaceVariant,
  },

  signOutBtn: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: Palette.error,
  },
  signOutLabel: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: Palette.error,
  },
  version: {
    ...Typography.labelMd,
    fontSize: 11,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
    marginTop: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20,10,7,0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  confirmCard: {
    width: "100%",
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  confirmIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Palette.errorContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 17,
    color: Palette.onSurface,
    marginTop: 4,
  },
  confirmSub: {
    ...Typography.bodySm,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 14,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCancel: {
    backgroundColor: Palette.surfaceContainer,
  },
  confirmCancelLabel: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: Palette.onSurface,
  },
  confirmSignOut: {
    backgroundColor: Palette.error,
  },
  confirmSignOutLabel: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: "#fff",
  },

  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
});
