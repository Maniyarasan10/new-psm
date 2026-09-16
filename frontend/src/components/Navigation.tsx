import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NAV } from '../lib/siteContent';
import { useReducedMotion } from '../lib/reducedMotion';
import { gsap, useGSAP } from '../lib/gsapSetup';
import { useRollLinks } from '../hooks/useRollLinks';
import Logo from './Logo';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const reduced = useReducedMotion();

  const close = () => setOpen(false);

  // Glass background when scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body scroll lock while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ---- Mobile menu: build a single paused timeline (mobile only) ----
  // Visibility is owned by the `.nav-mobile-open` class + CSS transition so the
  // overlay can never be left as an invisible, click-blocking layer. GSAP only
  // staggers the links/CTA/footer content on open and close.
  useGSAP(
    () => {
      if (reduced) return;
      const mm = gsap.matchMedia();
      mm.add('(max-width: 900px)', () => {
        const links = rootRef.current?.querySelectorAll('.nav-mobile nav a');
        const cta = rootRef.current?.querySelector('.nav-mobile .btn');
        const foot = rootRef.current?.querySelector('.nav-mobile-foot');
        if (!links?.length) return;

        menuTl.current = gsap.timeline({ paused: true }).fromTo(
          links,
          { autoAlpha: 0, y: 34 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.055 },
          0.08,
        );
        if (cta) {
          menuTl.current.fromTo(
            cta,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' },
            '-=0.3',
          );
        }
        if (foot) {
          menuTl.current.fromTo(foot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, '-=0.25');
        }
      });
      return () => {
        mm.revert();
      };
    },
    { scope: rootRef },
  );

  // ---- Play / reverse the menu timeline with `open` ----
  // The overlay visibility is handled entirely by the `.nav-mobile-open` class
  // (React-driven), so this only animates the link stagger.
  useEffect(() => {
    if (reduced) return;
    const tl = menuTl.current;
    if (!tl) return;
    if (open) {
      tl.play(0);
    } else {
      tl.reverse(0);
    }
  }, [open, reduced]);

  // ---- Studio Foundry §4.1: roll-over links on the desktop nav ----
  useRollLinks(rootRef);

  // ---- Desktop: magnetic CTA (quickTo = one reused tween per axis) ----
  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(rootRef.current);

      const ctaEl = q('.nav-cta')[0] as HTMLElement | undefined;
      let xTo: ReturnType<typeof gsap.quickTo> | undefined;
      let yTo: ReturnType<typeof gsap.quickTo> | undefined;
      let onMove: ((e: PointerEvent) => void) | undefined;
      let onLeave: (() => void) | undefined;
      if (ctaEl) {
        xTo = gsap.quickTo(ctaEl, 'x', { duration: 0.5, ease: 'power3' });
        yTo = gsap.quickTo(ctaEl, 'y', { duration: 0.5, ease: 'power3' });
        onMove = (e: PointerEvent) => {
          const r = ctaEl.getBoundingClientRect();
          xTo?.(((e.clientX - (r.left + r.width / 2)) / r.width) * 12);
          yTo?.(((e.clientY - (r.top + r.height / 2)) / r.height) * 8);
        };
        onLeave = () => {
          xTo?.(0);
          yTo?.(0);
        };
        ctaEl.addEventListener('pointermove', onMove);
        ctaEl.addEventListener('pointerleave', onLeave);
      }

      return () => {
        if (ctaEl) {
          if (onMove) ctaEl.removeEventListener('pointermove', onMove);
          if (onLeave) ctaEl.removeEventListener('pointerleave', onLeave);
        }
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef}>
      <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`} data-theme-nav>
        <div className="container nav-inner">
          <Logo />
          <nav className="nav-links" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink
                key={n.href}
                to={n.href}
                onClick={close}
                data-roll-link
                data-roll-native
                aria-label={n.label}
className={({ isActive }) =>
                  `roll-link nav-link${isActive ? ' nav-link-active' : ''}`
                }
              >
                <span className="rl-mask" aria-hidden="true">
                  <span className="rl-copy rl-top">{n.label}</span>
                  <span className="rl-copy rl-bottom">{n.label}</span>
                </span>
              </NavLink>
            ))}
            <Link className="btn btn-primary nav-cta" to="/contact" onClick={close}>
              Contact
            </Link>
          </nav>
          <button
            className="nav-burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`nav-mobile ${open ? 'nav-mobile-open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map((n, i) => (
            <NavLink
              key={n.href}
              to={n.href}
              onClick={close}
              className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
            >
              <span className="mono">0{i + 1}</span> {n.label}
            </NavLink>
          ))}
          <Link className="btn btn-primary" to="/contact" onClick={close}>
            Contact
          </Link>
        </nav>
        <p className="mono nav-mobile-foot">Problem Solving Mind · Technology Studio</p>
      </div>
    </div>
  );
}