import { SOLUTIONS } from '../../lib/siteContent';
import { CREED } from '../../lib/content';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import SceneFrame from '../../components/3d/SceneFrame';

const SERVICE_3D_MAP: Record<string, string> = {
  'ai': 'ai',
  'business-systems': 'business-systems',
  'automation': 'automation',
  'web-mobile': 'web-mobile',
  'product-engineering': 'product-engineering',
  'hardware-iot': 'hardware-iot',
};

export default function Services() {
  const ref = useSectionReveal();
  return (
    <section id="services" className="section services-section" ref={ref}>
      <div className="container">
        <span className="eyebrow" data-reveal>Digital Solutions</span>
        <h2 className="h1" data-reveal style={{ maxWidth: '18ch' }}>
          We don't start with technology. <em className="accent-italic">We start with the problem.</em>
        </h2>

        <div className="services-grid" data-reveal>
          {SOLUTIONS.map((s, i) => {
            const variant = SERVICE_3D_MAP[s.id];
            return (
              <article className="service-card" key={s.id} style={{ '--card-accent': s.color } as React.CSSProperties}>
                <div className="service-3d" aria-hidden>
                  {variant && <SceneFrame variant={variant} parallax={false} />}
                </div>
                <div className="service-content">
                  <span className="mono service-number">0{i + 1}</span>
                  <h3 className="h3">{s.title}</h3>
                  <p className="body">{s.description}</p>
                  <div className="service-capabilities">
                    {s.capabilities.slice(0, 3).map((cap, ci) => (
                      <span key={ci} className="capability-tag">{cap}</span>
                    ))}
                  </div>
                  <a className="btn btn-text" href={s.slug} data-reveal data-reveal-delay={String(i * 80)}>
                    Learn more <span aria-hidden className="arrow">→</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <div className="creed" data-reveal>
          <h3 className="h3 creed-title">The PSM Creed</h3>
          {CREED.map((c: { rule: string; truth: string }, i) => (
            <div className="creed-row" key={i}>
              <span className="mono creed-num">0{i + 1}</span>
              <p className="creed-rule">{c.rule}</p>
              <p className="creed-truth mono">{c.truth}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
