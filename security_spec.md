# Security Specification — Phase 0: Payload-First Security TDD

## 1. Data Invariants & Master Sources of Truth

1. **PII Isolation (`/users/{userId}`)**:
   - `UserAccount` stores PII (`email`) and is readable/writable **strictly** by `request.auth.uid == userId` with `email_verified == true`. Non-owners can never `get` or `list` `/users/{userId}`.
2. **Master Gate & Subcollection Ownership (`/users/{userId}/profiles/{profileId}`)**:
   - A `LearnerProfile` cannot exist unless its parent `/users/{userId}` document exists (or is created in the same atomic batch via `existsAfter`) and `ownerId == userId == request.auth.uid`.
   - `createdAt`, `ownerId`, and `profileId` are immortal (immutable after creation).
   - Every list and map field (`masteredLetters <= 28`, `completedSurahs <= 114`, `completedScenarios <= 50`, `downloadedPacks <= 20`, `studyHistory <= 31`, `srs <= 250`) is strictly bounded.
3. **Global Leaderboard Relational Integrity & Query Enforcement (`/leaderboard_entries/{entryId}`)**:
   - Zero PII (`email`, `phone`, `address`) is permitted in `LeaderboardEntry` (`hasOnly` strict allowlist).
   - `entryId` must equal `ownerId + "_" + profileId`, and the underlying `/users/{ownerId}/profiles/{profileId}` document must exist (`exists` or `existsAfter`).
   - `allow list` never permits blanket reads: it enforces `resource.data.publicWeeklyXp >= 0` (rejecting unfiltered queries that could expose `-1` family-only entries).
4. **Temporal & Verified Identity Integrity**:
   - All writes require `request.auth != null && request.auth.token.email_verified == true`.
   - `createdAt == request.time` on `create`, `updatedAt == request.time` on `create` and `update`.

---

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return `PERMISSION_DENIED`)

1. **Payload 01 — Unauthenticated PII Scrape**: Unauthenticated `get` on `/users/user_alice`.
2. **Payload 02 — Cross-User PII Leak**: Authenticated `user_bob` (`email_verified: true`) attempts `get` on `/users/user_alice`.
3. **Payload 03 — Unverified Email Spoof**: Authenticated `user_alice` with `email_verified: false` attempts `create` on `/users/user_alice`.
4. **Payload 04 — Shadow / Ghost Privilege Field**: `user_alice` creates `/users/user_alice` with extra field `{"isAdmin": true}`.
5. **Payload 05 — Identity Spoofing on Profile**: `user_bob` creates `/users/user_alice/profiles/prof_1` or sets `ownerId: "user_alice"` under `/users/user_bob/profiles/prof_1`.
6. **Payload 06 — Orphaned Subcollection Profile**: `user_alice` attempts `create` on `/users/user_alice/profiles/prof_1` when `/users/user_alice` does not exist.
7. **Payload 07 — Path ID Poisoning**: `user_alice` attempts `create` on `/users/user_alice/profiles/invalid$id!with spaces`.
8. **Payload 08 — Denial-of-Wallet Array Overflow**: `user_alice` submits `masteredLetters` containing 40 elements (`> 28` max).
9. **Payload 09 — Immortal Field Mutation**: `user_alice` updates `/users/user_alice/profiles/prof_1` modifying `createdAt` or `ownerId`.
10. **Payload 10 — Forged Client Timestamp**: `user_alice` creates `/users/user_alice` with a past/future `createdAt` not matching `request.time`.
11. **Payload 11 — Orphaned Leaderboard Spoof**: `user_alice` creates `/leaderboard_entries/user_alice_ghostprof` where `/users/user_alice/profiles/ghostprof` does not exist.
12. **Payload 12 — Blanket Unfiltered Leaderboard List**: `user_bob` runs an unfiltered `getDocs(collection(db, 'leaderboard_entries'))` without `where('publicWeeklyXp', '>=', 0)` while private (`publicWeeklyXp: -1`) entries exist.
