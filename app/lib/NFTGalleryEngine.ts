/**
 * NFTGalleryEngine.ts
 * 
 * Main game engine for the NFT fish gallery
 * Manages fish generation, display, and interactions
 * 
 * @version 1.0.0
 * @requires pixi.js ^8.0.0
 * @path app/lib/NFTGalleryEngine.ts
 */

import * as PIXI from 'pixi.js';
import { ArtisticFishPixi, FishDNA, FishTemplate } from './ArtisticFishPixi';
import { FishSpawnerSystem } from './FishSpawnerSystem';

/**
 * Rarity configuration with probabilities and visual settings
 */
const RARITY_CONFIG = {
  common: { 
    probability: 50, 
    color: 0xffffff, 
    glow: 0xcccccc,
    particleCount: 0,
    value: 10
  },
  uncommon: { 
    probability: 30, 
    color: 0x00ff00, 
    glow: 0x00ff00,
    particleCount: 0,
    value: 50
  },
  rare: { 
    probability: 13, 
    color: 0x0099ff, 
    glow: 0x0099ff,
    particleCount: 5,
    value: 200
  },
  epic: { 
    probability: 5, 
    color: 0xcc00ff, 
    glow: 0xcc00ff,
    particleCount: 10,
    value: 500
  },
  legendary: { 
    probability: 1.5, 
    color: 0xffaa00, 
    glow: 0xffaa00,
    particleCount: 15,
    value: 2000
  },
  mythic: { 
    probability: 0.4, 
    color: 0xff00aa, 
    glow: 0xff00aa,
    particleCount: 20,
    value: 10000
  },
  cosmic: { 
    probability: 0.1, 
    color: 0xffffff, 
    glow: 0xffffff,
    particleCount: 30,
    value: 100000
  }
};

/**
 * Fish template definitions
 */
const FISH_TEMPLATES: Record<string, FishTemplate> = {
  goldfish: {
    name: 'goldfish',
    displayName: 'Golden Koi',
    description: 'Elegant flowing fins',
    bodyShape: 'round',
    baseColors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#FF6347'
    },
    features: {
      bodyRatio: { w: 1.2, h: 1.0 },
      headCurve: 'round',
      tailType: 'double',
      finStyle: 'flowing'
    }
  },
  cosmicWhale: {
    name: 'cosmicWhale',
    displayName: 'Cosmic Whale',
    description: 'Born from stardust',
    bodyShape: 'massive',
    baseColors: {
      primary: '#1a0033',
      secondary: '#6600cc',
      accent: '#ff00ff'
    },
    features: {
      bodyRatio: { w: 3.5, h: 1.8 },
      headCurve: 'majestic',
      tailType: 'cosmic',
      finStyle: 'ethereal',
      special: ['starfield', 'nebula']
    }
  },
  crystalShark: {
    name: 'crystalShark',
    displayName: 'Crystal Predator',
    description: 'Transparent apex hunter',
    bodyShape: 'streamlined',
    baseColors: {
      primary: '#00ffff',
      secondary: '#0099ff',
      accent: '#ffffff'
    },
    features: {
      bodyRatio: { w: 3.0, h: 0.8 },
      headCurve: 'pointed',
      tailType: 'crescent',
      finStyle: 'crystalline',
      special: ['refraction', 'transparency']
    }
  },
  voidAngel: {
    name: 'voidAngel',
    displayName: 'Void Angel',
    description: 'Darkness incarnate',
    bodyShape: 'diamond',
    baseColors: {
      primary: '#000000',
      secondary: '#330066',
      accent: '#9900ff'
    },
    features: {
      bodyRatio: { w: 0.8, h: 1.5 },
      headCurve: 'angular',
      tailType: 'ethereal',
      finStyle: 'shadow',
      special: ['void_eyes', 'dark_aura']
    }
  },
  neonTetra: {
    name: 'neonTetra',
    displayName: 'Neon Spirit',
    description: 'Electric soul',
    bodyShape: 'streamlined',
    baseColors: {
      primary: '#00ff00',
      secondary: '#ff00ff',
      accent: '#00ffff'
    },
    features: {
      bodyRatio: { w: 2.0, h: 0.6 },
      headCurve: 'smooth',
      tailType: 'electric',
      finStyle: 'neon',
      special: ['electric_veins', 'glow_pulse']
    }
  },
  ancientDragon: {
    name: 'ancientDragon',
    displayName: 'Dragon Koi',
    description: 'Mythical ancestor',
    bodyShape: 'serpentine',
    baseColors: {
      primary: '#ff0000',
      secondary: '#ffaa00',
      accent: '#ffff00'
    },
    features: {
      bodyRatio: { w: 4.0, h: 1.0 },
      headCurve: 'dragon',
      tailType: 'legendary',
      finStyle: 'ancient',
      special: ['scales_shimmer', 'fire_breath', 'whiskers']
    }
  }
};

