import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Play,
  RefreshCw,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react';
import {UI_STRINGS} from '../data/i18n';
import type {
  DailyGoalTier,
  FamilyProfile,
  Language,
  ScientificStage,
  SmartDailySchedulePlan,
  SmartScheduleFocus,
  SmartScheduleSessionType,
} from '../types';
import {playArabicAudio} from '../utils/audioPlayer';

const SCHEDULE_STORAGE_KEY = 'arbi_sikkhi_smart_schedule_v1';

interface CachedProfileSchedule {
  signature: string;
  plan: SmartDailySchedulePlan;
  completedOrders: number[];
  focusPreference: SmartScheduleFocus;
}

type StoredScheduleMap = Record<string, CachedProfileSchedule>;

function readStoredSchedules(): StoredScheduleMap {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredScheduleMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredSchedules(nextMap: StoredScheduleMap): void {
  try {
    // Keep at most 24 recent profile-day entries to keep localStorage lean
    const entries = Object.entries(nextMap);
    const trimmed = entries.slice(-24);
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    // Ignore storage quota issues
  }
}

const SESSION_TYPE_LABELS: Record<
  SmartScheduleSessionType,
  {bn: string; en: string}
> = {
  makhraj_drill: {bn: 'মাখরাজ ও রাইটিং ল্যাব', en: 'Makharij & Stroke Lab'},
  harakat_rhythm: {bn: 'হরকত ও তাজবীদ তাল', en: 'Harakat & Beat Meter'},
  voice_quiz: {bn: 'ভয়েস মাখরাজ কুইজ', en: 'Voice Makharij Quiz'},
  surah_review: {bn: 'শব্দে-শব্দে সূরা অনুশীলন', en: 'Word-by-Word Surah Lab'},
  root_explorer: {bn: '৩-অক্ষরের মূলশব্দ ল্যাব', en: '3-Letter Root Explorer'},
  srs_flashcards: {bn: 'স্মৃতি রিভিউ (SRS)', en: 'SRS Vocabulary Review'},
  spoken_dialogue: {bn: 'প্রমিত ও সৌদি কথ্য সংলাপ', en: 'MSA & Gulf Dialogue'},
  ustad_coaching: {bn: 'ভার্চুয়াল ওস্তাদ সেশন', en: 'Virtual Ustad Coaching'},
  pathway_stage: {bn: 'বৈজ্ঞানিক ধাপ পাঠ', en: 'Scientific Stage Lesson'},
};

interface SmartDailyScheduleCardProps {
  lang: Language;
  profile: FamilyProfile;
  todayDateKey: string;
  targetGoalMinutes: number;
  todayMinutes: number;
  currentStage: ScientificStage;
  completedStagesCount: number;
  srsDueCount: number;
  onLaunchSession: (
    sessionType: SmartScheduleSessionType,
    stage: ScientificStage
  ) => void;
  onCompleteSessionBlock: (durationMinutes: number, xpReward: number) => void;
  onAdjustGoalClick: () => void;
}

export const SmartDailyScheduleCard: React.FC<SmartDailyScheduleCardProps> = ({
  lang,
  profile,
  todayDateKey,
  targetGoalMinutes,
  todayMinutes,
  currentStage,
  completedStagesCount,
  srsDueCount,
  onLaunchSession,
  onCompleteSessionBlock,
  onAdjustGoalClick,
}) => {
  const t = UI_STRINGS[lang];
  const isSenior = profile.ageMode === 'senior';
  const storageEntryKey = `${profile.id}::${todayDateKey}`;
  const goalTier: DailyGoalTier = profile.dailyGoalTier || 'consistent';

  const [focusPreference, setFocusPreference] = useState<SmartScheduleFocus>(() => {
    const saved = readStoredSchedules()[storageEntryKey];
    return saved?.focusPreference || 'balanced';
  });

  const [plan, setPlan] = useState<SmartDailySchedulePlan | null>(() => {
    const saved = readStoredSchedules()[storageEntryKey];
    return saved?.plan || null;
  });

  const [completedOrders, setCompletedOrders] = useState<number[]>(() => {
    const saved = readStoredSchedules()[storageEntryKey];
    return Array.isArray(saved?.completedOrders) ? saved.completedOrders : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playingSampleOrder, setPlayingSampleOrder] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Sync local state when switching between family profiles or when date rolls over
  useEffect(() => {
    const saved = readStoredSchedules()[storageEntryKey];
    if (saved) {
      setFocusPreference(saved.focusPreference || 'balanced');
      setPlan(saved.plan);
      setCompletedOrders(Array.isArray(saved.completedOrders) ? saved.completedOrders : []);
    } else {
      setFocusPreference('balanced');
      setPlan(null);
      setCompletedOrders([]);
    }
    setErrorMessage(null);
  }, [storageEntryKey]);

  const currentStageTitle = currentStage.title[lang];
  const masteredLettersCount = profile.masteredLetters.length;

  const expectedSignature = [
    profile.ageMode,
    goalTier,
    targetGoalMinutes,
    profile.preferredTrack,
    currentStage.id,
    focusPreference,
    lang,
  ].join('|');

  const fetchSmartSchedule = useCallback(
    async (forceRefresh: boolean) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch('/api/smart-schedule', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          signal: controller.signal,
          body: JSON.stringify({
            learnerName: profile.name,
            ageMode: profile.ageMode,
            dailyGoalTier: goalTier,
            targetMinutes: targetGoalMinutes,
            todayMinutesStudied: todayMinutes,
            preferredTrack: profile.preferredTrack,
            masteredLettersCount,
            completedStagesCount,
            currentStageTitle,
            srsDueCount,
            focusPreference,
            lang,
            forceRefresh,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data?.error === 'string' && data.error.trim().length > 0
              ? data.error
              : `HTTP ${res.status}`
          );
        }

        if (
          !data ||
          typeof data.planHeadline !== 'string' ||
          !Array.isArray(data.sessions) ||
          data.sessions.length === 0
        ) {
          throw new Error(
            lang === 'bn'
              ? 'সার্ভার থেকে পূর্ণাঙ্গ শিডিউল পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
              : 'Received an incomplete schedule payload. Please try again.'
          );
        }

        const normalizedPlan: SmartDailySchedulePlan = {
          planHeadline: data.planHeadline,
          pedagogicalSummary: data.pedagogicalSummary || '',
          optimalTimeHint: data.optimalTimeHint || '',
          totalMinutes: Number(data.totalMinutes) || targetGoalMinutes,
          sessions: data.sessions.map(
            (rawItem: Record<string, unknown>, idx: number) => {
              const rawType = String(rawItem.sessionType || 'pathway_stage');
              const validType: SmartScheduleSessionType =
                rawType in SESSION_TYPE_LABELS
                  ? (rawType as SmartScheduleSessionType)
                  : 'pathway_stage';
              return {
                sessionOrder: Number(rawItem.sessionOrder) || idx + 1,
                title: String(rawItem.title || `Session ${idx + 1}`),
                durationMinutes: Math.max(1, Number(rawItem.durationMinutes) || 5),
                sessionType: validType,
                focusArabicSample: String(
                  rawItem.focusArabicSample || 'بِسْمِ اللَّهِ'
                ),
                actionableGoal: String(rawItem.actionableGoal || ''),
                cognitiveReason: String(rawItem.cognitiveReason || ''),
                xpReward: Math.max(10, Math.min(40, Number(rawItem.xpReward) || 15)),
              };
            }
          ),
        };

        const existingMap = readStoredSchedules();
        const prevEntry = existingMap[storageEntryKey];
        const preservedOrders = forceRefresh
          ? []
          : Array.isArray(prevEntry?.completedOrders)
          ? prevEntry.completedOrders
          : [];

        const updatedEntry: CachedProfileSchedule = {
          signature: expectedSignature,
          plan: normalizedPlan,
          completedOrders: preservedOrders,
          focusPreference,
        };

        writeStoredSchedules({
          ...existingMap,
          [storageEntryKey]: updatedEntry,
        });

        setPlan(normalizedPlan);
        setCompletedOrders(preservedOrders);
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : lang === 'bn'
            ? 'এআই শিডিউল তৈরিতে ত্রুটি হয়েছে।'
            : 'Failed to generate smart schedule.'
        );
      } finally {
        if (abortRef.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [
      completedStagesCount,
      currentStageTitle,
      expectedSignature,
      focusPreference,
      goalTier,
      lang,
      masteredLettersCount,
      profile.ageMode,
      profile.name,
      profile.preferredTrack,
      srsDueCount,
      storageEntryKey,
      targetGoalMinutes,
      todayMinutes,
    ]
  );

  // Automatically fetch when profile/goal/ageMode/track/focus/lang signature changes
  useEffect(() => {
    const saved = readStoredSchedules()[storageEntryKey];
    if (saved && saved.signature === expectedSignature && saved.plan?.sessions?.length) {
      setPlan(saved.plan);
      setCompletedOrders(Array.isArray(saved.completedOrders) ? saved.completedOrders : []);
      return;
    }
    fetchSmartSchedule(false);
  }, [expectedSignature, fetchSmartSchedule, storageEntryKey]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleSelectFocus = (nextFocus: SmartScheduleFocus) => {
    if (nextFocus === focusPreference) return;
    setFocusPreference(nextFocus);
  };

  const handlePlaySample = async (order: number, arabicSample: string) => {
    setPlayingSampleOrder(order);
    try {
      await playArabicAudio(arabicSample, profile.audioSpeed);
    } finally {
      setPlayingSampleOrder((curr) => (curr === order ? null : curr));
    }
  };

  const handleMarkDone = (
    order: number,
    durationMinutes: number,
    xpReward: number
  ) => {
    if (completedOrders.includes(order)) return;
    const nextCompleted = [...completedOrders, order];
    setCompletedOrders(nextCompleted);

    const existingMap = readStoredSchedules();
    const existingEntry = existingMap[storageEntryKey];
    if (existingEntry) {
      writeStoredSchedules({
        ...existingMap,
        [storageEntryKey]: {
          ...existingEntry,
          completedOrders: nextCompleted,
        },
      });
    }

    onCompleteSessionBlock(durationMinutes, xpReward);
  };

  const focusTabs: Array<{id: SmartScheduleFocus; label: string}> = [
    {id: 'balanced', label: lang === 'bn' ? 'সুষম' : 'Balanced'},
    {id: 'makhraj', label: lang === 'bn' ? 'মাখরাজ' : 'Makhraj'},
    {id: 'quran_vocab', label: lang === 'bn' ? 'কুরআন ও শব্দ' : 'Quran & Vocab'},
    {id: 'speaking', label: lang === 'bn' ? 'কথোপকথন' : 'Speaking'},
  ];

  const ageLabel =
    profile.ageMode === 'kids'
      ? t.ageModeKids
      : profile.ageMode === 'senior'
      ? t.ageModeSenior
      : t.ageModeStandard;

  const trackLabel =
    profile.preferredTrack === 'quran'
      ? t.trackQuran
      : profile.preferredTrack === 'msa'
      ? t.trackMsa
      : t.trackGulf;

  const completedBlocksCount = plan
    ? plan.sessions.filter((s) => completedOrders.includes(s.sessionOrder)).length
    : 0;
  const totalBlocksCount = plan ? plan.sessions.length : 0;

  return (
    <section
      aria-labelledby="smart-daily-schedule-heading"
      className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6"
    >
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-800 font-medium">
            <span>{t.smartScheduleKicker}</span>
            <span aria-hidden="true">·</span>
            <span>{ageLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">
              {targetGoalMinutes} {lang === 'bn' ? 'মিনিট লক্ষ্য' : 'min target'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{trackLabel}</span>
          </div>

          <h2
            id="smart-daily-schedule-heading"
            style={{textWrap: 'balance'}}
            className={`font-bold tracking-tight text-slate-900 ${
              isSenior ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            }`}
          >
            {plan ? plan.planHeadline : t.smartScheduleTitle}
          </h2>

          {plan?.pedagogicalSummary && (
            <p
              className={`text-slate-600 leading-relaxed ${
                isSenior ? 'text-base' : 'text-sm'
              }`}
            >
              {plan.pedagogicalSummary}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onAdjustGoalClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.adjustGoalBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchSmartSchedule(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 disabled:opacity-60 text-xs font-semibold text-emerald-900 transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t.regenerateScheduleBtn}</span>
          </button>
        </div>
      </div>

      {/* Focus Filter Bar + Optimal Study Rhythm Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1 whitespace-nowrap">
            {lang === 'bn' ? 'আজকের ফোকাস:' : 'Today’s Focus:'}
          </span>
          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100">
            {focusTabs.map((tab) => {
              const active = focusPreference === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectFocus(tab.id)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {plan && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <CalendarClock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            {plan.optimalTimeHint && (
              <>
                <span>{plan.optimalTimeHint}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="font-mono-num font-semibold text-slate-800">
              {completedBlocksCount}/{totalBlocksCount}{' '}
              {lang === 'bn' ? 'সেশন সম্পন্ন' : 'blocks done'}
            </span>
          </div>
        )}
      </div>

      {/* Error State (Authentic API Error Display + Retry — Never Fake AI Fallback) */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-900">
                {lang === 'bn'
                  ? 'স্মার্ট শিডিউল লোড করা যায়নি'
                  : 'Unable to generate Smart Daily Schedule'}
              </p>
              <p className="text-xs text-rose-800 leading-relaxed">{errorMessage}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchSmartSchedule(true)}
            disabled={isLoading}
            className="px-4 py-2 min-h-[40px] rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
          >
            {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Retry'}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !plan && (
        <div className="py-6 space-y-4" aria-live="polite">
          <p className="text-xs font-medium text-emerald-800">
            {t.generatingScheduleLabel}
          </p>
          <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
            {[1, 2, 3].map((placeholderIdx) => (
              <div
                key={placeholderIdx}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-44 rounded bg-slate-200" />
                  <div className="h-4 w-72 rounded bg-slate-200" />
                  <div className="h-3 w-full max-w-md rounded bg-slate-100" />
                </div>
                <div className="h-10 w-36 rounded-xl bg-slate-200 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Schedule Session Timeline (Dividers Instead of Nested Cards-Within-Cards) */}
      {plan && plan.sessions.length > 0 && (
        <div
          className={`divide-y divide-slate-200/80 border-t border-slate-200/80 transition-opacity duration-200 ${
            isLoading ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {plan.sessions.map((item, idx) => {
            const isDone = completedOrders.includes(item.sessionOrder);
            const moduleLabel =
              SESSION_TYPE_LABELS[item.sessionType]?.[lang] ||
              SESSION_TYPE_LABELS.pathway_stage[lang];
            const indexStr = String(idx + 1).padStart(2, '0');
            const isPlayingThis = playingSampleOrder === item.sessionOrder;

            return (
              <div
                key={`${item.sessionOrder}-${item.sessionType}`}
                className="py-5 first:pt-5 last:pb-1 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Clean Editorial Metadata, Title & Actionable Goal */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono-num font-semibold text-emerald-800">
                      {indexStr}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num font-semibold text-slate-800">
                      {item.durationMinutes} {lang === 'bn' ? 'মিনিট' : 'min'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num text-emerald-700 font-medium">
                      +{item.xpReward} XP
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{moduleLabel}</span>
                    {item.cognitiveReason && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-600">{item.cognitiveReason}</span>
                      </>
                    )}
                  </div>

                  <h3
                    className={`font-bold text-slate-900 ${
                      isSenior ? 'text-lg' : 'text-base'
                    } ${isDone ? 'line-through text-slate-500' : ''}`}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`text-slate-600 leading-relaxed max-w-2xl ${
                      isSenior ? 'text-base' : 'text-sm'
                    }`}
                  >
                    {item.actionableGoal}
                  </p>
                </div>

                {/* Right: Vowelled Arabic Sample Audio + Start Session + Mark Done */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {item.focusArabicSample && (
                    <button
                      type="button"
                      onClick={() =>
                        handlePlaySample(item.sessionOrder, item.focusArabicSample)
                      }
                      title={t.listenClearAudio}
                      className="inline-flex items-center gap-2.5 px-3.5 py-2 min-h-[42px] rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-900 transition-colors shrink-0"
                    >
                      <Volume2
                        className={`w-4 h-4 shrink-0 ${
                          isPlayingThis ? 'text-amber-600' : 'text-emerald-700'
                        }`}
                      />
                      <span
                        dir="rtl"
                        className="font-arabic text-lg leading-none text-slate-900"
                      >
                        {item.focusArabicSample}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onLaunchSession(item.sessionType, currentStage)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t.startSessionBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleMarkDone(
                        item.sessionOrder,
                        item.durationMinutes,
                        item.xpReward
                      )
                    }
                    disabled={isDone}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[42px] rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isDone
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 cursor-default'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        isDone ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    />
                    <span>
                      {isDone ? t.sessionCompletedLabel : t.markSessionDoneBtn}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
