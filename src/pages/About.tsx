/**
 * About.tsx — Premium IBO About page
 *
 * Top section: animated coin slide (orbit rings, flipping IBO/ABT coin,
 * flying sparks, two text columns) — all responsive, no fixed px layout.
 *
 * Bottom section: 5 utility cards.
 */

import { usePageMeta } from "../hooks/usePageMeta";
import { PageHeader, SectionTitle as _SectionTitle } from "../components/Bits";

/* suppress unused warning — SectionTitle removed from utilities */
void _SectionTitle;

/* ── utility coins data (SVG paths from Lucide icons) ── */
const UTILITY_ITEMS = [
  {
    label: "Platform participation",
    paths: [
      "m12 3 9 4.5-9 4.5-9-4.5z",
      "m3 12 9 4.5 9-4.5",
      "m3 16.5 9 4.5 9-4.5",
    ],
  },
  {
    label: "Referral rewards",
    paths: [
      "M3 8h18v4H3z",
      "M12 8v13",
      "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",
      "M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5",
    ],
  },
  {
    label: "Rank-related incentives",
    paths: [
      "M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
      "M8.5 12.5 7 21l5-3 5 3-1.5-8.5",
    ],
  },
  {
    label: "DEX liquidity",
    paths: [
      "M7 16.3a4 4 0 0 0 4-4c0-1.5-.8-2.6-1.6-3.7L7 5.5 4.6 8.6C3.8 9.7 3 10.8 3 12.3a4 4 0 0 0 4 4z",
      "M12.6 21a5.6 5.6 0 0 0 5.6-5.6c0-2-1.1-3.5-2.2-5L12.6 6l-1.2 1.7",
    ],
  },
  {
    label: "Ecosystem initiatives",
    paths: [
      "M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.1 2.1 0 0 0-2.9-.1z",
      "m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z",
      "M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0",
      "M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5",
    ],
  },
];

/* ── shared coin face class ─────────────────────────── */
const face =
  "absolute inset-0 flex flex-col items-center justify-center rounded-full " +
  "[backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

/* ═══════════════════════════════════════════════════════
   About page
   ═══════════════════════════════════════════════════════ */
