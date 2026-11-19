# Implementation Plan — IBO Website Retheme (Black + Teal-Green)

## Palette Reference

| Token | Old | New |
|---|---|---|
| `--primary-bg` | `#050a14` / `#08111f` navy-950/900/800 | `#020504` |
| `--accent` | `#22d3ee` cyan-brand | `#2EE5A8` |
| `--accent-dark` | `#2dd4bf` teal | `#1aad7e` |
| `--accent-muted` | `rgba(34,211,238,0.10)` | `rgba(46,229,168,0.10)` |
| `--text-tinted` | `#a5f3fc` sky-100 | `#c8f7ea` |
| `--glow-strong` | `rgba(34,211,238,0.45)` | `rgba(46,229,168,0.45)` |
| `--glow-ambient` | `rgba(34,211,238,0.15)` | `rgba(46,229,168,0.15)` |
| `--magenta` | `#e83fc9` / `rgba(232,63,201,*)` | REMOVE / replace with accent |

**Constraints respected throughout:**
- `#ffffff` white text — untouched
- `#94a3b8` / `rgba(148,163,184,*)` slate/muted text — untouched
- `#4ade80` green status badges — untouched
- `#fbbf24` amber warnings — untouched
- `#ef4444` / `#f43f5e` red/rose errors — untouched
- Gold coin colours (`#f7931a`, `#ffc857`, `#FFE08A`, `conic-gradient(…#a8650f…)`) — untouched (IBO coin branding)
- Animation keyframe transforms — untouched; only colour values within keyframes changed
- Fonts, sizes, spacing, breakpoints, layout — untouched

---

## Step 1 — `tailwind.config.js`

**What to do:** Replace the violet/purple/cyan colour tokens and glow shadows with the new palette. Update the two animation keyframes (`pulseGlow`, `borderGlow` via CSS variables) that embed old `rgba(34,211,238,*)` and `rgba(232,63,201,*)` values.

**File:** `tailwind.config.js`

| Location | Old value | New value |
|---|---|---|
| `colors.navy.950` | `"#050a14"` | `"#020504"` |
| `colors.navy.900` | `"#08111f"` | `"#040908"` |
| `colors.navy.800` | `"#0c1a2e"` | `"#070f0c"` |
| `colors.navy.700` | `"#122540"` | `"#0d1a16"` |
| `colors.teal.deep` | `"#0a2a33"` | `"#061a12"` |
| `colors.cyan.brand` | `"#22d3ee"` | `"#2EE5A8"` |
| `colors.magenta` | `"#e83fc9"` | `"#2EE5A8"` (repurposed to accent, not used as a distinct colour) |
| `colors.rose.*` | keep 200/300/400/500 | keep unchanged (used for error/burn badges) |
| `boxShadow.glow` | `"0 0 40px -8px rgba(34,211,238,0.45)"` | `"0 0 40px -8px rgba(46,229,168,0.45)"` |
| `boxShadow.rose` | `"0 0 40px -8px rgba(232,63,201,0.4)"` | `"0 0 40px -8px rgba(46,229,168,0.25)"` |
| `keyframes.pulseGlow 0%,100%` | `rgba(34,211,238,0.3)` | `rgba(46,229,168,0.3)` |
| `keyframes.pulseGlow 50%` | `rgba(34,211,238,0.7)` → first value | `rgba(46,229,168,0.7)` |
| `keyframes.pulseGlow 50%` | `rgba(232,63,201,0.4)` → second value | `rgba(46,229,168,0.2)` |

**Verify:** `npm run build` — TypeScript + Vite build completes without errors.

---

## Step 2 — `src/index.css`

**What to do:** Replace every occurrence of the old cyan, purple/violet, navy, and magenta colour literals with new palette values. Touch only colour values, never layout, spacing, or keyframe transforms.

### 2a — Body background gradient
```
OLD: rgba(34, 211, 238, 0.12) … rgba(232, 63, 201, 0.08)
NEW: rgba(46, 229, 168, 0.10) … rgba(46, 229, 168, 0.05)
```

### 2b — `.card` gradient
```
OLD: from-[#0f3d49] to-[#0a2a33]
NEW: from-[#0a2a1f] to-[#061a12]
```
(these Tailwind class strings are in the `@layer components` block)

### 2c — `.card::before` top-line gradient
```
OLD: rgba(34, 211, 238, 0.6) … rgba(245, 196, 81, 0.5)
NEW: rgba(46, 229, 168, 0.6) … rgba(46, 229, 168, 0.3)
```

### 2d — `.btn-primary` gradient
```
OLD: from-cyan-400 to-teal-400 text-navy-950
NEW: from-[#2EE5A8] to-[#1aad7e] text-[#020504]
```

### 2e — `.btn-ghost` hover border
```
OLD: hover:border-cyan-400/50
NEW: hover:border-[#2EE5A8]/50
```

### 2f — `.gradient-text`
```
OLD: from-cyan-300 via-teal-200 to-fuchsia-400
NEW: from-[#2EE5A8] via-[#c8f7ea] to-[#2EE5A8]
```

### 2g — `.eyebrow`
```
OLD: text-cyan-300
NEW: text-[#2EE5A8]
```

### 2h — `.bg-grid`
```
OLD: rgba(34, 211, 238, 0.07) (×2 occurrences)
NEW: rgba(46, 229, 168, 0.07) (×2)
```

### 2i — Hero section

| Selector | Old | New |
|---|---|---|
| `.hero-vaultline` background | `#05020a` | `#020504` |
| `.hero-vl-left-fade` | `rgba(5,2,10,*)` → 4 occurrences | `rgba(2,5,4,*)` |
| `.hero-vl-bottom-fade` | `#05020a` | `#020504` |
| `.hero-top-glow` radial | `rgba(34,211,238,0.14)` | `rgba(46,229,168,0.14)` |
| `.hero-cursor` color | `#22d3ee` | `#2EE5A8` |
| `.hero-pill` border | `rgba(34,211,238,.22)` | `rgba(46,229,168,.22)` |
| `.hero-pill` bg | `rgba(34,211,238,.06)` | `rgba(46,229,168,.06)` |
| `.hero-pill` color | `#a5f3fc` | `#c8f7ea` |

### 2j — Footer utilities

