import React, {useEffect, useRef, useState} from 'react';
import type {User} from 'firebase/auth';
import {onAuthStateChanged} from 'firebase/auth';
import {
  BookOpen,
  CheckCircle2,
  Cloud,
  Compass,
  Download,
  Languages,
  LogIn,
  Map as MapIcon,
  MessageSquare,
  PenTool,
  Plus,
  Target,
  UserCheck,
  Volume2,
} from 'lucide-react';
import {ARABIC_LETTERS, QURAN_LESSONS} from './data/curriculum';
import {UI_STRINGS} from './data/i18n';
import {
  ALL_SCIENTIFIC_STAGES,
  ZERO_TO_ARABIC_STAGES,
  ZERO_TO_QURAN_STAGES,
} from './data/scientificPathway';
import {
  auth,
  BLUEPRINT_LIMITS,
  bootstrapUserCloudAccount,
  signInWithGooglePopup,
  signOutAccount,
  subscribeGlobalLeaderboard,
  syncSingleProfileToCloud,
} from './firebase';
import type {
  AgeMode,
  DailyGoalTier,
  DeepLabTarget,
  FamilyProfile,
  GlobalLeaderboardEntry,
  Language,
  NavTab,
  ScientificStage,
  SmartScheduleSessionType,
  TrackId,
} from './types';
import {playArabicAudio, prefetchOfflineAudioPack} from './utils/audioPlayer';
import {ThreeDPressableCard} from './components/Tactile3DCards';
import {OfflineIndicator, PWAInstallButton} from './components/PWAWidgets';
import {AndroidBlueprintModal} from './components/AndroidBlueprintModal';
import {DetailedScientificRoadmapModal} from './components/DetailedScientificRoadmapModal';
import {WeeklyActivityChart} from './components/WeeklyActivityChart';
import {DailyGoalNotificationToast} from './components/DailyGoalNotificationToast';
import {AchievementBadgesSection} from './components/AchievementBadgesSection';
import {FamilyGlobalLeaderboard} from './components/FamilyGlobalLeaderboard';
import {ScientificPathwaySection} from './components/ScientificPathwaySection';
import {SmartDailyScheduleCard} from './components/SmartDailyScheduleCard';
import {QuranicWisdomWidget} from './components/QuranicWisdomWidget';
import {MonthlyStreakCalendar} from './components/MonthlyStreakCalendar';
import {AlphabetMakhrajView} from './views/AlphabetMakhrajView';
import {QuranRootsView} from './views/QuranRootsView';
import {SpokenGulfMsaView} from './views/SpokenGulfMsaView';
import {VirtualUstadView} from './views/VirtualUstadView';

const STORAGE_KEY = 'arbi_sikkhi_family_state_v1';

const DAILY_GOAL_MINUTES: Record<DailyGoalTier, number> = {
  casual: 5,
  consistent: 15,
  intensive: 30,
};

function getDateKeyDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTodayDateKey(): string {
  return getDateKeyDaysAgo(0);
}

function buildSeededHistory(pastDays: number[], todayMin: number): Record<string, number> {
  const history: Record<string, number> = {};
  pastDays.forEach((mins, idx) => {
    const daysAgo = pastDays.length - idx;
    history[getDateKeyDaysAgo(daysAgo)] = mins;
  });
  history[getTodayDateKey()] = todayMin;
  return history;
}

const INITIAL_PROFILES: FamilyProfile[] = [
  {
    id: 'jahid-standard',
    name: 'জাহিদ (Jahid)',
    ageMode: 'standard',
    ageYears: 29,
    preferredTrack: 'quran',
    dailyGoalTier: 'consistent',
    dailyMinutesStudied: 9,
    lastStudyDate: getTodayDateKey(),
    studyHistory: buildSeededHistory(
      [15, 22, 18, 0, 15, 21, 19, 10, 15, 24, 16, 0, 14, 18, 22, 15, 0, 12, 16, 18, 15, 20, 17],
      9
    ),
    xp: 340,
    weeklyXp: 210,
    streakDays: 5,
    audioSpeed: 1.0,
    masteredLetters: ['alif', 'ba', 'ta', 'tha', 'jeem'],
    completedSurahs: ['al-ikhlas'],
    completedScenarios: ['q_step_01_shapes', 'q_step_02_joining', 'ar_step_01_comprehensible'],
    downloadedPacks: [],
    srs: {},
    shareOnGlobal: true,
  },
  {
    id: 'arafat-kids',
    name: 'আরাফাত (Arafat)',
    ageMode: 'kids',
    ageYears: 7,
    preferredTrack: 'quran',
    dailyGoalTier: 'casual',
    dailyMinutesStudied: 3,
    lastStudyDate: getTodayDateKey(),
    studyHistory: buildSeededHistory(
      [5, 8, 0, 6, 9, 5, 0, 4, 7, 10, 5, 0, 6, 8, 5, 3, 7, 5, 0, 6, 4, 7, 6],
      3
    ),
    xp: 180,
    weeklyXp: 135,
    streakDays: 3,
    audioSpeed: 0.85,
    masteredLetters: ['alif', 'ba'],
    completedSurahs: [],
    completedScenarios: ['q_step_01_shapes'],
    downloadedPacks: [],
    srs: {},
    shareOnGlobal: false,
  },
  {
    id: 'karim-senior',
    name: 'আব্দুল করিম (Baba)',
    ageMode: 'senior',
    ageYears: 64,
    preferredTrack: 'quran',
    dailyGoalTier: 'consistent',
    dailyMinutesStudied: 12,
    lastStudyDate: getTodayDateKey(),
    studyHistory: buildSeededHistory(
      [15, 20, 17, 15, 23, 18, 0, 15, 19, 21, 16, 15, 25, 0, 18, 20, 16, 15, 18, 16, 20, 15, 19],
      12
    ),
    xp: 260,
    weeklyXp: 245,
    streakDays: 9,
    audioSpeed: 0.7,
    masteredLetters: ['alif', 'ba', 'ta', 'dal', 'ra', 'seen', 'meem', 'noon'],
    completedSurahs: ['al-fatihah'],
    completedScenarios: ['q_step_01_shapes', 'q_step_02_joining', 'q_step_03_harakat'],
    downloadedPacks: [],
    srs: {},
    shareOnGlobal: true,
  },
];

