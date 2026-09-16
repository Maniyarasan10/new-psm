import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

type GLTF = Awaited<ReturnType<GLTFLoader['loadAsync']>>;

/**
 * Mesh → particle target.
 *
 * Takes a .glb/.gltf model, extracts triangle soup in world space, then does
 * **curvature-aware, area-weighted** surface sampling to produce `count`
 * point positions. Every triangle is weighted by `area × (1 + BOOST×κ)` where
 * κ is a cheap dihedral-approximation: the average angle mismatch between the
 * face normal and the three smoothed vertex normals from the source mesh.
 * Folds, ridges and landscape features of the brain therefore receive more
 * particles than the flat sweep of the lobes — the sampled cloud "carves" the
 * silhouette instead of washing it out.
 *
 * Sampling is O(count) after an O(triangles) build, using one flat typed
 * array and a precomputed cumulative-weight table. No allocations per sample.
 */

type SampleOptions = {
  /** Scale so the model fits inside a unit sphere. Default true. */
  normalize?: boolean;
  /** How far samples may sit off the surface (fraction of tri size). */
  surfaceJitter?: number;
  /** How strongly curved triangles are favoured over flat ones. */
  curveBoost?: number;
};

function collectTriangleSoup(gltf: GLTF): { tris: Float32Array; normals: Float32Array } {
  const triVertices: number[] = [];
  const triNormals: number[] = [];
  const dummy = new THREE.Vector3();
  const ndummy = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();

  gltf.scene.updateWorldMatrix(true, true);
  gltf.scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!(mesh as THREE.Mesh).isMesh) return;
    const geo = mesh.geometry as THREE.BufferGeometry;
    if (!geo || !geo.getAttribute('position')) return;

    const g = geo.index ? geo.toNonIndexed() : geo;
    const pos = g.getAttribute('position');
    const nor = g.getAttribute('normal');
    normalMatrix.getNormalMatrix(mesh.matrixWorld);

    for (let i = 0; i < pos.count; i++) {
      dummy.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(mesh.matrixWorld);
      triVertices.push(dummy.x, dummy.y, dummy.z);
      if (nor) {
        ndummy.set(nor.getX(i), nor.getY(i), nor.getZ(i)).applyMatrix3(normalMatrix).normalize();
        triNormals.push(ndummy.x, ndummy.y, ndummy.z);
      }
    }
  });

  return { tris: new Float32Array(triVertices), normals: new Float32Array(triNormals) };
}

function sampleSurface(
  tris: Float32Array,
  normals: Float32Array,
  count: number,
  jitter: number,
  curveBoost: number,
): Float32Array {
  const triCount = tris.length / 9;
  const hasNormals = normals.length === tris.length;
  const weights = new Float64Array(triCount);
  let total = 0;

  for (let t = 0; t < triCount; t++) {
    const o = t * 9;
    const ax = tris[o], ay = tris[o + 1], az = tris[o + 2];
    const bx = tris[o + 3], by = tris[o + 4], bz = tris[o + 5];
    const cx = tris[o + 6], cy = tris[o + 7], cz = tris[o + 8];
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const vx = cx - ax, vy = cy - ay, vz = cz - az;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const area = 0.5 * Math.sqrt(nx * nx + ny * ny + nz * nz);

    /* Dihedral-approximation curvature κ: 1 − dot(face normal, vertex
       normal), averaged over the three vertices. Flat smooth regions ≈ 0,
       creases/folds approach 1 (per-vertex). */
    let kappa = 0;
    if (hasNormals && area > 1e-10) {
      const il = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
      const fnx = nx * il, fny = ny * il, fnz = nz * il;
      for (let v = 0; v < 3; v++) {
        const no = o + v * 3;
        const d = fnx * normals[no] + fny * normals[no + 1] + fnz * normals[no + 2];
        kappa += 1 - Math.min(1, Math.max(-1, d));
      }
      kappa /= 3;
    }
    const weight = area * (1 + curveBoost * kappa);
    total += weight;
    weights[t] = total;
  }

  const out = new Float32Array(count * 3);
  const r1 = new Float32Array(count);
  const r2 = new Float32Array(count);
  const pick = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    r1[i] = Math.random();
    r2[i] = Math.random();
    pick[i] = Math.random() * total;
  }

  for (let i = 0; i < count; i++) {
    let lo = 0, hi = triCount - 1;
    const target = pick[i];
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (weights[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const t = lo;
    const o = t * 9;
    const ax = tris[o], ay = tris[o + 1], az = tris[o + 2];
    const bx = tris[o + 3], by = tris[o + 4], bz = tris[o + 5];
    const cx = tris[o + 6], cy = tris[o + 7], cz = tris[o + 8];

    const su = Math.sqrt(r1[i]);
    const a = 1 - su;
    const b = su * (1 - r2[i]);
    const c = su * r2[i];

    let px = ax * a + bx * b + cx * c;
    let py = ay * a + by * b + cy * c;
    let pz = az * a + bz * b + cz * c;

    if (jitter > 0) {
      const ux = bx - ax, uy = by - ay, uz = bz - az;
      const vx = cx - ax, vy = cy - ay, vz = cz - az;
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      const k = (Math.random() - 0.5) * jitter;
      px += nx * k; py += ny * k; pz += nz * k;
    }

    out[i * 3] = px;
    out[i * 3 + 1] = py;
    out[i * 3 + 2] = pz;
  }

  return out;
}

function normalize(points: Float32Array): Float32Array {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < points.length; i += 3) {
    minX = Math.min(minX, points[i]); maxX = Math.max(maxX, points[i]);
    minY = Math.min(minY, points[i + 1]); maxY = Math.max(maxY, points[i + 1]);
    minZ = Math.min(minZ, points[i + 2]); maxZ = Math.max(maxZ, points[i + 2]);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;

  for (let i = 0; i < points.length; i += 3) {
    points[i] = ((points[i] - cx) / extent) * 2;
    points[i + 1] = ((points[i + 1] - cy) / extent) * 2;
    points[i + 2] = ((points[i + 2] - cz) / extent) * 2;
  }
  return points;
}

/** Load a model and surface-sample it into `count` curvature-aware particles. */
export async function sampleModelSurface(
  url: string,
  count: number,
  options: SampleOptions = {},
): Promise<Float32Array> {
  const { normalize: shouldNormalize = true, surfaceJitter = 0.03, curveBoost = 18 } = options;
  const gltf = await new GLTFLoader().loadAsync(url);
  const { tris, normals } = collectTriangleSoup(gltf);
  if (tris.length < 9) throw new Error('Model contains no triangle geometry.');
  let points = sampleSurface(tris, normals, count, surfaceJitter, curveBoost);
  if (shouldNormalize) points = normalize(points);
  return points;
}