// Final website content — sourced from PSM_Website_Content_Final.txt (Sept 2026).
// Cross-checked against the PSM Detailed Overview / SOP & Strategy docs.

export const COMPANY = {
  name: 'Problem Solving Mind',
  shortName: 'PSM',
  positioning:
    'A technology company that builds proprietary products and delivers digital solutions — starting from the problem, not the tech stack.',
  coreIdea: 'We don\'t start with technology. We start with the problem.',
  primaryMessage: 'We Build Technology That Solves Real Problems.',
  secondaryLine: 'Solving Problems. Building What\'s Next.',
  email: 'problemsolvingminds@gmail.com',
  phone1: '93602 07861',
  phone2: '73393 86911',
  url: 'https://problemsolvingmind.com',
  tagline: 'Build Products. Solve Problems. Create Impact.',
  footerLine: 'Technology Products & Digital Solutions.',
};

// Business model — two engines
export const ENGINES = [
  {
    id: 'products',
    short: 'Engine 01',
    title: 'Build Products',
    desc: [
      'Technology products designed to solve specific, scalable problems.',
      'We research problems, design experiences, engineer technology and develop products that can serve real users and grow into sustainable businesses.',
    ],
    cta: 'Explore Products',
    href: '/products',
  },
  {
    id: 'solutions',
    short: 'Engine 02',
    title: 'Build Digital Solutions',
    desc: [
      'Technology built around the needs of businesses and organizations.',
      'We help organizations turn operational challenges, ideas and business requirements into software, AI systems, automation, business platforms and digital experiences.',
    ],
    cta: 'Explore Digital Solutions',
    href: '/solutions',
  },
];

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Digital Solutions', href: '/solutions' },
  { label: 'Industries', href: '/industries' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
];

export const PRODUCTS = [
  {
    id: 'boowa',
    slug: '/products/boowa',
    name: 'Boowa',
    strapline: 'Hyperlocal Commerce. Faster Delivery. Closer to You.',
    summary:
      'A hyperlocal food and everyday-item delivery platform connecting customers with nearby businesses and delivery partners.',
    status: 'In Development',
    segment: 'Local Commerce',
    color: 'var(--accent-green)',
  },
  {
    id: 'eyd',
    slug: '/products/eyd',
    name: 'EYD — Explore Your Dream',
    shortName: 'EYD',
    strapline: 'Experience Property Before You Visit.',
    summary:
      'A real-estate technology platform bringing property discovery, seller management and immersive 3D property experiences into one place.',
    status: 'In Development',
    segment: 'Real Estate Technology',
    color: 'var(--accent-blue)',
  },
  {
    id: 'aura',
    slug: '/products/aura',
    name: 'Aura',
    strapline: 'Healthcare Technology, Engineered Around the Patient.',
    summary:
      'An emerging healthcare technology and hardware initiative, exploring how connected devices and software can improve patient care and clinical workflows.',
    status: 'Early-Stage Development',
    segment: 'Healthcare Technology',
    color: 'var(--accent-violet)',
  },
];

export const PRODUCT_PRINCIPLES = [
  'Start with a real problem.',
  'Understand the people affected.',
  'Build a practical solution.',
  'Validate through real use.',
  'Improve continuously.',
  'Scale when the value is proven.',
];

