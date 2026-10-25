import { isSplit } from '../curriculum';

/**
 * The letters on a tile. A split spelling (a-e) shows both letters joined by
 * a curved line, so children see they work together across another letter.
 */
export function TileGlyph({ grapheme }: { grapheme: string }) {
  if (!isSplit(grapheme)) return <>{grapheme}</>;
  return (
    <span className="relative inline-flex items-end gap-[0.25em] pt-[0.3em]" aria-label={`${grapheme[0]} and e, working together`}>
      <svg
        className="absolute left-[0.15em] top-0 h-[0.35em] w-[calc(100%-0.3em)]"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M5 18 Q50 -6 95 18" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <span>{grapheme[0]}</span>
      <span>e</span>
    </span>
  );
}

/** Smaller type for longer tiles so "igh" or "air" still fits. */
export function tileTextSize(grapheme: string, compact: boolean): string {
  const letters = isSplit(grapheme) ? 2 : grapheme.length;
  if (compact) return letters >= 3 ? 'text-[24px]' : letters === 2 ? 'text-[28px]' : 'text-[34px]';
  return letters >= 3 ? 'text-[30px]' : letters === 2 ? 'text-[36px]' : 'text-[44px]';
}
