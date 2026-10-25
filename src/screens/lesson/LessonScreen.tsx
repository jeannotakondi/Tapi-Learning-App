import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { say, sequence, sfx, stopAudio } from '../../audio/player';
import { findLesson, type Lesson, type Track } from '../../curriculum';
import { nextLessonInStage, soundsNeedingReview, stageHasContent, wordsForLesson } from '../../engine/lessonPlan';
import { placeTile, startRound, starsForLesson, starsForWord, type WordRound } from '../../engine/wordRound';
import { Tapi } from '../../components/Tapi';
import { BackButton, NextButton, SpeakerButton, Stars } from '../../components/ui';
import { navigate } from '../../router';
import { addPlaytime, recordLesson, recordWord, setStage } from '../../store/actions';
import { getState, type Profile, useActiveProfile } from '../../store/store';
import { Slots } from './Slots';
import { TileTray, type TrayTile } from './TileTray';

type Phase = 'intro' | 'listen' | 'build' | 'blend' | 'reward' | 'done';

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const profile = useActiveProfile();
  const found = findLesson(lessonId);

  useEffect(() => {
    if (!profile || !found || found.track.language !== profile.language) navigate({ name: 'map' }, { replace: true });
  }, [profile, found]);

  if (!profile || !found || found.track.language !== profile.language) return null;
  // Keyed so replaying the same lesson starts fresh.
  return <LessonRun key={lessonId} profile={profile} track={found.track} lesson={found.lesson} />;
}

