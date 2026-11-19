# Implementation Plan — Responsive Fix: 100% Zoom at All Breakpoints

## Root-cause Analysis

The site requires browser zoom-out because of a layered font-size scaling system in `src/index.css`:

1. **`html` base font-size staircase** — sets 81.25%→84.375%→87.5%→90% (up to 14.4 px at ≥1280 px). This shrinks every rem-based Tailwind utility site-wide, reproducing the 90%-zoom appearance at 100%.
2. **`.page-scale-80` class** — adds a further 88.9% reduction on `BurnLiquidity.tsx`, `Tokenomics.tsx`, and `Whitepaper.tsx`, reproducing the 80%-zoom appearance.
3. **`.faq-scene-root { font-size: 75% }`** — a further reduction on the FAQ page, reproducing the 75%-zoom appearance.
4. **`CoinScene` inline `transform: scale(0.889)`** — the 3-D coin inside `BurnLiquidity.tsx` has an additional explicit scale-down baked into its wrapper's inline style.

**The fix:** Remove the font-size staircase from `html`. Remove `.page-scale-80` and `.faq-scene-root` shrink rules. Remove the inline `transform: scale(0.889)`. Then audit each page for any element that is now too large and apply proper Tailwind responsive classes.

---

## Changes by File

---

### File 1 — `src/index.css`

**What to change:**

1. **Remove the entire `html` font-size staircase.** Replace the current block:

```css
html {
  scroll-behavior: smooth;
  /*
   * The design looks correct at 90% browser zoom (≈14.4px base).
   * ...
   */
  font-size: 81.25%; /* 13px mobile default */
}
@media (min-width: 640px)  { html { font-size: 84.375%; } } /* 13.5px */
@media (min-width: 1024px) { html { font-size: 87.5%;   } } /* 14px   */
@media (min-width: 1280px) { html { font-size: 90%;     } } /* 14.4px — exact 90% zoom match */
```

with:

```css
html {
  scroll-behavior: smooth;
  font-size: 100%; /* 16px — browser default; no zoom simulation */
}
```

2. **Remove the `.faq-scene-root` font-size rule.** Delete:

```css
/* FAQ page: cancel the zoom difference so the layout matches the 75%-zoom appearance at 100% zoom */
.faq-scene-root {
  font-size: 75%;
}
```

3. **Remove the `.page-scale-80` rule and its media-query cascades.** Delete:

```css
.page-scale-80 {
  font-size: 88.9%; /* 90% × 0.889 ≈ 80% zoom equivalent */
}
@media (min-width: 640px)  { .page-scale-80 { font-size: 88.9%; } }
@media (min-width: 1024px) { .page-scale-80 { font-size: 88.9%; } }
@media (min-width: 1280px) { .page-scale-80 { font-size: 88.9%; } }
```

Also delete the comment block above `.page-scale-80` that explains the per-page scaling rationale.

4. **Fix HeroSection heading sizes.** The `.hero-stat-num` is currently `1.1rem`. At 16 px base this is fine. No change needed here — the headings in HeroSection use Tailwind classes `text-5xl sm:text-6xl lg:text-[4.5rem]` which are proportional and correct.

5. **Tune the `.acr-heading` clamp.** Currently `clamp(28px, 5.5vw, 68px)`. At 16 px base this renders large but is clamped. Reduce the max to prevent oversize at large viewports:
   - Change to `clamp(24px, 4vw, 52px)`.

6. **Navbar mobile breakpoint in `.rc-arrow-left/.rc-arrow-right`** — no change needed; the CSS already uses responsive overrides.

---

### File 2 — `src/pages/BurnLiquidity.tsx`

**What to change:**

1. **Remove `className="page-scale-80"` from the page root `<div>`.** Change:
   ```tsx
   <div className="page-scale-80">
   ```
   to:
   ```tsx
   <div>
   ```

