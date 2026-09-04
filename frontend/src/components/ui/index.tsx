import type { ReactNode } from 'react';

type Tier = 'display' | 'h1' | 'h2' | 'h3';

export function PageHero({
  eyebrow,
  title,
  children,
  titleTier = 'h1',
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  titleTier?: Tier;
}) {
  return (
    <section className="page-hero" aria-label="Page introduction">
      <div className="container">
        {eyebrow && <span className="mono eyebrow page-hero-eyebrow" data-reveal>{eyebrow}</span>}
        <h1 className={`${titleTier} page-hero-title`} data-reveal data-reveal-delay="80">{title}</h1>
        {children && <div className="page-hero-body" data-reveal data-reveal-delay="160">{children}</div>}
      </div>
    </section>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`section ${className ?? ''}`}>
      <div className="container">
        {(eyebrow || title) && (
          <header className="section-head">
            {eyebrow && <span className="mono eyebrow" data-reveal>{eyebrow}</span>}
            {title && <h2 className="h2 section-title" data-reveal data-reveal-delay="60">{title}</h2>}
            {intro && <p className="lead section-intro" data-reveal data-reveal-delay="120">{intro}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
