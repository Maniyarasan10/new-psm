import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PageHero, Section } from '../components/ui';
import { CompanyCta } from '../components/shared';
import { INDUSTRIES } from '../lib/siteContent';

export default function Industries() {
  return (
    <>
      <Seo
        title="Industries We Serve | Real Estate, Retail, Healthcare & More"
        description="Problem Solving Mind designs technology for real-world industries — real estate, retail & local commerce, healthcare, manufacturing, professional services and education."
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
          {INDUSTRIES.map((ind) => (
            <div key={ind.name} className="base-card">
              <h3 className="h3">{ind.name}</h3>
              <p className="body" style={{ marginTop: '0.5rem' }}>{ind.desc}</p>
              {ind.product && ind.productSlug && (
                <Link
                  className="btn btn-text"
                  to={ind.productSlug}
                  style={{ marginTop: '1rem' }}
                >
                  Product relevance: {ind.product} <span aria-hidden className="arrow">→</span>
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
