import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useMotion } from './shared';

export interface PSMInteractiveGridProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  size?: number;
  divisions?: number;
  interactive?: boolean;
  wave?: boolean;
  gridColor?: string;
  gridOpacity?: number;
  cursorTorusRadius?: number;
  cursorTorusThickness?: number;
  cursorTorusSegments?: number;
  cursorSphereRadius?: number;
  cursorTorusOpacity?: number;
  cursorSphereOpacity?: number;
  cursorRotationSpeed?: number;
  cursorDampFactor?: number;
  cursorRangeMult?: number;
  waveHeight?: number;
  waveThickness?: number;
  waveDepth?: number;
  waveOpacity?: number;
  waveSpeed?: number;
  rotationSpeed?: number;
  rotationAmount?: number;
  enabled?: boolean;
}

export function PSMInteractiveGrid({
  accent = '#0d6efd',
  accent2 = '#ffb829',
  size = 4,
  divisions = 14,
  interactive = true,
  wave = true,
  gridColor = '#0a0b0f',
  gridOpacity = 0.3,
  cursorTorusRadius = 0.26,
  cursorTorusThickness = 0.014,
  cursorTorusSegments = 48,
  cursorSphereRadius = 0.05,
  cursorTorusOpacity = 0.8,
  cursorSphereOpacity = 0.95,
  cursorRotationSpeed = 0.6,
  cursorDampFactor = 6,
  cursorRangeMult = 0.88,
  waveHeight = 0.01,
  waveThickness = 0.018,
  waveDepth = 0.05,
  waveOpacity = 0.35,
  waveSpeed = 0.8,
  rotationSpeed = 0.05,
  rotationAmount = 0.22,
  enabled = true,
}: PSMInteractiveGridProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const cursor = useRef<THREE.Group>(null);
  const waveRef = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const half = size / 2;

  useEffect(() => {
    if (!interactive || !profile.parallax) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [interactive, profile.parallax]);

  const gridGeometry = useMemo(() => {
    const d = Math.max(2, Math.min(40, divisions));
    const step = size / d;
    const arr: number[] = [];
    for (let i = 0; i <= d; i++) {
      const p = -half + i * step;
      arr.push(p, 0, -half, p, 0, half);
      arr.push(-half, 0, p, half, 0, p);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3));
    return g;
  }, [size, divisions, half]);

  const cursorTarget = useMemo(
    () => new THREE.Vector3(0, waveHeight, 0),
    [waveHeight],
  );

  useFrame((state, delta) => {
    if (!live && cursor.current) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = Math.sin(t * rotationSpeed) * rotationAmount;

    if (cursor.current) {
      const tx = reduced ? 0 : pointer.current.x * half * cursorRangeMult;
      const tz = reduced ? 0 : pointer.current.y * half * cursorRangeMult;
      cursorTarget.set(tx, waveHeight, tz);
      cursor.current.position.x = THREE.MathUtils.damp(cursor.current.position.x, cursorTarget.x, cursorDampFactor, delta);
      cursor.current.position.z = THREE.MathUtils.damp(cursor.current.position.z, cursorTarget.z, cursorDampFactor, delta);
      cursor.current.rotation.z = reduced ? 0 : t * cursorRotationSpeed;
    }
    if (waveRef.current) {
      const z = (t * waveSpeed) % size - half;
      waveRef.current.position.z = reduced ? 0 : z;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color={gridColor} transparent opacity={gridOpacity} depthWrite={false} />
      </lineSegments>
      <group ref={cursor}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[cursorTorusRadius, cursorTorusThickness, 8, cursorTorusSegments]} />
          <meshBasicMaterial color={accent} transparent opacity={cursorTorusOpacity} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[cursorSphereRadius, 12, 12]} />
          <meshBasicMaterial color={accent} transparent opacity={cursorSphereOpacity} depthWrite={false} />
        </mesh>
      </group>
      {wave && (
        <mesh ref={waveRef} position={[0, waveHeight, 0]}>
          <boxGeometry args={[size, waveThickness, waveDepth]} />
          <meshBasicMaterial color={accent2} transparent opacity={waveOpacity} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}