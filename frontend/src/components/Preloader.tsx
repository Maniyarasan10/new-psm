import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsapSetup';
import { useReducedMotion } from '../lib/reducedMotion';

/**
 * Studio Foundry playbook §4.4 — first-visit preloader.
 * Plays ONCE per page session: wordmark rises in, an accent swoosh draws
 * itself via DrawSVGPlugin, a percent counter winds 000→100, then the whole
 * panel lifts away (power4.inOut). Gated by prefers-reduced-motion.
 *
 * A module-level guard de-dupes React StrictMode's double effect while letting
 * the first mount's timeline run to completion.
 */
let played = false;
let doneReached = false;
let tlEl: HTMLDivElement | null = null;

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (reduced) {
      el.style.display = 'none';
      return;
    }
    if (played) {
      // StrictMode re-runs this effect on the SAME element while the first run's
      // timeline is still playing — isActive() is false before the first tick, so
      // gate on completion instead. A remount (different el) also hides.
      if (doneReached || (tlEl && tlEl !== el)) {
        el.style.display = 'none';
        return;
      }
      return;
    }
    played = true;
    tlEl = el;

    const countEl = el.querySelector<HTMLElement>('.preloader-count');
    const wordmarkEl = el.querySelector<HTMLElement>('.preloader-wordmark');
    const path = el.querySelector<SVGPathElement>('.preloader-swoosh');
    if (!wordmarkEl) return;

    const counter = { v: 0 };
    const tl = gsap
      .timeline()
      .from(wordmarkEl, { autoAlpha: 0, y: 24, duration: 0.5, ease: 'power2.out' }, 0.05)
      .fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut' }, 0.15)
      .to(
        counter,
        {
          v: 100,
          duration: 1.0,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (countEl) countEl.textContent = String(Math.round(counter.v)).padStart(3, '0');
          },
        },
        0.2,
      )
      .to(wordmarkEl, { yPercent: -140, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, '+=0.15')
      .to(el, { yPercent: -100, duration: 0.6, ease: 'power4.inOut' }, '-=0.05')
      .set(el, { display: 'none' });
    tl.eventCallback('onComplete', () => {
      doneReached = true;
    });
  }, [reduced]);

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <span className="preloader-wordmark">PSM</span>
      <svg className="preloader-swoosh-svg" width="128" height="14" viewBox="0 0 128 14" fill="none" aria-hidden>
        <path
          className="preloader-swoosh"
          d="M0 7 C 24 -4, 44 4, 64 6 S 106 6, 128 3"
          stroke="var(--ink)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="preloader-count">000</span>
    </div>
  );
}