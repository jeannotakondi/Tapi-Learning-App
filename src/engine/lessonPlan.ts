import { allLessons, type Lesson, type ListeningActivity, track, type TrickyWord, type Word } from '../curriculum';

/** Misses of the same sound in one session before it comes back for review. */
export const REVIEW_THRESHOLD = 3;

/** Review words added to the start of a lesson. */
const MAX_REVIEW_WORDS = 2;

export type LessonItem =
  | { kind: 'word'; word: Word; review?: boolean }
  | { kind: 'tricky'; word: TrickyWord }
  | { kind: 'activity'; activity: ListeningActivity };

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
export function wordsForLesson(lesson: Lesson, reviewGraphemes: string[]): Array<{ word: Word; review: boolean }> {
  const own = lesson.words.map((word) => ({ word, review: false }));
  if (reviewGraphemes.length === 0) return own;

  const lessons = allLessons();
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

  return [...review.map((word) => ({ word, review: true })), ...own];
}

/** Everything the child does in a lesson, in order: words, then tricky words, or listening games in Stage 0. */
export function lessonItems(lesson: Lesson, reviewGraphemes: string[]): LessonItem[] {
  return [
    ...lesson.activities.map((activity): LessonItem => ({ kind: 'activity', activity })),
    ...wordsForLesson(lesson, reviewGraphemes).map(({ word, review }): LessonItem => ({ kind: 'word', word, review })),
    ...lesson.tricky.map((word): LessonItem => ({ kind: 'tricky', word })),
  ];
}

/** The first lesson in the stage the child hasn't finished, or undefined if all are done. */
export function nextLessonInStage(stage: number, completed: Record<string, unknown>): Lesson | undefined {
  return track.stages[stage]?.lessons.find((l) => !(l.id in completed));
}

/** What the big play button on the map leads to. */
export type NextStep = { kind: 'lesson'; lesson: Lesson } | { kind: 'story'; storyId: string } | { kind: 'all-done' };

export function nextStep(stage: number, completed: Record<string, unknown>, storiesRead: Record<string, unknown>): NextStep {
  const lesson = nextLessonInStage(stage, completed);
  if (lesson) return { kind: 'lesson', lesson };
  const story = track.stages[stage]?.story;
  if (story && !(story.id in storiesRead)) return { kind: 'story', storyId: story.id };
  return { kind: 'all-done' };
}

/** A stage is finished when every lesson is done and its story (if any) has been read. */
export function stageFinished(stage: number, completed: Record<string, unknown>, storiesRead: Record<string, unknown>): boolean {
  return nextStep(stage, completed, storiesRead).kind === 'all-done';
}

export const LAST_STAGE = 5;

/** Choices offered in a tricky word game: the word and two others the child has seen. */
export function trickyChoices(word: TrickyWord, lesson: Lesson): string[] {
  const others = [...lesson.tricky.filter((t) => t.id !== word.id).map((t) => t.text), ...lesson.words.map((w) => w.text)];
  const picked = others.filter((o) => o.toLowerCase() !== word.text.toLowerCase()).slice(0, 2);
  // Put the answer in a different place each time without randomness, so lessons replay the same way.
  const position = word.text.length % (picked.length + 1);
  return [...picked.slice(0, position), word.text, ...picked.slice(position)];
}
