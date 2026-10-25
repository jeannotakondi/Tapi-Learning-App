import { describe, expect, it } from 'vitest';
import { tracks } from '../curriculum';
import type { Profile } from '../store/store';
import { graphemesLearned, lastSevenDays, soundsToPractise, wordsBuilt } from './progress';

const profile: Profile = {
  id: 'p1',
  name: 'Sam',
  avatar: 'whale',
  language: 'en',
  stage: { en: 1, fr: 1 },
  lessons: { 'en-1-1': { stars: 3, completedAt: '' }, 'en-1-2': { stars: 2, completedAt: '' } },
  words: { 'en-cat': 3, 'en-sat': 2, 'fr-la': 3 },
  misses: { 'en:b': 5, 'en:d': 3, 'en:a': 1, 'fr:l': 4 },
  review: { en: ['i'], fr: [] },
  playtime: { '2026-10-20': 300, '2026-10-25': 630 },
  createdAt: '',
};

describe('progress for grown-ups', () => {
  it('lists sounds from finished lessons', () => {
    expect(graphemesLearned(tracks.en, profile)).toEqual(['s', 'a', 't', 'p', 'i', 'n']);
  });

  it('counts words per language', () => {
    expect(wordsBuilt(profile, 'en')).toBe(2);
    expect(wordsBuilt(profile, 'fr')).toBe(1);
  });

  it('puts review sounds first, then frequent slips, for one language only', () => {
    expect(soundsToPractise(profile, 'en')).toEqual(['i', 'b', 'd']);
    expect(soundsToPractise(profile, 'fr')).toEqual(['l']);
  });

  it('builds a 7-day playtime chart ending today', () => {
    const days = lastSevenDays(profile.playtime, new Date(2026, 9, 25));
    expect(days).toHaveLength(7);
    expect(days[0].key).toBe('2026-10-19');
    expect(days[1].minutes).toBe(5);
    expect(days[6].minutes).toBe(11);
  });
});
