import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Zap } from "lucide-react";
import { SectionTitle, iconMap } from "../components/Bits";
import HeroSection from "../components/HeroSection";
import FanDeckCards from "../components/FanDeckCards";
import TokenInfoPanel from "../components/TokenInfoPanel";
import FearAndGreedGauge from "../components/FearAndGreedGauge";
import ZigguratChart from "../components/ZigguratChart";
import CyberGlitchAllocations from "../components/CyberGlitchAllocations";
import AboutCoinReveal from "../components/AboutCoinReveal";
import AnimatedCard from "../components/AnimatedCard";
import UtilityCard3D from "../components/UtilityCard3D";
import TransactionTable from "../components/TransactionTable";
import { ErrorState, LoadingSkeleton } from "../components/States";
import { usePageMeta } from "../hooks/usePageMeta";
import { useTransactions, useTokenInfo } from "../hooks/useChainData";
import { TOTAL_SUPPLY, utilities } from "../data/content";
import { bscScan, contractValid, fmt, links } from "../config/token";

/* Per-card colour themes for the 3-D flip utility cards */
const utilityThemes = [
  { hex: "#2EE5A8", rgba: "rgba(46,229,168,0.22)",  iconBg: "from-[#2EE5A8]/40 to-[#1aad7e]/30 text-white" },
  { hex: "#2EE5A8", rgba: "rgba(46,229,168,0.22)",  iconBg: "from-rose-400/40 to-rose-600/30 text-rose-100" },
  { hex: "#f5c451", rgba: "rgba(245,196,81,0.22)",  iconBg: "from-amber-400/40 to-amber-600/30 text-amber-100" },
  { hex: "#2EE5A8", rgba: "rgba(46,229,168,0.22)",  iconBg: "from-[#2EE5A8]/40 to-[#1aad7e]/30 text-white" },
];

export default function Home() {
  usePageMeta(
    "IBO Token | The Utility Token of ABT Working",
    "Explore IBO tokenomics, supply allocation, burn mechanisms, liquidity initiatives, and the ABT Working ecosystem.",
  );
  const txs = useTransactions(1, 5);
  const info = useTokenInfo();

  return (
    <>
      {/* ── New Hero ── */}
      <HeroSection />

      {/* Ticker */}
      <div className="ticker-mask border-y border-white/10 bg-[#020504]/60 py-3" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-sm font-medium text-slate-300">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-10">
              {[
                "46,000,000 IBO Total Supply",
                "BNB Smart Chain",
                "10-Year Annual Burn Programme",
                "3,000,000 IBO Transaction Burn",
                "10,000,000 IBO DEX Reserve",
                "Powered by ABT Working",
              ].map((t) => (
                <span key={t + k} className="flex items-center gap-10">
                  {t}
                  <span className="text-amber-300">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats — fan deck */}
      <section className="container-x pb-4 pt-8">
        <FanDeckCards />
      </section>

      {/* Token info panel — live on-chain data with supply mismatch detection */}
      <section className="container-x pb-6">
        <TokenInfoPanel />
      </section>

      {/* About — scroll-driven coin reveal */}
      <AboutCoinReveal />

      {/* Utilities — 3D flip cards */}
      <section className="relative pt-16 pb-8 sm:pt-20 sm:pb-10 md:pt-24 lg:pt-28">
        <div className="container-x">
          <SectionTitle eyebrow="Utilities" title="What IBO powers" subtitle="Four core ways IBO supports the ecosystem." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {utilities.map((u, i) => {
              const Icon = iconMap[u.icon];
              const theme = utilityThemes[i % utilityThemes.length];
              return (
                <UtilityCard3D
                  key={u.title}
                  delay={i * 90}
                  icon={<Icon size={26} aria-hidden="true" />}
                  title={u.title}
                  text={u.text}
                  accentColor={theme.hex}
                  accentRgba={theme.rgba}
                  iconBg={theme.iconBg}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Tokenomics preview — 3D Ziggurat allocation chart */}
      <section className="py-8 sm:py-10 bg-[#020504]/50">
        <div className="container-x">
          <SectionTitle
            eyebrow="Tokenomics"
            title="Token allocation"
            subtitle="A fixed 46,000,000 IBO supply, split across eight categories. Layers ranked largest → smallest."
          />
          <ZigguratChart />
          <div className="mt-8 text-center">
            <Link to="/tokenomics" className="btn-primary">
              View Complete Tokenomics <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Burn mechanism — cyber glitch allocation cards */}
      <section className="py-8 sm:py-10">
        <div className="container-x">
          <SectionTitle
            eyebrow="Burn mechanism & allocations"
            title="A defined supply reduction plan"
            subtitle="Every IBO allocation — hover a card to see the glitch effect."
          />
          <CyberGlitchAllocations />
          <div className="mt-8 text-center">
            <Link to="/burn-liquidity" className="btn-ghost">
              Explore Burn Mechanism <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent transactions */}
      <section className="pb-8 sm:pb-10">
        <div className="container-x">
          <SectionTitle eyebrow="On-chain" title="Recent transactions" subtitle="The latest five IBO token transfers." />
          {txs.loading ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <LoadingSkeleton key={i} className="h-16 w-full" />)}</div>
          ) : txs.error && !txs.data ? (
            <ErrorState message={txs.error} onRetry={txs.refresh} />
          ) : txs.data && txs.data.length > 0 ? (
            <>
              <TransactionTable txs={txs.data.slice(0, 5)} compact />
              <div className="mt-6 text-center"><Link to="/transactions" className="btn-ghost">View all transactions <ArrowRight size={16} /></Link></div>
            </>
          ) : (
            <p className="card text-center text-slate-400">No transactions found yet.</p>
          )}
        </div>
      </section>

      {/* Ecosystem — full-width banner card */}
      <section className="pb-8 sm:pb-10">
        <div className="container-x">
          <AnimatedCard
            glowColor="rgba(46,229,168,0.2)"
            gradient="from-[#2EE5A8]/12 via-[#2EE5A8]/8 to-rose-500/12"
            className="text-center !p-8 sm:!p-10"
          >
            {/* Decorative orbs */}
            <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#2EE5A8]/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2EE5A8]/30 to-rose-500/20">
              <Zap size={30} className="text-[#2EE5A8]" />
            </div>

            <p className="eyebrow relative">Ecosystem</p>
            <h2 className="h-display relative mt-2 text-3xl sm:text-5xl">Powered by ABT Working</h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
              ABT Working is the ecosystem where IBO supports package participation, referral rewards and rank-related
              incentives.
            </p>
            {links.abtWorking && (
              <a href={links.abtWorking} target="_blank" rel="noopener noreferrer" className="btn-primary relative mt-8 inline-flex">
                Visit ABT Working <ExternalLink size={14} />
              </a>
            )}
          </AnimatedCard>
        </div>
      </section>
    </>
  );
}
