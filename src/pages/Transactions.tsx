import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "../components/Bits";
import TransactionTable from "../components/TransactionTable";
import TransactionFilter, { type Filter } from "../components/TransactionFilter";
import { ErrorState, LoadingSkeleton, StaleBadge } from "../components/States";
import { useTransactions } from "../hooks/useChainData";
import { usePageMeta } from "../hooks/usePageMeta";
import type { TokenTx } from "../lib/bscscan";

const PAGE_SIZE = 20;

/** Renders one page of results and reports it upward so pages can be appended. */
function PageLoader({ page, onData, refreshKey, onMeta }: { page: number; onData: (p: number, d: TokenTx[]) => void; refreshKey: number; onMeta: (m: any) => void }) {
  const r = useTransactions(page, PAGE_SIZE);
  useEffect(() => {
    if (r.data) onData(page, r.data);
  }, [r.data]);
  useEffect(() => {
    onMeta({ page, loading: r.loading, error: r.error, updatedAt: r.updatedAt, stale: r.stale, refresh: r.refresh });
  }, [r.loading, r.error, r.updatedAt, r.stale]);
  useEffect(() => {
    if (refreshKey > 0) r.refresh();
  }, [refreshKey]);
  return null;
}

export default function Transactions() {
  usePageMeta("Transactions | IBO Token", "Latest public IBO token transactions on BNB Smart Chain with links to BscScan.");
  const [pages, setPages] = useState(1);
  const [data, setData] = useState<Record<number, TokenTx[]>>({});
  const [meta, setMeta] = useState<Record<number, any>>({});
  const [filter, setFilter] = useState<Filter>("All");
  const [refreshKey, setRefreshKey] = useState(0);

  const all = useMemo(() => {
    const seen = new Set<string>();
    const out: TokenTx[] = [];
    for (let p = 1; p <= pages; p++)
      for (const t of data[p] ?? []) {
        const k = `${t.hash}:${t.from}:${t.to}:${t.amount}`;
        if (!seen.has(k)) { seen.add(k); out.push(t); }
      }
    return out;
  }, [data, pages]);

  const shown = filter === "All" ? all : all.filter((t) => t.type === filter);
  const first = meta[1];
  const last = meta[pages];
  const lastCount = data[pages]?.length ?? 0;
  const canLoadMore = lastCount === PAGE_SIZE;
  const anyLoading = Object.values(meta).some((m: any) => m?.loading);

  return (
    <>
      {Array.from({ length: pages }, (_, i) => (
        <PageLoader key={i + 1} page={i + 1} refreshKey={refreshKey}
          onData={(p, d) => setData((s) => ({ ...s, [p]: d }))}
          onMeta={(m) => setMeta((s) => ({ ...s, [m.page]: m }))} />
      ))}

      <PageHeader eyebrow="On-chain activity" title={<>Recent <span className="gradient-text">Transactions</span></>}
        subtitle="Public IBO token transfers from BNB Smart Chain. Click any hash or address to open it on BscScan." />

      <section className="section">
        <div className="container-x">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <TransactionFilter value={filter} onChange={setFilter} />
            <div className="flex items-center gap-3">
              {first?.stale && <StaleBadge updatedAt={first.updatedAt} />}
              <button
                className="btn-ghost"
                onClick={() => setRefreshKey((k) => k + 1)}
                disabled={anyLoading}
              >
                <RefreshCw size={15} className={anyLoading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {first?.error && all.length === 0 ? (
            <ErrorState message={first.error} onRetry={() => setRefreshKey((k) => k + 1)} updatedAt={first.updatedAt} />
          ) : !first || (first.loading && all.length === 0) ? (
            <div className="space-y-3">{Array.from({ length: 6 }, (_, i) => <LoadingSkeleton key={i} className="h-14 w-full" />)}</div>
          ) : shown.length === 0 ? (
            <p className="card text-center text-slate-400">
              {all.length === 0 ? "No transactions found." : `No ${filter.toLowerCase()} transactions in the loaded results.`}
            </p>
          ) : (
            <>
              {first?.error && <div className="mb-4"><ErrorState compact message={first.error} onRetry={() => setRefreshKey((k) => k + 1)} updatedAt={first.updatedAt} /></div>}
              <TransactionTable txs={shown} />
            </>
          )}

          {last?.error && pages > 1 && <div className="mt-4"><ErrorState compact message={last.error} onRetry={() => setRefreshKey((k) => k + 1)} /></div>}

          {canLoadMore && (
            <div className="mt-8 text-center">
              <button className="btn-primary" onClick={() => setPages((p) => p + 1)} disabled={anyLoading}>
                {anyLoading ? <><Loader2 size={16} className="animate-spin" /> Loading…</> : "Load more"}
              </button>
            </div>
          )}

          <p className="mt-8 text-xs text-slate-500">
            “Burn” means a transfer to a recognised dead address. Such transfers are not necessarily a reduction of the
            contract’s total supply — see Burn &amp; Liquidity for verified totals.
          </p>
        </div>
      </section>
    </>
  );
}
