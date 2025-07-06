/**
 * FishSwimmingSystem.ts
 * 
 * Enhanced Fish Swimming System based on Game Design Document
 * Implements path-based movement, formations, and special effects
 * 
 * @version 2.0.0
 * @requires pixi.js ^8.0.0
 */

import * as PIXI from 'pixi.js';

/**
 * Path types supported by the system
 */
export enum PathType {
  LINEAR = 'linear',
  BEZIER = 'bezier',
  COMPLEX = 'complex',
  CIRCULAR = 'circular',
  PATROL = 'patrol'
}

/**
 * Swimming styles for natural movement
 */
export enum SwimStyle {
  STRAIGHT = 'straight',
  WAVY = 'wavy',
  ERRATIC = 'erratic',
  GLIDING = 'gliding'
}

/**
 * Formation types for fish groups
 */
export enum FormationType {
  NONE = 'none',
  SNAKE = 'snake',
  V_SHAPE = 'v_shape',
  CIRCULAR = 'circular',
  DIAMOND = 'diamond',
  GRID = 'grid'
}

/**
 * Fish configuration interface
 */
export interface FishConfig {
  id: string;
  species: string;
  speed: number;
  pathType: PathType;
  swimStyle: SwimStyle;
  waveAmplitude: number;
  waveFrequency: number;
  layerDepth: number;
  size: number;
  isBoss?: boolean;
  texture: PIXI.Texture;
  animationFrames?: PIXI.Texture[];
  health?: number;
  value?: number;
}

/**
 * Path configuration
 */
export interface PathConfig {
  type: PathType;
  points: PIXI.Point[];
  controlPoints?: PIXI.Point[];
  duration?: number;
  loop?: boolean;
}

/**
 * Formation configuration
 */
export interface FormationConfig {
  type: FormationType;
  fishCount: number;
  spacing: number;
  fishConfig: FishConfig;
  pathConfig: PathConfig;
}

/**
 * Individual fish entity
 */
class SwimmingFish extends PIXI.Container {
  public config: FishConfig;
  public sprite: PIXI.AnimatedSprite | PIXI.Sprite;
  public currentPath: PathConfig;
  public pathProgress: number = 0;
  public basePosition: PIXI.Point = new PIXI.Point();
  public waveOffset: number = 0;
  public isActive: boolean = true;
  public formation?: FishFormation;
  public formationOffset?: PIXI.Point;
  
  // Effects
  private glowEffect?: PIXI.Graphics;
  private bubbleEmitter?: BubbleEmitter;
  private shadowSprite?: PIXI.Sprite;
  
  constructor(config: FishConfig, path: PathConfig, private renderer?: PIXI.Renderer) {
    super();
    
    this.config = config;
    this.currentPath = path;
    
    // Create sprite (animated or static)
    if (config.animationFrames && config.animationFrames.length > 0) {
      const animatedSprite = new PIXI.AnimatedSprite(config.animationFrames);
      animatedSprite.animationSpeed = 0.1 * config.speed;
      animatedSprite.play();
      this.sprite = animatedSprite;
    } else {
      this.sprite = new PIXI.Sprite(config.texture);
    }
    
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(config.size);
    
    // Set layer depth
    this.zIndex = config.layerDepth;
    
    // Add shadow for depth
    if (this.renderer) {
      this.createShadow();
    }
    
    // Add to container
    this.addChild(this.sprite);
    
    // Add effects for special fish
    if (config.isBoss) {
      this.addBossEffects();
    }
    
    // Initialize position
    this.updatePosition(0);
  }
  
  /**
   * Creates shadow effect for depth perception
   */
  private createShadow(): void {
    if (!this.renderer) return;
    
    const shadowGraphics = new PIXI.Graphics();
    shadowGraphics.ellipse(0, 0, 30 * this.config.size, 15 * this.config.size);
    shadowGraphics.fill({ color: 0x000000, alpha: 0.3 });
    
    const texture = this.renderer.generateTexture(shadowGraphics);
    
    this.shadowSprite = new PIXI.Sprite(texture);
    this.shadowSprite.anchor.set(0.5);
    this.shadowSprite.position.y = 20 * this.config.size;
    this.shadowSprite.alpha = 0.5;
    
    this.addChildAt(this.shadowSprite, 0);
    shadowGraphics.destroy();
  }
  
