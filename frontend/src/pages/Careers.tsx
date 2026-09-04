import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PageHero, Section } from '../components/ui';
import { CAREERS } from '../lib/siteContent';

export default function Careers() {
  return (
    <>
      <Seo
        title="Careers at Problem Solving Mind | Join the PSM Team"
        description="Problem Solving Mind is looking for problem solvers — software developers, AI/ML engineers, UI/UX designers, product thinkers and more. Build real products and solve real problems."
        path="/careers"
      />

      <PageHero
        eyebrow="Careers"
        title="Build Technology. Solve Problems. Grow With Us."
      >
        <p>{CAREERS.hero}</p>
        <p>PSM is building products and digital solutions in an environment where ideas need to become working technology. We value curiosity, ownership, practical thinking and the willingness to learn.</p>
      </PageHero>

      {/* ── Who We Look For ──────────────────────────────── */}
      <Section eyebrow="Teams" title="Who We Look For.">
        <ul className="check-list">
          {CAREERS.roles.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>
        <p className="body" style={{ marginTop: '1.5rem' }}>
          Only active hiring roles are listed when recruitment is actually open.
        </p>
      </Section>

      {/* ── What You Can Expect ──────────────────────────── */}
      <Section eyebrow="What to expect" title="What You Can Expect.">
        <div className="card-grid cols-2">
          {CAREERS.expectations.map((e) => (
            <div key={e.name} className="base-card">
              <h3 className="h3">{e.name}</h3>
              <p>{e.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="section cta-band">
        <div className="container">
          <h2 className="h2">No Perfect Fit? Reach Out Anyway.</h2>
          <p className="lead" style={{ marginTop: '1rem', maxWidth: '52ch' }}>
            {CAREERS.footerCta}
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
