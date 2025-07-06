/**
 * NFTGalleryEngine.ts
 * 
 * Enhanced NFT Gallery Engine with performance optimizations and artistic features
 * 
 * @version 2.0.0
 * @requires pixi.js ^8.0.0
 * @path app/lib/NFTGalleryEngine.ts
 */

import * as PIXI from 'pixi.js';
import { ArtisticFishPixi, FishDNA, FishTemplate } from './ArtisticFishPixi';
import { FishSwimmingSystem } from './FishSwimmingSystem';
import { GeometryCache } from './GeometryCache';

/**
 * Enhanced rarity configuration
 */
const RARITY_CONFIG = {
  common: { 
    probability: 50, 
    color: 0xffffff, 
    glow: 0xcccccc,
    particleCount: 0,
    value: 10,
    designation: 'Series C'
  },
  uncommon: { 
    probability: 30, 
    color: 0x00ff00, 
    glow: 0x00ff00,
    particleCount: 0,
    value: 50,
    designation: 'Series U'
  },
  rare: { 
    probability: 13, 
    color: 0x0099ff, 
    glow: 0x0099ff,
    particleCount: 5,
    value: 200,
    designation: 'Series R'
  },
  epic: { 
    probability: 5, 
    color: 0xcc00ff, 
    glow: 0xcc00ff,
    particleCount: 10,
    value: 500,
    designation: 'Series E'
  },
  legendary: { 
    probability: 1.5, 
    color: 0xffaa00, 
    glow: 0xffaa00,
    particleCount: 15,
    value: 2000,
    designation: 'Series L'
  },
  mythic: { 
    probability: 0.4, 
    color: 0xff00aa, 
    glow: 0xff00aa,
    particleCount: 20,
    value: 10000,
    designation: 'Series M'
  },
  cosmic: { 
    probability: 0.1, 
    color: 0xffffff, 
    glow: 0xffffff,
    particleCount: 30,
    value: 100000,
    designation: 'Series Ω'
  }
};

/**
 * Enhanced fish template with artistic properties
 */
const FISH_TEMPLATES: Record<string, FishTemplate> = {
  // Existing templates remain the same
  // Adding new artistic templates
  
  architecturalFlow: {
    name: 'architecturalFlow',
    displayName: 'Architectural Flow α-01',
    description: 'Parametric design meets aquatic form',
    bodyShape: 'architectural',
    baseColors: {
      primary: '#2a2a2a',
      secondary: '#ffffff',
      accent: '#00ffff',
      glow: '#00ffff'
    },
    features: {
      bodyRatio: { w: 2.5, h: 1.2 },
      headCurve: 'parametric',
      tailType: 'geometric',
      finStyle: 'minimal',
      special: ['parametric_surface', 'flow_lines']
    }
  },
  
  deconstructedEntity: {
    name: 'deconstructedEntity',
    displayName: 'Deconstructed Entity δ-77',
    description: 'Form fragmented across dimensions',
    bodyShape: 'deconstructed',
    baseColors: {
      primary: '#ff0066',
      secondary: '#0066ff',
      accent: '#66ff00'
    },
    features: {
      bodyRatio: { w: 2.0, h: 1.5 },
      headCurve: 'fragmented',
      tailType: 'dispersed',
      finStyle: 'floating',
      special: ['phase_shift', 'fragment_orbit']
    }
  },
  
  tessellatedCrystal: {
    name: 'tessellatedCrystal',
    displayName: 'Tessellated Crystal τ-∞',
    description: 'Infinite patterns within finite form',
    bodyShape: 'tessellated',
    baseColors: {
      primary: '#9900ff',
      secondary: '#00ff99',
      accent: '#ff9900'
    },
    features: {
      bodyRatio: { w: 1.8, h: 1.8 },
      headCurve: 'crystalline',
      tailType: 'fractal',
      finStyle: 'tessellated',
      special: ['recursive_pattern', 'light_refraction']
    }
  },
  
  calligraphicEssence: {
    name: 'calligraphicEssence',
    displayName: 'Calligraphic Essence 書-001',
    description: 'Single stroke of digital ink',
    bodyShape: 'calligraphic',
    baseColors: {
      primary: '#000000',
      secondary: '#ff0000',
      accent: '#ffffff'
    },
    features: {
      bodyRatio: { w: 3.0, h: 0.8 },
      headCurve: 'brushstroke',
      tailType: 'ink_trail',
      finStyle: 'flowing_ink',
      special: ['ink_dynamics', 'brush_texture']
    }
  }
};

/**
 * Enhanced NFT Gallery Engine
 */
export class NFTGalleryEngine {
  private app!: PIXI.Application;
  private mainContainer!: PIXI.Container;
  private aquarium!: PIXI.Container;
  private uiLayer!: PIXI.Container;
  private backgroundLayer!: PIXI.Container;
  
  // Enhanced fish management
  private fishes: ArtisticFishPixi[] = [];
  private selectedFish: ArtisticFishPixi | null = null;
  private fishLimit: number = 20;
  
  // Swimming system
  private swimmingSystem: FishSwimmingSystem | null = null;
  private isSwimmingMode: boolean = true;
  
  // UI elements
  private infoPanel!: PIXI.Container;
  private generateButton!: PIXI.Container;
  private galleryButton!: PIXI.Container;
  private statsPanel!: PIXI.Container;
  
