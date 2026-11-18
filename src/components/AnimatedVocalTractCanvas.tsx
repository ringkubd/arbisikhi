import React, {useEffect, useState} from 'react';
import type {ArabicLetter, ArticulationZone, Language} from '../types';

interface AnimatedVocalTractCanvasProps {
  letter: ArabicLetter;
  lang: Language;
  isPlaying: boolean;
}

interface ZoneCoord {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  labelBn: string;
  labelEn: string;
}

const ZONE_MAP: Record<ArticulationZone, ZoneCoord> = {
  jawf: {cx: 182, cy: 138, rx: 46, ry: 24, labelBn: 'আল-জাওফ (খালি মুখগহ্বর)', labelEn: 'Al-Jawf (Open Cavity)'},
  throat_deep: {cx: 242, cy: 238, rx: 20, ry: 16, labelBn: 'গভীর কণ্ঠনালী (বুকের কাছে)', labelEn: 'Deep Throat (Glottis)'},
  throat_mid: {cx: 240, cy: 198, rx: 20, ry: 16, labelBn: 'মধ্য কণ্ঠনালী (ওয়াসাতুল হালক)', labelEn: 'Mid Throat (Pharynx)'},
  throat_upper: {cx: 228, cy: 162, rx: 22, ry: 16, labelBn: 'উচ্চ কণ্ঠনালী (আদনাল হালক)', labelEn: 'Upper Throat (Uvula)'},
  tongue_back: {cx: 202, cy: 142, rx: 24, ry: 16, labelBn: 'জিহ্বার গোড়া ও নরম তালু', labelEn: 'Back Tongue & Soft Palate'},
  tongue_mid: {cx: 166, cy: 132, rx: 26, ry: 15, labelBn: 'জিহ্বার মাঝখান ও শক্ত তালু', labelEn: 'Mid Tongue & Hard Palate'},
  tongue_edge: {cx: 148, cy: 146, rx: 26, ry: 14, labelBn: 'জিহ্বার কিনারা ও মাড়ির দাঁত', labelEn: 'Tongue Sides & Molars'},
  tongue_tip: {cx: 118, cy: 142, rx: 20, ry: 14, labelBn: 'জিহ্বার আগা ও সামনের দাঁত/মাড়ি', labelEn: 'Tongue Tip & Front Teeth'},
  lips: {cx: 88, cy: 146, rx: 18, ry: 16, labelBn: 'দুই ঠোঁট (আশ-শাফাতান)', labelEn: 'Both Lips (Ash-Shafatan)'},
  khayshum: {cx: 156, cy: 92, rx: 34, ry: 15, labelBn: 'আল-খাইশূম (নাসিক্য গুন্নাহ)', labelEn: 'Al-Khayshum (Nasal Cavity)'},
};

