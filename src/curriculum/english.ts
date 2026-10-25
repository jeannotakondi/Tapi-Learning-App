import { makeWordBuilder } from './build';
import type { Track } from './types';

// Spellings that share a sound recording. Anything not listed maps to itself.
const graphemeSounds: Record<string, string> = {
  c: 'k',
  ck: 'k',
  ff: 'f',
  ll: 'l',
  ss: 's',
};

const w = makeWordBuilder('en', graphemeSounds);

/**
 * British English track. Stage order follows Letters and Sounds (DfES, 2007).
 * Only Stage 1 (Phase 2) has playable lessons so far; the other stages are
 * listed so the map, placement and parent tools already know about them.
 *
 * Lesson 1 brings in all of Set 1 (s a t p) and lesson 9 brings in three
 * spellings, because one or two sounds alone can't make enough real words.
 * The rest take the Phase 2 sets two sounds at a time, in order.
 */
export const english: Track = {
  language: 'en',
  graphemeSounds,
  sounds: {
    s: { id: 's', ttsHint: 'sss', example: 'snake', examplePicture: '🐍' },
    a: { id: 'a', ttsHint: 'a', example: 'apple', examplePicture: '🍎' },
    t: { id: 't', ttsHint: 't', example: 'tiger', examplePicture: '🐯' },
    p: { id: 'p', ttsHint: 'p', example: 'penguin', examplePicture: '🐧' },
    i: { id: 'i', ttsHint: 'ih', example: 'insect', examplePicture: '🐛' },
    n: { id: 'n', ttsHint: 'nnn', example: 'net', examplePicture: '🥅' },
    m: { id: 'm', ttsHint: 'mmm', example: 'mouse', examplePicture: '🐭' },
    d: { id: 'd', ttsHint: 'd', example: 'dog', examplePicture: '🐶' },
    g: { id: 'g', ttsHint: 'g', example: 'goat', examplePicture: '🐐' },
    o: { id: 'o', ttsHint: 'o', example: 'octopus', examplePicture: '🐙' },
    k: { id: 'k', ttsHint: 'k', example: 'kite', examplePicture: '🪁' },
    e: { id: 'e', ttsHint: 'eh', example: 'egg', examplePicture: '🥚' },
    u: { id: 'u', ttsHint: 'uh', example: 'umbrella', examplePicture: '☂️' },
    r: { id: 'r', ttsHint: 'rrr', example: 'rabbit', examplePicture: '🐰' },
    h: { id: 'h', ttsHint: 'h', example: 'hat', examplePicture: '👒' },
    b: { id: 'b', ttsHint: 'b', example: 'ball', examplePicture: '⚽' },
    f: { id: 'f', ttsHint: 'fff', example: 'fish', examplePicture: '🐟' },
    l: { id: 'l', ttsHint: 'lll', example: 'lion', examplePicture: '🦁' },
  },
  stages: [
    {
      index: 0,
      land: 'whisper-beach',
      title: 'Listening',
      source: 'Letters and Sounds, Phase 1',
      lessons: [],
    },
    {
      index: 1,
      land: 'first-sound-forest',
      title: 'First sounds',
      source: 'Letters and Sounds, Phase 2',
      lessons: [
        {
          id: 'en-1-1',
          stage: 1,
          newGraphemes: ['s', 'a', 't', 'p'],
          words: [w('at', 'a t'), w('sat', 's a t'), w('pat', 'p a t'), w('tap', 't a p', { picture: '🚰' }), w('sap', 's a p')],
        },
        {
          id: 'en-1-2',
          stage: 1,
          newGraphemes: ['i', 'n'],
          words: [
            w('in', 'i n'),
            w('it', 'i t'),
            w('pin', 'p i n', { picture: '📌' }),
            w('tin', 't i n', { picture: '🥫' }),
            w('sit', 's i t', { picture: '🪑' }),
            w('nap', 'n a p', { picture: '😴' }),
            w('tip', 't i p'),
          ],
        },
        {
          id: 'en-1-3',
          stage: 1,
          newGraphemes: ['m', 'd'],
          words: [
            w('map', 'm a p', { picture: '🗺️' }),
            w('man', 'm a n', { picture: '👨' }),
            w('mat', 'm a t'),
            w('dad', 'd a d', { picture: '👨‍👧' }),
            w('sad', 's a d', { picture: '😢' }),
            w('dip', 'd i p'),
          ],
        },
        {
          id: 'en-1-4',
          stage: 1,
          newGraphemes: ['g', 'o'],
          words: [
            w('dog', 'd o g', { picture: '🐶' }),
            w('pig', 'p i g', { picture: '🐷' }),
            w('dig', 'd i g', { picture: '⛏️' }),
            w('pot', 'p o t', { picture: '🍯' }),
            w('top', 't o p'),
            w('on', 'o n'),
            w('got', 'g o t'),
          ],
        },
        {
          id: 'en-1-5',
          stage: 1,
          newGraphemes: ['c', 'k'],
          words: [
            w('cat', 'c a t', { picture: '🐱' }),
            w('cap', 'c a p', { picture: '🧢' }),
            w('cot', 'c o t', { picture: '🛏️' }),
            w('can', 'c a n'),
            w('kid', 'k i d', { picture: '🧒' }),
            w('kit', 'k i t'),
          ],
        },
        {
          id: 'en-1-6',
          stage: 1,
          newGraphemes: ['ck', 'e'],
          words: [
            w('sock', 's o ck', { picture: '🧦' }),
            w('kick', 'k i ck', { picture: '🦵' }),
            w('ten', 't e n', { picture: '🔟' }),
            w('pet', 'p e t'),
            w('neck', 'n e ck'),
            w('get', 'g e t'),
            w('deck', 'd e ck'),
          ],
        },
        {
          id: 'en-1-7',
          stage: 1,
          newGraphemes: ['u', 'r'],
          words: [
            w('sun', 's u n', { picture: '☀️' }),
            w('cup', 'c u p', { picture: '☕' }),
            w('run', 'r u n', { picture: '🏃' }),
            w('rat', 'r a t', { picture: '🐀' }),
            w('red', 'r e d', { picture: '🔴' }),
            w('mud', 'm u d'),
            w('up', 'u p'),
          ],
        },
        {
          id: 'en-1-8',
          stage: 1,
          newGraphemes: ['h', 'b'],
          words: [
            w('hat', 'h a t', { picture: '👒' }),
            w('bed', 'b e d', { picture: '🛏️' }),
            w('bus', 'b u s', { picture: '🚌' }),
            w('hug', 'h u g', { picture: '🤗' }),
            w('hot', 'h o t', { picture: '🔥' }),
            w('bag', 'b a g', { picture: '👜' }),
            w('big', 'b i g'),
          ],
        },
        {
          id: 'en-1-9',
          stage: 1,
          newGraphemes: ['f', 'ff', 'l'],
          words: [
            w('fun', 'f u n'),
            w('fan', 'f a n'),
            w('leg', 'l e g', { picture: '🦵' }),
            w('lip', 'l i p', { picture: '👄' }),
            w('log', 'l o g', { picture: '🪵' }),
            w('off', 'o ff'),
            w('puff', 'p u ff'),
          ],
        },
        {
          id: 'en-1-10',
          stage: 1,
          newGraphemes: ['ll', 'ss'],
          words: [
            w('bell', 'b e ll', { picture: '🔔' }),
            w('hill', 'h i ll', { picture: '⛰️' }),
            w('doll', 'd o ll', { picture: '🪆' }),
            w('kiss', 'k i ss', { picture: '😘' }),
            w('mess', 'm e ss'),
            w('fell', 'f e ll'),
            w('less', 'l e ss'),
          ],
        },
      ],
    },
    { index: 2, land: 'echo-hills', title: 'New consonants', source: 'Letters and Sounds, Phase 3 (first part)', lessons: [] },
    { index: 3, land: 'rainbow-river', title: 'Vowel teams', source: 'Letters and Sounds, Phase 3 (second part)', lessons: [] },
    { index: 4, land: 'windy-cliffs', title: 'Clusters', source: 'Letters and Sounds, Phase 4', lessons: [] },
    { index: 5, land: 'singing-mountain', title: 'Other spellings', source: 'Letters and Sounds, Phase 5', lessons: [] },
  ],
};