export const SOLUTIONS = [
  {
    id: 'ai',
    slug: '/solutions/ai',
    short: 'AI & Intelligent Systems',
    title: 'AI & Intelligent Systems',
    homepageTitle: 'Make Your Business Smarter With AI.',
    pageTitle: 'AI That Solves a Real Business Problem.',
    description: 'Use artificial intelligence to automate work, improve access to information and create smarter digital experiences.',
    capabilities: [
      'AI-powered applications', 'AI assistants and agents', 'intelligent document workflows',
      'knowledge systems', 'AI integrations', 'data-driven workflows', 'AI-enabled customer experiences',
    ],
    color: 'var(--accent-violet)',
  },
  {
    id: 'business-systems',
    slug: '/solutions/business-systems',
    short: 'Business Systems',
    title: 'Business Systems (ERP · CRM · Platforms)',
    homepageTitle: 'Systems Designed Around the Way You Work.',
    pageTitle: 'Systems Built Around Your Business.',
    description:
      'Purpose-built systems designed around the way your organization actually operates — including ERP and ERP-like systems, CRM and internal platforms.',
    capabilities: [
      'ERP and ERP-like systems', 'CRM systems', 'internal platforms', 'customer portals',
      'management dashboards', 'SaaS products', 'API development', 'system integration',
    ],
    color: 'var(--accent-blue)',
  },
  {
    id: 'automation',
    slug: '/solutions/automation',
    short: 'Business Automation',
    title: 'Business Automation',
    homepageTitle: 'Replace Repetitive Work With Better Systems.',
    pageTitle: 'Turn Repetitive Work Into Automated Workflows.',
    description: 'Reduce repetitive work, connect systems and create more efficient digital workflows.',
    capabilities: [
      'workflow automation', 'approvals and notifications', 'data synchronization',
      'reporting workflows', 'CRM automation', 'operational dashboards',
    ],
    color: 'var(--accent-coral)',
  },
  {
    id: 'web-mobile',
    slug: '/solutions/web-mobile',
    short: 'Web & Mobile',
    title: 'Web & Mobile Applications',
    homepageTitle: 'Digital Experiences Your Customers Can Actually Use.',
    pageTitle: 'Digital Products People Want to Use.',
    description: 'Build modern digital experiences that are reliable, scalable and designed for real users.',
    capabilities: [
      'responsive web applications', 'progressive web apps', 'mobile applications',
      'customer portals', 'admin dashboards', 'e-commerce systems', 'API-connected applications',
    ],
    color: 'var(--accent-green)',
  },
  {
    id: 'product-engineering',
    slug: '/solutions/product-engineering',
    short: 'Product Engineering',
    title: 'Product Engineering',
    homepageTitle: 'From Product Idea to Working Software.',
    pageTitle: 'From Product Idea to Working Software.',
    description: 'Turn a validated idea into a working product through structured product design and engineering.',
    capabilities: [
      'product discovery', 'MVP development', 'UI/UX', 'prototyping', 'architecture',
      'development', 'testing', 'deployment', 'product improvement',
    ],
    color: 'var(--accent-yellow)',
  },
  {
    id: 'hardware-iot',
    slug: '/solutions/hardware-iot',
    short: 'Hardware & IoT',
    title: 'Hardware & IoT',
    homepageTitle: 'When the Problem Lives Outside the Screen.',
    pageTitle: 'When the Problem Lives Outside the Screen.',
    description:
      'Engaged when a real-world problem can\'t be solved by software alone — sensors, edge devices and hardware-integrated systems for industrial and healthcare environments.',
    capabilities: [
      'IoT sensors and edge devices', 'hardware + software integration', 'industrial monitoring', 'connected device systems',
    ],
    color: 'var(--accent-pink)',
  },
];

export const SOLUTIONS_HUBS = {
  whoWeHelp: 'Startups · small and medium businesses · growing companies · organizations · enterprise teams · founders building new products',
  serviceCtaTitle: 'Don\'t Know What Technology You Need?',
  serviceCtaBody:
    'That\'s okay. Tell us: What problem are you facing? Who is affected? What happens today? What outcome do you want? We\'ll help you identify a practical technology path.',
  serviceCtaLabel: 'Talk to PSM',
};

// Homepage — the PSM idea
export const PSM_IDEA = {
  eyebrow: 'The Problem-Solving Mindset',
  title: 'Technology should solve a problem, not create another one.',
  body: [
    'Every meaningful product begins with a problem worth solving.',
    'At Problem Solving Mind, we start by understanding the problem, the people affected by it and the environment in which it exists. We then use technology, engineering and product thinking to build solutions that are practical, scalable and built for real-world use.',
    'The best technology is technology that makes a meaningful difference.',
  ],
  cta: 'Discover How We Think',
  href: '/about',
};

export const WHAT_WE_DO = {
  title: 'Two Ways We Create Value.',
  intro: 'PSM operates through two connected engines: proprietary products and digital solutions.',
};

// Homepage — approach
export const APPROACH = {
  title: 'We Start With the Problem.',
  steps: [
    { step: '01', title: 'Understand', desc: 'We identify the real problem, the users, the current workflow and the desired outcome.' },
    { step: '02', title: 'Define', desc: 'We convert observations and requirements into a clear product or solution strategy.' },
    { step: '03', title: 'Design', desc: 'We design the user experience, system architecture and solution structure before unnecessary complexity enters the build.' },
    { step: '04', title: 'Build', desc: 'We engineer the software, AI systems, integrations and digital experiences required to make the solution real.' },
    { step: '05', title: 'Deploy', desc: 'We move the solution from development into practical use with appropriate testing, deployment and monitoring.' },
    { step: '06', title: 'Improve', desc: 'Real-world use creates better information. We use feedback, performance and changing requirements to continuously improve.' },
  ],
  cta: 'Talk to a Problem Solver',
  href: '/contact',
};

