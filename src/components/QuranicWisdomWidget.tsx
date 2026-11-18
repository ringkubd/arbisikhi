import React, {useEffect, useRef, useState} from 'react';
import {BookOpen, Check, Copy, Shuffle, Volume2} from 'lucide-react';
import {UI_STRINGS} from '../data/i18n';
import type {AgeMode, Language, LocalizedText} from '../types';
import {playArabicAudio} from '../utils/audioPlayer';

export interface QuranicWisdomVerse {
  id: string;
  surahName: LocalizedText;
  reference: string;
  arabicAr: string;
  unvowelledAr: string;
  transliteration: LocalizedText;
  translation: LocalizedText;
  theme: LocalizedText;
  rootLetters: string;
  rootMeaning: LocalizedText;
}

const QURANIC_WISDOM_VERSES: QuranicWisdomVerse[] = [
  {
    id: 'taha-114',
    surahName: {bn: 'সূরা ত্বা-হা', en: 'Surah Ta-Ha'},
    reference: '20:114',
    arabicAr: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    unvowelledAr: 'وقل رب زدني علما',
    transliteration: {
      bn: 'ওয়া কুল রাব্বি যিদনী ‘ইলমা',
      en: 'Wa qul Rabbi zidni ‘ilma',
    },
    translation: {
      bn: 'এবং বলুন, “হে আমার প্রতিপালক! আমার জ্ঞান বৃদ্ধি করে দিন।”',
      en: 'And say, “My Lord, increase me in knowledge.”',
    },
    theme: {bn: 'জ্ঞান অন্বেষণ', en: 'Seeking Knowledge'},
    rootLetters: 'ع - ل - م',
    rootMeaning: {bn: 'জানা ও প্রজ্ঞা', en: 'To know / knowledge'},
  },
  {
    id: 'sharh-5-6',
    surahName: {bn: 'সূরা আল-ইনশিরাহ', en: 'Surah Ash-Sharh'},
    reference: '94:5–6',
    arabicAr: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    unvowelledAr: 'فإن مع العسر يسرا ۝ إن مع العسر يسرا',
    transliteration: {
      bn: 'ফা ইন্না মা‘আল ‘উসরি ইউসরা · ইন্না মা‘আল ‘উসরি ইউসরা',
      en: 'Fa inna ma‘al-‘usri yusra · Inna ma‘al-‘usri yusra',
    },
    translation: {
      bn: 'নিশ্চয়ই কষ্টের সাথেই স্বস্তি রয়েছে। নিশ্চয়ই কষ্টের সাথেই স্বস্তি রয়েছে।',
      en: 'For indeed, with hardship comes ease. Indeed, with hardship comes ease.',
    },
    theme: {bn: 'আশা ও স্বস্তি', en: 'Hope & Relief'},
    rootLetters: 'ي - س - ر',
    rootMeaning: {bn: 'সহজতা ও স্বস্তি', en: 'Ease & facilitation'},
  },
  {
    id: 'rad-28',
    surahName: {bn: 'সূরা আর-রাদ', en: 'Surah Ar-Ra‘d'},
    reference: '13:28',
    arabicAr: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    unvowelledAr: 'ألا بذكر الله تطمئن القلوب',
    transliteration: {
      bn: 'আলা বিযিকরিল্লাহি তাত্বমাইন্নুল কুলূব',
      en: 'Ala bidhikrillahi tatma’innul-qulub',
    },
    translation: {
      bn: 'জেনে রাখো, আল্লাহর স্মরণেই হৃদয়সমূহ প্রশান্ত হয়।',
      en: 'Unquestionably, by the remembrance of Allah hearts find tranquility.',
    },
    theme: {bn: 'হৃদয়ের প্রশান্তি', en: 'Inner Tranquility'},
    rootLetters: 'ذ - ك - ر',
    rootMeaning: {bn: 'স্মরণ ও উপদেশ', en: 'Remembrance'},
  },
  {
    id: 'qamar-17',
    surahName: {bn: 'সূরা আল-কামার', en: 'Surah Al-Qamar'},
    reference: '54:17',
    arabicAr: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
    unvowelledAr: 'ولقد يسرنا القرآن للذكر فهل من مدكر',
    transliteration: {
      bn: 'ওয়া লাকাদ ইয়াসসারনাল কুরআনা লিয-যিকরি ফাহাল মিম মুদ্দাকির',
      en: 'Wa laqad yassarnal-Qur’ana lidh-dhikri fahal mim muddakir',
    },
    translation: {
      bn: 'আর আমি তো কুরআনকে উপদেশ গ্রহণের জন্য সহজ করে দিয়েছি; অতএব কোনো উপদেশ গ্রহণকারী আছে কি?',
      en: 'And We have certainly made the Qur’an easy for remembrance, so is there any who will remember?',
    },
    theme: {bn: 'সহজ কুরআন শিক্ষা', en: 'Ease of Learning Quran'},
    rootLetters: 'ي - س - ر',
    rootMeaning: {bn: 'সহজ করে দেওয়া', en: 'To make easy'},
  },
  {
    id: 'baqarah-286',
    surahName: {bn: 'সূরা আল-বাকারা', en: 'Surah Al-Baqarah'},
    reference: '2:286',
    arabicAr: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    unvowelledAr: 'لا يكلف الله نفسا إلا وسعها',
    transliteration: {
      bn: 'লা ইউকাল্লিফুল্লাহু নাফসান ইল্লা উস‘আহা',
      en: 'La yukallifullahu nafsan illa wus‘aha',
    },
    translation: {
      bn: 'আল্লাহ কোনো প্রাণকে তার সামর্থ্যের বাইরে দায়িত্ব দেন না।',
      en: 'Allah does not burden a soul beyond what it can bear.',
    },
    theme: {bn: 'করুণা ও সামর্থ্য', en: 'Mercy & Capacity'},
    rootLetters: 'و - س - ع',
    rootMeaning: {bn: 'প্রশস্ততা ও সামর্থ্য', en: 'Capacity / vastness'},
  },
  {
    id: 'ibrahim-7',
    surahName: {bn: 'সূরা ইবরাহীম', en: 'Surah Ibrahim'},
    reference: '14:7',
    arabicAr: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    unvowelledAr: 'لئن شكرتم لأزيدنكم',
    transliteration: {
      bn: 'লাইং শাকারতুম লা-আযীদান্নাকুম',
      en: 'La’in shakartum la’azidannakum',
    },
    translation: {
      bn: 'যদি তোমরা কৃতজ্ঞতা প্রকাশ করো, তবে আমি অবশ্যই তোমাদের অনুগ্রহ আরও বাড়িয়ে দেব।',
      en: 'If you are grateful, I will surely increase you in favor.',
    },
    theme: {bn: 'কৃতজ্ঞতা ও বরকত', en: 'Gratitude & Growth'},
    rootLetters: 'ش - ك - ر',
    rootMeaning: {bn: 'কৃতজ্ঞতা প্রকাশ', en: 'Gratitude'},
  },
  {
    id: 'baqarah-153',
    surahName: {bn: 'সূরা আল-বাকারা', en: 'Surah Al-Baqarah'},
    reference: '2:153',
    arabicAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    unvowelledAr: 'يا أيها الذين آمنوا استعينوا بالصبر والصلاة إن الله مع الصابرين',
    transliteration: {
      bn: 'ইস্তা‘ঈনূ বিস-সাবরি ওয়াস-সালাহ · ইন্নাল্লাহা মা‘আস-সাবিরীন',
      en: 'Ista‘inu bis-sabri was-salah · Innallaha ma‘as-sabirin',
    },
    translation: {
      bn: 'হে মুমিনগণ! তোমরা ধৈর্য ও সালাতের মাধ্যমে সাহায্য চাও। নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সাথে আছেন।',
      en: 'O you who believe, seek help through patience and prayer. Indeed, Allah is with the patient.',
    },
    theme: {bn: 'ধৈর্য ও অবিচলতা', en: 'Patience & Consistency'},
    rootLetters: 'ص - ب - ر',
    rootMeaning: {bn: 'ধৈর্য ও স্থিরতা', en: 'Patience / steadfastness'},
  },
  {
    id: 'talaq-3',
    surahName: {bn: 'সূরা আত-তালাক', en: 'Surah At-Talaq'},
    reference: '65:3',
    arabicAr: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    unvowelledAr: 'ومن يتوكل على الله فهو حسبه',
    transliteration: {
      bn: 'ওয়া মাইঁ ইয়াতাওয়াক্কাল ‘আলাল্লাহি ফাহুয়া হাসবুহ',
      en: 'Wa man yatawakkal ‘alallahi fahuwa hasbuh',
    },
    translation: {
      bn: 'আর যে আল্লাহর ওপর ভরসা করে, আল্লাহই তার জন্য যথেষ্ট।',
      en: 'And whoever relies upon Allah — then He is sufficient for him.',
    },
    theme: {bn: 'তাওয়াক্কুল ও আস্থা', en: 'Trust & Reliance'},
    rootLetters: 'و - ك - ل',
    rootMeaning: {bn: 'ভরসা ও দায়িত্ব অর্পণ', en: 'Reliance / trust'},
  },
  {
    id: 'alaq-4-5',
    surahName: {bn: 'সূরা আল-আলাক', en: 'Surah Al-‘Alaq'},
    reference: '96:4–5',
    arabicAr: 'الَّذِي عَلَّمَ بِالْقَلَمِ ۝ عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',
    unvowelledAr: 'الذي علم بالقلم ۝ علم الإنسان ما لم يعلم',
    transliteration: {
      bn: 'আল্লাযী ‘আল্লামা বিল-কালাম · ‘আল্লামান ইনসানা মা লাম ইয়া‘লাম',
      en: 'Alladhi ‘allama bil-qalam · ‘Allamal-insana ma lam ya‘lam',
    },
    translation: {
      bn: 'যিনি কলমের সাহায্যে শিক্ষা দিয়েছেন—মানুষকে শিক্ষা দিয়েছেন যা সে জানত না।',
      en: 'Who taught by the pen — taught humanity that which it knew not.',
    },
    theme: {bn: 'কলম ও শিক্ষা', en: 'Literacy & Revelation'},
    rootLetters: 'ق - ل - م',
    rootMeaning: {bn: 'কলম ও লিখন', en: 'The pen / writing'},
  },
  {
    id: 'duha-5',
    surahName: {bn: 'সূরা আদ-দুহা', en: 'Surah Ad-Duha'},
    reference: '93:5',
    arabicAr: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
    unvowelledAr: 'ولسوف يعطيك ربك فترضى',
    transliteration: {
      bn: 'ওয়া লাসাওফা ইউ‘ত্বীকা রাব্বুকা ফাতারদা',
      en: 'Wa lasawfa yu‘tika Rabbuka fatarda',
    },
    translation: {
      bn: 'আর অচিরেই আপনার প্রতিপালক আপনাকে অনুগ্রহ দান করবেন, ফলে আপনি সন্তুষ্ট হবেন।',
      en: 'And your Lord is going to give you, and you will be satisfied.',
    },
    theme: {bn: 'সন্তুষ্টি ও প্রতিশ্রুতি', en: 'Contentment & Promise'},
    rootLetters: 'ر - ض - ي',
    rootMeaning: {bn: 'সন্তুষ্টি ও আনন্দ', en: 'Contentment'},
  },
];

