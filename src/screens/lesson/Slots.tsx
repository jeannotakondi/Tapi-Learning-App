import type { ReactNode, RefObject } from 'react';
import { isSplit, type Word } from '../../curriculum';
import { tileTextSize } from '../../components/TileGlyph';
import { Icon } from '../../components/Icon';

interface Props {
  word: Word;
  filled: number;
  activeRef?: RefObject<HTMLDivElement>;
  /** Tiles lit up while blending. */
  lit?: number[];
  onHearTarget?: () => void;
}

/**
 * One slot per sound, shown in spelling order. A split spelling (a-e in
 * "cake") takes two slots, before and after the next sound, joined by a curve.
 * Both halves fill when the linked tile is placed. The next empty slot glows.
 */
export function Slots({ word, filled, activeRef, lit = [], onHearTarget }: Props) {
  // Up to 8 slots must fit a 350px-wide phone screen.
  const slotCount = word.tiles.length + word.tiles.filter((t) => isSplit(t.grapheme)).length;
  const compact = slotCount > 5;
  const size = slotCount <= 5 ? 'h-24 w-20' : slotCount === 6 ? 'h-20 w-[52px]' : slotCount === 7 ? 'h-20 w-11' : 'h-16 w-[38px]';

  const slot = (tileIndex: number, letters: string, key: string, isActiveHalf: boolean) => {
    const isFilled = tileIndex < filled;
    const isActive = tileIndex === filled;
    if (isFilled) {
      return (
        <div
          key={key}
          className={`flex ${size} items-center justify-center rounded-lg font-display font-extrabold leading-none transition-all duration-150 ${tileTextSize(letters, compact)} ${
            lit.includes(tileIndex)
              ? '-translate-y-2 scale-110 bg-tertiary-fixed text-on-tertiary-fixed'
              : 'bg-surface-container-lowest text-primary'
          }`}
          style={{ boxShadow: '0 6px 0 0 #91f8b8, 0 10px 16px rgba(0,106,62,0.14)' }}
        >
          {letters}
        </div>
      );
    }
    if (isActive) {
      return (
        <div key={key} ref={isActiveHalf ? activeRef : undefined} className="relative">
          <button
            type="button"
            aria-label="Hear the sound that goes here"
            tabIndex={isActiveHalf ? 0 : -1}
            onClick={onHearTarget}
            className={`well flex ${size} animate-slot-glow flex-col items-center justify-center rounded-lg border-[3px] border-dashed border-tertiary bg-surface-container-high text-tertiary`}
          >
            <Icon name="ear" className="h-7 w-7 animate-pulse" />
          </button>
        </div>
      );
    }
    return (
      <div
        key={key}
        className={`well flex ${size} items-center justify-center rounded-lg border-[3px] border-dashed border-outline-variant bg-surface-container`}
        aria-hidden="true"
      />
    );
  };

  const parts: ReactNode[] = [];
  for (let i = 0; i < word.tiles.length; i++) {
    const tile = word.tiles[i];
    if (isSplit(tile.grapheme) && word.tiles[i + 1]) {
      // The split pair wraps the next sound: [a] [k] [e], with a curve from a to e.
      parts.push(
        <div key={`split-${i}`} className={`relative flex items-center pt-3 ${compact ? 'gap-1.5' : 'gap-2'}`}>
          <svg
            className="pointer-events-none absolute left-[16%] right-[16%] top-0 h-4 w-[68%] text-secondary"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M2 19 Q50 -8 98 19"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={i < filled ? undefined : '8 8'}
            />
          </svg>
          {slot(i, tile.grapheme[0], `${i}-a`, true)}
          {slot(i + 1, word.tiles[i + 1].grapheme, `${i + 1}`, true)}
          {slot(i, 'e', `${i}-e`, false)}
        </div>,
      );
      i++;
      continue;
    }
    parts.push(slot(i, tile.grapheme, `${i}`, true));
  }

  return (
    <div className={`flex w-full items-end justify-center py-4 ${compact ? 'gap-1.5' : 'gap-2'}`} aria-label="Spaces for the sounds">
      {parts}
    </div>
  );
}