function normalizeProfileDailyState(profile: FamilyProfile): FamilyProfile {
  const today = getTodayDateKey();
  const fallbackTier: DailyGoalTier = profile.ageMode === 'kids' ? 'casual' : 'consistent';
  const tier = profile.dailyGoalTier || fallbackTier;
  const target = DAILY_GOAL_MINUTES[tier];
  const minutes =
    profile.lastStudyDate === today
      ? profile.dailyMinutesStudied ?? 0
      : profile.lastStudyDate === undefined
      ? profile.dailyMinutesStudied ?? (profile.xp > 0 ? Math.min(target - 2, Math.max(2, Math.round(profile.xp / 40))) : 0)
      : 0;

  let history = profile.studyHistory ? {...profile.studyHistory} : undefined;
  if (!history) {
    if (profile.streakDays > 1 || profile.xp > 0) {
      const seededPast = [1, 2, 3, 4, 5, 6].map((offsetIdx) => {
        const daysAgo = 7 - offsetIdx;
        return daysAgo <= profile.streakDays
          ? target + ((offsetIdx * 2) % 5)
          : Math.max(0, Math.round(target * 0.6));
      });
      history = buildSeededHistory(seededPast, Math.max(0, minutes));
    } else {
      history = {[today]: Math.max(0, minutes)};
    }
  } else {
    const defaultSeeded = INITIAL_PROFILES.find((sp) => sp.id === profile.id);
    if (defaultSeeded?.studyHistory && Object.keys(history).length <= 8) {
      history = {...defaultSeeded.studyHistory, ...history};
    }
    history[today] = Math.max(0, minutes);
  }

  // Keep at most 31 recent entries so profile state always satisfies Firestore's <= 31 map limit
  const boundedEntries = Object.entries(history)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, BLUEPRINT_LIMITS.MAX_STUDY_HISTORY_KEYS);
  history = Object.fromEntries(boundedEntries);

  let weeklyMinutesTotal = 0;
  for (let d = 0; d < 7; d++) {
    weeklyMinutesTotal += Number(history[getDateKeyDaysAgo(d)]) || 0;
  }
  const derivedWeeklyXp =
    typeof profile.weeklyXp === 'number'
      ? profile.weeklyXp
      : Math.min(profile.xp, Math.max(0, Math.round(weeklyMinutesTotal * 2.1)));
  const shareOnGlobal =
    typeof profile.shareOnGlobal === 'boolean'
      ? profile.shareOnGlobal
      : profile.ageMode !== 'kids';

  return {
    ...profile,
    dailyGoalTier: tier,
    dailyMinutesStudied: Math.max(0, minutes),
    lastStudyDate: today,
    studyHistory: history,
    weeklyXp: derivedWeeklyXp,
    shareOnGlobal,
  };
}

