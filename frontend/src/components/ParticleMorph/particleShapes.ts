export type ShapeKind = 'brain' | 'puzzle' | 'gears' | 'dna' | 'brand';
export const SHAPES: ShapeKind[] = ['brain', 'puzzle', 'gears', 'dna', 'brand'];
export const SHAPE_COUNT = SHAPES.length;

/**
 * One morph target. `positions` (count×3, object-local, radius ≤ 1) feed the
 * GPU atlas; `groups` (count) carry a per-particle assembly id straight into
 * the atlas `.w` channel so the shader can run per-group micro-behaviours
 * (puzzle piece, gear index, dna strand) at zero uniform cost.
 *
 * IMPORTANT – every procedural target is authored to fit inside a radius-1
 * sphere WITHOUT `scaleToUnit`, so the analytic assembly/rotation maths the
 * vertex shader mirrors (piece centres, gear centres, ring axes) match the
 * baked geometry exactly. Only the external targets (brain GLB, logo image)
 * are normalised on swap, since they carry no shader-side assembly math.
 */
export interface ShapeCloud {
  positions: Float32Array;
  groups: Float32Array;
}

export function scaleToUnit(points: Float32Array, target = 1): Float32Array {
  let max = 1e-6;
  for (let i = 0; i < points.length; i += 3) {
    const r = Math.hypot(points[i], points[i + 1], points[i + 2]);
    if (r > max) max = r;
  }
  const s = target / max;
  for (let i = 0; i < points.length; i++) points[i] *= s;
  return points;
}

/* Deterministic RNG so the procedural targets are identical on every mount.
   Cheap hash → 0..1 multiplied by a phase constant. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function allOnes(n: number): Float32Array {
  const g = new Float32Array(n);
  g.fill(1);
  return g;
}

function smooth(x: number, a: number, b: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/* ------------------------------------------------------------------ */
/* BRAIN — procedural fallback; swapped for the licensed GLB only once */
/* the mesh has been sampled by the engine. Folds + fissure + base.    */
/* ------------------------------------------------------------------ */
function brain(n: number): ShapeCloud {
  const out = new Float32Array(n * 3);
  const rnd = rng(101);
  const hw = 0.82;
  const hd = 0.6;
  const hh = 0.46;

  for (let i = 0; i < n; i++) {
    const u = rnd();
    const elev = Math.asin((2 * ((u + i * 0.0003) % 1) - 1)) / 2 + 0.35;
    const azi = rnd() * Math.PI * 2;
    let x = Math.cos(elev) * Math.cos(azi) * hw;
    let z = Math.cos(elev) * Math.sin(azi) * hd;
    let y = Math.sin(elev) * hh;

    const fold =
      1 +
      0.18 * Math.sin(x * 5.3 + y * 4.1) * Math.cos(z * 4.7 - y * 3.2) +
      0.1 * Math.sin(x * 11.7 + y * 9.3 + z * 7.1) * Math.cos(x * 8.3 - z * 6.1) +
      0.05 * Math.sin(x * 17.1 - y * 13.9 + z * 11.3) * Math.cos(y * 12.7 + z * 9.5);
    x *= fold;
    z *= fold * (0.92 + 0.1 * Math.sin(x * 3.1 + z * 2.7));

    x *= 1 - 0.35 * Math.exp(-(x * x) / 0.02);
    if (y < -0.14) y = -0.14 + (y + 0.14) * 0.25;

    out[i * 3] = x * (0.55 + rnd() * 0.45);
    out[i * 3 + 1] = y * (0.6 + rnd() * 0.4);
    out[i * 3 + 2] = z * (0.55 + rnd() * 0.45);
  }

  return { positions: out, groups: allOnes(n) };
}

/* ------------------------------------------------------------------ */
/* PUZZLE — 2×3 grid of genuinely interlocking 3D pieces. Every piece  */
/* is authored around its own centre ((c-0.5)*CW, (r-1)*CH) so the     */
/* shader can rigidly transport it between a scattered fan pose and    */
/* its interlocked seat. Internal seams use a Gaussian knob/blank cut  */
/* whose complementarity is baked into the geometry (watertight when   */
/* assembled) — the shader only needs the piece centres.               */
/* ------------------------------------------------------------------ */
const PUZZLE = { COLS: 2, ROWS: 3, CW: 0.75, CH: 0.4, T: 0.16, A: 0.16, S: 0.16, N: 0.35, NS: 0.5 };

