import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import { PageHero } from '../../components/ui';

export default function Aura() {
  return (
    <>
      <Seo
        title="Aura | Healthcare Technology & Connected Devices"
        description="Aura is an emerging healthcare technology and hardware initiative from Problem Solving Mind, exploring how connected devices and software can improve patient care and clinical workflows."
        path="/products/aura"
      />

      <PageHero
        eyebrow="Product · Healthcare Technology"
        title="Aura — Healthcare Technology, Built Around the Patient."
      >
        <p>
          Aura is an emerging healthcare technology initiative exploring how
          connected devices and software can support better patient care and
          clinical workflows.
        </p>
        <span className="status-badge" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          Early-Stage Development
        </span>
        <div className="page-hero-cta">
          <Link className="btn btn-primary" to="/contact">
            Learn About Aura <span aria-hidden className="arrow">→</span>
          </Link>
          <Link className="btn btn-ghost" to="/contact">
            Talk to the Aura Team
          </Link>
        </div>
      </PageHero>

      <div className="section">
        <div className="container">
          <div className="content-stack">
            {/* The Problem */}
            <div className="content-block">
              <h2 className="h2">Healthcare Environments Generate More Than They Can Use.</h2>
              <p>
                Clinical and patient-care settings generate constant information —
                from vitals to workflows to equipment — but much of it stays
                disconnected from the systems and people who could act on it. Aura is
                being explored to close that gap between what happens in care
                environments and what technology can meaningfully support.
              </p>
            </div>

            {/* The Vision */}
            <div className="content-block">
              <h2 className="h2">Technology That Understands the Environment It's Built For.</h2>
              <p>
                Aura combines PSM's software and hardware capability to explore
                healthcare-specific problems — where a real-world constraint, not a
                trend, determines whether hardware, software or both are required.
              </p>
            </div>

            {/* Why Different */}
            <div className="content-block">
              <h2 className="h2">Why Aura Is Different for PSM.</h2>
              <p>
                Aura reflects PSM's willingness to engage with hardware when it is the
                right solution to a real problem — not a software-only workaround and
                not hardware for its own sake.
              </p>
              <p className="body" style={{ marginTop: '1rem' }}>
                Aura is early-stage. Specific clinical claims, device specifications,
                regulatory positioning and outcomes are published only once validated
                and cleared through the appropriate regulatory and compliance review.
              </p>
            </div>

            {/* Status */}
            <div className="content-block">
              <h2 className="h2">Product Status</h2>
              <p>
                Aura is in early-stage development. Capabilities, focus areas and
                timelines will be shared as the initiative progresses.
              </p>
              <div className="page-hero-cta" style={{ marginTop: '1.5rem' }}>
                <Link className="btn btn-primary" to="/contact">
                  Talk to the Aura Team <span aria-hidden className="arrow">→</span>
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
