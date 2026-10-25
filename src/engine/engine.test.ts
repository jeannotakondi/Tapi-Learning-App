import { describe, expect, it } from 'vitest';
import { tracks } from '../curriculum';
import { nextLessonInStage, soundsNeedingReview, wordsForLesson } from './lessonPlan';
import { placeTile, startRound, starsForLesson, starsForWord } from './wordRound';

const en = tracks.en;
const lesson = (id: string) => en.stages[1].lessons.find((l) => l.id === id)!;
const word = (text: string) => en.stages[1].lessons.flatMap((l) => l.words).find((w) => w.text === text)!;

describe('word round', () => {
  it('fills slots in order and finishes on the last tile', () => {
    let round = startRound(word('cat'));
    let result;
    ({ round, result } = placeTile(round, 'c'));
    expect(result).toBe('correct');
    ({ round, result } = placeTile(round, 'a'));
    ({ round, result } = placeTile(round, 't'));
    expect(result).toBe('complete');
    expect(round.wrongDrops).toBe(0);
  });

  it('bounces a wrong tile back and counts the miss against the expected sound', () => {
    const { round, result } = placeTile(startRound(word('cat')), 't');
    expect(result).toBe('wrong');
    expect(round.filled).toBe(0);
    expect(round.misses).toEqual({ c: 1 });
  });

  it('treats ck as one tile', () => {
    let round = startRound(word('kick'));
    for (const g of ['k', 'i']) round = placeTile(round, g).round;
    expect(placeTile(round, 'c').result).toBe('wrong');
    expect(placeTile(round, 'ck').result).toBe('complete');
  });

  it('accepts either copy of a repeated letter', () => {
    const round = startRound(word('dad'));
    expect(placeTile(round, 'd').result).toBe('correct');
  });
});

describe('stars', () => {
  it('depend on tries, never below one', () => {
    expect(starsForWord(0)).toBe(3);
    expect(starsForWord(2)).toBe(2);
    expect(starsForWord(9)).toBe(1);
    expect(starsForLesson([3, 3, 2])).toBe(3);
    expect(starsForLesson([1, 1, 2])).toBe(1);
    expect(starsForLesson([])).toBe(1);
  });
});

describe('three misses rule', () => {
  it('flags a sound missed three times in a session', () => {
    expect(soundsNeedingReview({ a: 3, t: 2 })).toEqual(['a']);
  });

  it('puts an earlier word with that sound at the start of the next lesson', () => {
    const words = wordsForLesson(en, lesson('en-1-3'), ['i']);
    expect(words.length).toBe(lesson('en-1-3').words.length + 1);
    expect(words[0].tiles.some((t) => t.grapheme === 'i')).toBe(true);
  });

  it('adds at most two review words', () => {
    const words = wordsForLesson(en, lesson('en-1-5'), ['s', 'a', 't', 'i']);
    expect(words.length).toBe(lesson('en-1-5').words.length + 2);
  });

  it('changes nothing when no review is due', () => {
    expect(wordsForLesson(en, lesson('en-1-2'), [])).toBe(lesson('en-1-2').words);
  });
});

describe('next lesson', () => {
  it('is the first unfinished lesson in the stage', () => {
    expect(nextLessonInStage(en, 1, {})?.id).toBe('en-1-1');
    expect(nextLessonInStage(en, 1, { 'en-1-1': {}, 'en-1-2': {} })?.id).toBe('en-1-3');
  });
});
