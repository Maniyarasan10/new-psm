import { useEffect, useState } from 'react';
import { useWebGLSupport } from './useWebGLSupport';

export type PerfTier = 'desktop' | 'tablet' | 'mobile' | 'low';

export interface PerformanceProfile {
  tier: PerfTier;
  dprCap: number;
  particleBudget: number;
  parallax: boolean;
  width: number;
}

function computeProfile(width: number, webgl: boolean): PerformanceProfile {
  if (!webgl) {
    return { tier: 'low', dprCap: 1, particleBudget: 0, parallax: false, width };
  }
  if (width < 768) {
    return { tier: 'mobile', dprCap: 1.5, particleBudget: 420, parallax: false, width };
  }
  if (width <= 1024) {
    return { tier: 'tablet', dprCap: 1.75, particleBudget: 850, parallax: false, width };
  }
  return { tier: 'desktop', dprCap: 2, particleBudget: 1600, parallax: true, width };
}

export function usePerformanceProfile(): PerformanceProfile {
  const webgl = useWebGLSupport();
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth,
  );

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return computeProfile(width, webgl);
}