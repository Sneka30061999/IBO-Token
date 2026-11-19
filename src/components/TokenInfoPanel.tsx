/**
 * TokenInfoPanel.tsx  (§ 6.3)
 * ─────────────────────────────────────────────────────────
 * Dynamically fetches token info from the deployed contract
 * and displays: name, symbol, decimals, total supply, chain.
 *
 * Key behaviour:
 *  • When no contract address is configured → "placeholder"
 *    state: shows the documented 46 M figure with a badge.
 *  • When contract is configured → fetches live data.
 *  • If live supply ≠ 46 M (±0.5) → prominent mismatch warning.
 *  • Loading skeleton → no layout shift.
 *  • Error state → retry button.
 *  • All states are mobile responsive.
 */

import { AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";
import { useTokenInfo } from "../hooks/useChainData";
import {
  bscScan,
  contractValid,
  fmt,
  shorten,
  tokenConfig,
} from "../config/token";

/* ── Skeleton ─────────────────────────────────────────── */
function Skel({ w = "w-24", h = "h-4" }: { w?: string; h?: string }) {
  return (
    <span className={`skeleton inline-block rounded ${w} ${h}`} aria-hidden="true" />
  );
}

/* ── Single info row ──────────────────────────────────── */
function Row({
  label,
  value,
  loading,
  mono = false,
  accent,
}: {
  label: string;
  value?: React.ReactNode;
  loading?: boolean;
  mono?: boolean;
  accent?: string;
}) {
  return (
    <div className="tip-row">
      <span className="tip-label">{label}</span>
      {loading ? (
        <Skel w="w-32" h="h-4" />
      ) : (
        <span
          className={`tip-value ${mono ? "font-mono text-xs" : ""}`}
          style={accent ? { color: accent } : undefined}
        >
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TokenInfoPanel
   ═══════════════════════════════════════════════════════ */
export default function TokenInfoPanel() {
  const { data, loading, error, stale, updatedAt, refresh } = useTokenInfo();

  /* ── Determine which supply figure to show ── */
  const displaySupply = data?.totalSupply ?? tokenConfig.expectedTotalSupply;
  const isMismatch    = data?.supplyMismatch ?? false;
  const isPlaceholder = !contractValid;

  /* ── Stale / updated timestamp ── */
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <section className="tip-section" aria-label="Token contract information">

      {/* ── Header ── */}
      <div className="tip-header">
        <div>
          <p className="eyebrow">Token Info</p>
          <h2 className="tip-title">
            {tokenConfig.name}&nbsp;
            <span className="tip-symbol">{tokenConfig.symbol}</span>
          </h2>
        </div>

        {/* Live / placeholder badge + refresh */}
        <div className="tip-header-right">
          {isPlaceholder ? (
            <span className="tip-badge tip-badge--pending">
              Contract not yet deployed
            </span>
          ) : stale ? (
            <span className="tip-badge tip-badge--stale">Stale data</span>
          ) : data ? (
            <span className="tip-badge tip-badge--live">
              <span className="tip-badge-dot" aria-hidden="true" />
              Live
            </span>
          ) : null}

          {!isPlaceholder && (
            <button
              className="tip-refresh"
              onClick={refresh}
              disabled={loading}
              aria-label="Refresh token data"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          )}
        </div>
      </div>

      {/* ── Supply mismatch warning ── */}
      {isMismatch && data && (
        <div className="tip-mismatch" role="alert">
          <AlertTriangle size={16} className="shrink-0 text-amber-400" />
          <div>
            <p className="tip-mismatch-title">Supply mismatch detected</p>
            <p className="tip-mismatch-body">
              This site documents&nbsp;
              <strong>{fmt(tokenConfig.expectedTotalSupply)}&nbsp;IBO</strong>, but the
              deployed contract reports&nbsp;
              <strong>{fmt(data.totalSupply)}&nbsp;IBO</strong>.&nbsp;
              Always verify on BscScan.
            </p>
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && !data && (
        <div className="tip-error" role="alert">
          <AlertTriangle size={15} className="shrink-0 text-rose-400" />
          <span className="flex-1 text-sm text-rose-300">{error}</span>
          <button onClick={refresh} className="tip-retry">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* ── Info rows ── */}
      <div className="tip-grid">
        <Row label="Token Name"    value={data?.name   ?? tokenConfig.name}    loading={loading && !data} />
        <Row label="Symbol"        value={data?.symbol ?? tokenConfig.symbol}  loading={loading && !data} />
        <Row label="Decimals"      value={data?.decimals ?? tokenConfig.decimals} loading={loading && !data} />
        <Row label="Network"       value={tokenConfig.network} />
        <Row label="Chain ID"      value={tokenConfig.chainId} />

        {/* Total supply — highlights mismatch */}
        <div className="tip-row tip-row--supply">
          <span className="tip-label">Total Supply</span>
          <div className="flex flex-wrap items-center gap-2">
            {loading && !data ? (
              <Skel w="w-40" h="h-5" />
            ) : (
              <>
                <span
                  className="tip-value tip-value--large"
                  style={isMismatch ? { color: "#fbbf24" } : undefined}
                >
                  {fmt(displaySupply)}&nbsp;IBO
                </span>
                {isMismatch ? (
                  <span className="tip-pill tip-pill--warn">
                    <AlertTriangle size={10} /> Mismatch
                  </span>
                ) : data ? (
                  <span className="tip-pill tip-pill--ok">
                    <CheckCircle size={10} /> Matches expected
                  </span>
                ) : (
                  <span className="tip-pill tip-pill--neutral">Documented figure</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Contract address */}
        <div className="tip-row">
          <span className="tip-label">Contract Address</span>
          {isPlaceholder ? (
            <span className="tip-value tip-value--muted">Address not yet announced</span>
          ) : (
            <a
              href={bscScan.address(tokenConfig.contractAddress!)}
              target="_blank"
              rel="noopener noreferrer"
              className="tip-address-link"
            >
              <span className="hidden sm:inline">{tokenConfig.contractAddress}</span>
              <span className="inline sm:hidden">{shorten(tokenConfig.contractAddress!)}</span>
              <ExternalLink size={12} className="shrink-0" />
            </a>
          )}
        </div>
      </div>

      {/* ── Footer: last updated + BscScan link ── */}
      <div className="tip-footer">
        {updatedLabel && (
          <span className="tip-footer-ts">Updated {updatedLabel}</span>
        )}
        {contractValid && (
          <a
            href={bscScan.token()}
            target="_blank"
            rel="noopener noreferrer"
            className="tip-footer-link"
          >
            Verify on BscScan <ExternalLink size={11} />
          </a>
        )}
      </div>
    </section>
  );
}
