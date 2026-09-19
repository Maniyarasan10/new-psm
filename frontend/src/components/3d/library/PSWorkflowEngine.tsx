import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { mulberry32 } from '../core/prng';
import { useMotion } from './shared';

export interface PSWorkflowEngineProps {
  seed?: number;
  accent?: string;
  accent2?: string;
  accent3?: string;
  tubeRadius?: number;
  particleCount?: number;
  particleSpeed?: number;
  enabled?: boolean;
  interactive?: boolean;
}

interface WorkflowStage {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  icon: string;
  position: [number, number, number];
  baseScale: number;
  connections: number[];
}

interface FlowParticle {
  edgeIndex: number;
  offset: number;
  speed: number;
  size: number;
}

interface HoverInfo {
  stage: WorkflowStage | null;
  connectedStages: WorkflowStage[];
  edgeProgress: number;
}

export function PSWorkflowEngine({
  seed = 1,
  accent = '#06b6d4',
  accent2 = '#fbbf24',
  accent3 = '#22c55e',
  tubeRadius = 0.035,
  particleCount = 6,
  particleSpeed = 0.16,
  enabled = true,
  interactive = true,
}: PSWorkflowEngineProps) {
  const { live, reduced } = useMotion(enabled);
  const { camera, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const tubeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const particleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({ stage: null, connectedStages: [], edgeProgress: 0 });

  const stages = useMemo<WorkflowStage[]>(() => {
    const rand = mulberry32(seed * 167449);
    const spacing = 2.2;
    const spread = 1.0;

    const stageDefs = [
      { id: 'trigger', label: 'Trigger', shortLabel: 'TRIGGER', description: 'Event or schedule initiates the workflow', color: '#22c55e', icon: '⚡' },
      { id: 'ai', label: 'AI Processing', shortLabel: 'AI', description: 'Intelligent analysis, classification, or decision-making', color: '#8b5cf6', icon: '🧠' },
      { id: 'api', label: 'API Calls', shortLabel: 'API', description: 'External service integration and data exchange', color: '#06b6d4', icon: '🔌' },
      { id: 'database', label: 'Database', shortLabel: 'DB', description: 'Data persistence, queries, and state management', color: '#f59e0b', icon: '🗄️' },
      { id: 'communication', label: 'Communication', shortLabel: 'NOTIFY', description: 'Notifications, alerts, and stakeholder updates', color: '#ec4899', icon: '📡' },
      { id: 'output', label: 'Output', shortLabel: 'OUTPUT', description: 'Final result delivery and workflow completion', color: '#14b8a6', icon: '✅' },
    ];

    return stageDefs.map((def, i) => ({
      ...def,
      position: [
        (i - (stageDefs.length - 1) / 2) * spacing,
        (rand() - 0.5) * spread * 0.4,
        (rand() - 0.5) * 0.3,
      ] as [number, number, number],
      baseScale: i === 0 || i === stageDefs.length - 1 ? 0.16 : 0.12,
      connections: [],
    }));
  }, [seed, accent, accent2, accent3]);

  const edges = useMemo(() => {
    const edges: { from: number; to: number; curve: THREE.CatmullRomCurve3 }[] = [];
    for (let i = 0; i < stages.length - 1; i++) {
      const A = stages[i].position;
      const B = stages[i + 1].position;
      const midX = (A[0] + B[0]) / 2;
      const midY = (A[1] + B[1]) / 2 + 0.4;
      const midZ = (A[2] + B[2]) / 2;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(A[0], A[1], A[2]),
        new THREE.Vector3(midX, midY, midZ),
        new THREE.Vector3(B[0], B[1], B[2]),
      ]);
      edges.push({ from: i, to: i + 1, curve });
      stages[i].connections.push(i + 1);
      stages[i + 1].connections.push(i);
    }
    return edges;
  }, [stages]);

  const particles = useMemo<FlowParticle[]>(() => {
    const pc = Math.max(1, Math.min(12, particleCount));
    const rand = mulberry32(seed * 9973);
    return Array.from({ length: pc }, () => ({
      edgeIndex: Math.floor(rand() * edges.length),
      offset: rand(),
      speed: particleSpeed + rand() * 0.1,
      size: 0.05 + rand() * 0.03,
    }));
  }, [seed, particleCount, particleSpeed, edges.length]);

  const tubeGeometries = useMemo(() => {
    return edges.map((edge) => new THREE.TubeGeometry(edge.curve, 32, tubeRadius, 8, false));
  }, [edges, tubeRadius]);

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / size.width) * 2 - 1;
      pointer.current.y = -((e.clientY / size.height) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [interactive, size]);

  useFrame((state, delta) => {
    if (!live) return;
    const t = reduced ? 0 : state.clock.elapsedTime;

    if (group.current) {
      const targetX = interactive ? pointer.current.x * 0.25 : Math.sin(t * 0.03) * 0.15;
      const targetY = interactive ? pointer.current.y * 0.15 : Math.sin(t * 0.02) * 0.1;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetX, 3, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetY, 3, delta);
    }

    if (interactive && camera) {
      const targetCamX = pointer.current.x * 0.3;
      const targetCamY = pointer.current.y * 0.2;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 2, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 2, delta);
      camera.lookAt(0, 0, 0);
    }

    for (let i = 0; i < stages.length; i++) {
      const mesh = nodeRefs.current[i];
      if (!mesh) continue;

      const isHovered = hoverInfo.stage?.id === stages[i].id;
      const pulse = Math.sin(t * 1.5 + i * 0.7) * 0.08 + 1;
      const targetScale = stages[i].baseScale * pulse * (isHovered ? 1.8 : 1);

      mesh.scale.x = THREE.MathUtils.damp(mesh.scale.x, targetScale, 5, delta);
      mesh.scale.y = THREE.MathUtils.damp(mesh.scale.y, targetScale, 5, delta);
      mesh.scale.z = THREE.MathUtils.damp(mesh.scale.z, targetScale, 5, delta);

      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, isHovered ? 1 : 0.9, 5, delta);
    }

    for (let i = 0; i < tubeRefs.current.length; i++) {
      const tube = tubeRefs.current[i];
      if (!tube) continue;

      const edge = edges[i];
      const isConnected = hoverInfo.stage && (
        (hoverInfo.stage.id === stages[edge.from].id && hoverInfo.connectedStages.some(s => s.id === stages[edge.to].id)) ||
        (hoverInfo.stage.id === stages[edge.to].id && hoverInfo.connectedStages.some(s => s.id === stages[edge.from].id))
      );

      const mat = tube.material as THREE.MeshBasicMaterial;
      const targetOpacity = isConnected ? 0.7 : (hoverInfo.stage ? 0.15 : 0.4);
      mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 4, delta);
      mat.color.set(isConnected ? accent2 : accent);
    }

    for (let i = 0; i < particleRefs.current.length; i++) {
      const m = particleRefs.current[i];
      const def = particles[i % particles.length];
      if (!m || !def) continue;
      const u = (t * def.speed + def.offset) % 1;
      const pos = edges[def.edgeIndex].curve.getPointAt(u);
      m.position.copy(pos);
      m.scale.setScalar(def.size * (1 + Math.sin(t * 8 + i) * 0.3));
    }
  });

  const handleNodeHover = (stage: WorkflowStage) => {
    if (!interactive) return;
    const connected = stage.connections.map(idx => stages[idx]);
    setHoverInfo({ stage, connectedStages: connected, edgeProgress: 0 });
  };

  const handleNodeLeave = () => {
    setHoverInfo({ stage: null, connectedStages: [], edgeProgress: 0 });
  };

  const handleTubeHover = (edgeIndex: number) => {
    if (!interactive) return;
    const edge = edges[edgeIndex];
    const fromStage = stages[edge.from];
    const toStage = stages[edge.to];
    setHoverInfo({ stage: fromStage, connectedStages: [toStage], edgeProgress: 0.5 });
  };

  const makeStageGeometry = (stage: WorkflowStage) => {
    const s = stage.baseScale;
    switch (stage.id) {
      case 'trigger':
        return <octahedronGeometry args={[s, 0]} />;
      case 'ai':
        return <icosahedronGeometry args={[s, 1]} />;
      case 'api':
        return <boxGeometry args={[s * 1.2, s * 1.2, s * 1.2]} />;
      case 'database':
        return <cylinderGeometry args={[s * 0.9, s * 0.9, s * 1.4, 12]} />;
      case 'communication':
        return <torusGeometry args={[s * 1.1, s * 0.35, 8, 16]} />;
      case 'output':
        return <sphereGeometry args={[s, 16, 16]} />;
    }
  };

  const getStageColor = (stage: WorkflowStage) => stage.color;

  return (
    <group ref={group}>
      {edges.map((_, i) => (
        <mesh
          key={`tube-${i}`}
          ref={(el) => { tubeRefs.current[i] = el; }}
          geometry={tubeGeometries[i]}
          onPointerOver={() => handleTubeHover(i)}
          onPointerOut={handleNodeLeave}
        >
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      ))}

      {particles.map((_, i) => (
        <mesh key={`particle-${i}`} ref={(el) => { particleRefs.current[i] = el; }}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshBasicMaterial color={accent2} transparent opacity={0.95} depthWrite={false} />
        </mesh>
      ))}

      {stages.map((stage, i) => (
        <group key={stage.id} onPointerOver={() => handleNodeHover(stage)} onPointerOut={handleNodeLeave}>
          <mesh
            ref={(el) => { nodeRefs.current[i] = el; }}
            position={stage.position}
          >
            {makeStageGeometry(stage)}
            <meshBasicMaterial
              color={getStageColor(stage)}
              transparent
              opacity={0.9}
              depthWrite={false}
            />
          </mesh>

          <Html
            transform
            position={[stage.position[0], stage.position[1] - stage.baseScale * 1.8, stage.position[2]]}
            prepend
            distanceFactor={10}
            fullscreen
          >
            <div
              className="workflow-stage-label"
              style={{
                color: stage.color,
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                opacity: hoverInfo.stage?.id === stage.id ? 1 : 0.7,
                transition: 'opacity 0.2s ease',
              }}
            >
              {stage.shortLabel}
            </div>
          </Html>
        </group>
      ))}

      <Html
        transform
        position={[-size.width / 200, -2.5, 0]}
        prepend
        distanceFactor={10}
        fullscreen
      >
        {hoverInfo.stage && (
          <div
            className="workflow-hover-panel"
            style={{
              background: 'rgba(10, 11, 15, 0.95)',
              border: `1px solid ${hoverInfo.stage.color}`,
              borderRadius: '8px',
              padding: '16px 20px',
              minWidth: '220px',
              maxWidth: '280px',
              color: '#f4f5f8',
              fontSize: '0.8rem',
              lineHeight: '1.5',
              fontFamily: 'system-ui, sans-serif',
              pointerEvents: 'none',
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${hoverInfo.stage.color}40`,
              transform: 'translateX(-50%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>{hoverInfo.stage.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: hoverInfo.stage.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {hoverInfo.stage.label}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#9aa0ab', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                  STAGE {stages.findIndex(s => s.id === hoverInfo.stage!.id) + 1} OF {stages.length}
                </div>
              </div>
            </div>
            <div style={{ color: '#d1d5db', marginBottom: '12px' }}>{hoverInfo.stage.description}</div>
            {hoverInfo.connectedStages.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.65rem', color: '#9aa0ab', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  CONNECTS TO
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {hoverInfo.connectedStages.map((s) => (
                    <span
                      key={s.id}
                      style={{
                        background: `rgba(${new THREE.Color(s.color).r * 255}, ${new THREE.Color(s.color).g * 255}, ${new THREE.Color(s.color).b * 255}, 0.15)`,
                        border: `1px solid ${s.color}60`,
                        color: s.color,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.6rem',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {s.shortLabel}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Html>
    </group>
  );
}