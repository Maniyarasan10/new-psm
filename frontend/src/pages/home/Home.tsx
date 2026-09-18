import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { Section } from '../../components/ui';
import { CompanyCta, TwoEngines } from '../../components/shared';
import Marquee from '../../components/Marquee';

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
    <div className="home-dala">
      <Seo
        title="Problem Solving Mind | Technology Products & Digital Solutions"
        description="Problem Solving Mind builds proprietary technology products — including Boowa, EYD and Aura — and delivers AI, software and automation solutions for businesses that need more than off-the-shelf technology."
        path="/"
      />

      <section className="hero landing" aria-label="PSM — Because problem solving is everything">
        <div className="container hero-content">
          <div className="landing__title-wrapper">
            <div
              className="d-flex t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-purple"
              data-reveal
              data-reveal-load
            >
              {COMPANY.name} — Technology Company
            </div>
            <h1 className="landing__title t-56 t-80@xs t-104@sm t-150@md t-lh-0.9 -t-ls-0.04 t-400">
              <span className="d-block" data-reveal data-reveal-load>Because</span>
              <span className="d-block" data-reveal data-reveal-load data-reveal-delay="120">Problem Solving</span>
              <span className="d-block" data-reveal data-reveal-load data-reveal-delay="200">is everything.</span>
            </h1>
          </div>

          <div className="mobile-blur mt-0 mb-auto">
            <div className="landing__body">
              <p
                className="t-24 t-lh-1.5 -t-ls-0.02 t-200 mb-1.5"
                data-reveal
                data-reveal-load
                data-reveal-delay="240"
              >
                A technology company that builds proprietary products and delivers
                digital solutions — starting from the problem, not the tech stack.
              </p>
              <div className="overflow-hidden">
                <div className="d-flex hero-cta mt-2" data-reveal data-reveal-load data-reveal-delay="300">
                  <Link className="btn btn-primary" to="/products">
                    Explore Products <span aria-hidden className="arrow">→</span>
                  </Link>
                  <Link className="btn btn-ghost" to="/contact">
                    Build With PSM
                  </Link>
                </div>
              </div>
              <p className="t-16 t-lh-1.4 -t-ls-0.02 t-200 t-grey-4 mt-1 mb-0">
                From identifying the problem to designing, building, deploying and
                improving the solution — we think beyond technology.
              </p>
            </div>
          </div>
        </div>

        <div className="hero-scrollhint">
          <span className="scroll-line" aria-hidden />
          Scroll
        </div>
      </section>

      <Marquee />

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
            <Link
              key={p.id}
              className="base-card link-card accent-card"
              to={p.slug}
              data-reveal
              data-reveal-delay={String(i * 100)}
              style={{ '--card-accent': p.color } as React.CSSProperties}
            >
              <div>
                <div className="card-accent-row accent-row--plain">
                  <span className="mono">{p.segment}</span>
                </div>
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
        eyebrow="PSM Digital Solutions"
        title="Have a Problem? Let's Build the Solution."
        intro="Your business doesn't need technology simply because technology exists. It needs the right technology for the problem. PSM helps businesses and organizations design, build and improve digital systems around their actual requirements."
      >
        <div className="card-grid">
          {SOLUTIONS.map((s, i) => (
            <Link
              key={s.id}
              className="base-card link-card accent-card"
              to={s.slug}
              data-reveal
              data-reveal-delay={String(i * 80)}
              style={{ '--card-accent': s.color } as React.CSSProperties}
            >
              <div>
                <div className="card-accent-row accent-row--plain">
                  <span className="mono">{s.short}</span>
                </div>
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
              <span className="step-num" data-count-to={String(i + 1)} data-count-pad="2">00</span>
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
              <span className="reason-num" data-count-to={String(i + 1)} data-count-pad="2">00</span>
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
    </div>
  );
}
