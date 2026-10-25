import { allLessons, track } from '../curriculum';
import { todayKey } from '../store/actions';
import type { Profile } from '../store/store';

/** Spelling keys from lessons the child has finished, in teaching order. */
export function graphemesLearned(profile: Profile): string[] {
  return allLessons()
    .filter((l) => l.id in profile.lessons)
    .flatMap((l) => l.newGraphemes);
}

export function trickyWordsLearned(profile: Profile): string[] {
  return allLessons()
    .filter((l) => l.id in profile.lessons)
    .flatMap((l) => l.tricky.map((t) => t.text));
}

export function wordsBuilt(profile: Profile): number {
  return Object.keys(profile.words).length;
}

/**
 * Sounds to mention to grown-ups: anything queued for review first, then
 * sounds with several slips over time. Only shown to adults, never to the child.
 */
export function soundsToPractise(profile: Profile, limit = 4): string[] {
  const frequent = Object.entries(profile.misses)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([grapheme]) => grapheme);
  return [...new Set([...profile.review, ...frequent])].slice(0, limit);
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

/** Sound a spelling key makes, for the tap-to-hear tiles ("oo:oo_short" -> oo_short). */
export function soundForKey(key: string): string {
  return track.graphemes[key]?.sound ?? key;
}
