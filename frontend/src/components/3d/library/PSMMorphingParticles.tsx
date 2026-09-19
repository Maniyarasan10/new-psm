import { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../core/prng';
import { useMotion, tierCount } from './shared';
import { gsap } from '../../../lib/gsapSetup';

export type MorphShape = 
  | 'sphere' 
  | 'torus' 
  | 'neural' 
  | 'grid' 
  | 'helix' 
  | 'globe' 
  | 'cube';

interface ShapeGenerator {
  generate: (count: number, radius: number, seed: number) => Float32Array;
}

const shapeGenerators: Record<MorphShape, ShapeGenerator> = {
  sphere: {
    generate: (count: number, radius: number, seed: number) => {
      const rand = mulberry32(seed);
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = radius * Math.cbrt(rand());
        const theta = rand() * Math.PI * 2;
        const phi = Math.acos(2 * rand() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      return positions;
    }
  },
  torus: {
    generate: (count: number, radius: number, seed: number) => {
      const rand = mulberry32(seed);
      const positions = new Float32Array(count * 3);
      const tubeRadius = radius * 0.35;
      for (let i = 0; i < count; i++) {
        const u = rand() * Math.PI * 2;
        const v = rand() * Math.PI * 2;
        const r = radius + tubeRadius * Math.cos(v);
        positions[i * 3] = r * Math.cos(u);
        positions[i * 3 + 1] = tubeRadius * Math.sin(v) * 0.6;
        positions[i * 3 + 2] = r * Math.sin(u);
      }
      return positions;
    }
  },
  neural: {
    generate: (count: number, radius: number, seed: number) => {
      const rand = mulberry32(seed);
      const positions = new Float32Array(count * 3);
      const layers = 4;
      const nodesPerLayer = Math.ceil(count / layers);
      for (let i = 0; i < count; i++) {
        const layer = Math.floor(i / nodesPerLayer);
        const nodeInLayer = i % nodesPerLayer;
        const x = (layer - (layers - 1) / 2) * (radius * 0.8);
        const y = (nodeInLayer - (nodesPerLayer - 1) / 2) * (radius * 0.6) + (rand() - 0.5) * radius * 0.3;
        const z = (rand() - 0.5) * radius * 0.5;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }
      return positions;
    }
  },
  grid: {
    generate: (count: number, radius: number, seed: number) => {
      const rand = mulberry32(seed);
      const positions = new Float32Array(count * 3);
      const gridSize = Math.ceil(Math.cbrt(count));
      const spacing = (radius * 2) / gridSize;
      for (let i = 0; i < count; i++) {
        const x = (i % gridSize) * spacing - radius;
        const y = (Math.floor(i / gridSize) % gridSize) * spacing - radius;
        const z = Math.floor(i / (gridSize * gridSize)) * spacing - radius;
        positions[i * 3] = x + (rand() - 0.5) * spacing * 0.1;
        positions[i * 3 + 1] = y + (rand() - 0.5) * spacing * 0.1;
        positions[i * 3 + 2] = z + (rand() - 0.5) * spacing * 0.1;
      }
      return positions;
    }
  },
  helix: {
    generate: (count: number, radius: number, seed: number) => {
      const rand = mulberry32(seed);
      const positions = new Float32Array(count * 3);
      const turns = 3;
      const height = radius * 2.5;
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const angle = t * Math.PI * 2 * turns;
        const r = radius * (0.5 + 0.5 * Math.sin(t * Math.PI));
        const x = r * Math.cos(angle) + (rand() - 0.5) * radius * 0.1;
        const y = t * height - height / 2 + (rand() - 0.5) * radius * 0.1;
        const z = r * Math.sin(angle) + (rand() - 0.5) * radius * 0.1;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }
      return positions;
    }
  },
  globe: {
    generate: (count: number, radius: number, seed: number) => {
      const rand = mulberry32(seed);
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const lat = rand() * Math.PI - Math.PI / 2;
        const lon = rand() * Math.PI * 2;
        const r = radius + (rand() - 0.5) * radius * 0.08;
        positions[i * 3] = r * Math.cos(lat) * Math.cos(lon);
        positions[i * 3 + 1] = r * Math.sin(lat);
        positions[i * 3 + 2] = r * Math.cos(lat) * Math.sin(lon);
      }
      return positions;
    }
  },
  cube: {
    generate: (count: number, radius: number, seed: number) => {
      const rand = mulberry32(seed);
      const positions = new Float32Array(count * 3);
      const halfSize = radius;
      for (let i = 0; i < count; i++) {
        const face = Math.floor(rand() * 6);
        const u = rand();
        const v = rand();
        let x = 0, y = 0, z = 0;
        switch (face) {
          case 0: x = -halfSize; y = (u - 0.5) * halfSize * 2; z = (v - 0.5) * halfSize * 2; break;
          case 1: x = halfSize; y = (u - 0.5) * halfSize * 2; z = (v - 0.5) * halfSize * 2; break;
          case 2: x = (u - 0.5) * halfSize * 2; y = -halfSize; z = (v - 0.5) * halfSize * 2; break;
          case 3: x = (u - 0.5) * halfSize * 2; y = halfSize; z = (v - 0.5) * halfSize * 2; break;
          case 4: x = (u - 0.5) * halfSize * 2; y = (v - 0.5) * halfSize * 2; z = -halfSize; break;
          case 5: x = (u - 0.5) * halfSize * 2; y = (v - 0.5) * halfSize * 2; z = halfSize; break;
        }
        positions[i * 3] = x + (rand() - 0.5) * halfSize * 0.05;
        positions[i * 3 + 1] = y + (rand() - 0.5) * halfSize * 0.05;
        positions[i * 3 + 2] = z + (rand() - 0.5) * halfSize * 0.05;
      }
      return positions;
    }
  }
};

