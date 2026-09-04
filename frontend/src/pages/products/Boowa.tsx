import { Link } from 'react-router-dom';
import { PageHero } from '../../components/ui';

const CUSTOMERS = [
  { label: 'Discover', desc: 'Find nearby products and businesses.' },
  { label: 'Choose', desc: 'Explore menus, products and available items.' },
  { label: 'Order', desc: 'Place an order through the platform.' },
  { label: 'Track', desc: 'Follow the order and delivery journey.' },
  { label: 'Receive', desc: 'Get the order delivered to your location.' },
];

const MERCHANTS = [
  { label: 'Create', desc: 'Build a digital storefront.' },
  { label: 'Manage', desc: 'Manage products, pricing and incoming orders.' },
  { label: 'Reach', desc: 'Connect with nearby customers.' },
  { label: 'Fulfil', desc: 'Coordinate orders and delivery.' },
  { label: 'Grow', desc: 'Use digital tools to improve local commerce.' },
];

const DELIVERY = [
  { label: 'Discover', desc: 'Receive eligible delivery opportunities.' },
  { label: 'Pick Up', desc: 'Collect orders from merchants.' },
  { label: 'Navigate', desc: 'Use location-aware delivery workflows.' },
  { label: 'Deliver', desc: 'Complete the delivery.' },
];

const FEATURES = [
  'Hyperlocal discovery',
  'Food ordering',
  'Everyday-item ordering',
  'Merchant management',
  'Order management',
  'Delivery workflows',
  'Location-aware experiences',
  'Digital payments',
  'Notifications',
  'Customer support',
  'Business analytics',
];

function StepList({ items }: { items: { label: string; desc: string }[] }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item.label}>
          <strong>{item.label}</strong> — {item.desc}
        </li>
      ))}
    </ul>
  );
}

export default function Boowa() {
  return (
    <>
      <PageHero
        eyebrow="Product · Local Commerce"
        title="Boowa — Hyperlocal Commerce, Closer to You."
      >
        <p>
          Discover nearby food and everyday items, order digitally and get them
          delivered through a connected local commerce platform.
        </p>
        <span className="status-badge" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          In Development
        </span>
        <div className="page-hero-cta">
          <Link className="btn btn-primary" to="/contact">
            Join the Boowa Journey <span aria-hidden className="arrow">→</span>
          </Link>
          <Link className="btn btn-ghost" to="/partner">
            Partner With Boowa
          </Link>
        </div>
      </PageHero>

      <div className="section">
        <div className="container">
          <div className="content-stack">
            {/* The Problem */}
            <div className="content-block">
              <h2 className="h2">Local Businesses Are Closer Than You Think.</h2>
              <p>
                People often live and work surrounded by local restaurants, shops and
                service providers, yet discovering, ordering from and receiving products
                from these businesses can still be fragmented. For businesses, digital
                visibility and delivery can also be difficult to manage without the right
                infrastructure. Boowa is being built to bring customers, local businesses
                and delivery operations into one connected hyperlocal platform.
              </p>
            </div>

            {/* The Vision */}
            <div className="content-block">
              <h2 className="h2">Make Local Commerce Effortless.</h2>
              <p>
                Boowa aims to make it easier for customers to discover what is available
                nearby, and for local businesses to reach customers through a digital
                ordering and delivery experience.
              </p>
            </div>

            {/* How It Works */}
            <div className="content-block">
              <h2 className="h2">How Boowa Works.</h2>

              <h3 className="h3" style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>For Customers</h3>
              <StepList items={CUSTOMERS} />

              <h3 className="h3" style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>For Merchants</h3>
              <StepList items={MERCHANTS} />

              <h3 className="h3" style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>For Delivery Partners</h3>
              <StepList items={DELIVERY} />
            </div>

            {/* Features */}
            <div className="content-block">
              <h2 className="h2">Boowa Feature Areas</h2>
              <ul className="check-list">
                {FEATURES.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="body" style={{ marginTop: '1rem' }}>
                Only publish features actually planned or implemented; label future features as "Planned".
              </p>
            </div>

            {/* Why Boowa */}
            <div className="content-block">
              <h2 className="h2">Built Around the Local Economy.</h2>
              <p>
                Boowa is designed with three participants in mind: customers need
                convenience, businesses need digital reach, and delivery partners need
                efficient opportunities. The product succeeds when all three sides of the
                local marketplace benefit.
              </p>
            </div>

            {/* Status */}
            <div className="content-block">
              <h2 className="h2">Product Status</h2>
              <p>
                Boowa is currently in development. Features, service areas, launch plans
                and availability will be announced as the product progresses.
              </p>
              <div className="page-hero-cta" style={{ marginTop: '1.5rem' }}>
                <Link className="btn btn-primary" to="/partner">
                  Partner With Boowa <span aria-hidden className="arrow">→</span>
                </Link>
                <Link className="btn btn-ghost" to="/contact">
                  Stay Updated
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
