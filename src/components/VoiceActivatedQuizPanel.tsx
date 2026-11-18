import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Ear,
  Eye,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  SkipForward,
  Volume2,
} from 'lucide-react';
import {ARABIC_LETTERS} from '../data/curriculum';
import {UI_STRINGS} from '../data/i18n';
import type {AgeMode, ArabicLetter, Language} from '../types';
import {playArabicAudio, stopActiveAudio} from '../utils/audioPlayer';
import {AnimatedVocalTractCanvas} from './AnimatedVocalTractCanvas';

// TypeScript Web Speech API definitions for cross-browser SpeechRecognition
interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
  readonly message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

/**
 * Strips Arabic Tashkeel (vowel marks) & Tatweel while strictly preserving consonant identity
 * (e.g., ت vs ط, س vs ص, ح vs ه, ع vs ا, ذ vs ز vs ظ, ق vs ك remain distinct!).
 */
function normalizeArabicOrthography(raw: string): string {
  return raw
    .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[^\u0621-\u064A\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Accepted canonical spoken forms per letter ID in ar-SA Web Speech recognition
const LETTER_SPOKEN_ALIASES: Record<string, string[]> = {
  alif: ['الف', 'الالف', 'ا', 'ء', 'همزه', 'همزة', 'اسد'],
  ba: ['باء', 'با', 'الباء', 'ب', 'بو', 'بي', 'بيت'],
  ta: ['تاء', 'تا', 'التاء', 'ت', 'تو', 'تي', 'تمر'],
  tha: ['ثاء', 'ثا', 'الثاء', 'ث', 'ثو', 'ثي', 'ثمر', 'ثوب'],
  jeem: ['جيم', 'الجيم', 'ج', 'جا', 'جو', 'جي', 'جمل'],
  ha_throat: ['حاء', 'حا', 'الحاء', 'ح', 'حو', 'حي', 'حج', 'حلم'],
  kha: ['خاء', 'خا', 'الخاء', 'خ', 'خو', 'خي', 'خبز', 'خير'],
  dal: ['دال', 'الدال', 'د', 'دا', 'دو', 'دي', 'دار', 'دين'],
  dhal: ['ذال', 'الذال', 'ذ', 'ذا', 'ذو', 'ذي', 'ذهب', 'ذكر'],
  ra: ['راء', 'را', 'الراء', 'ر', 'رو', 'ري', 'رحمه', 'رمان'],
  zay: ['زاي', 'زاء', 'زا', 'الزاي', 'ز', 'زو', 'زي', 'زيت', 'زهره'],
  seen: ['سين', 'السين', 'س', 'سا', 'سو', 'سي', 'سلام', 'سمك'],
  sheen: ['شين', 'الشين', 'ش', 'شا', 'شو', 'شي', 'شمس', 'شجر'],
  sad: ['صاد', 'الصاد', 'ص', 'صا', 'صو', 'صي', 'صبر', 'صلاه'],
  dad: ['ضاد', 'الضاد', 'ض', 'ضا', 'ضو', 'ضي', 'ضوء', 'ارض'],
  ta_heavy: ['طاء', 'طا', 'الطاء', 'ط', 'طو', 'طي', 'طير', 'طيب'],
  zha_heavy: ['ظاء', 'ظا', 'الظاء', 'ظ', 'ظو', 'ظي', 'ظل', 'ظهر'],
  ayn: ['عين', 'العين', 'ع', 'عا', 'عو', 'عي', 'علم', 'عين'],
  ghayn: ['غين', 'الغين', 'غ', 'غا', 'غو', 'غي', 'غيث', 'غيم'],
  fa: ['فاء', 'فا', 'الفاء', 'ف', 'فو', 'في', 'فجر', 'فيل'],
  qaf: ['قاف', 'القاف', 'ق', 'قا', 'قو', 'قي', 'قمر', 'قلم', 'قران'],
  kaf: ['كاف', 'الكاف', 'ك', 'كا', 'كو', 'كي', 'كتاب', 'كلب'],
  lam: ['لام', 'اللام', 'ل', 'لا', 'لو', 'لي', 'ليل', 'لبن'],
  meem: ['ميم', 'الميم', 'م', 'ما', 'مو', 'مي', 'مسجد', 'ماء'],
  noon: ['نون', 'النون', 'ن', 'نا', 'نو', 'ني', 'نور', 'نجم'],
  ha_soft: ['هاء', 'ها', 'الهاء', 'ه', 'هو', 'هي', 'هدى', 'هلال'],
  waw: ['واو', 'الواو', 'و', 'وا', 'وو', 'وي', 'ورد', 'ولد'],
  ya: ['ياء', 'يا', 'الياء', 'ي', 'يو', 'يي', 'يد', 'يوم'],
};

interface QuizEvaluation {
  matched: boolean;
  confidencePercent: number;
  heardTranscript: string;
  confusedWithLetter?: ArabicLetter;
}

function evaluateSpeechAlternatives(
  alternatives: Array<{transcript: string; confidence: number}>,
  target: ArabicLetter
): QuizEvaluation {
  const targetNormName = normalizeArabicOrthography(target.nameAr);
  const targetNormIsolated = normalizeArabicOrthography(target.isolated);
  const targetNormExample = normalizeArabicOrthography(target.exampleWordUnvowelled);
  const customAliases = (LETTER_SPOKEN_ALIASES[target.id] || []).map(
    normalizeArabicOrthography
  );

  const validForms = new Set<string>([
    targetNormName,
    `ال${targetNormName}`,
    targetNormIsolated,
    targetNormExample,
    ...customAliases,
  ]);

  let primaryHeard = alternatives[0]?.transcript?.trim() || '';

  for (let i = 0; i < alternatives.length; i++) {
    const alt = alternatives[i];
    const norm = normalizeArabicOrthography(alt.transcript);
    if (!norm) continue;
    if (!primaryHeard) primaryHeard = alt.transcript.trim();

    const tokens = norm.split(' ');
    const directHit =
      validForms.has(norm) ||
      tokens.some((tok) => validForms.has(tok)) ||
      (norm.length <= 4 && norm.startsWith(targetNormIsolated));

    if (directHit) {
      const rawConf = alt.confidence > 0 ? alt.confidence : 0.88 - i * 0.05;
      const pct = Math.min(99, Math.max(76, Math.round(rawConf * 100)));
      return {
        matched: true,
        confidencePercent: pct,
        heardTranscript: alt.transcript.trim(),
      };
    }
  }

  // Detect if the learner articulated a neighboring / look-alike Arabic letter
  const firstNorm = normalizeArabicOrthography(primaryHeard);
  let confusedWith: ArabicLetter | undefined;
  if (firstNorm) {
    confusedWith = ARABIC_LETTERS.find((candidate) => {
      if (candidate.id === target.id) return false;
      const candAliases = (LETTER_SPOKEN_ALIASES[candidate.id] || []).map(
        normalizeArabicOrthography
      );
      const candName = normalizeArabicOrthography(candidate.nameAr);
      const candIso = normalizeArabicOrthography(candidate.isolated);
      return (
        firstNorm === candName ||
        firstNorm === candIso ||
        candAliases.includes(firstNorm) ||
        firstNorm.startsWith(candIso)
      );
    });
  }

  return {
    matched: false,
    confidencePercent: primaryHeard ? 42 : 0,
    heardTranscript: primaryHeard || '—',
    confusedWithLetter: confusedWith,
  };
}

function buildQuizDeck(masteredIds: string[], count: number): ArabicLetter[] {
  const unmastered = ARABIC_LETTERS.filter((l) => !masteredIds.includes(l.id));
  const mastered = ARABIC_LETTERS.filter((l) => masteredIds.includes(l.id));
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const pool = [...shuffle(unmastered), ...shuffle(mastered)];
  return pool.slice(0, count);
}

interface VoiceActivatedQuizPanelProps {
  lang: Language;
  ageMode: AgeMode;
  audioSpeed: number;
  masteredLetters: string[];
  onToggleMastered: (letterId: string) => void;
  onEarnXp: (amount: number) => void;
}

const TOTAL_ROUNDS = 5;

export const VoiceActivatedQuizPanel: React.FC<VoiceActivatedQuizPanelProps> = ({
  lang,
  ageMode,
  audioSpeed,
  masteredLetters,
  onToggleMastered,
  onEarnXp,
}) => {
  const t = UI_STRINGS[lang];
  const isSenior = ageMode === 'senior';

  const speechSupported = useMemo(() => Boolean(getSpeechRecognitionCtor()), []);

  const [deck, setDeck] = useState<ArabicLetter[]>(() =>
    buildQuizDeck(masteredLetters, TOTAL_ROUNDS)
  );
  const [roundIdx, setRoundIdx] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [autoListenAfterPrompt, setAutoListenAfterPrompt] = useState(true);
  const [blindEarMode, setBlindEarMode] = useState(false);

  const [phase, setPhase] = useState<
    'idle' | 'ai_speaking' | 'listening' | ' fallback_evaluating' | 'evaluated'
  >('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<QuizEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionXpEarned, setSessionXpEarned] = useState(0);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const gotResultRef = useRef(false);

  const currentLetter = deck[roundIdx] || ARABIC_LETTERS[0];

  const cleanupSpeech = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch {
        // Ignore abort errors
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore recorder stop errors
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupSpeech();
      stopActiveAudio();
    };
  }, [cleanupSpeech]);

  const handleApplyEvaluation = useCallback(
    (evalResult: QuizEvaluation, target: ArabicLetter) => {
      setEvaluation(evalResult);
      setPhase('evaluated');
      setInterimTranscript('');

      if (evalResult.matched) {
        setCorrectCount((c) => c + 1);
        setSessionXpEarned((xp) => xp + 15);
        onEarnXp(15);
        if (!masteredLetters.includes(target.id)) {
          onToggleMastered(target.id);
        }
      }
    },
    [masteredLetters, onEarnXp, onToggleMastered]
  );

  // Fallback recorder ONLY for browsers lacking SpeechRecognition (e.g. Firefox desktop)
  const startFallbackRecording = useCallback(
    async (target: ArabicLetter) => {
      setErrorMessage(null);
      setEvaluation(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((tr) => tr.stop());
          setPhase(' fallback_evaluating');
          try {
            const blob = new Blob(chunksRef.current, {
              type: recorder.mimeType || 'audio/webm',
            });
            const base64Audio = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const str = String(reader.result || '');
                const idx = str.indexOf(',');
                resolve(idx >= 0 ? str.slice(idx + 1) : str);
              };
              reader.onerror = () => reject(new Error('Audio read error'));
              reader.readAsDataURL(blob);
            });
            const res = await fetch('/api/pronunciation-check', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType: recorder.mimeType || 'audio/webm',
                targetArabic: target.nameAr,
                targetTranslit: target.name[lang],
                targetMeaning: target.sound[lang],
                lang,
                ageMode,
              }),
            });
            const data = (await res.json()) as {
              accuracyPercent?: number;
              heardArabic?: string;
              error?: string;
            };
            if (!res.ok || data.error) {
              setErrorMessage(data.error || 'Pronunciation check failed');
              setPhase('idle');
              return;
            }
            const pct = Number(data.accuracyPercent) || 0;
            handleApplyEvaluation(
              {
                matched: pct >= 70,
                confidencePercent: pct,
                heardTranscript: data.heardArabic || '—',
              },
              target
            );
          } catch {
            setErrorMessage(
              lang === 'bn'
                ? 'উচ্চারণ যাচাই করতে সমস্যা হয়েছে।'
                : 'Could not validate audio recording.'
            );
            setPhase('idle');
          }
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setPhase('listening');
        // Auto-stop after 3.2 seconds for single-letter vocalization
        window.setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, 3200);
      } catch {
        setErrorMessage(
          lang === 'bn'
            ? 'মাইক্রোফোন অনুমতি পাওয়া যায়নি। ব্রাউজারে মাইক্রোফোন চালু করুন।'
            : 'Microphone permission denied. Please enable microphone access.'
        );
        setPhase('idle');
      }
    },
    [ageMode, handleApplyEvaluation, lang]
  );

  // Primary Web Speech API (SpeechRecognition ar-SA) Listener
  const startWebSpeechListening = useCallback(
    (target: ArabicLetter) => {
      cleanupSpeech();
      stopActiveAudio();
      setErrorMessage(null);
      setEvaluation(null);
      setInterimTranscript('');
      gotResultRef.current = false;

      const SpeechCtor = getSpeechRecognitionCtor();
      if (!SpeechCtor) {
        void startFallbackRecording(target);
        return;
      }

      try {
        const recognition = new SpeechCtor();
        recognition.lang = 'ar-SA';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 5;

        recognition.onstart = () => {
          setPhase('listening');
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          const latestResult = event.results[event.resultIndex];
          if (!latestResult) return;

          if (!latestResult.isFinal) {
            setInterimTranscript(latestResult[0]?.transcript || '');
            return;
          }

          gotResultRef.current = true;
          const alternatives: Array<{transcript: string; confidence: number}> = [];
          for (let i = 0; i < latestResult.length; i++) {
            const item = latestResult[i];
            if (item && item.transcript) {
              alternatives.push({
                transcript: item.transcript,
                confidence: item.confidence,
              });
            }
          }

          const evalOutcome = evaluateSpeechAlternatives(alternatives, target);
          handleApplyEvaluation(evalOutcome, target);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setErrorMessage(
              lang === 'bn'
                ? 'মাইক্রোফোন অনুমতি ব্লক করা আছে। অনুগ্রহ করে ব্রাউজারে মাইক্রোফোন অনুমতি দিন।'
                : 'Microphone access was blocked. Please allow microphone access in your browser.'
            );
          } else if (event.error === 'no-speech') {
            setErrorMessage(
              lang === 'bn'
                ? 'কোনো কণ্ঠস্বর শোনা যায়নি। মাইক্রোফোনের কাছে স্পষ্টভাবে হরফটি উচ্চারণ করুন।'
                : 'No speech detected. Speak the Arabic letter clearly near your microphone.'
            );
          } else if (event.error !== 'aborted') {
            setErrorMessage(
              lang === 'bn'
                ? `ভয়েস রিকগনিশন ত্রুটি (${event.error})। আবার চেষ্টা করুন।`
                : `Speech recognition notice (${event.error}). Tap Try Again to speak.`
            );
          }
          setPhase('idle');
        };

        recognition.onend = () => {
          if (!gotResultRef.current) {
            setPhase((prev) => (prev === 'listening' ? 'idle' : prev));
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        void startFallbackRecording(target);
      }
    },
    [cleanupSpeech, handleApplyEvaluation, lang, startFallbackRecording]
  );

  // Step 1: AI pronounces the Arabic letter, then auto-activates Web Speech listener
  const playPromptForLetter = useCallback(
    async (target: ArabicLetter, shouldAutoListen: boolean) => {
      cleanupSpeech();
      setErrorMessage(null);
      setEvaluation(null);
      setInterimTranscript('');
      setPhase('ai_speaking');

      await playArabicAudio(`${target.nameAr} ، ${target.isolated}َ`, audioSpeed, {
        onEnded: () => {
          if (shouldAutoListen) {
            window.setTimeout(() => {
              startWebSpeechListening(target);
            }, 220);
          } else {
            setPhase('idle');
          }
        },
      });
    },
    [audioSpeed, cleanupSpeech, startWebSpeechListening]
  );

  const handleBeginQuiz = () => {
    const freshDeck = buildQuizDeck(masteredLetters, TOTAL_ROUNDS);
    setDeck(freshDeck);
    setRoundIdx(0);
    setCorrectCount(0);
    setSessionXpEarned(0);
    setQuizFinished(false);
    setQuizStarted(true);
    void playPromptForLetter(freshDeck[0], autoListenAfterPrompt);
  };

  const handleNextRound = () => {
    cleanupSpeech();
    stopActiveAudio();
    if (roundIdx + 1 >= deck.length) {
      setQuizFinished(true);
      setPhase('idle');
      return;
    }
    const nextIdx = roundIdx + 1;
    setRoundIdx(nextIdx);
    void playPromptForLetter(deck[nextIdx], autoListenAfterPrompt);
  };

  const handleStopListeningManually = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const showLetterGlyph = !blindEarMode || phase === 'evaluated' || !quizStarted;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left Interactive Voice Quiz Stage (7 cols) */}
      <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-6">
        {/* Top Metadata & Mode Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-500 font-mono-num">
              {quizStarted && !quizFinished
                ? lang === 'bn'
                  ? `রাউন্ড ${roundIdx + 1}/${deck.length} · সঠিক: ${correctCount} · অর্জিত: +${sessionXpEarned} XP`
                  : `Round ${roundIdx + 1}/${deck.length} · Correct: ${correctCount} · Earned: +${sessionXpEarned} XP`
                : speechSupported
                ? lang === 'bn'
                  ? 'Web Speech API (ar-SA) সক্রিয় · ৫ রাউন্ডের মাখরাজ কুইজ'
                  : 'Web Speech API (ar-SA) Ready · 5-Round Articulation Quiz'
                : lang === 'bn'
                ? 'অডিও মাখরাজ যাচাই মোড · ৫ রাউন্ড'
                : 'Audio Makharij Validation Mode · 5 Rounds'}
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {t.voiceQuizTitle}
            </h3>
          </div>

          {/* Interactive Quiz Option Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoListenAfterPrompt((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                autoListenAfterPrompt
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'অটো-লিসেন' : 'Auto-Listen'}
            </button>

            <button
              type="button"
              onClick={() => setBlindEarMode((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                blindEarMode
                  ? 'border-amber-500 bg-amber-50/70 text-amber-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {blindEarMode ? <Ear className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {blindEarMode
                ? lang === 'bn'
                  ? 'শুধু শুনে বলুন'
                  : 'Ear-Only Prompt'
                : lang === 'bn'
                ? 'হরফ দৃশ্যমান'
                : 'Show Letter'}
            </button>
          </div>
        </div>

        {/* Quiz Content Body */}
        {!quizStarted ? (
          <div className="my-auto py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto">
              <Mic className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h4 className="text-xl font-bold text-slate-900">
                {lang === 'bn'
                  ? 'শুনে এবং উচ্চারণ করে হরফের মাখরাজ পরীক্ষা করুন'
                  : 'Listen to the AI Ustad & Vocalize Each Arabic Letter'}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.voiceQuizSubtitle}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBeginQuiz}
                className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[48px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                {t.startVoiceQuiz}
              </button>
            </div>
          </div>
        ) : quizFinished ? (
          /* Quiz Completed Summary */
          <div className="my-auto py-6 text-center space-y-4">
            <p className="text-xs text-emerald-800 font-semibold font-mono-num">
              {lang === 'bn' ? 'কুইজ সম্পন্ন ✓' : 'Session Complete ✓'}
            </p>
            <h4 className="text-2xl font-bold text-slate-900 font-mono-num">
              {correctCount} / {deck.length}{' '}
              {lang === 'bn' ? 'সঠিক উচ্চারণ' : 'Correct Articulations'}
            </h4>
            <p className="text-sm text-slate-600 font-mono-num">
              {lang === 'bn'
                ? `এই সেশনে অর্জিত মোট +${sessionXpEarned} XP আপনার প্রোফাইল ও লিডারবোর্ডে যুক্ত হয়েছে।`
                : `Earned +${sessionXpEarned} XP added to your profile and weekly leaderboard.`}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBeginQuiz}
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[46px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                {lang === 'bn' ? 'নতুন ৫টি হরফ দিয়ে আবার খেলুন' : 'Start New 5-Letter Quiz'}
              </button>
            </div>
          </div>
        ) : (
          /* Active Quiz Round */
          <div className="space-y-5 my-auto">
            {/* Prompt Stage */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center space-y-3">
              {showLetterGlyph ? (
                <>
                  <div
                    dir="rtl"
                    className={`font-arabic text-slate-900 leading-none ${
                      isSenior ? 'text-8xl' : 'text-7xl'
                    }`}
                  >
                    {currentLetter.isolated}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {currentLetter.name[lang]} ·{' '}
                    <span className="font-arabic text-lg" dir="rtl">
                      {currentLetter.nameAr}
                    </span>{' '}
                    · <span className="text-slate-500 font-normal">{currentLetter.sound[lang]}</span>
                  </p>
                </>
              ) : (
                <div className="py-4 space-y-2">
                  <Ear className="w-10 h-10 text-amber-600 mx-auto" />
                  <p className="text-base font-bold text-slate-900">
                    {lang === 'bn'
                      ? 'এআই-এর উচ্চারণ শুনে একই হরফটি বলুন'
                      : 'Listen carefully and repeat the Arabic letter'}
                  </p>
                </div>
              )}

              {/* Live Status Bar */}
              <div className="pt-2">
                {phase === 'ai_speaking' && (
                  <p className="text-xs font-semibold text-emerald-700">
                    {t.aiSpeakingPrompt}
                  </p>
                )}
                {phase === 'listening' && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-rose-600">
                      {t.listeningSpeakNow}
                    </p>
                    {interimTranscript && (
                      <p className="font-arabic text-2xl text-slate-800" dir="rtl">
                        {interimTranscript}
                      </p>
                    )}
                  </div>
                )}
                {phase === ' fallback_evaluating' && (
                  <p className="text-xs font-semibold text-slate-600">
                    {t.evaluatingVoice}
                  </p>
                )}
                {phase === 'idle' && !evaluation && (
                  <p className="text-xs text-slate-500">
                    {lang === 'bn'
                      ? `উদাহরণ: "${currentLetter.name[lang]}" অথবা "${currentLetter.exampleTranslit[lang]}" বলুন`
                      : `Say "${currentLetter.name.en}" (${currentLetter.nameAr}) or "${currentLetter.exampleTranslit.en}"`}
                  </p>
                )}
              </div>
            </div>

            {/* Primary Voice & Replay Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void playPromptForLetter(currentLetter, false)}
                disabled={phase === 'ai_speaking'}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Volume2 className="w-4 h-4 text-emerald-700" />
                {t.replayAiPrompt}
              </button>

              {phase === 'listening' ? (
                <button
                  type="button"
                  onClick={handleStopListeningManually}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <MicOff className="w-4 h-4" />
                  {lang === 'bn' ? 'শোনা থামান' : 'Stop Listening'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startWebSpeechListening(currentLetter)}
                  disabled={phase === 'ai_speaking' || phase === ' fallback_evaluating'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <Mic className="w-4 h-4" />
                  {evaluation ? t.tryAgainVoice : t.recordVoice}
                </button>
              )}

              <button
                type="button"
                onClick={handleNextRound}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                {evaluation?.matched ? (
                  <span>{t.nextQuizLetter}</span>
                ) : (
                  <>
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'এড়িয়ে যান' : 'Skip'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Notice */}
            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Evaluation Feedback Panel */}
            {evaluation && (
              <div
                className={`rounded-2xl border p-4 space-y-2 ${
                  evaluation.matched
                    ? 'border-emerald-300 bg-emerald-50/60'
                    : 'border-amber-300 bg-amber-50/60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                      evaluation.matched ? 'text-emerald-800' : 'text-amber-900'
                    }`}
                  >
                    {evaluation.matched ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                    )}
                    {evaluation.matched
                      ? lang === 'bn'
                        ? 'মাশাআল্লাহ! সঠিক উচ্চারণ (+১৫ XP)'
                        : 'Spot-On Pronunciation! (+15 XP)'
                      : lang === 'bn'
                      ? 'মাখরাজ আরেকটু স্পষ্ট করুন'
                      : 'Close — Adjust Articulation Point'}
                  </span>

                  <span className="text-xs font-mono-num font-semibold text-slate-700">
                    {lang === 'bn' ? 'শ্রুত ধ্বনি:' : 'Heard:'}{' '}
                    <span className="font-arabic text-base" dir="rtl">
                      {evaluation.heardTranscript}
                    </span>{' '}
                    · {evaluation.confidencePercent}%
                  </span>
                </div>

                {!evaluation.matched && evaluation.confusedWithLetter && (
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {lang === 'bn'
                      ? `মনে হয়েছে আপনি "${evaluation.confusedWithLetter.name.bn} (${evaluation.confusedWithLetter.isolated})" উচ্চারণ করেছেন। "${currentLetter.name.bn} (${currentLetter.isolated})"-এর জন্য নিচের মাখরাজ নির্দেশনা দেখুন:`
                      : `It sounded closer to "${evaluation.confusedWithLetter.name.en} (${evaluation.confusedWithLetter.isolated})". To articulate "${currentLetter.name.en} (${currentLetter.isolated})", check your tongue placement:`}
                  </p>
                )}

                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>{t.mouthPlacement}: </strong>
                  {currentLetter.mouthGuide[lang]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar Footer */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono-num">
            <span>
              {lang === 'bn' ? 'সেশন অগ্রগতি' : 'Quiz Progress'}
            </span>
            <span>
              {quizFinished ? deck.length : quizStarted ? roundIdx + 1 : 0}/{deck.length}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 transition-transform duration-300 origin-left"
              style={{
                width: '100%',
                transform: `scaleX(${
                  quizFinished
                    ? 1
                    : quizStarted
                    ? Math.max(0.08, (roundIdx + (evaluation?.matched ? 1 : 0.3)) / deck.length)
                    : 0.03
                })`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Stage (5 cols): Live Vocal Tract Diagram + Articulation Coach */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <AnimatedVocalTractCanvas
          letter={currentLetter}
          lang={lang}
          isPlaying={phase === 'ai_speaking' || phase === 'listening'}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <p className="text-xs font-semibold text-emerald-800">
            {currentLetter.zoneTitle[lang]}
          </p>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {currentLetter.mouthGuide[lang]}
          </p>
          <div className="pt-2 border-t border-slate-100 text-xs text-amber-800 leading-relaxed">
            <strong>{t.mistakeWarning}: </strong>
            {currentLetter.mistakeToAvoid[lang]}
          </div>
        </div>
      </div>
    </div>
  );
};
