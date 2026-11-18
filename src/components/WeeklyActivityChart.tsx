import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {UI_STRINGS} from '../data/i18n';
import type {DailyGoalTier, Language} from '../types';

export interface WeeklyDayDatum {
  dateKey: string;
  dayShort: string;
  fullDateLabel: string;
  minutes: number;
  isToday: boolean;
}

interface WeeklyActivityChartProps {
  lang: Language;
  studyHistory: Record<string, number>;
  todayMinutes: number;
  targetGoalMinutes: number;
  goalTier: DailyGoalTier;
  onStartPractice: () => void;
}

const BN_DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateKeyOffset(daysAgo: number): {dateKey: string; dateObj: Date} {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return {dateKey: `${y}-${m}-${day}`, dateObj: d};
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{payload: WeeklyDayDatum}>;
  lang: Language;
  targetGoalMinutes: number;
  goalTier: DailyGoalTier;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  lang,
  targetGoalMinutes,
  goalTier,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  const met = item.minutes >= targetGoalMinutes;
  const suffix = goalTier === 'intensive' ? '+' : '';

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-md text-xs space-y-1">
      <p className="font-semibold text-slate-900">{item.fullDateLabel}</p>
      <p className="font-mono-num text-slate-700">
        {lang === 'bn' ? 'অনুশীলন:' : 'Studied:'}{' '}
        <strong className="text-slate-900">{item.minutes} min</strong> / {targetGoalMinutes}
        {suffix} min
      </p>
      <p className={met ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
        {met
          ? lang === 'bn'
            ? '✓ দৈনিক লক্ষ্য পূর্ণ হয়েছে'
            : '✓ Daily Goal Met'
          : item.minutes === 0
          ? lang === 'bn'
            ? 'অনুশীলন করা হয়নি'
            : 'No study logged'
          : lang === 'bn'
          ? `লক্ষ্য থেকে ${targetGoalMinutes - item.minutes} মিনিট বাকি`
          : `${targetGoalMinutes - item.minutes} min below goal`}
      </p>
    </div>
  );
};

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({
  lang,
  studyHistory,
  todayMinutes,
  targetGoalMinutes,
  goalTier,
  onStartPractice,
}) => {
  const t = UI_STRINGS[lang];

  // Build chronological 7-day window (6 days ago -> Today)
  const data: WeeklyDayDatum[] = [];
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const {dateKey, dateObj} = formatDateKeyOffset(daysAgo);
    const dow = dateObj.getDay();
    const isToday = daysAgo === 0;
    const rawMin = isToday ? todayMinutes : studyHistory[dateKey] ?? 0;

    const dayShort = isToday
      ? lang === 'bn'
        ? 'আজ'
        : 'Today'
      : lang === 'bn'
      ? BN_DAYS[dow]
      : EN_DAYS[dow];

    const fullDateLabel = dateObj.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    data.push({
      dateKey,
      dayShort,
      fullDateLabel,
      minutes: Math.max(0, rawMin),
      isToday,
    });
  }

  const totalWeekMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const daysMetCount = data.filter((d) => d.minutes >= targetGoalMinutes).length;
  const avgMinutes = Math.round((totalWeekMinutes / 7) * 10) / 10;
  const maxBarValue = Math.max(targetGoalMinutes + 6, ...data.map((d) => d.minutes + 4));

  return (
    <div className="pt-5 border-t border-slate-100 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{t.weeklyChartTitle}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-0.5 font-mono-num">
            <span>
              {t.weeklyDaysMetLabel}: <strong className="text-slate-800">{daysMetCount}/7</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.weeklyTotalLabel}: <strong className="text-slate-800">{totalWeekMinutes}m</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.weeklyAvgLabel}: <strong className="text-slate-800">{avgMinutes}m/d</strong>
            </span>
          </div>
        </div>

        {/* Accessible Explicit Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700 inline-block" />
            {lang === 'bn' ? 'লক্ষ্য পূর্ণ (✓)' : 'Goal Met (✓)'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 inline-block" />
            {lang === 'bn' ? 'আংশিক অনুশীলন' : 'Below Goal'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-amber-600 inline-block" />
            {t.goalLineLabel} ({targetGoalMinutes}{goalTier === 'intensive' ? '+' : ''}m)
          </span>
        </div>
      </div>

      {totalWeekMinutes === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 py-8 px-4 text-center space-y-3">
          <p className="text-sm text-slate-600">
            {lang === 'bn'
              ? 'এই প্রোফাইলে গত ৭ দিনে এখনো কোনো অনুশীলন সময় যোগ হয়নি। আজকের প্রথম পাঠ শুরু করুন!'
              : 'No study minutes logged in the past 7 days for this profile yet. Start your first lesson today!'}
          </p>
          <button
            type="button"
            onClick={onStartPractice}
            className="px-4 py-2 min-h-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
          >
            {lang === 'bn' ? 'প্রথম পাঠ শুরু করুন' : 'Log First Study Session'}
          </button>
        </div>
      ) : (
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{top: 14, right: 16, left: -16, bottom: 4}}
              barCategoryGap="26%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="dayShort"
                axisLine={false}
                tickLine={false}
                tick={{fill: '#475569', fontSize: 12, fontWeight: 500}}
                dy={6}
              />
              <YAxis
                domain={[0, maxBarValue]}
                axisLine={false}
                tickLine={false}
                tick={{fill: '#64748b', fontSize: 11}}
                unit="m"
              />
              <Tooltip
                cursor={{fill: 'rgba(15, 23, 42, 0.04)'}}
                content={
                  <CustomChartTooltip
                    lang={lang}
                    targetGoalMinutes={targetGoalMinutes}
                    goalTier={goalTier}
                  />
                }
              />
              <ReferenceLine
                y={targetGoalMinutes}
                stroke="#d97706"
                strokeWidth={1.75}
                strokeDasharray="5 4"
              />
              <Bar dataKey="minutes" radius={[8, 8, 2, 2]} maxBarSize={42}>
                {data.map((entry) => {
                  const met = entry.minutes >= targetGoalMinutes;
                  const fill = met
                    ? '#047857'
                    : entry.isToday
                    ? '#0d9488'
                    : '#94a3b8';
                  return <Cell key={entry.dateKey} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
