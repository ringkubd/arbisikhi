import React, {useEffect, useState} from 'react';
import {Volume2, ChevronLeft, ChevronRight, Repeat, Mic} from 'lucide-react';
import {ARABIC_LETTERS, HARAKAT_SIGNS} from '../data/curriculum';
import {UI_STRINGS} from '../data/i18n';
import type {AgeMode, Language} from '../types';
import {playArabicAudio, stopActiveAudio} from '../utils/audioPlayer';
import {AnimatedVocalTractCanvas} from '../components/AnimatedVocalTractCanvas';
import {CometWritingCanvas} from '../components/CometWritingCanvas';
import {ThreeDFlipCard, ThreeDPressableCard} from '../components/Tactile3DCards';
import {PronunciationCoachPanel} from '../components/PronunciationCoachPanel';
import {VoiceActivatedQuizPanel} from '../components/VoiceActivatedQuizPanel';

interface AlphabetMakhrajViewProps {
  lang: Language;
  ageMode: AgeMode;
  audioSpeed: number;
  masteredLetters: string[];
  onToggleMastered: (letterId: string) => void;
  onEarnXp: (amount: number) => void;
  initialSubTab?: 'letters' | 'harakat' | 'voice_quiz';
}

export const AlphabetMakhrajView: React.FC<AlphabetMakhrajViewProps> = ({
  lang,
  ageMode,
  audioSpeed,
  masteredLetters,
  onToggleMastered,
  onEarnXp,
  initialSubTab,
}) => {
  const t = UI_STRINGS[lang];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [subTab, setSubTab] = useState<'letters' | 'harakat' | 'voice_quiz'>(
    initialSubTab || 'letters'
  );

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [loopAudio, setLoopAudio] = useState(false);
  const [selectedHarakatIdx, setSelectedHarakatIdx] = useState(0);

  const activeLetter = ARABIC_LETTERS[selectedIdx] || ARABIC_LETTERS[0];
  const activeHarakat = HARAKAT_SIGNS[selectedHarakatIdx] || HARAKAT_SIGNS[0];
  const isMastered = masteredLetters.includes(activeLetter.id);

  const handleSelectLetter = (index: number) => {
    setSelectedIdx(index);
    setIsCardFlipped(false);
  };

  const handlePlayLetterSound = async (textToSpeak: string) => {
    setIsPlayingAudio(true);
    await playArabicAudio(textToSpeak, audioSpeed, {
      loop: loopAudio,
      onEnded: () => setIsPlayingAudio(false),
    });
  };

  const isSenior = ageMode === 'senior';
  const isKids = ageMode === 'kids';

  return (
    <div className="space-y-8">
      {/* Segmented Sub-Stage Selector: 28 Letters vs Harakat & Tajweed Signs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn'
              ? `স্তর ০ (ভিত্তি) · ২৮টি আরবি হরফ · মাখরাজ ও হাতের লেখা · আয়ত্ত: ${masteredLetters.length}/২৮`
              : `Level 0 Foundations · 28 Letters · Makharij & Stroke Lab · Mastered: ${masteredLetters.length}/28`}
          </p>
          <h2 className={`font-bold text-slate-900 dark:text-white mt-1 ${isSenior ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
            {subTab === 'letters'
              ? t.makhrajLabTitle
              : subTab === 'harakat'
              ? t.harakatSectionTitle
              : t.voiceQuizTitle}
          </h2>
        </div>

        <div className="inline-flex flex-wrap items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => {
              stopActiveAudio();
              setSubTab('letters');
            }}
            className={`px-4 py-2 min-h-[42px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'letters'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? '২৮টি হরফ ও মাখরাজ' : '28 Letters & Makharij'}
          </button>
          <button
            type="button"
            onClick={() => {
              stopActiveAudio();
              setSubTab('harakat');
            }}
            className={`px-4 py-2 min-h-[42px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'harakat'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'হরকত · মাদ্দ · তাশদীদ' : 'Harakat · Madd · Shaddah'}
          </button>
          <button
            type="button"
            onClick={() => {
              stopActiveAudio();
              setSubTab('voice_quiz');
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 min-h-[42px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'voice_quiz'
                ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            {t.voiceQuizTab}
          </button>
        </div>
      </div>

      {subTab === 'letters' ? (
        <>
          {/* Right-to-Left 28 Letter Matrix (Simplified big buttons for Kids/Seniors) */}
          <div
            dir="rtl"
            className={`grid gap-2.5 ${
              isSenior
                ? 'grid-cols-4 sm:grid-cols-7'
                : isKids
                ? 'grid-cols-4 sm:grid-cols-7'
                : 'grid-cols-7 sm:grid-cols-14'
            }`}
          >
            {ARABIC_LETTERS.map((ltr, idx) => {
              const selected = idx === selectedIdx;
              const done = masteredLetters.includes(ltr.id);
              return (
                <button
                  key={ltr.id}
                  type="button"
                  onClick={() => handleSelectLetter(idx)}
                  className={`min-h-[52px] rounded-xl border transition-transform duration-150 active:translate-y-0.5 flex flex-col items-center justify-center py-2 px-1 ${
                    selected
                      ? 'bg-emerald-700 border-emerald-800 text-white shadow-[0_3px_0_0_#064e3b]'
                      : done
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className={`font-arabic leading-none ${isSenior || isKids ? 'text-3xl' : 'text-2xl'}`}>
                    {ltr.isolated}
                  </span>
                  <span className={`mt-1 text-[11px] truncate max-w-full px-1 ${selected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {ltr.name[lang]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Two-Zone Educational Sandbox Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Stage (7 cols): 3D Flip Letter Card + Contextual Forms + Mouth Guide */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Step navigation & Audio Playback Controls */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectLetter((selectedIdx - 1 + ARABIC_LETTERS.length) % ARABIC_LETTERS.length)}
                      aria-label="Previous letter"
                      className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-mono-num text-slate-500 px-1">
                      {String(activeLetter.order).padStart(2, '0')} / 28
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectLetter((selectedIdx + 1) % ARABIC_LETTERS.length)}
                      aria-label="Next letter"
                      className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLoopAudio((l) => !l)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        loopAudio
                          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-800 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'বারবার শুনুন' : 'Loop'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayLetterSound(`${activeLetter.nameAr} ، ${activeLetter.exampleWordAr}`)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                      {isPlayingAudio ? t.playingAudio : t.listenClearAudio}
                    </button>
                  </div>
                </div>

                {/* 3D Perspective Flip Card */}
                <ThreeDFlipCard
                  isFlipped={isCardFlipped}
                  onToggle={() => setIsCardFlipped((f) => !f)}
                  heightClass={isSenior ? 'h-80' : 'h-68'}
                  front={
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {activeLetter.name[lang]} · {activeLetter.nameAr}
                        </span>
                        <span>{t.flipCardHint}</span>
                      </div>
                      <div className="my-auto text-center">
                        <div className={`font-arabic text-slate-900 dark:text-white leading-none ${isSenior ? 'text-8xl' : 'text-7xl'}`}>
                          {activeLetter.isolated}
                        </div>
                        <p className={`mt-3 font-medium text-emerald-700 dark:text-emerald-400 ${isSenior ? 'text-lg' : 'text-sm'}`}>
                          {activeLetter.sound[lang]}
                        </p>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>{activeLetter.zoneTitle[lang]}</span>
                        {isKids && <span className="text-xl">{activeLetter.kidsObjectEmoji}</span>}
                      </div>
                    </>
                  }
                  back={
                    <>
                      <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                        <span>{t.contextualForms}</span>
                        <span>{t.flipCardHint}</span>
                      </div>

                      {/* 4 Contextual Forms (RTL: Isolated, Initial, Medial, Final) */}
                      <div dir="rtl" className="grid grid-cols-4 gap-2 my-auto text-center">
                        <div className="rounded-xl bg-white/90 dark:bg-slate-800 p-2.5 border border-emerald-200 dark:border-slate-700">
                          <div className="font-arabic text-3xl text-slate-900 dark:text-white">{activeLetter.isolated}</div>
                          <div className="text-[11px] text-slate-500 mt-1">{t.formIsolated}</div>
                        </div>
                        <div className="rounded-xl bg-white/90 dark:bg-slate-800 p-2.5 border border-emerald-200 dark:border-slate-700">
                          <div className="font-arabic text-3xl text-slate-900 dark:text-white">{activeLetter.initial}</div>
                          <div className="text-[11px] text-slate-500 mt-1">{t.formInitial}</div>
                        </div>
                        <div className="rounded-xl bg-white/90 dark:bg-slate-800 p-2.5 border border-emerald-200 dark:border-slate-700">
                          <div className="font-arabic text-3xl text-slate-900 dark:text-white">{activeLetter.medial}</div>
                          <div className="text-[11px] text-slate-500 mt-1">{t.formMedial}</div>
                        </div>
                        <div className="rounded-xl bg-white/90 dark:bg-slate-800 p-2.5 border border-emerald-200 dark:border-slate-700">
                          <div className="font-arabic text-3xl text-slate-900 dark:text-white">{activeLetter.final}</div>
                          <div className="text-[11px] text-slate-500 mt-1">{t.formFinal}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-emerald-200/70 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            {activeLetter.exampleTranslit[lang]} — <strong>{activeLetter.exampleMeaning[lang]}</strong>
                          </span>
                        </div>
                        <span className="font-arabic text-3xl text-slate-900 dark:text-white" dir="rtl">
                          {activeLetter.exampleWordAr}
                        </span>
                      </div>
                    </>
                  }
                />

                {/* Zero-Tutor Mouth Placement & Common Mistakes Callouts (No thick left borders!) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <h4 className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                      {t.mouthPlacement}
                    </h4>
                    <p className={`mt-1.5 text-slate-700 dark:text-slate-300 leading-relaxed ${isSenior ? 'text-base' : 'text-sm'}`}>
                      {activeLetter.mouthGuide[lang]}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-200/90 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                    <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                      {t.mistakeWarning}
                    </h4>
                    <p className={`mt-1.5 text-slate-700 dark:text-slate-300 leading-relaxed ${isSenior ? 'text-base' : 'text-sm'}`}>
                      {activeLetter.mistakeToAvoid[lang]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Control & Simulation Stage (5 cols): Live Vocal Tract + Comet Handwriting */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {!isKids && (
                <AnimatedVocalTractCanvas
                  letter={activeLetter}
                  lang={lang}
                  isPlaying={isPlayingAudio}
                />
              )}

              <CometWritingCanvas
                letter={activeLetter}
                lang={lang}
                isMastered={isMastered}
                onMastered={(id) => {
                  onToggleMastered(id);
                  onEarnXp(15);
                }}
                clearLabel={t.clearCanvas}
                replayLabel={t.replayComet}
                masterLabel={t.markMastered}
                alreadyMasteredLabel={t.alreadyMastered}
              />
            </div>
          </div>

          {/* AI Microphone Pronunciation Coach */}
          <PronunciationCoachPanel
            targetArabic={activeLetter.exampleWordAr}
            targetTranslit={activeLetter.exampleTranslit[lang]}
            targetMeaning={`${activeLetter.name[lang]} — ${activeLetter.exampleMeaning[lang]}`}
            lang={lang}
            ageMode={ageMode}
            audioSpeed={audioSpeed}
            onSuccessScore={() => onEarnXp(20)}
          />
        </>
      ) : subTab === 'voice_quiz' ? (
        <VoiceActivatedQuizPanel
          lang={lang}
          ageMode={ageMode}
          audioSpeed={audioSpeed}
          masteredLetters={masteredLetters}
          onToggleMastered={onToggleMastered}
          onEarnXp={onEarnXp}
        />
      ) : (
        /* Harakat, Tanween, Madd, Sukoon & Shaddah Interactive Explorer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            {HARAKAT_SIGNS.map((item, idx) => (
              <ThreeDPressableCard
                key={item.id}
                active={idx === selectedHarakatIdx}
                onClick={() => setSelectedHarakatIdx(idx)}
                className="p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title[lang]}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.madrasaName[lang]} ·{' '}
                      <span className="font-mono-num">
                        {item.beats} {lang === 'bn' ? 'হারাকাহ' : 'Beat(s)'}
                      </span>
                    </p>
                  </div>
                  <span className="font-arabic text-3xl text-emerald-700 dark:text-emerald-400 shrink-0" dir="rtl">
                    {item.symbolAr}
                  </span>
                </div>
              </ThreeDPressableCard>
            ))}
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500">
                  {activeHarakat.markNameAr} ·{' '}
                  {lang === 'bn' ? `স্বরদৈর্ঘ্য: ${activeHarakat.beats} হারাকাহ` : `Duration: ${activeHarakat.beats} beat(s)`}
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {activeHarakat.title[lang]}
                </h3>
              </div>
              <div className="font-arabic text-5xl text-emerald-700 dark:text-emerald-400" dir="rtl">
                {activeHarakat.symbolAr}
              </div>
            </div>

            {/* Visual Beat Length Meter */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">
                {lang === 'bn' ? 'উচ্চারণের মাত্রা (তাল মিটার)' : 'Rhythmic Timing Guide'}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((beat) => (
                  <div
                    key={beat}
                    className={`h-3 rounded-md ${
                      beat <= activeHarakat.beats
                        ? 'bg-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className={`text-slate-700 dark:text-slate-200 leading-relaxed ${isSenior ? 'text-lg' : 'text-sm'}`}>
                {activeHarakat.explanation[lang]}
              </p>
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-amber-800 dark:text-amber-400">{t.mistakeWarning}: </strong>
                {activeHarakat.mistakeToAvoid[lang]}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {activeHarakat.examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-arabic text-3xl text-slate-900 dark:text-white" dir="rtl">
                      {ex.ar}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {ex.translit[lang]} · <strong>{ex.meaning[lang]}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlayLetterSound(ex.ar)}
                    aria-label={`Play ${ex.ar}`}
                    className="min-h-[44px] min-w-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