| Selector | Old | New |
|---|---|---|
| `.footer-link:hover` | `color: #22d3ee` | `color: #2EE5A8` |
| `.footer-icon-btn:hover` border | `rgba(34,211,238,.3)` | `rgba(46,229,168,.3)` |
| `.footer-icon-btn:hover` color | `#22d3ee` | `#2EE5A8` |
| `.footer-icon-btn:hover` bg | `rgba(34,211,238,.06)` | `rgba(46,229,168,.06)` |

### 2k — Roadmap timeline colours

| Selector | Old | New |
|---|---|---|
| `.rm-line` gradient | `rgba(34,211,238,0.35)` / `0.2` / `0.1` | `rgba(46,229,168,0.35)` / `0.2` / `0.1` |
| `.rm-card::before` line | `rgba(34,211,238,0.5)` | `rgba(46,229,168,0.5)` |
| `.rm-badge-done` | `rgba(34,211,238,0.12)` bg · `#22d3ee` color | `rgba(46,229,168,0.12)` · `#2EE5A8` |
| `.rm-badge-active` | `rgba(167,139,250,0.12)` · `#c4b5fd` | `rgba(46,229,168,0.08)` · `#c8f7ea` |

### 2l — `card-premium` hover glow
```
OLD: rgba(34, 211, 238, 0.35) … rgba(232, 63, 201, 0.2)
NEW: rgba(46, 229, 168, 0.35) … rgba(46, 229, 168, 0.1)
```
Mobile active state:
```
OLD: rgba(34,211,238,0.45) … rgba(232,63,201,0.3)
NEW: rgba(46,229,168,0.45) … rgba(46,229,168,0.15)
```

### 2m — `card-premium::before` top line
```
OLD: rgba(34, 211, 238, 0.7) … rgba(167,139,250,0.4) wait — this is gold/amber variant
```
Check actual value: it reads `rgba(34, 211, 238, 0.7), rgba(245, 196, 81, 0.6)`.
```
NEW: rgba(46, 229, 168, 0.7), rgba(46, 229, 168, 0.35)
```

### 2n — Utility card CSS vars (`.utility-card-front`, `.utility-card-back`)
```
OLD: --accent-rgb: 34,211,238   --accent-rgba: rgba(34,211,238,0.25)
NEW: --accent-rgb: 46,229,168   --accent-rgba: rgba(46,229,168,0.25)
```

### 2o — Token info panel (`.tip-*`)

| Selector | Old | New |
|---|---|---|
| `.tip-section` bg | `rgba(15,61,73,0.6)` → `rgba(10,42,51,0.8)` | `rgba(6,26,18,0.6)` → `rgba(4,18,12,0.8)` |
| `.tip-section::before` | `rgba(34,211,238,0.5)` / `rgba(167,139,250,0.4)` | `rgba(46,229,168,0.5)` / `rgba(46,229,168,0.25)` |
| `.tip-symbol` | `color: #22d3ee` | `color: #2EE5A8` |
| `.tip-address-link` | `color: #22d3ee` | `color: #2EE5A8` |
| `.tip-address-link:hover` | `color: #67e8f9` | `color: #c8f7ea` |
| `.tip-footer-link` | `rgba(34,211,238,0.75)` | `rgba(46,229,168,0.75)` |
| `.tip-footer-link:hover` | `color: #22d3ee` | `color: #2EE5A8` |

### 2p — FAQ sections (`.faq-orb-body`, `.faq-orb-ring-*`, orbPulse)
The orb centre is currently purple/violet — retheme to teal-green:
```
OLD faq-orb-body bg: radial-gradient(… rgba(167,139,250,0.9) … rgba(109,40,217,0.95) … rgba(60,20,120,1) …)
NEW: radial-gradient(circle at 40% 36%, rgba(46,229,168,0.9) 0%, rgba(26,173,126,0.95) 50%, rgba(4,60,36,1) 100%)
```
```
OLD faq-orb-body box-shadow: 0 0 0 2px rgba(167,139,250,0.4), 0 0 36px rgba(167,139,250,0.65), 0 0 72px rgba(167,139,250,0.3)
NEW: 0 0 0 2px rgba(46,229,168,0.4), 0 0 36px rgba(46,229,168,0.65), 0 0 72px rgba(46,229,168,0.3)
```
```
OLD faq-orb-ring-1 border-color: rgba(167,139,250,0.5)
NEW: rgba(46,229,168,0.5)
OLD faq-orb-ring-2: rgba(167,139,250,0.25) → NEW: rgba(46,229,168,0.25)
OLD faq-orb-ring-3: rgba(167,139,250,0.12) → NEW: rgba(46,229,168,0.12)
```

**Verify:** `npm run build`

---

## Step 3 — `src/components/Navbar.tsx`

**What to do:** Replace all cyan/purple colour literals in the HOLO_CSS injected stylesheet string and in inline JSX styles.

| Location | Old | New |
|---|---|---|
| `HOLO_CSS` `.holo-glitch` text-shadow | `#f0f` / `#0ff` | `#2EE5A8` / `#c8f7ea` |
| `HOLO_CSS` `.holo-active` color | `#67e8f9` | `#2EE5A8` |
| `HOLO_CSS` `.holo-active` text-shadow | `rgba(34,211,238,.8)` | `rgba(46,229,168,.8)` |
| `gridFloorStyle` backgroundImage lines | `rgba(34,211,238,.27)` (×2) | `rgba(46,229,168,.27)` |
| `<nav>` border | `border-cyan-400/30` | `border-[#2EE5A8]/30` |
| `<nav>` bg gradient | `from-[#071a24] to-[#0a0615]` | `from-[#030f08] to-[#020504]` |
| `<nav>` box-shadow | `rgba(34,211,238,0.13)` / `rgba(34,211,238,0.3)` | `rgba(46,229,168,0.13)` / `rgba(46,229,168,0.3)` |
| scan beam | `via-cyan-400/20` | `via-[#2EE5A8]/20` |
| Logo badge gradient | `#22d3ee,#a855f7` | `#2EE5A8,#1aad7e` |
| Logo `text-cyan-300` | `text-cyan-300` | `text-[#2EE5A8]` |
| Logo `text-cyan-400` | `text-cyan-400` | `text-[#2EE5A8]` |
| BscScan link | `border-cyan-400/40` / `text-cyan-300` / `hover:bg-cyan-400/10` | `border-[#2EE5A8]/40` / `text-[#2EE5A8]` / `hover:bg-[#2EE5A8]/10` |
| Hamburger button | `border-cyan-400/40` / `text-cyan-300` / `hover:bg-cyan-400/10` | same swaps |
| Mobile drawer | `border-cyan-400/30` / `bg-[#0a0615]/95` | `border-[#2EE5A8]/30` / `bg-[#020504]/95` |
| Mobile drawer hover | `hover:bg-cyan-400/10` | `hover:bg-[#2EE5A8]/10` |
| Drawer BscScan link | same cyan swaps | same teal swaps |

