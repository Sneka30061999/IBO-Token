# Implementation Plan — Browser Zoom & Responsive Layout Fixes

## Context discovered during exploration

**Build system:** Vite + React 18 + TypeScript. Build: `npm run build` (tsc -b && vite build). Dev: `npm run dev`.  
**Styling:** Tailwind CSS utility-first. Global CSS in `src/index.css`. Tailwind config in `tailwind.config.js`.  
**No test suite** — verification is TypeScript compile + visual inspection in the dev server.  
**Verification command for every item:** `npm run build` (must exit 0, no TypeScript errors).

---

## Root-cause summary (what was actually found)

After reading every file listed in the brief, the zoom problems trace to these concrete causes:

| Page / component | Specific problem |
|---|---|
| **BurnLiquidity.tsx — CoinScene** | `width: 460, height: 580` hardcoded in px on the outer wrapper; inner platform discs also use large fixed px (`width: 420`, `marginLeft: -210`, etc.) |
| **BurnLiquidity.tsx — YearTable** | No explicit width issues but sits in a 3-col grid `lg:grid-cols-[1fr_auto_1fr]` where the `auto` CoinScene column forces the whole grid wider than the viewport |
| **BurnLiquidity.tsx — hero grid** | Same 3-col grid — CoinScene is `hidden lg:block` but its sibling columns have no max-width so at 100% zoom on a 1280 px screen the grid is wider than comfortable |
| **Tokenomics.tsx — TokenomicsSpiral** | `max-w-[620px]` for the canvas but the section wrapper `section` has `px-4` which is correct; the legend `ul` has no max-width so at 1024-px desktop the two-column layout is tight |
| **FaqScene3D / RoadmapScene3D** | `h-screen w-full` — these fill 100 vh at every zoom level; this is intentional and correct. No fix needed. |
| **About.tsx — Utilities section** | `py-20` (80 px top + bottom) is excessively tall. The coin-slide section has `lg:min-h-[calc(100vh-4rem)]` which is fine, but `mb-14` on the utilities header is too big. |
| **Home.tsx — About section gap** | `AboutCoinReveal` uses `height: 300vh` scroll track. After it, the utilities section has `pb-14 sm:pb-20` which produces large gap. The section padding is the gap. |
| **index.css — `.section`** | `py-12 sm:py-[72px]` — 72 px section padding on sm+ contributes to vertical overflow on pages with many sections at 100 % zoom. |
| **index.css — `.coin-canvas`** | `height: 468px` fixed on desktop. At 80 % zoom this shrinks to 374 px which fits, but at 100 % it is 468 px and the hero section expands accordingly. The hero `min-height: 100vh` is fine, but the coin canvas fixed height combined with `min-h-[88vh]` on the content makes the section very tall. |
| **BurnLiquidity — CoinScene px sizes** | The entire CoinScene component is built with fixed inline px values (`width: 460`, `height: 580`, dozens of `left`, `top`, `width`, `height` values). It has `hidden lg:block` so it is not shown below lg. The fix is to constrain it within a percentage-based wrapper and scale it via CSS transform. |
| **AllocationCards desktop** | `h-[420px]` on the horizontal accordion. Fine on its own, but on Tokenomics page it stacks with the spiral chart and large section padding, making the page very long. |
| **FanDeckCards rc-scene** | `height: 306px; max-width: 810px` — fixed px but wrapped in `container-x` which is `w-full`. The arrow positions use `calc(50% - 432px)` which puts arrows off-screen at <864 px viewport. At 100 % zoom on 1280 px desktop this is fine. The mobile override at `≤1023px` fixes it. No change needed here. |

---

## Plan

- [ ] 1. **Fix global `.section` padding — reduce from `72px` to `clamp`-based value**  
      The `.section` utility class in `src/index.css` currently uses `py-12 sm:py-[72px]`.  
      Replace with `py-10 sm:py-16` (Tailwind values: 40 px mobile, 64 px sm+).  
      This directly reduces the cumulative vertical overflow across every page that uses `.section` (Home, Whitepaper, Tokenomics, BurnLiquidity).  
      Files: `src/index.css`  
      Verify: `npm run build` exits 0.

- [ ] 2. **Fix About section gap — reduce oversized padding in Home.tsx utilities section**  
      In `src/pages/Home.tsx`, the Utilities section uses `pb-14 sm:pb-20` (56 px / 80 px).  
      Change to `pb-10 sm:pb-14` (40 px / 56 px).  
      The subsequent Tokenomics preview section uses class `section` — already addressed in item 1.  
      The subsequent Burn mechanism section also uses `section` — same fix.  
      The Recent transactions section uses `pb-14 sm:pb-20` — change to `pb-10 sm:pb-14`.  
      The Ecosystem section uses `pb-16` — change to `pb-10 sm:pb-14`.  
      These reductions eliminate the "too much spacing" complaint on the About coin reveal section and the sections that follow it.  
      Files: `src/pages/Home.tsx`  
      Verify: `npm run build` exits 0.

