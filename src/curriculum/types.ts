/** One speech sound (phoneme). Audio is recorded once per sound, not per spelling. */
export interface Sound {
  id: string;
  /**
   * Text the computer voice reads when no recording exists yet. Only a
   * stand-in: synthetic voices add an "uh" to short sounds, which is exactly
   * what the lesson plan warns about. Replace with real recordings.
   */
  ttsHint: string;
}

/**
 * A spelling and the sound it makes. Keys look like "sh", or "oo:oo_short"
 * when a spelling has a second sound (book vs moon).
 */
export interface Grapheme {
  grapheme: string;
  sound: string;
  /** Word Tapi uses to introduce it, e.g. "snake" for s. */
  example: string;
  picture?: string;
}

/**
 * A draggable tile. One tile per sound unit: "ship" is sh + i + p.
 * A split tile (a-e in "cake") places its second letter after the next tile.
 */
export interface Tile {
  grapheme: string;
  sound: string;
}

export interface Word {
  id: string;
  text: string;
  /** Tiles in the order the sounds are heard. */
  tiles: Tile[];
  picture?: string;
}

/** A word that can't be sounded out yet. Tapi says it and the child finds it. */
export interface TrickyWord {
  id: string;
  text: string;
}

/** Stage 0 games. Listening only: no letters on screen. */
export type ListeningActivity =
  | { id: string; kind: 'rhyme'; target: Choice; options: Choice[] }
  | { id: string; kind: 'claps'; target: Choice; beats: 1 | 2 | 3 }
  | { id: string; kind: 'first-sound'; sound: string; options: Choice[] }
  | { id: string; kind: 'blend'; word: string; options: Choice[] };

/** A picture the child can pick. The first option in data is not always the answer. */
export interface Choice {
  word: string;
  picture: string;
  correct?: boolean;
}

export interface Lesson {
  id: string;
  stage: number;
  /** Graphemes introduced, as keys into Track.graphemes, in teaching order. */
  newGraphemes: string[];
  /** Tapi line said at the start when there's no new sound (Stage 4 clusters). */
  focus?: 'clusters';
  words: Word[];
  tricky: TrickyWord[];
  activities: ListeningActivity[];
}

export interface StoryPage {
  text: string;
  picture: string;
}

export interface Story {
  id: string;
  stage: number;
  title: string;
  pages: StoryPage[];
}

export type LandId = 'whisper-beach' | 'first-sound-forest' | 'echo-hills' | 'rainbow-river' | 'windy-cliffs' | 'singing-mountain';

export interface Stage {
  index: number;
  land: LandId;
  /** Parent-facing name from the lesson plan. */
  title: string;
  /** Which part of Letters and Sounds the stage follows. */
  source: string;
  lessons: Lesson[];
  story?: Story;
}

export interface Track {
  sounds: Record<string, Sound>;
  graphemes: Record<string, Grapheme>;
  stages: Stage[];
}
