import { allLessons, type Language, type Track } from '../curriculum';
import { todayKey } from '../store/actions';
import type { Profile } from '../store/store';

/** Spellings from lessons the child has finished, in teaching order. */
export function graphemesLearned(track: Track, profile: Profile): string[] {
  return allLessons(track)
    .filter((l) => l.id in profile.lessons)
    .flatMap((l) => l.newGraphemes);
}

export function wordsBuilt(profile: Profile, language: Language): number {
  return Object.keys(profile.words).filter((id) => id.startsWith(`${language}-`)).length;
}

/**
 * Sounds to mention to grown-ups: anything queued for review first, then
 * sounds with several slips over time. Only shown to adults, never to the child.
 */
export function soundsToPractise(profile: Profile, language: Language, limit = 4): string[] {
  const review = profile.review[language] ?? [];
  const frequent = Object.entries(profile.misses)
    .filter(([key, count]) => key.startsWith(`${language}:`) && count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key.slice(language.length + 1));
  return [...new Set([...review, ...frequent])].slice(0, limit);
}

export interface DayPlaytime {
  key: string;
  label: string;
  minutes: number;
}

/** The last 7 days ending today, oldest first. */
export function lastSevenDays(playtime: Record<string, number>, today = new Date()): DayPlaytime[] {
  const days: DayPlaytime[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = todayKey(date);
    days.push({
      key,
      label: date.toLocaleDateString('en-GB', { weekday: 'narrow' }),
      minutes: Math.round((playtime[key] ?? 0) / 60),
    });
  }
  return days;
}
