import React, {useEffect, useMemo, useState} from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Flag,
  Languages,
  Layers,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  AGE_SCIENTIFIC_PROFILES,
  ALL_SCIENTIFIC_STAGES,
  ZERO_TO_ARABIC_STAGES,
  ZERO_TO_QURAN_STAGES,
} from '../data/scientificPathway';
import {UI_STRINGS} from '../data/i18n';
import type {
  DailyGoalTier,
  DeepLabTarget,
  FamilyProfile,
  Language,
  ScientificStage,
  TrackId,
} from '../types';
import {playArabicAudio} from '../utils/audioPlayer';

interface DetailedScientificRoadmapModalProps {
  open: boolean;
  onClose: () => void;
  lang: Language;
  profile: FamilyProfile;
  onSelectTrack: (track: TrackId) => void;
  onJumpToStageOnDashboard: (stageId: string, track: TrackId) => void;
  onOpenDeepLab: (target: DeepLabTarget) => void;
  onCompleteStage: (stageId: string, xpReward: number) => void;
}

interface MacroLevelMeta {
  levelCode: string;
  cefrTag: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  summaryEn: string;
  stageIdsByTrack: Record<TrackId, string[]>;
}

const DAILY_GOAL_MINUTES: Record<DailyGoalTier, number> = {
  casual: 5,
  consistent: 15,
  intensive: 30,
};

const MACRO_LEVELS: MacroLevelMeta[] = [
  {
    levelCode: 'Level 0',
    cefrTag: 'Foundations',
    titleBn: 'স্তর ০ · ধ্বনি, আকৃতি ও সংযোগ ভিত্তি',
    titleEn: 'Level 0 · Phonemic, Script & Syllable Foundations',
    summaryBn: 'হরফের আকৃতি পরিবার, মাখরাজ পার্থক্য, যুক্তাক্ষর ও ১-মাত্রা হরকত ডিকোডিং',
    summaryEn: 'Shape-cluster chunking, minimal-pair Makharij, RTL glyph stitching & 1-beat vowels',
    stageIdsByTrack: {
      quran: ['q_step_01_shapes', 'q_step_02_joining', 'q_step_03_harakat'],
      msa: ['q_step_01_shapes', 'q_step_02_joining', 'q_step_03_harakat'],
      gulf: ['q_step_01_shapes', 'q_step_02_joining', 'ar_step_01_comprehensible'],
    },
  },
  {
    levelCode: 'Level 1',
    cefrTag: 'CEFR A1–A2',
    titleBn: 'স্তর ১ · সিলেবল লক ও প্রাথমিক বাক্য গঠন',
    titleEn: 'Level 1 · Closed Syllables, Core Lexicon & Sentence Frames',
    summaryBn: 'সুকূন-তাশদীদ সংযোগ, প্রথম ৫০টি জীবন্ত শব্দ এবং নামবাচক/ক্রিয়াবাচক বাক্যের লেগো সূত্র',
    summaryEn: 'CVC Sukoon/Shaddah locking, comprehensible core words & zero-copula sentence slots',
    stageIdsByTrack: {
      quran: ['q_step_04_syllables', 'q_step_05_madd_qalqalah'],
      msa: ['ar_step_01_comprehensible', 'ar_step_02_sentence_lego'],
      gulf: ['q_step_03_harakat', 'ar_step_02_sentence_lego'],
    },
  },
  {
    levelCode: 'Level 2',
    cefrTag: 'CEFR B1–B2',
    titleBn: 'স্তর ২ · মূলশব্দ বিজ্ঞান, প্যারেটো শব্দভাণ্ডার ও কথ্য সেতু',
    titleEn: 'Level 2 · 3-Letter Morphology, Pareto Corpus & Dialect Bridge',
    summaryBn: 'কুরআনের ৫০% উচ্চ-ফ্রিকোয়েন্সি শব্দ, ৩-অক্ষরের মূলশব্দ গুণক এবং ফুসহা ↔ সৌদি কথ্য রূপান্তর',
    summaryEn: 'High-frequency Quranic vocabulary, 1-to-8 root templates & MSA-to-Gulf code-switching',
    stageIdsByTrack: {
      quran: ['q_step_06_pareto_vocab', 'ar_step_03_root_matrix'],
      msa: ['ar_step_03_root_matrix', 'q_step_06_pareto_vocab'],
      gulf: ['ar_step_03_root_matrix', 'ar_step_04_msa_gulf_bridge'],
    },
  },
  {
    levelCode: 'Level 3',
    cefrTag: 'CEFR C1–Expert',
    titleBn: 'স্তর ৩ · পূর্ণাঙ্গ তাজবীদ ফ্লুয়েন্সি ও হরকতবিহীন পাঠ দক্ষতা',
    titleEn: 'Level 3 · Expert Tajweed Recitation & Unvowelled Fluency',
    summaryBn: 'গুন্নাহ-ওয়াকফসহ বিশুদ্ধ সূরা তিলাওয়াত এবং হরকত ছাড়া আধুনিক আরবি বই ও সাইনবোর্ড পাঠ',
    summaryEn: 'Prosodic Surah recitation with Waqf breath-stops & scaffolded unvowelled Arabic reading',
    stageIdsByTrack: {
      quran: ['q_step_07_tajweed_fluency', 'ar_step_05_unvowelled_read'],
      msa: ['ar_step_04_msa_gulf_bridge', 'ar_step_05_unvowelled_read'],
      gulf: ['q_step_07_tajweed_fluency', 'ar_step_05_unvowelled_read'],
    },
  },
];

