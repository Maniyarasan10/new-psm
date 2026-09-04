import { Link } from 'react-router-dom';
import { COMPANY_CTA, ENGINES } from '../lib/siteContent';

export function CompanyCta() {
  return (
    <section className="section cta-section">
      <div className="container">
        <span className="mono eyebrow" data-reveal>Let's build together</span>
        <h2 className="h2 cta-section-title" style={{ marginTop: '1.25rem', maxWidth: '22ch' }} data-reveal data-reveal-delay="60">
          {COMPANY_CTA.title}
        </h2>
        <p className="lead" style={{ marginTop: '1.25rem', maxWidth: '54ch' }} data-reveal data-reveal-delay="120">
          {COMPANY_CTA.body}
        </p>
        <div className="page-hero-cta" data-reveal data-reveal-delay="180">
          <Link className="btn btn-primary" to="/contact">
            {COMPANY_CTA.primaryCta} <span aria-hidden className="arrow">→</span>
          </Link>
          <Link className="btn btn-ghost" to="/products">
            {COMPANY_CTA.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function TwoEngines() {
  return (
    <div className="engine-grid">
      {ENGINES.map((e, i) => (
        <div key={e.id} className="engine-card" data-reveal data-reveal-delay={String(i * 100)}>
          <span className="mono">{e.short}</span>
          <h3 className="h3">{e.title}</h3>
          {e.desc.map((d, j) => (
            <p key={j}>{d}</p>
          ))}
          <Link className="btn btn-text" to={e.href}>
            {e.cta} <span aria-hidden className="arrow">→</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
