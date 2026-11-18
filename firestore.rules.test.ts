import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import fs from 'fs';

/**
 * Phase 0 Payload-First Security TDD Test Suite
 * Verifies all 12 "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */
export async function runDirtyDozenSecuritySuite(): Promise<void> {
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: 'arbi-sikkhi-security-tdd',
    firestore: {rules},
  });

  try {
    // Seed valid baseline records via security rules disabled context
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const adminDb = ctx.firestore();
      const now = Timestamp.now();
      await setDoc(doc(adminDb, 'users', 'user_alice'), {
        ownerId: 'user_alice',
        email: 'alice@example.com',
        displayName: 'Alice',
        familyName: 'Alice Family',
        createdAt: now,
        updatedAt: now,
      });
      await setDoc(doc(adminDb, 'users', 'user_alice', 'profiles', 'prof_1'), {
        profileId: 'prof_1',
        ownerId: 'user_alice',
        name: 'Alice',
        ageMode: 'standard',
        ageYears: 29,
        preferredTrack: 'quran',
        dailyGoalTier: 'consistent',
        dailyMinutesStudied: 15,
        lastStudyDate: '2026-11-17',
        studyHistory: {'2026-11-17': 15},
        xp: 340,
        weeklyXp: 210,
        streakDays: 7,
        audioSpeed: 1.0,
        masteredLetters: ['alif', 'ba'],
        completedSurahs: ['al-ikhlas'],
        completedScenarios: [],
        downloadedPacks: [],
        srs: {},
        shareOnGlobal: true,
        createdAt: now,
        updatedAt: now,
      });
      await setDoc(doc(adminDb, 'leaderboard_entries', 'user_alice_prof_private'), {
        entryId: 'user_alice_prof_private',
        ownerId: 'user_alice',
        profileId: 'prof_1',
        displayName: 'Arafat',
        familyLabel: 'Alice Family',
        ageMode: 'kids',
        preferredTrack: 'quran',
        publicWeeklyXp: -1,
        totalXp: 120,
        streakDays: 3,
        masteredLettersCount: 2,
        createdAt: now,
        updatedAt: now,
      });
    });

    const unauthDb = testEnv.unauthenticatedContext().firestore();
    const bobDb = testEnv
      .authenticatedContext('user_bob', {email: 'bob@example.com', email_verified: true})
      .firestore();
    const unverifiedAliceDb = testEnv
      .authenticatedContext('user_unverified', {
        email: 'alice@example.com',
        email_verified: false,
      })
      .firestore();
    const aliceDb = testEnv
      .authenticatedContext('user_alice', {
        email: 'alice@example.com',
        email_verified: true,
      })
      .firestore();
    const orphanUserDb = testEnv
      .authenticatedContext('user_orphan', {
        email: 'orphan@example.com',
        email_verified: true,
      })
      .firestore();

    // 1. Unauthenticated PII Scrape
    await assertFails(getDoc(doc(unauthDb, 'users', 'user_alice')));

    // 2. Cross-User PII Leak
    await assertFails(getDoc(doc(bobDb, 'users', 'user_alice')));

    // 3. Unverified Email Spoof
    await assertFails(
      setDoc(doc(unverifiedAliceDb, 'users', 'user_unverified'), {
        ownerId: 'user_unverified',
        email: 'alice@example.com',
        displayName: 'Spoofer',
        familyName: 'Spoof Family',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 4. Shadow / Ghost Privilege Field
    await assertFails(
      setDoc(doc(bobDb, 'users', 'user_bob'), {
        ownerId: 'user_bob',
        email: 'bob@example.com',
        displayName: 'Bob',
        familyName: 'Bob Family',
        isAdmin: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 5. Identity Spoofing on Profile
    await assertFails(
      setDoc(doc(bobDb, 'users', 'user_alice', 'profiles', 'prof_spoof'), {
        profileId: 'prof_spoof',
        ownerId: 'user_alice',
        name: 'Spoof',
        ageMode: 'standard',
        ageYears: 25,
        preferredTrack: 'quran',
        dailyGoalTier: 'consistent',
        dailyMinutesStudied: 0,
        lastStudyDate: '2026-11-17',
        studyHistory: {},
        xp: 0,
        weeklyXp: 0,
        streakDays: 0,
        audioSpeed: 1.0,
        masteredLetters: [],
        completedSurahs: [],
        completedScenarios: [],
        downloadedPacks: [],
        srs: {},
        shareOnGlobal: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 6. Orphaned Subcollection Profile (no parent /users/user_orphan doc)
    await assertFails(
      setDoc(doc(orphanUserDb, 'users', 'user_orphan', 'profiles', 'prof_1'), {
        profileId: 'prof_1',
        ownerId: 'user_orphan',
        name: 'Orphan',
        ageMode: 'standard',
        ageYears: 25,
        preferredTrack: 'quran',
        dailyGoalTier: 'consistent',
        dailyMinutesStudied: 0,
        lastStudyDate: '2026-11-17',
        studyHistory: {},
        xp: 0,
        weeklyXp: 0,
        streakDays: 0,
        audioSpeed: 1.0,
        masteredLetters: [],
        completedSurahs: [],
        completedScenarios: [],
        downloadedPacks: [],
        srs: {},
        shareOnGlobal: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 7. Path ID Poisoning
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'user_alice', 'profiles', 'bad id$!'), {
        profileId: 'bad id$!',
        ownerId: 'user_alice',
        name: 'Alice',
        ageMode: 'standard',
        ageYears: 29,
        preferredTrack: 'quran',
        dailyGoalTier: 'consistent',
        dailyMinutesStudied: 0,
        lastStudyDate: '2026-11-17',
        studyHistory: {},
        xp: 0,
        weeklyXp: 0,
        streakDays: 0,
        audioSpeed: 1.0,
        masteredLetters: [],
        completedSurahs: [],
        completedScenarios: [],
        downloadedPacks: [],
        srs: {},
        shareOnGlobal: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 8. Denial-of-Wallet Array Overflow (> 28 masteredLetters)
    const overflowLetters = Array.from({length: 40}, (_, i) => `letter_${i}`);
    await assertFails(
      updateDoc(doc(aliceDb, 'users', 'user_alice', 'profiles', 'prof_1'), {
        masteredLetters: overflowLetters,
        updatedAt: serverTimestamp(),
      })
    );

    // 9. Immortal Field Mutation (mutating createdAt)
    await assertFails(
      updateDoc(doc(aliceDb, 'users', 'user_alice', 'profiles', 'prof_1'), {
        createdAt: Timestamp.fromMillis(1000),
        updatedAt: serverTimestamp(),
      })
    );

    // 10. Forged Client Timestamp on Create
    await assertFails(
      setDoc(doc(bobDb, 'users', 'user_bob'), {
        ownerId: 'user_bob',
        email: 'bob@example.com',
        displayName: 'Bob',
        familyName: 'Bob Family',
        createdAt: Timestamp.fromMillis(9999999999999),
        updatedAt: serverTimestamp(),
      })
    );

    // 11. Orphaned Leaderboard Spoof (backing profile ghostprof does not exist)
    await assertFails(
      setDoc(doc(aliceDb, 'leaderboard_entries', 'user_alice_ghostprof'), {
        entryId: 'user_alice_ghostprof',
        ownerId: 'user_alice',
        profileId: 'ghostprof',
        displayName: 'Ghost',
        familyLabel: 'Alice Family',
        ageMode: 'standard',
        preferredTrack: 'quran',
        publicWeeklyXp: 9999,
        totalXp: 9999,
        streakDays: 99,
        masteredLettersCount: 28,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 12. Blanket Unfiltered Leaderboard List Query
    await assertFails(getDocs(collection(bobDb, 'leaderboard_entries')));
  } finally {
    await testEnv.cleanup();
  }
}