async function copyTextSafe(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below for restricted iframe contexts
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

interface QuranicWisdomWidgetProps {
  lang: Language;
  ageMode: AgeMode;
  audioSpeed: number;
  showHarakat: boolean;
  onOpenQuranLab: () => void;
}

export const QuranicWisdomWidget: React.FC<QuranicWisdomWidgetProps> = ({
  lang,
  ageMode,
  audioSpeed,
  showHarakat,
  onOpenQuranLab,
}) => {
  const t = UI_STRINGS[lang];
  const isSenior = ageMode === 'senior';

  const [verseIndex, setVerseIndex] = useState<number>(() =>
    Math.floor(Math.random() * QURANIC_WISDOM_VERSES.length)
  );
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const verse = QURANIC_WISDOM_VERSES[verseIndex] || QURANIC_WISDOM_VERSES[0];

  const handleShuffleVerse = () => {
    setCopied(false);
    setVerseIndex((prev) => {
      if (QURANIC_WISDOM_VERSES.length <= 1) return prev;
      let next = Math.floor(Math.random() * QURANIC_WISDOM_VERSES.length);
      if (next === prev) {
        next = (prev + 1) % QURANIC_WISDOM_VERSES.length;
      }
      return next;
    });
  };

  const handleCopyVerse = async () => {
    const sharePayload = [
      verse.arabicAr,
      '',
      `“${verse.translation.bn}”`,
      `“${verse.translation.en}”`,
      `— ${verse.surahName[lang]} (${verse.reference}) · Arbi Sikkhi`,
    ].join('\n');

    const success = await copyTextSafe(sharePayload);
    if (success) {
      setCopied(true);
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2200);
    }
  };

  const handleListenVerse = async () => {
    setIsPlaying(true);
    try {
      await playArabicAudio(verse.arabicAr, audioSpeed);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <section
      aria-labelledby="quranic-wisdom-heading"
      className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5"
    >
      {/* Top Row: Kicker, Heading & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-800">
            <span>{t.quranicWisdomKicker}</span>
            <span aria-hidden="true">·</span>
            <span>{verse.theme[lang]}</span>
          </div>
          <h2
            id="quranic-wisdom-heading"
            className={`font-bold tracking-tight text-slate-900 ${
              isSenior ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            }`}
          >
            {t.quranicWisdomTitle}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleListenVerse}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Volume2
              className={`w-3.5 h-3.5 ${
                isPlaying ? 'text-amber-600' : 'text-emerald-700'
              }`}
            />
            <span>{isPlaying ? t.playingAudio : t.listenClearAudio}</span>
          </button>

          <button
            type="button"
            onClick={handleShuffleVerse}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5 text-slate-600" />
            <span>{t.shuffleVerseBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyVerse}
            aria-live="polite"
            className={`inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              copied
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? t.verseCopiedLabel : t.copyVerseBtn}</span>
          </button>
        </div>
      </div>

      {/* Verse Body: Arabic Ayah + Transliteration + Bangla & English Translation */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <p
          dir="rtl"
          lang="ar"
          className={`font-arabic text-right text-slate-900 leading-[2.05] ${
            isSenior ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
          }`}
        >
          {showHarakat ? verse.arabicAr : verse.unvowelledAr}
        </p>

        <div className="space-y-2">
          <p className="text-xs sm:text-sm italic text-slate-500">
            {verse.transliteration[lang]}
          </p>

          <p
            className={`font-medium text-slate-900 leading-relaxed ${
              isSenior ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
            }`}
          >
            “{verse.translation[lang]}”
          </p>

          {/* Secondary Bilingual Companion Line so both Bangla & English are always accessible */}
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {lang === 'bn' ? verse.translation.en : verse.translation.bn}
          </p>
        </div>
      </div>

      {/* Clean Unboxed Citation & Root Insight Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-800">
            {verse.surahName[lang]}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-num font-semibold text-emerald-800">
            {verse.reference}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {lang === 'bn' ? 'মূলশব্দ:' : 'Root:'}{' '}
            <span dir="rtl" className="font-arabic text-sm text-slate-800">
              {verse.rootLetters}
            </span>{' '}
            ({verse.rootMeaning[lang]})
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenQuranLab}
          className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:text-emerald-950 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t.openQuranLabBtn}</span>
        </button>
      </div>
    </section>
  );
};