**Verify:** `npm run build`

---

## Step 4 — `src/components/Footer.tsx`

The Footer uses only Tailwind utility classes inherited from `index.css` (`.footer-link`, `.footer-icon-btn`, `.btn-ghost`) — no hardcoded colour literals in the TSX itself. No changes needed to this file beyond what Step 2 provides.

**Verify:** Visual check after Steps 2+3 build.

---

## Step 5 — `src/components/Logo.tsx`

| Location | Old | New |
|---|---|---|
| `LogoMark` SVG linearGradient stop 0% | `#22d3ee` | `#2EE5A8` |
| `LogoMark` SVG linearGradient stop 100% | `#e83fc9` | `#1aad7e` |
| `Logo` wordmark subtitle | `text-cyan-400/60` | `text-[#2EE5A8]/60` |

**Verify:** `npm run build`

---

## Step 6 — `src/components/FaqScene3D.tsx`

**What to do:** Replace violet/purple colours in the Three.js scene, the accordion panel UI, and the button/badge colours. Do NOT change animation keyframe transform values.

### 6a — Three.js scene (inside `FaqCanvas` `useEffect`)

| Object | Old hex literal | New hex literal |
|---|---|---|
| `AmbientLight` | `0x8866cc` | `0x224433` |
| `PointLight p1` | `0x7a4dff` | `0x2EE5A8` (as `0x2ee5a8`) |
| `PointLight p2` | `0x20c8ff` | `0x2ee5a8` |
| `stars` PointsMaterial color | `0xcbb8ff` | `0xc8f7ea` |
| `pl1` (planet 1) mesh color | `0x2a1a6a` | `0x0a1a12` |
| `pl2` (planet 2) mesh color | `0x1a6fb0` | `0x0d3326` |
| `metalMat` base color | `0x1b1540` | `0x030f09` |
| `glowRing` MeshBasicMaterial color | `0x8a5cff` | `0x2ee5a8` |
| `glowRing` HSL animation `0.74` hue offset | `0.74` | `0.42` (teal-green hue ≈150°/360°=0.42) |
| `orbit1` color | `0xb06bff` | `0x2ee5a8` |
| `orbit2` color | `0x30d0ff` | `0x1aad7e` |
| `glassMat` color | `0x6fa8ff` | `0x2ee5a8` |
| `glassMat` emissive | `new THREE.Color(0x3a2cff)` | `new THREE.Color(0x0d6644)` |
| `eyMat` (robot eye) | `0x4de8ff` | `0x2ee5a8` |
| `earMat` color + emissive | `0x8a5cff` | `0x2ee5a8` |
| `coinRing` color | `0xb06bff` | `0x2ee5a8` |
| `eth` (crystal) color | `0x9a7bff` | `0x2ee5a8` |
| `eth` emissive | `new THREE.Color(0x5a3cff)` | `new THREE.Color(0x0d6644)` |
| `cubes` cubeMat color | `0x6f8cff` | `0x2ee5a8` |
| `cubes` cubeMat emissive | `new THREE.Color(0x3a4cff)` | `new THREE.Color(0x0d6644)` |
| `addEdges` default `color=0xc9b3ff` parameter | `0xc9b3ff` | `0xc8f7ea` |

### 6b — Accordion panel (inside `FaqAccordionPanel`)

| Element | Old classes/values | New classes/values |
|---|---|---|
| Eyebrow badge | `border-violet-400/40 bg-violet-500/15` | `border-[#2EE5A8]/40 bg-[#2EE5A8]/15` |
| `<h2>` gradient span | `from-violet-500 via-fuchsia-500 to-cyan-400` | `from-[#2EE5A8] via-[#c8f7ea] to-[#1aad7e]` |
| Accordion item open state | `border-violet-400/70 bg-[#1a0e3a]/90 shadow-[0_0_28px_rgba(139,92,246,0.45)]` | `border-[#2EE5A8]/70 bg-[#030f09]/90 shadow-[0_0_28px_rgba(46,229,168,0.45)]` |
| Accordion item closed hover | `hover:border-violet-400/50 hover:bg-violet-500/[0.08]` | `hover:border-[#2EE5A8]/50 hover:bg-[#2EE5A8]/[0.08]` |
| Accordion item default border | `border-violet-400/25` | `border-[#2EE5A8]/25` |
| Icon box open state | `bg-violet-600/50 shadow-[0_0_14px_rgba(139,92,246,0.6)]` | `bg-[#2EE5A8]/30 shadow-[0_0_14px_rgba(46,229,168,0.6)]` |
| Icon box default | `bg-violet-500/20` | `bg-[#2EE5A8]/20` |
| "+" circle open | `bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.7)]` | `bg-[#2EE5A8] text-[#020504] shadow-[0_0_12px_rgba(46,229,168,0.7)]` |
| Divider line | `via-violet-500/40` | `via-[#2EE5A8]/40` |
| CTA button | `border-violet-400/65 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:bg-violet-600 hover:shadow-[0_0_32px_rgba(139,92,246,0.7)]` | `border-[#2EE5A8]/65 bg-[#2EE5A8]/10 shadow-[0_0_20px_rgba(46,229,168,0.4)] hover:bg-[#1aad7e] hover:shadow-[0_0_32px_rgba(46,229,168,0.7)]` |
| Section bg | `bg-[#05030f]` | `bg-[#020504]` |

**Verify:** `npm run build`

---

## Step 7 — `src/components/FanDeckCards.tsx`

The card data already uses per-card accent colours defined as constants. The `Total Supply` card (cyan) and `Future DEX Allocation` card (teal) must be updated; the `Annual Burn` (rose/magenta) and `Transaction Burn` (gold) cards are kept as-is (these are semantic colours).

