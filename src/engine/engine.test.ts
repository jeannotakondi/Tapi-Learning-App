import { describe, expect, it } from 'vitest';
import { findLesson, lexicon } from '../curriculum';
import { lessonItems, nextLessonInStage, nextStep, soundsNeedingReview, trickyChoices, wordsForLesson } from './lessonPlan';
import { placeTile, startRound, starsForLesson, starsForWord } from './wordRound';

const lesson = (id: string) => findLesson(id)!;
const word = (text: string) => lexicon.get(text)!;

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

  it('treats ck and igh as one tile', () => {
    let round = startRound(word('kick'));
    for (const g of ['k', 'i']) round = placeTile(round, g).round;
    expect(placeTile(round, 'c').result).toBe('wrong');
    expect(placeTile(round, 'ck').result).toBe('complete');
    expect(word('night').tiles.map((t) => t.grapheme)).toEqual(['n', 'igh', 't']);
  });

  it('places a split spelling as one linked tile, in sound order', () => {
    let round = startRound(word('cake'));
    round = placeTile(round, 'c').round;
    expect(placeTile(round, 'k').result).toBe('wrong');
    round = placeTile(round, 'a-e').round;
    expect(placeTile(round, 'k').result).toBe('complete');
  });

  it('keeps clusters as separate tiles', () => {
    expect(word('frog').tiles.map((t) => t.grapheme)).toEqual(['f', 'r', 'o', 'g']);
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
    const words = wordsForLesson(lesson('1-3'), ['i']);
    expect(words.length).toBe(lesson('1-3').words.length + 1);
    expect(words[0].review).toBe(true);
    expect(words[0].word.tiles.some((t) => t.grapheme === 'i')).toBe(true);
  });

  it('adds at most two review words', () => {
    expect(wordsForLesson(lesson('1-5'), ['s', 'a', 't', 'i']).length).toBe(lesson('1-5').words.length + 2);
  });
});

describe('lesson items', () => {
  it('runs words, then tricky words', () => {
    const items = lessonItems(lesson('1-3'), []);
    expect(items.map((i) => i.kind)).toEqual(['word', 'word', 'word', 'word', 'word', 'word', 'tricky', 'tricky']);
  });

  it('runs listening games in Stage 0', () => {
    expect(lessonItems(lesson('0-1'), []).every((i) => i.kind === 'activity')).toBe(true);
  });

  it('offers a tricky word with two others, answer included once', () => {
    const choices = trickyChoices(lesson('1-3').tricky[0], lesson('1-3'));
    expect(choices).toHaveLength(3);
    expect(choices.filter((c) => c === 'the')).toHaveLength(1);
  });
});

describe('next step on the map', () => {
  it('is the first unfinished lesson, then the story, then done', () => {
    expect(nextLessonInStage(1, {})?.id).toBe('1-1');
    const allDone = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`1-${i + 1}`, {}]));
    expect(nextStep(1, allDone, {})).toEqual({ kind: 'story', storyId: 'story-1' });
    expect(nextStep(1, allDone, { 'story-1': 'x' }).kind).toBe('all-done');
  });

  it('has no story in Stage 0', () => {
    const allDone = Object.fromEntries(Array.from({ length: 4 }, (_, i) => [`0-${i + 1}`, {}]));
    expect(nextStep(0, allDone, {}).kind).toBe('all-done');
  });
});
