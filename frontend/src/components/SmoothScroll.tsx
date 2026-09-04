import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../lib/reducedMotion';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;
    // Register globally so scroll helpers (nav, progress, section intro) can use it
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    // Bridge Lenis -> ScrollTrigger so pinned/scrubbed animations track virtual scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis from only gsap.ticker (single rAF loop, no double-driving)
    const onTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTicker);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.config({ ignoreMobileResize: true });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const t = setTimeout(refresh, 500);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      window.removeEventListener('load', refresh);
      clearTimeout(t);
      gsap.ticker.remove(onTicker);
      lenis.destroy();
      lenisRef.current = null;
      if ((window as unknown as { __lenis?: Lenis }).__lenis === lenis) {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
    };
  }, [reduced]);

  // Expose lenis instance for callers (e.g. nav scrollTo, scroll progress)
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.lenis = 'loaded';
    return () => {
      delete el.dataset.lenis;
    };
  }, []);

  return <div ref={wrapRef}>{children}</div>;
}

export function getLenis(): Lenis | null {
  // Lenis instances aren't globally exposed by default; this is reached via
  // a module-level registry set in the provider for scrollTo helpers.
  return (window as unknown as { __lenis?: Lenis }).__lenis ?? null;
}
