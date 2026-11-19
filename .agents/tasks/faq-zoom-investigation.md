# FAQ Zoom Layout Investigation

## Summary

The root cause is a **compound scaling mismatch** between how `FaqScene3D` sizes itself and the `html { font-size }` override in `index.css`. The `section` container uses `min-h-screen` (100vh), but its inner `FaqAccordionPanel` uses Tailwind rem-based spacing — which is now scaled down by the `font-size: 90%` rule on `<html>`. The WebGL canvas (`FaqCanvas`) is `absolute inset-0`, meaning it fills its parent; but that parent's computed height at 100% browser zoom is taller (more raw pixels) than the same viewport at 75% zoom. The layout in `FaqAccordionPanel` was designed and visually calibrated assuming the browser was running at 75% zoom — where the native font-size is `16px × 0.75 = 12px`, close to the `90% → 14.4px` root that `index.css` sets. At 100% zoom the browser uses `16px` as the base, so rem units resolve larger, accordion items overflow, and the absolute-positioned canvas no longer covers the same visual region the layout expects.

There is a secondary problem: `FaqCanvas` renders a Three.js scene whose camera and hero group positions are hardcoded in world-space units derived from the initial viewport ratio. The `ResizeObserver` on the mount div updates the renderer size but does not recompute perspective or hero placement for the larger viewport at 100% zoom, so the 3D scene visually lands in a different region of the canvas than it did at 75% zoom.

---

## Evidence

### 1. File: `src/index.css` — the global font-size scaling

Lines 6–17 (approximated from the file read):

```css
html {
  font-size: 81.25%; /* 13px mobile default */
}
@media (min-width: 1280px) { html { font-size: 90%; } } /* 14.4px — exact 90% zoom match */
```

The comment says "matches 90% zoom exactly." At 100% browser zoom, `1rem = 16px`. Tailwind's `min-h-screen` resolves to `100vh` (a viewport unit, not rem-relative), so the section is always full viewport height — but every `py-14`, `px-12`, `gap-8`, `text-4xl`, etc. inside `FaqAccordionPanel` resolves in rem, which the browser computes as `16px × 0.90 = 14.4px` per rem at ≥1280px. At 75% zoom the viewport is zoomed out 25%, so the browser's internal base font-size is `16px × 0.75 = 12px`; then the `90%` rule gives `12px × 0.90 = 10.8px` per rem — tighter spacing. The design was calibrated against that tighter figure.

**Effect at 100% zoom:** rem-based paddings and font sizes are 33% larger than the developer intended, pushing accordion items further down the page and past the bottom of the WebGL canvas.

---

### 2. File: `src/components/FaqScene3D.tsx` — the section and canvas structure

**`FaqScene3D` export (the outermost shell), lines ~270–278:**

```tsx
export default function FaqScene3D() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#020504] font-sans text-white">
      <FaqCanvas />
      <FaqAccordionPanel />
    </section>
  );
}
```

- `position: relative` — stacking context root.
- `min-h-screen` = `100vh` — viewport-relative, not rem-relative. At any zoom level this is exactly the visible viewport height.
- `overflow-hidden` — clips any child that escapes the section.

**`FaqCanvas` (the WebGL layer), lines ~192–208:**

```tsx
return (
  <div
    ref={ref}
    className="absolute inset-0"
    style={{
      willChange: "transform",
      isolation: "isolate",
      transform: "translateZ(0)",
    }}
  />
);
```

- `position: absolute; inset: 0` — covers the full section from `0,0` to the section's computed width/height.
- Because the section is `relative`, the canvas div fills it perfectly. **This positioning is correct on its own.** The canvas fills whatever height the section grows to.

**`FaqAccordionPanel` root div, lines ~215–218:**

```tsx
<div className="relative z-10 mx-auto flex min-h-screen w-full flex-col gap-8 px-4 py-10 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-12 lg:py-14 xl:px-16">
```

Key classes and their resolution at 100% zoom on a ≥1280px screen (rem = 14.4px since html is 90%):
- `gap-8` = `2rem` = 28.8px
- `py-14` → becomes `lg:py-14` = `3.5rem` = 50.4px top+bottom padding each
- `px-12` → `lg:px-12` = `3rem` = 43.2px
- `min-h-screen` = `100vh` again (redundant with the section, but forces the panel to also be at least full-screen tall)

The panel itself is `z-10` (stacked above the canvas), `relative` (new stacking context). This is correct — the UI sits above the WebGL.

**The accordion right column (`lg:w-[50%]`), lines ~247–250:**

```tsx
<div
  className="w-full pb-24 lg:mt-10 lg:w-[50%]"
  onMouseLeave={() => setOpen(-1)}
>
```

