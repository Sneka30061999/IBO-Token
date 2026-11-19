import { useState } from "react";
import {
  Coins, Flame, Droplets, Shield, Gift, Layers,
  Search, ArrowRightLeft, FileText, ExternalLink,
  ChevronDown, HelpCircle,
} from "lucide-react";
import { faqs } from "../data/content";

/* ── Per-card colour + icon ─────────────────────────── */
const CARD_META = [
  { icon: HelpCircle,     color: "#2EE5A8", label: "General"      },
  { icon: Coins,          color: "#2EE5A8", label: "Supply"       },
  { icon: Layers,         color: "#34d399", label: "Network"      },
  { icon: Gift,           color: "#f59e0b", label: "Purpose"      },
  { icon: Shield,         color: "#2EE5A8", label: "Ecosystem"    },
  { icon: FileText,       color: "#60a5fa", label: "Tokenomics"   },
  { icon: Flame,          color: "#f97316", label: "Annual Burn"  },
  { icon: ArrowRightLeft, color: "#2dd4bf", label: "Tx Burn"      },
  { icon: Search,         color: "#2EE5A8", label: "Verify"       },
  { icon: ExternalLink,   color: "#2EE5A8", label: "Transactions" },
  { icon: Droplets,       color: "#34d399", label: "DEX"          },
  { icon: FileText,       color: "#f59e0b", label: "Contract"     },
];

/* ── Position each card on the orbit ───────────────────
   We use a fixed 900×540 viewBox so positions are stable
   regardless of container width. The SVG + cards are all
   placed in that coordinate space; CSS scales the whole
   thing via aspect-ratio + width:100%.                   */
const VW = 900, VH = 540; // viewBox dimensions
const CX = VW / 2, CY = VH / 2; // centre of orbit
const RX = 340, RY = 210;        // orbit ellipse radii

function orbitXY(i: number, total: number) {
  const angle = ((i / total) * 360 - 90) * (Math.PI / 180);
  return {
    cx: CX + RX * Math.cos(angle), // card centre X in viewBox coords
    cy: CY + RY * Math.sin(angle), // card centre Y
  };
}

/* Card dimensions in viewBox units */
const CW = 148, CH = 110;

/* ═══════════════════════════════════════════════════════
   FAQAccordion
   ═══════════════════════════════════════════════════════ */