// Homepage — who we work with
export const AUDIENCES = {
  title: 'Built for Organizations With Problems Worth Solving.',
  items: [
    { name: 'Startups', desc: 'From idea validation to MVP and product engineering.' },
    { name: 'Small & Medium Businesses', desc: 'Digital systems that reduce manual work and improve operations.' },
    { name: 'Growing Companies', desc: 'Scalable software, automation and digital infrastructure.' },
    { name: 'Enterprise & Organizations', desc: 'Purpose-built digital solutions for complex workflows and business needs.' },
    { name: 'Industry-Specific Businesses', desc: 'Technology designed around real operational environments rather than generic software assumptions.' },
  ],
};

// Homepage — why PSM
export const WHY_PSM = {
  title: 'Why Build With Problem Solving Mind?',
  reasons: [
    { num: '01', name: 'Problem-First Thinking', desc: 'We begin with the problem and desired outcome, not with a predetermined technology stack.' },
    { num: '02', name: 'Product Mindset', desc: 'We think beyond delivery. We consider usability, adoption, scalability and long-term value.' },
    { num: '03', name: 'Engineering + Business', desc: 'A good technical solution must also make sense for the organization using it.' },
    { num: '04', name: 'Practical Execution', desc: 'We focus on building usable systems rather than producing presentations that never become products.' },
    { num: '05', name: 'Continuous Improvement', desc: 'Technology and requirements change. Our solutions are designed to evolve.' },
  ],
};

// Homepage — how work compounds
export const COMPOUND = {
  title: 'We Build From What We Learn.',
  body:
    'Our product and digital-solution work strengthen each other. Business problems reveal opportunities. Technology creates solutions. Real users create feedback. Feedback creates better products. Better products create larger impact. This is a continuous cycle of learning, building and improving.',
};

// Company CTA
export const COMPANY_CTA = {
  title: 'Have a Problem Worth Solving?',
  body:
    'Tell us what is slowing your business down, what you are trying to build, or where technology could create a better outcome. You don\'t need the technical answer. That\'s what we\'re here to solve.',
  primaryCta: 'Start a Conversation',
  secondaryCta: 'Explore Our Products',
};

