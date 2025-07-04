/**
 * FishSpawnerSystem.ts
 * 
 * Manages fish spawning patterns, movement, and school behaviors
 * Inspired by Fishing Master game mechanics
 * 
 * @version 1.0.0
 * @path app/lib/FishSpawnerSystem.ts
 */

import * as PIXI from 'pixi.js';
import { ArtisticFishPixi, FishDNA } from './ArtisticFishPixi';

/**
 * Spawn pattern types
 */
export enum SpawnPattern {
  SINGLE = 'single',
  LINE = 'line',
  V_FORMATION = 'v_formation',
  CIRCLE = 'circle',
  WAVE = 'wave',
  SPIRAL = 'spiral',
  RANDOM_SCHOOL = 'random_school'
}

/**
 * Movement pattern types
 */
export enum MovementPattern {
  STRAIGHT = 'straight',
  SINE_WAVE = 'sine_wave',
  ZIGZAG = 'zigzag',
  CIRCULAR = 'circular',
  FIGURE_EIGHT = 'figure_eight',
  RANDOM_WANDER = 'random_wander'
}

/**
 * Spawn zone configuration
 */
interface SpawnZone {
  edge: 'top' | 'bottom' | 'left' | 'right';
  startRatio: number; // 0-1 position along edge
  endRatio: number;   // 0-1 position along edge
}

/**
 * Wave configuration for spawning groups
 */
interface SpawnWave {
  pattern: SpawnPattern;
  fishCount: number;
  fishType: string; // species
  rarity: FishDNA['rarity'];
  size: 'tiny' | 'small' | 'medium' | 'large' | 'boss';
  speed: number;
  interval: number; // ms between fish in formation
  movementPattern: MovementPattern;
  targetZone?: SpawnZone; // Where they swim to
}

/**
 * Active fish tracking
 */
interface ActiveFish {
  fish: ArtisticFishPixi;
  movementPattern: MovementPattern;
  baseSpeed: number;
  targetPoint?: PIXI.Point;
  pathProgress: number;
  customData?: any;
}

/**
 * Fish spawner system manager
 */
export class FishSpawnerSystem {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private activeFish: Map<string, ActiveFish> = new Map();
  
  // Spawn configuration
  private spawnTimer: number = 0;
  private nextSpawnTime: number = 0;
  private waveQueue: SpawnWave[] = [];
  private currentWave: SpawnWave | null = null;
  private waveProgress: number = 0;
  
  // Game difficulty
  private difficulty: number = 1;
  private spawnRateMultiplier: number = 1;
  
  // Screen boundaries with margin
  private bounds = {
    left: -200,
    right: 0,
    top: -200,
    bottom: 0
  };
  
  // Fish size multipliers
  private readonly SIZE_MULTIPLIERS = {
    tiny: 0.3,
    small: 0.5,
    medium: 1.0,
    large: 1.5,
    boss: 2.5
  };
  
  // Predefined wave patterns
  private readonly WAVE_TEMPLATES: SpawnWave[] = [
    // Common fish patterns
    {
      pattern: SpawnPattern.LINE,
      fishCount: 8,
      fishType: 'goldfish',
      rarity: 'common',
      size: 'small',
      speed: 1,
      interval: 300,
      movementPattern: MovementPattern.STRAIGHT
    },
    {
      pattern: SpawnPattern.V_FORMATION,
      fishCount: 7,
      fishType: 'neonTetra',
      rarity: 'common',
      size: 'tiny',
      speed: 1.5,
      interval: 200,
      movementPattern: MovementPattern.SINE_WAVE
    },
    // Rare patterns
    {
      pattern: SpawnPattern.CIRCLE,
      fishCount: 6,
      fishType: 'crystalShark',
      rarity: 'rare',
      size: 'medium',
      speed: 0.8,
      interval: 400,
      movementPattern: MovementPattern.CIRCULAR
    },
    // Boss patterns
    {
      pattern: SpawnPattern.SINGLE,
      fishCount: 1,
      fishType: 'cosmicWhale',
      rarity: 'legendary',
      size: 'boss',
      speed: 0.5,
      interval: 0,
      movementPattern: MovementPattern.SINE_WAVE
    }
  ];
  
  constructor(app: PIXI.Application, container: PIXI.Container) {
    this.app = app;
    this.container = container;
    this.updateBounds();
    
    // Start with some initial waves
    this.initializeWaveQueue();
  }
  
