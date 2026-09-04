import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../lib/reducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface RevealOptions {
  y?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
}

/**
 * Applies a fade+rise reveal to all matching children when scrolled into view.
 * Skips work entirely under prefers-reduced-motion.
 */
export function useSectionReveal(selector = '[data-reveal]', opts: RevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const scope = ref.current;
    if (!scope) return;

    const targets = scope.querySelectorAll(selector);
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      targets.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: opts.y ?? 40 },
          {
            opacity: 1,
            y: 0,
            duration: opts.duration ?? 0.9,
            ease: 'power3.out',
            delay: ((el as HTMLElement).dataset.delay ? Number((el as HTMLElement).dataset.delay) : 0),
            scrollTrigger: {
              trigger: el,
              start: opts.start ?? 'top 85%',
              once: opts.once ?? true,
            },
          }
        );
      });
    }, scope);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [reduced, selector, opts.duration, opts.y, opts.stagger, opts.start, opts.once]);

  return ref;
}
