import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { allocations, pct } from "../data/content";
import { fmt } from "../config/token";

function Tip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const a = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/15 bg-[#020504]/95 px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-white">{a.name}</p>
      <p className="text-slate-300">{fmt(a.tokens)} IBO</p>
      <p style={{ color: a.color }}>{pct(a.tokens)}%</p>
    </div>
  );
}

export default function TokenomicsDonutChart({ height = 340, legend = false }: { height?: number; legend?: boolean }) {
  return (
    <div>
      <div className="relative w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocations}
              dataKey="tokens"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive
            >
              {allocations.map((a) => (
                <Cell key={a.name} fill={a.color} />
              ))}
            </Pie>
            <Tooltip content={<Tip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-white sm:text-4xl">46M</span>
          <span className="text-xs uppercase tracking-widest text-slate-400">IBO Supply</span>
        </div>
      </div>
      {legend && (
        <ul className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {allocations.map((a) => (
            <li key={a.name} className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: a.color }} />
              <span className="flex-1 truncate text-slate-300">{a.name}</span>
              <span className="text-slate-400">{pct(a.tokens)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
