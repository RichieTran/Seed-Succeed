import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../context/HabitContext';
import { GardenGrid } from '../components/garden/GardenGrid';
import { HabitForm } from '../components/habit/HabitForm';
import { EmptyState } from '../components/ui/EmptyState';

interface GardenViewProps {
  onSelectHabit: (habitId: string) => void;
}

export function GardenView({ onSelectHabit }: GardenViewProps) {
  const { habits, addHabit, getTodayProgress } = useHabits();
  const [showForm, setShowForm] = useState(false);
  const { done, total } = getTodayProgress();
  const allDone = total > 0 && done === total;

  return (
    <div className="flex-1 flex flex-col">
      {/* Garden background */}
      <div
        className={`flex-1 relative transition-colors duration-1000 ${
          allDone
            ? 'bg-gradient-to-b from-amber-100 via-green-50 to-emerald-50'
            : 'bg-gradient-to-b from-sky-100 via-green-50 to-emerald-50'
        }`}
      >
        {/* All done celebration text */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center pt-4 pb-2"
            >
              <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                All habits done today! Your garden is thriving ✨
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {habits.length === 0 ? (
          <EmptyState onAddHabit={() => setShowForm(true)} />
        ) : (
          <GardenGrid onSelectHabit={onSelectHabit} />
        )}

        {/* FAB */}
        {habits.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowForm(true)}
            className="fixed bottom-20 right-4 sm:right-8 w-14 h-14 rounded-full bg-green-500 text-white shadow-lg shadow-green-200 flex items-center justify-center text-2xl z-30 hover:bg-green-600 transition-colors"
          >
            +
          </motion.button>
        )}
      </div>

      <HabitForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={addHabit}
      />
    </div>
  );
}
