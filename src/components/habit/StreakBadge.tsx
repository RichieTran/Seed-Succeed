import { motion } from 'framer-motion';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  const isHot = streak >= 7;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isHot
          ? 'bg-orange-100 text-orange-600'
          : 'bg-amber-50 text-amber-600'
      }`}
    >
      <span className={isHot ? 'animate-pulse' : ''}>
        {streak >= 30 ? '🔥' : streak >= 7 ? '🔥' : '⚡'}
      </span>
      <span>{streak}</span>
    </motion.div>
  );
}