  // Water effects
  private waterOverlay!: PIXI.TilingSprite;
  private displacementSprite!: PIXI.Sprite;
  private displacementFilter!: PIXI.DisplacementFilter;
  
  // Gallery state
  private isGalleryMode: boolean = false;
  private gallery: FishDNA[] = [];
  
  // Performance monitoring
  private performanceStats = {
    fps: 60,
    fishCount: 0,
    cacheHits: 0,
    memoryUsage: 0
  };

  constructor(private canvas: HTMLCanvasElement) {}

  /**
   * Initializes the application with optimizations
   */
  async init(): Promise<void> {
    // Create PIXI Application with optimized settings
    this.app = new PIXI.Application();
    
    await this.app.init({
      canvas: this.canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000814,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      preference: 'webgl',
      powerPreference: 'high-performance',
      hello: false // Disable console message
    });

    // Setup container hierarchy
    this.setupContainers();
    
    // Create ocean environment
    await this.createOceanEnvironment();
    
    // Create UI with enhancements
    this.createUI();
    this.createStatsPanel();
    
    // Setup interactions
    this.setupInteractions();
    
    // Start game loop
    this.app.ticker.add(this.update, this);
    
    // Handle resize
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Initialize swimming system
    this.swimmingSystem = new FishSwimmingSystem(this.app, this.aquarium);
    
    // Start with swimming mode
    setTimeout(() => {
      this.showSwimmingUI();
    }, 1000);
    
    // Monitor performance
    this.startPerformanceMonitoring();
  }

  /**
   * Creates performance stats panel
   */
  private createStatsPanel(): void {
    this.statsPanel = new PIXI.Container();
    this.statsPanel.position.set(10, this.app.screen.height - 100);
    
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 200, 80, 10);
    bg.fill({ color: 0x000000, alpha: 0.7 });
    bg.stroke({ color: 0x00ff00, width: 1 });
    
    this.statsPanel.addChild(bg);
    
    // FPS text
    const fpsText = new PIXI.Text({
      text: 'FPS: 60',
      style: {
        fontFamily: 'monospace',
        fontSize: 12,
        fill: 0x00ff00
      }
    });
    fpsText.name = 'fps';
    fpsText.position.set(10, 10);
    this.statsPanel.addChild(fpsText);
    
    // Cache stats
    const cacheText = new PIXI.Text({
      text: 'Cache: 0/0',
      style: {
        fontFamily: 'monospace',
        fontSize: 12,
        fill: 0x00ffff
      }
    });
    cacheText.name = 'cache';
    cacheText.position.set(10, 30);
    this.statsPanel.addChild(cacheText);
    
    // Memory usage
    const memoryText = new PIXI.Text({
      text: 'Memory: 0MB',
      style: {
        fontFamily: 'monospace',
        fontSize: 12,
        fill: 0xffff00
      }
    });
    memoryText.name = 'memory';
    memoryText.position.set(10, 50);
    this.statsPanel.addChild(memoryText);
    
    this.uiLayer.addChild(this.statsPanel);
    
