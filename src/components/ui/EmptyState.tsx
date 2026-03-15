import { motion } from 'framer-motion';

interface EmptyStateProps {
  onAddHabit: () => void;
}

export function EmptyState({ onAddHabit }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="text-6xl mb-6"
      >
        🌱
      </motion.div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Your garden awaits!</h2>
      <p className="text-gray-500 mb-8 max-w-xs">
        Plant your first habit and watch it grow as you build consistency. Each completion helps your plant thrive!
      </p>
      <button
        onClick={onAddHabit}
        className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
      >
        Plant Your First Habit
      </button>
    </motion.div>
  );
}
