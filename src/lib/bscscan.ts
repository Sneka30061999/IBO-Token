import { tokenConfig, isAddress } from "../config/token";

export type TxType = "Transfer" | "Burn" | "Liquidity";

export interface TokenTx {
  hash: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number; // seconds
  type: TxType;
  status: "Confirmed";
}

interface RawTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenDecimal: string;
  timeStamp: string;
  confirmations?: string;
}

const dead = new Set(tokenConfig.deadAddresses.map((a) => a.toLowerCase()));

export function classify(from: string, to: string): TxType {
  const t = to.toLowerCase();
  const f = from.toLowerCase();
  // Transfers to a recognised dead address (or minted-to-zero) are shown as burns.
  // Note: a dead-address transfer is NOT necessarily a reduction of totalSupply().
  if (dead.has(t)) return "Burn";
  const pair = tokenConfig.dexPairAddress?.toLowerCase();
  if (pair && (t === pair || f === pair)) return "Liquidity";
  return "Transfer";
}

/** BscScan API V2 (Etherscan multichain) tokentx endpoint. */
export async function fetchTransactions(page = 1, offset = 20): Promise<TokenTx[]> {
  const address = tokenConfig.contractAddress;
  if (!isAddress(address)) throw new Error("Token contract address is not configured.");
  if (!tokenConfig.bscScanApiKey) throw new Error("BscScan API key is not configured.");

  const params = new URLSearchParams({
    chainid: String(tokenConfig.chainId),
    module: "account",
    action: "tokentx",
    contractaddress: address,
    page: String(page),
    offset: String(offset),
    sort: "desc",
    apikey: tokenConfig.bscScanApiKey,
  });

  const res = await fetch(`${tokenConfig.bscScanApiUrl}?${params}`);
  if (!res.ok) throw new Error(`BscScan request failed (${res.status}).`);
  const json = await res.json();

  if (json.status !== "1") {
    if (typeof json.message === "string" && /no transactions/i.test(json.message)) return [];
    throw new Error(typeof json.result === "string" ? json.result : json.message ?? "BscScan error");
  }

  return (json.result as RawTx[]).map((r) => {
    const dec = Number(r.tokenDecimal) || tokenConfig.decimals;
    return {
      hash: r.hash,
      from: r.from,
      to: r.to,
      amount: Number(r.value) / 10 ** dec,
      timestamp: Number(r.timeStamp),
      type: classify(r.from, r.to),
      status: "Confirmed" as const,
    };
  });
}
