import { useEffect, type RefObject } from 'react';
import { gsap, SplitText } from '../lib/gsapSetup';
import { useReducedMotion } from '../lib/reducedMotion';

/**
 * Studio Foundry playbook §4.1 — roll-over links.
 *
 * Any `<a>` tagged `[data-roll-link]` becomes a two-copy link: the original
 * text is parked at yPercent:0 inside an overflow-hidden mask, and a second
 * (identical) copy is parked at yPercent:+100. On hover/leave a single paused
 * GSAP timeline plays/reverses, sliding both copies ±100% per character
 * (stagger 0.02s, 0.4s, power1.inOut). Active/hover underline sweeps in with
 * `scaleX` (the playbook's `.roll-link::after`).
 *
 * Deliberately uses a plain effect + manual listeners — no scoped GSAP
 * contexts and no ScrollTrigger, so there is no "Invalid scope" risk under
 * React StrictMode.
 */
export function useRollLinks(root: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const scope = root.current;
    if (!scope || reduced) return;

    const links = Array.from(scope.querySelectorAll<HTMLElement>('[data-roll-link]'));
    const disposers: Array<() => void> = [];

    links.forEach((el) => {
      el.classList.add('roll-link');

      // For `[data-roll-native]` anchors the dual-copy mask is rendered by
      // React directly (see Navigation) — never mutate React-owned DOM, or
      // route-change reconciliations scramble the copies into doubled text.
      const isNative = el.hasAttribute('data-roll-native');

      let topEl = el.querySelector<HTMLElement>('.rl-top');
      let bottomEl = el.querySelector<HTMLElement>('.rl-bottom');
      if (!isNative && (!topEl || !bottomEl || !el.classList.contains('roll-initialized'))) {
        const label = el.getAttribute('aria-label') ?? (el.textContent ?? '').trim();
        if (!label) return;
        el.textContent = '';
        const mask = document.createElement('span');
        mask.className = 'rl-mask';
        mask.setAttribute('aria-hidden', 'true');
        topEl = document.createElement('span');
        topEl.className = 'rl-copy rl-top';
        topEl.textContent = label;
        bottomEl = document.createElement('span');
        bottomEl.className = 'rl-copy rl-bottom';
        bottomEl.textContent = label;
        mask.append(topEl, bottomEl);
        el.append(mask);
        el.classList.add('roll-initialized');
      }
      if (!topEl || !bottomEl) return;
      if (!el.classList.contains('roll-initialized')) {
        el.classList.add('roll-initialized');
      }

      const topSplit = SplitText.create(topEl, { type: 'chars', charsClass: 'rl-char' });
      const bottomSplit = SplitText.create(bottomEl, { type: 'chars', charsClass: 'rl-char' });
      gsap.set(topSplit.chars, { display: 'inline-block', yPercent: 0 });
      gsap.set(bottomSplit.chars, { display: 'inline-block', yPercent: 100 });

      const tl = gsap.timeline({ paused: true });
      tl.to(
        topSplit.chars,
        { yPercent: -100, duration: 0.4, ease: 'power1.inOut', stagger: 0.02 },
        0,
      ).to(bottomSplit.chars, { yPercent: 0, duration: 0.4, ease: 'power1.inOut', stagger: 0.02 }, 0);

      const onEnter = () => tl.play();
      const onLeave = () => tl.reverse();
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onLeave);
      disposers.push(() => {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
        tl.kill();
      });
    });

    return () => disposers.forEach((dispose) => dispose());
  }, [root, reduced]);
}