export const AnimatedVocalTractCanvas: React.FC<AnimatedVocalTractCanvasProps> = ({
  letter,
  lang,
  isPlaying,
}) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => (t + 1) % 100);
    }, 55);
    return () => window.clearInterval(id);
  }, []);

  const focal = ZONE_MAP[letter.zone];
  const showNasalFlow = letter.zone === 'khayshum' || Boolean(letter.hasGhunnah);

  // Airflow particle progress along vocal pathway
  const airPoints: Array<[number, number]> = [
    [242, 258],
    [242, 222],
    [236, 186],
    [216, 154],
    [182, 140],
    [142, 142],
    [102, 145],
    [68, 146],
  ];

  const nasalPoints: Array<[number, number]> = [
    [216, 150],
    [194, 114],
    [160, 92],
    [120, 96],
    [82, 108],
  ];

  const getInterpolatedPoint = (pts: Array<[number, number]>, progress: number): [number, number] => {
    const scaled = progress * (pts.length - 1);
    const idx = Math.floor(scaled);
    const frac = scaled - idx;
    const p1 = pts[Math.min(idx, pts.length - 1)];
    const p2 = pts[Math.min(idx + 1, pts.length - 1)];
    return [p1[0] + (p2[0] - p1[0]) * frac, p1[1] + (p2[1] - p1[1]) * frac];
  };

  const pA = getInterpolatedPoint(airPoints, (tick % 50) / 50);
  const pB = getInterpolatedPoint(airPoints, ((tick + 25) % 50) / 50);
  const pNasal = getInterpolatedPoint(nasalPoints, (tick % 40) / 40);

  const waveHeights = [0, 1, 2, 3, 4, 5, 6].map((barIdx) => {
    const base = isPlaying ? 22 : 9;
    const amp = isPlaying ? 16 : 5;
    return Math.round(base + Math.sin((tick * 0.28) + barIdx * 0.9) * amp);
  });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <p className="text-xs text-slate-400">
            {lang === 'bn' ? 'সাগিটাল ভোকাল ট্র্যাক্ট সিমুলেশন' : 'Sagittal Vocal Tract Diagram'} ·{' '}
            {letter.isHeavy
              ? lang === 'bn'
                ? 'মোটা হরফ (তাফখীম)'
                : 'Heavy Resonance (Tafkheem)'
              : lang === 'bn'
              ? 'পাতলা হরফ (তারকীক)'
              : 'Light Resonance (Tarqeeq)'}
          </p>
          <h4 className="text-base font-semibold text-white mt-0.5">
            {focal ? (lang === 'bn' ? focal.labelBn : focal.labelEn) : letter.zoneTitle[lang]}
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className="font-arabic text-4xl text-amber-400 leading-none">{letter.isolated}</span>
        </div>
      </div>

      <div className="relative my-3 flex items-center justify-center">
        <svg
          viewBox="0 0 320 280"
          className="w-full max-w-[340px] h-auto select-none"
          role="img"
          aria-label={lang === 'bn' ? 'মাখরাজ উচ্চারণ চিত্র' : 'Makharij articulation cross-section'}
        >
          {/* Subtle coordinate grid */}
          <defs>
            <radialGradient id="makhrajGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={letter.isHeavy ? '#f59e0b' : '#10b981'} stopOpacity="0.65" />
              <stop offset="100%" stopColor={letter.isHeavy ? '#f59e0b' : '#10b981'} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer head & profile silhouette (facing left) */}
          <path
            d="M195 28 C135 28, 96 58, 92 92 L68 116 C64 120, 68 126, 78 128 L84 136 C76 142, 76 150, 86 154 L82 164 C78 172, 84 184, 98 188 L128 194 C156 198, 174 222, 176 265 L272 265 C272 212, 286 168, 284 112 C282 58, 246 28, 195 28 Z"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Nasal Cavity (Al-Khayshum) */}
          <path
            d="M84 118 C118 92, 165 82, 206 104 C216 112, 218 128, 208 134 C180 116, 134 114, 96 124 Z"
            fill={showNasalFlow ? 'rgba(16, 185, 129, 0.25)' : '#1e293b'}
            stroke={showNasalFlow ? '#34d399' : '#475569'}
            strokeWidth="1.5"
          />

          {/* Hard & Soft Palate Roof + Pharynx Tube */}
          <path
            d="M94 134 C122 118, 176 114, 214 136 C234 150, 254 186, 254 262 L228 262 C228 198, 218 168, 198 156"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="2"
          />

          {/* Upper & Lower Front Teeth */}
          <rect x="98" y="132" width="7" height="11" rx="2" fill="#f8fafc" />
          <rect x="98" y="151" width="7" height="10" rx="2" fill="#f8fafc" />

          {/* Dynamic Tongue Contour (Elevates back of tongue on Tafkheem heavy letters!) */}
          <path
            d={
              letter.isHeavy
                ? 'M106 156 C126 144, 164 126, 202 132 C218 136, 224 166, 216 196 C188 196, 138 186, 106 156 Z'
                : letter.zone === 'tongue_tip'
                ? 'M103 141 C128 140, 166 142, 198 148 C216 154, 220 176, 214 196 C186 196, 136 184, 103 141 Z'
                : letter.zone === 'tongue_mid'
                ? 'M108 154 C132 136, 168 126, 198 146 C216 156, 220 176, 214 196 C186 196, 136 184, 108 154 Z'
                : 'M108 154 C132 146, 168 142, 198 150 C216 158, 220 178, 214 196 C186 196, 136 184, 108 154 Z'
            }
            fill="#be123c"
            fillOpacity="0.65"
            stroke="#fb7185"
            strokeWidth="2"
          />

          {/* Airflow dashed guide line */}
          <polyline
            points={airPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
            fill="none"
            stroke="#38bdf8"
            strokeOpacity="0.45"
            strokeWidth="1.75"
            strokeDasharray="4 4"
          />

          {showNasalFlow && (
            <polyline
              points={nasalPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
              fill="none"
              stroke="#34d399"
              strokeOpacity="0.65"
              strokeWidth="1.75"
              strokeDasharray="3 3"
            />
          )}

          {/* Moving breath particles */}
          <circle cx={pA[0]} cy={pA[1]} r="3.5" fill="#38bdf8" />
          <circle cx={pB[0]} cy={pB[1]} r="3" fill="#7dd3fc" />
          {showNasalFlow && <circle cx={pNasal[0]} cy={pNasal[1]} r="3.5" fill="#34d399" />}

          {/* Active Makhraj Focal Highlight */}
          {focal && (
            <g>
              <ellipse
                cx={focal.cx}
                cy={focal.cy}
                rx={focal.rx + 12}
                ry={focal.ry + 12}
                fill="url(#makhrajGlow)"
              />
              <ellipse
                cx={focal.cx}
                cy={focal.cy}
                rx={focal.rx}
                ry={focal.ry}
                fill="none"
                stroke={letter.isHeavy ? '#fbbf24' : '#34d399'}
                strokeWidth="2.5"
              />
              <circle
                cx={focal.cx}
                cy={focal.cy}
                r="4.5"
                fill={letter.isHeavy ? '#fbbf24' : '#34d399'}
              />
            </g>
          )}

          {/* Clean Callout Labels inside SVG */}
          <text x="16" y="106" fill="#94a3b8" fontSize="10" fontWeight="500">
            {lang === 'bn' ? 'নাসিকা' : 'Nasal'}
          </text>
          <text x="16" y="150" fill="#e2e8f0" fontSize="10" fontWeight="600">
            {lang === 'bn' ? 'ঠোঁট' : 'Lips'}
          </text>
          <text x="258" y="202" fill="#94a3b8" fontSize="10" fontWeight="500">
            {lang === 'bn' ? 'কণ্ঠনালী' : 'Throat'}
          </text>
        </svg>
      </div>

      {/* Harmonic Tajweed Resonance Wave Bars & Trait Summary */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-end gap-1.5 h-9" aria-hidden="true">
          {waveHeights.map((h, i) => (
            <div
              key={i}
              className={`w-2 rounded-sm transition-transform duration-75 ${
                letter.isHeavy ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{height: `${Math.max(6, Math.min(34, h))}px`}}
            />
          ))}
        </div>
        <div className="text-xs text-slate-300 text-right">
          <span>{letter.sound[lang]}</span>
          {letter.hasQalqalah && (
            <span> · {lang === 'bn' ? 'ক্বালক্বালাহ প্রতিধ্বনি' : 'Qalqalah Echo'}</span>
          )}
          {letter.hasGhunnah && (
            <span> · {lang === 'bn' ? '২ আলিফ গুন্নাহ' : '2-Beat Ghunnah'}</span>
          )}
        </div>
      </div>
    </div>
  );
};
