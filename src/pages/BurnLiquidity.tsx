/**
 * BurnLiquidity.tsx — Premium Burn & Liquidity page
 *
 * Design: deep violet/indigo/amber space theme.
 * Left panel: headings + annual burn stats + bullets + note
 * Centre: animated 3-D coin + flame + platform (pure CSS, no Three.js)
 * Right panel: 10-year timeline table + total row
 * Bottom: transaction burn card + live stats + DEX card
 *
 * Mobile responsive: single column stacked.
 */

import { AlertTriangle, Flame, Info, Droplets, Calendar, Layers, Megaphone } from "lucide-react";
import { SectionTitle } from "../components/Bits";
import LiquidityCard from "../components/LiquidityCard";
import StatCard from "../components/StatCard";
import { ErrorState } from "../components/States";
import BscScanLink from "../components/BscScanLink";
import { useBurnStats, useTokenInfo } from "../hooks/useChainData";
import { usePageMeta } from "../hooks/usePageMeta";
import { ANNUAL_BURN_ALLOCATION, TX_BURN_ALLOCATION, burnYears } from "../data/content";
import { contractValid, fmt, tokenConfig } from "../config/token";

/* ── Keyframe styles injected once ──────────────────── */
const CSS = `
@keyframes bl-pulse{0%,100%{opacity:.72;transform:scale(1)}50%{opacity:1;transform:scale(1.07)}}
@keyframes bl-flick{0%,100%{transform:translateX(0) scale(1,1) skewX(0deg)}25%{transform:translateX(-3px) scale(.96,1.08) skewX(3deg)}50%{transform:translateX(3px) scale(1.04,.94) skewX(-3deg)}75%{transform:translateX(-2px) scale(.98,1.06) skewX(2deg)}}
@keyframes bl-spin{from{transform:translateZ(21px) rotate(0deg)}to{transform:translateZ(21px) rotate(360deg)}}
@keyframes bl-spin2{from{transform:translateZ(22px) rotate(360deg)}to{transform:translateZ(22px) rotate(0deg)}}
@keyframes bl-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes bl-turn{0%{transform:rotateX(-8deg) rotateY(-22deg)}30%{transform:rotateX(-8deg) rotateY(22deg)}50%{transform:rotateX(-8deg) rotateY(-22deg)}58%{transform:rotateX(-8deg) rotateY(-22deg)}82%{transform:rotateX(-8deg) rotateY(338deg)}100%{transform:rotateX(-8deg) rotateY(338deg)}}
@keyframes bl-sheen{0%{transform:translateX(-70%)}60%,100%{transform:translateX(70%)}}
@keyframes bl-rise{0%{transform:translateY(500px) scale(.85);opacity:0}20%{opacity:.85}100%{transform:translateY(250px) scale(1);opacity:0}}
@keyframes bl-ringp{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes bl-spark{0%{opacity:0;transform:translate(0,0) scale(1)}12%{opacity:1}100%{opacity:0;transform:translate(var(--dx),-220px) scale(.2)}}
@keyframes bl-sweep{from{transform:translateY(-80px)}to{transform:translateY(680px)}}
@keyframes bl-dotp{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.35);opacity:1}}
@keyframes bl-mini{0%,100%{transform:translateY(0) rotateY(0deg)}50%{transform:translateY(-12px) rotateY(180deg)}}
@keyframes bl-drift{from{transform:translate(0,0)}to{transform:translate(26px,-20px)}}
@media (prefers-reduced-motion:reduce){
  *,.bl-anim{animation:none!important}
}
@keyframes v3hover {
  0%, 100% { transform: perspective(900px) rotateY(-12deg) rotateX(2deg) translateY(0); }
  50% { transform: perspective(900px) rotateY(12deg) rotateX(-2deg) translateY(-14px); }
}
@keyframes v3scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
@keyframes v3grid {
  from { background-position: 0 0; }
  to { background-position: 0 64px; }
}
@keyframes v3beam {
  0%, 100% { opacity: .9; }
  50% { opacity: .35; }
}
@keyframes v3ring {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(.8); opacity: .55; }
}
@media (max-width: 639px) {
  .v3-floor, .v3-horizon { display: none !important; }
}
:root { --coin-scale: 1; }
@media (max-width: 1279px) { :root { --coin-scale: 0.85; } }
@media (max-width: 1023px) { :root { --coin-scale: 0.72; } }
`;

