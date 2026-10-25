import { parseGraphemeKey } from './build';
import { english } from './english';
import { stories, storyWords } from './english/stories';
import type { Lesson, Story, Word } from './types';

export * from './types';
export { isSplit, spell } from './build';
export { storyTokens } from './english/stories';

export const track = english;

export const LAND_NAMES: Record<string, string> = {
  'whisper-beach': 'Whisper Beach',
  'first-sound-forest': 'First Sound Forest',
  'echo-hills': 'Echo Hills',
  'rainbow-river': 'Rainbow River',
  'windy-cliffs': 'Windy Cliffs',
  'singing-mountain': 'Singing Mountain',
};

export function allLessons(): Lesson[] {
  return track.stages.flatMap((stage) => stage.lessons);
}

export function allStories(): Story[] {
  return stories;
}

export function findLesson(lessonId: string): Lesson | undefined {
  return allLessons().find((l) => l.id === lessonId);
}

export function findStory(storyId: string): Story | undefined {
  return stories.find((s) => s.id === storyId);
}

/** Every decodable word the app knows: lesson words plus extra story words. */
export const lexicon: Map<string, Word> = new Map(
  [...allLessons().flatMap((l) => l.words), ...storyWords].map((w) => [w.text.toLowerCase(), w]),
);

export interface Taught {
  /** Spellings taught, e.g. "oo". */
  graphemes: Set<string>;
  /** Spelling + sound pairs taught, e.g. "oo:oo_short". */
  pairs: Set<string>;
  /** Tricky words taught, lower case. */
  tricky: Set<string>;
}

/** What a child knows after finishing every lesson up to and including `lessonId`. */
export function taughtThrough(lessonId: string): Taught {
  const taught: Taught = { graphemes: new Set(), pairs: new Set(), tricky: new Set() };
  for (const lesson of allLessons()) {
    for (const key of lesson.newGraphemes) {
      const tile = parseGraphemeKey(key, track.graphemes);
      taught.graphemes.add(tile.grapheme);
      taught.pairs.add(`${tile.grapheme}:${tile.sound}`);
    }
    for (const t of lesson.tricky) taught.tricky.add(t.text.toLowerCase());
    if (lesson.id === lessonId) break;
  }
  return taught;
}

/** What a child knows by the end of a stage. */
export function taughtByEndOfStage(stage: number): Taught {
  const upToStage = track.stages.slice(0, stage + 1).flatMap((s) => s.lessons);
  const last = upToStage[upToStage.length - 1];
  return last ? taughtThrough(last.id) : { graphemes: new Set(), pairs: new Set(), tricky: new Set() };
}

export function canDecode(word: Word, taught: Taught): boolean {
  return word.tiles.every((t) => taught.pairs.has(`${t.grapheme}:${t.sound}`));
}