| Card | Field | Old | New |
|---|---|---|---|
| `Total Supply` | `grad` | `linear-gradient(145deg, #0d2235 0%, #0a1f2e 100%)` | `linear-gradient(145deg, #061a12 0%, #030f09 100%)` |
| `Total Supply` | `accent` | `"#22d3ee"` | `"#2EE5A8"` |
| `Total Supply` | `glow` | `"rgba(34,211,238,0.35)"` | `"rgba(46,229,168,0.35)"` |
| `Annual Burn` | `grad` | `linear-gradient(145deg, #2a0a1a 0%, #1a0510 100%)` | keep (rose burn colour) |
| `Annual Burn` | `accent` | `"#e83fc9"` | keep (rose burn colour) |
| `Transaction Burn` | all | gold | keep |
| `Future DEX Allocation` | `grad` | `linear-gradient(145deg, #001f1a 0%, #001310 100%)` | `linear-gradient(145deg, #061a12 0%, #030f09 100%)` |
| `Future DEX Allocation` | `accent` | `"#2dd4bf"` | `"#2EE5A8"` |
| `Future DEX Allocation` | `glow` | `"rgba(45,212,191,0.35)"` | `"rgba(46,229,168,0.35)"` |

**Verify:** `npm run build`

---

## Step 8 — `src/components/AnimatedCard.tsx`

| Location | Old | New |
|---|---|---|
| Default `glowColor` prop | `"rgba(34,211,238,0.15)"` | `"rgba(46,229,168,0.15)"` |
| Default gradient overlay | `"from-cyan-500/10 via-transparent to-rose-500/10"` | `"from-[#2EE5A8]/10 via-transparent to-[#1aad7e]/10"` |
| Shimmer border `background` | `rgba(34,211,238,0.6)` → first stop | `rgba(46,229,168,0.6)` |
| Shimmer border `background` | `rgba(232,63,201,0.5)` → second stop | `rgba(46,229,168,0.4)` |
| Shimmer border `background` | `rgba(245,196,81,0.5)` → third stop | `rgba(46,229,168,0.3)` |
| `ring-cyan-400/50` (pressed ring) | `ring-cyan-400/50` | `ring-[#2EE5A8]/50` |

**Verify:** `npm run build`

---

## Step 9 — `src/components/StatCard.tsx`

| Accent | Old value | New value |
|---|---|---|
| `cyan` text | `"text-cyan-300"` | `"text-[#2EE5A8]"` |
| `cyan` glow | `"from-cyan-400/20"` | `"from-[#2EE5A8]/20"` |
| `cyan` spotlight | `"rgba(34,211,238,0.18)"` | `"rgba(46,229,168,0.18)"` |
| `teal` text | `"text-teal-300"` | `"text-[#2EE5A8]"` |
| `teal` glow | `"from-teal-400/20"` | `"from-[#2EE5A8]/20"` |
| `teal` spotlight | `"rgba(20,184,166,0.18)"` | `"rgba(46,229,168,0.18)"` |

Rose and gold entries are semantic — keep unchanged.

**Verify:** `npm run build`

---

## Step 10 — `src/components/LiquidityCard.tsx`

| Location | Old | New |
|---|---|---|
| Icon badge bg | `bg-cyan-400/15` | `bg-[#2EE5A8]/15` |
| Icon badge text | `text-cyan-300` | `text-[#2EE5A8]` |
| Placeholder border | `border-cyan-400/20` | `border-[#2EE5A8]/20` |
| Placeholder bg | `bg-cyan-400/5` | `bg-[#2EE5A8]/5` |
| Placeholder heading | `text-cyan-200` | `text-[#c8f7ea]` |

**Verify:** `npm run build`

---

## Step 11 — `src/components/TransactionFilter.tsx`

| Location | Old | New |
|---|---|---|
| Active tab border | `border-cyan-400` | `border-[#2EE5A8]` |
| Active tab bg | `bg-cyan-400/15` | `bg-[#2EE5A8]/15` |
| Active tab text | `text-cyan-200` | `text-[#c8f7ea]` |

**Verify:** `npm run build`

---

## Step 12 — `src/components/RoadmapTimeline.tsx`

The `STATUS` config object hardcodes colour values for `done` and `active` states.

| Field | Old | New |
|---|---|---|
| `done.dot` | `"#22d3ee"` | `"#2EE5A8"` |
| `done.dotGlow` | `"rgba(34,211,238,0.6)"` | `"rgba(46,229,168,0.6)"` |
| `done.border` | `"rgba(34,211,238,0.35)"` | `"rgba(46,229,168,0.35)"` |
| `done.glow` | `"rgba(34,211,238,0.08)"` | `"rgba(46,229,168,0.08)"` |
| `active.dot` | `"#a78bfa"` | `"#2EE5A8"` |
| `active.dotGlow` | `"rgba(167,139,250,0.6)"` | `"rgba(46,229,168,0.5)"` |
| `active.border` | `"rgba(167,139,250,0.35)"` | `"rgba(46,229,168,0.3)"` |
| `active.glow` | `"rgba(167,139,250,0.07)"` | `"rgba(46,229,168,0.07)"` |

The CSS classes `.rm-badge-done` / `.rm-badge-active` are already updated in Step 2.

**Verify:** `npm run build`

---

## Step 13 — `src/components/BurnTimeline.tsx`

| Location | Old | New |
|---|---|---|
| Timeline left border | `border-rose-400/30` | keep (burn semantic) |
| Year dot border | `border-rose-400/60` | keep |
| Year dot inner | `bg-rose-400` | keep |
| Total row total value | `text-rose-300` | keep |

No changes needed — this component uses only rose (burn colour) which is exempt.

**Verify:** No action needed; confirmed by read.

---

## Step 14 — `src/components/UtilityCard3D.tsx`

The component receives `accentColor` / `accentRgba` as props — no hardcoded colours in the component itself. The defaults in `src/pages/Home.tsx` (`utilityThemes` array) need updating:

**File: `src/pages/Home.tsx`**

