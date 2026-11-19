# Hologram Deck — Build Result

## Status: SUCCESS

## Changes made

### `src/pages/BurnLiquidity.tsx`
- Appended five new keyframe animations (`v3hover`, `v3scan`, `v3grid`, `v3beam`, `v3ring`) plus a mobile media query to the existing `CSS` constant.
- Replaced the entire `{/* ── Live statistics ── */}` section (the `<section className="pb-14">` block containing `SectionTitle`, `ErrorState`, and four `StatCard` components) with the new hologram-deck `<section>` containing:
  - Animated perspective grid floor
  - Radial horizon glow
  - Centred header (eyebrow + heading + subtitle)
  - Amber warning banner (shown only when `unavailable && burn.error`)
  - 4 hologram stat cards with corner brackets, scan lines, beam lines, and elliptical rings
  - Stale cache notice and contract link (unchanged logic from original)
- The `{/* ── DEX detailed card ── */}` section and everything else in the file is unchanged.

### `src/components/StatCard.tsx`
- Added `font-mono` to the label `<p>` class.
- Changed the value `<p>` class from `text-3xl sm:text-4xl` to `text-3xl font-mono`.

## Build result
`npm run build` completed successfully (exit code 0). TypeScript compilation (`tsc -b`) passed with no errors. The Three.js `sRGBEncoding` warnings in the Vite output are pre-existing issues unrelated to this change.
