import { SOLUTIONS, CREED } from '../../lib/content';
import { useSectionReveal } from '../../hooks/useSectionReveal';

export default function Services() {
  const ref = useSectionReveal();
  return (
    <section id="approach" className="section services-section" ref={ref}>
      <div className="container">
        <span className="eyebrow" data-reveal>Services — The PSM Approach</span>
        <h2 className="h1" data-reveal style={{ maxWidth: '18ch' }}>
          We don't start with technology. <em className="accent-italic">We start with the problem.</em>
        </h2>

        <div className="services-grid" data-reveal>
          {SOLUTIONS.slice(0, 4).map((s, i) => (
            <div className="service-row" key={s.id}>
              <span className="mono">0{i + 1}</span>
              <h3 className="h3">{s.title}</h3>
              <p className="body">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="creed" data-reveal>
          <h3 className="h3 creed-title">The PSM Creed</h3>
          {CREED.map((c, i) => (
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
