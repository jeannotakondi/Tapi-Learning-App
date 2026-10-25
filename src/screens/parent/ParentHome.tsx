import { LAND_NAMES, track } from '../../curriculum';
import { Icon } from '../../components/Icon';
import { Avatar } from '../../components/ui';
import { navigate } from '../../router';
import { useAppState } from '../../store/store';
import { ParentShell } from './ParentShell';

export function ParentHome() {
  const profiles = useAppState((s) => s.profiles);

  return (
    <ParentShell title="Grown-ups" onBack={() => navigate({ name: 'picker' })} backLabel="Back to Who is playing">
      <section className="space-y-space-sm">
        <h2 className="px-1 text-headline-md">Children</h2>
        {profiles.length === 0 && (
          <p className="rounded-lg bg-surface-container-low p-space-md text-body-md text-on-surface-variant">
            No children yet. Add one to start. Each child gets their own progress, and a teacher can add a whole class.
          </p>
        )}
        <ul className="space-y-space-sm">
          {profiles.map((p) => {
            const land = track.stages[p.stage].land;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => navigate({ name: 'parent-child', profileId: p.id })}
                  className="flex w-full items-center gap-3 rounded-lg bg-surface-container-low p-3 text-left shadow-sm active:scale-[0.99]"
                >
                  <Avatar id={p.avatar} className="h-14 w-14 text-3xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label-lg">{p.name}</span>
                    <span className="block text-body-sm text-on-surface-variant">
                      Stage {p.stage}: {LAND_NAMES[land]}
                    </span>
                  </span>
                  <Icon name="next" className="h-5 w-5 text-outline" />
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => navigate({ name: 'parent-new' })}
          className="clay flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary-container text-label-lg text-on-primary-container [--clay-depth:4px] [--clay-edge:#00522f]"
        >
          <Icon name="plus" /> Add a child
        </button>
      </section>
    </ParentShell>
  );
}
