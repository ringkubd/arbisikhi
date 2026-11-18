import React, {useRef, useState} from 'react';
import {Mic, Square, Volume2, AlertCircle, CheckCircle2} from 'lucide-react';
import type {AgeMode, Language} from '../types';
import {playArabicAudio} from '../utils/audioPlayer';

interface PronunciationResult {
  accuracyPercent: number;
  status: 'EXCELLENT' | 'GOOD' | 'PRACTICE_NEEDED' | string;
  heardArabic: string;
  makhrajTip: string;
  tajweedNote: string;
  encouragement: string;
}

interface PronunciationCoachPanelProps {
  targetArabic: string;
  targetTranslit: string;
  targetMeaning: string;
  lang: Language;
  ageMode: AgeMode;
  audioSpeed: number;
  onSuccessScore?: (score: number) => void;
}

export const PronunciationCoachPanel: React.FC<PronunciationCoachPanelProps> = ({
  targetArabic,
  targetTranslit,
  targetMeaning,
  lang,
  ageMode,
  audioSpeed,
  onSuccessScore,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<PronunciationResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const handleListen = async () => {
    setIsPlaying(true);
    setErrorMsg(null);
    await playArabicAudio(targetArabic, audioSpeed, {
      onEnded: () => setIsPlaying(false),
    });
  };

  const startRecording = async () => {
    setErrorMsg(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = mimeType
        ? new MediaRecorder(stream, {mimeType})
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        await evaluateRecording(blob, recorder.mimeType || 'audio/webm');
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setErrorMsg(
        lang === 'bn'
          ? 'মাইক্রোফোন অনুমতি পাওয়া যায়নি। ব্রাউজারে মাইক্রোফোন চালু করে আবার চেষ্টা করুন।'
          : 'Microphone access was denied. Please grant microphone permission in your browser.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const evaluateRecording = async (blob: Blob, mimeType: string) => {
    setIsEvaluating(true);
    setErrorMsg(null);
    try {
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const commaIdx = res.indexOf(',');
          resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
        };
        reader.onerror = () => reject(new Error('Failed to read audio recording'));
        reader.readAsDataURL(blob);
      });

      const response = await fetch('/api/pronunciation-check', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType,
          targetArabic,
          targetTranslit,
          targetMeaning,
          lang,
          ageMode,
        }),
      });

      const data = (await response.json()) as PronunciationResult & {error?: string};
      if (!response.ok || data.error) {
        setErrorMsg(data.error || 'Failed to evaluate pronunciation.');
      } else {
        setResult(data);
        if (data.accuracyPercent >= 70) {
          onSuccessScore?.(data.accuracyPercent);
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error during evaluation.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'এআই মাখরাজ ও তাজবীদ উচ্চারণ পরীক্ষক' : 'AI Makharij & Tajweed Pronunciation Check'}
          </p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="font-arabic text-3xl text-slate-900 dark:text-white" dir="rtl">
              {targetArabic}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {targetTranslit} · {targetMeaning}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleListen}
            disabled={isPlaying}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            {isPlaying
              ? lang === 'bn'
                ? 'শোনাচ্ছে...'
                : 'Playing...'
              : lang === 'bn'
              ? 'আদর্শ উচ্চারণ শুনুন'
              : 'Hear Model Audio'}
          </button>

          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={isEvaluating}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Mic className="w-4 h-4" />
              {lang === 'bn' ? 'মাইক্রোফোনে বলুন' : 'Speak Now'}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              {lang === 'bn' ? 'থামান ও স্কোর দেখুন' : 'Stop & Score'}
            </button>
          )}
        </div>
      </div>

      {isEvaluating && (
        <div className="py-5 text-sm text-slate-600 dark:text-slate-300">
          {lang === 'bn'
            ? 'ভার্চুয়াল ওস্তাদ আপনার মাখরাজ ও মাদ্দ বিশ্লেষণ করছেন...'
            : 'Virtual Ustad is analyzing your articulation point and vowel length...'}
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {result && !isEvaluating && (
        <div className="mt-4 pt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {lang === 'bn' ? 'উচ্চারণ স্কোর' : 'Accuracy Score'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {result.status === 'EXCELLENT'
                  ? lang === 'bn'
                    ? 'মাশাআল্লাহ নির্ভুল'
                    : 'Excellent'
                  : result.status === 'GOOD'
                  ? lang === 'bn'
                    ? 'সুন্দর প্রচেষ্টা'
                    : 'Good Clarity'
                  : lang === 'bn'
                  ? 'আরেকটু অনুশীলন'
                  : 'Keep Practicing'}
              </span>
            </div>
            <p className="text-3xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
              {result.accuracyPercent}%
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {lang === 'bn' ? 'শ্রুত ধ্বনি:' : 'Heard:'}{' '}
              <span className="font-arabic text-lg text-slate-900 dark:text-slate-100" dir="rtl">
                {result.heardArabic}
              </span>
            </p>
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {result.encouragement}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-100">
                {lang === 'bn' ? 'মাখরাজ পরামর্শ: ' : 'Makhraj Tip: '}
              </strong>
              {result.makhrajTip}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-100">
                {lang === 'bn' ? 'তাজবীদ ও স্বরদৈর্ঘ্য: ' : 'Tajweed & Length: '}
              </strong>
              {result.tajweedNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
