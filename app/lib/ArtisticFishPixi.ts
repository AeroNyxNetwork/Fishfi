/**
 * ArtisticFishPixi.ts
 * 
 * Premium artistic fish generation system for PIXI.js v8
 * Creates museum-quality, NFT-worthy fish with sophisticated visual effects
 * 
 * @version 2.0.0
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
 * Premium artistic fish class for PIXI.js v8
 * Creates visually stunning fish with advanced rendering techniques
 */
export class ArtisticFishPixi extends PIXI.Container {
  public dna: FishDNA;
  private baseSize: number = 120; // Base size for high-quality rendering
  private fishContainer: PIXI.Container;
  private bodySprite!: PIXI.Sprite;
  private patternSprite?: PIXI.Sprite;
  private overlaySprite?: PIXI.Sprite;
  private glowContainer?: PIXI.Container;
  private particleContainer?: PIXI.Container;
  
  // Advanced visual effects
  private shaderTime: number = 0;
  private colorMatrixFilter?: PIXI.ColorMatrixFilter;
  private displacementFilter?: PIXI.DisplacementFilter;
  private blurFilter?: PIXI.BlurFilter;
  
  // Animation properties
  private breathingSpeed: number = 0.002;
  private floatSpeed: number = 0.001;
  private shimmerSpeed: number = 0.003;
  
