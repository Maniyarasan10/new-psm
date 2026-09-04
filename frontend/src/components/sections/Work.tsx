import { WORK, STACK } from '../../lib/content';
import { useSectionReveal } from '../../hooks/useSectionReveal';

export default function Work() {
  const ref = useSectionReveal();
  return (
    <section id="work" className="section work-section" ref={ref}>
      <div className="container">
        <span className="eyebrow" data-reveal>Selected Work</span>
        <h2 className="h1" data-reveal>
          Where taste meets <em className="accent-italic">meaning.</em>
        </h2>

        <div className="work-list" data-reveal>
          {WORK.map((w) => (
            <a className="work-row" key={w.index} href={w.href}>
              <span className="mono work-index">({w.index})</span>
              <span className="mono work-meta">{w.meta}</span>
              <h3 className="h2 work-title" style={{ color: w.color }}>{w.product}</h3>
              <span className="work-arrow" aria-hidden>↗</span>
            </a>
          ))}
        </div>

        <div className="stack" data-reveal>
          <span className="eyebrow">Technology Stack</span>
          <div className="stack-cloud">
            {STACK.map((s, i) => (
              <span className="stack-item" key={i}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