export const FOOTER_NAV = [
  { label: 'Products', href: '/products' },
  { label: 'Digital Solutions', href: '/solutions' },
  { label: 'Industries', href: '/industries' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

export const FOOTER_DISCLAIMER =
  'Product availability, features and launch timelines may change during development. Refer to individual product pages for current status.';

export const MISSION = {
  title: 'Build Technology. Solve Problems. Create Impact.',
  body: 'Our mission is to use technology as a practical tool for solving meaningful problems and creating useful products and systems.',
};

export const VISION = {
  title: 'A World Where Problems Become Opportunities to Build Better.',
  body: 'We want PSM to become a technology company known for identifying meaningful problems, building strong products and creating solutions that improve how people and organizations operate.',
};

export const VALUES = [
  { name: 'Problem First', desc: 'Understand before building.' },
  { name: 'Build With Purpose', desc: 'Technology should have a reason to exist.' },
  { name: 'Own the Outcome', desc: 'Focus on whether the solution works, not only whether the task is completed.' },
  { name: 'Keep Learning', desc: 'Every product and project should teach us something.' },
  { name: 'Move With Responsibility', desc: 'Build thoughtfully, communicate clearly and take responsibility for the impact of technology.' },
];

export const INDUSTRIES = [
  {
    name: 'Real Estate',
    desc: 'Property discovery, digital property experiences, seller tools and real-estate technology.',
    product: 'EYD',
    productSlug: '/products/eyd',
  },
  {
    name: 'Retail & Local Commerce',
    desc: 'Digital commerce, customer ordering, business tools and local delivery experiences.',
    product: 'Boowa',
    productSlug: '/products/boowa',
  },
  {
    name: 'Healthcare & Life Sciences',
    desc: 'Digital workflows, connected devices, software systems and technology products where appropriate.',
    product: 'Aura',
    productSlug: '/products/aura',
  },
  {
    name: 'Manufacturing',
    desc: 'Digital workflows, automation, monitoring, internal applications and technology systems that bring operational data out of the factory floor and into decisions.',
  },
  {
    name: 'Professional Services',
    desc: 'Client portals, workflow systems, automation and business software.',
  },
  {
    name: 'Education',
    desc: 'Digital learning and operational technology when relevant to the project — not a standing business line.',
  },
];

export const AUDIENCE_RANGE = [];

export const CAREERS = {
  hero: 'We\'re looking for people who enjoy solving problems more than simply completing tasks.',
  roles: [
    'Software developers', 'frontend developers', 'backend developers', 'full-stack developers',
    'AI/ML engineers', 'mobile developers', 'UI/UX designers', 'product thinkers', 'QA engineers',
    'DevOps/cloud engineers', 'business development', 'operations', 'product management',
  ],
  expectations: [
    { name: 'Build Real Products', desc: 'Work on technology that moves beyond tutorials and prototypes.' },
    { name: 'Solve Real Problems', desc: 'Understand users and business requirements.' },
    { name: 'Learn Through Execution', desc: 'Develop skills through actual product and solution work.' },
    { name: 'Take Ownership', desc: 'Contribute ideas and take responsibility for outcomes.' },
  ],
  footerCta: 'Don\'t see a suitable role? Send your profile and a short explanation of what you can build or solve.',
  cta: 'Contact PSM',
};

export const PARTNERSHIP_AREAS = [
  'Product partnerships', 'business partnerships', 'technology partnerships', 'distribution partnerships',
  'pilot programs', 'enterprise deployments', 'strategic collaborations',
];

export const CONTACT = {
  enquiryTypes: [
    'DIGITAL SOLUTION — I need software, AI, automation or another digital solution.',
    'PRODUCT PARTNERSHIP — I want to partner with Boowa, EYD or Aura.',
    'PRODUCT ENQUIRY — I want more information about a PSM product.',
    'CAREERS — I want to work with PSM.',
    'GENERAL — I have another enquiry.',
  ],
  formFields: [
    'Name', 'Email', 'Phone', 'Company/Organization', 'Enquiry Type', 'What problem are you trying to solve?',
    'Current process/system', 'Expected outcome', 'Budget range (optional)', 'Timeline (optional)', 'Attachment (optional)',
  ],
  success: 'Thank you for reaching out to Problem Solving Mind. We\'ve received your enquiry and will review the information provided.',
};

export const FAQS = [
  {
    q: 'What is Problem Solving Mind?',
    a: 'Problem Solving Mind is a technology company that builds proprietary products and provides digital solutions for businesses and organizations.',
  },
  {
    q: 'What products is PSM currently building?',
    a: 'PSM is currently developing three products: Boowa, a hyperlocal food and everyday-item delivery platform; EYD — Explore Your Dream, a real-estate technology platform with 3D property capture and viewing capabilities; and Aura, an early-stage healthcare technology initiative.',
  },
  {
    q: 'Does PSM provide software development services?',
    a: 'Yes. PSM provides digital solutions including custom software and business systems (including ERP and CRM), AI systems, business automation, web and mobile applications and product engineering.',
  },
  {
    q: 'Does PSM build AI solutions?',
    a: 'Yes. PSM works on practical AI applications, intelligent workflows, AI assistants, AI agents and AI-enabled digital systems where they provide meaningful value.',
  },
  {
    q: 'Can PSM build or implement an ERP or CRM system for my business?',
    a: 'Yes. PSM designs and implements ERP and ERP-like systems, CRM platforms and internal business tools built around how your organization actually operates.',
  },
  {
    q: 'Can PSM build a custom application for my business?',
    a: 'Yes. PSM can work with organizations that need purpose-built web, mobile or business software around specific requirements.',
  },
  {
    q: 'Can PSM automate an existing business process?',
    a: 'Yes. PSM can analyze repetitive workflows and identify opportunities for automation, system integration and digital process improvement.',
  },
  {
    q: 'Does PSM work with hardware, not just software?',
    a: 'Yes, when the problem requires it. PSM engineers IoT sensors and hardware-integrated systems for industrial and healthcare environments — engaged only when hardware is the right solution.',
  },
  {
    q: 'Is Boowa currently available?',
    a: 'Boowa is currently in development. Launch availability, service areas and final features will be announced as development progresses.',
  },
  {
    q: 'Is EYD currently available?',
    a: 'EYD is currently in development. Product capabilities and launch plans will be announced as development progresses.',
  },
  {
    q: 'What is Aura?',
    a: 'Aura is an early-stage healthcare technology and hardware initiative from PSM. Capabilities and timelines will be shared as the initiative progresses.',
  },
  {
    q: 'Does PSM conduct student workshops?',
    a: 'PSM may periodically conduct technical classes, workshops, mentoring sessions and community initiatives. Education is not currently a full-time core business division.',
  },
  {
    q: 'How can I contact PSM?',
    a: 'You can contact Problem Solving Mind at problemsolvingminds@gmail.com or call 93602 07861 or 73393 86911.',
  },
];
