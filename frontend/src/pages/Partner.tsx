import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PageHero, Section } from '../components/ui';
import { PARTNERSHIP_AREAS, PRODUCTS } from '../lib/siteContent';

export default function Partner() {
  return (
    <>
      <Seo
        title="Partnerships | Build Something Valuable with Problem Solving Mind"
        description="PSM works with businesses, organizations, technology partners and individuals through product, business, technology and distribution partnerships, pilot programs and strategic collaborations."
        path="/partner"
      />

      <PageHero
        eyebrow="Partnerships"
        title="Let's Build Something Valuable Together."
      >
        <p>PSM works with businesses, organizations, technology partners and individuals who have meaningful problems, market opportunities or capabilities that can create stronger solutions together.</p>
      </PageHero>

      {/* ── Partnership Areas ────────────────────────────── */}
      <Section eyebrow="Areas" title="Partnership Areas.">
        <ul className="check-list">
          {PARTNERSHIP_AREAS.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </Section>

      {/* ── Product Partnerships ─────────────────────────── */}
      <Section eyebrow="Products" title="Product Partnerships.">
        <div className="card-grid">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="base-card">
              <h3 className="h3">{p.name}</h3>
              <p className="body" style={{ marginTop: '0.5rem' }}>{p.strapline}</p>
              <p className="body" style={{ marginTop: '0.75rem' }}>{p.summary}</p>
              <Link className="btn btn-text" style={{ marginTop: '1rem' }} to={p.slug}>
                Learn more <span aria-hidden className="arrow">→</span>
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="section cta-band">
        <div className="container">
          <h2 className="h2">Start a Partnership Conversation</h2>
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
