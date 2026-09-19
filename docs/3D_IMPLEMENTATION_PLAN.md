# PSM 3D Implementation Plan

Status: **Complete** — all phases implemented, built, and QA-verified. See `docs/3D_QA_REPORT.md` (PASS) and `docs/3D_ASSET_LICENSES.md` (procedural assets, MIT-only).
Owner: PSM Frontend (frontend/)
Date: 2026-09-18

> **Reconciled 2026-09-18 (post-implementation audit):** §2.1, §3, §4, §5, §6,
> §8, §9 were corrected below to match the shipped implementation exactly
> (original audit predicted several names/stanzas that were not shipped). A
> deviations/risk register is in §11.

---

## 1. Objective

Turn the existing Problem Solving Mind (PSM) website into a premium, modern,
interactive digital-agency experience with a **carefully designed 3D visual
system** — without destroying anything that already works. 3D augments each page
as a branded, restrained accent; content, routes, SEO, forms, accessibility and
responsive layout are preserved.

## 2. Current State (audit findings — no files modified)

### 2.1 Stack (frontend/)
- React **19.2.8** (pinned `~19.2.8` — see below), React Router **7.18.3**
  (BrowserRouter), Vite **8.2.2**, TypeScript **~6.0.2**, oxlint **1.79.0**.
- Animation: GSAP **3.15** (Club plugins registered once in `lib/gsapSetup.ts`),
  Lenis **1.3.26** smooth scroll bridged to GSAP ScrollTrigger,
  `@gsap/react`, `zustand`, `framer-motion` (installed, largely unused for the
  CSS-reveal system).
- 3D deps now installed (audit-time state was "absent"): `three ^0.185.1`,
  `@types/three ^0.185.4`, `@react-three/fiber ^9.7.0`,
  `@react-three/drei ^10.7.8`. `react`/`react-dom` were pinned to `~19.2.8`
  because fiber 9.7.0 requires `react >=19 <19.3` while caret resolution
  pulled 19.3.0. `@react-three/postprocessing` from the audit was **not**
  installed (deliberate — no post-processing by design, §12).

### 2.2 Design system (must reuse, not replace)
- Light editorial Dala theme in `src/index.css` / `src/dala-utilities.css`.
- Tokens: `--canvas #f4f5f8`, `--surface #ffffff`, `--ink #0a0b0f`,
  `--accent-blue/iris #0d6efd`, `--accent-yellow/saffron #ffb829`,
  `--accent-green/verdant #15846e`, plus spectrum accents
  (coral, pink, teal, violet, cyan-deep, orange). Theme color `#060a14`.
- Typography: **PP Neue Montreal** (self-hosted woff2) across the whole site.
- Breakpoints: `@xs 360` `@sm 768` `@md 1024` `@lg 1366` `@xlg 1921`.
- Established moods (from screenshots): clean hero cards, brand accent cards,
  Dala utilities, press-style pulls, welcome overlay.

### 2.3 Pages and routing (App.tsx)
| Route | Page | File |
|---|---|---|
| `/` | Home (single-page sections) | `pages/home/Home.tsx` + `components/sections/*` |
| `/products` | Products hub | `pages/products/Products.tsx` |
| `/products/boowa` `/products/eyd` `/products/aura` | Product details | `pages/products/{Boowa,EYD,Aura}.tsx` |
| `/solutions` | Solutions hub | `pages/solutions/Solutions.tsx` |
| `/solutions/ai` ... `/solutions/hardware-iot` | Solution details | `pages/solutions/SolutionDetail.tsx` (shared template keyed by `SOLUTIONS` in `lib/siteContent.ts`) |
| `/industries` `/case-studies` `/about` `/careers` `/contact` `/partner` | Content | `pages/*.tsx` |
| `*` | 404 | `pages/NotFound.tsx` |

### 2.4 Runtime primitives worth keeping
- `SmoothScroll.tsx`: Lenis (exposed as `window.__lenis` / `getLenis()`),
  driven by `gsap.ticker`; `lenis.scrollTo` on route change.
- `usePageAnimations.ts`: route-aware reveals, parallax, magnetic buttons,
  card tilt + spotlight, counters, scroll progress.
- `useReducedMotion()` (`lib/reducedMotion.ts`, `useSyncExternalStore`).
- `Seo.tsx`: upserts per-page meta + canonical.
- `Preloader`, glass `Navigation`, `Footer`, `Marquee`, `Logo`.

### 2.5 Analytics / SEO / infra
- GitHub Pages, vite `base: '/'`, `.nojekyll`, `404.html` redirect pattern.
- `sitemap.xml`, `robots.txt`, `llms.txt`, structured data in `index.html`.
- Only `tsc -b && vite build` and `oxlint` as gate; no test framework.

