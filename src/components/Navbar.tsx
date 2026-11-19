/**
 * Navbar.tsx — Hologram navbar
 *
 * Design: Holographic grid floor + scan beam + glitch-on-hover links.
 * All React Router `NavLink` / `Link` navigation preserved.
 * contractValid / bscScan CTA preserved.
 * Mobile: slide-down panel with staggered links.
 * Keyframes injected via <style> — no tailwind.config changes needed.
 */

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import Logo from "./Logo";
import { bscScan, contractValid } from "../config/token";

/* ── nav items (exported — used by Footer etc.) ── */
export const navItems = [
  { to: "/",               label: "Home"           },
  { to: "/about",          label: "About"          },
  { to: "/tokenomics",     label: "Tokenomics"     },
  { to: "/burn-liquidity", label: "Burn & Liquidity"},
  { to: "/transactions",   label: "Transactions"   },
  { to: "/roadmap",        label: "Roadmap"        },
  { to: "/whitepaper",     label: "Whitepaper"     },
  { to: "/faq",            label: "FAQ"            },
];

/* ── keyframes (injected once) ── */
const HOLO_CSS = `
@keyframes holo-grid { to { background-position: 0 14px, 0 0; } }
@keyframes holo-scan { to { left: 100%; } }
@keyframes holo-glitch {
  0%   { text-shadow: 2px 0 #f0f, -2px 0 #0ff; }
  50%  { text-shadow: -2px 0 #f0f, 2px 0 #0ff; transform: translateX(1px); }
  100% { text-shadow: 2px 0 #f0f, -2px 0 #0ff; }
}
.holo-grid { animation: holo-grid 1s linear infinite; }
.holo-scan { animation: holo-scan 3.5s linear infinite; }
.holo-link:hover { animation: holo-glitch .3s steps(2) infinite; }
.holo-active {
  color: #2EE5A8 !important;
  text-shadow: 0 0 10px rgba(46,229,168,.8);
}
@media (prefers-reduced-motion: reduce) {
  .holo-grid, .holo-scan, .holo-link:hover { animation: none; }
}
`;

/* ── perspective grid floor style ── */
const gridFloorStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(46,229,168,.27) 1px, transparent 1px), linear-gradient(90deg, rgba(46,229,168,.27) 1px, transparent 1px)",
  backgroundSize: "100% 14px, 24px 100%",
  transform: "perspective(120px) rotateX(60deg)",
  transformOrigin: "top",
};

/* ════════════════════════════════════════════════════
   Navbar
   ════════════════════════════════════════════════════ */
export default function Navbar() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname }            = useLocation();

  /* close on route change */
  useEffect(() => { setOpen(false); }, [pathname]);

  /* scroll detection */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3">
      {/* Inject hologram keyframes once */}
      <style>{HOLO_CSS}</style>

      {/* ── Main bar ── */}
      <nav
        className={[
          "relative mx-auto flex items-center justify-between gap-4 overflow-hidden",
          "rounded-2xl border border-[#2EE5A8]/30",
          "bg-gradient-to-b from-[#021a10] to-[#020504]",
          "px-4 py-2 font-mono text-xs uppercase tracking-widest text-slate-300",
          "shadow-[inset_0_0_30px_rgba(46,229,168,0.13)]",
          "transition-shadow duration-300",
          scrolled || open
            ? "shadow-[inset_0_0_30px_rgba(46,229,168,0.13),0_0_40px_-12px_rgba(46,229,168,0.3)]"
            : "",
        ].join(" ")}
      >
        {/* Animated perspective grid floor */}
        <div
          aria-hidden="true"
          className="holo-grid pointer-events-none absolute -bottom-9 -left-1/2 -right-1/2 h-20"
          style={gridFloorStyle}
        />

        {/* Horizontal scan beam */}
        <div
          aria-hidden="true"
          className="holo-scan pointer-events-none absolute inset-y-0 -left-16 w-16
                     bg-gradient-to-r from-transparent via-[#2EE5A8]/20 to-transparent"
        />

        {/* ── Logo ── */}
        <Link
          to="/"
          aria-label="IBO Token — home"
          className="relative z-10 flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity"
        >
          {/* Gradient-border circle badge */}
          <span
            className="grid h-8 w-8 place-items-center rounded-full border-2 border-transparent
                       text-[9px] font-bold text-[#2EE5A8]"
            style={{
              background:
                "linear-gradient(#020504,#020504) padding-box, linear-gradient(135deg,#2EE5A8,#1aad7e) border-box",
            }}
          >
            IBO
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[12.5px] font-bold normal-case tracking-normal text-white">
              IBO Token
            </span>
            <span className="text-[8px] tracking-[0.2em] text-[#2EE5A8]">
              ABT WORKING
            </span>
          </span>
        </Link>

        {/* ── Desktop nav links (≥820px) ── */}
        <ul className="relative z-10 hidden items-center gap-0.5 min-[820px]:flex">
          {navItems.map(n => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  [
                    "holo-link block rounded px-2 py-1.5 text-[10px] tracking-wide",
                    "transition-colors hover:text-white",
                    "min-[1180px]:px-3 min-[1180px]:text-[11px] min-[1180px]:tracking-widest",
                    isActive ? "holo-active" : "",
                  ].join(" ")
                }
              >
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Right: contract badge / BscScan + hamburger ── */}
        <div className="relative z-10 flex items-center gap-2">
          {/* Contract badge / BscScan CTA (≥1180px) */}
          {contractValid ? (
            <a
              href={bscScan.token()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-[1180px]:inline-flex items-center gap-1.5 whitespace-nowrap
                         rounded-lg border border-[#2EE5A8]/40 px-3 py-1 text-[10px]
                         text-[#2EE5A8] transition hover:bg-[#2EE5A8]/10 hover:text-white"
            >
              BscScan <ExternalLink size={11} />
            </a>
          ) : (
            <span className="hidden min-[1180px]:block whitespace-nowrap rounded-lg
                             border border-white/20 px-3 py-1 text-[10px] text-slate-400">
              Contract coming soon
            </span>
          )}

          {/* Hamburger (< 820px) */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="holo-drawer"
            onClick={() => setOpen(v => !v)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#2EE5A8]/40
                       text-lg text-[#2EE5A8] transition hover:bg-[#2EE5A8]/10 min-[820px]:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer (< 820px) ── */}
      <div
        id="holo-drawer"
        aria-hidden={!open}
        className={[
          "mx-auto mt-2 max-w-full overflow-hidden rounded-2xl",
          "border border-[#2EE5A8]/30 bg-[#020504]/95",
          "font-mono text-xs uppercase tracking-widest text-slate-300",
          "transition-all duration-300 ease-in-out min-[820px]:hidden",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="p-3">
          <ul className="grid gap-1">
            {navItems.map((n, i) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.to === "/"}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${i * 45}ms` }}
                  className={({ isActive }) =>
                    [
                      "holo-link block rounded-lg px-3 py-2",
                      "hover:bg-[#2EE5A8]/10 hover:text-white transition-colors",
                      isActive ? "holo-active" : "",
                    ].join(" ")
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Contract / BscScan in drawer */}
          {contractValid ? (
            <a
              href={bscScan.token()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg
                         border border-[#2EE5A8]/40 px-3 py-2 text-[11px] text-[#2EE5A8]
                         transition hover:bg-[#2EE5A8]/10"
            >
              View on BscScan <ExternalLink size={11} />
            </a>
          ) : (
            <p className="mt-2 rounded-lg border border-white/15 px-3 py-2
                           text-center text-[11px] text-slate-400">
              Contract coming soon
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
