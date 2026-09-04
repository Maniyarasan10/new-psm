import { useRef } from 'react';
import { useReducedMotion } from '../../lib/reducedMotion';

export default function Hero() {
  useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);

  return (
    <section id="hero" ref={rootRef} className="hero" aria-label="Problem Solving Mind — hero">
      <div className="container hero-content">
        <div className="hero-meta">
          <span className="mono eyebrow">Problem Solving Mind — Technology Studio</span>
          <span className="mono" style={{ opacity: 0.6 }}>Products · Services · Software · SaaS</span>
        </div>

        <h1 className="display hero-title">
          Because <em className="accent-italic">Problem&nbsp;Solving</em>
          <br />
          is everything.
        </h1>

        <p className="lead hero-sub">
          We turn real-world problems into working technology — flowing from intelligence,
          through software, into physical products. One continuous system.
        </p>

        <div className="hero-cta">
          <a className="btn btn-primary" href="#contact">
            Book a call
            <span aria-hidden className="arrow">→</span>
          </a>
          <a className="btn btn-ghost" href="#products">
            Explore Products
          </a>
        </div>

        <div className="hero-scrollhint mono" aria-hidden>
          <span className="scroll-line" />
          Scroll
        </div>
      </div>
    </section>
  );
}
