// Shared scroll-progress probe for DOM-driven 3D (e.g. scroll-driven assembly).
// Values are written by SceneFrame (rAF-throttled) and read inside useFrame,
// so no React re-renders are triggered on scroll.

const progress = new Map<string, number>();

export function setScrollProgress(id: string, value: number): void {
  progress.set(id, value);
}

export function getScrollProgress(id: string): number {
  return progress.get(id) ?? 0;
}

export function computeSectionProgress(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  const vh = el.offsetHeight || 1;
  const p = (viewportCenter - rect.top) / vh;
  return Math.max(0, Math.min(1, p));
}