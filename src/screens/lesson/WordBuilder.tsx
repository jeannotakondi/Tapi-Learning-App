import { useEffect, useRef, useState } from 'react';
import { pause, say, sequence, sfx, stopAudio } from '../../audio/player';
import type { Word } from '../../curriculum';
import { placeTile, startRound, type WordRound } from '../../engine/wordRound';
import { Tapi } from '../../components/Tapi';
import { TileGlyph } from '../../components/TileGlyph';
import { SpeakerButton } from '../../components/ui';
import { Slots } from './Slots';
import { TileTray, type TrayTile } from './TileTray';

export interface BuildResult {
  wrongDrops: number;
  /** Wrong drops per expected spelling. */
  misses: Record<string, number>;
}

type Phase = 'listen' | 'build' | 'blend';

/**
 * Steps 2 to 7 of the word loop: the word is read aloud and splits into
 * tiles, the child drags them into slots, then the sounds blend into the word.
 */
export function WordBuilder({ word, announce, onComplete }: { word: Word; announce: boolean; onComplete: (result: BuildResult) => void }) {
  const [phase, setPhase] = useState<Phase>('listen');
  const [splitting, setSplitting] = useState(false);
  const [round, setRound] = useState<WordRound>(() => startRound(word));
  const [tray, setTray] = useState<TrayTile[]>([]);
  const [lit, setLit] = useState<number[]>([]);
  const activeSlot = useRef<HTMLDivElement>(null);

  // 2-4. The word appears and is read aloud, then splits into sound tiles.
  useEffect(() => {
    let cancelled = false;
    sequence([
      () => (announce ? say.tapi('listen-word') : undefined),
      () => say.word(word.text),
      () => pause(300),
      () => setSplitting(true),
      () => pause(900),
    ]).then((finished) => {
      if (!finished || cancelled) return;
      setTray(word.tiles.map((t, i) => ({ ...t, key: `${word.id}-${i}`, placed: false })));
      setPhase('build');
      if (announce) say.tapi('build-word');
    });
    return () => {
      cancelled = true;
    };
  }, [word, announce]);

  // 7. All slots full: sounds slowly, then faster, then the whole word.
  useEffect(() => {
    if (phase !== 'blend') return;
    sequence([() => pause(300), () => say.blend(word, setLit), () => say.word(word.text)]).then((finished) => {
      if (finished) onComplete({ wrongDrops: round.wrongDrops, misses: round.misses });
    });
    // Runs once when blending starts. round is already final in this render.
  }, [phase]);

  const onDrop = (tile: TrayTile): boolean => {
    const { round: next, result } = placeTile(round, tile.grapheme);
    setRound(next);
    if (result === 'wrong') return false;
    sfx.click();
    setTray((t) => t.map((x) => (x.key === tile.key ? { ...x, placed: true } : x)));
    if (result === 'complete') setPhase('blend');
    return true;
  };

  return (
    <>
      <div className="relative flex items-center justify-between gap-space-md overflow-hidden rounded-lg bg-surface-container p-space-md shadow-[0_12px_32px_-6px_rgba(0,106,62,0.12)]">
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-surface-container-lowest/60 blur-2xl" />
        <div className="relative flex min-h-32 flex-1 items-center justify-center">
          {phase === 'listen' ? (
            // The word on screen, splitting into its sound tiles.
            <div
              className={`flex flex-wrap items-center justify-center transition-all duration-700 ${splitting ? 'gap-2' : 'gap-0'}`}
              aria-label={word.text}
            >
              {splitting ? (
                word.tiles.map((t, i) => (
                  <span
                    key={i}
                    className="animate-pop-in rounded-DEFAULT bg-surface-container-lowest px-2 py-1 font-display text-[40px] font-extrabold leading-none text-primary shadow-md"
                  >
                    <TileGlyph grapheme={t.grapheme} />
                  </span>
                ))
              ) : (
                <span className="font-display text-[52px] font-extrabold leading-none text-primary">{word.text}</span>
              )}
            </div>
          ) : (
            <span
              className="flex h-32 w-32 items-center justify-center rounded-full bg-surface-container-lowest text-[64px] shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)]"
              aria-hidden="true"
            >
              {word.picture ?? '👂'}
            </span>
          )}
        </div>
        <SpeakerButton size="lg" tone="sun" label="Hear the word" onClick={() => say.word(word.text)} />
      </div>

      {phase !== 'listen' && (
        <Slots
          word={word}
          filled={round.filled}
          activeRef={activeSlot}
          lit={lit}
          onHearTarget={() => {
            const target = word.tiles[round.filled];
            if (target) say.sound(target.sound);
          }}
        />
      )}

      {phase === 'build' && (
        <TileTray
          wordId={word.id}
          tiles={tray}
          targetRef={activeSlot}
          disabled={false}
          onPickUp={(tile) => {
            stopAudio();
            say.sound(tile.sound);
          }}
          onDrop={onDrop}
          onBounce={(tile) => {
            sfx.boing();
            window.setTimeout(() => say.sound(tile.sound), 250);
          }}
        />
      )}

      <div className="mt-2 flex items-end gap-2">
        <Tapi mood={phase === 'blend' ? 'cheer' : 'happy'} className="h-20 w-20 -rotate-6" />
        {phase === 'build' && (
          <span className="mb-5 rounded-xl bg-surface-container-lowest px-3.5 py-2 text-label-sm text-on-surface-variant shadow-md">
            You got this!
          </span>
        )}
      </div>
    </>
  );
}