- [ ] 3. **Fix BurnLiquidity CoinScene — make the CSS coin animation scale-based instead of fixed px**  
      `CoinScene` in `src/pages/BurnLiquidity.tsx` has an outer `div` with inline style `{ width: 460, height: 580, perspective: 1300 }` — these are raw px numbers that do not shrink with the viewport.  
      Strategy: wrap CoinScene in a responsive outer div, and apply a CSS scale transform to shrink the entire fixed-px composition proportionally.  
      
      Specific changes inside `BurnLiquidity.tsx`:  
      a. Add a new `<div>` wrapper around the returned JSX of `CoinScene` with class `w-full max-w-[460px] mx-auto overflow-hidden` and a responsive scale via inline style: `style={{ transform: 'scale(var(--coin-scale,1))', transformOrigin: 'top center' }}`.  
      b. Add a `<style>` block (or extend the existing `CSS` const) with:  
      ```css
      :root { --coin-scale: 1; }
      @media (max-width: 1279px) { :root { --coin-scale: 0.85; } }
      @media (max-width: 1023px) { :root { --coin-scale: 0.72; } }
      ```  
      c. The outer container div that is `hidden lg:block` already hides CoinScene on mobile/tablet, so the scale only matters for `lg+`.  
      d. Because CoinScene is `hidden lg:block` and placed in an `auto`-column of a 3-col grid, the `auto` column was making the whole row wide. Change the hero grid from `lg:grid-cols-[1fr_auto_1fr]` to `lg:grid-cols-[1fr_minmax(0,460px)_1fr]` so the coin column has a bounded max width instead of `auto`.  
      Files: `src/pages/BurnLiquidity.tsx`  
      Verify: `npm run build` exits 0.

- [ ] 4. **Fix BurnLiquidity — reduce hero section padding**  
      The hero `<section>` inside BurnLiquidity uses `container-x py-14 sm:py-20` (56 px / 80 px top+bottom).  
      Change to `container-x py-10 sm:py-14` (40 px / 56 px).  
      The transaction burn section below uses `py-14` — change to `py-10 sm:py-14`.  
      The live stats grid section uses `section` class — improved by item 1.  
      Files: `src/pages/BurnLiquidity.tsx`  
      Verify: `npm run build` exits 0.

- [ ] 5. **Fix Tokenomics — reduce AllocationCards horizontal accordion height and section padding**  
      `AllocationCards.tsx` has the desktop accordion at `h-[420px]`. At 100 % zoom on common 1366 px screens this is fine, but combined with large section padding above/below the page requires 80 % zoom. Reduce to `h-[380px]`.  
      In `src/pages/Tokenomics.tsx`, the `<section className="pb-16">` wrapping AllocationCards should become `<section className="pb-10 sm:pb-14">`.  
      `TokenomicsSpiral` already uses `py-10` — no change.  
      Files: `src/components/AllocationCards.tsx`, `src/pages/Tokenomics.tsx`  
      Verify: `npm run build` exits 0.

- [ ] 6. **Fix About section — reduce utilities section padding and header margin**  
      In `src/pages/About.tsx`:  
      a. The Utilities section wrapper uses `py-20 sm:px-8 lg:px-12 xl:px-16` — change `py-20` to `py-12 sm:py-16`.  
      b. The utilities header `mb-14` should be `mb-8 sm:mb-10`.  
      c. The `ul` grid `gap-y-14` should be `gap-y-10 sm:gap-y-12`.  
      d. The coin-slide section `py-8 sm:py-12` and `lg:min-h-[calc(100vh-4rem)]` are already reasonable; keep them.  
      Files: `src/pages/About.tsx`  
      Verify: `npm run build` exits 0.

- [ ] 7. **Fix Whitepaper — tighten section padding**  
      `src/pages/Whitepaper.tsx` wraps the content in `<section className="section">`.  
      `PageHeader` in `src/components/Bits.tsx` applies the `.section` class (confirmed by reading the file) — no hardcoded large py there.  
      After item 1 reduces `.section` to `py-10 sm:py-16` the Whitepaper page will gain ~32 px per occurrence (header section + content section = two `.section` usages). That alone brings it from needing 80 % zoom to fitting at 100 %.  
      No additional changes needed in Whitepaper.tsx or Bits.tsx beyond item 1.  
      Files: none beyond item 1  
      Verify: `npm run build` exits 0.

- [ ] 8. **Fix global overflow safety net — ensure body/html never overflow-x**  
      `src/index.css` already applies `overflow-x-hidden` on `body` via `@apply`.  
      Confirm `html` element also has `overflow-x: hidden` to cover scroll-triggered by transforms or absolutely-positioned elements.  
      Add `overflow-x: hidden;` to the `html` rule (currently only has `scroll-behavior` and `font-size`).  
      Also add `max-width: 100%` to the `canvas` rule to reinforce the existing one.  
      Files: `src/index.css`  
      Verify: `npm run build` exits 0.

