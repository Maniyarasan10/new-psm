import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSceneActive } from '../core/SceneState';
import { usePerformanceProfile } from '../core/usePerformanceProfile';
import { mulberry32 } from '../core/prng';

export interface DataLatticeProps {
  accent?: string;
  spacer?: number;
}

// Density table of spheres that undulates gently — data rows / knowledge grid.
export function DataLattice({ accent = '#0d6efd', spacer = 0.62 }: DataLatticeProps) {
  const active = useSceneActive();
  const profile = usePerformanceProfile();

  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const rows = useMemo(() => {
    const side = profile.tier === 'mobile' ? 7 : 9;
    const half = (side - 1) / 2;
    const list: [number, number][] = [];
    for (let x = 0; x < side; x++) {
      for (let z = 0; z < side; z++) {
        list.push([(x - half) * spacer, (z - half) * spacer]);
      }
    }
    return list;
  }, [profile.tier, spacer]);

  const phases = useMemo(() => {
    const rand = mulberry32(21);
    return rows.map(() => rand() * Math.PI * 2);
  }, [rows]);

  useFrame((state) => {
    if (!active || !mesh.current) return;
    const t = state.clock.elapsedTime;
    const m = mesh.current;
    for (let i = 0; i < rows.length; i++) {
      const [x, z] = rows[i];
      const y = Math.sin((x + z) * 0.9 + t * 0.8 + phases[i]) * 0.14;
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group rotation={[0, 0.4, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, rows.length]}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshBasicMaterial color={accent} transparent opacity={0.55} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}