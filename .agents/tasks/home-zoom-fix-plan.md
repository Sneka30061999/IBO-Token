# Implementation Plan — Home Page 100% Zoom Fix

## Goal
Make the Home page look at 100% browser zoom exactly as it currently looks at 90% zoom.
Multiply every hardcoded size by **0.9**. Never touch `zoom`, `transform: scale()`, or
`font-size` on `html`/`body`/`#root`.

## Build & verify commands
```
npm run build          # TypeScript + Vite compile — must pass with 0 errors
npm run dev            # dev server for visual inspection
```
No automated visual tests exist. After each item the implementer should run
`npm run build` to confirm no compile errors, then inspect in the browser at 100% zoom.

---

## Items

- [ ] 1. **`src/index.css` — Global containers, section padding, btn sizing**

  Reduce every hardcoded px/rem size in the shared utility classes and global
  layout rules by multiplying by 0.9. The `.container-x`, `.section`, `.card`,
  `.btn` and body background-gradient radii are all slightly oversized at 100%.

  **Exact changes (`src/index.css`):**

  | Selector / rule | Property | Old value | New value |
  |---|---|---|---|
  | `body` background-image | first radial-gradient size | `60rem 30rem` | `54rem 27rem` |
  | `body` background-image | second radial-gradient size | `50rem 30rem` | `45rem 27rem` |
  | `.section` | `@apply py-14 sm:py-20` | `py-14 sm:py-20` | `py-12 sm:py-[72px]` |
  | `.card` | `@apply … p-5 sm:p-6` | `p-5 sm:p-6` | `p-[18px] sm:p-[22px]` |
  | `.btn` | `min-h-[44px]` | `44px` | `40px` |
  | `.btn` | `px-5 py-2.5` | `px-5 py-2.5` | `px-[18px] py-[9px]` |
  | `.hero-top-glow` | `top: -6rem; height: 30rem` | `-6rem` / `30rem` | `-5.4rem` / `27rem` |
  | `.hero-top-glow` | `width: 70vw` | `70vw` | `63vw` |
  | `.hero-pill` | `font-size: .68rem` | `.68rem` | `.61rem` |
  | `.hero-pill` | `padding: .28rem .85rem` | `.28rem .85rem` | `.25rem .77rem` |
  | `.hero-stats` | `gap: 0 1.5rem` | `1.5rem` | `1.35rem` |
  | `.hero-stats` | `margin-top: 1.75rem` | `1.75rem` | `1.58rem` |
  | `.hero-stat` | `padding: .55rem 0` | `.55rem` | `.5rem` |
  | `.hero-stat` | `min-width: 70px` | `70px` | `63px` |
  | `.hero-stat-num` | `font-size: 1.1rem` | `1.1rem` | `1rem` |
  | `.hero-stat-label` | `font-size: .6rem` | `.6rem` | `.54rem` |
  | `.hero-stat-label` | `margin-top: .2rem` | `.2rem` | `.18rem` |
  | `.hero-coin-wrap` | `min-height: 520px` | `520px` | `468px` |
  | `.coin-canvas` | `height: 520px; max-width: 640px` | `520px` / `640px` | `468px` / `576px` |
  | `@media (max-width:1023px)` `.hero-coin-wrap` | `min-height: 380px` | `380px` | `342px` |
  | `@media (max-width:1023px)` `.coin-canvas` | `height: 380px` | `380px` | `342px` |
  | `@media (max-width:639px)` `.hero-coin-wrap` | `min-height: 300px` | `300px` | `270px` |
  | `@media (max-width:639px)` `.coin-canvas` | `height: 300px` | `300px` | `270px` |
  | `@media (max-width:380px)` `.hero-coin-wrap` | `min-height: 240px` | `240px` | `216px` |
  | `@media (max-width:380px)` `.coin-canvas` | `height: 240px` | `240px` | `216px` |
  | `.footer-link` | `font-size: 1rem` | `1rem` | `0.9rem` |
  | `@media (min-width:1024px)` `.footer-link` | `font-size: 1.05rem` | `1.05rem` | `0.95rem` |
  | `.acr-heading` | `clamp(24px, 4vw, 52px)` | `clamp(24px, 4vw, 52px)` | `clamp(22px, 3.6vw, 47px)` |
  | `.acr-glow` | `clamp(300px, 56vw, 620px)` | `clamp(300px, 56vw, 620px)` | `clamp(270px, 50vw, 558px)` |
  | `.acr-glow` | `clamp(200px, 38vw, 420px)` | `clamp(200px, 38vw, 420px)` | `clamp(180px, 34vw, 378px)` |
  | `.acr-obj` | `clamp(200px, 30vw, 340px)` | `clamp(200px, 30vw, 340px)` | `clamp(180px, 27vw, 306px)` |
  | `.acr-core-text` | `clamp(11px, 1.5vw, 15px)` | `clamp(11px, 1.5vw, 15px)` | `clamp(10px, 1.35vw, 13.5px)` |
  | `.acr-hint` | `font-size: 13px` | `13px` | `12px` |
  | `.acr-hint` | `padding: 7px 16px` | `7px 16px` | `6px 14px` |
  | `.rc-scene` | `max-width: 900px; height: 340px` | `900px` / `340px` | `810px` / `306px` |
  | `.rc-card` | `width: 260px; height: 300px` | `260px` / `300px` | `234px` / `270px` |
  | `.rc-card` | `padding: 1.6rem 1.4rem 1.4rem` | `1.6rem 1.4rem 1.4rem` | `1.44rem 1.26rem 1.26rem` |
  | `.rc-card` | `border-radius: 24px` | `24px` | `22px` |
  | `.rc-card-icon-wrap` | `width: 44px; height: 44px` | `44px` | `40px` |
  | `.rc-card-icon-wrap` | `border-radius: 12px` | `12px` | `11px` |
  | `.rc-card-pct` | `font-size: 0.75rem` | `0.75rem` | `0.68rem` |
  | `.rc-card-label` | `font-size: 0.95rem` | `0.95rem` | `0.86rem` |
  | `.rc-card-value` | `font-size: 1.75rem` | `1.75rem` | `1.58rem` |
  | `.rc-card-hint` | `font-size: 0.72rem` | `0.72rem` | `0.65rem` |
  | `.rc-arrow` | `width: 42px; height: 42px` | `42px` | `38px` |
  | `.rc-arrow-left` | `left: calc(50% - 480px)` | `480px` | `432px` |
  | `.rc-arrow-right` | `right: calc(50% - 480px)` | `480px` | `432px` |
  | `@media (max-width:639px)` `.rc-scene` | `height: 290px` | `290px` | `261px` |
  | `@media (max-width:639px)` `.rc-card` | `width: 220px; height: 260px` | `220px` / `260px` | `198px` / `234px` |
  | `@media (max-width:639px)` `.rc-card` | `padding: 1.2rem 1.1rem` | `1.2rem 1.1rem` | `1.08rem 1rem` |
  | `@media (max-width:639px)` `.rc-card-value` | `font-size: 1.5rem` | `1.5rem` | `1.35rem` |
  | `@media (max-width:639px)` `.rc-card-label` | `font-size: 0.85rem` | `0.85rem` | `0.77rem` |
  | `@media (max-width:400px)` `.rc-scene` | `height: 260px` | `260px` | `234px` |
  | `@media (max-width:400px)` `.rc-card` | `width: 190px; height: 230px` | `190px` / `230px` | `171px` / `207px` |
  | `.utility-card-3d-wrapper` | `height: 240px` | `240px` | `216px` |
  | `@media (min-width:640px)` `.utility-card-3d-wrapper` | `height: 260px` | `260px` | `234px` |
  | `.rm-row` | `margin-bottom: 3.5rem` | `3.5rem` | `3.15rem` |
  | `.rm-card` | `padding: 1.25rem 1.5rem 1.5rem` | `1.25rem 1.5rem 1.5rem` | `1.1rem 1.35rem 1.35rem` |
  | `.rm-title` | `clamp(1.2rem, 2.5vw, 1.5rem)` | `clamp(1.2rem, 2.5vw, 1.5rem)` | `clamp(1.08rem, 2.25vw, 1.35rem)` |
  | `.rm-item` | `font-size: 0.82rem` | `0.82rem` | `0.74rem` |
  | `@media (max-width:639px)` `.rm-row` | `margin-bottom: 2rem` | `2rem` | `1.8rem` |
  | `.faq-orbit-wrap` | `height: 560px` | `560px` | `504px` |
  | `.faq-orb` | `width: 110px; height: 110px` (orbit version) | `110px` | `99px` |
  | `.faq-orb-ring-1` | `width: 110px; height: 110px` | `110px` | `99px` |
  | `.faq-orb-ring-2` | `width: 150px; height: 150px` | `150px` | `135px` |
  | `.faq-orb-ring-3` | `width: 196px; height: 196px` | `196px` | `176px` |
  | `.faq-orb-body` (orbit version) | `width: 90px; height: 90px` | `90px` | `81px` |
  | `.faq-orb-mark` (orbit version) | `font-size: 1.8rem` | `1.8rem` | `1.62rem` |
  | `.faq-orbit-card` | `width: 155px` | `155px` | `140px` |
  | `.faq-orbit-card` | `padding: .75rem .85rem` | `.75rem .85rem` | `.68rem .77rem` |
  | `.faq-card-q` (orbit) | `font-size: .72rem` | `.72rem` | `.65rem` |
  | `.tip-section` | `padding: 1.5rem` | `1.5rem` | `1.35rem` |
  | `.tip-title` | `font-size: 1.35rem` | `1.35rem` | `1.22rem` |
  | `.tip-value--large` | `font-size: 1.1rem` | `1.1rem` | `1rem` |
  | `.card-premium` | `padding: 1.25rem` | `1.25rem` | `1.1rem` |
  | `@media (min-width:640px)` `.card-premium` | `padding: 1.5rem` | `1.5rem` | `1.35rem` |

  Files: `src/index.css`
  Verify: `npm run build` — 0 errors. Visual check at 100% zoom.

