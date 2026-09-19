import { Suspense, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneActiveProvider } from './core/SceneState';
import { ParallaxGroup } from './core/ParallaxGroup';
import { usePerformanceProfile } from './core/usePerformanceProfile';

export interface Canvas3DProps {
  active: boolean;
  parallax: boolean;
  children: ReactNode;
}

export default function Canvas3D({ active, parallax, children }: Canvas3DProps) {
  const profile = usePerformanceProfile();

  return (
    <SceneActiveProvider active={active}>
      <Canvas
        className="psm-scene-canvas"
        dpr={[1, profile.dprCap]}
        frameloop={active ? 'always' : 'demand'}
        camera={{ position: [0, 0, 9], fov: 42 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ParallaxGroup enabled={parallax}>{children}</ParallaxGroup>
        </Suspense>
      </Canvas>
    </SceneActiveProvider>
  );
}