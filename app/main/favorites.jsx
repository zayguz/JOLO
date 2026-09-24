import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";
import { useAuth } from "@/lib/auth";
import { useCafes } from "@/hooks/useCafes";
import { useFavoriteCafes } from "@/hooks/useFavoriteCafes";
import { usePosts } from "@/hooks/usePosts";

export default function FavoritesView() {
  const { tab } = useLocalSearchParams();
  const { user } = useAuth();
  const { cafes } = useCafes();
  const { favoriteIds, toggleFavorite } = useFavoriteCafes();
  const { posts } = usePosts();

  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tab === "cafes" ? "cafes" : "creations");
  const [toast, setToast] = useState(null);

  const myPosts = useMemo(
    () => posts.filter((post) => post.authorId === user?.uid),
    [posts, user]
  );

  const favoriteCafes = useMemo(
    () => cafes.filter((cafe) => favoriteIds.has(cafe.id)),
    [cafes, favoriteIds]
  );

  const removeFavoriteCafe = (cafe) => {
    toggleFavorite(cafe.id);
    setToast({ text: `Removed "${cafe.name}" from favorites`, onUndo: () => toggleFavorite(cafe.id) });
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
              <Text style={styles.sectionTitle}>Your Posts</Text>
              <Text style={styles.seeAll}>{myPosts.length}</Text>
            </View>
            {myPosts.length > 0 ? (
              <View style={styles.postList}>
                {myPosts.map((post) => (
                  <View key={post.id} style={styles.postCard}>
                    <View style={styles.postDrinkRow}>
                      <View style={styles.postDrink}>
                        <Ionicons name="cafe" size={12} color={Palette.onSecondaryContainer} />
                        <Text style={styles.postDrinkText}>{post.drink}</Text>
                      </View>
                      <View style={styles.postStars}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Ionicons
                            key={n}
                            name="star"
                            size={12}
                            color={n <= post.rating ? Palette.secondary : Palette.surfaceContainerHigh}
                          />
                        ))}
                      </View>
                    </View>
                    {post.comment ? <Text style={styles.postComment}>{post.comment}</Text> : null}
                    <View style={styles.postLoc}>
                      <Ionicons name="location-outline" size={11} color={Palette.onSurfaceVariant} />
                      <Text style={styles.postLocText}>{post.cafeName}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyRow icon="cafe-outline" text="You haven't posted anything yet. Share a drink from the Social tab." />
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Your Cafés</Text>
              <Text style={styles.seeAll}>{favoriteCafes.length}</Text>
            </View>
            {favoriteCafes.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.circleRow}
              >
                {favoriteCafes.map((cafe) => (
                  <View key={cafe.id} style={styles.circleCard}>
                    <View style={styles.circleThumb}>
                      <Ionicons name="cafe" size={38} color={Palette.primary} />
                      <Pressable style={styles.circleHeart} onPress={() => removeFavoriteCafe(cafe)}>
                        <Ionicons name="heart" size={14} color={Palette.error} />
                      </Pressable>
                    </View>
                    <Text style={styles.circleName} numberOfLines={2}>
                      {cafe.name}
                    </Text>
                    <View style={styles.circleSubRow}>
                      <Ionicons name="star" size={11} color={Palette.secondary} />
                      <Text style={styles.circleSub}>
                        {cafe.rating != null ? cafe.rating.toFixed(1) : "No reviews"}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <EmptyRow icon="location" text="No favorite spots yet. Heart a café on the Finder tab to save it here." />
            )}
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
              setToast(null);
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
  sectionTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: Palette.onSurface,
  },
  seeAll: {
    ...Typography.labelLg,
    color: Palette.secondary,
  },

  postList: {
    gap: Spacing.sm,
  },
  postCard: {
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.4)",
    gap: 8,
  },
  postDrinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  postDrink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  postDrinkText: {
    ...Typography.labelMd,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Palette.onSecondaryContainer,
  },
  postStars: {
    flexDirection: "row",
    gap: 2,
  },
  postComment: {
    ...Typography.bodySm,
    lineHeight: 19,
    color: Palette.onSurface,
  },
  postLoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postLocText: {
    ...Typography.labelMd,
    fontSize: 11,
    color: Palette.onSurfaceVariant,
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
