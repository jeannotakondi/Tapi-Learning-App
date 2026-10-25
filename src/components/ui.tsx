import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import type { AvatarId } from '../store/store';
import { Icon } from './Icon';

/** Round grape speaker pod (56px+) that replays audio for pre-readers. */
export function SpeakerButton({
  onClick,
  label,
  size = 'md',
  tone = 'grape',
}: {
  onClick: () => void;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'grape' | 'mint' | 'sun';
}) {
  const sizes = { sm: 'h-12 w-12', md: 'h-14 w-14', lg: 'h-20 w-20' };
  const tones = {
    grape: 'bg-secondary text-on-secondary [--clay-edge:#3d0190]',
    mint: 'bg-primary-container text-on-primary-container [--clay-edge:#00522f]',
    sun: 'bg-tertiary-fixed text-on-tertiary-fixed [--clay-edge:#c9a82c]',
  };
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`clay flex shrink-0 items-center justify-center rounded-full [--clay-depth:4px] ${sizes[size]} ${tones[tone]}`}
    >
      <Icon name="speaker" className={size === 'lg' ? 'h-10 w-10' : 'h-7 w-7'} />
    </button>
  );
}

export function Stars({ count, max = 3, size = 'h-6 w-6' }: { count: number; max?: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${count} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Icon key={i} name="star" className={`${size} ${i < count ? 'text-tertiary-container' : 'text-outline-variant'}`} />
      ))}
    </span>
  );
}

const AVATARS: Record<AvatarId, { emoji: string; bg: string; edge: string; label: string }> = {
  lion: { emoji: '🦁', bg: 'bg-tertiary-fixed', edge: '#c9a82c', label: 'Lion' },
  bunny: { emoji: '🐰', bg: 'bg-secondary-fixed', edge: '#a882ff', label: 'Bunny' },
  whale: { emoji: '🐳', bg: 'bg-primary-fixed', edge: '#74db9d', label: 'Whale' },
  fox: { emoji: '🦊', bg: 'bg-[#ffdcc2]', edge: '#e8a46f', label: 'Fox' },
  frog: { emoji: '🐸', bg: 'bg-[#d8f5c4]', edge: '#93c96f', label: 'Frog' },
  owl: { emoji: '🦉', bg: 'bg-sky-200', edge: '#7fb6d6', label: 'Owl' },
};

export const AVATAR_IDS = Object.keys(AVATARS) as AvatarId[];

export function avatarStyle(id: AvatarId) {
  return AVATARS[id];
}

export function Avatar({ id, className = 'h-20 w-20 text-5xl' }: { id: AvatarId; className?: string }) {
  return (
    <span
      className={`well flex shrink-0 items-center justify-center rounded-full bg-surface-container-lowest ${className}`}
      role="img"
      aria-label={AVATARS[id].label}
    >
      {AVATARS[id].emoji}
    </span>
  );
}

/**
 * Grown-up gate: hold for 3 seconds. Small children rarely hold still that
 * long on a small button, so it keeps settings out of reach without a PIN.
 */
export function HoldToOpen({ onOpen, children, seconds = 3 }: { onOpen: () => void; children: ReactNode; seconds?: number }) {
  const [progress, setProgress] = useState(0);
  const timer = useRef<number>();

  const stop = () => {
    window.clearInterval(timer.current);
    setProgress(0);
  };

  const start = () => {
    const began = Date.now();
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const pct = Math.min(1, (Date.now() - began) / (seconds * 1000));
      setProgress(pct);
      if (pct >= 1) {
        stop();
        onOpen();
      }
    }, 50);
  };

  useEffect(() => () => window.clearInterval(timer.current), []);

  return (
    <button
      type="button"
      aria-label={`Grown-ups: hold for ${seconds} seconds`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) start();
      }}
      onKeyUp={stop}
      className="relative flex select-none items-center gap-2 overflow-hidden rounded-full bg-surface-container-high px-3 py-2 text-on-surface-variant"
      style={{ '--p': `${progress * 100}%` } as CSSProperties}
    >
      <span className="absolute inset-y-0 left-0 w-[var(--p)] bg-secondary/25" aria-hidden="true" />
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-lowest text-outline">
        <Icon name="lock" className="h-4 w-4" />
      </span>
      <span className="relative text-left leading-none">{children}</span>
    </button>
  );
}

export function BackButton({ onClick, label = 'Go back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="clay flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-lowest text-primary [--clay-depth:4px] [--clay-edge:#dcdad5]"
    >
      <Icon name="back" className="h-7 w-7" />
    </button>
  );
}

export function NextButton({ onClick, label, bounce = true }: { onClick: () => void; label: string; bounce?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`clay flex h-24 w-24 items-center justify-center rounded-full bg-primary text-on-primary [--clay-depth:8px] [--clay-edge:#00522f] ${bounce ? 'animate-float' : ''}`}
    >
      <Icon name="next" className="h-14 w-14" />
    </button>
  );
}
