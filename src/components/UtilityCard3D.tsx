import { useState, useRef, useEffect, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface UtilityCard3DProps {
  icon: ReactNode;
  title: string;
  text: string;
  accentColor: string;       // e.g. "#2EE5A8"
  accentRgba: string;        // e.g. "rgba(46,229,168,0.22)"
  iconBg: string;            // tailwind classes for icon bg gradient
  delay?: number;
}

/**
 * True CSS 3-D flip card:
 *   • Desktop  → flips on hover (pure CSS, zero JS)
 *   • Mobile   → flips on tap  (toggle via React state)
 *
 * Front: icon  + accent line + title
 * Back : description + accent glow + "arrow" call-to-action hint
 *
 * The card uses `transform-style: preserve-3d` and two absolutely-positioned
 * faces so the perspective effect looks physically correct.
 */
export default function UtilityCard3D({
  icon,
  title,
  text,
  accentColor,
  accentRgba,
  iconBg,
  delay = 0,
}: UtilityCard3DProps) {
  const [revealed, setRevealed] = useState(false);
  const [flipped, setFlipped] = useState(false);           // mobile tap state
  const isTouch = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  /* ── Scroll-reveal ── */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Touch detection ── */
  useEffect(() => {
    isTouch.current = window.matchMedia("(hover: none)").matches;
  }, []);

  const handleTap = () => {
    if (isTouch.current) setFlipped((f) => !f);
  };

  return (
    <div
      ref={ref}
      className={[
        "utility-card-3d-wrapper",
        revealed ? "animate-cardReveal" : "opacity-0",
      ].join(" ")}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
      /* Desktop: CSS :hover flips via the .flipped class on the inner element */
      onClickCapture={handleTap}
      aria-label={title}
    >
      {/* ── The 3-D scene ── */}
      <div
        className={[
          "utility-card-3d-inner",
          flipped ? "is-flipped" : "",
        ].join(" ")}
      >
        {/* ════ FRONT FACE ════ */}
        <div
          className="utility-card-face utility-card-front"
          style={{ "--accent": accentColor, "--accent-rgba": accentRgba } as React.CSSProperties}
        >
          {/* Top accent line */}
          <div
            className="absolute left-0 top-0 h-[3px] w-full rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, ${accentColor} 0%, transparent 80%)` }}
          />

          {/* Corner glow */}
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl"
            style={{ background: accentRgba }}
          />

          {/* Icon box */}
          <div className={`relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${iconBg}`}>
            {icon}
          </div>

          {/* Title */}
          <h3
            className="relative z-10 mt-5 font-display text-lg font-bold leading-snug"
            style={{ color: accentColor }}
          >
            {title}
          </h3>

          {/* Teaser line */}
          <p className="relative z-10 mt-2 line-clamp-2 text-sm text-slate-400">{text}</p>

          {/* Flip hint */}
          <div className="relative z-10 mt-5 flex items-center gap-1.5 text-xs font-semibold opacity-50">
            <span style={{ color: accentColor }}>Hover to explore</span>
            <ArrowRight size={11} style={{ color: accentColor }} />
          </div>

          {/* Shine sweep */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-full top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover/front:left-full"
          />
        </div>

        {/* ════ BACK FACE ════ */}
        <div
          className="utility-card-face utility-card-back"
          style={{ "--accent": accentColor, "--accent-rgba": accentRgba } as React.CSSProperties}
        >
          {/* Full-bleed glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${accentRgba}, transparent 65%)`,
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute left-0 top-0 h-[3px] w-full rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, ${accentColor} 0%, transparent 80%)` }}
          />

          {/* Back content */}
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              {/* Coloured category label */}
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
                style={{ background: `${accentColor}22`, color: accentColor }}
              >
                {title}
              </span>

              {/* Full description */}
              <p className="mt-4 text-sm leading-relaxed text-slate-200">{text}</p>
            </div>

            {/* Bottom decorative line */}
            <div
              className="mt-6 h-px w-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${accentColor}60, transparent)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
