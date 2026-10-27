# JOLO roadmap to production

Status as of 2026-10-23. Check items off (`- [x]`) as they land.

## Current state

| Area | State |
|---|---|
| Auth (sign up, sign in, password reset, persisted session) | ✅ Real (Firebase) |
| Finder tab (map, café list, hours, directions, distance) | ✅ Real (Firestore, ~70 Union County cafés) |
| Social feed and post composer | ❌ Hardcoded posts; new posts live in memory only ([social.jsx](../app/main/social.jsx)) |
| Favorites (drinks and cafés) | ❌ Hardcoded lists ([favorites.jsx](../app/main/favorites.jsx)) |
| Notifications panel | ❌ Hardcoded ([NotificationsPanel.jsx](../components/NotificationsPanel.jsx)) |
| Profile | ⚠️ Name and email are real; stats text is hardcoded, edit-avatar button and settings rows do nothing |
| Firestore rules | Only `cafes` and `users`; everything else locked |

**Biggest launch blockers if skipped:** in-app account deletion (item 20), report/block tools for user posts (item 21), and the Android Google Maps API key (item 33).

**Suggested order:** Phases 0 → 1 → 2 in sequence (features depend on the schema and rules). Build Phase 3 items 20–22 alongside Phase 2, not after it. Phases 4–5 can overlap with the end of Phase 2. Rough total: 6–9 weeks for one developer.

---

## Phase 0: Foundation and cleanup (~1–2 days)

- [x] 1. Fix dependency drift: `babel-preset-expo ^55` is installed on Expo SDK 54. Run `npx expo install --fix` and get `npx expo-doctor` passing.
- [x] 2. Delete or fill in [app/+html.jsx](../app/+html.jsx), an empty (0-byte) route file that can break web builds.
- [x] 3. Remove `babel-plugin-module-resolver` (Expo already resolves `@/` from `tsconfig.json`). Remove `@rneui` too unless you plan to use it; only the theme provider uses it now.
- [x] 4. Add tooling: ESLint (`eslint-config-expo`), Prettier, Jest (`jest-expo`) with React Native Testing Library. Optionally migrate to TypeScript file by file.
- [x] 5. CI (GitHub Actions): lint, type-check, unit tests, and Firestore rules tests against the emulator on every PR.
- [ ] 6. Separate Firebase projects (`jolo-dev`, `jolo-prod`), each with its own native config files and bundle IDs, so testing never touches real user data. Steps: [rnfirebase-migration.md](rnfirebase-migration.md) Parts 0–1.

## Phase 1: Data model and backend (~1 week)

- [ ] 7. Firestore schema for the mocked features:
  - `posts/{postId}`: author, café ID, drink, rating, comment, photo path, created time
  - `posts/{id}/likes/{uid}` and `posts/{id}/comments/{id}`
  - `users/{uid}/favorites/{cafeId}`, plus saved drinks
  - One-way follows (decided 2026-10-23): `users/{uid}/following/{targetUid}`, mirrored to `users/{targetUid}/followers/{uid}` by a Cloud Function. No friend requests.
  - `users/{uid}/notifications/{id}`
- [ ] 8. Firestore rules for each collection, tested with `@firebase/rules-unit-testing`: validate field types and sizes, check ownership, make counter fields impossible for clients to write.
- [ ] 9. Cloud Functions for anything clients can't be trusted with: café `ratingSum` / `ratingCount` / `favoriteCount`, user stats (`postCount`, `followerCount`, `followingCount`), notification fan-out, and account-deletion cleanup.
- [ ] 10. Firebase Storage for avatars and post photos, with Storage rules (size/type limits, owner-only writes). Use `expo-image-picker` and resize before upload.
- [ ] 11. Add `firestore.indexes.json` to [firebase.json](../firebase.json) for feed queries (posts by author + time, posts by café + time).
- [x] 12. Switch from Firestore Lite to `@react-native-firebase` (decided 2026-10-23) for realtime listeners, offline cache, and native App Check. Needs dev builds instead of Expo Go. Plan: [rnfirebase-migration.md](rnfirebase-migration.md), starting once item 6's projects exist.

## Phase 2: Finish the features (~2–3 weeks)

