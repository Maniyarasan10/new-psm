/**
 * Math core lifted from the Studio Foundry playbook (§3.2/§3.4, §4.2).
 * Every scroll-progress value in the app derives from these units so all
 * animated motion shares one easing language (clamped inverse-mix → optional
 * ease → lerp), and every damped value is frame-rate independent.
 */

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Clamped inverse mix: 0 at a, 1 at b, clamped outside. */
export const cInverseMix = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);

export const mix = (a: number, b: number, t: number) => a * (1 - t) + b * t;

/** Hermite smoothstep on 0..1. */
export const smoothstep = (a: number, b: number, v: number) => {
  const t = cInverseMix(a, b, v);
  return t * t * (3 - 2 * t);
};

export const fit = (
  v: number,
  a: number,
  b: number,
  outA = 0,
  outB = 1,
  ease?: (t: number) => number,
) => {
  const t = cInverseMix(a, b, v);
  return mix(outA, outB, ease ? ease(t) : t);
};

/** Frame-rate-independent exponential damping: `p += (t-p) * (1-e^-k·dt)`. */
export const dampExp = (current: number, target: number, lambda: number, deltaTime: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * deltaTime));

/** Blend two 0xRRGGBB colors by a 0..1 factor (playbook scroll tinting). */
export function mixColorNum(from: number, to: number, t: number): number {
  const fr = (from >> 16) & 255;
  const fg = (from >> 8) & 255;
  const fb = from & 255;
  const tr = (to >> 16) & 255;
  const tg = (to >> 8) & 255;
  const tb = to & 255;
  const r = Math.round(mix(fr, tr, t));
  const g = Math.round(mix(fg, tg, t));
  const b = Math.round(mix(fb, tb, t));
  return ((r << 16) | (g << 8) | b) >>> 0;
}

export function mixColor(from: number, to: number, t: number): string {
  return `#${mixColorNum(from, to, t).toString(16).padStart(6, '0')}`;
}

/** Balanced two-line splitter so SplitText gets stable, even lines. */
export function splitBalanced(str: string): [string, string] {
  const words = str.trim().split(/\s+/);
  if (words.length < 2) return [str.trim(), ''];
  let best = Infinity;
  let at = 1;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (d < best) {
      best = d;
      at = i;
    }
  }
  return [words.slice(0, at).join(' '), words.slice(at).join(' ')];
}