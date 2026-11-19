import { ArrowRightLeft, Droplets, Flame } from "lucide-react";
import type { TokenTx, TxType } from "../lib/bscscan";
import { fmt } from "../config/token";
import BscScanLink from "./BscScanLink";

const typeStyle: Record<TxType, string> = {
  Transfer: "bg-[#2EE5A8]/10 text-[#2EE5A8] border-[#2EE5A8]/30",
  Burn: "bg-rose-500/10 text-rose-300 border-rose-400/30",
  Liquidity: "bg-amber-400/10 text-amber-300 border-amber-400/30",
};

export function TypeBadge({ type }: { type: TxType }) {
  const Icon = type === "Burn" ? Flame : type === "Liquidity" ? Droplets : ArrowRightLeft;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeStyle[type]}`}>
      <Icon size={12} aria-hidden="true" /> {type}
    </span>
  );
}

const when = (s: number) => new Date(s * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function TransactionTable({ txs, compact = false }: { txs: TokenTx[]; compact?: boolean }) {
  return (
    <>
      {/* Mobile: card layout */}
      <ul className="space-y-3 md:hidden">
        {txs.map((t) => (
          <li key={t.hash + t.from + t.to + t.amount} className="card !p-4">
            <div className="flex items-center justify-between gap-2">
              <TypeBadge type={t.type} />
              <span className="text-xs text-slate-400">{when(t.timestamp)}</span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-white">
              {fmt(t.amount, 4)} <span className="text-sm text-slate-400">IBO</span>
            </p>
            <dl className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between gap-2"><dt className="text-slate-500">From</dt><dd><BscScanLink kind="address" value={t.from} /></dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">To</dt><dd><BscScanLink kind="address" value={t.to} /></dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">Tx</dt><dd><BscScanLink kind="tx" value={t.hash} /></dd></div>
            </dl>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="card hidden !p-0 overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Tx Hash</th>
                <th className="px-4 py-3">Type</th>
                {!compact && <th className="px-4 py-3">From</th>}
                <th className="px-4 py-3">{compact ? "Wallet" : "To"}</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Date</th>
                {!compact && <th className="px-4 py-3">Status</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {txs.map((t) => (
                <tr key={t.hash + t.from + t.to + t.amount} className="transition hover:bg-white/5">
                  <td className="px-4 py-3"><BscScanLink kind="tx" value={t.hash} /></td>
                  <td className="px-4 py-3"><TypeBadge type={t.type} /></td>
                  {!compact && <td className="px-4 py-3"><BscScanLink kind="address" value={t.from} /></td>}
                  <td className="px-4 py-3"><BscScanLink kind="address" value={t.to} /></td>
                  <td className="px-4 py-3 text-right font-mono text-white">{fmt(t.amount, 4)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">{when(t.timestamp)}</td>
                  {!compact && (
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">{t.status}</span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
