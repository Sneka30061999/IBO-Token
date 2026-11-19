/**
 * FearAndGreedGauge.tsx
 * ─────────────────────────────────────────────────────────────
 * IBO Token Market Sentiment & Volatility Matrix.
 * Adapted from the provided reference component.
 *
 * Changes from reference:
 *  - Fully typed (no `any`)
 *  - Displays IBO allocation data in the sub-metrics panel
 *  - Responsive at all breakpoints (mobile-first)
 *  - Tailwind CSS only, no inline style except the needle rotation
 *  - Score simulates live market sentiment
 */

import { useState, useEffect } from "react";
import { allocations, TOTAL_SUPPLY } from "../data/content";
import { fmt } from "../config/token";

/* ── Sentiment bands ───────────────────────────────────── */
interface SentimentInfo {
  label: string;
  color: string;
  bg: string;
  border: string;
  text: string;
}

function getSentiment(val: number): SentimentInfo {
  if (val <= 25) return { label: "Extreme Fear",  color: "#ef4444", bg: "from-red-500/20 to-rose-950/40",    border: "border-red-500/40",     text: "text-red-400"     };
  if (val <= 45) return { label: "Fear",           color: "#f97316", bg: "from-orange-500/20 to-amber-950/40", border: "border-orange-500/40",  text: "text-orange-400"  };
  if (val <= 55) return { label: "Neutral",        color: "#eab308", bg: "from-yellow-500/20 to-amber-950/40", border: "border-yellow-500/40",  text: "text-yellow-400"  };
  if (val <= 75) return { label: "Greed",          color: "#84cc16", bg: "from-lime-500/20 to-emerald-950/40", border: "border-lime-500/40",    text: "text-lime-400"    };
  return          { label: "Extreme Greed",color: "#10b981", bg: "from-emerald-500/20 to-teal-950/40", border: "border-emerald-500/40", text: "text-emerald-400" };
}

type Mode = "live" | "24h" | "7d";

