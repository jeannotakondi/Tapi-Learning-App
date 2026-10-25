import type { Language } from '../curriculum';

/**
 * Everything Tapi says between activities. Each line becomes one recording:
 * public/audio/<lang>/tapi/<id>.mp3. The text doubles as the recording script.
 * French lines should be checked by a native speaker before recording.
 */
export const TAPI_LINES = {
  'who-is-playing': { en: 'Who is playing?', fr: 'Qui joue ?' },
  hello: { en: 'Hi! I am Tapi. Touch your picture to play!', fr: 'Coucou ! Je suis Tapi. Touche ta photo pour jouer !' },
  'new-sound': { en: 'Here is a new sound. Listen!', fr: 'Voici un nouveau son. Écoute !' },
  'like-in': { en: 'Like in…', fr: 'Comme dans…' },
  'listen-word': { en: 'Listen to this word.', fr: 'Écoute ce mot.' },
  'build-word': { en: 'Can you build it? Drag the sounds.', fr: 'Tu peux le construire ? Fais glisser les sons.' },
  'try-again': { en: 'Listen again. You can do it!', fr: 'Écoute encore. Tu peux le faire !' },
  'well-done': { en: 'You did it!', fr: 'Bravo, tu as réussi !' },
  'island-word': { en: 'This is an island word.', fr: 'C’est un mot de l’île.' },
  'lesson-done': {
    en: 'Brilliant! One more sound has come back to my island.',
    fr: 'Génial ! Un son de plus est revenu sur mon île.',
  },
  goodbye: { en: 'Bye bye! See you soon.', fr: 'Au revoir ! À bientôt.' },
  'land-asleep': { en: 'This island is still asleep. Come back soon!', fr: 'Cette île dort encore. Reviens bientôt !' },
  'ask-grown-up': { en: 'Ask a grown-up to help.', fr: 'Demande à un grand de t’aider.' },
} satisfies Record<string, Record<Language, string>>;

export type TapiLineId = keyof typeof TAPI_LINES;

export const LAND_LINES: Record<string, Record<Language, string>> = {
  'whisper-beach': { en: 'Whisper Beach', fr: 'La plage des murmures' },
  'first-sound-forest': { en: 'First Sound Forest', fr: 'La forêt des premiers sons' },
  'echo-hills': { en: 'Echo Hills', fr: 'Les collines de l’écho' },
  'rainbow-river': { en: 'Rainbow River', fr: 'La rivière arc-en-ciel' },
  'windy-cliffs': { en: 'Windy Cliffs', fr: 'Les falaises du vent' },
  'singing-mountain': { en: 'Singing Mountain', fr: 'La montagne qui chante' },
};