---

- [ ] 2. **`src/components/Navbar.tsx` — height, padding, font sizes**

  The Navbar bar itself has no hardcoded height but its children have fixed
  sizes that push it tall. Reduce badge, button, and text sizes.

  **Exact changes (`src/components/Navbar.tsx`):**

  | Element / class | Attribute | Old value | New value |
  |---|---|---|---|
  | Logo badge `<span>` | `h-9 w-9` | `h-9 w-9` (36px) | `h-8 w-8` (32px) |
  | Logo badge `<span>` | `text-[10px]` | `text-[10px]` | `text-[9px]` |
  | Logo name `<span>` | `text-sm` | `text-sm` (14px) | `text-[12.5px]` |
  | Logo sub-label `<span>` | `text-[9px]` | `text-[9px]` | `text-[8px]` |
  | Nav `<nav>` | `px-4 py-2.5` | `py-2.5` (10px) | `py-2` (8px) |
  | Desktop nav `<NavLink>` | `px-2 py-2` | `py-2` | `py-1.5` |
  | Desktop nav `<NavLink>` | `text-[11px]` | `text-[11px]` | `text-[10px]` |
  | Desktop nav `<NavLink>` | `min-[1180px]:px-3 min-[1180px]:text-xs` | `text-xs` (12px) | change to `min-[1180px]:text-[11px]` |
  | BscScan `<a>` | `px-3.5 py-1.5 text-[11px]` | `px-3.5 py-1.5` | `px-3 py-1 text-[10px]` |
  | Hamburger button | `h-9 w-9` | `h-9 w-9` | `h-8 w-8` |
  | Mobile drawer `<NavLink>` | `px-3 py-2.5` | `py-2.5` | `py-2` |

  Files: `src/components/Navbar.tsx`
  Verify: `npm run build` — 0 errors. Navbar is visually slimmer at 100% zoom.

