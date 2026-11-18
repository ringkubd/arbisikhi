import React, {useEffect, useMemo, useState} from 'react';
import {
  Award,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
} from 'lucide-react';
import {UI_STRINGS} from '../data/i18n';
import type {AgeMode, DailyGoalTier, Language, TrackId} from '../types';

const BN_WEEKDAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const EN_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayStatus = 'perfect' | 'goal_met' | 'partial' | 'missed' | 'future';

interface CalendarDayCell {
  dateKey: string;
  dayOfMonth: number;
  dateObj: Date;
  minutes: number;
  status: DayStatus;
  isToday: boolean;
  isFuture: boolean;
  bonusMinutes: number;
  consecutiveRunDay: number;
}

function toDateKey(year: number, monthZeroIndexed: number, day: number): string {
  const m = String(monthZeroIndexed + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map((n) => Number(n));
  const dt = new Date(y || 2026, (m || 1) - 1, d || 1, 12, 0, 0, 0);
  return dt;
}

interface MonthlyStreakCalendarProps {
  lang: Language;
  ageMode: AgeMode;
  profileName: string;
  preferredTrack: TrackId;
  studyHistory: Record<string, number>;
  todayDateKey: string;
  todayMinutes: number;
  targetGoalMinutes: number;
  goalTier: DailyGoalTier;
  currentStreakDays: number;
  onStartPractice: () => void;
}

export const MonthlyStreakCalendar: React.FC<MonthlyStreakCalendarProps> = ({
  lang,
  ageMode,
  profileName,
  preferredTrack,
  studyHistory,
  todayDateKey,
  todayMinutes,
  targetGoalMinutes,
  goalTier,
  currentStreakDays,
  onStartPractice,
}) => {
  const t = UI_STRINGS[lang];
  const isSenior = ageMode === 'senior';
  const todayObj = useMemo(() => parseDateKey(todayDateKey), [todayDateKey]);

  const [viewYear, setViewYear] = useState<number>(() => todayObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => todayObj.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayDateKey);

  // Keep selected date valid when todayDateKey changes
  useEffect(() => {
    if (selectedDateKey > todayDateKey) {
      setSelectedDateKey(todayDateKey);
    }
  }, [selectedDateKey, todayDateKey]);

  // Merge todayMinutes live into studyHistory map
  const effectiveHistory = useMemo(() => {
    return {
      ...studyHistory,
      [todayDateKey]: Math.max(0, todayMinutes),
    };
  }, [studyHistory, todayDateKey, todayMinutes]);

  // Compute consecutive active study run number for any historical date (>= targetGoalMinutes or > 0)
  const streakRunByDate = useMemo(() => {
    const runMap: Record<string, number> = {};
    // Walk 90 days up to today chronologically to compute exact streak run length on each day
    let activeGoalStreak = 0;
    for (let offset = 90; offset >= 0; offset--) {
      const d = new Date(todayObj);
      d.setDate(d.getDate() - offset);
      const key = toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      const mins = effectiveHistory[key] ?? 0;
      if (mins >= targetGoalMinutes) {
        activeGoalStreak += 1;
        runMap[key] = activeGoalStreak;
      } else {
        activeGoalStreak = 0;
        runMap[key] = 0;
      }
    }
    return runMap;
  }, [effectiveHistory, targetGoalMinutes, todayObj]);

  // Build calendar cells for (viewYear, viewMonth)
  const {leadingBlanks, daysInMonthCells, monthStats} = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1, 12, 0, 0, 0);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sun .. 6 = Sat
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: CalendarDayCell[] = [];
    let perfectCount = 0;
    let goalMetTotalCount = 0;
    let activeDaysCount = 0;
    let totalMinutesInMonth = 0;
    let bestRunInMonth = 0;

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(viewYear, viewMonth, day, 12, 0, 0, 0);
      const dateKey = toDateKey(viewYear, viewMonth, day);
      const isToday = dateKey === todayDateKey;
      const isFuture = dateKey > todayDateKey;
      const minutes = isFuture ? 0 : Math.max(0, effectiveHistory[dateKey] ?? 0);

      let status: DayStatus = 'missed';
      if (isFuture) {
        status = 'future';
      } else if (minutes > targetGoalMinutes) {
        status = 'perfect';
        perfectCount += 1;
        goalMetTotalCount += 1;
        activeDaysCount += 1;
      } else if (minutes === targetGoalMinutes) {
        status = 'goal_met';
        goalMetTotalCount += 1;
        activeDaysCount += 1;
      } else if (minutes > 0) {
        status = 'partial';
        activeDaysCount += 1;
      }

      totalMinutesInMonth += minutes;
      const consecutiveRunDay = streakRunByDate[dateKey] ?? 0;
      if (consecutiveRunDay > bestRunInMonth) {
        bestRunInMonth = consecutiveRunDay;
      }

      cells.push({
        dateKey,
        dayOfMonth: day,
        dateObj,
        minutes,
        status,
        isToday,
        isFuture,
        bonusMinutes: Math.max(0, minutes - targetGoalMinutes),
        consecutiveRunDay,
      });
    }

    return {
      leadingBlanks: startWeekday,
      daysInMonthCells: cells,
      monthStats: {
        perfectCount,
        goalMetTotalCount,
        activeDaysCount,
        totalMinutesInMonth,
        bestRunInMonth,
      },
    };
  }, [effectiveHistory, streakRunByDate, targetGoalMinutes, todayDateKey, viewMonth, viewYear]);

  const isViewingCurrentMonth =
    viewYear === todayObj.getFullYear() && viewMonth === todayObj.getMonth();

  const handlePrevMonth = () => {
    let nextY = viewYear;
    let nextM = viewMonth - 1;
    if (nextM < 0) {
      nextM = 11;
      nextY -= 1;
    }
    setViewYear(nextY);
    setViewMonth(nextM);
    // Select last non-future day of that month for immediate inspection
    const lastDay = new Date(nextY, nextM + 1, 0).getDate();
    const candidateKey = toDateKey(nextY, nextM, lastDay);
    setSelectedDateKey(candidateKey > todayDateKey ? todayDateKey : candidateKey);
  };

  const handleNextMonth = () => {
    if (isViewingCurrentMonth) return;
    let nextY = viewYear;
    let nextM = viewMonth + 1;
    if (nextM > 11) {
      nextM = 0;
      nextY += 1;
    }
    setViewYear(nextY);
    setViewMonth(nextM);
    const firstKey = toDateKey(nextY, nextM, 1);
    const isNowCurrent =
      nextY === todayObj.getFullYear() && nextM === todayObj.getMonth();
    setSelectedDateKey(isNowCurrent ? todayDateKey : firstKey);
  };

  const handleJumpToday = () => {
    setViewYear(todayObj.getFullYear());
    setViewMonth(todayObj.getMonth());
    setSelectedDateKey(todayDateKey);
  };

  const monthHeaderLabel = useMemo(() => {
    const dt = new Date(viewYear, viewMonth, 1, 12, 0, 0, 0);
    return dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [lang, viewMonth, viewYear]);

  // Build full details for the currently clicked/selected date (works across any month)
  const selectedDetail = useMemo(() => {
    const dt = parseDateKey(selectedDateKey);
    const isToday = selectedDateKey === todayDateKey;
    const minutes = Math.max(0, effectiveHistory[selectedDateKey] ?? 0);
    const status: DayStatus =
      minutes > targetGoalMinutes
        ? 'perfect'
        : minutes === targetGoalMinutes
        ? 'goal_met'
        : minutes > 0
        ? 'partial'
        : 'missed';

    const diffMs = todayObj.getTime() - dt.getTime();
    const daysAgo = Math.max(0, Math.round(diffMs / 86_400_000));
    const relativeLabel = isToday
      ? lang === 'bn'
        ? 'আজ'
        : 'Today'
      : daysAgo === 1
      ? lang === 'bn'
        ? 'গতকাল'
        : 'Yesterday'
      : lang === 'bn'
      ? `${daysAgo} দিন আগে`
      : `${daysAgo} days ago`;

    const formattedFullDate = dt.toLocaleDateString(
      lang === 'bn' ? 'bn-BD' : 'en-US',
      {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }
    );

    const pctOfGoal = Math.round((minutes / targetGoalMinutes) * 100);
    const bonusMinutes = Math.max(0, minutes - targetGoalMinutes);
    const estimatedXp = minutes > 0 ? Math.round(minutes * 3.2) + (status === 'perfect' ? 15 : 0) : 0;
    const consecutiveRunDay = streakRunByDate[selectedDateKey] ?? 0;

    return {
      dateKey: selectedDateKey,
      isToday,
      daysAgo,
      relativeLabel,
      formattedFullDate,
      minutes,
      status,
      pctOfGoal,
      bonusMinutes,
      estimatedXp,
      consecutiveRunDay,
    };
  }, [
    effectiveHistory,
    lang,
    selectedDateKey,
    streakRunByDate,
    targetGoalMinutes,
    todayDateKey,
    todayObj,
  ]);

  const trackLabel =
    preferredTrack === 'quran'
      ? t.trackQuran
      : preferredTrack === 'msa'
      ? t.trackMsa
      : t.trackGulf;

  const weekdayLabels = lang === 'bn' ? BN_WEEKDAYS : EN_WEEKDAYS;

  return (
    <section
      aria-labelledby="monthly-streak-calendar-heading"
      className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6"
    >
      {/* Top Header & Summary Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-800">
            <span>{t.monthlyCalendarKicker}</span>
            <span aria-hidden="true">·</span>
            <span>{profileName}</span>
          </div>
          <h2
            id="monthly-streak-calendar-heading"
            className={`font-bold tracking-tight text-slate-900 ${
              isSenior ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            }`}
          >
            {t.monthlyCalendarTitle}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 pt-0.5 font-mono-num">
            <span>
              <strong className="text-amber-700">★ {monthStats.perfectCount}</strong>{' '}
              {t.perfectDaysLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-emerald-800">✓ {monthStats.goalMetTotalCount}</strong>{' '}
              {lang === 'bn' ? 'দিন লক্ষ্য পূর্ণ' : 'Goal Met Days'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-slate-800">{monthStats.totalMinutesInMonth}m</strong>{' '}
              {lang === 'bn' ? 'এই মাসে মোট' : 'Monthly Total'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-slate-800">{currentStreakDays}d</strong>{' '}
              {lang === 'bn' ? 'বর্তমান স্ট্রিক' : 'Active Streak'}
            </span>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label={lang === 'bn' ? 'আগের মাস' : 'Previous month'}
              className="w-9 h-9 rounded-lg hover:bg-white text-slate-700 flex items-center justify-center transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs sm:text-sm font-bold text-slate-900 min-w-[132px] text-center whitespace-nowrap">
              {monthHeaderLabel}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isViewingCurrentMonth}
              aria-label={lang === 'bn' ? 'পরের মাস' : 'Next month'}
              className="w-9 h-9 rounded-lg hover:bg-white disabled:opacity-35 disabled:hover:bg-transparent text-slate-700 flex items-center justify-center transition-colors shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleJumpToday}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.jumpToTodayBtn}</span>
          </button>
        </div>
      </div>

      {/* Explicit Accessible Legend (Icon + Surface + Text — Never Color Alone) */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-5 h-5 rounded-md bg-emerald-800 border border-amber-400 text-amber-300 inline-flex items-center justify-center">
            <Star className="w-3 h-3 fill-current" />
          </span>
          <span>
            {lang === 'bn'
              ? `পারফেক্ট দিন (>${targetGoalMinutes} মি.)`
              : `Perfect Day (>${targetGoalMinutes}m)`}
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 inline-flex items-center justify-center">
            <Check className="w-3 h-3" />
          </span>
          <span>
            {lang === 'bn'
              ? `লক্ষ্য পূর্ণ (${targetGoalMinutes} মি.)`
              : `Goal Met (${targetGoalMinutes}m)`}
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-mono-num text-[10px] font-bold inline-flex items-center justify-center">
            m
          </span>
          <span>
            {lang === 'bn' ? 'আংশিক অনুশীলন' : 'Partial Practice'}
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-5 h-5 rounded-md bg-white border border-slate-200 inline-block" />
          <span>{lang === 'bn' ? 'অনুশীলন নেই' : 'No Study Logged'}</span>
        </span>
      </div>

      {/* Two-Zone Sandbox Layout: Left 7-Col Calendar Grid + Right 5-Col Selected Date Progress Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Zone: 7-Column Interactive Month Grid */}
        <div className="lg:col-span-7 space-y-2">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {weekdayLabels.map((wd) => (
              <div
                key={wd}
                className="py-1 text-xs font-semibold text-slate-500 select-none"
              >
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({length: leadingBlanks}).map((_, idx) => (
              <div
                key={`blank-${idx}`}
                aria-hidden="true"
                className="min-h-[52px] sm:min-h-[60px] rounded-xl bg-slate-50/50"
              />
            ))}

            {daysInMonthCells.map((cell) => {
              const isSelected = cell.dateKey === selectedDateKey;

              let cellClasses =
                'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50';
              if (cell.status === 'future') {
                cellClasses =
                  'bg-slate-50/40 border-slate-100 text-slate-300 cursor-not-allowed';
              } else if (cell.status === 'perfect') {
                cellClasses =
                  'bg-emerald-800 border-amber-400 text-white hover:bg-emerald-900';
              } else if (cell.status === 'goal_met') {
                cellClasses =
                  'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100/80';
              } else if (cell.status === 'partial') {
                cellClasses =
                  'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200/70';
              }

              const selectedRing = isSelected
                ? 'ring-2 ring-emerald-700 ring-offset-2'
                : '';

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={cell.isFuture}
                  onClick={() => setSelectedDateKey(cell.dateKey)}
                  aria-pressed={isSelected}
                  aria-label={`${cell.dateKey}: ${cell.minutes} minutes`}
                  className={`min-h-[52px] sm:min-h-[60px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between text-left transition-all ${cellClasses} ${selectedRing}`}
                >
                  <div className="w-full flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-mono-num font-bold leading-none ${
                        cell.isToday && cell.status !== 'perfect'
                          ? 'underline decoration-2 underline-offset-2 text-emerald-800'
                          : ''
                      }`}
                    >
                      {cell.dayOfMonth}
                    </span>

                    {cell.status === 'perfect' && (
                      <Star
                        aria-hidden="true"
                        className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0"
                      />
                    )}
                    {cell.status === 'goal_met' && (
                      <Check
                        aria-hidden="true"
                        className="w-3.5 h-3.5 text-emerald-700 shrink-0"
                      />
                    )}
                  </div>

                  {!cell.isFuture && (
                    <div className="w-full flex items-baseline justify-between gap-0.5 mt-1">
                      <span
                        className={`text-[11px] font-mono-num font-medium leading-none truncate ${
                          cell.status === 'perfect'
                            ? 'text-emerald-100'
                            : cell.status === 'goal_met'
                            ? 'text-emerald-800'
                            : cell.status === 'partial'
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.minutes > 0 ? `${cell.minutes}m` : '—'}
                      </span>

                      {cell.status === 'perfect' && cell.bonusMinutes > 0 && (
                        <span className="hidden sm:inline text-[10px] font-mono-num font-semibold text-amber-300 leading-none">
                          +{cell.bonusMinutes}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 pt-1">
            {lang === 'bn'
              ? 'যেকোনো পূর্ববর্তী তারিখে ক্লিক করে সেই দিনের বিস্তারিত অনুশীলন ও স্ট্রিক অগ্রগতি দেখুন।'
              : 'Click any past date on the calendar to inspect your study duration, goal overflow, and streak run.'}
          </p>
        </div>

        {/* Right Zone: Selected Date Progress Inspector */}
        <div
          aria-live="polite"
          className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-5"
        >
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{t.selectedDateProgressTitle}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-800">
                {selectedDetail.relativeLabel}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {selectedDetail.formattedFullDate}
            </h3>

            {/* Explicit Status Callout */}
            {selectedDetail.status === 'perfect' && (
              <div className="pt-1 flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-800">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {t.perfectDayBadge} (+{selectedDetail.bonusMinutes}{' '}
                  {lang === 'bn' ? 'মিনিট অতিরিক্ত' : 'min bonus'})
                </span>
              </div>
            )}
            {selectedDetail.status === 'goal_met' && (
              <div className="pt-1 flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t.goalCompletedStatus}</span>
              </div>
            )}
            {selectedDetail.status === 'partial' && (
              <p className="pt-1 text-xs sm:text-sm font-medium text-slate-600">
                {lang === 'bn'
                  ? `দৈনিক লক্ষ্য থেকে ${targetGoalMinutes - selectedDetail.minutes} মিনিট কম অনুশীলন হয়েছে`
                  : `${targetGoalMinutes - selectedDetail.minutes} min short of daily target`}
              </p>
            )}
            {selectedDetail.status === 'missed' && (
              <p className="pt-1 text-xs sm:text-sm text-slate-500">
                {lang === 'bn'
                  ? 'এই তারিখে কোনো অনুশীলন সময় রেকর্ড করা হয়নি।'
                  : 'No study minutes were recorded on this date.'}
              </p>
            )}
          </div>

          {/* Quantitative Study Meter */}
          <div className="space-y-2 pt-3 border-t border-slate-200/80">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-slate-500">
                {lang === 'bn' ? 'অনুশীলন সময় বনাম লক্ষ্য' : 'Study Time vs. Daily Target'}
              </span>
              <span className="text-lg font-bold font-mono-num text-slate-900">
                {selectedDetail.minutes} / {targetGoalMinutes}
                {goalTier === 'intensive' ? '+' : ''} min{' '}
                <span className="text-xs font-semibold text-emerald-800">
                  ({selectedDetail.pctOfGoal}%)
                </span>
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className={`h-full rounded-full transition-transform duration-200 origin-left ${
                  selectedDetail.status === 'perfect'
                    ? 'bg-amber-500'
                    : selectedDetail.status === 'goal_met'
                    ? 'bg-emerald-600'
                    : 'bg-slate-500'
                }`}
                style={{
                  width: '100%',
                  transform: `scaleX(${Math.min(
                    1,
                    selectedDetail.minutes > 0
                      ? Math.max(0.05, selectedDetail.minutes / targetGoalMinutes)
                      : 0
                  )})`,
                }}
              />
            </div>
          </div>

          {/* Breakdown Rows Separated by Clean Hairline Dividers */}
          <div className="divide-y divide-slate-200/80 border-t border-b border-slate-200/80 text-xs sm:text-sm">
            <div className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-600">
                {lang === 'bn' ? 'ধারাবাহিক স্ট্রিক অবস্থান' : 'Streak Run on Date'}
              </span>
              <span className="font-mono-num font-semibold text-slate-900 inline-flex items-center gap-1.5">
                <Flame
                  className={`w-3.5 h-3.5 ${
                    selectedDetail.consecutiveRunDay > 0
                      ? 'text-amber-600'
                      : 'text-slate-400'
                  }`}
                />
                {selectedDetail.consecutiveRunDay > 0
                  ? lang === 'bn'
                    ? `টানা দিন #${selectedDetail.consecutiveRunDay}`
                    : `Day #${selectedDetail.consecutiveRunDay} in streak`
                  : lang === 'bn'
                  ? 'স্ট্রিক বিরতি'
                  : 'Streak paused'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-600">
                {lang === 'bn' ? 'অর্জিত আনুমানিক XP' : 'Estimated XP Earned'}
              </span>
              <span className="font-mono-num font-semibold text-emerald-800">
                +{selectedDetail.estimatedXp} XP
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-600">
                {lang === 'bn' ? 'সক্রিয় পাঠ্যক্রম ট্র্যাক' : 'Curriculum Track'}
              </span>
              <span className="font-medium text-slate-900 text-right truncate max-w-[200px]">
                {trackLabel}
              </span>
            </div>
          </div>

          {/* Actionable Practice CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-500">
              {selectedDetail.isToday && selectedDetail.status !== 'perfect'
                ? lang === 'bn'
                  ? `আর মাত্র ${Math.max(1, targetGoalMinutes + 1 - selectedDetail.minutes)} মিনিট অনুশীলন করলেই আজকের দিনটি পারফেক্ট ডে ★ হবে!`
                  : `Practice ${Math.max(1, targetGoalMinutes + 1 - selectedDetail.minutes)} more min today to unlock a Perfect Day ★!`
                : lang === 'bn'
                ? 'আজকের অনুশীলন বাড়িয়ে নতুন পারফেক্ট দিন অর্জন করুন।'
                : 'Keep practicing today to log another Perfect Day.'}
            </p>

            <button
              type="button"
              onClick={onStartPractice}
              className="px-4 py-2.5 min-h-[40px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              {t.continueLearning}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