    // Hide by default in production
    if (process.env.NODE_ENV === 'production') {
      this.statsPanel.visible = false;
    }
  }

  /**
   * Starts performance monitoring
   */
  private startPerformanceMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();
    
    this.app.ticker.add((t: PIXI.Ticker) => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        this.performanceStats.fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Update cache stats
        const cacheStats = GeometryCache.getCacheStats();
        this.performanceStats.cacheHits = cacheStats.textures + cacheStats.contexts;
        this.performanceStats.memoryUsage = Math.round(cacheStats.estimatedMemory / 1024 / 1024);
        
        this.updateStatsPanel();
      }
    });
  }

  /**
   * Updates stats panel
   */
  private updateStatsPanel(): void {
    if (!this.statsPanel || !this.statsPanel.visible) return;
    
    const fpsText = this.statsPanel.getChildByName('fps') as PIXI.Text;
    const cacheText = this.statsPanel.getChildByName('cache') as PIXI.Text;
    const memoryText = this.statsPanel.getChildByName('memory') as PIXI.Text;
    
    if (fpsText) {
      fpsText.text = `FPS: ${this.performanceStats.fps}`;
      fpsText.style.fill = this.performanceStats.fps >= 50 ? 0x00ff00 : 
                           this.performanceStats.fps >= 30 ? 0xffff00 : 0xff0000;
    }
    
    if (cacheText) {
      const cacheStats = GeometryCache.getCacheStats();
      cacheText.text = `Cache: ${cacheStats.textures}T/${cacheStats.contexts}C/${cacheStats.geometries}G`;
    }
    
    if (memoryText) {
      memoryText.text = `Memory: ${this.performanceStats.memoryUsage}MB`;
    }
  }

  private async createOceanBackground(): Promise<void> {
    // Create gradient background using canvas
    const gradientTexture = this.createGradientTexture(
      [0x000814, 0x001a33, 0x003366],
      this.app.screen.width,
      this.app.screen.height
    );
    
    const gradientSprite = new PIXI.Sprite(gradientTexture);
    this.backgroundLayer.addChild(gradientSprite);
    
    // Create water displacement effect
    await this.createWaterEffect();
    
    // Add ambient particles with ParticleContainer
    this.createAmbientParticles();
  }

  /**
   * Enhanced fish generation with new artistic properties
   */
  private generateFishDNA(): FishDNA {
    // Expanded template selection including new artistic ones
    const allTemplates = { ...FISH_TEMPLATES };
    const templateKeys = Object.keys(allTemplates);
    const templateKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
    const template = allTemplates[templateKey];
    
    // Calculate rarity
    const rarity = this.calculateRarity();
    
    // Generate colors with mutations
    const colors: FishDNA['colors'] = { 
      ...template.baseColors,
      glow: undefined,
      shimmer: undefined
    };
    
    // Enhanced color generation
    if (rarity !== 'common') {
      const hueShift = Math.random() * 360;
      colors.primary = this.shiftHue(colors.primary, hueShift);
      colors.secondary = this.shiftHue(colors.secondary, hueShift);
      colors.accent = this.shiftHue(colors.accent, hueShift);
      
      if (['legendary', 'mythic', 'cosmic'].includes(rarity)) {
        colors.glow = '#' + RARITY_CONFIG[rarity].glow.toString(16).padStart(6, '0');
      }
    }
    
    // Enhanced pattern selection
    const patterns = [
      'stripes', 'dots', 'scales', 'waves', 'spirals',
      'fractals', 'circuits', 'crystals', 'stars', 'void',
      'gradient', 'noise', 'geometric', 'organic', 'mystic',
      'chevron', 'hexagonal', 'spiral', 'digital', 'glitch'
    ];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Surface type for artistic fish
    let surfaceType: FishDNA['surfaceType'] | undefined;
    if (['architectural', 'deconstructed', 'tessellated', 'calligraphic'].includes(template.bodyShape)) {
      const surfaces: FishDNA['surfaceType'][] = ['matte', 'procedural_noise', 'glitch_sort', 'liquid_metal'];
      surfaceType = surfaces[Math.floor(Math.random() * surfaces.length)];
    }
    
    // Art style
    const artStyles: Array<FishDNA['artStyle']> = ['minimalist', 'baroque', 'abstract', 'organic'];
    const artStyle = artStyles[Math.floor(Math.random() * artStyles.length)];
    
    // Dynamic color for rare fish
    const dynamicColor = ['legendary', 'mythic', 'cosmic'].includes(rarity) && Math.random() > 0.5;
    
    // Generate traits
    const traits = this.generateTraits(template, rarity);
    
    // Generate mutations
    const mutations = this.generateMutations(rarity);
    
    return {
      id: `ARTEFACT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      species: templateKey,
      bodyShape: template.bodyShape,
      pattern,
      surfaceType,
      colors,
      rarity,
      traits: [...new Set(traits)],
      mutations,
      genes: {
        size: 0.8 + Math.random() * 0.4,
        speed: 0.5 + Math.random() * 0.5,
        aggression: Math.random(),
        intelligence: Math.random()
      },
      artStyle,
      dynamicColor
    };
  }

  /**
   * Enhanced info panel with new naming conventions
   */
  private updateInfoPanel(fish: ArtisticFishPixi): void {
    // Clear existing content
    while (this.infoPanel.children.length > 1) {
      this.infoPanel.removeChildAt(1);
    }
    
    const template = FISH_TEMPLATES[fish.dna.species] || FISH_TEMPLATES.goldfish;
    const rarityConfig = RARITY_CONFIG[fish.dna.rarity];
    
    // Designation (new naming convention)
    const designation = new PIXI.Text({
      text: `${rarityConfig.designation}-${fish.dna.id.substr(-3)}`,
      style: {
        fontFamily: 'monospace',
        fontSize: 20,
        fontWeight: 'bold',
        fill: rarityConfig.color
      }
    });
    designation.position.set(20, 20);
    this.infoPanel.addChild(designation);
    
    // Classification
    const classification = new PIXI.Text({
      text: template.displayName,
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xcccccc
      }
    });
    classification.position.set(20, 45);
    this.infoPanel.addChild(classification);
    
    // Unique identifier
    const id = new PIXI.Text({
      text: `Identifier: ${fish.dna.id}`,
      style: {
        fontFamily: 'monospace',
        fontSize: 10,
        fill: 0x666666
      }
    });
    id.position.set(20, 65);
    this.infoPanel.addChild(id);
    
    // Attributes (renamed from traits)
    const attributesTitle = new PIXI.Text({
      text: 'Attributes:',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xcccccc
      }
    });
    attributesTitle.position.set(20, 90);
    this.infoPanel.addChild(attributesTitle);
    
    // Pattern as Material Property
    const material = new PIXI.Text({
      text: `Material: ${fish.dna.pattern} ${fish.dna.surfaceType ? `/ ${fish.dna.surfaceType}` : ''}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xffffff
      }
    });
    material.position.set(30, 110);
    this.infoPanel.addChild(material);
    
    // Art style
    if (fish.dna.artStyle) {
      const style = new PIXI.Text({
        text: `Style: ${fish.dna.artStyle}`,
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          fill: 0xffffff
        }
      });
      style.position.set(30, 130);
      this.infoPanel.addChild(style);
    }
    
    // Enhanced traits display
    let yPos = 150;
    fish.dna.traits.forEach(trait => {
      const traitText = new PIXI.Text({
        text: `• ${this.formatTraitName(trait)}`,
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          fill: 0x00ff00
        }
      });
      traitText.position.set(30, yPos);
      this.infoPanel.addChild(traitText);
      yPos += 15;
    });
    
    // Mutations as Enhancements
    if (fish.dna.mutations.length > 0) {
      yPos += 10;
      const enhancementsTitle = new PIXI.Text({
        text: 'Enhancements:',
        style: {
          fontFamily: 'Arial',
          fontSize: 14,
          fill: 0xcccccc
        }
      });
      enhancementsTitle.position.set(20, yPos);
      this.infoPanel.addChild(enhancementsTitle);
      yPos += 20;
      
      fish.dna.mutations.forEach(mutation => {
        const mutationText = new PIXI.Text({
          text: `✧ ${this.formatMutationName(mutation)}`,
          style: {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xff00ff
          }
        });
        mutationText.position.set(30, yPos);
        this.infoPanel.addChild(mutationText);
        yPos += 15;
      });
    }
    
    // Value
    yPos += 10;
    const value = new PIXI.Text({
      text: `Estimated Value: ◈ ${rarityConfig.value.toLocaleString()}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffd700
      }
    });
    value.position.set(20, yPos);
    this.infoPanel.addChild(value);
    
    this.infoPanel.visible = true;
  }

  /**
   * Formats trait names for display
   */
  private formatTraitName(trait: string): string {
    const formatted = trait.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  /**
   * Formats mutation names for display
   */
  private formatMutationName(mutation: string): string {
    const formatted = mutation.replace(/-/g, ' ').replace(/_/g, ' ');
    return formatted.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Main update loop with optimizations
   */
  private update(ticker: PIXI.Ticker): void {
    const deltaTime = ticker.deltaTime;
    
    // Animate water
    if (this.displacementSprite) {
      this.displacementSprite.x += 0.5 * deltaTime;
      this.displacementSprite.y += 0.3 * deltaTime;
    }
    
    if (this.waterOverlay) {
      this.waterOverlay.tilePosition.x += 0.2 * deltaTime;
      this.waterOverlay.tilePosition.y += 0.1 * deltaTime;
    }
    
    // Update based on mode
    if (this.isSwimmingMode && this.swimmingSystem) {
      // Update swimming system
      this.swimmingSystem.update(deltaTime);
      this.updateSwimmingUI();
    } else {
      // Update static fish with swimming behavior
      this.fishes.forEach(fish => {
        fish.update(deltaTime);
        
        // Wrap around the screen
        const padding = 100;
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        
        if (fish.x > width + padding) fish.x -= width + padding * 2;
        if (fish.x < -padding) fish.x += width + padding * 2;
        if (fish.y > height + padding) fish.y -= height + padding * 2;
        if (fish.y < -padding) fish.y += height + padding * 2;
      });
    }
  }

  /**
   * Generates a new artistic fish with enhancements
   */
  private generateNewFish(): void {
    if (this.fishes.length >= this.fishLimit) {
      // Remove oldest fish
      const oldFish = this.fishes.shift();
      if (oldFish) {
        this.aquarium.removeChild(oldFish);
        oldFish.destroy();
      }
    }
    
    const dna = this.generateFishDNA();
    const fish = new ArtisticFishPixi(dna, this.app);
    
    // Set as static for performance if in gallery mode
    if (!this.isSwimmingMode) {
      fish.setStatic(true);
    }
    
    // Center position with some randomness
    const margin = 200;
    fish.position.set(
      margin + Math.random() * (this.app.screen.width - margin * 2),
      margin + Math.random() * (this.app.screen.height - margin * 2)
    );
    
    this.aquarium.addChild(fish);
    this.fishes.push(fish);
    
    // Add to gallery
    this.gallery.unshift(dna);
    if (this.gallery.length > 50) {
      this.gallery.pop();
    }
    
    // Auto-select new fish
    this.selectFish(fish);
    
    // Special effect for rare fish
    if (['legendary', 'mythic', 'cosmic'].includes(dna.rarity)) {
      this.createSpawnEffect(fish.position, RARITY_CONFIG[dna.rarity].color);
    }
  }

  /**
   * Enhanced spawn effect
   */
  private createSpawnEffect(position: PIXI.PointData, color: number): void {
    const effect = new PIXI.Container();
    effect.position.copyFrom(position);
    
    // Create expanding rings with displacement
    for (let i = 0; i < 3; i++) {
      const ring = new PIXI.Graphics();
      ring.circle(0, 0, 50);
      ring.stroke({ color, width: 3, alpha: 0.8 });
      
      effect.addChild(ring);
      
      // Animate with GPU acceleration
      const delay = i * 100;
      setTimeout(() => {
        const startTime = Date.now();
        const ticker = (t: PIXI.Ticker) => {
          const elapsed = Date.now() - startTime;
          const progress = elapsed / 1000;
          
          ring.scale.set(1 + progress * 3);
          ring.alpha = 1 - progress;
          
          if (progress >= 1) {
            effect.removeChild(ring);
            this.app.ticker.remove(ticker);
            
            if (effect.children.length === 0) {
              this.mainContainer.removeChild(effect);
            }
          }
        };
        
        this.app.ticker.add(ticker);
      }, delay);
    }
    
    // Add particle burst for cosmic fish
    if (color === RARITY_CONFIG.cosmic.color) {
      this.createCosmicBurst(position);
    }
    
    this.mainContainer.addChild(effect);
  }

  /**
   * Creates cosmic burst effect
   */
  private createCosmicBurst(position: PIXI.PointData): void {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new PIXI.Graphics();
      particle.star(0, 0, 5, 3, 1.5);
      particle.fill({ color: 0xffffff, alpha: 1 });
      
      particle.position.copyFrom(position);
      particle.scale.set(0.5);
      
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.mainContainer.addChild(particle);
      
      // Animate particle
      const ticker = (t: PIXI.Ticker) => {
        particle.x += vx * t.deltaTime * 0.06;
        particle.y += vy * t.deltaTime * 0.06;
        particle.alpha -= 0.02 * t.deltaTime * 0.06;
        particle.scale.x *= 0.98;
        particle.scale.y *= 0.98;
        particle.rotation += 0.1 * t.deltaTime * 0.06;
        
        if (particle.alpha <= 0) {
          this.mainContainer.removeChild(particle);
          this.app.ticker.remove(ticker);
        }
      };
      
      this.app.ticker.add(ticker);
    }
  }

  /**
   * Setup containers with optimization
   */
  private setupContainers(): void {
    // Background layer (static elements)
    this.backgroundLayer = new PIXI.Container();
    this.app.stage.addChild(this.backgroundLayer);
    
    // Main container (affected by water displacement)
    this.mainContainer = new PIXI.Container();
    this.app.stage.addChild(this.mainContainer);
    
    // Aquarium container for fish
    this.aquarium = new PIXI.Container();
    this.mainContainer.addChild(this.aquarium);
    
    // UI Layer (not affected by displacement)
    this.uiLayer = new PIXI.Container();
    this.app.stage.addChild(this.uiLayer);
  }

  /**
   * Creates ocean environment with optimizations
   */
  private async createOceanEnvironment(): Promise<void> {
    // Create gradient background using cached texture
    const gradientKey = 'ocean-gradient';
    const gradientTexture = GeometryCache.getBakedTexture(
      this.app.renderer,
      gradientKey,
      (graphics) => {
        const height = this.app.screen.height;
        graphics.rect(0, 0, 1, height);
        
        // Create gradient fill
        const gradient = graphics.context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#000814');
        gradient.addColorStop(0.5, '#001a33');
        gradient.addColorStop(1, '#003366');
        
        graphics.context.fillStyle = gradient;
        graphics.fill();
      }
    );
    
    const gradientSprite = new PIXI.TilingSprite({
      texture: gradientTexture,
      width: this.app.screen.width,
      height: this.app.screen.height
    });
    
    this.backgroundLayer.addChild(gradientSprite);
    
    // Create water displacement effect
    await this.createWaterEffect();
    
    // Add ambient particles with ParticleContainer
    this.createAmbientParticles();
  }

  /**
   * Creates ambient particles using ParticleContainer
   */
  private createAmbientParticles(): void {
    const particleContainer = new PIXI.ParticleContainer(100, {
      position: true,
      scale: true,
      alpha: true
    });
    
    // Create particle texture
    const particleTexture = GeometryCache.getBakedTexture(
      this.app.renderer,
      'ambient-particle',
      (graphics) => {
        graphics.circle(0, 0, 5);
        graphics.fill({ color: 0xffffff });
      }
    );
    
    for (let i = 0; i < 50; i++) {
      const particle = new PIXI.Sprite(particleTexture);
      particle.anchor.set(0.5);
      particle.position.set(
        Math.random() * this.app.screen.width,
        this.app.screen.height + 50
      );
      
      const scale = 0.1 + Math.random() * 0.3;
      particle.scale.set(scale);
      particle.alpha = 0.1 + Math.random() * 0.1;
      
      (particle as any).speed = 0.2 + Math.random() * 0.5;
      (particle as any).wobble = Math.random() * 2 - 1;
      
      particleContainer.addChild(particle);
    }
    
    this.backgroundLayer.addChild(particleContainer);
    
    // Animate particles
    this.app.ticker.add((t: PIXI.Ticker) => {
      particleContainer.children.forEach((particle: any) => {
        particle.y -= particle.speed;
        particle.x += Math.sin(particle.y * 0.01) * particle.wobble;
        
        if (particle.y < -50) {
          particle.y = this.app.screen.height + 50;
          particle.x = Math.random() * this.app.screen.width;
        }
      });
    });
  }

  /**
   * Creates water displacement effect with optimization
   */
  private async createWaterEffect(): Promise<void> {
    // Create displacement texture with caching
    const displacementTexture = GeometryCache.getBakedTexture(
      this.app.renderer,
      'water-displacement',
      (graphics) => {
        const size = 256;
        graphics.rect(0, 0, size, size);
        
        // Create Perlin-noise-like pattern
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const radius = 10 + Math.random() * 20;
          
          graphics.circle(x, y, radius);
          graphics.fill({
            color: Math.random() > 0.5 ? 0xff0000 : 0x00ff00,
            alpha: 0.5
          });
        }
      }
    );
    
    this.displacementSprite = new PIXI.Sprite(displacementTexture);
    this.displacementSprite.texture.source.wrapMode = 'repeat';
    this.displacementSprite.scale.set(2);
    
    this.displacementFilter = new PIXI.DisplacementFilter({
      sprite: this.displacementSprite,
      scale: 20,
    });
    
    this.mainContainer.addChild(this.displacementSprite);
    this.mainContainer.filters = [this.displacementFilter];
    
    // Water overlay for caustics
    const waterTexture = GeometryCache.getBakedTexture(
      this.app.renderer,
      'water-overlay',
      (graphics) => {
        const size = 128;
        
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const radius = 10 + Math.random() * 20;
          
          graphics.circle(x, y, radius);
          graphics.fill({ color: 0xffffff, alpha: 0.1 });
        }
      }
    );
    
    this.waterOverlay = new PIXI.TilingSprite({
      texture: waterTexture,
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    this.waterOverlay.alpha = 0.1;
    this.waterOverlay.blendMode = 'add';
    
    this.mainContainer.addChild(this.waterOverlay);
  }

  /**
   * Creates UI elements
   */
  private createUI(): void {
    // Generate button with new text
    this.generateButton = this.createButton(
      '✨ Generate Digital Artefact',
      50,
      50,
      () => this.generateNewFish()
    );
    this.uiLayer.addChild(this.generateButton);
    
    // Gallery button
    this.galleryButton = this.createButton(
      '🖼️ Collection Archive',
      50,
      120,
      () => this.toggleGallery()
    );
    this.uiLayer.addChild(this.galleryButton);
    
    // Spawner mode button
    const swimmingButton = this.createButton(
      '🌊 Toggle Ecosystem',
      50,
      190,
      () => this.toggleSwimmingMode()
    );
    this.uiLayer.addChild(swimmingButton);
    
    // Performance toggle button
    const perfButton = this.createButton(
      '📊 Performance Stats',
      50,
      260,
      () => {
        this.statsPanel.visible = !this.statsPanel.visible;
      }
    );
    this.uiLayer.addChild(perfButton);
    
    // Info panel
    this.createInfoPanel();
  }

  /**
   * Creates a styled button
   */
  private createButton(
    text: string,
    x: number,
    y: number,
    onClick: () => void
  ): PIXI.Container {
    const button = new PIXI.Container();
    
    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 250, 50, 25);
    bg.fill({ 
      color: 0x6600cc,
      alpha: 0.8 
    });
    bg.stroke({
      color: 0x9900ff,
      width: 2
    });
    
    // Text
    const label = new PIXI.Text({
      text,
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffffff,
        dropShadow: {
          distance: 2,
          angle: 45,
          blur: 2,
          alpha: 0.5
        }
      }
    });
    label.anchor.set(0.5);
    label.position.set(125, 25);
    
    button.addChild(bg);
    button.addChild(label);
    button.position.set(x, y);
    
    // Interactivity
    button.eventMode = 'static';
    button.cursor = 'pointer';
    
    button.on('pointerdown', onClick);
    button.on('pointerover', () => {
      bg.tint = 0xcccccc;
      button.scale.set(1.05);
    });
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
      button.scale.set(1);
    });
    
    return button;
  }

  /**
   * Creates info panel
   */
  private createInfoPanel(): void {
    this.infoPanel = new PIXI.Container();
    this.infoPanel.visible = false;
    
    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 400, 350, 15);
    bg.fill({ color: 0x000000, alpha: 0.8 });
    bg.stroke({ color: 0x00ccff, width: 2 });
    
    this.infoPanel.addChild(bg);
    this.infoPanel.position.set(
      this.app.screen.width - 450,
      50
    );
    
    this.uiLayer.addChild(this.infoPanel);
  }

  /**
   * Setup interactions
   */
  private setupInteractions(): void {
    // Click on fish to select
    this.aquarium.eventMode = 'static';
    
    this.aquarium.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      const point = event.global;
      
      // Find clicked fish
      for (const fish of this.fishes) {
        const bounds = fish.getBounds();
        if (point.x >= bounds.x && 
            point.x <= bounds.x + bounds.width &&
            point.y >= bounds.y && 
            point.y <= bounds.y + bounds.height) {
          this.selectFish(fish);
          break;
        }
      }
    });
  }

  /**
   * Selects a fish and shows its info
   */
  private selectFish(fish: ArtisticFishPixi): void {
    // Deselect previous
    if (this.selectedFish) {
      const prevScaleFactor = 0.3 + (this.selectedFish.dna.genes.size * 0.4);
      this.selectedFish.scale.set(prevScaleFactor);
      this.selectedFish.setStatic(true);
    }
    
    this.selectedFish = fish;
    
    // Scale up selected fish
    const scaleFactor = 0.3 + (fish.dna.genes.size * 0.4);
    fish.scale.set(scaleFactor * 1.2);
    fish.setStatic(false); // Enable animations for selected fish
    
    this.updateInfoPanel(fish);
  }

  /**
   * Toggles swimming mode
   */
  private toggleSwimmingMode(): void {
    this.isSwimmingMode = !this.isSwimmingMode;
    
    if (this.isSwimmingMode) {
      // Clear static fish
      this.fishes.forEach(fish => {
        this.aquarium.removeChild(fish);
        fish.destroy();
      });
      this.fishes = [];
      
      // Clear geometry cache for memory
      GeometryCache.clearCache();
      
      // Hide info panel
      this.infoPanel.visible = false;
      
      // Show swimming UI
      this.showSwimmingUI();
    } else {
      // Clear swimming fish
      if (this.swimmingSystem) {
        this.swimmingSystem.clearAllFish();
      }
      
      // Hide swimming UI
      this.hideSwimmingUI();
      
      // Generate some static fish
      this.generateInitialFish();
    }
  }

  /**
   * Shows swimming mode UI
   */
  private showSwimmingUI(): void {
    const swimmingInfo = new PIXI.Container();
    swimmingInfo.name = 'swimmingInfo';
    
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 280, 120, 15);
    bg.fill({ color: 0x000000, alpha: 0.7 });
    bg.stroke({ color: 0x00ffff, width: 2 });
    
    swimmingInfo.addChild(bg);
    
    const title = new PIXI.Text({
      text: '🌊 Living Ecosystem',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0x00ffff
      }
    });
    title.position.set(20, 15);
    swimmingInfo.addChild(title);
    
    const fishCount = new PIXI.Text({
      text: 'Active Entities: 0',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xffffff
      }
    });
    fishCount.name = 'fishCount';
    fishCount.position.set(20, 50);
    swimmingInfo.addChild(fishCount);
    
    const bossStatus = new PIXI.Text({
      text: 'Apex Predator: Dormant',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xffd700
      }
    });
    bossStatus.name = 'bossStatus';
    bossStatus.position.set(20, 80);
    swimmingInfo.addChild(bossStatus);
    
    swimmingInfo.position.set(this.app.screen.width - 320, 50);
    this.uiLayer.addChild(swimmingInfo);
  }

  /**
   * Hides swimming mode UI
   */
  private hideSwimmingUI(): void {
    const swimmingInfo = this.uiLayer.getChildByName('swimmingInfo');
    if (swimmingInfo) {
      this.uiLayer.removeChild(swimmingInfo);
      swimmingInfo.destroy({ children: true });
    }
  }

  /**
   * Updates swimming UI
   */
  private updateSwimmingUI(): void {
    if (!this.swimmingSystem || !this.isSwimmingMode) return;
    
    const swimmingInfo = this.uiLayer.getChildByName('swimmingInfo') as PIXI.Container;
    if (!swimmingInfo) return;
    
    const fishCount = swimmingInfo.getChildByName('fishCount') as PIXI.Text;
    const bossStatus = swimmingInfo.getChildByName('bossStatus') as PIXI.Text;
    
    if (fishCount) {
      fishCount.text = `Active Entities: ${this.swimmingSystem.getActiveFishCount()}`;
    }
    
    if (bossStatus) {
      bossStatus.text = `Apex Predator: ${this.swimmingSystem.isBossActive() ? '⚠️ ACTIVE!' : 'Dormant'}`;
      bossStatus.style.fill = this.swimmingSystem.isBossActive() ? 0xff0000 : 0xffd700;
    }
  }

  /**
   * Generates initial fish
   */
  private generateInitialFish(): void {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.generateNewFish(), i * 200);
    }
  }

  /**
   * Calculates rarity based on weighted probabilities
   */
  private calculateRarity(): FishDNA['rarity'] {
    const roll = Math.random() * 100;
    let cumulative = 0;
    
    for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
      cumulative += config.probability;
      if (roll < cumulative) {
        return rarity as FishDNA['rarity'];
      }
    }
    
    return 'common';
  }

  /**
   * Generates traits with enhanced variety
   */
  private generateTraits(template: FishTemplate, rarity: string): string[] {
    const traits = [...(template.features.special || [])];
    
    // Enhanced rarity-specific traits
    const rarityTraits: Record<string, string[]> = {
      uncommon: ['shimmer', 'rare_pattern', 'enhanced_fins'],
      rare: ['aura', 'special_eyes', 'unique_fins', 'color_shift'],
      epic: ['particle_trail', 'color_shift', 'glow', 'morphing_pattern'],
      legendary: ['crown', 'ancient_marks', 'divine_light', 'reality_bend'],
      mythic: ['reality_warp', 'time_distortion', 'soul_visible', 'dimension_rift'],
      cosmic: ['universe_inside', 'dimension_rift', 'god_particle', 'infinity_loop']
    };
    
    if (rarityTraits[rarity]) {
      const availableTraits = rarityTraits[rarity];
      const traitCount = Math.min(
        availableTraits.length,
        rarity === 'cosmic' ? 4 : rarity === 'mythic' ? 3 : rarity === 'legendary' ? 2 : 1
      );
      
      for (let i = 0; i < traitCount; i++) {
        const trait = availableTraits[Math.floor(Math.random() * availableTraits.length)];
        if (!traits.includes(trait)) {
          traits.push(trait);
        }
      }
    }
    
    return traits;
  }

  /**
   * Generates mutations with enhanced variety
   */
  private generateMutations(rarity: string): string[] {
    const mutations: string[] = [];
    const possibleMutations = [
      'albino', 'melanistic', 'iridescent', 'translucent',
      'bioluminescent', 'prismatic', 'chromatic', 'metallic',
      'holographic', 'quantum', 'ethereal', 'celestial',
      'void-touched', 'crystal-infused', 'plasma-charged',
      'nano-enhanced', 'photonic', 'dark-matter', 'antimatter'
    ];
    
    const mutationCounts: Record<string, number> = {
      common: 0,
      uncommon: Math.random() > 0.7 ? 1 : 0,
      rare: 1,
      epic: 1 + (Math.random() > 0.5 ? 1 : 0),
      legendary: 2,
      mythic: 3,
      cosmic: 4
    };
    
    const count = mutationCounts[rarity] || 0;
    
    for (let i = 0; i < count; i++) {
      const mutation = possibleMutations[Math.floor(Math.random() * possibleMutations.length)];
      if (!mutations.includes(mutation)) {
        mutations.push(mutation);
      }
    }
    
    return mutations;
  }

  /**
   * Shows gallery view
   */
  private showGallery(): void {
    // Implementation remains similar but with enhanced UI
    this.aquarium.visible = false;
    
    const galleryContainer = new PIXI.Container();
    galleryContainer.name = 'gallery';
    
    // Background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.fill({ color: 0x000000, alpha: 0.9 });
    galleryContainer.addChild(bg);
    
    // Title
    const title = new PIXI.Text({
      text: 'Digital Artefact Archive',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0xffffff,
        dropShadow: {
          distance: 4,
          angle: 45,
          blur: 4,
          alpha: 0.8
        }
      }
    });
    title.anchor.set(0.5, 0);
    title.position.set(this.app.screen.width / 2, 50);
    galleryContainer.addChild(title);
    
    // Create grid of fish
    const gridCols = 6;
    const cellSize = 150;
    const padding = 20;
    const startX = (this.app.screen.width - (gridCols * (cellSize + padding))) / 2;
    const startY = 150;
    
    this.gallery.forEach((fishDNA, index) => {
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);
      
      const cell = this.createGalleryCell(fishDNA);
      cell.position.set(
        startX + col * (cellSize + padding),
        startY + row * (cellSize + padding)
      );
      
      galleryContainer.addChild(cell);
    });
    
    this.uiLayer.addChild(galleryContainer);
  }

  /**
   * Creates gallery cell
   */
  private createGalleryCell(fishDNA: FishDNA): PIXI.Container {
    const cell = new PIXI.Container();
    const rarityConfig = RARITY_CONFIG[fishDNA.rarity];
    
    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 140, 140, 10);
    bg.fill({ color: 0x1a1a1a });
    bg.stroke({ 
      color: rarityConfig.color,
      width: 2,
      alpha: 0.5
    });
    
    // Create mini fish preview
    const fishPreview = new ArtisticFishPixi(fishDNA, this.app);
    fishPreview.position.set(70, 60);
    fishPreview.setStatic(true); // Optimize for gallery
    const previewScale = 0.15 + (fishDNA.genes.size * 0.1);
    fishPreview.scale.set(previewScale);
    
    cell.addChild(bg);
    cell.addChild(fishPreview);
    
    // Designation label
    const designationLabel = new PIXI.Text({
      text: `${rarityConfig.designation}-${fishDNA.id.substr(-3)}`,
      style: {
        fontFamily: 'monospace',
        fontSize: 12,
        fontWeight: 'bold',
        fill: rarityConfig.color
      }
    });
    designationLabel.anchor.set(0.5);
    designationLabel.position.set(70, 120);
    cell.addChild(designationLabel);
    
    // Make interactive
    cell.eventMode = 'static';
    cell.cursor = 'pointer';
    
    cell.on('pointerover', () => {
      bg.tint = 0xcccccc;
      cell.scale.set(1.1);
    });
    
    cell.on('pointerout', () => {
      bg.tint = 0xffffff;
      cell.scale.set(1);
    });
    
    cell.on('pointerdown', () => {
      this.hideGallery();
      this.spawnFromGallery(fishDNA);
    });
    
    return cell;
  }

  /**
   * Hides gallery
   */
  private hideGallery(): void {
    const gallery = this.uiLayer.getChildByName('gallery');
    if (gallery) {
      this.uiLayer.removeChild(gallery);
      gallery.destroy({ children: true });
    }
    
    this.aquarium.visible = true;
    this.isGalleryMode = false;
  }

  /**
   * Spawns fish from gallery
   */
  private spawnFromGallery(fishDNA: FishDNA): void {
    const fish = new ArtisticFishPixi(fishDNA, this.app);
    
    fish.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2
    );
    
    this.aquarium.addChild(fish);
    this.fishes.push(fish);
    
    this.selectFish(fish);
    
    if (['legendary', 'mythic', 'cosmic'].includes(fishDNA.rarity)) {
      this.createSpawnEffect(fish.position, RARITY_CONFIG[fishDNA.rarity].color);
    }
  }

  /**
   * Toggles gallery
   */
  private toggleGallery(): void {
    this.isGalleryMode = !this.isGalleryMode;
    
    if (this.isGalleryMode) {
      this.showGallery();
    } else {
      this.hideGallery();
    }
  }

  /**
   * Handles window resize
   */
  private onResize(): void {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    
    // Update water overlay size
    if (this.waterOverlay) {
      this.waterOverlay.width = window.innerWidth;
      this.waterOverlay.height = window.innerHeight;
    }
    
    // Reposition UI elements
    if (this.infoPanel) {
      this.infoPanel.position.set(
        window.innerWidth - 450,
        50
      );
    }
    
    if (this.statsPanel) {
      this.statsPanel.position.set(10, window.innerHeight - 100);
    }
    
    // Update swimming UI position
    const swimmingInfo = this.uiLayer.getChildByName('swimmingInfo');
    if (swimmingInfo) {
      swimmingInfo.position.set(window.innerWidth - 320, 50);
    }
  }

  /**
   * Color utility functions
   */
  private shiftHue(hex: string, shift: number): string {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.h = (hsl.h + shift) % 360;
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
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
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
    
    // Clear caches
    GeometryCache.clearCache();
    
    // Destroy app
    this.app.destroy(true);
  }
}
