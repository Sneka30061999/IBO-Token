/**
 * AboutCoinReveal.tsx
 * ─────────────────────────────────────────────────────────────
 * Scroll-driven coin-reveal "About IBO" section.
 *
 * Converted faithfully from the reference HTML into React + TypeScript.
 *
 * How it works:
 *  • A tall scroll track (300vh) pins the stage inside a sticky container.
 *  • As the user scrolls, the orange IBO coin splits open (left/right halves
 *    fly apart) revealing a glowing dark interior with the about text.
 *  • 22 small crypto coins explode outward from the centre and float
 *    with gentle parallax on mouse move.
 *  • No external libraries — pure requestAnimationFrame + CSS.
 *  • Mobile responsive: coin and text scale to viewport width.
 *  • prefers-reduced-motion: coin opens instantly, no floating.
 */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* ── coin data ─────────────────────────────────────────── */
interface CoinSpec {
  symbol: string;
  hi: string;      // highlight colour
  mid: string;     // mid colour
  dark: string;    // shadow colour
}

const COIN_TYPES: CoinSpec[] = [
  { symbol: "IBO", hi: "#fff2a8", mid: "#f7931a", dark: "#6b3a00" },
  { symbol: "IBO", hi: "#fff2a8", mid: "#f7931a", dark: "#6b3a00" },
  { symbol: "Ξ",   hi: "#e0e7ff", mid: "#7c8cf8", dark: "#262a70" },
  { symbol: "◎",   hi: "#6ee7b7", mid: "#9945ff", dark: "#2d0a5e" },
  { symbol: "₮",   hi: "#99f6e4", mid: "#26a17b", dark: "#0b4d3a" },
];

