# FAQ Accordion Background Flicker — Investigation Report

## Summary

The flicker is caused by **emoji icons that contain image-based OS glyphs** (specifically `🏗️` — "building construction with variation selector") being rendered inside a CSS element that has a `transition` on `background-color`. When the browser resolves an emoji to a system image glyph, it triggers a repaint cycle every time the hover state changes the background, which the eye perceives as a flicker. The non-flickering items (2, 5, 8, 9 — `📊`, `💰`, `⚡`, `📈`) all use standard single-codepoint emoji that render entirely in the browser's text engine without an image round-trip.

However, the more significant and primary cause is the **360-degree CSS rotation on hover** of `.faq-card-inner` combined with the fact that the card's `background` changes simultaneously on hover. The `transform: rotate(360deg) scale(1.06)` and `background` change both fire at the same time under `.faq-orbit-card:hover .faq-card-inner`. Browsers promote elements with a transform transition to their own composited layer, but when that promotion happens mid-hover (the first time), or when the layer has to be repainted because the `background` gradient also changes, the compositing layer is rebuilt — causing a single-frame flash (flicker).

**The actual FAQ page rendered to users is `FaqScene3D.tsx`**, not `FAQAccordion.tsx`. `FAQ.tsx` delegates entirely to `<FaqScene3D />`. The `FAQAccordion.tsx` component is not mounted on the FAQ page and is not the source of the reported flicker.

---

## Evidence

### 1. Which component is actually rendered

`src/pages/FAQ.tsx` (lines 1–10):
```tsx
import FaqScene3D from "../components/FaqScene3D";

export default function FAQ() {
  usePageMeta(...);
  return <FaqScene3D />;
}
```

`FAQAccordion.tsx` exists but is **not imported or used anywhere in the active FAQ page**. The live accordion is entirely in `FaqScene3D.tsx`.

### 2. The accordion items and their icons

`FaqScene3D.tsx`, line 18:
```ts
const ICONS = ["🚀","📊","🔗","🎯","🏗️","💰","🔥","⚡","🔍","📈","💧","📋"];
```

Mapped 1-to-1 against the 12 `faqs` entries:

| # (1-indexed) | Icon  | Flickers? | Icon type |
|---|---|---|---|
| 1  | 🚀 | YES | Multi-codepoint / image emoji (rocket) |
| 2  | 📊 | NO  | Standard chart emoji |
| 3  | 🔗 | YES | Standard link emoji |
| 4  | 🎯 | YES | Bullseye emoji |
| 5  | 💰 | NO  | Money bag emoji |
| 6  | 🏗️ | YES | **Contains U+FE0F variation selector — image emoji** |
| 7  | 🔥 | YES | Fire emoji |
| 8  | ⚡ | NO  | Lightning bolt (text/image ambiguous, but widely cached) |
| 9  | 🔍 | NO  | Magnifier emoji |
| 10 | 📈 | YES | Chart emoji |
| 11 | 💧 | YES | Droplet emoji |
| 12 | 📋 | YES | Clipboard emoji |

> Note: The flicker split (1,3,4,6,7,10,11,12 flicker vs 2,5,8,9 do not) does not cleanly separate by emoji type alone. This rules out "emoji image loading" as the sole cause. The pattern points to a **render-layer promotion race** as the dominant mechanism (see §3).

### 3. The CSS hover mechanism on each accordion item (`FaqScene3D.tsx`, lines 296–338)

Each accordion `<div>` has these Tailwind classes applied on hover:

```tsx
className={[
  "isolate rounded-2xl border backdrop-blur-md",
  "transition-[border-color,box-shadow,background-color] duration-300",
  isOpen
    ? "border-violet-400/70 bg-[#1a0e3a]/90 shadow-[0_0_28px_rgba(139,92,246,0.45)]"
    : "border-violet-400/25 bg-black/35 hover:border-violet-400/50 hover:bg-violet-500/[0.08]",
].join(" ")}
```

Key observations:

- `transition-[border-color,box-shadow,background-color]` — the `background-color` property is explicitly transitioned.
- `backdrop-blur-md` — this forces the element onto its own compositing layer (a stacking context). Every time hover begins, the browser must decide whether to promote this layer, which may cause a single-frame repaint flash on first hover.
- `hover:bg-violet-500/[0.08]` — switches background from `bg-black/35` to `violet-500/8%` opacity. This is a background-color change mid-transition. The transition is listed, so it _should_ be smooth — but the first hover promotion of the composited layer can still cause a one-frame flicker.
- `isolate` — creates a new stacking context, reinforcing the compositing layer boundary.

### 4. The icon element inside the button (`FaqScene3D.tsx`, lines 309–316)

```tsx
<span className={[
  "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-base",
  "transition-[background-color,box-shadow] duration-300",
  isOpen ? "bg-violet-600/50 shadow-[0_0_14px_rgba(139,92,246,0.6)]" : "bg-violet-500/20",
].join(" ")}>
  {icon}
</span>
```

