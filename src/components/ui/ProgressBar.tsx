'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="mb-4">
      {label && (
        <div className="flex justify-between mb-2 text-[13px] font-bold text-gray-400">
          <span>{label}</span>
          <span>
            {current}/{total}
          </span>
        </div>
      )}
      <div className="h-3.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #58CC02 0%, #78E100 100%)',
          }}
        />
      </div>
    </div>
  );
}