  constructor(dna: FishDNA, app: PIXI.Application) {
    super();
    
    this.dna = dna;
    
    // Create container hierarchy
    this.fishContainer = new PIXI.Container();
    this.addChild(this.fishContainer);
    
    // Generate the fish artwork
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
   * Creates the main fish artwork using advanced rendering
   */
  private createFish(app: PIXI.Application): void {
    // Generate high-quality fish texture
    const fishTexture = this.generateFishArtwork(app.renderer);
    
    // Create main body sprite
    this.bodySprite = new PIXI.Sprite(fishTexture);
    this.bodySprite.anchor.set(0.5);
    this.fishContainer.addChild(this.bodySprite);
    
    // Add pattern overlay if needed
    if (this.dna.pattern !== 'solid') {
      this.addPatternOverlay(app.renderer);
    }
    
    // Add special features based on DNA
    this.addSpecialFeatures(app);
    
    // Apply color mutations
    this.applyColorMutations();
  }

  /**
   * Generates the high-quality fish artwork
   */
  private generateFishArtwork(renderer: PIXI.Renderer): PIXI.Texture {
    const graphics = new PIXI.Graphics();
    const size = this.baseSize;
    
    // Set up gradient fills
    const primaryColor = PIXI.Color.shared.setValue(this.dna.colors.primary).toNumber();
    const secondaryColor = PIXI.Color.shared.setValue(this.dna.colors.secondary).toNumber();
    const accentColor = PIXI.Color.shared.setValue(this.dna.colors.accent).toNumber();
    
    // Draw based on body shape with smooth curves
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
      default:
        this.drawRoundFish(graphics, size, primaryColor, secondaryColor);
    }
    
    // Add fins with accent color
    this.drawFins(graphics, size, accentColor);
    
    // Add details
    this.drawDetails(graphics, size);
    
    // Generate texture with antialiasing
    const bounds = graphics.getLocalBounds();
    const texture = renderer.generateTexture(graphics, {
      resolution: 2, // Higher resolution for quality
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
   * Draws a round fish shape with smooth curves
   */
  private drawRoundFish(graphics: PIXI.Graphics, size: number, primary: number, secondary: number): void {
    // Main body with gradient effect
    graphics.ellipse(0, 0, size * 0.6, size * 0.4);
    graphics.fill({
      color: primary,
      alpha: 1
    });
    
    // Secondary color belly
    graphics.ellipse(0, size * 0.15, size * 0.5, size * 0.25);
    graphics.fill({
      color: secondary,
      alpha: 0.7
    });
    
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

  /**
   * Draws a streamlined fish shape
   */
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

  /**
   * Draws a diamond-shaped fish
   */
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

  /**
   * Draws a massive fish shape
   */
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

  /**
   * Draws a serpentine fish shape
   */
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
   * Adds pattern overlay with advanced blending
   */
  private addPatternOverlay(renderer: PIXI.Renderer): void {
    const graphics = new PIXI.Graphics();
    const size = this.baseSize;
    
    // Generate pattern based on type
    switch (this.dna.pattern) {
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
    }
    
    // Create pattern texture
    const bounds = graphics.getLocalBounds();
    const patternTexture = renderer.generateTexture(graphics, {
      resolution: 2,
      frame: new PIXI.Rectangle(
        bounds.x - 20,
        bounds.y - 20,
        bounds.width + 40,
        bounds.height + 40
      )
    });
    
    this.patternSprite = new PIXI.Sprite(patternTexture);
    this.patternSprite.anchor.set(0.5);
    this.patternSprite.blendMode = 'multiply';
    this.patternSprite.alpha = 0.5;
    
    this.fishContainer.addChild(this.patternSprite);
    graphics.destroy();
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

  /**
   * Adds special features based on DNA traits
   */
  private addSpecialFeatures(app: PIXI.Application): void {
    // Add crown for legendary+ fish
    if (this.dna.traits.includes('crown')) {
      this.addCrown();
    }
    
    // Add whiskers for certain species
    if (this.dna.traits.includes('whiskers')) {
      this.addWhiskers();
    }
    
    // Add special eyes
    if (this.dna.traits.includes('special_eyes') || this.dna.traits.includes('glowing_eyes')) {
      this.enhanceEyes();
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
    
    // Glowing effect
    for (let i = 3; i > 0; i--) {
      eyeGlow.circle(this.baseSize * 0.25, -this.baseSize * 0.05, size * i * 0.5);
      eyeGlow.fill({ 
        color: this.dna.colors.glow ? PIXI.Color.shared.setValue(this.dna.colors.glow).toNumber() : 0x00ffff,
        alpha: 0.2 / i
      });
    }
    
    this.fishContainer.addChild(eyeGlow);
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
    
    if (filters.length > 0) {
      this.fishContainer.filters = filters;
    }
  }

  /**
   * Applies rarity-based visual effects
   */
  private applyRarityEffects(app: PIXI.Application): void {
    // Glow effect for rare+ fish
    if (['rare', 'epic', 'legendary', 'mythic', 'cosmic'].includes(this.dna.rarity)) {
      this.createGlowEffect();
    }
    
    // Particle effects for epic+ fish
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
   * Creates particle effects
   */
  private createParticleEffects(): void {
    this.particleContainer = new PIXI.Container();
    this.addChild(this.particleContainer);
    
    const particleCount = 
      this.dna.rarity === 'cosmic' ? 30 :
      this.dna.rarity === 'mythic' ? 20 :
      this.dna.rarity === 'legendary' ? 15 : 10;
    
    for (let i = 0; i < particleCount; i++) {
      this.createParticle(i);
    }
  }

  /**
   * Creates a single particle
   */
  private createParticle(index: number): void {
    const particle = new PIXI.Graphics();
    const size = 1 + Math.random() * 3;
    
    // Different particle styles based on rarity
    if (this.dna.rarity === 'cosmic') {
      // Star-shaped particles
      const points = 5;
      const outerRadius = size;
      const innerRadius = size * 0.5;
      
      particle.star(0, 0, points, outerRadius, innerRadius);
      particle.fill({ 
        color: 0xffffff,
        alpha: 0.8
      });
    } else {
      // Circle particles
      particle.circle(0, 0, size);
      particle.fill({ 
        color: this.dna.colors.glow ? 
          PIXI.Color.shared.setValue(this.dna.colors.glow).toNumber() : 
          0xffffff,
        alpha: 0.6
      });
    }
    
    // Set initial position
    const angle = (index / 10) * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    particle.x = Math.cos(angle) * distance;
    particle.y = Math.sin(angle) * distance;
    
    // Store animation data
    (particle as any).orbitAngle = angle;
    (particle as any).orbitSpeed = 0.001 + Math.random() * 0.002;
    (particle as any).orbitRadius = distance;
    (particle as any).bobSpeed = 0.002 + Math.random() * 0.003;
    (particle as any).bobOffset = Math.random() * Math.PI * 2;
    
    this.particleContainer!.addChild(particle);
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
    
    const texture = renderer.generateTexture(graphics, {
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
    if (this.particleContainer) {
      this.particleContainer.children.forEach((particle: any) => {
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
      this.displacementFilter.scale = 5 + Math.sin(this.shaderTime * 0.001) * 2;
    }
    
    // Update cosmic starfield
    if (this.dna.rarity === 'cosmic') {
      const starfield = this.fishContainer.children.find(child => child.mask === this.bodySprite);
      if (starfield) {
        starfield.children.forEach((star: any) => {
          star.alpha = 0.3 + Math.sin(this.shaderTime * star.twinkleSpeed + star.twinkleOffset) * 0.5;
        });
      }
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
      overlay.beginFill(0xffffff, 0.2);
      overlay.drawRect(-this.baseSize, -this.baseSize, this.baseSize * 2, this.baseSize * 2);
      overlay.endFill();
      
      this.overlaySprite = new PIXI.Sprite(
        this.fishContainer.generateTexture()
      );
      this.overlaySprite.anchor.set(0.5);
      this.overlaySprite.blendMode = 'add';
      this.overlaySprite.alpha = 0;
      
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
        particle.orbitSpeed *= 2;
      });
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
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    super.destroy({ children: true });
  }
}
