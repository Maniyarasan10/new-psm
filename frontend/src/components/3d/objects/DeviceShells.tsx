import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useSceneActive } from '../core/SceneState';
import { mulberry32 } from '../core/prng';

export interface DeviceShellsProps {
  accent?: string;
  accent2?: string;
}

interface ShellDef {
  w: number;
  h: number;
  d: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  phase: number;
  tilt: number;
}

// Abstract floating device shells (phone / window / card) — the "web & mobile"
// practice as soft geometry.
export function DeviceShells({ accent = '#0d6efd', accent2 = '#15846e' }: DeviceShellsProps) {
  const active = useSceneActive();
  const group = useRef<THREE.Group>(null);
  const shells = useRef<(THREE.Object3D | null)[]>([]);

  const defs = useMemo<ShellDef[]>(() => {
    const rand = mulberry32(8);
    const specs: [number, number, number][] = [
      [0.82, 1.55, 0.09], // phone
      [1.7, 1.12, 0.14], // window
      [1.1, 0.72, 0.1], // card
      [1.32, 1.02, 0.24], // tablet-ish block
    ];
    return specs.map(([w, h, d], i) => ({
      w,
      h,
      d,
      x: (i === 1 ? 1 : -1) * (1.1 + rand() * 0.9),
      y: (i - 1) * 1.15,
      z: rand() * 1.2 - 0.6,
      speed: 0.34 + rand() * 0.4,
      phase: rand() * Math.PI * 2,
      tilt: (rand() - 0.5) * 0.6,
    }));
  }, []);

  useFrame((state) => {
    if (!active) return;
    const t = state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = t * 0.06;
    for (let i = 0; i < shells.current.length; i++) {
      const el = shells.current[i];
      if (!el) continue;
      const d = defs[i];
      el.position.y = (d.y + Math.sin(t * d.speed + d.phase) * 0.35) * 0.7;
      el.rotation.z = Math.sin(t * d.speed * 0.7 + d.phase) * 0.08 + d.tilt;
    }
  });

  return (
    <group ref={group} rotation={[0.06, 0, 0]}>
      {defs.map((d, i) => (
        <group
          key={i}
          ref={(el) => { shells.current[i] = el; }}
          position={[d.x, d.y, d.z]}
        >
          <RoundedBox args={[d.w, d.h, d.d]} radius={0.1} smoothness={2}>
            <meshBasicMaterial color="#0a0b0f" transparent opacity={i === 2 ? 0.55 : 0.2} />
          </RoundedBox>
          <mesh position={[0, 0, 0.078]} scale={[d.w * 0.82, d.h * 0.84, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color={i === 1 ? accent : i === 2 ? accent2 : accent} transparent opacity={i === 3 ? 0.16 : 0.3} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}