import { Flame } from "lucide-react";
import { ANNUAL_BURN_ALLOCATION, burnYears } from "../data/content";
import { fmt } from "../config/token";

export default function BurnTimeline() {
  return (
    <div className="card">
      <ol className="relative space-y-0 border-l border-rose-400/30 pl-6">
        {burnYears.map((y) => (
          <li key={y.year} className="relative flex items-center justify-between gap-3 py-2.5">
            <span className="absolute -left-[31px] grid h-4 w-4 place-items-center rounded-full border border-rose-400/60 bg-[#020504]">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            </span>
            <span className="text-sm font-medium text-white">Year {y.year}</span>
            <span className="flex items-center gap-1.5 font-mono text-sm text-rose-200">
              <Flame size={14} aria-hidden="true" /> {fmt(y.burn)} IBO
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-4 font-semibold text-white">
        <span>Total scheduled</span>
        <span className="font-mono text-rose-300">{fmt(ANNUAL_BURN_ALLOCATION)} IBO</span>
      </div>
    </div>
  );
}
