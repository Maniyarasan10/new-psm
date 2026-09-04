import { PRODUCTS } from '../../lib/content';
import { useSectionReveal } from '../../hooks/useSectionReveal';

export default function Products() {
  const ref = useSectionReveal();
  return (
    <section id="products" className="section products-section" ref={ref}>
      <div className="container">
        <span className="eyebrow" data-reveal>Product / Solution — SaaS surface</span>
        <div className="products-head">
          <h2 className="h1" data-reveal>
            We build when a problem is <em className="accent-italic">worth solving.</em>
          </h2>
          <p className="lead" data-reveal style={{ maxWidth: '34rem' }}>
            Not because a market exists, not because a trend is popular. PSM products earn
            their existence through a real, validated, repeating problem.
          </p>
        </div>

        <div className="products-grid" data-reveal>
          {PRODUCTS.map((p) => (
            <article className="product-card" key={p.id} style={{ '--card-accent': p.color } as React.CSSProperties}>
              <div className="product-card-top">
                <span className="mono product-status">
                  <span className="dot" style={{ background: p.color }} />
                  Product / {p.status}
                </span>
                <span className="mono">{p.segment}</span>
              </div>
              <h3 className="h2 product-name" style={{ color: p.color }}>{p.name}</h3>
              <p className="product-strapline">{p.strapline}</p>
              <p className="body" style={{ marginTop: '0.6rem' }}>{p.description}</p>
              <a className="btn btn-text" href="#contact">
                Explore {p.name} <span className="arrow" aria-hidden>→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
