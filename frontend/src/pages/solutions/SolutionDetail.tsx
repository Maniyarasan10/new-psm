import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { PageHero, Section } from '../../components/ui';
import { CompanyCta } from '../../components/shared';
import SceneFrame from '../../components/3d/SceneFrame';
import type { SceneVariant } from '../../components/3d/sceneRegistry';
import type { SOLUTIONS } from '../../lib/siteContent';

type Solution = (typeof SOLUTIONS)[number];

interface DetailBlock {
  h2: string;
  body: string;
}

const SEO_META: Record<string, { title: string; description: string }> = {
  ai: {
    title: 'AI Solutions & AI Automation Services | Problem Solving Mind',
    description:
      'Build practical AI systems, AI agents, intelligent workflows and AI-powered applications with Problem Solving Mind.',
  },
  'business-systems': {
    title: 'ERP, CRM & Business Systems Development | Problem Solving Mind',
    description:
      'Problem Solving Mind builds ERP and ERP-like systems, CRM platforms, internal tools and business-management software around how your organization actually operates.',
  },
  automation: {
    title: 'Business Process Automation Services | PSM',
    description:
      'Automate repetitive workflows, connect business systems and improve operational efficiency with Problem Solving Mind.',
  },
  'web-mobile': {
    title: 'Web & Mobile App Development Services | PSM',
    description:
      'Build scalable web applications, mobile apps, dashboards and customer-facing digital experiences with Problem Solving Mind.',
  },
  'product-engineering': {
    title: 'Product Engineering & MVP Development | Problem Solving Mind',
    description:
      'Turn a validated idea into a working product — product strategy, UX, architecture, MVP development and iteration with Problem Solving Mind.',
  },
  'hardware-iot': {
    title: 'Hardware & IoT Engineering | Problem Solving Mind',
    description:
      'Problem Solving Mind engineers IoT sensors, edge devices and hardware-integrated systems for industrial and healthcare environments — engaged only when the problem requires it.',
  },
};

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

const SOLUTION_SCENE: Record<string, SceneVariant> = {
  ai: 'ai',
  'business-systems': 'business-systems',
  automation: 'automation',
  'web-mobile': 'web-mobile',
  'product-engineering': 'product-engineering',
  'hardware-iot': 'hardware-iot',
};

export function SolutionDetail({ solution }: { solution: Solution }) {
  const blocks = PAGE_CONTENT[solution.id] ?? [];
  const seo = SEO_META[solution.id];
  const scene = SOLUTION_SCENE[solution.id] as SceneVariant | undefined;
  const scrollTarget = scene === 'product-engineering' ? '#product-engineering-anchor' : undefined;

  return (
    <div className="accent-page" style={{ '--page-accent': solution.color } as React.CSSProperties}>
      <Seo
        title={seo?.title ?? `${solution.title} | Digital Solutions by Problem Solving Mind`}
        description={seo?.description ?? solution.description}
        path={solution.slug}
      />

      <PageHero
        eyebrow="Digital Solution · PSM"
        title={solution.pageTitle}
        backdrop={scene ? <SceneFrame variant={scene} scrollTarget={scrollTarget} /> : undefined}
      >
        <p data-reveal data-reveal-load data-reveal-delay="100">{solution.description}</p>
        <div className="page-hero-cta" data-reveal data-reveal-load data-reveal-delay="200">
          <Link className="btn btn-primary" to="/contact">
            Discuss Your Project <span aria-hidden className="arrow">→</span>
          </Link>
        </div>
      </PageHero>

      {/* ── Capabilities ──────────────────────────────── */}
      <Section className="section-head">
        <span className="eyebrow">Capabilities</span>
        <h2 className="section-title" data-split>What We Focus On.</h2>
      </Section>
      <ul className="check-list" data-reveal>
        {solution.capabilities.map((cap) => (
          <li key={cap}>{cap}</li>
        ))}
      </ul>
      <p className="body" style={{ marginTop: '1.5rem' }}>
        <a href={solution.slug} data-roll-link>Learn more about {solution.title}</a>
      </p>

      {/* ── Approach Content ───────────────────────────── */}
      <div className="section">
        <div className="container">
          <div className="content-stack" id="product-engineering-anchor">
            {blocks.map((block, i) => (
              <div key={block.h2} className="content-block" data-reveal data-reveal-delay={String(i * 100)}>
                <h2 className="h2" data-split>{block.h2}</h2>
                <p>{block.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CompanyCta />
    </div>
  );
}
