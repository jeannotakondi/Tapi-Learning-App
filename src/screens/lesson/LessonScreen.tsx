import { useCallback, useEffect, useRef, useState } from 'react';
import { pause, say, sequence, sfx, stopAudio } from '../../audio/player';
import { findLesson, type Lesson, track, type Word } from '../../curriculum';
import { LAST_STAGE, lessonItems, type LessonItem, soundsNeedingReview, stageFinished, trickyChoices } from '../../engine/lessonPlan';
import { starsForLesson, starsForWord } from '../../engine/wordRound';
import { Tapi } from '../../components/Tapi';
import { TileGlyph } from '../../components/TileGlyph';
import { BackButton, NextButton, SpeakerButton, Stars } from '../../components/ui';
import { navigate } from '../../router';
import { addPlaytime, recordLesson, recordWord, setStage } from '../../store/actions';
import { getState, type Profile, useActiveProfile } from '../../store/store';
import { ListeningGame } from './ListeningGame';
import { Slots } from './Slots';
import { TrickyWordGame } from './TrickyWordGame';
import { WordBuilder } from './WordBuilder';

type Phase = 'intro' | 'item' | 'reward' | 'done';

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const profile = useActiveProfile();
  const lesson = findLesson(lessonId);

  useEffect(() => {
    if (!profile || !lesson) navigate({ name: 'map' }, { replace: true });
  }, [profile, lesson]);

  if (!profile || !lesson) return null;
  // Keyed so replaying the same lesson starts fresh.
  return <LessonRun key={lessonId} profile={profile} lesson={lesson} />;
}