/* ── deterministic LCG ─────────────────────────────────── */
function mkRnd(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── easing ────────────────────────────────────────────── */
const cl  = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eo  = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const io  = (x: number) => { x = cl(x); return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2; };
const sm  = (a: number, b: number, x: number) => { x = cl((x-a)/(b-a)); return x*x*(3-2*x); };

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */
export default function AboutCoinReveal() {
  /* Refs for every DOM element the animation touches */
  const trackRef  = useRef<HTMLElement>(null);
  const stageRef  = useRef<HTMLDivElement>(null);
  const hlRef     = useRef<HTMLDivElement>(null);  // left half
  const hrRef     = useRef<HTMLDivElement>(null);  // right half
  const coreRef   = useRef<HTMLDivElement>(null);  // interior
  const ctRef     = useRef<HTMLParagraphElement>(null); // text inside core
  const glowRef   = useRef<HTMLDivElement>(null);
  const hintRef   = useRef<HTMLDivElement>(null);
  const csRef     = useRef<HTMLDivElement>(null);  // coin container
  const mouthRef  = useRef<HTMLDivElement>(null);  // origin point for coins

  useEffect(() => {
    const track  = trackRef.current;
    const stage  = stageRef.current;
    const hl     = hlRef.current;
    const hr     = hrRef.current;
    const core   = coreRef.current;
    const ct     = ctRef.current;
    const glow   = glowRef.current;
    const hint   = hintRef.current;
    const cs     = csRef.current;
    const mouth  = mouthRef.current;
    if (!track || !stage || !hl || !hr || !core || !ct || !glow || !hint || !cs || !mouth) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── build coins ── */
    const R = mkRnd(53);
    interface Coin {
      el: HTMLDivElement;
      r:  [number, number];
      start: number; span: number;
      rx0: number; ry0: number;
      sx: number;  sy: number;
      vr: number;  vy: number;
      ph: number;  fa: number; fs: number;
      big: number;
      /* computed in layout */
      size: number; tx: number; ty: number; z: number;
    }
    const coins: Coin[] = [];
    for (let i = 0; i < 22; i++) {
      const t  = COIN_TYPES[Math.floor(R() * COIN_TYPES.length)];
      const el = document.createElement("div");
      el.className = "acr-coin";
      el.textContent = t.symbol;
      el.style.setProperty("--h", t.hi);
      el.style.setProperty("--m", t.mid);
      el.style.setProperty("--d", t.dark);
      cs.appendChild(el);
      const big = R();
      coins.push({
        el, r: [R(), R()],
        start: 0.2 + R() * 0.4,
        span:  0.3 + R() * 0.2,
        rx0: R() * 360, ry0: R() * 360,
        sx: (R() * 2 - 1) * 420,
        sy: (R() * 2 - 1) * 540,
        vr: (R() * 2 - 1) * 28,
        vy: (R() * 2 - 1) * 34,
        ph: R() * 6.28,
        fa: 6 + R() * 12,
        fs: 0.5 + R() * 0.8,
        big,
        size: 0, tx: 0, ty: 0, z: 0,
      });
    }

    /* ── layout ── */
    let ox = 0, oy = 0;
    function layout() {
      const sr = stage!.getBoundingClientRect();
      const mr = mouth!.getBoundingClientRect();
      const W  = sr.width, H = sr.height;
      ox = mr.left - sr.left;
      oy = mr.top  - sr.top;
      const base = Math.min(W, 1100);
      coins.forEach(c => {
        const s = Math.max(24, base * (0.032 + Math.pow(c.big, 1.6) * 0.06));
        c.size = s;
        c.el.style.width  = s + "px";
        c.el.style.height = s + "px";
        c.el.style.fontSize = s * 0.42 + "px";
        c.z = (c.big - 0.5) * 160;
        let tx = ox + (c.r[0] * 2 - 1) * 0.47 * W;
        let ty = oy - (0.12 + c.r[1] * 0.9) * (oy - 20);
        const dx = tx - ox, dy = ty - oy;
        const d  = Math.hypot(dx, dy) || 1;
        const mn = 150 + s / 2 + 16;
        if (d < mn) { tx = ox + dx / d * mn; ty = oy + dy / d * mn; }
        c.tx = cl(tx, s / 2, W - s / 2);
        c.ty = cl(ty, s / 2, H - s / 2);
      });
    }

    /* ── scroll / visibility ── */
    let target = 0, cur = 0, vis = true;
    function read() {
      const r = track!.getBoundingClientRect();
      vis    = r.top < window.innerHeight && r.bottom > 0;
      target = cl(-r.top / (r.height - window.innerHeight));
    }

    /* ── pointer parallax ── */
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const onPointer = (e: PointerEvent) => {
      tmx = e.clientX / window.innerWidth  - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
    };

    /* ── RAF loop ── */
    let last = 0, rafId: number;
    function frame(ts: number) {
      rafId  = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
      cur   += (target - cur) * (1 - Math.pow(0.0009, dt));
      mx    += (tmx - mx) * 0.05;
      my    += (tmy - my) * 0.05;

      if (!vis) return;
      const p     = cur;
      const e     = io(p / 0.3);
      const fade  = 1 - sm(0.16, 0.3, p);
      const f     = reduced ? 0 : 1;
      const TMs   = ts / 1000;

      hl!.style.transform = `perspective(1200px) translateX(${-200 * e}px) rotateY(${-26 * e}deg) rotate(${-10 * e}deg)`;
      hr!.style.transform = `perspective(1200px) translateX(${ 200 * e}px) rotateY(${ 26 * e}deg) rotate(${ 10 * e}deg)`;
      hl!.style.opacity = hr!.style.opacity = String(fade);

      core!.style.transform = `scale(${0.72 + 0.28 * sm(0.04, 0.28, p)})`;
      ct!.style.opacity     = String(sm(0.14, 0.3, p));
      glow!.style.opacity   = String(sm(0.1, 0.4, p) * 0.9);
      hint!.style.opacity   = String(1 - sm(0, 0.05, p));

      coins.forEach(c => {
        const t = (p - c.start) / c.span;
        const q = eo(t);
        const par = c.z / 160;
        const x = ox + (c.tx - ox) * q + Math.sin(TMs * c.fs + c.ph) * c.fa * q * f - mx * 60 * par * q;
        const y = oy + (c.ty - oy) * q + Math.cos(TMs * c.fs * 0.8 + c.ph) * c.fa * q * f - my * 40 * par * q;
        const rx = c.rx0 + c.sx * q + (reduced ? 0 : TMs * c.vr);
        const ry = c.ry0 + c.sy * q + (reduced ? 0 : TMs * c.vy);
        c.el.style.opacity   = String(cl(t * 5));
        c.el.style.transform = `translate3d(${(x - c.size/2).toFixed(1)}px,${(y - c.size/2).toFixed(1)}px,${(c.z*q).toFixed(1)}px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) scale(${(0.35+0.65*q).toFixed(3)})`;
      });
    }

    /* ── init ── */
    layout();
    read();
    cur = target;

    window.addEventListener("scroll",       read,      { passive: true });
    window.addEventListener("resize",       () => { layout(); read(); });
    window.addEventListener("pointermove",  onPointer, { passive: true });

    if (document.fonts?.ready) document.fonts.ready.then(layout);

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll",       read);
      window.removeEventListener("resize",       layout);
      window.removeEventListener("pointermove",  onPointer);
      /* remove dynamically created coin elements */
      coins.forEach(c => c.el.remove());
    };
  }, []);

  return (
    /* scroll track — 250vh so there's room to animate */
    <section ref={trackRef} className="acr-track" aria-label="About IBO">

      {/* sticky stage */}
      <div ref={stageRef} className="acr-stage">

        {/* text header */}
        <div className="acr-txt">
          <p className="eyebrow">About IBO</p>
          <h2 className="acr-heading">
            An independent token,<br />
            powered by ABT Working
          </h2>
        </div>

        {/* background bloom */}
        <div ref={glowRef} className="acr-glow" aria-hidden="true" />

        {/* coin object */}
        <div className="acr-obj" aria-hidden="true">
          {/* origin point from which coins fly */}
          <div ref={mouthRef} className="acr-mouth" />

          {/* dark interior */}
          <div ref={coreRef} className="acr-core">
            <p ref={ctRef} className="acr-core-text">
              IBO is the utility token associated with ABT Working, built to support
              reward distribution, ecosystem participation, and long-term platform
              development with transparent, verifiable token data.
            </p>
          </div>

          {/* left coin half */}
          <div ref={hlRef} className="acr-half acr-half-l">
            <span>IBO</span>
          </div>

          {/* right coin half */}
          <div ref={hrRef} className="acr-half acr-half-r">
            <span>IBO</span>
          </div>
        </div>

        {/* coin particle container */}
        <div
          ref={csRef}
          className="acr-coins"
          aria-hidden="true"
          style={{ perspective: 900 }}
        />

        {/* CTA — visible once coin is open */}
        <div className="acr-cta">
          <Link to="/about" className="btn-primary">
            Explore IBO <ArrowRight size={16} />
          </Link>
        </div>

        {/* hint */}
        <div ref={hintRef} className="acr-hint">↓ Scroll to open</div>
      </div>
    </section>
  );
}
