import type { RefObject } from 'react';
import type { Word } from '../../curriculum';
import { splitSyllables } from '../../audio/files';
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
 * One slot per sound. The next empty slot glows. For French, slots are
 * grouped by syllable so blending can run vé + lo.
 */
export function Slots({ word, filled, activeRef, lit = [], onHearTarget }: Props) {
  const groups = word.syllables ? splitSyllables(word) : [word.tiles];
  let index = 0;

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3 py-4" aria-label="Spaces for the sounds">
      {groups.map((group, g) => (
        <div key={g} className="flex items-center gap-2.5">
          {group.map((tile) => {
            const i = index++;
            const isFilled = i < filled;
            const isActive = i === filled;
            if (isFilled) {
              return (
                <div
                  key={i}
                  className={`flex h-24 min-w-20 items-center justify-center rounded-lg px-3 font-display text-[44px] font-extrabold leading-none transition-all duration-150 ${
                    tile.silent ? 'bg-surface-container-highest text-outline' : 'bg-surface-container-lowest text-primary'
                  } ${lit.includes(i) ? '-translate-y-2 scale-110 bg-tertiary-fixed text-on-tertiary-fixed' : ''}`}
                  style={{ boxShadow: '0 6px 0 0 #91f8b8, 0 10px 16px rgba(0,106,62,0.14)' }}
                >
                  {tile.grapheme}
                </div>
              );
            }
            if (isActive) {
              return (
                <div key={i} ref={activeRef} className="relative">
                  <button
                    type="button"
                    aria-label="Hear the sound that goes here"
                    onClick={onHearTarget}
                    className="well flex h-24 w-20 animate-slot-glow flex-col items-center justify-center rounded-lg border-[3px] border-dashed border-tertiary bg-surface-container-high text-tertiary"
                  >
                    <Icon name="ear" className="h-7 w-7 animate-pulse" />
                  </button>
                </div>
              );
            }
            return (
              <div
                key={i}
                className="well flex h-24 w-20 items-center justify-center rounded-lg border-[3px] border-dashed border-outline-variant bg-surface-container"
                aria-hidden="true"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
