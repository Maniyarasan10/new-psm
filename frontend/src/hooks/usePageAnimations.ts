import type { RefObject } from 'react';
import { useReducedMotion } from '../lib/reducedMotion';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../lib/gsapSetup';

/**
 * Global, route-aware GSAP engine run once per page inside <Layout>.
 *
 * What it wires up (all scoped to `scope`, auto-reverted on route change):
 *  1. Editorial heading reveals with SplitText (chars/words rise + tilt in)
 *  2. Batched [data-reveal] reveals — one ScrollTrigger.batch instead of 60
 *     individual triggers (dramatically fewer triggers, single stagger pass)
 *  3. Subtle scroll parallax on [data-parallax]
 *  4. Magnetic buttons via gsap.quickTo (one persistent tween, no GC churn)
 *  4b. Cards rotate with the pointer (subtle 3D tilt on hover)
 *  5. Top scroll-progress bar (scrub-driven, transform-only)
 *
 * Everything honours prefers-reduced-motion and only animates transform /
 * opacity so work stays on the compositor.
 */
export function usePageAnimations(scope: RefObject<HTMLElement | null>, deps: unknown[]) {
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      if (!scope.current) return;
      const q = gsap.utils.selector(scope.current);

      /* 0 ── Harmless first ScrollTrigger ──────────────────────────
         Known GSAP issue: if the very first ScrollTrigger created by the
         app has `once: true` (the SplitText heading below is the first one),
         a later ScrollTrigger.batch refresh can crash with
         "Cannot read properties of undefined (reading 'end')".
         Creating a benign, non-once trigger first avoids hitting that path.
         (see https://gsap.com/community/forums/topic/40242) */
      ScrollTrigger.create({ start: 0, end: 1 });

      /* 1 ── SplitText heading reveals ────────────────────────────── */
      const headings = q('[data-split]');
      headings.forEach((heading) => {
        const split = SplitText.create(heading as HTMLElement, {
          type: 'words, chars',
          wordsClass: 'split-word',
          charsClass: 'split-char',
        });
        gsap.from(split.words, {
          yPercent: 120,
          autoAlpha: 0,
          rotationX: -70,
          transformPerspective: 500,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.05,
          scrollTrigger: { trigger: heading as HTMLElement, start: 'top 88%', once: true },
        });
      });

      /* 1b ── Masked line reveals (Studio Foundry §4.2) ──────────── */
      const lineHeadings = q('[data-lines]');
      lineHeadings.forEach((heading) => {
        const split = SplitText.create(heading as HTMLElement, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          aria: 'none',
        });
        gsap.from(split.lines, {
          yPercent: 120,
          autoAlpha: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: heading as HTMLElement, start: 'top 85%', once: true },
        });
      });

      /* 1c ── Above-the-fold reveals: time-based, run on mount ─────
         Elements marked [data-reveal-load] live inside the hero and are
         already on screen at scrollY=0. Gate them on a mount delay instead
         of a scroll trigger: a scroll-gated trigger with start after the
         fold doesn't fire until the layout settles / first scroll frames,
         leaving hero CTAs invisible while the visitor starts scrolling. */
      q('[data-reveal-load]').forEach((el) => {
        const node = el as HTMLElement;
        gsap.fromTo(
          node,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: (node.dataset.revealDelay ? Number(node.dataset.revealDelay) : 0) / 1000,
          },
        );
      });

      /* 2b ── Section transitions (declared before the batch so the eyebrow /
         intro can be excluded from it) ──────────────────────────
         Each section is choreographed as one unit: the eyebrow rises, then
         the intro follows. The split-line title already plays via its own
         ScrollTrigger, and the content/cards come in through the reveals
         below — so the section enters as a coordinated sequence. */
      const sectionHeads = q('.section-head');
      const sectionOwned = new Set<Element>();
      sectionHeads.forEach((head) => {
        const eyebrow = head.querySelector('.eyebrow');
        const intro = head.querySelector('.section-intro');
        if (!eyebrow && !intro) return;
        if (eyebrow) sectionOwned.add(eyebrow);
        if (intro) sectionOwned.add(intro);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: head, start: 'top 88%', once: true },
        });
        if (eyebrow) {
          tl.fromTo(
            eyebrow,
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out' },
            0,
          );
        }
        if (intro) {
          tl.fromTo(
            intro,
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out' },
            0.15,
          );
        }
      });

      /* 2 ── Batched scroll reveals ─────────────────────────────────
         Cards, step-cards and reason rows get their own stagger below, and
         section-head eyebrows/intros are owned by the timeline above — keep
         all of those out of the generic batch to avoid double-animating. */
      const isCard = (el: Element) =>
        el.classList.contains('base-card') ||
        el.classList.contains('step-card') ||
        el.classList.contains('reason-row');
      const revealTargets = q('[data-reveal]:not([data-reveal-load])').filter(
        (el) => !isCard(el) && !sectionOwned.has(el),
      );
      ScrollTrigger.batch(revealTargets as HTMLElement[], {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { autoAlpha: 0, y: 32 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              stagger: (_i, el) => {
                const delayAttr = (el as HTMLElement).dataset.revealDelay;
                return delayAttr ? Number(delayAttr) / 1000 : 0;
              },
            },
          );
        },
      });

      /* 2a ── Scroll-driven card animation ──────────────────────────
         Cards flip up, unfade and spring into place row-by-row as they
         enter the viewport — ScrollTrigger.batch groups them per containing
         grid, so each grid becomes its own staggered rotating sequence. */
      const cards = q('.base-card[data-reveal], .step-card[data-reveal]');
      if (cards.length) {
        ScrollTrigger.batch(cards as HTMLElement[], {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              {
                autoAlpha: 0,
                y: 54,
                scale: 0.95,
                rotationX: -45,
                transformOrigin: '50% 100%',
                transformPerspective: 900,
              },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                rotationX: 0,
                duration: 1,
                ease: 'expo.out',
                stagger: 0.1,
              },
            );
          },
        });
      }

      const reasonRows = q('.reason-row[data-reveal]');
      if (reasonRows.length) {
        ScrollTrigger.batch(reasonRows as HTMLElement[], {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { autoAlpha: 0, y: 40 },
              { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.09 },
            );
          },
        });
      }

      /* 3 ── Subtle parallax ──────────────────────────────────────── */
      const parallaxEls = q('[data-parallax]');
      parallaxEls.forEach((el) => {
        const node = el as HTMLElement;
        const speed = Number(node.dataset.parallaxSpeed || 8) || 8;
        gsap.fromTo(
          node,
          { yPercent: speed * -1 },
          {
            yPercent: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.4,
            },
          },
        );
      });

      /* 4 ── Magnetic buttons (quickTo = one reused tween per axis) ─ */
      const listeners: Array<{
        node: HTMLElement;
        enter?: () => void;
        move: (e: PointerEvent) => void;
        leave: () => void;
      }> = [];
      const buttons = q('.btn-primary, .btn-ghost');
      buttons.forEach((btn) => {
        const node = btn as HTMLElement;
        if (node.dataset.magnetic === 'off') return;
        const xTo = gsap.quickTo(node, 'x', { duration: 0.5, ease: 'power3' });
        const yTo = gsap.quickTo(node, 'y', { duration: 0.5, ease: 'power3' });
        const move = (e: PointerEvent) => {
          const r = node.getBoundingClientRect();
          xTo(((e.clientX - (r.left + r.width / 2)) / r.width) * 16);
          yTo(((e.clientY - (r.top + r.height / 2)) / r.height) * 12);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        node.addEventListener('pointermove', move);
        node.addEventListener('pointerleave', leave);
        listeners.push({ node, move, leave });
      });

      /* 4b ── Card 3D tilt — the card rotates with the pointer ───
         Cards twist around X/Y (a light, tasteful tilt, not a flip) for as
         long as the cursor is over them. Skipped on coarse pointers where
         there is no hover. */
      if (!window.matchMedia('(pointer: coarse)').matches) {
        q('.base-card, .step-card').forEach((card) => {
          const node = card as HTMLElement;
          const rxTo = gsap.quickTo(node, 'rotationX', { duration: 0.45, ease: 'power3' });
          const ryTo = gsap.quickTo(node, 'rotationY', { duration: 0.45, ease: 'power3' });
          const enter = () => {
            gsap.set(node, { transformPerspective: 900, transformOrigin: '50% 50%' });
          };
          const move = (e: PointerEvent) => {
            const r = node.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            ryTo(px * 14);
            rxTo(py * -10);
          };
          const leave = () => {
            rxTo(0);
            ryTo(0);
          };
          node.addEventListener('pointerenter', enter);
          node.addEventListener('pointermove', move);
          node.addEventListener('pointerleave', leave);
          listeners.push({ node, enter, move, leave });
        });
      }

      /* 5 ── Scroll progress bar ─────────────────────────────────── */
      const progress = q('.scroll-progress')[0] as HTMLElement | undefined;
      if (progress) {
        gsap.to(progress, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
        });
      }

      return () => {
        listeners.forEach(({ node, enter, move, leave }) => {
          if (enter) node.removeEventListener('pointerenter', enter);
          node.removeEventListener('pointermove', move);
          node.removeEventListener('pointerleave', leave);
        });
      };
    },
    { dependencies: deps, revertOnUpdate: true },
  );
}