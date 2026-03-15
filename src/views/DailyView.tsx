import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../context/HabitContext';
import { HabitCard } from '../components/habit/HabitCard';
import { HabitForm } from '../components/habit/HabitForm';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfettiOverlay } from '../components/ui/ConfettiOverlay';

interface DailyViewProps {
  onSelectHabit: (habitId: string) => void;
}

export function DailyView({ onSelectHabit }: DailyViewProps) {
  const { habits, addHabit, isCompletedToday, getTodayProgress } = useHabits();
  const [showForm, setShowForm] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { done, total } = getTodayProgress();

  const todoHabits = habits.filter((h) => !isCompletedToday(h.id));
  const doneHabits = habits.filter((h) => isCompletedToday(h.id));

  // Check if all just completed
  const prevDone = done;
  if (prevDone === total && total > 0 && !showConfetti) {
    // Will be handled by effect
  }

  return (
    <div className="flex-1 bg-gray-50/50">
      <ConfettiOverlay active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Progress summary */}
        {total > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-800">Today's Progress</h2>
              <span className="text-sm font-medium text-green-600">{done}/{total}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(done / total) * 100}%` }}
                transition={{ type: 'spring', bounce: 0.2 }}
              />
            </div>
          </div>
        )}

        {habits.length === 0 ? (
          <EmptyState onAddHabit={() => setShowForm(true)} />
        ) : (
          <>
            {/* To Do */}
            {todoHabits.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">To Do</h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {todoHabits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onTap={() => onSelectHabit(habit.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Done */}
            {doneHabits.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">
                  Done ({doneHabits.length})
                </h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {doneHabits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onTap={() => onSelectHabit(habit.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {habits.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowForm(true)}
          className="fixed bottom-20 right-4 sm:right-8 w-14 h-14 rounded-full bg-green-500 text-white shadow-lg shadow-green-200 flex items-center justify-center text-2xl z-30"
        >
          +
        </motion.button>
      )}

      <HabitForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={addHabit}
      />
    </div>
  );
}
