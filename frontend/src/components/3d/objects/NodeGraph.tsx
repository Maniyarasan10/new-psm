import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useSceneActive } from '../core/SceneState';
import { usePerformanceProfile } from '../core/usePerformanceProfile';
import { mulberry32 } from '../core/prng';

export interface NodeGraphProps {
  nodes: [number, number, number][];
  edges: [number, number][];
  accent?: string;
  pulseColor?: string;
  nodeSize?: number;
  seed?: number;
}

// Node network: meshed nodes + edges + traveling pulses. Used for AI,
// automation workflows, IoT sensing and the solutions hub.
export function NodeGraph({
  nodes,
  edges,
  accent = '#0d6efd',
  pulseColor = '#ffb829',
  nodeSize = 0.12,
  seed = 5,
}: NodeGraphProps) {
  const active = useSceneActive();
  const profile = usePerformanceProfile();

  const pulseCount = Math.max(2, profile.tier === 'mobile' ? 3 : 6);
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  const pulseSeeds = useMemo(() => Array.from({ length: pulseCount }, (_, i) => mulberry32(seed + i * 97)) , [pulseCount, seed]);

  const curve = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(nodes.map((n) => new THREE.Vector3(n[0], n[1], n[2])));
    c.closed = true;
    return c;
  }, [nodes]);

  const pulseOffsets = useMemo(
    () => pulseSeeds.map((rand) => rand() * 2 * Math.PI),
    [pulseSeeds],
  );

  useFrame((state) => {
    if (!active) return;
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.08;
      group.current.rotation.x = Math.sin(t * 0.05) * 0.05;
    }
    for (let i = 0; i < nodeRefs.current.length; i++) {
      const m = nodeRefs.current[i];
      if (m) m.scale.setScalar(1 + Math.sin(t * 1.2 + i * 0.9) * 0.12);
    }
    for (let i = 0; i < pulses.current.length; i++) {
      const m = pulses.current[i];
      if (!m) continue;
      const u = ((t * 0.1) + pulseOffsets[i] / 6.28) % 1;
      m.position.copy(curve.getPointAt(u));
      m.scale.setScalar(1 + Math.sin(t * 4 + i) * 0.25);
    }
  });

  return (
    <group ref={group}>
      {nodes.map((n, i) => (
        <mesh
          key={i}
          position={n}
          ref={(el) => { nodeRefs.current[i] = el; }}
        >
          <sphereGeometry args={[nodeSize, 16, 16]} />
          <meshBasicMaterial color={accent} transparent opacity={0.85} depthWrite={false} />
        </mesh>
      ))}
      {edges.map(([a, b], i) => {
        const from = nodes[a];
        const to = nodes[b];
        return (
          <Line
            key={i}
            points={[[from[0], from[1], from[2]], [to[0], to[1], to[2]]]}
            color="#0a0b0f"
            lineWidth={0.6}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        );
      })}
      {Array.from({ length: pulseCount }).map((_, i) => (
        <mesh
          key={`p${i}`}
          ref={(el) => { pulses.current[i] = el; }}
        >
          <sphereGeometry args={[nodeSize * 0.7, 12, 12]} />
          <meshBasicMaterial color={pulseColor} transparent opacity={0.95} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}