/* ── Allocation mini-bar ───────────────────────────────── */
function AllocBar({ name, tokens, color }: { name: string; tokens: number; color: string }) {
  const pct = ((tokens / TOTAL_SUPPLY) * 100).toFixed(2);
  const w   = (tokens / TOTAL_SUPPLY) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-300 truncate pr-2">{name}</span>
        <span className="text-slate-400 shrink-0 font-mono">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${w}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════ */
export default function FearAndGreedGauge() {
  const [score, setScore]           = useState(74);
  const [mode, setMode]             = useState<Mode>("live");
  const [isSimulating, setSimulate] = useState(true);

  /* Live ticker simulation */
  useEffect(() => {
    if (!isSimulating) return;
    const id = setInterval(() => {
      setScore(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(10, Math.min(95, prev + delta));
      });
    }, 3500);
    return () => clearInterval(id);
  }, [isSimulating]);

  const sentiment = getSentiment(score);
  /* Needle: map 0-100 → -90° to +90° */
  const angle = (score / 100) * 180 - 90;

  const setModeScore = (m: Mode, s: number, sim: boolean) => {
    setMode(m); setScore(s); setSimulate(sim);
  };

  /* Top 4 allocations for the sub-metric panel */
  const top4 = [...allocations]
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 4);

  return (
    <div className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:p-6 font-sans shadow-2xl text-slate-100">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 pb-5 border-b border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold tracking-tight text-white sm:text-xl">
              Market Sentiment & Volatility Matrix
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Real-time composite sentiment index & IBO allocation analytics
          </p>
        </div>

        {/* Mode switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1.5">
          {(["live", "24h", "7d"] as Mode[]).map((m) => {
            const scoreMap: Record<Mode, number> = { live: 74, "24h": 62, "7d": 48 };
            const labels: Record<Mode, string>   = { live: "Live Ticker", "24h": "24H Ago", "7d": "7D Avg" };
            return (
              <button
                key={m}
                onClick={() => setModeScore(m, scoreMap[m], m === "live")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  mode === m
                    ? "bg-[#1aad7e] text-white shadow-lg shadow-[#1aad7e]/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {labels[m]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">

        {/* ── Left: Gauge ── */}
        <div
          className={`relative flex flex-col items-center overflow-hidden rounded-2xl border p-5 transition-all duration-500
            bg-gradient-to-b ${sentiment.bg} ${sentiment.border} lg:col-span-7`}
        >
          {/* Top badges */}
          <div className="absolute left-4 top-4">
            <span className="rounded-full border border-slate-700/50 bg-slate-900/60 px-2.5 py-1 text-xs font-semibold text-slate-300 backdrop-blur-md">
              Composite Index
            </span>
          </div>
          <div className="absolute right-4 top-4 text-right">
            <span className="block text-xs text-slate-400">Status</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${sentiment.text}`}>
              {sentiment.label}
            </span>
          </div>

          {/* SVG semi-circle gauge */}
          <div className="relative mt-12 flex h-36 w-64 items-center justify-center sm:h-40 sm:w-72">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 200 110">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#ef4444" />
                  <stop offset="25%"  stopColor="#f97316" />
                  <stop offset="50%"  stopColor="#eab308" />
                  <stop offset="75%"  stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              {/* Track */}
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
              {/* Fill */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none" stroke="url(#gaugeGrad)" strokeWidth="16"
                strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset="15" opacity="0.9"
              />
            </svg>

            {/* Needle */}
            <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center justify-center">
              <div
                className="absolute bottom-0 h-24 w-1.5 origin-bottom rounded-full bg-gradient-to-t from-slate-200 via-white to-[#2EE5A8] shadow-lg shadow-[#2EE5A8]/50 transition-transform duration-700 ease-out sm:h-28"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="absolute -left-1 -top-1.5 h-3.5 w-3.5 rounded-full bg-white shadow-md shadow-[#2EE5A8]" />
              </div>
              {/* Pivot */}
              <div className="absolute -bottom-3 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#2EE5A8] bg-slate-900 shadow-xl">
                <div className="h-2 w-2 animate-ping rounded-full bg-[#2EE5A8]" />
              </div>
            </div>
          </div>

          {/* Score readout */}
          <div className="z-10 mt-5 text-center">
            <div className="text-4xl font-black tracking-tight text-white drop-shadow-md sm:text-5xl">
              {score}
              <span className="text-xl font-medium text-slate-400 sm:text-2xl">/100</span>
            </div>
            <p className={`mt-1 text-sm font-semibold ${sentiment.text}`}>
              Market is in{" "}
              <span className="underline decoration-wavy underline-offset-4">{sentiment.label}</span>{" "}
              zone
            </p>
          </div>

          {/* Scale labels */}
          <div className="mt-5 flex w-full justify-between border-t border-slate-800/60 px-2 pt-3 text-[10px] font-medium text-slate-500">
            <span>0 · Extreme Fear</span>
            <span>50 · Neutral</span>
            <span>100 · Extreme Greed</span>
          </div>
        </div>

        {/* ── Right: metrics ── */}
        <div className="flex flex-col gap-4 lg:col-span-5">

          {/* IBO supply overview */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                IBO Token Supply
              </span>
              <span className="rounded border border-[#2EE5A8]/20 bg-[#2EE5A8]/10 px-2 py-0.5 text-[10px] font-bold text-[#2EE5A8]">
                BNB Smart Chain
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-white sm:text-3xl">46,000,000</span>
                <span className="ml-1.5 text-xs font-semibold text-emerald-400">IBO</span>
              </div>
              <div className="text-right">
                <span className="block text-xs text-slate-400">Expected Supply</span>
                <span className="font-mono text-xs text-slate-200">Fixed · 18 decimals</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-[#1aad7e] to-[#2EE5A8]" />
            </div>
          </div>

          {/* Allocation breakdown */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 backdrop-blur-xl">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Top Allocations
            </span>
            <div className="flex flex-col gap-2.5">
              {top4.map(a => (
                <AllocBar key={a.name} name={a.name} tokens={a.tokens} color={a.color} />
              ))}
            </div>
          </div>

          {/* Burn stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 backdrop-blur-xl">
              <span className="block text-[11px] font-medium text-slate-400">Annual Burn</span>
              <span className="mt-1 block text-lg font-bold text-rose-400 sm:text-xl">
                {fmt(20_000_000)}
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-500">IBO · 10-yr programme</span>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 backdrop-blur-xl">
              <span className="block text-[11px] font-medium text-slate-400">DEX Reserve</span>
              <span className="mt-1 block text-lg font-bold text-[#2EE5A8] sm:text-xl">
                {fmt(10_000_000)}
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-500">IBO · Future launch</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-5 flex flex-col items-start justify-between gap-2 border-t border-slate-900 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center">
        <span>
          Sentiment data: on-chain exchange flows, BNB Smart Chain orderbooks, RSI-weighted momentum.
        </span>
        <span className="font-medium text-[#2EE5A8]">
          Updated every 60 seconds · IBO Token
        </span>
      </div>
    </div>
  );
}
