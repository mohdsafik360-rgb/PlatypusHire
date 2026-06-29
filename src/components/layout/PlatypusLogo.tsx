export function PlatypusLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PlatypusHire logo"
    >
      {/* Platypus monoline outline */}
      <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        {/* Body — egg/oval shape */}
        <path d="M10 22c0-7.2 5.8-13 13-13 4.5 0 8.5 2.4 11 6" />
        <path d="M10 22c2.5 4.8 7.2 8 13 8 4.5 0 8.5-2 11-5.5" />
        {/* Tail — broad flat paddle */}
        <path d="M10 22c-2.5 0-4 2-4 4s1.8 3.5 4 3.5c2 0 3.5-1.5 3.5-3.5" />
        {/* Neck connector */}
        <path d="M34 15l3-1" />
        {/* Duck bill */}
        <path d="M37 14c2-1 4.5-1.5 7-1.5 3.5 0 6 1.5 6 4.5s-2.5 4.5-6 4.5c-2.5 0-5-.5-7-1.5" />
        {/* Bill nostrils */}
        <circle cx="43" cy="17.5" r="0.7" fill="currentColor" stroke="none" />
        {/* Eye */}
        <circle cx="22" cy="14.5" r="1.5" fill="currentColor" stroke="none" />
        {/* Front flipper */}
        <path d="M30 29c-0.5 2 0.5 4 2.5 5" />
        <path d="M33 28c0 2 0.5 3.5 2 5" />
        {/* Back flipper */}
        <path d="M15 30c-1 2-0.5 4.5 1.5 5.5" />
      </g>
      {/* Wordmark */}
      <text
        x="56"
        y="27"
        className="fill-current"
        fontSize="17"
        fontWeight="600"
        fontFamily="var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
        letterSpacing="-0.02em"
      >
        Platypus
      </text>
      <text
        x="128"
        y="27"
        className="fill-emerald-700"
        fontSize="17"
        fontWeight="700"
        fontFamily="var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
        letterSpacing="-0.02em"
      >
        Hire
      </text>
    </svg>
  );
}
