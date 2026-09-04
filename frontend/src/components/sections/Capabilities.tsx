import { SOLUTIONS } from '../../lib/content';
import { useSectionReveal } from '../../hooks/useSectionReveal';

export default function Capabilities() {
  const ref = useSectionReveal();
  return (
    <section id="capabilities" className="section capabilities-section" ref={ref}>
      <div className="container">
        <span className="eyebrow" data-reveal>Technology / Capabilities</span>
        <div className="capabilities-head">
          <h2 className="h1" data-reveal>
            Six ways we turn a stubborn problem into working software.
          </h2>
          <p className="lead" data-reveal style={{ maxWidth: '34rem' }}>
            Every practice area is a tool chosen because of the problem — not habit.
            Scroll the track to browse each one.
          </p>
        </div>

        <div className="capabilities-track" data-reveal>
          {SOLUTIONS.map((s, i) => (
            <article className="capability-card" key={s.id} data-scroll>
              <span className="mono capability-index">0{i + 1}</span>
              <span className="mono" style={{ color: s.color }}>{s.capability}</span>
              <h3 className="h3" style={{ marginTop: '1.2rem' }}>{s.title}</h3>
              <p className="body" style={{ marginTop: '0.75rem' }}>{s.description}</p>
              <ul className="capability-list">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
