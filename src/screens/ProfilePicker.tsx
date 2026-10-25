import { useEffect } from 'react';
import { say } from '../audio/player';
import { Tapi } from '../components/Tapi';
import { Avatar, avatarStyle, HoldToOpen, SpeakerButton } from '../components/ui';
import { navigate } from '../router';
import { selectProfile } from '../store/actions';
import { useAppState } from '../store/store';

export function ProfilePicker() {
  const profiles = useAppState((s) => s.profiles);
  // Before anyone has picked a profile, greet in the language of the first child.
  const language = profiles[0]?.language ?? 'en';

  useEffect(() => {
    selectProfile(undefined);
  }, []);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-gutter-mobile pb-6">
      <div className="pointer-events-none absolute -top-12 left-1/2 h-56 w-[140%] -translate-x-1/2 rounded-[100%] bg-gradient-to-b from-secondary-fixed/40 via-surface-container-low to-transparent" />

      <div className="relative z-10 flex justify-end pt-3">
        <HoldToOpen onOpen={() => navigate({ name: 'parent-home' })}>
          <span className="block text-label-sm text-outline">Grown-ups</span>
          <span className="block text-[10px] text-on-surface-variant/70">Hold 3s</span>
        </HoldToOpen>
      </div>

      <div className="relative z-10 mt-3 flex justify-center">
        <div className="pillow inline-flex items-center gap-3 rounded-full bg-surface-container-lowest px-5 py-3">
          <h1 className="text-headline-lg-mobile">{language === 'fr' ? 'Qui joue ?' : 'Who is playing?'}</h1>
          <SpeakerButton size="sm" label="Listen" onClick={() => say.tapi(language, 'who-is-playing')} />
        </div>
      </div>

      <ul className="relative z-10 mt-5 flex flex-col gap-5">
        {profiles.map((profile) => {
          const style = avatarStyle(profile.avatar);
          return (
            <li key={profile.id} className="relative">
              <button
                type="button"
                aria-label={`Play as ${profile.name}`}
                onClick={() => {
                  selectProfile(profile.id);
                  navigate({ name: 'map' });
                }}
                className={`clay flex w-full items-center gap-4 rounded-lg p-3.5 pr-20 text-left ${style.bg}`}
                style={{ ['--clay-edge' as string]: style.edge }}
              >
                <Avatar id={profile.avatar} className="h-24 w-24 text-6xl" />
                <span className="truncate font-display text-headline-lg-mobile">{profile.name}</span>
              </button>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <SpeakerButton tone="mint" label={`Hear ${profile.name}`} onClick={() => say.text(profile.language, profile.name)} />
              </div>
            </li>
          );
        })}
      </ul>

      {profiles.length === 0 && (
        <p className="relative z-10 mt-6 rounded-lg bg-surface-container-low p-space-md text-center text-body-lg text-on-surface-variant">
          Grown-ups: hold the button at the top for 3 seconds to add your first child.
        </p>
      )}

      <div className="relative z-10 mt-auto flex items-end justify-end pt-6">
        <button type="button" aria-label="Tapi says hello" onClick={() => say.tapi(language, 'hello')} className="relative active:scale-95">
          <span className="absolute -top-3 left-0 animate-bounce rounded-full bg-surface-container-lowest px-2.5 py-1 text-[11px] font-semibold text-primary shadow-md">
            {language === 'fr' ? 'Touche-moi !' : 'Tap me!'}
          </span>
          <Tapi mood="wave" className="h-28 w-28 drop-shadow-[0_10px_16px_rgba(0,106,62,0.18)]" />
        </button>
      </div>
    </main>
  );
}
