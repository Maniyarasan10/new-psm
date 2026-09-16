precision highp float;

uniform float uTime;
uniform float uProgress;      // 0..SHAPE_COUNT-1 — continuous scroll sweep
uniform float uMicro;         // 0..1 — focus-hold behaviour envelope (CPU damped)
uniform float uFocusId;       // which shape's micro-behaviour is live
uniform float uExplosion;     // 0..~0.5 — scroll-velocity reform surge
uniform float uPixelRatio;
uniform float uSize;
uniform float uTile;          // shape-atlas tile resolution (TILE×TILE per shape)
uniform float uHover;         // 0..1 — cursor resting on the object
uniform vec2  uCursor;        // smoothed pointer NDC, -1..1
uniform float uCursorK;       // NDC → object-local cursor scale (aspect/zoom aware)
uniform vec2  uMouse;         // smoothed normalized pointer, -1..1
uniform float uMesh;          // 0 for particles, 1 for the facet mesh overlay
uniform sampler2D uAtlas;     // half-float shape atlas, SHAPE_COUNT rows of TILE*TILE
uniform float uShapeCount;

attribute vec4 aRandom;       // x = size var, y = stagger delay, z = noise phase, w = tint select
attribute vec4 aShape;        // x = layer (0 micro / 1 medium / 2 structural / 3 floating)
attribute vec3 aBarycentric;  // triangle coordinates used by the mesh edge pass
                              // y = planar sprite rotation, z = brightness, w = seed2

varying float vTint;
varying float vHover;
varying float vLayer;
varying float vRot;
varying float vBright;
varying float vDepth;
varying float vPulse;
varying vec3 vBarycentric;

