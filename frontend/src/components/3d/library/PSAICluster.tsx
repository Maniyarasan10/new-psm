import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';

export interface PSAIClusterProps {
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
  connectionProbability?: number;
  enabled?: boolean;
}

export function PSAICluster({
  seed = 1,
  accent = '#8b5cf6',
  accent2 = '#fbbf24',
  layers = 4,
  nodesPerLayer = 5,
  spread = 1.2,
  spacing = 1.0,
  nodeSize = 0.08,
  pulseCount = 2,
  pulseSpeed = 0.12,
  connectionProbability = 0.4,
  enabled = true,
}: PSAIClusterProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  const isMobile = profile.tier === 'mobile';

  const data = useMemo(() => {
    const rand = mulberry32(seed * 104729);
    const L = Math.max(2, layers);
    const K = Math.max(2, nodesPerLayer);
    const nodes: [number, number, number][] = [];
    const nodeColors: string[] = [];

    for (let l = 0; l < L; l++) {
      for (let k = 0; k < K; k++) {
        nodes.push([
          (l - (L - 1) / 2) * spacing,
          (k - (K - 1) / 2) * spread + (rand() - 0.5) * spread * 0.3,
          (rand() - 0.5) * 0.4,
        ]);
        nodeColors.push(l === 0 || l === L - 1 ? accent2 : accent);
      }
    }

    const edges: [number, number][] = [];
    for (let l = 0; l < L - 1; l++) {
      for (let k = 0; k < K; k++) {
        const from = l * K + k;
        for (let k2 = 0; k2 < K; k2++) {
          if (rand() < connectionProbability) {
            edges.push([from, (l + 1) * K + k2]);
          }
        }
      }
    }

    return { nodes, edges, nodeColors };
  }, [seed, layers, nodesPerLayer, spread, spacing, accent, accent2, connectionProbability]);

  const pulses = useMemo(() => {
    const pc = Math.max(1, Math.min(6, pulseCount));
    const rand = mulberry32(seed * 7919);
    const len = Math.max(1, data.edges.length);
    return Array.from({ length: pc }, () => ({
      edge: Math.floor(rand() * len),
      off: rand(),
      spd: pulseSpeed + rand() * 0.08,
    }));
  }, [seed, pulseCount, pulseSpeed, data.edges.length]);

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
      group.current.rotation.y = Math.sin(t * 0.04) * 0.15;
      group.current.rotation.x = Math.sin(t * 0.03) * 0.05;
    }

    for (let i = 0; i < nodeRefs.current.length; i++) {
      const m = nodeRefs.current[i];
      if (m) {
        const phase = i * 0.9;
        m.scale.setScalar(1 + Math.sin(t * 1.1 + phase) * (isMobile ? 0.06 : 0.1));
      }
    }

    for (let i = 0; i < pulseRefs.current.length; i++) {
      const m = pulseRefs.current[i];
      const def = pulses[i % pulses.length];
      if (!m || !def) continue;
      const u = (t * def.spd + def.off) % 1;
      const [a, b] = data.edges[def.edge];
      const A = data.nodes[a];
      const B = data.nodes[b];
      m.position.set(
        A[0] + (B[0] - A[0]) * u,
        A[1] + (B[1] - A[1]) * u,
        A[2] + (B[2] - A[2]) * u
      );
      m.scale.setScalar(1 + Math.sin(t * 5 + i) * 0.25);
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#0a0b0f" transparent opacity={0.25} depthWrite={false} />
      </lineSegments>
      {data.nodes.map((p, i) => (
        <mesh
          key={i}
          position={p}
          ref={(el) => { nodeRefs.current[i] = el; }}
          onPointerOver={() => {
            if (!isMobile && nodeRefs.current[i]) {
              nodeRefs.current[i]!.scale.setScalar(1.5);
            }
          }}
          onPointerOut={() => {
            if (!isMobile && nodeRefs.current[i]) {
              nodeRefs.current[i]!.scale.setScalar(1);
            }
          }}
        >
          <sphereGeometry args={[nodeSize, 12, 12]} />
          <meshBasicMaterial color={data.nodeColors[i]} transparent opacity={0.9} depthWrite={false} />
        </mesh>
      ))}
      {pulses.map((_, i) => (
        <mesh key={i} ref={(el) => { pulseRefs.current[i] = el; }}>
          <sphereGeometry args={[nodeSize * 0.65, 10, 10]} />
          <meshBasicMaterial color={accent2} transparent opacity={0.95} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}