/**
 * CyberGlitchAllocations.tsx — Burn Mechanism Preview
 * ─────────────────────────────────────────────────────
 * Exactly 3 cards:
 *   1. 2,000,000 IBO — Annual Burn (per year)
 *   2. 10 Years       — Burn Programme Duration
 *   3. 3,000,000 IBO — Transaction-based Burn
 *
 * Cyber-glitch hover effect. Mobile responsive.
 */

/* ── keyframes ─────────────────────────────────────────── */
const KEYFRAMES = `
@keyframes cg-snake {
  to { stroke-dashoffset: -400; }
}
@keyframes cg-jitter {
  50% { transform: translateX(1.5px); }
}
@keyframes cg-slice-a {
  0%   { clip-path: inset(0 0 70% 0);   transform: translate(-3px); }
  50%  { clip-path: inset(40% 0 20% 0); transform: translate(3px);  }
  100% { clip-path: inset(80% 0 0 0);   transform: translate(-2px); }
}
@keyframes cg-slice-b {
  0%   { clip-path: inset(60% 0 10% 0); transform: translate(3px);  }
  50%  { clip-path: inset(10% 0 60% 0); transform: translate(-3px); }
  100% { clip-path: inset(30% 0 40% 0); transform: translate(2px);  }
}
@media (prefers-reduced-motion: reduce) {
  .cyber-glitch *,
  .cyber-glitch *::before,
  .cyber-glitch *::after { animation: none !important; }
}
`;

/* ── card data ─────────────────────────────────────────── */
interface BurnCard {
  label:       string;   /* small eyebrow label */
  value:       string;   /* large display value */
  sub:         string;   /* subtitle / description */
  color:       string;
  icon:        string;   /* emoji icon */
}

const BURN_CARDS: BurnCard[] = [
  {
    label: "Annual Burn",
    value: "2,000,000",
    sub:   "IBO scheduled for burning every year",
    color: "#2EE5A8",
    icon:  "🔥",
  },
  {
    label: "Burn Programme",
    value: "10 Years",
    sub:   "Duration of the annual burn programme",
    color: "#2EE5A8",
    icon:  "⏳",
  },
  {
    label: "Transaction Burn",
    value: "3,000,000",
    sub:   "IBO transaction-based burn allocation",
    color: "#2EE5A8",
    icon:  "⚡",
  },
];

/* ── single card ───────────────────────────────────────── */
function BurnGlitchCard({ card, index }: { card: BurnCard; index: number }) {
  const delay = `-${index * 0.5}s`;

  return (
    <div
      className={[
        "group relative flex flex-col justify-between gap-5",
        "overflow-hidden rounded-2xl border border-white/[0.10]",
        "bg-[#07020f] p-7 transition-all duration-300",
        "hover:border-white/20 hover:shadow-[0_0_48px_-10px_var(--cg)]",
        /* equal height across all 3 */
        "min-h-[220px] sm:min-h-[240px]",
      ].join(" ")}
      style={{ "--cg": card.color } as React.CSSProperties}
    >
      {/* ── animated neon border ── */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <rect
          x="1" y="1" rx="16"
          style={{
            width:           "calc(100% - 2px)",
            height:          "calc(100% - 2px)",
            fill:            "none",
            stroke:          card.color,
            strokeWidth:     2,
            strokeDasharray: "80 340",
            filter:          `drop-shadow(0 0 7px ${card.color})`,
            animationDelay:  delay,
          }}
          className="animate-[cg-snake_3.6s_linear_infinite]"
        />
      </svg>

      {/* ── background radial glow ── */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-15 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ background: card.color }}
      />

      {/* ── icon + label ── */}
      <div className="relative flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{
            background: `${card.color}18`,
            border:     `1px solid ${card.color}40`,
            boxShadow:  `0 0 16px -4px ${card.color}60`,
          }}
          aria-hidden="true"
        >
          {card.icon}
        </span>
        <span
          className="text-xs font-bold uppercase tracking-[0.14em]"
          style={{ color: card.color }}
        >
          {card.label}
        </span>
      </div>

      {/* ── glitching value ── */}
      <span
        data-t={card.value}
        className={[
          "relative text-4xl font-black tracking-tight text-white sm:text-5xl",
          "before:absolute before:left-0 before:top-0 before:text-[#2EE5A8] before:opacity-0 before:content-[attr(data-t)]",
          "after:absolute  after:left-0  after:top-0  after:text-[#1aad7e]  after:opacity-0  after:content-[attr(data-t)]",
          "group-hover:animate-[cg-jitter_.35s_steps(2)_infinite]",
          "group-hover:before:opacity-80 group-hover:before:animate-[cg-slice-a_.5s_steps(3)_infinite]",
          "group-hover:after:opacity-80  group-hover:after:animate-[cg-slice-b_.6s_steps(3)_infinite]",
        ].join(" ")}
      >
        {card.value}
      </span>

      {/* ── subtitle ── */}
      <p className="relative text-sm font-medium leading-relaxed text-slate-400">
        {card.sub}
      </p>

      {/* ── bottom accent bar — expands on hover ── */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Export
   ═══════════════════════════════════════════════════════ */
export default function CyberGlitchAllocations() {
  return (
    <section className="cyber-glitch w-full">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* 1 col mobile → 3 col desktop */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BURN_CARDS.map((card, i) => (
          <BurnGlitchCard key={card.label} card={card} index={i} />
        ))}
      </div>
    </section>
  );
}
