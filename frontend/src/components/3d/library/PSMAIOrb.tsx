import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';

export interface PSMAIOrbProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  radius?: number;
  layers?: number;
  sparkles?: number;
  sparkleScale?: number;
  sparkleSize?: number;
  sparkleSpeed?: number;
  sparkleOpacity?: number;
  sparkleNoise?: number;
  speed?: number;
  enabled?: boolean;
}

export function PSMAIOrb({
  seed = 7,
  accent = '#0d6efd',
  accent2 = '#8b5cf6',
  radius = 2,
  layers = 3,
  sparkles,
  sparkleScale = 3.4,
  sparkleSize = 2.2,
  sparkleSpeed = 0.35,
  sparkleOpacity = 0.5,
  sparkleNoise = 1,
  speed = 0.2,
  enabled = true,
}: PSMAIOrbProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const core = useRef<THREE.Group>(null);
  const shells = useRef<THREE.Group>(null);

  const shellDefs = useMemo(() => {
    const L = Math.max(1, Math.min(5, layers));
    return Array.from({ length: L }, (_, i) => ({
      r: radius * (1 + i * 0.16),
      o: 0.05 / (i + 1),
    }));
  }, [radius, layers]);

  const tilt = useMemo(() => mulberry32(seed * 80009)() * Math.PI, [seed]);
  const sparkCount = sparkles ?? (profile.tier === 'mobile' ? 40 : 100);

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (core.current) {
      core.current.scale.setScalar(1 + Math.sin(t * 1.0) * 0.05);
      core.current.rotation.y = t * speed;
    }
    if (shells.current) {
      shells.current.rotation.y = t * speed * 0.3;
      shells.current.rotation.x = Math.sin(t * 0.08) * 0.08;
    }
  });

  return (
    <group>
      <group ref={shells}>
        {shellDefs.map((s, i) => (
          <mesh key={i}>
            <sphereGeometry args={[s.r, 28, 28]} />
            <meshBasicMaterial color={accent} transparent opacity={s.o} depthWrite={false} />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2.4, tilt, 0]}>
          <torusGeometry args={[radius * 2.1, 0.007, 8, 128]} />
          <meshBasicMaterial color={accent2} transparent opacity={0.4} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 1.8, -tilt * 0.6, 0]}>
          <torusGeometry args={[radius * 2.4, 0.005, 8, 128]} />
          <meshBasicMaterial color={accent} transparent opacity={0.3} depthWrite={false} />
        </mesh>
      </group>
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[radius * 0.4, 1]} />
          <meshBasicMaterial color={accent2} wireframe transparent opacity={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[radius * 0.55, 20, 20]} />
          <meshBasicMaterial color={accent2} transparent opacity={0.08} depthWrite={false} />
        </mesh>
      </group>
      <Sparkles count={sparkCount} scale={radius * sparkleScale} size={sparkleSize} speed={sparkleSpeed} color={accent} opacity={sparkleOpacity} noise={sparkleNoise} />
    </group>
  );
}