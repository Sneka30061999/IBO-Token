import { Link } from "react-router-dom";
import { contractValid, links, tokenConfig, shorten } from "../config/token";
import BscScanLink from "./BscScanLink";

const ACCENT = "#2EE5A8";

const TOKEN_LINKS = [
  { label: "Home",       to: "/"           },
  { label: "About",      to: "/about"      },
  { label: "Tokenomics", to: "/tokenomics" },
  { label: "Whitepaper", to: "/whitepaper" },
];

const ECOSYSTEM_LINKS = [
  { label: "Burn & Liquidity", to: "/burn-liquidity" },
  { label: "Transactions",     to: "/transactions"   },
  { label: "Roadmap",          to: "/roadmap"        },
  { label: "FAQ",              to: "/faq"            },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy",  to: "/privacy" },
  { label: "Terms of Use",    to: "/terms"   },
  { label: "Risk Disclosure", to: "/risk"    },
];

const SOCIALS = [
  {
    name: "X",
    href: links.twitter,
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "Telegram",
    href: links.telegram,
    path: "M9.78 15.34l-.4 4.2c.57 0 .82-.25 1.12-.54l2.69-2.57 5.57 4.08c1.02.57 1.75.27 2.02-.94l3.66-17.15c.33-1.51-.55-2.1-1.54-1.73L1.4 9.9c-1.47.57-1.45 1.39-.25 1.76l5.5 1.71L19.4 6.3c.6-.4 1.15-.18.7.22z",
  },
  {
    name: "ABT Working",
    href: links.abtWorking,
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  },
];

/* ── Logo ── */
function FooterLogo() {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <span
        className="grid h-10 w-10 flex-none place-items-center rounded-full border-[1.5px] text-[10.5px] font-bold text-white"
        style={{
          borderColor: ACCENT,
          background: "radial-gradient(circle at 30% 30%, rgba(46,229,168,.28), transparent 70%)",
          boxShadow: "0 0 0 4px rgba(46,229,168,.12), 0 0 22px -4px rgba(46,229,168,.35)",
        }}
      >
        IBO
      </span>
      <span>
        <b className="block text-base font-bold leading-none tracking-tight text-white">IBO Token</b>
        <small className="mt-1 block text-[10px] font-semibold uppercase tracking-[.2em]" style={{ color: ACCENT }}>
          ABT Working
        </small>
      </span>
    </Link>
  );
}

/* ── Social button ── */
function SocialBtn({ name, href, path }: { name: string; href?: string; path: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      aria-label={name}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-white/10 bg-[#0b0f0d] text-[#8d9892] transition duration-300 hover:-translate-y-[3px] hover:border-[#2EE5A8]/50 hover:bg-[#2EE5A8]/10 hover:text-[#2EE5A8]"
    >
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] fill-current">
        <path d={path} />
      </svg>
    </a>
  );
}

/* ── Link column ── */
function LinkCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="mb-5 text-xs font-semibold uppercase tracking-[.18em] text-white">{title}</h4>
      <ul className="space-y-3">
        {items.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="inline-block text-[14.5px] text-[#8d9892] transition duration-200 hover:translate-x-1 hover:text-[#2EE5A8]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Footer — full design, mobile / tablet / desktop
   ═══════════════════════════════════════════════════════ */
export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#050706] pt-16 font-sans text-[#e8ece9] md:pt-[72px]">

      {/* top glow line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2EE5A8]/60 to-transparent" />

      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">

        {/* ── CTA BAND ── */}
        <div className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-3xl border border-[#2EE5A8]/25 bg-gradient-to-br from-[#0c2a1c] via-[#0a1a13] to-[#07100c] px-5 py-6 sm:px-10 sm:py-9">
          <div className="pointer-events-none absolute -right-20 -top-32 h-[360px] w-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(46,229,168,.35),transparent)]" />

          <div className="relative">
            <h3 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[28px]">
              Join the ABT Working ecosystem
            </h3>
            <p className="mt-2 text-[15px] text-[#9fb5a9]">
              Follow the launch, read the whitepaper and verify everything on-chain.
            </p>
          </div>

          <div className="relative flex flex-wrap gap-3">
            {links.telegram && (
              <a
                href={links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-6 py-3 text-[14.5px] font-semibold text-[#03150c] shadow-[0_10px_30px_-10px_rgba(46,229,168,.5)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-10px_rgba(46,229,168,.6)]"
                style={{ background: ACCENT }}
              >
                Join Community
              </a>
            )}
            <Link
              to="/whitepaper"
              className="rounded-xl border border-white/20 px-6 py-3 text-[14.5px] font-semibold text-white transition duration-300 hover:border-[#2EE5A8] hover:text-[#2EE5A8]"
            >
              Read Whitepaper
            </Link>
          </div>
        </div>

        {/* ── LINK GRID ──
            xs  : 2 col  (brand full width)
            md  : 4 col  (brand full width)
            lg  : 1.6fr + 3×1fr
        */}
        <div className="grid grid-cols-2 gap-10 pb-12 pt-14
                        md:grid-cols-4 md:gap-12 md:pt-16
                        lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

          {/* Brand col — full width until lg */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <FooterLogo />
            <p className="mb-6 mt-5 max-w-[320px] text-[14.5px] leading-[1.7] text-[#8d9892]">
              The utility token of the ABT Working ecosystem on BNB Smart Chain.
              Transparent, verifiable, on-chain.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {SOCIALS.map((s) => (
                <SocialBtn key={s.name} {...s} />
              ))}
            </div>
          </div>

          <LinkCol title="Token"     items={TOKEN_LINKS}     />
          <LinkCol title="Ecosystem" items={ECOSYSTEM_LINKS} />
          <LinkCol title="Legal"     items={LEGAL_LINKS}     />
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-3 border-t border-white/10 pb-8 pt-6 text-[13px] text-[#5d6762]">
          <span>
            © {new Date().getFullYear()} IBO Token · ABT Working. All rights reserved.
          </span>

          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: ACCENT }} />
            {tokenConfig.network} · Chain ID {tokenConfig.chainId} ·{" "}
            {contractValid ? (
              <BscScanLink
                kind="address"
                value={tokenConfig.contractAddress!}
                label={shorten(tokenConfig.contractAddress!)}
              />
            ) : (
              <span className="font-mono text-[12.5px] text-[#8d9892]">Address to be announced</span>
            )}
          </span>
        </div>

      </div>
    </footer>
  );
}
