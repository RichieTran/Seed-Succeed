import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../context/HabitContext';
import { PlantSVG } from '../components/plant/PlantSVG';
import { STAGE_NAMES, PLANT_COLORS } from '../constants/plants';
import { getStageProgress, getPointsForNextStage, getStreakMultiplier } from '../utils/growth';
import { GrowthStage } from '../types';
import { getLast90Days } from '../utils/dates';
import { HabitForm } from '../components/habit/HabitForm';
import { ConfettiOverlay } from '../components/ui/ConfettiOverlay';
import { CompletionButton } from '../components/habit/CompletionButton';

interface HabitDetailViewProps {
  habitId: string;
  onBack: () => void;
}

export function HabitDetailView({ habitId, onBack }: HabitDetailViewProps) {
  const {
    habits,
    completions,
    getPlantState,
    getStreakInfo,
    isCompletedToday,
    toggleCompletion,
    editHabit,
    archiveHabit,
  } = useHabits();

  const habit = habits.find((h) => h.id === habitId);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!habit) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Habit not found</p>
      </div>
    );
  }

  const plantState = getPlantState(habitId);
  const streakInfo = getStreakInfo(habitId);
  const completed = isCompletedToday(habitId);
  const colors = PLANT_COLORS[habit.color];
  const stageProgress = getStageProgress(plantState.growthPoints);
  const pointsInfo = getPointsForNextStage(plantState.growthPoints);
  const multiplier = getStreakMultiplier(streakInfo.current);
  const habitCompletions = completions.filter((c) => c.habitId === habitId);
  const completionDates = new Set(habitCompletions.map((c) => c.date));
  const last90 = getLast90Days();
  const totalCompletions = habitCompletions.length;

  const handleToggle = () => {
    const result = toggleCompletion(habitId);
    if (result?.newStage) {
      setShowConfetti(true);
    }
    return result;
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-sky-50 via-green-50/30 to-white overflow-y-auto">
      <ConfettiOverlay active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-400 hover:text-red-600 px-2 py-1"
          >
            Archive
          </button>
        </div>
      </div>

      {/* Plant display */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <span className="text-3xl mb-2">{habit.emoji}</span>
        <h2 className="text-xl font-bold text-gray-800">{habit.name}</h2>
        {habit.description && (
          <p className="text-sm text-gray-400 mt-1">{habit.description}</p>
        )}

        <div className="my-4">
          <PlantSVG
            stage={plantState.stage}
            growthPoints={plantState.growthPoints}
            color={habit.color}
            size={180}
          />
        </div>

        <p className="text-sm font-medium" style={{ color: colors.primary }}>
          {STAGE_NAMES[plantState.stage]}
        </p>

        {/* Growth progress bar */}
        {plantState.stage < GrowthStage.Tree && (
          <div className="w-48 mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{pointsInfo.current.toFixed(1)} pts</span>
              <span>{pointsInfo.needed} pts to next stage</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: colors.primary }}
                initial={{ width: 0 }}
                animate={{ width: `${stageProgress * 100}%` }}
                transition={{ type: 'spring', bounce: 0.2 }}
              />
            </div>
          </div>
        )}

        {/* Complete today button */}
        <div className="mt-6 flex items-center gap-3">
          <CompletionButton
            completed={completed}
            onToggle={handleToggle}
            color={colors.primary}
          />
          <span className="text-sm text-gray-500">
            {completed ? 'Completed today!' : 'Mark as done'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="w-full px-4 space-y-4 pb-24 flex flex-col items-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md">
          <StatCard label="Current Streak" value={`${streakInfo.current}`} icon="🔥" />
          <StatCard label="Longest Streak" value={`${streakInfo.longest}`} icon="🏆" />
          <StatCard label="Total Done" value={`${totalCompletions}`} icon="✅" />
          <StatCard label="Multiplier" value={`${multiplier}x`} icon="⚡" />
        </div>

        {/* Calendar heatmap */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 w-full max-w-md">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Last 90 Days</h3>
          <div className="grid grid-cols-[repeat(13,1fr)] gap-1">
            {last90.map((date) => {
              const isCompleted = completionDates.has(date);
              return (
                <div
                  key={date}
                  title={date}
                  className="aspect-square rounded-sm transition-colors"
                  style={{
                    backgroundColor: isCompleted ? colors.primary : '#f3f4f6',
                    opacity: isCompleted ? 0.8 : 0.4,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <HabitForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={(data) => {
          editHabit(habitId, data);
          setShowEdit(false);
        }}
        initialData={habit}
      />

      {/* Archive confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-7 mx-4 max-w-sm w-full"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-3">Archive this habit?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Your plant will be removed from the garden but your progress is saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  archiveHabit(habitId);
                  onBack();
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium"
              >
                Archive
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
      <span className="text-lg">{icon}</span>
      <p className="text-lg font-bold text-gray-800 mt-1">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
