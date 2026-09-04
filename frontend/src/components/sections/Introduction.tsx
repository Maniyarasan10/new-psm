import { COMPANY } from '../../lib/content';
import { useSectionReveal } from '../../hooks/useSectionReveal';

export default function Introduction() {
  const ref = useSectionReveal();
  return (
    <section id="intro" className="section intro-section" ref={ref}>
      <div className="container">
        <span className="eyebrow" data-reveal>Startup Introduction</span>
        <h2 className="h1 intro-title" data-reveal>
          Not a single product company.
          <br />
          A <em className="accent-italic">multi-disciplinary</em> technology studio.
        </h2>
        <p className="lead intro-body" data-reveal>
          {COMPANY.name} spans products, services, software and SaaS. We build proprietary
          products like Boowa and EYD, and we engineer digital solutions for businesses —
          all united by one mindset: <strong className="mono" style={{ color: 'var(--accent-cyan-text)' }}>Understand. Build. Improve.</strong>
        </p>

        <div className="grid intro-grid" data-reveal>
          <div className="intro-card">
            <span className="mono">01</span>
            <h3 className="h3">Products</h3>
            <p>Proprietary technology that solves a problem at scale.</p>
          </div>
          <div className="intro-card">
            <span className="mono">02</span>
            <h3 className="h3">Services</h3>
            <p>Digital solutions built around how your business actually works.</p>
          </div>
          <div className="intro-card">
            <span className="mono">03</span>
            <h3 className="h3">Software</h3>
            <p>Purpose-built systems, AI and automation for real outcomes.</p>
          </div>
          <div className="intro-card">
            <span className="mono">04</span>
            <h3 className="h3">SaaS</h3>
            <p>Reusable platforms that grow from validated, repeating problems.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
