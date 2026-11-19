import { AlertTriangle, RefreshCw } from "lucide-react";

export function LoadingSkeleton({ className = "h-6 w-24" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function ErrorState({
  message,
  onRetry,
  updatedAt,
  compact,
}: {
  message?: string | null;
  onRetry?: () => void;
  updatedAt?: number | null;
  compact?: boolean;
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 text-sm text-amber-100 ${
        compact ? "p-3" : "p-4 sm:flex-row sm:items-center sm:gap-3"
      }`}
    >
      <AlertTriangle size={18} className="shrink-0 text-amber-300" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-semibold">Live data unavailable</p>
        <p className="text-amber-100/70">
          {message ?? "We couldn't reach the blockchain data source."}
          {updatedAt ? ` Last updated ${new Date(updatedAt).toLocaleString()}.` : ""}
        </p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost !min-h-[38px] !px-3 !py-1.5">
          <RefreshCw size={14} aria-hidden="true" /> Refresh
        </button>
      )}
    </div>
  );
}

export function StaleBadge({ updatedAt }: { updatedAt: number | null }) {
  if (!updatedAt) return null;
  return (
    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200">
      Cached · {new Date(updatedAt).toLocaleTimeString()}
    </span>
  );
}