/* ── CoinScene — pure CSS 3-D coin + flame + platform ── */
function CoinScene() {
  const sparks = [
    { x: 70,  dx: "-24px", delay: "-0.4s", dur: "3.2s" },
    { x: 110, dx: "16px",  delay: "-1.1s", dur: "2.8s" },
    { x: 150, dx: "30px",  delay: "-2.0s", dur: "3.6s" },
    { x: 90,  dx: "-10px", delay: "-0.9s", dur: "3.0s" },
    { x: 130, dx: "-30px", delay: "-2.4s", dur: "2.6s" },
    { x: 55,  dx: "12px",  delay: "-1.6s", dur: "3.4s" },
    { x: 170, dx: "-18px", delay: "-0.2s", dur: "3.1s" },
    { x: 100, dx: "26px",  delay: "-2.8s", dur: "2.9s" },
  ];

  const rimCount = 48;

  return (
    <div className="w-full max-w-[460px] mx-auto overflow-hidden" style={{ transform: "scale(var(--coin-scale,1))", transformOrigin: "top center" }}>
    <div
      className="relative mx-auto select-none"
      style={{ width: 460, height: 580, perspective: 1300, perspectiveOrigin: "50% 38%" }}
      aria-hidden="true"
    >
      {/* Background aura */}
      <div
        className="absolute rounded-full"
        style={{
          left: -40, top: 60, width: 540, height: 540,
          background: "radial-gradient(circle, rgba(255,140,50,.35), rgba(140,80,255,.2) 42%, transparent 68%)",
          filter: "blur(10px)",
          animation: "bl-pulse 4s ease-in-out infinite",
        }}
      />

      {/* Beam */}
      <div
        className="absolute"
        style={{
          left: 95, top: 220, width: 270, height: 300,
          background: "linear-gradient(180deg, rgba(255,170,80,0), rgba(255,150,60,.28) 60%, rgba(255,120,40,.5))",
          clipPath: "polygon(22% 0, 78% 0, 100% 100%, 0 100%)",
          filter: "blur(10px)",
          animation: "bl-pulse 3.4s ease-in-out infinite",
        }}
      />

      {/* Platform — rotateX to look 3-D */}
      <div
        className="absolute"
        style={{ left: 30, top: 330, width: 400, height: 400, transform: "rotateX(72deg)", transformStyle: "preserve-3d" }}
      >
        {/* Base */}
        <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 430, height: 430, marginLeft: -215, marginTop: -215, background: "radial-gradient(circle, #1a1450, #020504 70%, #020504)", boxShadow: "0 0 90px 12px rgba(46,229,168,.6)" }} />
        {/* Stacked discs */}
        {[2,4,6,8,10,12,14,16].map(z => (
          <div key={z} className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 420, height: 420, marginLeft: -210, marginTop: -210, transform: `translateZ(${z}px)`, background: "radial-gradient(circle, #2b2578, #18124f 70%, #100b3c)", border: "1px solid rgba(130,160,255,.25)" }} />
        ))}
        {/* Top surface */}
        <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 420, height: 420, marginLeft: -210, marginTop: -210, transform: "translateZ(18px)", background: "radial-gradient(circle, #2e2884, #1a1458 58%, #0f0a3c)", border: "3px solid #7f8cff", boxShadow: "0 0 28px rgba(110,120,255,.8), inset 0 0 36px rgba(90,100,255,.45)" }} />
        {/* Tick marks */}
        <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 396, height: 396, marginLeft: -198, marginTop: -198, transform: "translateZ(19px)", background: "repeating-conic-gradient(from 0deg, rgba(160,180,255,.9) 0 1deg, transparent 1deg 6deg)", WebkitMask: "radial-gradient(circle, transparent 0 90%, #000 91% 97%, transparent 98%)", mask: "radial-gradient(circle, transparent 0 90%, #000 91% 97%, transparent 98%)" }} />
        {/* Inner ring */}
        <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 350, height: 350, marginLeft: -175, marginTop: -175, transform: "translateZ(20px)", border: "2px solid #2EE5A8", boxShadow: "0 0 24px rgba(46,229,168,.85), inset 0 0 24px rgba(46,229,168,.5)", animation: "bl-ringp 3s ease-in-out infinite" }} />
        {/* Sweep disc */}
        <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 310, height: 310, marginLeft: -155, marginTop: -155, transform: "translateZ(21px)", background: "conic-gradient(from 0deg, rgba(46,229,168,0), rgba(46,229,168,.55) 12%, rgba(46,229,168,0) 30%, rgba(46,229,168,.5) 55%, rgba(46,229,168,0) 70%), radial-gradient(circle, #1d1866, #0c0840 75%)", animation: "bl-spin 9s linear infinite" }} />
        {/* Dashed ring */}
        <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 276, height: 276, marginLeft: -138, marginTop: -138, transform: "translateZ(22px)", border: "2px dashed rgba(255,255,255,.5)", animation: "bl-spin2 14s linear infinite" }} />
        {/* Glow centre */}
        <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 230, height: 230, marginLeft: -115, marginTop: -115, transform: "translateZ(23px)", background: "radial-gradient(circle, rgba(255,170,60,.92), rgba(255,100,30,.3) 55%, transparent 72%)", animation: "bl-pulse 2.6s ease-in-out infinite" }} />
      </div>

      {/* Flame */}
      <div className="absolute" style={{ left: 100, top: 30, width: 260, height: 320 }}>
        {/* glow */}
        <div style={{ position: "absolute", left: 10, bottom: 0, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,130,40,.55), rgba(255,60,120,.24) 50%, transparent 72%)", filter: "blur(14px)", animation: "bl-pulse 2.4s ease-in-out infinite" }} />
        {/* outer flame */}
        <div style={{ position: "absolute", left: 45, bottom: 50, width: 170, height: 170, transformOrigin: "50% 100%", animation: "bl-flick 1.9s ease-in-out infinite" }}>
          <div style={{ width: "100%", height: "100%", transform: "scale(.8,1.5)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50% 0 50% 50%", transform: "rotate(-45deg)", background: "radial-gradient(circle at 50% 62%, #ffb347 0, #ff6a1a 38%, #ff2e8a 70%, rgba(140,60,255,0) 100%)", filter: "blur(7px)", opacity: .95 }} />
          </div>
        </div>
        {/* mid flame */}
        <div style={{ position: "absolute", left: 68, bottom: 56, width: 124, height: 124, transformOrigin: "50% 100%", animation: "bl-flick 1.5s ease-in-out infinite", animationDelay: "-.4s" }}>
          <div style={{ width: "100%", height: "100%", transform: "scale(.8,1.5)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50% 0 50% 50%", transform: "rotate(-45deg)", background: "radial-gradient(circle at 50% 62%, #fff0a8 0, #ffc04a 40%, #ff7a1f 80%, transparent 100%)", filter: "blur(5px)" }} />
          </div>
        </div>
        {/* inner flame */}
        <div style={{ position: "absolute", left: 90, bottom: 62, width: 80, height: 80, transformOrigin: "50% 100%", animation: "bl-flick 1.2s ease-in-out infinite", animationDelay: "-.2s" }}>
          <div style={{ width: "100%", height: "100%", transform: "scale(.8,1.5)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50% 0 50% 50%", transform: "rotate(-45deg)", background: "radial-gradient(circle at 50% 62%, #fff, #ffe58a 55%, transparent 100%)", filter: "blur(3px)" }} />
          </div>
        </div>
        {/* sparks */}
        {sparks.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 90,
              left: s.x,
              width: 4, height: 4,
              borderRadius: "50%",
              background: "#ffd36b",
              boxShadow: "0 0 8px 2px rgba(255,150,40,.85)",
              opacity: 0,
              // @ts-ignore
              "--dx": s.dx,
              animation: `bl-spark ${s.dur} ease-out infinite`,
              animationDelay: s.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Coin */}
      <div
        className="absolute"
        style={{ left: 120, top: 220, width: 220, height: 220, transformStyle: "preserve-3d", animation: "bl-bob 5s ease-in-out infinite" }}
      >
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", animation: "bl-turn 16s ease-in-out infinite" }}>
          {/* Front */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translateZ(9px)", background: "radial-gradient(circle at 32% 26%, rgba(255,255,255,.75), rgba(255,255,255,0) 34%), conic-gradient(from 20deg, #a8650f, #f7c765, #fff1b8, #e7a63a, #9a5a0c, #e9b04a, #fff0b0, #c98420, #a8650f)", boxShadow: "inset 0 0 0 3px rgba(120,70,10,.6), inset 0 0 20px rgba(80,40,0,.55)" }}>
            <div style={{ position: "absolute", inset: 12, borderRadius: "50%", border: "3px solid rgba(255,238,175,.9)", boxShadow: "inset 0 0 0 2px rgba(130,75,10,.7)" }} />
            <div style={{ position: "absolute", inset: 26, borderRadius: "50%", border: "2px dashed rgba(120,70,10,.55)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 60, lineHeight: 1, background: "linear-gradient(180deg, #fff4c2, #d89a2c 55%, #8a520a)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 2px 0 rgba(90,50,5,.75)) drop-shadow(0 -1px 0 rgba(255,245,200,.7))" }}>IBO</div>
            <div style={{ position: "absolute", inset: "-30%", background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,.65) 50%, transparent 60%)", animation: "bl-sheen 4.5s ease-in-out infinite" }} />
          </div>
          {/* Back */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(9px)", background: "radial-gradient(circle at 32% 26%, rgba(255,255,255,.75), rgba(255,255,255,0) 34%), conic-gradient(from 20deg, #a8650f, #f7c765, #fff1b8, #e7a63a, #9a5a0c, #e9b04a, #fff0b0, #c98420, #a8650f)", boxShadow: "inset 0 0 0 3px rgba(120,70,10,.6), inset 0 0 20px rgba(80,40,0,.55)" }}>
            <div style={{ position: "absolute", inset: 12, borderRadius: "50%", border: "3px solid rgba(255,238,175,.9)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 60, lineHeight: 1, background: "linear-gradient(180deg, #fff4c2, #d89a2c 55%, #8a520a)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>IBO</div>
          </div>
          {/* Rim segments */}
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d" }}>
            {Array.from({ length: rimCount }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: -7, top: -9, width: 14, height: 18, backfaceVisibility: "hidden", background: "linear-gradient(90deg, rgba(90,50,5,.4), rgba(255,255,255,0) 45%, rgba(90,50,5,.28)), linear-gradient(180deg, #ffe9a0, #d99a2e 45%, #8a520a)", transform: `rotateZ(${i * (360 / rimCount)}deg) translateY(-110px) rotateX(90deg)` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Glass tube */}
      <div style={{ position: "absolute", left: 80, top: 215, width: 300, height: 310, borderRadius: "0 0 150px 150px / 0 0 46px 46px", background: "linear-gradient(90deg, rgba(120,190,255,.4), rgba(120,190,255,.06) 14%, rgba(120,190,255,.03) 50%, rgba(170,120,255,.06) 86%, rgba(170,120,255,.38))", borderLeft: "1px solid rgba(160,210,255,.5)", borderRight: "1px solid rgba(190,150,255,.5)", borderBottom: "2px solid rgba(160,200,255,.4)" }} />
      <div style={{ position: "absolute", left: 80, top: 170, width: 300, height: 90, borderRadius: "50%", border: "2px solid rgba(190,230,255,.82)", background: "radial-gradient(ellipse, rgba(160,210,255,.08), rgba(120,180,255,.22))", boxShadow: "0 0 22px rgba(120,190,255,.55), inset 0 0 18px rgba(150,200,255,.35)" }} />
      {/* Rise rings */}
      {[0, -1.3, -2.6].map((d, i) => (
        <div key={i} style={{ position: "absolute", left: 90, top: 0, width: 280, height: 80, borderRadius: "50%", border: "2px solid rgba(255,170,70,.8)", boxShadow: "0 0 16px rgba(255,140,40,.7), inset 0 0 12px rgba(255,140,40,.35)", opacity: 0, animation: "bl-rise 4s linear infinite", animationDelay: `${d}s` }} />
      ))}

      {/* Mini coins */}
      {[
        { left: 36, top: 258, size: 32, dl: "-1s" },
        { left: 398, top: 214, size: 26, dl: "-3s" },
        { left: 404, top: 452, size: 20, dl: "-4.5s" },
      ].map((m, i) => (
        <div key={i} style={{ position: "absolute", left: m.left, top: m.top, width: m.size, height: m.size, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #fff1b8, #e8a93c 45%, #8a520a)", border: "2px solid rgba(255,230,150,.85)", boxShadow: "0 0 16px rgba(255,160,50,.6), inset 0 0 0 3px rgba(130,75,10,.3)", animation: "bl-mini 6s ease-in-out infinite", animationDelay: m.dl }} />
      ))}
    </div>
    </div>
  );
}

/* ── Year timeline table ─────────────────────────────── */
function YearTable() {
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border"
      style={{
        borderColor: "rgba(46,229,168,.5)",
        background: "linear-gradient(180deg, rgba(2,5,4,.78), rgba(2,5,4,.85))",
        backdropFilter: "blur(16px)",
        boxShadow: "0 30px 80px rgba(0,0,40,.6), 0 0 44px rgba(46,229,168,.25), inset 0 1px 0 rgba(255,255,255,.18)",
      }}
    >
      {/* Sweep animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: 0, height: 80,
            background: "linear-gradient(180deg, transparent, rgba(140,160,255,.12), transparent)",
            animation: "bl-sweep 7s linear infinite",
          }}
        />
      </div>

      {/* Header */}
      <div className="px-5 pb-2 pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#66ffd1]">Annual Burn Schedule</p>
        <p className="mt-0.5 text-xs text-slate-500">2,000,000 IBO each year for 10 years</p>
      </div>

      {/* Timeline line + rows */}
      <div className="relative flex flex-1 flex-col px-4 pb-2">
        {/* Vertical line */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{ left: 23, top: 8, bottom: 8, width: 2, background: "linear-gradient(180deg, rgba(90,170,255,.85), rgba(46,229,168,.55))", boxShadow: "0 0 10px rgba(90,150,255,.55)" }}
        />

        <ul className="flex flex-col divide-y" style={{ borderColor: "rgba(140,150,255,.12)" }}>
          {burnYears.map((y, i) => (
            <li key={y.year} className="flex items-center gap-3 py-2.5">
              {/* Dot */}
              <div
                className="relative z-10 shrink-0 rounded-full"
                style={{
                  width: 12, height: 12, marginLeft: 6,
                  background: "radial-gradient(circle at 35% 30%, #e2f8ff, #2EE5A8 60%, #3b3bd6)",
                  boxShadow: "0 0 10px rgba(80,170,255,.9)",
                  animation: `bl-dotp 3s ease-in-out infinite`,
                  animationDelay: `${i * 0.28}s`,
                }}
              />
              {/* Year */}
              <span className="ml-1 flex-1 text-sm font-semibold text-[#ccfff0]">Year {y.year}</span>
              {/* Flame icon */}
              <Flame size={16} className="shrink-0" style={{ color: "#ff8a1f", filter: "drop-shadow(0 0 6px rgba(255,120,30,.8))" }} />
              {/* Amount */}
              <span className="w-32 text-right text-sm font-medium tabular-nums text-[#66ffd1]">
                <strong className="font-bold text-white">{(y.burn / 1_000_000).toFixed(0)},000,000</strong> IBO
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Total row */}
      <div
        className="mx-4 mb-5 mt-2 flex items-center justify-between gap-3 rounded-2xl px-4 py-4"
        style={{
          border: "1px solid rgba(120,140,255,.5)",
          background: "linear-gradient(90deg, rgba(2,5,4,.38), rgba(2,5,4,.38))",
          boxShadow: "inset 0 0 24px rgba(46,229,168,.25), 0 0 22px rgba(46,229,168,.22)",
        }}
      >
        <span className="text-sm font-medium text-[#66ffd1]">Total scheduled</span>
        <span
          className="font-display text-lg font-bold tabular-nums"
          style={{ background: "linear-gradient(90deg, #fff, #2EE5A8 60%, #2EE5A8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
        >
          20,000,000 IBO
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════ */
export default function BurnLiquidity() {
  usePageMeta(
    "Burn & Liquidity | IBO Token",
    "IBO annual and transaction-based burn mechanisms, live burn statistics and DEX liquidity allocation.",
  );

  const burn = useBurnStats();
  const info = useTokenInfo();

  const b = burn.data;
  const deadOrReduction = b ? Math.max(b.deadAddressBalance, b.supplyReduction) : null;
  const annual       = b?.annualWalletBalance ?? null;
  const total        = deadOrReduction;
  const txBurn       = total != null && annual != null ? Math.max(0, total - annual) : null;
  const remaining    = total != null ? Math.max(0, ANNUAL_BURN_ALLOCATION + TX_BURN_ALLOCATION - total) : null;
  const unavailable  = !contractValid || (!!burn.error && !b);

  return (
    <div>
      <style>{CSS}</style>

      {/* ── Hero section ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "radial-gradient(900px 600px at 22% 8%, rgba(46,229,168,.18), transparent 60%), radial-gradient(800px 700px at 72% 100%, rgba(46,229,168,.12), transparent 60%), radial-gradient(620px 520px at 50% 55%, rgba(255,120,30,.14), transparent 65%), linear-gradient(180deg, #020504, #020504 55%, #020504)",
        }}
      >
        {/* Stars */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              "radial-gradient(1.5px 1.5px at 90px 130px, #fff 50%, transparent 52%)",
              "radial-gradient(1px 1px at 260px 60px, #cfe 50%, transparent 52%)",
              "radial-gradient(1.5px 1.5px at 420px 810px, #fff 50%, transparent 52%)",
              "radial-gradient(1px 1px at 640px 40px, #fff 50%, transparent 52%)",
              "radial-gradient(1px 1px at 900px 90px, #fff 50%, transparent 52%)",
            ].join(","),
          }}
        />

        <div className="container-x py-10 sm:py-14">

          {/* Supply mismatch warning */}
          {info.data?.supplyMismatch && (
            <div role="alert" className="mb-8 flex gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={18} />
              <p>
                <strong>Supply mismatch:</strong> the deployed contract reports {fmt(info.data.totalSupply, 2)} IBO, while the planned supply is {fmt(tokenConfig.expectedTotalSupply)} IBO.
              </p>
            </div>
          )}

          {/* Three-column hero grid */}
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,460px)_1fr] lg:items-center lg:gap-6">

            {/* ── Left — Annual burn info ── */}
            <div className="flex flex-col gap-5">
              {/* Pill badge */}
              <span
                className="self-start px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]"
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(46,229,168,.7)",
                  background: "linear-gradient(180deg, rgba(46,229,168,.18), rgba(2,5,4,.52))",
                  color: "#2EE5A8",
                  boxShadow: "0 0 20px rgba(46,229,168,.4), inset 0 1px 0 rgba(255,255,255,.2)",
                }}
              >
                Annual Burn
              </span>

              {/* Heading */}
              <div>
                <h1
                  className="font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl"
                  style={{ background: "linear-gradient(180deg, #fff, #a8f5df 65%, #2EE5A8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                >
                  Burn &<br />Liquidity
                </h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2EE5A8]">
                  A defined supply reduction mechanism
                </p>
              </div>

              <p className="text-sm leading-relaxed text-slate-300">
                Two separate burn allocations —{" "}
                <strong className="text-white">20,000,000 IBO</strong> annually scheduled and{" "}
                <strong className="text-white">3,000,000 IBO</strong> transaction-based — plus{" "}
                <strong className="text-white">10,000,000 IBO</strong> reserved for a future DEX launch.
              </p>

              {/* Big number */}
              <div className="flex items-baseline gap-3">
                <span
                  className="font-display text-4xl font-extrabold tabular-nums sm:text-5xl"
                  style={{ background: "linear-gradient(180deg, #fff, #a8f5df 65%, #2EE5A8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 6px 18px rgba(46,229,168,.5))" }}
                >
                  20,000,000
                </span>
                <span
                  className="font-display text-2xl font-bold"
                  style={{ background: "linear-gradient(90deg, #2EE5A8, #1aad7e 55%, #2EE5A8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                >
                  IBO
                </span>
              </div>

              {/* Bullets */}
              <ul className="flex flex-col gap-3">
                {[
                  { Icon: Flame,    text: "2,000,000 IBO scheduled for burning every year." },
                  { Icon: Calendar, text: "Scheduled over 10 years." },
                  { Icon: Layers,   text: "Total scheduled allocation: 20 million IBO." },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm leading-snug text-slate-300">
                    <span
                      className="mt-0.5 grid shrink-0 place-items-center rounded-xl"
                      style={{ width: 36, height: 36, background: "linear-gradient(180deg, rgba(46,229,168,.18), rgba(2,5,4,.36))", border: "1px solid rgba(46,229,168,.4)", boxShadow: "0 0 14px rgba(46,229,168,.2), inset 0 1px 0 rgba(255,255,255,.16)" }}
                    >
                      <Icon size={16} className="text-[#2EE5A8]" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              {/* Note card */}
              <div
                className="flex items-start gap-3 rounded-2xl p-4"
                style={{
                  border: "1px solid rgba(46,229,168,.35)",
                  background: "linear-gradient(180deg, rgba(2,26,16,.58), rgba(2,5,4,.62))",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 0 26px rgba(46,229,168,.12), inset 0 1px 0 rgba(255,255,255,.12)",
                }}
              >
                <span
                  className="mt-0.5 grid shrink-0 place-items-center rounded-xl"
                  style={{ width: 36, height: 36, background: "linear-gradient(180deg, rgba(46,229,168,.22), rgba(2,5,4,.42))", border: "1px solid rgba(46,229,168,.55)" }}
                >
                  <Megaphone size={16} className="text-[#2EE5A8]" />
                </span>
                <div>
                  <strong className="block text-sm font-bold text-white">Next scheduled burn date</strong>
                  <span className="text-xs leading-relaxed text-slate-400">To be announced once the schedule is confirmed.</span>
                </div>
              </div>
            </div>

            {/* ── Centre — 3-D scene (hidden on mobile, visible from lg) ── */}
            <div className="hidden lg:block">
              <CoinScene />
            </div>

            {/* ── Right — Year table ── */}
            <YearTable />
          </div>
        </div>
      </section>

      {/* ── Transaction burn section ── */}
      <section className="py-10 sm:py-14">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Transaction burn card */}
            <div
              className="flex flex-col gap-4 rounded-2xl p-6"
              style={{
                border: "1px solid rgba(46,229,168,.45)",
                background: "linear-gradient(180deg, rgba(2,5,4,.7), rgba(2,5,4,.8))",
                backdropFilter: "blur(16px)",
                boxShadow: "0 24px 60px rgba(0,0,40,.5), inset 0 1px 0 rgba(255,255,255,.14)",
              }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#66ffd1]">Transaction-Based Burn</p>
              <h2
                className="font-display text-3xl font-extrabold tabular-nums sm:text-4xl"
                style={{ background: "linear-gradient(180deg, #fff, #c8f7ea 65%, #2EE5A8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
              >
                3,000,000 <span className="text-2xl">IBO</span>
              </h2>
              <p className="text-sm leading-relaxed text-[#99ffe0]">
                A separate allocation is reserved for token burns through applicable platform mechanisms.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Gas-related fees", "Liquidity-related fees", "Transaction fees"].map(tag => (
                  <span key={tag} className="rounded-full px-3 py-1 text-xs font-semibold text-[#99ffe0]" style={{ border: "1px solid rgba(46,229,168,.4)", background: "rgba(46,229,168,.12)" }}>{tag}</span>
                ))}
              </div>
              <p className="flex items-start gap-2 text-xs text-[#2EE5A8]">
                <Info size={13} className="mt-0.5 shrink-0" />
                Actual burn logic follows the deployed contract; not all fees are assumed to be burned automatically.
              </p>
            </div>

            {/* DEX liquidity card */}
            <div
              className="flex flex-col gap-4 rounded-2xl p-6"
              style={{
                border: "1px solid rgba(46,229,168,.35)",
                background: "linear-gradient(180deg, rgba(2,5,4,.7), rgba(2,5,4,.8))",
                backdropFilter: "blur(16px)",
                boxShadow: "0 24px 60px rgba(0,0,40,.5), inset 0 1px 0 rgba(46,229,168,.12)",
              }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2EE5A8]">DEX Liquidity</p>
              <h2
                className="font-display text-4xl font-extrabold tabular-nums"
                style={{ background: "linear-gradient(90deg, #fff, #2EE5A8 60%, #2EE5A8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
              >
                10,000,000 <span className="text-2xl">IBO</span>
              </h2>
              <p className="text-sm leading-relaxed text-sky-200">
                Reserved for a future DEX launch and exchange liquidity initiatives to support trading and ecosystem growth.
              </p>
              <div className="flex items-start gap-3 mt-auto">
                <span
                  className="grid shrink-0 place-items-center rounded-xl"
                  style={{ width: 36, height: 36, background: "linear-gradient(180deg, rgba(60,140,255,.4), rgba(30,60,160,.4))", border: "1px solid rgba(46,229,168,.55)" }}
                >
                  <Droplets size={16} className="text-[#2EE5A8]" />
                </span>
                <p className="text-xs leading-relaxed text-sky-300">
                  Live pool data appears only once an official pool is established.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live statistics — Hologram Deck ── */}
      <section
        className="relative overflow-hidden py-14 px-4 sm:px-6"
        style={{background: "radial-gradient(1100px 520px at 50% 0%, #020504 0%, #020504 60%, #020504 100%)",}}
      >
        {/* Animated grid floor */}
        <div
          className="v3-floor pointer-events-none absolute bottom-0 left-0 right-0"
          style={{height: 180,
            background: "repeating-linear-gradient(0deg, transparent, transparent 63px, rgba(232,121,249,.18) 64px), repeating-linear-gradient(90deg, transparent, transparent 63px, rgba(232,121,249,.18) 64px)",
            backgroundSize: "64px 64px",
            backgroundPosition: "0 0",
            animation: "v3grid 2.5s linear infinite",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,.7) 60%, rgba(0,0,0,.9) 100%)",
            maskImage: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,.7) 60%, rgba(0,0,0,.9) 100%)",
            transform: "perspective(400px) rotateX(50deg)",
            transformOrigin: "50% 100%",}}
        />
        {/* Radial horizon glow */}
        <div
          className="v3-horizon pointer-events-none absolute"
          style={{bottom: 160,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 60,
            background: "radial-gradient(ellipse at center, rgba(232,121,249,.35) 0%, transparent 70%)",
            filter: "blur(8px)",}}
        />

        <div className="container-x relative z-10">
          {/* Header */}
          <div className="mb-10 text-center">
            <p
              className="mb-2 text-xs font-bold uppercase tracking-widest font-mono"
              style={{color: "#2EE5A8"}}
            >
              LIVE STATISTICS
            </p>
            <h2
              className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl"
            >
              Verified burn data
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Read directly from BNB Smart Chain. Allocation and actual burn are shown separately.
            </p>
          </div>

          {/* Warning banner */}
          {unavailable && burn.error && (
            <div
              className="mb-8 flex items-center gap-3 rounded-xl p-4"
              style={{border: "1px solid rgba(245,158,11,.5)",
                background: "rgba(245,158,11,.08)",}}
            >
              <AlertTriangle size={18} className="shrink-0 text-amber-400" />
              <span className="flex-1 text-sm text-amber-200">
                {!contractValid ? "Token contract address is not configured yet." : burn.error}
              </span>
              <button
                onClick={burn.refresh}
                className="rounded-lg px-3 py-1 text-xs font-semibold text-amber-200"
                style={{border: "1px solid rgba(245,158,11,.5)", background: "rgba(245,158,11,.12)"}}
              >
                Refresh
              </button>
            </div>
          )}

          {/* 4 Hologram stat cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {([
              {
                label: "TOTAL TOKENS BURNED",
                value: total != null ? fmt(total, 2) : null,
                sub: "Verified on-chain, no double counting",
                delay: "0s",
              },
              {
                label: "ANNUAL BURNED TOKENS",
                value: annual != null ? fmt(annual, 2) : null,
                sub: annual == null ? "Awaiting official burn wallet" : "Held by annual burn wallet",
                delay: "0.12s",
              },
              {
                label: "TRANSACTION BURNED",
                value: txBurn != null ? fmt(txBurn, 2) : null,
                sub: txBurn == null ? "Awaiting burn mechanism details" : "Total minus annual",
                delay: "0.24s",
              },
              {
                label: "REMAINING ALLOCATION",
                value: remaining != null ? fmt(remaining, 2) : null,
                sub: "Of 23,000,000 IBO allocated",
                delay: "0.36s",
              },
            ] as { label: string; value: string | null; sub: string; delay: string }[]).map((card, i) => (
              <div key={i} className="flex flex-col items-center">
                {/* Card */}
                <div
                  className="relative w-full overflow-hidden rounded-2xl"
                  style={{
                    background: "repeating-linear-gradient(135deg, rgba(46,229,168,.04) 0px, rgba(46,229,168,.04) 1px, transparent 1px, transparent 8px), linear-gradient(180deg, rgba(2,5,4,.95), rgba(2,5,4,.98))",
                    border: "1px solid rgba(46,229,168,.45)",
                    boxShadow: "0 0 32px rgba(46,229,168,.2), inset 0 1px 0 rgba(255,255,255,.08)",
                    backdropFilter: "blur(16px)",
                    padding: "28px 24px 24px",
                    animationName: "v3hover",
                    animationDuration: `${3.8 + i * 0.4}s`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDelay: card.delay,
                  }}
                >
                  {/* Corner brackets via pseudo — implemented as 4 absolute divs */}
                  {/* Top-left */}
                  <div style={{position: "absolute", top: 8, left: 8, width: 16, height: 16, borderTop: "2px solid rgba(46,229,168,.8)", borderLeft: "2px solid rgba(46,229,168,.8)"}} />
                  {/* Top-right */}
                  <div style={{position: "absolute", top: 8, right: 8, width: 16, height: 16, borderTop: "2px solid rgba(46,229,168,.8)", borderRight: "2px solid rgba(46,229,168,.8)"}} />
                  {/* Bottom-left */}
                  <div style={{position: "absolute", bottom: 8, left: 8, width: 16, height: 16, borderBottom: "2px solid rgba(46,229,168,.8)", borderLeft: "2px solid rgba(46,229,168,.8)"}} />
                  {/* Bottom-right */}
                  <div style={{position: "absolute", bottom: 8, right: 8, width: 16, height: 16, borderBottom: "2px solid rgba(46,229,168,.8)", borderRight: "2px solid rgba(46,229,168,.8)"}} />

                  {/* Scan line */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "linear-gradient(90deg, transparent, rgba(46,229,168,.7) 50%, transparent)",
                      animation: `v3scan ${2.4 + i * 0.3}s linear infinite`,
                      animationDelay: card.delay,
                      pointerEvents: "none",
                    }}
                  />

                  {/* Label */}
                  <p
                    className="mb-3 text-xs font-bold uppercase tracking-widest font-mono"
                    style={{color: "#2EE5A8"}}
                  >
                    {card.label}
                  </p>

                  {/* Value */}
                  <div className="min-h-[3rem]">
                    {burn.loading ? (
                      <div className="h-9 w-36 animate-pulse rounded-lg" style={{background: "rgba(232,121,249,.15)"}} />
                    ) : unavailable || card.value == null ? (
                      <p className="font-mono text-xl font-semibold text-slate-500">—</p>
                    ) : (
                      <p
                        className="font-display text-3xl font-bold leading-tight text-white"
                      >
                        {card.value}
                        <span className="ml-1.5 font-mono text-base font-semibold" style={{color: "rgba(46,229,168,.8)"}}> IBO</span>
                      </p>
                    )}
                  </div>

                  {/* Sub-label */}
                  <p className="mt-2 text-xs text-slate-500">{card.sub}</p>
                </div>

                {/* Beam line below card */}
                <div
                  style={{width: 2,
                    height: 32,
                    background: "linear-gradient(180deg, rgba(46,229,168,.8), transparent)",
                    animation: "v3beam 2s ease-in-out infinite",
                    animationDelay: card.delay,}}
                />
                {/* Elliptical ring */}
                <div
                  style={{width: 48,
                    height: 12,
                    borderRadius: "50%",
                    border: "1px solid rgba(232,121,249,.6)",
                    boxShadow: "0 0 10px rgba(232,121,249,.4)",
                    animation: "v3ring 2s ease-in-out infinite",
                    animationDelay: card.delay,}}
                />
              </div>
            ))}
          </div>

          {/* Stale cache notice */}
          {burn.stale && (
            <p className="mt-4 text-center text-xs text-amber-200">
              Showing cached data from {burn.updatedAt ? new Date(burn.updatedAt).toLocaleString() : "earlier"}.
            </p>
          )}

          {/* Contract link */}
          {contractValid && (
            <p className="mt-4 text-center text-xs text-slate-500">
              Contract: <BscScanLink kind="address" value={tokenConfig.contractAddress!} label={tokenConfig.contractAddress} />
            </p>
          )}
        </div>
      </section>

      {/* ── DEX detailed card ── */}
      <section className="pb-16">
        <div className="container-x">
          <SectionTitle eyebrow="DEX liquidity" title="Future exchange liquidity" />
          <LiquidityCard />
        </div>
      </section>
    </div>
  );
}
