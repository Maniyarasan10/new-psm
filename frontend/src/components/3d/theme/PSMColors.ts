// PSM brand palette mapped to 3D scenes. Mirrors tokens in src/index.css.
export type SceneScheme = 'light' | 'dark';

export interface ScenePalette {
  ink: string;
  accent: string;
  accent2: string;
  accent3: string;
  wire: string;
  glow: string;
}

export const PSMColors: Record<SceneScheme, ScenePalette> = {
  light: {
    ink: '#0a0b0f',
    accent: '#0d6efd',
    accent2: '#ffb829',
    accent3: '#15846e',
    wire: 'rgba(10, 11, 15, 0.22)',
    glow: '#0d6efd',
  },
  dark: {
    ink: '#f4f5f8',
    accent: '#3b82f6',
    accent2: '#fbbf24',
    accent3: '#34d399',
    wire: 'rgba(244, 245, 248, 0.35)',
    glow: '#60a5fa',
  },
};

// Spectrum accents used to tint scenes per page (matches --accent-* tokens).
export const PSMAccess = {
  azure: '#0d6efd',
  violet: '#8b5cf6',
  green: '#15846e',
  yellow: '#ffb829',
  coral: '#f97316',
  pink: '#ec4899',
  teal: '#0d9488',
  gold: '#a16207',
} as const;