export default function About() {
  usePageMeta(
    "About IBO | IBO Token",
    "Learn about the purpose, vision and utilities of the IBO token and its relationship with ABT Working.",
  );

  return (
    <>
      {/* ── Page heading ── */}
      <PageHeader
        eyebrow="About IBO"
        title={<>The purpose behind <span className="gradient-text">IBO</span></>}
        subtitle="IBO is the utility token associated with ABT Working, designed to support the platform's reward distribution, ecosystem participation, and long-term development."
      />

      {/* ═══════════════════════════════════════════════
          COIN SLIDE SECTION
          All sizes scaled to ~75% of original so the section
          fits one viewport at 100% browser zoom, matching the
          visual appearance previously seen at 75% zoom.
          ═══════════════════════════════════════════════ */}
      <section className="relative flex flex-col justify-center overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,#021a10_0%,#020d08_45%,#020504_80%)] py-8 sm:py-10">

        {/* ── Top bar label — right side only ── */}
        <div className="container-x mb-6 flex animate-rise items-center justify-end text-[0.6rem] tracking-[0.16em] [animation-delay:.1s] sm:text-xs">
          <span className="text-[#9F96C9]">VISION &amp; ABT WORKING</span>
        </div>

        {/* ── Main grid: text | coin | text ── */}
        <div className="container-x grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">

          {/* Left column — Vision */}
          <div className="flex flex-col text-center lg:text-left">
            <p className="animate-rise mb-2 text-[0.6rem] font-semibold tracking-[0.18em] text-[#2EE5A8] [animation-delay:.6s] sm:text-xs">
              01 · VISION
            </p>
            <h2 className="animate-rise font-grotesk text-lg font-bold leading-tight text-white [animation-delay:.8s] sm:text-xl lg:text-2xl" style={{ marginBottom: '6px' }}>
              Our Vision
            </h2>
            <p className="animate-rise text-xs leading-relaxed text-[#D2CBF0] [animation-delay:1s] sm:text-sm" style={{ marginTop: 0 }}>
              To build a connected digital ecosystem supported by blockchain technology,
              transparent token distribution, and sustainable platform development.
            </p>
          </div>

          {/* Centre — Coin animation */}
          {/* Orbit size: 260→195px mobile, 300→225px sm */}
          <div className="flex flex-col items-center gap-3">

            {/* Orbit rings + coin */}
            <div className="relative h-[160px] w-[160px] sm:h-[190px] sm:w-[190px]">

              {/* Outer orbit ring */}
              <div className="absolute inset-0 animate-orbit">
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[9px] w-[9px] rounded-full bg-[#2EE5A8] shadow-[0_0_8px_#2EE5A8]" />
              </div>

              {/* Inner orbit ring */}
              <div className="absolute inset-[12%] animate-orbitSlow">
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[7px] w-[7px] rounded-full bg-[#1aad7e] shadow-[0_0_6px_#1aad7e]" />
              </div>

              {/* Orbit ring borders (subtle) */}
              <div className="absolute inset-0 rounded-full border border-[#2EE5A8]/20" />
              <div className="absolute inset-[12%] rounded-full border border-[#1aad7e]/15" />

              {/* Coin wrapper */}
              <div className="absolute inset-[16%] animate-coinIn [animation-delay:.4s] [perspective:675px]">

                {/* Expanding glow rings */}
                {["", "[animation-delay:1.3s]", "[animation-delay:2.6s]"].map((d, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 animate-ringOut rounded-full border-2 border-[#2EE5A8] ${d}`}
                  />
                ))}

                {/* Floating coin — continuous Y-axis rotation */}
                <div className="absolute inset-0 animate-hover">
                  <div
                    className="absolute inset-0 [transform-style:preserve-3d]"
                    style={{ animation: "coinSpin 3.6s linear infinite" }}
                  >
                    {/* Front face — IBO */}
                    <div
                      className={`${face} border-[4px] border-[#2EE5A8]`}
                      style={{
                        background: "radial-gradient(circle at 35% 30%, #adfde3, #2EE5A8 60%, #0d7a58 100%)",
                        boxShadow: "0 0 45px rgba(46,229,168,0.5), inset 0 0 0 7px rgba(0,80,50,0.18)",
                        color: "#020504",
                      }}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 rounded-full"
                        style={{
                          background: "radial-gradient(ellipse 50% 35% at 32% 28%, rgba(255,255,255,0.35), transparent 65%)",
                          animation: "coinShine 3.6s linear infinite",
                        }}
                      />
                      <span className="relative font-grotesk text-4xl font-bold leading-none sm:text-[2.8rem]">IBO</span>
                    </div>

                    {/* Back face — ABT */}
                    <div
                      className={`${face} border-[4px] border-[#2EE5A8] [transform:rotateY(180deg)]`}
                      style={{
                        background: "radial-gradient(circle at 35% 30%, #adfde3, #2EE5A8 60%, #0d7a58 100%)",
                        boxShadow: "0 0 45px rgba(46,229,168,0.5), inset 0 0 0 7px rgba(0,80,50,0.18)",
                        color: "#020504",
                      }}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 rounded-full"
                        style={{
                          background: "radial-gradient(ellipse 50% 35% at 32% 28%, rgba(255,255,255,0.3), transparent 65%)",
                          animation: "coinShine 3.6s linear infinite",
                        }}
                      />
                      <span className="relative font-grotesk text-2xl font-bold leading-none sm:text-3xl">ABT</span>
                      <span className="relative font-grotesk text-sm font-semibold leading-snug sm:text-base">Working</span>
                    </div>

                    {/* Coin edge */}
                    <div
                      className="absolute left-1/2 top-0 h-full origin-center"
                      style={{
                        width: 8,
                        marginLeft: -4,
                        background: "linear-gradient(180deg, #0d7a58 0%, #2EE5A8 50%, #0d7a58 100%)",
                        transform: "rotateY(90deg)",
                        backfaceVisibility: "hidden",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ground shadow */}
            <div
              className="h-3 w-28 animate-shadowPulse rounded-full sm:w-36"
              style={{ background: "radial-gradient(ellipse, rgba(46,229,168,0.4), transparent 70%)" }}
            />

            {/* Sparks — scaled positions */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
              {[
                { dx: -22, dy:  15, size: 4, color: "#2EE5A8", delay: ".2s"  },
                { dx:  30, dy:  19, size: 3, color: "#2EE5A8", delay: "1.2s" },
                { dx: -38, dy: -11, size: 4, color: "#1aad7e", delay: "2.2s" },
                { dx:  41, dy:  -8, size: 3, color: "#1aad7e", delay: "3s"   },
              ].map((s, i) => (
                <div
                  key={i}
                  className="absolute animate-sparkUp rounded-full"
                  style={{
                    width: s.size, height: s.size,
                    background: s.color,
                    left: `calc(50% + ${s.dx}px)`,
                    top:  `calc(50% + ${s.dy}px)`,
                    animationDelay: s.delay,
                    boxShadow: `0 0 5px ${s.color}`,
                  }}
                />
              ))}
            </div>

            {/* Footer tagline */}
            <p className="animate-fadeIn text-center text-[0.6rem] tracking-[0.12em] text-[#9F96C9] [animation-delay:2s] sm:text-xs">
              One ecosystem · Two identities
            </p>
          </div>

          {/* Right column — Relationship */}
          <div className="flex flex-col text-center lg:text-left">
            <p className="animate-rise mb-2 text-[0.6rem] font-semibold tracking-[0.18em] text-[#2EE5A8] [animation-delay:1.2s] sm:text-xs">
              02 · RELATIONSHIP
            </p>
            <h2 className="animate-rise font-grotesk text-lg font-bold leading-tight text-white [animation-delay:1.4s] sm:text-xl lg:text-2xl" style={{ marginBottom: '6px' }}>
              Relationship with ABT Working
            </h2>
            <p className="animate-rise text-xs leading-relaxed text-[#D2CBF0] [animation-delay:1.6s] sm:text-sm" style={{ marginTop: 0 }}>
              IBO integrates into the Working ecosystem through package participation,
              referral rewards, and rank-related reward mechanisms, while keeping its
              own independent brand identity.
            </p>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          UTILITIES SECTION — spinning coins
          ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#020504] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 xl:px-14">

        {/* Inject the coinSpin keyframe */}
        <style>{`@keyframes coinSpin{to{transform:rotateY(360deg)}}`}</style>

        {/* Soft background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_45%,#0e2236,transparent_70%)]"
        />

        <div className="relative mx-auto w-full">

          {/* Header */}
          <div className="mb-8 sm:mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#2EE5A8]">
              Token utilities
            </p>
            <h2 className="font-grotesk text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[44px]">
              Five utilities, one token
            </h2>
          </div>

          {/* Coin row — horizontal, equal columns, 2-col on mobile */}
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-y-12 [perspective:1300px] sm:grid-cols-3 lg:grid-cols-5">
            {UTILITY_ITEMS.map((item, i) => (
              <li
                key={item.label}
                className="group flex flex-col items-center gap-3 text-center [transform-style:preserve-3d] last:col-span-2 sm:last:col-span-1 lg:last:col-span-1"
              >
                {/* Spinning coin */}
                <div
                  className={[
                    /* coin body */
                    "relative grid size-[72px] place-items-center rounded-full",
                    "border-4 border-[#2EE5A8]/80",
                    "bg-[radial-gradient(circle_at_35%_30%,#adfde3,#2EE5A8_45%,#0d7a58)]",
                    /* 3D depth layers */
                    "[transform-style:preserve-3d] [backface-visibility:hidden]",
                    "before:absolute before:-inset-1 before:rounded-full before:bg-[#0d7a58] before:content-['']",
                    "before:[transform:translateZ(-3px)]",
                    "after:absolute after:-inset-1 after:rounded-full after:bg-[#0a5240] after:content-['']",
                    "after:[transform:translateZ(-7px)]",
                    /* hover lift */
                    "transition-transform duration-300 group-hover:-translate-y-2",
                    /* glow on hover */
                    "group-hover:shadow-[0_0_28px_rgba(46,229,168,0.65)]",
                  ].join(" ")}
                  style={{
                    animation: "coinSpin 4.5s linear infinite",
                    animationDelay: `${i * -0.9}s`,
                  }}
                >
                  {/* SVG icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="relative z-10 size-8 fill-none stroke-[#020504]"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {item.paths.map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </svg>

                  {/* Specular shimmer on the coin face */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(ellipse 55% 38% at 32% 26%, rgba(255,255,255,0.28), transparent 65%)",
                    }}
                  />
                </div>

                {/* Number */}
                <span className="font-mono text-xs text-slate-500">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Label */}
                <span className="text-sm font-bold leading-snug text-white sm:text-base">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