## 3. 3D Architecture (`src/components/3d/`) — SHIPPED STRUCTURE

Single canvas concept per scene; every scene is a lazy-loaded, self-contained
component. **One scene per page**; no global persistent canvas. The 3D runtime
(three + R3F + drei) lives in a lazy async chunk fetched only when a scene
mounts; the main bundle stays 3D-free.

```
src/components/3d/
  SceneFrame.tsx          — DOM wrapper. IntersectionObserver → mount-once latch,
                            near/active state, scroll-probe wiring, WebGL/reduced-
                            motion/tier gating, static fallback div, a11y aria-hidden
  Canvas3D.tsx            — <Canvas>: dpr cap [1, profile.dprCap], frameloop
                            always/demand, camera [0,0,9] fov 42, gl alpha/antialias/
                            preserveDrawingBuffer/high-performance, <ParallaxGroup>, Suspense
  SceneRenderer.tsx       — variant → scene composition switch (pure, per-scene)
  sceneRegistry.ts        — SceneVariant union (15), SCENE_ACCENTS color map,
                            isSceneVariant() guard
  core/
    usePerformanceProfile.ts   — tiers desktop/tablet/mobile/low + dprCap + particleBudget
    SceneState.tsx             — SceneActiveProvider + useSceneActive() (context; frameloop gate)
    ParallaxGroup.tsx          — pointer→group damped parallax (active+gated, transform-only)
    useWebGLSupport.ts         — WebGL support probe; low tier when unsupported
    scrollProbe.ts             — setScrollProgress()/getScrollProgress()/computeSectionProgress()
                                 for scroll-driven scenes
    prng.ts                    — mulberry32 seeded PRNG for deterministic placement
  objects/
    ParticleField.tsx     — instanced points field + optional wire core + torus rings (Home, About, ambient)
    OrbitalRings.tsx      — concentric brand rings (Home accent)
    WireGlobe.tsx         — lowpoly wire globe + orbiting accent (EYD)
    NodeGraph.tsx         — topology points + edges + traveling pulse spheres (AI, automation,
                            Boowa, Aura, hardware-iot, solutions hub)
    topologies.ts         — deterministic seeded builders: webTopology/flowTopology/sensorTopology
    DataLattice.tsx       — business-system lattice/table (Business Systems)
    StackLayers.tsx       — scroll-driven product stack (Product Engineering)
    DeviceShells.tsx      — browser/phone/printer ghost shells (Products hub, Web & Mobile)
    ContactOrb.tsx        — layered sphere + rings + Sparkles (Contact)
  theme/
    PSMColors.ts          — brand palette (azure/violet/green/yellow/coral/pink) as materials/colors
```

### 3.1 Design principles for the 3D (unchanged — all held in shipped code)
1. **Restraint**: 3D is a backdrop / structural accent, never a full-page
   particle takeover. Each scene renders behind hero content (`z-index: 0`,
   `pointer-events: none`), subtle, depth-matched to brand colors.
2. **Brand truth**: void + blue-led identity + spectrum accents; no default neon.
3. **Modular**: one variant per route keyed off `sceneRegistry`; adding a scene
   is a one-line map change; everything degrades gracefully.
4. **Performance-first**: see §6.
5. **Accessible**: `prefers-reduced-motion` / no WebGL / `low` tier → static CSS
   fallback `.psm-scene-fallback` (no canvas). Verified in QA (§9).

## 4. Page → 3D mapping — SHIPPED WIRING

Integration mechanism: `PageHero` gained a `backdrop?: ReactNode` prop
(`components/ui/index.tsx`); each page passes `<SceneFrame variant="…" />`
(or none → no scene). `SceneFrame` sits `position:absolute; inset:0; z-index:0;
pointer-events:none` inside the hero (`.psm-scene` in `src/index.css`).

