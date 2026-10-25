import type { Grapheme, Tile, TrickyWord, Word } from './types';

export function isSplit(grapheme: string): boolean {
  return /^[a-z]-e$/.test(grapheme);
}

/**
 * Turns tiles back into the written word. A split tile (a-e) puts its first
 * letter in place and its "e" after the tile that follows: c + a-e + k = cake.
 */
export function spell(tiles: Tile[]): string {
  let out = '';
  let pendingE = false;
  tiles.forEach((tile, i) => {
    if (isSplit(tile.grapheme)) {
      out += tile.grapheme[0];
      pendingE = true;
      return;
    }
    out += tile.grapheme;
    if (pendingE && i > 0 && isSplit(tiles[i - 1].grapheme)) {
      out += 'e';
      pendingE = false;
    }
  });
  return out;
}

/** "oo:oo_short" -> grapheme oo, sound oo_short. "sh" -> sh with its usual sound. */
export function parseGraphemeKey(key: string, graphemes: Record<string, Grapheme>): Tile {
  const [grapheme, sound] = key.split(':');
  return { grapheme, sound: sound ?? graphemes[grapheme]?.sound ?? grapheme };
}

/**
 * Builds a word from its tiles, space separated, in the order the sounds are
 * heard: word('kick', 'k i ck'), word('book', 'b oo:oo_short k'), word('cake', 'c a-e k').
 */
export function makeWordBuilder(graphemes: Record<string, Grapheme>) {
  return (text: string, tileSpec: string, picture?: string): Word => ({
    id: text,
    text,
    tiles: tileSpec.split(' ').map((key) => parseGraphemeKey(key, graphemes)),
    ...(picture ? { picture } : {}),
  });
}

export function tricky(...words: string[]): TrickyWord[] {
  return words.map((text) => ({ id: `tricky-${text.toLowerCase()}`, text }));
}
