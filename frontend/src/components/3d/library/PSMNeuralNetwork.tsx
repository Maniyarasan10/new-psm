import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';

export interface PSMNeuralNetworkProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  layers?: number;
  nodesPerLayer?: number;
  spread?: number;
  spacing?: number;
  nodeSize?: number;
  pulseCount?: number;
  pulseSpeed?: number;
  pulseSize?: number;
  lineColor?: string;
  lineOpacity?: number;
  enabled?: boolean;
}

interface NeuralData {
  nodes: [number, number, number][];
  edges: [number, number][];
}

export function PSMNeuralNetwork({
  seed = 2,
  accent = '#0d6efd',
  accent2 = '#ffb829',
  layers = 4,
  nodesPerLayer = 4,
  spread = 1.4,
  spacing = 0.9,
  nodeSize = 0.12,
  pulseCount,
  pulseSpeed = 0.1,
  pulseSize,
  lineColor = '#0a0b0f',
  lineOpacity = 0.35,
  enabled = true,
}: PSMNeuralNetworkProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  const data = useMemo<NeuralData>(() => {
    const rand = mulberry32(seed * 104729);
    const L = Math.max(2, layers);
    const K = Math.max(2, nodesPerLayer);
    const nodes: [number, number, number][] = [];
    for (let l = 0; l < L; l++) {
      for (let k = 0; k < K; k++) {
        nodes.push([
          (l - (L - 1) / 2) * spacing,
          (k - (K - 1) / 2) * spread + (rand() - 0.5) * spread * 0.4,
          (rand() - 0.5) * spread * 0.5,
        ]);
      }
    }
    const edges: [number, number][] = [];
    for (let l = 0; l < L - 1; l++) {
      for (let k = 0; k < K; k++) {
        const from = l * K + k;
        const to = (l + 1) * K + Math.floor(rand() * K);
        edges.push([from, to]);
        if (rand() > 0.5) {
          const to2 = (l + 1) * K + Math.floor(rand() * K);
          if (to2 !== to) edges.push([from, to2]);
        }
      }
    }
    return { nodes, edges };
  }, [seed, layers, nodesPerLayer, spread, spacing]);

  const pulses = useMemo(() => {
    const pc = Math.max(1, Math.min(8, pulseCount ?? (profile.tier === 'mobile' ? 2 : 4)));
    const rand = mulberry32(seed * 7919);
    const len = Math.max(1, data.edges.length);
    return Array.from({ length: pc }, () => ({
      edge: Math.floor(rand() * len),
      off: rand(),
      spd: pulseSpeed + rand() * 0.1,
    }));
  }, [seed, pulseCount, pulseSpeed, profile.tier, data.edges.length]);

  const lineGeometry = useMemo(() => {
    const arr: number[] = [];
    for (const [a, b] of data.edges) {
      const A = data.nodes[a];
      const B = data.nodes[b];
      arr.push(A[0], A[1], A[2], B[0], B[1], B[2]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3));
    return g;
  }, [data]);

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.06) * 0.25;
      group.current.rotation.x = Math.sin(t * 0.04) * 0.06;
    }
    for (let i = 0; i < nodeRefs.current.length; i++) {
      const m = nodeRefs.current[i];
      if (m) m.scale.setScalar(1 + Math.sin(t * 1.4 + i * 0.8) * 0.1);
    }
    for (let i = 0; i < pulseRefs.current.length; i++) {
      const m = pulseRefs.current[i];
      const def = pulses[i % pulses.length];
      if (!m || !def) continue;
      const u = (t * def.spd + def.off) % 1;
      const [a, b] = data.edges[def.edge];
      const A = data.nodes[a];
      const B = data.nodes[b];
      m.position.set(A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u);
      m.scale.setScalar(1 + Math.sin(t * 4 + i) * 0.2);
    }
  });

  return (
    <group ref={group}>
      {data.nodes.map((p, i) => (
        <mesh key={i} position={p} ref={(el) => { nodeRefs.current[i] = el; }}>
          <sphereGeometry args={[nodeSize, 14, 14]} />
          <meshBasicMaterial color={accent} transparent opacity={0.85} depthWrite={false} />
        </mesh>
      ))}
<lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color={lineColor} transparent opacity={lineOpacity} depthWrite={false} />
      </lineSegments>
      {pulses.map((_, i) => (
        <mesh key={i} ref={(el) => { pulseRefs.current[i] = el; }}>
          <sphereGeometry args={[pulseSize ?? nodeSize * 0.72, 12, 12]} />
          <meshBasicMaterial color={accent2} transparent opacity={0.95} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}