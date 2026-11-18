import {initializeApp} from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type {
  AgeMode,
  DailyGoalTier,
  FamilyProfile,
  GlobalLeaderboardEntry,
  SRSCardState,
  TrackId,
} from './types';

// Initialize Firebase App, Firestore (with named database ID), and Google Auth
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({prompt: 'select_account'});

// Exact Blueprint Validation Constants (Verbatim Synchronicity with firebase-blueprint.json & firestore.rules)
export const BLUEPRINT_LIMITS = {
  ID_MAX_LEN: 128,
  PROFILE_ID_MAX_LEN: 64,
  ID_PATTERN: /^[a-zA-Z0-9_\-]+$/,
  DATE_PATTERN: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
  EMAIL_MIN_LEN: 3,
  EMAIL_MAX_LEN: 254,
  DISPLAY_NAME_MAX_LEN: 80,
  FAMILY_NAME_MAX_LEN: 80,
  LEARNER_NAME_MAX_LEN: 60,
  MAX_MASTERED_LETTERS: 28,
  MAX_COMPLETED_SURAHS: 114,
  MAX_COMPLETED_SCENARIOS: 50,
  MAX_DOWNLOADED_PACKS: 20,
  MAX_STUDY_HISTORY_KEYS: 31,
  MAX_SRS_KEYS: 250,
} as const;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connectivity verification per Firebase skill guidelines
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

export function sanitizeDocId(raw: string, maxLen: number): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, maxLen);
  return cleaned.length > 0 ? cleaned : `id_${Date.now()}`;
}

function clampInt(val: number | undefined, min: number, max: number): number {
  const n = Number.isFinite(val) ? Math.round(val as number) : min;
  return Math.max(min, Math.min(max, n));
}

function sanitizeStringArray(arr: string[] | undefined, maxItems: number): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim().slice(0, 64))
    .slice(0, maxItems);
}

function sanitizeStudyHistory(
  history: Record<string, number> | undefined
): Record<string, number> {
  if (!history || typeof history !== 'object') return {};
  const entries = Object.entries(history)
    .filter(([k]) => BLUEPRINT_LIMITS.DATE_PATTERN.test(k))
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, BLUEPRINT_LIMITS.MAX_STUDY_HISTORY_KEYS)
    .map(([k, v]) => [k, clampInt(v, 0, 1440)] as const);
  return Object.fromEntries(entries);
}

function sanitizeSrsMap(
  srs: Record<string, SRSCardState> | undefined
): Record<string, SRSCardState> {
  if (!srs || typeof srs !== 'object') return {};
  const entries = Object.entries(srs)
    .slice(0, BLUEPRINT_LIMITS.MAX_SRS_KEYS)
    .map(([k, v]) => [
      k.slice(0, 64),
      {
        cardId: String(v.cardId || k).slice(0, 64),
        intervalDays: clampInt(v.intervalDays, 0, 3650),
        easeFactor: Math.max(1.3, Math.min(4.0, Number(v.easeFactor) || 2.5)),
        dueTimestamp: clampInt(v.dueTimestamp, 0, 9999999999999),
        repetitions: clampInt(v.repetitions, 0, 10000),
      },
    ]);
  return Object.fromEntries(entries);
}

export function deriveFamilyLabel(user: User): string {
  const base = (user.displayName || user.email?.split('@')[0] || 'Learner').trim();
  const label = `${base} Family`.slice(0, BLUEPRINT_LIMITS.FAMILY_NAME_MAX_LEN);
  return label.length > 0 ? label : 'Arbi Sikkhi Family';
}

function getFallbackTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildSanitizedProfilePayload(ownerId: string, profile: FamilyProfile) {
  const safeProfileId = sanitizeDocId(profile.id, BLUEPRINT_LIMITS.PROFILE_ID_MAX_LEN);
  const safeOwnerId = sanitizeDocId(ownerId, BLUEPRINT_LIMITS.ID_MAX_LEN);
  const safeName =
    (profile.name || 'Learner').trim().slice(0, BLUEPRINT_LIMITS.LEARNER_NAME_MAX_LEN) ||
    'Learner';
  const ageMode: AgeMode =
    profile.ageMode === 'kids' || profile.ageMode === 'senior'
      ? profile.ageMode
      : 'standard';
  const preferredTrack: TrackId =
    profile.preferredTrack === 'msa' || profile.preferredTrack === 'gulf'
      ? profile.preferredTrack
      : 'quran';
  const dailyGoalTier: DailyGoalTier =
    profile.dailyGoalTier === 'casual' || profile.dailyGoalTier === 'intensive'
      ? profile.dailyGoalTier
      : 'consistent';
  const lastStudyDate =
    profile.lastStudyDate && BLUEPRINT_LIMITS.DATE_PATTERN.test(profile.lastStudyDate)
      ? profile.lastStudyDate
      : getFallbackTodayKey();
  const shareOnGlobal =
    typeof profile.shareOnGlobal === 'boolean'
      ? profile.shareOnGlobal
      : ageMode !== 'kids';

  return {
    profileId: safeProfileId,
    ownerId: safeOwnerId,
    name: safeName,
    ageMode,
    ageYears: clampInt(profile.ageYears, 3, 100),
    preferredTrack,
    dailyGoalTier,
    dailyMinutesStudied: clampInt(profile.dailyMinutesStudied, 0, 1440),
    lastStudyDate,
    studyHistory: sanitizeStudyHistory(profile.studyHistory),
    xp: clampInt(profile.xp, 0, 1000000),
    weeklyXp: clampInt(profile.weeklyXp ?? profile.xp, 0, 100000),
    streakDays: clampInt(profile.streakDays, 0, 10000),
    audioSpeed: Math.max(0.5, Math.min(2.0, Number(profile.audioSpeed) || 1.0)),
    masteredLetters: sanitizeStringArray(
      profile.masteredLetters,
      BLUEPRINT_LIMITS.MAX_MASTERED_LETTERS
    ),
    completedSurahs: sanitizeStringArray(
      profile.completedSurahs,
      BLUEPRINT_LIMITS.MAX_COMPLETED_SURAHS
    ),
    completedScenarios: sanitizeStringArray(
      profile.completedScenarios,
      BLUEPRINT_LIMITS.MAX_COMPLETED_SCENARIOS
    ),
    downloadedPacks: sanitizeStringArray(
      profile.downloadedPacks,
      BLUEPRINT_LIMITS.MAX_DOWNLOADED_PACKS
    ),
    srs: sanitizeSrsMap(profile.srs),
    shareOnGlobal,
  };
}

export function buildSanitizedLeaderboardPayload(
  ownerId: string,
  familyLabel: string,
  profile: FamilyProfile
) {
  const sanitizedProfile = buildSanitizedProfilePayload(ownerId, profile);
  const entryId = `${sanitizedProfile.ownerId}_${sanitizedProfile.profileId}`.slice(
    0,
    BLUEPRINT_LIMITS.ID_MAX_LEN
  );
  const publicWeeklyXp = sanitizedProfile.shareOnGlobal
    ? sanitizedProfile.weeklyXp
    : -1;

  return {
    entryId,
    ownerId: sanitizedProfile.ownerId,
    profileId: sanitizedProfile.profileId,
    displayName: sanitizedProfile.name,
    familyLabel:
      familyLabel.trim().slice(0, BLUEPRINT_LIMITS.FAMILY_NAME_MAX_LEN) || 'Family Unit',
    ageMode: sanitizedProfile.ageMode,
    preferredTrack: sanitizedProfile.preferredTrack,
    publicWeeklyXp,
    totalXp: sanitizedProfile.xp,
    streakDays: sanitizedProfile.streakDays,
    masteredLettersCount: sanitizedProfile.masteredLetters.length,
  };
}

