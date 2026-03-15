export interface Habit {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  color: PlantColor;
  frequency: Frequency;
  createdAt: string;
  archivedAt?: string;
}

export type Frequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface CustomFrequency {
  habitId: string;
  days: number[]; // 0=Sun ... 6=Sat
}

export interface Completion {
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO timestamp
}

export const GrowthStage = {
  Seed: 0,
  Sprout: 1,
  Seedling: 2,
  YoungPlant: 3,
  Mature: 4,
  Flowering: 5,
  Tree: 6,
} as const;

export type GrowthStage = (typeof GrowthStage)[keyof typeof GrowthStage];

export interface PlantState {
  habitId: string;
  stage: GrowthStage;
  growthPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export type PlantColor =
  | 'green'
  | 'rose'
  | 'violet'
  | 'amber'
  | 'sky'
  | 'emerald';

export interface AppState {
  version: number;
  habits: Habit[];
  completions: Completion[];
  plantStates: PlantState[];
  customFrequencies: CustomFrequency[];
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
}

export type View =
  | { name: 'garden' }
  | { name: 'daily' }
  | { name: 'detail'; habitId: string }
  | { name: 'settings' };
