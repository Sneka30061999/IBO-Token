/**
 * FanDeckCards.tsx — 3D Rotating Ring Carousel
 * ─────────────────────────────────────────────
 * Cards arranged on a circular ring in 3D perspective.
 * The active card faces the viewer (centre, large, full content).
 * Adjacent cards are tilted left/right with perspective depth.
 * Auto-rotates, click arrows or drag/swipe to spin.
 * Mobile responsive.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Coins, Flame, ArrowRightLeft, Droplets, ChevronLeft, ChevronRight } from "lucide-react";
import { fmt } from "../config/token";
import {
  TOTAL_SUPPLY,
  ANNUAL_BURN_ALLOCATION,
  TX_BURN_ALLOCATION,
  DEX_ALLOCATION,
} from "../data/content";

/* ── card data ─────────────────────────────────────────── */
const CARDS = [
  {
    label:  "Total Supply",
    value:  fmt(TOTAL_SUPPLY),
    pct:    "100.00",
    suffix: "IBO",
    hint:   "Planned supply",
    Icon:   Coins,
    grad:   "linear-gradient(145deg, #021a10 0%, #020504 100%)",
    accent: "#2EE5A8",
    glow:   "rgba(46,229,168,0.35)",
  },
  {
    label:  "Annual Burn Allocation",
    value:  fmt(ANNUAL_BURN_ALLOCATION),
    pct:    ((ANNUAL_BURN_ALLOCATION / TOTAL_SUPPLY) * 100).toFixed(2),
    suffix: "IBO",
    hint:   "Allocated, not yet burned",
    Icon:   Flame,
    grad:   "linear-gradient(145deg, #021a10 0%, #020504 100%)",
    accent: "#2EE5A8",
    glow:   "rgba(46,229,168,0.35)",
  },
  {
    label:  "Transaction Burn",
    value:  fmt(TX_BURN_ALLOCATION),
    pct:    ((TX_BURN_ALLOCATION / TOTAL_SUPPLY) * 100).toFixed(2),
    suffix: "IBO",
    hint:   "Allocated, not yet burned",
    Icon:   ArrowRightLeft,
    grad:   "linear-gradient(145deg, #021a10 0%, #020504 100%)",
    accent: "#2EE5A8",
    glow:   "rgba(46,229,168,0.35)",
  },
  {
    label:  "Future DEX Allocation",
    value:  fmt(DEX_ALLOCATION),
    pct:    ((DEX_ALLOCATION / TOTAL_SUPPLY) * 100).toFixed(2),
    suffix: "IBO",
    hint:   "Reserved for future launch",
    Icon:   Droplets,
    grad:   "linear-gradient(145deg, #001f1a 0%, #001310 100%)",
    accent: "#2EE5A8",
    glow:   "rgba(46,229,168,0.35)",
  },
] as const;

type CardData = typeof CARDS[number];

const N = CARDS.length;

/* ── geometry ───────────────────────────────────────────── */
// How far back the ring sits (Z-depth of side cards relative to front)
const RING_DEPTH = 220;   // px — tune this for more/less 3D depth

