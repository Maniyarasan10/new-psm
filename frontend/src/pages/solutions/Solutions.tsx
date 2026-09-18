import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { PageHero, Section } from '../../components/ui';
import { SOLUTIONS, SOLUTIONS_HUBS } from '../../lib/siteContent';

export default function SolutionsPage() {
  return (
    <>
      <Seo
        title="Digital Solutions Company | AI, Business Systems & Automation | PSM"
        description="Problem Solving Mind provides custom digital solutions including AI, business systems (ERP/CRM), automation, web and mobile applications, and product engineering."
        path="/solutions"
      />

      <PageHero
        eyebrow="PSM Digital Solutions"
        title="Digital Solutions Built Around Your Business."
      >
        <p>Your problem is unique. Your digital solution should be too.</p>
        <p>
          PSM helps businesses and organizations turn operational challenges, ideas
          and opportunities into practical digital systems. We combine product
          thinking, software engineering, AI and automation to build technology
          around the way your organization actually works.
        </p>
        <div className="page-hero-cta">
          <Link className="btn btn-primary" to="/contact">
            Discuss Your Problem <span aria-hidden className="arrow">→</span>
          </Link>
        </div>
      </PageHero>

      {/* ── Who We Help ──────────────────────────────── */}
      <Section eyebrow="Who we help" title="Built for Organizations With Problems Worth Solving.">
        <p className="lead" style={{ maxWidth: '62ch' }}>
          {SOLUTIONS_HUBS.whoWeHelp}
        </p>
      </Section>

      {/* ── Services ──────────────────────────────────── */}
      <Section eyebrow="Services" title="What We Build.">
        <div className="card-grid">
          {SOLUTIONS.map((s, i) => (
            <Link
              key={s.id}
              className="base-card link-card accent-card"
              to={s.slug}
              data-reveal
              data-reveal-delay={String(i * 80)}
              style={{ '--card-accent': s.color } as React.CSSProperties}
            >
              <div>
                <div className="card-accent-row accent-row--plain">
                  <span className="mono">{s.short}</span>
                </div>
                <h3 className="h3" style={{ marginTop: '0.5rem' }}>{s.title}</h3>
                <p className="body" style={{ marginTop: '0.5rem' }}>{s.description}</p>
              </div>
              <div className="link-card-foot">
                <span className="mono" style={{ color: 'var(--muted)' }}>
                  {s.capabilities.length} capabilities
                </span>
                <span className="arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Service CTA ────────────────────────────────── */}
      <section className="section cta-band">
        <div className="container">
          <h2 className="h2">{SOLUTIONS_HUBS.serviceCtaTitle}</h2>
          <p className="lead" style={{ marginTop: '1rem', maxWidth: '54ch' }}>
            {SOLUTIONS_HUBS.serviceCtaBody}
          </p>
          <div className="page-hero-cta">
            <Link className="btn btn-primary" to="/contact">
              {SOLUTIONS_HUBS.serviceCtaLabel} <span aria-hidden className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
