import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, SplitText, Flip } from '../lib/gsapSetup';
import { useReducedMotion } from '../lib/reducedMotion';

/**
 * Premium GSAP animations for PSM — builds on existing usePageAnimations
 * Adds: text scramble, Flip page transitions, ScrollTrigger pinning,
 * cursor follower, enhanced magnetic effects, DrawSVG, MorphSVG
 */

// ─────────────────────────────────────────────────────────────────
// 1. HERO HEADING SCRAMBLE REVEAL (custom implementation, no Club plugin needed)
// ─────────────────────────────────────────────────────────────────
export function useHeroScramble(
  selector = '[data-scramble]',
  options: {
    delay?: number;
    duration?: number;
    chars?: string;
    scrambleDuration?: number;
  } = {}
) {
  const reduced = useReducedMotion();
  const { delay = 0, duration = 1.2, chars = '▓░▒▓░▒▓░', scrambleDuration = 0.6 } = options;

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        const element = el as HTMLElement;
        const text = element.textContent || '';
        const length = text.length;
        
        // Create a proxy object for the scramble animation
        const proxy = { progress: 0 };
        
        const tl = gsap.timeline({
          delay: delay + i * 0.15,
          defaults: { ease: 'power3.out' },
        });

        tl.to(proxy, {
          progress: 1,
          duration: scrambleDuration,
          onUpdate: () => {
            let result = '';
            for (let j = 0; j < length; j++) {
              const charProgress = j / length;
              if (proxy.progress > charProgress + 0.15) {
                result += text[j];
              } else if (proxy.progress > charProgress - 0.15) {
                result += chars[Math.floor(Math.random() * chars.length)];
              } else {
                result += ' ';
              }
            }
            element.textContent = result;
          },
        }).to(proxy, {
          progress: 1,
          duration: duration - scrambleDuration,
          onUpdate: () => {
            let result = '';
            for (let j = 0; j < length; j++) {
              const charProgress = j / length;
              if (proxy.progress > charProgress + 0.1) {
                result += text[j];
              } else if (proxy.progress > charProgress - 0.1) {
                result += chars[Math.floor(Math.random() * chars.length)];
              } else {
                result += text[j];
              }
            }
            element.textContent = result;
          },
        }).call(() => {
          element.textContent = text;
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, delay, duration, chars, scrambleDuration]);
}

// ─────────────────────────────────────────────────────────────────
// 2. PAGE TRANSITION WITH FLIP
// ─────────────────────────────────────────────────────────────────
export function usePageTransition() {
  const reduced = useReducedMotion();
  const transitionState = useRef<'idle' | 'entering' | 'leaving'>('idle');

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      // Set up page enter animation
      gsap.set('[data-page-enter]', { autoAlpha: 0, y: 20 });

      gsap.timeline()
        .set('[data-page-enter]', { immediateRender: false })
        .to('[data-page-enter]', {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: 'power3.out',
        });

      // Observe navigation links for Flip transitions
      const navLinks = gsap.utils.toArray('a[data-flip]') as HTMLElement[];
      navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          if (transitionState.current !== 'idle') return;
          const href = link.getAttribute('href');
          if (!href || href.startsWith('#') || href.startsWith('http')) return;

          e.preventDefault();
          transitionState.current = 'leaving';

          // Get Flip state of all flip-target elements
          const targets = gsap.utils.toArray('[data-flip-target]') as HTMLElement[];
          Flip.getState(targets);

          // Navigate
          setTimeout(() => {
            window.location.href = href;
          }, 300);

          // Animate out
          gsap.to(targets, {
            autoAlpha: 0,
            y: -20,
            duration: 0.4,
            ease: 'power2.in',
            stagger: 0.03,
            onComplete: () => {
              transitionState.current = 'idle';
            },
          });
        });
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  return transitionState;
}

