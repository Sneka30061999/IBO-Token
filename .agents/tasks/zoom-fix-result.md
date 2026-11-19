# Zoom & Responsive Layout Fixes — Result Summary

## Iteration context

This is the **second iteration** (review findings addressed). The first iteration implemented the full plan from `zoom-fix-plan.md`. This iteration fixes the three findings from `zoom-fix-review.json`.

---

## Review findings fixed (this iteration)

### Finding 1 — CoinScene scale does not shrink layout height
**Problem:** `transform: scale(var(--coin-scale,1))` is a visual-only operation. The wrapper element still occupied 580 px of block height in the grid regardless of scale value.

**Fix:** Replaced the CSS variable + `transform: scale()` approach with a `.bl-coin-scaler` CSS class that uses the `zoom` property. `zoom` affects layout in Chromium (which is the target browser — Chrome), so the grid row height now shrinks proportionally with the coin visual.

```css
.bl-coin-scaler { zoom: 1; }
@media (max-width: 1279px) { .bl-coin-scaler { zoom: 0.85; } }
@media (max-width: 1023px) { .bl-coin-scaler { zoom: 0.72; } }
```

The CoinScene wrapper was updated from:
```tsx
<div className="w-full max-w-[460px] mx-auto overflow-hidden" style={{ transform: "scale(var(--coin-scale,1))", transformOrigin: "top center" }}>
```
to:
```tsx
<div className="bl-coin-scaler w-full max-w-[460px] mx-auto overflow-hidden">
```

### Finding 2 — Hologram Deck and DEX card sections not reduced
**Problem:** BurnLiquidity's "Hologram Deck" (Live Statistics) section retained `py-14` (56 px × 2) and the DEX card section retained `pb-16` (64 px), leaving BurnLiquidity with more cumulative padding than the other pages.

**Fix:**
- Hologram Deck section: `py-14 px-4 sm:px-6` → `py-10 sm:py-14 px-4 sm:px-6`
- DEX card section: `pb-16` → `pb-10 sm:pb-14`

### Finding 3 — `--coin-scale` CSS variable scoped to `:root` inside a component style tag
**Problem:** The variable was injected globally via `:root` media-query rules, leaking an implementation detail into the global CSS scope and creating risk of future collision.

**Fix:** Eliminated the `:root { --coin-scale }` rules entirely by switching to the `zoom`-based `.bl-coin-scaler` class (see Finding 1 fix). No CSS variable on `:root` is needed anymore.

---

## All files changed across both iterations

| File | Changes |
|---|---|
| `src/index.css` | `.section` padding reduced (`py-14 sm:py-20` → `py-10 sm:py-16`); `html` gains `overflow-x: hidden`; background gradients and fixed heights scaled down proportionally |
| `src/pages/Home.tsx` | Utilities, recent-transactions, and ecosystem-banner section paddings reduced (`pb-14 sm:pb-20` → `pb-10 sm:pb-14`; `pb-16` → `pb-10 sm:pb-14`) |
| `src/pages/BurnLiquidity.tsx` | CoinScene wrapped in `.bl-coin-scaler` zoom-based scaler (layout-aware); hero grid column bounded (`auto` → `minmax(0,460px)`); hero py reduced; transaction-burn py reduced; Hologram Deck py reduced; DEX card pb reduced; global CSS variable removed |
| `src/pages/Tokenomics.tsx` | Allocation section `pb-16` → `pb-10 sm:pb-14` |
| `src/pages/About.tsx` | Utilities section `py-20` → `py-12 sm:py-16`; header margin `mb-14` → `mb-8 sm:mb-10`; grid gap `gap-y-14` → `gap-y-10 sm:gap-y-12` |
| `src/components/AllocationCards.tsx` | Desktop accordion height `h-[420px]` → `h-[380px]` |
| `src/components/HeroSection.tsx` | Hero content `py-24 sm:py-28 lg:py-32` → `py-20 sm:py-24 lg:py-28` |
| `src/components/Footer.tsx` | CTA band `py-8 sm:py-12` → `py-6 sm:py-9` |
| `src/components/Bits.tsx` | `SectionTitle` bottom margin `mb-10` → `mb-6 sm:mb-8` |

---

## Build result

`npm run build` exits 0 with no TypeScript errors. Pre-existing Three.js `sRGBEncoding` warnings are unrelated to these changes and were present before the work began.

## Constraints honored

- No colors, fonts, animations, border radii, or visual design changed
- All padding/sizing changes use Tailwind utility classes
- Inline styles used only for the CoinScene's existing fixed-px internal composition (unchanged from original design)
- Responsive breakpoints (mobile 320–767, tablet 768–1023, desktop 1024+) maintained
- `overflow-x: hidden` on both `html` and `body`
