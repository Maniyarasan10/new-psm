import { PageHero, Section } from '../components/ui';
import Seo from '../components/Seo';
import { CompanyCta } from '../components/shared';
import SceneFrame from '../components/3d/SceneFrame';

export default function CaseStudies() {
  return (
    <>
      <Seo
        title="Technology Case Studies & Projects | Problem Solving Mind"
        description="Explore technology projects and case studies from Problem Solving Mind, covering software, AI, automation, business systems and digital products."
        path="/case-studies"
      />

      <PageHero
        eyebrow="Case Studies"
        title="Problems We've Worked to Solve."
        backdrop={<SceneFrame variant="default" />}
      >
        <p data-reveal data-reveal-load data-reveal-delay="100">
          The strongest evidence of technology is what it does in the real world.
          Each PSM case study explains the problem, approach, solution and outcome.
        </p>
      </PageHero>

      <Section className="section-head">
        <span className="eyebrow">Overview</span>
        <h2 className="section-title" data-lines>PSM Engagements.</h2>
      </Section>
      <div className="container" data-reveal>
        <p className="lead" style={{ maxWidth: '62ch' }}>
          PSM currently has verified engagements that can anchor this section — an
          integrated website, CRM and mobile application delivered as one connected
          system, and an ERP onboarding engagement in progress. Case studies will be
          published here as outcomes are confirmed with clients. No invented metrics,
          client names or testimonials are published.
        </p>
        <div
          className="base-card accent-card"
          data-reveal
          style={{ marginTop: '2.5rem', '--card-accent': 'var(--accent-blue)' } as React.CSSProperties}
        >
          <div className="card-accent-row accent-row--plain">
            <span className="mono">Verified engagements</span>
          </div>
          <h3 className="h3">Case studies coming soon</h3>
          <p className="body" style={{ marginTop: '0.5rem' }}>
            Detailed case studies following the PSM template — problem, challenge,
            approach, solution, technology, outcome, lesson — will be published as
            engagements confirm results.
          </p>
        </div>
        <p className="body" style={{ marginTop: '1.5rem' }}>
          <a href="/case-studies" data-roll-link>Check back for published case studies</a>
        </p>
      </div>

      <CompanyCta />
    </>
  );
}