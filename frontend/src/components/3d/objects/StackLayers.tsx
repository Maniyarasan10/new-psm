import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useSceneActive } from '../core/SceneState';
import { getScrollProgress } from '../core/scrollProbe';

interface LayerDef {
  w: number;
  h: number;
  d: number;
  y: number;
  rot: number;
  color: string;
}

interface StackLayersProps {
  accent?: string;
  accent2?: string;
  scrollId?: string;
  seed?: number;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Product assembly: layers levitate, then stack into a capsule-on-a-stack as
// you scroll into the section. Reads "turning an idea into a product".
export function StackLayers({
  accent = '#0d6efd',
  accent2 = '#ffb829',
  scrollId = 'product-engineering',
  seed = 4,
}: StackLayersProps) {
  const active = useSceneActive();
  const group = useRef<THREE.Group>(null);
  const layersRef = useRef<(THREE.Object3D | null)[]>([]);

  const layers = useMemo<LayerDef[]>(
    () => [
      { w: 2.2, h: 0.3, d: 1.4, y: -1.4, rot: 0, color: accent },
      { w: 2.6, h: 0.26, d: 1.6, y: -0.95, rot: 0, color: '#0a0b0f' },
      { w: 1.9, h: 0.26, d: 1.3, y: -0.42, rot: 0, color: accent },
      { w: 2.3, h: 0.26, d: 1.5, y: 0.12, rot: 0, color: '#334155' },
      { w: 1.7, h: 0.3, d: 1.15, y: 0.62, rot: 0, color: accent2 },
    ],
    [accent, accent2],
  );

  const ghosts = useMemo(
    () =>
      layers.map((l, i) => ({
        x: (Math.sin(seed + i * 0.7) * 2.6) * (i % 2 === 0 ? 1 : -1),
        y: l.y + (i + 1) * 0.85,
        rot: (i % 2 === 0 ? 1 : -1) * (0.7 + i * 0.18),
      })),
    [layers, seed],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    if (!active) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const t = state.clock.elapsedTime;
    const p = easeInOut(getScrollProgress(scrollId));
    for (let i = 0; i < layersRef.current.length; i++) {
      const el = layersRef.current[i];
      if (!el) continue;
      const home = layers[i];
      const ghost = ghosts[i];
      el.position.x = ghost.x * (1 - p);
      el.position.y = ghost.y * (1 - p) + home.y * p + Math.sin(t * 0.7 + i) * 0.03;
      el.position.z = (i % 2 === 0 ? -0.5 : 0.4) * (1 - p);
      el.rotation.y = ghost.rot * (1 - p) * 0.6;
      el.rotation.x = ghost.rot * (1 - p) * 0.4;
      const s = 0.35 + 0.65 * p;
      el.scale.setScalar(s);
    }
    g.rotation.y = Math.sin(t * 0.1) * 0.08;
  });

  return (
    <group ref={group} rotation={[0.1, 0, 0]}>
      {layers.map((l, i) => (
        <RoundedBox
          key={i}
          ref={(el: unknown) => { layersRef.current[i] = el as THREE.Object3D | null; }}
          args={[l.w, l.h, l.d]}
          radius={0.09}
          smoothness={2}
          position={[0, l.y, 0]}
        >
          <meshBasicMaterial color={l.color} transparent opacity={0.9} />
        </RoundedBox>
      ))}
      <mesh position={[0, 1.35, 0]}>
        <icosahedronGeometry args={[0.34, 1]} />
        <meshBasicMaterial color={accent2} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}