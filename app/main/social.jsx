import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { Palette } from "@/constants/Colors";
import { Radius, Spacing, Typography } from "@/constants/Typography";
import { useAuth } from "@/lib/auth";
import { useCafes } from "@/hooks/useCafes";
import { usePosts } from "@/hooks/usePosts";

const MAX_CAFE_SUGGESTIONS = 6;
const MAX_TRENDING = 3;

function formatRelativeTime(date) {
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

// Groups posts by drink name (case-insensitive) and ranks by how many people
// posted it, so "trending" reflects what this community is actually drinking.
function trendingDrinks(posts) {
  const groups = new Map();
  for (const post of posts) {
    const key = post.drink.trim().toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, { name: post.drink.trim(), cafeName: post.cafeName, count: 0, ratingSum: 0 });
    }
    const group = groups.get(key);
    group.count += 1;
    group.ratingSum += post.rating;
  }
  return [...groups.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_TRENDING)
    .map((group) => ({ ...group, avgRating: group.ratingSum / group.count }));
}

export default function SocialView() {
  const { user } = useAuth();
  const { cafes } = useCafes();
  const { posts, loading, error, createPost } = usePosts();

  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["75%"], []);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cafeQuery, setCafeQuery] = useState("");
  const [draftCafe, setDraftCafe] = useState(null);
  const [draftDrink, setDraftDrink] = useState("");
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [touched, setTouched] = useState(false);
  const [posting, setPosting] = useState(false);

  const trending = useMemo(() => trendingDrinks(posts), [posts]);

  const cafeSuggestions = useMemo(() => {
    const needle = cafeQuery.trim().toLowerCase();
    if (!needle) return [];
    return cafes.filter((cafe) => cafe.name.toLowerCase().includes(needle)).slice(0, MAX_CAFE_SUGGESTIONS);
  }, [cafes, cafeQuery]);

  const openComposer = () => sheetRef.current?.expand();
  const closeComposer = () => sheetRef.current?.close();

  const resetDraft = () => {
    setDraftCafe(null);
    setCafeQuery("");
    setDraftDrink("");
    setDraftRating(0);
    setDraftComment("");
    setTouched(false);
  };

  const submitPost = async () => {
    if (!draftCafe || !draftDrink.trim() || draftRating === 0) {
      setTouched(true);
      return;
    }
    setPosting(true);
    try {
      await createPost({
        authorId: user.uid,
        authorName: user.displayName ?? "JOLO member",
        cafeId: draftCafe.id,
        cafeName: draftCafe.name,
        drink: draftDrink.trim(),
        rating: draftRating,
        comment: draftComment.trim(),
      });
      resetDraft();
      closeComposer();
    } catch {
      // Left as a draft the user can retry; posting is rare enough that a
      // silent retry-on-close isn't worth building yet.
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={Palette.primary} />
          </View>
          <Text style={styles.headerTitle}>Social</Text>
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
      </SafeAreaView>

      {loading ? (
        <View style={styles.centerMessage}>
          <ActivityIndicator color={Palette.secondary} />
        </View>
      ) : error ? (
        <View style={styles.centerMessage}>
          <Text style={styles.messageText}>Couldn't load the feed. Check your connection.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {trending.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Trending Drinks</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingRow}
              >
                {trending.map((item) => (
                  <View key={item.name} style={styles.trendCard}>
                    <View style={styles.trendIcon}>
                      <Ionicons name="cafe" size={28} color={Palette.primary} />
                    </View>
                    <Text style={styles.trendName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View style={styles.trendRating}>
                      <Ionicons name="star" size={12} color={Palette.secondary} />
                      <Text style={styles.trendRatingText}>
                        {item.avgRating.toFixed(1)} · {item.count} {item.count === 1 ? "post" : "posts"}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={styles.sectionTitle}>Community Feed</Text>
          {posts.length === 0 ? (
            <View style={styles.emptyFeed}>
              <Ionicons name="cafe-outline" size={28} color={Palette.onSurfaceVariant} />
              <Text style={styles.emptyFeedText}>
                No posts yet. Be the first to share what you're drinking.
              </Text>
            </View>
          ) : (
            <View style={styles.feedList}>
              {posts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHead}>
                    <View style={styles.postAvatar}>
                      <Ionicons name="person" size={16} color={Palette.primary} />
                    </View>
                    <View>
                      <Text style={styles.postUser}>{post.authorName}</Text>
                      <Text style={styles.postTime}>{formatRelativeTime(post.createdAt)}</Text>
                    </View>
                  </View>
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
                          size={13}
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
          )}
        </ScrollView>
      )}

      <Pressable style={({ pressed }) => [styles.fab, pressed && styles.pressed]} onPress={openComposer}>
        <Ionicons name="add" size={26} color={Palette.onPrimary} />
      </Pressable>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleStyle={styles.sheetHandleArea}
        handleIndicatorStyle={styles.handle}
        keyboardBehavior="extend"
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.composerScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.drawerHead}>
            <Text style={styles.drawerTitle}>Post a Drink</Text>
            <Pressable onPress={closeComposer} hitSlop={8}>
              <Ionicons name="close" size={20} color={Palette.onSurfaceVariant} />
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>Drink</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. Oat Milk Cortado"
            placeholderTextColor="rgba(79,68,66,0.5)"
            value={draftDrink}
            onChangeText={setDraftDrink}
          />

          <Text style={styles.fieldLabel}>Your Rating</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setDraftRating(n)} hitSlop={4}>
                <Ionicons
                  name="star"
                  size={30}
                  color={n <= draftRating ? Palette.secondary : Palette.surfaceContainerHigh}
                />
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Comment</Text>
          <TextInput
            style={styles.textarea}
            placeholder="What did you think?"
            placeholderTextColor="rgba(79,68,66,0.5)"
            value={draftComment}
            onChangeText={setDraftComment}
            multiline
          />

          <Text style={styles.fieldLabel}>Café</Text>
          {draftCafe ? (
            <View style={styles.locationChip}>
              <Ionicons name="location-outline" size={13} color={Palette.onSurfaceVariant} />
              <Text style={styles.locationChipText}>{draftCafe.name}</Text>
              <Pressable onPress={() => setDraftCafe(null)} hitSlop={8}>
                <Ionicons name="close" size={14} color={Palette.onSurfaceVariant} />
              </Pressable>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.fieldInput}
                placeholder="Search cafés"
                placeholderTextColor="rgba(79,68,66,0.5)"
                value={cafeQuery}
                onChangeText={setCafeQuery}
              />
              {cafeSuggestions.length > 0 && (
                <View style={styles.chipRow}>
                  {cafeSuggestions.map((cafe) => (
                    <Pressable
                      key={cafe.id}
                      onPress={() => {
                        setDraftCafe(cafe);
                        setCafeQuery("");
                      }}
                      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                    >
                      <Text style={styles.chipLabel}>{cafe.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}

          {touched && (!draftCafe || !draftDrink.trim() || draftRating === 0) && (
            <Text style={styles.hint}>Pick a café, a drink, and a rating before posting.</Text>
          )}

          <Pressable
            style={({ pressed }) => [styles.postBtn, pressed && styles.pressed, posting && styles.btnBusy]}
            onPress={submitPost}
            disabled={posting}
          >
            {posting ? (
              <ActivityIndicator color={Palette.onPrimary} />
            ) : (
              <Text style={styles.postBtnLabel}>Post to Feed</Text>
            )}
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheet>
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

  centerMessage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.marginMain,
  },
  messageText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
  },

  scroll: {
    paddingHorizontal: Spacing.marginMain,
    paddingBottom: 110,
  },
  sectionTitle: {
    ...Typography.headlineSm,
    color: Palette.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  trendingRow: {
    gap: 14,
    paddingRight: Spacing.marginMain,
    paddingBottom: 4,
  },
  trendCard: {
    width: 140,
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.4)",
  },
  trendIcon: {
    width: "100%",
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Palette.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  trendName: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    lineHeight: 18,
    color: Palette.onSurface,
  },
  trendRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  trendRatingText: {
    ...Typography.labelMd,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Palette.secondary,
  },

  emptyFeed: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(211,195,192,0.6)",
  },
  emptyFeedText: {
    ...Typography.bodySm,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 240,
  },

  feedList: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  postCard: {
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.4)",
  },
  postHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Palette.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  postUser: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    color: Palette.onSurface,
  },
  postTime: {
    ...Typography.labelMd,
    fontSize: 11,
    color: Palette.onSurfaceVariant,
    marginTop: 1,
  },
  postDrinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
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
    marginTop: 10,
  },
  postLoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  postLocText: {
    ...Typography.labelMd,
    fontSize: 11,
    color: Palette.onSurfaceVariant,
  },

  fab: {
    position: "absolute",
    right: Spacing.marginMain,
    bottom: 104,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1e0f0a",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  sheetBg: {
    backgroundColor: Palette.surfaceContainerLowest,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
  composerScroll: {
    paddingHorizontal: Spacing.marginMain,
    paddingBottom: 32,
  },
  drawerHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  drawerTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: Palette.primary,
  },
  fieldLabel: {
    ...Typography.labelMd,
    fontFamily: "PlusJakartaSans_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: Palette.onSurfaceVariant,
    marginBottom: 8,
    marginTop: 18,
  },
  fieldInput: {
    ...Typography.bodyMd,
    fontSize: 14,
    color: Palette.onSurface,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.6)",
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.6)",
    backgroundColor: Palette.surfaceContainerLowest,
  },
  chipLabel: {
    ...Typography.labelMd,
    color: Palette.onSurface,
  },
  starRow: {
    flexDirection: "row",
    gap: 6,
  },
  textarea: {
    ...Typography.bodyMd,
    fontSize: 14,
    color: Palette.onSurface,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: "rgba(211,195,192,0.6)",
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 76,
    textAlignVertical: "top",
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: Palette.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  locationChipText: {
    ...Typography.labelMd,
    color: Palette.onSurfaceVariant,
  },
  hint: {
    ...Typography.labelMd,
    fontSize: 11,
    color: Palette.error,
    marginTop: 8,
  },
  btnBusy: {
    opacity: 0.7,
  },
  postBtn: {
    marginTop: 22,
    backgroundColor: Palette.primary,
    paddingVertical: 15,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnLabel: {
    ...Typography.labelLg,
    color: Palette.onPrimary,
  },

  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});
