import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Linking,
  Platform,
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
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import MapView, { Marker } from "react-native-maps";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";
import { useCafes } from "@/hooks/useCafes";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  UNION_COUNTY_REGION,
  distanceMiles,
  formatDistance,
  isInServiceArea,
  walkingMinutes,
} from "@/lib/geo";
import { getOpenStatus } from "@/lib/hours";

// Collapsed shows only the handle and heading (21pt handle + 64pt heading);
// anything taller lets the first card peek in. Drag up for the list.
const COLLAPSED_SHEET_HEIGHT = 84;
const SNAP_POINTS = [COLLAPSED_SHEET_HEIGHT, "50%", "100%"];

// Profile + bell buttons: 16pt below the safe area, two 44pt buttons with a 10pt
// gap. The sheet stops just below them so it never slides under the icons.
const FLOAT_ICONS_BOTTOM = 16 + 44 + 10 + 44;
const SHEET_TOP_GAP = 12;
const WALKABLE_MILES = 1.5;

export default function FinderView() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const sheetRef = useRef(null);
  const sheetIndexRef = useRef(0);
  const markerPressRef = useRef(false);
  const listRef = useRef(null);

  const { cafes, loading, error, reload } = useCafes();
  const { coords } = useUserLocation();
  const nearby = coords != null && isInServiceArea(coords);

  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [independentOnly, setIndependentOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const visibleCafes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cafes
      .filter((cafe) => !independentOnly || !cafe.isChain)
      .filter(
        (cafe) =>
          !needle ||
          cafe.name.toLowerCase().includes(needle) ||
          cafe.municipality?.toLowerCase().includes(needle)
      )
      .map((cafe) => ({ ...cafe, miles: nearby ? distanceMiles(coords, cafe.coordinate) : null }))
      .sort((a, b) => (nearby ? a.miles - b.miles : a.name.localeCompare(b.name)));
  }, [cafes, query, independentOnly, nearby, coords]);

  // Keep the selected café pinned to the top of the sheet.
  const listData = useMemo(() => {
    const selected = visibleCafes.find((cafe) => cafe.id === selectedId);
    return selected ? [selected, ...visibleCafes.filter((cafe) => cafe.id !== selectedId)] : visibleCafes;
  }, [visibleCafes, selectedId]);

  const selectCafe = useCallback((cafe) => {
    Keyboard.dismiss();
    // iOS reports a marker tap to the map as well; ignore that follow-up press
    // so it doesn't immediately clear the selection we just made.
    markerPressRef.current = true;
    setTimeout(() => {
      markerPressRef.current = false;
    }, 700);

    setSelectedId(cafe.id);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    // Lift the sheet off the collapsed header, but never drag it back down.
    sheetRef.current?.snapToIndex(Math.max(1, sheetIndexRef.current));
    mapRef.current?.animateToRegion(
      { ...cafe.coordinate, latitudeDelta: 0.03, longitudeDelta: 0.03 },
      350
    );
  }, []);

  const handleCardPress = (cafe) => {
    if (cafe.id === selectedId) {
      setSelectedId(null);
    } else {
      selectCafe(cafe);
    }
  };

  const handleMapPress = (event) => {
    if (event.nativeEvent.action === "marker-press" || markerPressRef.current) return;
    Keyboard.dismiss();
    setSelectedId(null);
  };

  const searchTop = insets.top + 16;

  return (
    <View style={styles.root}>
      <View style={styles.mapArea}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={UNION_COUNTY_REGION}
          showsUserLocation={nearby}
          showsPointsOfInterest={false}
          mapPadding={{ top: searchTop + 48, bottom: COLLAPSED_SHEET_HEIGHT, left: 0, right: 0 }}
          onPress={handleMapPress}
        >
          {visibleCafes.map((cafe) => (
            <Marker
              key={cafe.id}
              coordinate={cafe.coordinate}
              pinColor={cafe.id === selectedId ? Palette.secondary : Palette.primary}
              onPress={() => selectCafe(cafe)}
              accessibilityLabel={cafe.name}
            />
          ))}
        </MapView>

        <BlurView intensity={40} tint="light" style={[styles.searchBar, { top: searchTop }]}>
          <Ionicons name="search" size={18} color={Palette.outline} />
          <TextInput
            placeholder="Search cafés or towns"
            placeholderTextColor="rgba(79,68,66,0.6)"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          <Pressable
            onPress={() => setIndependentOnly((v) => !v)}
            hitSlop={8}
            style={[styles.filterBtn, independentOnly && styles.filterBtnActive]}
            accessibilityRole="switch"
            accessibilityState={{ checked: independentOnly }}
            accessibilityLabel="Show independent cafés only"
          >
            <Ionicons
              name={independentOnly ? "options" : "options-outline"}
              size={18}
              color={independentOnly ? Palette.onPrimary : Palette.secondary}
            />
          </Pressable>
        </BlurView>

        <View style={[styles.floatIcons, { top: searchTop }]}>
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
          snapPoints={SNAP_POINTS}
          topInset={insets.top + FLOAT_ICONS_BOTTOM + SHEET_TOP_GAP}
          backgroundStyle={styles.sheetBg}
          handleStyle={styles.sheetHandleArea}
          handleIndicatorStyle={styles.handle}
          keyboardBehavior="extend"
          onChange={(index) => {
            sheetIndexRef.current = index;
          }}
        >
          <View style={styles.sheetHeading}>
            <Text style={styles.sheetTitle}>{nearby ? "Nearby Cafés" : "Union County Cafés"}</Text>
            {!loading && !error && (
              <Text style={styles.sheetCount}>
                {visibleCafes.length} {independentOnly ? "independent" : "found"}
              </Text>
            )}
          </View>

          {loading ? (
            <View style={styles.sheetMessage}>
              <ActivityIndicator color={Palette.secondary} />
            </View>
          ) : error ? (
            <View style={styles.sheetMessage}>
              <Text style={styles.messageText}>Couldn't load cafés. Check your connection.</Text>
              <Pressable
                style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
                onPress={reload}
              >
                <Text style={styles.retryLabel}>Try Again</Text>
              </Pressable>
            </View>
          ) : (
            <BottomSheetFlatList
              ref={listRef}
              data={listData}
              keyExtractor={(cafe) => cafe.id}
              renderItem={({ item }) => (
                <CafeCard
                  cafe={item}
                  selected={item.id === selectedId}
                  onPress={() => handleCardPress(item)}
                />
              )}
              contentContainerStyle={styles.sheetList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={[styles.messageText, styles.emptyText]}>
                  No cafés match “{query.trim()}”.
                </Text>
              }
              ListFooterComponent={
                <Text style={styles.attribution}>Café data © OpenStreetMap contributors</Text>
              }
            />
          )}
        </BottomSheet>
      </View>
    </View>
  );
}

