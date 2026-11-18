import React, {useState} from 'react';
import {motion, useReducedMotion} from 'motion/react';
import {CheckCircle2, Lock} from 'lucide-react';
import {UI_STRINGS} from '../data/i18n';
import type {Language} from '../types';

export interface MilestoneDefinition {
  id: 'streak-7' | 'streak-30' | 'streak-100';
  targetDays: 7 | 30 | 100;
  arabicHonorific: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  primaryColor: string;
  accentColor: string;
}

const MILESTONES: MilestoneDefinition[] = [
  {
    id: 'streak-7',
    targetDays: 7,
    arabicHonorific: 'مُثَابِر',
    titleBn: '৭ দিনের ধারাবাহিকতা',
    titleEn: '7-Day Streak',
    descBn: 'টানা এক সপ্তাহ প্রতিদিন আরবি ও কুরআন অনুশীলনের অভ্যাস স্থাপন।',
    descEn: 'Completed a full week of uninterrupted daily Arabic & Quranic study.',
    primaryColor: '#047857',
    accentColor: '#f59e0b',
  },
  {
    id: 'streak-30',
    targetDays: 30,
    arabicHonorific: 'مُتْقِن',
    titleBn: '৩০ দিনের সাধনা',
    titleEn: '30-Day Streak',
    descBn: 'পূর্ণ এক মাস নিয়মিত মাখরাজ, শব্দভাণ্ডার ও পাঠ অনুশীলনের মাইলফলক।',
    descEn: 'Sustained a full 30-day lunar cycle of consistent daily mastery.',
    primaryColor: '#0f766e',
    accentColor: '#d97706',
  },
  {
    id: 'streak-100',
    targetDays: 100,
    arabicHonorific: 'رَاسِخ',
    titleBn: '১০০ দিনের জ্যোতি',
    titleEn: '100-Day Streak',
    descBn: 'শতদিন অবিচল থেকে আরবি ভাষায় গভীর ও স্থায়ী দক্ষতা অর্জন।',
    descEn: 'Reached the centennial scholar milestone of 100 consecutive days.',
    primaryColor: '#1e293b',
    accentColor: '#eab308',
  },
];

interface AchievementBadgeCardProps {
  milestone: MilestoneDefinition;
  currentStreak: number;
  lang: Language;
  index: number;
  onStartPractice?: () => void;
}

