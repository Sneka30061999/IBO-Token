import { useState, useRef, useEffect } from "react";
import { allocations, pct } from "../data/content";
import { fmt } from "../config/token";
import AnimatedCard from "./AnimatedCard";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/** Derive a soft Tailwind-style rgba from the hex colour stored in content.ts */
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface CardState {
  active: number | null;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function AllocationCards() {
  const [active, setActive] = useState<number | null>(0); // first card open by default
  const isTouch = useRef(false);

  useEffect(() => {
    isTouch.current = window.matchMedia("(hover: none)").matches;
  }, []);

  const toggle = (i: number) => setActive((prev) => (prev === i ? null : i));

  /* ── Desktop: horizontal accordion ── */
  return (
    <>
      {/* ══ DESKTOP horizontal accordion (hidden on mobile) ══ */}
      <div
        className="hidden md:flex gap-2 lg:gap-3 h-[280px] xl:h-[310px] w-full"
        role="list"
      >
        {allocations.map((a, i) => {
          const isOpen = active === i;
          const glow = hexToRgba(a.color, 0.25);

          return (
            <button
              key={a.name}
              role="listitem"
              onMouseEnter={() => !isTouch.current && setActive(i)}
              onClick={() => isTouch.current && toggle(i)}
              aria-expanded={isOpen}
              aria-label={`${a.name} allocation`}
              className={[
                "relative flex flex-col justify-end overflow-hidden rounded-2xl border",
                "outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                "transition-all duration-500 ease-[cubic-bezier(0.34,1.1,0.64,1)]",
                "cursor-pointer group/card select-none",
                isOpen
                  ? "flex-[4] border-white/20"
                  : "flex-[0.6] border-white/8 hover:flex-[0.9] hover:border-white/15",
              ].join(" ")}
              style={{
                background: isOpen
                  ? `linear-gradient(160deg, ${hexToRgba(a.color, 0.22)} 0%, rgba(10,42,51,0.98) 55%)`
                  : `linear-gradient(180deg, ${hexToRgba(a.color, 0.14)} 0%, rgba(10,42,51,0.97) 100%)`,
                boxShadow: isOpen
                  ? `0 0 0 1px ${hexToRgba(a.color, 0.4)}, 0 24px 60px -12px ${hexToRgba(a.color, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.08)`
                  : "0 4px 20px -6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {/* Top colour bar */}
              <div
                className="absolute left-0 top-0 h-1 w-full rounded-t-2xl transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${a.color}, transparent)`, opacity: isOpen ? 1 : 0.5 }}
              />

              {/* Background glow orb */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500"
                style={{ background: glow, opacity: isOpen ? 1 : 0.3 }}
              />

              {/* Shimmer sweep on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-full top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700 group-hover/card:left-full"
              />

              {/* ── COLLAPSED state: rotated label ── */}
              <div
                className={[
                  "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                  isOpen ? "opacity-0 pointer-events-none" : "opacity-100",
                ].join(" ")}
              >
                <span
                  className="origin-center -rotate-90 whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: a.color }}
                >
                  {a.name}
                </span>
              </div>

              {/* ── EXPANDED state: full content ── */}
              <div
                className={[
                  "flex flex-col gap-3 p-6 transition-all duration-500",
                  isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
                ].join(" ")}
              >
                {/* Colour dot + name */}
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ background: a.color, boxShadow: `0 0 0 2px ${hexToRgba(a.color, 0.4)}` }}
                  />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: a.color }}>
                    {a.name}
                  </span>
                </div>

                {/* Big number */}
                <p className="font-display text-3xl font-black leading-none text-white lg:text-4xl">
                  {fmt(a.tokens)}
                </p>

                {/* Percentage badge */}
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: hexToRgba(a.color, 0.18), color: a.color }}
                >
                  IBO · {pct(a.tokens)}%
                </span>

                {/* Progress bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: isOpen ? `${pct(a.tokens)}%` : "0%",
                      background: `linear-gradient(90deg, ${a.color}, ${hexToRgba(a.color, 0.6)})`,
                      transitionDelay: isOpen ? "200ms" : "0ms",
                    }}
                  />
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed text-slate-300">{a.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ══ MOBILE: stacked animated cards ══ */}
      <div className="flex flex-col gap-4 md:hidden">
        {allocations.map((a, i) => {
          const isOpen = active === i;
          const glow = hexToRgba(a.color, 0.22);

          return (
            <AnimatedCard
              key={a.name}
              delay={i * 60}
              glowColor={glow}
              gradient={`from-[${hexToRgba(a.color, 0.15)}] via-transparent to-transparent`}
              className="!p-0 overflow-hidden"
            >
              {/* Tap header */}
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 p-4 text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  {/* Colour indicator */}
                  <span
                    className="h-10 w-1.5 shrink-0 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${a.color}, ${hexToRgba(a.color, 0.3)})` }}
                  />
                  <div>
                    <p className="font-display text-xl font-black leading-none text-white">{fmt(a.tokens)}</p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: a.color }}>
                      {a.name}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ background: hexToRgba(a.color, 0.18), color: a.color }}
                  >
                    {pct(a.tokens)}%
                  </span>
                  {/* Chevron */}
                  <svg
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Animated expand body */}
              <div
                className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.1,0.64,1)]"
                style={{ maxHeight: isOpen ? "400px" : "0px" }}
              >
                <div className="px-4 pb-5 pt-1">
                  {/* Progress bar */}
                  <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: isOpen ? `${pct(a.tokens)}%` : "0%",
                        background: `linear-gradient(90deg, ${a.color}, ${hexToRgba(a.color, 0.5)})`,
                        transitionDelay: "150ms",
                      }}
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{a.description}</p>
                </div>
              </div>

              {/* Top border line */}
              <div
                className="absolute left-0 top-0 h-0.5 w-full rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${a.color}, transparent)` }}
              />
            </AnimatedCard>
          );
        })}
      </div>
    </>
  );
}