- `pb-24` = `6rem` = 86.4px bottom padding. This pushes content up but the rem increase at 100% zoom still makes this resolve 25% taller than intended.
- `lg:mt-10` = `2.5rem` = 36px. At 75% zoom this was effectively 27px.

**Heading column (`lg:w-[40%]`), lines ~222–236:**

```tsx
<h2 className="mt-4 text-4xl font-extrabold italic leading-tight tracking-tight sm:text-5xl lg:text-6xl">
```

`lg:text-6xl` = `3.75rem`. At 100% zoom: `3.75 × 14.4px = 54px`. At 75% zoom (`12px × 0.90 = 10.8px`): `3.75 × 10.8px = 40.5px`. The heading is 33% taller at 100% zoom, which pushes the entire left column down and can collide with or overflow past the WebGL scene boundaries.

---

### 3. The Three.js camera and hero placement — hardcoded positions

**`FaqCanvas` useEffect, layout logic lines ~132–138:**

```ts
const layout = () => {
  const wide = W() / H() > 1.1;
  hero.position.set(wide ? -5.2 : 1.5, wide ? -1.2 : 3.2, wide ? 0 : -4);
  hero.scale.setScalar(wide ? 1 : 0.5);
};
```

This sets the 3D hero's world-space position based solely on whether the aspect ratio is > 1.1. It does **not** account for the actual pixel dimensions of the mount div. The camera is a `PerspectiveCamera` at `position.set(0, 1, 15)` with `fov=45` — fixed values. When the mount div is taller at 100% zoom (because rem padding in adjacent elements forces the section taller than `100vh`), the renderer resizes via `ResizeObserver` and updates `cam.aspect` and `ren.setSize`, but the camera's position and the hero's world-space offset stay the same. The hero group appears in a different portion of the viewport (shifted toward the top-left at wider/taller aspect ratios).

**`ResizeObserver` callback lines ~146–148:**

```ts
const ro = new ResizeObserver(() => {
  cam.aspect = W() / H(); cam.updateProjectionMatrix(); ren.setSize(W(), H()); layout();
});
```

`layout()` is called, but it only switches between two hard-coded positions based on aspect ratio, so incremental changes in the section height between zoom levels produce the same layout branch with the same world-space coordinates — the hero does not proportionally track the visible area.

---

### 4. The `overflow-hidden` clip

The section has `overflow-hidden`. If `FaqAccordionPanel` grows taller than `100vh` (due to rem-sized content being too large at 100% zoom), the section's height expands because the section's `min-h-screen` is a minimum, not a maximum. The canvas `div` (`absolute inset-0`) fills `0` to the section's `offsetHeight`, which is now taller than the viewport. The Three.js renderer fills that same tall canvas div. At 75% zoom the section stays close to exactly `100vh` because the rem units happen to produce the same result as the developer saw in a 75%-zoomed browser.

---

### 5. App.tsx — the layout wrapper

```tsx
<div className="flex min-h-screen flex-col">
  <Navbar />
  <main className="flex-1">
    <FAQ /> {/* → FaqScene3D */}
  </main>
  <Footer />
</div>
```

The `Navbar` has a fixed/sticky height that occupies real pixels. The `main` element is `flex-1`, so it fills the remaining height after the navbar. The FAQ `section` inside main has `min-h-screen` — this means the section's minimum height is `100vh`, not `100% of main`. On a tall page the section may start below the navbar, creating an extra offset. The canvas fills the section, not the viewport, so if `main` starts below a ~64px navbar, the canvas begins 64px below the top of the viewport. At 75% zoom that 64px was visually ~48px equivalent, so the design may have been calibrated assuming the smaller offset.

---

## Root Cause Summary

| Cause | Mechanism | Why it appears at 100% but not 75% zoom |
|---|---|---|
| **html font-size override** | `index.css` sets `font-size: 90%` targeting 90% zoom. At 100% zoom, rem resolves to 14.4px instead of the 10.8px the developer actually sees at 75% zoom | Rem-based spacing is 33% larger than designed, pushing accordion past canvas bottom |
| **Hardcoded Three.js positions** | Hero group set to fixed world-space coordinates by aspect ratio only | Different section heights at zoom levels change the aspect ratio / pixel area the camera sees, shifting the visual landing position of the 3D objects |
| **`min-h-screen` on both section and accordion panel** | Section floor = 100vh; accordion panel floor = 100vh; with rem padding and large heading fonts the panel exceeds 100vh at 100% zoom | Causes the section to grow taller than 100vh, stretching the WebGL canvas beyond the viewport and misaligning the background animation relative to the visible content |
| **Navbar height offsets** | The `section` starts below the navbar; canvas begins there too | At 75% zoom the navbar is visually shorter, so the canvas and accordion appear better aligned |

