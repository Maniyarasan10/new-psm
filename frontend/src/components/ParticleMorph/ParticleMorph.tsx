import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScrollTrigger } from '../../lib/gsapSetup';
import vertexShader from './particle.vert.glsl?raw';
import fragmentShader from './particle.frag.glsl?raw';
import { buildAllShapePoints, scaleToUnit, SHAPES, SHAPE_COUNT, type ShapeKind } from './particleShapes';
import { sampleModelSurface } from './sampleModel';
import { sampleImageToPoints } from './sampleImage';
import './ParticleMorph.css';

/**
 * Award-tier cinematic GPU particle-morph system for the PSM site.
 *
 * A single BufferGeometry + ShaderMaterial renders one shape made entirely of
 * tiny triangular facets. Five morph targets (brain → puzzle → gears →
 * DNA → brand) live in one RGBA **half-float** atlas — each
 * row a full TILE×TILE point cloud; the `.w` channel carries per-particle
 * group ids so the vertex shader can run per-group micro-behaviours
* (puzzle-piece assembly, gear meshing, helix twist, ...) at zero uniform
 *  cost. The vertex shader morphs on a wide, gently-eased window so each
 *  object dissolves into the next smoothly instead of snapping.
 *
 * TUNING (all here, safe to tweak):
 *   TIERS.count        particle budget per device tier (one shape cloud each)
 *   TIERS.dpr          render pixel ratio per tier (sharpness)
 *   TIERS.tile         shape-atlas tile resolution — one TILE×TILE row
 *   TIERS.opacity      overall particle brightness per tier
 *   U_SIZE             base facet size in CSS pixels
 *   HOVER_SWELL        cursor swell of the whole form
 *   COLORS             brand palette — see ParticleMorph.css for the tokens
 */
const PARTICLE_KNOBS = {
  SCROLL_REPEL_MAX: 0.35,
  U_SIZE: 9.0,
  POINT_MAX: 64.0,
  HOVER_SWELL: 0.045,
  COLORS: { primary: '#8052ff', accent: '#ffb829' },
} as const;

type Tier = 'desktop' | 'laptop' | 'tablet' | 'mobile';

interface TierConfig {
  count: number;
  dpr: number;
  opacity: number;
  scale: number;
  tile: number;
}

const TIERS: Record<Tier, TierConfig> = {
  desktop: { count: 120000, dpr: 2.4, opacity: 0.95, scale: 2.5, tile: 1024 },
  laptop: { count: 70000, dpr: 2.0, opacity: 0.9, scale: 2.3, tile: 768 },
  tablet: { count: 40000, dpr: 1.8, opacity: 0.8, scale: 2.0, tile: 512 },
  mobile: { count: 18000, dpr: 1.5, opacity: 0.7, scale: 1.8, tile: 512 },
};

/* Compact section figures — lighter budget, lower DPR, smaller tile. */
const COMPACT_TIERS: Record<Tier, TierConfig> = {
  desktop: { count: 24000, dpr: 2.0, opacity: 0.6, scale: 2.0, tile: 512 },
  laptop: { count: 18000, dpr: 1.8, opacity: 0.55, scale: 1.9, tile: 512 },
  tablet: { count: 12000, dpr: 1.6, opacity: 0.5, scale: 1.8, tile: 512 },
  mobile: { count: 8000, dpr: 1.4, opacity: 0.45, scale: 1.7, tile: 512 },
};

const CAMERA_Z = 7.2;
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function detectTier(): Tier {
  const w = window.innerWidth;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8;
  if (w <= 768 || coarse) return 'mobile';
  if (w <= 1024 || cores <= 4 || mem <= 4) return 'tablet';
  if (w <= 1600 || mem <= 8) return 'laptop';
  return 'desktop';
}

class ParticleMorphEngine {
  private host: HTMLElement;
  private tier: Tier;
  private reduced: boolean;
  private count: number;
  private tile: number;
  private homeScale = 1;
  private fullPage: boolean;
  private side: 'left' | 'right';
  private compact: boolean;

