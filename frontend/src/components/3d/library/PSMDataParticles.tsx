import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion, tierCount } from './shared';

export interface PSMDataParticlesProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  box?: number;
  count?: number;
  specks?: number;
  size?: number;
  pointOpacity?: number;
  speckSize?: number;
  speckOpacity?: number;
  speed?: number;
  enabled?: boolean;
}

export function PSMDataParticles({
  seed = 3,
  accent = '#0d6efd',
  accent2 = '#15846e',
  box = 4.4,
  count,
  specks,
  size = 0.05,
  pointOpacity = 0.7,
  speckSize,
  speckOpacity = 0.9,
  speed = 0.16,
  enabled = true,
}: PSMDataParticlesProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const specksRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const n = count ?? tierCount(profile, 700, 420, 220);

  const pointsGeometry = useMemo(() => {
    const rand = mulberry32(seed * 48271);
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const cBase = new THREE.Color('#9aa0ab');
    const cAccent = new THREE.Color(accent);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (rand() - 0.5) * box;
      positions[i * 3 + 1] = (rand() - 0.5) * box * 0.85;
      positions[i * 3 + 2] = (rand() - 0.5) * box;
      const c = rand() > 0.86 ? cAccent : cBase;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [n, box, seed, accent]);

  const speckSeed = useMemo(() => {
    const rand = mulberry32(seed * 65537);
    const half = box / 2;
    const smoke = specks ?? (profile.tier === 'mobile' ? 12 : 28);
    return Array.from({ length: smoke }, () => ({
      x: (rand() - 0.5) * box * 0.7,
      y: (rand() - 0.5) * half,
      z: (rand() - 0.5) * box * 0.7,
      v: 0.2 + rand() * 0.5,
      ph: rand() * Math.PI * 2,
    }));
  }, [seed, box, specks, profile.tier]);

  const speckGeometry = useMemo(() => {
    const g = new THREE.SphereGeometry((speckSize ?? size) * 1.6, 10, 10);
    return g;
  }, [size, speckSize]);

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.05) * 0.12;
    }
    const mesh = specksRef.current;
    if (!mesh) return;
    const half = box / 2;
    for (let i = 0; i < speckSeed.length; i++) {
      const s = speckSeed[i];
      const y = (s.y + t * s.v * speed * 2) % box - half;
      dummy.position.set(s.x, y, s.z);
      dummy.scale.setScalar(1 + Math.sin(t * 3 + s.ph) * 0.35);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <points geometry={pointsGeometry}>
        <pointsMaterial
          size={size}
          sizeAttenuation
          transparent
          opacity={pointOpacity}
          vertexColors
          depthWrite={false}
        />
      </points>
      <instancedMesh ref={specksRef} args={[speckGeometry, undefined, speckSeed.length]}>
        <meshBasicMaterial color={accent2} transparent opacity={speckOpacity} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}