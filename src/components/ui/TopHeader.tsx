'use client';

interface TopHeaderProps {
  streak?: number;
  gems?: number;
  showStreak?: boolean;
  title?: string;
  onBack?: () => void;
}

export default function TopHeader({
  streak = 0,
  gems = 0,
  showStreak = true,
  title,
  onBack,
}: TopHeaderProps) {
  return (
    <div className="bg-background-dark py-3 px-5 flex justify-between items-center">
      <div className="flex items-center gap-5">
        {onBack && (
          <button
            onClick={onBack}
            className="text-white text-sm font-bold flex items-center gap-1"
          >
            ← {title ? '' : '뒤로'}
          </button>
        )}
        {title && (
          <span className="text-white text-lg font-extrabold">{title}</span>
        )}
        {showStreak && !title && (
          <div className="flex items-center gap-1.5 text-streak font-extrabold text-[17px]">
            <span className="text-[22px]">🔥</span>
            {streak}
          </div>
        )}
      </div>
      {showStreak && !title && (
        <div className="flex items-center gap-1.5 text-secondary font-extrabold text-[17px]">
          <span className="text-[22px]">💎</span>
          {gems}
        </div>
      )}
    </div>
  );
}
