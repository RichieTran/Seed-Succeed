import { motion } from 'framer-motion';
import type { Habit } from '../../types';
import { PLANT_COLORS } from '../../constants/plants';
import { useHabits } from '../../context/HabitContext';
import { CompletionButton } from './CompletionButton';
import { StreakBadge } from './StreakBadge';

interface HabitCardProps {
  habit: Habit;
  onTap?: () => void;
}

export function HabitCard({ habit, onTap }: HabitCardProps) {
  const { isCompletedToday, toggleCompletion, getStreakInfo, getPlantState } = useHabits();
  const completed = isCompletedToday(habit.id);
  const streakInfo = getStreakInfo(habit.id);
  const plantState = getPlantState(habit.id);
  const colors = PLANT_COLORS[habit.color];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        completed
          ? 'bg-gray-50/50 border-gray-100'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <CompletionButton
        completed={completed}
        onToggle={() => toggleCompletion(habit.id)}
        color={colors.primary}
      />

      <button
        onClick={onTap}
        className="flex-1 flex items-center gap-3 text-left min-w-0"
      >
        <span className="text-2xl">{habit.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {habit.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              <span className="text-xs text-gray-400">
                {plantState.growthPoints.toFixed(0)} pts
              </span>
            </div>
            <StreakBadge streak={streakInfo.current} />
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </motion.div>
  );
}
