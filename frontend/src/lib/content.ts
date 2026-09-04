// Real PSM content — sourced from the extracted README in the cloned repo.

export const COMPANY = {
  name: 'Problem Solving Mind',
  shortName: 'PSM',
  tagline: 'Build Products. Solve Problems. Create Impact.',
  description:
    'A multi-disciplinary technology company spanning products, services, software and SaaS.',
  email: 'problemsolvingminds@gmail.com',
  phone1: '9360207861',
  phone2: '73393 86911',
  url: 'https://problemsolvingmind.com',
};

export const NAV = [
  { label: 'Products', href: '#products' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Approach', href: '#approach' },
  { label: 'Work', href: '#work' },
  { label: 'Team', href: '#team' },
];

export const PRODUCTS = [
  {
    id: 'boowa',
    name: 'Boowa',
    strapline: 'Hyperlocal Commerce. Faster Delivery. Closer to You.',
    description:
      'A hyperlocal food and everyday-item delivery platform designed to connect customers with nearby businesses and delivery partners.',
    status: 'In Development',
    color: 'var(--accent-green)',
    segment: 'Local Commerce',
  },
  {
    id: 'eyd',
    name: 'EYD',
    strapline: 'Explore Your Dream',
    description:
      'A real-estate technology platform designed to bring property discovery, seller management and immersive 3D property experiences into one connected solution.',
    status: 'In Development',
    color: 'var(--accent-blue)',
    segment: 'Real Estate Technology',
  },
];

export const SOLUTIONS = [
  {
    id: 'ai',
    title: 'AI & Intelligent Systems',
    short: 'AI',
    description:
      'Use artificial intelligence to automate work, improve access to information and create smarter digital experiences.',
    capability: 'Intelligence',
    color: 'var(--accent-violet)',
    points: ['AI assistants & agents', 'Document intelligence', 'Knowledge systems', 'AI workflow integration'],
  },
  {
    id: 'software',
    title: 'Custom Software',
    short: 'Software',
    description:
      'Purpose-built software designed around your business processes, users and goals.',
    capability: 'Engineering',
    color: 'var(--accent-blue)',
    points: ['Business platforms', 'SaaS products', 'Internal tools', 'API development'],
  },
  {
    id: 'automation',
    title: 'Business Automation',
    short: 'Automation',
    description:
      'Reduce repetitive work, connect systems and create more efficient digital workflows.',
    capability: 'Operations',
    color: 'var(--accent-coral)',
    points: ['Workflow automation', 'Notifications', 'Data synchronization', 'Operational dashboards'],
  },
  {
    id: 'web-mobile',
    title: 'Web & Mobile Applications',
    short: 'Web & Mobile',
    description:
      'Build modern digital experiences that are reliable, scalable and designed for real users.',
    capability: 'Products',
    color: 'var(--accent-green)',
    points: ['Responsive web apps', 'Mobile apps', 'Customer portals', 'E-commerce systems'],
  },
  {
    id: 'product-engineering',
    title: 'Product Engineering',
    short: 'Product Eng.',
    description:
      'Turn a validated idea into a working product through structured product design and engineering.',
    capability: 'Delivery',
    color: 'var(--accent-yellow)',
    points: ['Product discovery', 'MVP development', 'UI/UX design', 'Architecture'],
  },
  {
    id: 'iot',
    title: 'Hardware & IoT',
    short: 'IoT',
    description:
      'Hardware-integrated systems — engaged only when a real-world problem demands them.',
    capability: 'Physical',
    color: 'var(--accent-pink)',
    points: ['IoT sensing', 'Edge computing', 'Industrial monitoring', 'Device + software'],
  },
];

export const CREED = [
  { rule: 'Not every problem is a product opportunity.', truth: 'Only the ones with evidence.' },
  { rule: 'Not every technology is a solution.', truth: 'We understand first. We build what is necessary.' },
  { rule: 'Not every solution needs to be custom-built.', truth: 'Reuse what already works.' },
  { rule: "We don't start with technology.", truth: 'We start with the problem.' },
  { rule: "We don't sell capabilities.", truth: 'We sell outcomes.' },
  { rule: "We don't chase trends.", truth: 'We chase evidence.' },
];

export const PSM_LOOP = [
  { step: '01', title: 'Problem', desc: 'What is wrong?' },
  { step: '02', title: 'Understand', desc: 'Why is it happening? What is the root cause?' },
  { step: '03', title: 'Design', desc: 'What should the solution look like?' },
  { step: '04', title: 'Build', desc: 'Software, AI, automation, hardware — the right tool, not the routine one.' },
  { step: '05', title: 'Measure', desc: 'Did it work? What did the data say?' },
  { step: '06', title: 'Improve', desc: 'Learn, refine, evolve — and identify what deserves to become a product.' },
];

export const METRICS = [
  { value: '05', label: 'Step Problem Method' },
  { value: '02', label: 'Products in Development' },
  { value: '06', label: 'Solution Practice Areas' },
  { value: '2026', label: 'Foundation Phase' },
];

export const TEAM = [
  { role: 'Founders & management', desc: 'Direction, strategy and partnerships.' },
  { role: 'Engineers & makers', desc: 'Software, AI, automation and product build.' },
  { role: 'Designers & strategists', desc: 'Experience, product thinking and clarity.' },
  { role: 'Product partners', desc: 'Shared ventures built on validated problems.' },
];

export const WORK = [
  { index: '01', product: 'Boowa', meta: 'Hyperlocal Commerce · Delivery', href: '#products', color: 'var(--accent-green)' },
  { index: '02', product: 'EYD', meta: 'Real-Estate Technology', href: '#products', color: 'var(--accent-blue)' },
  { index: '03', product: 'AI Systems', meta: 'Intelligent & Purpose-Built', href: '#solutions', color: 'var(--accent-violet)' },
  { index: '04', product: 'Automation', meta: 'Workflows That Run Themselves', href: '#solutions', color: 'var(--accent-coral)' },
];

export const STACK = [
  'TypeScript', 'React', 'Node.js', 'Three.js / R3F', 'Next.js', 'PostgreSQL',
  'AWS', 'Python', 'TensorFlow', 'GraphQL', 'Docker', 'Kubernetes',
  'LLM / RAG', 'IoT / Edge', 'CI/CD', 'Design Systems',
];
