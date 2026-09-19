import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useMotion } from './shared';

export interface PSM3DLogoProps {
  accent?: string;
  accent2?: string;
  heights?: number[];
  gap?: number;
  width?: number;
  ring?: number;
  ringThickness?: number;
  ringSegments?: number;
  barRadius?: number;
  barSmoothness?: number;
  barOpacity?: number;
  haloOpacity?: number;
  speed?: number;
  enabled?: boolean;
}

export function PSM3DLogo({
  accent = '#0d6efd',
  accent2 = '#ffb829',
  heights = [0.9, 1.25, 1.7],
  gap = 0.52,
  width = 0.3,
  ring = 1.25,
  ringThickness = 0.012,
  ringSegments = 96,
  barRadius = 0.07,
  barSmoothness = 2,
  barOpacity = 0.9,
  haloOpacity = 0.55,
  speed = 0.4,
  enabled = true,
}: PSM3DLogoProps) {
  const { live, reduced } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const halo = useRef<THREE.Mesh>(null);

  const count = Math.max(1, Math.min(5, heights.length));

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = Math.sin(t * speed * 0.25) * 0.7;
    if (halo.current) halo.current.rotation.z = t * speed * 0.3;
    for (let i = 0; i < bars.current.length; i++) {
      const m = bars.current[i];
      if (m) m.scale.setScalar(1 + Math.sin(t * 1.6 + i * 1.1) * 0.03);
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => {
        const h = heights[i] ?? heights[heights.length - 1];
        return (
          <RoundedBox
            key={i}
            ref={(el: unknown) => { bars.current[i] = el as THREE.Mesh | null; }}
            args={[width, h, width]}
            radius={barRadius}
            smoothness={barSmoothness}
            position={[(i - (count - 1) / 2) * gap, h / 2, 0]}
          >
            <meshBasicMaterial color={accent} transparent opacity={barOpacity} />
          </RoundedBox>
        );
      })}
      <mesh ref={halo} rotation={[Math.PI / 2.6, 0, 0]} position={[0, (heights[count - 1] ?? 1.2) * 0.85, 0]}>
        <torusGeometry args={[ring, ringThickness, 8, ringSegments]} />
        <meshBasicMaterial color={accent2} transparent opacity={haloOpacity} depthWrite={false} />
      </mesh>
    </group>
  );
}