- [ ] 9. **Fix HeroSection min-height — cap at calc instead of fixed 88vh**  
      In `src/components/HeroSection.tsx`, the hero content wrapper uses:  
      `min-h-[88vh]` with `py-24 sm:py-28 lg:py-32` (96 px / 112 px / 128 px top+bottom padding).  
      At 100 % zoom the content is comfortable. The issue is not the hero itself but pages that require 80 % zoom — those are BurnLiquidity/Tokenomics/Whitepaper which are addressed above.  
      Reduce hero content py to `py-20 sm:py-24 lg:py-28` to give a ~8 % vertical height win on the home page.  
      Files: `src/components/HeroSection.tsx`  
      Verify: `npm run build` exits 0.

- [ ] 10. **Fix Footer CTA band — reduce oversized padding**  
       The CTA band in `src/components/Footer.tsx` uses `px-6 py-8 sm:px-12 sm:py-12` (top+bottom 32 px / 48 px).  
       Change to `px-5 py-6 sm:px-10 sm:py-9` (24 px / 36 px top+bottom).  
       The `max-w-[1200px]` container on the footer is fine for desktop.  
       Files: `src/components/Footer.tsx`  
       Verify: `npm run build` exits 0.

- [ ] 11. **Verify SectionTitle mb-10 in Bits.tsx — reduce if needed**  
       `SectionTitle` in `src/components/Bits.tsx` uses `mb-10` (40 px) below each section heading.  
       This is used on Home, Tokenomics, and BurnLiquidity. Combined with `.section` padding, 40 px is reasonable.  
       However since `mb-10` appears on every SectionTitle and `.section` padding is already `py-10`, the two stack.  
       Change `mb-10` to `mb-6 sm:mb-8` in `SectionTitle` to reduce stacking.  
       `PageHeader` in the same file uses `.section` class — no hardcoded large py found; item 1 fixes it.  
       Files: `src/components/Bits.tsx`  
       Verify: `npm run build` exits 0.

- [ ] 12. **Responsive check — mobile and tablet breakpoints**  
       After all above changes, verify these Tailwind responsive classes are intact (do not break them during edits):  
       - `container-x` responsive px: `px-4 sm:px-8 lg:px-12 xl:px-16` — do not alter  
       - `RoadmapScene3D` and `FaqScene3D` use `h-screen w-full` — intentional full-viewport pages, do not change  
       - `FanDeckCards` rc-arrow mobile override at `≤1023px` — do not alter  
       - `AllocationCards` mobile stacked variant `md:hidden` / `hidden md:flex` — do not alter  
       - `AboutCoinReveal` coin size uses `clamp(180px, 27vw, 306px)` — already responsive, do not alter  
       - `CoinStackChart` passed `height` prop defaults to 620 — this is in a `.csc-wrap` with `width: 100%` so it is fine  
       No code changes in this item — it is a checklist for the implementer to verify during edits 11 and earlier.  
       Files: none (review only)  
       Verify: `npm run build` exits 0 and dev server shows no horizontal scrollbar at 320 px, 768 px, 1024 px, 1280 px viewport widths.

---

## File change summary

| File | Changes |
|---|---|
| `src/index.css` | `.section` padding reduced; `html` gets `overflow-x: hidden` |
| `src/pages/Home.tsx` | Reduce `pb-14 sm:pb-20` → `pb-10 sm:pb-14` on 3 sections; `pb-16` → `pb-10 sm:pb-14` on ecosystem section |
| `src/pages/BurnLiquidity.tsx` | CoinScene wrapper + scale fix; hero grid column change; hero py reduced; transaction burn section py reduced |
| `src/pages/Tokenomics.tsx` | Allocation section `pb-16` → `pb-10 sm:pb-14` |
| `src/components/AllocationCards.tsx` | Desktop accordion height `h-[420px]` → `h-[380px]` |
| `src/pages/About.tsx` | Utilities section `py-20` → `py-12 sm:py-16`; header margin + grid gap reduced |
| `src/components/HeroSection.tsx` | Hero content py reduced slightly |
| `src/components/Footer.tsx` | CTA band py reduced |
| `src/components/Bits.tsx` | `SectionTitle` `mb-10` → `mb-6 sm:mb-8` |

## Constraints enforced throughout
- Colors, fonts, animations, border radii, and visual design untouched  
- All padding/sizing changes use Tailwind utility classes  
- Inline styles used only where Tailwind cannot express the value (CoinScene CSS variable scale)  
- Responsive breakpoints (mobile 320–767, tablet 768–1023, desktop 1024+) maintained or improved  
- No Three.js canvas sizes changed — they all use ResizeObserver and size to their container  
- `overflow-x-hidden` on body kept; `html` added as safety net  