function LessonRun({ profile, track, lesson }: { profile: Profile; track: Track; lesson: Lesson }) {
  const language = track.language;
  // Fixed for the whole lesson, including any review words due from last time.
  const [words] = useState(() => wordsForLesson(track, lesson, profile.review[language] ?? []));
  const newSounds = useMemo(() => lesson.newGraphemes.map((g) => ({ grapheme: g, sound: track.graphemeSounds[g] ?? g })), [lesson, track]);

  const [phase, setPhase] = useState<Phase>(newSounds.length > 0 ? 'intro' : 'listen');
  const [introIndex, setIntroIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [round, setRound] = useState<WordRound>(() => startRound(words[0]));
  const [tray, setTray] = useState<TrayTile[]>([]);
  const [lit, setLit] = useState<number[]>([]);
  const [wordStars, setWordStars] = useState<number[]>([]);
  const [sessionMisses, setSessionMisses] = useState<Record<string, number>>({});
  const [splitting, setSplitting] = useState(false);
  const activeSlot = useRef<HTMLDivElement>(null);
  const startedAt = useRef(Date.now());
  const saidIslandWord = useRef(false);

  const word = words[wordIndex];

  // Count play time, including when the child leaves part-way.
  useEffect(() => {
    return () => {
      stopAudio();
      addPlaytime(profile.id, (Date.now() - startedAt.current) / 1000);
    };
  }, [profile.id]);

  // 1. Tapi introduces each new sound with a picture and says it three times.
  const playIntro = useCallback(
    (i: number) => {
      const { sound } = newSounds[i];
      return sequence([
        () => (i === 0 ? say.tapi(language, 'new-sound') : undefined),
        () => say.sound(track, sound),
        () => new Promise((r) => setTimeout(r, 500)),
        () => say.sound(track, sound),
        () => new Promise((r) => setTimeout(r, 500)),
        () => say.sound(track, sound),
        () => new Promise((r) => setTimeout(r, 400)),
        () => say.tapi(language, 'like-in'),
        () => say.example(track, sound),
      ]);
    },
    [newSounds, language, track],
  );

  useEffect(() => {
    if (phase === 'intro') playIntro(introIndex);
  }, [phase, introIndex, playIntro]);

  // 2–4. The word appears and is read aloud, then splits into sound tiles.
  useEffect(() => {
    if (phase !== 'listen') return;
    setSplitting(false);
    let cancelled = false;
    sequence([
      () => (word.islandWord && !saidIslandWord.current ? ((saidIslandWord.current = true), say.tapi(language, 'island-word')) : undefined),
      () => (wordIndex === 0 ? say.tapi(language, 'listen-word') : undefined),
      () => say.word(language, word),
      () => new Promise((r) => setTimeout(r, 300)),
      () => setSplitting(true),
      () => new Promise((r) => setTimeout(r, 900)),
    ]).then((finished) => {
      if (!finished || cancelled) return;
      setTray(word.tiles.map((t, i) => ({ ...t, key: `${word.id}-${i}`, placed: false })));
      setRound(startRound(word));
      setPhase('build');
      if (wordIndex === 0) say.tapi(language, 'build-word');
    });
    return () => {
      cancelled = true;
    };
  }, [phase, word, wordIndex, language]);

  // 7. All slots full: sounds slowly, then faster, then the whole word.
  useEffect(() => {
    if (phase !== 'blend') return;
    sequence([() => new Promise((r) => setTimeout(r, 300)), () => say.blend(track, word, setLit), () => say.word(language, word)]).then(
      (finished) => {
        if (finished) setPhase('reward');
      },
    );
  }, [phase, track, word, language]);

  // 8. The word comes alive.
  useEffect(() => {
    if (phase !== 'reward') return;
    sfx.chime();
    sequence([() => say.tapi(language, 'well-done'), () => say.word(language, word)]);
  }, [phase, language, word]);

  const finishLesson = useCallback(
    (allStars: number[]) => {
      const stars = starsForLesson(allStars);
      const review = soundsNeedingReview(sessionMisses);
      recordLesson(profile.id, language, lesson.id, stars, sessionMisses, review);
      // Move on to the next stage once every lesson here is done and the next stage has lessons.
      const latest = getState().profiles.find((p) => p.id === profile.id);
      const stage = latest?.stage[language] ?? lesson.stage;
      if (latest && stage === lesson.stage && !nextLessonInStage(track, stage, latest.lessons) && stageHasContent(track, stage + 1)) {
        setStage(profile.id, language, stage + 1);
      }
      setPhase('done');
      sequence([() => say.tapi(language, 'lesson-done')]);
    },
    [profile.id, language, lesson, track, sessionMisses],
  );

  const onDrop = (tile: TrayTile): boolean => {
    const { round: next, result } = placeTile(round, tile.grapheme);
    setRound(next);
    if (result === 'wrong') {
      const expected = round.word.tiles[round.filled].grapheme;
      setSessionMisses((m) => ({ ...m, [expected]: (m[expected] ?? 0) + 1 }));
      return false;
    }
    sfx.click();
    setTray((t) => {
      // Mark this tile placed. Matching is by spelling, so the dropped copy is the one removed.
      const copy = [...t];
      const i = copy.findIndex((x) => x.key === tile.key);
      copy[i] = { ...copy[i], placed: true };
      return copy;
    });
    if (result === 'complete') {
      const stars = starsForWord(next.wrongDrops);
      setWordStars((s) => [...s, stars]);
      recordWord(profile.id, word.id, stars);
      setPhase('blend');
    }
    return true;
  };

  const nextWord = () => {
    stopAudio();
    if (wordIndex + 1 < words.length) {
      setWordIndex(wordIndex + 1);
      setPhase('listen');
    } else {
      finishLesson(wordStars);
    }
  };

  const leave = () => {
    stopAudio();
    navigate({ name: 'map' });
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-margin-mobile pb-6">
      <header className="flex items-center justify-between gap-3 py-3">
        <BackButton label="Back to the island" onClick={leave} />
        {phase !== 'intro' && phase !== 'done' && (
          <ol className="flex flex-1 flex-wrap justify-center gap-1.5" aria-label={`Word ${wordIndex + 1} of ${words.length}`}>
            {words.map((w, i) => (
              <li
                key={w.id}
                className={`h-3 w-3 rounded-full ${i < wordIndex ? 'bg-primary-container' : i === wordIndex ? 'bg-tertiary-fixed-dim ring-2 ring-tertiary-fixed' : 'bg-surface-container-highest'}`}
              />
            ))}
          </ol>
        )}
        <span className="w-14" />
      </header>

      {phase === 'intro' && (
        <SoundIntro
          track={track}
          grapheme={newSounds[introIndex].grapheme}
          soundId={newSounds[introIndex].sound}
          onReplay={() => playIntro(introIndex)}
          onNext={() => {
            stopAudio();
            if (introIndex + 1 < newSounds.length) setIntroIndex(introIndex + 1);
            else setPhase('listen');
          }}
        />
      )}

      {(phase === 'listen' || phase === 'build' || phase === 'blend') && (
        <>
          <PromptCard
            picture={word.picture}
            islandWord={word.islandWord}
            text={phase === 'listen' ? word.text : undefined}
            tiles={phase === 'listen' ? word.tiles.map((t) => t.grapheme) : undefined}
            splitting={splitting}
            onListen={() => say.word(language, word)}
          />
          {phase !== 'listen' && (
            <Slots
              word={word}
              filled={round.filled}
              activeRef={activeSlot}
              lit={lit}
              onHearTarget={() => {
                const target = word.tiles[round.filled];
                if (target && !target.silent) say.sound(track, target.sound);
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
                if (!tile.silent) say.sound(track, tile.sound);
              }}
              onDrop={onDrop}
              onBounce={(tile) => {
                sfx.boing();
                if (!tile.silent) window.setTimeout(() => say.sound(track, tile.sound), 250);
              }}
            />
          )}
          <div className="mt-2 flex items-end gap-2">
            <Tapi mood={phase === 'blend' ? 'cheer' : 'happy'} className="h-20 w-20 -rotate-6" />
            {phase === 'build' && (
              <span className="mb-5 rounded-xl bg-surface-container-lowest px-3.5 py-2 text-label-sm text-on-surface-variant shadow-md">
                {language === 'fr' ? 'Tu vas y arriver !' : 'You got this!'}
              </span>
            )}
          </div>
        </>
      )}

      {phase === 'reward' && (
        <WordReward
          track={track}
          word={word}
          stars={wordStars[wordStars.length - 1] ?? 3}
          onReplay={() => sequence([() => say.blend(track, word, setLit), () => say.word(language, word)])}
          lit={lit}
          onNext={nextWord}
          isLast={wordIndex + 1 >= words.length}
        />
      )}

      {phase === 'done' && (
        <LessonDone
          stars={starsForLesson(wordStars)}
          language={language}
          onBack={() => {
            sequence([() => say.tapi(language, 'goodbye')]);
            navigate({ name: 'map' });
          }}
        />
      )}
    </main>
  );
}

function SoundIntro({
  track,
  grapheme,
  soundId,
  onReplay,
  onNext,
}: {
  track: Track;
  grapheme: string;
  soundId: string;
  onReplay: () => void;
  onNext: () => void;
}) {
  const sound = track.sounds[soundId];
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-space-lg" aria-label="New sound">
      <div className="pillow flex w-full items-center justify-around rounded-lg bg-surface-container p-space-md">
        <button
          type="button"
          onClick={onReplay}
          aria-label="Hear the new sound"
          className="clay flex h-32 min-w-32 animate-pop-in items-center justify-center rounded-lg bg-surface-container-lowest px-4 font-display text-[72px] font-extrabold text-primary [--clay-depth:8px]"
        >
          {grapheme}
        </button>
        {sound?.examplePicture && (
          <span
            className="flex h-32 w-32 items-center justify-center rounded-full bg-surface-container-lowest text-[72px]"
            role="img"
            aria-label={sound.example}
          >
            {sound.examplePicture}
          </span>
        )}
      </div>
      <SpeakerButton size="lg" tone="sun" label="Hear it again" onClick={onReplay} />
      <div className="flex w-full items-end justify-between">
        <Tapi mood="wave" className="h-24 w-24" />
        <NextButton label="Next" onClick={onNext} />
      </div>
    </section>
  );
}

