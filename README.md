# IBO Token Website

Public informational website for the IBO token (ABT Working ecosystem), built from the PRD.
React + Vite + TypeScript + Tailwind CSS + React Router + Recharts + viem. Frontend only, no wallet, no login.

## Run

```bash
npm install
cp .env.example .env     # then fill in values
npm run dev              # development
npm run build            # production build (tsc + vite)
npm run preview
```

## Environment variables (`.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_IBO_TOKEN_ADDRESS` | IBO contract on BNB Smart Chain (required for live data) |
| `VITE_BSCSCAN_API_KEY` | BscScan API key for the transactions list |
| `VITE_BSC_RPC_URL` | Primary RPC (public fallbacks are built in) |
| `VITE_ANNUAL_BURN_ADDRESS` | Official annual burn wallet (enables "Annual Burned") |
| `VITE_DEX_PAIR_ADDRESS`, `VITE_DEX_URL` | Set only once the pool exists |
| `VITE_WHITEPAPER_URL` | Final whitepaper PDF link (otherwise a placeholder shows) |
| `VITE_ABT_WORKING_URL`, `VITE_TWITTER_URL`, `VITE_TELEGRAM_URL`, `VITE_SITE_URL` | Links / canonical base |

Vite variables are bundled into the browser, so the BscScan key is public. Restrict it in your BscScan account.

## Pages

Home, About, Tokenomics, Burn & Liquidity, Transactions, Roadmap, Whitepaper, FAQ (`src/pages`).

## Behaviour to know

- Tokenomics is static content (`src/data/content.ts`); allocations sum to exactly 46,000,000.
- Live data is read from the chain (supply, dead-address balances, DEX pair reserves) and BscScan (transfers).
  Failures show an error state with Retry and the last cached timestamp; no fake values are ever shown.
- Supply mismatch between the contract and 46M is flagged on the Burn & Liquidity page.
- Burn totals use `max(dead-address balance, supply reduction)` so the same tokens are never counted twice.
  "Annual Burned" needs `VITE_ANNUAL_BURN_ADDRESS`; "Transaction Burned" is derived as total minus annual.
  **Confirm this against the deployed contract's burn functions/events before launch** (PRD section 12).
- DEX card shows "DEX Launch Allocation: 10,000,000 IBO" until a pair address is configured.
- Roadmap Phase 1 is marked "In progress"; change `roadmapStatus` in `src/data/content.ts` only after the team confirms.
- Replace `ibotoken.example` in `index.html`, `public/sitemap.xml`, `public/robots.txt` with the final domain.
- `public/favicon.svg` and the logo are placeholders; swap in the final IBO logo.
