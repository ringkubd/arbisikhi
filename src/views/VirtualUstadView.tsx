import React, {useState} from 'react';
import {Send, Volume2, AlertCircle} from 'lucide-react';
import {UI_STRINGS} from '../data/i18n';
import type {AgeMode, Language, TrackId} from '../types';
import {playArabicAudio} from '../utils/audioPlayer';

interface UstadReplyCard {
  replyText: string;
  arabicPhrase: string;
  arabicUnvowelled: string;
  transliteration: string;
  meaning: string;
  coachTip: string;
}

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  userText?: string;
  card?: UstadReplyCard;
}

interface VirtualUstadViewProps {
  lang: Language;
  ageMode: AgeMode;
  track: TrackId;
  audioSpeed: number;
  showHarakat: boolean;
  onToggleHarakat: () => void;
  onEarnXp: (amount: number) => void;
}

export const VirtualUstadView: React.FC<VirtualUstadViewProps> = ({
  lang,
  ageMode,
  track,
  audioSpeed,
  showHarakat,
  onToggleHarakat,
  onEarnXp,
}) => {
  const t = UI_STRINGS[lang];
  const [mode, setMode] = useState<'ustad' | 'roleplay'>('ustad');
  const [scenario, setScenario] = useState('Makkah Haram Hotel Check-in');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: 'welcome',
      role: 'assistant',
      card: {
        replyText:
          lang === 'bn'
            ? 'আস-সালামু আলাইকুম! আমি আপনার ভার্চুয়াল ওস্তাদ। কুরআনের যেকোনো শব্দের অর্থ, ৩-অক্ষরের মূলশব্দ (الجذر), মাখরাজ, তাজবীদ অথবা সৌদি/প্রমিত আরবি কথোপকথন—যেকোনো প্রশ্ন বাংলায় বা ইংরেজিতে লিখুন!'
            : 'Assalamu Alaikum! Ask me any Quranic word breakdown, 3-letter root, Makharij articulation tip, or start a live Saudi/MSA conversation scenario below.',
        arabicPhrase: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
        arabicUnvowelled: 'خيركم من تعلم القرآن وعلمه',
        transliteration:
          lang === 'bn'
            ? 'খাইরুকুম মান তা‘আল্লামাল ক্বুরআনা ওয়া আল্লামাহু'
            : 'Khayrukum man ta‘allama al-Qur’aana wa ‘allamahu',
        meaning:
          lang === 'bn'
            ? 'তোমাদের মধ্যে সর্বোত্তম সেই ব্যক্তি যে নিজে কুরআন শেখে এবং অন্যকে শেখায়।'
            : 'The best among you are those who learn the Quran and teach it.',
        coachTip:
          lang === 'bn'
            ? 'তَعَلَّمَ এবং عَلَّمَ উভয় শব্দের মূলশব্দ হলো ع - ل - م (জ্ঞান)।'
            : 'Both ta‘allama (learned) and ‘allama (taught) share the 3-letter root ع - ل - م.',
      },
    },
  ]);

  const starterPrompts =
    mode === 'ustad'
      ? lang === 'bn'
        ? [
            'হালকী হা (ح) এবং গোল হা (ه)-এর উচ্চারণের পার্থক্য সহজভাবে বুঝিয়ে দিন',
            'সূরা ফাতিহার "ইয়্যাকা না‘বুদু" অংশের অর্থ ও তাজবীদ নিয়ম কী?',
            'ক্বাফ (ق) ও কাফ (ك) ভুল করলে অর্থ কীভাবে বদলে যায়?',
          ]
        : [
            'How do I pronounce ع (Ayn) clearly without straining my throat?',
            'Break down "Maliki Yawmid-Deen" word by word with roots',
            'Explain the difference between MSA and Saudi Gulf future tense',
          ]
      : lang === 'bn'
      ? [
          'আস-সালামু আলাইকুম, আমি মক্কার হোটেলে আমার রুম চেক-ইন করতে চাই',
          'লাও সামাহত, হারাম শরীফে যাওয়ার সবচেয়ে কাছের গেট কোনটি?',
          'শুকরান! আমি এক কাপ আরবি কফি ও খেজুর নিতে চাই',
        ]
      : [
          'Assalamu Alaikum, I would like to check in to my room near Al-Haram',
          'Law samaht, how much is a kilo of Madinah Ajwa dates?',
          'I am a software engineer working in Riyadh—nice to meet you!',
        ];

  const sendPrompt = async (promptText: string) => {
    const clean = promptText.trim();
    if (!clean || loading) return;

    const userTurn: ChatTurn = {
      id: `u_${Date.now()}`,
      role: 'user',
      userText: clean,
    };

    const updatedTurns = [...turns, userTurn];
    setTurns(updatedTurns);
    setInput('');
    setLoading(true);
    setErrorMsg(null);

    try {
      const apiMessages = updatedTurns.map((item) => ({
        role: item.role,
        content:
          item.role === 'user'
            ? item.userText || ''
            : `${item.card?.replyText || ''} (${item.card?.arabicPhrase || ''})`,
      }));

      const res = await fetch('/api/ustad-chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          messages: apiMessages,
          mode,
          lang,
          ageMode,
          track,
          scenario,
        }),
      });

      const data = (await res.json()) as UstadReplyCard & {error?: string};
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Could not reach Virtual Ustad.');
      } else {
        setTurns((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            card: data,
          },
        ]);
        onEarnXp(15);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn'
              ? 'জিরো-টিউটর আর্কিটেকচার · সার্বক্ষণিক কুরআনিক ও কথ্য আরবি মেন্টর'
              : 'Zero-Tutor Architecture · On-Demand Quranic, Grammar & Dialect Coach'}
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {t.ustadTitle}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleHarakat}
            className="px-3.5 py-2 min-h-[42px] rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0"
          >
            {showHarakat ? t.harakatOn : t.harakatOff}
          </button>

          <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMode('ustad')}
              className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                mode === 'ustad'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.ustadModeQA}
            </button>
            <button
              type="button"
              onClick={() => setMode('roleplay')}
              className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                mode === 'roleplay'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.ustadModeRoleplay}
            </button>
          </div>
        </div>
      </div>

      {mode === 'roleplay' && (
        <div className="flex flex-wrap items-center gap-2">
          {[
            'Makkah Haram Hotel Check-in',
            'Madinah Dates & Souq Market',
            'Riyadh Engineering Interview',
            'Clinic & Pharmacy Consultation',
          ].map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => setScenario(sc)}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                scenario === sc
                  ? 'bg-emerald-700 border-emerald-700 text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {sc}
            </button>
          ))}
        </div>
      )}

      {/* Quick-Start Question / Dialogue Starters */}
      <div className="flex flex-wrap gap-2">
        {starterPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendPrompt(p)}
            disabled={loading}
            className="text-left px-3.5 py-2 min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 text-xs text-slate-700 dark:text-slate-200 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Conversation Stream */}
      <div className="space-y-4">
        {turns.map((turn) =>
          turn.role === 'user' ? (
            <div key={turn.id} className="flex justify-end">
              <div className="max-w-xl rounded-2xl bg-emerald-700 text-white px-5 py-3.5 text-sm leading-relaxed">
                {turn.userText}
              </div>
            </div>
          ) : (
            turn.card && (
              <div
                key={turn.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 space-y-4"
              >
                <p className="text-sm md:text-base text-slate-800 dark:text-slate-100 leading-relaxed">
                  {turn.card.replyText}
                </p>

                {turn.card.arabicPhrase && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => playArabicAudio(turn.card!.arabicPhrase, audioSpeed)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                        {t.listenClearAudio}
                      </button>
                      <p
                        dir="rtl"
                        className="font-arabic text-3xl text-slate-900 dark:text-white text-right"
                      >
                        {showHarakat
                          ? turn.card.arabicPhrase
                          : turn.card.arabicUnvowelled || turn.card.arabicPhrase}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                      <strong>{turn.card.transliteration}</strong> — {turn.card.meaning}
                    </p>
                  </div>
                )}

                {turn.card.coachTip && (
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    <strong>{lang === 'bn' ? 'ওস্তাদ নোট: ' : 'Ustad Tip: '}</strong>
                    {turn.card.coachTip}
                  </p>
                )}
              </div>
            )
          )
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm text-slate-500">
            {lang === 'bn'
              ? 'ভার্চুয়াল ওস্তাদ উত্তর প্রস্তুত করছেন...'
              : 'Virtual Ustad is preparing your explanation...'}
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendPrompt(input);
        }}
        className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            lang === 'bn'
              ? 'বাংলা, ইংরেজি বা আরবিতে আপনার প্রশ্ন বা সংলাপ লিখুন...'
              : 'Ask in Bangla, English, or Arabic...'
          }
          className="flex-1 min-h-[44px] px-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Send className="w-4 h-4" />
          {lang === 'bn' ? 'পাঠান' : 'Send'}
        </button>
      </form>
    </div>
  );
};
