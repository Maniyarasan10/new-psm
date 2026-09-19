import { PageHero, Section } from '../components/ui';
import Seo from '../components/Seo';
import { CompanyCta, TwoEngines } from '../components/shared';
import SceneFrame from '../components/3d/SceneFrame';
import { MISSION, VISION, VALUES, METRICS } from '../lib/siteContent';

export default function About() {
  return (
    <>
      <Seo
        title="About Problem Solving Mind | Technology Company in India"
        description="Learn about Problem Solving Mind, a technology company building proprietary products and digital solutions that solve real-world problems."
        path="/about"
      />

      <PageHero eyebrow="About PSM" title="We Are Problem Solvers Who Build Technology." backdrop={<SceneFrame variant="about" />}>
        <p data-reveal data-reveal-load data-reveal-delay="100">Problem Solving Mind was built around a simple belief: better technology begins with better problem solving.</p>
        <p data-reveal data-reveal-load data-reveal-delay="200">Technology is everywhere. But technology alone does not create value. Value comes from understanding a problem deeply enough to build something people can actually use. PSM is a technology company focused on two connected areas: building proprietary products and providing digital solutions to businesses and organizations. We identify problems, understand the people and processes involved, design practical solutions and build technology that can operate in the real world.</p>
      </PageHero>

      {/* ── By the Numbers ───────────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">By the numbers</span>
        <h2 className="section-title" data-split>Focused by Design.</h2>
      </Section>
      <div className="metrics-grid" data-grid-reveal>
        {METRICS.map((m) => (
          <div className="metric" key={m.label} data-reveal>
            <span
              className="metric-value"
              style={{ color: m.color }}
              data-count-to={String(m.value)}
              data-count-pad={String(m.pad)}
            >
              00
            </span>
            <span className="mono metric-label">{m.label}</span>
          </div>
        ))}
      </div>

      {/* ── Our Mission ──────────────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">Our mission</span>
        <h2 className="section-title" data-split>{MISSION.title}</h2>
      </Section>
      <div className="container" data-reveal>
        <p className="lead">{MISSION.body}</p>
      </div>

      {/* ── Our Vision ───────────────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">Our vision</span>
        <h2 className="section-title" data-split>{VISION.title}</h2>
      </Section>
      <div className="container" data-reveal>
        <p className="lead">{VISION.body}</p>
      </div>

      {/* ── Our Values ───────────────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">Our values</span>
        <h2 className="section-title" data-split>Our Values.</h2>
      </Section>
      <div className="value-list" data-grid-reveal>
        {VALUES.map((v, i) => (
          <div key={v.name} className="value-row" data-reveal data-reveal-delay={String(i * 80)}>
            <h3 className="h3">{v.name}</h3>
            <p className="body">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Products + Solutions ─────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">What we do</span>
        <h2 className="section-title" data-split>Two Engines. One Mindset.</h2>
      </Section>
      <div className="container" data-reveal>
        <TwoEngines />
        <p className="body" style={{ marginTop: '1.5rem' }}>
          Both are powered by the same mindset: Understand. Build. Improve.
        </p>
      </div>

      {/* ── How We Work ──────────────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">How we work</span>
        <h2 className="section-title" data-split>Every Engagement Starts With a Conversation, Not a Quote.</h2>
      </Section>
      <div className="container" data-reveal>
        <p className="body" style={{ maxWidth: '62ch' }}>
          Before any solution is proposed, we take the time to understand what you're solving for — the problem, the people it affects, and what a better outcome looks like. That conversation shapes everything that follows: how we scope the work, what we recommend, and how we measure success together.
        </p>
      </div>

      {/* ── Community ────────────────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">Community</span>
        <h2 className="section-title" data-split>Sharing What We Learn.</h2>
      </Section>
      <div className="container" data-reveal>
        <p className="body" style={{ maxWidth: '62ch' }}>
          Although education is not a full-time business division of PSM, the team periodically conducts technical classes, workshops and mentoring sessions. These reflect our belief that knowledge becomes more valuable when it is shared.
        </p>
        <p className="body" style={{ marginTop: '1rem' }}>
          <a href="/about#community" data-roll-link>Read more about our community work</a>
        </p>
      </div>

      <CompanyCta />
    </>
  );
}
