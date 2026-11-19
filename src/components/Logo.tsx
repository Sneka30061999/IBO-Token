/**
 * IBO Token — Logo system
 *
 * LogoMark  — icon only (used in Navbar, Footer, Favicon, Tokenomics, Loading)
 * Logo      — icon + wordmark (default, used in Navbar & Footer)
 * LogoFull  — stacked variant (large display contexts)
 */

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  const uid = `ibog${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2EE5A8" />
          <stop offset="100%" stopColor="#1aad7e" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" fill="#020504" stroke={`url(#${uid})`} strokeWidth="2.2" />
      {/* Gold accent ring */}
      <circle cx="24" cy="24" r="15.5" fill="none" stroke="#f5c451" strokeWidth="0.9" opacity="0.55" />
      {/* IBO lettering */}
      <text
        x="24" y="28.5"
        textAnchor="middle"
        fontFamily="'Space Grotesk','Inter',system-ui,sans-serif"
        fontWeight="800"
        fontSize="12.5"
        letterSpacing="-0.3"
        fill={`url(#${uid})`}
      >
        IBO
      </text>
    </svg>
  );
}

/** Horizontal logo — icon + wordmark */
export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <LogoMark size={34} />
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-bold tracking-tight text-white">
          IBO Token
        </span>
        <span className="block text-[9.5px] font-medium uppercase tracking-[0.17em] text-[#2EE5A8]/60">
          ABT Working
        </span>
      </span>
    </span>
  );
}

/** Stacked logo — used in tokenomics, page headers, loading screens */
export function LogoFull({ size = 52 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <LogoMark size={size} />
      <span className="font-display text-sm font-bold text-white tracking-tight">IBO Token</span>
    </div>
  );
}
