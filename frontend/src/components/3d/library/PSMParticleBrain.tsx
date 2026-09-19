import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion, tierCount } from './shared';

export interface PSMParticleBrainProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  radius?: number;
  count?: number;
  speed?: number;
  coreSize?: number;
  pointSize?: number;
  pointOpacity?: number;
  coreWireframe?: boolean;
  coreOpacity?: number;
  glowSize?: number;
  glowOpacity?: number;
  enabled?: boolean;
}

export function PSMParticleBrain({
  seed = 1,
  accent = '#0d6efd',
  accent2 = '#ffb829',
  radius = 2.6,
  count,
  speed = 0.12,
  coreSize = 0.62,
  pointSize = 0.045,
  pointOpacity = 0.8,
  coreWireframe = true,
  coreOpacity = 0.4,
  glowSize = 1.5,
  glowOpacity = 0.05,
  enabled = true,
}: PSMParticleBrainProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);

  const n = count ?? tierCount(profile, 1100, 620, 300);

  const geometry = useMemo(() => {
    const rand = mulberry32(seed * 2654435761);
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const cBase = new THREE.Color('#9aa0ab');
    const cAccent = new THREE.Color(accent);
    const cEdge = new THREE.Color(accent2);
    for (let i = 0; i < n; i++) {
      const r = radius * Math.pow(rand(), 1.7);
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.78;
      positions[i * 3 + 2] = r * Math.cos(phi);
      const t = rand();
      const c = t > 0.93 ? cEdge : t > 0.72 ? cAccent : cBase;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [n, radius, seed, accent, accent2]);

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * speed;
      group.current.rotation.x = Math.sin(t * 0.1) * 0.06;
    }
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 1.1) * 0.05);
  });

  return (
    <group>
      <group ref={group}>
        <points geometry={geometry}>
          <pointsMaterial
            size={pointSize}
            sizeAttenuation
            transparent
            opacity={pointOpacity}
            vertexColors
            depthWrite={false}
          />
        </points>
      </group>
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[coreSize, 1]} />
          <meshBasicMaterial color={accent} wireframe={coreWireframe} transparent opacity={coreOpacity} />
        </mesh>
        <mesh>
          <sphereGeometry args={[coreSize * glowSize, 20, 20]} />
          <meshBasicMaterial color={accent} transparent opacity={glowOpacity} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}