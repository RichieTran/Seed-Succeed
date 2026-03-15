import type { AppState } from '../types';

const STORAGE_KEY = 'seed-succeed-v1';

const DEFAULT_STATE: AppState = {
  version: 1,
  habits: [],
  completions: [],
  plantStates: [],
  customFrequencies: [],
  settings: {
    theme: 'system',
  },
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

export function exportData(): string {
  return localStorage.getItem(STORAGE_KEY) || JSON.stringify(DEFAULT_STATE);
}

export function importData(json: string): AppState {
  const parsed = JSON.parse(json);
  const state = { ...DEFAULT_STATE, ...parsed };
  saveState(state);
  return state;
}

export function resetData(): AppState {
  const state = { ...DEFAULT_STATE };
  saveState(state);
  return state;
}
