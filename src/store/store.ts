import { useSyncExternalStore } from 'react';
import type { Language } from '../curriculum';

export type AvatarId = 'lion' | 'bunny' | 'whale' | 'fox' | 'frog' | 'owl';

export interface LessonResult {
  stars: number;
  completedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: AvatarId;
  language: Language;
  /** Current stage per language, so switching language keeps both journeys. */
  stage: Record<Language, number>;
  lessons: Record<string, LessonResult>;
  /** Best stars per word id. */
  words: Record<string, number>;
  /** Lifetime wrong drops per spelling, keyed "en:b". Shown to grown-ups only. */
  misses: Record<string, number>;
  /** Spellings to repeat at the start of the next lesson (three misses rule). */
  review: Record<Language, string[]>;
  /** Seconds played per day, keyed YYYY-MM-DD. */
  playtime: Record<string, number>;
  createdAt: string;
}

export interface Settings {
  volume: number;
}

export interface AppState {
  version: 1;
  profiles: Profile[];
  activeProfileId?: string;
  settings: Settings;
}

const STORAGE_KEY = 'tapi.state';

const initialState: AppState = { version: 1, profiles: [], settings: { volume: 0.8 } };

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as AppState;
    return parsed.version === 1 ? { ...initialState, ...parsed } : initialState;
  } catch {
    return initialState;
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode). Progress lives on for this session only.
  }
}

export function getState(): AppState {
  return state;
}

export function setState(update: (s: AppState) => AppState) {
  state = update(state);
  save();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppState<T>(select: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state));
}

export function useActiveProfile(): Profile | undefined {
  return useAppState((s) => s.profiles.find((p) => p.id === s.activeProfileId));
}

/** Test helper: start from a clean slate. */
export function resetState(next: AppState = initialState) {
  state = next;
  listeners.forEach((l) => l());
}
