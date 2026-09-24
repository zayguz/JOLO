import { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";

const CREATIONS = [
  { id: "iced-oat-vanilla", name: "Iced Oat Vanilla Latte", tag: "Iced · Oat Milk" },
  { id: "extra-shot-cap", name: "Extra Shot Cappuccino", tag: "3 Shots · Whole Milk" },
  { id: "iced-matcha-oat", name: "Iced Matcha Oat Latte", tag: "Iced · Light Ice" },
];

const SPOTS = [
  {
    id: "aroma",
    name: "Aroma & Crema - Downtown",
    rating: "4.9",
    distance: "0.4 miles",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAH3CB90ARsiAW8KBRej2HYd2Nh-LNRF2Nihf5Y8JL9nlAkbEg_AuDL6gG9lYAi439GqliiRMyPIPCa0aX12dgKn4i7ZOEwW1toeYIe31Kd5ZavDxxWwYGCaQe0kdufU2VJRNH2VxabtqlhlK5GQRBIvP8dBNTEU_IsBDfvJh65jKh1LiwEXjBHKkxi5Jjec22NogIqqHTRKfVOtm9J0dyT2Kc-NvUc2w7aQ2tnkpAkVVh9j8zu-u9T_gKz6_vB1CjxP3NSg85yvOQ",
  },
  {
    id: "bean",
    name: "Bean & Leaf - Westside",
    rating: "4.7",
    distance: "1.2 miles",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkLmP71pBZPPbPDZ7Gr7pPTdEMP9UFF5Lj_jt1VCGBfg42ljIW-BZxmgY-DNsLvULfhiP0sFici97Lk1rSwZ0cd6mqScxHPyEUIl2FRe8Uy3mZy0LGphdgPIJnp3qjXkby7m79F8oW5rV25hQvKUBpIBrqAMFzaKq7j3FPfN0_YhEVqn2eKtzFjK3KHnu8fMhtIAAcDX5cKLGN1vn66kxBGOo-JQkZLWaZ_ywgsQ-q50ASIWKAubyslXffiAA_86O5kiBa53e-WZc",
  },
  {
    id: "roastery",
    name: "The Roastery Lab",
    rating: "4.8",
    distance: "2.1 miles",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnr5cxvOxU61XNamNND_KWjJt-EePhiSZjwmRYRmYpmfH7UcioekNPv39g_pmoOHW4eeqEQz57_QnXA_Uz1fPK-g3OtrKzdrkMiSVF02PlglTEP3ZHzQk8CuRBHoHs_nuHwipD5NP5UaJavtJl6PbEFW4NwHjlhGznNpj_eK4YsGqr1Pu5sBLbxNPJJSVbSmWQzBzQVcWeUlaaq3QXYKbwHjapVd1fuFpGidWALw_7I5NRNyuQe1BSf6oTXK-f8aAkBSEwu6RclPc",
  },
];

const COMMUNITY_CREATIONS = [
  { id: "brown-sugar-shaken", name: "Brown Sugar Oat Shaken Espresso", author: "Marcus T." },
  { id: "honey-cinnamon-cortado", name: "Honey Cinnamon Cortado", author: "Priya S." },
  { id: "salted-caramel-foam", name: "Salted Caramel Cold Foam Latte", author: "Elena R." },
];

const COMMUNITY_SPOTS = [
  {
    id: "corner-press",
    name: "Corner Press Coffee",
    rating: "4.6",
    distance: "1.8 miles",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAH3CB90ARsiAW8KBRej2HYd2Nh-LNRF2Nihf5Y8JL9nlAkbEg_AuDL6gG9lYAi439GqliiRMyPIPCa0aX12dgKn4i7ZOEwW1toeYIe31Kd5ZavDxxWwYGCaQe0kdufU2VJRNH2VxabtqlhlK5GQRBIvP8dBNTEU_IsBDfvJh65jKh1LiwEXjBHKkxi5Jjec22NogIqqHTRKfVOtm9J0dyT2Kc-NvUc2w7aQ2tnkpAkVVh9j8zu-u9T_gKz6_vB1CjxP3NSg85yvOQ",
  },
  {
    id: "maple-grind",
    name: "Maple & Grind",
    rating: "4.5",
    distance: "2.4 miles",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkLmP71pBZPPbPDZ7Gr7pPTdEMP9UFF5Lj_jt1VCGBfg42ljIW-BZxmgY-DNsLvULfhiP0sFici97Lk1rSwZ0cd6mqScxHPyEUIl2FRe8Uy3mZy0LGphdgPIJnp3qjXkby7m79F8oW5rV25hQvKUBpIBrqAMFzaKq7j3FPfN0_YhEVqn2eKtzFjK3KHnu8fMhtIAAcDX5cKLGN1vn66kxBGOo-JQkZLWaZ_ywgsQ-q50ASIWKAubyslXffiAA_86O5kiBa53e-WZc",
  },
  {
    id: "milk-bar",
    name: "The Milk Bar Café",
    rating: "4.7",
    distance: "3.0 miles",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnr5cxvOxU61XNamNND_KWjJt-EePhiSZjwmRYRmYpmfH7UcioekNPv39g_pmoOHW4eeqEQz57_QnXA_Uz1fPK-g3OtrKzdrkMiSVF02PlglTEP3ZHzQk8CuRBHoHs_nuHwipD5NP5UaJavtJl6PbEFW4NwHjlhGznNpj_eK4YsGqr1Pu5sBLbxNPJJSVbSmWQzBzQVcWeUlaaq3QXYKbwHjapVd1fuFpGidWALw_7I5NRNyuQe1BSf6oTXK-f8aAkBSEwu6RclPc",
  },
];

export default function FavoritesView() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("creations");
  const [removedCreations, setRemovedCreations] = useState([]);
  const [removedSpots, setRemovedSpots] = useState([]);
  const [savedCommunityCreations, setSavedCommunityCreations] = useState([]);
  const [savedCommunitySpots, setSavedCommunitySpots] = useState([]);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (text, onUndo) => {
    clearTimeout(toastTimer.current);
    setToast({ text, onUndo });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };
  const dismissToast = () => {
    clearTimeout(toastTimer.current);
    setToast(null);
  };

  const visibleCreations = CREATIONS.filter((c) => !removedCreations.includes(c.id));
  const visibleSpots = SPOTS.filter((c) => !removedSpots.includes(c.id));

  const removeCreation = (item) => {
    setRemovedCreations((prev) => [...prev, item.id]);
    showToast(`Removed "${item.name}" from favorites`, () =>
      setRemovedCreations((prev) => prev.filter((id) => id !== item.id))
    );
  };
  const removeSpot = (item) => {
    setRemovedSpots((prev) => [...prev, item.id]);
    showToast(`Removed "${item.name}" from favorites`, () =>
      setRemovedSpots((prev) => prev.filter((id) => id !== item.id))
    );
  };
  const toggleCommunityCreation = (item) => {
    const saved = savedCommunityCreations.includes(item.id);
    setSavedCommunityCreations((prev) =>
      saved ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
    dismissToast();
  };
  const toggleCommunitySpot = (item) => {
    const saved = savedCommunitySpots.includes(item.id);
    setSavedCommunitySpots((prev) => (saved ? prev.filter((id) => id !== item.id) : [...prev, item.id]));
    dismissToast();
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={Palette.primary} />
          </View>
          <Text style={styles.headerTitle}>Favorites</Text>
          <Pressable
            style={({ pressed }) => [styles.bellBtn, pressed && styles.pressed]}
            onPress={() => setNotifOpen((v) => !v)}
          >
            <Ionicons name="notifications-outline" size={22} color={Palette.primary} />
            <View style={styles.badgeDot} />
          </Pressable>
        </View>
        <NotificationsPanel
          visible={notifOpen}
          onClose={() => setNotifOpen(false)}
          style={{ top: 60, right: Spacing.marginMain }}
        />

        <View style={styles.segTabs}>
          <Pressable onPress={() => setActiveTab("creations")}>
            <Text style={[styles.segTab, activeTab === "creations" && styles.segTabActive]}>
              Creations
            </Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab("cafes")}>
            <Text style={[styles.segTab, activeTab === "cafes" && styles.segTabActive]}>Cafés</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === "creations" ? (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Your Creations</Text>
              <Text style={styles.seeAll}>See all {visibleCreations.length}</Text>
            </View>
            {visibleCreations.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.circleRow}
              >
                {visibleCreations.map((item) => (
                  <View key={item.id} style={styles.circleCard}>
                    <View style={styles.circleThumb}>
                      <Ionicons name="cafe" size={38} color={Palette.primary} />
                      <Pressable style={styles.circleHeart} onPress={() => removeCreation(item)}>
                        <Ionicons name="heart" size={14} color={Palette.error} />
                      </Pressable>
                    </View>
                    <Text style={styles.circleName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.circleSub}>{item.tag}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <EmptyRow icon="heart" text="No favorited creations yet. Heart a drink from Social to save it here." />
            )}

            <View style={[styles.sectionHead, styles.sectionHeadSecond]}>
              <Text style={styles.sectionTitle}>Community Creations</Text>
              <Text style={styles.seeAll}>See all {COMMUNITY_CREATIONS.length}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.circleRow}
            >
              {COMMUNITY_CREATIONS.map((item) => {
                const saved = savedCommunityCreations.includes(item.id);
                return (
                  <View key={item.id} style={styles.circleCard}>
                    <View style={styles.circleThumb}>
                      <Ionicons name="cafe" size={38} color={Palette.primary} />
                      <Pressable style={styles.circleHeart} onPress={() => toggleCommunityCreation(item)}>
                        <Ionicons
                          name={saved ? "heart" : "heart-outline"}
                          size={14}
                          color={saved ? Palette.error : Palette.onSurfaceVariant}
                        />
                      </Pressable>
                    </View>
                    <Text style={styles.circleName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.circleSub}>by {item.author}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </>
        ) : (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Your Cafés</Text>
              <Text style={styles.seeAll}>See all {visibleSpots.length}</Text>
            </View>
            {visibleSpots.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.circleRow}
              >
                {visibleSpots.map((item) => (
                  <View key={item.id} style={styles.circleCard}>
                    <View style={styles.circleThumb}>
                      <Image source={{ uri: item.image }} style={styles.circleImage} />
                      <Pressable style={styles.circleHeart} onPress={() => removeSpot(item)}>
                        <Ionicons name="heart" size={14} color={Palette.error} />
                      </Pressable>
                    </View>
                    <Text style={styles.circleName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View style={styles.circleSubRow}>
                      <Ionicons name="star" size={11} color={Palette.secondary} />
                      <Text style={styles.circleSub}>
                        {item.rating} · {item.distance}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <EmptyRow icon="location" text="No favorite spots yet. Heart a café on the Finder tab to save it here." />
            )}

            <View style={[styles.sectionHead, styles.sectionHeadSecond]}>
              <Text style={styles.sectionTitle}>Community Cafés</Text>
              <Text style={styles.seeAll}>See all {COMMUNITY_SPOTS.length}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.circleRow}
            >
              {COMMUNITY_SPOTS.map((item) => {
                const saved = savedCommunitySpots.includes(item.id);
                return (
                  <View key={item.id} style={styles.circleCard}>
                    <View style={styles.circleThumb}>
                      <Image source={{ uri: item.image }} style={styles.circleImage} />
                      <Pressable style={styles.circleHeart} onPress={() => toggleCommunitySpot(item)}>
                        <Ionicons
                          name={saved ? "heart" : "heart-outline"}
                          size={14}
                          color={saved ? Palette.error : Palette.onSurfaceVariant}
                        />
                      </Pressable>
                    </View>
                    <Text style={styles.circleName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View style={styles.circleSubRow}>
                      <Ionicons name="star" size={11} color={Palette.secondary} />
                      <Text style={styles.circleSub}>
                        {item.rating} · {item.distance}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}
      </ScrollView>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText} numberOfLines={2}>
            {toast.text}
          </Text>
          <Pressable
            onPress={() => {
              toast.onUndo?.();
              dismissToast();
            }}
            hitSlop={8}
          >
            <Text style={styles.toastUndo}>UNDO</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function EmptyRow({ icon, text }) {
  return (
    <View style={styles.emptyRow}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={20} color={Palette.onSurfaceVariant} />
      </View>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  headerSafe: { backgroundColor: Palette.background, position: "relative", zIndex: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.marginMain,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Palette.secondaryContainer,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.headlineMd,
    fontFamily: "Montserrat_700Bold",
    color: Palette.primary,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: Palette.error,
    borderWidth: 2,
    borderColor: Palette.background,
  },

  segTabs: {
    flexDirection: "row",
    gap: 28,
    paddingHorizontal: Spacing.marginMain,
    borderBottomWidth: 1,
    borderBottomColor: Palette.surfaceContainerHigh,
  },
  segTab: {
    ...Typography.bodyMd,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 15,
    color: Palette.onSurfaceVariant,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  segTabActive: {
    color: Palette.primary,
    borderBottomColor: Palette.primary,
  },

  scroll: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.sm,
    paddingBottom: 110,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  sectionHeadSecond: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: Palette.onSurface,
  },
  seeAll: {
    ...Typography.labelLg,
    color: Palette.secondary,
  },

  circleRow: {
    gap: 18,
    paddingRight: Spacing.marginMain,
    paddingBottom: 8,
  },
  circleCard: {
    width: 100,
    alignItems: "center",
  },
  circleThumb: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    backgroundColor: Palette.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  circleImage: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
  },
  circleHeart: {
    position: "absolute",
    bottom: -6,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Palette.background,
    alignItems: "center",
    justifyContent: "center",
  },
  circleName: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
    lineHeight: 16,
    textAlign: "center",
    color: Palette.onSurface,
    marginTop: 10,
  },
  circleSub: {
    ...Typography.labelMd,
    fontSize: 11,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
    marginTop: 3,
  },
  circleSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },

  emptyRow: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(211,195,192,0.6)",
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...Typography.bodySm,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 240,
  },

  toast: {
    position: "absolute",
    left: Spacing.marginMain,
    right: Spacing.marginMain,
    bottom: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: Palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: Radius.md,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  toastText: {
    ...Typography.bodySm,
    color: Palette.onPrimary,
    flex: 1,
  },
  toastUndo: {
    ...Typography.labelLg,
    color: Palette.secondaryContainer,
  },

  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});
