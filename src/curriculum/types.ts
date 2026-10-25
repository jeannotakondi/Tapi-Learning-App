export type Language = 'en' | 'fr';

/** One speech sound (phoneme). Audio is recorded once per sound, not per spelling. */
export interface Sound {
  id: string;
  /**
   * Text the computer voice reads when no recording exists yet.
   * Only a stand-in: synthetic voices add an "uh" to short sounds, which is
   * exactly what the lesson plan warns about. Replace with real recordings.
   */
  ttsHint: string;
  /** Word Tapi uses to introduce the sound, e.g. "snake" for s. */
  example: string;
  examplePicture?: string;
}

/** A draggable tile. One tile per sound unit: "ship" is sh + i + p. */
export interface Tile {
  grapheme: string;
  sound: string;
  /** French silent letters: shown as a pale tile that stays quiet. */
  silent?: boolean;
}

export interface Word {
  id: string;
  text: string;
  tiles: Tile[];
  picture?: string;
  /** French only: how many tiles make each syllable, used for syllable blending (vé + lo). */
  syllables?: number[];
  /** Made-up practice word ("island word"), mainly French stage 1. */
  islandWord?: boolean;
}

export interface Lesson {
  id: string;
  stage: number;
  /** Spellings introduced in this lesson, in teaching order. */
  newGraphemes: string[];
  words: Word[];
}

export type LandId = 'whisper-beach' | 'first-sound-forest' | 'echo-hills' | 'rainbow-river' | 'windy-cliffs' | 'singing-mountain';

export interface Stage {
  index: number;
  land: LandId;
  /** Parent-facing name from the lesson plan. */
  title: string;
  /** Which part of the source curriculum the stage follows. */
  source: string;
  lessons: Lesson[];
}

export interface Track {
  language: Language;
  /** Maps each spelling to the sound it makes, e.g. ck -> k. */
  graphemeSounds: Record<string, string>;
  sounds: Record<string, Sound>;
  stages: Stage[];
}
