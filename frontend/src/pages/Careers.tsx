import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PageHero, Section } from '../components/ui';
import SceneFrame from '../components/3d/SceneFrame';
import { CAREERS } from '../lib/siteContent';

export default function Careers() {
  return (
    <>
      <Seo
        title="Careers at Problem Solving Mind | Join Our Technology Team"
        description="Join Problem Solving Mind and help build technology products and digital solutions across software, AI, product development and emerging technology."
        path="/careers"
      />

      <PageHero
        eyebrow="Careers"
        title="Build Technology. Solve Problems. Grow With Us."
        backdrop={<SceneFrame variant="default" />}
      >
        <p data-reveal data-reveal-load data-reveal-delay="100">{CAREERS.hero}</p>
        <p data-reveal data-reveal-load data-reveal-delay="200">PSM is building products and digital solutions in an environment where ideas need to become working technology. We value curiosity, ownership, practical thinking and the willingness to learn.</p>
      </PageHero>

      {/* ── Who We Look For ──────────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">Teams</span>
        <h2 className="section-title" data-split>Who We Look For.</h2>
      </Section>
      <ul className="check-list" data-reveal>
        {CAREERS.roles.map((role) => (
          <li key={role}>{role}</li>
        ))}
        </ul>
      <p className="body" style={{ marginTop: '1.5rem' }}>
        Only active hiring roles are listed when recruitment is actually open.
      </p>
      <p className="body" style={{ marginTop: '1rem' }}>
        <a href="/careers" data-roll-link>View all career opportunities</a>
      </p>

      {/* ── What You Can Expect ──────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">What to expect</span>
        <h2 className="section-title" data-split>What You Can Expect.</h2>
      </Section>
      <div className="card-grid cols-2" data-grid-reveal>
        {CAREERS.expectations.map((e, i) => (
          <div
            key={e.name}
            className="base-card accent-card"
            data-reveal
            data-reveal-delay={String(i * 80)}
            style={{ '--card-accent': e.color } as React.CSSProperties}
          >
            <div className="card-accent-row accent-row--plain">
              <span className="mono">{e.tag}</span>
            </div>
            <h3 className="h3">{e.name}</h3>
            <p>{e.desc}</p>
          </div>
        ))}
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="section cta-band">
        <div className="container" data-reveal>
          <h2 className="h2" data-split>Don't See a Suitable Role?</h2>
          <p className="lead" style={{ marginTop: '1rem', maxWidth: '52ch' }}>
            {CAREERS.footerCta}
          </p>
          <div className="page-hero-cta">
            <Link className="btn btn-primary" to="/contact">
              Contact PSM <span aria-hidden className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
