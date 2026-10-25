import { makeWordBuilder } from './build';
import type { Track } from './types';

// Sound ids stay ASCII so audio file names are safe on every platform.
const graphemeSounds: Record<string, string> = {
  é: 'e_aigu',
};

const w = makeWordBuilder('fr', graphemeSounds);

/**
 * French track. Stage order follows the Eduscol 2017 progression
 * ("100% de réussite en CP"), steps grouped as in the lesson plan.
 * Stage 1 covers steps 1 to 6. With so few letters there are very few real
 * words, so most items are syllables and made-up "island words", as in the source.
 */
export const french: Track = {
  language: 'fr',
  graphemeSounds,
  sounds: {
    a: { id: 'a', ttsHint: 'a', example: 'avion', examplePicture: '✈️' },
    i: { id: 'i', ttsHint: 'i', example: 'île', examplePicture: '🏝️' },
    l: { id: 'l', ttsHint: 'lll', example: 'lion', examplePicture: '🦁' },
    o: { id: 'o', ttsHint: 'o', example: 'orange', examplePicture: '🍊' },
    r: { id: 'r', ttsHint: 'rrr', example: 'renard', examplePicture: '🦊' },
    u: { id: 'u', ttsHint: 'u', example: 'lune', examplePicture: '🌙' },
    e_aigu: { id: 'e_aigu', ttsHint: 'é', example: 'éléphant', examplePicture: '🐘' },
    f: { id: 'f', ttsHint: 'fff', example: 'feu', examplePicture: '🔥' },
    j: { id: 'j', ttsHint: 'jjj', example: 'judo', examplePicture: '🥋' },
  },
  stages: [
    { index: 0, land: 'whisper-beach', title: 'Écoute', source: 'Oral work before Eduscol step 1', lessons: [] },
    {
      index: 1,
      land: 'first-sound-forest',
      title: 'Premières lettres',
      source: 'Eduscol progression, steps 1 to 6',
      lessons: [
        {
          id: 'fr-1-1',
          stage: 1,
          newGraphemes: ['a', 'i', 'l'],
          words: [
            w('la', 'l a', { syllables: [2] }),
            w('li', 'l i', { syllables: [2], islandWord: true }),
            w('il', 'i l', { syllables: [2] }),
            w('al', 'a l', { syllables: [2], islandWord: true }),
            w('lila', 'l i l a', { syllables: [2, 2], islandWord: true }),
          ],
        },
        {
          id: 'fr-1-2',
          stage: 1,
          newGraphemes: ['o', 'r'],
          words: [
            w('ro', 'r o', { syllables: [2], islandWord: true }),
            w('ri', 'r i', { syllables: [2], islandWord: true }),
            w('or', 'o r', { syllables: [2], picture: '🪙' }),
            w('ira', 'i r a', { syllables: [1, 2] }),
            w('lira', 'l i r a', { syllables: [2, 2] }),
            w('rira', 'r i r a', { syllables: [2, 2] }),
          ],
        },
        {
          id: 'fr-1-3',
          stage: 1,
          newGraphemes: ['u', 'é'],
          words: [
            w('lu', 'l u', { syllables: [2] }),
            w('ru', 'r u', { syllables: [2], islandWord: true }),
            w('ré', 'r é', { syllables: [2] }),
            w('lé', 'l é', { syllables: [2], islandWord: true }),
            w('élu', 'é l u', { syllables: [1, 2] }),
          ],
        },
        {
          id: 'fr-1-4',
          stage: 1,
          newGraphemes: ['f'],
          words: [
            w('fa', 'f a', { syllables: [2] }),
            w('fi', 'f i', { syllables: [2], islandWord: true }),
            w('fil', 'f i l', { syllables: [3], picture: '🧵' }),
            w('fila', 'f i l a', { syllables: [2, 2] }),
            w('filé', 'f i l é', { syllables: [2, 2] }),
          ],
        },
        {
          id: 'fr-1-5',
          stage: 1,
          newGraphemes: ['j'],
          words: [
            w('ja', 'j a', { syllables: [2], islandWord: true }),
            w('jo', 'j o', { syllables: [2], islandWord: true }),
            w('ju', 'j u', { syllables: [2], islandWord: true }),
            w('joli', 'j o l i', { syllables: [2, 2] }),
            w('jura', 'j u r a', { syllables: [2, 2] }),
          ],
        },
      ],
    },
    { index: 2, land: 'echo-hills', title: 'Deux lettres, un son', source: 'Eduscol progression, steps 7 to 11', lessons: [] },
    { index: 3, land: 'rainbow-river', title: 'Consonnes', source: 'Eduscol progression, steps 12 to 26', lessons: [] },
    { index: 4, land: 'windy-cliffs', title: 'Sons du nez', source: 'Eduscol progression, steps 27 to 34', lessons: [] },
    { index: 5, land: 'singing-mountain', title: 'Autres écritures', source: 'Eduscol progression, steps 35 to 75', lessons: [] },
  ],
};
