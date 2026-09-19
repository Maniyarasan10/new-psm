import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';

export interface PSAutomationFlowProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  stages?: number;
  branches?: number;
  spread?: number;
  spacing?: number;
  tubeRadius?: number;
  particleCount?: number;
  particleSpeed?: number;
  enabled?: boolean;
}

interface FlowNode {
  position: [number, number, number];
  color: string;
  size: number;
}

interface FlowEdge {
  from: number;
  to: number;
  curve: THREE.CatmullRomCurve3;
}

export function PSAutomationFlow({
  seed = 3,
  accent = '#06b6d4',
  accent2 = '#fbbf24',
  stages = 4,
  branches = 2,
  spread = 1.5,
  spacing = 1.4,
  tubeRadius = 0.04,
  particleCount = 4,
  particleSpeed = 0.18,
  enabled = true,
}: PSAutomationFlowProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const particleRefs = useRef<(THREE.Mesh | null)[]>([]);

  const isMobile = profile.tier === 'mobile';

  const flowData = useMemo(() => {
    const rand = mulberry32(seed * 167449);
    const S = Math.max(2, stages);
    const B = Math.max(1, branches);
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];

    for (let s = 0; s < S; s++) {
      const branchCount = s === 0 || s === S - 1 ? 1 : B;
      for (let b = 0; b < branchCount; b++) {
        const x = (s - (S - 1) / 2) * spacing;
        const y = (b - (branchCount - 1) / 2) * spread + (rand() - 0.5) * spread * 0.2;
        const z = (rand() - 0.5) * 0.4;
        nodes.push({
          position: [x, y, z],
          color: s === 0 || s === S - 1 ? accent2 : accent,
          size: s === 0 || s === S - 1 ? 0.14 : 0.1,
        });
      }
    }

    let nodeIndex = 0;
    for (let s = 0; s < S - 1; s++) {
      const currentBranchCount = s === 0 ? 1 : B;
      const nextBranchCount = s === S - 2 ? 1 : B;
      for (let b = 0; b < currentBranchCount; b++) {
        const from = nodeIndex + b;
        for (let b2 = 0; b2 < nextBranchCount; b2++) {
          if (rand() > 0.3) {
            const to = nodeIndex + currentBranchCount + b2;
            const A = nodes[from].position;
            const B = nodes[to].position;
            const midX = (A[0] + B[0]) / 2;
            const midY = (A[1] + B[1]) / 2 + 0.3;
            const midZ = (A[2] + B[2]) / 2;
            const curve = new THREE.CatmullRomCurve3([
              new THREE.Vector3(A[0], A[1], A[2]),
              new THREE.Vector3(midX, midY, midZ),
              new THREE.Vector3(B[0], B[1], B[2]),
            ]);
            edges.push({ from, to, curve });
          }
        }
      }
      nodeIndex += currentBranchCount;
    }

    return { nodes, edges };
  }, [seed, stages, branches, spread, spacing, accent, accent2]);

  const particles = useMemo(() => {
    const pc = Math.max(1, Math.min(8, particleCount));
    const rand = mulberry32(seed * 9973);
    return Array.from({ length: pc }, () => ({
      edge: Math.floor(rand() * flowData.edges.length),
      off: rand(),
      spd: particleSpeed + rand() * 0.12,
      size: 0.06 + rand() * 0.04,
    }));
  }, [seed, particleCount, particleSpeed, flowData.edges.length]);

  const tubeGeometries = useMemo(() => {
    return flowData.edges.map((edge) => {
      const geometry = new THREE.TubeGeometry(edge.curve, 24, tubeRadius, 6, false);
      return geometry;
    });
  }, [flowData, tubeRadius]);

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
        m.scale.setScalar(1 + Math.sin(t * 1.4 + i * 0.8) * (isMobile ? 0.06 : 0.1));
      }
    }

    for (let i = 0; i < particleRefs.current.length; i++) {
      const m = particleRefs.current[i];
      const def = particles[i % particles.length];
      if (!m || !def) continue;
      const u = (t * def.spd + def.off) % 1;
      const pos = flowData.edges[def.edge].curve.getPointAt(u);
      m.position.copy(pos);
      m.scale.setScalar(1 + Math.sin(t * 6 + i) * 0.3);
    }
  });

  return (
    <group ref={group}>
      {tubeGeometries.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color={accent} transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
      {flowData.nodes.map((node, i) => (
        <mesh
          key={i}
          position={node.position}
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
          <sphereGeometry args={[node.size, 14, 14]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.9} depthWrite={false} />
        </mesh>
      ))}
      {particles.map((_, i) => (
        <mesh key={i} ref={(el) => { particleRefs.current[i] = el; }}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial color={accent2} transparent opacity={0.95} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}