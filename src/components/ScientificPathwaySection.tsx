import React, {useEffect, useState} from 'react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Languages,
  Map as MapIcon,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {
  AGE_SCIENTIFIC_PROFILES,
  ZERO_TO_ARABIC_STAGES,
  ZERO_TO_QURAN_STAGES,
} from '../data/scientificPathway';
import type {
  AgeMode,
  DeepLabTarget,
  Language,
  ScientificPathTrack,
  ScientificStage,
} from '../types';
import {playArabicAudio} from '../utils/audioPlayer';

interface ScientificPathwaySectionProps {
  lang: Language;
  ageMode: AgeMode;
  audioSpeed: number;
  completedStepIds: string[];
  onCompleteStage: (stageId: string, xpReward: number) => void;
  onSetAgeMode: (mode: AgeMode) => void;
  onOpenDeepLab: (target: DeepLabTarget) => void;
  onOpenRoadmapModal: () => void;
  focusedStageRequest?: {stageId: string; nonce: number} | null;
}

type HarakatFadeLevel = 'full' | 'partial' | 'none';

export const ScientificPathwaySection: React.FC<ScientificPathwaySectionProps> = ({
  lang,
  ageMode,
  audioSpeed,
  completedStepIds,
  onCompleteStage,
  onSetAgeMode,
  onOpenDeepLab,
  onOpenRoadmapModal,
  focusedStageRequest,
}) => {
  const [activePath, setActivePath] = useState<ScientificPathTrack>('zero_to_quran');
  const [selectedStageId, setSelectedStageId] = useState<string>(() => {
    const firstIncomplete = ZERO_TO_QURAN_STAGES.find(
      (s) => !completedStepIds.includes(s.id)
    );
    return firstIncomplete ? firstIncomplete.id : ZERO_TO_QURAN_STAGES[0].id;
  });
  const [stageMode, setStageMode] = useState<'learn' | 'quiz'>('learn');
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [harakatFade, setHarakatFade] = useState<HarakatFadeLevel>('full');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [highlightedPartIdx, setHighlightedPartIdx] = useState<number | null>(null);

  const stages: ScientificStage[] =
    activePath === 'zero_to_quran' ? ZERO_TO_QURAN_STAGES : ZERO_TO_ARABIC_STAGES;

  const activeStage =
    stages.find((s) => s.id === selectedStageId) || stages[0];
  const currentIndex = stages.findIndex((s) => s.id === activeStage.id);

  // Reset card & quiz state when switching stages
  useEffect(() => {
    setActiveCardIdx(0);
    setSelectedOptionId(null);
    setHighlightedPartIdx(null);
    setStageMode('learn');
    if (activeStage.id === 'ar_step_05_unvowelled_read') {
      setHarakatFade('none');
    } else {
      setHarakatFade('full');
    }
  }, [activeStage.id]);

  // Honor jump-to-stage requests from DetailedScientificRoadmapModal
  useEffect(() => {
    if (!focusedStageRequest) return;
    const isArabicTrackStage = ZERO_TO_ARABIC_STAGES.some(
      (s) => s.id === focusedStageRequest.stageId
    );
    setActivePath(isArabicTrackStage ? 'arabic_language' : 'zero_to_quran');
    setSelectedStageId(focusedStageRequest.stageId);
  }, [focusedStageRequest]);

  const handleSwitchPath = (nextPath: ScientificPathTrack) => {
    setActivePath(nextPath);
    const list =
      nextPath === 'zero_to_quran' ? ZERO_TO_QURAN_STAGES : ZERO_TO_ARABIC_STAGES;
    const nextUnfinished = list.find((s) => !completedStepIds.includes(s.id));
    setSelectedStageId(nextUnfinished ? nextUnfinished.id : list[0].id);
  };

  const quranDoneCount = ZERO_TO_QURAN_STAGES.filter((s) =>
    completedStepIds.includes(s.id)
  ).length;
  const arabicDoneCount = ZERO_TO_ARABIC_STAGES.filter((s) =>
    completedStepIds.includes(s.id)
  ).length;

  const ageSpec = AGE_SCIENTIFIC_PROFILES[ageMode];
  const isSenior = ageMode === 'senior';
  const isKids = ageMode === 'kids';

  const visibleCards = isKids
    ? activeStage.interactiveCards.slice(0, 2)
    : activeStage.interactiveCards;
  const currentCard = visibleCards[activeCardIdx % visibleCards.length] || visibleCards[0];

  const displayedArabic =
    harakatFade === 'full'
      ? currentCard.joinedAr
      : harakatFade === 'partial'
      ? currentCard.partialHarakatAr
      : currentCard.unvowelledAr;

  const isStageDone = completedStepIds.includes(activeStage.id);

  const selectedQuizOption = activeStage.quiz.options.find(
    (o) => o.id === selectedOptionId
  );

  const handleChooseQuizOption = (optId: string, isCorrect: boolean) => {
    setSelectedOptionId(optId);
    if (isCorrect && !isStageDone) {
      onCompleteStage(activeStage.id, activeStage.xpReward);
    }
  };

  const handleGoNextStage = () => {
    if (currentIndex < stages.length - 1) {
      setSelectedStageId(stages[currentIndex + 1].id);
    }
  };

  const handleGoPrevStage = () => {
    if (currentIndex > 0) {
      setSelectedStageId(stages[currentIndex - 1].id);
    }
  };

  return (
    <section
      id="scientific-step-pathway"
      className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-7 scroll-mt-20"
    >
      {/* Section Header + Dual Path Segmented Switcher */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <p className="text-xs text-emerald-800 font-medium">
            {lang === 'bn'
              ? 'বৈজ্ঞানিক ধাপে-ধাপে পাঠ্যক্রম · বয়স-উপযোগী কগনিটিভ লার্নিং ইঞ্জিন'
              : 'Scientific Step-by-Step Mastery · Age-Adaptive Cognitive Learning Engine'}
          </p>
          <h2
            style={{textWrap: 'balance'}}
            className={`font-bold text-slate-900 ${
              isSenior ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {lang === 'bn'
              ? 'শূন্য থেকে কুরআন তিলাওয়াত ও আরবি ভাষা শিক্ষার স্মার্ট রোডম্যাপ'
              : 'Zero-to-Quran & Arabic Language Step-by-Step Roadmap'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {lang === 'bn'
              ? 'মুখস্থের চাপ ছাড়াই ধ্বনিবিজ্ঞান, যুক্তাক্ষর সূত্র, প্যারেটো শব্দভাণ্ডার ও ৩-অক্ষরের মূলশব্দ দিয়ে প্রতিটি বয়সের জন্য সহজ ও বৈজ্ঞানিক অনুশীলন।'
              : 'Learn effortlessly without rote overload using minimal-pair phonetics, glyph stitching, Pareto core vocabulary, and 3-letter root templates tailored to your age group.'}
          </p>
        </div>

        {/* Dual Track Segmented Control + Detailed Scientific Roadmap Modal Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex flex-wrap items-center p-1.5 rounded-2xl bg-slate-100 gap-1">
            <button
              type="button"
              onClick={() => handleSwitchPath('zero_to_quran')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activePath === 'zero_to_quran'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>
                {lang === 'bn' ? '০ থেকে কুরআন শিক্ষা' : '0 to Quran Path'}
              </span>
              <span className="font-mono-num text-xs text-slate-500">
                ({quranDoneCount}/{ZERO_TO_QURAN_STAGES.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchPath('arabic_language')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activePath === 'arabic_language'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Languages className="w-4 h-4 text-emerald-700" />
              <span>
                {lang === 'bn' ? '০ থেকে আরবি ভাষা' : '0 to Arabic Language'}
              </span>
              <span className="font-mono-num text-xs text-slate-500">
                ({arabicDoneCount}/{ZERO_TO_ARABIC_STAGES.length})
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenRoadmapModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <MapIcon className="w-4 h-4 text-emerald-700" />
            <span>
              {lang === 'bn'
                ? 'বিস্তারিত বৈজ্ঞানিক রোডম্যাপ'
                : 'Detailed Scientific Roadmap'}
            </span>
          </button>
        </div>
      </div>

      {/* Age-Adaptive Scientific Pedagogy Banner */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {ageSpec.badgeTitle[lang]}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {ageSpec.cognitivePrinciple[lang]}
              </p>
            </div>
          </div>

          {/* Quick Age Pedagogy Switcher so learners/families can test smart adaptation */}
          <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200">
            {(
              [
                {id: 'kids', bn: 'শিশু (৩–১২)', en: 'Kids (3–12)'},
                {id: 'standard', bn: 'তরুণ/বয়স্ক (১৩–৫০)', en: 'Standard (13–50)'},
                {id: 'senior', bn: 'প্রবীণ (৫১–৯০)', en: 'Senior (51–90)'},
              ] as Array<{id: AgeMode; bn: string; en: string}>
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSetAgeMode(item.id)}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  ageMode === item.id
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'bn' ? item.bn : item.en}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Unboxed Scientific Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200/70 text-xs">
          <div>
            <p className="text-slate-500">
              {lang === 'bn' ? 'মেমোরি চাঙ্কিং নিয়ম' : 'Cognitive Chunking'}
            </p>
            <p className="font-semibold text-slate-900 mt-0.5">
              {ageSpec.chunkingRule[lang]}
            </p>
          </div>
          <div>
            <p className="text-slate-500">
              {lang === 'bn' ? 'আদর্শ সেশন ও অডিও গতি' : 'Session & Audio Cadence'}
            </p>
            <p className="font-semibold text-slate-900 mt-0.5 font-mono-num">
              {ageSpec.sessionTarget[lang]}
            </p>
          </div>
          <div>
            <p className="text-slate-500">
              {lang === 'bn' ? 'স্মার্ট মনে রাখার কৌশল' : 'Encoding Strategy'}
            </p>
            <p className="font-semibold text-slate-900 mt-0.5">
              {ageSpec.memoryStrategy[lang]}
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Clickable Stage Progression Roadmap */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {activePath === 'zero_to_quran'
              ? lang === 'bn'
                ? 'ধাপে ধাপে শূন্য থেকে বিশুদ্ধ কুরআন তিলাওয়াত ও অর্থ অনুধাবন (৭টি ধাপ)'
                : 'Step-by-step from absolute zero to Tajweed Surah recitation & comprehension (7 stages)'
              : lang === 'bn'
              ? 'ধাপে ধাপে শূন্য থেকে আরবি বাক্য গঠন, মূলশব্দ ও কথোপকথন (৫টি ধাপ)'
              : 'Step-by-step from first words to roots, Gulf speech & unvowelled reading (5 stages)'}
          </span>
          <span className="font-mono-num font-semibold text-emerald-800">
            {activePath === 'zero_to_quran'
              ? `${Math.round((quranDoneCount / ZERO_TO_QURAN_STAGES.length) * 100)}%`
              : `${Math.round((arabicDoneCount / ZERO_TO_ARABIC_STAGES.length) * 100)}%`}{' '}
            {lang === 'bn' ? 'সম্পন্ন' : 'Complete'}
          </span>
        </div>

        <div
          className={`grid gap-2.5 ${
            activePath === 'zero_to_quran'
              ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
              : 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5'
          }`}
        >
          {stages.map((st) => {
            const isSelected = st.id === activeStage.id;
            const isDone = completedStepIds.includes(st.id);
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStageId(st.id)}
                className={`text-left rounded-2xl border p-3.5 transition-colors min-h-[82px] flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50/80 shadow-xs'
                    : isDone
                    ? 'border-emerald-200 bg-white hover:border-emerald-400'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 text-xs">
                  <span className="font-mono-num font-bold text-slate-700">
                    {lang === 'bn' ? `ধাপ ০${st.stepNumber}` : `Step 0${st.stepNumber}`}
                  </span>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'সম্পন্ন' : 'Done'}
                    </span>
                  ) : isSelected ? (
                    <span className="text-[11px] font-semibold text-emerald-800 whitespace-nowrap">
                      {lang === 'bn' ? 'চলমান' : 'Active'}
                    </span>
                  ) : (
                    <span className="font-mono-num text-[11px] text-slate-400 whitespace-nowrap">
                      {st.estimatedMinutes}m
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {st.title[lang].replace(/^[০-৯0-9]+\.\s*/, '')}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Zone Interactive Stage Sandbox (Left 7 cols: Interactive Studio | Right 5 cols: Age Science Coach) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-1">
        {/* LEFT ZONE (7 cols): Interactive Step Discovery + Harakat Fade + Smart Quiz */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 flex flex-col justify-between gap-5">
          {/* Top Bar inside Interactive Stage */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-num">
                <button
                  type="button"
                  onClick={handleGoPrevStage}
                  disabled={currentIndex === 0}
                  aria-label="Previous step"
                  className="min-h-[38px] min-w-[38px] rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  0{activeStage.stepNumber} / 0{stages.length} · {activeStage.estimatedMinutes}{' '}
                  {lang === 'bn' ? 'মি.' : 'min'} · +{activeStage.xpReward} XP
                </span>
                <button
                  type="button"
                  onClick={handleGoNextStage}
                  disabled={currentIndex === stages.length - 1}
                  aria-label="Next step"
                  className="min-h-[38px] min-w-[38px] rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Stage Sub-Mode Switcher: Learn vs Quiz */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/75">
                <button
                  type="button"
                  onClick={() => setStageMode('learn')}
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    stageMode === 'learn'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'bn' ? '১. ইন্টারঅ্যাক্টিভ পাঠ' : '1. Interactive Lesson'}
                </button>
                <button
                  type="button"
                  onClick={() => setStageMode('quiz')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    stageMode === 'quiz'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {lang === 'bn' ? '২. স্মার্ট যাচাই কুইজ' : '2. Quick Mastery Check'}
                </button>
              </div>
            </div>

            <div>
              <h3
                className={`font-bold text-slate-900 ${
                  isSenior ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                }`}
              >
                {activeStage.title[lang]}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {activeStage.subtitle[lang]}
              </p>
            </div>
          </div>

          {stageMode === 'learn' ? (
            <div className="space-y-4">
              {/* Example Selector + 3-Stage Scientific Harakat Fade Control */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5">
                  {visibleCards.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveCardIdx(idx);
                        setHighlightedPartIdx(null);
                      }}
                      className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold font-mono-num transition-colors whitespace-nowrap shrink-0 ${
                        idx === activeCardIdx % visibleCards.length
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'bn' ? `উদাহরণ ০${idx + 1}` : `Example 0${idx + 1}`}
                    </button>
                  ))}
                </div>

                {!isKids && (
                  <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200 text-xs">
                    {(
                      [
                        {id: 'full', bn: 'পূর্ণ হরকত', en: 'Full Harakat'},
                        {id: 'partial', bn: 'আংশিক ক্লু', en: 'Partial Cue'},
                        {id: 'none', bn: 'হরকত ছাড়া', en: 'Unvowelled'},
                      ] as Array<{id: HarakatFadeLevel; bn: string; en: string}>
                    ).map((lv) => (
                      <button
                        key={lv.id}
                        type="button"
                        onClick={() => setHarakatFade(lv.id)}
                        className={`px-2.5 py-1 min-h-[32px] rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                          harakatFade === lv.id
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {lang === 'bn' ? lv.bn : lv.en}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Interactive Arabic Decomposition & Audio Canvas */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
                {/* Interactive RTL Building Blocks — Tap each part to hear & inspect */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    {lang === 'bn'
                      ? 'ডান থেকে বামে প্রতিটি অংশে ট্যাপ করে আলাদা উচ্চারণ শুনুন:'
                      : 'Tap each building block (Right-to-Left) to hear how parts combine:'}
                  </p>
                  <div dir="rtl" className="flex flex-wrap items-center gap-2.5">
                    {currentCard.partsAr.map((part, pIdx) => {
                      const activePart = highlightedPartIdx === pIdx;
                      return (
                        <React.Fragment key={pIdx}>
                          <button
                            type="button"
                            onClick={() => {
                              setHighlightedPartIdx(pIdx);
                              playArabicAudio(part, audioSpeed);
                            }}
                            className={`min-h-[54px] px-4 py-2 rounded-xl border font-arabic transition-transform active:scale-95 ${
                              isSenior ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
                            } ${
                              activePart
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-emerald-400'
                            }`}
                          >
                            {part}
                          </button>
                          {pIdx < currentCard.partsAr.length - 1 && (
                            <span className="text-slate-400 font-bold select-none">+</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Joined / Full Result Display + Primary Audio Playback */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-800">
                      {currentCard.translit[lang]}
                    </p>
                    <p
                      className={`font-bold text-slate-900 ${
                        isSenior ? 'text-lg' : 'text-sm sm:text-base'
                      }`}
                    >
                      {currentCard.meaning[lang]}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    <span
                      dir="rtl"
                      className={`font-arabic text-slate-900 text-right ${
                        isSenior ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'
                      }`}
                    >
                      {displayedArabic}
                    </span>

                    <button
                      type="button"
                      onClick={() => playArabicAudio(currentCard.joinedAr, audioSpeed)}
                      aria-label="Listen full pronunciation"
                      className="inline-flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>
                        {lang === 'bn' ? 'শুনুন' : 'Listen'} ({audioSpeed}x)
                      </span>
                    </button>
                  </div>
                </div>

                {/* Contextual Bite-Sized Scientific Insight */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-emerald-800">
                    {lang === 'bn' ? 'বৈজ্ঞানিক নোট: ' : 'Why this is easy: '}
                  </strong>
                  {currentCard.scientificNote[lang]}
                </div>
              </div>

              {/* Bottom Action Bar in Learn Mode */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStageMode('quiz')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {lang === 'bn'
                      ? '১-প্রশ্নে দক্ষতা যাচাই করে ধাপ সম্পন্ন করুন →'
                      : 'Take 1-Step Recall Check to Complete Stage →'}
                  </span>
                </button>

                {isStageDone && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    {lang === 'bn' ? 'ধাপটি আয়ত্ত সম্পন্ন ✓' : 'Stage Mastered ✓'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* SMART ACTIVE-RECALL QUIZ MODE */
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 max-w-xl">
                  <p className="text-xs font-semibold text-emerald-800">
                    {lang === 'bn'
                      ? 'অ্যাক্টিভ রিকল যাচাই (কোনো টাইমার চাপ নেই)'
                      : 'Active Recall Verification (Zero Timer Stress)'}
                  </p>
                  <h4
                    className={`font-bold text-slate-900 ${
                      isSenior ? 'text-lg sm:text-xl' : 'text-base'
                    }`}
                  >
                    {activeStage.quiz.prompt[lang]}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => playArabicAudio(activeStage.quiz.audioCueAr, audioSpeed)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[42px] rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  {lang === 'bn' ? 'অডিও ক্লু শুনুন' : 'Play Audio Clue'}
                </button>
              </div>

              <div className="space-y-2.5">
                {activeStage.quiz.options.map((opt) => {
                  const chosen = selectedOptionId === opt.id;
                  const showCorrect = chosen && opt.isCorrect;
                  const showWrong = chosen && !opt.isCorrect;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleChooseQuizOption(opt.id, opt.isCorrect)}
                      className={`w-full min-h-[54px] px-4 py-3 rounded-xl border text-left transition-colors flex items-center justify-between gap-4 ${
                        showCorrect
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                          : showWrong
                          ? 'border-amber-400 bg-amber-50/70 text-slate-900'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold">
                        {opt.label[lang]}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        {opt.labelAr && (
                          <span
                            dir="rtl"
                            className={`font-arabic text-slate-900 ${
                              isSenior ? 'text-3xl' : 'text-2xl'
                            }`}
                          >
                            {opt.labelAr}
                          </span>
                        )}
                        {showCorrect && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 whitespace-nowrap">
                            <CheckCircle2 className="w-4 h-4" />
                            {lang === 'bn' ? 'সঠিক ✓' : 'Correct ✓'}
                          </span>
                        )}
                        {showWrong && (
                          <span className="text-xs font-semibold text-amber-800 whitespace-nowrap">
                            {lang === 'bn' ? 'আবার দেখুন' : 'Try another'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedQuizOption && (
                <div
                  className={`rounded-xl border p-4 space-y-3 ${
                    selectedQuizOption.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : 'border-amber-200 bg-amber-50/50'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {selectedQuizOption.isCorrect
                      ? activeStage.quiz.explanation[lang]
                      : lang === 'bn'
                      ? 'চিন্তার কিছু নেই! উপরের "অডিও ক্লু শুনুন" বোতামে চাপ দিয়ে ধ্বনিটি শুনে আরেকটি উত্তর বেছে নিন।'
                      : 'No rush at all! Tap "Play Audio Clue" above to hear the sound clearly and pick the matching answer.'}
                  </p>

                  {selectedQuizOption.isCorrect && currentIndex < stages.length - 1 && (
                    <button
                      type="button"
                      onClick={handleGoNextStage}
                      className="inline-flex items-center gap-2 px-4 py-2 min-h-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>
                        {lang === 'bn'
                          ? `পরবর্তী ধাপে যান (ধাপ ০${activeStage.stepNumber + 1})`
                          : `Continue to Step 0${activeStage.stepNumber + 1}`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT ZONE (5 cols): Age-Tailored Scientific Method & Specialized Lab Launcher */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            {/* Age-Adapted Coaching Box */}
            <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/45 p-4 space-y-1.5">
              <p className="text-xs font-bold text-emerald-900">
                {ageMode === 'kids'
                  ? lang === 'bn'
                    ? 'ছোটদের মোড (৩–১২) স্মার্ট গাইড'
                    : 'Kids Mode (3–12) Smart Guide'
                  : ageMode === 'senior'
                  ? lang === 'bn'
                    ? 'প্রবীণ মোড (৫১–৯০) সহজ ও প্রশান্ত গাইড'
                    : 'Senior Mode (51–90) Calm Guide'
                  : lang === 'bn'
                  ? 'স্ট্যান্ডার্ড মোড (১৩–৫০) বৈজ্ঞানিক কৌশল'
                  : 'Standard Mode (13–50) Cognitive Strategy'}
              </p>
              <p
                className={`text-slate-800 leading-relaxed ${
                  isSenior ? 'text-base' : 'text-xs sm:text-sm'
                }`}
              >
                {activeStage.ageGuidance[ageMode][lang]}
              </p>
            </div>

            {/* Scientific Pillar Explanation */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500">
                {lang === 'bn' ? 'বৈজ্ঞানিক ভিত্তি · ' : 'Learning Science · '}
                <span className="text-slate-800">{activeStage.sciencePillar[lang]}</span>
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeStage.whyItWorks[lang]}
              </p>
            </div>

            {/* Mistake Prevention Guard (Clean all-around border, zero border-l-4!) */}
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/40 p-4 space-y-1">
              <p className="text-xs font-bold text-amber-900">
                {lang === 'bn' ? 'সতর্কতা ও সাধারণ ভুল প্রতিরোধ' : 'Common Mistake Guard'}
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeStage.mistakeGuard[lang]}
              </p>
            </div>
          </div>

          {/* Stage Actions: Deep Lab Launcher + Manual Stage Completion */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onOpenDeepLab(activeStage.deepLab)}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between gap-3 whitespace-nowrap"
            >
              <span className="truncate">{activeStage.deepLabLabel[lang]}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isStageDone) {
                  onCompleteStage(activeStage.id, activeStage.xpReward);
                }
              }}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                isStageDone
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>
                {isStageDone
                  ? lang === 'bn'
                    ? 'এই ধাপটি সম্পন্ন হয়েছে ✓'
                    : 'Stage Completed ✓'
                  : lang === 'bn'
                  ? `ধাপটি সম্পন্ন হিসেবে চিহ্নিত করুন (+${activeStage.xpReward} XP)`
                  : `Mark Stage Complete (+${activeStage.xpReward} XP)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