  /**
   * Adds special effects for boss fish
   */
  private addBossEffects(): void {
    // Glow effect
    this.glowEffect = new PIXI.Graphics();
    this.glowEffect.circle(0, 0, 50 * this.config.size);
    this.glowEffect.fill({ color: 0xffaa00, alpha: 0.3 });
    
    const blurFilter = new PIXI.BlurFilter({
      strength: 15,
      quality: 4
    });
    this.glowEffect.filters = [blurFilter];
    
    this.addChildAt(this.glowEffect, 0);
    
    // Bubble trail
    this.bubbleEmitter = new BubbleEmitter(this);
  }
  
  /**
   * Updates fish position along path
   */
  public updatePosition(deltaTime: number): void {
    if (!this.isActive) return;
    
    // Update path progress
    const pathSpeed = this.config.speed / 1000; // Convert to units per ms
    this.pathProgress += pathSpeed * deltaTime;
    
    // Get position from path
    const pathPosition = this.getPathPosition(this.pathProgress);
    
    if (!pathPosition) {
      this.isActive = false;
      return;
    }
    
    // Apply swimming style modifications
    const swimOffset = this.applySwimStyle(this.pathProgress);
    
    // Set final position
    this.position.x = pathPosition.x + swimOffset.x;
    this.position.y = pathPosition.y + swimOffset.y;
    
    // Update rotation to face movement direction
    this.updateRotation(pathPosition);
    
    // Update effects
    if (this.bubbleEmitter) {
      this.bubbleEmitter.update(deltaTime);
    }
    
    // Pulse glow for boss fish
    if (this.glowEffect && this.config.isBoss) {
      this.glowEffect.alpha = 0.3 + Math.sin(Date.now() * 0.002) * 0.1;
    }
  }
  
  /**
   * Gets position along the path based on progress
   */
  private getPathPosition(progress: number): PIXI.Point | null {
    switch (this.currentPath.type) {
      case PathType.LINEAR:
        return this.getLinearPosition(progress);
      
      case PathType.BEZIER:
        return this.getBezierPosition(progress);
      
      case PathType.CIRCULAR:
        return this.getCircularPosition(progress);
      
      case PathType.PATROL:
        return this.getPatrolPosition(progress);
      
      case PathType.COMPLEX:
        return this.getComplexPosition(progress);
      
      default:
        return null;
    }
  }
  
  /**
   * Linear path calculation
   */
  private getLinearPosition(progress: number): PIXI.Point | null {
    if (progress > 1) return null;
    
    const start = this.currentPath.points[0];
    const end = this.currentPath.points[1];
    
    return new PIXI.Point(
      start.x + (end.x - start.x) * progress,
      start.y + (end.y - start.y) * progress
    );
  }
  
  /**
   * Bezier curve path calculation
   */
  private getBezierPosition(progress: number): PIXI.Point | null {
    if (progress > 1) return null;
    
    const points = this.currentPath.points;
    const controls = this.currentPath.controlPoints || [];
    
    if (points.length < 2) return null;
    
    const t = progress;
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    
    if (controls.length >= 2) {
      // Cubic bezier
      const p0 = points[0];
      const p1 = controls[0];
      const p2 = controls[1];
      const p3 = points[1];
      
      return new PIXI.Point(
        mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
        mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
      );
    } else if (controls.length === 1) {
      // Quadratic bezier
      const p0 = points[0];
      const p1 = controls[0];
      const p2 = points[1];
      
      return new PIXI.Point(
        mt2 * p0.x + 2 * mt * t * p1.x + t2 * p2.x,
        mt2 * p0.y + 2 * mt * t * p1.y + t2 * p2.y
      );
    }
    
    return this.getLinearPosition(progress);
  }
  
  /**
   * Circular path calculation
   */
  private getCircularPosition(progress: number): PIXI.Point | null {
    const center = this.currentPath.points[0];
    const radius = this.currentPath.points[1].x; // Use x as radius
    const angle = progress * Math.PI * 2;
    
    return new PIXI.Point(
      center.x + Math.cos(angle) * radius,
      center.y + Math.sin(angle) * radius
    );
  }
  
  /**
   * Patrol path (back and forth)
   */
  private getPatrolPosition(progress: number): PIXI.Point | null {
    const pingPong = progress % 2;
    const adjustedProgress = pingPong < 1 ? pingPong : 2 - pingPong;
    
    return this.getLinearPosition(adjustedProgress);
  }
  
