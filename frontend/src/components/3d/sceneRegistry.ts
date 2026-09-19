export type SceneVariant =
  | 'home-hero'
  | 'products-hub'
  | 'boowa'
  | 'eyd'
  | 'aura'
  | 'solutions-hub'
  | 'ai'
  | 'business-systems'
  | 'automation'
  | 'web-mobile'
  | 'product-engineering'
  | 'hardware-iot'
  | 'about'
  | 'contact'
  | 'default';

export const SCENE_ACCENTS: Record<SceneVariant, string> = {
  'home-hero': '#0d6efd',
  'products-hub': '#0d6efd',
  boowa: '#15846e',
  eyd: '#0d6efd',
  aura: '#8b5cf6',
  'solutions-hub': '#0d6efd',
  ai: '#8b5cf6',
  'business-systems': '#0d6efd',
  automation: '#f97316',
  'web-mobile': '#15846e',
  'product-engineering': '#ffb829',
  'hardware-iot': '#ec4899',
  about: '#0d6efd',
  contact: '#ffb829',
  default: '#0d6efd',
};

export function isSceneVariant(value: string): value is SceneVariant {
  return value in SCENE_ACCENTS;
}