import { LAST_STAGE } from '../engine/lessonPlan';
import { type AvatarId, type Profile, setState } from './store';

function updateProfile(id: string, update: (p: Profile) => Profile) {
  setState((s) => ({ ...s, profiles: s.profiles.map((p) => (p.id === id ? update(p) : p)) }));
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createProfile(input: { name: string; avatar: AvatarId; stage: number }): Profile {
  const profile: Profile = {
    id: newId(),
    name: input.name.trim(),
    avatar: input.avatar,
    stage: input.stage,
    lessons: {},
    words: {},
    misses: {},
    review: [],
    stories: {},
    playtime: {},
    createdAt: new Date().toISOString(),
  };
  setState((s) => ({ ...s, profiles: [...s.profiles, profile] }));
  return profile;
}

export function deleteProfile(id: string) {
  setState((s) => ({
    ...s,
    profiles: s.profiles.filter((p) => p.id !== id),
    activeProfileId: s.activeProfileId === id ? undefined : s.activeProfileId,
  }));
}

export function selectProfile(id: string | undefined) {
  setState((s) => ({ ...s, activeProfileId: id }));
}

export function renameProfile(id: string, name: string, avatar: AvatarId) {
  updateProfile(id, (p) => ({ ...p, name: name.trim() || p.name, avatar }));
}

/** Grown-ups can move a child up or down a stage at any time. */
export function setStage(id: string, stage: number) {
  updateProfile(id, (p) => ({ ...p, stage: Math.max(0, Math.min(LAST_STAGE, stage)) }));
}

export function recordPlacement(id: string, stage: number) {
  updateProfile(id, (p) => ({ ...p, stage, placement: { stage, at: new Date().toISOString() } }));
}

export function setVolume(volume: number) {
  setState((s) => ({ ...s, settings: { ...s.settings, volume: Math.max(0, Math.min(1, volume)) } }));
}

export function recordWord(id: string, wordId: string, stars: number) {
  updateProfile(id, (p) => ({ ...p, words: { ...p.words, [wordId]: Math.max(stars, p.words[wordId] ?? 0) } }));
}

export function recordLesson(id: string, lessonId: string, stars: number, sessionMisses: Record<string, number>, review: string[]) {
  updateProfile(id, (p) => {
    const misses = { ...p.misses };
    for (const [grapheme, count] of Object.entries(sessionMisses)) misses[grapheme] = (misses[grapheme] ?? 0) + count;
    const best = Math.max(stars, p.lessons[lessonId]?.stars ?? 0);
    return {
      ...p,
      misses,
      review,
      lessons: { ...p.lessons, [lessonId]: { stars: best, completedAt: new Date().toISOString() } },
    };
  });
}

export function recordStory(id: string, storyId: string) {
  updateProfile(id, (p) => ({ ...p, stories: { ...p.stories, [storyId]: p.stories[storyId] ?? new Date().toISOString() } }));
}

export function addPlaytime(id: string, seconds: number, date = new Date()) {
  if (seconds <= 0) return;
  const key = todayKey(date);
  updateProfile(id, (p) => ({ ...p, playtime: { ...p.playtime, [key]: (p.playtime[key] ?? 0) + Math.round(seconds) } }));
}
