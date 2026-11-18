import React, {useState} from 'react';
import {Volume2} from 'lucide-react';
import {DIALOGUE_SCENARIOS} from '../data/curriculum';
import {UI_STRINGS} from '../data/i18n';
import type {AgeMode, Language} from '../types';
import {playArabicAudio} from '../utils/audioPlayer';
import {ThreeDPressableCard} from '../components/Tactile3DCards';
import {PronunciationCoachPanel} from '../components/PronunciationCoachPanel';

interface SpokenGulfMsaViewProps {
  lang: Language;
  ageMode: AgeMode;
  audioSpeed: number;
  showHarakat: boolean;
  onToggleHarakat: () => void;
  onEarnXp: (amount: number) => void;
}

export const SpokenGulfMsaView: React.FC<SpokenGulfMsaViewProps> = ({
  lang,
  ageMode,
  audioSpeed,
  showHarakat,
  onToggleHarakat,
  onEarnXp,
}) => {
  const t = UI_STRINGS[lang];
  const [selectedScenarioId, setSelectedScenarioId] = useState(DIALOGUE_SCENARIOS[0].id);
  const [practicePhrase, setPracticePhrase] = useState({
    ar: DIALOGUE_SCENARIOS[0].lines[0].gulfAr,
    translit: DIALOGUE_SCENARIOS[0].lines[0].gulfTranslit,
    meaning: DIALOGUE_SCENARIOS[0].lines[0].meaning,
  });
  const [imgFailed, setImgFailed] = useState(false);

  const activeScenario =
    DIALOGUE_SCENARIOS.find((s) => s.id === selectedScenarioId) || DIALOGUE_SCENARIOS[0];
  const isSenior = ageMode === 'senior';

  return (
    <div className="space-y-8">
      {/* Header + Toggleable Harakat */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn'
              ? 'CEFR A1 থেকে B2 · প্রমিত ফুসহা ও সৌদি/গালফ কথ্য আরবির তুলনামূলক অনুশীলন'
              : 'CEFR A1–B2 · Side-by-Side Modern Standard (Fusha) & Saudi/Gulf Spoken'}
          </p>
          <h2 className={`font-bold text-slate-900 dark:text-white mt-1 ${isSenior ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
            {t.spokenComparisonTitle}
          </h2>
        </div>

        <button
          type="button"
          onClick={onToggleHarakat}
          className={`px-4 py-2 min-h-[44px] rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            showHarakat
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          {showHarakat ? t.harakatOn : t.harakatOff}
        </button>
      </div>

      {/* Scenario Selector + Cultural Context Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between gap-3">
          {DIALOGUE_SCENARIOS.map((sc) => (
            <ThreeDPressableCard
              key={sc.id}
              active={sc.id === activeScenario.id}
              onClick={() => {
                setSelectedScenarioId(sc.id);
                setPracticePhrase({
                  ar: sc.lines[0].gulfAr,
                  translit: sc.lines[0].gulfTranslit,
                  meaning: sc.lines[0].meaning,
                });
              }}
              className="p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-mono-num">
                    {sc.cefr} · {sc.category[lang]}
                  </p>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {sc.title[lang]}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {sc.subtitle[lang]}
                  </p>
                </div>
              </div>
            </ThreeDPressableCard>
          ))}
        </div>

        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative min-h-[220px] bg-gradient-to-br from-emerald-900 via-slate-900 to-amber-950">
          {!imgFailed && (
            <img
              src="/src/assets/images/gulf_spoken_courtyard_1794941603885.jpg"
              alt="Modern Riyadh architectural courtyard with traditional Arabic dallah coffee hospitality"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 flex flex-col justify-end">
            <p className="text-xs text-amber-300 font-medium">
              {lang === 'bn' ? 'হজ্জ · উমরাহ · সৌদি ও গালফ প্রবাস জীবন' : 'Real-World Gulf & Haramain Readiness'}
            </p>
            <p className="text-sm font-semibold text-white mt-1 leading-snug">
              {lang === 'bn'
                ? 'বইয়ের প্রমিত আরবি এবং স্থানীয় সৌদি কথ্য রীতি একসাথে শিখলে বিমানবন্দর, হারামাইন ও অফিসে কথা বলা হয় একদম সহজ।'
                : 'Seeing formal MSA right beside natural Saudi speech bridges classroom literacy with real everyday confidence.'}
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side MSA vs. Saudi/Gulf Dialogue Cards */}
      <div className="space-y-5">
        {activeScenario.lines.map((line, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {line.speaker[lang]} · {line.meaning[lang]}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* MSA Column */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t.msaColumn}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playArabicAudio(line.msaAr, audioSpeed);
                      setPracticePhrase({
                        ar: line.msaAr,
                        translit: line.msaTranslit,
                        meaning: line.meaning,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 whitespace-nowrap shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    {lang === 'bn' ? 'শুনুন' : 'Listen'}
                  </button>
                </div>
                <p
                  dir="rtl"
                  className={`font-arabic text-slate-900 dark:text-white text-right ${
                    isSenior ? 'text-3xl' : 'text-2xl'
                  }`}
                >
                  {showHarakat ? line.msaAr : line.msaUnvowelled}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {line.msaTranslit[lang]}
                </p>
              </div>

              {/* Saudi / Gulf Column */}
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/25 p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                    {t.gulfColumn}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playArabicAudio(line.gulfAr, audioSpeed);
                      setPracticePhrase({
                        ar: line.gulfAr,
                        translit: line.gulfTranslit,
                        meaning: line.meaning,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'সৌদি রীতি শুনুন' : 'Listen Gulf'}
                  </button>
                </div>
                <p
                  dir="rtl"
                  className={`font-arabic text-slate-900 dark:text-white text-right ${
                    isSenior ? 'text-3xl' : 'text-2xl'
                  }`}
                >
                  {showHarakat ? line.gulfAr : line.gulfUnvowelled}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {line.gulfTranslit[lang]}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
              <strong className="text-slate-800 dark:text-slate-200">
                {lang === 'bn' ? 'ভাষাগত নোট: ' : 'Dialect Bridge: '}
              </strong>
              {line.culturalNote[lang]}
            </p>
          </div>
        ))}
      </div>

      {/* Speaking Drill on Active Dialogue Line */}
      <PronunciationCoachPanel
        targetArabic={practicePhrase.ar}
        targetTranslit={practicePhrase.translit[lang]}
        targetMeaning={practicePhrase.meaning[lang]}
        lang={lang}
        ageMode={ageMode}
        audioSpeed={audioSpeed}
        onSuccessScore={() => onEarnXp(20)}
      />
    </div>
  );
};