  /**
   * Complex path with multiple segments
   */
  private getComplexPosition(progress: number): PIXI.Point | null {
    const points = this.currentPath.points;
    if (points.length < 2) return null;
    
    const segments = points.length - 1;
    const segmentProgress = progress * segments;
    const currentSegment = Math.floor(segmentProgress);
    const localProgress = segmentProgress - currentSegment;
    
    if (currentSegment >= segments) return null;
    
    const start = points[currentSegment];
    const end = points[currentSegment + 1];
    
    return new PIXI.Point(
      start.x + (end.x - start.x) * localProgress,
      start.y + (end.y - start.y) * localProgress
    );
  }
  
  /**
   * Applies swimming style modifications
   */
  private applySwimStyle(progress: number): PIXI.Point {
    const offset = new PIXI.Point(0, 0);
    
    switch (this.config.swimStyle) {
      case SwimStyle.WAVY:
        this.waveOffset += this.config.waveFrequency;
        offset.y = Math.sin(this.waveOffset) * this.config.waveAmplitude;
        break;
      
      case SwimStyle.ERRATIC:
        if (Math.random() < 0.02) {
          offset.x = (Math.random() - 0.5) * this.config.waveAmplitude;
          offset.y = (Math.random() - 0.5) * this.config.waveAmplitude;
        }
        break;
      
      case SwimStyle.GLIDING:
        // Smooth sine wave
        offset.y = Math.sin(progress * Math.PI * 4) * this.config.waveAmplitude * 0.5;
        break;
    }
    
    return offset;
  }
  
  /**
   * Updates sprite rotation to face movement direction
   */
  private updateRotation(targetPosition: PIXI.Point): void {
    const dx = targetPosition.x - this.position.x;
    const dy = targetPosition.y - this.position.y;
    
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      this.sprite.rotation = Math.atan2(dy, dx);
      
      // Flip sprite if moving left
      if (dx < 0) {
        this.sprite.scale.y = -Math.abs(this.sprite.scale.y);
      } else {
        this.sprite.scale.y = Math.abs(this.sprite.scale.y);
      }
    }
  }
  
  /**
   * Checks if fish is outside screen bounds
   */
  public isOutsideScreen(screenBounds: PIXI.Rectangle): boolean {
    const margin = 100;
    return (
      this.x < -margin ||
      this.x > screenBounds.width + margin ||
      this.y < -margin ||
      this.y > screenBounds.height + margin
    );
  }
  
  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.bubbleEmitter) {
      this.bubbleEmitter.destroy();
    }
    
    super.destroy({ children: true });
  }
}

/**
 * Fish formation group
 */
class FishFormation extends PIXI.Container {
  public config: FormationConfig;
  public fishes: SwimmingFish[] = [];
  public leader: PIXI.Point = new PIXI.Point();
  public pathProgress: number = 0;
  private currentPath: PathConfig;
  
  constructor(config: FormationConfig, private renderer?: PIXI.Renderer) {
    super();
    
    this.config = config;
    this.currentPath = config.pathConfig;
    
    // Create fish based on formation type
    this.createFormation();
  }
  
  /**
   * Creates fish arrangement based on formation type
   */
  private createFormation(): void {
    const positions = this.getFormationPositions();
    
    positions.forEach((offset, index) => {
      const fishConfig = { ...this.config.fishConfig };
      fishConfig.id = `${fishConfig.id}-${index}`;
      
      const fish = new SwimmingFish(fishConfig, this.currentPath, this.renderer);
      fish.formation = this;
      fish.formationOffset = offset;
      
      this.fishes.push(fish);
      this.addChild(fish);
    });
  }
  
