import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PageHero, Section } from '../components/ui';
import { CompanyCta } from '../components/shared';
import { INDUSTRIES, PRODUCTS } from '../lib/siteContent';

const productColor = (slug?: string) =>
  PRODUCTS.find((p) => p.slug === slug)?.color ?? 'var(--accent-azure)';

export default function Industries() {
  return (
    <>
      <Seo
        title="Technology Solutions Across Industries | Problem Solving Mind"
        description="PSM builds digital products and technology solutions for real-world industries including real estate, retail/local commerce, healthcare, manufacturing and professional services."
        path="/industries"
      />

      <PageHero
        eyebrow="Industries"
        title="Technology Designed for Real-World Industries."
      >
        <p>
          Every industry has different workflows, constraints, customers and
          problems. Our approach is to understand the environment before designing
          the technology.
        </p>
        <div className="page-hero-cta">
          <Link className="btn btn-primary" to="/contact">
            Discuss Your Industry Problem <span aria-hidden className="arrow">→</span>
          </Link>
        </div>
      </PageHero>

      <Section eyebrow="Industries" title="Where We Work.">
        <div className="card-grid cols-2">
          {INDUSTRIES.map((ind, i) => (
            <div
              key={ind.name}
              className="base-card accent-card"
              data-reveal
              data-reveal-delay={String(i * 80)}
              style={{ '--card-accent': ind.color } as React.CSSProperties}
            >
              <div className="card-accent-row accent-row--plain">
                <span className="mono">{ind.tag}</span>
              </div>
              <h3 className="h3">{ind.name}</h3>
              <p className="body" style={{ marginTop: '0.5rem' }}>{ind.desc}</p>
              {ind.product && ind.productSlug && (
                <Link
                  className="btn btn-text"
                  to={ind.productSlug}
                  style={{ marginTop: '1rem' }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: productColor(ind.productSlug),
                      display: 'inline-block',
                      marginRight: '0.5rem',
                      boxShadow: '0 0 0 4px color-mix(in srgb, var(--muted) 12%, transparent)',
                    }}
                  />
                  {ind.product} — Product Relevance <span aria-hidden className="arrow">→</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </Section>

      <CompanyCta />
    </>
  );
}
