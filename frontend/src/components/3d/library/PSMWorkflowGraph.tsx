import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';

export interface PSMWorkflowGraphProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  stages?: number;
  branches?: number;
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

interface WorkflowData {
  nodes: [number, number, number][];
  sizes: number[];
  colors: string[];
  edges: [number, number][];
}

export function PSMWorkflowGraph({
  seed = 5,
  accent = '#0d6efd',
  accent2 = '#ffb829',
  stages = 4,
  branches = 3,
  spread = 1.5,
  spacing = 1.05,
  nodeSize = 0.14,
  pulseCount,
  pulseSpeed = 0.16,
  pulseSize,
  lineColor = '#0a0b0f',
  lineOpacity = 0.32,
  enabled = true,
}: PSMWorkflowGraphProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);

  const data = useMemo<WorkflowData>(() => {
    const rand = mulberry32(seed * 224729);
    const S = Math.max(2, stages);
    const K = Math.max(2, branches);
    const nodes: [number, number, number][] = [];
    const sizes: number[] = [];
    const colors: string[] = [];
    let index = 0;
    const stageLen: number[] = [];
    for (let s = 0; s < S; s++) {
      const len = s === 0 || s === S - 1 ? 1 : K;
      stageLen.push(len);
      for (let k = 0; k < len; k++) {
        nodes.push([
          (s - (S - 1) / 2) * spacing,
          (k - (len - 1) / 2) * spread + (rand() - 0.5) * spread * 0.25,
          (rand() - 0.5) * 0.6,
        ]);
        const emphasis = s === 0 || s === S - 1;
        sizes.push(emphasis ? nodeSize * 1.45 : nodeSize);
        colors.push(emphasis ? accent2 : accent);
        index++;
      }
    }
    const edges: [number, number][] = [];
    let offset = 0;
    for (let s = 0; s < S - 1; s++) {
      for (let k = 0; k < stageLen[s]; k++) {
        const from = offset + k;
        const nextOffset = offset + stageLen[s];
        for (let k2 = 0; k2 < stageLen[s + 1]; k2++) {
          if (rand() > 0.25) edges.push([from, nextOffset + k2]);
        }
      }
      offset += stageLen[s];
    }
    return { nodes, sizes, colors, edges };
  }, [seed, stages, branches, spread, spacing, nodeSize, accent, accent2]);

  const pulses = useMemo(() => {
    const pc = Math.max(1, Math.min(6, pulseCount ?? (profile.tier === 'mobile' ? 2 : 4)));
    const rand = mulberry32(seed * 327673);
    const len = Math.max(1, data.edges.length);
    return Array.from({ length: pc }, () => ({
      edge: Math.floor(rand() * len),
      off: rand(),
      spd: pulseSpeed + rand() * 0.12,
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
    if (group.current) group.current.rotation.y = Math.sin(t * 0.05) * 0.2;
    for (let i = 0; i < nodeRefs.current.length; i++) {
      const m = nodeRefs.current[i];
      if (m) m.scale.setScalar(1 + Math.sin(t * 1.2 + i * 0.7) * 0.08);
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
      m.scale.setScalar(1 + Math.sin(t * 5 + i) * 0.25);
    }
  });

  return (
    <group ref={group}>
      {data.nodes.map((p, i) => (
        <mesh key={i} position={p} ref={(el) => { nodeRefs.current[i] = el; }}>
          <sphereGeometry args={[data.sizes[i], 14, 14]} />
          <meshBasicMaterial color={data.colors[i]} transparent opacity={0.9} depthWrite={false} />
        </mesh>
      ))}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color={lineColor} transparent opacity={lineOpacity} depthWrite={false} />
      </lineSegments>
      {pulses.map((_, i) => (
        <mesh key={i} ref={(el) => { pulseRefs.current[i] = el; }}>
          <sphereGeometry args={[pulseSize ?? nodeSize * 0.6, 12, 12]} />
          <meshBasicMaterial color={accent} transparent opacity={0.95} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}