/* ---------- helpers ---------- */
mat3 rotY(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}
mat3 rotX(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}
float smstep(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
vec2 hash2(float n) {
  return vec2(
    fract(sin(n * 1.271 + 311.7) * 43758.5453),
    fract(cos(n * 2.695 + 183.3) * 28001.8384)
  );
}

void main() {
  int vid = gl_VertexID;
  int tile = int(uTile + 0.5);
  float col = float(vid % tile);
  float row = float(vid / tile);
  vec2 uvBase = (vec2(col, row) + 0.5) / uTile;

  /* ---- Sample the two neighbouring shape rows ---- */
  float p = uProgress;
  float fI = floor(p);
  float fr = fract(p);
  float idxA = mod(fI, uShapeCount);
  float idxB = mod(fI + 1.0, uShapeCount);

  vec3 posA = texture2D(uAtlas, vec2(uvBase.x, (idxA + uvBase.y) / uShapeCount)).xyz;
  vec3 posB = texture2D(uAtlas, vec2(uvBase.x, (idxB + uvBase.y) / uShapeCount)).xyz;

  /* Smooth, wide morph: the old form begins dissolving early and the new
     one only fully resolves late, so objects grow out of each other gently
     instead of snapping in while scrolling. A per-particle stagger keeps
     the reform organic, never a mechanical crossfade. */
  float ct = clamp((fr - 0.16) / 0.68, 0.0, 1.0);
  float e = smstep(ct);
  e = clamp(e + (aRandom.y - 0.5) * 0.22, 0.0, 1.0);
  vec3 pos = mix(posA, posB, e);

  /* Transitional drift: particles wander off their straight-line path mid
     flight (zero at both ends), so the reform reads as flowing matter. */
  float dfl = sin(e * 3.14159);
  float dk = dfl * 0.10;
  pos += vec3(
    sin(aRandom.z * 6.31 + uTime * 0.28 + pos.y * 1.9) * dk,
    cos(aRandom.w * 5.77 + uTime * 0.31 + pos.x * 1.7) * dk,
    sin(aRandom.z * 4.93 + uTime * 0.24 + pos.z * 2.1) * dk
  );

  /* Group id of the shape we are effectively on — drives micro-behaviours. */
  float effIdx = fr < 0.5 ? idxA : idxB;
  float aGroup = texture2D(uAtlas, vec2(uvBase.x, (effIdx + uvBase.y) / uShapeCount)).w;

  /* ---- Living field: layer-modulated drift + an organic micro-breathe ---- */
  float layer = aShape.x;

  /* Micro-behaviour envelope: only while the shape is actually held by the
     scroll (off exactly at morph midpoints). */
  float hold = (1.0 - smoothstep(0.15, 0.38, fr)) + smoothstep(0.62, 0.85, fr);
  float micro = uMicro * clamp(hold, 0.0, 1.0);

  int fid = int(uFocusId + 0.5);

  if (fid == 1) {
    /* ---- PUZZLE: scattered pieces float, rotate, and interlock ---- */
    float gid = aGroup;
    float cc = floor(mod(gid, 2.0));
    float rr = floor(gid / 2.0);
    vec2 h = hash2(gid);
    vec2 pc = vec2((cc - 0.5) * 0.75, (rr - 1.0) * 0.4);
    float s = 1.0 - micro;
    float rot = s * (0.9 + h.y) * (cc < 0.5 ? 1.0 : -1.0);
    vec2 fan = vec2((cc - 0.5) * 1.15 + h.x * 0.24, (rr - 1.0) * 0.6 + h.y * 0.18) * s;
    float ca = cos(rot);
    float sa = sin(rot);
    vec2 lp = vec2(pos.x * ca - pos.y * sa, pos.x * sa + pos.y * ca);
    pos.xy = lp + mix(fan, pc, micro);
    pos.y += sin(uTime * 1.15 + gid * 0.9) * 0.025 * (0.35 + micro);
    pos.z *= 1.0 - 0.72 * s;
    pos.z += mix(-0.55 - 0.4 * h.x, 0.0, micro);
  } else if (fid == 2) {
    /* ---- GEARS: meshed rotation about analytic centres ---- */
    float gid = aGroup;
    vec2 cent = vec2(0.0);
    if (gid >= 0.5) {
      float ga = 1.7453 + 2.0944 * (gid - 1.0);
      cent = vec2(cos(ga), sin(ga)) * 0.68;
    }
     /* The large gear and satellites counter-rotate continuously, while the
       cursor adds a small extra torque when the visitor leans in. */
    float spd = gid < 0.5 ? 1.0 : -1.6;
     float ang = uTime * 0.38 * spd + uCursor.y * 0.55 * uHover * spd;
    pos.xy -= cent;
    float ca = cos(ang);
    float sa = sin(ang);
    pos.xy = vec2(pos.x * ca - pos.y * sa, pos.x * sa + pos.y * ca);
    pos.xy += cent;
  } else if (fid == 3) {
    /* ---- DNA: stands as a held double helix, no idle auto-turn. A cursor
       counter-twist only fades in while the visitor leans in. ---- */
    float gid = aGroup;
    float tsl = gid < 0.5 ? 1.0 : (gid < 1.5 ? -1.0 : 0.18);
    float springPhase = uTime * 1.35 + pos.y * 4.8 + gid * 1.7;
    float spring = sin(springPhase) * 0.045;
    pos.xz *= 1.0 + spring;
    pos.y += cos(springPhase * 0.82) * 0.028;
    pos = rotY((uTime * 0.16 + uCursor.y * 0.5 * uHover) * tsl) * pos;
  }
  /* brain (0) and brand (4) are pristine — the composition breathes alone. */

  /* ---- Cursor hover reaction: spill, ripple, swell, attention ---- */
  vec2 cur = uCursor * uCursorK;
  vec2 fromCur = pos.xy - cur;
  float cd = length(fromCur);

  float hoverGlow = uHover * (0.28 + 0.5 * exp(-cd * cd * 2.2) * (0.5 + aRandom.x * 0.5));
  vHover = hoverGlow;

  /* ---- Quiet neural-activity wave ---- */
  vec3 pulseDir = normalize(vec3(0.42, 0.36, 0.83));
  float wave = fract(dot(pos, pulseDir) * 0.5 - uTime * 0.1 + aRandom.z * 0.5);
  float pw = exp(-pow((wave - 0.5) * 5.0, 2.0));
  float burstP = 0.5 + 0.5 * sin(uTime * 0.16 + aRandom.z * 6.2831);
  vPulse = pw * burstP;

  /* ---- Mouse parallax: gentle field tilt, amplified while hovered ---- */
  pos = rotY(uMouse.x * 0.04 * (1.0 + uHover)) * pos;
  pos = rotX(uMouse.y * 0.03 * (1.0 + uHover)) * pos;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  /* ---- Depth-aware, layer-scaled point size ---- */
  float size = uSize * (0.6 + aRandom.x * 0.8) * uPixelRatio;
  size *= layer < 0.5 ? 0.8 : (layer > 2.5 ? 0.95 : (layer > 1.5 ? 1.45 : 1.0));
  size *= 2.4 / -mv.z;
  gl_PointSize = clamp(size, 1.0, 64.0);

  vTint = aRandom.w;
  vLayer = layer;
  vRot = aShape.y + uTime * 0.05 * aRandom.w;
  vBright = aShape.z;
  vDepth = length(pos);
  vBarycentric = aBarycentric;
}