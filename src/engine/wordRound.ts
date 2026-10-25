import type { Word } from '../curriculum';

/** One word being rebuilt from its tiles. Slots fill strictly left to right. */
export interface WordRound {
  word: Word;
  /** How many slots are filled. The next slot (this index) glows. */
  filled: number;
  /** Wrong drops on this word. Decides the stars; never shown as a score. */
  wrongDrops: number;
  /** Wrong drops per expected spelling, for the "three misses" review rule. */
  misses: Record<string, number>;
}

export type PlaceResult = 'correct' | 'wrong' | 'complete';

export function startRound(word: Word): WordRound {
  return { word, filled: 0, wrongDrops: 0, misses: {} };
}

export function isComplete(round: WordRound): boolean {
  return round.filled >= round.word.tiles.length;
}

export function expectedGrapheme(round: WordRound): string | undefined {
  return round.word.tiles[round.filled]?.grapheme;
}

/**
 * A tile was dropped on the glowing slot. Tiles are matched by spelling, so in
 * "dad" either d tile fits the first slot.
 */
export function placeTile(round: WordRound, grapheme: string): { round: WordRound; result: PlaceResult } {
  const expected = expectedGrapheme(round);
  if (expected === undefined) return { round, result: 'complete' };

  if (grapheme !== expected) {
    return {
      round: {
        ...round,
        wrongDrops: round.wrongDrops + 1,
        misses: { ...round.misses, [expected]: (round.misses[expected] ?? 0) + 1 },
      },
      result: 'wrong',
    };
  }

  const next = { ...round, filled: round.filled + 1 };
  return { round: next, result: isComplete(next) ? 'complete' : 'correct' };
}

/**
 * Stars from tries: first time right = 3, one or two slips = 2, more = 1.
 * Every finished word earns at least one star. The cut-offs are a starting
 * point to tune after testing with children.
 */
export function starsForWord(wrongDrops: number): 1 | 2 | 3 {
  if (wrongDrops === 0) return 3;
  if (wrongDrops <= 2) return 2;
  return 1;
}

export function starsForLesson(wordStars: number[]): 1 | 2 | 3 {
  if (wordStars.length === 0) return 1;
  const average = wordStars.reduce((a, b) => a + b, 0) / wordStars.length;
  return Math.min(3, Math.max(1, Math.round(average))) as 1 | 2 | 3;
}
