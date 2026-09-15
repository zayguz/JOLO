import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";

const CAFES = [
  {
    id: "aroma",
    name: "Aroma & Crema - Downtown",
    rating: 4.9,
    reviews: 124,
    distance: "0.4 miles",
    hours: "Open until 8 PM",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAH3CB90ARsiAW8KBRej2HYd2Nh-LNRF2Nihf5Y8JL9nlAkbEg_AuDL6gG9lYAi439GqliiRMyPIPCa0aX12dgKn4i7ZOEwW1toeYIe31Kd5ZavDxxWwYGCaQe0kdufU2VJRNH2VxabtqlhlK5GQRBIvP8dBNTEU_IsBDfvJh65jKh1LiwEXjBHKkxi5Jjec22NogIqqHTRKfVOtm9J0dyT2Kc-NvUc2w7aQ2tnkpAkVVh9j8zu-u9T_gKz6_vB1CjxP3NSg85yvOQ",
    selected: true,
  },
  {
    id: "bean",
    name: "Bean & Leaf - Westside",
    rating: 4.7,
    reviews: 89,
    distance: "1.2 miles",
    hours: "Open until 7 PM",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkLmP71pBZPPbPDZ7Gr7pPTdEMP9UFF5Lj_jt1VCGBfg42ljIW-BZxmgY-DNsLvULfhiP0sFici97Lk1rSwZ0cd6mqScxHPyEUIl2FRe8Uy3mZy0LGphdgPIJnp3qjXkby7m79F8oW5rV25hQvKUBpIBrqAMFzaKq7j3FPfN0_YhEVqn2eKtzFjK3KHnu8fMhtIAAcDX5cKLGN1vn66kxBGOo-JQkZLWaZ_ywgsQ-q50ASIWKAubyslXffiAA_86O5kiBa53e-WZc",
  },
  {
    id: "roastery",
    name: "The Roastery Lab",
    rating: 4.8,
    reviews: 210,
    distance: "2.1 miles",
    hours: "Open until 9 PM",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnr5cxvOxU61XNamNND_KWjJt-EePhiSZjwmRYRmYpmfH7UcioekNPv39g_pmoOHW4eeqEQz57_QnXA_Uz1fPK-g3OtrKzdrkMiSVF02PlglTEP3ZHzQk8CuRBHoHs_nuHwipD5NP5UaJavtJl6PbEFW4NwHjlhGznNpj_eK4YsGqr1Pu5sBLbxNPJJSVbSmWQzBzQVcWeUlaaq3QXYKbwHjapVd1fuFpGidWALw_7I5NRNyuQe1BSf6oTXK-f8aAkBSEwu6RclPc",
  },
];

const PINS = [
  { top: "38%", left: "26%", color: Palette.secondary, size: 40 },
  { top: "55%", left: "60%", color: Palette.onSurfaceVariant, size: 36 },
  { top: "22%", left: "72%", color: Palette.onSurfaceVariant, size: 36 },
];

const DOT_ROWS = 14;
const DOT_COLS = 10;

