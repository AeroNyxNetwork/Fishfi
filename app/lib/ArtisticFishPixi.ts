/**
 * ArtisticFishPixi.ts
 * 
 * Advanced pixel art fish generation system for PIXI.js v8
 * Creates NFT-worthy, collectible fish with sophisticated visual effects
 * 
 * @version 1.0.0
 * @requires pixi.js ^8.0.0
 * @path app/lib/ArtisticFishPixi.ts
 */

import * as PIXI from 'pixi.js';

/**
 * Fish DNA structure defining all genetic traits
 */
export interface FishDNA {
  id: string;
  species: string;
  bodyShape: string;
  pattern: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow?: string;
    shimmer?: string;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'cosmic';
  traits: string[];
  mutations: string[];
  genes: {
    size: number;
    speed: number;
    aggression: number;
    intelligence: number;
  };
}

/**
 * Fish template configuration
 */
export interface FishTemplate {
  name: string;
  displayName: string;
  description: string;
  bodyShape: string;
  baseColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: {
    bodyRatio: { w: number; h: number };
    headCurve: string;
    tailType: string;
    finStyle: string;
    special?: string[];
  };
}

/**
 * Main artistic fish class for PIXI.js v8
 * Handles all rendering and animation of individual fish
 */
export class ArtisticFishPixi extends PIXI.Container {
  public dna: FishDNA;
  private pixelSize: number = 4;
  private fishSprite: PIXI.Sprite;
  private glowSprite?: PIXI.Sprite;
  private particleContainer?: PIXI.Container;
  private shaderFilter?: PIXI.Filter;
  
  // Animation properties
  private animationTime: number = 0;
  private swimOffset: number = Math.random() * Math.PI * 2;
  
  // Movement properties
  public velocity: PIXI.Point;
  private targetVelocity: PIXI.Point;
  private acceleration: number = 0.05;

  constructor(dna: FishDNA, app: PIXI.Application) {
    super();
    
    this.dna = dna;
    
    // Initialize movement
    const speed = dna.genes.speed * (0.5 + Math.random() * 0.5);
    const angle = Math.random() * Math.PI * 2;
    this.velocity = new PIXI.Point(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
    this.targetVelocity = this.velocity.clone();
    
    // Create fish sprite
    this.fishSprite = this.createFishSprite(app.renderer);
    this.addChild(this.fishSprite);
    
    // Add special effects based on rarity
    this.addSpecialEffects(app);
    
    // Make interactive
    this.eventMode = 'static';
    this.cursor = 'pointer';
    
    // Add hover effects
    this.on('pointerover', this.onHover.bind(this));
    this.on('pointerout', this.onHoverEnd.bind(this));
  }

  /**
   * Creates the main fish sprite using canvas rendering
   */
  private createFishSprite(renderer: PIXI.Renderer): PIXI.Sprite {
    // Determine size based on body shape
    const size = this.getFishSize();
    const canvas = this.generateFishCanvas(size.w, size.h);
    
    // Convert canvas to PIXI texture
    const texture = PIXI.Texture.from(canvas);
    const sprite = new PIXI.Sprite(texture);
    
    // Set anchor to center
    sprite.anchor.set(0.5);
    
    // Apply pixel-perfect scaling
    sprite.scale.set(this.pixelSize);
    
    return sprite;
  }

  /**
   * Generates the fish artwork on a canvas
   */
  private generateFishCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Disable smoothing for pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Generate body shape
    const shape = this.generateBodyShape(width, height);
    
    // Layer 1: Base body
    this.drawBody(ctx, shape, width, height);
    
    // Layer 2: Pattern
    this.drawPattern(ctx, shape, width, height);
    
    // Layer 3: Features (fins, etc)
    this.drawFeatures(ctx, shape, width, height);
    
    // Layer 4: Details (eyes, highlights)
    this.drawDetails(ctx, shape, width, height);
    
    // Layer 5: Special effects for rare fish
    if (this.dna.rarity !== 'common') {
      this.drawRarityEffects(ctx, shape, width, height);
    }
    
    return canvas;
  }

