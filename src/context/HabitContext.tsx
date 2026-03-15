import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GrowthStage } from '../types';
import type {
  Habit,
  Completion,
  PlantState,
  AppState,
  UserSettings,
  CustomFrequency,
  PlantColor,
  Frequency,
} from '../types';
import { loadState, saveState } from '../utils/storage';
import { todayStr } from '../utils/dates';
import { calculateStreak } from '../utils/streaks';
import { getStreakMultiplier, calculateGrowthStage } from '../utils/growth';

interface HabitContextValue {
  habits: Habit[];
  completions: Completion[];
  plantStates: PlantState[];
  settings: UserSettings;
  customFrequencies: CustomFrequency[];

  addHabit: (data: { name: string; emoji: string; color: PlantColor; frequency: Frequency; description?: string; customDays?: number[] }) => void;
  editHabit: (id: string, updates: Partial<Habit>) => void;
  archiveHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date?: string) => { pointsEarned: number; newStage: boolean; multiplier: number } | null;
  updateSettings: (updates: Partial<UserSettings>) => void;
  getPlantState: (habitId: string) => PlantState;
  getStreakInfo: (habitId: string) => { current: number; longest: number };
  getTodayProgress: () => { done: number; total: number };
  isCompletedToday: (habitId: string) => boolean;
  getTodayHabits: () => Habit[];
  setState: (state: AppState) => void;
}

const HabitContext = createContext<HabitContextValue | null>(null);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setState = useCallback((newState: AppState) => {
    setStateRaw(newState);
  }, []);

  const activeHabits = state.habits.filter((h) => !h.archivedAt);

  const addHabit = useCallback(
    (data: { name: string; emoji: string; color: PlantColor; frequency: Frequency; description?: string; customDays?: number[] }) => {
      const id = uuidv4();
      const habit: Habit = {
        id,
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        frequency: data.frequency,
        description: data.description,
        createdAt: new Date().toISOString(),
      };
      const plantState: PlantState = {
        habitId: id,
        stage: GrowthStage.Seed,
        growthPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
      };
      setStateRaw((prev) => {
        const newState = {
          ...prev,
          habits: [...prev.habits, habit],
          plantStates: [...prev.plantStates, plantState],
        };
        if (data.frequency === 'custom' && data.customDays) {
          newState.customFrequencies = [
            ...prev.customFrequencies,
            { habitId: id, days: data.customDays },
          ];
        }
        return newState;
      });
    },
    [],
  );

  const editHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setStateRaw((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setStateRaw((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === id ? { ...h, archivedAt: new Date().toISOString() } : h,
      ),
    }));
  }, []);

  const toggleCompletion = useCallback(
    (habitId: string, date?: string) => {
      const targetDate = date || todayStr();
      const existing = state.completions.find(
        (c) => c.habitId === habitId && c.date === targetDate,
      );

      if (existing) {
        setStateRaw((prev) => {
          const newCompletions = prev.completions.filter(
            (c) => !(c.habitId === habitId && c.date === targetDate),
          );
          const habit = prev.habits.find((h) => h.id === habitId);
          const customFreq = prev.customFrequencies.find((cf) => cf.habitId === habitId);
          const streakInfo = calculateStreak(
            newCompletions.filter((c) => c.habitId === habitId),
            habit?.frequency || 'daily',
            customFreq?.days,
          );
          const plantState = prev.plantStates.find((p) => p.habitId === habitId);
          const newPoints = Math.max(0, (plantState?.growthPoints || 0) - 1);
          const newStage = calculateGrowthStage(newPoints);

          return {
            ...prev,
            completions: newCompletions,
            plantStates: prev.plantStates.map((p) =>
              p.habitId === habitId
                ? {
                    ...p,
                    growthPoints: newPoints,
                    stage: newStage,
                    currentStreak: streakInfo.current,
                    longestStreak: streakInfo.longest,
                    lastCompletedDate: newCompletions
                      .filter((c) => c.habitId === habitId)
                      .sort((a, b) => b.date.localeCompare(a.date))[0]?.date || null,
                  }
                : p,
            ),
          };
        });
        return null;
      }

      const completion: Completion = {
        habitId,
        date: targetDate,
        completedAt: new Date().toISOString(),
      };

      let pointsEarned = 0;
      let newStage = false;
      let multiplier = 1;

      setStateRaw((prev) => {
        const newCompletions = [...prev.completions, completion];
        const habit = prev.habits.find((h) => h.id === habitId);
        const customFreq = prev.customFrequencies.find((cf) => cf.habitId === habitId);
        const streakInfo = calculateStreak(
          newCompletions.filter((c) => c.habitId === habitId),
          habit?.frequency || 'daily',
          customFreq?.days,
        );

        multiplier = getStreakMultiplier(streakInfo.current);
        pointsEarned = Math.round(1 * multiplier * 10) / 10;

        const plantState = prev.plantStates.find((p) => p.habitId === habitId);
        const oldStage = plantState?.stage ?? GrowthStage.Seed;
        const newPoints = (plantState?.growthPoints || 0) + pointsEarned;
        const calculatedStage = calculateGrowthStage(newPoints);
        newStage = calculatedStage > oldStage;

        return {
          ...prev,
          completions: newCompletions,
          plantStates: prev.plantStates.map((p) =>
            p.habitId === habitId
              ? {
                  ...p,
                  growthPoints: newPoints,
                  stage: calculatedStage,
                  currentStreak: streakInfo.current,
                  longestStreak: streakInfo.longest,
                  lastCompletedDate: targetDate,
                }
              : p,
          ),
        };
      });

      return { pointsEarned, newStage, multiplier };
    },
    [state.completions],
  );

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setStateRaw((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const getPlantState = useCallback(
    (habitId: string): PlantState => {
      return (
        state.plantStates.find((p) => p.habitId === habitId) || {
          habitId,
          stage: GrowthStage.Seed,
          growthPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastCompletedDate: null,
        }
      );
    },
    [state.plantStates],
  );

  const getStreakInfo = useCallback(
    (habitId: string) => {
      const habit = state.habits.find((h) => h.id === habitId);
      const customFreq = state.customFrequencies.find((cf) => cf.habitId === habitId);
      const habitCompletions = state.completions.filter((c) => c.habitId === habitId);
      return calculateStreak(habitCompletions, habit?.frequency || 'daily', customFreq?.days);
    },
    [state.habits, state.completions, state.customFrequencies],
  );

  const isCompletedToday = useCallback(
    (habitId: string) => {
      const today = todayStr();
      return state.completions.some((c) => c.habitId === habitId && c.date === today);
    },
    [state.completions],
  );

  const getTodayHabits = useCallback(() => {
    return activeHabits;
  }, [activeHabits]);

  const getTodayProgress = useCallback(() => {
    const today = todayStr();
    const todayCompletions = state.completions.filter((c) => c.date === today);
    const total = activeHabits.length;
    const done = activeHabits.filter((h) =>
      todayCompletions.some((c) => c.habitId === h.id),
    ).length;
    return { done, total };
  }, [state.completions, activeHabits]);

  return (
    <HabitContext.Provider
      value={{
        habits: activeHabits,
        completions: state.completions,
        plantStates: state.plantStates,
        settings: state.settings,
        customFrequencies: state.customFrequencies,
        addHabit,
        editHabit,
        archiveHabit,
        toggleCompletion,
        updateSettings,
        getPlantState,
        getStreakInfo,
        getTodayProgress,
        isCompletedToday,
        getTodayHabits,
        setState,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits must be used within HabitProvider');
  return ctx;
}
