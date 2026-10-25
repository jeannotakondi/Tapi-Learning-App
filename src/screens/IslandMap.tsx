import { useEffect, useRef } from 'react';
import { LAND_LINES } from '../audio/lines';
import { say } from '../audio/player';
import { type Stage, tracks } from '../curriculum';
import { nextLessonInStage } from '../engine/lessonPlan';
import { Icon } from '../components/Icon';
import { Tapi } from '../components/Tapi';
import { Avatar, BackButton, SpeakerButton, Stars } from '../components/ui';
import { navigate } from '../router';
import type { Profile } from '../store/store';
import { useActiveProfile } from '../store/store';

const LAND_ART: Record<string, string> = {
  'whisper-beach': '🏖️',
  'first-sound-forest': '🌳',
  'echo-hills': '⛰️',
  'rainbow-river': '🌈',
  'windy-cliffs': '🌬️',
  'singing-mountain': '🏔️',
};

// Zig-zag the lands along the path, like the Stitch map.
const OFFSETS = ['ml-0', '-ml-16', 'ml-16', 'ml-0', '-ml-12', 'ml-12'];

function stageStars(stage: Stage, profile: Profile): number {
  const results = stage.lessons.map((l) => profile.lessons[l.id]?.stars ?? 0);
  if (results.length === 0) return 0;
  return Math.round(results.reduce((a, b) => a + b, 0) / results.length);
}

export function IslandMap() {
  const profile = useActiveProfile();
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) navigate({ name: 'picker' }, { replace: true });
  }, [profile]);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center' });
  }, []);

  if (!profile) return null;

  const language = profile.language;
  const track = tracks[language];
  const currentStage = profile.stage[language];
  const stage = track.stages[currentStage];
  const nextLesson = nextLessonInStage(track, currentStage, profile.lessons);
  const lessonToPlay = nextLesson ?? stage.lessons[stage.lessons.length - 1];

  const play = () => {
    if (lessonToPlay) navigate({ name: 'lesson', lessonId: lessonToPlay.id });
    else say.tapi(language, 'land-asleep');
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-margin-mobile pb-10">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-12 left-1/2 h-[320px] w-[480px] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-200 via-tertiary-fixed to-secondary-container opacity-25 blur-3xl" />
        <div className="absolute -left-12 top-28 h-20 w-48 rounded-full bg-surface-container-lowest/80 blur-md" />
        <div className="absolute -right-10 top-64 h-24 w-52 rounded-full bg-surface-container-lowest/70 blur-md" />
      </div>

      <header className="sticky top-0 z-30 -mx-margin-mobile flex items-center justify-between bg-surface/85 px-margin-mobile py-3 backdrop-blur-xl">
        <BackButton label="Change player" onClick={() => navigate({ name: 'picker' })} />
        <div className="pillow flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-1.5">
          <SpeakerButton size="sm" label="Hear the island name" onClick={() => say.land(language, stage.land)} />
          <span className="font-display text-headline-md text-primary">{LAND_LINES[stage.land][language]}</span>
        </div>
        <Avatar id={profile.avatar} className="h-14 w-14 text-3xl" />
      </header>

      {stage.lessons.length > 0 && (
        <nav aria-label="Lessons on this island" className="pillow mt-2 rounded-lg bg-surface-container-lowest/90 p-3">
          <ol className="flex flex-wrap justify-center gap-2">
            {stage.lessons.map((lesson, i) => {
              const result = profile.lessons[lesson.id];
              const unlocked = Boolean(result) || lesson.id === nextLesson?.id;
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    disabled={!unlocked}
                    aria-label={`Lesson ${i + 1}${result ? `, ${result.stars} stars` : ''}`}
                    onClick={() => navigate({ name: 'lesson', lessonId: lesson.id })}
                    className={`flex h-16 w-14 flex-col items-center justify-center rounded-DEFAULT font-display text-headline-md ${
                      lesson.id === nextLesson?.id
                        ? 'clay bg-primary-container text-on-primary-container [--clay-depth:4px] [--clay-edge:#00522f]'
                        : result
                          ? 'clay bg-primary-fixed text-on-primary-fixed [--clay-depth:4px] [--clay-edge:#74db9d]'
                          : 'well bg-surface-container text-outline-variant'
                    }`}
                  >
                    {unlocked ? i + 1 : <Icon name="lock" className="h-5 w-5" />}
                    {result && <Stars count={result.stars} size="h-3 w-3" />}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="relative mt-6 flex flex-col-reverse items-center gap-space-xl">
        <svg
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
          viewBox="0 0 360 920"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 180 900 C 80 780, 90 640, 190 540 C 290 440, 270 330, 160 250 C 70 170, 120 80, 180 20"
            stroke="#e5e2dd"
            strokeWidth="36"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 180 900 C 80 780, 90 640, 190 540 C 290 440, 270 330, 160 250 C 70 170, 120 80, 180 20"
            stroke="#bdcabe"
            strokeDasharray="14 16"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {track.stages.map((s) => {
          const isCurrent = s.index === currentStage;
          const done = s.index < currentStage;
          const name = LAND_LINES[s.land][language];
          return (
            <div
              key={s.land}
              ref={isCurrent ? currentRef : undefined}
              className={`relative flex flex-col items-center ${OFFSETS[s.index]}`}
            >
              {isCurrent && (
                <div className="-mb-2 flex flex-col items-center">
                  <Tapi mood="wave" className="h-20 w-20 animate-float" />
                </div>
              )}
              <div className="mb-1.5 flex items-center gap-2">
                <SpeakerButton
                  size="sm"
                  tone={isCurrent ? 'grape' : done ? 'mint' : 'sun'}
                  label={`Hear ${name}`}
                  onClick={() => say.land(language, s.land)}
                />
                <span
                  className={`rounded-full px-3 py-1 font-display ${isCurrent ? 'pillow bg-surface-container-lowest text-headline-lg-mobile text-primary' : 'bg-surface-container-high text-headline-md text-on-surface-variant'}`}
                >
                  {name}
                </span>
              </div>

              {isCurrent ? (
                <div className="relative my-1 flex items-center justify-center">
                  <span className="absolute h-36 w-36 animate-ping rounded-full bg-tertiary-fixed/50 [animation-duration:2.6s]" />
                  <button
                    type="button"
                    aria-label={`Play on ${name}`}
                    onClick={play}
                    className="clay relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-primary-container text-on-primary-container [--clay-depth:8px] [--clay-edge:#00522f]"
                  >
                    <Icon name="play" className="h-16 w-16" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={done ? `${name}, finished` : `${name}, not open yet`}
                  onClick={() => (done ? say.land(language, s.land) : say.tapi(language, 'land-asleep'))}
                  className={`relative flex h-24 w-24 items-center justify-center rounded-full text-5xl ${
                    done ? 'clay bg-primary-fixed [--clay-edge:#74db9d]' : 'well bg-surface-container-highest opacity-75 grayscale'
                  }`}
                >
                  {LAND_ART[s.land]}
                  <span
                    className={`absolute -bottom-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md ${done ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-outline'}`}
                  >
                    <Icon name={done ? 'check' : 'lock'} className="h-4 w-4" />
                  </span>
                </button>
              )}
              {s.lessons.length > 0 && (
                <div className="mt-2">
                  <Stars count={stageStars(s, profile)} size={isCurrent ? 'h-6 w-6' : 'h-5 w-5'} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