---

- [ ] 3. **`src/components/HeroSection.tsx` — heading, body text, padding, button row, stats**

  The Hero heading is `text-5xl` (48px) on mobile, `sm:text-6xl` (60px), and
  `lg:text-[4.5rem]` (72px). The target at 90% zoom → 100% zoom is ×0.9 each.
  Also reduce the section's inner vertical padding and stat strip margins.

  **Exact changes (`src/components/HeroSection.tsx`):**

  | Element | Old Tailwind / inline value | New value |
  |---|---|---|
  | `<section>` outer padding via container | `py-24 sm:py-28 lg:py-32` | `py-[86px] sm:py-[101px] lg:py-[115px]` |
  | `max-w-[500px]` text column | `max-w-[500px]` | `max-w-[450px]` |
  | Hero badge `<span>` size | CSS class `.hero-pill` (handled in item 1) | — |
  | `<h1>` heading | `text-5xl` | `text-[43px]` |
  | `<h1>` heading | `sm:text-6xl` | `sm:text-[54px]` |
  | `<h1>` heading | `lg:text-[4.5rem]` | `lg:text-[4.05rem]` |
  | Sub-heading `<p>` | `text-lg sm:text-xl` | `text-base sm:text-lg` |
  | Sub-heading `<p>` | `mt-5` | `mt-[18px]` |
  | Body text `<p>` | `text-sm sm:text-base` | `text-[12.5px] sm:text-[13.5px]` |
  | Body text `<p>` | `mt-3` | `mt-[11px]` |
  | CTA button row `<div>` | `mt-8` | `mt-7` |
  | CTA button row `<div>` | `gap-3` | `gap-[11px]` |
  | Stats `<div>` | `mt-8` (via `.hero-stats` handled in item 1) | — |
  | Lucide icon in btn | `size={16}` (ArrowRight) | `size={14}` |
  | Lucide icon in btn | `size={14}` (ExternalLink / Zap) | `size={13}` |

  Files: `src/components/HeroSection.tsx`
  Verify: `npm run build` — 0 errors. Hero heading is visibly smaller at 100%.