export default function FAQAccordion() {
  const [active, setActive] = useState<number | null>(null);
  const toggle = (i: number) => setActive(a => a === i ? null : i);
  const total = faqs.length;

  return (
    <>
      {/* ══ DESKTOP: SVG-based orbit ══ */}
      <div className="faq-stage">

        {/* ── SVG layer: connector lines + orb rings ── */}
        <svg
          className="faq-stage-svg"
          viewBox={`0 0 ${VW} ${VH}`}
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connector lines from centre to each card */}
          {faqs.map((_, i) => {
            const { cx, cy } = orbitXY(i, total);
            const meta = CARD_META[i % CARD_META.length];
            const isActive = active === i;
            // End point: edge of orb (radius ≈ 52)
            const dx = cx - CX, dy = cy - CY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist, ny = dy / dist;
            return (
              <line
                key={i}
                x1={CX + nx * 52} y1={CY + ny * 52}
                x2={cx - nx * (CW / 2 + 4)} y2={cy - ny * (CH / 2 + 4)}
                stroke={isActive ? meta.color : `${meta.color}35`}
                strokeWidth={isActive ? 1.6 : 0.9}
                strokeDasharray={isActive ? "none" : "5 5"}
                style={{ transition: "stroke .3s, stroke-width .3s" }}
              />
            );
          })}

          {/* Pulsing orb rings */}
          {[70, 90, 112].map((r, ri) => (
            <circle
              key={r}
              cx={CX} cy={CY} r={r}
              fill="none"
              stroke="rgba(46,229,168,0.35)"
              strokeWidth="1"
              style={{
                animation: `faqOrbPulse 3s ease-in-out ${ri * 0.4}s infinite`,
                transformOrigin: `${CX}px ${CY}px`,
              }}
            />
          ))}
        </svg>

        {/* ── Centre orb (HTML, overlaid via absolute) ── */}
        <div
          className="faq-orb"
          style={{ left: `${(CX / VW) * 100}%`, top: `${(CY / VH) * 100}%` }}
        >
          <div className="faq-orb-body">
            <span className="faq-orb-mark">?</span>
            <span className="faq-orb-label">FAQ</span>
            <span className="faq-orb-count">{total} Qs</span>
          </div>
        </div>

        {/* ── Orbit cards (HTML, positioned via %) ── */}
        {faqs.map((f, i) => {
          const { cx, cy } = orbitXY(i, total);
          const meta = CARD_META[i % CARD_META.length];
          const Icon = meta.icon;
          const isActive = active === i;

          return (
            <div
              key={f.q}
              className={`faq-orbit-card${isActive ? " faq-orbit-card--active" : ""}`}
              style={{
                left:  `${(cx / VW) * 100}%`,
                top:   `${(cy / VH) * 100}%`,
                width: `${(CW / VW) * 100}%`,
                /* Active card colour theming via inline */
                "--fc": meta.color,
                "--fg": `${meta.color}22`,
                animationDelay: `${i * 55}ms`,
              } as React.CSSProperties}
              onClick={() => toggle(i)}
            >
              {/* Hover rotation wrapper */}
              <div className="faq-card-inner">

                {/* Top row */}
                <div className="faq-card-top">
                  <span className="faq-card-icon" style={{ background: `${meta.color}20`, color: meta.color }}>
                    <Icon size={12} />
                  </span>
                  <span className="faq-card-lbl" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="faq-card-num">Q{i + 1}</span>
                </div>

                {/* Question */}
                <p className="faq-card-q">{f.q}</p>

                {/* Preview bars */}
                <div className="faq-card-bars">
                  <div className="faq-bar" style={{ background: meta.color, width: "80%", opacity: 0.55 }} />
                  <div className="faq-bar" style={{ background: meta.color, width: "55%", opacity: 0.3 }} />
                </div>

                {/* Active glow border */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="faq-card-glow-border"
                    style={{ borderColor: meta.color, boxShadow: `0 0 20px ${meta.color}60` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Answer panel ── */}
      {active !== null && (
        <div key={active} className="faq-answer-panel animate-fadeUp">
          {(() => {
            const meta = CARD_META[active % CARD_META.length];
            const Icon = meta.icon;
            return (
              <div
                className="faq-answer-inner"
                style={{
                  borderColor: `${meta.color}50`,
                  boxShadow: `0 0 0 1px ${meta.color}25, 0 20px 60px -16px rgba(0,0,0,0.6)`,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="faq-answer-icon" style={{ background: `${meta.color}20`, color: meta.color }}>
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="faq-answer-q">
                      <span className="faq-answer-num">Q{active + 1}</span>
                      {faqs[active].q}
                    </p>
                    <p className="faq-answer-a">{faqs[active].a}</p>
                  </div>
                </div>
                <button onClick={() => setActive(null)} className="faq-answer-close" aria-label="Close">✕</button>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══ MOBILE: accordion ══ */}
      <div className="faq-mobile-list">
        {faqs.map((f, i) => {
          const meta = CARD_META[i % CARD_META.length];
          const Icon = meta.icon;
          const isOpen = active === i;
          return (
            <div
              key={f.q}
              className="faq-mob-item"
              style={{ borderColor: isOpen ? `${meta.color}50` : "rgba(255,255,255,0.08)" }}
            >
              <button className="faq-mob-trigger" aria-expanded={isOpen} onClick={() => toggle(i)}>
                <span className="faq-mob-icon" style={{ background: `${meta.color}18`, color: meta.color }}>
                  <Icon size={15} />
                </span>
                <span className="faq-mob-q">{f.q}</span>
                <ChevronDown
                  size={16}
                  className="shrink-0 transition-transform duration-300"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", color: isOpen ? meta.color : "#475569" }}
                />
              </button>
              <div className="faq-mob-body" style={{ maxHeight: isOpen ? "400px" : "0px" }}>
                <p className="faq-mob-answer">{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