| Theme index | Field | Old | New |
|---|---|---|---|
| 0 (Utility 1) | `hex` | `"#22d3ee"` | `"#2EE5A8"` |
| 0 | `rgba` | `"rgba(34,211,238,0.22)"` | `"rgba(46,229,168,0.22)"` |
| 0 | `iconBg` | `"from-cyan-400/40 to-cyan-600/30 text-cyan-100"` | `"from-[#2EE5A8]/40 to-[#1aad7e]/30 text-[#c8f7ea]"` |
| 1 (Utility 2) | `hex` | `"#e83fc9"` | `"#2EE5A8"` (magenta → teal) |
| 1 | `rgba` | `"rgba(232,63,201,0.22)"` | `"rgba(46,229,168,0.22)"` |
| 1 | `iconBg` | `"from-rose-400/40 to-rose-600/30 text-rose-100"` | `"from-[#2EE5A8]/40 to-[#1aad7e]/30 text-[#c8f7ea]"` |
| 2 (Utility 3) | all | amber/gold | keep — semantic gold |
| 3 (Utility 4) | `hex` | `"#2dd4bf"` | `"#2EE5A8"` |
| 3 | `rgba` | `"rgba(45,212,191,0.22)"` | `"rgba(46,229,168,0.22)"` |
| 3 | `iconBg` | `"from-teal-400/40 to-teal-600/30 text-teal-100"` | `"from-[#2EE5A8]/40 to-[#1aad7e]/30 text-[#c8f7ea]"` |

Also in `Home.tsx`:

| Element | Old | New |
|---|---|---|
| Ticker band bg | `bg-teal-deep/60` | `bg-[#061a12]/60` |
| Ecosystem banner orb 1 | `bg-cyan-400/10` | `bg-[#2EE5A8]/10` |
| Ecosystem banner orb 2 | `bg-rose-500/10` | `bg-[#2EE5A8]/5` |
| Ecosystem icon badge bg | `from-cyan-400/30 to-rose-500/20` | `from-[#2EE5A8]/30 to-[#1aad7e]/20` |
| Ecosystem icon | `text-cyan-200` | `text-[#c8f7ea]` |
| AnimatedCard `glowColor` | `"rgba(232,63,201,0.2)"` | `"rgba(46,229,168,0.2)"` |
| AnimatedCard `gradient` | `"from-cyan-500/12 via-fuchsia-500/8 to-rose-500/12"` | `"from-[#2EE5A8]/12 via-[#1aad7e]/8 to-[#2EE5A8]/12"` |
| Tokenomics section bg | `bg-teal-deep/50` | `bg-[#061a12]/50` |

**Verify:** `npm run build`

---

## Step 15 — `src/pages/About.tsx`

| Location | Old | New |
|---|---|---|
| Coin slide section bg | `radial-gradient(ellipse_80%_60%_at_50%_40%,#2A1466_0%,#120A33_45%,#05030F_80%)` | `radial-gradient(ellipse_80%_60%_at_50%_40%,#043320_0%,#030f09_45%,#020504_80%)` |
| Top bar label `text-[#9F96C9]` | `#9F96C9` | `#94a3b8` (slate muted — keep consistent) |
| Vision label `text-[#FFC857]` | gold | keep (semantic gold for Vision) |
| ABT relationship label `text-[#35E8FF]` | `#35E8FF` | `#2EE5A8` |
| Body text `text-[#D2CBF0]` | lavender | `#c8f7ea` (tinted teal text) |
| Outer orbit dot | `bg-[#35E8FF] shadow-[0_0_10px_#35E8FF]` | `bg-[#2EE5A8] shadow-[0_0_10px_#2EE5A8]` |
| Utilities section bg | `bg-[#060a14]` | `bg-[#020504]` |
| Utilities background glow | `#0e2236` | `#061a12` |
| Utility coins cyan text | `text-xs font-bold uppercase tracking-[0.22em] text-cyan-300` | `text-[#2EE5A8]` |
| Spinning coin border | `border-cyan-200/80` | `border-[#2EE5A8]/80` |
| Spinning coin bg radial | `#bff8ff,#2bb6cf_45%,#0f5f80` | `#b4f5de,#2ee5a8_45%,#0d6644` |
| Coin `before` bg | `#0f6f92` | `#0d4433` |
| Coin `after` bg | `#0a4c68` | `#083322` |
| Coin hover glow | `rgba(43,182,207,0.65)` | `rgba(46,229,168,0.65)` |
| Specular shimmer section bg | `radial-gradient(900px_420px_at_50%_45%,#0e2236,transparent_70%)` | `radial-gradient(900px_420px_at_50%_45%,#061a12,transparent_70%)` |
| "Back" coin face (ABT blue face) | `border-[#A5F3FF]` / `#D8FBFF,#35E8FF … #1D8AA3` | `border-[#c8f7ea]` / `#c8f7ea,#2EE5A8_60%,#1aad7e` — this is brand ABT identity, so the cyan→teal swap preserves intent |
| Coin tagline `text-[#9F96C9]` | lavender | `#94a3b8` |

**Verify:** `npm run build`

---

## Step 16 — `src/pages/BurnLiquidity.tsx`

The page has a deep violet/indigo/amber theme in its CSS block and inline styles. The amber/gold coin and flame colours are brand identity — untouched. Replace violet/indigo with dark teal equivalents.

### CSS keyframe colours — do NOT change transforms, only colours within keyframes that are non-semantic
The injected `CSS` string keyframes (`bl-pulse`, `bl-flick`, etc.) contain no colour values directly — only opacity/transform — so no keyframe changes needed. The exception is `v3grid`, `v3scan`, `v3ring`, `v3beam` which also have no colour values.

### Inline style changes