const VARIANT_SHAPE_MAP: Record<string, MorphShape[]> = {
  'home-hero': ['sphere', 'torus', 'neural'],
  'products-hub': ['cube', 'sphere', 'helix'],
  'boowa': ['grid', 'sphere', 'torus'],
  'eyd': ['globe', 'sphere', 'helix'],
  'aura': ['sphere', 'neural', 'helix'],
  'solutions-hub': ['sphere', 'grid', 'torus'],
  'ai': ['neural', 'sphere', 'helix'],
  'business-systems': ['grid', 'cube', 'sphere'],
  'automation': ['torus', 'helix', 'sphere'],
  'web-mobile': ['grid', 'cube', 'sphere'],
  'product-engineering': ['helix', 'cube', 'sphere'],
  'hardware-iot': ['globe', 'neural', 'torus'],
  'about': ['sphere', 'grid', 'helix'],
  'contact': ['sphere', 'torus', 'globe'],
  'default': ['sphere', 'torus', 'neural'],
};

const VARIANT_ACCENT_MAP: Record<string, { primary: string; secondary: string; tertiary: string }> = {
  'home-hero': { primary: '#0d6efd', secondary: '#ffb829', tertiary: '#15846e' },
  'products-hub': { primary: '#0d6efd', secondary: '#ffb829', tertiary: '#15846e' },
  'boowa': { primary: '#15846e', secondary: '#ffb829', tertiary: '#0d6efd' },
  'eyd': { primary: '#0d6efd', secondary: '#ffb829', tertiary: '#15846e' },
  'aura': { primary: '#8b5cf6', secondary: '#0d6efd', tertiary: '#ffb829' },
  'solutions-hub': { primary: '#0d6efd', secondary: '#ffb829', tertiary: '#15846e' },
  'ai': { primary: '#8b5cf6', secondary: '#06b6d4', tertiary: '#a16207' },
  'business-systems': { primary: '#0d6efd', secondary: '#15846e', tertiary: '#ffb829' },
  'automation': { primary: '#06b6d4', secondary: '#ffb829', tertiary: '#15846e' },
  'web-mobile': { primary: '#15846e', secondary: '#0d6efd', tertiary: '#ffb829' },
  'product-engineering': { primary: '#ffb829', secondary: '#0d6efd', tertiary: '#8b5cf6' },
  'hardware-iot': { primary: '#06b6d4', secondary: '#ffb829', tertiary: '#15846e' },
  'about': { primary: '#0d6efd', secondary: '#15846e', tertiary: '#ffb829' },
  'contact': { primary: '#0d6efd', secondary: '#ffb829', tertiary: '#15846e' },
  'default': { primary: '#0d6efd', secondary: '#ffb829', tertiary: '#15846e' },
};

export interface PSMMorphingParticlesProps {
  variant?: string;
  seed?: number;
  radius?: number;
  speed?: number;
  morphDuration?: number;
  morphInterval?: number;
  scrollTriggered?: boolean;
  hoverTriggered?: boolean;
  enabled?: boolean;
}

