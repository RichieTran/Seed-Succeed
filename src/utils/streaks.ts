import type { Completion, Frequency } from '../types';
import { todayStr, addDays, dayOfWeek } from './dates';

function isApplicableDay(dateStr: string, frequency: Frequency, customDays?: number[]): boolean {
  const dow = dayOfWeek(dateStr);
  switch (frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dow >= 1 && dow <= 5;
    case 'weekends':
      return dow === 0 || dow === 6;
    case 'custom':
      return customDays ? customDays.includes(dow) : true;
  }
}

export function calculateStreak(
  completions: Completion[],
  frequency: Frequency,
  customDays?: number[],
): { current: number; longest: number } {
  const completedDates = new Set(completions.map((c) => c.date));
  const today = todayStr();

  let current = 0;
  let longest = 0;
  let streak = 0;
  let checkDate = today;

  // If today is applicable and not completed, start from yesterday
  if (isApplicableDay(today, frequency, customDays) && !completedDates.has(today)) {
    checkDate = addDays(today, -1);
  }

  // Walk backward
  for (let i = 0; i < 365; i++) {
    if (!isApplicableDay(checkDate, frequency, customDays)) {
      checkDate = addDays(checkDate, -1);
      continue;
    }

    if (completedDates.has(checkDate)) {
      streak++;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }

  current = streak;
  longest = streak;

  // Continue walking to find longest streak
  let tempStreak = 0;
  const sortedDates = [...completedDates].sort();
  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    if (!isApplicableDay(date, frequency, customDays)) continue;

    if (i === 0) {
      tempStreak = 1;
    } else {
      let prev = addDays(date, -1);
      while (!isApplicableDay(prev, frequency, customDays) && prev > sortedDates[0]) {
        prev = addDays(prev, -1);
      }
      if (completedDates.has(prev)) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longest = Math.max(longest, tempStreak);
  }

  return { current, longest };
}
