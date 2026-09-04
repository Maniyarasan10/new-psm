import { useScrollStore } from '../../store/scrollStore';

const PHASES = [
  { id: 0, label: 'Intelligence', title: 'Data particles in motion', desc: 'Flowing neural data — the software & AI layer.' },
  { id: 1, label: 'Software', title: 'Modular interface components', desc: 'Particles coalesce into the SaaS / product surface.' },
  { id: 2, label: 'Product', title: 'A physical form', desc: 'Software resolves into a tangible product.' },
];

export default function Story() {
  const scene = useScrollStore((s) => s.scenePhase);
  const phaseIndex = scene < 0.33 ? 0 : scene < 0.66 ? 1 : 2;

  return (
    <section id="story" className="section story-section">
      <div className="container">
        <span className="eyebrow">Interactive 3D Story</span>
        <h2 className="h1" style={{ maxWidth: '20ch' }}>
          Intelligence → Software → <em className="accent-italic">Product.</em>
        </h2>
        <p className="lead" style={{ maxWidth: '36rem', marginTop: '1rem' }}>
          One continuous 3D system transforms as you scroll. The particles you see coalesce
          into modular interface components, and resolve into a physical product form. This
          transformation is the story — and it's what PSM does.
        </p>

        <div className="story-phases">
          {PHASES.map((p, i) => {
            const active = i === phaseIndex;
            return (
              <div className={`story-phase ${active ? 'active' : ''}`} key={p.id} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="mono">{p.label}</span>
                <p className="active-note" style={{ visibility: active ? 'visible' : 'hidden' }}>
                  {p.title} — {p.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="story-progress" aria-hidden>
          <div className="story-progress-fill" style={{ width: `${scene * 100}%` }} />
        </div>
      </div>
    </section>
  );
}