| Element | Old | New |
|---|---|---|
| Hero section `background` radial | `rgba(95,60,220,.36)` / `rgba(30,90,220,.28)` / `rgba(255,120,30,.14)` | `rgba(46,229,168,.12)` / `rgba(26,173,126,.10)` / `rgba(255,120,30,.14)` (keep orange flame glow) |
| Annual Burn pill border | `rgba(130,110,255,.7)` | `rgba(46,229,168,.7)` |
| Annual Burn pill bg | `linear-gradient(180deg, rgba(80,60,200,.38), rgba(30,20,90,.52))` | `linear-gradient(180deg, rgba(26,173,126,.38), rgba(4,40,24,.52))` |
| Annual Burn pill color | `#ddd9ff` | `#c8f7ea` |
| Annual Burn pill box-shadow | `rgba(110,80,255,.4)` | `rgba(46,229,168,.4)` |
| Heading gradient | `linear-gradient(180deg, #fff, #d4d6ff 65%, #93a0ff)` | `linear-gradient(180deg, #fff, #c8f7ea 65%, #2EE5A8)` |
| `text-cyan-400` eyebrow | `text-cyan-400` | `text-[#2EE5A8]` |
| Body text `text-indigo-200` | `text-indigo-200` → lavender | `text-[#c8f7ea]` |
| Big number gradient | `#fff, #d2d5ff 65%, #93a0ff` | `#fff, #c8f7ea 65%, #2EE5A8` |
| Number suffix gradient | `#9370ff,#3fb2ff 55%,#59e3ff` | `#2EE5A8,#c8f7ea 55%,#2EE5A8` |
| Bullet icon badge bg | `rgba(110,90,255,.36)` | `rgba(46,229,168,.18)` |
| Bullet icon badge border | `rgba(140,120,255,.5)` | `rgba(46,229,168,.4)` |
| Bullet icon badge box-shadow | `rgba(110,90,255,.3)` | `rgba(46,229,168,.2)` |
| Note card border | `rgba(120,150,255,.45)` | `rgba(46,229,168,.35)` |
| Note card bg | `rgba(30,40,110,.58)` / `rgba(14,12,56,.62)` | `rgba(6,30,20,.58)` / `rgba(4,20,12,.62)` |
| Note card box-shadow | `rgba(70,110,255,.22)` | `rgba(46,229,168,.22)` |
| Megaphone icon badge | `rgba(60,140,255,.42)` / `rgba(30,60,160,.42)` / `rgba(110,180,255,.65)` | `rgba(46,229,168,.30)` / `rgba(26,173,126,.30)` / `rgba(46,229,168,.55)` |
| `YearTable` border | `rgba(120,130,255,.5)` | `rgba(46,229,168,.4)` |
| `YearTable` bg | `rgba(28,22,90,.78)` / `rgba(10,8,44,.85)` | `rgba(4,20,12,.78)` / `rgba(2,12,8,.85)` |
| `YearTable` box-shadow | `rgba(90,80,255,.25)` | `rgba(46,229,168,.2)` |
| `YearTable` header text | `text-indigo-300` | `text-[#2EE5A8]` |
| Timeline vertical line | `rgba(90,170,255,.85)` / `rgba(150,100,255,.55)` | `rgba(46,229,168,.85)` / `rgba(26,173,126,.55)` |
| Timeline line box-shadow | `rgba(90,150,255,.55)` | `rgba(46,229,168,.55)` |
| Timeline year text | `text-indigo-100` | `text-white` |
| Timeline amount | `text-indigo-300` | `text-[#2EE5A8]` |
| Sweep animation | `rgba(140,160,255,.12)` | `rgba(46,229,168,.08)` |
| Total row border | `rgba(120,140,255,.5)` | `rgba(46,229,168,.4)` |
| Total row bg | `rgba(70,60,210,.38)` / `rgba(30,20,100,.38)` | `rgba(6,40,24,.38)` / `rgba(4,20,12,.38)` |
| Total row box-shadow | `rgba(90,80,255,.25)` / `rgba(90,80,255,.22)` | `rgba(46,229,168,.2)` / `rgba(46,229,168,.18)` |
| Total row value gradient | `#fff, #9fb0ff 60%, #59e3ff` | `#fff, #c8f7ea 60%, #2EE5A8` |
| Transaction burn card border | `rgba(120,130,255,.45)` | `rgba(46,229,168,.35)` |
| Transaction burn card bg | `rgba(28,22,90,.7)` / `rgba(10,8,44,.8)` | `rgba(4,20,12,.7)` / `rgba(2,12,8,.8)` |
| Transaction burn heading gradient | `#fff, #d2d5ff 65%, #93a0ff` | `#fff, #c8f7ea 65%, #2EE5A8` |
| Transaction burn tag border | `rgba(140,120,255,.4)` | `rgba(46,229,168,.35)` |
| Transaction burn tag bg | `rgba(140,120,255,.12)` | `rgba(46,229,168,.10)` |
| `text-indigo-200` throughout | lavender | `text-[#c8f7ea]` |
| `text-indigo-300` throughout | lavender | `text-[#2EE5A8]` |
| Platform section — keep all amber/orange/gold coin colours unchanged |
| Stat cards accent colour | `"rose"` | keep (semantic for burn) |

**Verify:** `npm run build`

---

## Step 17 — `src/components/RoadmapScene3D.tsx`

Replace violet/purple Three.js colour literals. Keep planet/fog/star colours muted.

| Element | Old hex | New hex |
|---|---|---|
| `ren.setClearColor` | `0x05030f` | `0x020504` |
| `scene.fog` | `0x07041a` | `0x020504` |
| `AmbientLight` | `0x7755bb` | `0x224433` |
| `stars` color | `0xcbb8ff` | `0xc8f7ea` |
| `planet` color | `0x1a2a6c` | `0x0a1a12` |
| `planet` emissive | `0x0a1240` | `0x030f08` |
| path tube inner | `0x8a5cff` | `0x2ee5a8` |
| path tube outer (glow) | `0x6a3cff` | `0x1aad7e` |
| flow dots color | `0xffffff` | keep (white dots) |
| `makeCardTex` card bg `rgba(30,18,80,.88)` | `rgba(30,18,80,.88)` | `rgba(4,20,12,.88)` |
| `makeCardTex` card stroke | `rgba(170,130,255,.8)` | `rgba(46,229,168,.8)` |
| `makeCardTex` phase badge bg | `#6a3cff` | `#1aad7e` |
| `makeCardTex` status done bg | `#1fa971` | keep (green ✓) |
| `makeCardTex` status active bg | `#6a3cff` | `#1aad7e` |
| `makeCardTex` items `#b58cff` checkmark | `#b58cff` | `#2EE5A8` |
| `makeCoinTex` coin face colours | gold `#ffe27a`/`#c98a1a` | keep (IBO gold coin) |

**Verify:** `npm run build`

---

## Step 18 — `src/components/VaultlineScene.tsx`

Replace the purple/violet Three.js and inline colours in the hero track scene.

