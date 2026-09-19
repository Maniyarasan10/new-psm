import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion, tierCount } from './shared';

export interface PSDeviceMeshProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  deviceCount?: number;
  gridCols?: number;
  spacing?: number;
  deviceWidth?: number;
  deviceHeight?: number;
  deviceDepth?: number;
  screenOpacity?: number;
  enabled?: boolean;
}

interface DeviceDef {
  x: number;
  y: number;
  type: 'phone' | 'tablet' | 'laptop' | 'desktop';
  color: string;
  screenColor: string;
  rotation: number;
  floatPhase: number;
  floatAmp: number;
}

export function PSDeviceMesh({
  seed = 4,
  accent = '#15846e',
  accent2 = '#0d6efd',
  deviceCount = 8,
  gridCols = 3,
  spacing = 1.3,
  deviceWidth = 0.45,
  deviceHeight = 0.7,
  deviceDepth = 0.06,
  screenOpacity = 0.6,
  enabled = true,
}: PSDeviceMeshProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const deviceRefs = useRef<(THREE.Mesh | null)[]>([]);

  const isMobile = profile.tier === 'mobile';

  const devices = useMemo<DeviceDef[]>(() => {
    const rand = mulberry32(seed * 48271);
    const cols = Math.max(1, gridCols);
    const rows = Math.ceil(deviceCount / cols);
    const count = Math.min(deviceCount, tierCount(profile, 12, 8, 5));
    const types: DeviceDef['type'][] = ['phone', 'tablet', 'laptop', 'desktop'];
    const devices: DeviceDef[] = [];

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const type = types[Math.floor(rand() * types.length)];
      let w = deviceWidth, h = deviceHeight, d = deviceDepth;
      if (type === 'tablet') { w *= 1.4; h *= 1.3; }
      else if (type === 'laptop') { w *= 1.8; h *= 1.15; d *= 1.5; }
      else if (type === 'desktop') { w *= 2.2; h *= 1.4; d *= 2; }

      devices.push({
        x: (col - (cols - 1) / 2) * spacing,
        y: (row - (rows - 1) / 2) * spacing * 1.2,
        type,
        color: i % 2 === 0 ? accent : accent2,
        screenColor: i % 3 === 0 ? accent2 : accent,
        rotation: (rand() - 0.5) * 0.15,
        floatPhase: rand() * Math.PI * 2,
        floatAmp: 0.03 + rand() * 0.04,
      });
    }
    return devices;
  }, [seed, deviceCount, gridCols, spacing, deviceWidth, deviceHeight, deviceDepth, accent, accent2, profile.tier]);

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;

    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.02) * 0.08;
    }

    for (let i = 0; i < devices.length; i++) {
      const d = devices[i];
      const mesh = deviceRefs.current[i];
      if (mesh) {
        mesh.position.y = d.y + Math.sin(t * 0.7 + d.floatPhase) * d.floatAmp;
        mesh.rotation.y = d.rotation + Math.sin(t * 0.3 + d.floatPhase) * 0.02;
      }
    }
  });

  const makeDevice = (d: DeviceDef, i: number) => {
    let w = deviceWidth, h = deviceHeight, dp = deviceDepth;
    let bezel = 0.02;
    let screenInset = 0.025;

    if (d.type === 'tablet') { w *= 1.4; h *= 1.3; }
    else if (d.type === 'laptop') { w *= 1.8; h *= 1.15; dp *= 1.5; }
    else if (d.type === 'desktop') { w *= 2.2; h *= 1.4; dp *= 2; }

    return (
      <group key={i} ref={(el) => { deviceRefs.current[i] = el as unknown as THREE.Mesh; }}>
        <mesh
          position={[0, 0, -dp / 2]}
          onPointerOver={() => { if (!isMobile) deviceRefs.current[i]?.scale.setScalar(1.08); }}
          onPointerOut={() => { if (!isMobile) deviceRefs.current[i]?.scale.setScalar(1); }}
        >
          <boxGeometry args={[w + bezel * 2, h + bezel * 2, dp + 0.01]} />
          <meshBasicMaterial color={d.color} transparent opacity={0.95} />
        </mesh>
        <mesh position={[0, 0, dp / 2 + 0.002]}>
          <boxGeometry args={[w - screenInset * 2, h - screenInset * 2, 0.005]} />
          <meshBasicMaterial color={d.screenColor} transparent opacity={screenOpacity} depthWrite={false} />
        </mesh>
        {d.type === 'laptop' && (
          <mesh position={[0, -h * 0.55, -dp * 0.3]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[w * 1.1, h * 0.6, dp * 1.2]} />
            <meshBasicMaterial color={d.color} transparent opacity={0.9} />
          </mesh>
        )}
      </group>
    );
  };

  return (
    <group ref={group}>
      {devices.map((d, i) => (
        <group key={i} position={[d.x, d.y, 0]}>
          {makeDevice(d, i)}
        </group>
      ))}
    </group>
  );
}