function openDirections(cafe) {
  const { latitude, longitude } = cafe.coordinate;
  const url = Platform.select({
    ios: `http://maps.apple.com/?daddr=${latitude},${longitude}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
  });
  Linking.openURL(url);
}

function CafeCard({ cafe, selected, onPress }) {
  const status = getOpenStatus(cafe.hours);
  const walkable = cafe.miles != null && cafe.miles <= WALKABLE_MILES;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardImage}>
          <Ionicons name="cafe" size={34} color={Palette.primary} />
        </View>
        <View style={styles.cardBody}>
          <View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {cafe.name}
            </Text>
            <Text style={styles.cardTown} numberOfLines={1}>
              {cafe.address ?? cafe.municipality}
            </Text>
            <View style={styles.cardRating}>
              <Ionicons
                name={cafe.rating != null ? "star" : "star-outline"}
                size={14}
                color={Palette.secondary}
              />
              <Text style={styles.cardRatingText}>
                {cafe.rating != null
                  ? `${cafe.rating.toFixed(1)} (${cafe.ratingCount} ${cafe.ratingCount === 1 ? "review" : "reviews"})`
                  : "No reviews yet"}
              </Text>
            </View>
          </View>
          <View style={styles.cardMeta}>
            {cafe.miles != null ? (
              <View style={styles.cardDistance}>
                <Ionicons
                  name={walkable ? "walk-outline" : "car-outline"}
                  size={12}
                  color={Palette.onSurfaceVariant}
                />
                <Text style={styles.cardDistanceText}>{formatDistance(cafe.miles)}</Text>
              </View>
            ) : (
              <View />
            )}
            <Text style={[styles.cardHours, !status?.isOpen && styles.cardHoursMuted]}>
              {status?.label ?? "Hours not listed"}
            </Text>
          </View>
        </View>
      </View>
      {selected && (
        <Pressable
          style={({ pressed }) => [styles.directionsBtn, pressed && styles.pressed]}
          onPress={() => openDirections(cafe)}
        >
          <Ionicons name="navigate-outline" size={16} color={Palette.onPrimary} />
          <Text style={styles.directionsLabel}>
            Get Directions
            {walkable ? ` · ${walkingMinutes(cafe.miles)} min walk` : ""}
          </Text>
        </Pressable>
      )}
    </Pressable>
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
    paddingLeft: 18,
    paddingRight: 8,
    paddingVertical: 8,
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
    paddingVertical: 4,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: Palette.secondary,
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
  sheetMessage: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.marginMain,
  },
  messageText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
  },
  emptyText: {
    paddingTop: Spacing.md,
  },
  retryBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.full,
  },
  retryLabel: {
    ...Typography.labelLg,
    color: Palette.onPrimary,
  },
  attribution: {
    ...Typography.labelMd,
    fontSize: 11,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
    paddingTop: Spacing.xs,
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
    backgroundColor: Palette.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
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
  cardTown: {
    ...Typography.labelMd,
    color: Palette.onSurfaceVariant,
    marginTop: 2,
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
  cardHoursMuted: {
    color: Palette.onSurfaceVariant,
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
