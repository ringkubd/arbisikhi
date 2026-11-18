import React, {useEffect, useRef, useState} from 'react';
import {Bell, CheckCircle2, Flame, X} from 'lucide-react';
import {UI_STRINGS} from '../data/i18n';
import type {AgeMode, DailyGoalTier, Language} from '../types';

interface DailyGoalNotificationToastProps {
  profileId: string;
  profileName: string;
  ageMode: AgeMode;
  lang: Language;
  todayDateKey: string;
  todayMinutes: number;
  targetGoalMinutes: number;
  goalTier: DailyGoalTier;
  streakDays: number;
  onContinueLesson: () => void;
}

const DISMISS_STORAGE_KEY = 'arbi_sikkhi_toast_dismissed_v1';
const NOTIFIED_STORAGE_KEY = 'arbi_sikkhi_browser_notified_v1';

export const DailyGoalNotificationToast: React.FC<DailyGoalNotificationToastProps> = ({
  profileId,
  profileName,
  ageMode,
  lang,
  todayDateKey,
  todayMinutes,
  targetGoalMinutes,
  goalTier,
  streakDays,
  onContinueLesson,
}) => {
  const t = UI_STRINGS[lang];
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? window.Notification.permission
      : 'denied'
  );

  const [dismissedMap, setDismissedMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  const notifiedMapRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY);
      if (raw) {
        notifiedMapRef.current = JSON.parse(raw) as Record<string, boolean>;
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Keep local hour updated every minute to catch end-of-day window (>= 17:00)
  useEffect(() => {
    const id = window.setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const goalCompleted = todayMinutes >= targetGoalMinutes;
  const remainingMinutes = Math.max(0, targetGoalMinutes - todayMinutes);
  // End of day window: 5:00 PM (17:00) through 11:59 PM (23:59) local time
  const isNearEndOfDay = currentHour >= 17;

  const toastKind: 'achieved' | 'streak_reminder' | null = goalCompleted
    ? 'achieved'
    : isNearEndOfDay
    ? 'streak_reminder'
    : null;

  const dismissKey = toastKind ? `${todayDateKey}::${profileId}::${toastKind}` : '';
  const isDismissed = dismissKey ? Boolean(dismissedMap[dismissKey]) : false;

  // Trigger native browser notification once per day per state if user granted permission
  useEffect(() => {
    if (
      !toastKind ||
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      notifPermission !== 'granted'
    ) {
      return;
    }

    const notifyKey = `${todayDateKey}::${profileId}::${toastKind}`;
    if (notifiedMapRef.current[notifyKey]) return;

    try {
      const title =
        toastKind === 'achieved'
          ? t.toastGoalAchievedTitle
          : `${t.toastStreakReminderTitle} (${profileName})`;
      const body =
        toastKind === 'achieved'
          ? lang === 'bn'
            ? `${profileName}: আজ ${todayMinutes}/${targetGoalMinutes} মিনিট সম্পন্ন হয়েছে! আপনার ${streakDays} দিনের স্ট্রিক অটুট রয়েছে।`
            : `${profileName} completed ${todayMinutes}/${targetGoalMinutes} min today! ${streakDays}-day streak secured.`
          : lang === 'bn'
          ? `আজকের লক্ষ্য পূর্ণ করতে আর ${remainingMinutes} মিনিট বাকি। আপনার ${streakDays} দিনের স্ট্রিক ধরে রাখুন!`
          : `Only ${remainingMinutes} min left today to keep your ${streakDays}-day learning streak.`;

      new window.Notification(title, {
        body,
        icon: '/pwa-192x192.png',
      });

      notifiedMapRef.current = {...notifiedMapRef.current, [notifyKey]: true};
      localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(notifiedMapRef.current));
    } catch {
      // Ignore environments that restrict Notification constructor in iframes
    }
  }, [
    toastKind,
    notifPermission,
    todayDateKey,
    profileId,
    profileName,
    todayMinutes,
    targetGoalMinutes,
    remainingMinutes,
    streakDays,
    lang,
    t.toastGoalAchievedTitle,
    t.toastStreakReminderTitle,
  ]);

  const handleRequestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const perm = await window.Notification.requestPermission();
      setNotifPermission(perm);
    } catch {
      // Ignore permission request error
    }
  };

  const handleDismiss = () => {
    if (!dismissKey) return;
    const next = {...dismissedMap, [dismissKey]: true};
    setDismissedMap(next);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota issues
    }
  };

  if (!toastKind || isDismissed) {
    return null;
  }

  const suffix = goalTier === 'intensive' ? '+' : '';
  const canPromptBrowserNotif =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    notifPermission === 'default';

  if (toastKind === 'achieved') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-emerald-300 bg-emerald-50/90 px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-emerald-950">
              {t.toastGoalAchievedTitle}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900/85 mt-0.5 font-mono-num">
              {lang === 'bn'
                ? `${profileName} · আজ ${todayMinutes}/${targetGoalMinutes}${suffix} মিনিট অনুশীলন সম্পন্ন · ${streakDays} দিনের ধারাবাহিকতা অটুট রয়েছে`
                : `${profileName} · ${todayMinutes}/${targetGoalMinutes}${suffix} min studied today · ${streakDays}-day streak secured`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canPromptBrowserNotif && (
            <button
              type="button"
              onClick={handleRequestNotifications}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100/60 text-xs font-semibold text-emerald-900 transition-colors whitespace-nowrap shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
              {t.enableDailyAlerts}
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={t.dismissToastLabel}
            className="min-h-[40px] min-w-[40px] rounded-xl border border-transparent hover:bg-emerald-200/50 flex items-center justify-center text-emerald-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Subtle 'Keep your streak' end-of-day reminder
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-amber-200/90 bg-amber-50/75 px-5 py-4 flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {t.toastStreakReminderTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-0.5 leading-relaxed">
            {ageMode === 'senior'
              ? lang === 'bn'
                ? `দিনের শেষ ভাগে এসেছেন—আজকের লক্ষ্য পূর্ণ করতে আর মাত্র ${remainingMinutes} মিনিট ধীরগতির পাঠ বাকি (${todayMinutes}/${targetGoalMinutes}${suffix} মি.)।`
                : `Evening gentle reminder: just ${remainingMinutes} calm minutes remaining to complete today's ${targetGoalMinutes}${suffix}-min goal.`
              : lang === 'bn'
              ? `দিনের প্রায় শেষ সময়—আপনার ${streakDays} দিনের স্ট্রিক ধরে রাখতে আজ আর মাত্র ${remainingMinutes} মিনিট অনুশীলন বাকি (${todayMinutes}/${targetGoalMinutes}${suffix} মি.)।`
              : `Only ${remainingMinutes} min left before day's end to hit your ${targetGoalMinutes}${suffix}-min target and protect your ${streakDays}-day streak.`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {canPromptBrowserNotif && (
          <button
            type="button"
            onClick={handleRequestNotifications}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-amber-300 bg-white hover:bg-amber-100/50 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Bell className="w-3.5 h-3.5 text-amber-700" />
            {t.enableDailyAlerts}
          </button>
        )}

        <button
          type="button"
          onClick={onContinueLesson}
          className="px-4 py-2 min-h-[40px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          {t.continueLearning}
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t.dismissToastLabel}
          className="min-h-[40px] min-w-[40px] rounded-xl border border-transparent hover:bg-amber-200/50 flex items-center justify-center text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