/**
 * Main NFT Gallery Engine class
 */
export class NFTGalleryEngine {
  private app!: PIXI.Application;
  private mainContainer!: PIXI.Container;
  private aquarium!: PIXI.Container;
  private uiLayer!: PIXI.Container;
  private backgroundLayer!: PIXI.Container;
  
  // Fish management
  private fishes: ArtisticFishPixi[] = [];
  private selectedFish: ArtisticFishPixi | null = null;
  private fishLimit: number = 20;
  
  // Spawner system
  private spawnerSystem: FishSpawnerSystem | null = null;
  private isSpawnerMode: boolean = false;
  
  // UI elements
  private infoPanel!: PIXI.Container;
  private generateButton!: PIXI.Container;
  private galleryButton!: PIXI.Container;
  
  // Water effects
  private waterOverlay!: PIXI.TilingSprite;
  private displacementSprite!: PIXI.Sprite;
  private displacementFilter!: PIXI.DisplacementFilter;
  
  // Gallery state
  private isGalleryMode: boolean = false;
  private gallery: FishDNA[] = [];
  
  constructor(private canvas: HTMLCanvasElement) {}

  /**
   * Initializes the PIXI application and all game systems
   */
  async init(): Promise<void> {
    // Create PIXI Application
    this.app = new PIXI.Application();
    
    await this.app.init({
      canvas: this.canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000814,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Setup container hierarchy
    this.setupContainers();
    
    // Create ocean environment
    await this.createOceanEnvironment();
    
    // Create UI
    this.createUI();
    
    // Setup interactions
    this.setupInteractions();
    
    // Start game loop
    this.app.ticker.add(this.update, this);
    
    // Handle resize
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Generate initial fish
    this.generateInitialFish();
  }

  /**
   * Sets up the container hierarchy
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
   * Creates the ocean environment with effects
   */
  private async createOceanEnvironment(): Promise<void> {
    // Create gradient background
    const gradient = new PIXI.Graphics();
    gradient.rect(0, 0, this.app.screen.width, this.app.screen.height);
    gradient.fill({
      color: 0x000814,
    });
    
    // Add gradient overlay
    const gradientTexture = await this.createGradientTexture();
    const gradientSprite = new PIXI.Sprite(gradientTexture);
    gradientSprite.width = this.app.screen.width;
    gradientSprite.height = this.app.screen.height;
    
    this.backgroundLayer.addChild(gradient);
    this.backgroundLayer.addChild(gradientSprite);
    
    // Create water displacement effect
    await this.createWaterEffect();
    
    // Add ambient particles
    this.createAmbientParticles();
  }

  /**
   * Creates gradient texture
   */
  private async createGradientTexture(): Promise<PIXI.Texture> {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#000814');
    gradient.addColorStop(0.5, '#001a33');
    gradient.addColorStop(1, '#003366');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
    
    return PIXI.Texture.from(canvas);
  }

  /**
   * Creates water displacement effect
   */
  private async createWaterEffect(): Promise<void> {
    // Create displacement texture
    const displacementTexture = await this.createDisplacementTexture();
    
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
    const waterTexture = await this.createWaterOverlayTexture();
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
   * Creates displacement texture for water effect
   */
  private async createDisplacementTexture(): Promise<PIXI.Texture> {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        
        // Create smooth noise
        const value1 = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 127 + 127;
        const value2 = Math.sin(x * 0.02 + 50) * Math.cos(y * 0.02 + 50) * 127 + 127;
        
        data[i] = value1;
        data[i + 1] = value2;
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return PIXI.Texture.from(canvas);
  }

  /**
   * Creates water overlay texture
   */
  private async createWaterOverlayTexture(): Promise<PIXI.Texture> {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Create caustics pattern
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 10 + Math.random() * 20;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    return PIXI.Texture.from(canvas);
  }

  /**
   * Creates ambient particles
   */
  private createAmbientParticles(): void {
    const particleContainer = new PIXI.Container();
    
    for (let i = 0; i < 50; i++) {
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, 1 + Math.random() * 2);
      particle.fill({ color: 0xffffff, alpha: 0.1 + Math.random() * 0.1 });
      
      particle.x = Math.random() * this.app.screen.width;
      particle.y = this.app.screen.height + 50;
      
      (particle as any).speed = 0.2 + Math.random() * 0.5;
      (particle as any).wobble = Math.random() * 2 - 1;
      
      particleContainer.addChild(particle);
    }
    
    this.backgroundLayer.addChild(particleContainer);
    
    // Animate particles
    this.app.ticker.add(() => {
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
   * Creates UI elements
   */
  private createUI(): void {
    // Generate button
    this.generateButton = this.createButton(
      '✨ Generate Artistic Fish',
      50,
      50,
      () => this.generateNewFish()
    );
    this.uiLayer.addChild(this.generateButton);
    
    // Gallery button
    this.galleryButton = this.createButton(
      '🖼️ View Gallery',
      50,
      120,
      () => this.toggleGallery()
    );
    this.uiLayer.addChild(this.galleryButton);
    
    // Spawner mode button
    const spawnerButton = this.createButton(
      '🎮 Fishing Mode',
      50,
      190,
      () => this.toggleSpawnerMode()
    );
    this.uiLayer.addChild(spawnerButton);
    
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
   * Creates info panel for displaying fish details
   */
  private createInfoPanel(): void {
    this.infoPanel = new PIXI.Container();
    this.infoPanel.visible = false;
    
    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 400, 300, 15);
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
   * Updates info panel with fish data
   */
  private updateInfoPanel(fish: ArtisticFishPixi): void {
    // Clear existing content
    while (this.infoPanel.children.length > 1) {
      this.infoPanel.removeChildAt(1);
    }
    
    const template = FISH_TEMPLATES[fish.dna.species];
    const rarityConfig = RARITY_CONFIG[fish.dna.rarity];
    
    // Title
    const title = new PIXI.Text({
      text: template.displayName,
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: rarityConfig.color
      }
    });
    title.position.set(20, 20);
    this.infoPanel.addChild(title);
    
    // ID
    const id = new PIXI.Text({
      text: `ID: ${fish.dna.id}`,
      style: {
        fontFamily: 'monospace',
        fontSize: 14,
        fill: 0xcccccc
      }
    });
    id.position.set(20, 55);
    this.infoPanel.addChild(id);
    
    // Rarity
    const rarity = new PIXI.Text({
      text: `Rarity: ${fish.dna.rarity.toUpperCase()}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: rarityConfig.color
      }
    });
    rarity.position.set(20, 85);
    this.infoPanel.addChild(rarity);
    
    // Value
    const value = new PIXI.Text({
      text: `Value: ${rarityConfig.value} 💎`,
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xffd700
      }
    });
    value.position.set(20, 115);
    this.infoPanel.addChild(value);
    
    // Pattern
    const pattern = new PIXI.Text({
      text: `Pattern: ${fish.dna.pattern}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff
      }
    });
    pattern.position.set(20, 145);
    this.infoPanel.addChild(pattern);
    
    // Traits
    if (fish.dna.traits.length > 0) {
      const traitsTitle = new PIXI.Text({
        text: 'Special Traits:',
        style: {
          fontFamily: 'Arial',
          fontSize: 14,
          fill: 0xcccccc
        }
      });
      traitsTitle.position.set(20, 175);
      this.infoPanel.addChild(traitsTitle);
      
      fish.dna.traits.forEach((trait, i) => {
        const traitText = new PIXI.Text({
          text: `• ${trait.replace(/_/g, ' ')}`,
          style: {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0x00ff00
          }
        });
        traitText.position.set(30, 195 + i * 15);
        this.infoPanel.addChild(traitText);
      });
    }
    
    // Mutations
    if (fish.dna.mutations.length > 0) {
      const mutationsY = 195 + fish.dna.traits.length * 15 + 10;
      const mutationsTitle = new PIXI.Text({
        text: 'Mutations:',
        style: {
          fontFamily: 'Arial',
          fontSize: 14,
          fill: 0xcccccc
        }
      });
      mutationsTitle.position.set(20, mutationsY);
      this.infoPanel.addChild(mutationsTitle);
      
      const mutationsText = new PIXI.Text({
        text: fish.dna.mutations.map(m => `✨ ${m}`).join('  '),
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          fill: 0xff00ff
        }
      });
      mutationsText.position.set(30, mutationsY + 20);
      this.infoPanel.addChild(mutationsText);
    }
    
    this.infoPanel.visible = true;
  }

  /**
   * Sets up interactions
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
      // Reset to original scale (considering the fish's gene-based scale)
      const prevScaleFactor = 0.3 + (this.selectedFish.dna.genes.size * 0.4);
      this.selectedFish.scale.set(prevScaleFactor);
    }
    
    this.selectedFish = fish;
    
    // Scale up selected fish
    const scaleFactor = 0.3 + (fish.dna.genes.size * 0.4);
    fish.scale.set(scaleFactor * 1.2);
    
    this.updateInfoPanel(fish);
  }

  /**
   * Generates a new artistic fish
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
   * Creates spawn effect for rare fish
   */
  private createSpawnEffect(position: PIXI.PointData, color: number): void {
    const effect = new PIXI.Container();
    effect.position.copyFrom(position);
    
    // Create expanding rings
    for (let i = 0; i < 3; i++) {
      const ring = new PIXI.Graphics();
      ring.circle(0, 0, 50);
      ring.stroke({ color, width: 3, alpha: 0.8 });
      
      effect.addChild(ring);
      
      // Animate
      const delay = i * 100;
      setTimeout(() => {
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = elapsed / 1000;
          
          ring.scale.set(1 + progress * 3);
          ring.alpha = 1 - progress;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            effect.removeChild(ring);
          }
        };
        animate();
      }, delay);
    }
    
    this.mainContainer.addChild(effect);
    
    // Clean up after animation
    setTimeout(() => {
      this.mainContainer.removeChild(effect);
    }, 2000);
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
   * Generates fish DNA
   */
  private generateFishDNA(): FishDNA {
    // Select random template
    const templateKeys = Object.keys(FISH_TEMPLATES);
    const templateKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
    const template = FISH_TEMPLATES[templateKey];
    
    // Calculate rarity
    const rarity = this.calculateRarity();
    
    // Generate colors with mutations
    const colors: FishDNA['colors'] = { 
      ...template.baseColors,
      glow: undefined,
      shimmer: undefined
    };
    
    if (rarity !== 'common') {
      const hueShift = Math.random() * 360;
      colors.primary = this.shiftHue(colors.primary, hueShift);
      colors.secondary = this.shiftHue(colors.secondary, hueShift);
      colors.accent = this.shiftHue(colors.accent, hueShift);
      
      if (['legendary', 'mythic', 'cosmic'].includes(rarity)) {
        colors.glow = '#' + RARITY_CONFIG[rarity].glow.toString(16).padStart(6, '0');
      }
    }
    
    // Generate pattern
    const patterns = [
      'stripes', 'dots', 'scales', 'waves', 'spirals',
      'fractals', 'circuits', 'crystals', 'stars', 'void',
      'gradient', 'noise', 'geometric', 'organic', 'mystic'
    ];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Generate traits based on rarity
    const traits = this.generateTraits(template, rarity);
    
    // Generate mutations
    const mutations = this.generateMutations(rarity);
    
    return {
      id: `FISH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      species: templateKey,
      bodyShape: template.bodyShape,
      pattern,
      colors,
      rarity,
      traits,
      mutations,
      genes: {
        size: 0.8 + Math.random() * 0.4,
        speed: 0.5 + Math.random() * 0.5,
        aggression: Math.random(),
        intelligence: Math.random()
      }
    };
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
   * Generates traits based on template and rarity
   */
  private generateTraits(template: FishTemplate, rarity: string): string[] {
    const traits = [...(template.features.special || [])];
    
    // Rarity-specific traits
    const rarityTraits: Record<string, string[]> = {
      uncommon: ['shimmer', 'rare_pattern'],
      rare: ['aura', 'special_eyes', 'unique_fins'],
      epic: ['particle_trail', 'color_shift', 'glow'],
      legendary: ['crown', 'ancient_marks', 'divine_light'],
      mythic: ['reality_warp', 'time_distortion', 'soul_visible'],
      cosmic: ['universe_inside', 'dimension_rift', 'god_particle']
    };
    
    if (rarityTraits[rarity]) {
      // Add some random traits based on rarity
      const availableTraits = rarityTraits[rarity];
      const traitCount = Math.min(
        availableTraits.length,
        rarity === 'cosmic' ? 3 : rarity === 'mythic' ? 2 : 1
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
   * Generates mutations based on rarity
   */
  private generateMutations(rarity: string): string[] {
    const mutations: string[] = [];
    const possibleMutations = [
      'albino', 'melanistic', 'iridescent', 'translucent',
      'bioluminescent', 'prismatic', 'chromatic', 'metallic',
      'holographic', 'quantum', 'ethereal', 'celestial',
      'void-touched', 'crystal-infused', 'plasma-charged'
    ];
    
    const mutationCounts: Record<string, number> = {
      common: 0,
      uncommon: 0,
      rare: Math.random() > 0.5 ? 1 : 0,
      epic: 1,
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
   * Toggles spawner mode (Fishing Master style)
   */
  private toggleSpawnerMode(): void {
    this.isSpawnerMode = !this.isSpawnerMode;
    
    if (this.isSpawnerMode) {
      // Clear existing fish
      this.fishes.forEach(fish => {
        this.aquarium.removeChild(fish);
        fish.destroy();
      });
      this.fishes = [];
      
      // Hide info panel
      this.infoPanel.visible = false;
      
      // Initialize spawner system
      if (!this.spawnerSystem) {
        this.spawnerSystem = new FishSpawnerSystem(this.app, this.aquarium);
      }
      
      // Show spawner UI
      this.showSpawnerUI();
    } else {
      // Clear spawner fish
      if (this.spawnerSystem) {
        this.spawnerSystem.clearAllFish();
      }
      
      // Hide spawner UI
      this.hideSpawnerUI();
      
      // Generate some static fish
      this.generateInitialFish();
    }
  }
  
  /**
   * Shows spawner mode UI
   */
  private showSpawnerUI(): void {
    // Create spawner info display
    const spawnerInfo = new PIXI.Container();
    spawnerInfo.name = 'spawnerInfo';
    
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 250, 100, 15);
    bg.fill({ color: 0x000000, alpha: 0.7 });
    bg.stroke({ color: 0xff6600, width: 2 });
    
    spawnerInfo.addChild(bg);
    
    const title = new PIXI.Text({
      text: '🎣 Fishing Mode Active',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xff6600
      }
    });
    title.position.set(20, 15);
    spawnerInfo.addChild(title);
    
    const fishCount = new PIXI.Text({
      text: 'Fish: 0',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xffffff
      }
    });
    fishCount.name = 'fishCount';
    fishCount.position.set(20, 45);
    spawnerInfo.addChild(fishCount);
    
    const difficulty = new PIXI.Text({
      text: 'Difficulty: 1.0',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xffffff
      }
    });
    difficulty.name = 'difficulty';
    difficulty.position.set(20, 70);
    spawnerInfo.addChild(difficulty);
    
    spawnerInfo.position.set(this.app.screen.width - 300, 50);
    this.uiLayer.addChild(spawnerInfo);
  }
  
  /**
   * Hides spawner mode UI
   */
  private hideSpawnerUI(): void {
    const spawnerInfo = this.uiLayer.getChildByName('spawnerInfo');
    if (spawnerInfo) {
      this.uiLayer.removeChild(spawnerInfo);
      spawnerInfo.destroy({ children: true });
    }
  }
  
  /**
   * Updates spawner UI with current stats
   */
  private updateSpawnerUI(): void {
    if (!this.spawnerSystem || !this.isSpawnerMode) return;
    
    const spawnerInfo = this.uiLayer.getChildByName('spawnerInfo') as PIXI.Container;
    if (!spawnerInfo) return;
    
    const fishCount = spawnerInfo.getChildByName('fishCount') as PIXI.Text;
    const difficulty = spawnerInfo.getChildByName('difficulty') as PIXI.Text;
    
    if (fishCount) {
      fishCount.text = `Fish: ${this.spawnerSystem.getActiveFishCount()}`;
    }
    
    if (difficulty) {
      difficulty.text = `Difficulty: ${this.spawnerSystem.getDifficulty().toFixed(1)}`;
    }
  }

  /**
   * Shows the gallery view
   */
  private showGallery(): void {
    // Hide aquarium
    this.aquarium.visible = false;
    
    // Create gallery container
    const galleryContainer = new PIXI.Container();
    galleryContainer.name = 'gallery';
    
    // Background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.fill({ color: 0x000000, alpha: 0.9 });
    galleryContainer.addChild(bg);
    
    // Title
    const title = new PIXI.Text({
      text: 'NFT Fish Gallery',
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
    const gridRows = Math.ceil(this.gallery.length / gridCols);
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
   * Creates a gallery cell for a fish
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
    // Scale appropriately for gallery cell
    const previewScale = 0.15 + (fishDNA.genes.size * 0.1);
    fishPreview.scale.set(previewScale);
    
    cell.addChild(bg);
    cell.addChild(fishPreview);
    
    // Rarity label
    const rarityLabel = new PIXI.Text({
      text: fishDNA.rarity.toUpperCase(),
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fontWeight: 'bold',
        fill: rarityConfig.color
      }
    });
    rarityLabel.anchor.set(0.5);
    rarityLabel.position.set(70, 120);
    cell.addChild(rarityLabel);
    
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
   * Hides the gallery view
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
   * Spawns a fish from the gallery
   */
  private spawnFromGallery(fishDNA: FishDNA): void {
    const fish = new ArtisticFishPixi(fishDNA, this.app);
    
    fish.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2
    );
    
    this.aquarium.addChild(fish);
    this.fishes.push(fish);
    
    // Auto-select
    this.selectFish(fish);
    
    // Spawn effect
    if (['legendary', 'mythic', 'cosmic'].includes(fishDNA.rarity)) {
      this.createSpawnEffect(fish.position, RARITY_CONFIG[fishDNA.rarity].color);
    }
  }

  /**
   * Toggles gallery view
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
   * Main update loop
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
    if (this.isSpawnerMode && this.spawnerSystem) {
      // Update spawner system
      this.spawnerSystem.update(deltaTime);
      this.updateSpawnerUI();
    } else {
      // Update static fish
      this.fishes.forEach(fish => {
        fish.update(deltaTime);
      });
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
    this.app.destroy(true);
  }
}
