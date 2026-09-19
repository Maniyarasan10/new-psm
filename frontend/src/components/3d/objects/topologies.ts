import { mulberry32 } from '../core/prng';

export interface GraphTopology {
  nodes: [number, number, number][];
  edges: [number, number][];
}

export function webTopology(count = 7, radius = 2.1, seed = 7): GraphTopology {
  const nodes: [number, number, number][] = [ [0, 0, 0] ];
  const edgePairs: [number, number][] = [];
  const rand = mulberry32(seed * 7919);
  for (let i = 1; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = radius * (0.55 + rand() * 0.45);
    const y = (rand() - 0.5) * radius * 0.9;
    nodes.push([
      Math.cos(a) * r,
      y,
      Math.sin(a) * r,
    ]);
    edgePairs.push([0, i]);
  }
  for (let i = 1; i < count - 1; i++) {
    if (rand() > 0.3) edgePairs.push([i, i + 1]);
  }
  return { nodes, edges: edgePairs };
}

export function flowTopology(seed = 3, scale = 2.4): GraphTopology {
  const rand = mulberry32(seed * 104729);
  const nodes: [number, number, number][] = [];
  const edges: [number, number][] = [];
  const stops = 5;
  for (let i = 0; i < stops; i++) {
    const p = i / (stops - 1);
    nodes.push([
      Math.sin(p * 3.4) * scale * 0.8,
      (rand() - 0.5) * scale * 0.8,
      Math.cos(p * 2.2) * scale * 0.8,
    ]);
    if (i > 0) edges.push([i - 1, i]);
  }
  edges.push([stops - 1, 0]);
  return { nodes, edges };
}

export function sensorTopology(seed = 11, count = 9, scale = 2.6): GraphTopology {
  const rand = mulberry32(seed * 15485863);
  const nodes: [number, number, number][] = [];
  const edges: [number, number][] = [];
  const pts: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    pts.push([
      (rand() - 0.5) * 2 * scale,
      (rand() - 0.5) * scale * 1.4,
      (rand() - 0.5) * 2 * scale,
    ]);
  }
  nodes.push(...pts);
  for (let i = 0; i < count; i++) {
    let best1 = -1;
    let best2 = -1;
    let d1 = Infinity;
    let d2 = Infinity;
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
      if (d < d1) {
        d2 = d1;
        best2 = best1;
        d1 = d;
        best1 = j;
      } else if (d < d2) {
        d2 = d;
        best2 = j;
      }
    }
    if (best1 >= 0 && !edges.some(([a, b]) => (a === i && b === best1) || (a === best1 && b === i))) {
      edges.push([i, best1]);
    }
    if (best2 >= 0 && !edges.some(([a, b]) => (a === i && b === best2) || (a === best2 && b === i))) {
      edges.push([i, best2]);
    }
  }
  return { nodes, edges };
}