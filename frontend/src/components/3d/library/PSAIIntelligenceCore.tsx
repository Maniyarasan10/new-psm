import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion, tierCount } from './shared';

export interface PSAIIntelligenceCoreProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  accent3?: string;
  layers?: number;
  nodesPerLayer?: number;
  particleCount?: number;
  orbitalCount?: number;
  dataStreamCount?: number;
  enabled?: boolean;
  interactive?: boolean;
}

interface NeuralNode {
  position: [number, number, number];
  layer: number;
  index: number;
  baseScale: number;
  color: string;
  pulsePhase: number;
  connections: number[];
}

interface DataParticle {
  position: [number, number, number];
  velocity: [number, number, number];
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

interface OrbitalRing {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  color: string;
  opacity: number;
  thickness: number;
}

export function PSAIIntelligenceCore({
  seed = 1,
  accent = '#8b5cf6',
  accent2 = '#06b6d4',
  accent3 = '#fbbf24',
  layers = 4,
  nodesPerLayer = 5,
  particleCount = 120,
  orbitalCount = 3,
  dataStreamCount = 8,
  enabled = true,
  interactive = true,
}: PSAIIntelligenceCoreProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const orbitalRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const hoveredNode = useRef<number | null>(null);

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [interactive]);

  const neuralData = useMemo(() => {
    const rand = mulberry32(seed * 104729);
    const L = Math.max(2, layers);
    const K = Math.max(2, nodesPerLayer);
    const nodes: NeuralNode[] = [];
    const nodeColors: string[] = [];

    for (let l = 0; l < L; l++) {
      for (let k = 0; k < K; k++) {
        const x = (l - (L - 1) / 2) * 1.1;
        const y = (k - (K - 1) / 2) * 0.9 + (rand() - 0.5) * 0.3;
        const z = (rand() - 0.5) * 0.6;
        nodes.push({
          position: [x, y, z] as [number, number, number],
          layer: l,
          index: l * K + k,
          baseScale: l === 0 || l === L - 1 ? 0.09 : 0.07,
          color: l === 0 || l === L - 1 ? accent2 : (l === 1 ? accent : accent3),
          pulsePhase: rand() * Math.PI * 2,
          connections: [],
        });
        nodeColors.push(l === 0 || l === L - 1 ? accent2 : (l === 1 ? accent : accent3));
      }
    }

    const edges: [number, number][] = [];
    for (let l = 0; l < L - 1; l++) {
      for (let k = 0; k < K; k++) {
        const from = l * K + k;
        for (let k2 = 0; k2 < K; k2++) {
          if (rand() < 0.5) {
            const to = (l + 1) * K + k2;
            edges.push([from, to]);
            nodes[from].connections.push(to);
            nodes[to].connections.push(from);
          }
        }
      }
    }

    return { nodes, edges, nodeColors };
  }, [seed, layers, nodesPerLayer, accent, accent2, accent3]);

  const dataParticles = useMemo(() => {
    const count = tierCount(profile, particleCount, particleCount * 0.6, particleCount * 0.35);
    const rand = mulberry32(seed * 48271);
    const particles: DataParticle[] = [];
    const layerPositions = [
      (layers - 1) / 2 * 1.1,
      (layers - 3) / 2 * 1.1,
      (layers - 5) / 2 * 1.1,
      -(layers - 1) / 2 * 1.1,
    ];

    for (let i = 0; i < count; i++) {
      const sourceLayer = Math.floor(rand() * layers);
      const targetLayer = (sourceLayer + 1 + Math.floor(rand() * (layers - 1))) % layers;
      const sourceX = layerPositions[sourceLayer] ?? 0;
      const targetX = layerPositions[targetLayer] ?? 0;

      particles.push({
        position: [
          sourceX + (rand() - 0.5) * 0.4,
          (rand() - 0.5) * 1.8,
          (rand() - 0.5) * 1.2,
        ] as [number, number, number],
        velocity: [
          (targetX - sourceX) * 0.02 + (rand() - 0.5) * 0.005,
          (rand() - 0.5) * 0.003,
          (rand() - 0.5) * 0.003,
        ] as [number, number, number],
        color: new THREE.Color([accent, accent2, accent3][Math.floor(rand() * 3)]),
        size: 0.015 + rand() * 0.02,
        life: rand() * 100,
        maxLife: 80 + rand() * 120,
      });
    }
    return particles;
  }, [seed, particleCount, layers, accent, accent2, accent3, profile.tier]);

