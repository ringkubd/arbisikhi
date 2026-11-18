import React, {useCallback, useEffect, useRef, useState} from 'react';
import {CheckCircle2, Eraser, Play} from 'lucide-react';
import type {ArabicLetter, Language} from '../types';

interface CometWritingCanvasProps {
  letter: ArabicLetter;
  lang: Language;
  isMastered: boolean;
  onMastered: (letterId: string) => void;
  clearLabel: string;
  replayLabel: string;
  masterLabel: string;
  alreadyMasteredLabel: string;
}

export const CometWritingCanvas: React.FC<CometWritingCanvasProps> = ({
  letter,
  lang,
  isMastered,
  onMastered,
  clearLabel,
  replayLabel,
  masterLabel,
  alreadyMasteredLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const userStrokesRef = useRef<Array<Array<[number, number]>>>([]);
  const isDrawingRef = useRef(false);
  const cometProgressRef = useRef(0);

  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [strokeCount, setStrokeCount] = useState(0);

  // Reset user strokes when letter changes
  useEffect(() => {
    userStrokesRef.current = [];
    cometProgressRef.current = 0;
    setAccuracy(null);
    setStrokeCount(0);
  }, [letter.id]);

  const computeAccuracy = useCallback(() => {
    const allUserPts = userStrokesRef.current.flat();
    if (allUserPts.length < 6) {
      setAccuracy(null);
      return;
    }
    const targetPts = letter.strokePoints;
    let covered = 0;
    for (const [tx, ty] of targetPts) {
      const minDist = allUserPts.reduce((best, [ux, uy]) => {
        const d = Math.hypot(ux - tx, uy - ty);
        return d < best ? d : best;
      }, Infinity);
      if (minDist < 0.16) {
        covered++;
      }
    }
    const score = Math.min(100, Math.round((covered / targetPts.length) * 100));
    setAccuracy(score);
    if (score >= 75 && !isMastered) {
      onMastered(letter.id);
    }
  }, [letter.id, letter.strokePoints, isMastered, onMastered]);

  useEffect(() => {
    let rafId = 0;
    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          // Ruled calligraphy baseline grid
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(20, h * 0.68);
          ctx.lineTo(w - 20, h * 0.68);
          ctx.moveTo(w * 0.5, 16);
          ctx.lineTo(w * 0.5, h - 16);
          ctx.stroke();
          ctx.setLineDash([]);

          // Subtle guide Arabic glyph centered for tracing reference
          ctx.save();
          ctx.font = `600 ${Math.round(h * 0.62)}px "Scheherazade New", serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(15, 23, 42, 0.11)';
          ctx.fillText(letter.isolated, w * 0.5, h * 0.54);
          ctx.restore();

          // Dashed RTL stroke guide path
          const pts = letter.strokePoints;
          if (pts.length > 1) {
            ctx.save();
            ctx.strokeStyle = 'rgba(5, 150, 105, 0.35)';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(pts[0][0] * w, pts[0][1] * h);
            for (let i = 1; i < pts.length; i++) {
              ctx.lineTo(pts[i][0] * w, pts[i][1] * h);
            }
            ctx.stroke();
            ctx.restore();

            // Glowing Comet Particle along RTL path
            cometProgressRef.current = (cometProgressRef.current + 0.008) % 1;
            const prog = cometProgressRef.current;
            const scaled = prog * (pts.length - 1);
            const idx = Math.floor(scaled);
            const frac = scaled - idx;
            const p1 = pts[Math.min(idx, pts.length - 1)];
            const p2 = pts[Math.min(idx + 1, pts.length - 1)];
            const cx = (p1[0] + (p2[0] - p1[0]) * frac) * w;
            const cy = (p1[1] + (p2[1] - p1[1]) * frac) * h;

            const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 18);
            grad.addColorStop(0, 'rgba(245, 158, 11, 0.95)');
            grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.45)');
            grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, 18, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Nuqta (dots) markers
          if (letter.dotPoints) {
            for (const [dx, dy] of letter.dotPoints) {
              ctx.fillStyle = 'rgba(217, 119, 6, 0.55)';
              ctx.beginPath();
              ctx.arc(dx * w, dy * h, 6, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Learner's drawn ink strokes
          ctx.save();
          ctx.strokeStyle = '#047857';
          ctx.lineWidth = 12;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          for (const stroke of userStrokesRef.current) {
            if (stroke.length === 1) {
              ctx.fillStyle = '#047857';
              ctx.beginPath();
              ctx.arc(stroke[0][0] * w, stroke[0][1] * h, 6, 0, Math.PI * 2);
              ctx.fill();
            } else if (stroke.length > 1) {
              ctx.beginPath();
              ctx.moveTo(stroke[0][0] * w, stroke[0][1] * h);
              for (let i = 1; i < stroke.length; i++) {
                ctx.lineTo(stroke[i][0] * w, stroke[i][1] * h);
              }
              ctx.stroke();
            }
          }
          ctx.restore();
        }
      }
      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [letter]);

  const getNormalizedCoords = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return [x, y];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getNormalizedCoords(e);
    userStrokesRef.current.push([pt]);
    setStrokeCount((c) => c + 1);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const pt = getNormalizedCoords(e);
    const currentStroke = userStrokesRef.current[userStrokesRef.current.length - 1];
    if (currentStroke) {
      currentStroke.push(pt);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    computeAccuracy();
  };

  const handleClear = () => {
    userStrokesRef.current = [];
    setAccuracy(null);
    setStrokeCount(0);
  };

  const handleReplayComet = () => {
    cometProgressRef.current = 0;
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn'
              ? 'উজ্জ্বল সোনালি বিন্দু অনুসরণ করে ডান থেকে বামে আঙুল বা মাউস ঘুরান'
              : 'Trace the glowing gold comet from right to left'}
          </p>
        </div>
        <div className="text-xs font-mono-num font-semibold text-slate-700 dark:text-slate-200 shrink-0">
          {accuracy !== null ? (
            <span className={accuracy >= 70 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600'}>
              {lang === 'bn' ? `নির্ভুলতা: ${accuracy}%` : `Accuracy: ${accuracy}%`}
            </span>
          ) : (
            <span className="text-slate-400">
              {strokeCount === 0
                ? lang === 'bn'
                  ? 'এখানে লিখুন'
                  : 'Ready to trace'
                : lang === 'bn'
                ? 'লিখছেন...'
                : 'Tracing...'}
            </span>
          )}
        </div>
      </div>

      <div className="my-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={420}
          height={250}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-[230px] touch-none cursor-crosshair block"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Eraser className="w-4 h-4" />
            {clearLabel}
          </button>
          <button
            type="button"
            onClick={handleReplayComet}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            {replayLabel}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onMastered(letter.id)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            isMastered
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {isMastered ? alreadyMasteredLabel : masterLabel}
        </button>
      </div>
    </div>
  );
};
