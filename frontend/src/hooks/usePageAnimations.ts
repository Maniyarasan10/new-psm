import type { RefObject } from 'react';
import { useReducedMotion } from '../lib/reducedMotion';
import { gsap, SplitText, useGSAP } from '../lib/gsapSetup';

/**
 * Global, route-aware GSAP engine run once per page inside <Layout>.
 *
 * Reveals are triggered with IntersectionObserver instead of
 * ScrollTrigger.batch. GSAP still owns every animation, but the *trigger* is
 * native: on touch devices a fast fling can carry the page past a
 * ScrollTrigger start/end range within a single tick, so a batched reveal was
 * skipped and the element stayed at `autoAlpha: 0` — and because CSS hides
 * `.js [data-reveal]`, the card was permanently invisible. IntersectionObserver
 * fires for every element that enters the viewport on every device and scroll
 * mode (Lenis or native), and anything already in view on mount is revealed
 * immediately, so content can never remain hidden.
 *
 * What it wires up (all scoped to `scope`, auto-reverted on route change):
 *  1. Editorial heading reveals with SplitText (chars/words rise + tilt in)
 *  2. Grouped [data-reveal] reveals (one IntersectionObserver per group)
 *  2a. Card / step / reason reveal animations
 *  3. Subtle scroll parallax on [data-parallax] (ScrollTrigger scrub)
 *  4. Magnetic buttons via gsap.quickTo (one persistent tween, no GC churn)
 *  4b. Cards rotate with the pointer (subtle 3D tilt on hover)
 *  4c. Stat counters & numbered badges count up on reveal
 *  5. Top scroll-progress bar (scrub-driven, transform-only)
 *
 * Everything honours prefers-reduced-motion and only animates transform /
 * opacity so work stays on the compositor.
 */
