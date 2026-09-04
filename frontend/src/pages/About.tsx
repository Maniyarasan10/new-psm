import { PageHero, Section } from '../components/ui';
import Seo from '../components/Seo';
import { CompanyCta, TwoEngines } from '../components/shared';
import { MISSION, VISION, VALUES } from '../lib/siteContent';

export default function About() {
  return (
    <>
      <Seo
        title="About Problem Solving Mind | Technology Company & Product Studio"
        description="Problem Solving Mind is a technology company that builds proprietary products and provides digital solutions. Learn about our mission, vision, values and our problem-first approach."
        path="/about"
      />

      <PageHero eyebrow="About PSM" title="We Are Problem Solvers Who Build Technology.">
        <p>Problem Solving Mind was built around a simple belief: better technology begins with better problem solving.</p>
        <p>Technology is everywhere. But technology alone does not create value. Value comes from understanding a problem deeply enough to build something people can actually use. PSM is a technology company focused on two connected areas: building proprietary products and providing digital solutions to businesses and organizations. We identify problems, understand the people and processes involved, design practical solutions and build technology that can operate in the real world.</p>
      </PageHero>

      {/* ── Our Mission ──────────────────────────────────── */}
      <Section eyebrow="Our mission" title={MISSION.title}>
        <p className="lead">{MISSION.body}</p>
      </Section>

      {/* ── Our Vision ───────────────────────────────────── */}
      <Section eyebrow="Our vision" title={VISION.title}>
        <p className="lead">{VISION.body}</p>
      </Section>

      {/* ── Our Values ───────────────────────────────────── */}
      <Section eyebrow="Our values" title="Our Values.">
        <div className="value-list">
          {VALUES.map((v) => (
            <div key={v.name} className="value-row">
              <h3 className="h3">{v.name}</h3>
              <p className="body">{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Products + Solutions ─────────────────────────── */}
      <Section eyebrow="What we do" title="Two Engines. One Mindset.">
        <TwoEngines />
        <p className="body" style={{ marginTop: '1.5rem' }}>
          Both are powered by the same mindset: Understand. Build. Improve.
        </p>
      </Section>

      {/* ── How We Work ──────────────────────────────────── */}
      <Section eyebrow="How we work" title="Every Engagement Starts With a Conversation, Not a Quote.">
        <p className="body" style={{ maxWidth: '62ch' }}>
          Before any solution is proposed, we take the time to understand what you're solving for — the problem, the people it affects, and what a better outcome looks like. That conversation shapes everything that follows: how we scope the work, what we recommend, and how we measure success together.
        </p>
      </Section>

      {/* ── Community ────────────────────────────────────── */}
      <Section eyebrow="Community" title="Sharing What We Learn.">
        <p className="body" style={{ maxWidth: '62ch' }}>
          Although education is not a full-time business division of PSM, the team periodically conducts technical classes, workshops and mentoring sessions. These reflect our belief that knowledge becomes more valuable when it is shared.
        </p>
      </Section>

      <CompanyCta />
    </>
  );
}
