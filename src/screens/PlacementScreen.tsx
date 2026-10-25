import { useEffect, useState } from 'react';
import { say, sequence, stopAudio } from '../audio/player';
import { LAND_NAMES, track } from '../curriculum';
import { currentItem, MAX_WRONG_TILES_TO_PASS, placementStage, recordPlacementItem, startPlacement } from '../engine/placement';
import { Tapi } from '../components/Tapi';
import { BackButton, NextButton } from '../components/ui';
import { navigate } from '../router';
import { recordPlacement } from '../store/actions';
import { useActiveProfile } from '../store/store';
import { ListeningGame } from './lesson/ListeningGame';
import { WordBuilder } from './lesson/WordBuilder';

/**
 * A 3 to 5 minute game that places the child at the right stage. No score
 * and no "wrong" message, so it feels like play.
 */
export function PlacementScreen() {
  const profile = useActiveProfile();
  const [state, setState] = useState(startPlacement);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!profile) navigate({ name: 'picker' }, { replace: true });
  }, [profile]);

  useEffect(() => {
    sequence([() => say.tapi('placement-start')]);
    return stopAudio;
  }, []);

  useEffect(() => {
    if (state.finished && profile) {
      recordPlacement(profile.id, placementStage(state));
      sequence([() => say.tapi('placement-done')]);
    }
    // Only when the game finishes.
  }, [state.finished]);

  if (!profile) return null;

  const advance = (passed: boolean) => {
    stopAudio();
    setState((s) => recordPlacementItem(s, passed));
    setStep((n) => n + 1);
  };

  const item = currentItem(state);
  const stage = placementStage(state);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-margin-mobile pb-6">
      <header className="flex items-center justify-between py-3">
        <BackButton label="Stop the game" onClick={() => navigate({ name: 'map' })} />
        <span className="w-14" />
      </header>

      {!started && (
        <section className="flex flex-1 flex-col items-center justify-center gap-space-lg text-center">
          <Tapi mood="wave" className="h-40 w-40 animate-float" />
          <p className="font-display text-headline-lg-mobile text-primary">Let’s play a game!</p>
          <NextButton label="Start" onClick={() => setStarted(true)} />
        </section>
      )}

      {started && !state.finished && item?.kind === 'rhyme' && (
        <ListeningGame
          key={`p-${step}`}
          activity={{ id: `placement-${step}`, kind: 'rhyme', target: item.target, options: item.options }}
          onComplete={(wrongTries) => advance(wrongTries === 0)}
        />
      )}

      {started && !state.finished && item?.kind === 'build' && (
        <WordBuilder
          key={`p-${step}`}
          word={item.word}
          announce={step === 2}
          onComplete={({ wrongDrops }) => advance(wrongDrops <= MAX_WRONG_TILES_TO_PASS)}
        />
      )}

      {state.finished && (
        <section className="flex flex-1 flex-col items-center justify-center gap-space-md text-center">
          <Tapi mood="cheer" className="h-40 w-40 animate-float" />
          <p className="font-display text-headline-lg-mobile text-primary">Thank you!</p>
          <p className="text-body-md text-on-surface-variant">
            For grown-ups: {profile.name} will start at Stage {stage}, {track.stages[stage].title} ({LAND_NAMES[track.stages[stage].land]}).
            You can change this in the grown-up area at any time.
          </p>
          <NextButton label="Go to the island" onClick={() => navigate({ name: 'map' })} />
        </section>
      )}
    </main>
  );
}
