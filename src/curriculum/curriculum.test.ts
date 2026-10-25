import { describe, expect, it } from 'vitest';
import { allLessons, graphemesTaughtThrough, tracks } from './index';

describe.each(Object.values(tracks))('$language track', (track) => {
  const lessons = allLessons(track);

  it('has six stages numbered 0 to 5', () => {
    expect(track.stages.map((s) => s.index)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('uses unique lesson and word ids', () => {
    const lessonIds = lessons.map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
    const wordIds = lessons.flatMap((l) => l.words.map((w) => w.id));
    expect(new Set(wordIds).size).toBe(wordIds.length);
  });

  it('practises 5 to 8 words per lesson', () => {
    for (const lesson of lessons) {
      expect(lesson.words.length, lesson.id).toBeGreaterThanOrEqual(5);
      expect(lesson.words.length, lesson.id).toBeLessThanOrEqual(8);
    }
  });

  it('only uses sounds the child has already been taught', () => {
    for (const lesson of lessons) {
      const taught = new Set(graphemesTaughtThrough(track, lesson.id));
      for (const word of lesson.words) {
        for (const tile of word.tiles) {
          expect(taught.has(tile.grapheme), `${word.text} uses "${tile.grapheme}" before it is taught`).toBe(true);
        }
      }
    }
  });

  it('spells every word exactly with its tiles', () => {
    for (const word of lessons.flatMap((l) => l.words)) {
      expect(word.tiles.map((t) => t.grapheme).join('')).toBe(word.text);
    }
  });

  it('has a sound entry for every tile', () => {
    for (const word of lessons.flatMap((l) => l.words)) {
      for (const tile of word.tiles) {
        expect(track.sounds[tile.sound], `${word.text}: no sound "${tile.sound}"`).toBeDefined();
      }
    }
  });

  it('introduces every new spelling only once', () => {
    const all = lessons.flatMap((l) => l.newGraphemes);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('French syllables', () => {
  it('cover every tile of every word', () => {
    for (const word of allLessons(tracks.fr).flatMap((l) => l.words)) {
      expect(word.syllables, word.text).toBeDefined();
      expect(
        word.syllables!.reduce((a, b) => a + b, 0),
        word.text,
      ).toBe(word.tiles.length);
    }
  });
});
