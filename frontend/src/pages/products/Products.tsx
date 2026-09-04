import { Link } from 'react-router-dom';
import { PageHero, Section } from '../../components/ui';
import { PRODUCTS, PRODUCT_PRINCIPLES } from '../../lib/siteContent';

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Products"
        title="Products Built by Problem Solving Mind."
      >
        <p>We don't build products because a market exists. We build when a problem is worth solving.</p>
        <p>PSM develops proprietary technology products designed around real-world problems. Our product journey combines problem discovery, product design, engineering, testing and continuous improvement.</p>
      </PageHero>

      {/* ── Current Products ──────────────────────────────── */}
      <Section eyebrow="Current Products" title="Our Product Portfolio.">
        <div className="card-grid">
          {PRODUCTS.map((p) => (
            <Link key={p.id} className="base-card link-card" to={p.slug}>
              <div>
                <h3 className="h3">{p.name}</h3>
                <p className="body" style={{ marginTop: '0.5rem' }}>{p.strapline}</p>
                <p className="body" style={{ marginTop: '0.75rem' }}>{p.summary}</p>
              </div>
              <div className="link-card-foot">
                <span className="status-badge">{p.status}</span>
                <span className="arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Product Principles ────────────────────────────── */}
      <Section eyebrow="How we build" title="Product Principles.">
        <div className="steps-grid">
          {PRODUCT_PRINCIPLES.map((principle, i) => (
            <div key={i} className="step-card">
              <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="h3">{principle}</h3>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Product Status ────────────────────────────────── */}
      <Section eyebrow="Product Status" title="Where Each Product Stands.">
        <div className="value-list">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="value-row">
              <h3 className="h3">{p.name}</h3>
              <span className="status-badge">{p.status}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA Band ──────────────────────────────────────── */}
      <section className="section cta-band">
        <div className="container">
          <h2 className="h2">Follow Our Product Journey</h2>
          <p className="lead" style={{ marginTop: '1rem', maxWidth: '48ch' }}>
            Stay connected as we develop, test and launch each product. Reach out to learn more or explore partnership opportunities.
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
