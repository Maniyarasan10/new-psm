import { useState } from 'react';

let cached: boolean | undefined;

function detectWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (!window.WebGLRenderingContext) return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function useWebGLSupport(): boolean {
  const [supported] = useState<boolean>(() => {
    if (cached === undefined) cached = detectWebGL();
    return cached;
  });
  return supported;
}