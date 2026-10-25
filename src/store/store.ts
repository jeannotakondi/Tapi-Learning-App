import { useSyncExternalStore } from 'react';

export type AvatarId = 'lion' | 'bunny' | 'whale' | 'fox' | 'frog' | 'owl';

export interface LessonResult {
  stars: number;
  completedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: AvatarId;
  stage: number;
  lessons: Record<string, LessonResult>;
  /** Best stars per word. */
  words: Record<string, number>;
  /** Lifetime wrong drops per spelling. Shown to grown-ups only. */
  misses: Record<string, number>;
  /** Spellings to repeat at the start of the next lesson (three misses rule). */
  review: string[];
  /** Stories read, with the date. */
  stories: Record<string, string>;
  /** Result of the placement game, if it was played. */
  placement?: { stage: number; at: string };
  /** Seconds played per day, keyed YYYY-MM-DD. */
  playtime: Record<string, number>;
  createdAt: string;
}

export interface Settings {
  volume: number;
}

export interface AppState {
  version: 2;
  profiles: Profile[];
  activeProfileId?: string;
  settings: Settings;
}

const STORAGE_KEY = 'tapi.state';

const initialState: AppState = { version: 2, profiles: [], settings: { volume: 0.8 } };

/** Version 1 had English and French progress side by side. Keep the English part. */
export function migrate(raw: any): AppState {
  if (raw?.version === 2) return { ...initialState, ...raw };
  if (raw?.version !== 1) return initialState;
  const englishOnly = (record: Record<string, any> = {}, prefix: string) =>
    Object.fromEntries(
      Object.entries(record)
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, value]) => [key.slice(prefix.length), value]),
    );
  return {
    version: 2,
    settings: raw.settings ?? initialState.settings,
    activeProfileId: raw.activeProfileId,
    profiles: (raw.profiles ?? []).map(
      (p: any): Profile => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        stage: p.stage?.en ?? 1,
        lessons: englishOnly(p.lessons, 'en-'),
        words: englishOnly(p.words, 'en-'),
        misses: englishOnly(p.misses, 'en:'),
        review: p.review?.en ?? [],
        stories: {},
        playtime: p.playtime ?? {},
        createdAt: p.createdAt ?? new Date().toISOString(),
      }),
    ),
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? migrate(JSON.parse(raw)) : initialState;
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