export async function signInWithGooglePopup(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOutAccount(): Promise<void> {
  await signOut(auth);
}

/**
 * Ensures /users/{uid} account exists and seeds initial local profiles if the cloud account has none yet,
 * or returns the existing cloud profiles so progress persists across sessions and devices.
 */
export async function bootstrapUserCloudAccount(
  user: User,
  localProfiles: FamilyProfile[]
): Promise<FamilyProfile[]> {
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  const familyLabel = deriveFamilyLabel(user);
  const displayName =
    (user.displayName || user.email?.split('@')[0] || 'Learner')
      .trim()
      .slice(0, BLUEPRINT_LIMITS.DISPLAY_NAME_MAX_LEN) || 'Learner';
  const email = (user.email || 'verified@example.com')
    .trim()
    .slice(0, BLUEPRINT_LIMITS.EMAIL_MAX_LEN);

  let accountExists = false;
  try {
    const snap = await getDoc(userRef);
    accountExists = snap.exists();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, userPath);
  }

  const profilesColPath = `users/${user.uid}/profiles`;
  let existingCloudProfiles: FamilyProfile[] = [];
  if (accountExists) {
    try {
      const q = query(
        collection(db, 'users', user.uid, 'profiles'),
        where('ownerId', '==', user.uid)
      );
      const snap = await getDocs(q);
      existingCloudProfiles = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.profileId || d.id),
          name: String(data.name || 'Learner'),
          ageMode: (data.ageMode as AgeMode) || 'standard',
          ageYears: Number(data.ageYears) || 25,
          preferredTrack: (data.preferredTrack as TrackId) || 'quran',
          dailyGoalTier: (data.dailyGoalTier as DailyGoalTier) || 'consistent',
          dailyMinutesStudied: Number(data.dailyMinutesStudied) || 0,
          lastStudyDate: String(data.lastStudyDate || getFallbackTodayKey()),
          studyHistory: (data.studyHistory as Record<string, number>) || {},
          xp: Number(data.xp) || 0,
          weeklyXp: Number(data.weeklyXp ?? data.xp) || 0,
          streakDays: Number(data.streakDays) || 1,
          audioSpeed: Number(data.audioSpeed) || 1.0,
          masteredLetters: (data.masteredLetters as string[]) || [],
          completedSurahs: (data.completedSurahs as string[]) || [],
          completedScenarios: (data.completedScenarios as string[]) || [],
          downloadedPacks: (data.downloadedPacks as string[]) || [],
          srs: (data.srs as Record<string, SRSCardState>) || {},
          shareOnGlobal:
            typeof data.shareOnGlobal === 'boolean'
              ? data.shareOnGlobal
              : data.ageMode !== 'kids',
        };
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, profilesColPath);
    }
  }

  if (existingCloudProfiles.length > 0) {
    return existingCloudProfiles;
  }

  // First-time cloud sync: atomically create UserAccount + LearnerProfiles + LeaderboardEntries
  const batch = writeBatch(db);
  if (!accountExists) {
    batch.set(userRef, {
      ownerId: user.uid,
      email,
      displayName,
      familyName: familyLabel,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.update(userRef, {
      email,
      displayName,
      familyName: familyLabel,
      updatedAt: serverTimestamp(),
    });
  }

  const normalizedOut: FamilyProfile[] = [];
  for (const prof of localProfiles.slice(0, 10)) {
    const cleanProf = buildSanitizedProfilePayload(user.uid, prof);
    const profRef = doc(db, 'users', user.uid, 'profiles', cleanProf.profileId);
    batch.set(profRef, {
      ...cleanProf,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const lbPayload = buildSanitizedLeaderboardPayload(user.uid, familyLabel, {
      ...prof,
      id: cleanProf.profileId,
      shareOnGlobal: cleanProf.shareOnGlobal,
      weeklyXp: cleanProf.weeklyXp,
    });
    const lbRef = doc(db, 'leaderboard_entries', lbPayload.entryId);
    batch.set(lbRef, {
      ...lbPayload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    normalizedOut.push({
      ...prof,
      id: cleanProf.profileId,
      weeklyXp: cleanProf.weeklyXp,
      shareOnGlobal: cleanProf.shareOnGlobal,
    });
  }

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }

  return normalizedOut;
}

/**
 * Syncs a single learner profile + its leaderboard entry to Firestore.
 */
export async function syncSingleProfileToCloud(
  user: User,
  profile: FamilyProfile
): Promise<void> {
  const familyLabel = deriveFamilyLabel(user);
  const cleanProf = buildSanitizedProfilePayload(user.uid, profile);
  const profPath = `users/${user.uid}/profiles/${cleanProf.profileId}`;
  const profRef = doc(db, 'users', user.uid, 'profiles', cleanProf.profileId);

  const lbPayload = buildSanitizedLeaderboardPayload(user.uid, familyLabel, {
    ...profile,
    id: cleanProf.profileId,
    shareOnGlobal: cleanProf.shareOnGlobal,
    weeklyXp: cleanProf.weeklyXp,
  });
  const lbPath = `leaderboard_entries/${lbPayload.entryId}`;
  const lbRef = doc(db, 'leaderboard_entries', lbPayload.entryId);

  let profExists = false;
  try {
    const pSnap = await getDoc(profRef);
    profExists = pSnap.exists();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, profPath);
  }

  if (!profExists) {
    try {
      await setDoc(profRef, {
        ...cleanProf,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, profPath);
    }
  } else {
    try {
      const {profileId: _pid, ownerId: _oid, ...mutableProfFields} = cleanProf;
      await updateDoc(profRef, {
        ...mutableProfFields,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, profPath);
    }
  }

  let lbExists = false;
  try {
    const lSnap = await getDoc(lbRef);
    lbExists = lSnap.exists();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, lbPath);
  }

  if (!lbExists) {
    try {
      await setDoc(lbRef, {
        ...lbPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, lbPath);
    }
  } else {
    try {
      const {
        entryId: _eid,
        ownerId: _loid,
        profileId: _lpid,
        ...mutableLbFields
      } = lbPayload;
      await updateDoc(lbRef, {
        ...mutableLbFields,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, lbPath);
    }
  }
}

export async function deleteProfileFromCloud(
  user: User,
  profileId: string
): Promise<void> {
  const safeProfileId = sanitizeDocId(profileId, BLUEPRINT_LIMITS.PROFILE_ID_MAX_LEN);
  const entryId = `${user.uid}_${safeProfileId}`.slice(0, BLUEPRINT_LIMITS.ID_MAX_LEN);
  const lbPath = `leaderboard_entries/${entryId}`;
  const profPath = `users/${user.uid}/profiles/${safeProfileId}`;

  try {
    const lbRef = doc(db, 'leaderboard_entries', entryId);
    const snap = await getDoc(lbRef);
    if (snap.exists()) {
      await deleteDoc(lbRef);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, lbPath);
  }

  try {
    await deleteDoc(doc(db, 'users', user.uid, 'profiles', safeProfileId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, profPath);
  }
}

/**
 * Real-time subscription to public Global Leaderboard entries (requires authenticated user).
 */
export function subscribeGlobalLeaderboard(
  onUpdate: (entries: GlobalLeaderboardEntry[]) => void,
  onErrorCallback?: (err: unknown) => void
): Unsubscribe {
  const path = 'leaderboard_entries';
  const q = query(
    collection(db, 'leaderboard_entries'),
    where('publicWeeklyXp', '>=', 0),
    orderBy('publicWeeklyXp', 'desc'),
    limit(30)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: GlobalLeaderboardEntry[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          entryId: String(data.entryId || d.id),
          ownerId: String(data.ownerId || ''),
          profileId: String(data.profileId || ''),
          displayName: String(data.displayName || 'Learner'),
          familyLabel: String(data.familyLabel || 'Family Unit'),
          ageMode: (data.ageMode as AgeMode) || 'standard',
          preferredTrack: (data.preferredTrack as TrackId) || 'quran',
          publicWeeklyXp: Number(data.publicWeeklyXp) || 0,
          totalXp: Number(data.totalXp) || 0,
          streakDays: Number(data.streakDays) || 0,
          masteredLettersCount: Number(data.masteredLettersCount) || 0,
        };
      });
      onUpdate(items);
    },
    (error) => {
      if (onErrorCallback) {
        onErrorCallback(error);
      }
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged structured FirestoreErrorInfo via handleFirestoreError
      }
    }
  );
}
