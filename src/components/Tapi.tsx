type Mood = 'happy' | 'cheer' | 'wave';

/**
 * Tapi the mascot, drawn in SVG so it ships with the app and works offline.
 * Placeholder art based on the Stitch mock-ups; swap in final illustrations later.
 */
export function Tapi({ mood = 'happy', className = 'h-24 w-24' }: { mood?: Mood; className?: string }) {
  const armsUp = mood === 'cheer';
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Tapi">
      <defs>
        <radialGradient id="tapi-body" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#c8f5df" />
          <stop offset="60%" stopColor="#8fdcc0" />
          <stop offset="100%" stopColor="#5fbf9c" />
        </radialGradient>
        <radialGradient id="tapi-belly" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff4e0" />
          <stop offset="100%" stopColor="#f6d9b5" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="112" rx="34" ry="6" fill="rgba(0,106,62,0.15)" />
      {/* ears */}
      <circle cx="30" cy="30" r="13" fill="url(#tapi-body)" />
      <circle cx="90" cy="30" r="13" fill="url(#tapi-body)" />
      <circle cx="30" cy="30" r="7" fill="#f7b9b1" />
      <circle cx="90" cy="30" r="7" fill="#f7b9b1" />
      {/* arms */}
      {armsUp ? (
        <>
          <ellipse cx="18" cy="58" rx="9" ry="15" transform="rotate(-35 18 58)" fill="url(#tapi-body)" />
          <ellipse cx="102" cy="58" rx="9" ry="15" transform="rotate(35 102 58)" fill="url(#tapi-body)" />
        </>
      ) : (
        <>
          <ellipse cx="20" cy="80" rx="9" ry="14" transform="rotate(20 20 80)" fill="url(#tapi-body)" />
          <ellipse
            cx="100"
            cy={mood === 'wave' ? 56 : 80}
            rx="9"
            ry="14"
            transform={mood === 'wave' ? 'rotate(40 100 56)' : 'rotate(-20 100 80)'}
            fill="url(#tapi-body)"
          >
            {mood === 'wave' && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="30 100 66;55 100 66;30 100 66"
                dur="1.2s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
        </>
      )}
      {/* body */}
      <ellipse cx="60" cy="68" rx="40" ry="42" fill="url(#tapi-body)" />
      <ellipse cx="60" cy="84" rx="24" ry="22" fill="url(#tapi-belly)" />
      {/* feet */}
      <ellipse cx="42" cy="106" rx="12" ry="7" fill="#f6d9b5" />
      <ellipse cx="78" cy="106" rx="12" ry="7" fill="#f6d9b5" />
      {/* face */}
      <circle cx="45" cy="56" r="7" fill="#1c1c19" />
      <circle cx="75" cy="56" r="7" fill="#1c1c19" />
      <circle cx="47.5" cy="53.5" r="2.4" fill="#fff" />
      <circle cx="77.5" cy="53.5" r="2.4" fill="#fff" />
      <ellipse cx="36" cy="68" rx="6" ry="4" fill="#f7a8a0" opacity="0.8" />
      <ellipse cx="84" cy="68" rx="6" ry="4" fill="#f7a8a0" opacity="0.8" />
      <path
        d={armsUp ? 'M50 66 Q60 80 70 66 Z' : 'M51 67 Q60 75 69 67'}
        fill={armsUp ? '#7a2e2e' : 'none'}
        stroke="#1c1c19"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* sunlit highlight */}
      <ellipse cx="44" cy="36" rx="12" ry="6" fill="#fff" opacity="0.45" />
    </svg>
  );
}
