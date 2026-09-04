# Problem Solving Mind — Interactive 3D Website (frontend)

A single-page, Awwwards-grade 3D technology-studio website for **PSM (Problem Solving Mind)**, built with React 19 + Vite + TypeScript + Three.js (R3F). It reuses the PSM "ocean signal lab" brand and real PSM content, and features a scroll-driven 3D transformation: **particles → modular UI → product.**

> Feature spec / build rules: [`3D web design/Skill.md`](./3D%20web%20design/Skill.md)
> Content source: `../ProblemSolvingMind/README.md` (extracted PSM site) → distilled in `src/lib/content.ts`

---

## Current State

| Check | Status |
|---|---|
| Production build (`npm run build`) | ✅ passes (tsc + vite) |
| Lint (`npm run lint`) | ✅ 0 errors (only rule warnings in 3D/perf code) |
| Dev server (`npm run dev`) | ✅ serves, no console/page errors |
| Headless render smoke test | ✅ 14 sections + nav + footer + 3D canvas, 0 errors |
| 3D runtime bug (geometry attribute) | ✅ fixed |

**State: FUNCTIONAL / MVP COMPLETE** — the site builds, runs, and renders end-to-end with no runtime errors.

---

## Tech Stack

- **Framework:** React 19 + Vite 8 + TypeScript
- **3D:** three, @react-three/fiber 9, @react-three/drei 10, @react-three/postprocessing
- **Motion:** GSAP + ScrollTrigger, Lenis (smooth scroll), framer-motion
- **State:** zustand
- **Fonts:** Space Grotesk (display), Inter (body), JetBrains Mono (mono)
- **Brand:** PSM "ocean signal lab" tokens in `src/index.css`

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npm run preview   # serve production build
```

---

## Project Status — Feature Checklist

Tracked from [`3D web design/Skill.md`](./3D%20web%20design/Skill.md). `[x]` = done.

### 1. Base & Chrome
- [x] Design tokens + reset + type scale + layout utilities + buttons (`src/index.css`)
- [x] Smooth scroll: Lenis bridged to GSAP ScrollTrigger (`SmoothScroll.tsx`)
- [x] Reduced-motion guard (`reducedMotion.ts`) + zustand store (`scrollStore.ts`)

### 2. Navigation
- [x] Sticky header, scroll detection, nav links, mobile burger + full-screen menu (`Navigation.tsx`)
- [x] Logo with phase-aware tile (Azure → Cyan when scene phase > 0.5) (`Logo.tsx`)
- [x] Lenis-aware `scrollToId` helper

### 3. 3D Transformation Scene (`Scene3D.tsx`)
- [x] Particle field (cloud → modular UI cards → product form), blended by scroll phase
- [x] Ghosted modular UI card shells (phase 1), product capsule + glowing core (phase 2)
- [x] Camera rig: scroll-linked z + mouse parallax
- [x] Bloom + vignette post-processing (skipped under reduced motion)
- [x] DPR cap + mobile tuning for cheap 3D
- [x] Runtime fix: geometry position attribute created synchronously (was undefined on first frame)

### 4. Sections (wired in `App.tsx`)
- [x] Hero (`#hero`) — title, subline, CTAs, scroll hint, 3D behind content
- [x] Introduction (`#intro`) — studio blurb + 4-pillar grid
- [x] Capabilities (`#capabilities`) — 6 solution practice-area cards
- [x] Products (`#products`) — Boowa + EYD cards
- [x] Interactive 3D Story (`#story`) — phase indicators synced to `scenePhase`
- [x] Services / Approach (`#approach`) — solution rows + PSM Creed
- [x] Work (`#work`) — selected-work list + tech stack cloud
- [x] Trust (`#trust`) — metrics + mission
- [x] Team (`#team`) — people grid
- [x] Contact CTA (`#contact`) — email + phones CTA

### 5. Footer & Composition
- [x] `Footer.tsx` — brand block + Products/Solutions/Company columns + copyright/contact
- [x] `App.tsx` wires `SmoothScroll` + `Navigation` + `ScrollMapper` + all sections + `Footer`
- [x] `sections/index.ts` barrel for clean imports
- [x] `index.html` — title, description, theme-color meta

### 6. CSS
- [x] All nav / hero / scene / section / footer styles in `src/index.css`
- [x] Responsive breakpoints (1024 / 768 / 520)
- [x] Reduced-motion CSS block

### 7. Verification
- [x] `npm run build` passes with zero errors
- [x] `npm run dev` — no console/runtime errors
- [x] Headless render smoke test — all sections present, 0 page errors
- [ ] `npm run lint` fully clean (warnings below)
- [ ] Code-split the 3D bundle (`vite build` warns chunk > 500 kB)

---

## Key Files

| File | Purpose |
|---|---|
| `src/App.tsx` | Composes SmoothScroll + Navigation + ScrollMapper + sections + Footer |
| `src/index.css` | PSM design tokens, base, buttons, and all section/nav/footer CSS |
| `src/lib/content.ts` | Real PSM content (Boowa, EYD, 6 solutions, creed, loop, metrics, team, work, stack) |
| `src/lib/reducedMotion.ts` | `prefers-reduced-motion` hook |
| `src/store/scrollStore.ts` | zustand store (progress, phase, dpr, isMobile) |
| `src/components/SmoothScroll.tsx` | Lenis + ScrollTrigger bridge |
| `src/components/ScrollMapper.tsx` | Scroll progress → 3D scene phase |
| `src/components/three/Scene3D.tsx` | The 3D particles → UI → product transformation |
| `src/components/sections/*` | All page sections |
| `3D web design/Skill.md` | Feature spec + build rules |

## Known Lint Warnings (non-blocking)

Run `npm run lint` — exits 0 with only rule-engine warnings:
- `Scene3D.tsx` — React immutability/purity warnings on Three.js objects + `Math.random` in `useMemo` (intentional Three.js patterns).
- `SmoothScroll.tsx:68` — `only-export-components` (fast-refresh) for the exported `getLenis()` helper.
- `.opencode/skills/**` — lint from imported third-party skill content (not project code).

## Structure

```
frontend/
├─ .opencode/skills/        # Copied 3D/frontend/motion opencode skills (31)
├─ 3D web design/Skill.md   # Feature spec + build rules
├─ public/
└─ src/
   ├─ App.tsx  main.tsx  index.css
   ├─ components/ (Logo, Navigation, ScrollMapper, SmoothScroll, Footer)
   │   ├─ sections/ (Hero, Introduction, Capabilities, Products, Story, Services, Work, Trust, index)
   │   └─ three/ (Scene3D)
   ├─ hooks/useSectionReveal.ts
   ├─ lib/ (content, reducedMotion)
   └─ store/scrollStore.ts
```




gsap,lenis
vanta.js,anime.js,motion ,dev strinh