import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';

export interface PSBusinessStackProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  layers?: number;
  gridSize?: number;
  spacing?: number;
  cellSize?: number;
  wireOpacity?: number;
  pulseCount?: number;
  pulseSpeed?: number;
  enabled?: boolean;
}

interface StackLayer {
  y: number;
  cells: { x: number; z: number; active: boolean; color: string }[];
}

export function PSBusinessStack({
  seed = 2,
  accent = '#0d6efd',
  accent2 = '#34d399',
  layers = 4,
  gridSize = 3,
  spacing = 0.6,
  cellSize = 0.25,
  wireOpacity = 0.35,
  pulseCount = 3,
  pulseSpeed = 0.15,
  enabled = true,
}: PSBusinessStackProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const cellRefs = useRef<Map<number, THREE.Mesh>>(new Map());
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  const isMobile = profile.tier === 'mobile';

  const stackData = useMemo<StackLayer[]>(() => {
    const rand = mulberry32(seed * 224729);
    const L = Math.max(2, layers);
    const G = Math.max(2, gridSize);
    const stack: StackLayer[] = [];

    for (let l = 0; l < L; l++) {
      const cells = [];
      for (let gx = 0; gx < G; gx++) {
        for (let gz = 0; gz < G; gz++) {
          const active = rand() > 0.3;
          cells.push({
            x: (gx - (G - 1) / 2) * spacing,
            z: (gz - (G - 1) / 2) * spacing,
            active,
            color: active ? (l === 0 ? accent2 : accent) : '#0a0b0f',
          });
        }
      }
      stack.push({
        y: l * spacing * 1.3,
        cells,
      });
    }
    return stack;
  }, [seed, layers, gridSize, spacing, accent, accent2]);

  const pulses = useMemo(() => {
    const pc = Math.max(1, Math.min(6, pulseCount));
    const rand = mulberry32(seed * 327673);
    return Array.from({ length: pc }, () => ({
      layer: Math.floor(rand() * stackData.length),
      cell: Math.floor(rand() * stackData[0].cells.length),
      off: rand(),
      spd: pulseSpeed + rand() * 0.1,
    }));
  }, [seed, pulseCount, pulseSpeed, stackData.length]);

  const wireGeometry = useMemo(() => {
    const arr: number[] = [];
    const half = ((gridSize - 1) * spacing) / 2;
    for (const layer of stackData) {
      for (let i = 0; i < gridSize; i++) {
        const pos = -half + i * spacing;
        arr.push(-half, layer.y, pos, half, layer.y, pos);
        arr.push(pos, layer.y, -half, pos, layer.y, half);
      }
      for (let i = 0; i < gridSize; i++) {
        const pos = -half + i * spacing;
        arr.push(-half, layer.y, pos, -half, layer.y + spacing * 1.3, pos);
        arr.push(half, layer.y, pos, half, layer.y + spacing * 1.3, pos);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3));
    return g;
  }, [stackData, gridSize, spacing]);

  useFrame((state) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;

    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.03) * 0.12;
      group.current.rotation.x = Math.sin(t * 0.02) * 0.04;
    }

    for (const [key, mesh] of cellRefs.current) {
      const layerIdx = Math.floor(key / (gridSize * gridSize));
      const cellIdx = key % (gridSize * gridSize);
      const cell = stackData[layerIdx]?.cells[cellIdx];
      if (mesh && cell?.active) {
        mesh.scale.setScalar(1 + Math.sin(t * 1.3 + key * 0.5) * (isMobile ? 0.05 : 0.08));
      }
    }

    for (let i = 0; i < pulseRefs.current.length; i++) {
      const m = pulseRefs.current[i];
      const def = pulses[i % pulses.length];
      if (!m || !def) continue;
      const u = (t * def.spd + def.off) % 1;
      const layer = stackData[def.layer];
      if (!layer) continue;
      const cell = layer.cells[def.cell];
      if (!cell) continue;
      const nextLayer = stackData[(def.layer + 1) % stackData.length];
      const nextCell = nextLayer?.cells[def.cell];
      if (!nextCell) continue;

      m.position.set(
        cell.x + (nextCell.x - cell.x) * u,
        layer.y + (nextLayer.y - layer.y) * u,
        cell.z + (nextCell.z - cell.z) * u
      );
      m.scale.setScalar(0.8 + Math.sin(t * 4 + i) * 0.3);
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={wireGeometry}>
        <lineBasicMaterial color={accent} transparent opacity={wireOpacity} depthWrite={false} />
      </lineSegments>
      {stackData.map((layer, li) =>
        layer.cells.map((cell, ci) =>
          cell.active && (
            <mesh
              key={`${li}-${ci}`}
              position={[cell.x, layer.y, cell.z]}
              ref={(el) => { if (el) cellRefs.current.set(li * gridSize * gridSize + ci, el); }}
              onPointerOver={() => {
                if (!isMobile) {
                  const mesh = cellRefs.current.get(li * gridSize * gridSize + ci);
                  if (mesh) mesh.scale.setScalar(1.4);
                }
              }}
              onPointerOut={() => {
                if (!isMobile) {
                  const mesh = cellRefs.current.get(li * gridSize * gridSize + ci);
                  if (mesh) mesh.scale.setScalar(1);
                }
              }}
            >
              <boxGeometry args={[cellSize, cellSize * 0.6, cellSize]} />
              <meshBasicMaterial color={cell.color} transparent opacity={cell.active ? 0.9 : 0.15} depthWrite={false} />
            </mesh>
          )
        )
      )}
      {pulses.map((_, i) => (
        <mesh key={i} ref={(el) => { pulseRefs.current[i] = el; }}>
          <sphereGeometry args={[cellSize * 0.5, 10, 10]} />
          <meshBasicMaterial color={accent2} transparent opacity={0.95} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}