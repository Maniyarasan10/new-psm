import { PageHero, Section } from '../components/ui';
import Seo from '../components/Seo';
import { CompanyCta } from '../components/shared';

export default function CaseStudies() {
  return (
    <>
      <Seo
        title="Case Studies | Real-World Problems Solved by PSM"
        description="Proudly real Problem Solving Mind case studies covering the problem, approach, solution and outcome of client engagements in software, CRM, ERP and automation."
        path="/case-studies"
      />

      <PageHero
        eyebrow="Case Studies"
        title="Problems We've Worked to Solve."
      >
        <p>
          The strongest evidence of technology is what it does in the real world.
          Each PSM case study explains the problem, approach, solution and outcome.
        </p>
      </PageHero>

      <Section eyebrow="Overview" title="PSM Engagements.">
        <p className="lead" style={{ maxWidth: '62ch' }}>
          PSM currently has verified engagements that can anchor this section — an
          integrated website, CRM and mobile application delivered as one connected
          system, and an ERP onboarding engagement in progress. Case studies will be
          published here as outcomes are confirmed with clients. No invented metrics,
          client names or testimonials are published.
        </p>
        <div className="base-card" style={{ marginTop: '2.5rem' }}>
          <h3 className="h3">Case studies coming soon</h3>
          <p className="body" style={{ marginTop: '0.5rem' }}>
            Detailed case studies following the PSM template — problem, challenge,
            approach, solution, technology, outcome, lesson — will be published as
            engagements confirm results.
          </p>
        </div>
      </Section>

      <CompanyCta />
    </>
  );
}
