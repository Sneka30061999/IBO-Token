# FAQ zoom fix: `h-screen` containment with scoped font-size downscale

The change makes the FAQ page at 100% browser zoom reproduce the layout the developer saw at 75% zoom. It does this through two mechanisms: a scoped `.faq-scene-root { font-size: 75% }` rule that cancels the rem-size inflation introduced by the global `html { font-size: 90% }` override, and a switch from `min-h-screen` to `h-screen overflow-y-auto` on the outer section so the WebGL canvas is always exactly one viewport tall rather than growing to match overflowing content. The Three.js `layout()` function gains a proportional x-offset formula (`-(r*2.9)`) so the hero group tracks the aspect ratio continuously rather than snapping between two fixed world-space positions.

**Watch for:**
- `overflow-hidden overflow-y-auto` on the section element — these conflict; whether `overflow-y: auto` wins over `overflow: hidden` depends on Tailwind's generated CSS order, not the JSX class order. (confirmed)
- The build result file referenced in the review criteria (`faq-zoom-build-result.md`) does not exist on disk; build success cannot be confirmed from evidence.

**Verdict**: NEEDS_CHANGES

---

## High-level view

The `.faq-scene-root { font-size: 75% }` rule is placed after the `@media (min-width: 1280px)` block and correctly inherits through the section's subtree. The global `html` font-size staircase (81.25% → 90%) is untouched, so no other page is affected. The class is applied only to the `FaqScene3D` section element.

The `h-screen` + `overflow-y-auto` combination is the right model for a full-bleed WebGL section with scrollable content, but the section also carries `overflow-hidden`. In Tailwind, `overflow-hidden` expands to `overflow: hidden` (sets both axes), while `overflow-y-auto` expands to `overflow-y: auto`. Because CSS specificity is equal for both, the stylesheet generation order determines which y-axis value wins. If Tailwind emits `overflow-hidden` after `overflow-y-auto`, the y-axis scrollbar is silently suppressed — the entire basis of the content-overflow fix.

The proportional x-offset `-(r*2.9)` correctly tracks the aspect ratio continuously. At `r = 16/9 ≈ 1.78` it resolves to `≈ -5.16`, close to the previously hardcoded `-5.2`, confirming the formula is calibrated to the same visual reference point.

---

<details>
<summary>Issues (2)</summary>

1. **`overflow-hidden` / `overflow-y-auto` conflict** — The section has both Tailwind classes. `overflow-hidden` compiles to `overflow: hidden`, which sets `overflow-y: hidden`. `overflow-y: auto` only wins if Tailwind emits the `overflow-y-auto` rule later in its generated stylesheet. This is not guaranteed and cannot be confirmed without inspecting the compiled CSS. If `overflow-hidden` wins, the section clips content at exactly `100vh` with no scroll affordance — FAQ items below the fold become inaccessible on shorter screens. Replace `overflow-hidden` with `overflow-x-hidden`; that sets only the x-axis and leaves y unambiguous.

2. **Missing build evidence** — `faq-zoom-build-result.md` does not exist at `.agents/tasks/`. The stated build evidence artifact is absent; a clean TypeScript/Vite build cannot be confirmed.

</details>

---

<details>
<summary>Details</summary>

## `overflow-hidden` / `overflow-y-auto` conflict

The `FaqScene3D` section element carries:

```
className="faq-scene-root relative h-screen w-full overflow-hidden overflow-y-auto bg-[#020504] font-sans text-white"
```

`overflow-hidden` compiles to `overflow: hidden` (shorthand, sets both x and y axes to hidden). `overflow-y-auto` compiles to `overflow-y: auto`. Because both rules have equal specificity (single class selector), the one that appears later in the generated stylesheet wins for the y-axis. In Tailwind v3's JIT output, `overflow-y-*` utilities are typically emitted after the `overflow-*` shorthand utilities, which would mean `overflow-y: auto` wins and scrolling works. However, this ordering is an implementation detail of Tailwind's stylesheet generation, not a CSS guarantee. The safe, unambiguous fix:

```diff
-className="faq-scene-root relative h-screen w-full overflow-hidden overflow-y-auto …"
+className="faq-scene-root relative h-screen w-full overflow-x-hidden overflow-y-auto …"
```

`overflow-x-hidden` sets only the x-axis without touching y. There is no ambiguity.

If `overflow-hidden` wins: the section clips content at `100vh`. On a viewport where the 12 FAQ questions plus heading and CTA don't fit in one screen at the scaled font size, everything below the fold is silently cut off — no error, no scroll, just unreachable content.

## Font-size math

At 100% browser zoom on a ≥1280 px screen, the `html` rule sets `1rem = 14.4 px`. The `faq-scene-root` override (`font-size: 75%`) makes `1rem = 14.4px × 0.75 = 10.8 px` inside the section — identical to what a 75%-zoomed browser computes (`16px × 0.75 × 0.90 = 10.8px`). The `h-screen` value on the section is `100vh` and is unaffected by the font-size inheritance; viewport units don't scale with `font-size`. All expected changes are present and structurally correct.

</details>

---

<details>
<summary>Files changed</summary>

| File | What changed |
|---|---|
| `src/index.css` | Added `.faq-scene-root { font-size: 75% }` after the `@media (min-width: 1280px)` block |
| `src/components/FaqScene3D.tsx` | `FaqAccordionPanel` root: removed `min-h-screen`; `FaqScene3D` section: replaced `min-h-screen` with `h-screen overflow-y-auto`, added `faq-scene-root`; `layout()`: replaced hardcoded `-5.2` with `-(r*2.9)` |

</details>
