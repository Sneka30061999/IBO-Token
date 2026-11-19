import { Droplets, ExternalLink } from "lucide-react";
import { DEX_ALLOCATION } from "../data/content";
import { fmt, shorten, tokenConfig } from "../config/token";
import { usePool } from "../hooks/useChainData";
import BscScanLink from "./BscScanLink";
import { ErrorState, LoadingSkeleton } from "./States";

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-2.5 text-sm last:border-0">
      <span className="text-slate-400">{k}</span>
      <span className="text-right font-medium text-white">{v}</span>
    </div>
  );
}

export default function LiquidityCard() {
  const configured = !!tokenConfig.dexPairAddress;
  const pool = usePool();

  return (
    <div className="card card-hover">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2EE5A8]/15 text-[#2EE5A8]">
          <Droplets size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">DEX Liquidity</p>
          <p className="font-display text-2xl font-bold text-white">{fmt(DEX_ALLOCATION)} IBO</p>
        </div>
      </div>

      <div className="mt-5">
        {!configured ? (
          <div className="rounded-xl border border-[#2EE5A8]/20 bg-[#2EE5A8]/5 p-4 text-sm text-slate-300">
            <p className="font-semibold text-[#2EE5A8]">DEX Launch Allocation: {fmt(DEX_ALLOCATION)} IBO</p>
            <p className="mt-1 text-slate-400">
              Reserved for a future DEX launch and liquidity initiatives. No liquidity pool exists yet, so no live
              liquidity figures are shown.
            </p>
          </div>
        ) : pool.loading ? (
          <div className="space-y-3">
            <LoadingSkeleton className="h-6 w-full" />
            <LoadingSkeleton className="h-6 w-full" />
            <LoadingSkeleton className="h-6 w-full" />
          </div>
        ) : pool.error && !pool.data ? (
          <ErrorState message={pool.error} onRetry={pool.refresh} />
        ) : pool.data ? (
          <div>
            <Row k="Pool" v={`IBO / ${pool.data.pairedSymbol}`} />
            <Row k="Pairing asset" v={pool.data.pairedSymbol} />
            <Row k="IBO reserve" v={`${fmt(pool.data.iboReserve, 2)} IBO`} />
            <Row k={`${pool.data.pairedSymbol} reserve`} v={fmt(pool.data.pairedReserve, 4)} />
            <Row k="Pool address" v={<BscScanLink kind="address" value={pool.data.address} label={shorten(pool.data.address)} />} />
            {tokenConfig.dexUrl && (
              <a href={tokenConfig.dexUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 w-full">
                View on DEX <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