| Route | Variant | Scene composition (via SceneRenderer) |
|---|---|---|
| `/` Home hero | `home-hero` | ParticleField (core) + OrbitalRings |
| `/products` hub | `products-hub` | DeviceShells |
| `/products/boowa` | `boowa` | NodeGraph (flow topology, green/yellow) |
| `/products/eyd` | `eyd` | WireGlobe |
| `/products/aura` | `aura` | NodeGraph (sensor topology, violet/blue) |
| `/solutions` hub | `solutions-hub` | NodeGraph (web topology) + ParticleField |
| `/solutions/ai` | `ai` | ParticleField (core) + NodeGraph (sensor, violet) |
| `/solutions/business-systems` | `business-systems` | DataLattice |
| `/solutions/automation` | `automation` | NodeGraph (flow, coral) |
| `/solutions/web-mobile` | `web-mobile` | DeviceShells |
| `/solutions/product-engineering` | `product-engineering` | StackLayers (scroll-driven via `#product-engineering-anchor`) |
| `/solutions/hardware-iot` | `hardware-iot` | NodeGraph (sensor, pink/green) |
| `/about` | `about` | ParticleField |
| `/contact` | `contact` | ContactOrb |
| `/case-studies` `/industries` `/careers` `/partner` | `default` | ambient ParticleField |
| `/404` | — | no scene |

`SolutionDetail.tsx` maps the six solution slugs to variants via `SOLUTION_SCENE`
and passes `scrollTarget="#product-engineering-anchor"` only for
product-engineering (anchor is `content-stack` `id`, line 160).

## 5. Interactions — AS SHIPPED
- **Pointer parallax**: `ParallaxGroup` damps group rotation toward a normalised
  pointer (RGB; MathUtils.damp, λ 2.4). Gated by `active` **and** the `parallax`
  flag — the performance profile disables it below the desktop tier, so touch
  never receives parallax. No pointer dependence on any primary action.
- **Scroll-driven assembly**: `StackLayers` reads `getScrollProgress('product-engineering')`
  (set by `scrollProbe` from the DOM section; runs in `useFrame`, eased
  easeInOut) and stacks ghost layers into a product stack.
- **Visibility**: `SceneFrame` IntersectionObserver (rootMargin 10%) sets
  `near`; frameloop is `always` in-view and `demand` out-of-view. Canvas mounts
  **once** and is never unmounted on scroll, keeping the WebGL context warm.
- **Hover** (planned "emissive pop"): **not implemented** — scenes are unlit
  `MeshBasicMaterial`, deliberately; interactive glow lives in the existing CSS
  button/card system. See §11 deviation list.

## 6. Performance strategy — AS SHIPPED
- Tiers (`usePerformanceProfile`): `low` (no WebGL → no canvas), `mobile`
  (width < 768), `tablet` (≤ 1024), `desktop` (> 1024). Budgets/dpr:
  desktop **1600** particles, dpr 2 · tablet **850**, dpr 1.75 · mobile **420**,
  dpr 1.5 · low 0, dpr 1. (The audit predicted a separate "4k" tier; desktop
  budget covers >1921px — simplification, see §11.)
- Canvas config: `dpr={[1, dprCap]}`; `frameloop` demand/always per visibility;
  camera fov 42 at z=9; gl `alpha`, `antialias`, `preserveDrawingBuffer`
  (debug-friendly; single decorative canvas), `powerPreference: high-performance`.
- No post-processing. No textures — all procedural geometry/material color from
  `PSMColors`. Zero lights (MeshBasic → no lighting shader cost).
- Geometry built once per mount via `useMemo`; there is **no module-level
  material/geometry cache** (the audit anticipated one) — it is unnecessary
  because exactly one scene mounts per page and R3F disposes on unmount, giving
  the same effect with less complexity.
- Code-split: the three/R3F runtime (`SceneState-*.js`, ~876 kB / 232 kB gz)
  loads lazily only when a scene mounts; main bundle (572 kB) unchanged.

## 7. Assets
- **All procedural** — zero royalty/copyright surface. No external `.glb`/`.hdr`
  downloads. Licensing noted in `docs/3D_ASSET_LICENSES.md`.
- Later (optional) GLB catalog under `public/models/` only if licensed and
  Draco-compressed. Not required for this pass.

## 8. Implementation order — ALL DONE (✔; names match shipped code)
0. ✔ Audit + this plan.
1. ✔ Skills (project-local, root `.opencode/skills/`):
   `psm-3d-web`, `psm-3d-performance`, `psm-frontend-design`.
2. ✔ Install deps (§2.1) + react/react-dom pin `~19.2.8`.
3. ✔ 3D foundation: `core/*`, `theme/PSMColors`, `Canvas3D`, `SceneFrame`,
   `sceneRegistry`.
4. ✔ Register + first scenes: ParticleField, OrbitalRings, ContactOrb,
   NodeGraph, WireGlobe, DataLattice, StackLayers, DeviceShells (+topologies).
5. ✔ Integrate Home hero → validate (build/lint/dev + Playwright screenshots,
   0 console errors).
