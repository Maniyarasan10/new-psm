import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { useSceneActive } from '../core/SceneState';
import { usePerformanceProfile } from '../core/usePerformanceProfile';

export interface ContactOrbProps {
  accent?: string;
  accent2?: string;
}

// Aurora contact orb — layered translucent shells, wire lattice and a soft
// sparkle field. The "reach us" object.
export function ContactOrb({ accent = '#0d6efd', accent2 = '#ffb829' }: ContactOrbProps) {
  const active = useSceneActive();
  const profile = usePerformanceProfile();
  const core = useRef<THREE.Group>(null);
  const shells = useRef<THREE.Group>(null);

  const sparks = profile.tier === 'mobile' ? 36 : 90;

  useFrame((state) => {
    if (!active) return;
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04);
      core.current.rotation.y = t * 0.18;
    }
    if (shells.current) {
      shells.current.rotation.y = t * 0.06;
      shells.current.rotation.x = Math.sin(t * 0.1) * 0.08;
    }
  });

  return (
    <group>
      <group ref={shells}>
        <mesh>
          <sphereGeometry args={[2.0, 32, 32]} />
          <meshBasicMaterial color={accent} transparent opacity={0.045} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[2.3, 32, 32]} />
          <meshBasicMaterial color={accent} transparent opacity={0.04} depthWrite={false} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[2.9, 1]} />
          <meshBasicMaterial color="#0a0b0f" wireframe transparent opacity={0.16} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0.4, 0]}>
          <torusGeometry args={[3.1, 0.008, 8, 128]} />
          <meshBasicMaterial color={accent2} transparent opacity={0.4} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 1.9, -0.5, 0]}>
          <torusGeometry args={[3.4, 0.006, 8, 128]} />
          <meshBasicMaterial color={accent} transparent opacity={0.32} depthWrite={false} />
        </mesh>
      </group>
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[0.72, 1]} />
          <meshBasicMaterial color={accent} wireframe transparent opacity={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.0, 24, 24]} />
          <meshBasicMaterial color={accent} transparent opacity={0.08} depthWrite={false} />
        </mesh>
      </group>
      <Sparkles count={sparks} scale={8} size={2.4} speed={0.35} color={accent} opacity={0.5} noise={1} />
    </group>
  );
}