  /**
   * Generates the body shape matrix
   */
  private generateBodyShape(w: number, h: number): number[][] {
    const shape: number[][] = Array(h).fill(null).map(() => Array(w).fill(0));
    
    switch(this.dna.bodyShape) {
      case 'round':
        this.generateRoundShape(shape, w, h);
        break;
      case 'streamlined':
        this.generateStreamlinedShape(shape, w, h);
        break;
      case 'diamond':
        this.generateDiamondShape(shape, w, h);
        break;
      case 'massive':
        this.generateMassiveShape(shape, w, h);
        break;
      case 'serpentine':
        this.generateSerpentineShape(shape, w, h);
        break;
      default:
        this.generateRoundShape(shape, w, h);
    }
    
    return shape;
  }

  /**
   * Shape generation methods
   */
  private generateRoundShape(shape: number[][], w: number, h: number): void {
    const cx = w * 0.6;
    const cy = h * 0.5;
    const rx = w * 0.35;
    const ry = h * 0.4;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        const dist = dx * dx + dy * dy;
        
        if (dist <= 1) {
          // Create depth gradient: 3=center, 2=middle, 1=edge
          shape[y][x] = dist < 0.3 ? 3 : dist < 0.7 ? 2 : 1;
        }
        
        // Add tail
        if (x < cx - rx) {
          const tailDist = (cx - rx - x) / (w * 0.3);
          if (tailDist < 1) {
            const tailY1 = cy - ry * 0.5 - tailDist * h * 0.2;
            const tailY2 = cy + ry * 0.5 + tailDist * h * 0.2;
            if (Math.abs(y - tailY1) < 2 || Math.abs(y - tailY2) < 2) {
              shape[y][x] = 4; // Tail marker
            }
          }
        }
      }
    }
  }

  private generateStreamlinedShape(shape: number[][], w: number, h: number): void {
    const cy = h * 0.5;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = x / w;
        let bodyHeight: number;
        
        if (t < 0.2) {
          bodyHeight = h * 0.15 * (t / 0.2) ** 2;
        } else if (t < 0.6) {
          bodyHeight = h * 0.15 + h * 0.25 * ((t - 0.2) / 0.4);
        } else if (t < 0.85) {
          bodyHeight = h * 0.4 * (1 - (t - 0.6) / 0.25);
        } else {
          bodyHeight = h * 0.1;
        }
        
        const yDist = Math.abs(y - cy);
        if (yDist <= bodyHeight) {
          const depth = 1 - (yDist / bodyHeight);
          shape[y][x] = depth > 0.7 ? 3 : depth > 0.3 ? 2 : 1;
        }
        
        // Crescent tail
        if (t > 0.85) {
          const tailT = (t - 0.85) / 0.15;
          const tailSpread = h * 0.3 * Math.sin(tailT * Math.PI);
          if (yDist > bodyHeight && yDist < bodyHeight + tailSpread) {
            shape[y][x] = 4;
          }
        }
      }
    }
  }

  private generateDiamondShape(shape: number[][], w: number, h: number): void {
    const cx = w * 0.5;
    const cy = h * 0.5;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cy);
        const factor = dx / (w * 0.4) + dy / (h * 0.45);
        
        if (factor <= 1) {
          shape[y][x] = factor < 0.3 ? 3 : factor < 0.7 ? 2 : 1;
        }
      }
    }
  }

  private generateMassiveShape(shape: number[][], w: number, h: number): void {
    const cy = h * 0.5;
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = x / w;
        let bodyHeight: number;
        
        if (t < 0.25) {
          bodyHeight = h * 0.35 * Math.sqrt(t / 0.25);
        } else if (t < 0.7) {
          bodyHeight = h * 0.35 + h * 0.1 * Math.sin((t - 0.25) / 0.45 * Math.PI);
        } else {
          bodyHeight = h * 0.45 * (1 - (t - 0.7) / 0.3);
        }
        
        const yDist = Math.abs(y - cy);
        if (yDist <= bodyHeight) {
          const depth = 1 - (yDist / bodyHeight);
          shape[y][x] = depth > 0.8 ? 3 : depth > 0.4 ? 2 : 1;
        }
      }
    }
  }

  private generateSerpentineShape(shape: number[][], w: number, h: number): void {
    const amplitude = h * 0.3;
    const frequency = 2.5;
    
    for (let x = 0; x < w; x++) {
      const t = x / w;
      const cy = h * 0.5 + amplitude * Math.sin(t * Math.PI * frequency);
      const thickness = h * 0.15 * (1 - t * 0.5);
      
      for (let y = 0; y < h; y++) {
        const yDist = Math.abs(y - cy);
        if (yDist <= thickness) {
          const depth = 1 - (yDist / thickness);
          shape[y][x] = depth > 0.6 ? 3 : depth > 0.3 ? 2 : 1;
        }
      }
    }
  }

  /**
   * Drawing methods
   */
  private drawBody(ctx: CanvasRenderingContext2D, shape: number[][], w: number, h: number): void {
    const colors = this.dna.colors;
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const value = shape[y][x];
        if (value > 0 && value <= 3) {
          // Apply depth-based coloring
          let color = colors.primary;
          if (value === 3) {
            color = this.lightenColor(color, 20);
          } else if (value === 1) {
            color = this.darkenColor(color, 20);
          }
          
          // Apply mutations
          if (this.dna.mutations.includes('iridescent')) {
            const hueShift = (x + y) * 10;
            color = this.shiftHue(color, hueShift);
          }
          
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
          
          // Add shimmer effect
          if (this.dna.mutations.includes('metallic')) {
            if ((x + y) % 3 === 0) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
              ctx.fillRect(x, y, 1, 1);
            }
          }
        } else if (value === 4) {
          // Tail
          ctx.fillStyle = colors.secondary;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  private drawPattern(ctx: CanvasRenderingContext2D, shape: number[][], w: number, h: number): void {
    const pattern = this.dna.pattern;
    const colors = this.dna.colors;
    
    ctx.fillStyle = colors.secondary;
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (shape[y][x] > 0 && shape[y][x] <= 3) {
          let drawPixel = false;
          
          switch(pattern) {
            case 'stripes':
              drawPixel = x % 4 < 2;
              break;
            case 'dots':
              drawPixel = (x + y) % 3 === 0 && x % 2 === 0;
              break;
            case 'scales':
              drawPixel = (x % 3 !== 1) && (y % 3 === 1);
              break;
            case 'waves':
              drawPixel = Math.sin(x * 0.5 + y * 0.2) > 0;
              break;
            case 'circuits':
              drawPixel = (x % 4 === 0 || y % 4 === 0) && (x + y) % 2 === 0;
              break;
            case 'stars':
              drawPixel = (x * y) % 7 === 0;
              break;
            case 'fractals':
              const fx = x - w/2;
              const fy = y - h/2;
              drawPixel = (fx * fx + fy * fy) % 5 < 2;
              break;
          }
          
          if (drawPixel) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = colors.secondary;
            ctx.fillRect(x, y, 1, 1);
            ctx.globalAlpha = 1;
          }
        }
      }
    }
  }

  private drawFeatures(ctx: CanvasRenderingContext2D, shape: number[][], w: number, h: number): void {
    const colors = this.dna.colors;
    
    // Draw fins based on body shape
    ctx.fillStyle = colors.accent;
    
    // Simple fin representation
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (shape[y][x] > 0) {
          // Top fin
          if (y > 2 && shape[y-2][x] === 0 && Math.random() > 0.7) {
            ctx.fillRect(x, y-2, 1, 2);
          }
          // Bottom fin
          if (y < h-2 && shape[y+2][x] === 0 && Math.random() > 0.7) {
            ctx.fillRect(x, y+1, 1, 2);
          }
        }
      }
    }
  }

  private drawDetails(ctx: CanvasRenderingContext2D, shape: number[][], w: number, h: number): void {
    // Find eye position
    let eyeX = 0, eyeY = 0;
    let found = false;
    
    for (let y = h * 0.3; y < h * 0.7 && !found; y++) {
      for (let x = w * 0.6; x < w * 0.8 && !found; x++) {
        if (shape[Math.floor(y)][Math.floor(x)] > 0) {
          eyeX = Math.floor(x);
          eyeY = Math.floor(y);
          found = true;
        }
      }
    }
    
    if (found) {
      // Eye white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(eyeX, eyeY, 2, 2);
      
      // Pupil
      ctx.fillStyle = '#000000';
      ctx.fillRect(eyeX + 1, eyeY, 1, 1);
      
      // Eye glow for special fish
      if (this.dna.traits.includes('glowing_eyes')) {
        ctx.fillStyle = this.dna.colors.glow || '#00ffff';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(eyeX - 1, eyeY - 1, 4, 4);
        ctx.globalAlpha = 1;
      }
    }
  }

  private drawRarityEffects(ctx: CanvasRenderingContext2D, shape: number[][], w: number, h: number): void {
    // Add special visual effects based on rarity
    if (this.dna.mutations.includes('holographic')) {
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, 'rgba(255, 0, 255, 0.2)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0.2)');
      
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    
    if (this.dna.traits.includes('stardustTrail')) {
      // Add sparkles
      for (let i = 0; i < 5; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        if (shape[Math.floor(sy)][Math.floor(sx)] > 0) {
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.8;
          ctx.fillRect(sx, sy, 1, 1);
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  /**
   * Adds special effects based on fish rarity and traits
   */
  private addSpecialEffects(app: PIXI.Application): void {
    // Glow effect for rare+ fish
    if (['rare', 'epic', 'legendary', 'mythic', 'cosmic'].includes(this.dna.rarity)) {
      this.addGlowEffect();
    }
    
    // Particle effects for legendary+ fish
    if (['legendary', 'mythic', 'cosmic'].includes(this.dna.rarity)) {
      this.addParticleEffects();
    }
    
    // Shader effects for mythic+ fish
    if (['mythic', 'cosmic'].includes(this.dna.rarity)) {
      this.addShaderEffects(app);
    }
  }

  /**
   * Adds glow effect around the fish
   */
  private addGlowEffect(): void {
    const glowFilter = new PIXI.BlurFilter({
      strength: 8,
      quality: 4,
      resolution: 2,
      kernelSize: 5
    });
    
    // Create a duplicate sprite for the glow
    this.glowSprite = new PIXI.Sprite(this.fishSprite.texture);
    this.glowSprite.anchor.set(0.5);
    this.glowSprite.scale.copyFrom(this.fishSprite.scale);
    this.glowSprite.tint = PIXI.Color.shared.setValue(this.dna.colors.glow || this.dna.colors.primary).toNumber();
    this.glowSprite.filters = [glowFilter];
    this.glowSprite.alpha = 0.6;
    
    // Add behind the main sprite
    this.addChildAt(this.glowSprite, 0);
  }

  /**
   * Adds particle effects
   */
  private addParticleEffects(): void {
    this.particleContainer = new PIXI.Container();
    this.addChild(this.particleContainer);
    
    // Create particles
    const particleCount = this.dna.rarity === 'cosmic' ? 20 : 10;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, 1 + Math.random() * 2);
      particle.fill({ color: this.dna.colors.glow || 0xffffff, alpha: 0.6 });
      
      particle.x = (Math.random() - 0.5) * 100;
      particle.y = (Math.random() - 0.5) * 100;
      
      (particle as any).velocity = {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5
      };
      
      this.particleContainer.addChild(particle);
    }
  }

  /**
   * Adds advanced shader effects
   */
  private addShaderEffects(app: PIXI.Application): void {
    // Chromatic aberration for cosmic fish
    if (this.dna.rarity === 'cosmic') {
      const chromaticFilter = new PIXI.ColorMatrixFilter();
      chromaticFilter.matrix = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0,
      ];
      
      this.fishSprite.filters = [chromaticFilter];
    }
  }

  /**
   * Update method for animation
   */
  public update(deltaTime: number): void {
    this.animationTime += deltaTime * 0.01;
    
    // Smooth movement
    this.velocity.x += (this.targetVelocity.x - this.velocity.x) * this.acceleration;
    this.velocity.y += (this.targetVelocity.y - this.velocity.y) * this.acceleration;
    
    // Update position
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    // Rotate to face movement direction
    const targetRotation = Math.atan2(this.velocity.y, this.velocity.x);
    const currentRotation = this.rotation;
    let rotationDiff = targetRotation - currentRotation;
    
    // Normalize rotation difference
    if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
    if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
    
    this.rotation += rotationDiff * 0.1;
    
    // Animate particles
    if (this.particleContainer) {
      this.particleContainer.children.forEach((particle: any) => {
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.alpha = 0.3 + Math.sin(this.animationTime + particle.x) * 0.3;
        
        // Reset particles that drift too far
        if (Math.abs(particle.x) > 150 || Math.abs(particle.y) > 150) {
          particle.x = (Math.random() - 0.5) * 50;
          particle.y = (Math.random() - 0.5) * 50;
        }
      });
    }
    
    // Pulsing glow effect
    if (this.glowSprite) {
      this.glowSprite.alpha = 0.4 + Math.sin(this.animationTime * 2) * 0.2;
    }
    
    // Swimming animation
    const swimAmount = Math.sin(this.animationTime * 3 + this.swimOffset) * 0.02;
    this.scale.y = this.scale.x * (1 + swimAmount);
  }

  /**
   * Changes swimming direction
   */
  public changeDirection(newAngle?: number): void {
    const angle = newAngle ?? Math.random() * Math.PI * 2;
    const speed = this.dna.genes.speed * (0.5 + Math.random() * 0.5);
    
    this.targetVelocity.x = Math.cos(angle) * speed;
    this.targetVelocity.y = Math.sin(angle) * speed;
  }

  /**
   * Hover effect
   */
  private onHover(): void {
    this.scale.x *= 1.1;
    this.scale.y *= 1.1;
    
    if (this.glowSprite) {
      this.glowSprite.alpha = 1;
    }
  }

  private onHoverEnd(): void {
    this.scale.x /= 1.1;
    this.scale.y /= 1.1;
    
    if (this.glowSprite) {
      this.glowSprite.alpha = 0.6;
    }
  }

  /**
   * Gets fish size based on body shape
   */
  private getFishSize(): { w: number; h: number } {
    const sizes: Record<string, { w: number; h: number }> = {
      'round': { w: 24, h: 20 },
      'streamlined': { w: 32, h: 16 },
      'diamond': { w: 20, h: 24 },
      'massive': { w: 40, h: 24 },
      'serpentine': { w: 44, h: 16 }
    };
    return sizes[this.dna.bodyShape] || { w: 24, h: 20 };
  }

  /**
   * Color utility functions
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => {
      const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }

  private lightenColor(hex: string, percent: number): string {
    const { r, g, b } = this.hexToRgb(hex);
    return this.rgbToHex(
      r + (255 - r) * percent / 100,
      g + (255 - g) * percent / 100,
      b + (255 - b) * percent / 100
    );
  }

  private darkenColor(hex: string, percent: number): string {
    const { r, g, b } = this.hexToRgb(hex);
    return this.rgbToHex(
      r * (1 - percent / 100),
      g * (1 - percent / 100),
      b * (1 - percent / 100)
    );
  }

  private shiftHue(hex: string, shift: number): string {
    const { r, g, b } = this.hexToRgb(hex);
    
    // Convert to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
        case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
        case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
      }
    }
    
    // Shift hue
    h = (h * 360 + shift) % 360 / 360;
    
    // Convert back to RGB
    let newR, newG, newB;
    
    if (s === 0) {
      newR = newG = newB = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      newR = hue2rgb(p, q, h + 1/3);
      newG = hue2rgb(p, q, h);
      newB = hue2rgb(p, q, h - 1/3);
    }
    
    return this.rgbToHex(newR * 255, newG * 255, newB * 255);
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    super.destroy({ children: true });
  }
}