const STAGE_PREREQ_OUTCOME: Record<
  string,
  {
    prereq: {bn: string; en: string};
    outcome: {bn: string; en: string};
  }
> = {
  q_step_01_shapes: {
    prereq: {
      bn: 'শূন্য পূর্বজ্ঞান — কোনো আরবি অক্ষর আগে থেকে জানার প্রয়োজন নেই',
      en: 'Absolute Zero — no prior Arabic alphabet knowledge required',
    },
    outcome: {
      bn: '২৮টি হরফকে ৭টি আকৃতি পরিবারে চেনা ও পাতলা-মোটা মাখরাজ আলাদা করতে পারা',
      en: 'Distinguish all 28 letters across 7 shape families and heavy/light Makharij pairs',
    },
  },
  q_step_02_joining: {
    prereq: {
      bn: 'হরফের মূল আকৃতি ও ফোঁটার সংখ্যা চেনা (ধাপ ০১)',
      en: 'Base glyph and dot recognition from Stage 01',
    },
    outcome: {
      bn: 'যেকোনো যুক্ত কুরআনিক শব্দে শুরু-মাঝ-শেষ রূপ ও ৬টি একমুখী হরফ তাৎক্ষণিক ডিকোড করা',
      en: 'Instantly segment connected Arabic script using glyph heads and the 6 non-connectors',
    },
  },
  q_step_03_harakat: {
    prereq: {
      bn: 'যুক্তাক্ষরে হরফ আলাদা করতে পারা (ধাপ ০২)',
      en: 'Connected letter recognition from Stage 02',
    },
    outcome: {
      bn: 'যবর, যের ও পেশ যোগে যেকোনো ৩-হরফের শব্দ নিখুঁত ১-মাত্রা ছন্দে উচ্চারণ করা',
      en: 'Read vowelled 3-letter words smoothly at crisp 1-beat syllable timing',
    },
  },
  q_step_04_syllables: {
    prereq: {
      bn: 'হ্রস্ব স্বরচিহ্ন (যবর-যের-পেশ) ১ মাত্রায় পড়া (ধাপ ০৩)',
      en: '1-beat short vowel fluency from Stage 03',
    },
    outcome: {
      bn: 'সুকূন, তানবীন ও তাশদীদযুক্ত যুক্ত-সিলেবল (যেমন الْحَمْدُ, رَبِّ) সাবলীলভাবে পড়া',
      en: 'Lock closed CVC syllables, nasal Tanween endings, and doubled Shaddah consonants',
    },
  },
  q_step_05_madd_qalqalah: {
    prereq: {
      bn: 'হ্রস্ব ১ মাত্রা ও সুকূন সিলেবল নিয়ন্ত্রণ (ধাপ ০৩–০৪)',
      en: '1-beat timing and Sukoon control from Stages 03–04',
    },
    outcome: {
      bn: '২ ও ৪ মাত্রার মাদ্দ দীর্ঘকরণ এবং قطب جد হরফে স্পষ্ট ক্বালক্বালাহ প্রতিধ্বনি বজায় রাখা',
      en: 'Maintain 1:2:4 vowel length ratios and crisp Qalqalah plosive release',
    },
  },
  q_step_06_pareto_vocab: {
    prereq: {
      bn: 'সঠিক উচ্চারণে কুরআনিক শব্দ বানান ছাড়া পড়তে পারা',
      en: 'Accurate word-level Quranic decoding',
    },
    outcome: {
      bn: 'কুরআনের প্রতি পৃষ্ঠার প্রায় ৫০% উচ্চ-ফ্রিকোয়েন্সি শব্দ তিলাওয়াতের সাথে সাথে বুঝতে পারা',
      en: 'Comprehend ~50% of recurring Quranic tokens directly while reciting',
    },
  },
  q_step_07_tajweed_fluency: {
    prereq: {
      bn: 'মাদ্দ, ক্বালক্বালাহ ও মৌলিক কুরআনিক শব্দভাণ্ডার',
      en: 'Madd, Qalqalah, and core Quranic vocabulary',
    },
    outcome: {
      bn: 'গুন্নাহ, ইখফা ও ওয়াকফ নিয়ম মেনে পূর্ণ সূরা শুদ্ধ তাজবীদ ও অর্থসহ তিলাওয়াত করা',
      en: 'Recite complete Surahs with Ghunnah, Waqf breath stops, and word-by-word meaning',
    },
  },
  ar_step_01_comprehensible: {
    prereq: {
      bn: 'মৌলিক আরবি ধ্বনি শ্রবণ (অনুবাদ মুখস্থের প্রয়োজন নেই)',
      en: 'Basic phonetic listening — zero grammar memorization needed',
    },
    outcome: {
      bn: 'সর্বনাম (أَنَا/أَنْتَ), লিঙ্গভেদ (ـة) ও দৈনন্দিন ৫০টি মৌলিক শব্দ সরাসরি ব্যবহার করা',
      en: 'Use core pronouns, gender markers, and 50 high-utility everyday words naturally',
    },
  },
  ar_step_02_sentence_lego: {
    prereq: {
      bn: 'মৌলিক সর্বনাম ও বিশেষ্য শব্দভাণ্ডার (ভাষা ধাপ ০১)',
      en: 'Core pronouns and nouns from Language Stage 01',
    },
    outcome: {
      bn: 'বাড়তি "is/am/are" ছাড়া শত শত নামবাচক ও ক্রিয়াবাচক আরবি বাক্য নিজে গঠন করা',
      en: 'Construct complete Nominal and Verbal Arabic sentences effortlessly',
    },
  },
  ar_step_03_root_matrix: {
    prereq: {
      bn: 'মৌলিক বাক্য কাঠামো ও হরকতসহ শব্দ পাঠ',
      en: 'Basic sentence structure and vowelled word reading',
    },
    outcome: {
      bn: '১টি ৩-অক্ষরের মূলশব্দ থেকে কর্তা, কর্ম ও স্থানের ছাঁচে ৮+ নতুন শব্দের অর্থ অনুমান করা',
      en: 'Generate and decode 8+ derived nouns/verbs from any 3-letter Arabic root',
    },
  },
  ar_step_04_msa_gulf_bridge: {
    prereq: {
      bn: 'প্রমিত বাক্য গঠন ও মূলশব্দ ধারণা (ভাষা ধাপ ০২–০৩)',
      en: 'Standard sentence building and root awareness',
    },
    outcome: {
      bn: 'হারামাইন, বিমানবন্দর, হাসপাতাল ও সৌদি কর্মক্ষেত্রে প্রমিত ও গালফ কথ্য আরবিতে সাবলীল সংলাপ',
      en: 'Switch confidently between formal MSA and natural Saudi/Gulf spoken Arabic',
    },
  },
  ar_step_05_unvowelled_read: {
    prereq: {
      bn: 'মূলশব্দ ছাঁচ (مَفْعَل / فَاعِل) ও বাক্য গঠনের পূর্বধারণা',
      en: 'Morphological templates and basic sentence context',
    },
    outcome: {
      bn: 'হরকত ছাড়াই আধুনিক আরবি বই, সংবাদপত্র, পাসপোর্ট ও রাস্তার সাইনবোর্ড সাবলীলভাবে পড়া',
      en: 'Read real-world unvowelled Arabic signage, news, and literature fluently',
    },
  },
};