function tabCurve(u: number): number {
  const g1 = Math.exp(-Math.pow((u - 0.5) / PUZZLE.S, 2));
  const g2 = Math.exp(-Math.pow((u - 0.5) / PUZZLE.NS, 2));
  return PUZZLE.A * (g1 - PUZZLE.N * g2);
}

function pieceBox(c: number, r: number) {
  const cx = (c - 0.5) * PUZZLE.CW;
  const cy = (r - 1) * PUZZLE.CH;
  return { cx, cy, x0: cx - PUZZLE.CW / 2, x1: cx + PUZZLE.CW / 2, y0: cy - PUZZLE.CH / 2, y1: cy + PUZZLE.CH / 2 };
}

/** Membership test for the top/bottom plate of piece (c,r). Rule: on every
    interior seam the piece with the lower id carries the tab (+c), its
    neighbour recedes (−c); the two surfaces exactly fill the rectangle. */
function inPiece(c: number, r: number, x: number, y: number): boolean {
  const { x0, x1, y0, y1 } = pieceBox(c, r);
  if (x < x0 - 0.05 || x > x1 + 0.13 || y < y0 - 0.05 || y > y1 + 0.13) return false;
  if (c > 0 && x < x0 - tabCurve((y - y0) / PUZZLE.CH)) return false;
  if (c < PUZZLE.COLS - 1 && x > x1 + tabCurve((y - y0) / PUZZLE.CH)) return false;
  if (r > 0 && y < y0 - tabCurve((x - x0) / PUZZLE.CW)) return false;
  if (r < PUZZLE.ROWS - 1 && y > y1 + tabCurve((x - x0) / PUZZLE.CW)) return false;
  return true;
}

/** Parametric wall boundary of a side (0=right,1=left,2=top,3=bottom). */
function wallPoint(c: number, r: number, side: number, u: number) {
  const { x0, x1, y0, y1 } = pieceBox(c, r);
  switch (side) {
    case 0:
      return { x: c < PUZZLE.COLS - 1 ? x1 + tabCurve(u) : x1, y: y0 + u * PUZZLE.CH, dx: 1, dy: 0 };
    case 1:
      return { x: c > 0 ? x0 - tabCurve(u) : x0, y: y0 + u * PUZZLE.CH, dx: -1, dy: 0 };
    case 2:
      return { x: x0 + u * PUZZLE.CW, y: r < PUZZLE.ROWS - 1 ? y1 + tabCurve(u) : y1, dx: 0, dy: 1 };
    default:
      return { x: x0 + u * PUZZLE.CW, y: r > 0 ? y0 - tabCurve(u) : y0, dx: 0, dy: -1 };
  }
}

function fillPuzzlePiece(out: Float32Array, groups: Float32Array, cursor: number, n: number, c: number, r: number): number {
  const rnd = rng(1000 + r * 10 + c);
  const { cx, cy } = pieceBox(c, r);
  const nTop = Math.floor(n * 0.72);
  const nBot = Math.floor(n * 0.1);
  const nWall = n - nTop - nBot;
  const gid = r * PUZZLE.COLS + c;
  let idx = cursor;

  const facePoint = () => {
    let x = 0;
    let y = 0;
    for (let t = 0; t < 64; t++) {
      x = cx - 0.45 + rnd() * 0.9;
      y = cy - 0.32 + rnd() * 0.64;
      if (inPiece(c, r, x, y)) break;
    }
    return [x, y];
  };

  for (let k = 0; k < nTop; k++) {
    const [x, y] = facePoint();
    out[idx * 3] = x;
    out[idx * 3 + 1] = y;
    out[idx * 3 + 2] = PUZZLE.T / 2;
    groups[idx] = gid;
    idx++;
  }
  for (let k = 0; k < nBot; k++) {
    const [x, y] = facePoint();
    out[idx * 3] = x;
    out[idx * 3 + 1] = y;
    out[idx * 3 + 2] = -PUZZLE.T / 2;
    groups[idx] = gid;
    idx++;
  }
  for (let k = 0; k < nWall; k++) {
    const side = k % 4;
    const u = rnd();
    const p = wallPoint(c, r, side, u);
    out[idx * 3] = p.x + p.dx * 0.012;
    out[idx * 3 + 1] = p.y + p.dy * 0.012;
    out[idx * 3 + 2] = rnd() * PUZZLE.T - PUZZLE.T / 2;
    groups[idx] = gid;
    idx++;
  }
  return idx;
}