export const AchievementBadge: React.FC<AchievementBadgeCardProps> = ({
  milestone,
  currentStreak,
  lang,
  index,
  onStartPractice,
}) => {
  const t = UI_STRINGS[lang];
  const prefersReducedMotion = useReducedMotion();
  const [celebrateKey, setCelebrateKey] = useState(0);

  const unlocked = currentStreak >= milestone.targetDays;
  const clampedDays = Math.min(currentStreak, milestone.targetDays);
  const progressRatio = Math.min(1, currentStreak / milestone.targetDays);
  const remainingDays = Math.max(0, milestone.targetDays - currentStreak);

  const handleReplayCelebration = () => {
    if (!unlocked) return;
    setCelebrateKey((k) => k + 1);
  };

  const renderMedallionSvg = () => (
    <motion.svg
      key={`emblem-${celebrateKey}`}
      viewBox="0 0 96 96"
      className="w-20 h-20 overflow-visible"
      initial={
        unlocked && !prefersReducedMotion
          ? {scale: 0.84, rotate: -8}
          : false
      }
      animate={{scale: 1, rotate: 0}}
      whileHover={
        unlocked && !prefersReducedMotion ? {scale: 1.06, rotate: 3} : undefined
      }
      whileTap={
        unlocked && !prefersReducedMotion ? {scale: 0.95} : undefined
      }
      transition={{type: 'spring', stiffness: 340, damping: 20}}
    >
      {/* Rotating Outer Geometric Filigree Ring for Unlocked Badges */}
      <motion.g
        style={{transformOrigin: '48px 48px'}}
        animate={
          unlocked && !prefersReducedMotion
            ? {rotate: 360}
            : {rotate: 0}
        }
        transition={
          unlocked && !prefersReducedMotion
            ? {duration: 28, repeat: Infinity, ease: 'linear'}
            : undefined
        }
      >
        <circle
          cx="48"
          cy="48"
          r="43"
          fill="none"
          stroke={unlocked ? milestone.accentColor : '#cbd5e1'}
          strokeWidth="1.75"
          strokeDasharray="5 4"
        />
        {/* 8-Pointed Rub el Hizb Star Frame */}
        <rect
          x="18"
          y="18"
          width="60"
          height="60"
          rx="10"
          fill={unlocked ? milestone.primaryColor : '#f1f5f9'}
          stroke={unlocked ? milestone.accentColor : '#cbd5e1'}
          strokeWidth="2"
        />
        <rect
          x="18"
          y="18"
          width="60"
          height="60"
          rx="10"
          transform="rotate(45 48 48)"
          fill={unlocked ? milestone.primaryColor : '#f1f5f9'}
          stroke={unlocked ? milestone.accentColor : '#cbd5e1'}
          strokeWidth="2"
        />
      </motion.g>

      {/* Inner Medallion Core (Static Upright Number) */}
      <circle
        cx="48"
        cy="48"
        r="24"
        fill={unlocked ? '#ffffff' : '#f8fafc'}
        stroke={unlocked ? milestone.accentColor : '#e2e8f0'}
        strokeWidth="2"
      />
      <text
        x="48"
        y="53"
        textAnchor="middle"
        fill={unlocked ? milestone.primaryColor : '#94a3b8'}
        fontSize={milestone.targetDays === 100 ? '15' : '18'}
        fontWeight="700"
        className="font-mono-num"
      >
        {milestone.targetDays}d
      </text>
    </motion.svg>
  );

  return (
    <motion.div
      initial={prefersReducedMotion ? false : {opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.25, delay: index * 0.06, ease: [0.16, 1, 0.3, 1]}}
      className={`rounded-2xl border p-6 flex flex-col justify-between gap-5 transition-colors ${
        unlocked
          ? 'border-emerald-500/80 bg-white shadow-[0_4px_0_0_#047857]'
          : 'border-slate-200 bg-white'
      }`}
    >
      {/* Top Row: Medallion Crest + Arabic Honorific */}
      <div className="flex items-start justify-between gap-4">
        {unlocked ? (
          <button
            type="button"
            onClick={handleReplayCelebration}
            aria-label={`${lang === 'bn' ? milestone.titleBn : milestone.titleEn} — Celebrate`}
            className="relative w-20 h-20 flex items-center justify-center rounded-2xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            {!prefersReducedMotion && (
              <motion.span
                key={`burst-${celebrateKey}`}
                initial={{scale: 0.75, opacity: 0.75}}
                animate={{scale: 1.38, opacity: 0}}
                transition={{duration: 0.75, ease: 'easeOut'}}
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-amber-400"
              />
            )}
            {renderMedallionSvg()}
          </button>
        ) : (
          <div
            aria-hidden="true"
            className="relative w-20 h-20 flex items-center justify-center rounded-2xl"
          >
            {renderMedallionSvg()}
          </div>
        )}

        <div className="text-right">
          <span
            dir="rtl"
            className={`font-arabic text-2xl leading-none ${
              unlocked ? 'text-emerald-800' : 'text-slate-400'
            }`}
          >
            {milestone.arabicHonorific}
          </span>
          <div className="mt-1.5 flex items-center justify-end gap-1 text-xs font-medium">
            {unlocked ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'অর্জিত' : 'Unlocked'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'লক করা' : 'Locked'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5">
        <h3 className={`text-base font-bold ${unlocked ? 'text-slate-900' : 'text-slate-700'}`}>
          {lang === 'bn' ? milestone.titleBn : milestone.titleEn}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {lang === 'bn' ? milestone.descBn : milestone.descEn}
        </p>
      </div>

      {/* Bottom Progress & Status Line (Unboxed clean metadata + compositor progress bar) */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-mono-num">
          <span className={unlocked ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
            {unlocked
              ? t.badgeUnlockedLabel
              : `${remainingDays} ${t.badgeDaysRemainingSuffix}`}
          </span>
          <span className="font-semibold text-slate-800">
            {clampedDays}/{milestone.targetDays}
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={clampedDays}
          aria-valuemin={0}
          aria-valuemax={milestone.targetDays}
          aria-label={lang === 'bn' ? milestone.titleBn : milestone.titleEn}
          className="w-full h-2 rounded-full bg-slate-100 overflow-hidden"
        >
          <div
            className={`h-full rounded-full transition-transform duration-300 origin-left ${
              unlocked ? 'bg-emerald-600' : 'bg-slate-400'
            }`}
            style={{
              width: '100%',
              transform: `scaleX(${Math.max(0.03, progressRatio)})`,
            }}
          />
        </div>

        {!unlocked && onStartPractice && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onStartPractice}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline whitespace-nowrap"
            >
              {lang === 'bn' ? 'অনুশীলন চালিয়ে যান →' : 'Continue Practice →'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface AchievementBadgesSectionProps {
  lang: Language;
  streakDays: number;
  profileName: string;
  onStartPractice?: () => void;
}

export const AchievementBadgesSection: React.FC<AchievementBadgesSectionProps> = ({
  lang,
  streakDays,
  profileName,
  onStartPractice,
}) => {
  const t = UI_STRINGS[lang];
  const unlockedCount = MILESTONES.filter((m) => streakDays >= m.targetDays).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 font-mono-num">
            {profileName} ·{' '}
            {lang === 'bn'
              ? `অর্জিত ব্যাজ: ${unlockedCount}/3 · বর্তমান স্ট্রিক: ${streakDays} দিন`
              : `Unlocked: ${unlockedCount}/3 · Active Streak: ${streakDays} days`}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {t.achievementsSectionTitle}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {t.achievementsSectionSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MILESTONES.map((milestone, idx) => (
          <AchievementBadge
            key={`${profileName}-${milestone.id}`}
            milestone={milestone}
            currentStreak={streakDays}
            lang={lang}
            index={idx}
            onStartPractice={onStartPractice}
          />
        ))}
      </div>
    </section>
  );
};
