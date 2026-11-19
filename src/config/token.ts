/**
 * token.ts — Centralised IBO token configuration  (§ 6.1)
 * ─────────────────────────────────────────────────────────
 * All contract addresses, RPC endpoints, expected on-chain
 * values and helper functions live here.
 *
 * Environment variables are read once at module load time so
 * typos / missing vars surface as early as possible.
 *
 * ⚠  Every VITE_ variable is bundled into the browser build
 *    and is publicly visible. Never put secrets here.
 */

const env = import.meta.env;

/* ── address validator ─────────────────────────────────── */
export const isAddress = (v?: string): v is `0x${string}` =>
  !!v && /^0x[a-fA-F0-9]{40}$/.test(v);

/* Trim whitespace and return undefined for empty strings */
const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);

/* ═══════════════════════════════════════════════════════
   6.1  Centralised token configuration
   ═══════════════════════════════════════════════════════ */
export const tokenConfig = {
  /* ── Static token metadata ── */
  name:     "IBO",
  symbol:   "IBO",
  chainId:  56,                     // BNB Smart Chain mainnet
  network:  "BNB Smart Chain",
  decimals: 18,

  /* ── 6.2  Contract address (from env) ── */
  contractAddress:   clean(env.VITE_IBO_TOKEN_ADDRESS),
  annualBurnAddress: clean(env.VITE_ANNUAL_BURN_ADDRESS),
  dexPairAddress:    clean(env.VITE_DEX_PAIR_ADDRESS),
  dexUrl:            clean(env.VITE_DEX_URL),

  /* ── BscScan / API ── */
  bscScanBaseUrl: "https://bscscan.com",
  bscScanApiUrl:  "https://api.etherscan.io/v2/api", // BscScan V2 (chainId=56)
  bscScanApiKey:  clean(env.VITE_BSCSCAN_API_KEY),

  /* ── RPC endpoints — first valid entry wins ── */
  rpcUrls: [
    clean(env.VITE_BSC_RPC_URL),
    "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc.publicnode.com",
  ].filter(Boolean) as string[],

  /**
   * 6.3  Expected total supply
   * The website documents 46,000,000 IBO.
   * fetchTokenInfo() compares the live contract supply
   * against this value and sets supplyMismatch = true
   * if they differ by more than 0.5 tokens.
   */
  expectedTotalSupply: 46_000_000,

  /* Dead / burn addresses used to calculate burned tokens */
  deadAddresses: [
    "0x000000000000000000000000000000000000dead",
    "0x0000000000000000000000000000000000000000",
  ],
};

/* ── Derived booleans ──────────────────────────────────── */

/** True only when a valid 0x… contract address is configured. */
export const contractValid = isAddress(tokenConfig.contractAddress);

/** True when a DEX URL is set (used to show/hide trade links). */
export const dexReady = !!tokenConfig.dexUrl;

/* ── URL builders ──────────────────────────────────────── */
export const bscScan = {
  token:   ()       => `${tokenConfig.bscScanBaseUrl}/token/${tokenConfig.contractAddress ?? ""}`,
  address: (a: string) => `${tokenConfig.bscScanBaseUrl}/address/${a}`,
  tx:      (h: string) => `${tokenConfig.bscScanBaseUrl}/tx/${h}`,
};

/* ── Utility helpers ───────────────────────────────────── */

/** Shorten a hex address: 0x1234…abcd */
export const shorten = (v: string, head = 6, tail = 4) =>
  v.length <= head + tail + 3 ? v : `${v.slice(0, head)}…${v.slice(-tail)}`;

/** Format a number with US locale commas, no decimals by default. */
export const fmt = (n: number, max = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: max });

/** External social / ecosystem links — all optional. */
export const links = {
  whitepaper: clean(env.VITE_WHITEPAPER_URL),
  abtWorking: clean(env.VITE_ABT_WORKING_URL),
  twitter:    clean(env.VITE_TWITTER_URL),
  telegram:   clean(env.VITE_TELEGRAM_URL),
};