function LessonRun({ profile, lesson }: { profile: Profile; lesson: Lesson }) {
  // Fixed for the whole lesson, including any review words due from last time.
  const [items] = useState(() => lessonItems(lesson, profile.review));
  const hasIntro = lesson.newGraphemes.length > 0 || Boolean(lesson.focus);

  const [phase, setPhase] = useState<Phase>(hasIntro ? 'intro' : 'item');
  const [introIndex, setIntroIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  // Refs, not state: finish() must see the score from the item that just ended.
  const stars = useRef<number[]>([]);
  const sessionMisses = useRef<Record<string, number>>({});
  const startedAt = useRef(Date.now());

  const item = items[itemIndex];

  // Count play time, including when the child leaves part-way.
  useEffect(() => {
    return () => {
      stopAudio();
      addPlaytime(profile.id, (Date.now() - startedAt.current) / 1000);
    };
  }, [profile.id]);

  const next = () => {
    stopAudio();
    if (itemIndex + 1 < items.length) {
      setItemIndex(itemIndex + 1);
      setPhase('item');
    } else {
      finish();
    }
  };

  const finish = () => {
    const lessonStars = starsForLesson(stars.current);
    recordLesson(profile.id, lesson.id, lessonStars, sessionMisses.current, soundsNeedingReview(sessionMisses.current));
    // Stage 0 has no story, so it's finished as soon as its lessons are.
    const latest = getState().profiles.find((p) => p.id === profile.id);
    if (
      latest &&
      latest.stage === lesson.stage &&
      lesson.stage < LAST_STAGE &&
      stageFinished(lesson.stage, latest.lessons, latest.stories)
    ) {
      setStage(profile.id, lesson.stage + 1);
    }
    setPhase('done');
    sequence([() => say.tapi('lesson-done')]);
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-margin-mobile pb-6">
      <header className="flex items-center justify-between gap-3 py-3">
        <BackButton
          label="Back to the island"
          onClick={() => {
            stopAudio();
            navigate({ name: 'map' });
          }}
        />
        {phase !== 'intro' && phase !== 'done' && <Progress items={items} index={itemIndex} />}
        <span className="w-14" />
      </header>

      {phase === 'intro' && (
        <Intro
          lesson={lesson}
          index={introIndex}
          onNext={() => {
            stopAudio();
            if (introIndex + 1 < lesson.newGraphemes.length) setIntroIndex(introIndex + 1);
            else setPhase('item');
          }}
        />
      )}

      {phase === 'item' && item.kind === 'word' && (
        <WordBuilder
          key={`${itemIndex}-${item.word.id}`}
          word={item.word}
          announce={itemIndex === items.findIndex((i) => i.kind === 'word')}
          onComplete={({ wrongDrops, misses }) => {
            const s = starsForWord(wrongDrops);
            stars.current.push(s);
            for (const [g, n] of Object.entries(misses)) sessionMisses.current[g] = (sessionMisses.current[g] ?? 0) + n;
            recordWord(profile.id, item.word.id, s);
            setPhase('reward');
          }}
        />
      )}

      {phase === 'item' && item.kind === 'tricky' && (
        <TrickyWordGame key={item.word.id} word={item.word} choices={trickyChoices(item.word, lesson)} onComplete={() => next()} />
      )}

      {phase === 'item' && item.kind === 'activity' && (
        <ListeningGame
          key={item.activity.id}
          activity={item.activity}
          onComplete={(wrongTries) => {
            stars.current.push(starsForWord(wrongTries * 2));
            next();
          }}
        />
      )}

      {phase === 'reward' && item.kind === 'word' && (
        <WordReward
          word={item.word}
          stars={stars.current[stars.current.length - 1] ?? 3}
          onNext={next}
          isLast={itemIndex + 1 >= items.length}
        />
      )}

      {phase === 'done' && (
        <LessonDone
          stars={starsForLesson(stars.current)}
          onBack={() => {
            sequence([() => say.tapi('goodbye')]);
            navigate({ name: 'map' });
          }}
        />
      )}
    </main>
  );
}

function Progress({ items, index }: { items: LessonItem[]; index: number }) {
  return (
    <ol className="flex flex-1 flex-wrap justify-center gap-1.5" aria-label={`Step ${index + 1} of ${items.length}`}>
      {items.map((it, i) => (
        <li
          key={i}
          className={`h-3 w-3 rounded-full ${it.kind === 'tricky' ? 'rounded-sm' : ''} ${
            i < index
              ? 'bg-primary-container'
              : i === index
                ? 'bg-tertiary-fixed-dim ring-2 ring-tertiary-fixed'
                : 'bg-surface-container-highest'
          }`}
        />
      ))}
    </ol>
  );
}

/** Step 1: Tapi introduces each new sound with a picture and says it three times. */
function Intro({ lesson, index, onNext }: { lesson: Lesson; index: number; onNext: () => void }) {
  const key = lesson.newGraphemes[index];
  const grapheme = key ? track.graphemes[key] : undefined;

  const play = useCallback(() => {
    if (!grapheme) return sequence([() => say.tapi('clusters')]);
    // Phase 5 spellings mostly make sounds the child already knows.
    const knownSound = lesson.stage === 5;
    return sequence([
      () => (index === 0 ? say.tapi(knownSound ? 'new-spelling' : 'new-sound') : undefined),
      () => say.sound(grapheme.sound),
      () => pause(500),
      () => say.sound(grapheme.sound),
      () => pause(500),
      () => say.sound(grapheme.sound),
      () => pause(400),
      () => say.tapi('like-in'),
      () => say.example(key),
    ]);
  }, [grapheme, key, index, lesson.stage]);

  useEffect(() => {
    play();
  }, [play]);

  return (
    <section
      className="flex flex-1 flex-col items-center justify-center gap-space-lg"
      aria-label={grapheme ? 'New sound' : 'Sounds side by side'}
    >
      <div className="pillow flex w-full items-center justify-around rounded-lg bg-surface-container p-space-md">
        {grapheme ? (
          <>
            <button
              type="button"
              onClick={play}
              aria-label="Hear the new sound"
              className="clay flex h-32 min-w-32 animate-pop-in items-center justify-center rounded-lg bg-surface-container-lowest px-4 font-display text-[64px] font-extrabold text-primary [--clay-depth:8px]"
            >
              <TileGlyph grapheme={grapheme.grapheme} />
            </button>
            {grapheme.picture && (
              <span
                className="flex h-32 w-32 items-center justify-center rounded-full bg-surface-container-lowest text-[72px]"
                role="img"
                aria-label={grapheme.example}
              >
                {grapheme.picture}
              </span>
            )}
          </>
        ) : (
          <div className="flex gap-2 py-4" aria-hidden="true">
            {['f', 'r', 'o', 'g'].map((g, i) => (
              <span
                key={g}
                className={`flex h-20 w-16 items-center justify-center rounded-lg font-display text-[40px] font-extrabold ${i < 2 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-lowest text-primary'}`}
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
      <SpeakerButton size="lg" tone="sun" label="Hear it again" onClick={play} />
      <div className="flex w-full items-end justify-between">
        <Tapi mood="wave" className="h-24 w-24" />
        <NextButton label="Next" onClick={onNext} />
      </div>
    </section>
  );
}

/** Step 8: the word comes alive. */
function WordReward({ word, stars, onNext, isLast }: { word: Word; stars: number; onNext: () => void; isLast: boolean }) {
  const [lit, setLit] = useState<number[]>([]);

  useEffect(() => {
    sfx.chime();
    sequence([() => say.tapi('well-done'), () => say.word(word.text)]);
  }, [word]);

  return (
    <section className="flex flex-col items-center" aria-label="Well done">
      <div className="flex items-end justify-center gap-3 pt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`animate-pop-in ${i === 1 ? '-translate-y-2' : i === 0 ? '-rotate-12' : 'rotate-12'}`}
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <Stars count={i < stars ? 1 : 0} max={1} size={i === 1 ? 'h-20 w-20' : 'h-14 w-14'} />
          </span>
        ))}
      </div>
      <p className="mt-2 font-display text-headline-lg-mobile font-extrabold text-primary">You did it!</p>

      <div className="relative mt-3 flex min-h-[200px] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-container-low p-4">
        <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-tertiary-fixed/40 blur-2xl" />
        <span className="relative z-10 animate-walk-across text-[96px]" role="img" aria-label={word.text}>
          {word.picture ?? '🌟'}
        </span>
        <Tapi mood="cheer" className="absolute bottom-2 right-0 z-20 h-24 w-24" />
      </div>

      <Slots word={word} filled={word.tiles.length} lit={lit} />

      <button
        type="button"
        onClick={() => sequence([() => say.blend(word, setLit), () => say.word(word.text)])}
        className="clay flex h-14 items-center gap-3 rounded-full bg-secondary-fixed px-5 text-on-secondary-fixed [--clay-depth:5px] [--clay-edge:#d1bcff]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-on-secondary">
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
          </svg>
        </span>
        <span className="text-label-lg">Hear it again</span>
      </button>

      <div className="mt-6">
        <NextButton label={isLast ? 'Finish' : 'Next'} onClick={onNext} />
      </div>
    </section>
  );
}

function LessonDone({ stars, onBack }: { stars: number; onBack: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-space-md text-center" aria-label="Lesson finished">
      <Stars count={stars} size="h-16 w-16" />
      <Tapi mood="cheer" className="h-40 w-40 animate-float" />
      <p className="font-display text-headline-lg-mobile text-primary">One more sound is back on the island!</p>
      <NextButton label="Back to the island" onClick={onBack} />
    </section>
  );
}
