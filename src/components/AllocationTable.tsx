import { allocations, allocationTotal, pct } from "../data/content";
import { fmt } from "../config/token";

export default function AllocationTable() {
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 sm:px-6">Allocation</th>
              <th className="px-4 py-3 text-right sm:px-6">Tokens</th>
              <th className="px-4 py-3 text-right sm:px-6">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allocations.map((a) => (
              <tr key={a.name} className="transition hover:bg-white/5">
                <td className="px-4 py-3.5 sm:px-6">
                  <span className="flex items-center gap-3 font-medium text-white">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: a.color }} />
                    {a.name}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-200 sm:px-6">{fmt(a.tokens)}</td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-300 sm:px-6">{pct(a.tokens)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10 bg-white/5 font-semibold text-white">
              <td className="px-4 py-3.5 sm:px-6">Total</td>
              <td className="px-4 py-3.5 text-right font-mono sm:px-6">{fmt(allocationTotal)}</td>
              <td className="px-4 py-3.5 text-right font-mono sm:px-6">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
