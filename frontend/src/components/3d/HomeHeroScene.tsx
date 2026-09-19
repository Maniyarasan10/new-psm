import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { PSMMorphingParticles } from './library/PSMMorphingParticles';
import { PSMEnergyRing } from './library/PSMEnergyRing';
import { useMotion } from './library/shared';
import { getScrollProgress } from './core/scrollProbe';

export function HomeHeroScene() {
  const { live, reduced, profile } = useMotion(true);
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  const isMobile = profile.tier === 'mobile';

  useEffect(() => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const ringProps = useMemo(() => ({
    seed: 2,
    accent: '#0d6efd',
    accent2: '#ffb829',
    radius: isMobile ? 2.8 : 3.6,
    rings: 1,
    orbiters: 0,
    speed: 0.025,
    corePulse: false,
    ringThickness: 0.003,
    ringSegments: 128,
    ringConfigs: [
      { radiusMult: 1.0, tilt: [Math.PI / 2.2, 0.12, 0] as [number, number, number], opacity: 0.15, speedMult: 0.2 },
    ],
    orbiterSize: 0,
    orbiterOpacity: 0,
    coreSize: 0,
    coreOpacity: 0,
    coreWireframeOpacity: 0,
    sparkCount: 0,
  }), [isMobile]);

  useFrame((_, delta) => {
    if (!live || reduced) return;

    const scrollProgress = getScrollProgress('home-hero');

    const targetX = pointer.current.x * (isMobile ? 0.08 : 0.12);
    const targetY = pointer.current.y * (isMobile ? 0.05 : 0.08);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 4, delta);
    camera.lookAt(0, 0, 0);

    if (scrollProgress > 0) {
      const scrollY = scrollProgress * (isMobile ? 0.8 : 1.2);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY + scrollY, 3, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 9 + scrollProgress * 2, 3, delta);
    }
  });

  return (
    <group>
      <group position={[0, 0, 0]}>
        <PSMEnergyRing {...ringProps} />
      </group>

      <group position={[0, 0, 0]}>
        <PSMMorphingParticles
          variant="home-hero"
          seed={1}
          radius={isMobile ? 2.2 : 2.8}
          speed={0.025}
          morphDuration={3}
          morphInterval={12000}
          scrollTriggered={false}
          hoverTriggered={false}
        />
      </group>
    </group>
  );
}

export default HomeHeroScene;