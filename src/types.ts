export type Language = 'bn' | 'en';

export type AgeMode = 'kids' | 'standard' | 'senior';

export type TrackId = 'quran' | 'msa' | 'gulf';

export type NavTab = 'dashboard' | 'alphabet' | 'quran' | 'spoken' | 'ustad';

export type ArticulationZone =
  | 'jawf'
  | 'throat_deep'
  | 'throat_mid'
  | 'throat_upper'
  | 'tongue_back'
  | 'tongue_mid'
  | 'tongue_edge'
  | 'tongue_tip'
  | 'lips'
  | 'khayshum';

export interface LocalizedText {
  bn: string;
  en: string;
}

export interface ArabicLetter {
  id: string;
  order: number;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  nameAr: string;
  name: LocalizedText;
  sound: LocalizedText;
  zone: ArticulationZone;
  zoneTitle: LocalizedText;
  mouthGuide: LocalizedText;
  mistakeToAvoid: LocalizedText;
  isHeavy: boolean; // Tafkheem (মোটা উচ্চারণ)
  hasQalqalah?: boolean;
  hasGhunnah?: boolean;
  exampleWordAr: string;
  exampleWordUnvowelled: string;
  exampleTranslit: LocalizedText;
  exampleMeaning: LocalizedText;
  kidsObjectEmoji: string; // Used strictly inside Kids learning flashcard stage
  strokePoints: Array<[number, number]>; // Normalized [0..1, 0..1] RTL waypoints for Comet Canvas
  dotPoints?: Array<[number, number]>;
}

export interface HarakatItem {
  id: string;
  symbolAr: string; // Combined with ب e.g. بَ
  markNameAr: string;
  title: LocalizedText;
  madrasaName: LocalizedText;
  beats: number; // Harakah count (1, 2, 4)
  explanation: LocalizedText;
  mistakeToAvoid: LocalizedText;
  examples: Array<{
    ar: string;
    translit: LocalizedText;
    meaning: LocalizedText;
  }>;
}

export type TajweedRuleType =
  | 'normal'
  | 'ghunnah'
  | 'qalqalah'
  | 'madd'
  | 'ikhfa'
  | 'tafkheem';

export interface QuranWordToken {
  ar: string;
  unvowelled: string;
  translit: LocalizedText;
  meaning: LocalizedText;
  root?: string;
  tajweedRule: TajweedRuleType;
  tajweedNote?: LocalizedText;
}

export interface QuranAyah {
  ayahNumber: number;
  fullAr: string;
  fullUnvowelled: string;
  translation: LocalizedText;
  words: QuranWordToken[];
}

export interface QuranSurahLesson {
  id: string;
  surahNumber: number;
  titleAr: string;
  title: LocalizedText;
  revelation: LocalizedText;
  ayahCount: number;
  summary: LocalizedText;
  ayahs: QuranAyah[];
}

export interface RootDerivedWord {
  ar: string;
  unvowelled: string;
  patternAr: string;
  translit: LocalizedText;
  meaning: LocalizedText;
  usageExampleAr: string;
  usageMeaning: LocalizedText;
}

export interface RootEntry {
  id: string;
  rootAr: string;
  rootLetters: string;
  coreMeaning: LocalizedText;
  quranicOccurrences: number;
  explanation: LocalizedText;
  derivatives: RootDerivedWord[];
}

export interface DialogueLine {
  speaker: LocalizedText;
  msaAr: string;
  msaUnvowelled: string;
  msaTranslit: LocalizedText;
  gulfAr: string;
  gulfUnvowelled: string;
  gulfTranslit: LocalizedText;
  meaning: LocalizedText;
  culturalNote: LocalizedText;
}

export interface DialogueScenario {
  id: string;
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  category: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  lines: DialogueLine[];
}

export interface SRSCardState {
  cardId: string;
  intervalDays: number;
  easeFactor: number;
  dueTimestamp: number;
  repetitions: number;
}

