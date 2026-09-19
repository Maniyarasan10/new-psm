import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSceneActive } from '../core/SceneState';

export interface WireGlobeProps {
  accent?: string;
  accent2?: string;
  radius?: number;
}

// Low-poly wire globe with an orbit ring — "global reach / connected world".
export function WireGlobe({ accent = '#0d6efd', accent2 = '#ffb829', radius = 2 }: WireGlobeProps) {
  const active = useSceneActive();
  const globe = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!active) return;
    const t = state.clock.elapsedTime;
    if (globe.current) {
      globe.current.rotation.y = t * 0.1;
      globe.current.rotation.x = Math.sin(t * 0.07) * 0.12;
    }
    if (ring.current) ring.current.rotation.z = t * 0.18;
  });

  return (
    <group>
      <group ref={globe}>
        <mesh>
          <icosahedronGeometry args={[radius, 1]} />
          <meshBasicMaterial color="#0a0b0f" wireframe transparent opacity={0.4} />
        </mesh>
        <mesh>
          <sphereGeometry args={[radius * 0.96, 24, 24]} />
          <meshBasicMaterial color={accent} transparent opacity={0.05} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={ring} rotation={[Math.PI / 2, 0.3, 0]}>
        <torusGeometry args={[radius * 1.7, 0.006, 8, 128]} />
        <meshBasicMaterial color={accent2} transparent opacity={0.45} depthWrite={false} />
      </mesh>
    </group>
  );
}