---

- [ ] 4. **`src/components/FanDeckCards.tsx` — ring geometry constant `RING_DEPTH` and `spreadX`**

  The 3D carousel positions cards with JS constants in px. The card CSS sizes
  are already adjusted in item 1; the JS geometry constants must also shrink.

  **Exact changes (`src/components/FanDeckCards.tsx`):**

  | Variable / value | Old | New |
  |---|---|---|
  | `const RING_DEPTH = 260` | `260` | `234` |
  | `const spreadX = sign * Math.min(absPos, 1) * 310` | `310` | `279` |
  | Icon inside `<RingCard>` | `<Icon size={22}` | `<Icon size={20}` |

  Files: `src/components/FanDeckCards.tsx`
  Verify: `npm run build` — 0 errors. Cards in the carousel are proportionally smaller.

---

- [ ] 5. **`src/components/Bits.tsx` — `SectionTitle`, `PageHeader`, `Coin` heading sizes**

  `SectionTitle` renders `text-3xl sm:text-4xl` for every section heading.
  `PageHeader` renders `text-4xl sm:text-5xl lg:text-6xl`. Both are on every page.
  The `Coin` component has explicit px sizes on its container.

  **Exact changes (`src/components/Bits.tsx`):**

  | Element | Old value | New value |
  |---|---|---|
  | `<SectionTitle>` `<h2>` | `text-3xl sm:text-4xl` | `text-[27px] sm:text-[36px]` |
  | `<SectionTitle>` outer `<div>` | `mb-10` | `mb-9` |
  | `<PageHeader>` `<h1>` | `text-4xl sm:text-5xl lg:text-6xl` | `text-[36px] sm:text-[45px] lg:text-[54px]` |
  | `<Coin>` container | `h-64 w-64 sm:h-80 sm:w-80` | `h-[230px] w-[230px] sm:h-[288px] sm:w-[288px]` |
  | `<Coin>` `perspective` inline | `900` | `810` |

  Files: `src/components/Bits.tsx`
  Verify: `npm run build` — 0 errors. Section titles are visibly smaller.

---

