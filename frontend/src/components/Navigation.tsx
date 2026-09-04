import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NAV } from '../lib/siteContent';
import Logo from './Logo';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`} data-theme-nav>
        <div className="container nav-inner">
          <Logo />
          <nav className="nav-links" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink
                key={n.href}
                to={n.href}
                onClick={close}
                className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
              >
                {n.label}
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
              style={{ transitionDelay: `${i * 50 + 100}ms` }}
              className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
            >
              <span className="mono">0{i + 1}</span> {n.label}
            </NavLink>
          ))}
          <Link className="btn btn-primary" to="/contact" onClick={close} style={{ transitionDelay: `${NAV.length * 50 + 100}ms` }}>Contact</Link>
        </nav>
        <p className="mono nav-mobile-foot">Problem Solving Mind · Technology Studio</p>
      </div>
    </>
  );
}
