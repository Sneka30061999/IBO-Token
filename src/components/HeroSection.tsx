/**
 * HeroSection.tsx
 * Hero section with the Vaultline 3D scene contained only within
 * this section — not covering the rest of the page.
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { bscScan, contractValid } from "../config/token";
import VaultlineScene from "./VaultlineScene";

/* ─── Typewriter ──────────────────────────────────────── */
const WORDS = ["IBO Token", "BEP-20 Asset", "ABT Ecosystem", "Burn Mechanism", "DEX Liquidity"];

function Typewriter() {
  const [idx, setIdx]     = useState(0);
  const [text, setText]   = useState("");
  const [phase, setPhase] = useState<"type" | "wait" | "erase">("type");

  useEffect(() => {
    const word = WORDS[idx];
    let t: ReturnType<typeof setTimeout>;
    if (phase === "type") {
      if (text.length < word.length)
        t = setTimeout(() => setText(word.slice(0, text.length + 1)), 70);
      else
        t = setTimeout(() => setPhase("wait"), 1800);
    } else if (phase === "wait") {
      t = setTimeout(() => setPhase("erase"), 350);
    } else {
      if (text.length > 0)
        t = setTimeout(() => setText(text.slice(0, -1)), 38);
      else { setIdx(i => (i + 1) % WORDS.length); setPhase("type"); }
    }
    return () => clearTimeout(t);
  }, [text, phase, idx]);

  return (
    <span className="inline-block min-h-[1.1em]">
      <span className="gradient-text font-display">{text}</span>
      <span className="hero-cursor" aria-hidden="true">|</span>
    </span>
  );
}

/* ─── Scroll counter ─────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref   = useRef<HTMLSpanElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || fired.current) return;
      fired.current = true;
      obs.disconnect();
      const dur = 1200, start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════
   HeroSection
   ═══════════════════════════════════════════════════════ */
export default function HeroSection() {
  return (
    /*
     * position: relative — the VaultlineScene canvas sits absolute
     * inside this section only. overflow: hidden clips the canvas.
     * min-height: 100vh so the section is a full viewport height.
     */
    <section className="hero-vaultline">

      {/* ── 3D scene — absolute within section ── */}
      <VaultlineScene />

      {/* ── Gradient overlays for readability ── */}
      {/* Left fade — makes text readable over the dark track */}
      <div className="hero-vl-left-fade"  aria-hidden="true" />
      {/* Bottom fade — blends into page background */}
      <div className="hero-vl-bottom-fade" aria-hidden="true" />

      {/* ── Hero text content ── */}
      <div className="container-x relative z-10 flex min-h-[88vh] flex-col
                      justify-center py-24 sm:py-28 lg:py-32">

        <div className="flex w-full max-w-[500px] flex-col items-start">

          <span className="hero-stagger-1 hero-pill mb-5">
            <ShieldCheck size={12} aria-hidden="true" />
            BNB Smart Chain &nbsp;·&nbsp; Verified on-chain
          </span>

          <h1 className="hero-stagger-2 h-display text-5xl leading-[1.07]
                         sm:text-6xl lg:text-[4.5rem]">
            INTRODUCING
            <br />
            <Typewriter />
          </h1>

          <p className="hero-stagger-3 mt-5 text-lg font-semibold text-slate-200 sm:text-xl">
            The Utility Token Powering the ABT Working Ecosystem.
          </p>

          <p className="hero-stagger-4 mt-3 max-w-md text-sm leading-relaxed
                        text-slate-400 sm:text-base">
            IBO supports platform participation, reward distribution, liquidity
            initiatives, and the continued growth of the ABT Working ecosystem
            on BNB Smart Chain.
          </p>

          <div className="hero-stagger-5 mt-8 flex flex-col gap-3
                          sm:flex-row sm:items-center">
            <Link to="/tokenomics" className="btn-primary">
              Explore Tokenomics <ArrowRight size={16} />
            </Link>
            {contractValid ? (
              <a href={bscScan.token()} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                View on BscScan <ExternalLink size={14} />
              </a>
            ) : (
              <Link to="/faq" className="btn-ghost">
                <Zap size={14} /> Read the FAQ
              </Link>
            )}
          </div>

          <div className="hero-stagger-6 hero-stats mt-8">
            {[
              { to: 46,  suf: "M",  label: "Total Supply" },
              { to: 20,  suf: "M",  label: "Burn Reserve" },
              { to: 10,  suf: "yr", label: "Burn Plan"    },
              { to: 10,  suf: "M",  label: "DEX Reserve"  },
            ].map(s => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-num"><Counter to={s.to} suffix={s.suf} /></span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