- [ ] 6. **`src/components/AnimatedCard.tsx` — card padding and tilt magnitudes**

  `AnimatedCard` is used for all premium cards on Home. Its base padding comes
  from `.card-premium` (item 1). The JS tilt math uses a fixed `400px` spotlight
  radius and `10 deg` max tilt; reduce both slightly.

  **Exact changes (`src/components/AnimatedCard.tsx`):**

  | Variable / value | Old | New |
  |---|---|---|
  | `radial-gradient(400px circle` | `400px` | `360px` |
  | `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px) scale(1.02)` | `translateZ(12px)` | `translateZ(11px)` |
  | `const rotateX = … * -10` | `-10` | `-9` |
  | `const rotateY = … * 10` | `10` | `9` |

  Files: `src/components/AnimatedCard.tsx`
  Verify: `npm run build` — 0 errors.

---

- [ ] 7. **`src/components/StatCard.tsx` — value font size and stat card dimensions**

  `StatCard` uses `text-3xl` for the main number and `text-xl` for the
  unavailable state. Reduce by 0.9.

  **Exact changes (`src/components/StatCard.tsx`):**

  | Element | Old value | New value |
  |---|---|---|
  | Main value `<p>` | `text-3xl` | `text-[27px]` |
  | Suffix `<span>` | `text-base` | `text-[13.5px]` |
  | Unavailable `<p>` | `text-xl` | `text-lg` |
  | Icon glow orb `<div>` | `h-32 w-32` | `h-[115px] w-[115px]` |
  | Value row `<div>` | `mt-3 min-h-[2.5rem]` | `mt-[11px] min-h-[2.25rem]` |

  Files: `src/components/StatCard.tsx`
  Verify: `npm run build` — 0 errors.

---

- [ ] 8. **`src/components/Footer.tsx` — CTA band, logo, link columns, bottom bar**

  Footer has explicit px/rem values in Tailwind classes and inline styles that
  are outside the shared CSS rules already adjusted.

  **Exact changes (`src/components/Footer.tsx`):**

  | Element | Old value | New value |
  |---|---|---|
  | `<footer>` | `pt-16 md:pt-[72px]` | `pt-[58px] md:pt-[65px]` |
  | Outer wrapper | `max-w-[1200px]` | `max-w-[1080px]` |
  | CTA band | `px-6 py-8 sm:px-12 sm:py-12` | `px-5 py-7 sm:px-[43px] sm:py-[43px]` |
  | CTA band orb `<div>` | `h-[360px] w-[360px]` | `h-[324px] w-[324px]` |
  | CTA `<h3>` | `text-2xl sm:text-[28px]` | `text-[21.5px] sm:text-[25px]` |
  | CTA `<p>` | `text-[15px]` | `text-[13.5px]` |
  | CTA buttons | `px-6 py-3 text-[14.5px]` | `px-[22px] py-[11px] text-[13px]` |
  | Link grid | `gap-10 pb-12 pt-14 md:gap-12 md:pt-16` | `gap-9 pb-[43px] pt-[50px] md:gap-[43px] md:pt-[58px]` |
  | Footer logo badge | `h-10 w-10` | `h-9 w-9` |
  | Footer logo brand name | `text-base` | `text-[13.5px]` |
  | Footer logo sub-label | `text-[10.5px]` | `text-[9.5px]` |
  | Footer brand `<p>` | `text-[14.5px]` | `text-[13px]` |
  | Footer brand `<p>` | `mt-5 mb-6 max-w-[320px]` | `mt-[18px] mb-5 max-w-[288px]` |
  | Social btn | `h-[38px] w-[38px] rounded-[10px]` | `h-[34px] w-[34px] rounded-[9px]` |
  | Social btn SVG | `h-[17px] w-[17px]` | `h-[15px] w-[15px]` |
  | LinkCol `<h4>` | `mb-5 text-xs tracking-[.18em]` | `mb-[18px] text-[10.5px] tracking-[.18em]` |
  | LinkCol `<Link>` | `text-[14.5px]` | `text-[13px]` |
  | LinkCol `<ul>` | `space-y-3` | `space-y-[10px]` |
  | Bottom bar | `pb-8 pt-6 text-[13px]` | `pb-7 pt-5 text-[11.5px]` |

  Files: `src/components/Footer.tsx`
  Verify: `npm run build` — 0 errors. Footer is visibly more compact at 100%.

