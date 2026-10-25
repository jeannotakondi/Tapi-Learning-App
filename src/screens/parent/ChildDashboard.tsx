import { useEffect, useState } from 'react';
import { recordingChecklistCsv, requiredClips } from '../../audio/files';
import { getManifest, loadManifest, say } from '../../audio/player';
import { allLessons, allStories, LAND_NAMES, track } from '../../curriculum';
import { LAST_STAGE } from '../../engine/lessonPlan';
import { graphemesLearned, lastSevenDays, soundForKey, soundsToPractise, trickyWordsLearned, wordsBuilt } from '../../engine/progress';
import { Icon } from '../../components/Icon';
import { Avatar, AVATAR_IDS } from '../../components/ui';
import { navigate } from '../../router';
import { deleteProfile, renameProfile, selectProfile, setStage, setVolume } from '../../store/actions';
import { useAppState } from '../../store/store';
import { ParentShell } from './ParentShell';

const card = 'rounded-lg bg-surface-container-low p-space-md shadow-sm';

export function ChildDashboard({ profileId }: { profileId: string }) {
  const profile = useAppState((s) => s.profiles.find((p) => p.id === profileId));
  const volume = useAppState((s) => s.settings.volume);
  const [manifestLoaded, setManifestLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    loadManifest().then(() => setManifestLoaded(true));
  }, []);

  useEffect(() => {
    if (!profile) navigate({ name: 'parent-home' }, { replace: true });
  }, [profile]);

  if (!profile) return null;

  const stageIndex = profile.stage;
  const stage = track.stages[stageIndex];
  const learned = graphemesLearned(profile);
  const trickyLearned = trickyWordsLearned(profile);
  const storiesRead = allStories().filter((st) => st.id in profile.stories);
  const practise = soundsToPractise(profile);
  const week = lastSevenDays(profile.playtime);
  const weekMinutes = week.reduce((a, d) => a + d.minutes, 0);
  const maxMinutes = Math.max(10, ...week.map((d) => d.minutes));
  const lessonsDone = stage.lessons.filter((l) => l.id in profile.lessons).length;

  const clips = requiredClips();
  const manifest = getManifest();
  const recorded = clips.filter((c) => manifest[c.kind]?.[c.key]).length;

  const downloadChecklist = () => {
    const csv = recordingChecklistCsv(clips, manifest);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'tapi-recording-checklist.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ParentShell title={profile.name} onBack={() => navigate({ name: 'parent-home' })} backLabel="Back to grown-ups">
      <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-space-md py-space-sm shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar id={profile.avatar} className="h-12 w-12 text-2xl" />
          <span className="text-label-lg">{profile.name}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            selectProfile(profile.id);
            navigate({ name: 'map' });
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-4 py-2 text-label-md text-on-primary-container active:scale-95"
        >
          Play now <Icon name="next" className="h-4 w-4" />
        </button>
      </div>

      {/* Journey */}
      <section className="relative overflow-hidden rounded-lg bg-surface-container p-space-md shadow-[0_8px_20px_-4px_rgba(0,106,62,0.08)]">
        <span className="inline-flex rounded-full bg-primary-fixed px-2.5 py-0.5 text-label-sm text-on-primary-fixed">
          Stage {stageIndex} of 5
        </span>
        <h2 className="mt-1 text-headline-lg-mobile">{LAND_NAMES[stage.land]}</h2>
        <p className="text-body-sm text-on-surface-variant">
          {stage.title}. Follows {stage.source}.
          {stage.lessons.length > 0
            ? ` ${lessonsDone} of ${stage.lessons.length} lessons done.`
            : ' Lessons for this stage are not built yet.'}
        </p>
        <div className="mt-space-md grid grid-cols-2 gap-2">
          <div className="rounded-DEFAULT bg-surface-container-lowest p-3 shadow-sm">
            <span className="block text-label-lg text-primary">{learned.length} sounds</span>
            <span className="block text-label-sm text-outline">learned so far</span>
          </div>
          <div className="rounded-DEFAULT bg-surface-container-lowest p-3 shadow-sm">
            <span className="block text-label-lg text-secondary">{wordsBuilt(profile)} words</span>
            <span className="block text-label-sm text-outline">built with tiles</span>
          </div>
        </div>
      </section>

      {/* Sounds */}
      <section className="space-y-space-sm">
        <h3 className="px-1 text-headline-md">Sounds</h3>
        <div className={`${card} space-y-space-sm`}>
          {learned.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Sounds appear here as lessons are finished.</p>
          ) : (
            <>
              <p className="text-label-sm text-on-surface-variant">Tap a sound to hear it the way Tapi says it.</p>
              <div className="flex flex-wrap gap-2">
                {learned.map((key) => {
                  const g = track.graphemes[key];
                  // A second sound for a spelling ("oo" in book) is labelled with its example word.
                  const label = key.includes(':') ? `${g.grapheme} (${g.example})` : g.grapheme;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`Play sound ${label}`}
                      onClick={() => say.sound(g.sound)}
                      className="clay h-12 min-w-12 rounded-DEFAULT bg-surface-container-lowest px-2 font-display text-headline-md text-primary [--clay-depth:3px]"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {practise.length > 0 && (
            <div className="mt-space-md rounded-DEFAULT bg-tertiary-fixed/30 p-3.5">
              <p className="text-label-md text-on-tertiary-container">Worth practising</p>
              <div className="my-2 flex gap-2">
                {practise.map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-label={`Play sound ${g}`}
                    onClick={() => say.sound(soundForKey(g))}
                    className="rounded-DEFAULT bg-surface-container-lowest px-3.5 py-1 font-display text-body-lg text-tertiary shadow-[0_2px_0_#bdcabe]"
                  >
                    {g}
                  </button>
                ))}
              </div>
              <p className="text-body-sm text-on-surface-variant">
                {profile.name} has needed a few tries with these. Tapi repeats a sound at the start of the next lesson after three misses in
                one session. Mixing up sounds is a normal part of learning.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Tricky words and stories */}
      <section className="space-y-space-sm">
        <h3 className="px-1 text-headline-md">Tricky words and stories</h3>
        <div className={`${card} space-y-space-sm`}>
          {trickyLearned.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              Tricky words (like &quot;the&quot; and &quot;was&quot;) appear here once they come up in lessons.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {trickyLearned.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-label={`Hear ${t}`}
                  onClick={() => say.word(t)}
                  className="rounded-DEFAULT bg-secondary-fixed px-3 py-1 text-body-lg text-on-secondary-fixed"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
          <p className="text-body-sm text-on-surface-variant">
            {storiesRead.length === 0
              ? 'No stories read yet. Each island ends with one.'
              : `Stories read: ${storiesRead.map((st) => st.title).join(', ')}.`}
          </p>
        </div>
      </section>

      {/* Playtime */}
      <section className="space-y-space-sm">
        <h3 className="px-1 text-headline-md">This week</h3>
        <div className={`${card} space-y-space-md`}>
          <p>
            <span className="font-display text-headline-xl-mobile">{weekMinutes}</span>
            <span className="ml-1 text-body-md text-on-surface-variant">
              {weekMinutes === 1 ? 'minute' : 'minutes'} played in the last 7 days
            </span>
          </p>
          <div
            className="flex h-36 items-end justify-between px-1"
            role="img"
            aria-label={week.map((d) => `${d.label} ${d.minutes} minutes`).join(', ')}
          >
            {week.map((d, i) => (
              <div key={d.key} className="flex w-8 flex-col items-center gap-1.5">
                <span className="text-label-sm text-on-surface-variant">{d.minutes ? `${d.minutes}m` : '–'}</span>
                <div
                  className={`w-6 rounded-t-DEFAULT ${i === week.length - 1 ? 'bg-secondary' : 'bg-secondary-fixed'}`}
                  style={{ height: `${Math.max(4, (d.minutes / maxMinutes) * 96)}px` }}
                />
                <span className="text-label-sm">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="rounded-DEFAULT bg-surface-container-lowest p-3 text-body-sm text-on-surface-variant">
            A lesson takes about 5 to 10 minutes and ends with Tapi saying goodbye. There are no timers or rankings.
          </p>
        </div>
      </section>

      {/* Settings */}
      <section className="space-y-space-sm">
        <h3 className="px-1 text-headline-md">Settings</h3>
        <div className={`${card} space-y-space-md`}>
          <div className="space-y-2">
            <span className="block text-label-md">Stage</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Move down a stage"
                disabled={stageIndex <= 0}
                onClick={() => setStage(profile.id, stageIndex - 1)}
                className="h-12 w-12 rounded-full bg-surface-container-lowest text-headline-md shadow-sm disabled:opacity-40"
              >
                −
              </button>
              <span className="flex-1 text-center text-body-md">
                Stage {stageIndex}: {stage.title}
              </span>
              <button
                type="button"
                aria-label="Move up a stage"
                disabled={stageIndex >= LAST_STAGE}
                onClick={() => setStage(profile.id, stageIndex + 1)}
                className="h-12 w-12 rounded-full bg-surface-container-lowest text-headline-md shadow-sm disabled:opacity-40"
              >
                +
              </button>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              {profile.placement
                ? `The placement game suggested Stage ${profile.placement.stage} on ${new Date(profile.placement.at).toLocaleDateString('en-GB')}.`
                : 'The placement game hasn’t been played yet.'}
            </p>
            <button
              type="button"
              onClick={() => {
                selectProfile(profile.id);
                navigate({ name: 'placement' });
              }}
              className="text-label-md text-primary underline underline-offset-4"
            >
              Play the placement game {profile.placement ? 'again' : 'now'}
            </button>
          </div>

          <label className="block space-y-2">
            <span className="flex justify-between text-label-md">
              Voice and sound volume <span className="text-on-surface-variant">{Math.round(volume * 100)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-full accent-primary"
            />
            <span className="block text-body-sm text-on-surface-variant">Applies to every child on this device.</span>
          </label>

          {editing ? (
            <EditProfile
              name={profile.name}
              avatar={profile.avatar}
              onSave={(name, avatar) => {
                renameProfile(profile.id, name, avatar);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="text-label-md text-primary underline underline-offset-4">
              Change name or picture
            </button>
          )}
        </div>
      </section>

      {/* Recordings */}
      <section className="space-y-space-sm">
        <h3 className="px-1 text-headline-md">Recordings</h3>
        <div className={`${card} space-y-space-sm`}>
          <p className="text-body-md">{manifestLoaded ? `${recorded} of ${clips.length}` : '…'} recordings are in place.</p>
          <p className="text-body-sm text-on-surface-variant">
            Until a sound is recorded by a real voice, Tapi uses this device&apos;s computer voice as a stand-in. Computer voices often add
            an extra &quot;uh&quot; to short sounds, so they are fine for testing but not for children.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadChecklist}
              className="inline-flex items-center gap-2 rounded-full bg-secondary-fixed px-4 py-2 text-label-md text-on-secondary-fixed active:scale-95"
            >
              <Icon name="download" className="h-5 w-5" /> Download checklist (CSV)
            </button>
            <button
              type="button"
              onClick={() => {
                // Some embedded viewers block downloads; copying works there and pastes into a spreadsheet.
                navigator.clipboard
                  .writeText(recordingChecklistCsv(clips, manifest).replace(/","/g, '"\t"'))
                  .then(() => setCopied('copied'))
                  .catch(() => setCopied('failed'));
              }}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-label-md text-on-surface active:scale-95"
            >
              Copy for a spreadsheet
            </button>
          </div>
          {copied !== 'idle' && (
            <p className="text-body-sm text-on-surface-variant" role="status">
              {copied === 'copied' ? 'Copied. Paste it into a spreadsheet.' : 'This device didn’t allow copying. Try the download instead.'}
            </p>
          )}
          <p className="text-body-sm text-on-surface-variant">
            {allLessons().length} lessons and {allStories().length} stories. The checklist lists every file to record, what to say and
            whether it already exists.
          </p>
        </div>
      </section>

      {confirmDelete ? (
        <div className="space-y-3 rounded-lg bg-error-container p-space-md" role="alertdialog" aria-label={`Delete ${profile.name}?`}>
          <p className="text-body-md text-on-surface">
            Delete {profile.name} and all of their progress on this device? This can’t be undone.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                deleteProfile(profile.id);
                navigate({ name: 'parent-home' });
              }}
              className="rounded-full bg-error px-4 py-2 text-label-md text-white"
            >
              Delete {profile.name}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-full px-4 py-2 text-label-md text-on-surface-variant"
            >
              Keep
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 px-1 text-label-md text-error">
          <Icon name="trash" className="h-5 w-5" /> Delete {profile.name}
        </button>
      )}
    </ParentShell>
  );
}

function EditProfile({
  name,
  avatar,
  onSave,
  onCancel,
}: {
  name: string;
  avatar: (typeof AVATAR_IDS)[number];
  onSave: (name: string, avatar: (typeof AVATAR_IDS)[number]) => void;
  onCancel: () => void;
}) {
  const [draftName, setDraftName] = useState(name);
  const [draftAvatar, setDraftAvatar] = useState(avatar);
  return (
    <div className="space-y-3 rounded-DEFAULT bg-surface-container-lowest p-3">
      <input
        aria-label="Name"
        maxLength={20}
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        className="h-12 w-full rounded-full bg-surface-container-low px-4 focus:outline-none focus:ring-4 focus:ring-secondary-fixed-dim"
      />
      <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Picture">
        {AVATAR_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={draftAvatar === id}
            onClick={() => setDraftAvatar(id)}
            className={`rounded-full p-0.5 ${draftAvatar === id ? 'ring-4 ring-secondary' : ''}`}
          >
            <Avatar id={id} className="h-11 w-11 text-2xl" />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!draftName.trim()}
          onClick={() => onSave(draftName, draftAvatar)}
          className="rounded-full bg-primary-container px-4 py-2 text-label-md text-on-primary-container disabled:opacity-50"
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded-full px-4 py-2 text-label-md text-on-surface-variant">
          Cancel
        </button>
      </div>
    </div>
  );
}