function PromptCard({
  picture,
  islandWord,
  text,
  tiles,
  splitting,
  onListen,
}: {
  picture?: string;
  islandWord?: boolean;
  text?: string;
  tiles?: string[];
  splitting: boolean;
  onListen: () => void;
}) {
  return (
    <div className="relative flex items-center justify-between gap-space-md overflow-hidden rounded-lg bg-surface-container p-space-md shadow-[0_12px_32px_-6px_rgba(0,106,62,0.12)]">
      <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-surface-container-lowest/60 blur-2xl" />
      <div className="relative flex flex-1 items-center justify-center">
        {tiles && text ? (
          // The word on screen, splitting into its sound tiles.
          <div className={`flex items-center transition-all duration-700 ${splitting ? 'gap-3' : 'gap-0'}`} aria-label={text}>
            {tiles.map((g, i) => (
              <span
                key={i}
                className={`font-display text-[56px] font-extrabold leading-none text-primary transition-all duration-700 ${
                  splitting ? 'rounded-DEFAULT bg-surface-container-lowest px-2 py-1 shadow-md' : ''
                }`}
              >
                {g}
              </span>
            ))}
          </div>
        ) : (
          <span
            className="flex h-32 w-32 items-center justify-center rounded-full bg-surface-container-lowest text-[64px] shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)]"
            aria-hidden="true"
          >
            {picture ?? (islandWord ? '🏝️' : '👂')}
          </span>
        )}
      </div>
      <SpeakerButton size="lg" tone="sun" label="Hear the word" onClick={onListen} />
    </div>
  );
}

