import { useAsync } from "./useAsync";
import { fetchTokenInfo, fetchBurnStats, fetchPool } from "../lib/chain";
import { fetchTransactions } from "../lib/bscscan";
import { tokenConfig } from "../config/token";

export const useTokenInfo = () => useAsync("tokenInfo", fetchTokenInfo, { ttlMs: 120_000, refreshMs: 180_000 });

export const useBurnStats = () => useAsync("burnStats", fetchBurnStats, { ttlMs: 120_000, refreshMs: 180_000 });

export const usePool = () =>
  useAsync("pool", fetchPool, { ttlMs: 60_000, refreshMs: 120_000 });

export const useTransactions = (page = 1, size = 20) =>
  useAsync(`tx:${page}:${size}`, () => fetchTransactions(page, size), { ttlMs: 30_000, refreshMs: 60_000 });

export const hasPairConfigured = !!tokenConfig.dexPairAddress;
