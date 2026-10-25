import { type FormEvent, useState } from 'react';
import { LAND_LINES } from '../../audio/lines';
import { type Language, tracks } from '../../curriculum';
import { stageHasContent } from '../../engine/lessonPlan';
import { Avatar, AVATAR_IDS } from '../../components/ui';
import { navigate } from '../../router';
import { createProfile } from '../../store/actions';
import type { AvatarId } from '../../store/store';
import { LANGUAGE_LABELS, ParentShell } from './ParentShell';

export function AddChild() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<AvatarId>('lion');
  const [language, setLanguage] = useState<Language>('en');
  const [stage, setStage] = useState(1);
  const track = tracks[language];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProfile({ name, avatar, language, stage });
    navigate({ name: 'parent-home' });
  };

  return (
    <ParentShell title="Add a child" onBack={() => navigate({ name: 'parent-home' })} backLabel="Back to grown-ups">
      <form onSubmit={submit} className="space-y-space-md">
        <label className="block space-y-2">
          <span className="text-label-md">First name or nickname</span>
          <input
            required
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            className="h-14 w-full rounded-full bg-surface-container-low px-5 text-body-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-4 focus:ring-secondary-fixed-dim"
          />
          <span className="block text-body-sm text-on-surface-variant">Shown on the Who is playing screen. A nickname is fine.</span>
        </label>

        <fieldset className="space-y-2">
          <legend className="text-label-md">Picture</legend>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_IDS.map((id) => (
              <label key={id} className="cursor-pointer">
                <input
                  type="radio"
                  name="avatar"
                  value={id}
                  checked={avatar === id}
                  onChange={() => setAvatar(id)}
                  className="peer sr-only"
                />
                <span className="block rounded-full p-0.5 ring-secondary peer-checked:ring-4 peer-focus-visible:outline peer-focus-visible:outline-4 peer-focus-visible:outline-secondary">
                  <Avatar id={id} className="h-12 w-12 text-2xl" />
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-label-md">Learning language</legend>
          <div className="grid grid-cols-2 gap-1 rounded-DEFAULT bg-surface-container-highest p-1">
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
              <label key={lang} className="cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value={lang}
                  checked={language === lang}
                  onChange={() => setLanguage(lang)}
                  className="peer sr-only"
                />
                <span className="block rounded-DEFAULT py-2 text-center text-label-md text-on-surface-variant peer-checked:bg-surface-container-lowest peer-checked:text-on-surface peer-checked:shadow peer-focus-visible:outline peer-focus-visible:outline-4 peer-focus-visible:outline-secondary">
                  {LANGUAGE_LABELS[lang]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block space-y-2">
          <span className="text-label-md">Starting stage</span>
          <select
            value={stage}
            onChange={(e) => setStage(Number(e.target.value))}
            className="h-14 w-full rounded-full bg-surface-container-low px-5 text-body-md focus:outline-none focus:ring-4 focus:ring-secondary-fixed-dim"
          >
            {track.stages.map((s) => (
              <option key={s.index} value={s.index} disabled={!stageHasContent(track, s.index)}>
                Stage {s.index}: {s.title} ({LAND_LINES[s.land].en}){stageHasContent(track, s.index) ? '' : ', coming soon'}
              </option>
            ))}
          </select>
          <span className="block text-body-sm text-on-surface-variant">
            Not sure? Start at Stage 1. You can move your child up or down a stage at any time.
          </span>
        </label>

        <button
          type="submit"
          disabled={!name.trim()}
          className="clay flex h-14 w-full items-center justify-center rounded-full bg-primary-container text-label-lg text-on-primary-container [--clay-depth:4px] [--clay-edge:#00522f] disabled:opacity-50"
        >
          Add child
        </button>
      </form>
    </ParentShell>
  );
}
