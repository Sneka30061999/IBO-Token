import type { ReactNode } from "react";
import { LoadingSkeleton } from "./States";
import AnimatedCard from "./AnimatedCard";

interface Props {
  label: string;
  value?: string | null;
  suffix?: string;
  hint?: string;
  icon?: ReactNode;
  accent?: "cyan" | "rose" | "gold" | "teal";
  loading?: boolean;
  unavailable?: boolean;
  delay?: number;
}

const accents = {
  cyan:  { text: "text-[#2EE5A8]",  glow: "from-[#2EE5A8]/20",  spotlight: "rgba(46,229,168,0.18)" },
  rose:  { text: "text-rose-300",  glow: "from-rose-500/20",  spotlight: "rgba(46,229,168,0.18)" },
  gold:  { text: "text-amber-300", glow: "from-amber-400/20", spotlight: "rgba(245,196,81,0.18)" },
  teal:  { text: "text-[#2EE5A8]",  glow: "from-[#2EE5A8]/20",  spotlight: "rgba(46,229,168,0.18)" },
};

export default function StatCard({
  label, value, suffix, hint, icon,
  accent = "cyan", loading, unavailable, delay = 0,
}: Props) {
  const a = accents[accent];
  return (
    <AnimatedCard delay={delay} glowColor={a.spotlight} className="overflow-hidden">
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${a.glow} to-transparent blur-2xl`} />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">{label}</p>
          {icon && <span className={a.text}>{icon}</span>}
        </div>
        <div className="mt-3 min-h-[2.5rem]">
          {loading ? (
            <LoadingSkeleton className="h-9 w-40" />
          ) : unavailable || value == null ? (
            <p className="font-display text-xl font-semibold text-slate-500">Data unavailable</p>
          ) : (
            <p className="font-display text-3xl font-bold leading-tight text-white font-mono">
              {value}
              {suffix && <span className="ml-1.5 text-base font-semibold text-slate-400">{suffix}</span>}
            </p>
          )}
        </div>
        {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
      </div>
    </AnimatedCard>
  );
}
