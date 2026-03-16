import { motion } from 'framer-motion';
import type { Habit, PlantState } from '../../types';
import { PlantSVG } from '../plant/PlantSVG';
import { STAGE_NAMES } from '../../constants/plants';
import { StreakBadge } from '../habit/StreakBadge';

interface PlantPotProps {
  habit: Habit;
  plantState: PlantState;
  streak: number;
  onClick: () => void;
  index: number;
}

export function PlantPot({ habit, plantState, streak, onClick, index }: PlantPotProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', bounce: 0.3 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all w-[160px]"
    >
      <div className="relative">
        <PlantSVG
          stage={plantState.stage}
          growthPoints={plantState.growthPoints}
          color={habit.color}
          size={110}
        />
        {streak > 0 && (
          <div className="absolute top-[6px] -right-2">
            <StreakBadge streak={streak} />
          </div>
        )}
      </div>
      <span className="text-xl mt-1">{habit.emoji}</span>
      <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
        {habit.name}
      </p>
      <p className="text-[11px] text-gray-400">
        {STAGE_NAMES[plantState.stage]}
      </p>
    </motion.button>
  );
}
