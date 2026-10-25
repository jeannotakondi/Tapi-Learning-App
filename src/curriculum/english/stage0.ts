import type { Choice, Lesson, ListeningActivity } from '../types';

// Stage 0 follows Letters and Sounds Phase 1: listening, rhythm, rhyme and
// oral blending. Nothing is written on screen. Everyday sound effects (Phase 1
// "environmental sounds") need sound-effect recordings and aren't included yet.

const c = (word: string, picture: string, correct = false): Choice => ({ word, picture, ...(correct ? { correct } : {}) });

const rhyme = (target: Choice, ...options: Choice[]): ListeningActivity => ({
  id: `rhyme-${target.word}`,
  kind: 'rhyme',
  target,
  options,
});

const claps = (word: string, picture: string, beats: 1 | 2 | 3): ListeningActivity => ({
  id: `claps-${word}`,
  kind: 'claps',
  target: c(word, picture),
  beats,
});

const firstSound = (sound: string, ...options: Choice[]): ListeningActivity => ({
  id: `first-${sound}-${options.find((o) => o.correct)!.word}`,
  kind: 'first-sound',
  sound,
  options,
});

// The word must be a lesson word, so its sounds and blend recording exist.
const blend = (word: string, ...options: Choice[]): ListeningActivity => ({ id: `blend-${word}`, kind: 'blend', word, options });

const lesson = (n: number, activities: ListeningActivity[]): Lesson => ({
  id: `0-${n}`,
  stage: 0,
  newGraphemes: [],
  words: [],
  tricky: [],
  activities,
});

export const stage0Lessons: Lesson[] = [
  lesson(1, [
    rhyme(c('cat', '🐱'), c('hat', '👒', true), c('dog', '🐶')),
    rhyme(c('bee', '🐝'), c('car', '🚗'), c('tree', '🌳', true)),
    rhyme(c('mouse', '🐭'), c('house', '🏠', true), c('fish', '🐟')),
    rhyme(c('snake', '🐍'), c('bus', '🚌'), c('cake', '🎂', true)),
    rhyme(c('goat', '🐐'), c('boat', '⛵', true), c('pen', '🖊️')),
    rhyme(c('fox', '🦊'), c('sun', '☀️'), c('box', '📦', true)),
  ]),
  lesson(2, [
    claps('dog', '🐶', 1),
    claps('rabbit', '🐰', 2),
    claps('banana', '🍌', 3),
    claps('sun', '☀️', 1),
    claps('tiger', '🐯', 2),
    claps('butterfly', '🦋', 3),
  ]),
  lesson(3, [
    firstSound('s', c('snake', '🐍', true), c('dog', '🐶')),
    firstSound('m', c('bus', '🚌'), c('mouse', '🐭', true)),
    firstSound('b', c('ball', '⚽', true), c('fish', '🐟')),
    firstSound('f', c('cat', '🐱'), c('fish', '🐟', true)),
    firstSound('t', c('tiger', '🐯', true), c('moon', '🌕')),
    firstSound('d', c('sun', '☀️'), c('duck', '🦆', true)),
  ]),
  lesson(4, [
    blend('cat', c('cat', '🐱', true), c('dog', '🐶'), c('sun', '☀️')),
    blend('dog', c('bus', '🚌'), c('dog', '🐶', true), c('hat', '👒')),
    blend('sun', c('pig', '🐷'), c('cat', '🐱'), c('sun', '☀️', true)),
    blend('pig', c('pig', '🐷', true), c('bed', '🛏️'), c('dog', '🐶')),
    blend('bus', c('sun', '☀️'), c('bus', '🚌', true), c('pig', '🐷')),
    blend('hat', c('cat', '🐱'), c('bus', '🚌'), c('hat', '👒', true)),
  ]),
];
