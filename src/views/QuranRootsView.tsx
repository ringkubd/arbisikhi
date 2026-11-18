import React, {useEffect, useState} from 'react';
import {Volume2, RotateCcw} from 'lucide-react';
import {ARABIC_ROOTS, QURAN_LESSONS} from '../data/curriculum';
import {UI_STRINGS} from '../data/i18n';
import type {AgeMode, Language, QuranWordToken, SRSCardState, TajweedRuleType} from '../types';
import {playArabicAudio} from '../utils/audioPlayer';
import {ThreeDFlipCard, ThreeDPressableCard} from '../components/Tactile3DCards';
import {PronunciationCoachPanel} from '../components/PronunciationCoachPanel';

interface QuranRootsViewProps {
  lang: Language;
  ageMode: AgeMode;
  audioSpeed: number;
  showHarakat: boolean;
  onToggleHarakat: () => void;
  srsState: Record<string, SRSCardState>;
  onReviewSRSCard: (cardId: string, quality: 1 | 3 | 5) => void;
  onEarnXp: (amount: number) => void;
  initialSection?: 'surah' | 'roots' | 'srs';
}

const TAJWEED_META: Record<
  TajweedRuleType,
  {labelBn: string; labelEn: string; textClass: string}
> = {
  normal: {
    labelBn: 'স্বাভাবিক স্পষ্ট পাঠ',
    labelEn: 'Clear Standard',
    textClass: 'text-slate-900 dark:text-white',
  },
  ghunnah: {
    labelBn: 'গুন্নাহ (২ আলিফ নাসিক্য)',
    labelEn: 'Ghunnah (2-Beat Nasal)',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  qalqalah: {
    labelBn: 'ক্বালক্বালাহ (প্রতিধ্বনি)',
    labelEn: 'Qalqalah (Echo Bounce)',
    textClass: 'text-sky-700 dark:text-sky-400',
  },
  madd: {
    labelBn: 'মাদ্দ (২–৪ আলিফ দীর্ঘ)',
    labelEn: 'Madd (Elongation)',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  ikhfa: {
    labelBn: 'ইখফা (গোপন গুন্নাহ)',
    labelEn: 'Ikhfa (Light Nasal Blend)',
    textClass: 'text-teal-700 dark:text-teal-400',
  },
  tafkheem: {
    labelBn: 'তাফখীম (মোটা গম্ভীর উচ্চারণ)',
    labelEn: 'Tafkheem (Heavy Full Mouth)',
    textClass: 'text-indigo-700 dark:text-indigo-300',
  },
};

export const QuranRootsView: React.FC<QuranRootsViewProps> = ({
  lang,
  ageMode,
  audioSpeed,
  showHarakat,
  onToggleHarakat,
  srsState,
  onReviewSRSCard,
  onEarnXp,
  initialSection,
}) => {
  const t = UI_STRINGS[lang];
  const [section, setSection] = useState<'surah' | 'roots' | 'srs'>(
    initialSection || 'surah'
  );

  useEffect(() => {
    if (initialSection) {
      setSection(initialSection);
    }
  }, [initialSection]);
  const [selectedSurahId, setSelectedSurahId] = useState(QURAN_LESSONS[0].id);
  const [selectedWord, setSelectedWord] = useState<QuranWordToken | null>(
    QURAN_LESSONS[0].ayahs[0].words[0]
  );
  const [practiceAyahAr, setPracticeAyahAr] = useState(QURAN_LESSONS[0].ayahs[0].fullAr);
  const [practiceAyahMeaning, setPracticeAyahMeaning] = useState(
    QURAN_LESSONS[0].ayahs[0].translation
  );

  const [selectedRootId, setSelectedRootId] = useState(ARABIC_ROOTS[0].id);

  // SRS Deck derived from Quranic words
  const allQuranCards = QURAN_LESSONS.flatMap((s) =>
    s.ayahs.flatMap((a) =>
      a.words.map((w, idx) => ({
        id: `${s.id}_${a.ayahNumber}_${idx}`,
        ar: w.ar,
        unvowelled: w.unvowelled,
        translit: w.translit,
        meaning: w.meaning,
        root: w.root,
      }))
    )
  );

  const [srsIndex, setSrsIndex] = useState(0);
  const [srsFlipped, setSrsFlipped] = useState(false);

  const activeSurah = QURAN_LESSONS.find((s) => s.id === selectedSurahId) || QURAN_LESSONS[0];
  const activeRoot = ARABIC_ROOTS.find((r) => r.id === selectedRootId) || ARABIC_ROOTS[0];
  const activeSrsCard = allQuranCards[srsIndex % allQuranCards.length];
  const isSenior = ageMode === 'senior';

  const handlePlay = async (text: string) => {
    await playArabicAudio(text, audioSpeed);
  };

  return (
    <div className="space-y-8">
      {/* Header + Segmented Section Controls + Harakat Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn'
              ? '০ থেকে কুরআন এক্সপার্ট ট্র্যাক · শব্দে-শব্দে তাজবীদ · ৩-অক্ষরের মূলশব্দ'
              : '0 to Quran Expert Track · Word-by-Word Tajweed · 3-Letter Morphology'}
          </p>
          <h2 className={`font-bold text-slate-900 dark:text-white mt-1 ${isSenior ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
            {section === 'surah'
              ? t.quranWordByWord
              : section === 'roots'
              ? t.rootExplorerTitle
              : t.srsFlashcardsTitle}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggleable Tashkeel / Harakat Button */}
          <button
            type="button"
            onClick={onToggleHarakat}
            className={`px-3.5 py-2 min-h-[42px] rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              showHarakat
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            {showHarakat ? t.harakatOn : t.harakatOff}
          </button>

          <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setSection('surah')}
              className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                section === 'surah'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {lang === 'bn' ? 'শব্দে-শব্দে সূরা' : 'Surah Lab'}
            </button>
            <button
              type="button"
              onClick={() => setSection('roots')}
              className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                section === 'roots'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {lang === 'bn' ? 'মূলশব্দ (الجذر)' : 'Root Explorer'}
            </button>
            <button
              type="button"
              onClick={() => setSection('srs')}
              className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                section === 'srs'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {lang === 'bn' ? 'SRS ফ্ল্যাশকার্ড' : 'SRS Review'}
            </button>
          </div>
        </div>
      </div>

      {section === 'surah' && (
        <>
          {/* Surah Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {QURAN_LESSONS.map((surah) => (
              <ThreeDPressableCard
                key={surah.id}
                active={surah.id === activeSurah.id}
                onClick={() => {
                  setSelectedSurahId(surah.id);
                  setSelectedWord(surah.ayahs[0].words[0]);
                  setPracticeAyahAr(surah.ayahs[0].fullAr);
                  setPracticeAyahMeaning(surah.ayahs[0].translation);
                }}
                className="p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">{surah.revelation[lang]}</p>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {surah.title[lang]}
                    </h3>
                  </div>
                  <span className="font-arabic text-2xl text-emerald-700 dark:text-emerald-400 shrink-0" dir="rtl">
                    {surah.titleAr}
                  </span>
                </div>
              </ThreeDPressableCard>
            ))}
          </div>

          {/* Accessible Tajweed Legend (Explicit rule names + color, never hue-only!) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'তাজবীদ নির্দেশিকা (শব্দে ট্যাপ করুন):' : 'Tajweed Guide (Tap any word):'}
            </span>
            {(['ghunnah', 'qalqalah', 'madd', 'ikhfa', 'tafkheem'] as TajweedRuleType[]).map((rule) => (
              <span key={rule} className={`font-medium ${TAJWEED_META[rule].textClass}`}>
                ■ {lang === 'bn' ? TAJWEED_META[rule].labelBn : TAJWEED_META[rule].labelEn}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Ayah Word-by-Word Stream (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {activeSurah.ayahs.map((ayah) => (
                <div
                  key={ayah.ayahNumber}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-mono-num text-slate-500">
                      {lang === 'bn' ? `আয়াত ${ayah.ayahNumber}` : `Ayah ${ayah.ayahNumber}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPracticeAyahAr(ayah.fullAr);
                          setPracticeAyahMeaning(ayah.translation);
                          handlePlay(ayah.fullAr);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        {lang === 'bn' ? 'পূর্ণ আয়াত শুনুন' : 'Play Full Ayah'}
                      </button>
                    </div>
                  </div>

                  {/* Interactive RTL Word Tokens */}
                  <div dir="rtl" className="flex flex-wrap gap-3">
                    {ayah.words.map((word, wIdx) => {
                      const active = selectedWord?.ar === word.ar && selectedWord?.meaning.en === word.meaning.en;
                      const ruleMeta = TAJWEED_META[word.tajweedRule];
                      return (
                        <button
                          key={wIdx}
                          type="button"
                          onClick={() => {
                            setSelectedWord(word);
                            handlePlay(word.ar);
                            onEarnXp(5);
                          }}
                          className={`rounded-xl border px-4 py-3 text-center transition-transform duration-150 hover:-translate-y-0.5 min-h-[68px] ${
                            active
                              ? 'border-emerald-600 bg-emerald-50/90 dark:bg-emerald-950/50 shadow-[0_3px_0_0_#047857]'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 hover:border-slate-300'
                          }`}
                        >
                          <div className={`font-arabic ${isSenior ? 'text-4xl' : 'text-3xl'} ${ruleMeta.textClass}`}>
                            {showHarakat ? word.ar : word.unvowelled}
                          </div>
                          <div dir="ltr" className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                            {word.meaning[lang]}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className={`text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 ${isSenior ? 'text-base' : 'text-sm'}`}>
                    {ayah.translation[lang]}
                  </p>
                </div>
              ))}
            </div>

            {/* Selected Word Virtual Ustad Inspector (4 cols) */}
            <div className="lg:col-span-4">
              <div className="sticky top-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'নির্বাচিত শব্দের বিশ্লেষণ' : 'Selected Word Breakdown'}
                </p>
                {selectedWord && (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-arabic text-5xl text-slate-900 dark:text-white" dir="rtl">
                        {showHarakat ? selectedWord.ar : selectedWord.unvowelled}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlay(selectedWord.ar)}
                        aria-label="Play selected word"
                        className="min-h-[48px] min-w-[48px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedWord.translit[lang]} — {selectedWord.meaning[lang]}
                      </p>
                      {selectedWord.root && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {lang === 'bn' ? '৩-অক্ষরের মূলশব্দ (الجذر): ' : '3-Letter Root: '}
                          <strong className="font-arabic text-base text-emerald-700 dark:text-emerald-400" dir="rtl">
                            {selectedWord.root}
                          </strong>
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-1.5">
                      <p className={`text-xs font-semibold ${TAJWEED_META[selectedWord.tajweedRule].textClass}`}>
                        {lang === 'bn'
                          ? TAJWEED_META[selectedWord.tajweedRule].labelBn
                          : TAJWEED_META[selectedWord.tajweedRule].labelEn}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedWord.tajweedNote
                          ? selectedWord.tajweedNote[lang]
                          : lang === 'bn'
                          ? 'প্রতিটি হরফের মাখরাজ ও ১ হারাকাহ মাত্রা ঠিক রেখে স্পষ্টভাবে পড়ুন।'
                          : 'Pronounce each letter cleanly from its Makhraj with balanced 1-beat short vowels.'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Ayah Recitation Scorer */}
          <PronunciationCoachPanel
            targetArabic={practiceAyahAr}
            targetTranslit={activeSurah.title[lang]}
            targetMeaning={practiceAyahMeaning[lang]}
            lang={lang}
            ageMode={ageMode}
            audioSpeed={audioSpeed}
            onSuccessScore={() => onEarnXp(25)}
          />
        </>
      )}

      {section === 'roots' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            {ARABIC_ROOTS.map((rt) => (
              <ThreeDPressableCard
                key={rt.id}
                active={rt.id === activeRoot.id}
                onClick={() => setSelectedRootId(rt.id)}
                className="p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rt.coreMeaning[lang]}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono-num">
                      {rt.rootLetters} ·{' '}
                      {lang === 'bn'
                        ? `কুরআনে ${rt.quranicOccurrences} বার`
                        : `${rt.quranicOccurrences}x in Quran`}
                    </p>
                  </div>
                  <span className="font-arabic text-2xl text-emerald-700 dark:text-emerald-400 shrink-0" dir="rtl">
                    {rt.rootAr}
                  </span>
                </div>
              </ThreeDPressableCard>
            ))}
          </div>

          <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 font-mono-num">
                  {activeRoot.rootLetters} ·{' '}
                  {lang === 'bn'
                    ? `পবিত্র কুরআনে উপস্থিতি: ${activeRoot.quranicOccurrences} বার`
                    : `Occurrences in Quran: ${activeRoot.quranicOccurrences}`}
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {activeRoot.coreMeaning[lang]}
                </h3>
              </div>
              <span className="font-arabic text-4xl text-emerald-700 dark:text-emerald-400" dir="rtl">
                {activeRoot.rootAr}
              </span>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeRoot.explanation[lang]}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRoot.derivatives.map((d, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500" dir="rtl">
                        {d.patternAr}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {d.translit[lang]} — {d.meaning[lang]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-arabic text-3xl text-slate-900 dark:text-white" dir="rtl">
                        {showHarakat ? d.ar : d.unvowelled}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlay(d.ar)}
                        aria-label={`Play ${d.ar}`}
                        className="min-h-[42px] min-w-[42px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-800"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800">
                    <p className="font-arabic text-xl text-emerald-800 dark:text-emerald-300 text-right" dir="rtl">
                      {d.usageExampleAr}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {d.usageMeaning[lang]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'srs' && activeSrsCard && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'bn'
                ? 'স্পেসড রিপিটিশন (SM-2 অ্যালগরিদম) — ভুলে যাওয়ার আগেই স্মৃতিতে স্থায়ী করুন'
                : 'SM-2 Spaced Repetition — Lock high-frequency Quranic vocabulary into long-term memory'}
            </span>
            <span className="font-mono-num">
              {(srsIndex % allQuranCards.length) + 1} / {allQuranCards.length}
            </span>
          </div>

          <ThreeDFlipCard
            isFlipped={srsFlipped}
            onToggle={() => setSrsFlipped((f) => !f)}
            heightClass="h-76"
            front={
              <>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {srsState[activeSrsCard.id]
                      ? lang === 'bn'
                        ? `ব্যবধান: ${srsState[activeSrsCard.id].intervalDays} দিন`
                        : `Interval: ${srsState[activeSrsCard.id].intervalDays}d`
                      : lang === 'bn'
                      ? 'নতুন শব্দ'
                      : 'New Card'}
                  </span>
                  <span>{lang === 'bn' ? 'উত্তর দেখতে কার্ডে ট্যাপ করুন' : 'Tap card to reveal meaning'}</span>
                </div>
                <div className="my-auto text-center">
                  <div className="font-arabic text-6xl text-slate-900 dark:text-white" dir="rtl">
                    {showHarakat ? activeSrsCard.ar : activeSrsCard.unvowelled}
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <RotateCcw className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'অর্থ ও উচ্চারণ দেখুন' : 'Flip for Meaning & Root'}
                  </span>
                </div>
              </>
            }
            back={
              <>
                <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <span>{activeSrsCard.translit[lang]}</span>
                  {activeSrsCard.root && <span className="font-arabic text-base">{activeSrsCard.root}</span>}
                </div>
                <div className="my-auto text-center space-y-2">
                  <p className="font-arabic text-4xl text-slate-900 dark:text-white" dir="rtl">
                    {activeSrsCard.ar}
                  </p>
                  <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                    {activeSrsCard.meaning[lang]}
                  </p>
                </div>
                <div className="text-center text-xs text-slate-600 dark:text-slate-400">
                  {lang === 'bn' ? 'নিচের বাটন থেকে আপনার মনে থাকার মাত্রা বেছে নিন' : 'Rate how effortlessly you recalled this word below'}
                </div>
              </>
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handlePlay(activeSrsCard.ar)}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[46px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Volume2 className="w-4 h-4 text-emerald-700" />
              {t.listenClearAudio}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onReviewSRSCard(activeSrsCard.id, 1);
                  setSrsFlipped(false);
                  setSrsIndex((i) => i + 1);
                }}
                className="px-4 py-2.5 min-h-[46px] rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 whitespace-nowrap shrink-0"
              >
                {lang === 'bn' ? 'আবার দেখব (১০ মি.)' : 'Again (10m)'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onReviewSRSCard(activeSrsCard.id, 3);
                  onEarnXp(10);
                  setSrsFlipped(false);
                  setSrsIndex((i) => i + 1);
                }}
                className="px-4 py-2.5 min-h-[46px] rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                {lang === 'bn' ? 'মনে ছিল (৩ দিন)' : 'Good (3d)'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onReviewSRSCard(activeSrsCard.id, 5);
                  onEarnXp(15);
                  setSrsFlipped(false);
                  setSrsIndex((i) => i + 1);
                }}
                className="px-4 py-2.5 min-h-[46px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap shrink-0"
              >
                {lang === 'bn' ? 'খুব সহজ (৭ দিন)' : 'Easy (7d)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
