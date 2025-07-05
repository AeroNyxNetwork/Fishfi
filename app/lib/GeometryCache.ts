/**
 * GeometryCache.ts
 * 
 * Centralized geometry and texture caching system for performance optimization
 * Implements the caching strategy from the technical roadmap
 * 
 * @version 1.0.0
 * @path app/lib/GeometryCache.ts
 */

import * as PIXI from 'pixi.js';

export class GeometryCache {
  private static contextCache: Map<string, PIXI.GraphicsContext> = new Map();
  private static textureCache: Map<string, PIXI.Texture> = new Map();
  private static geometryCache: Map<string, PIXI.Geometry> = new Map();

  /**
   * Cache and retrieve a pre-rendered texture with enhanced performance
   */
  public static getBakedTexture(
    renderer: PIXI.Renderer, 
    key: string, 
    drawFn: (g: PIXI.Graphics) => void,
    resolution: number = 2
  ): PIXI.Texture {
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    const graphics = new PIXI.Graphics();
    drawFn(graphics);

    // Calculate bounds for proper texture generation
    const bounds = graphics.getLocalBounds();
    const padding = 20;

    // Generate texture using PIXI v8's recommended options
    const texture = renderer.generateTexture({
      target: graphics,
      resolution,
      antialias: true,
      frame: new PIXI.Rectangle(
        bounds.x - padding,
        bounds.y - padding,
        bounds.width + padding * 2,
        bounds.height + padding * 2
      )
    });

    this.textureCache.set(key, texture);
    graphics.destroy(); // Clean up the temporary graphics object
    return texture;
  }

  /**
   * Cache and retrieve a reusable GraphicsContext for complex shapes
   */
  public static getContext(key: string, drawFn: (context: PIXI.GraphicsContext) => void): PIXI.GraphicsContext {
    if (this.contextCache.has(key)) {
      return this.contextCache.get(key)!;
    }
    
    const context = new PIXI.GraphicsContext();
    drawFn(context);
    this.contextCache.set(key, context);
    return context;
  }

  /**
   * Cache geometry for reusable shapes
   */
  public static getGeometry(key: string, createFn: () => PIXI.Geometry): PIXI.Geometry {
    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key)!;
    }

    const geometry = createFn();
    this.geometryCache.set(key, geometry);
    return geometry;
  }

  /**
   * Clear specific cache type or all caches
   */
  public static clearCache(type?: 'texture' | 'context' | 'geometry'): void {
    if (!type || type === 'texture') {
      this.textureCache.forEach(texture => texture.destroy());
      this.textureCache.clear();
    }
    if (!type || type === 'context') {
      this.contextCache.forEach(context => context.destroy());
      this.contextCache.clear();
    }
    if (!type || type === 'geometry') {
      this.geometryCache.forEach(geometry => geometry.destroy());
      this.geometryCache.clear();
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  public static getCacheStats(): {
    textures: number;
    contexts: number;
    geometries: number;
    estimatedMemory: number;
  } {
    return {
      textures: this.textureCache.size,
      contexts: this.contextCache.size,
      geometries: this.geometryCache.size,
      estimatedMemory: this.estimateMemoryUsage()
    };
  }

  private static estimateMemoryUsage(): number {
    let memory = 0;
    
    // Estimate texture memory (rough calculation)
    this.textureCache.forEach(texture => {
      memory += texture.width * texture.height * 4; // 4 bytes per pixel
    });
    
    // Add estimated overhead
    memory += this.contextCache.size * 1024; // 1KB per context estimate
    memory += this.geometryCache.size * 512; // 512B per geometry estimate
    
    return memory;
  }
}
