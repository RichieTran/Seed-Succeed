import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { GrowthStage } from '../types';
import type {
  Habit,
  Completion,
  PlantState,
  UserSettings,
  CustomFrequency,
  PlantColor,
  Frequency,
} from '../types';
import { todayStr } from '../utils/dates';
import * as api from '../utils/api';

interface HabitContextValue {
  habits: Habit[];
  completions: Completion[];
  plantStates: PlantState[];
  settings: UserSettings;
  customFrequencies: CustomFrequency[];
  loading: boolean;

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
  resetData: () => void;
}

const HabitContext = createContext<HabitContextValue | null>(null);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [plantStates, setPlantStates] = useState<PlantState[]>([]);
  const [customFrequencies, setCustomFrequencies] = useState<CustomFrequency[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ theme: 'system' });
  const [loading, setLoading] = useState(true);

  // Load initial state from API
  useEffect(() => {
    api.fetchFullState().then((state) => {
      setHabits(state.habits);
      setCompletions(state.completions);
      setPlantStates(state.plantStates);
      setCustomFrequencies(state.customFrequencies);
      setSettings(state.settings as UserSettings);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load state from API:', err);
      setLoading(false);
    });
  }, []);

  const refreshState = useCallback(async () => {
    try {
      const state = await api.fetchFullState();
      setHabits(state.habits);
      setCompletions(state.completions);
      setPlantStates(state.plantStates);
      setCustomFrequencies(state.customFrequencies);
      setSettings(state.settings as UserSettings);
    } catch (err) {
      console.error('Failed to refresh state:', err);
    }
  }, []);

  const addHabit = useCallback(
    (data: { name: string; emoji: string; color: PlantColor; frequency: Frequency; description?: string; customDays?: number[] }) => {
      api.createHabit(data).then(() => refreshState());
    },
    [refreshState],
  );

  const editHabit = useCallback((id: string, updates: Partial<Habit>) => {
    api.updateHabit(id, updates).then(() => refreshState());
  }, [refreshState]);

  const archiveHabit = useCallback((id: string) => {
    api.archiveHabit(id).then(() => refreshState());
  }, [refreshState]);

  const toggleCompletion = useCallback(
    (habitId: string, date?: string) => {
      const targetDate = date || todayStr();

      // Optimistic UI: check if already completed
      const existing = completions.find(
        (c) => c.habitId === habitId && c.date === targetDate,
      );

      if (existing) {
        // Optimistically remove
        setCompletions((prev) => prev.filter(
          (c) => !(c.habitId === habitId && c.date === targetDate),
        ));
        api.toggleCompletion(habitId, targetDate).then(() => refreshState());
        return null;
      }

      // Optimistically add
      setCompletions((prev) => [...prev, {
        habitId,
        date: targetDate,
        completedAt: new Date().toISOString(),
      }]);

      // Fire API call and refresh for accurate server state
      let result: { pointsEarned: number; newStage: boolean; multiplier: number } | null = null;
      api.toggleCompletion(habitId, targetDate).then((res) => {
        if (!res.removed) {
          result = {
            pointsEarned: res.pointsEarned || 0,
            newStage: res.newStage || false,
            multiplier: res.multiplier || 1,
          };
        }
        refreshState();
      });

      // Return optimistic result (stage detection happens server-side,
      // but we return a basic result for immediate UI feedback)
      return { pointsEarned: 1, newStage: false, multiplier: 1 };
    },
    [completions, refreshState],
  );

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    api.updateSettings(updates);
  }, []);

  const getPlantState = useCallback(
    (habitId: string): PlantState => {
      return (
        plantStates.find((p) => p.habitId === habitId) || {
          habitId,
          stage: GrowthStage.Seed,
          growthPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastCompletedDate: null,
        }
      );
    },
    [plantStates],
  );

  const getStreakInfo = useCallback(
    (habitId: string) => {
      const plant = plantStates.find((p) => p.habitId === habitId);
      return {
        current: plant?.currentStreak || 0,
        longest: plant?.longestStreak || 0,
      };
    },
    [plantStates],
  );

  const isCompletedToday = useCallback(
    (habitId: string) => {
      const today = todayStr();
      return completions.some((c) => c.habitId === habitId && c.date === today);
    },
    [completions],
  );

  const getTodayHabits = useCallback(() => {
    return habits;
  }, [habits]);

  const getTodayProgress = useCallback(() => {
    const today = todayStr();
    const todayCompletions = completions.filter((c) => c.date === today);
    const total = habits.length;
    const done = habits.filter((h) =>
      todayCompletions.some((c) => c.habitId === h.id),
    ).length;
    return { done, total };
  }, [completions, habits]);

  const resetData = useCallback(() => {
    api.resetState().then(() => {
      setHabits([]);
      setCompletions([]);
      setPlantStates([]);
      setCustomFrequencies([]);
      setSettings({ theme: 'system' });
    });
  }, []);

  return (
    <HabitContext.Provider
      value={{
        habits,
        completions,
        plantStates,
        settings,
        customFrequencies,
        loading,
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
        resetData,
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
