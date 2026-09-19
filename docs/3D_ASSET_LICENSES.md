# 3D Asset Licensing

**Status: All assets procedural — zero external licensing surface.**

Every element rendered by the 3D system is generated procedurally at runtime and contains **no imported models, textures, images, sounds, or fonts**. There is nothing to license for commercial distribution.

## Runtime dependencies

| Package | Version | License | Purpose |
| --- | --- | --- | --- |
| `three` | ^0.185.1 | MIT | WebGL renderer (geometry, materials, math) |
| `@react-three/fiber` | ^9.7.0 | MIT | React renderer for three.js |
| `@react-three/drei` | ^10.7.8 | MIT | Helpers: `<Float>`, `<Lightformer>` (imported; lazy chunk) |
| `@types/three` | ^0.185.4 | MIT | TypeScript typings (dev dependency) |

All four are MIT-licensed; no attribution required beyond license retention in `node_modules`/bundles.

## Procedural content

| Scene/variant | Built from | Licensed assets? |
| --- | --- | --- |
| ParticleField (home-hero, solutions-hub, default) | InstancedMesh + seeded PRNG positions/colors | None |
| OrbitalRings (about, aura) | TorusGeometry + line rings derived from code | None |
| WireGlobe (products-hub) | IcosahedronGeometry wireframe + orbiting particle | None |
| NodeGraph (ai) | Points + Line segments from seeded flowchart topology | None |
| DataLattice (business-systems, automation) | BoxGeometry lattice + center sphere | None |
| StackLayers (product-engineering) | BoxGeometry stack, scroll-driven assembly | None |
| DeviceShells (web-mobile, hardware-iot) | BoxGeometry + clamped primitives (desk) / capsules + chips (iot) | None |
| ContactOrb (contact) | Sphere + rings from geometry | None |

- All geometry from three.js built-in `BufferGeometry` subclasses — no external `.gltf`/`.fbx`/`.glb`.
- No textures: colors come from the PSM palette (`src/components/3d/theme/PSMColors.ts`) resolved at runtime.
- No external fonts, images, or audio in any scene or fallback.

## Fonts

Scene rendering does not use fonts. Page typography uses the existing self-hosted PP Neue Montreal asset set, unchanged by this work.

## Conclusion

Redistribution of this site carries no 3D-related third-party attribution obligations beyond the MIT licenses of `three`, `@react-three/fiber`, and `@react-three/drei`.