export type DailyGoalTier = 'casual' | 'consistent' | 'intensive';

export interface FamilyProfile {
  id: string;
  name: string;
  ageMode: AgeMode;
  ageYears: number;
  preferredTrack: TrackId;
  dailyGoalTier?: DailyGoalTier;
  dailyMinutesStudied?: number;
  lastStudyDate?: string;
  studyHistory?: Record<string, number>;
  xp: number;
  weeklyXp?: number;
  streakDays: number;
  audioSpeed: number;
  masteredLetters: string[];
  completedSurahs: string[];
  completedScenarios: string[];
  downloadedPacks: string[];
  srs: Record<string, SRSCardState>;
  shareOnGlobal?: boolean;
}

export interface GlobalLeaderboardEntry {
  entryId: string;
  ownerId: string;
  profileId: string;
  displayName: string;
  familyLabel: string;
  ageMode: AgeMode;
  preferredTrack: TrackId;
  publicWeeklyXp: number;
  totalXp: number;
  streakDays: number;
  masteredLettersCount: number;
}

export type ScientificPathTrack = 'zero_to_quran' | 'arabic_language';

export interface DeepLabTarget {
  navTab: NavTab;
  alphabetSubTab?: 'letters' | 'harakat' | 'voice_quiz';
  quranSection?: 'surah' | 'roots' | 'srs';
}

export interface AgeScientificMethodProfile {
  ageMode: AgeMode;
  badgeTitle: LocalizedText;
  cognitivePrinciple: LocalizedText;
  chunkingRule: LocalizedText;
  sessionTarget: LocalizedText;
  memoryStrategy: LocalizedText;
  recommendedSpeed: number;
}

export interface StageInteractiveCard {
  id: string;
  partsAr: string[]; // RTL components e.g. ['بِ', 'سْ', 'مِ'] or ['هٰذَا', 'بَيْتٌ']
  joinedAr: string;
  partialHarakatAr: string;
  unvowelledAr: string;
  translit: LocalizedText;
  meaning: LocalizedText;
  scientificNote: LocalizedText;
}

export interface StageQuizQuestion {
  prompt: LocalizedText;
  audioCueAr: string;
  options: Array<{
    id: string;
    labelAr?: string;
    label: LocalizedText;
    isCorrect: boolean;
  }>;
  explanation: LocalizedText;
}

export interface ScientificStage {
  id: string; // Stored in completedScenarios (matches ^[a-zA-Z0-9_\-]+$)
  stepNumber: number;
  track: ScientificPathTrack;
  title: LocalizedText;
  subtitle: LocalizedText;
  estimatedMinutes: number;
  xpReward: number;
  sciencePillar: LocalizedText;
  whyItWorks: LocalizedText;
  mistakeGuard: LocalizedText;
  ageGuidance: Record<AgeMode, LocalizedText>;
  interactiveCards: StageInteractiveCard[];
  quiz: StageQuizQuestion;
  deepLab: DeepLabTarget;
  deepLabLabel: LocalizedText;
}

export type SmartScheduleFocus = 'balanced' | 'makhraj' | 'quran_vocab' | 'speaking';

export type SmartScheduleSessionType =
  | 'makhraj_drill'
  | 'harakat_rhythm'
  | 'voice_quiz'
  | 'surah_review'
  | 'root_explorer'
  | 'srs_flashcards'
  | 'spoken_dialogue'
  | 'ustad_coaching'
  | 'pathway_stage';

export interface SmartScheduleSessionItem {
  sessionOrder: number;
  title: string;
  durationMinutes: number;
  sessionType: SmartScheduleSessionType;
  focusArabicSample: string;
  actionableGoal: string;
  cognitiveReason: string;
  xpReward: number;
}

export interface SmartDailySchedulePlan {
  planHeadline: string;
  pedagogicalSummary: string;
  optimalTimeHint: string;
  totalMinutes: number;
  sessions: SmartScheduleSessionItem[];
}