export function usePageAnimations(scope: RefObject<HTMLElement | null>, deps: unknown[]) {
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!scope.current) return;
      const q = gsap.utils.selector(scope.current);

      /* Reduced motion: pin counters to their final value, no tween ─── */
      if (reduced) {
        q('[data-count-to]').forEach((el) => {
          const node = el as HTMLElement;
          const to = Number(node.dataset.countTo) || 0;
          const pad = Number(node.dataset.countPad || 0);
          const suffix = node.dataset.countSuffix || '';
          node.textContent = (pad > 0 ? String(to).padStart(pad, '0') : String(to)) + suffix;
        });
        return;
      }

      /* Single shared IntersectionObserver for all reveals ─────────── */
      const ioSupported = typeof IntersectionObserver !== 'undefined';
      const viewportH = () => window.innerHeight || document.documentElement.clientHeight;
      const observerMap = new Map<IntersectionObserver, Array<{ el: HTMLElement; animate: (el: HTMLElement) => void }>>();

      const sharedObserver = ioSupported
        ? new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
              entries.forEach((entry: IntersectionObserverEntry) => {
                if (entry.isIntersecting) {
                  const observers = observerMap.get(sharedObserver!);
                  if (observers) {
                    const item = observers.find((o) => o.el === entry.target);
                    if (item) {
                      item.animate(entry.target as HTMLElement);
                      sharedObserver!.unobserve(entry.target);
                      const idx = observers.indexOf(item);
                      if (idx > -1) observers.splice(idx, 1);
                    }
                  }
                }
              });
            },
            { rootMargin: '0px 0px -8% 0px' }
          )
        : null;

      const revealGroup = (els: Array<Element>, animate: (el: HTMLElement) => void) => {
        if (!els.length) return;
        const now: HTMLElement[] = [];
        const observe: HTMLElement[] = [];
        const vh = viewportH();
        els.forEach((el) => {
          const node = el as HTMLElement;
          if (node.getBoundingClientRect().top < vh * 0.92) now.push(node);
          else observe.push(node);
        });
        if (now.length) now.forEach(animate);
        if (!observe.length) return;
        if (!ioSupported || !sharedObserver) {
          observe.forEach(animate);
          return;
        }
        observe.forEach((el) => {
          const list = observerMap.get(sharedObserver) || [];
          list.push({ el, animate });
          observerMap.set(sharedObserver, list);
          sharedObserver!.observe(el);
        });
      };

      /* 1 ── SplitText heading reveals ────────────────────────────── */
      q('[data-split]').forEach((heading) => {
        const split = SplitText.create(heading as HTMLElement, {
          type: 'words, chars',
          wordsClass: 'split-word',
          charsClass: 'split-char',
        });
        const tween = gsap.from(split.words, {
          yPercent: 120,
          autoAlpha: 0,
          rotationX: -70,
          transformPerspective: 500,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.05,
          paused: true,
        });
        revealGroup([heading], () => tween.play());
      });

      /* 1b ── Masked line reveals (Studio Foundry §4.2) ──────────── */
      q('[data-lines]').forEach((heading) => {
        const split = SplitText.create(heading as HTMLElement, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          aria: 'none',
        });
        const tween = gsap.from(split.lines, {
          yPercent: 120,
          autoAlpha: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.08,
          paused: true,
        });
        revealGroup([heading], () => tween.play());
      });

      /* 1c ── Above-the-fold reveals: time-based, run on mount ─────
         Elements marked [data-reveal-load] live inside the hero and are
         already on screen at scrollY=0, so they play on a mount delay rather
         than waiting for a trigger. */
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

      /* 2b ── Section transitions ───────────────────────────────────
         Each section head is choreographed as one unit: the eyebrow rises,
         then the intro follows. Content/cards come in through the reveals
         below, so the section enters as a coordinated sequence. */
      const sectionOwned = new Set<Element>();
      q('.section-head').forEach((head) => {
        const eyebrow = head.querySelector('.eyebrow');
        const intro = head.querySelector('.section-intro');
        if (!eyebrow && !intro) return;
        if (eyebrow) sectionOwned.add(eyebrow);
        if (intro) sectionOwned.add(intro);
        revealGroup([head], () => {
          const tl = gsap.timeline();
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
      });

      /* 2 ── Generic reveals ────────────────────────────────────────
         Cards, step-cards and reason rows get their own animation below, and
         section-head eyebrows/intros are owned by the sequence above — keep
         all of those out of the generic group. */
      const isCard = (el: Element) =>
        el.classList.contains('base-card') ||
        el.classList.contains('step-card') ||
        el.classList.contains('reason-row');
      const revealTargets = q('[data-reveal]:not([data-reveal-load])').filter(
        (el) => !isCard(el) && !sectionOwned.has(el),
      );
      revealGroup(revealTargets, (batch) =>
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
        ),
      );

      /* 2a ── Card animation ────────────────────────────────────────
         Cards flip up, unfade and spring into place row-by-row as they
         enter the viewport. */
      const cards = q('.base-card[data-reveal], .step-card[data-reveal]');
      revealGroup(cards, (batch) =>
        gsap.fromTo(
          batch,
          {
            autoAlpha: 0,
            y: 32,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.1,
          },
        ),
      );

      const reasonRows = q('.reason-row[data-reveal]');
      revealGroup(reasonRows, (batch) =>
        gsap.fromTo(
          batch,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.09 },
        ),
      );

      /* 4c ── Stat counters & numbered badges — count up on reveal ──
         Elements carry [data-count-to] with optional data-count-pad
         (leading zeros, e.g. step numbers "01"–"06") and
         data-count-suffix. Numbers roll 00 → target with a power2 ease. */
      q('[data-count-to]').forEach((el) => {
        const node = el as HTMLElement;
        const to = Number(node.dataset.countTo) || 0;
        const pad = Number(node.dataset.countPad || 0);
        const suffix = node.dataset.countSuffix || '';
        const snapshot = { v: 0 };
        const tween = gsap.to(snapshot, {
          v: to,
          duration: 1.6,
          ease: 'power2.out',
          paused: true,
          onUpdate() {
            const val = Math.round(snapshot.v);
            node.textContent = (pad > 0 ? String(val).padStart(pad, '0') : String(val)) + suffix;
          },
        });
        revealGroup([node], () => tween.play());
      });

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

      /* 4b ── Card 3D tilt + pointer spotlight — the card rotates with the
         pointer and a subtle radial glow trails it (CSS reads --mx / --my).
         Tilt is for the grid cards; the other card styles just get the
         spotlight since they have their own hover treatment. Skipped on
         coarse pointers where there is no hover. */
      if (!window.matchMedia('(pointer: coarse)').matches) {
        const spotlight = (node: HTMLElement, e: PointerEvent) => {
          const r = node.getBoundingClientRect();
          node.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
          node.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
        };

        q('.base-card, .step-card').forEach((card) => {
          const node = card as HTMLElement;
          const move = (e: PointerEvent) => {
            spotlight(node, e);
          };
          const leave = () => {
            node.style.setProperty('--mx', '50%');
            node.style.setProperty('--my', '50%');
          };
          node.addEventListener('pointermove', move);
          node.addEventListener('pointerleave', leave);
          listeners.push({ node, move, leave });
        });

        q('.product-card, .intro-card, .team-card, .capability-card, .contact-card, .btn-primary, .btn-ghost, .nav-cta').forEach(
          (card) => {
            const node = card as HTMLElement;
            const move = (e: PointerEvent) => spotlight(node, e);
            const leave = () => {
              node.style.setProperty('--mx', '50%');
              node.style.setProperty('--my', '50%');
            };
            node.addEventListener('pointermove', move);
            node.addEventListener('pointerleave', leave);
            listeners.push({ node, move, leave });
          },
        );
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
        sharedObserver?.disconnect();
        observerMap.clear();
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
