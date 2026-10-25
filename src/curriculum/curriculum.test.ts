import { describe, expect, it } from 'vitest';
import { storyWords } from './english/stories';
import { allLessons, allStories, canDecode, isSplit, lexicon, spell, storyTokens, taughtByEndOfStage, taughtThrough, track } from './index';

const lessons = allLessons();
const tileLessons = lessons.filter((l) => l.stage > 0);
const words = tileLessons.flatMap((l) => l.words);

describe('English track', () => {
  it('has six stages numbered 0 to 5, each with lessons', () => {
    expect(track.stages.map((s) => s.index)).toEqual([0, 1, 2, 3, 4, 5]);
    for (const stage of track.stages) expect(stage.lessons.length, `stage ${stage.index}`).toBeGreaterThan(0);
  });

  it('uses unique lesson ids and unique words', () => {
    const ids = lessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    const texts = [...words, ...storyWords].map((w) => w.text);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('practises 5 to 8 words per lesson from Stage 1 on', () => {
    for (const lesson of tileLessons) {
      expect(lesson.words.length, lesson.id).toBeGreaterThanOrEqual(5);
      expect(lesson.words.length, lesson.id).toBeLessThanOrEqual(8);
      expect(lesson.activities, lesson.id).toEqual([]);
    }
  });

  it('teaches each spelling once, and only ones in the spelling table', () => {
    const keys = lessons.flatMap((l) => l.newGraphemes);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(track.graphemes[key], key).toBeDefined();
  });

  it('teaches every spelling in the table', () => {
    const taught = new Set(lessons.flatMap((l) => l.newGraphemes));
    for (const key of Object.keys(track.graphemes)) expect(taught.has(key), `${key} is never taught`).toBe(true);
  });

  it('only uses sounds the child has already been taught', () => {
    for (const lesson of tileLessons) {
      const taught = taughtThrough(lesson.id);
      for (const word of lesson.words) {
        const missing = word.tiles.filter((t) => !taught.pairs.has(`${t.grapheme}:${t.sound}`)).map((t) => `${t.grapheme}:${t.sound}`);
        expect(missing, `${lesson.id} "${word.text}" uses sounds not taught yet`).toEqual([]);
      }
    }
  });

  it('spells every word exactly with its tiles, including split spellings', () => {
    for (const word of [...words, ...storyWords]) expect(spell(word.tiles), word.text).toBe(word.text);
    expect(spell(lexicon.get('cake')!.tiles)).toBe('cake');
    expect(spell(lexicon.get('complete')!.tiles)).toBe('complete');
  });

  it('always follows a split tile with another tile', () => {
    for (const word of words) {
      word.tiles.forEach((t, i) => {
        if (isSplit(t.grapheme)) expect(word.tiles[i + 1], word.text).toBeDefined();
      });
    }
  });

  it('has a sound for every tile', () => {
    for (const word of [...words, ...storyWords]) {
      for (const tile of word.tiles) expect(track.sounds[tile.sound], `${word.text}: ${tile.sound}`).toBeDefined();
    }
  });

  it('teaches each tricky word once', () => {
    const tricky = lessons.flatMap((l) => l.tricky.map((t) => t.text.toLowerCase()));
    expect(new Set(tricky).size).toBe(tricky.length);
  });
});

const VOWEL_SOUNDS = new Set([
  'a',
  'e',
  'i',
  'o',
  'u',
  'ai',
  'ee',
  'igh',
  'oa',
  'oo',
  'oo_short',
  'ar',
  'or',
  'ur',
  'ow',
  'oi',
  'ear',
  'air',
  'ure',
  'er',
  'yoo',
]);
// Letters and Sounds counts "and" as decodable in Phase 2, before clusters are taught.
const CLUSTER_ALLOWED_EARLY = new Set(['and']);

function hasCluster(text: string): boolean {
  const word = lexicon.get(text);
  if (!word || CLUSTER_ALLOWED_EARLY.has(text)) return false;
  return word.tiles.some((t, i) => i > 0 && !VOWEL_SOUNDS.has(t.sound) && !VOWEL_SOUNDS.has(word.tiles[i - 1].sound));
}

describe('Consonant clusters', () => {
  it('only appear from Stage 4, in lessons and stories', () => {
    for (const lesson of tileLessons.filter((l) => l.stage < 4)) {
      for (const word of lesson.words) expect(hasCluster(word.text), `${lesson.id} "${word.text}" has a cluster`).toBe(false);
    }
    for (const story of allStories().filter((s) => s.stage < 4)) {
      for (const page of story.pages) {
        for (const { key } of storyTokens(page.text)) expect(hasCluster(key), `${story.id} "${key}" has a cluster`).toBe(false);
      }
    }
  });
});

describe('Stage 0 listening games', () => {
  const stage0 = track.stages[0].lessons;

  it('have 5 to 8 activities and no letters', () => {
    for (const lesson of stage0) {
      expect(lesson.words).toEqual([]);
      expect(lesson.newGraphemes).toEqual([]);
      expect(lesson.activities.length).toBeGreaterThanOrEqual(5);
      expect(lesson.activities.length).toBeLessThanOrEqual(8);
    }
  });

  it('have exactly one right answer where there is a choice', () => {
    for (const activity of stage0.flatMap((l) => l.activities)) {
      if (activity.kind === 'claps') continue;
      expect(activity.options.filter((o) => o.correct).length, activity.id).toBe(1);
    }
  });

  it('only blend words that have tiles and recordings', () => {
    for (const activity of stage0.flatMap((l) => l.activities)) {
      if (activity.kind === 'blend') expect(lexicon.get(activity.word), activity.id).toBeDefined();
      if (activity.kind === 'first-sound') expect(track.sounds[activity.sound], activity.id).toBeDefined();
    }
  });
});

describe('Stories', () => {
  it('end every reading stage', () => {
    for (const stage of track.stages.slice(1)) expect(stage.story, `stage ${stage.index}`).toBeDefined();
  });

  it('only use words the child can read by the end of that stage', () => {
    for (const story of allStories()) {
      const taught = taughtByEndOfStage(story.stage);
      for (const page of story.pages) {
        for (const { key } of storyTokens(page.text)) {
          const word = lexicon.get(key);
          const ok = taught.tricky.has(key) || (word !== undefined && canDecode(word, taught));
          expect(ok, `${story.id}: "${key}" can't be read by the end of stage ${story.stage}`).toBe(true);
        }
      }
    }
  });
});