- [ ] 13. Social: real feed with pagination (`limit` + `startAfter`); composer writes to `posts` with the café picked from Firestore (not the hardcoded "Aroma & Crema"); likes, comments, optional photos; empty, loading, and error states.
- [ ] 14. Favorites: heart button on Finder cards and café details writes to `users/{uid}/favorites`; the Favorites tab reads from there; "community" sections come from aggregated data.
- [ ] 15. Profile: real stats, avatar upload, edit name and personal info, notification settings (already stored in `users/{uid}/private/account`), "Your Posts", "Saved Cafés".
- [ ] 16. Follows: user search, follow/unfollow, follower and following lists, a feed of people you follow.
- [ ] 17. Notifications: in-app list from Firestore, plus push via `expo-notifications` (device tokens in `private/`, sent from Cloud Functions).
- [ ] 18. Café details screen: deep-linkable route such as `/main/cafe/[id]` with hours, photos, recent posts, rating breakdown.
- [ ] 19. Location UX: when permission is `denied` or `unavailable`, show a banner linking to Settings and fall back to a default map region. [useUserLocation.js](../hooks/useUserLocation.js) reports the status, but the UI doesn't use it yet.

## Phase 3: App Store and Play Store compliance (~1 week; can block approval)

- [ ] 20. In-app account deletion (Apple requirement). Rules currently have `allow delete: if false` and there's no UI. Delete the account, profile, posts, and Storage files through a Cloud Function.
- [ ] 21. Moderation for user content (Apple guideline 1.2): report a post, block a user, a way to act on reports, and a profanity filter or moderation queue for text and images.
- [ ] 22. Email verification (`sendEmailVerification`) before posting is allowed.
- [ ] 23. Sign in with Apple if any other social login is added (required in that case); Google sign-in optional.
- [ ] 24. Privacy policy and Terms of Service at public URLs, linked from sign-up and Profile. Fill out App Store privacy labels and the Play Store Data Safety form (location, email, photos).
- [ ] 25. OpenStreetMap attribution: the café data is ODbL-licensed and needs visible credit (map overlay or About screen).

## Phase 4: Hardening and quality (~1 week dedicated, then ongoing)

- [ ] 26. Firebase App Check (App Attest on iOS, Play Integrity on Android); billing budget alerts; daily Firestore backups.
- [ ] 27. Crash reporting and analytics: Sentry (`@sentry/react-native`) plus Firebase Analytics or PostHog. Replace the `console.warn` calls in [lib/auth.jsx](../lib/auth.jsx) with Sentry breadcrumbs.
- [ ] 28. Tests: unit tests for [lib/hours.js](../lib/hours.js), [lib/geo.js](../lib/geo.js), and [lib/auth-errors.js](../lib/auth-errors.js); rules tests; component tests for the auth screens; an end-to-end smoke test with Maestro (sign up → find a café → post → favorite).
- [ ] 29. Accessibility: only 2 `accessibilityLabel`s exist in the app. Label every icon-only button, check contrast, support dynamic text sizes, test with VoiceOver and TalkBack.
- [ ] 30. Performance: `expo-image` for caching, `FlashList` for the feed, memoized map markers; test on a low-end Android phone.
- [ ] 31. Offline and error states: retry, network-error banners, and guarding every write against double submits.

## Phase 5: Release infrastructure (~3–5 days)

- [ ] 32. EAS: `eas.json` with `development`, `preview`, and `production` profiles; EAS Secrets for per-environment env vars.
- [ ] 33. Fix [app.json](../app.json):
  - Display name `JOLO`, not `JOLO_app`
  - Android Google Maps API key (`android.config.googleMaps.apiKey`) — `react-native-maps` shows a blank map on Android without it
  - `ios.infoPlist` permission strings for photos and camera
  - `runtimeVersion` and `expo-updates` for over-the-air fixes
  - `supportsTablet: false` unless iPad gets its own design
- [ ] 34. Branding: the icons look like Expo defaults, and `splash-icon.png` is identical to `adaptive-icon.png`. Make a real icon, splash screen, and store screenshots.
- [ ] 35. Versioning: automatic build numbers (`autoIncrement` in EAS) and a changelog.

## Phase 6: Beta and launch (~2 weeks)

- [ ] 36. Internal testing via TestFlight and Play Console internal track; fix crashes and feedback.
- [ ] 37. Closed beta with 20–50 local users in Union County. Seed the feed so it isn't empty on day one. Watch Sentry and Firestore costs.
- [ ] 38. Store submission: listings, age rating, review notes, and a demo account for Apple's reviewers.
- [ ] 39. Post-launch: monitoring dashboard, on-call runbook, and a plan for more counties. The Finder reads the whole `cafes` collection ([useCafes.js](../hooks/useCafes.js)), so growing past one county needs geohash queries (e.g. `geofire-common`).
