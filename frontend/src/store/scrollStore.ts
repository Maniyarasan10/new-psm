import { create } from 'zustand';

interface ScrollState {
  /** Scroll progress 0..1 from Lenis raf */
  progress: number;
  /** Whether the user is on a coarse-pointer / low-power device */
  isMobile: boolean;
  /** device pixel ratio cap to keep 3D cheap on mobile */
  dpr: number;
  /** 3D system phase: 0 = particles, 1 = modular UI, 2 = product */
  scenePhase: number;
  setProgress: (p: number) => void;
  setPhase: (p: number) => void;
  setDevice: (d: Partial<ScrollState>) => void;
}

function detectMobile() {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = window.innerWidth < 768;
  return coarse || small;
}

function computeDpr() {
  if (typeof window === 'undefined') return 1.5;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (detectMobile()) return Math.min(dpr, 1.5);
  return dpr;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  isMobile: detectMobile(),
  dpr: computeDpr(),
  scenePhase: 0,
  setProgress: (progress) => set({ progress }),
  setPhase: (scenePhase) => set({ scenePhase }),
  setDevice: (d) => set((s) => ({ ...s, ...d })),
}));
