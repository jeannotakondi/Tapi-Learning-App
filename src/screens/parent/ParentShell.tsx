import type { ReactNode } from 'react';
import { Icon } from '../../components/Icon';

/** Calm, text-first layout for the grown-up area. */
export function ParentShell({
  title,
  onBack,
  backLabel,
  children,
}: {
  title: string;
  onBack: () => void;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-surface/85 px-margin-mobile backdrop-blur-xl">
        <button
          type="button"
          aria-label={backLabel}
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface active:scale-95"
        >
          <Icon name="back" />
        </button>
        <h1 className="truncate text-headline-lg-mobile">{title}</h1>
      </header>
      <main className="space-y-space-md px-margin-mobile pb-10 pt-2">
        {children}
        <footer className="flex items-start gap-3 rounded-lg bg-surface-container-lowest p-space-md shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed/50 text-primary">
            <Icon name="lock" className="h-5 w-5" />
          </span>
          <p className="text-body-sm text-on-surface-variant">
            <strong className="block text-label-md text-on-surface">Private and offline</strong>
            Progress is saved on this device only. Tapi has no accounts, no ads and no tracking, and nothing is sent anywhere.
          </p>
        </footer>
      </main>
    </div>
  );
}