export default function FinderView() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["38%", "92%"], []);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <View style={styles.root}>
      <View style={styles.mapArea}>
        <View style={styles.mapBg}>
          <View style={styles.dots} pointerEvents="none">
            {Array.from({ length: DOT_ROWS }).map((_, r) => (
              <View key={r} style={styles.dotRow}>
                {Array.from({ length: DOT_COLS }).map((_, c) => (
                  <View key={c} style={styles.dot} />
                ))}
              </View>
            ))}
          </View>
          {PINS.map((pin, i) => (
            <View
              key={i}
              style={[styles.pin, { top: pin.top, left: pin.left }]}
              pointerEvents="none"
            >
              <Ionicons name="location" size={pin.size} color={pin.color} />
            </View>
          ))}
        </View>

        <BlurView
          intensity={40}
          tint="light"
          style={[styles.searchBar, { top: insets.top + 16 }]}
        >
          <Ionicons name="search" size={18} color={Palette.outline} />
          <TextInput
            placeholder="Search for a neighborhood or cafe"
            placeholderTextColor="rgba(79,68,66,0.6)"
            style={styles.searchInput}
          />
          <Ionicons name="options-outline" size={18} color={Palette.secondary} />
        </BlurView>

        <View style={[styles.floatIcons, { top: insets.top + 16 }]}>
          <Pressable
            style={({ pressed }) => [styles.floatBtn, pressed && styles.pressed]}
            onPress={() => router.push("/main/profile")}
            aria-label="Open profile"
          >
            <Ionicons name="person" size={20} color={Palette.primary} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.floatBtn, pressed && styles.pressed]}
            onPress={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
          >
            <Ionicons name="notifications-outline" size={20} color={Palette.primary} />
            <View style={styles.badgeDot} />
          </Pressable>
        </View>

        <NotificationsPanel
          visible={notifOpen}
          onClose={() => setNotifOpen(false)}
          style={{ top: insets.top + 70, left: Spacing.marginMain }}
        />

        <BottomSheet
          ref={sheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={styles.sheetBg}
          handleStyle={styles.sheetHandleArea}
          handleIndicatorStyle={styles.handle}
        >
          <View style={styles.sheetHeading}>
            <Text style={styles.sheetTitle}>Nearby Cafés</Text>
            <Text style={styles.sheetCount}>{CAFES.length} found</Text>
          </View>
          <BottomSheetScrollView
            contentContainerStyle={styles.sheetList}
            showsVerticalScrollIndicator={false}
          >
            {CAFES.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </View>
  );
}

function CafeCard({ cafe }) {
  return (
    <View style={[styles.card, cafe.selected && styles.cardSelected]}>
      <View style={styles.cardRow}>
        <Image source={{ uri: cafe.image }} style={styles.cardImage} />
        <View style={styles.cardBody}>
          <View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {cafe.name}
            </Text>
            <View style={styles.cardRating}>
              <Ionicons name="star" size={14} color={Palette.secondary} />
              <Text style={styles.cardRatingText}>
                {cafe.rating} ({cafe.reviews} reviews)
              </Text>
            </View>
          </View>
          <View style={styles.cardMeta}>
            <View style={styles.cardDistance}>
              <Ionicons name="walk-outline" size={12} color={Palette.onSurfaceVariant} />
              <Text style={styles.cardDistanceText}>{cafe.distance}</Text>
            </View>
            <Text style={styles.cardHours}>{cafe.hours}</Text>
          </View>
        </View>
      </View>
      {cafe.selected && (
        <Pressable
          style={({ pressed }) => [styles.directionsBtn, pressed && styles.pressed]}
          onPress={() =>
            Alert.alert(
              "Directions Started",
              `Routing to ${cafe.name} · ${cafe.distance} · 8 min walk`
            )
          }
        >
          <Ionicons name="navigate-outline" size={16} color={Palette.onPrimary} />
          <Text style={styles.directionsLabel}>Get Directions</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
  },

  mapArea: {
    flex: 1,
    position: "relative",
  },
  mapBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f2ede4",
    overflow: "hidden",
  },
  dots: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  dotRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: Palette.outlineVariant,
  },
  pin: {
    position: "absolute",
  },

  floatIcons: {
    position: "absolute",
    left: Spacing.marginMain,
    zIndex: 20,
    gap: 10,
  },
  floatBtn: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(252,249,248,0.85)",
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.4)",
    shadowColor: "#100403",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  badgeDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: Palette.error,
    borderWidth: 2,
    borderColor: Palette.background,
  },

  searchBar: {
    position: "absolute",
    left: 80,
    right: Spacing.marginMain,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9999,
    overflow: "hidden",
    backgroundColor: "rgba(252,249,248,0.85)",
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.4)",
    shadowColor: "#100403",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMd,
    color: Palette.onSurface,
    padding: 0,
  },

  sheetBg: {
    backgroundColor: "rgba(252,249,248,0.97)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderTopColor: "rgba(211,195,192,0.4)",
  },
  sheetHandleArea: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 9999,
    backgroundColor: Palette.outlineVariant,
  },
  sheetHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.marginMain,
    paddingTop: 12,
    paddingBottom: 16,
  },
  sheetTitle: {
    ...Typography.headlineLgMobile,
    color: Palette.primary,
  },
  sheetCount: {
    ...Typography.labelLg,
    color: Palette.secondary,
  },
  sheetList: {
    paddingHorizontal: Spacing.marginMain,
    paddingBottom: 32,
    gap: Spacing.sm,
  },

  card: {
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.4)",
    shadowColor: "#4b2c20",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: Palette.surfaceContainerLow,
    borderColor: "rgba(122,88,47,0.35)",
    shadowOpacity: 0.12,
  },
  cardRow: {
    flexDirection: "row",
    gap: 14,
  },
  cardImage: {
    width: 88,
    height: 88,
    borderRadius: 18,
    backgroundColor: Palette.surfaceContainerHigh,
  },
  cardBody: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  cardTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    lineHeight: 22,
    color: Palette.primary,
  },
  cardRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  cardRatingText: {
    ...Typography.labelMd,
    color: Palette.onSurface,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cardDistance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDistanceText: {
    ...Typography.labelMd,
    color: Palette.onSurfaceVariant,
  },
  cardHours: {
    ...Typography.labelMd,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Palette.secondary,
  },

  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.secondary,
    paddingVertical: 12,
    borderRadius: 14,
  },
  directionsLabel: {
    ...Typography.labelLg,
    color: Palette.onPrimary,
  },

  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});
