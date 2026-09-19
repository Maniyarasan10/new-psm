import * as THREE from 'three';
import { useSceneActive } from '../core/SceneState';
import { useReducedMotion } from '../../../lib/reducedMotion';
import { usePerformanceProfile, type PerformanceProfile } from '../core/usePerformanceProfile';

export interface UseMotion {
  active: boolean;
  reduced: boolean;
  profile: PerformanceProfile;
  live: boolean;
}

export function useMotion(enabled = true): UseMotion {
  const profile = usePerformanceProfile();
  const active = useSceneActive();
  const reduced = useReducedMotion();
  return { active, reduced, profile, live: active && enabled };
}

export function tierCount(
  profile: PerformanceProfile,
  desktop: number,
  tablet: number,
  mobile: number,
  floor = 24,
): number {
  const base = profile.tier === 'mobile' ? mobile : profile.tier === 'tablet' ? tablet : desktop;
  return Math.max(floor, base);
}

export function createGearGeometry(
  teeth: number,
  radius: number,
  depth: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  const ringR = radius;
  const toothR = radius * 1.06;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.42;
    const a2 = a0 + step * 0.58;
    const a3 = a0 + step;
    if (i === 0) shape.moveTo(Math.cos(a0) * ringR, Math.sin(a0) * ringR);
    shape.lineTo(Math.cos(a1) * toothR, Math.sin(a1) * toothR);
    shape.lineTo(Math.cos(a2) * toothR, Math.sin(a2) * toothR);
    shape.lineTo(Math.cos(a3) * ringR, Math.sin(a3) * ringR);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
}