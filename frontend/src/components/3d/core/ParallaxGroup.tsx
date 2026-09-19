import { useEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSceneActive } from './SceneState';

const LAMBDA = 2.4;

export function ParallaxGroup({
  amount = 0.05,
  enabled = true,
  children,
}: {
  amount?: number;
  enabled?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const active = useSceneActive();
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useFrame((_, delta) => {
    if (!active || !enabled || !ref.current) return;
    const g = ref.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.current.x * amount, LAMBDA, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pointer.current.y * amount * 0.6, LAMBDA, delta);
  });

  return <group ref={ref}>{children}</group>;
}