---

## Recommendations (do not implement — diagnosis only)

### Fix 1: Correct the `html font-size` to target 100% zoom instead of 90%

**File:** `src/index.css`

Change the ≥1280px breakpoint from `90%` to `100%` (which keeps `1rem = 16px`, the browser default) or remove the `font-size` overrides entirely and instead scale down the specific elements on the FAQ page that need smaller sizing.

```css
/* Current — wrong reference zoom */
@media (min-width: 1280px) { html { font-size: 90%; } }

/* Option A: remove all overrides (rem = 16px at all sizes, let Tailwind handle it) */
/* Option B: use a viewport-clamped size that scales smoothly */
html { font-size: clamp(13px, 1.1vw, 16px); }
```

If other pages are designed around the 90% assumption and look correct, change only the FAQ page by wrapping `FaqScene3D`'s section in a local font-size reset, e.g.:

```tsx
<section ... style={{ fontSize: "100%" }}>
```

### Fix 2: Remove `min-h-screen` from `FaqAccordionPanel`

**File:** `src/components/FaqScene3D.tsx`, `FaqAccordionPanel` root div

The accordion panel does not need `min-h-screen` because the parent section already guarantees full-height via `min-h-screen`. Removing it from the panel prevents the panel's rem-based content from forcing the section taller than the viewport.

Change:
```tsx
className="relative z-10 mx-auto flex min-h-screen w-full ..."
```
To:
```tsx
className="relative z-10 mx-auto flex min-h-full w-full ..."
```
Or simply remove `min-h-screen` from that div entirely.

### Fix 3: Use `height: 100%` instead of `min-h-screen` on the section, and constrain accordion height

**File:** `src/components/FaqScene3D.tsx`, `FaqScene3D` section

Change the section from `min-h-screen` to `h-screen overflow-y-auto` so the section is exactly one viewport tall and scrolls rather than growing indefinitely. The canvas (`absolute inset-0`) will then always match exactly one viewport, and the accordion content scrolls within it. This matches the visual reference at 75% zoom where everything fit in one viewport.

### Fix 4: Adjust Three.js layout positions to be proportional to the mount size

**File:** `src/components/FaqScene3D.tsx`, `FaqCanvas` `layout()` function

Replace the binary `wide` check with proportional positioning tied to the mount's pixel dimensions:

```ts
const layout = () => {
  const w = W(), h = H(), r = w / h;
  const wide = r > 1.1;
  // Scale hero X offset proportionally so it stays at the same fraction of the view
  const xOffset = wide ? -(w / h) * 2.9 : 1.5;
  hero.position.set(xOffset, wide ? -1.2 : 3.2, wide ? 0 : -4);
  hero.scale.setScalar(wide ? 1 : 0.5);
};
```

This ensures that as the viewport grows or shrinks (across zoom levels), the hero tracks proportionally rather than jumping between two fixed positions.

### Fix 5: Account for the navbar height in the section

**File:** `src/components/FaqScene3D.tsx`

The `section` uses `min-h-screen` but renders inside a flex column below the Navbar. Use `calc(100vh - var(--navbar-height, 64px))` or `h-[calc(100vh-4rem)]` to subtract the navbar height so the canvas exactly fills the visible area. Alternatively, set `position: fixed; inset: 0` on the canvas and `z-index: 0`, which makes it always fill the whole viewport independently of the section's box-model.

---

## File / Symbol Reference

| File | Key symbol | Line (approx.) | Issue |
|---|---|---|---|
| `src/index.css` | `html { font-size: 90% }` at `@media (min-width: 1280px)` | ~15 | Root cause of rem size mismatch |
| `src/components/FaqScene3D.tsx` | `FaqScene3D` section: `min-h-screen overflow-hidden` | ~272 | Section grows beyond viewport when rem content is large |
| `src/components/FaqScene3D.tsx` | `FaqCanvas` div: `absolute inset-0` | ~198 | Correct positioning, but canvas height follows section height |
| `src/components/FaqScene3D.tsx` | `FaqAccordionPanel` root: `min-h-screen` | ~215 | Redundant min-height causes section height expansion |
| `src/components/FaqScene3D.tsx` | `layout()` in FaqCanvas useEffect | ~133 | Hardcoded world-space positions, not viewport-proportional |
| `src/App.tsx` | `<main className="flex-1">` | ~31 | Navbar height shifts section start point below viewport top |