  const orbitals = useMemo<OrbitalRing[]>(() => {
    const rand = mulberry32(seed * 80009);
    const rings: OrbitalRing[] = [];
    for (let i = 0; i < orbitalCount; i++) {
      rings.push({
        radius: 2.8 + i * 0.7,
        tilt: [Math.PI / 2 + rand() * 0.3, rand() * 0.5, 0] as [number, number, number],
        speed: 0.02 + rand() * 0.03 * (i % 2 === 0 ? 1 : -1),
        color: [accent, accent2, accent3][i % 3],
        opacity: 0.15 - i * 0.03,
        thickness: 0.004 + i * 0.0015,
      });
    }
    return rings;
  }, [seed, orbitalCount, accent, accent2, accent3]);

  const dataStreams = useMemo(() => {
    const rand = mulberry32(seed * 131071);
    const streams: { points: THREE.Vector3[]; color: string; speed: number; phase: number }[] = [];
    for (let i = 0; i < dataStreamCount; i++) {
      const points: THREE.Vector3[] = [];
      const segments = 20;
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const x = THREE.MathUtils.lerp(-3.5, 3.5, t);
        const y = (rand() - 0.5) * 1.5 * Math.sin(t * Math.PI);
        const z = (rand() - 0.5) * 1.5 * Math.sin(t * Math.PI * 2);
        points.push(new THREE.Vector3(x, y, z));
      }
      streams.push({
        points,
        color: [accent, accent2, accent3][Math.floor(rand() * 3)],
        speed: 0.5 + rand() * 0.8,
        phase: rand() * Math.PI * 2,
      });
    }
    return streams;
  }, [seed, dataStreamCount, accent, accent2, accent3]);

  const lineGeometry = useMemo(() => {
    const arr: number[] = [];
    for (const [a, b] of neuralData.edges) {
      const A = neuralData.nodes[a].position;
      const B = neuralData.nodes[b].position;
      arr.push(A[0], A[1], A[2], B[0], B[1], B[2]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3));
    return g;
  }, [neuralData]);

  const particleGeometry = useMemo(() => {
    const positions = new Float32Array(dataParticles.length * 3);
    const colors = new Float32Array(dataParticles.length * 3);
    const sizes = new Float32Array(dataParticles.length);
    const alphas = new Float32Array(dataParticles.length);

    for (let i = 0; i < dataParticles.length; i++) {
      const p = dataParticles[i];
      positions[i * 3] = p.position[0];
      positions[i * 3 + 1] = p.position[1];
      positions[i * 3 + 2] = p.position[2];
      colors[i * 3] = p.color.r;
      colors[i * 3 + 1] = p.color.g;
      colors[i * 3 + 2] = p.color.b;
      sizes[i] = p.size;
      alphas[i] = 0.6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    return g;
  }, [dataParticles]);

  const streamGeometries = useMemo(() => {
    return dataStreams.map((stream) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(stream.points.length * 3);
      stream.points.forEach((p, i) => {
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      });
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      return geometry;
    });
  }, [dataStreams]);

  useFrame((state, delta) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;

    if (group.current) {
      const targetX = interactive ? pointer.current.x * 0.3 : Math.sin(t * 0.03) * 0.2;
      const targetY = interactive ? pointer.current.y * 0.2 : Math.sin(t * 0.02) * 0.15;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetX, 3, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetY, 3, delta);
    }

    if (interactive && camera) {
      const targetCamX = pointer.current.x * 0.4;
      const targetCamY = pointer.current.y * 0.3;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 2, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 2, delta);
      camera.lookAt(0, 0, 0);
    }

    for (let i = 0; i < neuralData.nodes.length; i++) {
      const node = neuralData.nodes[i];
      const mesh = nodeRefs.current[i];
      if (!mesh) continue;

      const isHovered = hoveredNode.current === i;
      const pulse = Math.sin(t * 1.3 + node.pulsePhase) * 0.08 + 1;
      const targetScale = node.baseScale * pulse * (isHovered ? 1.6 : 1);

      mesh.scale.x = THREE.MathUtils.damp(mesh.scale.x, targetScale, 5, delta);
      mesh.scale.y = THREE.MathUtils.damp(mesh.scale.y, targetScale, 5, delta);
      mesh.scale.z = THREE.MathUtils.damp(mesh.scale.z, targetScale, 5, delta);

      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, isHovered ? 1 : 0.85, 5, delta);
    }

    for (let i = 0; i < orbitalRefs.current.length; i++) {
      const mesh = orbitalRefs.current[i];
      const orbital = orbitals[i];
      if (mesh) {
        mesh.rotation.y = t * orbital.speed;
        mesh.rotation.x = Math.sin(t * 0.05) * 0.05;
      }
    }

    const posAttr = particleGeometry.getAttribute('position');
    const alphaAttr = particleGeometry.getAttribute('alpha');
    const sizeAttr = particleGeometry.getAttribute('size');

    for (let i = 0; i < dataParticles.length; i++) {
      const p = dataParticles[i];
      p.life += delta * 60;
      if (p.life > p.maxLife) {
        p.life = 0;
        const layerPositions = [
          (layers - 1) / 2 * 1.1,
          (layers - 3) / 2 * 1.1,
          (layers - 5) / 2 * 1.1,
          -(layers - 1) / 2 * 1.1,
        ];
        const sourceLayer = Math.floor(Math.random() * layers);
        const sourceX = layerPositions[sourceLayer] ?? 0;
        p.position[0] = sourceX + (Math.random() - 0.5) * 0.4;
        p.position[1] = (Math.random() - 0.5) * 1.8;
        p.position[2] = (Math.random() - 0.5) * 1.2;
      }

      p.position[0] += p.velocity[0];
      p.position[1] += p.velocity[1];
      p.position[2] += p.velocity[2];

      posAttr.setX(i, p.position[0]);
      posAttr.setY(i, p.position[1]);
      posAttr.setZ(i, p.position[2]);

      const lifeRatio = p.life / p.maxLife;
      alphaAttr.setX(i, 0.6 * (1 - lifeRatio) * Math.sin(lifeRatio * Math.PI));
      sizeAttr.setX(i, p.size * (0.5 + 0.5 * lifeRatio));
    }
    posAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    for (let i = 0; i < streamGeometries.length; i++) {
      const stream = dataStreams[i];
      const geometry = streamGeometries[i];
      const positions = geometry.getAttribute('position');
      for (let j = 0; j < stream.points.length; j++) {
        const p = stream.points[j];
        const wave = Math.sin(t * stream.speed + stream.phase + j * 0.5) * 0.08;
        positions.setY(j, p.y + wave);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      {orbitals.map((orbital, i) => (
        <mesh
          key={i}
          ref={(el) => { orbitalRefs.current[i] = el; }}
          rotation={orbital.tilt}
        >
          <torusGeometry args={[orbital.radius, orbital.thickness, 16, 128]} />
          <meshBasicMaterial
            color={orbital.color}
            transparent
            opacity={orbital.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {dataStreams.map((stream, i) => (
        <lineSegments
          key={i}
          geometry={streamGeometries[i]}
        >
          <lineBasicMaterial
            color={stream.color}
            transparent
            opacity={0.25}
            depthWrite={false}
            linewidth={1.5}
          />
        </lineSegments>
      ))}

      <points geometry={particleGeometry}>
        <pointsMaterial
          vertexColors
          sizeAttenuation
          transparent
          depthWrite={false}
          opacity={0.8}
        />
      </points>

      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#0a0b0f" transparent opacity={0.18} depthWrite={false} />
      </lineSegments>

      {neuralData.nodes.map((node, i) => (
        <mesh
          key={i}
          position={node.position}
          ref={(el) => { nodeRefs.current[i] = el; }}
          onPointerOver={() => { if (interactive) hoveredNode.current = i; }}
          onPointerOut={() => { if (interactive) hoveredNode.current = null; }}
          scale={node.baseScale}
        >
          <sphereGeometry args={[node.baseScale, 16, 16]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}