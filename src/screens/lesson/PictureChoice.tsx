import { useState } from 'react';
import type { Choice } from '../../curriculum';

/**
 * Big picture buttons for listening games. A wrong pick wobbles and fades a
 * little; it never shows a cross or a buzzer. The right pick pops.
 */
export function PictureChoice({
  options,
  onPick,
  disabled,
}: {
  options: Choice[];
  /** Returns true if this was the right one. */
  onPick: (choice: Choice) => boolean;
  disabled?: boolean;
}) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState<string | null>(null);
  const [wobble, setWobble] = useState<string | null>(null);

  return (
    <div className={`grid gap-3 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((option) => {
        const isWrong = wrong.includes(option.word);
        return (
          <button
            key={option.word}
            type="button"
            aria-label={option.word}
            disabled={disabled || right !== null}
            onClick={() => {
              if (onPick(option)) {
                setRight(option.word);
              } else {
                setWrong((w) => [...w, option.word]);
                setWobble(option.word);
                window.setTimeout(() => setWobble(null), 450);
              }
            }}
            className={`clay flex aspect-square items-center justify-center rounded-lg text-[64px] [--clay-depth:6px] ${
              right === option.word
                ? 'animate-pop-in bg-primary-fixed [--clay-edge:#74db9d]'
                : isWrong
                  ? 'bg-surface-container opacity-60 [--clay-edge:#dcdad5]'
                  : 'bg-surface-container-lowest [--clay-edge:#bdcabe]'
            } ${wobble === option.word ? 'animate-tile-bounce-back' : ''}`}
          >
            {option.picture}
          </button>
        );
      })}
    </div>
  );
}