function getCardStyle(
  idx: number,
  active: number,
  total: number,
): React.CSSProperties {
  /* Position in ring: 0 = front, ±1 = adjacent, ±2 = far sides */
  let pos = idx - active;
  /* wrap around */
  if (pos > total / 2)  pos -= total;
  if (pos < -total / 2) pos += total;

  const absPos   = Math.abs(pos);
  const sign     = Math.sign(pos);

  /* Only show at most 1 card on each side for 4 cards */
  const visible  = absPos <= 1;

  /* Horizontal spread */
  const spreadX  = sign * Math.min(absPos, 1) * 270;

  /* Z-depth: front = 0, sides = -RING_DEPTH */
  const translateZ = absPos === 0 ? 0 : -RING_DEPTH;

  /* Rotate Y: front = 0, left side = +40°, right side = -40° */
  const rotateY   = sign * absPos * -42;

  /* Scale: front = 1, sides = 0.72 */
  const scale     = absPos === 0 ? 1 : 0.72;

  /* Opacity: front = 1, sides = 0.72, hidden = 0 */
  const opacity   = !visible ? 0 : absPos === 0 ? 1 : 0.72;

  /* z-index: front on top */
  const zIndex    = absPos === 0 ? 20 : 10 - absPos;

  return {
    transform:  `translateX(${spreadX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
    opacity,
    zIndex,
    pointerEvents: !visible ? "none" : "auto",
  };
}

/* ── single card ────────────────────────────────────────── */
function 

RingCard({
  card,
  style,
  isActive,
  onClick,
}: {
  card: CardData;
  style: React.CSSProperties;
  isActive: boolean;
  onClick: () => void;
}) {
  const { Icon } = card;

  return (
    <div
      className="rc-card"
      style={{
        background:  card.grad,
        "--accent":  card.accent,
        "--glow":    card.glow,
        ...style,
      } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Top glow line */}
      <div className="rc-card-topline" style={{ background: card.accent }} />

      {/* Glow orb */}
      <div
        className="rc-card-orb"
        style={{ background: `radial-gradient(circle, ${card.glow} 0%, transparent 70%)` }}
      />

      {/* Icon */}
      <div
        className="rc-card-icon-wrap"
        style={{
          background:  `${card.accent}18`,
          border:      `1px solid ${card.accent}40`,
          boxShadow:   `0 0 20px ${card.glow}`,
        }}
      >
        <Icon size={22} style={{ color: card.accent }} />
      </div>

      {/* Percent */}
      <p className="rc-card-pct" style={{ color: card.accent }}>
        {card.pct}%
      </p>

      {/* Label */}
      <h3 className="rc-card-label">{card.label}</h3>

      {/* Value */}
      <p className="rc-card-value">
        {card.value}
        <span className="rc-card-suffix"> {card.suffix}</span>
      </p>

      {/* Hint */}
      <p className="rc-card-hint" style={{ color: `${card.accent}99` }}>
        {card.hint}
      </p>

      {/* Active indicator dot */}
      {isActive && (
        <div className="rc-card-active-dot" style={{ background: card.accent }} />
      )}
    </div>
  );
}

/* ── main component ─────────────────────────────────────── */
export default function FanDeckCards() {
  const [active, setActive]   = useState(0);
  const [paused, setPaused]   = useState(false);
  const autoRef               = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX            = useRef<number | null>(null);
  const containerRef          = useRef<HTMLDivElement>(null);

  /* auto-rotate every 3.5 s */
  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => {
      setActive(a => (a + 1) % N);
    }, 3500);
  }, []);

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [startAuto]);

  const pause = () => {
    setPaused(true);
    if (autoRef.current) clearInterval(autoRef.current);
  };
  const resume = () => {
    setPaused(false);
    startAuto();
  };

  const prev = () => setActive(a => (a - 1 + N) % N);
  const next = () => setActive(a => (a + 1) % N);

  /* drag / swipe */
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    pause();
    dragStartX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
  };
  const onDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const endX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const dx   = endX - dragStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    dragStartX.current = null;
    resume();
  };

  return (
    <div
      className="rc-outer"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onMouseDown={onDragStart}
      onMouseUp={onDragEnd}
      onTouchStart={onDragStart}
      onTouchEnd={onDragEnd}
    >
      {/* 3D scene */}
      <div className="rc-scene" ref={containerRef}>
        {CARDS.map((card, i) => (
          <RingCard
            key={card.label}
            card={card}
            isActive={i === active}
            style={getCardStyle(i, active, N)}
            onClick={() => { setActive(i); pause(); }}
          />
        ))}
      </div>

      {/* Nav arrows */}
      <button className="rc-arrow rc-arrow-left"  onClick={prev} aria-label="Previous">
        <ChevronLeft  size={22} />
      </button>
      <button className="rc-arrow rc-arrow-right" onClick={next} aria-label="Next">
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      <div className="rc-dots">
        {CARDS.map((c, i) => (
          <button
            key={i}
            className={`rc-dot ${i === active ? "rc-dot--active" : ""}`}
            style={i === active ? { background: CARDS[active].accent } : {}}
            onClick={() => { setActive(i); pause(); }}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