function puzzle(n: number): ShapeCloud {
  const out = new Float32Array(n * 3);
  const groups = new Float32Array(n);
  const pieces = PUZZLE.COLS * PUZZLE.ROWS;
  const per = Math.floor(n / pieces);
  let idx = 0;
  for (let r = 0; r < PUZZLE.ROWS; r++) {
    for (let c = 0; c < PUZZLE.COLS; c++) {
      const take = r === PUZZLE.ROWS - 1 && c === PUZZLE.COLS - 1 ? n - idx : per;
      idx = fillPuzzlePiece(out, groups, idx, take, c, r);
    }
  }
  return { positions: out, groups };
}

/* ------------------------------------------------------------------ */
/* GEARS — one big gear plus three meshing satellites. Authored around */
/* each gear's own centre; the shader rotates each one about the same  */
/* analytic centre (origin for big, dir*0.68 for satellites at         */
/* 100°/220°/340°), big clockwise, satellites counter-clockwise at 2×. */
/* ------------------------------------------------------------------ */
function toothRadius(w: number, rTip: number, teeth: number): number {
  const rRoot = rTip * 0.82;
  const pitch = w * teeth;
  const u = pitch - Math.floor(pitch);
  const F = 0.55;
  const RAMP = 0.18;
  if (u >= F) return rRoot;
  const x = u / F;
  const up = smooth(x, 0, RAMP);
  const dn = 1 - smooth(x, 1 - RAMP, 1);
  return rRoot + (rTip - rRoot) * up * dn;
}

function fillGear(out: Float32Array, groups: Float32Array, cursor: number, n: number, rTip: number, teeth: number, zHalf: number, gid: number): number {
  const rnd = rng(2000 + teeth + gid * 17);
  const hub = rTip * 0.28;
  const nFace = Math.floor(n * 0.6);
  const nWall = Math.floor(n * 0.3);
  const nHub = n - nFace - nWall;
  let idx = cursor;

  for (let k = 0; k < nFace; k++) {
    const ang = rnd() * Math.PI * 2;
    const r = hub + (toothRadius(ang / (Math.PI * 2), rTip, teeth) - hub) * Math.sqrt(rnd());
    out[idx * 3] = Math.cos(ang) * r;
    out[idx * 3 + 1] = Math.sin(ang) * r;
    out[idx * 3 + 2] = (rnd() < 0.5 ? -1 : 1) * zHalf;
    groups[idx] = gid;
    idx++;
  }
  for (let k = 0; k < nWall; k++) {
    const ang = rnd() * Math.PI * 2;
    const r = toothRadius(ang / (Math.PI * 2), rTip, teeth) + 0.012;
    out[idx * 3] = Math.cos(ang) * r;
    out[idx * 3 + 1] = Math.sin(ang) * r;
    out[idx * 3 + 2] = rnd() * 2 * zHalf - zHalf;
    groups[idx] = gid;
    idx++;
  }
  for (let k = 0; k < nHub; k++) {
    const ang = rnd() * Math.PI * 2;
    out[idx * 3] = Math.cos(ang) * (hub - 0.008);
    out[idx * 3 + 1] = Math.sin(ang) * (hub - 0.008);
    out[idx * 3 + 2] = rnd() * 2 * zHalf - zHalf;
    groups[idx] = gid;
    idx++;
  }
  return idx;
}

const SAT_ANG = [1.7453, 3.8397, 5.9341];

