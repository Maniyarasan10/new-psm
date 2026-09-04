import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../store/scrollStore';
import { useReducedMotion } from '../lib/reducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Maps overall scroll progress -> 3D scene phase.
 * Phase 0 = particles flowing, 1 = modular UI, 2 = product form.
 * The hero + the "Interactive 3D Story" section both drive the blend,
 * so the transformation feels continuous across the scroll story.
 */
export default function ScrollMapper() {
  const reduced = useReducedMotion();
  const setProgress = useScrollStore((s) => s.setProgress);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const p = window.scrollY / max;
      setProgress(p);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [setProgress]);

  useEffect(() => {
    if (reduced) return;
    const hero = document.getElementById('hero');
    const story = document.getElementById('story');
    if (!hero) return;

    const ctx = gsap.context(() => {
      // phase driven by scroll through hero + story heights
      const total = (hero.offsetHeight || window.innerHeight * 0.9) + (story?.offsetHeight || window.innerHeight * 1.2);
      const proxy = { v: 0 };
      const st = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: () => `+=${total}`,
        onUpdate: (self) => {
          proxy.v = self.progress;
          useScrollStore.getState().setPhase(proxy.v);
        },
      });
      return () => st.kill();
    });

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [reduced]);

  return null;
}
