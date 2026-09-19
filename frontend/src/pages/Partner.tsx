import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PageHero, Section } from '../components/ui';
import SceneFrame from '../components/3d/SceneFrame';
import { PARTNERSHIP_AREAS, PRODUCTS } from '../lib/siteContent';

export default function Partner() {
  return (
    <>
      <Seo
        title="Partner With Problem Solving Mind | Products & Technology Solutions"
        description="Partner with Problem Solving Mind for product partnerships, technology collaborations, digital solutions and opportunities around Boowa, EYD and Aura."
        path="/partner"
      />

      <PageHero
        eyebrow="Partnerships"
        title="Let's Build Something Valuable Together."
        backdrop={<SceneFrame variant="default" />}
      >
        <p data-reveal data-reveal-load data-reveal-delay="100">PSM works with businesses, organizations, technology partners and individuals who have meaningful problems, market opportunities or capabilities that can create stronger solutions together.</p>
      </PageHero>

      {/* ── Partnership Areas ────────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">Areas</span>
        <h2 className="section-title" data-split>Partnership Areas.</h2>
      </Section>
      <ul className="check-list" data-reveal>
        {PARTNERSHIP_AREAS.map((area) => (
          <li key={area}>{area}</li>
        ))}
      </ul>
      <p className="body" style={{ marginTop: '1rem' }}>
        <a href="/partner" data-roll-link>Explore all partnership areas</a>
      </p>

      {/* ── Product Partnerships ─────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">Products</span>
        <h2 className="section-title" data-split>Product Partnerships.</h2>
      </Section>
      <div className="card-grid" data-grid-reveal>
        {PRODUCTS.map((p, i) => (
          <div key={p.id} className="base-card" data-reveal data-reveal-delay={String(i * 80)}>
            <h3 className="h3">{p.name}</h3>
            <p className="body" style={{ marginTop: '0.5rem' }}>{p.strapline}</p>
            <p className="body" style={{ marginTop: '0.75rem' }}>{p.summary}</p>
            <Link className="btn btn-text" style={{ marginTop: '1rem' }} to={p.slug}>
              Learn more <span aria-hidden className="arrow">→</span>
            </Link>
          </div>
        ))}
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="section cta-band">
        <div className="container" data-reveal>
          <h2 className="h2" data-split>Start a Partnership Conversation</h2>
          <p className="lead" style={{ marginTop: '1rem', maxWidth: '52ch' }}>
            Reach out to explore how we can create stronger solutions together.
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