// ─────────────────────────────────────────────────────────────────
// 3. SCROLL-TRIGGERED HERO PINNING & PARALLAX
// ─────────────────────────────────────────────────────────────────
export function useHeroPin(
  heroSelector = '.hero',
  options: {
    pin?: boolean;
    parallaxLayers?: Array<{ selector: string; speed: number }>;
    scrub?: number;
  } = {}
) {
  const { pin = true, parallaxLayers = [], scrub = 0.5 } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const hero = document.querySelector(heroSelector) as HTMLElement;
      if (!hero) return;

      if (pin) {
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          pinSpacing: true,
          scrub,
        });
      }

      parallaxLayers.forEach((layer) => {
        const elements = gsap.utils.toArray(layer.selector) as HTMLElement[];
        elements.forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -layer.speed * 50 },
            {
              yPercent: layer.speed * 50,
              ease: 'none',
              scrollTrigger: {
                trigger: hero,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.3,
              },
            }
          );
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, heroSelector, pin, parallaxLayers, scrub]);
}

// ─────────────────────────────────────────────────────────────────
// 4. CURSOR FOLLOWER WITH TRAIL
// ─────────────────────────────────────────────────────────────────
export function useCursorFollower(
  options: {
    trailLength?: number;
    trailColors?: string[];
    size?: number;
    mixBlendMode?: string;
  } = {}
) {
  const { trailLength = 12, trailColors = ['#0d6efd', '#ffb829', '#15846e'], size = 8 } = options;
  const reduced = useReducedMotion();
  const trails = useRef<Array<{ x: number; y: number; color: string }>>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  useGSAP(() => {
    if (reduced || initialized.current) return;
    initialized.current = true;

    const ctx = gsap.context(() => {
      // Create trail elements
      const trailContainer = document.createElement('div');
      trailContainer.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: screen;
      `;
      document.body.appendChild(trailContainer);

      for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${trailColors[i % trailColors.length]};
          transform: translate(-50%, -50%) scale(${1 - i / trailLength});
          opacity: ${1 - i / trailLength * 0.8};
          pointer-events: none;
          will-change: transform;
        `;
        trailContainer.appendChild(dot);
        trails.current.push({ x: 0, y: 0, color: trailColors[i % trailColors.length] });
      }

      // Mouse tracking
      const onMove = (e: PointerEvent) => {
        mouse.current.x = e.clientX;
        mouse.current.y = e.clientY;
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      // Animate trails
      const animate = () => {
        let leadX = mouse.current.x;
        let leadY = mouse.current.y;

        trails.current.forEach((trail, i) => {
          const next = trails.current[i + 1];
          if (next) {
            trail.x += (next.x - trail.x) * 0.15;
            trail.y += (next.y - trail.y) * 0.15;
          } else {
            trail.x += (leadX - trail.x) * 0.15;
            trail.y += (leadY - trail.y) * 0.15;
          }

          const dot = trailContainer.children[i] as HTMLElement;
          if (dot) {
            gsap.set(dot, { x: trail.x, y: trail.y });
          }
        });

        requestAnimationFrame(animate);
      };
      animate();

      return () => {
        window.removeEventListener('pointermove', onMove);
        trailContainer.remove();
        initialized.current = false;
      };
    });
    return () => ctx.revert();
  }, [reduced, trailLength, trailColors, size]);
}

