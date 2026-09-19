import { Suspense, lazy, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from '../../lib/reducedMotion';
import { useWebGLSupport } from './core/useWebGLSupport';
import { usePerformanceProfile } from './core/usePerformanceProfile';
import { setScrollProgress, computeSectionProgress } from './core/scrollProbe';
import { SCENE_ACCENTS, isSceneVariant } from './sceneRegistry';
import type { SceneVariant } from './sceneRegistry';

// The three.js / R3F runtime is code-split here so the main bundle stays 3D-free.
const Canvas3D = lazy(() => import('./Canvas3D'));
const SceneRenderer = lazy(() => import('./SceneRenderer'));

export interface SceneFrameProps {
  variant?: string;
  parallax?: boolean;
  scrollTarget?: string;
  className?: string;
}

function SceneFallback({ accent }: { accent: string }) {
  return (
    <div
      aria-hidden
      className="psm-scene-fallback"
      style={{ '--scene-accent': accent } as CSSProperties}
    />
  );
}

export default function SceneFrame({
  variant = 'default',
  parallax = true,
  scrollTarget,
  className,
}: SceneFrameProps) {
  const anchor = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const webgl = useWebGLSupport();
  const profile = usePerformanceProfile();
  const [near, setNear] = useState(true);
  const [started, setStarted] = useState(false);

  const variantKey: SceneVariant = isSceneVariant(variant) ? variant : 'default';
  const accent = SCENE_ACCENTS[variantKey];

  useEffect(() => {
    const el = anchor.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        setNear(entry.isIntersecting);
        // Mount once; never remount on scroll so the WebGL context stays warm.
        if (entry.isIntersecting) setStarted(true);
      }
    }, { rootMargin: '10% 0px 10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!scrollTarget) return;
    const probeId = scrollTarget.replace(/^[#.]/, '');
    let raf = 0;
    const read = () => {
      const el = document.querySelector(scrollTarget);
      if (el instanceof HTMLElement) setScrollProgress(probeId, computeSectionProgress(el));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [scrollTarget]);

  const mountCanvas = started && webgl && !reduced && profile.tier !== 'low';
  const scenesActive = near && !reduced;

  return (
    <div
      ref={anchor}
      aria-hidden
      className={`psm-scene ${className ?? ''}`}
      style={{ '--scene-accent': accent } as CSSProperties}
    >
      {mountCanvas ? (
        <Suspense fallback={<SceneFallback accent={accent} />}>
          <Canvas3D active={scenesActive} parallax={parallax}>
            <SceneRenderer variant={variantKey} />
          </Canvas3D>
        </Suspense>
      ) : (
        <SceneFallback accent={accent} />
      )}
    </div>
  );
}