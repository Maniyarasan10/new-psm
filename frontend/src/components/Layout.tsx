import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import Preloader from './Preloader';
import ParticleMorph from './ParticleMorph/ParticleMorph';
import { getLenis } from './SmoothScroll';
import { usePageAnimations } from '../hooks/usePageAnimations';
import { useReducedMotion } from '../lib/reducedMotion';
import { gsap, useGSAP } from '../lib/gsapSetup';

export default function Layout() {
  const { pathname } = useLocation();
  const shellRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Premium GSAP engine: split-text headings, batched reveals, parallax,
  // magnetic buttons, scroll progress. Re-runs (and reverts) per route change.
  usePageAnimations(shellRef, [pathname]);

  // Jump to top on route change (instant with Lenis so reveals start clean)
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  // Page-enter transition
  useGSAP(
    () => {
      if (reduced || !mainRef.current) return;
      gsap.from(mainRef.current, {
        autoAlpha: 0,
        y: 16,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'transform',
      });
    },
    { dependencies: [pathname, reduced] },
  );

  return (
    <>
      <Preloader />
      <ParticleMorph fullPage />
      <Navigation />
      <div ref={shellRef} className="page-shell">
        <main ref={mainRef} id="top">
          <div className="scroll-progress" aria-hidden />
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}