  private renderer: THREE.WebGLRenderer | null = null;
  private camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60);
  private scene = new THREE.Scene();
  private group = new THREE.Group();
  private geometry: THREE.BufferGeometry | null = null;
  private meshGeometry: THREE.BufferGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private meshMaterial: THREE.ShaderMaterial | null = null;
  private texture: THREE.DataTexture | null = null;
  private uniforms: Record<string, THREE.IUniform> = {};

  private rafId = 0;
  private last = 0;
  private time = 0;
  private progress = 0;
  private scrollP = 0;
  private scrollGoal = 0;
  private repelP = 0;
  private repelGoal = 0;
  private mouse = new THREE.Vector2(0, 0);
  private mouseGoal = new THREE.Vector2(0, 0);
  private hoverP = 0;
  private hoverGoal = 0;
  private cursor = new THREE.Vector2(0, 0);
  private cursorGoal = new THREE.Vector2(0, 0);
  private raycaster = new THREE.Raycaster();
  private hoverSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1);
  private cursorK = 2.6;

  private focusId = 0;
  private lastFocus = -1;
  private microP = 1;

  private st: ReturnType<typeof ScrollTrigger.create> | null = null;
  private io: IntersectionObserver | null = null;
  private visible = true;
  private disposed = false;
  private atlasData: Float32Array | null = null;

  private onResize = () => this.resize();
  private onPointer = (e: PointerEvent) => {
    this.mouseGoal.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    this.updateHover(e.clientX, e.clientY);
  };
  private onPointerLeave = () => {
    this.hoverGoal = 0;
    this.cursorGoal.set(0, 0);
  };
  private onVisibility = () => {
    this.renderer?.render(this.scene, this.camera);
  };

  constructor(host: HTMLElement, fullPage: boolean, side: 'left' | 'right' = 'right', compact = false) {
    this.host = host;
    this.fullPage = fullPage;
    this.side = side;
    this.compact = compact;
    this.tier = detectTier();
    this.reduced = window.matchMedia(REDUCED_QUERY).matches;
    const tile = (compact ? COMPACT_TIERS[this.tier] : TIERS[this.tier]).tile;
    this.tile = tile;
    this.count = Math.min((compact ? COMPACT_TIERS[this.tier] : TIERS[this.tier]).count, tile * tile);
  }

  init() {
    if (this.disposed) return;
    try {
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer = renderer;
      this.host.appendChild(renderer.domElement);

      const tierCfg = this.compact ? COMPACT_TIERS[this.tier] : TIERS[this.tier];
      const dpr = Math.min(tierCfg.dpr, window.devicePixelRatio || 1);
      renderer.setPixelRatio(dpr);
      renderer.setSize(this.host.clientWidth || 1, this.host.clientHeight || 1, false);

      this.camera.position.set(0, 0, CAMERA_Z);
      this.scene.add(this.group);

      /* ---------- Shape atlas (half-float, group id in .w) ---------- */
      const shapes = buildAllShapePoints(this.count);
      const atlasW = this.tile;
      const atlasH = this.tile * SHAPE_COUNT;
      const data = new Float32Array(atlasW * atlasH * 4);
      for (let s = 0; s < shapes.length; s++) {
        this.writeAtlasRow(data, s, shapes[s].positions, shapes[s].groups);
      }
      const data16 = new Uint16Array(data.length);
      for (let i = 0; i < data.length; i++) data16[i] = THREE.DataUtils.toHalfFloat(data[i]);
      const texture = new THREE.DataTexture(data16, atlasW, atlasH, THREE.RGBAFormat, THREE.HalfFloatType);
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      this.texture = texture;
      this.atlasData = data;

      /* ---------- Geometry ---------- */
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.count * 3), 3));

      /* aRandom — size variance, stagger, phase, tint select. */
      const rand = new Float32Array(this.count * 4);
      for (let i = 0; i < this.count; i++) {
        rand[i * 4] = 0.55 + Math.random() * 0.95;
        rand[i * 4 + 1] = Math.random();
        rand[i * 4 + 2] = Math.random();
        rand[i * 4 + 3] = Math.random();
      }
      geometry.setAttribute('aRandom', new THREE.BufferAttribute(rand, 4));

      /* aShape — x: layer (0 micro ~70%, 1 medium ~20%, 2 structural ~8%,
         3 floating ~2%), y: planar sprite rotation, z: brightness, w: seed2. */
      const shapeAttr = new Float32Array(this.count * 4);
      for (let i = 0; i < this.count; i++) {
        const h = Math.random();
        let layer = 1;
        if (h < 0.7) layer = 0;
        else if (h < 0.9) layer = 1;
        else if (h < 0.98) layer = 2;
        else layer = 3;
        shapeAttr[i * 4] = layer;
        shapeAttr[i * 4 + 1] = Math.random() * Math.PI * 2;
        shapeAttr[i * 4 + 2] = 0.7 + Math.random() * 0.6;
        shapeAttr[i * 4 + 3] = Math.random();
      }
      geometry.setAttribute('aShape', new THREE.BufferAttribute(shapeAttr, 4));
      geometry.setAttribute('aBarycentric', new THREE.BufferAttribute(new Float32Array(this.count * 3), 3));
      this.geometry = geometry;

      /* ---------- Material ---------- */
      this.uniforms = {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uMicro: { value: this.microP },
        uFocusId: { value: this.focusId },
        uExplosion: { value: 0 },
        uPixelRatio: { value: dpr },
        uSize: { value: PARTICLE_KNOBS.U_SIZE },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTile: { value: this.tile },
        uHover: { value: 0 },
        uCursor: { value: new THREE.Vector2(0, 0) },
        uCursorK: { value: this.cursorK },
        uMesh: { value: 0 },
        uAtlas: { value: texture },
        uShapeCount: { value: SHAPE_COUNT },
        uColor: { value: new THREE.Color(PARTICLE_KNOBS.COLORS.primary) },
        uAccent: { value: new THREE.Color(PARTICLE_KNOBS.COLORS.accent) },
        uOpacity: { value: this.fullPage ? tierCfg.opacity * 0.7 : tierCfg.opacity },
      };
      const material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
      this.material = material;

      this.group.add(new THREE.Points(geometry, material));

      const meshGeometry = new THREE.BufferGeometry();
      meshGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.count * 3), 3));
      meshGeometry.setAttribute('aRandom', new THREE.BufferAttribute(rand, 4));
      meshGeometry.setAttribute('aShape', new THREE.BufferAttribute(shapeAttr, 4));
      const barycentric = new Float32Array(this.count * 3);
      const indices: number[] = [];
      for (let i = 0; i + 2 < this.count; i += 3) {
        barycentric.set([1, 0, 0], i * 3);
        barycentric.set([0, 1, 0], (i + 1) * 3);
        barycentric.set([0, 0, 1], (i + 2) * 3);
        indices.push(i, i + 1, i + 2);
      }
      meshGeometry.setAttribute('aBarycentric', new THREE.BufferAttribute(barycentric, 3));
      meshGeometry.setIndex(indices);
      this.meshGeometry = meshGeometry;

      const meshUniforms = THREE.UniformsUtils.clone(this.uniforms);
      meshUniforms.uMesh.value = 1;
      const meshMaterial = new THREE.ShaderMaterial({
        uniforms: meshUniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      this.meshMaterial = meshMaterial;
      this.group.add(new THREE.Mesh(meshGeometry, meshMaterial));

      this.resize();

      /* ---------- Interaction ---------- */
      window.addEventListener('resize', this.onResize);
      window.addEventListener('pointermove', this.onPointer, { passive: true });
      window.addEventListener('pointerout', this.onPointerLeave, { passive: true });
      document.addEventListener('visibilitychange', this.onVisibility);

      this.io = new IntersectionObserver(
        (entries) => {
          this.visible = entries[0]?.isIntersecting ?? true;
        },
        { rootMargin: '120px' },
      );
      this.io.observe(this.host);

      this.st = this.fullPage
        ? ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: (self) => {
              this.scrollGoal = self.progress;
              this.repelGoal = Math.abs(self.getVelocity() / 3200);
            },
          })
        : ScrollTrigger.create({
            trigger: this.host,
            start: 'top top',
            end: 'bottom top',
            onUpdate: (self) => {
              this.scrollGoal = self.progress;
              this.repelGoal = Math.abs(self.getVelocity() / 3200);
            },
          });

      /* Hot-swap the licensed brain mesh + composite logotype into the atlas
         once loaded — never blocks first paint. */
      this.upgradeExternalTargets();

      if (this.reduced) {
        this.renderFrame();
        return;
      }

      this.progress = 0;
      this.lastFocus = this.focusId;
      this.last = performance.now();
      this.rafId = requestAnimationFrame(this.tick);
    } catch (err) {
      console.error('ParticleMorph failed to initialise', err);
      this.dispose();
    }
  }

  /** Write one shape row into the atlas buffer (positions + group ids). */
  private writeAtlasRow(data: Float32Array, shape: number, src: Float32Array, groups: Float32Array) {
    const tile = this.tile;
    for (let i = 0; i < this.count; i++) {
      const col = i % tile;
      const row = Math.floor(i / tile);
      const base = ((shape * tile + row) * tile + col) * 4;
      data[base] = src[i * 3];
      data[base + 1] = src[i * 3 + 1];
      data[base + 2] = src[i * 3 + 2];
      data[base + 3] = groups.length > i ? groups[i] : 1;
    }
  }

  /** Re-encode the float atlas buffer into the texture's half-float storage. */
  private encodeAtlas() {
    const img = this.texture?.image.data as Uint16Array | undefined;
    const d = this.atlasData;
    if (!img || !d) return;
    for (let i = 0; i < d.length; i++) img[i] = THREE.DataUtils.toHalfFloat(d[i]);
    if (this.texture) this.texture.needsUpdate = true;
  }

  /** Replace a shape row in-place with externally sampled points. */
  private swapShape(shape: ShapeKind, points: Float32Array) {
    if (this.disposed || !this.atlasData || !this.texture) return;
    const idx = SHAPES.indexOf(shape);
    if (idx < 0) return;
    this.writeAtlasRow(this.atlasData, idx, scaleToUnit(points), new Float32Array(0));
    this.encodeAtlas();
    if (this.reduced) this.renderFrame();
  }

  /** Pointer → 3D hit test against the object's bounding sphere. */
  private updateHover(cx: number, cy: number) {
    if (this.disposed) {
      this.hoverGoal = 0;
      return;
    }
    const rect = this.host.getBoundingClientRect();
    if (cx < rect.left || cx > rect.right || cy < rect.top || cy > rect.bottom) {
      this.hoverGoal = 0;
      this.cursorGoal.set(0, 0);
      return;
    }
    const ndc = new THREE.Vector2((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(ndc, this.camera);
    const s = Math.max(this.homeScale, this.group.scale.x || 1);
    this.hoverSphere.center.copy(this.group.position);
    this.hoverSphere.radius = s * 1.25;
    this.hoverGoal = this.raycaster.ray.intersectSphere(this.hoverSphere, new THREE.Vector3()) ? 1 : 0;
    this.cursorGoal.set(ndc.x, ndc.y);
  }

  /** Sample the licensed brain mesh + the composite logotype off-thread. */
  private upgradeExternalTargets() {
    const base = import.meta.env.BASE_URL ?? '/';

    const brainUrl = `${base}models/brain-low-poly/Brain_Low_Poly.glb`;
    const logoUrl = `${base}logo.webp`;

    void sampleModelSurface(brainUrl, this.count, { normalize: false, surfaceJitter: 0.018, curveBoost: 18 })
      .then((pts) => this.swapShape('brain', pts))
      .catch((err) => console.warn('Brain mesh fallback kept (procedural).', err));

    void sampleImageToPoints(logoUrl, this.count)
      .then((pts) => this.swapShape('brand', pts))
      .catch((err) => console.warn('Brand mark fallback kept (procedural slab).', err));
  }

  private tick = (now: number) => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.tick);
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    if (dt <= 0) return;

    if (!this.visible || document.hidden) return;

    this.time += dt;
    this.update(dt);
    this.renderer?.render(this.scene, this.camera);
  };

  private update(dt: number) {
    /* Framerate-independent damping — GSAP-level smoothness, no tweens. */
    const k = 1 - Math.exp(-dt * 2.2);
    this.scrollP += (this.scrollGoal - this.scrollP) * k;
    const mk = 1 - Math.exp(-dt * 2.6);
    this.mouse.lerp(this.mouseGoal, mk);
    const hk = 1 - Math.exp(-dt * 7.5);
    this.hoverP += (this.hoverGoal - this.hoverP) * hk;
    this.cursor.lerp(this.cursorGoal, mk);

    const rk = 1 - Math.exp(-dt * 4.5);
    this.repelP += (this.repelGoal - this.repelP) * rk;
    this.repelP *= 0.92;

    /* The morph advances ONLY with scroll. scrollP (0..1 across the whole
       page) maps onto the full brain→puzzle→gears→dna→brand story, brain
       holding at the top and the logotype at the bottom. */
    this.progress = this.scrollP * (SHAPE_COUNT - 1);

    /* Focus-hold shape selection + the per-visit micro ramp: uMicro sleeps at
       0, then resolves to 1 as a shape is focused, so each object performs
       its behaviour (assemble / rotate / spin-up / launch / twist) each time
       it is given the stage. */
    const frc = this.progress - Math.floor(this.progress);
    const fid = Math.floor(this.progress) + (frc < 0.5 ? 0 : 1);
    this.focusId = Math.max(0, Math.min(SHAPE_COUNT - 1, fid));
    if (this.focusId !== this.lastFocus) {
      this.lastFocus = this.focusId;
      this.microP = 0;
    }
    this.microP += (1 - this.microP) * (1 - Math.exp(-dt * 2.2));
    if (this.compact) this.microP = 1;

    const hover = this.hoverP;
    this.uniforms.uTime.value = this.time;
    this.uniforms.uProgress.value = this.progress;
    this.uniforms.uMicro.value = this.microP;
    this.uniforms.uFocusId.value = this.focusId;
    this.uniforms.uExplosion.value = Math.min(PARTICLE_KNOBS.SCROLL_REPEL_MAX, this.repelP);
    (this.uniforms.uMouse.value as THREE.Vector2).copy(this.mouse);
    this.uniforms.uHover.value = hover;
    (this.uniforms.uCursor.value as THREE.Vector2).copy(this.cursor);

    if (this.meshMaterial) {
      for (const key of Object.keys(this.uniforms)) {
        if (key !== 'uMesh' && this.meshMaterial.uniforms[key]) {
          this.meshMaterial.uniforms[key].value = this.uniforms[key].value;
        }
      }
    }

  /* Keep the camera mostly steady while the stage gets a slow, continuous
     sense of depth. The restrained orbit and float make every shape feel
     alive without competing with the scroll-driven morph. */
  this.camera.position.set(
    this.mouse.x * 0.45,
    0.12 - this.mouse.y * 0.3,
    CAMERA_Z * (1.0 - this.repelP * 0.18),
  );
  this.camera.lookAt(0, 0, 0);

  const idleTurn = this.time * 0.12;
  const idleFloat = Math.sin(this.time * 0.72) * 0.08;
  const idleSway = Math.sin(this.time * 0.46 + 0.8) * 0.035;
  const hoverAmp = 1 + hover * 1.6;
  const compactTilt = this.compact ? Math.PI * (this.side === 'left' ? 0.18 : -0.18) : 0;
  this.group.position.y = idleFloat;
  this.group.position.z = idleSway;
  this.group.rotation.set(
    this.mouse.y * 0.055 * hoverAmp + Math.sin(idleTurn * 0.7) * 0.035 + (this.compact ? 0.18 : 0),
    compactTilt + this.mouse.x * 0.05 * hoverAmp + idleTurn,
    -this.mouse.x * 0.045 * hoverAmp + Math.cos(idleTurn * 0.8) * 0.025 + (this.compact && this.side === 'left' ? 0.12 : 0),
  );
  this.group.scale.setScalar(this.homeScale * (1 + hover * PARTICLE_KNOBS.HOVER_SWELL));
  }

  private renderFrame() {
    this.camera.aspect = this.host.clientWidth / Math.max(this.host.clientHeight, 1);
    this.camera.updateProjectionMatrix();
    this.renderer?.render(this.scene, this.camera);
  }

  private resize() {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer?.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const dpr = Math.min((this.compact ? COMPACT_TIERS[this.tier] : TIERS[this.tier]).dpr, window.devicePixelRatio || 1);
    if (this.uniforms.uPixelRatio) this.uniforms.uPixelRatio.value = dpr;

    const tierCfg = this.compact ? COMPACT_TIERS[this.tier] : TIERS[this.tier];
    let base = tierCfg.scale;
    if (this.fullPage) {
      this.group.position.x = 0;
      base = Math.max(0.6, tierCfg.scale * 0.9);
      this.group.scale.setScalar(base);
    } else if (this.compact) {
      this.group.position.x = 0;
      this.group.rotation.y = this.side === 'left' ? 0.5 : -0.5;
      base = tierCfg.scale * (this.tier === 'mobile' || w / h < 1.2 ? 0.85 : 1);
      this.group.scale.setScalar(base);
    } else {
      this.group.position.x =
        this.tier === 'mobile' || w / h < 1.1 ? 0 : w / h > 1.5 ? 1.95 : 1.25;
      base = tierCfg.scale;
      this.group.scale.setScalar(base);
    }
    this.homeScale = base;

    /* NDC → object-local cursor scale: keeps the hover ripple pinned to the
       pointer regardless of viewport size or device resolution. */
    const halfH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * CAMERA_Z;
    this.cursorK = base > 0 ? (halfH * this.camera.aspect) / base : 1;
    if (this.uniforms.uCursorK) this.uniforms.uCursorK.value = this.cursorK;

    if (this.reduced) this.renderFrame();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    window.removeEventListener('pointerout', this.onPointerLeave);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.io?.disconnect();
    this.st?.kill();
    this.st = null;

    this.scene.remove(this.group);
    this.group.clear();

    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }
    if (this.meshGeometry) {
      this.meshGeometry.dispose();
      this.meshGeometry = null;
    }
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
    if (this.meshMaterial) {
      this.meshMaterial.dispose();
      this.meshMaterial = null;
    }
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
      if (this.renderer.domElement.parentElement === this.host) {
        this.host.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
  }
}

/**
 * Imperative Three.js kept out of React's render path: every GPU resource
 * lives behind refs, the effect creates + disposes the engine, and no React
 * re-render ever fires from the animation loop.
 */
export default function ParticleMorph({
  fullPage = false,
  compact = false,
  side = 'right',
}: {
  fullPage?: boolean;
  compact?: boolean;
  side?: 'left' | 'right';
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const engine = new ParticleMorphEngine(host, fullPage, side, compact);
    engine.init();
    return () => engine.dispose();
  }, [fullPage, compact, side]);

  return (
    <div
      ref={hostRef}
      className={`particle-morph${fullPage ? ' particle-morph--page' : ''}${compact ? ' particle-morph--compact' : ''}`}
      aria-hidden="true"
    />
  );
}