import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSceneActive } from '../core/SceneState';

export interface OrbitalRingsProps {
  accent?: string;
  accent2?: string;
  radius?: number;
}

// Three concentric brand rings with a discreet core dot. Reads as quiet
// orbital motion — the PSM "solve → build → improve" loop as geometry.
export function OrbitalRings({ accent = '#0d6efd', accent2 = '#ffb829', radius = 3 }: OrbitalRingsProps) {
  const active = useSceneActive();
  const group = useRef<THREE.Group>(null);
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!active) return;
    const t = state.clock.elapsedTime;
    if (r1.current) r1.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.22) * 0.3;
    if (r2.current) {
      r2.current.rotation.x = Math.PI / 2.6 + Math.cos(t * 0.16) * 0.25;
      r2.current.rotation.y = t * 0.12;
    }
    if (r3.current) {
      r3.current.rotation.y = -t * 0.09;
      r3.current.rotation.x = Math.PI / 1.7 + Math.sin(t * 0.2) * 0.2;
    }
    if (group.current) group.current.rotation.z = Math.sin(t * 0.05) * 0.06;
  });

  return (
    <group ref={group}>
      <mesh ref={r1}>
        <torusGeometry args={[radius, 0.008, 8, 128]} />
        <meshBasicMaterial color="#0a0b0f" transparent opacity={0.32} depthWrite={false} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[radius * 0.78, 0.006, 8, 112]} />
        <meshBasicMaterial color={accent} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh ref={r3}>
        <torusGeometry args={[radius * 1.22, 0.004, 8, 128]} />
        <meshBasicMaterial color={accent2} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={accent} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}