export function PSMMorphingParticles({
  variant = 'default',
  seed = 1,
  radius = 3,
  speed = 0.03,
  morphDuration = 2.5,
  morphInterval = 10000,
  scrollTriggered = false,
  hoverTriggered = false,
  enabled = true,
}: PSMMorphingParticlesProps) {
  const { live, reduced, profile } = useMotion(enabled);
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [morphProgress, setMorphProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const shapesForVariant = VARIANT_SHAPE_MAP[variant] || VARIANT_SHAPE_MAP.default;
  const currentShape = shapesForVariant[currentShapeIndex % shapesForVariant.length];
  const nextShape = shapesForVariant[(currentShapeIndex + 1) % shapesForVariant.length];
  const colors = VARIANT_ACCENT_MAP[variant] || VARIANT_ACCENT_MAP.default;
  
  const isMobile = profile.tier === 'mobile';
  const particleCount = tierCount(profile, 800, 500, 300, 100);
  
  const currentPositionsRef = useRef<Float32Array | null>(null);
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (!geometryRef.current) return;
    
    const currentGen = shapeGenerators[currentShape];
    const nextGen = shapeGenerators[nextShape];
    
    currentPositionsRef.current = currentGen.generate(particleCount, radius, seed);
    targetPositionsRef.current = nextGen.generate(particleCount, radius, seed + 10000);
    basePositionsRef.current = currentPositionsRef.current;
    
    geometryRef.current.setAttribute('position', new THREE.BufferAttribute(currentPositionsRef.current, 3));
    geometryRef.current.attributes.position.needsUpdate = true;
  }, [currentShape, nextShape, particleCount, radius, seed]);

  const morphToNextShape = () => {
    if (reduced) return;
    
    const nextIndex = (currentShapeIndex + 1) % shapesForVariant.length;
    const nextShapeGen = shapeGenerators[shapesForVariant[nextIndex]];
    const newTargetPositions = nextShapeGen.generate(particleCount, radius, seed + 20000 + nextIndex * 1000);
    targetPositionsRef.current = newTargetPositions;
    
    gsap.to({ progress: 0 }, {
      progress: 1,
      duration: morphDuration,
      ease: 'power2.inOut',
      onUpdate: function() {
        setMorphProgress(this.targets()[0].progress);
      },
      onComplete: () => {
        setCurrentShapeIndex(nextIndex);
        setMorphProgress(0);
        basePositionsRef.current = targetPositionsRef.current;
        if (geometryRef.current) {
          geometryRef.current.setAttribute('position', new THREE.BufferAttribute(targetPositionsRef.current!, 3));
          geometryRef.current.attributes.position.needsUpdate = true;
        }
      }
    });
  };

  useEffect(() => {
    if (reduced || !live || scrollTriggered || hoverTriggered) return;
    const interval = setInterval(morphToNextShape, morphInterval);
    return () => clearInterval(interval);
  }, [reduced, live, scrollTriggered, hoverTriggered, morphInterval]);

  useEffect(() => {
    if (!scrollTriggered) return;
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollTriggered]);

  useFrame((state) => {
    if (!live || !pointsRef.current || reduced) return;
    
    const t = state.clock.elapsedTime;
    
    if (groupRef.current) {
      groupRef.current.rotation.y += speed * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 0.05) * 0.03;
    }
    
    if (morphProgress > 0 && currentPositionsRef.current && targetPositionsRef.current) {
      const currentAttr = geometryRef.current?.attributes.position;
      if (currentAttr) {
        const positions = currentAttr.array as Float32Array;
        for (let i = 0; i < particleCount * 3; i++) {
          positions[i] = THREE.MathUtils.lerp(
            currentPositionsRef.current[i],
            targetPositionsRef.current[i],
            morphProgress
          );
        }
        currentAttr.needsUpdate = true;
      }
    }
    
    if (scrollTriggered && scrollProgress > 0) {
      const shapeFromScroll = Math.floor(scrollProgress * shapesForVariant.length);
      if (shapeFromScroll !== currentShapeIndex && shapeFromScroll < shapesForVariant.length) {
        setCurrentShapeIndex(shapeFromScroll);
      }
    }
  });

  const handlePointerEnter = () => {
    if (hoverTriggered && !reduced) {
      morphToNextShape();
    }
  };

  const handlePointerLeave = () => {
  };

  const colorArray = useMemo(() => {
    const colorsArray = new Float32Array(particleCount * 3);
    const cBase = new THREE.Color('#9aa0ab');
    const cPrimary = new THREE.Color(colors.primary);
    const cSecondary = new THREE.Color(colors.secondary);
    const cTertiary = new THREE.Color(colors.tertiary);
    const rand = mulberry32(seed * 99991);
    
    for (let i = 0; i < particleCount; i++) {
      const t = rand();
      let color: THREE.Color;
      if (t > 0.9) color = cTertiary;
      else if (t > 0.7) color = cSecondary;
      else if (t > 0.5) color = cPrimary;
      else color = cBase;
      
      colorsArray[i * 3] = color.r;
      colorsArray[i * 3 + 1] = color.g;
      colorsArray[i * 3 + 2] = color.b;
    }
    return colorsArray;
  }, [particleCount, seed, colors]);

  return (
    <group 
      ref={groupRef} 
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <points 
        ref={pointsRef}
        geometry={geometryRef.current || new THREE.BufferGeometry()}
      >
        <pointsMaterial
          size={isMobile ? 0.05 : 0.04}
          sizeAttenuation
          transparent
          opacity={0.75}
          vertexColors
          depthWrite={false}
        />
      </points>
      
      {currentPositionsRef.current && (
        <points
          geometry={(() => {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(currentPositionsRef.current!, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
            return geo;
          })()}
        >
          <pointsMaterial
            size={isMobile ? 0.03 : 0.025}
            sizeAttenuation
            transparent
            opacity={0.3}
            vertexColors
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}

export default PSMMorphingParticles;