  /**
   * Gets relative positions for formation type
   */
  private getFormationPositions(): PIXI.Point[] {
    const positions: PIXI.Point[] = [];
    const { type, fishCount, spacing } = this.config;
    
    switch (type) {
      case FormationType.SNAKE:
        for (let i = 0; i < fishCount; i++) {
          positions.push(new PIXI.Point(-i * spacing, 0));
        }
        break;
      
      case FormationType.V_SHAPE:
        const halfCount = Math.floor(fishCount / 2);
        for (let i = 0; i < fishCount; i++) {
          const side = i < halfCount ? -1 : 1;
          const index = i < halfCount ? i : i - halfCount;
          positions.push(new PIXI.Point(
            -index * spacing * 0.7,
            side * index * spacing * 0.5
          ));
        }
        break;
      
      case FormationType.CIRCULAR:
        const angleStep = (Math.PI * 2) / fishCount;
        const radius = spacing * 2;
        for (let i = 0; i < fishCount; i++) {
          const angle = i * angleStep;
          positions.push(new PIXI.Point(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
          ));
        }
        break;
      
      case FormationType.DIAMOND:
        const diamondPositions = [
          new PIXI.Point(0, -spacing),
          new PIXI.Point(spacing, 0),
          new PIXI.Point(0, spacing),
          new PIXI.Point(-spacing, 0)
        ];
        for (let i = 0; i < fishCount; i++) {
          positions.push(diamondPositions[i % 4]);
        }
        break;
      
      case FormationType.GRID:
        const cols = Math.ceil(Math.sqrt(fishCount));
        for (let i = 0; i < fishCount; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          positions.push(new PIXI.Point(
            col * spacing - (cols - 1) * spacing / 2,
            row * spacing
          ));
        }
        break;
    }
    
    return positions;
  }
  
  /**
   * Updates formation position
   */
  public update(deltaTime: number): void {
    // Update path progress for the formation leader
    const pathSpeed = this.config.fishConfig.speed / 1000;
    this.pathProgress += pathSpeed * deltaTime;
    
    // Update each fish in formation
    this.fishes.forEach(fish => {
      fish.pathProgress = this.pathProgress;
      fish.updatePosition(deltaTime);
      
      // Apply formation offset
      if (fish.formationOffset) {
        fish.x += fish.formationOffset.x;
        fish.y += fish.formationOffset.y;
      }
    });
    
    // Check if formation is complete
    const allInactive = this.fishes.every(fish => !fish.isActive);
    if (allInactive) {
      this.destroy();
    }
  }
  
  /**
   * Checks if formation is outside screen
   */
  public isOutsideScreen(screenBounds: PIXI.Rectangle): boolean {
    return this.fishes.every(fish => fish.isOutsideScreen(screenBounds));
  }
}

/**
 * Bubble emitter for underwater effects
 */
class BubbleEmitter {
  private bubbles: PIXI.Sprite[] = [];
  private bubbleContainer: PIXI.Container;
  private bubbleTexture: PIXI.Texture;
  private emitTimer: number = 0;
  
  constructor(private parent: SwimmingFish) {
    this.bubbleContainer = new PIXI.Container();
    parent.addChildAt(this.bubbleContainer, 0);
    
    // Create bubble texture
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 5);
    graphics.fill({ color: 0xffffff, alpha: 0.3 });
    graphics.stroke({ color: 0xffffff, width: 1, alpha: 0.5 });
    
    // Use a simple white circle texture as fallback
    this.bubbleTexture = PIXI.Texture.WHITE;
  }
  
  public update(deltaTime: number): void {
    this.emitTimer += deltaTime;
    
    // Emit new bubbles
    if (this.emitTimer > 200) {
      this.emitTimer = 0;
      this.emitBubble();
    }
    
    // Update existing bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const bubble = this.bubbles[i];
      bubble.y -= 1;
      bubble.alpha -= 0.01;
      bubble.scale.x += 0.01;
      bubble.scale.y += 0.01;
      
      if (bubble.alpha <= 0) {
        this.bubbleContainer.removeChild(bubble);
        this.bubbles.splice(i, 1);
      }
    }
  }
  
  private emitBubble(): void {
    const bubble = new PIXI.Sprite(this.bubbleTexture);
    bubble.anchor.set(0.5);
    bubble.scale.set(0.5 + Math.random() * 0.5);
    bubble.position.set(
      (Math.random() - 0.5) * 20,
      0
    );
    
    this.bubbleContainer.addChild(bubble);
    this.bubbles.push(bubble);
  }
  
  public destroy(): void {
    this.bubbles.forEach(bubble => bubble.destroy());
    this.bubbleContainer.destroy();
  }
}

/**
 * Main Fish Swimming System
 */
export class FishSwimmingSystem {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private fishes: SwimmingFish[] = [];
  private formations: FishFormation[] = [];
  private screenBounds: PIXI.Rectangle;
  private spawnTimer: number = 0;
  private bossSpawnTimer: number = 0;
  private isBossActive: boolean = false;
  
