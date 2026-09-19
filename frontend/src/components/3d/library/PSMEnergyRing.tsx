import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';

export interface PSMEnergyRingProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  radius?: number;
  rings?: number;
  orbiters?: number;
  speed?: number;
  corePulse?: boolean;
  ringThickness?: number;
  ringSegments?: number;
  ringConfigs?: Array<{ radiusMult: number; tilt: [number, number, number]; opacity: number; speedMult: number }>;
  orbiterSize?: number;
  orbiterOpacity?: number;
  coreSize?: number;
  coreOpacity?: number;
  coreWireframeOpacity?: number;
  sparkCount?: number;
  sparkSize?: number;
  sparkOpacity?: number;
  sparkRange?: [number, number];
  enabled?: boolean;
}

interface RingDef {
  r: number;
  tilt: readonly [number, number, number];
  o: number;
  s: number;
}

export function PSMEnergyRing({
  seed = 8,
  accent = '#0d6efd',
  accent2 = '#ffb829',
  radius = 1.8,
  rings = 3,
  orbiters = 6,
  speed = 0.35,
  corePulse = true,
  ringThickness = 0.007,
  ringSegments = 128,
  ringConfigs,
  orbiterSize = 0.05,
  orbiterOpacity = 0.95,
  coreSize = 0.28,
  coreOpacity = 0.4,
  coreWireframeOpacity = 0.3,
  sparkCount,
  sparkSize = 0.04,
  sparkOpacity = 0.8,
  sparkRange = [0.5, 2.2],
  enabled = true,
}: PSMEnergyRingProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const ringsRef = useRef<(THREE.Mesh | null)[]>([]);
  const core = useRef<THREE.Group>(null);
  const orbiterRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const orbs = useMemo(() => {
    const rand = mulberry32(seed * 131071);
    return Array.from({ length: orbiters }, () => ({
      ring: Math.floor(rand() * rings),
      a: rand() * Math.PI * 2,
    }));
  }, [seed, orbiters, rings]);

  const orbiterGeometry = useMemo(() => new THREE.SphereGeometry(orbiterSize, 10, 10), [orbiterSize]);
  const ringDefs = useMemo<RingDef[]>(
    () =>
      (ringConfigs ?? Array.from({ length: Math.max(1, Math.min(5, rings)) }, (_, i) => ({
        radiusMult: 0.7 + i * 0.42,
        tilt: [Math.PI / 2 + (i % 2 === 0 ? -0.12 : 0.12), i * 0.6, 0] as [number, number, number],
        opacity: 0.5 - i * 0.08,
        speedMult: (i % 2 === 0 ? 1 : -1) * (0.3 + i * 0.12),
      }))).map((cfg) => ({
        r: radius * cfg.radiusMult,
        tilt: cfg.tilt,
        o: cfg.opacity,
        s: cfg.speedMult,
      })),
    [radius, rings, ringConfigs],
  );

  const burstCount = sparkCount ?? Math.max(2, Math.round((orbiters * 0.6) * (profile.tier === 'mobile' ? 0.55 : 1)));

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    for (let i = 0; i < ringsRef.current.length; i++) {
      const m = ringsRef.current[i];
      const d = ringDefs[i];
      if (m && d) m.rotation.y = t * speed * d.s;
    }
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 1.3) * 0.06);

    const inst = orbiterRef.current;
    if (inst) {
      for (let i = 0; i < orbs.length; i++) {
        const o = orbs[i];
        const d = ringDefs[o.ring % ringDefs.length];
        const a = o.a + t * d.s * speed;
        dummy.position.set(Math.cos(a) * d.r, 0, Math.sin(a) * d.r);
        dummy.scale.setScalar(0.6 + 0.4 * Math.sin(t * 3 + i));
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {ringDefs.map((d, i) => (
        <mesh key={i} rotation={d.tilt} ref={(el) => { ringsRef.current[i] = el; }}>
          <torusGeometry args={[d.r, ringThickness, 8, ringSegments]} />
          <meshBasicMaterial color={accent} transparent opacity={d.o} depthWrite={false} />
        </mesh>
      ))}
      <group ref={core}>
        <mesh>
          <sphereGeometry args={[radius * coreSize, 20, 20]} />
          <meshBasicMaterial color={accent2} transparent opacity={coreOpacity} depthWrite={false} />
        </mesh>
        {corePulse && (
          <mesh>
            <sphereGeometry args={[radius * (coreSize + 0.06), 16, 16]} />
            <meshBasicMaterial color={accent2} wireframe transparent opacity={coreWireframeOpacity} depthWrite={false} />
          </mesh>
        )}
      </group>
      <SparkBurst accent={accent2} count={burstCount} seed={seed} size={sparkSize} opacity={sparkOpacity} range={sparkRange} />
      <instancedMesh ref={orbiterRef} args={[orbiterGeometry, undefined, orbs.length]}>
        <meshBasicMaterial color={accent2} transparent opacity={orbiterOpacity} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

function SparkBurst({ accent, count, seed, size = 0.04, opacity = 0.8, range = [0.5, 2.2] }: { accent: string; count: number; seed: number; size?: number; opacity?: number; range?: [number, number] }) {
  const geometry = useMemo(() => {
    const rand = mulberry32(seed * 9973);
    const positions = new Float32Array(count * 3);
    const [rMin, rMax] = range;
    for (let i = 0; i < count; i++) {
      const r = rMin + rand() * (rMax - rMin);
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
      positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.5;
      positions[i * 3 + 2] = r * Math.cos(ph) * 0.5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count, seed, range]);

  return (
    <points geometry={geometry}>
      <pointsMaterial size={size} sizeAttenuation transparent opacity={opacity} color={accent} depthWrite={false} />
    </points>
  );
}