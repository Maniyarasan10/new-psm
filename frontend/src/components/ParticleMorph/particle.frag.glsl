precision highp float;

uniform vec3  uColor;     // primary brand iris
uniform vec3  uAccent;    // sparse saffron accent
uniform float uOpacity;

varying float vTint;
varying float vHover;
varying float vLayer;
varying float vRot;
varying float vBright;
varying float vDepth;
varying float vPulse;

float cross2(vec2 a, vec2 b) {
  return a.x * b.y - a.y * b.x;
}

void main() {
  /* Sprite-space point, rotated per particle so the surface reads as many
     tiny independent facets rather than a uniform grid of dots. */
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float ca = cos(vRot);
  float sa = sin(vRot);
  vec2 q = vec2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);

  /* Equilateral triangle mask (circumradius 1) with anti-aliased edges. */
  const vec2 v0 = vec2(0.0, 1.0);
  const vec2 v1 = vec2(-0.8660254, -0.5);
  const vec2 v2 = vec2(0.8660254, -0.5);
  float d0 = cross2(v1 - v0, q - v0);
  float d1 = cross2(v2 - v1, q - v1);
  float d2 = cross2(v0 - v2, q - v2);
  float mind = min(min(d0, d1), d2);
  float aa = fwidth(mind) * 1.4 + 1e-3;
  float mask = smoothstep(0.0, aa, mind);

  /* Facet illumination: top-lit micro-facets + soft bevel at the silhouette. */
  float facet = 0.6 + 0.4 * (0.5 - q.y * 0.6);
  float relief = mix(1.0, 0.76, smoothstep(0.5, 0.95, length(q)));

  /* Depth atmosphere: core soft AO, a bright rim where the form's silhouette
     faces the camera. */
  float ao = mix(0.5, 1.0, smoothstep(0.0, 0.82, vDepth));
  float rim = smoothstep(0.58, 0.94, vDepth);

  /* Mostly iris, a sparse handful carry saffron. */
  float gold = smoothstep(0.85, 0.97, vTint);
  vec3 col = mix(uColor, uAccent, gold);
  col = mix(col, vec3(1.0), rim * 0.2);
  col *= ao * (0.72 + 0.55 * vBright);

  /* Layer personality: micro cools slightly, structural facets whiten,
     floating dust drifts toward haze-blue. */
  if (vLayer < 0.5) {
    col *= 0.94;
  } else if (vLayer > 2.5) {
    col = mix(col, vec3(0.72, 0.86, 1.0), 0.35);
  } else if (vLayer > 1.5) {
    col = mix(col, vec3(1.0), 0.1);
  }

  /* Neural-activity wave: a quiet traveling flash. */
  float rush = smoothstep(0.0, 0.75, vPulse) * vPulse * 0.3;
  col = mix(col, vec3(1.0), rush);

  /* Cursor hover brightness. */
  col = mix(col, vec3(1.0), vHover * 0.15);

  float layerAlpha = vLayer > 2.5 ? 0.5 : (vLayer < 0.5 ? 0.9 : 0.85);
  float alpha = mask * clamp(facet * relief, 0.0, 1.0) * uOpacity * layerAlpha;
  alpha *= 1.0 + vHover * 0.6;

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}