import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';

export interface PSMDigitalGlobeProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  radius?: number;
  detail?: number;
  speed?: number;
  orbit?: boolean;
  ringConfigs?: Array<{ tilt: [number, number, number]; r: number; color: string; o: number }>;
  satelliteSize?: number;
  satelliteOpacity?: number;
  globeWireframeOpacity?: number;
  globeInnerOpacity?: number;
  enabled?: boolean;
}

export function PSMDigitalGlobe({
  seed = 4,
  accent = '#0d6efd',
  accent2 = '#ffb829',
  radius = 2,
  detail = 2,
  speed = 0.14,
  orbit = true,
  ringConfigs,
  satelliteSize = 0.07,
  satelliteOpacity = 0.95,
  globeWireframeOpacity = 0.42,
  globeInnerOpacity = 0.05,
  enabled = true,
}: PSMDigitalGlobeProps) {
  const { live, reduced } = useMotion(enabled);
  const globe = useRef<THREE.Group>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const satellite = useRef<THREE.Mesh>(null);

  const orbitOffset = useMemo(
    () => mulberry32(seed * 1299721)() * Math.PI * 2,
    [seed],
  );

  const ringDefs = useMemo(
    () => ringConfigs ?? [
      { tilt: [Math.PI / 2, 0.35, 0] as const, r: radius * 1.42, color: '#0a0b0f', o: 0.3 },
      { tilt: [Math.PI / 2.4, -0.5, 0] as const, r: radius * 1.62, color: accent, o: 0.45 },
      { tilt: [Math.PI / 1.8, 0.2, 0] as const, r: radius * 1.84, color: accent2, o: 0.32 },
    ],
    [radius, accent, accent2, ringConfigs],
  );

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (globe.current) {
      globe.current.rotation.y = t * speed;
      globe.current.rotation.x = Math.sin(t * 0.06) * 0.12;
    }
    for (let i = 0; i < rings.current.length; i++) {
      const m = rings.current[i];
      if (m) m.rotation.y = t * speed * 0.5 * (i % 2 === 0 ? 1 : -1);
    }
    if (satellite.current && orbit) {
      const a = t * speed * 0.8 + orbitOffset;
      satellite.current.position.set(Math.cos(a) * radius * 1.75, Math.sin(a) * radius * 0.28, Math.sin(a) * radius * 1.75);
    }
  });

  return (
    <group>
      <group ref={globe}>
        <mesh>
          <icosahedronGeometry args={[radius, detail]} />
          <meshBasicMaterial color="#0a0b0f" wireframe transparent opacity={globeWireframeOpacity} />
        </mesh>
        <mesh>
          <sphereGeometry args={[radius * 0.96, 24, 24]} />
          <meshBasicMaterial color={accent} transparent opacity={globeInnerOpacity} depthWrite={false} />
        </mesh>
      </group>
      {ringDefs.map((d, i) => (
        <mesh key={i} rotation={d.tilt} ref={(el) => { rings.current[i] = el; }}>
          <torusGeometry args={[d.r, 0.006, 8, 128]} />
          <meshBasicMaterial color={d.color} transparent opacity={d.o} depthWrite={false} />
        </mesh>
      ))}
      {orbit && (
        <mesh ref={satellite}>
          <sphereGeometry args={[satelliteSize, 12, 12]} />
          <meshBasicMaterial color={accent2} transparent opacity={satelliteOpacity} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}