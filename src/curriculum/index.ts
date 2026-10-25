import { english } from './english';
import { french } from './french';
import type { Language, Lesson, Track } from './types';

export * from './types';

export const tracks: Record<Language, Track> = { en: english, fr: french };

export const LAND_NAMES: Record<string, string> = {
  'whisper-beach': 'Whisper Beach',
  'first-sound-forest': 'First Sound Forest',
  'echo-hills': 'Echo Hills',
  'rainbow-river': 'Rainbow River',
  'windy-cliffs': 'Windy Cliffs',
  'singing-mountain': 'Singing Mountain',
};

export function allLessons(track: Track): Lesson[] {
  return track.stages.flatMap((stage) => stage.lessons);
}

export function findLesson(lessonId: string): { track: Track; lesson: Lesson } | undefined {
  for (const track of Object.values(tracks)) {
    const lesson = allLessons(track).find((l) => l.id === lessonId);
    if (lesson) return { track, lesson };
  }
  return undefined;
}

/** Spellings taught up to and including the given lesson, in teaching order. */
export function graphemesTaughtThrough(track: Track, lessonId: string): string[] {
  const taught: string[] = [];
  for (const lesson of allLessons(track)) {
    taught.push(...lesson.newGraphemes);
    if (lesson.id === lessonId) break;
  }
  return taught;
}
