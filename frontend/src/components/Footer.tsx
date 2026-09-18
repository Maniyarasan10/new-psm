import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY, FOOTER_NAV, FOOTER_DISCLAIMER, PRODUCTS } from '../lib/siteContent';
import { useRollLinks } from '../hooks/useRollLinks';
import Logo from './Logo';

export default function Footer() {
  const rootRef = useRef<HTMLElement>(null);
  const year = new Date().getFullYear();
  useRollLinks(rootRef);
  return (
    <footer className="footer" ref={rootRef}>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tagline">{COMPANY.footerLine}</p>
            <p className="footer-desc">{COMPANY.tagline}</p>
            <Link className="btn btn-primary footer-cta" to="/contact" style={{ background: '#fff', color: 'var(--dark)' }}>
              Talk to PSM <span aria-hidden className="arrow">→</span>
            </Link>
          </div>

          <div className="footer-col">
            <span className="mono footer-label">Products</span>
            <ul>
              {PRODUCTS.map((p) => (
                <li key={p.id}>
                  <Link to={p.slug} data-roll-link>{p.name}</Link>
                </li>
              ))}

            </ul>
          </div>

          <div className="footer-col">
            <span className="mono footer-label">Company</span>
            <ul>
              {FOOTER_NAV.map((n) => (
                <li key={n.href}>
                  <Link to={n.href} data-roll-link>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <span className="mono footer-label">Connect</span>
            <ul>
              <li><a href={`mailto:${COMPANY.email}`} data-roll-link>Email Us</a></li>
              <li><a href={`tel:${COMPANY.phone1}`} data-roll-link>{COMPANY.phone1}</a></li>
              <li><a href={`tel:${COMPANY.phone2}`} data-roll-link>{COMPANY.phone2}</a></li>
            </ul>
          </div>
        </div>

        <p className="footer-disclaimer">{FOOTER_DISCLAIMER}</p>
        <div className="footer-bottom">
          <span>© {year} {COMPANY.shortName} · Technology Products & Digital Solutions</span>
          <span>Site by {COMPANY.name}</span>
          <span>
            <a href={`mailto:${COMPANY.email}`} data-roll-link>Say hello — {COMPANY.email}</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