---

- [ ] 9. **`src/pages/Home.tsx` — section spacing and inline element sizes**

  Home composes sections with Tailwind spacing classes (`pb-14 sm:pb-20`,
  `pb-16`, `!p-10 sm:!p-14`, `text-3xl sm:text-5xl`, `h-16 w-16`,
  `size={30}`, etc.). Reduce all by 0.9.

  **Exact changes (`src/pages/Home.tsx`):**

  | Element | Old value | New value |
  |---|---|---|
  | Ticker `<div>` | `py-3` | `py-[11px]` |
  | Ticker text | `text-sm` | `text-[12.5px]` |
  | Stats section | `pb-6 pt-10` | `pb-5 pt-9` |
  | Token info section | `pb-8` | `pb-7` |
  | Utilities section | `pb-14 sm:pb-20` | `pb-[50px] sm:pb-[72px]` |
  | Utility cards grid | `gap-5` | `gap-[18px]` |
  | Utility `<UtilityCard3D>` | `delay={i * 90}` | unchanged (animation timing, not size) |
  | Utility icon | `<Icon size={26}` | `<Icon size={23}` |
  | Tokenomics section `<SectionTitle>` | (handled by item 5) | — |
  | Tokenomics section bottom margin | `mt-8 text-center` (button row) | `mt-7` |
  | Burn section | `section` class → handled by item 1 | — |
  | Burn section button row | `mt-8 text-center` | `mt-7` |
  | Recent tx section | `pb-14 sm:pb-20` | `pb-[50px] sm:pb-[72px]` |
  | Ecosystem section | `pb-16` | `pb-[58px]` |
  | Ecosystem `AnimatedCard` | `!p-10 sm:!p-14` | `!p-9 sm:!p-[50px]` |
  | Ecosystem orbs | `h-72 w-72` (×2) | `h-[259px] w-[259px]` |
  | Ecosystem icon badge | `h-16 w-16 rounded-2xl` | `h-[58px] w-[58px] rounded-xl` |
  | Ecosystem icon | `<Zap size={30}` | `<Zap size={27}` |
  | Ecosystem `<p>` eyebrow | (uses `.eyebrow` class — OK) | — |
  | Ecosystem `<h2>` | `text-3xl sm:text-5xl` | `text-[27px] sm:text-[45px]` |
  | Ecosystem icon badge | `mb-4` | `mb-[14px]` |
  | Ecosystem `<p>` body | `text-base sm:text-lg` | `text-[13.5px] sm:text-base` |
  | Ecosystem `<p>` body | `mt-4 max-w-2xl` | `mt-[14px] max-w-[36rem]` |
  | Ecosystem CTA `<a>` | `mt-8 inline-flex` | `mt-7 inline-flex` |
  | Ecosystem CTA icon | `<ExternalLink size={14}` | `<ExternalLink size={13}` |

  Files: `src/pages/Home.tsx`
  Verify: `npm run build` — 0 errors. All Home page sections are proportionally tighter.

---

## Mobile responsiveness preservation

All existing `sm:`, `md:`, `lg:` breakpoints are preserved throughout — only
the base values and their responsive variants are scaled down proportionally.
No breakpoint boundaries themselves are changed. The existing
`@media (max-width:639px)` and `@media (max-width:1023px)` blocks in
`index.css` are also scaled in item 1.

## What is intentionally NOT changed

- `html { font-size: 100%; }` — do not touch
- `zoom` or `transform: scale()` on any root element
- Colors, gradients, animations, border radii on decorative elements
- Three.js canvas `width/height` attributes beyond what item 1 sets (the
  canvas `ResizeObserver` already matches the CSS container)
- Other pages (`Burn & Liquidity`, `Whitepaper`, `Token`, `About`) — the
  original request scopes this fix to the Home page only; the shared changes
  in `index.css` and `Bits.tsx`/`Footer.tsx`/`Navbar.tsx` will improve those
  pages as a side effect