function gears(n: number): ShapeCloud {
  const out = new Float32Array(n * 3);
  const groups = new Float32Array(n);
  const big = Math.floor(n * 0.4);
  const sat = Math.floor((n - big) / 3);
  const bigTotal = big + (n - big - sat * 3);
  let idx = fillGear(out, groups, 0, bigTotal, 0.48, 24, 0.09, 0);
  for (let g = 0; g < 3; g++) {
    const ao = SAT_ANG[g];
    const cx = Math.cos(ao) * 0.68;
    const cy = Math.sin(ao) * 0.68;
    const end = fillGear(out, groups, idx, sat, 0.2016, 12, 0.075, g + 1);
    for (let i = idx * 3; i < end * 3; i += 3) {
      out[i] += cx;
      out[i + 1] += cy;
    }
    idx = end;
  }
  return { positions: out, groups };
}

/* ------------------------------------------------------------------ */
/* DNA — double helix, radius 0.5, two counter-phased strands plus     */
/* rungs. The shader turns the helix and gives the strands a relative  */
/* counter-twist (group ids: 0 strand A, 1 strand B, 2 rungs).         */
/* ------------------------------------------------------------------ */
function dna(n: number): ShapeCloud {
  const out = new Float32Array(n * 3);
  const groups = new Float32Array(n);
  const rnd = rng(5300);
  const R = 0.5;
  const HALF = 0.8;
  const PER = (2 * Math.PI * 5.5) / (2 * HALF);
  const nA = Math.floor(n * 0.38);
  const nB = Math.floor(n * 0.38);
  let idx = 0;

  const strand = (phase: number, start: number, count: number, g: number) => {
    for (let k = 0; k < count; k++) {
      const t = rnd() * 2 * HALF - HALF;
      const a = t * PER + phase;
      const rr = R * (0.96 + rnd() * 0.05);
      out[(start + k) * 3] = Math.cos(a) * rr;
      out[(start + k) * 3 + 1] = t;
      out[(start + k) * 3 + 2] = Math.sin(a) * rr;
      groups[start + k] = g;
    }
    return start + count;
  };
  idx = strand(0, 0, nA, 0);
  idx = strand(Math.PI, idx, nB, 1);

  for (let i = idx; i < n; i++) {
    const t = -0.72 + (i - idx) * 1.44 / Math.max(1, n - idx - 1);
    const a = t * PER;
    const tt = (i - idx) / Math.max(1, n - idx);
    const uFrac = ((tt * 997) % 1) || 0.5;
    const ax = Math.cos(a) * R;
    const az = Math.sin(a) * R;
    const bx = Math.cos(a + Math.PI) * R;
    const bz = Math.sin(a + Math.PI) * R;
    out[i * 3] = ax + (bx - ax) * uFrac + (rnd() - 0.5) * 0.02;
    out[i * 3 + 1] = t;
    out[i * 3 + 2] = az + (bz - az) * uFrac + (rnd() - 0.5) * 0.02;
    groups[i] = 2;
  }

  return { positions: out, groups };
}

/* ------------------------------------------------------------------ */
/* BRAND — clean proportional slab placeholder; the engine hot-swaps   */
/* the composite logotype (mark + wordmark) in from sampleImage.       */
/* ------------------------------------------------------------------ */
function brand(n: number): ShapeCloud {
  const out = new Float32Array(n * 3);
  const rnd = rng(6100);
  const w = 1.5;
  const h = 0.44;
  for (let i = 0; i < n; i++) {
    out[i * 3] = (rnd() - 0.5) * w;
    out[i * 3 + 1] = (rnd() - 0.5) * h;
    out[i * 3 + 2] = (rnd() - 0.5) * 0.07;
  }
  return { positions: out, groups: allOnes(n) };
}

function buildPoints(kind: ShapeKind, n: number): ShapeCloud {
  switch (kind) {
    case 'brain':
      return brain(n);
    case 'puzzle':
      return puzzle(n);
    case 'gears':
      return gears(n);
    case 'dna':
      return dna(n);
    case 'brand':
      return brand(n);
  }
}

/**
 * All shape rows share the same point count N. Procedural targets are left
 * at their authored scale (radius ≤ 1); external targets are normalised on
 * swap in the engine. Each cloud returns per-particle group ids for the
 * atlas `.w` channel.
 */
export function buildAllShapePoints(count: number): ShapeCloud[] {
  return SHAPES.map((kind) => buildPoints(kind, count));
}
