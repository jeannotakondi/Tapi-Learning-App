import { describe, expect, it } from 'vitest';
import { migrate, type Profile } from '../store/store';
import { graphemesLearned, lastSevenDays, soundsToPractise, trickyWordsLearned, wordsBuilt } from './progress';
import { currentItem, placementStage, recordPlacementItem, startPlacement } from './placement';

const profile: Profile = {
  id: 'p1',
  name: 'Sam',
  avatar: 'whale',
  stage: 1,
  lessons: { '1-1': { stars: 3, completedAt: '' }, '1-3': { stars: 2, completedAt: '' } },
  words: { cat: 3, sat: 2 },
  misses: { b: 5, d: 3, a: 1 },
  review: ['i'],
  stories: {},
  playtime: { '2026-10-20': 300, '2026-10-25': 630 },
  createdAt: '',
};

describe('progress for grown-ups', () => {
  it('lists sounds and tricky words from finished lessons', () => {
    expect(graphemesLearned(profile)).toEqual(['s', 'a', 't', 'p', 'm', 'd']);
    expect(trickyWordsLearned(profile)).toEqual(['the', 'to']);
    expect(wordsBuilt(profile)).toBe(2);
  });

  it('puts review sounds first, then frequent slips', () => {
    expect(soundsToPractise(profile)).toEqual(['i', 'b', 'd']);
  });

  it('builds a 7-day playtime chart ending today', () => {
    const days = lastSevenDays(profile.playtime, new Date(2026, 9, 25));
    expect(days).toHaveLength(7);
    expect(days[0].key).toBe('2026-10-19');
    expect(days[1].minutes).toBe(5);
    expect(days[6].minutes).toBe(11);
  });
});

describe('placement game', () => {
  const play = (results: boolean[]) => {
    let state = startPlacement();
    for (const passed of results) {
      if (state.finished) break;
      expect(currentItem(state)).toBeDefined();
      state = recordPlacementItem(state, passed);
    }
    return state;
  };

  it('places at Stage 0 after missing both listening items', () => {
    const state = play([false, false]);
    expect(state.finished).toBe(true);
    expect(placementStage(state)).toBe(0);
  });

  it('stops after two misses in a row and keeps the last check passed', () => {
    // Listening passed, then sat ok, pin missed, dog missed: stop.
    const state = play([true, true, true, false, false]);
    expect(state.finished).toBe(true);
    expect(placementStage(state)).toBe(1);
  });

  it('places at Stage 4 when everything passes', () => {
    const state = play(Array(9).fill(true));
    expect(state.finished).toBe(true);
    expect(placementStage(state)).toBe(4);
  });

  it('keeps going after a single miss', () => {
    // Miss one Stage 1 word, pass everything after: check 2 not passed, checks 3 and 4 passed.
    const state = play([true, true, false, true, true, true, true, true, true]);
    expect(placementStage(state)).toBe(4);
  });
});

describe('saved data from version 1', () => {
  it('keeps English progress and drops French', () => {
    const migrated = migrate({
      version: 1,
      settings: { volume: 0.5 },
      profiles: [
        {
          id: 'x',
          name: 'Ada',
          avatar: 'bunny',
          language: 'fr',
          stage: { en: 2, fr: 1 },
          lessons: { 'en-1-1': { stars: 3 }, 'fr-1-1': { stars: 1 } },
          words: { 'en-cat': 3, 'fr-la': 2 },
          misses: { 'en:b': 2, 'fr:l': 4 },
          review: { en: ['a'], fr: ['l'] },
          playtime: { '2026-10-25': 60 },
        },
      ],
    });
    const p = migrated.profiles[0];
    expect(migrated.version).toBe(2);
    expect(p.stage).toBe(2);
    expect(Object.keys(p.lessons)).toEqual(['1-1']);
    expect(p.words).toEqual({ cat: 3 });
    expect(p.misses).toEqual({ b: 2 });
    expect(p.review).toEqual(['a']);
  });
});
