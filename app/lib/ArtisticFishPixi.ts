/**
 * ArtisticFishPixi.ts
 * 
 * Premium artistic fish generation system for PIXI.js v8
 * Enhanced with performance optimizations and sophisticated visual effects
 * 
 * @version 3.1.0
 * @requires pixi.js ^8.0.0
 * @path app/lib/ArtisticFishPixi.ts
 */

import * as PIXI from 'pixi.js';
import { GeometryCache } from './GeometryCache';

/**
 * Enhanced Fish DNA structure with new artistic properties
 */
export interface FishDNA {
  id: string;
  species: string;
  bodyShape: string;
  pattern: string;
  surfaceType?: 'matte' | 'procedural_noise' | 'glitch_sort' | 'liquid_metal';
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
  // New artistic properties
  artStyle?: 'minimalist' | 'baroque' | 'abstract' | 'organic';
  dynamicColor?: boolean;
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
    glow?: string;
    shimmer?: string;
  };
  features: {
    bodyRatio: { w: number; h: number };
    headCurve: string;
    tailType: string;
    finStyle: string;
    special?: string[];
  };
}

// Extended body shapes for more variety
export type BodyShapeType = 
  | 'round'          
  | 'streamlined'    
  | 'diamond'        
  | 'massive'        
  | 'serpentine'     
  | 'flat'           
  | 'elongated'      
  | 'triangular'     
  | 'crescent'       
  | 'oval'           
  | 'compressed'     
  | 'cylindrical'    
  | 'asymmetrical'   
  | 'bulbous'        
  | 'spade'
  | 'architectural'  // New artistic shapes
  | 'deconstructed'
  | 'tessellated'
  | 'calligraphic';

/**
 * Premium artistic fish class with enhanced performance
 */
export class ArtisticFishPixi extends PIXI.Container {
  public dna: FishDNA;
  private baseSize: number = 120;
  private fishContainer: PIXI.Container;
  private bodySprite!: PIXI.Sprite;
  private patternSprite?: PIXI.Sprite;
  private overlaySprite?: PIXI.Sprite;
  private glowContainer?: PIXI.Container;
  private particleContainer?: PIXI.Container; // Changed to ParticleContainer
  
  private shaderTime: number = 0;
  private colorMatrixFilter?: PIXI.ColorMatrixFilter;
  private displacementFilter?: PIXI.DisplacementFilter;
  private blurFilter?: PIXI.BlurFilter;
  private customShader?: PIXI.Filter;
  
  // Animation properties
  private breathingSpeed: number = 0.002;
  private floatSpeed: number = 0.001;
  private shimmerSpeed: number = 0.003;
  
  // Performance flags
  private useCache: boolean = true;
  private isStatic: boolean = false;
  private isCached: boolean = false;
  
  // Reference to app for renderer access
  private app: PIXI.Application;
  
  // Store particles separately for v8 ParticleContainer
  private particles: PIXI.Sprite[] = [];
  
  constructor(dna: FishDNA, app: PIXI.Application) {
    super();
    
    this.dna = dna;
    this.app = app;
    
    // Create container hierarchy
    this.fishContainer = new PIXI.Container();
    this.addChild(this.fishContainer);
    
    // Generate the fish artwork with caching
    this.createFish(app);
    
    // Apply rarity-based effects
    this.applyRarityEffects(app);
    
    // Set initial scale based on genes
    const scaleFactor = 0.3 + (this.dna.genes.size * 0.4);
    this.scale.set(scaleFactor);
    
    // Make interactive
    this.eventMode = 'static';
    this.cursor = 'pointer';
    
    // Add sophisticated hover effects
    this.on('pointerover', this.onHover.bind(this));
    this.on('pointerout', this.onHoverEnd.bind(this));
  }

  /**
   * Creates the main fish artwork using advanced rendering with caching
   */
  private createFish(app: PIXI.Application): void {
    // Generate high-quality fish texture with caching
    const fishTexture = this.generateFishArtwork(app.renderer);
    
    // Create main body sprite
    this.bodySprite = new PIXI.Sprite(fishTexture);
    this.bodySprite.anchor.set(0.5);
    this.fishContainer.addChild(this.bodySprite);
    
    // Add pattern overlay if needed
    if (this.dna.pattern !== 'solid') {
      this.addPatternOverlay(app.renderer);
    }
    
    // Add surface treatment
    if (this.dna.surfaceType) {
      this.applySurfaceTreatment(app);
    }
    
    // Add special features based on DNA
    this.addSpecialFeatures(app);
    
    // Apply color mutations
    this.applyColorMutations();
    
    // Enable caching for static complex fish
    if (this.dna.rarity === 'legendary' || this.dna.rarity === 'mythic' || this.dna.rarity === 'cosmic') {
      // Apply after initial render
      setTimeout(() => {
        if (this.isStatic) {
          this.enableCaching();
        }
      }, 100);
    }
  }

  /**
   * Enables container caching for performance
   */
  private enableCaching(): void {
    if (!this.isCached && this.fishContainer) {
      // In PIXI v8, cacheAsTexture only accepts resolution option
      this.fishContainer.cacheAsTexture({
        resolution: 2
      });
      this.isCached = true;
    }
  }

  /**
   * Disables container caching
   */
  private disableCaching(): void {
    if (this.isCached && this.fishContainer) {
      this.fishContainer.cacheAsTexture(false);
      this.isCached = false;
    }
  }

  /**
   * Generates the high-quality fish artwork with caching
   */
  private generateFishArtwork(renderer: PIXI.Renderer): PIXI.Texture {
    // Create cache key
    const cacheKey = `fish-body-${this.dna.species}-${this.dna.bodyShape}-${this.dna.colors.primary}`;
    
    if (this.useCache) {
      return GeometryCache.getBakedTexture(renderer, cacheKey, (graphics) => {
        this.drawFishBody(graphics);
      });
    }
    
    // Fallback to direct generation
    const graphics = new PIXI.Graphics();
    this.drawFishBody(graphics);
    
    const bounds = graphics.getLocalBounds();
    const texture = renderer.generateTexture({
      target: graphics,
      resolution: 2,
      frame: new PIXI.Rectangle(
        bounds.x - 20,
        bounds.y - 20,
        bounds.width + 40,
        bounds.height + 40
      )
    });
    
    graphics.destroy();
    return texture;
  }

  /**
   * Draws the fish body based on shape
   */
  private drawFishBody(graphics: PIXI.Graphics): void {
    const size = this.baseSize;
    const primaryColor = PIXI.Color.shared.setValue(this.dna.colors.primary).toNumber();
    const secondaryColor = PIXI.Color.shared.setValue(this.dna.colors.secondary).toNumber();
    const accentColor = PIXI.Color.shared.setValue(this.dna.colors.accent).toNumber();
    
    // Draw based on body shape
    switch (this.dna.bodyShape) {
      case 'round':
        this.drawRoundFish(graphics, size, primaryColor, secondaryColor);
        break;
      case 'streamlined':
        this.drawStreamlinedFish(graphics, size, primaryColor, secondaryColor);
        break;
      case 'diamond':
        this.drawDiamondFish(graphics, size, primaryColor, secondaryColor);
        break;
      case 'massive':
        this.drawMassiveFish(graphics, size, primaryColor, secondaryColor);
        break;
      case 'serpentine':
        this.drawSerpentineFish(graphics, size, primaryColor, secondaryColor);
        break;
      case 'architectural':
        this.drawArchitecturalFish(graphics, size, primaryColor, secondaryColor);
        break;
      case 'deconstructed':
        this.drawDeconstructedFish(graphics, size, primaryColor, secondaryColor);
        break;
      case 'tessellated':
        this.drawTessellatedFish(graphics, size, primaryColor, secondaryColor);
        break;
      case 'calligraphic':
        this.drawCalligraphicFish(graphics, size, primaryColor, secondaryColor);
        break;
      default:
        this.drawRoundFish(graphics, size, primaryColor, secondaryColor);
    }
    
    // Add fins with accent color
    this.drawFins(graphics, size, accentColor);
    
    // Add details
    this.drawDetails(graphics, size);
  }

