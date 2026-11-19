export const TOTAL_SUPPLY = 46_000_000;
export const ANNUAL_BURN_ALLOCATION = 20_000_000;
export const ANNUAL_BURN_PER_YEAR = 2_000_000;
export const TX_BURN_ALLOCATION = 3_000_000;
export const DEX_ALLOCATION = 10_000_000;

export interface Allocation {
  name: string;
  tokens: number;
  color: string;
  description: string;
}

export const allocations: Allocation[] = [
  {
    name: "Annual Burn Reserve",
    tokens: 20_000_000,
    color: "#2EE5A8",
    description: "Tokens allocated to the scheduled annual burn programme.",
  },
  {
    name: "Transaction Burn Reserve",
    tokens: 3_000_000,
    color: "#9deccc",
    description: "Tokens reserved for transaction-related burn mechanisms.",
  },
  {
    name: "Future DEX Launch",
    tokens: 10_000_000,
    color: "#2EE5A8",
    description: "Tokens allocated for future exchange liquidity initiatives.",
  },
  {
    name: "Platform & Reward Distribution",
    tokens: 5_000_000,
    color: "#f5c451",
    description:
      "Tokens allocated for package participation, referral rewards, rank rewards, and other approved platform distributions.",
  },
  {
    name: "Team & Contributors",
    tokens: 4_000_000,
    color: "#2EE5A8",
    description: "Allocation for project contributors and team-related incentives.",
  },
  {
    name: "Treasury & Development",
    tokens: 2_000_000,
    color: "#2dd4bf",
    description:
      "Allocation for platform operations, technology development, and infrastructure.",
  },
  {
    name: "Ecosystem & Community",
    tokens: 1_000_000,
    color: "#60a5fa",
    description: "Community initiatives and ecosystem expansion.",
  },
  {
    name: "Strategic Reserve",
    tokens: 1_000_000,
    color: "#94a3b8",
    description: "Reserved for future partnerships and additional requirements.",
  },
];

export const allocationTotal = allocations.reduce((s, a) => s + a.tokens, 0);
export const pct = (tokens: number) => ((tokens / TOTAL_SUPPLY) * 100).toFixed(2);

export const burnYears = Array.from({ length: 10 }, (_, i) => ({
  year: i + 1,
  burn: ANNUAL_BURN_PER_YEAR,
}));

export const utilities = [
  {
    icon: "Layers",
    title: "Platform Participation",
    text: "Supports package participation and platform-related reward mechanisms.",
  },
  {
    icon: "Gift",
    title: "Referral & Rank Rewards",
    text: "Supports token-based rewards within the Working ecosystem.",
  },
  {
    icon: "Droplets",
    title: "DEX Liquidity",
    text: "Dedicated allocation for future decentralized exchange liquidity.",
  },
  {
    icon: "Rocket",
    title: "Ecosystem Development",
    text: "Supports platform expansion and future ecosystem initiatives.",
  },
] as const;

export const roadmap = [
  {
    phase: "Phase 1",
    title: "Token Foundation",
    items: ["Token creation", "Smart-contract deployment", "Tokenomics structure", "Official website"],
  },
  {
    phase: "Phase 2",
    title: "Ecosystem Integration",
    items: ["ABT Working integration", "Referral and rank reward integration", "Token distribution mechanisms"],
  },
  {
    phase: "Phase 3",
    title: "Liquidity & Expansion",
    items: ["DEX liquidity initiatives", "Exchange ecosystem expansion", "Community growth"],
  },
  {
    phase: "Phase 4",
    title: "Long-Term Development",
    items: ["Ecosystem utilities", "Strategic partnerships", "Ongoing platform development", "Scheduled burn programme"],
  },
] as const;

/** Only set status to "done" once the project team confirms the milestone. */
export const roadmapStatus: Record<string, "done" | "active" | "upcoming"> = {
  "Phase 1": "active",
  "Phase 2": "upcoming",
  "Phase 3": "upcoming",
  "Phase 4": "upcoming",
};

export const faqs = [
  {
    q: "What is IBO?",
    a: "IBO is the utility token associated with the ABT Working ecosystem, designed to support platform participation, reward distribution, liquidity initiatives and ecosystem growth.",
  },
  { q: "What is the total supply of IBO?", a: "The planned total supply is 46,000,000 IBO. The Burn & Liquidity page compares this with the supply reported by the deployed contract." },
  { q: "Which blockchain does IBO operate on?", a: "IBO operates on BNB Smart Chain (BSC, chain ID 56)." },
  { q: "What is the purpose of IBO?", a: "IBO supports package participation, referral and rank rewards, future DEX liquidity and ecosystem development within ABT Working." },
  { q: "How is IBO connected to ABT Working?", a: "IBO is an independent token brand powered by the ABT Working ecosystem, where it is used for package participation, referral rewards and rank-related incentives." },
  { q: "How are IBO tokens allocated?", a: "Of 46,000,000 IBO: 20M annual burn reserve, 3M transaction burn reserve, 10M future DEX launch, 5M platform & rewards, 4M team & contributors, 2M treasury & development, 1M ecosystem & community and 1M strategic reserve. See the Tokenomics page." },
  { q: "What is the annual burn mechanism?", a: "2,000,000 IBO are scheduled to be burned every year for 10 years, a total of 20,000,000 IBO. Actual burned amounts are shown separately from the scheduled allocation." },
  { q: "What is the transaction-based burn mechanism?", a: "A separate 3,000,000 IBO allocation is reserved for burns through applicable platform mechanisms. The actual burn logic follows the deployed contract." },
  { q: "How can I verify a burn transaction?", a: "Open the Transactions page, filter by Burn, and click the transaction to view it on BscScan. A transfer to a dead address and a contract burn that reduces total supply are different things and are labelled accordingly." },
  { q: "Where can I view IBO transactions?", a: "Recent transfers are listed on the Transactions page, and the full history is available on BscScan." },
  { q: "What is the future DEX liquidity allocation?", a: "10,000,000 IBO are reserved for a future DEX launch and liquidity initiatives. Live pool data appears only once an official pool exists." },
  { q: "Where can I find the official token contract?", a: "The official contract address is shown in the footer and on the Burn & Liquidity page, with a link to BscScan." },
];
