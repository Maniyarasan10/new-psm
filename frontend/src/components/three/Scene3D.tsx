import { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  useGLTF,
  Environment,
  Float,
  Center,
  ContactShadows,
  PresentationControls,
  Sparkles,
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useScrollStore } from '../../store/scrollStore';

// The showcase object: a neural / cerebral structure that embodies the
// "Problem Solving Mind" idea. CC0 Khronos glTF sample, self-contained PBR.
const MODEL_URL = '/models/brainstem.glb';
const HDR_URL = '/hdri/studio_small_03_1k.hdr';

// Wardrobe: keep the model upright, roughly unit scale, resting on the floor.
const MODEL_SCALE = 1.35;
const GROUND_Y = -0.18;

function BrainModel() {
  const { scene } = useGLTF(MODEL_URL);

  // Spawn the model's own material animations if any; otherwise a slow idle drift.
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial | undefined;
        if (mat && 'emissive' in mat) {
          mat.emissiveIntensity = 0.12 + Math.sin(t * 0.8 + 1) * 0.04;
        }
      }
    });
  });

  return (
    <Center top>
      <group scale={MODEL_SCALE}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}

// A slim platform / pedestal that grounds the object and reads as a product plinth.
function Plinth({ y }: { y: number }) {
  return (
    <group position={[0, y, 0]}>
      {/* base disc */}
      <mesh receiveShadow>
        <cylinderGeometry args={[1.15, 1.25, 0.05, 96]} />
        <meshStandardMaterial
          color="#dfe6f5"
          metalness={0.55}
          roughness={0.32}
        />
      </mesh>
      {/* accent ring */}
      <mesh position={[0, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.1, 96]} />
        <meshBasicMaterial color="#3b6bc4" toneMapped={false} />
      </mesh>
    </group>
  );
}

// A soft, large light halo behind the object so it reads on the light hero
// without a harsh cutout.
function Halo() {
  return (
    <mesh position={[0, 0.4, -3.4]}>
      <circleGeometry args={[5.2, 64]} />
      <meshBasicMaterial
        color="#dce6fb"
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Scene3D() {
  const dpr = useScrollStore((s) => s.dpr);
  const isMobile = useScrollStore((s) => s.isMobile);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 1.1, 5.2], fov: 42 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      fallback={<div className="scene-placeholder" />}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={1.4} />
        <directionalLight position={[-5, 2, 3]} intensity={0.5} color="#93b1ef" />

        <Halo />

        <PresentationControls
          global
          cursor
          snap
          speed={1.4}
          zoom={1}
          rotation={[0, 0, 0]}
          polar={[-0.15, 0.15]}
          azimuth={[-0.7, 0.7]}
        >
          <Float speed={1.6} rotationIntensity={0.28} floatIntensity={0.7}>
            <BrainModel />
          </Float>
          <Plinth y={GROUND_Y} />
        </PresentationControls>

        <ContactShadows
          position={[0, GROUND_Y + 0.002, 0]}
          opacity={0.45}
          scale={7}
          blur={2.6}
          far={3}
          color="#0b1224"
        />

        {!isMobile && <Sparkles count={60} scale={[7, 4, 4]} size={1.6} speed={0.25} opacity={0.35} color="#5b8ae0" />}

        {/* HDRI lighting — the object's PBR responds to a real studio gradient */}
        <Environment files={HDR_URL} background={false} />
      </Suspense>

      <EffectComposer>
        <Bloom intensity={0.22} luminanceThreshold={0.85} mipmapBlur luminanceSmoothing={0.4} />
        <Vignette eskil={false} offset={0.16} darkness={0.4} />
      </EffectComposer>
    </Canvas>
  );
}

// Preload so the model + HDRI are fetched immediately from the bundle.
useGLTF.preload(MODEL_URL);
