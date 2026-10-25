import type { Language, Word } from './types';

interface WordOptions {
  picture?: string;
  syllables?: number[];
  islandWord?: boolean;
  /** Tiles (by position) that are silent letters. */
  silent?: number[];
}

/**
 * Builds a word from a space-separated tile list: word('en', 'kick', 'k i ck').
 * Each tile's sound comes from the track's spelling table, so c, k and ck all
 * play the same /k/ recording.
 */
export function makeWordBuilder(language: Language, graphemeSounds: Record<string, string>) {
  return (text: string, tileSpec: string, options: WordOptions = {}): Word => {
    const graphemes = tileSpec.split(' ');
    return {
      id: `${language}-${text}`,
      text,
      tiles: graphemes.map((grapheme, i) => ({
        grapheme,
        sound: graphemeSounds[grapheme] ?? grapheme,
        ...(options.silent?.includes(i) ? { silent: true } : {}),
      })),
      ...(options.picture ? { picture: options.picture } : {}),
      ...(options.syllables ? { syllables: options.syllables } : {}),
      ...(options.islandWord ? { islandWord: true } : {}),
    };
  };
}
