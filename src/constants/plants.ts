import { GrowthStage } from '../types';
import type { PlantColor } from '../types';

export const STAGE_THRESHOLDS: Record<number, number> = {
  [GrowthStage.Seed]: 0,
  [GrowthStage.Sprout]: 5,
  [GrowthStage.Seedling]: 15,
  [GrowthStage.YoungPlant]: 35,
  [GrowthStage.Mature]: 70,
  [GrowthStage.Flowering]: 120,
  [GrowthStage.Tree]: 200,
};

export const STAGE_NAMES: Record<number, string> = {
  [GrowthStage.Seed]: 'Seed',
  [GrowthStage.Sprout]: 'Sprout',
  [GrowthStage.Seedling]: 'Seedling',
  [GrowthStage.YoungPlant]: 'Young Plant',
  [GrowthStage.Mature]: 'Mature',
  [GrowthStage.Flowering]: 'Flowering',
  [GrowthStage.Tree]: 'Tree',
};

export const STREAK_MULTIPLIERS = [
  { min: 60, multiplier: 4.0 },
  { min: 30, multiplier: 3.0 },
  { min: 14, multiplier: 2.5 },
  { min: 7, multiplier: 2.0 },
  { min: 3, multiplier: 1.5 },
  { min: 0, multiplier: 1.0 },
];

export const PLANT_COLORS: Record<PlantColor, { primary: string; light: string; dark: string }> = {
  green: { primary: '#22c55e', light: '#86efac', dark: '#16a34a' },
  rose: { primary: '#f43f5e', light: '#fda4af', dark: '#e11d48' },
  violet: { primary: '#8b5cf6', light: '#c4b5fd', dark: '#7c3aed' },
  amber: { primary: '#f59e0b', light: '#fcd34d', dark: '#d97706' },
  sky: { primary: '#0ea5e9', light: '#7dd3fc', dark: '#0284c7' },
  emerald: { primary: '#10b981', light: '#6ee7b7', dark: '#059669' },
};

export const EMOJI_OPTIONS = [
  '🧘', '📚', '🏃', '💧', '🎨', '✍️', '🎵', '💪',
  '🥗', '😴', '🧹', '📝', '🌅', '🧠', '💊', '🚶',
];
