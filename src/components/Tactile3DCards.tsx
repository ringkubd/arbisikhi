import React from 'react';

interface ThreeDPressableCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  tone?: 'neutral' | 'emerald' | 'amber';
  className?: string;
  ariaLabel?: string;
}

export const ThreeDPressableCard: React.FC<ThreeDPressableCardProps> = ({
  children,
  onClick,
  active = false,
  tone = 'neutral',
  className = '',
  ariaLabel,
}) => {
  const toneClasses =
    tone === 'emerald' || active
      ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-600 text-slate-900 dark:text-slate-100 shadow-[0_4px_0_0_#047857]'
      : tone === 'amber'
      ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 text-slate-900 dark:text-slate-100 shadow-[0_4px_0_0_#d97706]'
      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-[0_4px_0_0_#cbd5e1] dark:shadow-[0_4px_0_0_#334155]';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={`group relative w-full text-left rounded-2xl border transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 min-h-[48px] ${toneClasses} ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={`relative rounded-2xl border ${toneClasses} ${className}`}>
      {children}
    </div>
  );
};

interface ThreeDFlipCardProps {
  isFlipped: boolean;
  onToggle: () => void;
  front: React.ReactNode;
  back: React.ReactNode;
  heightClass?: string;
}

export const ThreeDFlipCard: React.FC<ThreeDFlipCardProps> = ({
  isFlipped,
  onToggle,
  front,
  back,
  heightClass = 'h-72',
}) => {
  return (
    <div className={`w-full perspective-1000 ${heightClass}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-full h-full text-left transition-transform duration-300 preserve-3d cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 rounded-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-[0_5px_0_0_#cbd5e1] dark:shadow-[0_5px_0_0_#334155] p-6 flex flex-col justify-between">
          {front}
        </div>
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl border border-emerald-600 bg-emerald-50/95 dark:bg-slate-900 shadow-[0_5px_0_0_#047857] p-6 flex flex-col justify-between">
          {back}
        </div>
      </button>
    </div>
  );
};