  // Configuration
  private spawnInterval: number = 2000; // ms between spawns
  private bossSpawnInterval: number = 30000; // ms between boss spawns
  
  constructor(app: PIXI.Application, container: PIXI.Container) {
    this.app = app;
    this.container = container;
    this.screenBounds = new PIXI.Rectangle(
      0, 0,
      app.screen.width,
      app.screen.height
    );
    
    // Enable sorting for layer depth
    this.container.sortableChildren = true;
  }
  
  /**
   * Updates the swimming system
   */
  public update(deltaTime: number): void {
    // Update spawn timers
    this.spawnTimer += deltaTime;
    this.bossSpawnTimer += deltaTime;
    
    // Spawn regular fish
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnRandomFish();
    }
    
    // Spawn boss fish
    if (this.bossSpawnTimer >= this.bossSpawnInterval && !this.isBossActive) {
      this.bossSpawnTimer = 0;
      this.spawnBossFish();
    }
    
    // Update individual fish
    for (let i = this.fishes.length - 1; i >= 0; i--) {
      const fish = this.fishes[i];
      fish.updatePosition(deltaTime);
      
      // Remove fish that are outside screen and inactive
      if (!fish.isActive && fish.isOutsideScreen(this.screenBounds)) {
        this.container.removeChild(fish);
        fish.destroy();
        this.fishes.splice(i, 1);
        
        if (fish.config.isBoss) {
          this.isBossActive = false;
        }
      }
    }
    
