import type { Grapheme, Sound } from '../types';

/**
 * British English speech sounds used by the lessons. One recording each.
 * ttsHint is only for the computer-voice stand-in.
 */
const SOUND_HINTS: Record<string, string> = {
  s: 'sss', a: 'a', t: 't', p: 'p', i: 'ih', n: 'nnn', m: 'mmm', d: 'd', g: 'g', o: 'o',
  k: 'k', e: 'eh', u: 'uh', r: 'rrr', h: 'h', b: 'b', f: 'fff', l: 'lll',
  j: 'j', v: 'vvv', w: 'w', x: 'ks', y: 'y', z: 'zzz', kw: 'kw',
  ch: 'ch', sh: 'shhh', th: 'thhh', th_voiced: 'th', ng: 'ng',
  ai: 'ay', ee: 'ee', igh: 'eye', oa: 'oh', oo: 'oo', oo_short: 'u', ar: 'ar', or: 'or',
  ur: 'er', ow: 'ow', oi: 'oy', ear: 'ear', air: 'air', ure: 'ure', er: 'uh', yoo: 'you',
}; // prettier-ignore

export const sounds: Record<string, Sound> = Object.fromEntries(Object.entries(SOUND_HINTS).map(([id, ttsHint]) => [id, { id, ttsHint }]));

// [key, sound, example word, picture]. Key is "grapheme" or "grapheme:sound".
const GRAPHEMES: Array<[string, string, string, string?]> = [
  // Phase 2
  ['s', 's', 'snake', '🐍'],
  ['a', 'a', 'apple', '🍎'],
  ['t', 't', 'tiger', '🐯'],
  ['p', 'p', 'penguin', '🐧'],
  ['i', 'i', 'insect', '🐛'],
  ['n', 'n', 'net', '🥅'],
  ['m', 'm', 'mouse', '🐭'],
  ['d', 'd', 'dog', '🐶'],
  ['g', 'g', 'goat', '🐐'],
  ['o', 'o', 'octopus', '🐙'],
  ['c', 'k', 'cat', '🐱'],
  ['k', 'k', 'kite', '🪁'],
  ['ck', 'k', 'duck', '🦆'],
  ['e', 'e', 'egg', '🥚'],
  ['u', 'u', 'umbrella', '☂️'],
  ['r', 'r', 'rabbit', '🐰'],
  ['h', 'h', 'hat', '👒'],
  ['b', 'b', 'ball', '⚽'],
  ['f', 'f', 'fish', '🐟'],
  ['ff', 'f', 'puff', '💨'],
  ['l', 'l', 'lion', '🦁'],
  ['ll', 'l', 'bell', '🔔'],
  ['ss', 's', 'dress', '👗'],
  // Phase 3, first part
  ['j', 'j', 'juggler', '🤹'],
  ['v', 'v', 'volcano', '🌋'],
  ['w', 'w', 'web', '🕸️'],
  ['x', 'x', 'fox', '🦊'],
  ['y', 'y', 'yo-yo', '🪀'],
  ['z', 'z', 'zebra', '🦓'],
  ['zz', 'z', 'buzz', '🐝'],
  ['qu', 'kw', 'queen', '👸'],
  ['ch', 'ch', 'cheese', '🧀'],
  ['sh', 'sh', 'sheep', '🐑'],
  ['th', 'th', 'thumb', '👍'],
  ['th:th_voiced', 'th_voiced', 'feather', '🪶'],
  ['ng', 'ng', 'king', '👑'],
  // Phase 3, second part
  ['ai', 'ai', 'snail', '🐌'],
  ['ee', 'ee', 'bee', '🐝'],
  ['igh', 'igh', 'night', '🌙'],
  ['oa', 'oa', 'goat', '🐐'],
  ['oo', 'oo', 'moon', '🌕'],
  ['oo:oo_short', 'oo_short', 'book', '📖'],
  ['ar', 'ar', 'car', '🚗'],
  ['or', 'or', 'fork', '🍴'],
  ['ur', 'ur', 'turtle', '🐢'],
  ['ow', 'ow', 'cow', '🐄'],
  ['oi', 'oi', 'coin', '🪙'],
  ['ear', 'ear', 'ear', '👂'],
  ['air', 'air', 'chair', '🪑'],
  ['ure', 'ure', 'cure'],
  ['er', 'er', 'ladder', '🪜'],
  // Phase 5: new spellings, mostly for sounds the child already knows
  ['ay', 'ai', 'crayon', '🖍️'],
  ['ou', 'ow', 'cloud', '☁️'],
  ['ie', 'igh', 'pie', '🥧'],
  ['ea', 'ee', 'leaf', '🍃'],
  ['oy', 'oi', 'boy', '👦'],
  ['ir', 'ur', 'bird', '🐦'],
  ['ue', 'oo', 'blue', '🔵'],
  ['ue:yoo', 'yoo', 'rescue', '🛟'],
  ['aw', 'or', 'paw', '🐾'],
  ['wh', 'w', 'wheel', '🛞'],
  ['ph', 'f', 'phone', '📱'],
  ['ew', 'oo', 'screw', '🔩'],
  ['ew:yoo', 'yoo', 'few'],
  ['oe', 'oa', 'toe', '🦶'],
  ['au', 'or', 'haunted', '👻'],
  ['ey', 'ee', 'key', '🔑'],
  ['a-e', 'ai', 'cake', '🎂'],
  ['e-e', 'ee', 'complete'],
  ['i-e', 'igh', 'bike', '🚲'],
  ['o-e', 'oa', 'bone', '🦴'],
  ['u-e', 'yoo', 'cube', '🧊'],
  ['u-e:oo', 'oo', 'flute', '🪈'],
];

export const graphemes: Record<string, Grapheme> = Object.fromEntries(
  GRAPHEMES.map(([key, sound, example, picture]) => [
    key,
    { grapheme: key.split(':')[0], sound, example, ...(picture ? { picture } : {}) },
  ]),
);