2. **Remove `transform: "scale(0.889)"` from the `CoinScene` wrapper `<div>`.** The CoinScene has a fixed 460×580 wrapper with `transform: "scale(0.889)"` and `transformOrigin: "top center"`. Remove those two properties from the inline style so it reads:
   ```tsx
   style={{ width: 460, height: 580, perspective: 1300, perspectiveOrigin: "50% 38%" }}
   ```
   The coin is already `hidden lg:block`, so it only shows on desktop where there is room. Its fixed 460 px width fits comfortably within a 1024 px+ column.

3. **Reduce hero heading font sizes so the text does not overflow at 100% zoom.** In the left-panel heading, change:
   ```tsx
   className="font-display text-5xl font-extrabold leading-none tracking-tight sm:text-6xl"
   ```
   to:
   ```tsx
   className="font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl"
   ```
   And the big-number `<span>`:
   ```tsx
   className="font-display text-5xl font-extrabold tabular-nums sm:text-6xl"
   ```
   to:
   ```tsx
   className="font-display text-4xl font-extrabold tabular-nums sm:text-5xl"
   ```
   And in the transaction burn card `<h2>`:
   ```tsx
   className="font-display text-4xl font-extrabold tabular-nums"
   ```
   to:
   ```tsx
   className="font-display text-3xl font-extrabold tabular-nums sm:text-4xl"
   ```

---

### File 3 — `src/pages/Tokenomics.tsx`

**What to change:**

1. **Remove `className="page-scale-80"` from the page root `<div>`.** Change:
   ```tsx
   <div className="page-scale-80">
   ```
   to:
   ```tsx
   <div>
   ```
   The `AllocationCards` desktop accordion is `h-[420px]` fixed height; at 16 px base this renders at a natural size and is fine.

---

### File 4 — `src/pages/Whitepaper.tsx`

**What to change:**

1. **Remove `className="page-scale-80"` from the page root `<div>`.** Change:
   ```tsx
   <div className="page-scale-80">
   ```
   to:
   ```tsx
   <div>
   ```
   The Whitepaper page is content-light (a card with a logo and a paragraph), so removing the scale class has no layout side-effects.

---

### File 5 — `src/components/FaqScene3D.tsx`

**What to change:**

1. **Remove `faq-scene-root` from the section `className`.** Change:
   ```tsx
   <section className="faq-scene-root relative h-screen w-full overflow-x-hidden overflow-y-auto bg-[#020504] font-sans text-white">
   ```
   to:
   ```tsx
   <section className="relative h-screen w-full overflow-x-hidden overflow-y-auto bg-[#020504] font-sans text-white">
   ```
   The Three.js canvas is sized to `100% × 100%` of its wrapper (via `width: 100%!important; height: 100%!important`), so removing the font-size shrink does not affect the WebGL canvas size. The accordion text inside uses fixed rem sizes that will now render at the browser's default 16 px base.

2. **Increase the accordion panel font sizes for readability at 16 px base.** The `.faq-mob-q` is `.88rem` and `.faq-mob-answer` is `.84rem` — these are already set in `index.css` and are fine at 16 px. No change needed in the TSX.

---

### File 6 — `src/components/HeroSection.tsx`

**What to change:**

At 16 px base, `text-5xl` = 48 px, `sm:text-6xl` = 60 px, `lg:text-[4.5rem]` = 72 px. These are proportionally correct and suit the full-bleed hero. However, on mobile the hero content needs max-width constraint.

