/**
 * Brand logotype → particle target.
 *
 * Loads the PSM mark, detects its ink colour and background, then composes a
 * single clean logotype: the mark at the left and a bold uppercase **PSM**
 * wordmark set in the mark's own ink colour to the right. Ink pixels of the
 * composite are sampled into `count` points that keep the true aspect ratio
 * on a near-flat plane (±0.03 z) — a legit 3D morph target that reads as the
 * brand at rest.
 */

const MAX_RENDER_HEIGHT = 480;

type Ink = { r: number; g: number; b: number };

function detectBackground(data: Uint8ClampedArray, w: number, h: number) {
  const corners = [
    [0, 1], [w - 1, 1], // top
    [0, h - 2], [w - 1, h - 2], // bottom
  ] as const;
  let r = 0, g = 0, b = 0, a = 0;
  for (const [x, y] of corners) {
    const i = (y * w + x) * 4;
    r += data[i]; g += data[i + 1]; b += data[i + 2]; a += data[i + 3];
  }
  return {
    r: r / 4, g: g / 4, b: b / 4, a: a / 4,
    light: a / 4 >= 200 && (r + g + b) / (3 * 255) > 0.55,
  };
}

function isInk(data: Uint8ClampedArray, i: number, bg: ReturnType<typeof detectBackground>): boolean {
  const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
  if (a < 40) return false;
  if (bg.light) return r * 0.3 + g * 0.59 + b * 0.11 < 0.72 * 255;
  const lum = r * 0.3 + g * 0.59 + b * 0.11;
  const bgLum = bg.r * 0.3 + bg.g * 0.59 + bg.b * 0.11;
  return Math.abs(lum - bgLum) > 45 || a < 200;
}

/** Average colour of the mark's own ink (used to ink the wordmark). */
function averageInk(data: Uint8ClampedArray, w: number, h: number, bg: ReturnType<typeof detectBackground>): Ink {
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    if (!isInk(data, p, bg)) continue;
    r += data[p]; g += data[p + 1]; b += data[p + 2]; n++;
  }
  if (n === 0) return { r: 70, g: 30, b: 150 };
  return { r: r / n, g: g / n, b: b / n };
}

function sampleCanvas(canvas: HTMLCanvasElement, count: number): Float32Array {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D unavailable.');
  const { data } = ctx.getImageData(0, 0, w, h);

  const ink: number[] = [];
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    if (data[p + 3] > 48) ink.push(i);
  }
  if (ink.length < 8) throw new Error('Brand mark has too little ink to sample.');

  const out = new Float32Array(count * 3);
  const inv = 1 / Math.max(w, h);
  /* Even, stratified coverage: split the row-major ink scan into `count`
     equal bands and place one particle in each. Deterministic placement
     ahead of pure-random picking means the logotype's thin strokes get
     neighbours to the full silhouette instead of clumping on thick ink —
     the wordmark reads crisp and complete rather than broken/spotty. A
     tiny in-band jitter keeps it organic, never a visible grid. */
  const band = ink.length / count;
  for (let i = 0; i < count; i++) {
    const jitter = (Math.random() - 0.5) * band;
    const s = Math.min(ink.length - 1, Math.max(0, (i + 0.5) * band + jitter));
    const idx = ink[s | 0];
    const px = idx % w;
    const py = (idx / w) | 0;
    out[i * 3] = (px / w * 2 - 1) * (w * inv);
    out[i * 3 + 1] = (1 - py / h * 2) * (h * inv);
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
  }
  return out;
}

export async function sampleImageToPoints(url: string, count: number): Promise<Float32Array> {
  const img = new Image();
  img.decoding = 'async';
  img.crossOrigin = 'anonymous';
  img.src = url;
  await img.decode();

  const scale = Math.min(1, (MAX_RENDER_HEIGHT * 2) / img.naturalWidth);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const probe = document.createElement('canvas');
  probe.width = w;
  probe.height = h;
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  if (!pctx) throw new Error('Canvas 2D unavailable.');
  pctx.drawImage(img, 0, 0, w, h);
  const { data } = pctx.getImageData(0, 0, w, h);
  const bg = detectBackground(data, w, h);
  const ink = averageInk(data, w, h, bg);
  const markAspect = w / h;

  /* Compose the logotype: mark on the left, spaced PSM caps on the right. */
  const fh = MAX_RENDER_HEIGHT;
  const markW = Math.round(fh * markAspect);
  const gap = Math.round(fh * 0.16);
  const canvas = document.createElement('canvas');
  const ctx2 = canvas.getContext('2d');
  if (!ctx2) throw new Error('Canvas 2D unavailable.');

  const word = 'PSM';
  ctx2.font = `900 ${Math.round(fh * 0.86)}px Arial, Helvetica, sans-serif`;
  ctx2.textBaseline = 'middle';
  const track = Math.round(fh * 0.09);
  let wordW = 0;
  for (const ch of word) wordW += ctx2.measureText(ch).width + track;
  wordW -= track;

  canvas.width = markW + gap + wordW;
  canvas.height = fh;
  const rgba = `rgb(${Math.round(ink.r)},${Math.round(ink.g)},${Math.round(ink.b)})`;
  ctx2.fillStyle = rgba;

  ctx2.drawImage(img, 0, 0, markW, fh);
  /* The probe recorded the mark on a possibly-lighter backing sheet; stamp
     the composited mark with the sampled ink so it unifies with the text. */
  ctx2.globalCompositeOperation = 'source-in';
  ctx2.fillRect(0, 0, markW, fh);
  ctx2.globalCompositeOperation = 'source-over';

  let x = markW + gap;
  const y = fh / 2;
  for (const ch of word) {
    ctx2.fillText(ch, x, y);
    x += ctx2.measureText(ch).width + track;
  }

  return sampleCanvas(canvas, count);
}

/** Tile-shaped fallback used if the image cannot be sampled. */
export function fallbackBrandMark(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const w = 1.35;
  const h = 0.5;
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * w;
    const y = (Math.random() - 0.5) * h;
    const z = (Math.random() - 0.5) * 0.07;
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}