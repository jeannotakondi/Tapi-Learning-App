import { type FormEvent, useState } from 'react';
import { LAND_NAMES, track } from '../../curriculum';
import { Avatar, AVATAR_IDS } from '../../components/ui';
import { navigate } from '../../router';
import { createProfile, selectProfile } from '../../store/actions';
import type { AvatarId } from '../../store/store';
import { ParentShell } from './ParentShell';

export function AddChild() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<AvatarId>('lion');
  const [start, setStart] = useState<'placement' | 'choose'>('placement');
  const [stage, setStage] = useState(1);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const profile = createProfile({ name, avatar, stage: start === 'choose' ? stage : 1 });
    if (start === 'placement') {
      selectProfile(profile.id);
      navigate({ name: 'placement' });
    } else {
      navigate({ name: 'parent-home' });
    }
  };

  const radio = (value: 'placement' | 'choose', title: string, detail: string) => (
    <label className="flex cursor-pointer items-start gap-3 rounded-DEFAULT bg-surface-container-low p-3">
      <input type="radio" name="start" checked={start === value} onChange={() => setStart(value)} className="mt-1 h-5 w-5 accent-primary" />
      <span>
        <span className="block text-label-lg">{title}</span>
        <span className="block text-body-sm text-on-surface-variant">{detail}</span>
      </span>
    </label>
  );

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
          <legend className="text-label-md">Where to start</legend>
          {radio('placement', 'Let Tapi find the right stage', 'Your child plays a short listening and word game, about 3 to 5 minutes.')}
          {radio('choose', 'I’ll choose the stage', 'Pick a stage yourself. You can change it at any time.')}
          {start === 'choose' && (
            <select
              aria-label="Starting stage"
              value={stage}
              onChange={(e) => setStage(Number(e.target.value))}
              className="h-14 w-full rounded-full bg-surface-container-low px-5 text-body-md focus:outline-none focus:ring-4 focus:ring-secondary-fixed-dim"
            >
              {track.stages.map((s) => (
                <option key={s.index} value={s.index}>
                  Stage {s.index}: {s.title} ({LAND_NAMES[s.land]})
                </option>
              ))}
            </select>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={!name.trim()}
          className="clay flex h-14 w-full items-center justify-center rounded-full bg-primary-container text-label-lg text-on-primary-container [--clay-depth:4px] [--clay-edge:#00522f] disabled:opacity-50"
        >
          {start === 'placement' ? 'Add child and start the game' : 'Add child'}
        </button>
      </form>
    </ParentShell>
  );
}