6. ✔ Wire solution registry → SolutionDetail (SOLUTION_SCENE) + solutions hub.
7. ✔ Wire product pages (products-hub, Boowa, EYD, Aura).
8. ✔ About / Contact / default-ambient pages.
9. ✔ Performance pass: tiers/dpr/budgets + reduced-motion/no-WebGL fallback
   (verified by Playwright probes).
10. ✔ QA: `docs/3D_QA_REPORT.md` + `docs/3D_ASSET_LICENSES.md`.
11. ✔ Post-implementation reconciliation (this document, §11).

## 9. Verification loop — AS APPLIED
- `npm run lint` (oxlint): **0 errors**; 2 non-blocking
  `react(only-export-components)` fast-refresh warnings (`SceneState.tsx:15` —
  new, accepted as matching the existing `SmoothScroll.tsx:65` pattern; both are
  hook+provider exports, not correctness issues).
- `npm run build` (tsc -b && vite build): PASS. Emits one advisory — the lazy
  3D runtime chunk exceeds 500 kB (three + R3F + drei); expected and mitigated
  by lazy async loading (loaded only on pages with scenes).
- `npm run dev` + Playwright probes: every page/viewport tested renders its
  scene with **0 console errors**; reduced-motion and no-WebGL paths render the
  static fallback; hero CTA click-through confirmed unaffected (§2.4/QA report).
- No interaction regressions with existing scroll/hero/nav (validated in
  `docs/3D_QA_REPORT.md`).

## 10. Non-goals / guardrails
- No full-page particle morph overlay (removed "newer code" stays removed).
- No replacing the site with a template site; no content/SEO/footer changes.
- No heavy bloom/post-processing stack; no unlicensed assets.
- Touch: no pointer-parallax dependence; scenes are decorative, never input-required.

## 11. Post-implementation reconciliation — deviations & risk register

### 11.1 Planned-but-not-shipped (intentional)
| Planned | Shipped | Rationale |
|---|---|---|
| `useSceneVisibility.ts` | `SceneState.tsx` (provider + hook) | fastest-refresh-safe context split; also carries `active` gate |
| `usePointerParallax.ts` | `ParallaxGroup.tsx` | group-level component is more composable for scenes |
| `ParticleNetwork.tsx` | `ParticleField.tsx` | clearer name |
| `WorkflowGraph.tsx` | `NodeGraph.tsx` + `topologies.ts` | one generic topology graph serves AI/automation/Boowa/Aura/hardware-iot; no need for 3 near-copies |
| `StackAssembler.tsx` | `StackLayers.tsx` | renamed; same scroll-driven behavior |
| `SensorNetwork.tsx` | NodeGraph (sensor topology) | composition over a dedicated object |
| `GearSet.tsx` / `effects/` | omitted | no page needed it; effects folded into SceneRenderer |
| 4k tier (>1921px) | desktop budget covers all >1024px | simplification; desktop budget already restrained |
| Module-level material/geometry cache | per-mount `useMemo` | exactly one scene per page ⇒ cache moot; R3F disposes on unmount |
| Hover "emissive pop" / link glow | not implemented | scenes are unlit MeshBasic; interactive glow remains CSS-side |
| `@react-three/postprocessing` | not installed | no post-processing by design |

### 11.2 Risks / known limitations (open)
1. **Lazy chunk size advisory**: the three/R3F runtime chunk (~876 kB raw /
   232 kB gz) triggers Vite's >500 kB warning. Mitigated by async loading; only
   pages with scenes pay it. Alternative (further hand-rolled three core) is
   not worth the maintenance cost for this site.
2. **Two accepted lint warnings** (`react(only-export-components)` in
   `SceneState.tsx` and pre-existing `SmoothScroll.tsx`). Cosmetic for HMR
   muscle-memory only; no runtime effect. To silence, split hook+provider files
   (not done to avoid churn).
3. **`preserveDrawingBuffer: true`** retained — negligible for one low-poly
   decorative canvas, enables pixel-level debugging/QA. Remove if ever a budget
   allows canvas reads by other means.
4. **Scroll-driven scene depends on DOM positions**: if `content-stack` layout
   changes, the `product-engineering` progress mapping may need `scrollProbe`
   retuning. Guarded by window resize handler + rAF reads.
5. **`ParallaxGroup` registers a global `pointermove` listener** on desktop
   tiers only (desktop profile sets `parallax: true`); listener is passive and
   gated — negligible, but noted.
6. **Scene count is one-per-page**: any future page wanting two live scenes
   needs a second canvas (new WebGL context). Acceptable today by design.
7. **QA coverage is headless-Chromium**: Safari/Firefox WebGL differences were
   not exercised; architecture uses only widely-supported primitives
   (points, MeshBasic, instancing-free), so risk is low.