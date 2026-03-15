import { GrowthStage } from '../types';
import type { GrowthStage as GrowthStageType } from '../types';
import { STAGE_THRESHOLDS, STREAK_MULTIPLIERS } from '../constants/plants';

export function getStreakMultiplier(streak: number): number {
  for (const { min, multiplier } of STREAK_MULTIPLIERS) {
    if (streak >= min) return multiplier;
  }
  return 1.0;
}

export function calculateGrowthStage(points: number): GrowthStageType {
  if (points >= 200) return GrowthStage.Tree;
  if (points >= 120) return GrowthStage.Flowering;
  if (points >= 70) return GrowthStage.Mature;
  if (points >= 35) return GrowthStage.YoungPlant;
  if (points >= 15) return GrowthStage.Seedling;
  if (points >= 5) return GrowthStage.Sprout;
  return GrowthStage.Seed;
}

export function getStageProgress(points: number): number {
  const stage = calculateGrowthStage(points);
  const currentThreshold = STAGE_THRESHOLDS[stage];

  if (stage === GrowthStage.Tree) return 1.0;

  const nextStage = stage + 1;
  const nextThreshold = STAGE_THRESHOLDS[nextStage];
  const range = nextThreshold - currentThreshold;
  const progress = points - currentThreshold;
  return Math.min(progress / range, 1.0);
}

export function getPointsForNextStage(points: number): { current: number; needed: number } {
  const stage = calculateGrowthStage(points);
  if (stage === GrowthStage.Tree) return { current: points, needed: points };

  const currentThreshold = STAGE_THRESHOLDS[stage];
  const nextStage = stage + 1;
  const nextThreshold = STAGE_THRESHOLDS[nextStage];
  return { current: points - currentThreshold, needed: nextThreshold - currentThreshold };
}
