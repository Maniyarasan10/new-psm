import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { PageHero } from '../../components/ui';

const SELLER_BENEFITS = [
  'Digital property profiles',
  'Rich property information',
  '3D/immersive viewing',
  'Lead and enquiry management',
  'Centralized property management',
  'Better customer engagement',
];

const CUSTOMER_BENEFITS = [
  'Discover properties',
  'Compare relevant information',
  'Explore digital property experiences',
  'Understand spaces remotely',
  'Shortlist properties',
  'Contact sellers',
];

export default function EYD() {
  return (
    <>
      <Seo
        title="EYD — Explore Your Dream | Real-Estate & 3D Property Technology"
        description="EYD is a real-estate technology platform from Problem Solving Mind bringing property discovery, seller management and immersive 3D property experiences into one place."
        path="/products/eyd"
      />

      <PageHero
        eyebrow="Product · Real Estate Technology"
        title="EYD — Explore Your Dream."
      >
        <p>
          EYD is a real-estate technology platform designed to connect property
          customers and sellers through smarter discovery, digital property
          management and immersive 3D viewing experiences.
        </p>
        <span className="status-badge" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          In Development
        </span>
        <div className="page-hero-cta">
          <Link className="btn btn-primary" to="/contact">
            Explore EYD <span aria-hidden className="arrow">→</span>
          </Link>
          <Link className="btn btn-ghost" to="/partner">
            Partner With EYD
          </Link>
        </div>
      </PageHero>

      <div className="section">
        <div className="container">
          <div className="content-stack">
            {/* The Problem */}
            <div className="content-block">
              <h2 className="h2">Real Estate Should Be Easier to Understand Before You Visit.</h2>
              <p>
                Property decisions involve time, money and emotion. Yet much of the
                traditional discovery experience still depends on photographs,
                descriptions, fragmented information and physical visits. Customers need
                a clearer understanding of a property before investing time in a visit.
                Sellers need better ways to present properties, manage enquiries and
                create stronger digital experiences. EYD is being built to bridge that
                gap.
              </p>
            </div>

            {/* The Vision */}
            <div className="content-block">
              <h2 className="h2">Turn a Property Into a Digital Experience.</h2>
              <p>
                EYD aims to bring property discovery, digital property information,
                seller workflows and immersive 3D experiences into one connected
                real-estate technology platform.
              </p>
            </div>

            {/* 3D Capture */}
            <div className="content-block">
              <h2 className="h2">Capture the Space. Bring It Online.</h2>
              <p>
                The 3D capture capability is designed to transform physical property
                spaces into interactive digital experiences that customers can explore
                remotely.
              </p>
              <p className="body" style={{ marginTop: '1rem' }}>
                Exact capture technology, device compatibility, 3D formats, measurement
                accuracy and viewing capabilities are described once technically
                validated.
              </p>
            </div>

            {/* For Property Sellers */}
            <div className="content-block">
              <h2 className="h2">Present Properties With More Than a Photo Gallery.</h2>
              <ul className="check-list">
                {SELLER_BENEFITS.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            {/* For Customers */}
            <div className="content-block">
              <h2 className="h2">Explore Before You Visit.</h2>
              <ul className="check-list">
                {CUSTOMER_BENEFITS.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            {/* One-Stop Vision */}
            <div className="content-block">
              <h2 className="h2">One Platform. A More Connected Property Journey.</h2>
              <p>
                EYD is being designed to connect key parts of the property discovery
                journey: Property → Digital Profile → 3D Experience → Discovery →
                Enquiry → Seller Connection. The long-term product vision may expand as
                validated customer and seller needs become clearer.
              </p>
            </div>

            {/* Status */}
            <div className="content-block">
              <h2 className="h2">Product Status</h2>
              <p>
                EYD is under active product development. Product capabilities,
                integrations, coverage and launch plans will be announced as the
                platform progresses.
              </p>
              <div className="page-hero-cta" style={{ marginTop: '1.5rem' }}>
                <Link className="btn btn-primary" to="/contact">
                  Talk to the EYD Team <span aria-hidden className="arrow">→</span>
                </Link>
                <Link className="btn btn-ghost" to="/partner">
                  Partner With EYD
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
