const API_BASE = "http://localhost:5001/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ── Habits ──────────────────────────────────────────────────────────────────

import type { Habit, PlantState, Completion, CustomFrequency, UserSettings } from "../types";

export async function fetchHabits(): Promise<Habit[]> {
  return fetchJSON<Habit[]>("/habits");
}

export async function createHabit(data: {
  name: string;
  emoji: string;
  color: string;
  frequency: string;
  description?: string;
  customDays?: number[];
}): Promise<Habit> {
  return fetchJSON<Habit>("/habits", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateHabit(
  id: string,
  updates: Partial<Habit>
): Promise<Habit> {
  return fetchJSON<Habit>(`/habits/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function archiveHabit(id: string): Promise<void> {
  await fetchJSON(`/habits/${id}/archive`, { method: "POST" });
}

// ── Completions ─────────────────────────────────────────────────────────────

export async function fetchCompletions(): Promise<Completion[]> {
  return fetchJSON<Completion[]>("/completions");
}

export interface ToggleResult {
  removed: boolean;
  pointsEarned?: number;
  newStage?: boolean;
  multiplier?: number;
}

export async function toggleCompletion(
  habitId: string,
  date?: string
): Promise<ToggleResult> {
  return fetchJSON<ToggleResult>("/completions/toggle", {
    method: "POST",
    body: JSON.stringify({ habitId, date }),
  });
}

// ── Plant States ────────────────────────────────────────────────────────────

export async function fetchPlantStates(): Promise<PlantState[]> {
  return fetchJSON<PlantState[]>("/plant-states");
}

export async function fetchPlantState(habitId: string): Promise<PlantState> {
  return fetchJSON<PlantState>(`/plant-states/${habitId}`);
}

// ── Settings ────────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<UserSettings> {
  return fetchJSON<UserSettings>("/settings");
}

export async function updateSettings(
  updates: Partial<UserSettings>
): Promise<void> {
  await fetchJSON("/settings", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// ── Full State ──────────────────────────────────────────────────────────────

export interface FullState {
  habits: Habit[];
  completions: Completion[];
  plantStates: PlantState[];
  customFrequencies: CustomFrequency[];
  settings: UserSettings;
}

export async function fetchFullState(): Promise<FullState> {
  return fetchJSON<FullState>("/state");
}

export async function resetState(): Promise<void> {
  await fetchJSON("/state/reset", { method: "POST" });
}