  /**
   * Updates screen boundaries
   */
  private updateBounds(): void {
    this.bounds.right = this.app.screen.width + 200;
    this.bounds.bottom = this.app.screen.height + 200;
  }
  
  /**
   * Initializes the wave queue with variety
   */
  private initializeWaveQueue(): void {
    // Add a mix of patterns
    this.waveQueue = [
      ...this.WAVE_TEMPLATES,
      this.generateRandomWave(),
      this.generateRandomWave()
    ];
    
    // Shuffle for variety
    this.shuffleArray(this.waveQueue);
  }
  
  /**
   * Generates a random wave configuration
   */
  private generateRandomWave(): SpawnWave {
    const patterns = Object.values(SpawnPattern);
    const movements = Object.values(MovementPattern);
    const sizes = ['tiny', 'small', 'medium', 'large'] as const;
    const rarities: FishDNA['rarity'][] = ['common', 'common', 'common', 'uncommon', 'rare'];
    
    return {
      pattern: patterns[Math.floor(Math.random() * patterns.length)],
      fishCount: 3 + Math.floor(Math.random() * 10),
      fishType: ['goldfish', 'neonTetra', 'crystalShark'][Math.floor(Math.random() * 3)],
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
      speed: 0.5 + Math.random() * 1.5,
      interval: 200 + Math.random() * 400,
      movementPattern: movements[Math.floor(Math.random() * movements.length)]
    };
  }
  
  /**
   * Main update loop
   */
  public update(deltaTime: number): void {
    this.spawnTimer += deltaTime;
    
    // Check if we need to start a new wave
    if (!this.currentWave && this.spawnTimer >= this.nextSpawnTime) {
      this.startNextWave();
    }
    
    // Process current wave
    if (this.currentWave) {
      this.processCurrentWave(deltaTime);
    }
    
    // Update all active fish
    this.updateActiveFish(deltaTime);
    
    // Clean up off-screen fish
    this.cleanupFish();
    
    // Adjust difficulty over time
    this.updateDifficulty(deltaTime);
  }
  
  /**
   * Starts the next wave in queue
   */
  private startNextWave(): void {
    if (this.waveQueue.length === 0) {
      this.initializeWaveQueue();
    }
    
    this.currentWave = this.waveQueue.shift()!;
    this.waveProgress = 0;
    
    // Add a bonus wave occasionally
    if (Math.random() < 0.1) {
      this.addBonusWave();
    }
  }
  
  /**
   * Adds a special bonus wave
   */
  private addBonusWave(): void {
    const bonusWave: SpawnWave = {
      pattern: SpawnPattern.SPIRAL,
      fishCount: 20,
      fishType: 'goldfish',
      rarity: 'rare',
      size: 'small',
      speed: 1.2,
      interval: 100,
      movementPattern: MovementPattern.CIRCULAR
    };
    
    this.waveQueue.unshift(bonusWave);
  }
  
  /**
   * Processes the current wave spawning
   */
  private processCurrentWave(deltaTime: number): void {
    if (!this.currentWave) return;
    
    this.waveProgress += deltaTime;
    
    const fishIndex = Math.floor(this.waveProgress / this.currentWave.interval);
    
    if (fishIndex < this.currentWave.fishCount) {
      // Check if we need to spawn the next fish
      const expectedFish = fishIndex + 1;
      const spawnedFish = Math.floor((this.waveProgress - deltaTime) / this.currentWave.interval) + 1;
      
      if (expectedFish > spawnedFish) {
        this.spawnFishInFormation(fishIndex);
      }
    } else {
      // Wave complete
      this.currentWave = null;
      this.nextSpawnTime = this.spawnTimer + (2000 + Math.random() * 3000) / this.spawnRateMultiplier;
    }
  }
  
  /**
   * Spawns a fish as part of a formation
   */
  private spawnFishInFormation(index: number): void {
    if (!this.currentWave) return;
    
    const spawnPoint = this.calculateSpawnPoint(this.currentWave.pattern, index, this.currentWave.fishCount);
    const targetPoint = this.calculateTargetPoint(spawnPoint);
    
    // Generate fish DNA based on wave configuration
    const dna = this.generateFishDNA(
      this.currentWave.fishType,
      this.currentWave.rarity,
      this.currentWave.size
    );
    
    // Create the fish
    const fish = new ArtisticFishPixi(dna, this.app);
    fish.position.copyFrom(spawnPoint);
    
    // Set initial rotation towards target
    const angle = Math.atan2(
      targetPoint.y - spawnPoint.y,
      targetPoint.x - spawnPoint.x
    );
    fish.rotation = angle;
    
    // Add to container
    this.container.addChild(fish);
    
    // Track the fish
    this.activeFish.set(dna.id, {
      fish,
      movementPattern: this.currentWave.movementPattern,
      baseSpeed: this.currentWave.speed * this.SIZE_MULTIPLIERS[this.currentWave.size],
      targetPoint,
      pathProgress: 0,
      customData: {
        formationIndex: index,
        wavePattern: this.currentWave.pattern
      }
    });
  }
  
