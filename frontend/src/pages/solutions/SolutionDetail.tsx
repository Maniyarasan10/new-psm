import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { PageHero, Section } from '../../components/ui';
import { CompanyCta } from '../../components/shared';
import type { SOLUTIONS } from '../../lib/siteContent';

type Solution = (typeof SOLUTIONS)[number];

interface DetailBlock {
  h2: string;
  body: string;
}

const PAGE_CONTENT: Record<string, DetailBlock[]> = {
  ai: [
    {
      h2: 'AI Opportunities We Explore.',
      body: 'Repetitive knowledge work · customer support · document processing · internal knowledge access · data analysis · workflow decisions · content and communication workflows · intelligent search · operational assistance.',
    },
    {
      h2: 'Our AI Development Approach.',
      body: 'Understand the workflow → identify the highest-value AI opportunity → define the required data and integrations → prototype → validate → build → deploy → monitor and improve.',
    },
  ],
  'business-systems': [
    {
      h2: 'What We Build.',
      body: 'ERP and ERP-like systems · CRM systems · SaaS platforms · customer portals · internal tools · management dashboards · workflow software · data platforms · API-driven applications · industry-specific software.',
    },
    {
      h2: 'From Idea to Deployment.',
      body: 'Discovery → requirements → architecture → UX/UI → development → testing → deployment → iteration.',
    },
    {
      h2: 'Built for Change.',
      body: 'Requirements change. Customers change. Markets change. We aim to build systems that can evolve rather than become technical barriers to growth.',
    },
  ],
  automation: [
    {
      h2: 'Automation Opportunities.',
      body: 'Lead management · customer onboarding · approvals · notifications · reporting · data synchronization · task assignment · CRM workflows · internal operations.',
    },
    {
      h2: "The Goal Isn't Automation for Its Own Sake.",
      body: 'Good automation removes unnecessary work while keeping people in control of decisions that require judgment.',
    },
  ],
  'web-mobile': [
    {
      h2: 'Application Types.',
      body: 'Customer applications · business portals · marketplace platforms · e-commerce · management dashboards · SaaS applications · mobile apps · internal tools.',
    },
    {
      h2: 'What We Focus On.',
      body: 'User experience · performance · security · maintainability · scalability · integrations · analytics · continuous improvement.',
    },
  ],
  'product-engineering': [
    {
      h2: 'The Process.',
      body: 'Discovery → product strategy → UX → prototype → architecture → MVP → testing → deployment → iteration.',
    },
  ],
  'hardware-iot': [
    {
      h2: 'Where We Engage.',
      body: 'Industrial monitoring and asset tracking · manufacturing process visibility · healthcare hardware and connected devices · edge computing for physical environments.',
    },
    {
      h2: 'Our Discipline.',
      body: "We take on hardware only when a verified problem demands it. We don't build hardware to demonstrate capability — we build it to solve something software can't.",
    },
  ],
};

export function SolutionDetail({ solution }: { solution: Solution }) {
  const blocks = PAGE_CONTENT[solution.id] ?? [];

  return (
    <>
      <Seo
        title={`${solution.title} | Digital Solutions by Problem Solving Mind`}
        description={solution.description}
        path={solution.slug}
      />

      <PageHero
        eyebrow="Digital Solution · PSM"
        title={solution.pageTitle}
      >
        <p>{solution.description}</p>
        <div className="page-hero-cta">
          <Link className="btn btn-primary" to="/contact">
            Discuss Your Project <span aria-hidden className="arrow">→</span>
          </Link>
        </div>
      </PageHero>

      {/* ── Capabilities ──────────────────────────────── */}
      <Section eyebrow="Capabilities" title="What We Focus On.">
        <ul className="check-list">
          {solution.capabilities.map((cap) => (
            <li key={cap}>{cap}</li>
          ))}
        </ul>
      </Section>

      {/* ── Approach Content ───────────────────────────── */}
      <div className="section">
        <div className="container">
          <div className="content-stack">
            {blocks.map((block) => (
              <div key={block.h2} className="content-block">
                <h2 className="h2">{block.h2}</h2>
                <p>{block.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CompanyCta />
    </>
  );
}
