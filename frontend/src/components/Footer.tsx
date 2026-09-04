import { Link } from 'react-router-dom';
import { COMPANY, FOOTER_NAV, FOOTER_DISCLAIMER, PRODUCTS } from '../lib/siteContent';
import Logo from './Logo';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
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
                  <Link to={p.slug}>{p.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <span className="mono footer-label">Company</span>
            <ul>
              {FOOTER_NAV.map((n) => (
                <li key={n.href}>
                  <Link to={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <span className="mono footer-label">Connect</span>
            <ul>
              <li><a href={`mailto:${COMPANY.email}`}>Email Us</a></li>
              <li><a href={`tel:${COMPANY.phone1}`}>{COMPANY.phone1}</a></li>
              <li><a href={`tel:${COMPANY.phone2}`}>{COMPANY.phone2}</a></li>
              <li><a href={COMPANY.url} target="_blank" rel="noopener noreferrer">Website</a></li>
            </ul>
          </div>
        </div>

        <p className="footer-disclaimer">{FOOTER_DISCLAIMER}</p>
        <div className="footer-bottom">
          <span>© {year} {COMPANY.shortName} · Technology Products & Digital Solutions</span>
          <span>Site by {COMPANY.name}</span>
          <span>
            <a href={`mailto:${COMPANY.email}`}>Say hello — {COMPANY.email}</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