export const DetailedScientificRoadmapModal: React.FC<DetailedScientificRoadmapModalProps> = ({
  open,
  onClose,
  lang,
  profile,
  onSelectTrack,
  onJumpToStageOnDashboard,
  onOpenDeepLab,
  onCompleteStage,
}) => {
  const t = UI_STRINGS[lang];
  const [viewTrack, setViewTrack] = useState<TrackId>(profile.preferredTrack);
  const [activeStageId, setActiveStageId] = useState<string>('');

  // Sync modal track with active profile's preferredTrack whenever opened
  useEffect(() => {
    if (open) {
      setViewTrack(profile.preferredTrack);
    }
  }, [open, profile.preferredTrack]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const stageById = useMemo(() => {
    const map = new Map<string, ScientificStage>();
    ALL_SCIENTIFIC_STAGES.forEach((s) => map.set(s.id, s));
    return map;
  }, []);

  // Build ordered stage path for the chosen track (deduplicated, preserving pedagogical sequence)
  const orderedTrackStages = useMemo(() => {
    const ids = MACRO_LEVELS.flatMap((lvl) => lvl.stageIdsByTrack[viewTrack]);
    const uniqueIds = Array.from(new Set(ids));
    return uniqueIds
      .map((id) => stageById.get(id))
      .filter((s): s is ScientificStage => Boolean(s));
  }, [viewTrack, stageById]);

  // Pick initial focused stage = first uncompleted milestone on this track (or first stage)
  useEffect(() => {
    if (!open) return;
    const nextIncomplete = orderedTrackStages.find(
      (s) => !profile.completedScenarios.includes(s.id)
    );
    setActiveStageId(
      nextIncomplete ? nextIncomplete.id : orderedTrackStages[0]?.id || ZERO_TO_QURAN_STAGES[0].id
    );
  }, [open, viewTrack, orderedTrackStages, profile.completedScenarios]);

  if (!open) return null;

  const isSenior = profile.ageMode === 'senior';
  const ageProfileSpec = AGE_SCIENTIFIC_PROFILES[profile.ageMode];

  const completedInTrackCount = orderedTrackStages.filter((s) =>
    profile.completedScenarios.includes(s.id)
  ).length;
  const trackProgressPct = Math.round(
    (completedInTrackCount / Math.max(1, orderedTrackStages.length)) * 100
  );

  // Overall holistic Zero-to-Expert index combining Letters (28), Scientific Stages (12), and SRS/Surahs
  const allCompletedStagesCount = ALL_SCIENTIFIC_STAGES.filter((s) =>
    profile.completedScenarios.includes(s.id)
  ).length;
  const letterMasteryRatio = Math.min(1, profile.masteredLetters.length / 28);
  const stageMasteryRatio = allCompletedStagesCount / ALL_SCIENTIFIC_STAGES.length;
  const overallExpertPct = Math.min(
    100,
    Math.round(letterMasteryRatio * 35 + stageMasteryRatio * 65)
  );

  // Upcoming 3 milestones on the selected track
  const upcomingMilestones = orderedTrackStages
    .filter((s) => !profile.completedScenarios.includes(s.id))
    .slice(0, 3);

  const remainingMinutesOnTrack = orderedTrackStages
    .filter((s) => !profile.completedScenarios.includes(s.id))
    .reduce((sum, s) => sum + s.estimatedMinutes, 0);
  const dailyBudget = DAILY_GOAL_MINUTES[profile.dailyGoalTier || 'consistent'];
  const estimatedDaysRemaining =
    remainingMinutesOnTrack === 0
      ? 0
      : Math.max(1, Math.ceil(remainingMinutesOnTrack / dailyBudget));

  const inspectedStage =
    stageById.get(activeStageId) ||
    orderedTrackStages[0] ||
    ZERO_TO_QURAN_STAGES[0] ||
    ZERO_TO_ARABIC_STAGES[0];
  const inspectedIsDone = profile.completedScenarios.includes(inspectedStage.id);
  const inspectedChain = STAGE_PREREQ_OUTCOME[inspectedStage.id] || {
    prereq: {bn: 'পূর্ববর্তী ধাপের মৌলিক অনুশীলন', en: 'Prior foundational stage'},
    outcome: {bn: 'পরবর্তী উচ্চতর স্তরের প্রস্তুতি', en: 'Readiness for next mastery tier'},
  };
  const sampleCard = inspectedStage.interactiveCards[0];

  const trackOptions: Array<{id: TrackId; labelBn: string; labelEn: string; icon: React.ReactNode}> = [
    {
      id: 'quran',
      labelBn: '০ থেকে কুরআন এক্সপার্ট',
      labelEn: '0 to Quran Expert',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    {
      id: 'msa',
      labelBn: 'প্রমিত আরবি (MSA A1–C2)',
      labelEn: 'Standard MSA (A1–C2)',
      icon: <Compass className="w-3.5 h-3.5" />,
    },
    {
      id: 'gulf',
      labelBn: 'সৌদি ও গালফ কথ্য',
      labelEn: 'Saudi & Gulf Spoken',
      icon: <Languages className="w-3.5 h-3.5" />,
    },
  ];

  const handleTrackSwitch = (nextTrack: TrackId) => {
    setViewTrack(nextTrack);
    onSelectTrack(nextTrack);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detailed-roadmap-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-6"
    >
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Sticky Modal Header */}
        <div className="px-5 sm:px-8 py-5 border-b border-slate-200 bg-white flex flex-wrap items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <p className="text-xs text-emerald-800 font-medium">
              {t.roadmapModalKicker} · {profile.name}
            </p>
            <h2
              id="detailed-roadmap-modal-title"
              className={`font-bold text-slate-900 ${
                isSenior ? 'text-xl sm:text-2xl' : 'text-lg sm:text-2xl'
              }`}
            >
              {t.roadmapModalTitle}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Chosen Track Selector (Updates learner's track & recalculates milestones) */}
            <div className="inline-flex flex-wrap items-center p-1 rounded-xl bg-slate-100 gap-1">
              {trackOptions.map((trk) => {
                const active = viewTrack === trk.id;
                return (
                  <button
                    key={trk.id}
                    type="button"
                    onClick={() => handleTrackSwitch(trk.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {trk.icon}
                    <span>{lang === 'bn' ? trk.labelBn : trk.labelEn}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Detailed Scientific Roadmap"
              className="min-h-[42px] min-w-[42px] rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-7 bg-slate-50/50">
          {/* 1. Personalized Progress Summary Strip */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'ট্র্যাক অগ্রগতি' : 'Selected Track Mastery'}
                </p>
                <p className="text-2xl font-bold font-mono-num text-slate-900 mt-0.5">
                  {completedInTrackCount} / {orderedTrackStages.length}{' '}
                  <span className="text-sm text-emerald-700">({trackProgressPct}%)</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'bn' ? 'ধাপ সম্পন্ন হয়েছে' : 'Scientific stages completed'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'সামগ্রিক ০ → এক্সপার্ট সূচক' : 'Overall 0 → Expert Index'}
                </p>
                <p className="text-2xl font-bold font-mono-num text-slate-900 mt-0.5">
                  {overallExpertPct}%
                </p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono-num">
                  {profile.masteredLetters.length}/28 {lang === 'bn' ? 'হরফ' : 'letters'} · {profile.xp} XP
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'সক্রিয় বয়স-ভিত্তিক মোড' : 'Active Cognitive Profile'}
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {profile.ageMode === 'kids'
                    ? lang === 'bn'
                      ? 'শিশু মোড (৩–১২ বছর)'
                      : 'Kids Mode (3–12 yrs)'
                    : profile.ageMode === 'senior'
                    ? lang === 'bn'
                      ? 'প্রবীণ মোড (৫১–৯০ বছর)'
                      : 'Senior Mode (51–90 yrs)'
                    : lang === 'bn'
                    ? 'স্ট্যান্ডার্ড মোড (১৩–৫০ বছর)'
                    : 'Standard Mode (13–50 yrs)'}
                </p>
                <p className="text-xs text-emerald-800 mt-0.5 font-mono-num">
                  {lang === 'bn'
                    ? `অডিও গতি ${profile.audioSpeed}x · লক্ষ্য ${dailyBudget} মি./দিন`
                    : `Audio ${profile.audioSpeed}x · Goal ${dailyBudget}m/day`}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'এক্সপার্ট স্তরে পৌঁছানোর প্রাক্কলন' : 'Est. Path Completion'}
                </p>
                <p className="text-2xl font-bold font-mono-num text-slate-900 mt-0.5">
                  {estimatedDaysRemaining === 0
                    ? lang === 'bn'
                      ? 'সম্পন্ন ✓'
                      : 'Complete ✓'
                    : lang === 'bn'
                    ? `~${estimatedDaysRemaining} দিন`
                    : `~${estimatedDaysRemaining} days`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono-num">
                  {remainingMinutesOnTrack}{' '}
                  {lang === 'bn' ? 'মিনিট মূল পাঠ বাকি' : 'core lesson min left'}
                </p>
              </div>
            </div>

            {/* Overall Track Progress Bar */}
            <div
              role="progressbar"
              aria-valuenow={trackProgressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Zero to Expert Track Progress"
              className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-emerald-700 transition-transform duration-300 origin-left"
                style={{
                  width: '100%',
                  transform: `scaleX(${Math.max(0.04, trackProgressPct / 100)})`,
                }}
              />
            </div>
          </div>

          {/* 2. Upcoming Milestones Spotlight for Chosen Track */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t.upcomingMilestonesTitle}
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {lang === 'bn'
                  ? 'যেকোনো মাইলফলকে ক্লিক করে পেডাগজিক্যাল যুক্তি দেখুন অথবা সরাসরি অনুশীলন শুরু করুন'
                  : 'Select any milestone to inspect its cognitive rationale or jump straight in'}
              </span>
            </div>

            {upcomingMilestones.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-emerald-700 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-950">
                      {lang === 'bn'
                        ? 'মাশাআল্লাহ! এই ট্র্যাকের সবকটি মূল বৈজ্ঞানিক ধাপ সম্পন্ন হয়েছে ✓'
                        : 'All core scientific milestones on this track are complete ✓'}
                    </p>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {lang === 'bn'
                        ? 'এখন SRS ফ্ল্যাশকার্ড রিভিউ এবং ভার্চুয়াল ওস্তাদ রোলপ্লেতে দক্ষতা আরও শাণিত করুন।'
                        : 'Keep sharpening fluency in daily SRS reviews and live Virtual Ustad roleplay.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeepLab({navTab: 'quran', quranSection: 'srs'});
                  }}
                  className="px-4 py-2.5 min-h-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                >
                  {lang === 'bn' ? 'SRS রিভিউ খুলুন →' : 'Open SRS Review →'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingMilestones.map((ms, idx) => {
                  const isFocused = ms.id === inspectedStage.id;
                  return (
                    <div
                      key={ms.id}
                      onClick={() => setActiveStageId(ms.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveStageId(ms.id);
                        }
                      }}
                      className={`rounded-2xl border p-4 cursor-pointer transition-colors flex flex-col justify-between gap-3 ${
                        isFocused
                          ? 'border-emerald-700 bg-emerald-50/60'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <p className="text-xs text-emerald-800 font-semibold font-mono-num">
                          {idx === 0
                            ? lang === 'bn'
                              ? 'পরবর্তী লক্ষ্য · Next Up'
                              : 'Next Immediate Milestone'
                            : lang === 'bn'
                            ? `আসন্ন মাইলফলক ০${idx + 1}`
                            : `Upcoming Milestone 0${idx + 1}`}{' '}
                          · {ms.estimatedMinutes}m · +{ms.xpReward} XP
                        </p>
                        <h4 className="text-sm font-bold text-slate-900">
                          {ms.title[lang]}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {ms.subtitle[lang]}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 truncate">
                          {ms.sciencePillar[lang]}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onJumpToStageOnDashboard(ms.id, viewTrack);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 whitespace-nowrap shrink-0"
                        >
                          <span>{lang === 'bn' ? 'শুরু করুন' : 'Start'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Two-Zone Visual Journey Map (Left 7 cols) + Pedagogical Rationale Inspector (Right 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT ZONE: 4-Macro-Level Zero-to-Expert Stepped Progression Graph */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {lang === 'bn'
                      ? 'স্তর ০ থেকে স্তর ৩ (Zero to Expert) ধাপচিত্র'
                      : 'Level 0 to Level 3 (Zero to Expert) Progression Map'}
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {lang === 'bn' ? 'বিস্তারিত জানতে যেকোনো ধাপে ট্যাপ করুন' : 'Tap any stage to inspect'}
                </span>
              </div>

              <div className="space-y-4">
                {MACRO_LEVELS.map((macro, mIdx) => {
                  const macroStages = macro.stageIdsByTrack[viewTrack]
                    .map((id) => stageById.get(id))
                    .filter((s): s is ScientificStage => Boolean(s));
                  const macroDoneCount = macroStages.filter((s) =>
                    profile.completedScenarios.includes(s.id)
                  ).length;
                  const allMacroDone =
                    macroStages.length > 0 && macroDoneCount === macroStages.length;

                  return (
                    <div
                      key={macro.levelCode}
                      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <p className="text-xs font-mono-num text-slate-500">
                            0{mIdx + 1} · {macro.levelCode} · {macro.cefrTag}
                          </p>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                            {lang === 'bn' ? macro.titleBn : macro.titleEn}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {lang === 'bn' ? macro.summaryBn : macro.summaryEn}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 text-xs font-mono-num font-semibold whitespace-nowrap ${
                            allMacroDone ? 'text-emerald-700' : 'text-slate-600'
                          }`}
                        >
                          {allMacroDone && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                          {macroDoneCount}/{macroStages.length}{' '}
                          {lang === 'bn' ? 'সম্পন্ন' : 'Done'}
                        </span>
                      </div>

                      {/* Stage Nodes inside this Macro Level */}
                      <div className="space-y-2.5">
                        {macroStages.map((st) => {
                          const isDone = profile.completedScenarios.includes(st.id);
                          const isCurrentNext = upcomingMilestones[0]?.id === st.id;
                          const isSelected = inspectedStage.id === st.id;

                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setActiveStageId(st.id)}
                              className={`w-full text-left rounded-xl border p-3.5 transition-colors flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'border-emerald-700 bg-emerald-50/75 shadow-xs'
                                  : isDone
                                  ? 'border-emerald-200/90 bg-slate-50/40 hover:bg-white'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-mono-num">
                                  <span>
                                    {st.track === 'zero_to_quran'
                                      ? lang === 'bn'
                                        ? 'কুরআন পথ'
                                        : 'Quran Path'
                                      : lang === 'bn'
                                      ? 'আরবি ভাষা পথ'
                                      : 'Language Path'}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>{st.estimatedMinutes}m</span>
                                  <span aria-hidden="true">·</span>
                                  <span>+{st.xpReward} XP</span>
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                  {st.title[lang]}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isDone ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                                    <CheckCircle2 className="w-4 h-4" />
                                    {lang === 'bn' ? 'সম্পন্ন ✓' : 'Completed ✓'}
                                  </span>
                                ) : isCurrentNext ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 whitespace-nowrap">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                    {lang === 'bn' ? 'পরবর্তী ধাপ' : 'Current Focus'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                                    <Clock className="w-3.5 h-3.5" />
                                    {lang === 'bn' ? 'আসন্ন' : 'Upcoming'}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT ZONE: Sticky Pedagogical Rationale & Age-Neuroscience Inspector */}
            <div className="lg:col-span-5 lg:sticky lg:top-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
              <div className="space-y-1.5 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2 text-xs text-emerald-800 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <Brain className="w-4 h-4" />
                    {t.pedagogicalRationaleTitle}
                  </span>
                  <span className="font-mono-num">
                    {inspectedIsDone
                      ? lang === 'bn'
                        ? 'আয়ত্ত সম্পন্ন ✓'
                        : 'Mastered ✓'
                      : lang === 'bn'
                      ? `${inspectedStage.estimatedMinutes} মি. · +${inspectedStage.xpReward} XP`
                      : `${inspectedStage.estimatedMinutes}m · +${inspectedStage.xpReward} XP`}
                  </span>
                </div>

                <h3
                  className={`font-bold text-slate-900 ${
                    isSenior ? 'text-xl' : 'text-lg'
                  }`}
                >
                  {inspectedStage.title[lang]}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {inspectedStage.subtitle[lang]}
                </p>
              </div>

              {/* Core Cognitive Science Principle & Rationale */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500">
                  {lang === 'bn' ? 'কেন এই বৈজ্ঞানিক পদ্ধতি কাজ করে:' : 'Cognitive & Linguistic Rationale:'}
                </p>
                <p className="text-xs font-bold text-emerald-900">
                  {inspectedStage.sciencePillar[lang]}
                </p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {inspectedStage.whyItWorks[lang]}
                </p>
              </div>

              {/* Age-Adaptive Pedagogy Rationale for Active Profile */}
              <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/45 p-4 space-y-1.5">
                <p className="text-xs font-bold text-emerald-900">
                  {ageProfileSpec.badgeTitle[lang]}
                </p>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {inspectedStage.ageGuidance[profile.ageMode][lang]}
                </p>
                <p className="text-[11px] text-emerald-800 pt-1">
                  {ageProfileSpec.chunkingRule[lang]} · {ageProfileSpec.memoryStrategy[lang]}
                </p>
              </div>

              {/* Prerequisite -> Mastery Outcome Chain */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-500">
                    {lang === 'bn' ? 'প্রয়োজনীয় পূর্বধাপ (Prerequisite)' : 'Prerequisite Foundation'}
                  </p>
                  <p className="text-slate-800 font-medium mt-0.5">
                    {inspectedChain.prereq[lang]}
                  </p>
                </div>
                <div className="pt-2.5 border-t border-slate-200/80">
                  <p className="font-semibold text-emerald-800">
                    {lang === 'bn' ? 'এই ধাপ শেষে অর্জিত দক্ষতা (Outcome)' : 'Unlocked Competency'}
                  </p>
                  <p className="text-slate-900 font-semibold mt-0.5">
                    {inspectedChain.outcome[lang]}
                  </p>
                </div>
              </div>

              {/* Live Example Preview with Audio */}
              {sampleCard && (
                <div className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500">
                      {lang === 'bn' ? 'নমুনা উদাহরণ' : 'Stage Anchor Example'}
                    </p>
                    <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                      {sampleCard.meaning[lang]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span dir="rtl" className="font-arabic text-2xl text-slate-900">
                      {sampleCard.joinedAr}
                    </span>
                    <button
                      type="button"
                      onClick={() => playArabicAudio(sampleCard.joinedAr, profile.audioSpeed)}
                      aria-label="Play stage sample audio"
                      className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-800 flex items-center justify-center"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeepLab(inspectedStage.deepLab);
                  }}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between gap-3 whitespace-nowrap"
                >
                  <span className="truncate">{inspectedStage.deepLabLabel[lang]}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onJumpToStageOnDashboard(inspectedStage.id, viewTrack);
                    }}
                    className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 whitespace-nowrap truncate"
                  >
                    {lang === 'bn' ? 'ইন্টারঅ্যাক্টিভ কার্ডে যান' : 'Practice Stage Card'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!inspectedIsDone) {
                        onCompleteStage(inspectedStage.id, inspectedStage.xpReward);
                      }
                    }}
                    className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap truncate ${
                      inspectedIsDone
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {inspectedIsDone
                      ? lang === 'bn'
                        ? 'সম্পন্ন ✓'
                        : 'Completed ✓'
                      : lang === 'bn'
                      ? `সম্পন্ন চিহ্নিত (+${inspectedStage.xpReward} XP)`
                      : `Mark Done (+${inspectedStage.xpReward} XP)`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
