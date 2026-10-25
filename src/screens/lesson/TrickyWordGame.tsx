import { useEffect, useState } from 'react';
import { pause, say, sequence, sfx } from '../../audio/player';
import type { TrickyWord } from '../../curriculum';
import { Tapi } from '../../components/Tapi';
import { NextButton, SpeakerButton } from '../../components/ui';

/**
 * Tricky words skip the tile game: Tapi shows the word and says it, then the
 * child finds it among a few cards.
 */
export function TrickyWordGame({
  word,
  choices,
  onComplete,
}: {
  word: TrickyWord;
  choices: string[];
  onComplete: (wrongTries: number) => void;
}) {
  const [step, setStep] = useState<'show' | 'find' | 'done'>('show');
  const [wrong, setWrong] = useState<string[]>([]);
  const [wobble, setWobble] = useState<string | null>(null);

  useEffect(() => {
    sequence([() => say.tapi('tricky-intro'), () => say.word(word.text), () => pause(500), () => say.word(word.text)]);
  }, [word]);

  const startFind = () => {
    setStep('find');
    sequence([() => say.tapi('find-word'), () => say.word(word.text)]);
  };

  return (
    <section className="flex flex-1 flex-col gap-space-md" aria-label="Tricky word">
      {step === 'show' ? (
        <>
          <div className="pillow flex flex-col items-center gap-space-md rounded-lg bg-secondary-fixed p-space-lg">
            <span className="font-body text-[64px] font-semibold leading-none text-on-secondary-fixed">{word.text}</span>
            <SpeakerButton size="lg" label={`Hear ${word.text}`} onClick={() => say.word(word.text)} />
          </div>
          <div className="mt-auto flex items-end justify-between">
            <Tapi mood="wave" className="h-24 w-24" />
            <NextButton label="Find it" onClick={startFind} />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center gap-3">
            <SpeakerButton size="lg" tone="sun" label="Hear the word again" onClick={() => say.word(word.text)} />
          </div>
          <div className="flex flex-col gap-3">
            {choices.map((choice) => {
              const isAnswer = choice === word.text;
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={step === 'done'}
                  onClick={() => {
                    if (isAnswer) {
                      setStep('done');
                      sfx.chime();
                      sequence([() => say.tapi('yes'), () => say.word(word.text)]);
                    } else {
                      setWrong((w) => [...w, choice]);
                      setWobble(choice);
                      sfx.boing();
                      window.setTimeout(() => setWobble(null), 450);
                      sequence([() => say.word(choice), () => pause(250), () => say.tapi('listen-again'), () => say.word(word.text)]);
                    }
                  }}
                  className={`clay h-20 rounded-lg font-body text-[40px] font-semibold [--clay-depth:6px] ${
                    step === 'done' && isAnswer
                      ? 'animate-pop-in bg-primary-fixed text-on-primary-fixed [--clay-edge:#74db9d]'
                      : wrong.includes(choice)
                        ? 'bg-surface-container text-outline opacity-60 [--clay-edge:#dcdad5]'
                        : 'bg-surface-container-lowest text-on-surface [--clay-edge:#bdcabe]'
                  } ${wobble === choice ? 'animate-tile-bounce-back' : ''}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          <div className="mt-auto flex items-end justify-between">
            <Tapi mood={step === 'done' ? 'cheer' : 'happy'} className="h-20 w-20" />
            {step === 'done' && <NextButton label="Next" onClick={() => onComplete(wrong.length)} />}
          </div>
        </>
      )}
    </section>
  );
}
