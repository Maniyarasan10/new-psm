import { METRICS, TEAM, COMPANY } from '../../lib/content';
import { useSectionReveal } from '../../hooks/useSectionReveal';

export default function Trust() {
  const ref = useSectionReveal();
  return (
    <section id="trust" className="section trust-section" ref={ref}>
      <div className="container">
        <span className="eyebrow" data-reveal>Metrics / Trust</span>
        <div className="metrics-grid" data-reveal>
          {METRICS.map((m) => (
            <div className="metric" key={m.label}>
              <span className="metric-value">{m.value}</span>
              <span className="mono metric-label">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="mission" data-reveal>
          <span className="mono">Our Mission</span>
          <h2 className="h1">Build Technology. Solve Problems. Create Impact.</h2>
          <p className="lead" style={{ maxWidth: '40rem' }}>
            We are a technology company focused on two connected areas — building proprietary
            products and providing digital solutions. One mindset powers both: Understand. Build. Improve.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Team() {
  const ref = useSectionReveal();
  return (
    <section id="team" className="section team-section" ref={ref}>
      <div className="container">
        <span className="eyebrow" data-reveal>Team</span>
        <h2 className="h1" data-reveal>
          Nothing without <em className="accent-italic">people.</em>
        </h2>
        <div className="team-grid" data-reveal>
          {TEAM.map((t, i) => (
            <div className="team-card" key={t.role}>
              <span className="mono">0{i + 1}</span>
              <h3 className="h3">{t.role}</h3>
              <p className="body">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactCta() {
  const ref = useSectionReveal();
  return (
    <section id="contact" className="section cta-section" ref={ref}>
      <div className="container">
        <span className="eyebrow" data-reveal>Start a conversation</span>
        <h2 className="display" data-reveal>
          Have a problem
          <br />
          worth <em className="accent-italic">solving?</em>
        </h2>
        <p className="lead" data-reveal style={{ maxWidth: '32rem' }}>
          Tell us what you're trying to solve — you don't need a technical spec. Every
          engagement begins with a Problem Call.
        </p>
        <div className="hero-cta" data-reveal>
          <a className="btn btn-primary" href={`mailto:${COMPANY.email}`}>
            {COMPANY.email} <span aria-hidden className="arrow">→</span>
          </a>
          <span className="mono cta-phone">
            {COMPANY.phone1} / {COMPANY.phone2}
          </span>
        </div>
      </div>
    </section>
  );
}
