import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';
import { createGearGeometry } from './shared';

export interface PSMFloatingGearsProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  gears?: number;
  radius?: number;
  depth?: number;
  spread?: number;
  speed?: number;
  gearOpacity?: number;
  gearDepthWrite?: boolean;
  enabled?: boolean;
}

interface GearDef {
  x: number;
  y: number;
  z: number;
  teeth: number;
  r: number;
  rotSpeed: number;
  dir: number;
  color: string;
  bob: number;
  ph: number;
}

export function PSMFloatingGears({
  seed = 6,
  accent = '#0d6efd',
  accent2 = '#ffb829',
  gears = 3,
  radius = 0.8,
  depth = 0.16,
  spread = 2.6,
  speed = 0.5,
  gearOpacity = 0.9,
  gearDepthWrite = false,
  enabled = true,
}: PSMFloatingGearsProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const gearRefs = useRef<(THREE.Mesh | null)[]>([]);

  const defs = useMemo<GearDef[]>(() => {
    const g = Math.max(1, Math.min(6, gears));
    const rand = mulberry32(seed * 167449);
    const baseColor = new THREE.Color(accent);
    const altColor = new THREE.Color(accent2);
    return Array.from({ length: g }, (_, i) => ({
      x: (rand() - 0.5) * spread,
      y: (rand() - 0.5) * spread * 0.6,
      z: (rand() - 0.5) * 1.4,
      teeth: 10 + Math.floor(rand() * 8) + i * 2,
      r: radius * (0.72 + rand() * 0.5),
      rotSpeed: (0.2 + rand() * 0.5) * speed,
      dir: i % 2 === 0 ? 1 : -1,
      color: i === 0 ? altColor.getStyle() : baseColor.getStyle(),
      bob: 0.06 + rand() * 0.12,
      ph: rand() * Math.PI * 2,
    }));
  }, [seed, gears, radius, spread, speed, accent, accent2]);

  const geometries = useMemo(
    () => defs.map((d) => createGearGeometry(d.teeth, d.r, depth)),
    [defs, depth],
  );

  const bobTier = useMemo(
    () => (profile.tier === 'mobile' ? 0.5 : 1),
    [profile.tier],
  );

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = Math.sin(t * 0.04) * 0.18;
    for (let i = 0; i < gearRefs.current.length; i++) {
      const m = gearRefs.current[i];
      const d = defs[i];
      if (!m || !d) continue;
      m.rotation.z = t * d.rotSpeed * d.dir;
      m.position.y = d.y + Math.sin(t * 1.2 + d.ph) * d.bob * bobTier;
    }
  });

  return (
    <group ref={group}>
      {defs.map((_, i) => (
        <mesh
          key={i}
          geometry={geometries[i]}
          position={[defs[i].x, defs[i].y, defs[i].z]}
          ref={(el) => { gearRefs.current[i] = el; }}
        >
          <meshBasicMaterial color={defs[i].color} transparent opacity={gearOpacity} depthWrite={gearDepthWrite} />
        </mesh>
      ))}
    </group>
  );
}