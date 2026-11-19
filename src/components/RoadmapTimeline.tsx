import { useEffect, useRef } from "react";
import { CheckCircle2, Loader, Circle } from "lucide-react";
import { roadmap, roadmapStatus } from "../data/content";

/* ─── Status config ─────────────────────────────────── */
const STATUS = {
  done: {
    label: "Completed",
    Icon: CheckCircle2,
    badge: "rm-badge-done",
    dot: "#2EE5A8",
    dotGlow: "rgba(46,229,168,0.6)",
    border: "rgba(46,229,168,0.35)",
    glow: "rgba(46,229,168,0.08)",
  },
  active: {
    label: "In Progress",
    Icon: Loader,
    badge: "rm-badge-active",
    dot: "#2EE5A8",
    dotGlow: "rgba(46,229,168,0.6)",
    border: "rgba(46,229,168,0.35)",
    glow: "rgba(46,229,168,0.07)",
  },
  upcoming: {
    label: "Upcoming",
    Icon: Circle,
    badge: "rm-badge-upcoming",
    dot: "#334155",
    dotGlow: "rgba(51,65,85,0.3)",
    border: "rgba(255,255,255,0.1)",
    glow: "transparent",
  },
} as const;

/* ─── Scroll-reveal hook ─────────────────────────────── */
function useReveal(ref: React.RefObject<HTMLElement>, cls = "rm-visible") {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add(cls); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, cls]);
}

/* ─── Single phase card ──────────────────────────────── */
function PhaseCard({
  phase, index,
}: {
  phase: typeof roadmap[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref as React.RefObject<HTMLElement>);

  const isLeft  = index % 2 === 0; // even → left column
  const st      = STATUS[roadmapStatus[phase.phase] ?? "upcoming"];
  const { Icon } = st;

  return (
    /* Row wrapper — positions card + centre dot + empty side */
    <div className={`rm-row ${isLeft ? "rm-row-left" : "rm-row-right"}`}>

      {/* ── Card ── */}
      <div
        ref={ref}
        className={`rm-card ${isLeft ? "rm-card-from-left" : "rm-card-from-right"}`}
        style={{
          borderColor: st.border,
          background: `linear-gradient(145deg, rgba(10,30,50,0.97) 0%, rgba(5,10,20,0.99) 100%)`,
          boxShadow: `0 0 0 1px ${st.border}, 0 20px 60px -16px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Top bar: phase badge + status badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="rm-phase-badge" style={{ color: st.dot, borderColor: `${st.dot}40`, background: `${st.dot}10` }}>
            <span className="rm-phase-dot" style={{ background: st.dot, boxShadow: `0 0 6px ${st.dot}` }} />
            {phase.phase}
          </span>
          <span className={`rm-status-badge ${st.badge}`}>
            <Icon size={11} className={roadmapStatus[phase.phase] === "active" ? "animate-spin" : ""} />
            {st.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="rm-title">{phase.title}</h3>

        {/* Items */}
        <ul className="rm-items">
          {phase.items.map((item) => (
            <li key={item} className="rm-item">
              <span className="rm-item-dot" style={{ background: st.dot }} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Centre connector dot ── */}
      <div className="rm-connector">
        <div
          className="rm-dot"
          style={{
            background: st.dot,
            boxShadow: `0 0 0 4px ${st.dotGlow.replace("0.6", "0.15")}, 0 0 16px ${st.dotGlow}`,
          }}
        />
      </div>

      {/* ── Empty opposite side (keeps layout symmetric) ── */}
      <div className="rm-empty" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RoadmapTimeline
   ═══════════════════════════════════════════════════════ */
export default function RoadmapTimeline() {
  return (
    <div className="rm-root">
      {/* Centre vertical line */}
      <div className="rm-line" aria-hidden="true" />

      {/* Phase rows */}
      {roadmap.map((phase, i) => (
        <PhaseCard key={phase.phase} phase={phase} index={i} />
      ))}
    </div>
  );
}
