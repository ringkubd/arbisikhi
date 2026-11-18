import React, {useState} from 'react';
import {X, Copy, Check} from 'lucide-react';
import type {Language} from '../types';

interface AndroidBlueprintModalProps {
  open: boolean;
  onClose: () => void;
  lang: Language;
}

const KOTLIN_COMPOSE_SNIPPET = `// :core:designsystem — Adaptive Age-Mode & RTL 3D Tactile Surface (Jetpack Compose)
@Composable
fun ArbiSikkhiTheme(
    ageMode: AgeMode, // KIDS_3_12, STANDARD_13_50, SENIOR_51_90
    uiLang: AppLang,  // BANGLA, ENGLISH
    content: @Composable () -> Unit
) {
    val fontScale = when (ageMode) {
        AgeMode.KIDS_3_12 -> 1.10f
        AgeMode.STANDARD_13_50 -> 1.00f
        AgeMode.SENIOR_51_90 -> 1.24f // High-contrast clutter-free scale
    }
    CompositionLocalProvider(LocalDensity provides Density(LocalDensity.current.density, fontScale)) {
        MaterialTheme(colorScheme = EmeraldLightScheme, content = content)
    }
}

// :core:database — Decoupled Offline-First Room SQLite Schema + FSRS/SM-2
@Entity(tableName = "curriculum_items")
data class CurriculumItemEntity(
    @PrimaryKey val itemId: String,
    val track: String,           // QURAN | MSA | GULF
    val arabicVowelled: String,  // بِسْمِ اللَّهِ
    val arabicPlain: String,     // بسم الله
    val rootTriplet: String?,    // س-م-و
    val makhrajZone: String      // LIPS | THROAT_MID | KHAYSHUM ...
)

@Entity(tableName = "translations", primaryKeys = ["itemId", "langCode"])
data class ItemTranslationEntity(
    val itemId: String,
    val langCode: String, // "bn", "en", "ur", "id" (Zero-code-change packs!)
    val meaning: String,
    val mouthPlacementGuide: String,
    val mistakeWarning: String
)`;

export const AndroidBlueprintModal: React.FC<AndroidBlueprintModalProps> = ({
  open,
  onClose,
  lang,
}) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(KOTLIN_COMPOSE_SNIPPET);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500">
              Kotlin + Jetpack Compose · Clean Architecture + MVI · Offline-First APK (&lt;40 MB)
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {lang === 'bn'
                ? 'Arbi Sikkhi — নেটিভ অ্যান্ড্রয়েড সিস্টেম আর্কিটেকচার ও রোডম্যাপ'
                : 'Arbi Sikkhi — Native Android System Architecture & 24-Week Plan'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              01. Gradle Multi-Module Graph
            </h3>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li><strong>:app</strong> — Hilt DI, Navigation, Age-Mode Host</li>
              <li><strong>:core:designsystem</strong> — Kids/Standard/Senior themes, RTL Compose helpers</li>
              <li><strong>:core:database</strong> — Room SQLite, decoupled translations_bn/en, SM-2 SRS</li>
              <li><strong>:core:audio</strong> — Media3 ExoPlayer (0.5x–1.5x speed, A-B loop, Opus caching)</li>
              <li><strong>:feature:writing</strong> — Compose Canvas Bezier RTL stroke validator</li>
              <li><strong>:feature:speaking</strong> — Mic PCM capture + Gemini pronunciation coaching</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              02. 24-Week Execution Milestones
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>
                <strong className="text-slate-900 dark:text-white">Phase 1 (Weeks 1–8 · MVP):</strong>{' '}
                Age-Mode Engine, Bangla/English i18n, Level 0 Alphabet + Makharij + Comet Writing, Offline SRS.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">Phase 2 (Weeks 9–16 · Depth & AI):</strong>{' '}
                3-Letter Root Explorer, Toggleable Harakat Reader, Saudi/Gulf Track, Pronunciation Scoring, Play Store v1.0.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">Phase 3 (Weeks 17–24 · #1 Scale):</strong>{' '}
                C1–C2 Unvowelled Literature, Live Roleplay Tutor, Family Plan (5 profiles), Urdu/Indonesian packs.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Kotlin + Jetpack Compose &amp; Room Reference Blueprint
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Kotlin'}
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 text-xs font-mono-num overflow-x-auto leading-relaxed">
            {KOTLIN_COMPOSE_SNIPPET}
          </pre>
        </div>
      </div>
    </div>
  );
};
