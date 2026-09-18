import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsapSetup';
import { useReducedMotion } from '../lib/reducedMotion';

const WORDS = [
  'Problem Solving',
  'Technology',
  'Products',
  'Solutions',
  'Automation',
  'Software',
  'Design',
];

/**
 * Marquee — a seamless GSAP ticker strip rendered below the hero.
 * Two identical rows translate -50% forever; hovering slows the crawl.
 * prefers-reduced-motion: static, no tween.
 */
export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || reduced) return;

      const tween = gsap.to(track, {
        xPercent: -50,
        duration: 32,
        ease: 'none',
        repeat: -1,
      });

      const slow = () => tween.timeScale(0.15);
      const resume = () => tween.timeScale(1);
      track.addEventListener('pointerenter', slow);
      track.addEventListener('pointerleave', resume);

      return () => {
        track.removeEventListener('pointerenter', slow);
        track.removeEventListener('pointerleave', resume);
      };
    },
    { dependencies: [reduced], revertOnUpdate: true },
  );

  const row = (key: string, hidden: boolean) => (
    <div className="marquee-row" key={key} aria-hidden={hidden}>
      {WORDS.map((word) => (
        <span className="marquee-item" key={word}>
          {word}
          <span className="marquee-sep" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" aria-label="PSM capabilities">
      <div className="marquee-track" ref={trackRef}>
        {row('a', false)}
        {row('b', true)}
      </div>
    </div>
  );
}