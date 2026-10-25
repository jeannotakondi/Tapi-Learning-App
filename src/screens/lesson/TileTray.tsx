import { type PointerEvent, type RefObject, useMemo, useRef, useState } from 'react';
import type { Tile } from '../../curriculum';

export interface TrayTile extends Tile {
  key: string;
  placed: boolean;
}

// Spots in the tray (percent of width/height) with a small tilt, so tiles look
// scattered but never overlap. Enough room for the longest stage 5 words.
const SPOTS = [
  { x: 8, y: 12, r: -7 },
  { x: 58, y: 8, r: 5 },
  { x: 33, y: 52, r: 4 },
  { x: 72, y: 54, r: -5 },
  { x: 4, y: 58, r: 6 },
  { x: 40, y: 10, r: -3 },
  { x: 20, y: 34, r: 3 },
  { x: 62, y: 32, r: -6 },
];

/** Same tiles always land in the same spots for a word, so replaying feels familiar. */
function spotsFor(seed: string, count: number) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const order = SPOTS.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    const j = hash % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.slice(0, count).map((i) => SPOTS[i]);
}

const DRAG_THRESHOLD = 8;

interface Props {
  wordId: string;
  tiles: TrayTile[];
  /** The glowing slot. A tile dropped inside it (or near it) counts as an attempt. */
  targetRef: RefObject<HTMLElement>;
  disabled: boolean;
  /** Tile picked up: it says its sound. */
  onPickUp: (tile: TrayTile) => void;
  /** Returns true if the tile fitted the slot. */
  onDrop: (tile: TrayTile) => boolean;
  /** A wrong tile bounced back. */
  onBounce: (tile: TrayTile) => void;
}

export function TileTray({ wordId, tiles, targetRef, disabled, onPickUp, onDrop, onBounce }: Props) {
  const spots = useMemo(() => spotsFor(wordId, tiles.length), [wordId, tiles.length]);
  const [drag, setDrag] = useState<{ key: string; dx: number; dy: number } | null>(null);
  const [bouncing, setBouncing] = useState<string | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean }>({ x: 0, y: 0, moved: false });

  const attempt = (tile: TrayTile) => {
    if (!onDrop(tile)) {
      setBouncing(tile.key);
      onBounce(tile);
      window.setTimeout(() => setBouncing(null), 450);
    }
  };

  const onPointerDown = (tile: TrayTile) => (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, moved: false };
    setDrag({ key: tile.key, dx: 0, dy: 0 });
    onPickUp(tile);
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) start.current.moved = true;
    setDrag({ ...drag, dx, dy });
  };

  const onPointerUp = (tile: TrayTile) => (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    setDrag(null);
    if (!start.current.moved) return; // A tap: the child only wanted to hear it.
    const slot = targetRef.current?.getBoundingClientRect();
    const pad = 28; // Generous drop zone for small fingers.
    if (
      slot &&
      e.clientX > slot.left - pad &&
      e.clientX < slot.right + pad &&
      e.clientY > slot.top - pad &&
      e.clientY < slot.bottom + pad
    ) {
      attempt(tile);
    }
  };

  return (
    <div className="relative mt-1 h-64 w-full overflow-hidden rounded-xl bg-surface-container-low/70" role="group" aria-label="Sound tiles">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-surface-container-highest/20" />
      {tiles.map((tile, i) => {
        if (tile.placed) return null;
        const spot = spots[i];
        const dragging = drag?.key === tile.key;
        return (
          <div
            key={tile.key}
            className={`absolute animate-pop-in ${dragging ? 'z-30' : 'z-10'}`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%`, animationDelay: `${i * 90}ms` }}
          >
            <button
              type="button"
              aria-label={`Sound tile ${tile.grapheme}${tile.silent ? ', silent' : ''}. Press Enter to put it in the glowing space.`}
              disabled={disabled}
              onPointerDown={onPointerDown(tile)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp(tile)}
              onPointerCancel={() => setDrag(null)}
              // Keyboard and switch users: Enter or Space tries the tile in the glowing slot.
              onClick={(e) => {
                if (e.detail === 0 && !disabled) {
                  onPickUp(tile);
                  attempt(tile);
                }
              }}
              className={`flex h-20 min-w-20 touch-none select-none items-center justify-center rounded-lg px-3 font-display text-[44px] font-bold leading-none ${
                tile.silent
                  ? 'bg-surface-container-highest/70 text-outline [--clay-edge:#dcdad5]'
                  : 'bg-surface-container-lowest text-primary [--clay-edge:#bdcabe]'
              } ${dragging ? 'cursor-grabbing' : 'clay cursor-grab'} ${bouncing === tile.key ? 'animate-tile-bounce-back' : ''}`}
              style={{
                transform: dragging ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.1) rotate(${spot.r}deg)` : `rotate(${spot.r}deg)`,
                boxShadow: dragging ? '0 18px 25px -5px rgba(0,106,62,0.25), 0 8px 0 #bdcabe' : undefined,
              }}
            >
              {tile.grapheme}
            </button>
          </div>
        );
      })}
    </div>
  );
}
