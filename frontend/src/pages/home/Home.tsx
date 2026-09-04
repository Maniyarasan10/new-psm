import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { Section } from '../../components/ui';
import { CompanyCta, TwoEngines } from '../../components/shared';
import {
  COMPANY,
  PSM_IDEA,
  WHAT_WE_DO,
  PRODUCTS,
  SOLUTIONS,
  APPROACH,
  AUDIENCES,
  WHY_PSM,
  COMPOUND,
} from '../../lib/siteContent';

export default function Home() {

  return (
    <>
      <Seo
        title="Problem Solving Mind | Technology Products & Digital Solutions"
        description="Problem Solving Mind builds proprietary technology products (Boowa, EYD, Aura) and delivers AI, software, automation and digital solutions for businesses and organizations. We start with the problem, not the tech stack."
        path="/"
      />

      {/* ── Hero ─────── */}
      <section className="hero">
        <div className="container hero-content">
          <div data-reveal>
            <div className="hero-meta">
              <span className="mono eyebrow">Problem Solving Mind — Technology Company</span>
            </div>
          </div>
          <h1 className="display hero-title" data-reveal data-reveal-delay="100">
            {COMPANY.primaryMessage}
          </h1>
          <p className="lead hero-sub" data-reveal data-reveal-delay="200">
            A technology company building proprietary products and practical digital solutions for businesses and organizations.
          </p>
          <div className="hero-cta" data-reveal data-reveal-delay="300">
            <Link className="btn btn-primary" to="/products">
              Explore Products <span aria-hidden className="arrow">→</span>
            </Link>
            <Link className="btn btn-ghost" to="/contact">
              Build With PSM
            </Link>
          </div>
        </div>

        <div className="hero-scrollhint">
          <span className="scroll-line" aria-hidden />
          Scroll
        </div>
      </section>

      {/* ── The PSM Idea ──────────────────────────────────── */}
      <Section
        eyebrow={PSM_IDEA.eyebrow}
        title={PSM_IDEA.title}
      >
        <div style={{ maxWidth: '62ch' }} data-reveal>
          {PSM_IDEA.body.map((p, i) => (
            <p key={i} className="body" style={{ marginBottom: '1rem' }}>{p}</p>
          ))}
        </div>
        <Link className="btn btn-text" to={PSM_IDEA.href} style={{ marginTop: '1.5rem' }} data-reveal>
          {PSM_IDEA.cta} <span aria-hidden className="arrow">→</span>
        </Link>
      </Section>

      {/* ── What We Do ────────────────────────────────────── */}
      <Section
        eyebrow="What We Do"
        title={WHAT_WE_DO.title}
        intro={WHAT_WE_DO.intro}
      >
        <div data-reveal>
          <TwoEngines />
        </div>
      </Section>

      {/* ── Our Products ──────────────────────────────────── */}
      <Section
        eyebrow="Built by PSM"
        title="Products Built Around Real Problems."
        intro="Three proprietary products, each addressing a different real-world problem — in commerce, real estate and healthcare."
      >
        <div className="card-grid">
          {PRODUCTS.map((p, i) => (
            <Link key={p.id} className="base-card link-card" to={p.slug} data-reveal data-reveal-delay={String(i * 100)}>
              <div>
                <h3 className="h3">{p.name}</h3>
                <p className="body" style={{ marginTop: '0.5rem' }}>{p.strapline}</p>
                <p className="body" style={{ marginTop: '0.75rem', fontSize: '0.92rem' }}>{p.summary}</p>
              </div>
              <div className="link-card-foot">
                <span className="status-badge">{p.status}</span>
                <span className="arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Digital Solutions ──────────────────────────────── */}
      <Section
        eyebrow="Digital Solutions"
        title="Have a Problem? Let's Build the Solution."
        intro="Your business doesn't need technology simply because technology exists. It needs the right technology for the problem."
      >
        <div className="card-grid">
          {SOLUTIONS.map((s, i) => (
            <Link key={s.id} className="base-card link-card" to={s.slug} data-reveal data-reveal-delay={String(i * 80)}>
              <div>
                <span className="mono" style={{ marginBottom: '0.75rem', display: 'block' }}>{s.short}</span>
                <h3 className="h3">{s.title}</h3>
                <p className="body" style={{ marginTop: '0.5rem', fontSize: '0.92rem' }}>{s.description}</p>
              </div>
              <span className="arrow" style={{ alignSelf: 'flex-end' }}>→</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Our Approach ──────────────────────────────────── */}
      <Section title={APPROACH.title}>
        <div className="steps-grid">
          {APPROACH.steps.map((s, i) => (
            <div key={s.step} className="step-card" data-reveal data-reveal-delay={String(i * 80)}>
              <span className="step-num">{s.step}</span>
              <h3 className="h3">{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
        <Link className="btn btn-primary" to={APPROACH.href} style={{ marginTop: '2.5rem' }} data-reveal>
          {APPROACH.cta} <span aria-hidden className="arrow">→</span>
        </Link>
      </Section>

      {/* ── Who We Work With ──────────────────────────────── */}
      <Section title={AUDIENCES.title}>
        <div className="card-grid cols-2">
          {AUDIENCES.items.map((a, i) => (
            <div key={a.name} className="base-card" data-reveal data-reveal-delay={String(i * 80)}>
              <h3 className="h3">{a.name}</h3>
              <p className="body" style={{ marginTop: '0.5rem' }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Why PSM ───────────────────────────────────────── */}
      <Section title={WHY_PSM.title}>
        <div className="reason-list">
          {WHY_PSM.reasons.map((r, i) => (
            <div key={r.num} className="reason-row" data-reveal data-reveal-delay={String(i * 60)}>
              <span className="reason-num">{r.num}</span>
              <h3 className="reason-name">{r.name}</h3>
              <p className="reason-desc">{r.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── How Work Compounds ────────────────────────────── */}
      <Section title={COMPOUND.title}>
        <p className="body" style={{ maxWidth: '62ch' }} data-reveal>{COMPOUND.body}</p>
      </Section>

      {/* ── Case Studies ──────────────────────────────────── */}
      <Section
        title="See What We've Built."
        intro="Technology is easier to trust when you can see it working."
      >
        <p className="body" style={{ maxWidth: '62ch', marginBottom: '1.5rem' }} data-reveal>
          Verified engagements including an integrated website, CRM and mobile application delivered as one connected system, plus an ERP onboarding engagement in progress.
        </p>
        <Link className="btn btn-primary" to="/case-studies" data-reveal>
          View Case Studies <span aria-hidden className="arrow">→</span>
        </Link>
      </Section>

      {/* ── Company CTA ───────────────────────────────────── */}
      <CompanyCta />
    </>
  );
}
