import React, {useMemo, useState} from 'react';
import type {User} from 'firebase/auth';
import {
  Cloud,
  Globe,
  LogIn,
  LogOut,
  Search,
  Trophy,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {UI_STRINGS} from '../data/i18n';
import {BLUEPRINT_LIMITS} from '../firebase';
import type {
  AgeMode,
  FamilyProfile,
  GlobalLeaderboardEntry,
  Language,
  TrackId,
} from '../types';

type LeaderboardScope = 'family' | 'global';
type SortMetric = 'weeklyXp' | 'streakDays';

interface FamilyGlobalLeaderboardProps {
  lang: Language;
  ageMode: AgeMode;
  profiles: FamilyProfile[];
  activeProfileId: string;
  authUser: User | null;
  authReady: boolean;
  isSyncingCloud: boolean;
  globalEntries: GlobalLeaderboardEntry[];
  isLoadingGlobal: boolean;
  onSelectProfile: (profileId: string) => void;
  onStartPractice: () => void;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onToggleShareGlobal: (profileId: string) => void;
  onJumpToAddProfile: () => void;
}

interface UnifiedRow {
  key: string;
  profileId: string;
  ownerId: string;
  displayName: string;
  familyLabel: string;
  ageMode: AgeMode;
  preferredTrack: TrackId;
  weeklyXp: number;
  totalXp: number;
  streakDays: number;
  masteredLettersCount: number;
  isCurrentUserOwner: boolean;
  isActiveProfile: boolean;
  shareOnGlobal: boolean;
}

export const FamilyGlobalLeaderboard: React.FC<FamilyGlobalLeaderboardProps> = ({
  lang,
  ageMode,
  profiles,
  activeProfileId,
  authUser,
  authReady,
  isSyncingCloud,
  globalEntries,
  isLoadingGlobal,
  onSelectProfile,
  onStartPractice,
  onSignInGoogle,
  onSignOut,
  onToggleShareGlobal,
  onJumpToAddProfile,
}) => {
  const t = UI_STRINGS[lang];
  const [scope, setScope] = useState<LeaderboardScope>('family');
  const [sortBy, setSortBy] = useState<SortMetric>('weeklyXp');
  const [searchQuery, setSearchQuery] = useState('');

  const isSenior = ageMode === 'senior';

  const formatTrackName = (track: TrackId): string => {
    if (track === 'msa') return lang === 'bn' ? 'প্রমিত আরবি (MSA)' : 'MSA';
    if (track === 'gulf') return lang === 'bn' ? 'সৌদি ও গালফ' : 'Saudi/Gulf';
    return lang === 'bn' ? 'কুরআন ট্র্যাক' : 'Quranic';
  };

  const formatAgeMode = (mode: AgeMode): string => {
    if (mode === 'kids') return lang === 'bn' ? 'ছোটদের মোড' : 'Kids';
    if (mode === 'senior') return lang === 'bn' ? 'প্রবীণ মোড' : 'Senior';
    return lang === 'bn' ? 'স্ট্যান্ডার্ড' : 'Standard';
  };

  const familyRows: UnifiedRow[] = useMemo(() => {
    const ownerUid = authUser?.uid || 'local_family';
    const famLabel = authUser?.displayName
      ? `${authUser.displayName} Family`
      : lang === 'bn'
      ? 'আপনার পরিবার'
      : 'Your Family';

    return profiles.map((p) => ({
      key: `fam_${p.id}`,
      profileId: p.id,
      ownerId: ownerUid,
      displayName: p.name,
      familyLabel: famLabel,
      ageMode: p.ageMode,
      preferredTrack: p.preferredTrack,
      weeklyXp: p.weeklyXp ?? p.xp,
      totalXp: p.xp,
      streakDays: p.streakDays,
      masteredLettersCount: p.masteredLetters.length,
      isCurrentUserOwner: true,
      isActiveProfile: p.id === activeProfileId,
      shareOnGlobal:
        typeof p.shareOnGlobal === 'boolean' ? p.shareOnGlobal : p.ageMode !== 'kids',
    }));
  }, [profiles, activeProfileId, authUser, lang]);

  const globalRows: UnifiedRow[] = useMemo(() => {
    return globalEntries.map((entry) => {
      const owned = Boolean(authUser && entry.ownerId === authUser.uid);
      const localMatch = owned
        ? profiles.find((p) => p.id === entry.profileId)
        : undefined;
      return {
        key: `glob_${entry.entryId}`,
        profileId: entry.profileId,
        ownerId: entry.ownerId,
        displayName: entry.displayName,
        familyLabel: entry.familyLabel,
        ageMode: entry.ageMode,
        preferredTrack: entry.preferredTrack,
        weeklyXp: entry.publicWeeklyXp,
        totalXp: entry.totalXp,
        streakDays: entry.streakDays,
        masteredLettersCount: entry.masteredLettersCount,
        isCurrentUserOwner: owned,
        isActiveProfile: Boolean(owned && entry.profileId === activeProfileId),
        shareOnGlobal: localMatch
          ? typeof localMatch.shareOnGlobal === 'boolean'
            ? localMatch.shareOnGlobal
            : localMatch.ageMode !== 'kids'
          : true,
      };
    });
  }, [globalEntries, authUser, profiles, activeProfileId]);

  const rawRows = scope === 'family' ? familyRows : globalRows;

  const sortedRows = useMemo(() => {
    const copy = [...rawRows];
    copy.sort((a, b) => {
      if (sortBy === 'weeklyXp') {
        if (b.weeklyXp !== a.weeklyXp) return b.weeklyXp - a.weeklyXp;
        return b.streakDays - a.streakDays;
      }
      if (b.streakDays !== a.streakDays) return b.streakDays - a.streakDays;
      return b.weeklyXp - a.weeklyXp;
    });
    return copy;
  }, [rawRows, sortBy]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedRows;
    return sortedRows.filter(
      (r) =>
        r.displayName.toLowerCase().includes(q) ||
        r.familyLabel.toLowerCase().includes(q)
    );
  }, [sortedRows, searchQuery]);

  const maxWeeklyXp = useMemo(() => {
    const top = sortedRows.reduce((acc, r) => Math.max(acc, r.weeklyXp), 0);
    return Math.max(50, top);
  }, [sortedRows]);

  // Compute competitive standing summary for active profile
  const activeRankIndex = sortedRows.findIndex((r) => r.isActiveProfile);
  const activeRow = activeRankIndex >= 0 ? sortedRows[activeRankIndex] : null;
  const challengerAbove =
    activeRankIndex > 0 ? sortedRows[activeRankIndex - 1] : null;

  const standingSummaryText = useMemo(() => {
    if (!activeRow) {
      if (scope === 'global' && authUser) {
        return lang === 'bn'
          ? 'বর্তমান প্রোফাইলটি শুধু পরিবার মোডে আছে · গ্লোবাল র‍্যাঙ্কিংয়ে যুক্ত করতে নিচে দৃশ্যমানতা চালু করুন'
          : 'Active profile is set to Family Only · Enable global sharing below to appear on the Global Leaderboard';
      }
      return '';
    }
    const rankNum = activeRankIndex + 1;
    if (rankNum === 1) {
      const runnerUp = sortedRows.length > 1 ? sortedRows[1] : null;
      const leadXp = runnerUp ? Math.max(0, activeRow.weeklyXp - runnerUp.weeklyXp) : 0;
      return lang === 'bn'
        ? `র‍্যাঙ্ক #১ (${sortedRows.length} জনের মধ্যে) · ${activeRow.displayName} সাপ্তাহিক +${leadXp} XP ব্যবধানে এগিয়ে আছেন`
        : `Rank #1 of ${sortedRows.length} · ${activeRow.displayName} leads this week by +${leadXp} XP`;
    }
    if (challengerAbove) {
      const xpGap = Math.max(1, challengerAbove.weeklyXp - activeRow.weeklyXp + 5);
      return lang === 'bn'
        ? `র‍্যাঙ্ক #${rankNum} (${sortedRows.length} জনের মধ্যে) · ${challengerAbove.displayName}-কে ছাড়িয়ে যেতে আর +${xpGap} XP প্রয়োজন`
        : `Rank #${rankNum} of ${sortedRows.length} · Earn +${xpGap} XP to overtake ${challengerAbove.displayName}`;
    }
    return '';
  }, [activeRow, activeRankIndex, challengerAbove, sortedRows, scope, authUser, lang]);

  const activeLocalProfile = profiles.find((p) => p.id === activeProfileId);
  const activeLocalSharesGlobal = activeLocalProfile
    ? typeof activeLocalProfile.shareOnGlobal === 'boolean'
      ? activeLocalProfile.shareOnGlobal
      : activeLocalProfile.ageMode !== 'kids'
    : true;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5">
      {/* Header Row: Title, Standing Summary, and Family / Global Segmented Toggle */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs text-slate-500 font-mono-num">
            {authUser
              ? `${t.cloudSyncedLabel} · ${authUser.displayName || authUser.email}`
              : t.localModeLabel}
            {isSyncingCloud
              ? lang === 'bn'
                ? ' · সিঙ্ক হচ্ছে...'
                : ' · Syncing...'
              : ''}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isSenior
              ? lang === 'bn'
                ? 'পারিবারিক ও গ্লোবাল অনুশীলনের অগ্রগতি'
                : 'Family & Global Study Progress'
              : t.leaderboardTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            {standingSummaryText || t.leaderboardSubtitle}
          </p>
        </div>

        {/* Interactive Scope Switcher: Family Unit vs Global Community */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 shrink-0">
          <button
            type="button"
            onClick={() => setScope('family')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              scope === 'family'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t.tabFamilyUnit}
          </button>
          <button
            type="button"
            onClick={() => setScope('global')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              scope === 'global'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {t.tabGlobalCommunity}
          </button>
        </div>
      </div>

      {/* Filter, Sort & Cloud Account Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[220px]">
          <div className="relative flex-1 max-w-xs min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              maxLength={BLUEPRINT_LIMITS.LEARNER_NAME_MAX_LEN}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchLearnersPlaceholder}
              aria-label={t.searchLearnersPlaceholder}
              className="w-full min-h-[40px] pl-9 pr-8 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs text-slate-900 outline-none focus:border-emerald-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear filter"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Metric Segmented Control */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100">
            <button
              type="button"
              onClick={() => setSortBy('weeklyXp')}
              className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                sortBy === 'weeklyXp'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.sortWeeklyXp}
            </button>
            <button
              type="button"
              onClick={() => setSortBy('streakDays')}
              className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                sortBy === 'streakDays'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.sortStreakDays}
            </button>
          </div>
        </div>

        {/* Cloud Account Persistence Control */}
        <div className="flex items-center gap-2 shrink-0">
          {authReady && !authUser && (
            <button
              type="button"
              onClick={onSignInGoogle}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t.signInWithGoogle}
            </button>
          )}

          {authReady && authUser && scope === 'global' && activeLocalProfile && (
            <button
              type="button"
              onClick={() => onToggleShareGlobal(activeLocalProfile.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-700" />
              {activeLocalSharesGlobal ? t.shareGlobalToggleOn : t.shareGlobalToggleOff}
            </button>
          )}

          {authReady && authUser && (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-600 whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.signOutLabel}
            </button>
          )}
        </div>
      </div>

      {/* State 1: Signed-Out Prompt when inspecting Global Community */}
      {scope === 'global' && authReady && !authUser ? (
        <div className="py-8 text-center space-y-3">
          <Globe className="w-8 h-8 text-emerald-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            {lang === 'bn'
              ? 'ক্লাউড অ্যাকাউন্ট সংযুক্ত করে গ্লোবাল লিডারবোর্ডে অংশ নিন'
              : 'Connect Your Google Account to Join the Live Global Leaderboard'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {lang === 'bn'
              ? 'সাইন ইন করলে আপনার পরিবারের প্রতিটি প্রোফাইলের হরফ আয়ত্ত, SRS রিভিউ, স্ট্রিক ও সাপ্তাহিক XP নিরাপদে ক্লাউডে সংরক্ষিত থাকবে এবং গ্লোবাল র‍্যাঙ্কিংয়ে যুক্ত হবে।'
              : 'Signing in creates persistent cloud storage for every learner profile in your family and syncs opt-in weekly XP and streaks to the Global Community.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onSignInGoogle}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              {t.signInWithGoogle}
            </button>
            <button
              type="button"
              onClick={() => setScope('family')}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap"
            >
              {lang === 'bn' ? 'পরিবার লিডারবোর্ড দেখুন' : 'Back to Family Leaderboard'}
            </button>
          </div>
        </div>
      ) : scope === 'global' && isLoadingGlobal ? (
        /* State 2: Skeleton Loading Rows matching table geometry */
        <div className="divide-y divide-slate-100" aria-busy="true">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="h-16 flex items-center justify-between gap-4 py-3 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-5 rounded bg-slate-200" />
                <div className="space-y-2">
                  <div className="w-36 h-4 rounded bg-slate-200" />
                  <div className="w-48 h-3 rounded bg-slate-100" />
                </div>
              </div>
              <div className="w-24 h-5 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : filteredRows.length === 0 ? (
        /* State 3: Empty State */
        <div className="py-8 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-800">
            {searchQuery
              ? lang === 'bn'
                ? 'এই নামে কোনো শিক্ষার্থী পাওয়া যায়নি।'
                : 'No learners match your filter.'
              : lang === 'bn'
              ? 'এখনো কোনো পাবলিক গ্লোবাল প্রোফাইল প্রকাশিত হয়নি।'
              : 'No public profiles are visible on the Global Leaderboard yet.'}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              {lang === 'bn' ? 'ফিল্টার মুছুন' : 'Reset Filter'}
            </button>
          ) : (
            activeLocalProfile &&
            !activeLocalSharesGlobal && (
              <button
                type="button"
                onClick={() => onToggleShareGlobal(activeLocalProfile.id)}
                className="px-4 py-2 min-h-[40px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
              >
                {lang === 'bn'
                  ? `${activeLocalProfile.name}-কে গ্লোবালে যুক্ত করুন`
                  : `Share ${activeLocalProfile.name} on Global Leaderboard`}
              </button>
            )
          )}
        </div>
      ) : (
        /* State 4: Populated High-Density Leaderboard Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-3 w-14">
                  {lang === 'bn' ? 'স্থান' : 'Rank'}
                </th>
                <th className="py-2.5 px-3">
                  {lang === 'bn' ? 'শিক্ষার্থী ও ট্র্যাক' : 'Learner & Track'}
                </th>
                <th className="py-2.5 px-3 hidden sm:table-cell w-48">
                  {lang === 'bn' ? 'সাপ্তাহিক অগ্রগতি' : 'Weekly Pace'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {t.sortWeeklyXp}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {t.sortStreakDays}
                </th>
                <th className="py-2.5 pl-3 text-right">
                  {lang === 'bn' ? 'অ্যাকশন' : 'Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => {
                const trueRank = sortedRows.findIndex((r) => r.key === row.key) + 1;
                const xpRatio = Math.max(0.04, Math.min(1, row.weeklyXp / maxWeeklyXp));
                const rankColorClass =
                  trueRank === 1
                    ? 'text-amber-600'
                    : trueRank === 2
                    ? 'text-slate-700'
                    : trueRank === 3
                    ? 'text-amber-800'
                    : 'text-slate-500';

                return (
                  <tr
                    key={row.key}
                    className={`transition-colors ${
                      row.isActiveProfile
                        ? 'bg-emerald-50/50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 pr-3 align-middle">
                      <div className={`inline-flex items-center gap-1 font-mono-num font-bold text-sm ${rankColorClass}`}>
                        {trueRank === 1 && <Trophy className="w-4 h-4 text-amber-500 shrink-0" />}
                        <span>#{trueRank}</span>
                      </div>
                    </td>

                    {/* Learner Name & Unboxed Metadata */}
                    <td className="py-3.5 px-3 align-middle">
                      <div className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{row.displayName}</span>
                        {row.isActiveProfile && (
                          <span className="text-xs font-medium text-emerald-700">
                            · {lang === 'bn' ? 'সক্রিয়' : 'You'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono-num mt-0.5">
                        {scope === 'global' ? `${row.familyLabel} · ` : ''}
                        {formatAgeMode(row.ageMode)} · {formatTrackName(row.preferredTrack)} ·{' '}
                        {row.masteredLettersCount}/28 {lang === 'bn' ? 'হরফ' : 'Letters'}
                      </p>
                    </td>

                    {/* Compositor-Only Weekly XP Pace Bar */}
                    <td className="py-3.5 px-3 align-middle hidden sm:table-cell">
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-transform duration-300 origin-left ${
                            row.isActiveProfile ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                          style={{
                            width: '100%',
                            transform: `scaleX(${xpRatio})`,
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono-num mt-1">
                        {lang === 'bn' ? `মোট ${row.totalXp} XP` : `${row.totalXp} total XP`}
                      </p>
                    </td>

                    {/* Weekly XP Gain */}
                    <td className="py-3.5 px-3 align-middle text-right font-mono-num">
                      <span className="text-sm font-bold text-slate-900">
                        +{row.weeklyXp}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">XP</span>
                    </td>

                    {/* Streak Days */}
                    <td className="py-3.5 px-3 align-middle text-right font-mono-num">
                      <span className="text-sm font-semibold text-slate-800">
                        {row.streakDays}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        {lang === 'bn' ? 'দিন' : 'd'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 pl-3 align-middle text-right">
                      {row.isActiveProfile ? (
                        <button
                          type="button"
                          onClick={onStartPractice}
                          className="px-3 py-1.5 min-h-[36px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          {lang === 'bn' ? '+XP অর্জন →' : 'Earn XP →'}
                        </button>
                      ) : scope === 'family' ? (
                        <button
                          type="button"
                          onClick={() => onSelectProfile(row.profileId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                          {lang === 'bn' ? 'প্রোফাইল নির্বাচন' : 'Switch'}
                        </button>
                      ) : row.isCurrentUserOwner ? (
                        <button
                          type="button"
                          onClick={() => onSelectProfile(row.profileId)}
                          className="px-3 py-1.5 min-h-[36px] rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 whitespace-nowrap"
                        >
                          {lang === 'bn' ? 'প্রোফাইলে যান' : 'Switch'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono-num">
                          {lang === 'bn' ? 'গ্লোবাল' : 'Verified'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Row: Family Unit Quick Action & Privacy Note */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          {lang === 'bn'
            ? 'প্রতিটি হরফ আয়ত্ত, তাজবীদ ও কথোপকথন অনুশীলনে তাৎক্ষণিক সাপ্তাহিক XP যুক্ত হয়।'
            : 'Completing alphabet strokes, Quranic SRS cards, or spoken drills immediately boosts Weekly XP.'}
        </span>
        <button
          type="button"
          onClick={onJumpToAddProfile}
          className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline whitespace-nowrap"
        >
          {lang === 'bn' ? '+ পরিবারে নতুন সদস্য যোগ করুন' : '+ Add Family Member'}
        </button>
      </div>
    </section>
  );
};
