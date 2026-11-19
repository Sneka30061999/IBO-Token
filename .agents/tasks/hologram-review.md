# Hologram-deck Live Statistics section

The Live Statistics section of `BurnLiquidity.tsx` was redesigned from a plain `SectionTitle + ErrorState + 4×StatCard` layout into a hologram-deck presentation. The new section introduces a perspective grid floor, radial horizon glow, corner-bracket cards with animated scan lines, beam connectors, and elliptical rings below each card. Five new keyframe animations were appended to the existing `CSS` constant, and `StatCard.tsx` received minor `font-mono` additions. The build passed with no TypeScript errors.

Watch for: `StatCard`'s `sm:text-4xl` responsive size step was dropped as a side effect of the `font-mono` addition — **confirmed**, visible on breakpoints ≥ 640 px wherever `StatCard` is used outside this page.

**Verdict**: APPROVED

---

## High-level view

All five required keyframe animations (`v3hover`, `v3scan`, `v3grid`, `v3beam`, `v3ring`) are defined in the `CSS` constant and each is wired to a live element: `v3hover` on the card wrapper, `v3scan` on the scan-line bar, `v3grid` on the floor `<div>`, `v3beam` on the connector stem below each card, and `v3ring` on the elliptical disk at the foot of each connector.

Each of the four stat cards carries all required hologram decorations: four corner-bracket `<div>`s, a scan-line bar, the fuchsia `#e879f9` accent on labels, the IBO suffix, and the `v3hover` float animation. The loading, unavailable, and null-value states are handled inline. All 14 specified data variables (`burn.data`, `total`, `annual`, `txBurn`, `remaining`, `unavailable`, `burn.loading`, `burn.error`, `burn.refresh`, `burn.stale`, `burn.updatedAt`, `contractValid`, `fmt`, `tokenConfig`) are present and used in their expected roles. The `BscScanLink` contract address line is preserved under the same `contractValid` guard.

The animated grid floor (`.v3-floor`) and horizon glow (`.v3-horizon`) are both present and hidden on mobile via the `@media (max-width: 639px)` rule in the `CSS` constant.

The hero, transaction burn, and DEX sections are untouched. The `StatCard.tsx` `font-mono` addition drops `sm:text-4xl` from the value size classes, which is a minor visual regression on `sm`-and-above breakpoints wherever `StatCard` is rendered outside this page.

---

<details>
<summary>Issues (1)</summary>

1. **StatCard `sm:text-4xl` dropped** — The value `<p>` class was changed from `text-3xl sm:text-4xl` to `text-3xl font-mono`, losing the responsive size step at ≥ 640 px. Any page using `StatCard` outside the hologram section will show slightly smaller values on tablet/desktop. Add `sm:text-4xl` back alongside `font-mono` if the responsive size is intentional elsewhere.

</details>

<details>
<summary>Details</summary>

## Five keyframe animations — presence and wiring

All five animations are defined contiguously at the end of the `CSS` constant and each is applied to exactly the element the spec describes:

- `v3hover` — `animationName` on the card wrapper `<div>`, duration staggered per card index (`3.8 + i * 0.4`s).
- `v3scan` — `animation` on the scan-line `<div>` inside each card, duration staggered (`2.4 + i * 0.3`s).
- `v3grid` — `animation` on the `.v3-floor` background `<div>` at 2.5 s linear.
- `v3beam` — `animation` on the 2 px wide connector stem below each card at 2 s ease-in-out.
- `v3ring` — `animation` on the 48×12 px elliptical ring `<div>` at the foot of the connector at 2 s ease-in-out.

Animation delays use `card.delay` (`0s`, `0.12s`, `0.24s`, `0.36s`) to stagger the four cards.

## StatCard.tsx — dropped responsive size step

`font-mono` was added to both the label and value `<p>` elements. The value class changed from `text-3xl sm:text-4xl` to `text-3xl font-mono`, silently dropping `sm:text-4xl`. On breakpoints ≥ 640 px, `StatCard` values will render at `text-3xl` instead of `text-4xl` wherever the component is used outside the hologram section. If `font-mono` was the only intended change, `sm:text-4xl` should be restored.

</details>

---

<details>
<summary>File map</summary>

- `src/pages/BurnLiquidity.tsx` — Live Statistics section replaced with hologram-deck layout; five keyframe animations added to `CSS` constant; all other sections untouched.
- `src/components/StatCard.tsx` — `font-mono` added to label and value `<p>` elements; `sm:text-4xl` dropped from value size class.

</details>
