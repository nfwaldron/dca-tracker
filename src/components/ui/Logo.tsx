export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        paddingRight: '1.25rem',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="DCA Tracker logo"
      >
        {/* Background tile */}
        <rect width="32" height="32" rx="8" fill="#1971c2" />

        {/* Three rising bars (bottom-anchored at y=27) */}
        <rect x="4"  y="19" width="6" height="8"  rx="1.5" fill="rgba(255,255,255,0.38)" />
        <rect x="13" y="13" width="6" height="14" rx="1.5" fill="rgba(255,255,255,0.55)" />
        <rect x="22" y="7"  width="6" height="20" rx="1.5" fill="rgba(255,255,255,0.72)" />

        {/* Upward trend line through bar top-centres */}
        <polyline
          points="7,17  16,11  25,5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dot at the leading tip of the trend line */}
        <circle cx="25" cy="5" r="2.75" fill="white" />
      </svg>

      <span
        style={{
          fontWeight: 700,
          fontSize: '1.0rem',
          letterSpacing: '-0.025em',
          color: 'var(--mantine-color-text)',
          lineHeight: 1,
        }}
      >
        DCA{' '}
        <span
          style={{
            fontWeight: 400,
            color: 'var(--mantine-color-dimmed)',
          }}
        >
          Tracker
        </span>
      </span>
    </div>
  );
}
