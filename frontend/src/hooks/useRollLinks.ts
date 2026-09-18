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

      SplitText.create(topEl, { type: 'chars', charsClass: 'rl-char' });
      SplitText.create(bottomEl, { type: 'chars', charsClass: 'rl-char' });
      // SplitText leaves whitespace as visible text nodes between the char
      // spans, so the space in multi-word labels ("Case Studies") stays glued to
      // the middle of the mask and glitches the roll. Wrap each leftover gap in
      // its own animated char so it travels with the letters.
      const collectAnimatedChars = (el: HTMLElement): HTMLElement[] => {
        const chars: HTMLElement[] = [];
        el.childNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            chars.push(node as HTMLElement);
            return;
          }
          if (node.nodeType !== Node.TEXT_NODE) return;
          const txt = node.textContent ?? '';
          if (txt.length === 0 || /[^\s\u00A0]/.test(txt)) return;
          const gap = document.createElement('span');
          gap.className = 'rl-char rl-gap';
          gap.style.display = 'inline-block';
          gap.style.whiteSpace = 'pre';
          gap.setAttribute('aria-hidden', 'true');
          gap.textContent = '\u00A0';
          node.replaceWith(gap);
          chars.push(gap);
        });
        return chars;
      };
      const topChars = collectAnimatedChars(topEl);
      const bottomChars = collectAnimatedChars(bottomEl);
      gsap.set(topChars, { display: 'inline-block', yPercent: 0 });
      gsap.set(bottomChars, { display: 'inline-block', yPercent: 100 });

      const tl = gsap.timeline({ paused: true });
      tl.to(
        topChars,
        { yPercent: -100, duration: 0.4, ease: 'power1.inOut', stagger: 0.02 },
        0,
      ).to(bottomChars, { yPercent: 0, duration: 0.4, ease: 'power1.inOut', stagger: 0.02 }, 0);

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