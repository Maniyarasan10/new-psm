import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSceneActive } from '../core/SceneState';
import { usePerformanceProfile } from '../core/usePerformanceProfile';
import { mulberry32 } from '../core/prng';

export interface ParticleFieldProps {
  seed?: number;
  radius?: number;
  accent?: string;
  accent2?: string;
  accent3?: string;
  baseColor?: string;
  core?: boolean;
  speed?: number;
}

export function ParticleField({
  seed = 1,
  radius = 5,
  accent = '#0d6efd',
  accent2 = '#ffb829',
  accent3 = '#15846e',
  baseColor = '#9aa0ab',
  core = false,
  speed = 0.02,
}: ParticleFieldProps) {
  const profile = usePerformanceProfile();
  const active = useSceneActive();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);

  const count = Math.max(60, Math.round(profile.particleBudget * 0.9));

  const geometry = useMemo(() => {
    const rand = mulberry32(seed * 2654435761);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const accentColors = [accent, accent2, accent3];
    const highBloom = Math.max(2, Math.round(count * 0.04));
    const midBloom = Math.max(2, Math.round(count * 0.08));
    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(rand());
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.72;
      positions[i * 3 + 2] = r * Math.cos(phi);
      let color = baseColor;
      if (i < highBloom) color = accentColors[Math.floor(rand() * accentColors.length)];
      else if (i < highBloom + midBloom) color = accent;
      const c = new THREE.Color(color);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [count, radius, seed, accent, accent2, accent3, baseColor]);

  useFrame((state) => {
    if (!active) return;
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += speed * 0.25;
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.04;
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 0.9) * 0.05;
      coreRef.current.scale.setScalar(s);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += speed * 0.5;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <points geometry={geometry}>
          <pointsMaterial
            size={0.05}
            sizeAttenuation
            transparent
            opacity={0.85}
            vertexColors
            depthWrite={false}
          />
        </points>
      </group>
      {core && (
        <group>
          <group ref={coreRef}>
            <mesh>
              <icosahedronGeometry args={[0.55, 1]} />
              <meshBasicMaterial color={accent} wireframe transparent opacity={0.35} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.9, 24, 24]} />
              <meshBasicMaterial color={accent} transparent opacity={0.06} depthWrite={false} />
            </mesh>
          </group>
          <group ref={ringRef}>
            <mesh rotation={[Math.PI / 2.4, 0, 0]}>
              <torusGeometry args={[1.35, 0.008, 8, 96]} />
              <meshBasicMaterial color={accent2} transparent opacity={0.5} depthWrite={false} />
            </mesh>
            <mesh rotation={[Math.PI / 1.8, 0.4, 0]}>
              <torusGeometry args={[1.7, 0.006, 8, 96]} />
              <meshBasicMaterial color={accent} transparent opacity={0.35} depthWrite={false} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}