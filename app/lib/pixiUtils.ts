/**
 * pixiUtils.ts
 * 
 * Utility functions for PIXI.js v8 compatibility
 * Provides helper methods for common operations
 * 
 * @version 1.0.0
 * @path app/lib/pixiUtils.ts
 */

import * as PIXI from 'pixi.js';

/**
 * Check if a point is within bounds
 * Replacement for deprecated bounds.contains() method
 */
export function boundsContainsPoint(
  bounds: PIXI.Bounds, 
  point: { x: number; y: number }
): boolean {
  return point.x >= bounds.x && 
         point.x <= bounds.x + bounds.width &&
         point.y >= bounds.y && 
         point.y <= bounds.y + bounds.height;
}

/**
 * Get bounds edges
 * Replacement for deprecated bounds.left, .right, .top, .bottom
 */
export function getBoundsEdges(bounds: PIXI.Bounds) {
  return {
    left: bounds.x,
    right: bounds.x + bounds.width,
    top: bounds.y,
    bottom: bounds.y + bounds.height
  };
}

/**
 * Create a gradient texture
 * Helper for creating gradient backgrounds
 */
export async function createGradientTexture(
  colors: number[],
  width: number,
  height: number,
  direction: 'vertical' | 'horizontal' = 'vertical'
): Promise<PIXI.Texture> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = direction === 'vertical' 
    ? ctx.createLinearGradient(0, 0, 0, height)
    : ctx.createLinearGradient(0, 0, width, 0);
  
  colors.forEach((color, index) => {
    const stop = index / (colors.length - 1);
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    gradient.addColorStop(stop, `rgb(${r},${g},${b})`);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return PIXI.Texture.from(canvas);
}

/**
 * Create a noise texture for displacement effects
 */
export async function createNoiseTexture(
  size: number = 256,
  scale: number = 0.01
): Promise<PIXI.Texture> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Create Perlin-noise-like pattern
      const value1 = Math.sin(x * scale) * Math.cos(y * scale) * 127 + 127;
      const value2 = Math.sin(x * scale * 2 + 100) * Math.cos(y * scale * 2 + 100) * 127 + 127;
      
      data[i] = value1;     // red (x displacement)
      data[i + 1] = value2; // green (y displacement)
      data[i + 2] = 128;    // blue (unused)
      data[i + 3] = 255;    // alpha
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return PIXI.Texture.from(canvas);
}

/**
 * Safe color conversion
 * Converts hex color to PIXI color number
 */
export function hexToPixiColor(hex: string): number {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex to number
  return parseInt(hex, 16);
}

/**
 * Create a glow filter
 * Custom glow implementation for PIXI v8
 */
export function createGlowFilter(
  color: number = 0xffffff,
  strength: number = 5,
  quality: number = 0.5
): PIXI.Filter {
  const blurFilter = new PIXI.BlurFilter({
    strength,
    quality: Math.round(quality * 4),
    resolution: 2,
    kernelSize: 5
  });
  
  return blurFilter;
}

/**
 * Animate a display object
 * Simple animation helper
 */
export function animateObject(
  object: PIXI.Container,
  properties: Partial<{
    x: number;
    y: number;
    rotation: number;
    scale: number | { x: number; y: number };
    alpha: number;
  }>,
  duration: number,
  easing: (t: number) => number = (t) => t // linear by default
): Promise<void> {
  return new Promise((resolve) => {
    const startProps = {
      x: object.x,
      y: object.y,
      rotation: object.rotation,
      scaleX: object.scale.x,
      scaleY: object.scale.y,
      alpha: object.alpha
    };
    
    const startTime = performance.now();
    
    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      
      // Apply animations
      if (properties.x !== undefined) {
        object.x = startProps.x + (properties.x - startProps.x) * easedProgress;
      }
      if (properties.y !== undefined) {
        object.y = startProps.y + (properties.y - startProps.y) * easedProgress;
      }
      if (properties.rotation !== undefined) {
        object.rotation = startProps.rotation + (properties.rotation - startProps.rotation) * easedProgress;
      }
      if (properties.alpha !== undefined) {
        object.alpha = startProps.alpha + (properties.alpha - startProps.alpha) * easedProgress;
      }
      if (properties.scale !== undefined) {
        if (typeof properties.scale === 'number') {
          object.scale.set(
            startProps.scaleX + (properties.scale - startProps.scaleX) * easedProgress
          );
        } else {
          object.scale.x = startProps.scaleX + (properties.scale.x - startProps.scaleX) * easedProgress;
          object.scale.y = startProps.scaleY + (properties.scale.y - startProps.scaleY) * easedProgress;
        }
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };
    
    animate();
  });
}

/**
 * Easing functions
 */
export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
};

/**
 * Create particle effect
 */
export function createParticleEffect(
  container: PIXI.Container,
  position: PIXI.PointData,
  color: number,
  count: number = 10,
  lifetime: number = 1000
): void {
  for (let i = 0; i < count; i++) {
    const particle = new PIXI.Graphics();
    particle.circle(0, 0, 2 + Math.random() * 3);
    particle.fill({ color, alpha: 0.8 });
    
    particle.position.copyFrom(position);
    container.addChild(particle);
    
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    const startTime = performance.now();
    
    const animateParticle = () => {
      const elapsed = performance.now() - startTime;
      const progress = elapsed / lifetime;
      
      if (progress < 1) {
        particle.x = position.x + vx * elapsed * 0.001 * 60;
        particle.y = position.y + vy * elapsed * 0.001 * 60;
        particle.alpha = 0.8 * (1 - progress);
        requestAnimationFrame(animateParticle);
      } else {
        container.removeChild(particle);
      }
    };
    
    animateParticle();
  }
}