// ─────────────────────────────────────────────────────────────────
// 5. ENHANCED MAGNETIC BUTTONS WITH INERTIA
// ─────────────────────────────────────────────────────────────────
export function useMagneticButtons(
  selector = '.btn-primary, .btn-ghost, .nav-cta',
  options: {
    strength?: number;
    inertia?: boolean;
    inertiaDuration?: number;
  } = {}
) {
  const { strength = 1, inertia = true, inertiaDuration = 0.8 } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const buttons = gsap.utils.toArray(selector) as HTMLElement[];

      buttons.forEach((btn) => {
        const node = btn as HTMLElement;
        if (node.dataset.magnetic === 'off') return;

        const xTo = gsap.quickTo(node, 'x', { duration: 0.4, ease: 'power3.out' });
        const yTo = gsap.quickTo(node, 'y', { duration: 0.4, ease: 'power3.out' });
        const scaleTo = gsap.quickTo(node, 'scale', { duration: 0.3, ease: 'power2.out' });
        const rotationTo = gsap.quickTo(node, 'rotation', { duration: 0.5, ease: 'power3.out' });

        const move = (e: PointerEvent) => {
          const r = node.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          xTo(dx * 20 * strength);
          yTo(dy * 14 * strength);
          rotationTo(dx * 3 * strength);
        };

        const leave = () => {
          xTo(0);
          yTo(0);
          rotationTo(0);
          if (inertia) {
            scaleTo(1.02);
            gsap.to(node, { scale: 1, duration: inertiaDuration, ease: 'elastic.out(1, 0.5)' });
          }
        };

        const enter = () => {
          scaleTo(0.98);
        };

        node.addEventListener('pointermove', move);
        node.addEventListener('pointerleave', leave);
        node.addEventListener('pointerenter', enter);

        ctx.add(() => {
          node.removeEventListener('pointermove', move);
          node.removeEventListener('pointerleave', leave);
          node.removeEventListener('pointerenter', enter);
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, strength, inertia, inertiaDuration]);
}

// ─────────────────────────────────────────────────────────────────
// 6. DRAW SVG LINE ANIMATIONS
// ─────────────────────────────────────────────────────────────────
export function useDrawSVG(
  selector = '[data-draw-svg]',
  options: {
    delay?: number;
    duration?: number;
    stagger?: number;
    start?: string;
    once?: boolean;
  } = {}
) {
  const { delay = 0, duration = 1.5, stagger = 0.1, start = 'top 85%', once = true } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((svg, i) => {
        const svgEl = svg as SVGSVGElement;
        const paths = svgEl.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse');
        const pathArray = Array.from(paths) as SVGGeometryElement[];
        pathArray.forEach((path) => {
          const length = path.getTotalLength();
          path.style.strokeDasharray = String(length);
          path.style.strokeDashoffset = String(length);
        });

        gsap.fromTo(
          pathArray,
          { strokeDashoffset: (idx: number) => pathArray[idx].getTotalLength() },
          {
            strokeDashoffset: 0,
            duration,
            ease: 'power2.inOut',
            stagger: stagger * 0.5,
            delay: delay + i * stagger,
            scrollTrigger: {
              trigger: svgEl,
              start,
              once,
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, delay, duration, stagger, start, once]);
}

// ─────────────────────────────────────────────────────────────────
// 7. MORPH SVG ICON TRANSITIONS
// ─────────────────────────────────────────────────────────────────
export function useMorphSVG(
  triggerSelector = '[data-morph-trigger]',
  targetSelector = '[data-morph-target]',
  options: {
    duration?: number;
    ease?: string;
  } = {}
) {
  const { duration = 0.6, ease = 'power3.inOut' } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const triggers = gsap.utils.toArray(triggerSelector) as HTMLElement[];
      const targets = gsap.utils.toArray(targetSelector) as SVGPathElement[];

      triggers.forEach((trigger, i) => {
        const target = targets[i];
        if (!target) return;

        const originalPath = target.getAttribute('d') || '';
        const morphPath = trigger.dataset.morphPath;

        if (!morphPath) return;

        trigger.addEventListener('pointerenter', () => {
          gsap.to(target, { attr: { d: morphPath }, duration, ease });
        });
        trigger.addEventListener('pointerleave', () => {
          gsap.to(target, { attr: { d: originalPath }, duration, ease });
        });

        ctx.add(() => {
          trigger.removeEventListener('pointerenter', () => {});
          trigger.removeEventListener('pointerleave', () => {});
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, triggerSelector, targetSelector, duration, ease]);
}

// ─────────────────────────────────────────────────────────────────
// 8. COUNTER ANIMATION WITH SCROLL TRIGGER
// ─────────────────────────────────────────────────────────────────
export function useCounterAnimation(
  selector = '[data-count-to]',
  options: {
    duration?: number;
    ease?: string;
    start?: string;
    once?: boolean;
  } = {}
) {
  const { duration = 2, ease = 'power2.out', start = 'top 85%', once = true } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) {
      gsap.utils.toArray(selector).forEach((el) => {
        const node = el as HTMLElement;
        const to = Number(node.dataset.countTo) || 0;
        const pad = Number(node.dataset.countPad || 0);
        const suffix = node.dataset.countSuffix || '';
        node.textContent = (pad > 0 ? String(to).padStart(pad, '0') : String(to)) + suffix;
      });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el) => {
        const node = el as HTMLElement;
        const to = Number(node.dataset.countTo) || 0;
        const pad = Number(node.dataset.countPad || 0);
        const suffix = node.dataset.countSuffix || '';
        const snapshot = { v: 0 };

        gsap.to(snapshot, {
          v: to,
          duration,
          ease,
          scrollTrigger: {
            trigger: node,
            start,
            once,
            onEnter: () => gsap.to(snapshot, { v: to, duration, ease, onUpdate: () => {
              const val = Math.round(snapshot.v);
              node.textContent = (pad > 0 ? String(val).padStart(pad, '0') : String(val)) + suffix;
            }}),
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, duration, ease, start, once]);
}

// ─────────────────────────────────────────────────────────────────
// 9. STAGGERED GRID REVEAL WITH 3D PERSPECTIVE
// ─────────────────────────────────────────────────────────────────
export function useStaggeredGridReveal(
  selector = '[data-grid-reveal]',
  options: {
    stagger?: number;
    duration?: number;
    perspective?: number;
    axis?: 'x' | 'y' | 'z';
  } = {}
) {
  const { stagger = 0.08, duration = 1, perspective = 1000, axis = 'y' } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const grids = gsap.utils.toArray(selector) as HTMLElement[];

      grids.forEach((grid) => {
        const items = gsap.utils.toArray(grid.querySelectorAll('[data-grid-item]')) as HTMLElement[];
        if (!items.length) return;

        gsap.set(grid, { perspective });

        gsap.fromTo(
          items,
          {
            autoAlpha: 0,
            y: axis === 'y' ? 60 : 0,
            x: axis === 'x' ? 60 : 0,
            z: axis === 'z' ? -200 : 0,
            rotateX: axis === 'x' ? 45 : 0,
            rotateY: axis === 'y' ? -30 : 0,
            scale: 0.9,
            transformOrigin: '50% 50%',
          },
          {
            autoAlpha: 1,
            y: 0,
            x: 0,
            z: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration,
            ease: 'expo.out',
            stagger: {
              each: stagger,
              grid: 'auto',
              from: 'center',
            },
            scrollTrigger: {
              trigger: grid,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, stagger, duration, perspective, axis]);
}

// ─────────────────────────────────────────────────────────────────
// 10. TEXT REVEAL BY LINES (MASKED)
// ─────────────────────────────────────────────────────────────────
export function useLineReveal(
  selector = '[data-line-reveal]',
  options: {
    delay?: number;
    duration?: number;
    stagger?: number;
    start?: string;
    once?: boolean;
  } = {}
) {
  const { delay = 0, duration = 1, stagger = 0.1, start = 'top 85%', once = true } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        const element = el as HTMLElement;
        const split = SplitText.create(element, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line-mask',
        });

        gsap.from(split.lines, {
          yPercent: 120,
          autoAlpha: 0,
          duration,
          ease: 'power3.out',
          stagger: { each: stagger, from: 'start' },
          delay: delay + i * 0.1,
          scrollTrigger: {
            trigger: element,
            start,
            once,
            toggleActions: 'play none none none',
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, delay, duration, stagger, start, once]);
}

// ─────────────────────────────────────────────────────────────────
// 11. SCROLL-TRIGGERED SECTION PINNING
// ─────────────────────────────────────────────────────────────────
export function useSectionPin(
  selector = '.section',
  options: {
    pinSpacing?: boolean;
    start?: string;
    end?: string;
    scrub?: number | boolean;
  } = {}
) {
  const { pinSpacing = false, start = 'top top', end = 'bottom top', scrub = 0.5 } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((section) => {
        const element = section as HTMLElement;
        ScrollTrigger.create({
          trigger: element,
          start,
          end,
          pin: true,
          pinSpacing,
          scrub,
          anticipatePin: 1,
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, pinSpacing, start, end, scrub]);
}

// ─────────────────────────────────────────────────────────────────
// 12. HORIZONTAL SCROLL SECTION (Gallery/Portfolio)
// ─────────────────────────────────────────────────────────────────
export function useHorizontalScroll(
  containerSelector = '[data-horizontal-scroll]',
  options: {
    speed?: number;
    snap?: number | boolean;
  } = {}
) {
  const { speed = 1, snap = 0.1 } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const containers = gsap.utils.toArray(containerSelector) as HTMLElement[];

      containers.forEach((container) => {
        const wrapper = container.querySelector('[data-horizontal-wrapper]') as HTMLElement;
        if (!wrapper) return;

        const items = gsap.utils.toArray(wrapper.children) as HTMLElement[];
        const totalWidth = items.reduce((acc, item) => acc + item.offsetWidth, 0);
        const viewportWidth = container.offsetWidth;

        gsap.to(wrapper, {
          x: () => -(totalWidth - viewportWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: () => `+=${totalWidth - viewportWidth}`,
            pin: true,
            scrub: speed,
            snap: 1 / (items.length - 1),
            anticipatePin: 1,
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, containerSelector, speed, snap]);
}

// ─────────────────────────────────────────────────────────────────
// 13. NUMBER TICKER (ODOMETER STYLE)
// ─────────────────────────────────────────────────────────────────
export function useOdometer(
  selector = '[data-odometer]',
  options: {
    duration?: number;
    delay?: number;
  } = {}
) {
  const { duration = 2, delay = 0 } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) {
      gsap.utils.toArray(selector).forEach((el) => {
        const node = el as HTMLElement;
        const to = Number(node.dataset.odometer || node.textContent || '0');
        node.textContent = String(to);
      });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        const node = el as HTMLElement;
        const to = Number(node.dataset.odometer || node.textContent || '0');
        const decimals = Number(node.dataset.decimals || 0);
        const prefix = node.dataset.prefix || '';
        const suffix = node.dataset.suffix || '';
        const separator = node.dataset.separator || ',';

        node.textContent = '0';

        gsap.to({ value: 0 }, {
          value: to,
          duration,
          ease: 'power3.out',
          delay: delay + i * 0.1,
          onUpdate: function() {
            const val = this.targets()[0].value;
            const formatted = val.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }).replace(/,/g, separator);
            node.textContent = prefix + formatted + suffix;
          },
          scrollTrigger: {
            trigger: node,
            start: 'top 90%',
            once: true,
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, duration, delay]);
}

// ─────────────────────────────────────────────────────────────────
// 14. WORD-BY-WORD 3D ROTATION REVEAL
// ─────────────────────────────────────────────────────────────────
export function useWordRotate3D(
  selector = '[data-word-rotate3d]',
  options: {
    delay?: number;
    duration?: number;
    stagger?: number;
    start?: string;
    once?: boolean;
    axis?: 'x' | 'y' | 'z';
    perspective?: number;
  } = {}
) {
  const { delay = 0, duration = 1.2, stagger = 0.06, start = 'top 85%', once = true, axis = 'x', perspective = 800 } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        const element = el as HTMLElement;
        const split = SplitText.create(element, {
          type: 'words',
          wordsClass: 'split-word-3d',
          autoSplit: true,
        });

        gsap.set(element, { perspective });

        gsap.from(split.words, {
          [axis === 'x' ? 'rotationX' : axis === 'y' ? 'rotationY' : 'rotationZ']: axis === 'x' ? -90 : axis === 'y' ? 90 : 180,
          autoAlpha: 0,
          transformOrigin: '50% 50% -50',
          transformPerspective: perspective,
          duration,
          ease: 'expo.out',
          stagger: { each: stagger, from: 'start' },
          delay: delay + i * 0.1,
          scrollTrigger: {
            trigger: element,
            start,
            once,
            toggleActions: 'play none none none',
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, delay, duration, stagger, start, once, axis, perspective]);
}

// ─────────────────────────────────────────────────────────────────
// 15. CHARACTER TYPEWRITER REVEAL
// ─────────────────────────────────────────────────────────────────
export function useTypewriterReveal(
  selector = '[data-typewriter]',
  options: {
    delay?: number;
    speed?: number;
    start?: string;
    once?: boolean;
    cursor?: boolean;
    cursorChar?: string;
  } = {}
) {
  const { delay = 0, speed = 0.03, start = 'top 85%', once = true, cursor = true, cursorChar = '|' } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        const element = el as HTMLElement;
        const text = element.textContent || '';
        element.textContent = '';

        const tl = gsap.timeline({
          delay: delay + i * 0.15,
          defaults: { ease: 'none' },
        });

        if (cursor) {
          tl.to(element, {
            textContent: cursorChar,
            duration: 0,
            onStart: () => element.textContent = cursorChar,
          });
        }

        for (let j = 0; j < text.length; j++) {
          tl.to(element, {
            textContent: text.slice(0, j + 1) + (cursor && j < text.length - 1 ? cursorChar : ''),
            duration: speed,
            ease: 'none',
          }, 0);
        }

        if (cursor) {
          tl.to(element, {
            textContent: text,
            duration: 0,
          });
        }

        ScrollTrigger.create({
          trigger: element,
          start: 'top 90%',
          once: true,
          onEnter: () => tl.play(),
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, delay, speed, start, once, cursor, cursorChar]);
}

// ─────────────────────────────────────────────────────────────────
// 16. CLIP-PATH TEXT REVEAL
// ─────────────────────────────────────────────────────────────────
export function useClipPathReveal(
  selector = '[data-clip-reveal]',
  options: {
    delay?: number;
    duration?: number;
    stagger?: number;
    start?: string;
    once?: boolean;
    direction?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  } = {}
) {
  const { delay = 0, duration = 1, stagger = 0.08, start = 'top 85%', once = true, direction = 'left' } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        const element = el as HTMLElement;
        const split = SplitText.create(element, {
          type: 'words,chars',
          wordsClass: 'clip-word',
          charsClass: 'clip-char',
        });

        const clipStart = direction === 'left' ? 'polygon(0 0, 0 0, 0 100%, 0 100%)' :
                          direction === 'right' ? 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' :
                          direction === 'top' ? 'polygon(0 0, 100% 0, 100% 0, 0 0)' :
                          direction === 'bottom' ? 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' :
                          'polygon(0 0, 50% 0, 50% 100%, 0 100%)';

        const clipEnd = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

        gsap.set(split.chars, { clipPath: clipStart, webkitClipPath: clipStart });

        gsap.to(split.chars, {
          clipPath: clipEnd,
          webkitClipPath: clipEnd,
          duration,
          ease: 'power3.out',
          stagger: { each: stagger, from: 'start' },
          delay: delay + i * 0.1,
          scrollTrigger: {
            trigger: element,
            start,
            once,
            toggleActions: 'play none none none',
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, delay, duration, stagger, start, once, direction]);
}

// ─────────────────────────────────────────────────────────────────
// 17. WAVE TEXT ANIMATION
// ─────────────────────────────────────────────────────────────────
export function useWaveText(
  selector = '[data-wave-text]',
  options: {
    delay?: number;
    duration?: number;
    amplitude?: number;
    frequency?: number;
    waveDuration?: number;
    start?: string;
    once?: boolean;
  } = {}
) {
  const { delay = 0, duration = 0.8, amplitude = 20, frequency = 1, waveDuration = 2, start = 'top 85%', once = true } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        const element = el as HTMLElement;
        const split = SplitText.create(element, {
          type: 'chars',
          charsClass: 'wave-char',
        });

        gsap.fromTo(split.chars,
          { y: amplitude, autoAlpha: 0, rotationZ: -10 },
          {
            y: 0,
            autoAlpha: 1,
            rotationZ: 0,
            duration,
            ease: 'elastic.out(1, 0.5)',
            stagger: { each: 0.02, from: 'start', repeat: -1, yoyo: true, repeatDelay: waveDuration },
            delay: delay + i * 0.1,
            scrollTrigger: {
              trigger: element,
              start,
              once,
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, delay, duration, amplitude, frequency, waveDuration, start, once]);
}

// ─────────────────────────────────────────────────────────────────
// 18. STAGGERED LETTER REVEAL WITH ELASTIC EASING
// ─────────────────────────────────────────────────────────────────
export function useLetterElasticReveal(
  selector = '[data-letter-elastic]',
  options: {
    delay?: number;
    duration?: number;
    stagger?: number;
    start?: string;
    once?: boolean;
    elasticity?: number;
    damping?: number;
  } = {}
) {
  const { delay = 0, duration = 1, stagger = 0.03, start = 'top 85%', once = true, elasticity = 1.2, damping = 0.5 } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        const element = el as HTMLElement;
        const split = SplitText.create(element, {
          type: 'chars',
          charsClass: 'elastic-char',
        });

        gsap.from(split.chars, {
          y: 100,
          scale: 0.5,
          autoAlpha: 0,
          duration,
          ease: `elastic.out(${elasticity}, ${damping})`,
          stagger: { each: stagger, from: 'start' },
          delay: delay + i * 0.1,
          scrollTrigger: {
            trigger: element,
            start,
            once,
            toggleActions: 'play none none none',
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, delay, duration, stagger, start, once, elasticity, damping]);
}

// ─────────────────────────────────────────────────────────────────
// 19. TEXT SHIMMER REVEAL
// ─────────────────────────────────────────────────────────────────
export function useTextShimmer(
  selector = '[data-text-shimmer]',
  options: {
    delay?: number;
    duration?: number;
    shimmerColor?: string;
    start?: string;
    once?: boolean;
  } = {}
) {
  const { delay = 0, duration = 1.5, shimmerColor = 'rgba(255,255,255,0.8)', start = 'top 85%', once = true } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        const element = el as HTMLElement;
        const split = SplitText.create(element, {
          type: 'words',
          wordsClass: 'shimmer-word',
        });

        gsap.fromTo(split.words,
          { backgroundPosition: '-200% center' },
          {
            backgroundPosition: '200% center',
            duration,
            ease: 'power2.out',
            stagger: { each: 0.15, from: 'start' },
            delay: delay + i * 0.1,
            scrollTrigger: {
              trigger: element,
              start,
              once,
              toggleActions: 'play none none none',
            },
          }
        );

        // Apply shimmer gradient via CSS
        gsap.set(split.words, {
          backgroundImage: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          backgroundSize: '200% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, delay, duration, shimmerColor, start, once]);
}

// ─────────────────────────────────────────────────────────────────
// 20. CASCADING TEXT REVEAL (WATERFALL)
// ─────────────────────────────────────────────────────────────────
export function useCascadingText(
  selector = '[data-cascade-text]',
  options: {
    delay?: number;
    duration?: number;
    stagger?: number;
    start?: string;
    once?: boolean;
    fallDistance?: number;
  } = {}
) {
  const { delay = 0, duration = 1.2, stagger = 0.05, start = 'top 85%', once = true, fallDistance = 80 } = options;
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        const element = el as HTMLElement;
        const split = SplitText.create(element, {
          type: 'lines',
          linesClass: 'cascade-line',
        });

        gsap.from(split.lines, {
          y: -fallDistance,
          autoAlpha: 0,
          rotationX: -90,
          transformOrigin: '50% 0%',
          transformPerspective: 600,
          duration,
          ease: 'expo.out',
          stagger: { each: stagger, from: 'start' },
          delay: delay + i * 0.1,
          scrollTrigger: {
            trigger: element,
            start,
            once,
            toggleActions: 'play none none none',
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced, selector, delay, duration, stagger, start, once, fallDistance]);
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────
export {
  gsap,
  ScrollTrigger,
  SplitText,
  Flip,
  useGSAP,
} from '../lib/gsapSetup';