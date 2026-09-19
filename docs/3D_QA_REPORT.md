# 3D System QA Report

**Scope:** `src/components/3d/**` — decorative WebGL backdrops integrated behind page heroes across the PSM site.
**Method:** Automated Playwright probes (Chromium headless) against the Vite dev server (`http://localhost:5174`), plus `npm run build` and `npm run lint`.
**Result:** PASS — see evidence below.

## 1. Render evidence (WebGL buffer pixel sampling)

Canvas mounted with `preserveDrawingBuffer` (dev/debug friendly); sampled via `canvas.toDataURL()` → PNG decode → pixel stats. Non-zero unique colors at non-zero alpha = live rendered content behind the hero.

| Page / viewport | Canvas | Unique colors | Mean RGB | Verdict |
| --- | --- | --- | --- | --- |
| Home 1440×900 | 1440×900 | ~95–100 | ~133 | Scene visible |
| /solutions/ai 1440×900 | 1440×578 | ~71–76 | ~156 | Scene visible |
| /solutions/product-engineering 1440×900 (scroll 0) | 1440×578 | 7 | ~106 | Ghost-stack state renders |
| … scrolled to `#product-engineering-anchor` | — | blank | — | Expected: frameloop `demand` off-screen |
| … scrolled back to top | 1440×578 | 7 | ~106 | Scene resumes (identical to scroll-0) |

Scroll-driven assembly (`StackLayers`) suspends off-screen and resumes on return; no errors in the cycle.

## 2. Fallback paths

| Path | Scenes | Canvases | Fallback | Console errors |
| --- | --- | --- | --- | --- |
| `prefers-reduced-motion: reduce` (Home) | 1 | 0 | 1 (`.psm-scene-fallback`) | 0 |
| WebGL disabled (`--disable-webgl --disable-3d-apis`) (Home) | 1 | 0 | 1 | 0 |

Reduced-motion users and WebGL-less clients receive the static CSS gradient; no JS errors thrown.

## 3. Viewport matrix (Home, `networkidle` + 2.8s settle)

Each row: exactly 1 `.psm-scene`, 1 canvas mounted, 0 console/page errors.

| Viewport | Canvas mounted |
| --- | --- |
| 1366×768 (desktop) | ✔ |
| 1440×900 (desktop) | ✔ |
| 1920×1080 (desktop) | ✔ |
| 768×1024 (tablet) | ✔ |
| 375×812 (mobile) | ✔ |
| 390×844 (mobile) | ✔ |
| 430×932 (mobile) | ✔ |
| 768×1024 — /solutions hub | ✔ |
| 1440×900 — /solutions/ai | ✔ |
| 1440×900 — /solutions/product-engineering | ✔ |

## 4. Interaction integrity

- Clicking the Home hero "Products" CTA navigated to `/products` and mounted that page's scene. The decorative canvas sits at `z-index: 0` with `pointer-events: none` (CSS-inherited), so it never intercepts clicks/form inputs. PASS.

## 5. Console / error hygiene

Zero browser console errors and zero page errors across every probe run in this report (Home, Solutions hub/detail, Products click-through, Contact, reduced-motion, no-WebGL).

## 6. Build & lint (after 3D integration)

- `npm run build` (tsc -b && vite build): PASS, 5.48s.
- Bundle split confirmed:
  - `index-KVOzr-lt.js` — 572.05 kB (192.91 kB gz) — unchanged from pre-3D baseline.
  - `SceneState-CUc5X9et.js` — 876.12 kB (232.37 kB gz) — three/drei/R3F runtime, **lazy async chunk**, fetched only when a scene mounts.
  - `SceneRenderer-lSJNCku0.js` — 39.44 kB, `Canvas3D-GyV20qNA.js` — 6.06 kB — lazy chunks.
- `npm run lint` (oxlint): 0 errors. 2 warnings, both `react(only-export-components)` fast-refresh advisories matching the pre-existing codebase pattern (`SmoothScroll.tsx:65`, `SceneState.tsx:15`).

## 7. Performance controls (design-intent, implemented)

- Single WebGL context per page (one canvas per page scene).
- `dpr` capped `[1, 2]`; particle budget scaled by performance profile (desktop 1600 / medium 1200 / low 800) and viewport size.
- IntersectionObserver gates `near`; frameloop switches between `always` (in view) and `demand` (out of view).
- Scene canvas never unmounts after first mount (visibility latch) — no context thrash on route visibility changes.

## 8. Known limitations

- `preserveDrawingBuffer: true` retained on the canvas — negligible cost for a single low-poly decorative scene and enables canvas debugging/screenshots.
- Low-mobile canvases render modest particle counts by design (restraint over spectacle).

## 9. Asset/licensing

All content procedural; no third-party assets. See `docs/3D_ASSET_LICENSES.md`.

**Overall: PASS — ship-ready.**