    // Update formations
    for (let i = this.formations.length - 1; i >= 0; i--) {
      const formation = this.formations[i];
      formation.update(deltaTime);
      
      if (formation.isOutsideScreen(this.screenBounds)) {
        this.container.removeChild(formation);
        formation.destroy();
        this.formations.splice(i, 1);
      }
    }
  }
  
  /**
   * Spawns a random fish or formation
   */
  private spawnRandomFish(): void {
    // 30% chance to spawn formation
    if (Math.random() < 0.3) {
      this.spawnFormation();
    } else {
      this.spawnSingleFish();
    }
  }
  
  /**
   * Spawns a single fish
   */
  private spawnSingleFish(): void {
    const config = this.generateRandomFishConfig();
    const path = this.generateRandomPath();
    
    const fish = new SwimmingFish(config, path, this.app.renderer);
    
    // Set initial position outside screen
    const startPoint = path.points[0];
    fish.position.set(startPoint.x, startPoint.y);
    
    this.container.addChild(fish);
    this.fishes.push(fish);
  }
  
  /**
   * Spawns a fish formation
   */
  private spawnFormation(): void {
    const formationConfig: FormationConfig = {
      type: this.getRandomFormationType(),
      fishCount: 3 + Math.floor(Math.random() * 5),
      spacing: 40 + Math.random() * 20,
      fishConfig: this.generateRandomFishConfig(),
      pathConfig: this.generateRandomPath()
    };
    
    const formation = new FishFormation(formationConfig, this.app.renderer);
    
    this.container.addChild(formation);
    this.formations.push(formation);
  }
  
  /**
   * Spawns a boss fish with special entrance
   */
  private spawnBossFish(): void {
    this.isBossActive = true;
    
    // Screen shake effect
    this.createScreenShake();
    
    // Create boss config
    const bossConfig: FishConfig = {
      id: `boss-${Date.now()}`,
      species: 'boss',
      speed: 20, // Slow and majestic
      pathType: PathType.PATROL,
      swimStyle: SwimStyle.GLIDING,
      waveAmplitude: 10,
      waveFrequency: 0.001,
      layerDepth: 100, // Always on top
      size: 3,
      isBoss: true,
      texture: this.createBossTexture(),
      health: 1000,
      value: 5000
    };
    
    // Boss patrol path
    const path: PathConfig = {
      type: PathType.PATROL,
      points: [
        new PIXI.Point(-100, this.app.screen.height / 2),
        new PIXI.Point(this.app.screen.width + 100, this.app.screen.height / 2)
      ],
      duration: 30000
    };
    
    const bossFish = new SwimmingFish(bossConfig, path, this.app.renderer);
    
    // Add water ripple effect
    this.createWaterRipple(bossFish.position);
    
    this.container.addChild(bossFish);
    this.fishes.push(bossFish);
  }
  
  /**
   * Creates screen shake effect
   */
  private createScreenShake(): void {
    const originalX = this.container.x;
    const originalY = this.container.y;
    const shakeIntensity = 5;
    const shakeDuration = 500;
    let shakeTime = 0;
    
    const ticker = (delta: PIXI.Ticker) => {
      shakeTime += delta.deltaTime;
      
      if (shakeTime < shakeDuration) {
        this.container.x = originalX + (Math.random() - 0.5) * shakeIntensity;
        this.container.y = originalY + (Math.random() - 0.5) * shakeIntensity;
      } else {
        this.container.x = originalX;
        this.container.y = originalY;
        this.app.ticker.remove(ticker);
      }
    };
    
    this.app.ticker.add(ticker);
  }
  
  /**
   * Creates water ripple effect
   */
  private createWaterRipple(position: PIXI.Point): void {
    const ripple = new PIXI.Graphics();
    ripple.position.copyFrom(position);
    
    let scale = 0;
    let alpha = 1;
    
    const ticker = (delta: PIXI.Ticker) => {
      scale += 0.1;
      alpha -= 0.02;
      
      ripple.clear();
      ripple.circle(0, 0, 50 * scale);
      ripple.stroke({ color: 0xffffff, width: 3, alpha });
      
      if (alpha <= 0) {
        this.container.removeChild(ripple);
        this.app.ticker.remove(ticker);
      }
    };
    
    this.container.addChild(ripple);
    this.app.ticker.add(ticker);
  }
  
  /**
   * Generates random fish configuration
   */
  private generateRandomFishConfig(): FishConfig {
    const species = ['small', 'medium', 'large', 'special'];
    const selectedSpecies = species[Math.floor(Math.random() * species.length)];
    
    const configs: Record<string, Partial<FishConfig>> = {
      small: {
        speed: 80 + Math.random() * 40,
        size: 0.5 + Math.random() * 0.3,
        layerDepth: 1,
        value: 10
      },
      medium: {
        speed: 60 + Math.random() * 30,
        size: 0.8 + Math.random() * 0.4,
        layerDepth: 2,
        value: 50
      },
      large: {
        speed: 40 + Math.random() * 20,
        size: 1.2 + Math.random() * 0.5,
        layerDepth: 3,
        value: 100
      },
      special: {
        speed: 50 + Math.random() * 30,
        size: 1 + Math.random() * 0.5,
        layerDepth: 4,
        value: 200
      }
    };
    
    const baseConfig = configs[selectedSpecies];
    
    return {
      id: `fish-${Date.now()}-${Math.random()}`,
      species: selectedSpecies,
      speed: baseConfig.speed!,
      pathType: this.getRandomPathType(),
      swimStyle: this.getRandomSwimStyle(),
      waveAmplitude: 5 + Math.random() * 15,
      waveFrequency: 0.01 + Math.random() * 0.02,
      layerDepth: baseConfig.layerDepth!,
      size: baseConfig.size!,
      texture: this.createFishTexture(selectedSpecies),
      value: baseConfig.value!
    };
  }
  
  /**
   * Generates random path configuration
   */
  private generateRandomPath(): PathConfig {
    const pathType = this.getRandomPathType();
    const margin = 100;
    
    switch (pathType) {
      case PathType.LINEAR:
        return {
          type: PathType.LINEAR,
          points: [
            this.getRandomEdgePoint(true),
            this.getRandomEdgePoint(false)
          ]
        };
      
      case PathType.BEZIER:
        const start = this.getRandomEdgePoint(true);
        const end = this.getRandomEdgePoint(false);
        return {
          type: PathType.BEZIER,
          points: [start, end],
          controlPoints: [
            new PIXI.Point(
              this.app.screen.width * Math.random(),
              this.app.screen.height * Math.random()
            ),
            new PIXI.Point(
              this.app.screen.width * Math.random(),
              this.app.screen.height * Math.random()
            )
          ]
        };
      
      default:
        return {
          type: PathType.LINEAR,
          points: [
            this.getRandomEdgePoint(true),
            this.getRandomEdgePoint(false)
          ]
        };
    }
  }
  
  /**
   * Gets a random point on screen edge
   */
  private getRandomEdgePoint(isStart: boolean): PIXI.Point {
    const margin = 100;
    const side = Math.floor(Math.random() * 4);
    
    switch (side) {
      case 0: // Top
        return new PIXI.Point(
          Math.random() * this.app.screen.width,
          isStart ? -margin : this.app.screen.height + margin
        );
      case 1: // Right
        return new PIXI.Point(
          isStart ? this.app.screen.width + margin : -margin,
          Math.random() * this.app.screen.height
        );
      case 2: // Bottom
        return new PIXI.Point(
          Math.random() * this.app.screen.width,
          isStart ? this.app.screen.height + margin : -margin
        );
      case 3: // Left
      default:
        return new PIXI.Point(
          isStart ? -margin : this.app.screen.width + margin,
          Math.random() * this.app.screen.height
        );
    }
  }
  
  /**
   * Random generators
   */
  private getRandomPathType(): PathType {
    const types = [PathType.LINEAR, PathType.BEZIER];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  private getRandomSwimStyle(): SwimStyle {
    const styles = [SwimStyle.STRAIGHT, SwimStyle.WAVY, SwimStyle.GLIDING];
    return styles[Math.floor(Math.random() * styles.length)];
  }
  
  private getRandomFormationType(): FormationType {
    const types = [
      FormationType.SNAKE,
      FormationType.V_SHAPE,
      FormationType.CIRCULAR,
      FormationType.DIAMOND
    ];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  /**
   * Creates a simple fish texture
   */
  private createFishTexture(species: string): PIXI.Texture {
    const graphics = new PIXI.Graphics();
    
    const colors: Record<string, number> = {
      small: 0x66ccff,
      medium: 0xff9933,
      large: 0xff6666,
      special: 0xffff66
    };
    
    const color = colors[species] || 0xffffff;
    
    // Fish body
    graphics.ellipse(0, 0, 40, 20);
    graphics.fill({ color });
    
    // Tail
    graphics.moveTo(-30, 0);
    graphics.lineTo(-50, -15);
    graphics.lineTo(-50, 15);
    graphics.closePath();
    graphics.fill({ color });
    
    // Eye
    graphics.circle(15, -5, 3);
    graphics.fill({ color: 0xffffff });
    graphics.circle(16, -5, 2);
    graphics.fill({ color: 0x000000 });
    
    return this.app.renderer.generateTexture(graphics);
  }
  
  /**
   * Creates boss fish texture
   */
  private createBossTexture(): PIXI.Texture {
    const graphics = new PIXI.Graphics();
    
    // Large body
    graphics.ellipse(0, 0, 80, 40);
    graphics.fill({ color: 0xff0000 });
    
    // Fins
    graphics.moveTo(-60, 0);
    graphics.lineTo(-100, -30);
    graphics.lineTo(-90, 0);
    graphics.lineTo(-100, 30);
    graphics.closePath();
    graphics.fill({ color: 0xcc0000 });
    
    // Spikes
    for (let i = -3; i <= 3; i++) {
      graphics.moveTo(i * 20, -40);
      graphics.lineTo(i * 20 - 5, -50);
      graphics.lineTo(i * 20 + 5, -50);
      graphics.closePath();
      graphics.fill({ color: 0xffaa00 });
    }
    
    // Eyes
    graphics.circle(30, -10, 6);
    graphics.fill({ color: 0xffffff });
    graphics.circle(32, -10, 4);
    graphics.fill({ color: 0xff0000 });
    
    return this.app.renderer.generateTexture(graphics);
  }
  
  /**
   * Public methods
   */
  public clearAllFish(): void {
    this.fishes.forEach(fish => fish.destroy());
    this.formations.forEach(formation => formation.destroy());
    this.fishes = [];
    this.formations = [];
    this.container.removeChildren();
  }
  
  public getActiveFishCount(): number {
    return this.fishes.length + this.formations.reduce((sum, f) => sum + f.fishes.length, 0);
  }
  
  public isBossActive(): boolean {
    return this.isBossActive;
  }
  
  public spawnFishAtPosition(position: PIXI.Point, config?: Partial<FishConfig>): SwimmingFish {
    const fishConfig = {
      ...this.generateRandomFishConfig(),
      ...config
    };
    
    const path: PathConfig = {
      type: PathType.LINEAR,
      points: [
        position,
        this.getRandomEdgePoint(false)
      ]
    };
    
    const fish = new SwimmingFish(fishConfig, path, this.app.renderer);
    fish.position.copyFrom(position);
    
    this.container.addChild(fish);
    this.fishes.push(fish);
    
    return fish;
  }
}
