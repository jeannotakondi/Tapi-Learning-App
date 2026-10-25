import { useCallback, useEffect, useRef, useState } from 'react';
import { pause, say, sequence, sfx } from '../../audio/player';
import { lexicon, type Choice, type ListeningActivity } from '../../curriculum';
import { Icon } from '../../components/Icon';
import { Tapi } from '../../components/Tapi';
import { NextButton, SpeakerButton } from '../../components/ui';
import { PictureChoice } from './PictureChoice';

/**
 * Stage 0 games and the placement game's listening check. Everything is
 * spoken; the child answers by tapping a picture or clapping.
 */
export function ListeningGame({ activity, onComplete }: { activity: ListeningActivity; onComplete: (wrongTries: number) => void }) {
  const [done, setDone] = useState(false);
  const wrongTries = useRef(0);

  const ask = useCallback(() => {
    switch (activity.kind) {
      case 'rhyme':
        return sequence([
          () => say.tapi('rhyme-question'),
          () => say.word(activity.target.word),
          () => pause(400),
          ...activity.options.flatMap((o, i) => [...(i > 0 ? [() => say.tapi('or')] : []), () => say.word(o.word)]),
        ]);
      case 'claps':
        return sequence([() => say.tapi('claps-question'), () => say.word(activity.target.word)]);
      case 'first-sound':
        return sequence([
          () => say.tapi('first-sound-question'),
          () => say.sound(activity.sound),
          () => pause(300),
          () => say.sound(activity.sound),
        ]);
      case 'blend':
        return sequence([() => say.tapi('blend-question'), () => say.blend(lexicon.get(activity.word)!)]);
    }
  }, [activity]);

  useEffect(() => {
    wrongTries.current = 0;
    setDone(false);
    ask();
  }, [ask]);

  const succeed = () => {
    setDone(true);
    sfx.chime();
    sequence([() => say.tapi('yes'), () => (activity.kind === 'claps' ? undefined : say.word(answerOf(activity)))]);
  };

  const pick = (choice: Choice) => {
    if (choice.correct) {
      succeed();
      return true;
    }
    wrongTries.current++;
    sfx.boing();
    sequence([() => say.word(choice.word), () => pause(250), () => say.tapi('listen-again'), () => ask()]);
    return false;
  };

  return (
    <section className="flex flex-1 flex-col gap-space-md" aria-label="Listening game">
      <div className="pillow flex items-center justify-between gap-3 rounded-lg bg-surface-container p-space-md">
        {activity.kind === 'rhyme' || activity.kind === 'claps' ? (
          <span
            className="flex h-28 w-28 items-center justify-center rounded-full bg-surface-container-lowest text-[64px]"
            aria-hidden="true"
          >
            {activity.target.picture}
          </span>
        ) : (
          <span
            className="flex h-28 w-28 items-center justify-center rounded-full bg-surface-container-lowest text-[56px]"
            aria-hidden="true"
          >
            👂
          </span>
        )}
        <SpeakerButton size="lg" tone="sun" label="Hear it again" onClick={() => ask()} />
      </div>

      {activity.kind === 'claps' ? (
        <ClapCounter beats={activity.beats} disabled={done} onRight={succeed} onWrong={() => wrongTries.current++} onReplay={() => ask()} />
      ) : (
        <PictureChoice options={activity.options} onPick={pick} disabled={done} />
      )}

      <div className="mt-auto flex items-end justify-between">
        <Tapi mood={done ? 'cheer' : 'happy'} className="h-20 w-20" />
        {done && <NextButton label="Next" onClick={() => onComplete(wrongTries.current)} />}
      </div>
    </section>
  );
}

function answerOf(activity: ListeningActivity): string {
  if (activity.kind === 'claps') return activity.target.word;
  if (activity.kind === 'blend') return activity.word;
  return activity.options.find((o) => o.correct)!.word;
}

/** The child taps the drum once per beat, then presses the check button. */
function ClapCounter({
  beats,
  disabled,
  onRight,
  onWrong,
  onReplay,
}: {
  beats: number;
  disabled: boolean;
  onRight: () => void;
  onWrong: () => void;
  onReplay: () => void;
}) {
  const [claps, setClaps] = useState(0);
  return (
    <div className="flex flex-col items-center gap-space-md">
      <div className="flex h-12 items-center gap-2" aria-live="polite" aria-label={`${claps} claps`}>
        {Array.from({ length: claps }, (_, i) => (
          <span key={i} className="animate-pop-in text-4xl" aria-hidden="true">
            👏
          </span>
        ))}
      </div>
      <button
        type="button"
        aria-label="Clap"
        disabled={disabled || claps >= 3}
        onClick={() => {
          sfx.clap();
          setClaps((c) => c + 1);
        }}
        className="clay flex h-32 w-32 items-center justify-center rounded-full bg-tertiary-fixed text-[64px] [--clay-depth:8px] [--clay-edge:#c9a82c] disabled:opacity-60"
      >
        👏
      </button>
      <div className="flex gap-3">
        <button
          type="button"
          aria-label="Start again"
          onClick={() => setClaps(0)}
          disabled={disabled || claps === 0}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant disabled:opacity-40"
        >
          <Icon name="replay" className="h-8 w-8" />
        </button>
        <button
          type="button"
          disabled={disabled || claps === 0}
          onClick={() => {
            if (claps === beats) onRight();
            else {
              onWrong();
              sfx.boing();
              setClaps(0);
              sequence([() => say.tapi('listen-again'), () => onReplay()]);
            }
          }}
          aria-label="That many claps"
          className="clay flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container [--clay-depth:4px] [--clay-edge:#00522f] disabled:opacity-40"
        >
          <Icon name="check" className="h-9 w-9" />
        </button>
      </div>
    </div>
  );
}
