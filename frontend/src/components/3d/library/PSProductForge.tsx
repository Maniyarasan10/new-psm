import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';

export interface PSProductForgeProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  stages?: number;
  partsPerStage?: number;
  spread?: number;
  spacing?: number;
  baseSize?: number;
  particleCount?: number;
  particleSpeed?: number;
  enabled?: boolean;
}

interface ForgePart {
  position: [number, number, number];
  targetPosition: [number, number, number];
  color: string;
  size: number;
  stage: number;
  assembled: boolean;
  geometry: 'box' | 'cylinder' | 'sphere' | 'torus';
  rotation: [number, number, number];
  rotationSpeed: [number, number, number];
}

interface AssemblyParticle {
  start: [number, number, number];
  end: [number, number, number];
  off: number;
  spd: number;
  size: number;
}

export function PSProductForge({
  seed = 5,
  accent = '#ffb829',
  accent2 = '#0d6efd',
  stages = 4,
  partsPerStage = 3,
  spread = 1.2,
  spacing = 1.3,
  baseSize = 0.12,
  particleCount = 6,
  particleSpeed = 0.2,
  enabled = true,
}: PSProductForgeProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const partRefs = useRef<(THREE.Mesh | null)[]>([]);
  const particleRefs = useRef<(THREE.Mesh | null)[]>([]);

  const isMobile = profile.tier === 'mobile';

  const forgeData = useMemo(() => {
    const rand = mulberry32(seed * 131071);
    const S = Math.max(2, stages);
    const P = Math.max(1, partsPerStage);
    const parts: ForgePart[] = [];

    for (let s = 0; s < S; s++) {
      for (let p = 0; p < P; p++) {
        const isFinalStage = s === S - 1;
        const geoTypes: ForgePart['geometry'][] = ['box', 'cylinder', 'sphere', 'torus'];
        const geo = geoTypes[Math.floor(rand() * geoTypes.length)];
        const angle = (p / P) * Math.PI * 2;
        const r = spread * (0.6 + rand() * 0.8);

        const startX = (s - (S - 1) / 2) * spacing + (rand() - 0.5) * 0.4;
        const startY = (p - (P - 1) / 2) * spread * 0.5 + Math.sin(angle) * r * 0.5;
        const startZ = (rand() - 0.5) * 0.6 + Math.cos(angle) * r * 0.5;

        const targetX = isFinalStage ? 0 : startX;
        const targetY = isFinalStage ? 0 : startY;
        const targetZ = isFinalStage ? 0 : startZ;

        parts.push({
          position: [startX, startY, startZ],
          targetPosition: [targetX, targetY, targetZ],
          color: isFinalStage ? accent2 : (s % 2 === 0 ? accent : accent2),
          size: baseSize * (isFinalStage ? 1.5 : 0.8 + rand() * 0.6),
          stage: s,
          assembled: false,
          geometry: geo,
          rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
          rotationSpeed: [
            (rand() - 0.5) * 0.5,
            (rand() - 0.5) * 0.5,
            (rand() - 0.5) * 0.5,
          ],
        });
      }
    }
    return parts;
  }, [seed, stages, partsPerStage, spread, spacing, baseSize, accent, accent2]);

  const particles = useMemo<AssemblyParticle[]>(() => {
    const pc = Math.max(1, Math.min(12, particleCount));
    const rand = mulberry32(seed * 65537);
    return Array.from({ length: pc }, () => ({
      start: [
        (rand() - 0.5) * spread * 2,
        (rand() - 0.5) * spread * 2,
        (rand() - 0.5) * 1.5,
      ] as [number, number, number],
      end: [0, 0, 0] as [number, number, number],
      off: rand(),
      spd: particleSpeed + rand() * 0.15,
      size: 0.03 + rand() * 0.04,
    }));
  }, [seed, particleCount, particleSpeed, spread]);

  useFrame((state, delta) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    const assembleProgress = Math.min(1, t * 0.08);

    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.03) * 0.1;
    }

    for (let i = 0; i < forgeData.length; i++) {
      const part = forgeData[i];
      const mesh = partRefs.current[i];
      if (!mesh) continue;

      const target = part.assembled ? part.targetPosition : part.position;
      mesh.position.x = THREE.MathUtils.damp(mesh.position.x, target[0], 2, delta);
      mesh.position.y = THREE.MathUtils.damp(mesh.position.y, target[1], 2, delta);
      mesh.position.z = THREE.MathUtils.damp(mesh.position.z, target[2], 2, delta);

      mesh.rotation.x += part.rotationSpeed[0] * delta;
      mesh.rotation.y += part.rotationSpeed[1] * delta;
      mesh.rotation.z += part.rotationSpeed[2] * delta;

      if (part.stage < stages - 1 && assembleProgress > (part.stage / (stages - 1))) {
        part.assembled = true;
      }
    }

    for (let i = 0; i < particleRefs.current.length; i++) {
      const m = particleRefs.current[i];
      const def = particles[i % particles.length];
      if (!m || !def) continue;
      const u = (t * def.spd + def.off) % 1;
      m.position.set(
        def.start[0] + (def.end[0] - def.start[0]) * u,
        def.start[1] + (def.end[1] - def.start[1]) * u,
        def.start[2] + (def.end[2] - def.start[2]) * u
      );
      m.scale.setScalar(1 + Math.sin(t * 8 + i) * 0.5);
    }
  });

  const makeGeometry = (part: ForgePart) => {
    switch (part.geometry) {
      case 'box':
        return <boxGeometry args={[part.size, part.size, part.size]} />;
      case 'cylinder':
        return <cylinderGeometry args={[part.size, part.size, part.size * 1.5, 8]} />;
      case 'sphere':
        return <sphereGeometry args={[part.size, 12, 12]} />;
      case 'torus':
        return <torusGeometry args={[part.size, part.size * 0.3, 8, 16]} />;
    }
  };

  return (
    <group ref={group}>
      {forgeData.map((part, i) => (
        <mesh
          key={i}
          position={part.position}
          rotation={part.rotation}
          ref={(el) => { partRefs.current[i] = el; }}
          onPointerOver={() => {
            if (!isMobile && partRefs.current[i]) {
              partRefs.current[i]!.scale.setScalar(1.3);
            }
          }}
          onPointerOut={() => {
            if (!isMobile && partRefs.current[i]) {
              partRefs.current[i]!.scale.setScalar(1);
            }
          }}
        >
          {makeGeometry(part)}
          <meshBasicMaterial color={part.color} transparent opacity={0.9} depthWrite={false} />
        </mesh>
      ))}
      {particles.map((_, i) => (
        <mesh key={i} ref={(el) => { particleRefs.current[i] = el; }}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={accent2} transparent opacity={0.8} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}