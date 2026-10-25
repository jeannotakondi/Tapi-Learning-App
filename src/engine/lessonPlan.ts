import { allLessons, type Lesson, type Track, type Word } from '../curriculum';

/** Misses of the same sound in one session before it comes back for review. */
export const REVIEW_THRESHOLD = 3;

/** Review words added to the start of a lesson. */
const MAX_REVIEW_WORDS = 2;

/** Spellings missed often enough this session to be repeated next lesson. */
export function soundsNeedingReview(sessionMisses: Record<string, number>): string[] {
  return Object.entries(sessionMisses)
    .filter(([, count]) => count >= REVIEW_THRESHOLD)
    .map(([grapheme]) => grapheme);
}

/**
 * Words for a lesson. If the child is due a review, a couple of words from
 * earlier lessons that use those sounds go first, so the sound is repeated
 * before moving on.
 */
export function wordsForLesson(track: Track, lesson: Lesson, reviewGraphemes: string[]): Word[] {
  if (reviewGraphemes.length === 0) return lesson.words;

  const lessons = allLessons(track);
  const earlier = lessons.slice(
    0,
    lessons.findIndex((l) => l.id === lesson.id),
  );
  const inLesson = new Set(lesson.words.map((w) => w.id));
  const review: Word[] = [];

  for (const grapheme of reviewGraphemes) {
    const candidate = earlier
      .flatMap((l) => l.words)
      .find((w) => !inLesson.has(w.id) && !review.includes(w) && w.tiles.some((t) => t.grapheme === grapheme));
    if (candidate) review.push(candidate);
    if (review.length >= MAX_REVIEW_WORDS) break;
  }

  return [...review, ...lesson.words];
}

/** The first lesson in the stage the child hasn't finished, or undefined if all are done. */
export function nextLessonInStage(track: Track, stage: number, completed: Record<string, unknown>): Lesson | undefined {
  return track.stages[stage]?.lessons.find((l) => !(l.id in completed));
}

export function stageHasContent(track: Track, stage: number): boolean {
  return (track.stages[stage]?.lessons.length ?? 0) > 0;
}
