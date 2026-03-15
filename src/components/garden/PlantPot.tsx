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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-green-50/50 transition-colors"
    >
      <div className="relative">
        <PlantSVG
          stage={plantState.stage}
          growthPoints={plantState.growthPoints}
          color={habit.color}
          size={100}
        />
        {streak > 0 && (
          <div className="absolute -top-1 -right-1">
            <StreakBadge streak={streak} />
          </div>
        )}
      </div>
      <span className="text-lg">{habit.emoji}</span>
      <p className="text-xs font-medium text-gray-700 truncate max-w-[100px]">
        {habit.name}
      </p>
      <p className="text-[10px] text-gray-400">
        {STAGE_NAMES[plantState.stage]}
      </p>
    </motion.button>
  );
}