function WordReward({
  track,
  word,
  stars,
  lit,
  onReplay,
  onNext,
  isLast,
}: {
  track: Track;
  word: Lesson['words'][number];
  stars: number;
  lit: number[];
  onReplay: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
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
      <p className="mt-2 font-display text-headline-lg-mobile font-extrabold text-primary">
        {track.language === 'fr' ? 'Bravo !' : 'You did it!'}
      </p>

      <div className="relative mt-3 flex min-h-[200px] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-container-low p-4">
        <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-tertiary-fixed/40 blur-2xl" />
        <span className="relative z-10 animate-walk-across text-[96px]" role="img" aria-label={word.text}>
          {word.picture ?? (word.islandWord ? '🏝️' : '🌟')}
        </span>
        <Tapi mood="cheer" className="absolute bottom-2 right-0 z-20 h-24 w-24" />
      </div>

      <Slots word={word} filled={word.tiles.length} lit={lit} />

      <button
        type="button"
        onClick={onReplay}
        className="clay flex h-14 items-center gap-3 rounded-full bg-secondary-fixed px-5 text-on-secondary-fixed [--clay-depth:5px] [--clay-edge:#d1bcff]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-on-secondary">
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
          </svg>
        </span>
        <span className="text-label-lg">{track.language === 'fr' ? 'Encore' : 'Hear it again'}</span>
      </button>

      <div className="mt-6">
        <NextButton label={isLast ? 'Finish' : 'Next word'} onClick={onNext} />
      </div>
    </section>
  );
}

function LessonDone({ stars, language, onBack }: { stars: number; language: Track['language']; onBack: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-space-md text-center" aria-label="Lesson finished">
      <Stars count={stars} size="h-16 w-16" />
      <Tapi mood="cheer" className="h-40 w-40 animate-float" />
      <p className="font-display text-headline-lg-mobile text-primary">
        {language === 'fr' ? 'Un son de plus est revenu sur l’île !' : 'One more sound is back on the island!'}
      </p>
      <NextButton label="Back to the island" onClick={onBack} />
    </section>
  );
}