export default function App() {
  const [lang, setLang] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [alphabetSubTab, setAlphabetSubTab] = useState<'letters' | 'harakat' | 'voice_quiz'>('letters');
  const [quranSection, setQuranSection] = useState<'surah' | 'roots' | 'srs'>('surah');
  const [showHarakat, setShowHarakat] = useState(true);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [focusedStageRequest, setFocusedStageRequest] = useState<{
    stageId: string;
    nonce: number;
  } | null>(null);

  // Family Multi-Profile State persisted in localStorage
  const [profiles, setProfiles] = useState<FamilyProfile[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FamilyProfile[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProfileDailyState);
        }
      }
    } catch {
      // Fallback to defaults
    }
    return INITIAL_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => profiles[0].id);
  const [showNewProfileForm, setShowNewProfileForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAgeMode, setNewProfileAgeMode] = useState<AgeMode>('standard');
  const [newProfileGoalTier, setNewProfileGoalTier] = useState<DailyGoalTier>('consistent');

  // Offline Pack Download Progress
  const [isDownloadingPack, setIsDownloadingPack] = useState(false);
  const [packProgress, setPackProgress] = useState<string | null>(null);

  // Firebase Cloud Account & Real-Time Global Leaderboard State
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [globalEntries, setGlobalEntries] = useState<GlobalLeaderboardEntry[]>([]);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  const profilesRef = useRef<FamilyProfile[]>(profiles);
  profilesRef.current = profiles;
  const bootstrappedUidRef = useRef<string | null>(null);
  const syncTimersRef = useRef<Record<string, number>>({});

  const queueProfileCloudSync = (profileToSync: FamilyProfile) => {
    const currentUser = auth.currentUser;
    if (!currentUser || bootstrappedUidRef.current !== currentUser.uid) return;
    const key = profileToSync.id;
    if (syncTimersRef.current[key]) {
      window.clearTimeout(syncTimersRef.current[key]);
    }
    syncTimersRef.current[key] = window.setTimeout(async () => {
      const activeUser = auth.currentUser;
      if (!activeUser) return;
      setIsSyncingCloud(true);
      try {
        await syncSingleProfileToCloud(activeUser, profileToSync);
      } finally {
        setIsSyncingCloud(false);
      }
    }, 450);
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (user) {
        if (bootstrappedUidRef.current !== user.uid) {
          bootstrappedUidRef.current = user.uid;
          setIsSyncingCloud(true);
          try {
            const cloudProfiles = await bootstrapUserCloudAccount(
              user,
              profilesRef.current
            );
            if (cloudProfiles.length > 0) {
              const normalized = cloudProfiles.map(normalizeProfileDailyState);
              setProfiles(normalized);
              setActiveProfileId((prevId) =>
                normalized.some((p) => p.id === prevId) ? prevId : normalized[0].id
              );
            }
          } finally {
            setIsSyncingCloud(false);
          }
        }
      } else {
        bootstrappedUidRef.current = null;
        setGlobalEntries([]);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!authReady || !authUser) {
      setGlobalEntries([]);
      setIsLoadingGlobal(false);
      return;
    }
    setIsLoadingGlobal(true);
    const unsubLeaderboard = subscribeGlobalLeaderboard(
      (items) => {
        setGlobalEntries(items);
        setIsLoadingGlobal(false);
      },
      () => {
        setIsLoadingGlobal(false);
      }
    );
    return () => unsubLeaderboard();
  }, [authReady, authUser]);

  const handleSignInGoogle = async () => {
    try {
      await signInWithGooglePopup();
    } catch {
      // User closed popup or cancelled sign-in
    }
  };

  const handleSignOutAccount = async () => {
    await signOutAccount();
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch {
      // Ignore quota issues
    }
  }, [profiles]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const ageMode = activeProfile.ageMode;
  const isSenior = ageMode === 'senior';
  const isKids = ageMode === 'kids';
  const t = UI_STRINGS[lang];

  const updateActiveProfile = (updater: (prev: FamilyProfile) => FamilyProfile) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== activeProfile.id) return p;
        const updated = updater(p);
        queueProfileCloudSync(updated);
        return updated;
      })
    );
  };

  const handleToggleShareGlobal = (targetProfileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== targetProfileId) return p;
        const currentShare =
          typeof p.shareOnGlobal === 'boolean' ? p.shareOnGlobal : p.ageMode !== 'kids';
        const updated: FamilyProfile = {...p, shareOnGlobal: !currentShare};
        queueProfileCloudSync(updated);
        return updated;
      })
    );
  };

  const handleSetAgeMode = (nextMode: AgeMode) => {
    const defaultSpeed = nextMode === 'senior' ? 0.7 : nextMode === 'kids' ? 0.85 : 1.0;
    updateActiveProfile((p) => ({
      ...p,
      ageMode: nextMode,
      audioSpeed: defaultSpeed,
    }));
    setHeroImgFailed(false);
  };

  const handleSetSpeed = (speed: number) => {
    updateActiveProfile((p) => ({...p, audioSpeed: speed}));
  };

  const handleSetDailyGoal = (goalTier: DailyGoalTier) => {
    updateActiveProfile((p) => ({
      ...p,
      dailyGoalTier: goalTier,
      lastStudyDate: getTodayDateKey(),
    }));
  };

  // Track real elapsed study minutes while engaged in learning tabs
  useEffect(() => {
    if (activeTab === 'dashboard') return;
    const timerId = window.setInterval(() => {
      const today = getTodayDateKey();
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeProfile.id) return p;
          const baseMin = p.lastStudyDate === today ? p.dailyMinutesStudied ?? 0 : 0;
          const nextMin = baseMin + 1;
          const target = DAILY_GOAL_MINUTES[p.dailyGoalTier || 'consistent'];
          const crossedGoal = baseMin < target && nextMin >= target;
            const updated: FamilyProfile = {
              ...p,
              streakDays: crossedGoal ? p.streakDays + 1 : p.streakDays,
              dailyMinutesStudied: nextMin,
              lastStudyDate: today,
              studyHistory: {
                ...(p.studyHistory || {}),
                [today]: nextMin,
              },
            };
            queueProfileCloudSync(updated);
            return updated;
          })
        );
      }, 60_000);
      return () => window.clearInterval(timerId);
    }, [activeTab, activeProfile.id]);

  const handleSetTrack = (track: TrackId, targetNav: NavTab) => {
    updateActiveProfile((p) => ({...p, preferredTrack: track}));
    setActiveTab(targetNav);
  };

  const handleToggleMasteredLetter = (letterId: string) => {
    updateActiveProfile((p) => {
      const exists = p.masteredLetters.includes(letterId);
      const next = exists
        ? p.masteredLetters
        : [...p.masteredLetters, letterId];
      return {...p, masteredLetters: next};
    });
  };

  const handleEarnXp = (amount: number) => {
    const today = getTodayDateKey();
    const studyCreditMin = Math.max(1, Math.round(amount / 10));
    updateActiveProfile((p) => {
      const baseMin = p.lastStudyDate === today ? p.dailyMinutesStudied ?? 0 : 0;
      const nextMin = baseMin + studyCreditMin;
      const target = DAILY_GOAL_MINUTES[p.dailyGoalTier || 'consistent'];
      const crossedGoal = baseMin < target && nextMin >= target;
      return {
        ...p,
        xp: p.xp + amount,
        weeklyXp: (p.weeklyXp ?? p.xp) + amount,
        streakDays: crossedGoal ? p.streakDays + 1 : p.streakDays,
        dailyMinutesStudied: nextMin,
        lastStudyDate: today,
        studyHistory: {
          ...(p.studyHistory || {}),
          [today]: nextMin,
        },
      };
    });
  };

  const handleCompleteScientificStage = (stageId: string, xpReward: number) => {
    const today = getTodayDateKey();
    const studyCreditMin = Math.max(2, Math.round(xpReward / 8));
    updateActiveProfile((p) => {
      const alreadyCompleted = p.completedScenarios.includes(stageId);
      const nextScenarios = alreadyCompleted
        ? p.completedScenarios
        : [...p.completedScenarios, stageId].slice(
            0,
            BLUEPRINT_LIMITS.MAX_COMPLETED_SCENARIOS
          );
      const baseMin = p.lastStudyDate === today ? p.dailyMinutesStudied ?? 0 : 0;
      const nextMin = alreadyCompleted ? baseMin : baseMin + studyCreditMin;
      const target = DAILY_GOAL_MINUTES[p.dailyGoalTier || 'consistent'];
      const crossedGoal = baseMin < target && nextMin >= target;
      return {
        ...p,
        completedScenarios: nextScenarios,
        xp: alreadyCompleted ? p.xp : p.xp + xpReward,
        weeklyXp: alreadyCompleted ? (p.weeklyXp ?? p.xp) : (p.weeklyXp ?? p.xp) + xpReward,
        streakDays: crossedGoal ? p.streakDays + 1 : p.streakDays,
        dailyMinutesStudied: nextMin,
        lastStudyDate: today,
        studyHistory: {
          ...(p.studyHistory || {}),
          [today]: nextMin,
        },
      };
    });
  };

  const handleOpenDeepLab = (target: DeepLabTarget) => {
    if (target.alphabetSubTab) {
      setAlphabetSubTab(target.alphabetSubTab);
    }
    if (target.quranSection) {
      setQuranSection(target.quranSection);
    }
    setActiveTab(target.navTab);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleSelectPreferredTrackOnly = (track: TrackId) => {
    updateActiveProfile((p) => ({...p, preferredTrack: track}));
  };

  const handleJumpToStageFromRoadmap = (stageId: string, track: TrackId) => {
    updateActiveProfile((p) => ({...p, preferredTrack: track}));
    setActiveTab('dashboard');
    setFocusedStageRequest({stageId, nonce: Date.now()});
    window.setTimeout(() => {
      document
        .getElementById('scientific-step-pathway')
        ?.scrollIntoView({behavior: 'smooth'});
    }, 80);
  };

  const handleLaunchScheduledSession = (
    sessionType: SmartScheduleSessionType,
    stage: ScientificStage
  ) => {
    switch (sessionType) {
      case 'makhraj_drill':
        handleOpenDeepLab({navTab: 'alphabet', alphabetSubTab: 'letters'});
        break;
      case 'harakat_rhythm':
        handleOpenDeepLab({navTab: 'alphabet', alphabetSubTab: 'harakat'});
        break;
      case 'voice_quiz':
        handleOpenDeepLab({navTab: 'alphabet', alphabetSubTab: 'voice_quiz'});
        break;
      case 'surah_review':
        handleOpenDeepLab({navTab: 'quran', quranSection: 'surah'});
        break;
      case 'root_explorer':
        handleOpenDeepLab({navTab: 'quran', quranSection: 'roots'});
        break;
      case 'srs_flashcards':
        handleOpenDeepLab({navTab: 'quran', quranSection: 'srs'});
        break;
      case 'spoken_dialogue':
        handleOpenDeepLab({navTab: 'spoken'});
        break;
      case 'ustad_coaching':
        handleOpenDeepLab({navTab: 'ustad'});
        break;
      case 'pathway_stage':
      default:
        handleJumpToStageFromRoadmap(stage.id, activeProfile.preferredTrack);
        break;
    }
  };

  const handleCompleteScheduleBlock = (
    durationMinutes: number,
    xpReward: number
  ) => {
    const today = getTodayDateKey();
    const creditMin = Math.max(1, Math.round(durationMinutes));
    updateActiveProfile((p) => {
      const baseMin = p.lastStudyDate === today ? p.dailyMinutesStudied ?? 0 : 0;
      const nextMin = baseMin + creditMin;
      const target = DAILY_GOAL_MINUTES[p.dailyGoalTier || 'consistent'];
      const crossedGoal = baseMin < target && nextMin >= target;
      return {
        ...p,
        xp: p.xp + xpReward,
        weeklyXp: (p.weeklyXp ?? p.xp) + xpReward,
        streakDays: crossedGoal ? p.streakDays + 1 : p.streakDays,
        dailyMinutesStudied: nextMin,
        lastStudyDate: today,
        studyHistory: {
          ...(p.studyHistory || {}),
          [today]: nextMin,
        },
      };
    });
  };

  const handleReviewSRSCard = (cardId: string, quality: 1 | 3 | 5) => {
    updateActiveProfile((p) => {
      const prev = p.srs[cardId] || {
        cardId,
        intervalDays: 0,
        easeFactor: 2.5,
        dueTimestamp: Date.now(),
        repetitions: 0,
      };
      const nextReps = quality === 1 ? 0 : prev.repetitions + 1;
      const nextInterval =
        quality === 1 ? 1 : quality === 3 ? Math.max(3, prev.intervalDays * 2) : Math.max(7, Math.round(prev.intervalDays * 2.5));
      return {
        ...p,
        srs: {
          ...p.srs,
          [cardId]: {
            cardId,
            intervalDays: nextInterval,
            easeFactor: Math.max(1.3, prev.easeFactor + (quality === 5 ? 0.1 : quality === 1 ? -0.2 : 0)),
            dueTimestamp: Date.now() + nextInterval * 86400_000,
            repetitions: nextReps,
          },
        },
      };
    });
  };

  const handleDownloadOfflinePack = async () => {
    if (isDownloadingPack) return;
    setIsDownloadingPack(true);
    const essentials = [
      ...ARABIC_LETTERS.slice(0, 8).map((l) => `${l.nameAr} ، ${l.exampleWordAr}`),
      ...QURAN_LESSONS[0].ayahs.map((a) => a.fullAr),
    ];
    const count = await prefetchOfflineAudioPack(essentials, (done, total) => {
      setPackProgress(`${done}/${total}`);
    });
    setIsDownloadingPack(false);
    setPackProgress(null);
    if (count > 0) {
      updateActiveProfile((p) => ({
        ...p,
        downloadedPacks: Array.from(new Set([...p.downloadedPacks, 'level0_essentials'])),
      }));
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newProfileName
      .trim()
      .slice(0, BLUEPRINT_LIMITS.LEARNER_NAME_MAX_LEN);
    if (!clean) return;
    const speed = newProfileAgeMode === 'senior' ? 0.7 : newProfileAgeMode === 'kids' ? 0.85 : 1.0;
    const created: FamilyProfile = {
      id: `prof_${Date.now()}`,
      name: clean,
      ageMode: newProfileAgeMode,
      ageYears: newProfileAgeMode === 'kids' ? 8 : newProfileAgeMode === 'senior' ? 60 : 25,
      preferredTrack: 'quran',
      dailyGoalTier: newProfileGoalTier,
      dailyMinutesStudied: 0,
      lastStudyDate: getTodayDateKey(),
      studyHistory: {[getTodayDateKey()]: 0},
      xp: 0,
      weeklyXp: 0,
      streakDays: 1,
      audioSpeed: speed,
      masteredLetters: [],
      completedSurahs: [],
      completedScenarios: [],
      downloadedPacks: [],
      srs: {},
      shareOnGlobal: newProfileAgeMode !== 'kids',
    };
    setProfiles((prev) => [...prev, created]);
    setActiveProfileId(created.id);
    queueProfileCloudSync(created);
    setNewProfileName('');
    setNewProfileGoalTier('consistent');
    setShowNewProfileForm(false);
  };

  const continueNextLesson = () => {
    const preferredStages =
      activeProfile.preferredTrack === 'quran'
        ? ZERO_TO_QURAN_STAGES
        : ZERO_TO_ARABIC_STAGES;
    const nextStage =
      preferredStages.find((s) => !activeProfile.completedScenarios.includes(s.id)) ||
      ALL_SCIENTIFIC_STAGES.find(
        (s) => !activeProfile.completedScenarios.includes(s.id)
      );

    if (activeTab === 'dashboard') {
      const pathwayEl = document.getElementById('scientific-step-pathway');
      if (pathwayEl) {
        pathwayEl.scrollIntoView({behavior: 'smooth'});
        return;
      }
    }

    if (nextStage) {
      handleOpenDeepLab(nextStage.deepLab);
    } else if (activeProfile.masteredLetters.length < 10) {
      setActiveTab('alphabet');
    } else if (activeProfile.preferredTrack === 'gulf' || activeProfile.preferredTrack === 'msa') {
      setActiveTab('spoken');
    } else {
      setActiveTab('quran');
    }
  };

  const navItems: Array<{id: NavTab; label: string; icon: React.ReactNode}> = [
    {id: 'dashboard', label: t.navDashboard, icon: <Compass className="w-4 h-4" />},
    {id: 'alphabet', label: t.navAlphabet, icon: <PenTool className="w-4 h-4" />},
    {id: 'quran', label: t.navQuran, icon: <BookOpen className="w-4 h-4" />},
    {id: 'spoken', label: t.navSpoken, icon: <Languages className="w-4 h-4" />},
    {id: 'ustad', label: t.navUstad, icon: <MessageSquare className="w-4 h-4" />},
  ];

  const heroTitle = isKids
    ? t.heroTitleKids
    : isSenior
    ? t.heroTitleSenior
    : t.heroTitleStandard;

  const heroSubtitle = isKids
    ? t.heroSubtitleKids
    : isSenior
    ? t.heroSubtitleSenior
    : t.heroSubtitleStandard;

  const heroImgSrc = isKids
    ? '/src/assets/images/kids_oasis_adventure_1794941602785.jpg'
    : '/src/assets/images/hero_arabic_manuscript_1794941601698.jpg';

  const activeGoalTier: DailyGoalTier = activeProfile.dailyGoalTier || 'consistent';
  const targetGoalMinutes = DAILY_GOAL_MINUTES[activeGoalTier];
  const todayMinutes =
    activeProfile.lastStudyDate === getTodayDateKey()
      ? activeProfile.dailyMinutesStudied ?? 0
      : 0;
  const goalProgressPct = Math.min(100, Math.round((todayMinutes / targetGoalMinutes) * 100));
  const goalCompleted = todayMinutes >= targetGoalMinutes;
  const remainingMinutes = Math.max(0, targetGoalMinutes - todayMinutes);

  const goalTierOptions: Array<{id: DailyGoalTier; label: string; minutesLabel: string}> = [
    {
      id: 'casual',
      label: t.goalCasual,
      minutesLabel: lang === 'bn' ? '৫ মি./দিন' : '5 min/day',
    },
    {
      id: 'consistent',
      label: t.goalConsistent,
      minutesLabel: lang === 'bn' ? '১৫ মি./দিন' : '15 min/day',
    },
    {
      id: 'intensive',
      label: t.goalIntensive,
      minutesLabel: lang === 'bn' ? '৩০+ মি./দিন' : '30+ min/day',
    },
  ];

  const activeGoalOption =
    goalTierOptions.find((g) => g.id === activeGoalTier) || goalTierOptions[1];

  const preferredTrackStages =
    activeProfile.preferredTrack === 'quran'
      ? ZERO_TO_QURAN_STAGES
      : ZERO_TO_ARABIC_STAGES;
  const currentActiveStage: ScientificStage =
    preferredTrackStages.find(
      (s) => !activeProfile.completedScenarios.includes(s.id)
    ) ||
    ALL_SCIENTIFIC_STAGES.find(
      (s) => !activeProfile.completedScenarios.includes(s.id)
    ) ||
    preferredTrackStages[0];
  const completedScientificStagesCount = ALL_SCIENTIFIC_STAGES.filter((s) =>
    activeProfile.completedScenarios.includes(s.id)
  ).length;
  const srsDueCount = Math.max(4, 14 - Object.keys(activeProfile.srs).length);

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 lg:pb-0 ${isSenior ? 'text-[17px]' : 'text-base'}`}>
      <OfflineIndicator lang={lang} />

      {/* STRICT 3-ZONE TOP BAR CONTRACT: [1-line Brand] — [5 single-line nav links] — [1 primary action] */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('dashboard');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Arbi Sikkhi · আরবি শিখি
        </a>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  active
                    ? 'text-emerald-800 border-emerald-700 font-semibold'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={continueNextLesson}
            className="px-4 py-2 min-h-[40px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            {t.continueLearning}
          </button>
        </div>
      </header>

      {/* Workspace Mode & Localization Control Strip (Below Header per Top Bar Contract) */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Age-Adaptive UX Selector (Kids 3-12 | Standard 13-50 | Senior 51-90) */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100">
            {(
              [
                {id: 'kids', label: t.ageModeKids},
                {id: 'standard', label: t.ageModeStandard},
                {id: 'senior', label: t.ageModeSenior},
              ] as Array<{id: AgeMode; label: string}>
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSetAgeMode(m.id)}
                className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  ageMode === m.id
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Language Switcher (বাংলা / English) + Audio Speed + Android PWA Install */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100">
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'bn' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                English
              </button>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 text-xs">
              {[0.7, 0.85, 1.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => handleSetSpeed(spd)}
                  className={`px-2.5 py-1.5 min-h-[38px] rounded-lg font-mono-num font-medium transition-colors whitespace-nowrap shrink-0 ${
                    Math.abs(activeProfile.audioSpeed - spd) < 0.05
                      ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <PWAInstallButton lang={lang} />

            {authReady && (
              authUser ? (
                <button
                  type="button"
                  onClick={handleSignOutAccount}
                  title={authUser.email || undefined}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-xs font-semibold text-emerald-800 whitespace-nowrap shrink-0"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">
                    {authUser.displayName || authUser.email?.split('@')[0] || 'Synced'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSignInGoogle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'bn' ? 'অ্যাকাউন্ট সিঙ্ক' : 'Account Sync'}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container (Full 1440px Desktop Presence via max-w-7xl) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <DailyGoalNotificationToast
              profileId={activeProfile.id}
              profileName={activeProfile.name}
              ageMode={ageMode}
              lang={lang}
              todayDateKey={getTodayDateKey()}
              todayMinutes={todayMinutes}
              targetGoalMinutes={targetGoalMinutes}
              goalTier={activeGoalTier}
              streakDays={activeProfile.streakDays}
              onContinueLesson={continueNextLesson}
            />

            {/* 2-Column Balanced Hero Split */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <p className="text-xs font-medium text-emerald-800">
                    {t.heroKicker} · {activeProfile.name}
                  </p>
                  <h1
                    style={{textWrap: 'balance'}}
                    className={`font-bold tracking-tight text-slate-900 leading-[1.2] ${
                      isSenior
                        ? 'text-3xl sm:text-4xl'
                        : 'text-2xl sm:text-4xl'
                    }`}
                  >
                    {heroTitle}
                  </h1>
                  <p className={`text-slate-600 leading-relaxed max-w-2xl ${isSenior ? 'text-lg' : 'text-base'}`}>
                    {heroSubtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={continueNextLesson}
                    className={`px-6 py-3.5 min-h-[50px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-transform active:scale-[0.99] whitespace-nowrap shrink-0 ${
                      isSenior ? 'text-base' : 'text-sm'
                    }`}
                  >
                    {t.startNextStep}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRoadmapModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-3.5 min-h-[50px] rounded-2xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-900 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <MapIcon className="w-4 h-4 text-emerald-700" />
                    {t.openDetailedRoadmapBtn}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      playArabicAudio('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', activeProfile.audioSpeed)
                    }
                    className="inline-flex items-center gap-2 px-5 py-3.5 min-h-[50px] rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-800 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                    {lang === 'bn' ? 'বিসমিল্লাহ উচ্চারণ শুনুন' : 'Hear Bismillah Audio'}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-slate-200 relative min-h-[260px] bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-800">
                {!heroImgFailed && (
                  <img
                    src={heroImgSrc}
                    alt={
                      isKids
                        ? 'Cheerful Arabian desert oasis stepping-stone learning trail for kids'
                        : 'Illuminated Arabic calligraphy folio beside wooden reed qalam pen on limestone'
                    }
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end">
                  <p dir="rtl" className="font-arabic text-3xl text-amber-300 text-right">
                    اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
                  </p>
                  <p className="text-xs text-slate-200 mt-1">
                    {lang === 'bn'
                      ? 'পাঠ করুন আপনার প্রতিপালকের নামে, যিনি সৃষ্টি করেছেন — সূরা আল-আলাক ৯৬:১'
                      : 'Read in the name of your Lord who created — Surah Al-‘Alaq 96:1'}
                  </p>
                </div>
              </div>
            </section>

            {/* Full-Width 4-Column Progress & Offline Pack Strip Below Hero */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs text-slate-500">{t.masteredLettersLabel}</p>
                <p className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                  {activeProfile.masteredLetters.length} / 28
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  {lang === 'bn' ? 'স্তর ০ মাখরাজ ও লেখা' : 'Level 0 Foundations'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs text-slate-500">{t.dailyStreakLabel}</p>
                <p className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                  {activeProfile.streakDays} {lang === 'bn' ? 'দিন' : 'Days'}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono-num">
                  {activeProfile.xp} XP
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs text-slate-500">{t.srsDueLabel}</p>
                <p className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                  {Math.max(4, 14 - Object.keys(activeProfile.srs).length)}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('quran')}
                  className="text-xs font-semibold text-emerald-700 hover:underline mt-1"
                >
                  {lang === 'bn' ? 'রিভিউ শুরু করুন →' : 'Start SRS Review →'}
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500">{t.offlinePacksLabel}</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {activeProfile.downloadedPacks.includes('level0_essentials')
                      ? t.offlineSaved
                      : lang === 'bn'
                      ? 'স্তর ০ + সূরা ফাতিহা প্যাক'
                      : 'Level 0 + Fatihah Audio'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadOfflinePack}
                  disabled={isDownloadingPack}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isDownloadingPack
                    ? `${lang === 'bn' ? 'ডাউনলোড হচ্ছে' : 'Caching'} ${packProgress || '...'}`
                    : activeProfile.downloadedPacks.includes('level0_essentials')
                    ? lang === 'bn'
                      ? 'পুনরায় আপডেট করুন'
                      : 'Refresh Offline Cache'
                    : t.downloadOfflinePack}
                </button>
              </div>
            </section>

            {/* Quranic Wisdom: Random Ayah of the Day with Bangla/English Translation & Copy */}
            <QuranicWisdomWidget
              lang={lang}
              ageMode={ageMode}
              audioSpeed={activeProfile.audioSpeed}
              showHarakat={showHarakat}
              onOpenQuranLab={() =>
                handleOpenDeepLab({navTab: 'quran', quranSection: 'surah'})
              }
            />

            {/* AI-Powered Smart Daily Schedule (Goal, Age Mode & Progress Stage Adapted) */}
            <SmartDailyScheduleCard
              lang={lang}
              profile={activeProfile}
              todayDateKey={getTodayDateKey()}
              targetGoalMinutes={targetGoalMinutes}
              todayMinutes={todayMinutes}
              currentStage={currentActiveStage}
              completedStagesCount={completedScientificStagesCount}
              srsDueCount={srsDueCount}
              onLaunchSession={handleLaunchScheduledSession}
              onCompleteSessionBlock={handleCompleteScheduleBlock}
              onAdjustGoalClick={() => {
                document
                  .getElementById('profile-goal-config')
                  ?.scrollIntoView({behavior: 'smooth'});
              }}
            />

            {/* Scientific Step-by-Step Zero-to-Quran & Zero-to-Arabic Age-Adaptive Engine */}
            <ScientificPathwaySection
              lang={lang}
              ageMode={ageMode}
              audioSpeed={activeProfile.audioSpeed}
              completedStepIds={activeProfile.completedScenarios}
              onCompleteStage={handleCompleteScientificStage}
              onSetAgeMode={handleSetAgeMode}
              onOpenDeepLab={handleOpenDeepLab}
              onOpenRoadmapModal={() => setShowRoadmapModal(true)}
              focusedStageRequest={focusedStageRequest}
            />

            {/* Daily Learning Goal Progress Card on Dashboard */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    {goalCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Target className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      {activeProfile.name} · {activeGoalOption.label}
                    </p>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                      {t.dailyGoalProgressTitle}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold font-mono-num text-slate-900">
                      {todayMinutes} / {targetGoalMinutes}{activeGoalTier === 'intensive' ? '+' : ''}{' '}
                      <span className="text-xs font-normal text-slate-500">
                        {lang === 'bn' ? 'মিনিট' : 'min'}
                      </span>
                    </p>
                    <p className={`text-xs font-medium mt-0.5 ${goalCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {goalCompleted
                        ? t.goalCompletedStatus
                        : `${remainingMinutes} ${t.goalRemainingSuffix} · ${goalProgressPct}%`}
                    </p>
                  </div>

                  <a
                    href="#profile-goal-config"
                    className="px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center whitespace-nowrap shrink-0"
                  >
                    {t.adjustGoalBtn}
                  </a>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                role="progressbar"
                aria-valuenow={todayMinutes}
                aria-valuemin={0}
                aria-valuemax={targetGoalMinutes}
                aria-label={t.dailyGoalProgressTitle}
                className="w-full h-3 rounded-full bg-slate-100 overflow-hidden"
              >
                <div
                  className={`h-full rounded-full transition-transform duration-300 origin-left ${
                    goalCompleted ? 'bg-emerald-600' : 'bg-emerald-700'
                  }`}
                  style={{
                    width: '100%',
                    transform: `scaleX(${Math.max(0.03, goalProgressPct / 100)})`,
                  }}
                />
              </div>

              {/* 7-Day Recharts Consistency Visualization */}
              <WeeklyActivityChart
                lang={lang}
                studyHistory={activeProfile.studyHistory || {}}
                todayMinutes={todayMinutes}
                targetGoalMinutes={targetGoalMinutes}
                goalTier={activeGoalTier}
                onStartPractice={continueNextLesson}
              />
            </section>

            {/* Monthly Streak & Perfect Days Interactive Calendar */}
            <MonthlyStreakCalendar
              lang={lang}
              ageMode={ageMode}
              profileName={activeProfile.name}
              preferredTrack={activeProfile.preferredTrack}
              studyHistory={activeProfile.studyHistory || {}}
              todayDateKey={getTodayDateKey()}
              todayMinutes={todayMinutes}
              targetGoalMinutes={targetGoalMinutes}
              goalTier={activeGoalTier}
              currentStreakDays={activeProfile.streakDays}
              onStartPractice={continueNextLesson}
            />

            {/* Family & Global Leaderboard (Weekly XP Gains, Streaks & Cloud Account Sync) */}
            <FamilyGlobalLeaderboard
              lang={lang}
              ageMode={ageMode}
              profiles={profiles}
              activeProfileId={activeProfile.id}
              authUser={authUser}
              authReady={authReady}
              isSyncingCloud={isSyncingCloud}
              globalEntries={globalEntries}
              isLoadingGlobal={isLoadingGlobal}
              onSelectProfile={(pid) => setActiveProfileId(pid)}
              onStartPractice={continueNextLesson}
              onSignInGoogle={handleSignInGoogle}
              onSignOut={handleSignOutAccount}
              onToggleShareGlobal={handleToggleShareGlobal}
              onJumpToAddProfile={() => {
                setShowNewProfileForm(true);
                document
                  .getElementById('profile-goal-config')
                  ?.scrollIntoView({behavior: 'smooth'});
              }}
            />

            {/* Animated Streak Milestone Achievement Badges (7-Day, 30-Day, 100-Day) */}
            <AchievementBadgesSection
              lang={lang}
              streakDays={activeProfile.streakDays}
              profileName={activeProfile.name}
              onStartPractice={continueNextLesson}
            />

            {/* 3-Track Curriculum Architecture Cards */}
            <section className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">
                  {lang === 'bn'
                    ? 'তিনটি সমন্বিত ট্র্যাক · একই লার্নিং ইঞ্জিনে কুরআনিক, প্রমিত ও সৌদি কথ্য আরবি'
                    : 'Unified 3-Track Curriculum Engine · Zero to C2 Mastery'}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {lang === 'bn' ? 'আপনার শেখার ট্র্যাক বেছে নিন' : 'Choose Your Learning Track'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ThreeDPressableCard
                  active={activeProfile.preferredTrack === 'quran'}
                  onClick={() => handleSetTrack('quran', 'alphabet')}
                  className="p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-800 font-medium">
                      01 · {t.trackQuran}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">
                      {lang === 'bn'
                        ? 'হরফ, লাইভ মাখরাজ, হাতের লেখা ও শব্দে-শব্দে তাজবীদ'
                        : 'Alphabet, Sagittal Makharij, Stroke Lab & Tajweed'}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {lang === 'bn'
                        ? 'কোনো গৃহশিক্ষক ছাড়াই ২৮টি হরফ, জিহ্বার অবস্থান, কমেট রাইটিং বোর্ড এবং সূরা ফাতিহা-ইখলাস-আসর শব্দে-শব্দে আয়ত্ত করুন।'
                        : 'Master all 28 contextual letter forms, vocal tract placement, right-to-left stroke tracing, and Quranic verses.'}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span>{lang === 'bn' ? 'মাখরাজ ও রাইটিং ল্যাবে যান' : 'Open Makharij & Writing Lab'}</span>
                    <span>→</span>
                  </div>
                </ThreeDPressableCard>

                <ThreeDPressableCard
                  active={activeProfile.preferredTrack === 'msa'}
                  onClick={() => handleSetTrack('msa', 'quran')}
                  className="p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium">
                      02 · {t.trackMsa}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">
                      {lang === 'bn'
                        ? '৩-অক্ষরের মূলশব্দ (الجذر), নাহু-সরফ ও হরকত ছাড়া পাঠ'
                        : '3-Letter Root Explorer, Morphology & Unvowelled Reading'}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {lang === 'bn'
                        ? 'একটি মূলশব্দ থেকে ডজনখানেক নতুন শব্দ চেনার কৌশল এবং হরকত On/Off টগল দিয়ে আধুনিক আরবি বই ও সংবাদ পড়ার দক্ষতা।'
                        : 'Unlock hundreds of words from 3-letter roots and transition smoothly to reading unvowelled Arabic.'}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span>{lang === 'bn' ? 'মূলশব্দ ও কুরআন ল্যাবে যান' : 'Explore Roots & SRS Deck'}</span>
                    <span>→</span>
                  </div>
                </ThreeDPressableCard>

                <ThreeDPressableCard
                  active={activeProfile.preferredTrack === 'gulf'}
                  onClick={() => handleSetTrack('gulf', 'spoken')}
                  className="p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium">
                      03 · {t.trackGulf}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">
                      {lang === 'bn'
                        ? 'মক্কা-মদিনা সফর, রিয়াদ কর্মক্ষেত্র ও দৈনন্দিন কথোপকথন'
                        : 'Haramain Travel, Riyadh Workplace & Gulf Dialogues'}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {lang === 'bn'
                        ? 'প্রমিত আরবি (MSA) এবং স্থানীয় সৌদি/গালফ কথ্য সংলাপ পাশাপাশি তুলনা করে শুনে ও মাইক্রোফোনে বলে অনুশীলন করুন।'
                        : 'Compare formal Fusha alongside authentic Saudi/Gulf phrases for travel, Umrah, and Gulf careers.'}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span>{lang === 'bn' ? 'কথ্য সংলাপ শুরু করুন' : 'Practice MSA & Gulf Spoken'}</span>
                    <span>→</span>
                  </div>
                </ThreeDPressableCard>
              </div>
            </section>

            {/* Family Multi-Learner Profiles & Daily Goal Configuration */}
            <section
              id="profile-goal-config"
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 scroll-mt-20"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    {lang === 'bn'
                      ? 'একই ফোনে পরিবারের ছোট-বড় ও প্রবীণ সবার জন্য আলাদা প্রগ্রেস, দৈনিক লক্ষ্য ও বয়স-ভিত্তিক মোড'
                      : 'Multiple Learners on One Phone · Independent Age Modes, Daily Goals, Speeds & SRS'}
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    {t.familyProfilesTitle}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewProfileForm((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[42px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  {t.addProfile}
                </button>
              </div>

              {showNewProfileForm && (
                <form
                  onSubmit={handleCreateProfile}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center gap-3"
                >
                  <input
                    type="text"
                    value={newProfileName}
                    maxLength={BLUEPRINT_LIMITS.LEARNER_NAME_MAX_LEN}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder={lang === 'bn' ? 'শিক্ষার্থীর নাম লিখুন...' : 'Learner name...'}
                    className="flex-1 min-w-[180px] min-h-[42px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm"
                  />
                  <select
                    value={newProfileAgeMode}
                    onChange={(e) => setNewProfileAgeMode(e.target.value as AgeMode)}
                    aria-label="Age Mode"
                    className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                  >
                    <option value="kids">{t.ageModeKids}</option>
                    <option value="standard">{t.ageModeStandard}</option>
                    <option value="senior">{t.ageModeSenior}</option>
                  </select>
                  <select
                    value={newProfileGoalTier}
                    onChange={(e) => setNewProfileGoalTier(e.target.value as DailyGoalTier)}
                    aria-label={t.dailyGoalLabel}
                    className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                  >
                    <option value="casual">{t.goalCasual}</option>
                    <option value="consistent">{t.goalConsistent}</option>
                    <option value="intensive">{t.goalIntensive}</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 min-h-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Create Profile'}
                  </button>
                </form>
              )}

              {/* Active Profile Daily Learning Goal Configuration */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {t.dailyGoalLabel} · {activeProfile.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'bn'
                        ? 'আপনার সময় অনুযায়ী দৈনিক অনুশীলনের লক্ষ্য বেছে নিন'
                        : 'Select how many minutes per day this profile aims to practice'}
                    </p>
                  </div>
                  <span className="text-xs font-mono-num font-semibold text-emerald-800">
                    {todayMinutes}/{targetGoalMinutes}{activeGoalTier === 'intensive' ? '+' : ''} min
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {goalTierOptions.map((opt) => {
                    const isSelected = activeGoalTier === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSetDailyGoal(opt.id)}
                        className={`min-h-[52px] px-4 py-3 rounded-xl border text-left transition-colors flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-white border-emerald-600 text-emerald-900 shadow-xs font-semibold'
                            : 'bg-white/70 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <span className="text-xs sm:text-sm whitespace-nowrap">{opt.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {profiles.map((prof) => {
                  const selected = prof.id === activeProfile.id;
                  const profGoalTier = prof.dailyGoalTier || 'consistent';
                  const profTarget = DAILY_GOAL_MINUTES[profGoalTier];
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setActiveProfileId(prof.id)}
                      className={`text-left rounded-2xl border p-4 transition-colors min-h-[76px] flex items-center justify-between gap-3 ${
                        selected
                          ? 'border-emerald-600 bg-emerald-50/70'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{prof.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono-num">
                          {prof.ageMode === 'kids'
                            ? lang === 'bn'
                              ? 'ছোটদের মোড'
                              : 'Kids'
                            : prof.ageMode === 'senior'
                            ? lang === 'bn'
                              ? 'প্রবীণ মোড'
                              : 'Senior'
                            : lang === 'bn'
                            ? 'স্ট্যান্ডার্ড'
                            : 'Standard'}{' '}
                          · {prof.masteredLetters.length}/28 · {profTarget}{profGoalTier === 'intensive' ? '+' : ''}m/d
                        </p>
                      </div>
                      {selected && <UserCheck className="w-5 h-5 text-emerald-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'alphabet' && (
          <AlphabetMakhrajView
            lang={lang}
            ageMode={ageMode}
            audioSpeed={activeProfile.audioSpeed}
            masteredLetters={activeProfile.masteredLetters}
            onToggleMastered={handleToggleMasteredLetter}
            onEarnXp={handleEarnXp}
            initialSubTab={alphabetSubTab}
          />
        )}

        {activeTab === 'quran' && (
          <QuranRootsView
            lang={lang}
            ageMode={ageMode}
            audioSpeed={activeProfile.audioSpeed}
            showHarakat={showHarakat}
            onToggleHarakat={() => setShowHarakat((h) => !h)}
            srsState={activeProfile.srs}
            onReviewSRSCard={handleReviewSRSCard}
            onEarnXp={handleEarnXp}
            initialSection={quranSection}
          />
        )}

        {activeTab === 'spoken' && (
          <SpokenGulfMsaView
            lang={lang}
            ageMode={ageMode}
            audioSpeed={activeProfile.audioSpeed}
            showHarakat={showHarakat}
            onToggleHarakat={() => setShowHarakat((h) => !h)}
            onEarnXp={handleEarnXp}
          />
        )}

        {activeTab === 'ustad' && (
          <VirtualUstadView
            lang={lang}
            ageMode={ageMode}
            track={activeProfile.preferredTrack}
            audioSpeed={activeProfile.audioSpeed}
            showHarakat={showHarakat}
            onToggleHarakat={() => setShowHarakat((h) => !h)}
            onEarnXp={handleEarnXp}
          />
        )}
      </main>

      {/* Quiet Clean Footer with Optional Kotlin Architecture Reference Sheet */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            Arbi Sikkhi (আরবি শিখি) · {lang === 'bn' ? 'শূন্য থেকে কুরআন ও আরবি ভাষা শিক্ষা প্ল্যাটফর্ম' : 'Zero-to-Expert Quranic & Arabic Learning Platform'}
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => setShowRoadmapModal(true)}
              className="font-medium text-emerald-800 hover:text-emerald-950 underline underline-offset-4 whitespace-nowrap"
            >
              {t.openDetailedRoadmapBtn}
            </button>
            <button
              type="button"
              onClick={() => setShowBlueprintModal(true)}
              className="font-medium text-slate-700 hover:text-emerald-700 underline underline-offset-4 whitespace-nowrap"
            >
              {t.androidBlueprintBtn}
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Thumb-Zone Navigation Bar (<= 15% aggregate sticky height) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-15 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center px-1"
      >
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center rounded-lg transition-colors ${
                active ? 'text-emerald-700 font-semibold' : 'text-slate-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 truncate max-w-[68px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <DetailedScientificRoadmapModal
        open={showRoadmapModal}
        onClose={() => setShowRoadmapModal(false)}
        lang={lang}
        profile={activeProfile}
        onSelectTrack={handleSelectPreferredTrackOnly}
        onJumpToStageOnDashboard={handleJumpToStageFromRoadmap}
        onOpenDeepLab={handleOpenDeepLab}
        onCompleteStage={handleCompleteScientificStage}
      />

      <AndroidBlueprintModal
        open={showBlueprintModal}
        onClose={() => setShowBlueprintModal(false)}
        lang={lang}
      />
    </div>
  );
}
