import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion, tierCount } from './shared';

export interface PSIoTNetworkProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  sensorCount?: number;
  gatewayCount?: number;
  radius?: number;
  connectionRadius?: number;
  pulseCount?: number;
  pulseSpeed?: number;
  enabled?: boolean;
}

interface SensorNode {
  position: [number, number, number];
  type: 'sensor' | 'gateway' | 'edge';
  color: string;
  size: number;
  connections: number[];
  signalPhase: number;
  signalStrength: number;
}

export function PSIoTNetwork({
  seed = 6,
  accent = '#06b6d4',
  accent2 = '#fbbf24',
  sensorCount = 12,
  gatewayCount = 2,
  radius = 2.5,
  connectionRadius = 1.8,
  pulseCount = 5,
  pulseSpeed = 0.22,
  enabled = true,
}: PSIoTNetworkProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  const isMobile = profile.tier === 'mobile';

  const networkData = useMemo(() => {
    const rand = mulberry32(seed * 2654435761);
    const nodes: SensorNode[] = [];

    const totalSensors = tierCount(profile, sensorCount, sensorCount - 2, sensorCount - 4);
    const totalGateways = gatewayCount;

    for (let g = 0; g < totalGateways; g++) {
      const angle = (g / totalGateways) * Math.PI * 2;
      nodes.push({
        position: [
          Math.cos(angle) * radius * 0.6,
          (rand() - 0.5) * 0.3,
          Math.sin(angle) * radius * 0.6,
        ],
        type: 'gateway',
        color: accent2,
        size: 0.12,
        connections: [],
        signalPhase: rand() * Math.PI * 2,
        signalStrength: 1,
      });
    }

    for (let s = 0; s < totalSensors; s++) {
      const angle = rand() * Math.PI * 2;
      const r = radius * (0.3 + rand() * 0.7);
      const height = (rand() - 0.5) * radius * 0.8;
      const node: SensorNode = {
        position: [Math.cos(angle) * r, height, Math.sin(angle) * r],
        type: rand() > 0.8 ? 'edge' : 'sensor',
        color: accent,
        size: rand() > 0.8 ? 0.09 : 0.06,
        connections: [],
        signalPhase: rand() * Math.PI * 2,
        signalStrength: 0.5 + rand() * 0.5,
      };
      nodes.push(node);
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].position[0] - nodes[j].position[0];
        const dy = nodes[i].position[1] - nodes[j].position[1];
        const dz = nodes[i].position[2] - nodes[j].position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < connectionRadius && rand() > 0.4) {
          nodes[i].connections.push(j);
          nodes[j].connections.push(i);
        }
      }
    }

    return nodes;
  }, [seed, sensorCount, gatewayCount, radius, connectionRadius, accent, accent2, profile.tier]);

  const pulses = useMemo(() => {
    const pc = Math.max(1, Math.min(8, pulseCount));
    const rand = mulberry32(seed * 80009);
    const gatewayIndices = networkData
      .map((n, i) => n.type === 'gateway' ? i : -1)
      .filter(i => i >= 0);

    return Array.from({ length: pc }, () => {
      const from = gatewayIndices[Math.floor(rand() * gatewayIndices.length)];
      const connected = networkData[from]?.connections || [];
      const to = connected.length > 0 ? connected[Math.floor(rand() * connected.length)] : from;
      return {
        from,
        to,
        off: rand(),
        spd: pulseSpeed + rand() * 0.15,
        size: 0.04 + rand() * 0.03,
      };
    });
  }, [seed, pulseCount, pulseSpeed, networkData]);

  const lineGeometry = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < networkData.length; i++) {
      for (const j of networkData[i].connections) {
        if (j > i) {
          const A = networkData[i].position;
          const B = networkData[j].position;
          arr.push(A[0], A[1], A[2], B[0], B[1], B[2]);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3));
    return g;
  }, [networkData]);

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;

    if (group.current) {
      group.current.rotation.y = t * 0.02;
      group.current.rotation.x = Math.sin(t * 0.04) * 0.03;
    }

    for (let i = 0; i < networkData.length; i++) {
      const mesh = nodeRefs.current[i];
      const node = networkData[i];
      if (mesh) {
        const pulse = Math.sin(t * 2 + node.signalPhase) * node.signalStrength * 0.15 + 1;
        mesh.scale.setScalar(pulse);
        mesh.position.y = node.position[1] + Math.sin(t * 0.8 + node.signalPhase) * 0.03;
      }
    }

    for (let i = 0; i < pulseRefs.current.length; i++) {
      const m = pulseRefs.current[i];
      const def = pulses[i % pulses.length];
      if (!m || !def) continue;
      const u = (t * def.spd + def.off) % 1;
      const from = networkData[def.from];
      const to = networkData[def.to];
      if (!from || !to) continue;
      m.position.set(
        from.position[0] + (to.position[0] - from.position[0]) * u,
        from.position[1] + (to.position[1] - from.position[1]) * u,
        from.position[2] + (to.position[2] - from.position[2]) * u
      );
      m.scale.setScalar(1 + Math.sin(t * 6 + i) * 0.4);
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color={accent} transparent opacity={0.2} depthWrite={false} />
      </lineSegments>
      {networkData.map((node, i) => (
        <mesh
          key={i}
          position={node.position}
          ref={(el) => { nodeRefs.current[i] = el; }}
          onPointerOver={() => {
            if (!isMobile && nodeRefs.current[i]) {
              nodeRefs.current[i]!.scale.setScalar(1.5);
            }
          }}
          onPointerOut={() => {
            if (!isMobile && nodeRefs.current[i]) {
              nodeRefs.current[i]!.scale.setScalar(1);
            }
          }}
        >
          {node.type === 'gateway' ? (
            <>
              <boxGeometry args={[node.size * 1.5, node.size * 1.5, node.size * 1.5]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.9} depthWrite={false} />
            </>
          ) : node.type === 'edge' ? (
            <>
              <octahedronGeometry args={[node.size, 0]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.95} depthWrite={false} />
            </>
          ) : (
            <>
              <sphereGeometry args={[node.size, 10, 10]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.85} depthWrite={false} />
            </>
          )}
        </mesh>
      ))}
      {pulses.map((_, i) => (
        <mesh key={i} ref={(el) => { pulseRefs.current[i] = el; }}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={accent2} transparent opacity={0.95} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}