  /**
   * New artistic fish shapes
   */
  private drawArchitecturalFish(graphics: PIXI.Graphics, size: number, primary: number, secondary: number): void {
    // Zaha Hadid inspired flowing curves
    graphics.moveTo(size * 0.5, 0);
    graphics.bezierCurveTo(
      size * 0.4, -size * 0.4,
      -size * 0.2, -size * 0.3,
      -size * 0.5, -size * 0.1
    );
    graphics.bezierCurveTo(
      -size * 0.6, 0,
      -size * 0.6, size * 0.1,
      -size * 0.5, size * 0.2
    );
    graphics.bezierCurveTo(
      -size * 0.2, size * 0.3,
      size * 0.4, size * 0.4,
      size * 0.5, 0
    );
    graphics.fill({ color: primary });
    
    // Inner structure
    graphics.moveTo(size * 0.3, 0);
    graphics.bezierCurveTo(
      size * 0.2, -size * 0.2,
      -size * 0.1, -size * 0.15,
      -size * 0.3, 0
    );
    graphics.bezierCurveTo(
      -size * 0.1, size * 0.15,
      size * 0.2, size * 0.2,
      size * 0.3, 0
    );
    graphics.fill({ color: secondary, alpha: 0.6 });
  }

  private drawDeconstructedFish(graphics: PIXI.Graphics, size: number, primary: number, secondary: number): void {
    // Floating geometric fragments
    const fragments = [
      { x: 0, y: 0, w: size * 0.4, h: size * 0.3, rot: 0 },
      { x: size * 0.3, y: -size * 0.1, w: size * 0.3, h: size * 0.2, rot: 0.2 },
      { x: -size * 0.3, y: size * 0.1, w: size * 0.3, h: size * 0.2, rot: -0.2 },
      { x: -size * 0.5, y: 0, w: size * 0.2, h: size * 0.15, rot: 0.3 }
    ];
    
    fragments.forEach((frag, i) => {
      graphics.save();
      graphics.translateTransform(frag.x, frag.y);
      
      // Use transform() with rotation matrix instead of rotateTransform()
      const cos = Math.cos(frag.rot);
      const sin = Math.sin(frag.rot);
      graphics.transform(cos, sin, -sin, cos, 0, 0);
      
      graphics.rect(-frag.w/2, -frag.h/2, frag.w, frag.h);
      graphics.fill({ color: i % 2 === 0 ? primary : secondary });
      graphics.restore();
    });
  }

