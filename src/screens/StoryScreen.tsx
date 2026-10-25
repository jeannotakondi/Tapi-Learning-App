import { useEffect, useRef, useState } from 'react';
import { say, sequence, sfx, stopAudio } from '../audio/player';
import { findStory, lexicon, storyTokens, type Story } from '../curriculum';
import { LAST_STAGE, stageFinished } from '../engine/lessonPlan';
import { Tapi } from '../components/Tapi';
import { BackButton, NextButton, SpeakerButton } from '../components/ui';
import { navigate } from '../router';
import { addPlaytime, recordStory, setStage } from '../store/actions';
import { getState, type Profile, useActiveProfile } from '../store/store';
import { Icon } from '../components/Icon';

/** End-of-stage story, built only from sounds and tricky words the child knows. */
export function StoryScreen({ storyId }: { storyId: string }) {
  const profile = useActiveProfile();
  const story = findStory(storyId);

  useEffect(() => {
    if (!profile || !story) navigate({ name: 'map' }, { replace: true });
  }, [profile, story]);

  if (!profile || !story) return null;
  return <StoryRun key={storyId} profile={profile} story={story} />;
}

function StoryRun({ profile, story }: { profile: Profile; story: Story }) {
  const [page, setPage] = useState(0);
  const [finished, setFinished] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    sequence([() => say.tapi('story-time'), () => say.storyTitle(story.id, story.title)]);
    return () => {
      stopAudio();
      addPlaytime(profile.id, (Date.now() - startedAt.current) / 1000);
    };
  }, [story, profile.id]);

  const tokens = storyTokens(story.pages[page].text);

  const readWord = (key: string, index: number) => {
    setLit(index);
    const word = lexicon.get(key);
    const steps = word && word.text === key ? [() => say.blend(word), () => say.word(key)] : [() => say.word(key)];
    sequence(steps).then(() => setLit(null));
  };

  const finish = () => {
    stopAudio();
    recordStory(profile.id, story.id);
    const latest = getState().profiles.find((p) => p.id === profile.id);
    if (latest && latest.stage === story.stage && story.stage < LAST_STAGE && stageFinished(story.stage, latest.lessons, latest.stories)) {
      setStage(profile.id, story.stage + 1);
    }
    setFinished(true);
    sfx.chime();
    sequence([() => say.tapi('story-done')]);
  };

  if (finished) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-space-md px-margin-mobile text-center">
        <span className="text-[72px]" aria-hidden="true">
          📚
        </span>
        <Tapi mood="cheer" className="h-40 w-40 animate-float" />
        <p className="font-display text-headline-lg-mobile text-primary">The end. You read a whole story!</p>
        <NextButton label="Back to the island" onClick={() => navigate({ name: 'map' })} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-margin-mobile pb-6">
      <header className="flex items-center justify-between gap-3 py-3">
        <BackButton label="Back to the island" onClick={() => navigate({ name: 'map' })} />
        <h1 className="flex-1 truncate text-center text-headline-md">{story.title}</h1>
        <span className="w-14" />
      </header>

      <section
        className="pillow flex flex-1 flex-col items-center gap-space-lg rounded-lg bg-surface-container-lowest p-space-lg"
        aria-label={`Page ${page + 1} of ${story.pages.length}`}
      >
        <span key={page} className="animate-pop-in text-[110px] leading-none" aria-hidden="true">
          {story.pages[page].picture}
        </span>
        <p className="flex flex-wrap justify-center gap-x-2 gap-y-3 text-center">
          {tokens.map((t, i) => (
            <span key={i} className="inline-flex items-baseline">
              <button
                type="button"
                onClick={() => readWord(t.key, i)}
                className={`rounded-DEFAULT px-1.5 font-body text-[32px] font-semibold leading-tight transition-colors ${
                  lit === i ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                {t.word}
              </button>
              <span className="-ml-1 font-body text-[32px] text-on-surface" aria-hidden="true">
                {t.trailing}
              </span>
            </span>
          ))}
        </p>
        <SpeakerButton
          size="lg"
          tone="sun"
          label="Read this page to me"
          onClick={() => say.storyPage(story.id, page, story.pages[page].text)}
        />
      </section>

      <nav className="mt-space-md flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => {
            stopAudio();
            setPage(page - 1);
          }}
          className="clay flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-lowest text-primary [--clay-depth:4px] disabled:opacity-30"
        >
          <Icon name="back" className="h-8 w-8" />
        </button>
        <ol className="flex gap-1.5" aria-hidden="true">
          {story.pages.map((_, i) => (
            <li key={i} className={`h-3 w-3 rounded-full ${i <= page ? 'bg-primary-container' : 'bg-surface-container-highest'}`} />
          ))}
        </ol>
        <NextButton
          bounce={false}
          label={page + 1 < story.pages.length ? 'Next page' : 'Finish the story'}
          onClick={() => {
            stopAudio();
            if (page + 1 < story.pages.length) setPage(page + 1);
            else finish();
          }}
        />
      </nav>
    </main>
  );
}