  /**
   * Calculates spawn point based on formation pattern
   */
  private calculateSpawnPoint(pattern: SpawnPattern, index: number, total: number): PIXI.Point {
    const edge = ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)] as any;
    const basePoint = this.getEdgePoint(edge, 0.5);
    
    switch (pattern) {
      case SpawnPattern.LINE:
        // Straight line perpendicular to edge
        if (edge === 'left' || edge === 'right') {
          basePoint.y = this.app.screen.height * (0.2 + (index / total) * 0.6);
        } else {
          basePoint.x = this.app.screen.width * (0.2 + (index / total) * 0.6);
        }
        break;
        
      case SpawnPattern.V_FORMATION:
        // V shape
        const vAngle = (index - total / 2) * 0.2;
        if (edge === 'left' || edge === 'right') {
          basePoint.y += Math.abs(vAngle) * 50;
          basePoint.x += vAngle * 30;
        } else {
          basePoint.x += Math.abs(vAngle) * 50;
          basePoint.y += vAngle * 30;
        }
        break;
        
      case SpawnPattern.CIRCLE:
        // Circular formation
        const circleAngle = (index / total) * Math.PI * 2;
        const radius = 100;
        basePoint.x += Math.cos(circleAngle) * radius;
        basePoint.y += Math.sin(circleAngle) * radius;
        break;
        
      case SpawnPattern.SPIRAL:
        // Spiral formation
        const spiralAngle = (index / total) * Math.PI * 4;
        const spiralRadius = 20 + index * 10;
        basePoint.x += Math.cos(spiralAngle) * spiralRadius;
        basePoint.y += Math.sin(spiralAngle) * spiralRadius;
        break;
        
      case SpawnPattern.WAVE:
        // Sine wave formation
        const waveT = index / total;
        if (edge === 'left' || edge === 'right') {
          basePoint.y = this.app.screen.height * (0.5 + Math.sin(waveT * Math.PI * 2) * 0.3);
        } else {
          basePoint.x = this.app.screen.width * (0.5 + Math.sin(waveT * Math.PI * 2) * 0.3);
        }
        break;
    }
    
    return basePoint;
  }
  
  /**
   * Gets a point on the edge of the screen
   */
  private getEdgePoint(edge: 'top' | 'bottom' | 'left' | 'right', ratio: number): PIXI.Point {
    switch (edge) {
      case 'left':
        return new PIXI.Point(this.bounds.left, this.app.screen.height * ratio);
      case 'right':
        return new PIXI.Point(this.bounds.right, this.app.screen.height * ratio);
      case 'top':
        return new PIXI.Point(this.app.screen.width * ratio, this.bounds.top);
      case 'bottom':
        return new PIXI.Point(this.app.screen.width * ratio, this.bounds.bottom);
    }
  }
  
  /**
   * Calculates target point for fish movement
   */
  private calculateTargetPoint(spawnPoint: PIXI.Point): PIXI.Point {
    // Determine opposite edge
    let targetX = spawnPoint.x;
    let targetY = spawnPoint.y;
    
    if (spawnPoint.x <= this.bounds.left) {
      targetX = this.bounds.right;
    } else if (spawnPoint.x >= this.bounds.right) {
      targetX = this.bounds.left;
    }
    
    if (spawnPoint.y <= this.bounds.top) {
      targetY = this.bounds.bottom;
    } else if (spawnPoint.y >= this.bounds.bottom) {
      targetY = this.bounds.top;
    }
    
    // Add some randomness to exit point
    if (targetX !== spawnPoint.x) {
      targetY = this.app.screen.height * (0.2 + Math.random() * 0.6);
    } else {
      targetX = this.app.screen.width * (0.2 + Math.random() * 0.6);
    }
    
    return new PIXI.Point(targetX, targetY);
  }
  
  /**
   * Updates all active fish positions
   */
  private updateActiveFish(deltaTime: number): void {
    this.activeFish.forEach((activeFish, id) => {
      const { fish, movementPattern, baseSpeed, targetPoint } = activeFish;
      
      // Calculate movement based on pattern
      const movement = this.calculateMovement(
        fish.position,
        targetPoint!,
        movementPattern,
        baseSpeed,
        activeFish.pathProgress,
        deltaTime
      );
      
      // Update position
      fish.x += movement.x;
      fish.y += movement.y;
      
      // Update rotation to face movement direction
      if (movement.x !== 0 || movement.y !== 0) {
        const targetRotation = Math.atan2(movement.y, movement.x);
        fish.rotation = this.lerpAngle(fish.rotation, targetRotation, 0.1);
      }
      
      // Update path progress
      activeFish.pathProgress += deltaTime * 0.001;
      
      // Update fish animation
      fish.update(deltaTime);
    });
  }
  
  /**
   * Calculates movement vector based on pattern
   */
  private calculateMovement(
    currentPos: PIXI.Point,
    targetPos: PIXI.Point,
    pattern: MovementPattern,
    baseSpeed: number,
    progress: number,
    deltaTime: number
  ): PIXI.Point {
    const speed = baseSpeed * deltaTime * 0.1;
    const dx = targetPos.x - currentPos.x;
    const dy = targetPos.y - currentPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Base direction
    let moveX = (dx / distance) * speed;
    let moveY = (dy / distance) * speed;
    
    // Apply pattern modifications
    switch (pattern) {
      case MovementPattern.SINE_WAVE:
        const waveOffset = Math.sin(progress * 5) * 50;
        moveX += -moveY * waveOffset * 0.001;
        moveY += moveX * waveOffset * 0.001;
        break;
        
      case MovementPattern.ZIGZAG:
        const zigzag = Math.sign(Math.sin(progress * 10)) * 30;
        moveX += -moveY * zigzag * 0.001;
        moveY += moveX * zigzag * 0.001;
        break;
        
      case MovementPattern.CIRCULAR:
        const circleAngle = progress * 3;
        moveX += Math.cos(circleAngle) * speed * 0.3;
        moveY += Math.sin(circleAngle) * speed * 0.3;
        break;
        
      case MovementPattern.FIGURE_EIGHT:
        const figure8 = progress * 2;
        moveX += Math.cos(figure8) * Math.cos(figure8 * 2) * speed * 0.5;
        moveY += Math.sin(figure8) * speed * 0.5;
        break;
        
      case MovementPattern.RANDOM_WANDER:
        moveX += (Math.random() - 0.5) * speed * 0.5;
        moveY += (Math.random() - 0.5) * speed * 0.5;
        break;
    }
    
    return new PIXI.Point(moveX, moveY);
  }
  
  /**
   * Generates fish DNA for spawning
   */
  private generateFishDNA(species: string, rarity: FishDNA['rarity'], size: string): FishDNA {
    // This would integrate with your existing fish generation system
    return {
      id: `fish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      species,
      bodyShape: this.getBodyShapeForSpecies(species),
      pattern: this.getRandomPattern(),
      colors: this.getColorsForSpecies(species),
      rarity,
      traits: this.getTraitsForRarity(rarity),
      mutations: this.getMutationsForRarity(rarity),
      genes: {
        size: this.SIZE_MULTIPLIERS[size as keyof typeof this.SIZE_MULTIPLIERS],
        speed: 0.8 + Math.random() * 0.4,
        aggression: Math.random(),
        intelligence: Math.random()
      }
    };
  }
  
  /**
   * Helper methods for fish generation
   */
  private getBodyShapeForSpecies(species: string): string {
    const shapes: Record<string, string> = {
      goldfish: 'round',
      neonTetra: 'streamlined',
      crystalShark: 'streamlined',
      cosmicWhale: 'massive',
      voidAngel: 'diamond'
    };
    return shapes[species] || 'round';
  }
  
  private getRandomPattern(): string {
    const patterns = ['stripes', 'dots', 'scales', 'waves', 'gradient'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }
  
  private getColorsForSpecies(species: string): FishDNA['colors'] {
    // Predefined color schemes for consistency
    const colorSchemes: Record<string, FishDNA['colors']> = {
      goldfish: {
        primary: '#FFD700',
        secondary: '#FFA500',
        accent: '#FF6347'
      },
      neonTetra: {
        primary: '#00FFFF',
        secondary: '#FF00FF',
        accent: '#00FF00'
      },
      crystalShark: {
        primary: '#E0FFFF',
        secondary: '#87CEEB',
        accent: '#4682B4'
      },
      cosmicWhale: {
        primary: '#191970',
        secondary: '#4B0082',
        accent: '#8A2BE2',
        glow: '#9400D3'
      }
    };
    
    return colorSchemes[species] || colorSchemes.goldfish;
  }
  
  private getTraitsForRarity(rarity: FishDNA['rarity']): string[] {
    const traits: string[] = [];
    
    if (['epic', 'legendary', 'mythic', 'cosmic'].includes(rarity)) {
      traits.push('glowing_eyes');
    }
    
    if (['legendary', 'mythic', 'cosmic'].includes(rarity)) {
      traits.push('particle_trail');
    }
    
    if (rarity === 'cosmic') {
      traits.push('universe_inside');
    }
    
    return traits;
  }
  
  private getMutationsForRarity(rarity: FishDNA['rarity']): string[] {
    const mutations: string[] = [];
    const possibleMutations = ['iridescent', 'metallic', 'translucent', 'holographic'];
    
    const mutationCount = 
      rarity === 'cosmic' ? 2 :
      rarity === 'mythic' ? 1 :
      rarity === 'legendary' ? 1 :
      0;
    
    for (let i = 0; i < mutationCount; i++) {
      const mutation = possibleMutations[Math.floor(Math.random() * possibleMutations.length)];
      if (!mutations.includes(mutation)) {
        mutations.push(mutation);
      }
    }
    
    return mutations;
  }
  
  /**
   * Cleans up fish that are off-screen
   */
  private cleanupFish(): void {
    const margin = 300;
    
    this.activeFish.forEach((activeFish, id) => {
      const { fish } = activeFish;
      
      if (fish.x < this.bounds.left - margin ||
          fish.x > this.bounds.right + margin ||
          fish.y < this.bounds.top - margin ||
          fish.y > this.bounds.bottom + margin) {
        
        // Remove from container
        this.container.removeChild(fish);
        fish.destroy();
        
        // Remove from tracking
        this.activeFish.delete(id);
      }
    });
  }
  
  /**
   * Updates difficulty over time
   */
  private updateDifficulty(deltaTime: number): void {
    // Increase difficulty every 30 seconds
    const difficultyIncreaseRate = 1 / 30000; // 1 point per 30 seconds
    this.difficulty += deltaTime * difficultyIncreaseRate;
    
    // Update spawn rate multiplier
    this.spawnRateMultiplier = 1 + (this.difficulty - 1) * 0.5;
    
    // Add more challenging waves at higher difficulties
    if (this.difficulty > 2 && Math.random() < 0.01) {
      this.addChallengeWave();
    }
  }
  
  /**
   * Adds a challenging wave for experienced players
   */
  private addChallengeWave(): void {
    const challengeWaves: SpawnWave[] = [
      {
        pattern: SpawnPattern.SPIRAL,
        fishCount: 30,
        fishType: 'neonTetra',
        rarity: 'epic',
        size: 'tiny',
        speed: 2,
        interval: 50,
        movementPattern: MovementPattern.FIGURE_EIGHT
      },
      {
        pattern: SpawnPattern.RANDOM_SCHOOL,
        fishCount: 3,
        fishType: 'cosmicWhale',
        rarity: 'legendary',
        size: 'boss',
        speed: 0.3,
        interval: 1000,
        movementPattern: MovementPattern.SINE_WAVE
      }
    ];
    
    const wave = challengeWaves[Math.floor(Math.random() * challengeWaves.length)];
    this.waveQueue.push(wave);
  }
  
  /**
   * Utility functions
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  private lerpAngle(current: number, target: number, alpha: number): number {
    let diff = target - current;
    
    // Normalize the difference to [-PI, PI]
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    return current + diff * alpha;
  }
  
  /**
   * Public API for game integration
   */
  public getActiveFishCount(): number {
    return this.activeFish.size;
  }
  
  public getDifficulty(): number {
    return this.difficulty;
  }
  
  public addCustomWave(wave: SpawnWave): void {
    this.waveQueue.push(wave);
  }
  
  public clearAllFish(): void {
    this.activeFish.forEach((activeFish) => {
      this.container.removeChild(activeFish.fish);
      activeFish.fish.destroy();
    });
    this.activeFish.clear();
  }
  
  public pause(): void {
    // Pause logic here
  }
  
  public resume(): void {
    // Resume logic here
  }
}