  private drawTessellatedFish(graphics: PIXI.Graphics, size: number, primary: number, secondary: number): void {
    // Hexagonal tessellation
    const hexSize = size * 0.08;
    const rows = 8;
    const cols = 10;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = -size * 0.4 + col * hexSize * 1.5;
        const y = -size * 0.3 + row * hexSize * 1.73 + (col % 2) * hexSize * 0.87;
        
        // Check if within fish bounds
        const dist = Math.sqrt(x * x + (y * y * 1.5));
        if (dist < size * 0.5) {
          this.drawHexagon(graphics, x, y, hexSize * 0.5);
          graphics.fill({ 
            color: (row + col) % 2 === 0 ? primary : secondary,
            alpha: 1 - dist / (size * 0.5) * 0.3
          });
        }
      }
    }
  }

  private drawCalligraphicFish(graphics: PIXI.Graphics, size: number, primary: number, secondary: number): void {
    // Single brushstroke style
    graphics.moveTo(size * 0.5, 0);
    graphics.bezierCurveTo(
      size * 0.3, -size * 0.1,
      size * 0.1, -size * 0.15,
      -size * 0.1, -size * 0.1
    );
    graphics.bezierCurveTo(
      -size * 0.3, -size * 0.05,
      -size * 0.5, 0,
      -size * 0.6, size * 0.05
    );
    graphics.bezierCurveTo(
      -size * 0.5, size * 0.1,
      -size * 0.3, size * 0.15,
      -size * 0.1, size * 0.1
    );
    graphics.bezierCurveTo(
      size * 0.1, size * 0.05,
      size * 0.3, 0,
      size * 0.5, 0
    );
    graphics.stroke({ color: primary, width: size * 0.15, cap: 'round', join: 'round' });
    graphics.fill({ color: primary, alpha: 0.8 });
  }

  /**
   * Existing fish shapes (keeping them for compatibility)
   */
  private drawRoundFish(graphics: PIXI.Graphics, size: number, primary: number, secondary: number): void {
    // Main body with gradient effect
    graphics.ellipse(0, 0, size * 0.6, size * 0.4);
    graphics.fill({ color: primary, alpha: 1 });
    
    // Secondary color belly
    graphics.ellipse(0, size * 0.15, size * 0.5, size * 0.25);
    graphics.fill({ color: secondary, alpha: 0.7 });
    
    // Tail
    graphics.moveTo(-size * 0.5, 0);
    graphics.bezierCurveTo(
      -size * 0.8, -size * 0.3,
      -size * 0.9, -size * 0.2,
      -size * 0.85, 0
    );
    graphics.bezierCurveTo(
      -size * 0.9, size * 0.2,
      -size * 0.8, size * 0.3,
      -size * 0.5, 0
    );
    graphics.fill({ color: primary });
  }

  private drawStreamlinedFish(graphics: PIXI.Graphics, size: number, primary: number, secondary: number): void {
    // Sleek body
    graphics.moveTo(size * 0.5, 0);
    graphics.bezierCurveTo(
      size * 0.3, -size * 0.2,
      -size * 0.3, -size * 0.15,
      -size * 0.6, 0
    );
    graphics.bezierCurveTo(
      -size * 0.3, size * 0.15,
      size * 0.3, size * 0.2,
      size * 0.5, 0
    );
    graphics.fill({ color: primary });
    
    // Streamlined tail
    graphics.moveTo(-size * 0.5, 0);
    graphics.lineTo(-size * 0.8, -size * 0.2);
    graphics.lineTo(-size * 0.75, 0);
    graphics.lineTo(-size * 0.8, size * 0.2);
    graphics.closePath();
    graphics.fill({ color: secondary });
  }

  private drawDiamondFish(graphics: PIXI.Graphics, size: number, primary: number, secondary: number): void {
    // Diamond body
    graphics.moveTo(size * 0.4, 0);
    graphics.lineTo(0, -size * 0.35);
    graphics.lineTo(-size * 0.4, 0);
    graphics.lineTo(0, size * 0.35);
    graphics.closePath();
    graphics.fill({ color: primary });
    
    // Inner diamond
    graphics.moveTo(size * 0.25, 0);
    graphics.lineTo(0, -size * 0.2);
    graphics.lineTo(-size * 0.25, 0);
    graphics.lineTo(0, size * 0.2);
    graphics.closePath();
    graphics.fill({ color: secondary, alpha: 0.6 });
  }

  private drawMassiveFish(graphics: PIXI.Graphics, size: number, primary: number, secondary: number): void {
    // Bulky body
    graphics.ellipse(0, 0, size * 0.7, size * 0.5);
    graphics.fill({ color: primary });
    
    // Head bulge
    graphics.circle(size * 0.4, -size * 0.1, size * 0.3);
    graphics.fill({ color: primary });
    
    // Belly
    graphics.ellipse(0, size * 0.2, size * 0.6, size * 0.3);
    graphics.fill({ color: secondary, alpha: 0.5 });
  }

  private drawSerpentineFish(graphics: PIXI.Graphics, size: number, primary: number, secondary: number): void {
    // Wavy body
    const segments = 5;
    const segmentLength = size * 1.5 / segments;
    
    for (let i = 0; i < segments; i++) {
      const x = -size * 0.75 + i * segmentLength;
      const y = Math.sin(i * 0.8) * size * 0.2;
      const radius = size * 0.2 * (1 - i / segments * 0.5);
      
      graphics.circle(x, y, radius);
      graphics.fill({ color: i % 2 === 0 ? primary : secondary });
    }
  }

  /**
   * Draws fins with sophisticated shapes
   */
  private drawFins(graphics: PIXI.Graphics, size: number, color: number): void {
    // Top dorsal fin
    graphics.moveTo(0, -size * 0.4);
    graphics.bezierCurveTo(
      -size * 0.1, -size * 0.6,
      size * 0.1, -size * 0.6,
      size * 0.2, -size * 0.4
    );
    graphics.fill({ color, alpha: 0.8 });
    
    // Bottom fins
    graphics.moveTo(-size * 0.1, size * 0.3);
    graphics.bezierCurveTo(
      -size * 0.15, size * 0.5,
      0, size * 0.5,
      size * 0.05, size * 0.3
    );
    graphics.fill({ color, alpha: 0.8 });
    
    // Side fins
    graphics.ellipse(size * 0.1, 0, size * 0.15, size * 0.08);
    graphics.fill({ color, alpha: 0.6 });
  }

  /**
   * Draws detailed features
   */
  private drawDetails(graphics: PIXI.Graphics, size: number): void {
    // Eye socket
    graphics.circle(size * 0.25, -size * 0.05, size * 0.08);
    graphics.fill({ color: 0xffffff });
    
    // Pupil
    graphics.circle(size * 0.27, -size * 0.05, size * 0.04);
    graphics.fill({ color: 0x000000 });
    
    // Eye highlight
    graphics.circle(size * 0.26, -size * 0.06, size * 0.02);
    graphics.fill({ color: 0xffffff });
    
    // Gills
    for (let i = 0; i < 3; i++) {
      const x = size * 0.1 - i * size * 0.05;
      graphics.moveTo(x, -size * 0.1);
      graphics.lineTo(x - size * 0.02, size * 0.1);
      graphics.stroke({ color: 0x000000, alpha: 0.3, width: 2 });
    }
  }

  /**
   * Adds pattern overlay with advanced blending and caching
   */
  private addPatternOverlay(renderer: PIXI.Renderer): void {
    const patternKey = `pattern-${this.dna.pattern}-${this.dna.species}`;
    
    const patternTexture = GeometryCache.getBakedTexture(renderer, patternKey, (graphics) => {
      this.drawPattern(graphics, this.dna.pattern);
    });
    
    this.patternSprite = new PIXI.Sprite(patternTexture);
    this.patternSprite.anchor.set(0.5);
    this.patternSprite.blendMode = 'multiply';
    this.patternSprite.alpha = 0.5;
    
    this.fishContainer.addChild(this.patternSprite);
  }

  /**
   * Unified pattern drawing method
   */
  private drawPattern(graphics: PIXI.Graphics, pattern: string): void {
    const size = this.baseSize;
    
    switch (pattern) {
      case 'stripes':
        this.drawStripesPattern(graphics, size);
        break;
      case 'dots':
        this.drawDotsPattern(graphics, size);
        break;
      case 'scales':
        this.drawScalesPattern(graphics, size);
        break;
      case 'waves':
        this.drawWavesPattern(graphics, size);
        break;
      case 'fractals':
        this.drawFractalPattern(graphics, size);
        break;
      case 'circuits':
        this.drawCircuitPattern(graphics, size);
        break;
      case 'organic':
        this.drawOrganicPattern(graphics, size);
        break;
      case 'geometric':
        this.drawGeometricPattern(graphics, size);
        break;
      case 'mystic':
        this.drawMysticPattern(graphics, size);
        break;
    }
  }

  /**
   * Pattern drawing methods
   */
  private drawStripesPattern(graphics: PIXI.Graphics, size: number): void {
    const stripeCount = 8;
    const stripeWidth = size * 2 / stripeCount;
    
    for (let i = 0; i < stripeCount; i++) {
      if (i % 2 === 0) {
        graphics.rect(
          -size + i * stripeWidth,
          -size,
          stripeWidth,
          size * 2
        );
        graphics.fill({ color: 0x000000, alpha: 0.3 });
      }
    }
  }

  private drawDotsPattern(graphics: PIXI.Graphics, size: number): void {
    const dotSize = size * 0.05;
    const spacing = size * 0.15;
    
    for (let x = -size; x < size; x += spacing) {
      for (let y = -size; y < size; y += spacing) {
        const offset = (Math.floor(y / spacing) % 2) * spacing * 0.5;
        graphics.circle(x + offset, y, dotSize);
        graphics.fill({ color: 0x000000, alpha: 0.2 });
      }
    }
  }

  private drawScalesPattern(graphics: PIXI.Graphics, size: number): void {
    const scaleSize = size * 0.1;
    const rows = Math.floor(size * 2 / scaleSize);
    
    for (let row = 0; row < rows; row++) {
      const y = -size + row * scaleSize;
      const offset = (row % 2) * scaleSize * 0.5;
      
      for (let x = -size; x < size; x += scaleSize) {
        graphics.moveTo(x + offset, y);
        graphics.arc(x + offset, y, scaleSize * 0.5, 0, Math.PI);
        graphics.stroke({ color: 0x000000, alpha: 0.2, width: 1 });
      }
    }
  }

  private drawWavesPattern(graphics: PIXI.Graphics, size: number): void {
    const waveCount = 6;
    
    for (let i = 0; i < waveCount; i++) {
      const y = -size + (i / waveCount) * size * 2;
      graphics.moveTo(-size, y);
      
      for (let x = -size; x <= size; x += 5) {
        const waveY = y + Math.sin(x * 0.05) * size * 0.05;
        graphics.lineTo(x, waveY);
      }
      
      graphics.stroke({ color: 0x000000, alpha: 0.2, width: 2 });
    }
  }

  private drawFractalPattern(graphics: PIXI.Graphics, size: number): void {
    // Simplified fractal-like pattern
    const drawBranch = (x: number, y: number, length: number, angle: number, depth: number) => {
      if (depth <= 0 || length < 2) return;
      
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      
      graphics.moveTo(x, y);
      graphics.lineTo(endX, endY);
      graphics.stroke({ color: 0x000000, alpha: 0.1 * depth, width: 1 });
      
      // Recursive branches
      drawBranch(endX, endY, length * 0.7, angle - 0.5, depth - 1);
      drawBranch(endX, endY, length * 0.7, angle + 0.5, depth - 1);
    };
    
    // Draw fractal branches
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      drawBranch(0, 0, size * 0.3, angle, 4);
    }
  }

  private drawCircuitPattern(graphics: PIXI.Graphics, size: number): void {
    const gridSize = size * 0.1;
    
    // Circuit paths
    for (let i = 0; i < 10; i++) {
      const startX = -size + Math.random() * size * 2;
      const startY = -size + Math.random() * size * 2;
      
      graphics.moveTo(startX, startY);
      
      // Random circuit path
      let x = startX;
      let y = startY;
      
      for (let j = 0; j < 5; j++) {
        const direction = Math.floor(Math.random() * 4);
        switch (direction) {
          case 0: x += gridSize; break;
          case 1: x -= gridSize; break;
          case 2: y += gridSize; break;
          case 3: y -= gridSize; break;
        }
        
        graphics.lineTo(x, y);
        
        // Add node
        if (Math.random() > 0.7) {
          graphics.circle(x, y, gridSize * 0.1);
          graphics.fill({ color: 0x000000, alpha: 0.3 });
        }
      }
      
      graphics.stroke({ color: 0x000000, alpha: 0.2, width: 1 });
    }
  }

  private drawOrganicPattern(graphics: PIXI.Graphics, size: number): void {
    // Organic flowing lines
    for (let i = 0; i < 5; i++) {
      const startX = -size + Math.random() * size * 2;
      const startY = -size + Math.random() * size * 2;
      
      graphics.moveTo(startX, startY);
      
      // Create flowing path
      for (let j = 0; j < 10; j++) {
        const t = j / 10;
        const x = startX + Math.sin(t * Math.PI * 2 + i) * size * 0.3;
        const y = startY + Math.cos(t * Math.PI * 2 + i) * size * 0.3;
        
        if (j === 0) {
          graphics.lineTo(x, y);
        } else {
          const prevT = (j - 1) / 10;
          const prevX = startX + Math.sin(prevT * Math.PI * 2 + i) * size * 0.3;
          const prevY = startY + Math.cos(prevT * Math.PI * 2 + i) * size * 0.3;
          const cpX = (prevX + x) / 2 + (Math.random() - 0.5) * size * 0.1;
          const cpY = (prevY + y) / 2 + (Math.random() - 0.5) * size * 0.1;
          graphics.quadraticCurveTo(cpX, cpY, x, y);
        }
      }
      
      graphics.stroke({ color: 0x000000, alpha: 0.15, width: 3 });
    }
  }

  private drawGeometricPattern(graphics: PIXI.Graphics, size: number): void {
    // Geometric shapes grid
    const shapes = ['triangle', 'square', 'hexagon'];
    const shapeSize = size * 0.1;
    
    for (let i = 0; i < 20; i++) {
      const x = -size + Math.random() * size * 2;
      const y = -size + Math.random() * size * 2;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      switch (shape) {
        case 'triangle':
          graphics.moveTo(x, y - shapeSize/2);
          graphics.lineTo(x - shapeSize/2, y + shapeSize/2);
          graphics.lineTo(x + shapeSize/2, y + shapeSize/2);
          graphics.closePath();
          break;
        case 'square':
          graphics.rect(x - shapeSize/2, y - shapeSize/2, shapeSize, shapeSize);
          break;
        case 'hexagon':
          this.drawHexagon(graphics, x, y, shapeSize/2);
          break;
      }
      
      graphics.fill({ color: 0x000000, alpha: 0.1 });
      graphics.stroke({ color: 0x000000, alpha: 0.2, width: 1 });
    }
  }

  private drawMysticPattern(graphics: PIXI.Graphics, size: number): void {
    // Mystical symbols
    const symbols = [
      // Circle with cross
      () => {
        graphics.circle(0, 0, size * 0.2);
        graphics.stroke({ color: 0x000000, alpha: 0.3, width: 2 });
        graphics.moveTo(-size * 0.2, 0);
        graphics.lineTo(size * 0.2, 0);
        graphics.moveTo(0, -size * 0.2);
        graphics.lineTo(0, size * 0.2);
        graphics.stroke({ color: 0x000000, alpha: 0.3, width: 1 });
      },
      // Star
      () => {
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * size * 0.15;
          const y = Math.sin(angle) * size * 0.15;
          graphics.moveTo(0, 0);
          graphics.lineTo(x, y);
        }
        graphics.stroke({ color: 0x000000, alpha: 0.3, width: 2 });
      },
      // Spiral
      () => {
        graphics.moveTo(0, 0);
        for (let i = 0; i < 50; i++) {
          const angle = i * 0.2;
          const radius = i * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (radius < size * 0.3) {
            graphics.lineTo(x, y);
          }
        }
        graphics.stroke({ color: 0x000000, alpha: 0.2, width: 1 });
      }
    ];
    
    // Draw random symbols
    for (let i = 0; i < 3; i++) {
      graphics.save();
      graphics.translateTransform(
        -size * 0.5 + Math.random() * size,
        -size * 0.5 + Math.random() * size
      );
      
      // Use transform() with rotation matrix instead of rotateTransform()
      const rotation = Math.random() * Math.PI * 2;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      graphics.transform(cos, sin, -sin, cos, 0, 0);
      
      symbols[Math.floor(Math.random() * symbols.length)]();
      graphics.restore();
    }
  }


  /**
   * Helper method to draw hexagon
   */
  private drawHexagon(graphics: PIXI.Graphics, x: number, y: number, size: number): void {
    const points: PIXI.Point[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      points.push(new PIXI.Point(
        x + Math.cos(angle) * size,
        y + Math.sin(angle) * size
      ));
    }
    
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
  }

  /**
   * Applies surface treatments for artistic enhancement
   */
  private applySurfaceTreatment(app: PIXI.Application): void {
    switch (this.dna.surfaceType) {
      case 'matte':
        // Simple matte finish - no additional effects needed
        break;
        
      case 'procedural_noise':
        this.applyProceduralNoise(app);
        break;
        
      case 'glitch_sort':
        this.applyGlitchSort();
        break;
        
      case 'liquid_metal':
        this.applyLiquidMetal();
        break;
    }
  }

  private applyProceduralNoise(app: PIXI.Application): void {
    // Create a custom noise filter
    const noiseFilter = new PIXI.NoiseFilter({
      noise: 0.1,
      seed: Math.random()
    });
    
    this.fishContainer.filters = [
      ...(this.fishContainer.filters || []),
      noiseFilter
    ];
  }

  private applyGlitchSort(): void {
    // Simplified glitch effect using color matrix
    const glitchFilter = new PIXI.ColorMatrixFilter();
    glitchFilter.matrix = [
      1, 0.1, 0, 0, 0,
      0, 1, 0.1, 0, 0,
      0.1, 0, 1, 0, 0,
      0, 0, 0, 1, 0
    ];
    
    this.fishContainer.filters = [
      ...(this.fishContainer.filters || []),
      glitchFilter
    ];
  }

  private applyLiquidMetal(): void {
    // Metallic sheen effect
    const metallicFilter = new PIXI.ColorMatrixFilter();
    metallicFilter.brightness(1.3, false);
    metallicFilter.contrast(1.5, false);
    
    this.fishContainer.filters = [
      ...(this.fishContainer.filters || []),
      metallicFilter
    ];
  }

  /**
   * Adds special features based on DNA traits
   */
  private addSpecialFeatures(app: PIXI.Application): void {
    // Add crown for legendary+ fish
    if (this.dna.traits.includes('crown')) {
      this.addCrown();
    }
    
    // Add whiskers for certain species
    if (this.dna.traits.includes('whiskers') || this.dna.traits.includes('dragon_whiskers')) {
      this.addWhiskers();
    }
    
    // Add special eyes
    if (this.dna.traits.includes('special_eyes') || this.dna.traits.includes('glowing_eyes') || 
        this.dna.traits.includes('predator_eyes') || this.dna.traits.includes('googly_eyes')) {
      this.enhanceEyes();
    }
    
    // Add spines for lionfish/pufferfish
    if (this.dna.traits.includes('poison_spines') || this.dna.traits.includes('spikes')) {
      this.addSpines();
    }
    
    // Add lure for anglerfish
    if (this.dna.traits.includes('bioluminescent_lure')) {
      this.addAnglerLure();
    }
    
    // Add tentacles for jellyfish
    if (this.dna.traits.includes('electric_tentacles')) {
      this.addTentacles();
    }
    
    // Add armor plates
    if (this.dna.traits.includes('armor_plates') || this.dna.traits.includes('hexagonal_plates')) {
      this.addArmorPlates();
    }
    
    // Add fire effects
    if (this.dna.traits.includes('fire_breath') || this.dna.traits.includes('fire_trail')) {
      this.addFireEffects();
    }
    
    // Add ice effects
    if (this.dna.traits.includes('frost_armor') || this.dna.traits.includes('ice_breath')) {
      this.addIceEffects();
    }
    
    // Add mechanical parts for cyber fish
    if (this.dna.traits.includes('led_eyes') || this.dna.traits.includes('circuit_pattern')) {
      this.addCyberEnhancements();
    }
  }

  /**
   * Adds a crown marking
   */
  private addCrown(): void {
    const graphics = new PIXI.Graphics();
    const size = this.baseSize * 0.2;
    
    // Crown shape
    graphics.moveTo(-size * 0.5, -size);
    graphics.lineTo(-size * 0.5, 0);
    graphics.lineTo(-size * 0.25, -size * 0.3);
    graphics.lineTo(0, 0);
    graphics.lineTo(0, -size * 0.7);
    graphics.lineTo(size * 0.25, -size * 0.3);
    graphics.lineTo(size * 0.5, 0);
    graphics.lineTo(size * 0.5, -size);
    graphics.closePath();
    
    graphics.fill({ color: 0xffd700 });
    graphics.stroke({ color: 0xffaa00, width: 2 });
    
    graphics.position.set(0, -this.baseSize * 0.5);
    this.fishContainer.addChild(graphics);
  }

  /**
   * Adds whiskers
   */
  private addWhiskers(): void {
    const graphics = new PIXI.Graphics();
    const length = this.baseSize * 0.3;
    
    // Left whiskers
    graphics.moveTo(this.baseSize * 0.2, 0);
    graphics.bezierCurveTo(
      this.baseSize * 0.3, -length * 0.2,
      this.baseSize * 0.4, -length * 0.3,
      this.baseSize * 0.5, -length * 0.2
    );
    graphics.stroke({ color: 0x333333, alpha: 0.6, width: 2 });
    
    graphics.moveTo(this.baseSize * 0.2, 0);
    graphics.bezierCurveTo(
      this.baseSize * 0.3, length * 0.2,
      this.baseSize * 0.4, length * 0.3,
      this.baseSize * 0.5, length * 0.2
    );
    graphics.stroke({ color: 0x333333, alpha: 0.6, width: 2 });
    
    this.fishContainer.addChild(graphics);
  }

  /**
   * Enhances eyes with special effects
   */
  private enhanceEyes(): void {
    const eyeGlow = new PIXI.Graphics();
    const size = this.baseSize * 0.12;
    
    // Different eye effects based on traits
    let glowColor = 0x00ffff;
    let intensity = 0.6;
    
    if (this.dna.traits.includes('predator_eyes')) {
      glowColor = 0xff0000;
      intensity = 0.8;
    } else if (this.dna.traits.includes('led_eyes')) {
      glowColor = 0x00ff00;
      intensity = 1.0;
    } else if (this.dna.traits.includes('googly_eyes')) {
      // Create googly eye effect
      const eyeWhite = new PIXI.Graphics();
      eyeWhite.circle(this.baseSize * 0.25, -this.baseSize * 0.05, this.baseSize * 0.08);
      eyeWhite.fill({ color: 0xffffff });
      
      const pupil = new PIXI.Graphics();
      pupil.circle(this.baseSize * 0.27, -this.baseSize * 0.03, this.baseSize * 0.04);
      pupil.fill({ color: 0x000000 });
      
      this.fishContainer.addChild(eyeWhite);
      this.fishContainer.addChild(pupil);
      return;
    }
    
    // Glowing effect
    for (let i = 3; i > 0; i--) {
      eyeGlow.circle(this.baseSize * 0.25, -this.baseSize * 0.05, size * i * 0.5);
      eyeGlow.fill({ 
        color: glowColor,
        alpha: (intensity * 0.2) / i
      });
    }
    
    this.fishContainer.addChild(eyeGlow);
  }
  
  /**
   * Adds spines for venomous fish
   */
  private addSpines(): void {
    const spines = new PIXI.Graphics();
    const spineCount = 8;
    const spineLength = this.baseSize * 0.3;
    
    for (let i = 0; i < spineCount; i++) {
      const angle = (i / spineCount) * Math.PI - Math.PI/2;
      const startX = Math.cos(angle) * this.baseSize * 0.4;
      const startY = Math.sin(angle) * this.baseSize * 0.3;
      const endX = startX + Math.cos(angle) * spineLength;
      const endY = startY + Math.sin(angle) * spineLength;
      
      spines.moveTo(startX, startY);
      spines.lineTo(endX, endY);
      spines.stroke({ color: 0xff0000, width: 2, alpha: 0.8 });
      
      // Poison tip
      spines.circle(endX, endY, 2);
      spines.fill({ color: 0x00ff00, alpha: 0.6 });
    }
    
    this.fishContainer.addChildAt(spines, 0);
  }
  
  /**
   * Adds angler fish lure
   */
  private addAnglerLure(): void {
    const lure = new PIXI.Graphics();
    
    // Lure rod
    lure.moveTo(this.baseSize * 0.3, -this.baseSize * 0.2);
    lure.bezierCurveTo(
      this.baseSize * 0.4, -this.baseSize * 0.4,
      this.baseSize * 0.5, -this.baseSize * 0.5,
      this.baseSize * 0.6, -this.baseSize * 0.45
    );
    lure.stroke({ color: 0x444444, width: 3 });
    
    // Glowing bulb
    const bulb = new PIXI.Graphics();
    for (let i = 3; i > 0; i--) {
      bulb.circle(this.baseSize * 0.6, -this.baseSize * 0.45, 6 * i);
      bulb.fill({ color: 0x00ff00, alpha: 0.3 / i });
    }
    
    this.fishContainer.addChild(lure);
    this.fishContainer.addChild(bulb);
    
    // Store bulb reference for animation in update method
    (this as any).anglerBulb = bulb;
  }
  
  /**
   * Adds tentacles for jellyfish
   */
  private addTentacles(): void {
    const tentacleContainer = new PIXI.Container();
    const tentacleCount = 8;
    
    for (let i = 0; i < tentacleCount; i++) {
      const tentacle = new PIXI.Graphics();
      const startX = (i - tentacleCount/2) * this.baseSize * 0.15;
      const startY = this.baseSize * 0.3;
      
      // Draw wavy tentacle
      tentacle.moveTo(startX, startY);
      
      const segments = 6;
      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const y = startY + t * this.baseSize * 0.8;
        const x = startX + Math.sin(t * Math.PI * 2 + i) * this.baseSize * 0.1;
        
        if (j === 1) {
          tentacle.lineTo(x, y);
        } else {
          const prevY = startY + (j-1)/segments * this.baseSize * 0.8;
          const cpX = startX + Math.sin((t - 0.5/segments) * Math.PI * 2 + i) * this.baseSize * 0.15;
          tentacle.quadraticCurveTo(cpX, (prevY + y) / 2, x, y);
        }
      }
      
      // Electric effect
      tentacle.stroke({ 
        color: this.dna.colors.accent ? PIXI.Color.shared.setValue(this.dna.colors.accent).toNumber() : 0x00ffff,
        width: 2,
        alpha: 0.7
      });
      
      // Add electric sparks
      if (Math.random() > 0.7) {
        const sparkY = startY + Math.random() * this.baseSize * 0.8;
        tentacle.circle(startX + (Math.random() - 0.5) * 10, sparkY, 2);
        tentacle.fill({ color: 0xffffff, alpha: 0.8 });
      }
      
      tentacleContainer.addChild(tentacle);
    }
    
    tentacleContainer.alpha = 0.6;
    this.fishContainer.addChildAt(tentacleContainer, 0);
  }
  
  /**
   * Adds armor plating effects
   */
  private addArmorPlates(): void {
    const armor = new PIXI.Graphics();
    const plateSize = this.baseSize * 0.08;
    
    // Create hexagonal plate pattern
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 8; col++) {
        const x = -this.baseSize * 0.3 + col * plateSize * 0.9;
        const y = -this.baseSize * 0.2 + row * plateSize * 0.8 + (col % 2) * plateSize * 0.4;
        
        // Check if within fish bounds (rough approximation)
        if (Math.abs(x) < this.baseSize * 0.4 && Math.abs(y) < this.baseSize * 0.3) {
          this.drawHexagon(armor, x, y, plateSize * 0.4);
          armor.stroke({ color: 0x888888, width: 1 });
          armor.fill({ color: 0xaaaaaa, alpha: 0.2 });
        }
      }
    }
    
    armor.alpha = 0.3;
    this.fishContainer.addChild(armor);
  }
  
  /**
   * Adds fire effects for phoenix/dragon fish
   */
  private addFireEffects(): void {
    const fireContainer = new PIXI.Container();
    
    // Create fire particles
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      const flame = new PIXI.Graphics();
      
      // Flame shape
      flame.moveTo(0, 0);
      flame.bezierCurveTo(-3, -5, 3, -5, 0, -10);
      flame.fill({ color: 0xff4500, alpha: 0.8 });
      
      flame.position.set(
        (Math.random() - 0.5) * this.baseSize * 0.6,
        (Math.random() - 0.5) * this.baseSize * 0.4
      );
      
      // Animate flames
      (flame as any).baseY = flame.y;
      (flame as any).speed = 0.5 + Math.random() * 0.5;
      (flame as any).phase = Math.random() * Math.PI * 2;
      
      fireContainer.addChild(flame);
    }
    
    // Add glow
    const glow = new PIXI.Graphics();
    glow.circle(0, 0, this.baseSize * 0.5);
    glow.fill({ color: 0xff6600, alpha: 0.2 });
    
    fireContainer.addChildAt(glow, 0);
    this.fishContainer.addChild(fireContainer);
    
    // Store fire container reference for animation in update method
    (this as any).fireContainer = fireContainer;
  }
  
  /**
   * Adds ice effects for arctic fish
   */
  private addIceEffects(): void {
    const iceContainer = new PIXI.Container();
    
    // Ice crystals
    const crystalCount = 10;
    for (let i = 0; i < crystalCount; i++) {
      const crystal = new PIXI.Graphics();
      
      // Draw ice crystal
      const size = 3 + Math.random() * 5;
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2;
        crystal.moveTo(0, 0);
        crystal.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
      }
      crystal.stroke({ color: 0x87ceeb, width: 1, alpha: 0.8 });
      
      crystal.position.set(
        (Math.random() - 0.5) * this.baseSize * 0.8,
        (Math.random() - 0.5) * this.baseSize * 0.6
      );
      
      iceContainer.addChild(crystal);
    }
    
    // Frost overlay
    const frost = new PIXI.Graphics();
    frost.circle(0, 0, this.baseSize * 0.6);
    frost.fill({ color: 0xffffff, alpha: 0.1 });
    
    iceContainer.addChildAt(frost, 0);
    this.fishContainer.addChild(iceContainer);
  }
  
  /**
   * Adds cybernetic enhancements
   */
  private addCyberEnhancements(): void {
    const cyber = new PIXI.Graphics();
    
    // Circuit lines
    const lineCount = 5;
    for (let i = 0; i < lineCount; i++) {
      const startX = -this.baseSize * 0.3 + Math.random() * this.baseSize * 0.6;
      const startY = -this.baseSize * 0.2 + Math.random() * this.baseSize * 0.4;
      
      cyber.moveTo(startX, startY);
      
      // Draw circuit path
      let x = startX;
      let y = startY;
      for (let j = 0; j < 3; j++) {
        const endX = x + (Math.random() - 0.5) * this.baseSize * 0.2;
        const endY = y + (Math.random() - 0.5) * this.baseSize * 0.2;
        cyber.lineTo(endX, endY);
        
        // Add node
        cyber.circle(endX, endY, 2);
        cyber.fill({ color: 0x00ff00, alpha: 0.8 });
        
        x = endX;
        y = endY;
      }
      
      cyber.stroke({ color: 0x00ff00, width: 1, alpha: 0.6 });
    }
    
    // LED strips
    const ledPositions = [
      { x: this.baseSize * 0.3, y: 0 },
      { x: 0, y: -this.baseSize * 0.15 },
      { x: 0, y: this.baseSize * 0.15 }
    ];
    
    ledPositions.forEach(pos => {
      for (let i = 0; i < 3; i++) {
        cyber.circle(pos.x - i * 5, pos.y, 1.5);
        cyber.fill({ color: 0xff0000, alpha: 0.8 });
      }
    });
    
    this.fishContainer.addChild(cyber);
  }

  /**
   * Applies color mutations using filters
   */
  private applyColorMutations(): void {
    const filters: PIXI.Filter[] = [];
    
    // Iridescent effect
    if (this.dna.mutations.includes('iridescent')) {
      this.colorMatrixFilter = new PIXI.ColorMatrixFilter();
      filters.push(this.colorMatrixFilter);
    }
    
    // Metallic effect
    if (this.dna.mutations.includes('metallic')) {
      const colorMatrix = new PIXI.ColorMatrixFilter();
      colorMatrix.brightness(1.2, false);
      colorMatrix.contrast(1.3, false);
      filters.push(colorMatrix);
    }
    
    // Translucent effect
    if (this.dna.mutations.includes('translucent')) {
      this.fishContainer.alpha = 0.7;
    }
    
    // Holographic effect
    if (this.dna.mutations.includes('holographic')) {
      const rgbSplitFilter = new PIXI.ColorMatrixFilter();
      rgbSplitFilter.matrix = [
        1.2, 0, 0, 0, 0,
        0, 1.2, 0, 0, 0,
        0, 0, 1.2, 0, 0,
        0, 0, 0, 1, 0
      ];
      filters.push(rgbSplitFilter);
    }
    
    if (filters.length > 0) {
      this.fishContainer.filters = [
        ...(this.fishContainer.filters || []),
        ...filters
      ];
    }
  }

  /**
   * Applies rarity-based visual effects with optimizations
   */
  private applyRarityEffects(app: PIXI.Application): void {
    // Glow effect for rare+ fish
    if (['rare', 'epic', 'legendary', 'mythic', 'cosmic'].includes(this.dna.rarity)) {
      this.createGlowEffect();
    }
    
    // Particle effects for epic+ fish - using ParticleContainer
    if (['epic', 'legendary', 'mythic', 'cosmic'].includes(this.dna.rarity)) {
      this.createParticleEffects();
    }
    
    // Advanced shader effects for legendary+ fish
    if (['legendary', 'mythic', 'cosmic'].includes(this.dna.rarity)) {
      this.addAdvancedEffects(app);
    }
    
    // Cosmic effects for cosmic rarity
    if (this.dna.rarity === 'cosmic') {
      this.addCosmicEffects();
    }
  }

  /**
   * Creates a sophisticated glow effect
   */
  private createGlowEffect(): void {
    this.glowContainer = new PIXI.Container();
    this.addChildAt(this.glowContainer, 0);
    
    const glowGraphics = new PIXI.Graphics();
    const glowColor = this.dna.colors.glow ? 
      PIXI.Color.shared.setValue(this.dna.colors.glow).toNumber() : 
      PIXI.Color.shared.setValue(this.dna.colors.primary).toNumber();
    
    // Multi-layer glow
    const layers = this.dna.rarity === 'cosmic' ? 5 : 3;
    for (let i = layers; i > 0; i--) {
      const scale = 1 + (i * 0.15);
      const alpha = 0.15 / i;
      
      // Copy fish shape for glow
      glowGraphics.ellipse(0, 0, this.baseSize * 0.7 * scale, this.baseSize * 0.5 * scale);
      glowGraphics.fill({ color: glowColor, alpha });
    }
    
    // Apply blur for soft glow
    this.blurFilter = new PIXI.BlurFilter({
      strength: 15,
      quality: 4,
      resolution: 2,
      kernelSize: 5
    });
    
    glowGraphics.filters = [this.blurFilter];
    this.glowContainer.addChild(glowGraphics);
  }

  /**
   * Creates particle effects using ParticleContainer for performance
   */
  private createParticleEffects(): void {
    const particleCount = 
      this.dna.rarity === 'cosmic' ? 30 :
      this.dna.rarity === 'mythic' ? 20 :
      this.dna.rarity === 'legendary' ? 15 : 10;
    
    // Create particle texture
    const particleTexture = this.createParticleTexture();
    
    // Use regular Container for particles
    // This is more compatible and still performant for reasonable particle counts
    this.particleContainer = new PIXI.Container();
    
    this.addChild(this.particleContainer);
    
    // Store particles array for easier management
    this.particles = [];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      this.createParticle(i, particleTexture);
    }
  }
  /**
   * Creates particle texture
   */
  private createParticleTexture(): PIXI.Texture {
    const graphics = new PIXI.Graphics();
    
    if (this.dna.rarity === 'cosmic') {
      // Star shape
      graphics.star(0, 0, 5, 4, 2);
      graphics.fill({ color: 0xffffff });
    } else {
      // Circle
      graphics.circle(0, 0, 3);
      graphics.fill({ color: 0xffffff });
    }
    
    return this.app.renderer.generateTexture(graphics);
  }

  /**
   * Creates a single particle
   */
  private createParticle(index: number, texture: PIXI.Texture): void {
    const particle = new PIXI.Sprite(texture);
    
    
    // Set initial position
    const angle = (index / 10) * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    particle.x = Math.cos(angle) * distance;
    particle.y = Math.sin(angle) * distance;
    
    // Set properties
    particle.scale.set(0.5 + Math.random() * 0.5);
    particle.alpha = 0.6;
    particle.tint = this.dna.colors.glow ? 
      PIXI.Color.shared.setValue(this.dna.colors.glow).toNumber() : 
      0xffffff;
    
    // Store animation data
    (particle as any).orbitAngle = angle;
    (particle as any).orbitSpeed = 0.001 + Math.random() * 0.002;
    (particle as any).orbitRadius = distance;
    (particle as any).bobSpeed = 0.002 + Math.random() * 0.003;
    (particle as any).bobOffset = Math.random() * Math.PI * 2;
    
    this.particleContainer!.addChild(particle);
    this.particles.push(particle);
  }

  /**
   * Adds advanced visual effects
   */
  private addAdvancedEffects(app: PIXI.Application): void {
    // Displacement effect for water-like distortion
    if (this.dna.mutations.includes('quantum') || this.dna.rarity === 'cosmic') {
      this.createDisplacementEffect(app);
    }
    
    // Chromatic aberration for mythic/cosmic
    if (['mythic', 'cosmic'].includes(this.dna.rarity)) {
      this.addChromaticAberration();
    }
    
    // Dynamic color system if enabled
    if (this.dna.dynamicColor) {
      this.enableDynamicColors();
    }
  }

  /**
   * Creates displacement effect
   */
  private createDisplacementEffect(app: PIXI.Application): void {
    // Create displacement sprite
    const displacementSprite = PIXI.Sprite.from(
      this.createDisplacementTexture(app.renderer)
    );
    displacementSprite.texture.source.wrapMode = 'repeat';
    displacementSprite.anchor.set(0.5);
    displacementSprite.scale.set(2);
    
    this.addChild(displacementSprite);
    
    // Create and apply displacement filter
    this.displacementFilter = new PIXI.DisplacementFilter({
      sprite: displacementSprite,
      scale: 5,
    });
    
    this.fishContainer.filters = [
      ...(this.fishContainer.filters || []),
      this.displacementFilter
    ];
    
    // Hide the displacement sprite
    displacementSprite.visible = false;
  }

  /**
   * Creates displacement texture
   */
  private createDisplacementTexture(renderer: PIXI.Renderer): PIXI.Texture {
    const size = 64;
    const graphics = new PIXI.Graphics();
    
    // Create noise pattern
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 5 + Math.random() * 10;
      
      graphics.circle(x, y, radius);
      graphics.fill({ 
        color: Math.random() > 0.5 ? 0xff0000 : 0x00ff00,
        alpha: 0.5
      });
    }
    
    const texture = renderer.generateTexture({
      target: graphics,
      resolution: 1
    });
    
    graphics.destroy();
    return texture;
  }

  /**
   * Adds chromatic aberration effect
   */
  private addChromaticAberration(): void {
    const rgbSplitFilter = new PIXI.ColorMatrixFilter();
    rgbSplitFilter.matrix = [
      1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0,
    ];
    
    this.fishContainer.filters = [
      ...(this.fishContainer.filters || []),
      rgbSplitFilter
    ];
  }

  /**
   * Enables dynamic color system
   */
  private enableDynamicColors(): void {
    // Environmental hue shift based on position
    (this as any).dynamicColorEnabled = true;
  }

  /**
   * Adds cosmic-specific effects
   */
  private addCosmicEffects(): void {
    // Create starfield inside fish
    const starfield = new PIXI.Container();
    starfield.mask = this.bodySprite;
    
    for (let i = 0; i < 50; i++) {
      const star = new PIXI.Graphics();
      star.circle(0, 0, Math.random() * 2);
      star.fill({ color: 0xffffff, alpha: Math.random() * 0.8 });
      
      star.x = (Math.random() - 0.5) * this.baseSize * 1.5;
      star.y = (Math.random() - 0.5) * this.baseSize;
      
      (star as any).twinkleSpeed = Math.random() * 0.005;
      (star as any).twinkleOffset = Math.random() * Math.PI * 2;
      
      starfield.addChild(star);
    }
    
    this.fishContainer.addChild(starfield);
    (this as any).cosmicStarfield = starfield;
  }

  /**
   * Update method for animations
   */
  public update(deltaTime: number): void {
    this.shaderTime += deltaTime;
    
    // Breathing animation
    const breathScale = 1 + Math.sin(this.shaderTime * this.breathingSpeed) * 0.02;
    this.fishContainer.scale.y = breathScale;
    
    // Floating animation
    this.y += Math.sin(this.shaderTime * this.floatSpeed) * 0.5;
    
    // Update glow pulsing
    if (this.glowContainer) {
      this.glowContainer.alpha = 0.6 + Math.sin(this.shaderTime * 0.002) * 0.2;
    }
    
    // Update particles
    if (this.particleContainer && this.particles.length > 0) {
      this.particles.forEach((particle: any) => {
        // Orbital motion
        particle.orbitAngle += particle.orbitSpeed * deltaTime;
        particle.x = Math.cos(particle.orbitAngle) * particle.orbitRadius;
        particle.y = Math.sin(particle.orbitAngle) * particle.orbitRadius;
        
        // Bobbing motion
        particle.y += Math.sin(this.shaderTime * particle.bobSpeed + particle.bobOffset) * 2;
        
        // Pulsing alpha
        particle.alpha = 0.4 + Math.sin(this.shaderTime * 0.003 + particle.bobOffset) * 0.3;
      });
    }
    
    // Update iridescent effect
    if (this.colorMatrixFilter) {
      const hue = Math.sin(this.shaderTime * this.shimmerSpeed) * 0.1;
      this.colorMatrixFilter.hue(hue * 180, false);
    }
    
    // Update displacement
    if (this.displacementFilter) {
      (this.displacementFilter as any).scale.x = 5 + Math.sin(this.shaderTime * 0.001) * 2;
      (this.displacementFilter as any).scale.y = 5 + Math.sin(this.shaderTime * 0.001) * 2;
    }
    
    // Update cosmic starfield
    if ((this as any).cosmicStarfield) {
      const starfield = (this as any).cosmicStarfield;
      starfield.children.forEach((star: any) => {
        star.alpha = 0.3 + Math.sin(this.shaderTime * star.twinkleSpeed + star.twinkleOffset) * 0.5;
      });
    }
    
    // Update fire effects
    if ((this as any).fireContainer) {
      const fireContainer = (this as any).fireContainer;
      fireContainer.children.forEach((flame: any) => {
        if (flame.baseY !== undefined) {
          flame.y = flame.baseY + Math.sin(this.shaderTime * flame.speed + flame.phase) * 5;
          flame.alpha = 0.6 + Math.sin(this.shaderTime * 0.003 + flame.phase) * 0.2;
        }
      });
    }
    
    // Update angler bulb
    if ((this as any).anglerBulb) {
      const bulb = (this as any).anglerBulb;
      bulb.alpha = 0.5 + Math.sin(this.shaderTime * 0.005) * 0.3;
    }
    
    // Dynamic color based on position
    if ((this as any).dynamicColorEnabled && this.app) {
      const hueShift = (this.x / this.app.screen.width) * 0.2;
      const brightnessShift = (this.y / this.app.screen.height) * 0.1;
      
      if (!this.colorMatrixFilter) {
        this.colorMatrixFilter = new PIXI.ColorMatrixFilter();
        this.fishContainer.filters = [
          ...(this.fishContainer.filters || []),
          this.colorMatrixFilter
        ];
      }
      
      this.colorMatrixFilter.hue(hueShift * 360, false);
      this.colorMatrixFilter.brightness(1 + brightnessShift, false);
    }
  }

  /**
   * Enhanced hover effect
   */
  private onHover(): void {
    // Scale up
    this.scale.x *= 1.1;
    this.scale.y *= 1.1;
    
    // Brighten
    if (!this.overlaySprite) {
      const overlay = new PIXI.Graphics();
      overlay.rect(-this.baseSize, -this.baseSize, this.baseSize * 2, this.baseSize * 2);
      overlay.fill({ color: 0xffffff, alpha: 0.2 });
      
      this.overlaySprite = new PIXI.Sprite(
        PIXI.Texture.WHITE
      );
      this.overlaySprite.width = this.baseSize * 2;
      this.overlaySprite.height = this.baseSize * 2;
      this.overlaySprite.anchor.set(0.5);
      this.overlaySprite.blendMode = 'add';
      this.overlaySprite.alpha = 0;
      this.overlaySprite.tint = 0xffffff;
      
      this.fishContainer.addChild(this.overlaySprite);
    }
    
    this.overlaySprite.alpha = 0.3;
    
    // Intensify glow
    if (this.glowContainer) {
      this.glowContainer.alpha = 1;
    }
    
    // Speed up particles
    if (this.particleContainer) {
      this.particleContainer.children.forEach((particle: any) => {
        particle.orbitSpeed /= 2;
      });
    }
    
    // Disable caching during hover for smooth animations
    if (this.isCached) {
      this.disableCaching();
    }
  }

  /**
   * End hover effect
   */
  private onHoverEnd(): void {
    // Reset scale
    this.scale.x /= 1.1;
    this.scale.y /= 1.1;
    
    // Remove brightness
    if (this.overlaySprite) {
      this.overlaySprite.alpha = 0;
    }
    
    // Reset glow
    if (this.glowContainer) {
      this.glowContainer.alpha = 0.6;
    }
    
    // Reset particle speed
    if (this.particleContainer) {
      this.particleContainer.children.forEach((particle: any) => {
        particle.orbitSpeed /= 2;
      });
    }
    
    // Re-enable caching for performance
    if (this.isStatic && ['legendary', 'mythic', 'cosmic'].includes(this.dna.rarity)) {
      setTimeout(() => {
        this.enableCaching();
      }, 100);
    }
  }

  /**
   * Sets whether the fish is static (for performance optimization)
   */
  public setStatic(isStatic: boolean): void {
    this.isStatic = isStatic;
    
    if (isStatic && ['legendary', 'mythic', 'cosmic'].includes(this.dna.rarity)) {
      // Cache complex fish as texture for performance
      this.enableCaching();
    } else {
      // Disable caching for animated fish
      this.disableCaching();
    }
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    // Clear references
    (this as any).anglerBulb = null;
    (this as any).fireContainer = null;
    (this as any).cosmicStarfield = null;
    
    // Disable caching before destroy
    if (this.isCached) {
      this.disableCaching();
    }
    
    super.destroy({ children: true });
  }
}