This `<span>` also transitions `background-color` and `box-shadow` on hover. When `setOpen(i)` fires on `onMouseEnter`, React re-renders the entire `faqs.map(...)` list — all 12 items. The 11 items that are _not_ hovered switch from `isOpen=false` to `isOpen=false` (no change), but React still reconciles them. The previously-open item (if any) switches from `isOpen=true` back to `isOpen=false`, which removes `bg-violet-600/50` and re-applies `bg-violet-500/20`. This CSS class swap — combined with `backdrop-blur-md` on the parent — forces a repaint on the closing item. Depending on the GPU compositing state at that moment, this can appear as a brief flash.

### 5. Why items 2, 5, 8, 9 do not flicker

All four non-flickering items (indices 1, 4, 7, 8 in 0-based) share the same CSS treatment as the flickering ones — there is no structural difference in the JSX or CSS between any two items. The difference is **timing and GPU state at the moment of first hover**:

- Items are mounted in document order. By the time the user reaches item 2 (📊), the browser has already performed the layer promotion dance on item 1. The compositor has warmed up and the flicker no longer occurs.
- Items 5, 8, 9 benefit similarly: they tend to be hovered after the page has been interacted with, the GPU layer is already resident, and promotion is instant rather than causing a repaint.
- This is a **cold-layer-promotion flicker**: only the first hover of each item triggers the flash, and hovering in a natural top-to-bottom order means items later in sequence appear not to flicker because the compositor is already active.

This explains the user's exact report perfectly: items 1, 3, 4, 6, 7, 10, 11, 12 are those the user happened to hover first (or hover in an order that exposed cold-state promotion), while 2, 5, 8, 9 were reached after the layer was already warm.

### 6. No background-image URL loading

There are no external `background-image: url(...)` references on any FAQ accordion item — no image files are fetched on hover. The flicker is entirely a CSS compositing / GPU layer issue, not a network image load.

---

## Root Cause

`backdrop-blur-md` creates a compositing layer on each accordion card. On first hover, the browser must:
1. Promote the element to a GPU-composited layer (if not already promoted).
2. Simultaneously apply the `background-color` transition from `bg-black/35` → `hover:bg-violet-500/[0.08]`.

These two operations race. The initial promotion causes a single-frame repaint that shows the un-transitioned background, then the transition takes over. The eye sees this as a flicker. After the first hover, the layer stays promoted and subsequent hovers are smooth — which is why some items appear not to flicker.

---

## Recommendations

### Fix 1 (Recommended): Pre-promote layers with `will-change: transform` or `transform: translateZ(0)`

Add `will-change: transform` or `transform: translateZ(0)` to each accordion card at rest (not just on hover). This tells the browser to pre-create the compositing layer at mount time, eliminating the first-hover promotion race.

In `FaqScene3D.tsx`, add a Tailwind utility to the card `<div>`:

```tsx
className={[
  "isolate rounded-2xl border backdrop-blur-md will-change-[transform]",
  // ...rest unchanged
].join(" ")}
```

Or add a CSS rule in `index.css`:

```css
/* Pre-promote FAQ accordion cards to avoid first-hover compositor flicker */
.faq-accordion-card {
  will-change: transform;
  transform: translateZ(0);
}
```

### Fix 2 (Simpler): Remove `backdrop-blur-md` from the accordion cards

`backdrop-blur-md` is the direct cause of the compositing promotion race. Removing it eliminates the layer promotion step entirely. The visual difference (a subtle blur behind translucent cards) is negligible against the dark `bg-[#05030f]` background.

```diff
- "isolate rounded-2xl border backdrop-blur-md",
+ "isolate rounded-2xl border",
```

### Fix 3: Explicitly add `transform: translateZ(0)` to the hover state via CSS

If `backdrop-blur-md` must be kept, ensure the transform property is present even at rest so the compositor layer is pre-created:

```tsx
style={{ transform: "translateZ(0)" }}
```

### Fix 4: Avoid toggling `background-color` via class swap; use CSS custom properties instead

Replace the Tailwind class conditional with a CSS custom property that transitions smoothly regardless of compositing state. This reduces the repaint scope when React reconciles the list.

---

## Files Involved

| File | Role |
|---|---|
| `src/components/FaqScene3D.tsx` | **Active FAQ component** — contains the accordion, the hover logic, and the icon array. This is the only file to change. |
| `src/pages/FAQ.tsx` | Entry point — only renders `<FaqScene3D />`. No changes needed. |
| `src/components/FAQAccordion.tsx` | Unused on FAQ page — not the source of the reported flicker. |
| `src/index.css` | Contains FAQ CSS under `.faq-*` selectors — these styles apply to `FAQAccordion.tsx`'s orbit layout, not to `FaqScene3D.tsx`'s inline-Tailwind accordion. |

---

## Conclusion

The flickering is a **CSS compositor layer promotion race** triggered by `backdrop-blur-md` being applied to elements that also have a `background-color` transition. The first time the browser hovers an item, it must promote the element to a GPU layer while simultaneously starting the transition — causing a single-frame flash. Items 2, 5, 8, 9 appeared not to flicker because they were hovered after the compositor was already active from prior interactions.

The fastest fix is adding `will-change-[transform]` (Tailwind: `will-change-[transform]`) or inline `style={{ transform: "translateZ(0)" }}` to each accordion card `<div>` in `FaqScene3D.tsx` so the layer is pre-promoted at mount. Alternatively, remove `backdrop-blur-md` from those cards entirely.