| Element | Old | New |
|---|---|---|
| `BG` constant | `0x05020a` | `0x020504` |
| Coin texture inner ring stroke | `rgba(226,214,255,.85)` | `rgba(200,247,234,.85)` |
| Coin texture outer ring stroke | `rgba(226,214,255,.25)` | `rgba(200,247,234,.25)` |
| `HemisphereLight` sky | `0x8d7bc0` | `0x224433` |
| `rim` DirectionalLight | `0xa855ff` | `0x2ee5a8` |
| `platRingMat` | `0x9a3dff` | `0x2ee5a8` |
| platform inner ring | `0x6a1fc0` | `0x1aad7e` |
| `blobGeo` cPurple | `0x8a1fff` | `0x0d6644` |
| `blobGeo` cWhite | `0xf4ecff` | `0xc8f7ea` |
| `platLight` | `0xa24bff` | `0x2ee5a8` |
| portal ring mats | `0x8a24ff` (×3) | `0x2ee5a8` |

**Verify:** `npm run build`

---

## Step 19 — `src/components/ZigguratChart.tsx`

Replace purple rim light and star colours.

| Element | Old | New |
|---|---|---|
| `rim` DirectionalLight | `0xf472b6` | `0x2ee5a8` |
| `purpleRim` PointLight | `0xa855f7` | `0x2ee5a8` |
| `starMat` color | `0x9fc3ff` | `0xc8f7ea` |
| `key` DirectionalLight | `0x7dd3fc` | `0xc8f7ea` |

The allocation layer colours in the `allocations` data array (in `src/data/content.ts`) drive the stacked chart segments — those are content data colours, not theme colours. If any currently uses `#22d3ee`, update it to `#2EE5A8`.

**Verify:** `npm run build`

---

## Step 20 — `src/data/content.ts` (allocations colours)

Scan `allocations` array for any `#22d3ee` or `#e83fc9` colour values assigned to allocation segments. If found, replace `#22d3ee` → `#2EE5A8`. Rose/amber allocation colours are kept as semantic data colours.

**File:** `src/data/content.ts`

**Verify:** `npm run build`

---

## Step 21 — `src/components/Bits.tsx` (PageHeader, Coin)

| Location | Old | New |
|---|---|---|
| `PageHeader` background | `rgba(34,211,238,0.14)` | `rgba(46,229,168,0.14)` |
| `Coin` blur bg | `bg-cyan-400/20` | `bg-[#2EE5A8]/20` |
| `Coin` blur bg 2 | `bg-rose-500/20` | `bg-[#2EE5A8]/10` |
| `Coin` orbit borders | `border-cyan-300/30` / `border-fuchsia-400/30` | `border-[#2EE5A8]/30` / `border-[#2EE5A8]/15` |
| `Coin` amber spark | `bg-amber-300` | keep (gold) |
| `Coin` conic gradient | `#22d3ee,#f5c451,#e83fc9,#22d3ee` | `#2EE5A8,#f5c451,#2EE5A8,#2EE5A8` (keep gold for 3-colour effect) |
| `Coin` ring | `ring-cyan-300/40` | `ring-[#2EE5A8]/40` |

**Verify:** `npm run build`

---

## Step 22 — `src/components/FAQAccordion.tsx`

The SVG-based orbit component and mobile accordion both use violet/purple palette.

| Location | Old | New |
|---|---|---|
| Orb centre SVG radial stop | `#a78bfa` / `#7c3aed` / ... (purple shades) | `#2EE5A8` / `#1aad7e` / `#043320` |
| Connector line SVG `stroke` | `rgba(167,139,250,*)` | `rgba(46,229,168,*)` |
| Active card border inline | `rgba(167,139,250,*)` | `rgba(46,229,168,*)` |
| Active card glow | `rgba(167,139,250,*)` | `rgba(46,229,168,*)` |
| `CARD_META` colours that are cyan (`#22d3ee`, `#2dd4bf`) | as listed | `#2EE5A8` |

Specific `CARD_META` changes:
- index 1 `color: "#22d3ee"` → `"#2EE5A8"`
- index 7 `color: "#2dd4bf"` → `"#2EE5A8"`
- index 9 `color: "#22d3ee"` → `"#2EE5A8"`

Keep: index 2 `#34d399`, index 4 `#e83fc9` (kept per constraint? No — magenta is theme colour). Replace index 4 `#e83fc9` → `#2EE5A8`.
Keep: index 3 `#f59e0b` amber, index 6 `#f97316` orange (burn), index 11 `#f59e0b`.

**Verify:** `npm run build`

---

## Step 23 — `src/pages/Whitepaper.tsx`

| Location | Old | New |
|---|---|---|
| Cover card bg gradient | `from-navy-700 to-teal-deep` | `from-[#0d1a16] to-[#061a12]` |
| `FileText` icon | `text-cyan-300` | `text-[#2EE5A8]` |

**Verify:** `npm run build`

---

## Step 24 — `src/components/CyberGlitchAllocations.tsx`

The third card uses `"#22d3ee"` (cyan) as its `color`. Replace it:

| Card | Field | Old | New |
|---|---|---|---|
| `Transaction Burn` | `color` | `"#22d3ee"` | `"#2EE5A8"` |

Glitch ghost colours in the CSS (`before:text-cyan-400` / `after:text-rose-500`) are inherent to the glitch aesthetic — keep the rose, change cyan:
In `KEYFRAMES` / card text classes: `before:text-cyan-400` → `before:text-[#2EE5A8]`. The `after:text-rose-500` is kept.

**Verify:** `npm run build`

---

## Step 25 — `src/components/AboutCoinReveal.tsx`

The main ABT coin uses amber/gold as the brand colour for the IBO coin face — untouched. The small spinning `Ξ`/`◎`/`₮`/`IBO` coins also use their own brand colours — untouched. The orbit rings and dot glows are cyan:

| Location | Old | New |
|---|---|---|
| Outer orbit dot `bg-[#35E8FF]` | `#35E8FF` | `#2EE5A8` |
| Outer orbit dot shadow | `shadow-[0_0_10px_#35E8FF]` | `shadow-[0_0_10px_#2EE5A8]` |
| Inner orbit ring border | `border-[#35E8FF]/15` | `border-[#2EE5A8]/15` |
| ABT coin back face border | `border-[#A5F3FF]` | `border-[#c8f7ea]` |
| ABT coin back face bg radial | `#D8FBFF,#35E8FF_60%,#1D8AA3` | `#c8f7ea,#2EE5A8_60%,#1aad7e` |
| ABT coin back face box-shadow | `rgba(53,232,255,0.5)` | `rgba(46,229,168,0.5)` |
| ABT coin back face inset | `rgba(0,60,80,0.18)` | `rgba(0,40,20,0.18)` |
| ABT coin back face text color | `#00323E` | `#002818` |
| `acr-stage` BurnLiquidity scroll bg | `radial-gradient(120% 90% at 50% 0%, #3a1a06 0%, #070d18 60%)` | keep (amber IBO brand) |
| `acr-glow` radial | `rgba(251,146,60,0.65)` | keep (amber flame) |
| `acr-core` border / bg / shadow | amber/orange values | keep |

