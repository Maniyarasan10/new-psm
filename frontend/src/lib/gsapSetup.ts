import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';

/**
 * Single source of truth for GSAP in this app.
 * Every premium plugin shipped with the GSAP 3.15 Club package is
 * registered here once, so any component can import these named
 * exports and use them without re-registering.
 *
 * Unused plugins are tree-shaken by Vite at build time — only the
 * modules actually referenced below end up in the production bundle.
 */
gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  ScrollToPlugin,
  ScrambleTextPlugin,
  CustomEase,
  Flip,
  Draggable,
  InertiaPlugin,
  MotionPathPlugin,
  MorphSVGPlugin,
  DrawSVGPlugin,
  TextPlugin,
  Observer,
  useGSAP,
);

// Signature eases that mirror the design-system tokens (--ease-out / --ease-spring)
// so motion feels consistent across every interaction.
if (!CustomEase.get('psm-out')) {
  CustomEase.create('psm-out', '0.16, 1, 0.3, 1');
}
if (!CustomEase.get('psm-spring')) {
  CustomEase.create('psm-spring', '0.34, 1.56, 0.64, 1');
}

// Project-wide defaults — consistent, expressive by default.
gsap.defaults({ ease: 'power3.out', duration: 0.8, overwrite: 'auto' });
gsap.ticker.lagSmoothing(0);
ScrollTrigger.config({ ignoreMobileResize: true });

// Guard against a known GSAP crash: "Cannot read properties of undefined
// (reading 'end')" fired from ScrollTrigger.refresh during a ScrollTrigger.batch
// creation. It triggers only when the very FIRST ScrollTrigger in the app has
// `once: true` (which happens on a reload with the page already scrolled, e.g.
// after the natural reload scroll restore). Creating a harmless, non-once
// trigger at module scope guarantees the first trigger is benign, before any
// component effect can register a once:true trigger. (GSAP forum topic 40242)
ScrollTrigger.create({ start: 0, end: 1 });

export {
  gsap,
  ScrollTrigger,
  SplitText,
  ScrollToPlugin,
  ScrambleTextPlugin,
  CustomEase,
  Flip,
  Draggable,
  InertiaPlugin,
  MotionPathPlugin,
  MorphSVGPlugin,
  DrawSVGPlugin,
  TextPlugin,
  Observer,
  useGSAP,
};