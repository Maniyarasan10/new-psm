import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { useSceneActive } from '../core/SceneState';
import { getScrollProgress } from '../core/scrollProbe';
import { useMotion, tierCount } from './shared';
import { mulberry32 } from '../core/prng';

export interface PSProductAssemblyProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  accent3?: string;
  scrollId?: string;
  stageSpacing?: number;
  baseScale?: number;
  particleCount?: number;
  enabled?: boolean;
}

interface AssemblyStage {
  id: string;
  label: string;
  color: string;
  icon: 'monitor' | 'code' | 'server' | 'database' | 'brain' | 'product';
  startProgress: number;
  endProgress: number;
  position: [number, number, number];
  ghostPosition: [number, number, number];
  scale: number;
  geometry: 'box' | 'cylinder' | 'sphere' | 'roundedBox';
}

export function PSProductAssembly({
  seed = 1,
  accent = '#ffb829',
  accent2 = '#0d6efd',
  accent3 = '#8b5cf6',
  scrollId = 'product-engineering',
  stageSpacing = 1.6,
  baseScale = 0.8,
  particleCount = 30,
  enabled = true,
}: PSProductAssemblyProps) {
  const active = useSceneActive();
  const { live, reduced, profile } = useMotion(enabled);
  const group = useRef<THREE.Group>(null);
  const stageRefs = useRef<(THREE.Object3D | null)[]>([]);
  const connectorRefs = useRef<(THREE.LineSegments | null)[]>([]);
  const particleRef = useRef<THREE.Points>(null);

  const stages = useMemo<AssemblyStage[]>(() => [
    {
      id: 'ui',
      label: 'UI/UX',
      color: '#ec4899',
      icon: 'monitor',
      startProgress: 0,
      endProgress: 0.18,
      position: [0, 0, 0],
      ghostPosition: [-3.5, 1.5, -1.5],
      scale: 0.7,
      geometry: 'roundedBox',
    },
    {
      id: 'frontend',
      label: 'Frontend',
      color: '#22c55e',
      icon: 'code',
      startProgress: 0.15,
      endProgress: 0.33,
      position: [0, -stageSpacing, 0],
      ghostPosition: [3.5, 0, 1.5],
      scale: 0.8,
      geometry: 'roundedBox',
    },
    {
      id: 'backend',
      label: 'Backend',
      color: '#3b82f6',
      icon: 'server',
      startProgress: 0.3,
      endProgress: 0.5,
      position: [0, -stageSpacing * 2, 0],
      ghostPosition: [-3.5, -1.5, 1.5],
      scale: 0.85,
      geometry: 'box',
    },
    {
      id: 'database',
      label: 'Database',
      color: '#f59e0b',
      icon: 'database',
      startProgress: 0.45,
      endProgress: 0.65,
      position: [0, -stageSpacing * 3, 0],
      ghostPosition: [3.5, -3, -1],
      scale: 0.75,
      geometry: 'cylinder',
    },
    {
      id: 'ai',
      label: 'AI Layer',
      color: '#8b5cf6',
      icon: 'brain',
      startProgress: 0.6,
      endProgress: 0.8,
      position: [0, -stageSpacing * 4, 0],
      ghostPosition: [-3, -4.5, 0],
      scale: 0.7,
      geometry: 'sphere',
    },
    {
      id: 'product',
      label: 'Complete Product',
      color: accent,
      icon: 'product',
      startProgress: 0.75,
      endProgress: 1,
      position: [0, -stageSpacing * 5, 0],
      ghostPosition: [0, -6, 0],
      scale: 1.2,
      geometry: 'roundedBox',
    },
  ], [accent, accent2, accent3, stageSpacing]);

  const particles = useMemo(() => {
    const count = tierCount(profile, particleCount, particleCount * 0.6, particleCount * 0.3);
    const rand = mulberry32(seed * 48271);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    const targetStages = new Float32Array(count);

    const stageColors = [
      new THREE.Color('#ec4899'),
      new THREE.Color('#22c55e'),
      new THREE.Color('#3b82f6'),
      new THREE.Color('#f59e0b'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color(accent),
    ];

    for (let i = 0; i < count; i++) {
      const stageIdx = Math.floor(rand() * stages.length);
      const stage = stages[stageIdx];
      positions[i * 3] = stage.ghostPosition[0] + (rand() - 0.5) * 0.5;
      positions[i * 3 + 1] = stage.ghostPosition[1] + (rand() - 0.5) * 0.5;
      positions[i * 3 + 2] = stage.ghostPosition[2] + (rand() - 0.5) * 0.5;
      const c = stageColors[stageIdx];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = 0.02 + rand() * 0.03;
      alphas[i] = 0.3 + rand() * 0.5;
      phases[i] = rand() * Math.PI * 2;
      speeds[i] = 0.5 + rand() * 1.5;
      targetStages[i] = stageIdx;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('targetStage', new THREE.BufferAttribute(targetStages, 1));

    return { geometry, count };
  }, [profile.tier, seed, particleCount, stages]);

  const connectorGeometry = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < stages.length - 1; i++) {
      const start = stages[i].position;
      const end = stages[i + 1].position;
      const steps = 8;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = THREE.MathUtils.lerp(start[0], end[0], t);
        const y = THREE.MathUtils.lerp(start[1], end[1], t);
        const z = THREE.MathUtils.lerp(start[2], end[2], t);
        const curve = Math.sin(t * Math.PI) * 0.3;
        positions.push(x + curve, y, z);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    return geometry;
  }, [stages]);

  useFrame((state, delta) => {
    if (!live || !active) return;
    if (!group.current) return;

    const p = getScrollProgress(scrollId);
    const t = reduced ? 0 : state.clock.elapsedTime;

    group.current.rotation.y = Math.sin(t * 0.05) * 0.1;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const el = stageRefs.current[i];
      if (!el) continue;

      const stageProgress = THREE.MathUtils.clamp(
        (p - stage.startProgress) / (stage.endProgress - stage.startProgress),
        0,
        1
      );
      const eased = stageProgress < 0.5
        ? 2 * stageProgress * stageProgress
        : 1 - Math.pow(-2 * stageProgress + 2, 2) / 2;

      el.position.x = THREE.MathUtils.lerp(stage.ghostPosition[0], stage.position[0], eased);
      el.position.y = THREE.MathUtils.lerp(stage.ghostPosition[1], stage.position[1], eased) + Math.sin(t * 0.6 + i) * 0.02;
      el.position.z = THREE.MathUtils.lerp(stage.ghostPosition[2], stage.position[2], eased);

      const targetScale = stage.scale * baseScale * (0.3 + 0.7 * eased);
      el.scale.x = THREE.MathUtils.damp(el.scale.x, targetScale, 4, delta);
      el.scale.y = THREE.MathUtils.damp(el.scale.y, targetScale, 4, delta);
      el.scale.z = THREE.MathUtils.damp(el.scale.z, targetScale, 4, delta);

      el.rotation.y = THREE.MathUtils.lerp(stage.ghostPosition[0] * 0.2, 0, eased);
      el.rotation.x = THREE.MathUtils.lerp(stage.ghostPosition[1] * 0.1, 0, eased);
    }

    for (let i = 0; i < connectorRefs.current.length; i++) {
      const conn = connectorRefs.current[i];
      if (!conn) continue;
      const startStage = stages[i];
      const endStage = stages[i + 1];
      const startProgress = THREE.MathUtils.clamp(
        (p - startStage.startProgress) / (startStage.endProgress - startStage.startProgress),
        0,
        1
      );
      const endProgress = THREE.MathUtils.clamp(
        (p - endStage.startProgress) / (endStage.endProgress - endStage.startProgress),
        0,
        1
      );
      const avgProgress = (startProgress + endProgress) / 2;
      const mat = conn.material as THREE.LineBasicMaterial;
      mat.opacity = avgProgress * 0.4;
    }

    const mesh = particleRef.current;
    if (mesh) {
      const posAttr = mesh.geometry.getAttribute('position');
      const speedAttr = mesh.geometry.getAttribute('speed');
      const phaseAttr = mesh.geometry.getAttribute('phase');
      const targetStageAttr = mesh.geometry.getAttribute('targetStage');
      const alphaAttr = mesh.geometry.getAttribute('alpha');
      const sizeAttr = mesh.geometry.getAttribute('size');

      for (let i = 0; i < particles.count; i++) {
        const speed = speedAttr.getX(i);
        const phase = phaseAttr.getX(i);
        const targetStageIdx = targetStageAttr.getX(i);
        const targetStage = stages[targetStageIdx];
        const stageProgress = THREE.MathUtils.clamp(
          (p - targetStage.startProgress) / (targetStage.endProgress - targetStage.startProgress),
          0,
          1
        );

        const currX = posAttr.getX(i);
        const currY = posAttr.getY(i);
        const currZ = posAttr.getZ(i);

        const targetX = THREE.MathUtils.lerp(targetStage.ghostPosition[0], targetStage.position[0], stageProgress);
        const targetY = THREE.MathUtils.lerp(targetStage.ghostPosition[1], targetStage.position[1], stageProgress);
        const targetZ = THREE.MathUtils.lerp(targetStage.ghostPosition[2], targetStage.position[2], stageProgress);

        posAttr.setX(i, THREE.MathUtils.damp(currX, targetX + Math.sin(t * speed + phase) * 0.1, 2, delta));
        posAttr.setY(i, THREE.MathUtils.damp(currY, targetY + Math.cos(t * speed * 0.7 + phase) * 0.05, 2, delta));
        posAttr.setZ(i, THREE.MathUtils.damp(currZ, targetZ + Math.sin(t * speed * 0.5 + phase) * 0.1, 2, delta));

        const baseAlpha = alphaAttr.getX(i);
        alphaAttr.setX(i, baseAlpha * (0.3 + 0.7 * stageProgress));
        sizeAttr.setX(i, sizeAttr.getX(i) * (0.8 + 0.4 * stageProgress));
      }
      posAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
    }
  });

  const makeStageGeometry = (stage: AssemblyStage) => {
    const s = stage.scale * baseScale;
    switch (stage.geometry) {
      case 'roundedBox':
        return <RoundedBox args={[s * 1.5, s * 0.3, s]} radius={0.08} smoothness={2} />;
      case 'box':
        return <boxGeometry args={[s * 1.2, s * 0.8, s * 0.6]} />;
      case 'cylinder':
        return <cylinderGeometry args={[s * 0.6, s * 0.6, s * 1.2, 12]} />;
      case 'sphere':
        return <sphereGeometry args={[s * 0.7, 16, 16]} />;
    }
  };

  const getStageLabel = (stage: AssemblyStage) => (
    <group position={[0, -stage.scale * baseScale * 0.6, 0]}>
      <Text
        fontSize={0.12}
        color="#9aa0ab"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
        font="https://cdn.jsdelivr.net/npm/three@0.185.0/examples/fonts/helvetiker_regular.typeface.json"
      >
        {stage.label}
      </Text>
    </group>
  );

  return (
    <group ref={group}>
      <lineSegments geometry={connectorGeometry}>
        <lineBasicMaterial
          color={accent2}
          transparent
          opacity={0}
          depthWrite={false}
          ref={(el) => { connectorRefs.current[0] = el as THREE.LineSegments | null; }}
        />
      </lineSegments>
      <lineSegments geometry={connectorGeometry}>
        <lineBasicMaterial
          color={accent3}
          transparent
          opacity={0}
          depthWrite={false}
          ref={(el) => { connectorRefs.current[1] = el as THREE.LineSegments | null; }}
        />
      </lineSegments>
      <lineSegments geometry={connectorGeometry}>
        <lineBasicMaterial
          color={accent}
          transparent
          opacity={0}
          depthWrite={false}
          ref={(el) => { connectorRefs.current[2] = el as THREE.LineSegments | null; }}
        />
      </lineSegments>
      <lineSegments geometry={connectorGeometry}>
        <lineBasicMaterial
          color={accent2}
          transparent
          opacity={0}
          depthWrite={false}
          ref={(el) => { connectorRefs.current[3] = el as THREE.LineSegments | null; }}
        />
      </lineSegments>
      <lineSegments geometry={connectorGeometry}>
        <lineBasicMaterial
          color={accent3}
          transparent
          opacity={0}
          depthWrite={false}
          ref={(el) => { connectorRefs.current[4] = el as THREE.LineSegments | null; }}
        />
      </lineSegments>

      <points
        ref={particleRef}
        geometry={particles.geometry}
      >
        <pointsMaterial
          vertexColors
          sizeAttenuation
          transparent
          depthWrite={false}
        />
      </points>

      {stages.map((stage, i) => (
        <group
          key={stage.id}
          ref={(el) => { stageRefs.current[i] = el as unknown as THREE.Object3D; }}
        >
          <mesh>
            {makeStageGeometry(stage)}
            <meshBasicMaterial color={stage.color} transparent opacity={0.9} />
          </mesh>
          {getStageLabel(stage)}
        </group>
      ))}
    </group>
  );
}