**Verify:** `npm run build`

---

## Step 26 — `src/components/TokenomicsSpiral.tsx`, `src/components/TokenomicsDonutChart.tsx`, `src/components/CoinCanvas.tsx`, `src/components/CoinStackChart.tsx`, `src/components/FearAndGreedGauge.tsx`, `src/components/TokenInfoPanel.tsx`, `src/components/States.tsx`, `src/components/BscScanLink.tsx`

For each of these, search for and replace:

| Old | New |
|---|---|
| `#22d3ee` / `0x22d3ee` | `#2EE5A8` / `0x2ee5a8` |
| `rgba(34,211,238,*)` | `rgba(46,229,168,*)` |
| `#e83fc9` / `0xe83fc9` | `#2EE5A8` / `0x2ee5a8` (only if used as theme accent, not burn/error) |
| `rgba(232,63,201,*)` | `rgba(46,229,168,*)` |
| `0xa855f7` / `#a855f7` | `0x2ee5a8` / `#2EE5A8` |
| `0x8a5cff` / `#8a5cff` | `0x2ee5a8` / `#2EE5A8` |
| `text-cyan-300/400` | `text-[#2EE5A8]` |
| `border-cyan-400` | `border-[#2EE5A8]` |
| `bg-cyan-400` | `bg-[#2EE5A8]` |
| navy bg values `#050a14`, `#08111f`, `#0c1a2e` | `#020504`, `#040908`, `#070f0c` |

Exempt from changes in these files:
- `#4ade80` green live/success badges
- `#fbbf24` amber/yellow warning
- `#ef4444` / `#f43f5e` error red
- `#94a3b8` slate muted text
- `#ffffff` white text

**Verify:** `npm run build` — build must complete with 0 TypeScript errors and 0 Vite errors.

---

## Step 27 — Final build verification

**What to do:** Run the full production build and confirm zero errors.

**Command:**
```bash
cd "c:\Users\Dell\Downloads\ibo-website (1)\ibo-website"
npm run build
```

**Expected outcome:** `tsc -b` exits 0, `vite build` completes and outputs `dist/` with JS + CSS bundles. Zero TypeScript type errors. Zero Vite transform errors.

If the build fails:
1. TypeScript errors referencing colour strings: check that the string replacement did not break a type annotation (colours are only used in `style` props and string literals, not in typed interfaces).
2. Tailwind class-not-found warnings: these are non-fatal; arbitrary-value classes like `bg-[#2EE5A8]` are valid in Tailwind v3 without config changes.
3. Three.js `0x` hex literal errors: confirm all hex values are valid 6-digit JS numbers.

---

## Summary of files changed

| File | Change type |
|---|---|
| `tailwind.config.js` | Colour tokens + keyframe colour values |
| `src/index.css` | CSS variables, component classes, keyframe colour values |
| `src/components/Navbar.tsx` | Injected CSS string + inline styles |
| `src/components/Logo.tsx` | SVG gradient + Tailwind class |
| `src/components/FaqScene3D.tsx` | Three.js hex literals + Tailwind accordion classes |
| `src/components/FanDeckCards.tsx` | CARDS data constants |
| `src/components/AnimatedCard.tsx` | Default prop values + shimmer border colours |
| `src/components/StatCard.tsx` | Accent colour map |
| `src/components/LiquidityCard.tsx` | Tailwind classes |
| `src/components/TransactionFilter.tsx` | Tailwind classes |
| `src/components/RoadmapTimeline.tsx` | STATUS config object |
| `src/components/RoadmapScene3D.tsx` | Three.js hex literals + card canvas texture |
| `src/components/VaultlineScene.tsx` | BG constant + Three.js hex literals |
| `src/components/ZigguratChart.tsx` | Three.js light colours |
| `src/components/Bits.tsx` | Tailwind classes + conic gradient |
| `src/components/FAQAccordion.tsx` | CARD_META colours + SVG/inline styles |
| `src/components/CyberGlitchAllocations.tsx` | BURN_CARDS data + glitch before-text class |
| `src/components/AboutCoinReveal.tsx` | Orbit dot + ABT coin face colours |
| `src/pages/Home.tsx` | utilityThemes array + banner element classes |
| `src/pages/About.tsx` | Section bg + coin colours + text classes |
| `src/pages/BurnLiquidity.tsx` | Extensive inline style colour swaps |
| `src/pages/Whitepaper.tsx` | Card gradient + icon class |
| `src/data/content.ts` | Allocation segment colours (if cyan present) |
| `src/components/TokenomicsSpiral.tsx` | Three.js / CSS colour literals |
| `src/components/TokenomicsDonutChart.tsx` | CSS / inline colour literals |
| `src/components/CoinCanvas.tsx` | Canvas colour literals |
| `src/components/CoinStackChart.tsx` | Canvas colour literals |
| `src/components/FearAndGreedGauge.tsx` | Canvas/SVG colour literals |
| `src/components/TokenInfoPanel.tsx` | Tailwind + inline colour literals |
| `src/components/States.tsx` | Any cyan Tailwind classes |
| `src/components/BscScanLink.tsx` | Any cyan Tailwind classes |

**Files NOT changed (confirmed clean of theme colours):**
- `src/components/Footer.tsx` — inherits from CSS classes only
- `src/components/AllocationCards.tsx` — drives colours from `allocations[].color` data, no hardcoded theme colour
- `src/components/AllocationTable.tsx` — same
- `src/components/BurnTimeline.tsx` — uses only rose (exempt)
- `src/pages/FAQ.tsx` — single import, no colour
- `src/pages/Roadmap.tsx` — single import, no colour
- `src/pages/Tokenomics.tsx` — delegates to child components
- `src/pages/Transactions.tsx` — delegates to child components