1. **Tighten the hero text max-width on mobile.** The `max-w-[500px]` on the content `<div>` works for desktop but is wider than some mobile viewports. Change:
   ```tsx
   <div className="flex max-w-[500px] flex-col items-start">
   ```
   to:
   ```tsx
   <div className="flex w-full max-w-[500px] flex-col items-start">
   ```
   (Adding `w-full` ensures the div doesn't overflow its container on narrow screens.)

2. **Adjust hero padding for mobile.** The `py-24 sm:py-28 lg:py-32` on the content wrapper is correct — Tailwind mobile-first so this is fine.

---

### File 7 — `src/components/Navbar.tsx`

The Navbar already implements a full mobile drawer (`< 820px`) with a hamburger button. No structural changes are required. However, at 16 px base the `font-mono text-xs uppercase tracking-widest` on the nav renders slightly larger than before, which is correct.

**No changes required.**

---

### File 8 — `src/components/FanDeckCards.tsx`

The 3-D carousel uses fixed px widths in JS (`spreadX` up to 310 px, card width 260 px in CSS). At 16 px base these are unchanged — the CSS already has mobile overrides in `index.css` (`.rc-card` shrinks to 220 px at ≤639 px and 190 px at ≤400 px). The arrows use `rc-arrow-left { left: calc(50% - 480px) }` on desktop — this is a large negative calc that may push arrows off-screen at ≤960 px viewports.

**What to change** (in `src/index.css`, the `.rc-arrow-left/.rc-arrow-right` desktop rule):

Currently:
```css
.rc-arrow-left  { left:  calc(50% - 480px); }
.rc-arrow-right { right: calc(50% - 480px); }
```

This is only problematic on viewports narrower than 960 px where `50% - 480px` goes negative. The existing `@media (max-width: 1023px)` override already sets `left: 0.5rem` / `right: 0.5rem`, which is correct. **No additional change needed** — the override already fires at ≤1023 px.

---

### File 9 — `src/pages/About.tsx`

The About page has a coin-slide section with `lg:min-h-[calc(100vh-4rem)]`. At 16 px base this is fine — `100vh` is unaffected by font-size. The comment "All sizes scaled to ~75% of original" refers to the design intent, not to any CSS scaling rule; the actual JSX uses Tailwind responsive classes and no font-size tricks.

**No changes required.**

---

### File 10 — `src/components/AllocationCards.tsx`

The desktop accordion is `h-[420px]`. At 16 px base this is a natural 420 px — taller than before (at 90% zoom it was effectively ~378 px). This is fine; the content fits. The mobile stacked variant is unrestricted height.

**No changes required.**

---

### File 11 — `src/components/Footer.tsx`

Footer uses `max-w-[1200px]` container, standard grid layouts, and no fixed heights. At 16 px base all text scales naturally. The CTA band `px-6 py-8 sm:px-12 sm:py-12` is proportional. No overflow issues.

**No changes required.**

---

## Summary of All Changes

| File | What changes |
|---|---|
| `src/index.css` | Remove `html` font-size staircase (restore to `font-size: 100%`). Remove `.faq-scene-root { font-size: 75% }`. Remove `.page-scale-80` rule and its 4 media-query repeats. Reduce `.acr-heading` clamp max from 68 px to 52 px. |
| `src/pages/BurnLiquidity.tsx` | Remove `page-scale-80` from root div. Remove `transform: scale(0.889)` and `transformOrigin` from `CoinScene` wrapper. Reduce hero heading classes from `text-5xl sm:text-6xl` → `text-4xl sm:text-5xl`. Reduce big number from `text-5xl sm:text-6xl` → `text-4xl sm:text-5xl`. Reduce txn burn h2 to `text-3xl sm:text-4xl`. |
| `src/pages/Tokenomics.tsx` | Remove `page-scale-80` from root div. |
| `src/pages/Whitepaper.tsx` | Remove `page-scale-80` from root div. |
| `src/components/FaqScene3D.tsx` | Remove `faq-scene-root` class from section. |
| `src/components/HeroSection.tsx` | Add `w-full` to hero content div. |

---

## Verification

```
# 1. Build — must produce zero TypeScript errors
npm run build

# 2. Dev server — open in browser at 100% zoom and check each route
npm run dev
# Check: /         (Home)         — layout fills viewport, no overflow
# Check: /burn-liquidity          — text fits, coin scene visible on desktop
# Check: /whitepaper              — card layout centred and readable
# Check: /tokenomics              — allocation chart and cards at natural size
# Check: /about                   — coin slide fits in one viewport
# Check: /faq                     — 3-D scene fills screen, accordion readable
# Check: mobile 375px width — Navbar hamburger visible, all pages single-column
# Check: tablet 768px width — two-column layouts where expected
```
