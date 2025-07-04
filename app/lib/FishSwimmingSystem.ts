/**
 * FishSwimmingSystem.ts
 * 
 * Professional fish swimming system based on Fish Master GDD
 * Manages fish spawning, movement paths, formations, and behaviors
 * 
 * @version 2.0.0
 * @path app/lib/FishSwimmingSystem.ts
 */

import * as PIXI from 'pixi.js';
import { ArtisticFishPixi, FishDNA } from './ArtisticFishPixi';

/**
 * Path types for fish movement
 */
export enum PathType {
  LINEAR = 'linear',
  BEZIER_CURVE = 'bezier_curve',
  COMPLEX_PATH = 'complex_path',
  PATROL = 'patrol',
  CIRCULAR = 'circular'
}

/**
 * Swimming styles for additional movement dynamics
 */
export enum SwimStyle {
  STRAIGHT = 'straight',
  WAVE = 'wave',
  ERRATIC = 'erratic',
  GLIDE = 'glide'
}

/**
 * Formation types for fish schools
 */
export enum FormationType {
  SNAKE = 'snake',
  V_FORMATION = 'v_formation',
  CIRCLE = 'circle',
  DIAMOND = 'diamond',
  RANDOM_SCHOOL = 'random_school'
}

/**
 * Fish category types
 */
export enum FishCategory {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  BOSS = 'boss',
  EVENT = 'event'
}

/**
 * Path definition using control points
 */
interface PathDefinition {
  type: PathType;
  controlPoints: PIXI.Point[];
  duration?: number; // Expected time to complete path
}

/**
 * Fish behavior parameters
 */
interface FishBehavior {
  speed: number;              // Base speed multiplier
  pathType: PathType;         // Movement trajectory type
  swimStyle: SwimStyle;       // Additional movement dynamics
  waveAmplitude: number;      // S-shaped swimming amplitude
  waveFrequency: number;      // S-shaped swimming frequency
  layerDepth: number;         // Z-index for layering
  animationSpeed: number;     // Sprite animation speed
}

/**
 * Formation configuration
 */
interface FormationConfig {
  type: FormationType;
  fishCount: number;
  spacing: number;            // Distance between fish
  pattern: PIXI.Point[];      // Relative positions
  leader?: ActiveFish;        // Formation leader
}

/**
 * Active fish tracking with enhanced properties
 */
interface ActiveFish {
  fish: ArtisticFishPixi;
  category: FishCategory;
  behavior: FishBehavior;
  path: PathDefinition;
  pathProgress: number;       // 0-1 progress along path
  currentPosition: PIXI.Point;
  swimPhase: number;          // For wave swimming
  formation?: FormationConfig;
  formationOffset?: PIXI.Point;
  isLeader?: boolean;
}

/**
 * Screen boundaries for spawn/despawn
 */
interface ScreenBounds {
  visibleArea: PIXI.Rectangle;
  spawnArea: PIXI.Rectangle;
  despawnArea: PIXI.Rectangle;
}

/**
   * Spawn event definition
   */
interface SpawnEvent {
    time: number;
    category: FishCategory;
    species: string;
    count: number;
    formation?: FormationType;
    behavior: Partial<FishBehavior>;
    entryPoint?: 'left' | 'right' | 'top' | 'bottom' | 'random';
}
/**
 * Main fish swimming system
 */
export class FishSwimmingSystem {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private activeFish: Map<string, ActiveFish> = new Map();
  private formations: Map<string, FormationConfig> = new Map();
  
  // Screen boundaries
  private bounds: ScreenBounds;
  
  // Spawn management
  private spawnTimer: number = 0;
  private nextSpawnTime: number = 2000;
  private spawnQueue: SpawnEvent[] = [];
  
  // Layer management
  private layers: Map<number, PIXI.Container> = new Map();
  
  // Boss management
  private activeBoss: ActiveFish | null = null;
  private bossActive: boolean = false;
  
  // Configuration
  private readonly SPAWN_MARGIN = 150;
  private readonly DESPAWN_MARGIN = 200;
  private readonly BASE_SPEED = 60; // pixels per second
  
  

  constructor(app: PIXI.Application, container: PIXI.Container) {
    this.app = app;
    this.container = container;
    
    // Initialize screen boundaries
    this.updateBounds();
    
    // Initialize layers
    this.initializeLayers();
    
    // Setup resize handler
    window.addEventListener('resize', () => this.updateBounds());
    
    // Initialize spawn queue
    this.initializeSpawnQueue();
  }

  /**
   * Updates screen boundaries
   */
  private updateBounds(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    this.bounds = {
      visibleArea: new PIXI.Rectangle(0, 0, width, height),
      spawnArea: new PIXI.Rectangle(
        -this.SPAWN_MARGIN,
        -this.SPAWN_MARGIN,
        width + this.SPAWN_MARGIN * 2,
        height + this.SPAWN_MARGIN * 2
      ),
      despawnArea: new PIXI.Rectangle(
        -this.DESPAWN_MARGIN,
        -this.DESPAWN_MARGIN,
        width + this.DESPAWN_MARGIN * 2,
        height + this.DESPAWN_MARGIN * 2
      )
    };
  }

  /**
   * Initializes rendering layers for proper fish ordering
   */
  private initializeLayers(): void {
    // Create layers from back to front
    for (let depth = 0; depth <= 5; depth++) {
      const layer = new PIXI.Container();
      layer.name = `layer_${depth}`;
      this.layers.set(depth, layer);
      this.container.addChild(layer);
    }
  }

  /**
   * Initializes spawn queue with varied patterns
   */
  private initializeSpawnQueue(): void {
    this.spawnQueue = [
      // Wave 1: Small fish introduction
      {
        time: 2000,
        category: FishCategory.SMALL,
        species: 'neonTetra',
        count: 8,
        formation: FormationType.SNAKE,
        behavior: { speed: 1.5, swimStyle: SwimStyle.WAVE },
        entryPoint: 'left'
      },
      // Wave 2: Medium fish
      {
        time: 5000,
        category: FishCategory.MEDIUM,
        species: 'goldfish',
        count: 5,
        formation: FormationType.V_FORMATION,
        behavior: { speed: 1.0, swimStyle: SwimStyle.GLIDE },
        entryPoint: 'right'
      },
      // Wave 3: Mixed school
      {
        time: 8000,
        category: FishCategory.SMALL,
        species: 'crystalShark',
        count: 12,
        formation: FormationType.CIRCLE,
        behavior: { speed: 1.2, swimStyle: SwimStyle.WAVE },
        entryPoint: 'top'
      },
      // Wave 4: Large fish
      {
        time: 12000,
        category: FishCategory.LARGE,
        species: 'voidAngel',
        count: 3,
        behavior: { speed: 0.7, swimStyle: SwimStyle.STRAIGHT },
        entryPoint: 'random'
      },
      // Wave 5: Boss event
      {
        time: 20000,
        category: FishCategory.BOSS,
        species: 'cosmicWhale',
        count: 1,
        behavior: { speed: 0.3, swimStyle: SwimStyle.GLIDE, pathType: PathType.PATROL },
        entryPoint: 'left'
      }
    ];
  }

  /**
   * Main update loop
   */
  public update(deltaTime: number): void {
    this.spawnTimer += deltaTime;
    
    // Process spawn queue
    this.processSpawnQueue();
    
    // Update all active fish
    this.updateFish(deltaTime);
    
    // Update formations
    this.updateFormations();
    
    // Clean up off-screen fish
    this.cleanupFish();
    
    // Manage dynamic spawning
    if (!this.bossActive && this.activeFish.size < 20) {
      this.dynamicSpawn();
    }
  }

  /**
   * Processes scheduled spawn events
   */
  private processSpawnQueue(): void {
    const readySpawns = this.spawnQueue.filter(event => event.time <= this.spawnTimer);
    
    readySpawns.forEach(event => {
      this.executeSpawnEvent(event);
      const index = this.spawnQueue.indexOf(event);
      this.spawnQueue.splice(index, 1);
    });
  }

  /**
   * Executes a spawn event
   */
  private executeSpawnEvent(event: SpawnEvent): void {
    if (event.category === FishCategory.BOSS) {
      this.spawnBoss(event);
    } else if (event.formation) {
      this.spawnFormation(event);
    } else {
      this.spawnIndividualFish(event);
    }
  }

  /**
   * Spawns a boss fish with special entry
   */
  private spawnBoss(event: SpawnEvent): void {
    if (this.bossActive) return;
    
    this.bossActive = true;
    
    // Create boss entry announcement
    this.createBossAnnouncement();
    
    // Generate boss fish
    const entryPoint = this.getEntryPoint(event.entryPoint || 'left');
    const exitPoint = this.getExitPoint(entryPoint.edge);
    
    const path: PathDefinition = {
      type: PathType.PATROL,
      controlPoints: [
        entryPoint.position,
        new PIXI.Point(this.app.screen.width * 0.3, this.app.screen.height * 0.5),
        new PIXI.Point(this.app.screen.width * 0.7, this.app.screen.height * 0.5),
        exitPoint.position
      ],
      duration: 30000 // 30 seconds screen time
    };
    
    const behavior: FishBehavior = {
      speed: event.behavior.speed || 0.3,
      pathType: PathType.PATROL,
      swimStyle: SwimStyle.GLIDE,
      waveAmplitude: 0,
      waveFrequency: 0,
      layerDepth: 5, // Top layer
      animationSpeed: 0.5
    };
    
    const fishDNA = this.generateFishDNA(event.species, 'legendary', FishCategory.BOSS);
    const fish = new ArtisticFishPixi(fishDNA, this.app);
    
    fish.position.copyFrom(entryPoint.position);
    this.layers.get(behavior.layerDepth)!.addChild(fish);
    
    const activeFish: ActiveFish = {
      fish,
      category: FishCategory.BOSS,
      behavior,
      path,
      pathProgress: 0,
      currentPosition: entryPoint.position.clone(),
      swimPhase: 0
    };
    
    this.activeFish.set(fishDNA.id, activeFish);
    this.activeBoss = activeFish;
  }

  /**
   * Creates boss announcement effects
   */
  private createBossAnnouncement(): void {
    // Screen shake effect
    const originalX = this.container.x;
    const originalY = this.container.y;
    
    let shakeTime = 0;
    const shakeTicker = () => {
      shakeTime += 0.1;
      this.container.x = originalX + Math.sin(shakeTime * 10) * 5;
      this.container.y = originalY + Math.cos(shakeTime * 10) * 5;
      
      if (shakeTime > 2) {
        this.container.x = originalX;
        this.container.y = originalY;
        this.app.ticker.remove(shakeTicker);
      }
    };
    
    this.app.ticker.add(shakeTicker);
    
    // Water ripple effect (visual only)
    const ripple = new PIXI.Graphics();
    ripple.lineStyle(3, 0xffffff, 0.5);
    ripple.drawCircle(0, 0, 50);
    ripple.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    
    this.container.addChild(ripple);
    
    let rippleScale = 1;
    const rippleTicker = () => {
      rippleScale += 0.1;
      ripple.scale.set(rippleScale);
      ripple.alpha -= 0.02;
      
      if (ripple.alpha <= 0) {
        this.container.removeChild(ripple);
        this.app.ticker.remove(rippleTicker);
      }
    };
    
    this.app.ticker.add(rippleTicker);
  }

  /**
   * Spawns a fish formation
   */
  private spawnFormation(event: SpawnEvent): void {
    const formationId = `formation_${Date.now()}`;
    const formation: FormationConfig = {
      type: event.formation!,
      fishCount: event.count,
      spacing: this.getFormationSpacing(event.category),
      pattern: this.generateFormationPattern(event.formation!, event.count)
    };
    
    this.formations.set(formationId, formation);
    
    // Spawn leader
    const leaderEvent = { ...event, count: 1, formation: undefined };
    const leaderId = this.spawnIndividualFish(leaderEvent)[0];
    const leader = this.activeFish.get(leaderId)!;
    leader.isLeader = true;
    formation.leader = leader;
    
    // Spawn followers
    for (let i = 1; i < event.count; i++) {
      const followerDNA = this.generateFishDNA(event.species, 'common', event.category);
      const follower = new ArtisticFishPixi(followerDNA, this.app);
      
      // Position relative to leader
      const offset = formation.pattern[i];
      follower.position.x = leader.fish.x + offset.x;
      follower.position.y = leader.fish.y + offset.y;
      
      this.layers.get(leader.behavior.layerDepth)!.addChild(follower);
      
      const activeFish: ActiveFish = {
        fish: follower,
        category: event.category,
        behavior: { ...leader.behavior },
        path: leader.path,
        pathProgress: 0,
        currentPosition: follower.position.clone(),
        swimPhase: Math.random() * Math.PI * 2,
        formation,
        formationOffset: offset
      };
      
      this.activeFish.set(followerDNA.id, activeFish);
    }
  }

  /**
   * Spawns individual fish
   */
  private spawnIndividualFish(event: SpawnEvent): string[] {
    const spawnedIds: string[] = [];
    
    for (let i = 0; i < event.count; i++) {
      const entryPoint = this.getEntryPoint(event.entryPoint || 'random');
      const exitPoint = this.getExitPoint(entryPoint.edge);
      
      const path = this.generatePath(
        entryPoint.position,
        exitPoint.position,
        event.behavior.pathType || PathType.LINEAR
      );
      
      const behavior: FishBehavior = {
        speed: event.behavior.speed || 1.0,
        pathType: event.behavior.pathType || PathType.LINEAR,
        swimStyle: event.behavior.swimStyle || SwimStyle.WAVE,
        waveAmplitude: event.behavior.waveAmplitude ?? 20,
        waveFrequency: event.behavior.waveFrequency ?? 0.003,
        layerDepth: this.getLayerDepth(event.category),
        animationSpeed: 1.0
      };
      
      const fishDNA = this.generateFishDNA(event.species, 'common', event.category);
      const fish = new ArtisticFishPixi(fishDNA, this.app);
      
      fish.position.copyFrom(entryPoint.position);
      this.layers.get(behavior.layerDepth)!.addChild(fish);
      
      const activeFish: ActiveFish = {
        fish,
        category: event.category,
        behavior,
        path,
        pathProgress: 0,
        currentPosition: entryPoint.position.clone(),
        swimPhase: Math.random() * Math.PI * 2
      };
      
      this.activeFish.set(fishDNA.id, activeFish);
      spawnedIds.push(fishDNA.id);
    }
    
    return spawnedIds;
  }

  /**
   * Updates all active fish
   */
  private updateFish(deltaTime: number): void {
    const deltaSeconds = deltaTime / 1000;
    
    this.activeFish.forEach((activeFish, id) => {
      const { fish, behavior, path, swimPhase } = activeFish;
      
      // Calculate base movement along path
      const pathSpeed = behavior.speed * this.BASE_SPEED * deltaSeconds;
      const pathLength = this.calculatePathLength(path);
      const progressDelta = pathSpeed / pathLength;
      
      activeFish.pathProgress += progressDelta;
      
      // Get position along path
      const basePosition = this.getPositionAlongPath(path, activeFish.pathProgress);
      
      // Apply swimming style modifiers
      const swimOffset = this.applySwimStyle(
        behavior.swimStyle,
        behavior.waveAmplitude,
        behavior.waveFrequency,
        activeFish.swimPhase,
        deltaTime
      );
      
      // Update swim phase
      activeFish.swimPhase += behavior.waveFrequency * deltaTime;
      
      // Apply formation offset if in formation
      if (activeFish.formation && activeFish.formationOffset && !activeFish.isLeader) {
        const leader = activeFish.formation.leader!;
        basePosition.x = leader.currentPosition.x + activeFish.formationOffset.x;
        basePosition.y = leader.currentPosition.y + activeFish.formationOffset.y;
      }
      
      // Update fish position
      fish.x = basePosition.x + swimOffset.x;
      fish.y = basePosition.y + swimOffset.y;
      activeFish.currentPosition.copyFrom(fish.position);
      
      // Update rotation to face direction
      const nextPosition = this.getPositionAlongPath(path, activeFish.pathProgress + 0.01);
      const angle = Math.atan2(
        nextPosition.y - basePosition.y,
        nextPosition.x - basePosition.x
      );
      fish.rotation = angle;
      
      // Update fish animation
      fish.update(deltaTime);
      
      // Check if reached end of path
      if (activeFish.pathProgress >= 1.0) {
        // Continue swimming straight until off screen
        const direction = angle;
        fish.x += Math.cos(direction) * pathSpeed;
        fish.y += Math.sin(direction) * pathSpeed;
      }
    });
  }

  /**
   * Generates path based on type
   */
  private generatePath(start: PIXI.Point, end: PIXI.Point, type: PathType): PathDefinition {
    switch (type) {
      case PathType.LINEAR:
        return {
          type: PathType.LINEAR,
          controlPoints: [start, end]
        };
        
      case PathType.BEZIER_CURVE:
        // Generate control points for a smooth curve
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const offset = 100 + Math.random() * 200;
        
        const control1 = new PIXI.Point(
          midX + (Math.random() - 0.5) * offset,
          midY + (Math.random() - 0.5) * offset
        );
        
        return {
          type: PathType.BEZIER_CURVE,
          controlPoints: [start, control1, end]
        };
        
      case PathType.COMPLEX_PATH:
        // Multiple segments
        const segments = 3 + Math.floor(Math.random() * 2);
        const points = [start];
        
        for (let i = 1; i < segments; i++) {
          const t = i / segments;
          points.push(new PIXI.Point(
            start.x + (end.x - start.x) * t + (Math.random() - 0.5) * 150,
            start.y + (end.y - start.y) * t + (Math.random() - 0.5) * 150
          ));
        }
        
        points.push(end);
        
        return {
          type: PathType.COMPLEX_PATH,
          controlPoints: points
        };
        
      default:
        return {
          type: PathType.LINEAR,
          controlPoints: [start, end]
        };
    }
  }

  /**
   * Calculates position along path at given progress
   */
  private getPositionAlongPath(path: PathDefinition, progress: number): PIXI.Point {
    const t = Math.max(0, Math.min(1, progress));
    
    switch (path.type) {
      case PathType.LINEAR:
        const start = path.controlPoints[0];
        const end = path.controlPoints[1];
        return new PIXI.Point(
          start.x + (end.x - start.x) * t,
          start.y + (end.y - start.y) * t
        );
        
      case PathType.BEZIER_CURVE:
        // Quadratic bezier curve
        if (path.controlPoints.length === 3) {
          const p0 = path.controlPoints[0];
          const p1 = path.controlPoints[1];
          const p2 = path.controlPoints[2];
          
          const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
          const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
          
          return new PIXI.Point(x, y);
        }
        // Cubic bezier curve
        else if (path.controlPoints.length === 4) {
          const p0 = path.controlPoints[0];
          const p1 = path.controlPoints[1];
          const p2 = path.controlPoints[2];
          const p3 = path.controlPoints[3];
          
          const x = (1 - t) ** 3 * p0.x + 3 * (1 - t) ** 2 * t * p1.x + 
                   3 * (1 - t) * t ** 2 * p2.x + t ** 3 * p3.x;
          const y = (1 - t) ** 3 * p0.y + 3 * (1 - t) ** 2 * t * p1.y + 
                   3 * (1 - t) * t ** 2 * p2.y + t ** 3 * p3.y;
          
          return new PIXI.Point(x, y);
        }
        break;
        
      case PathType.COMPLEX_PATH:
        // Linear interpolation between segments
        const segmentCount = path.controlPoints.length - 1;
        const segment = Math.floor(t * segmentCount);
        const localT = (t * segmentCount) % 1;
        
        if (segment < segmentCount) {
          const start = path.controlPoints[segment];
          const end = path.controlPoints[segment + 1];
          return new PIXI.Point(
            start.x + (end.x - start.x) * localT,
            start.y + (end.y - start.y) * localT
          );
        }
        break;
        
      case PathType.PATROL:
        // Patrol path loops through middle points
        if (t < 0.1) {
          // Entry phase
          const entryT = t / 0.1;
          const p0 = path.controlPoints[0];
          const p1 = path.controlPoints[1];
          return new PIXI.Point(
            p0.x + (p1.x - p0.x) * entryT,
            p0.y + (p1.y - p0.y) * entryT
          );
        } else if (t < 0.9) {
          // Patrol phase - loop between middle points
          const patrolT = (t - 0.1) / 0.8;
          const loopT = (patrolT * 3) % 1; // 3 loops
          const p1 = path.controlPoints[1];
          const p2 = path.controlPoints[2];
          
          if (loopT < 0.5) {
            const segT = loopT * 2;
            return new PIXI.Point(
              p1.x + (p2.x - p1.x) * segT,
              p1.y + (p2.y - p1.y) * segT
            );
          } else {
            const segT = (loopT - 0.5) * 2;
            return new PIXI.Point(
              p2.x + (p1.x - p2.x) * segT,
              p2.y + (p1.y - p2.y) * segT
            );
          }
        } else {
          // Exit phase
          const exitT = (t - 0.9) / 0.1;
          const p2 = path.controlPoints[2];
          const p3 = path.controlPoints[3];
          return new PIXI.Point(
            p2.x + (p3.x - p2.x) * exitT,
            p2.y + (p3.y - p2.y) * exitT
          );
        }
        break;
    }
    
    // Fallback
    return path.controlPoints[path.controlPoints.length - 1];
  }

  /**
   * Applies swimming style modifiers
   */
  private applySwimStyle(
    style: SwimStyle,
    amplitude: number,
    frequency: number,
    phase: number,
    deltaTime: number
  ): PIXI.Point {
    const offset = new PIXI.Point(0, 0);
    
    switch (style) {
      case SwimStyle.WAVE:
        // S-shaped swimming
        offset.y = Math.sin(phase) * amplitude;
        break;
        
      case SwimStyle.ERRATIC:
        // Random jerky movements
        if (Math.random() < 0.02) {
          offset.x = (Math.random() - 0.5) * amplitude * 2;
          offset.y = (Math.random() - 0.5) * amplitude * 2;
        }
        break;
        
      case SwimStyle.GLIDE:
        // Smooth gliding with occasional adjustments
        offset.y = Math.sin(phase * 0.5) * amplitude * 0.3;
        break;
        
      case SwimStyle.STRAIGHT:
        // No additional movement
        break;
    }
    
    return offset;
  }

  /**
   * Calculates path length for speed calculations
   */
  private calculatePathLength(path: PathDefinition): number {
    let length = 0;
    
    for (let i = 0; i < path.controlPoints.length - 1; i++) {
      const p1 = path.controlPoints[i];
      const p2 = path.controlPoints[i + 1];
      length += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
    
    return length || 1;
  }

  /**
   * Gets entry point based on edge
   */
  private getEntryPoint(edge: 'left' | 'right' | 'top' | 'bottom' | 'random'): {
    position: PIXI.Point;
    edge: 'left' | 'right' | 'top' | 'bottom';
  } {
    if (edge === 'random') {
      edge = (['left', 'right', 'top', 'bottom'] as const)[Math.floor(Math.random() * 4)];
    }
    
    const margin = this.SPAWN_MARGIN;
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    let position: PIXI.Point;
    
    switch (edge) {
      case 'left':
        position = new PIXI.Point(-margin, height * (0.2 + Math.random() * 0.6));
        break;
      case 'right':
        position = new PIXI.Point(width + margin, height * (0.2 + Math.random() * 0.6));
        break;
      case 'top':
        position = new PIXI.Point(width * (0.2 + Math.random() * 0.6), -margin);
        break;
      case 'bottom':
        position = new PIXI.Point(width * (0.2 + Math.random() * 0.6), height + margin);
        break;
    }
    
    return { position, edge };
  }

  /**
   * Gets exit point opposite to entry
   */
  private getExitPoint(entryEdge: 'left' | 'right' | 'top' | 'bottom'): {
    position: PIXI.Point;
    edge: 'left' | 'right' | 'top' | 'bottom';
  } {
    const oppositeEdge = {
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top'
    }[entryEdge] as 'left' | 'right' | 'top' | 'bottom';
    
    return this.getEntryPoint(oppositeEdge);
  }

  /**
   * Updates formation positions
   */
  private updateFormations(): void {
    this.formations.forEach((formation, id) => {
      if (!formation.leader || !this.activeFish.has(formation.leader.fish.dna.id)) {
        // Leader is gone, dissolve formation
        this.formations.delete(id);
      }
    });
  }

  /**
   * Removes fish that are outside despawn area
   */
  private cleanupFish(): void {
    this.activeFish.forEach((activeFish, id) => {
      const { fish } = activeFish;
      const bounds = this.bounds.despawnArea;
      
      if (fish.x < bounds.x || 
          fish.x > bounds.x + bounds.width ||
          fish.y < bounds.y || 
          fish.y > bounds.y + bounds.height) {
        
        // Remove from appropriate layer
        const layer = this.layers.get(activeFish.behavior.layerDepth);
        if (layer) {
          layer.removeChild(fish);
        }
        
        fish.destroy();
        this.activeFish.delete(id);
        
        // Check if it was the boss
        if (activeFish === this.activeBoss) {
          this.activeBoss = null;
          this.bossActive = false;
        }
      }
    });
  }

  /**
   * Dynamic spawning for continuous gameplay
   */
  private dynamicSpawn(): void {
    if (this.spawnTimer < this.nextSpawnTime) return;
    
    // Generate random spawn event
    const categories = [FishCategory.SMALL, FishCategory.SMALL, FishCategory.MEDIUM];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const event: SpawnEvent = {
      time: this.spawnTimer,
      category,
      species: this.getRandomSpecies(category),
      count: category === FishCategory.SMALL ? 3 + Math.floor(Math.random() * 5) : 1,
      behavior: {
        speed: this.getSpeedForCategory(category),
        swimStyle: Math.random() > 0.5 ? SwimStyle.WAVE : SwimStyle.STRAIGHT
      },
      entryPoint: 'random'
    };
    
    // Add formation chance for small fish
    if (category === FishCategory.SMALL && Math.random() > 0.5) {
      event.formation = ([FormationType.SNAKE, FormationType.V_FORMATION] as const)[
        Math.floor(Math.random() * 2)
      ];
    }
    
    this.executeSpawnEvent(event);
    
    // Schedule next spawn
    this.nextSpawnTime = this.spawnTimer + 3000 + Math.random() * 5000;
  }

  /**
   * Helper methods
   */
  private getLayerDepth(category: FishCategory): number {
    const depths = {
      [FishCategory.SMALL]: 1,
      [FishCategory.MEDIUM]: 2,
      [FishCategory.LARGE]: 3,
      [FishCategory.BOSS]: 5,
      [FishCategory.EVENT]: 4
    };
    return depths[category];
  }

  private getSpeedForCategory(category: FishCategory): number {
    const speeds = {
      [FishCategory.SMALL]: 1.2 + Math.random() * 0.6,
      [FishCategory.MEDIUM]: 0.8 + Math.random() * 0.4,
      [FishCategory.LARGE]: 0.5 + Math.random() * 0.3,
      [FishCategory.BOSS]: 0.3,
      [FishCategory.EVENT]: 1.0
    };
    return speeds[category];
  }

  private getFormationSpacing(category: FishCategory): number {
    const spacing = {
      [FishCategory.SMALL]: 50,
      [FishCategory.MEDIUM]: 80,
      [FishCategory.LARGE]: 120,
      [FishCategory.BOSS]: 200,
      [FishCategory.EVENT]: 100
    };
    return spacing[category];
  }

  private getRandomSpecies(category: FishCategory): string {
    const species = {
      [FishCategory.SMALL]: ['neonTetra', 'goldfish'],
      [FishCategory.MEDIUM]: ['crystalShark', 'voidAngel'],
      [FishCategory.LARGE]: ['ancientDragon'],
      [FishCategory.BOSS]: ['cosmicWhale'],
      [FishCategory.EVENT]: ['goldfish']
    };
    
    const options = species[category];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generates formation pattern positions
   */
  private generateFormationPattern(type: FormationType, count: number): PIXI.Point[] {
    const positions: PIXI.Point[] = [new PIXI.Point(0, 0)]; // Leader at origin
    
    switch (type) {
      case FormationType.SNAKE:
        for (let i = 1; i < count; i++) {
          positions.push(new PIXI.Point(-i * 60, 0));
        }
        break;
        
      case FormationType.V_FORMATION:
        const half = Math.floor(count / 2);
        for (let i = 1; i <= half; i++) {
          positions.push(new PIXI.Point(-i * 50, i * 30));
          if (positions.length < count) {
            positions.push(new PIXI.Point(-i * 50, -i * 30));
          }
        }
        break;
        
      case FormationType.CIRCLE:
        const radius = 100;
        for (let i = 1; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          positions.push(new PIXI.Point(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
          ));
        }
        break;
        
      case FormationType.DIAMOND:
        const diamondPositions = [
          new PIXI.Point(-50, 0),
          new PIXI.Point(0, 50),
          new PIXI.Point(50, 0),
          new PIXI.Point(0, -50)
        ];
        for (let i = 1; i < count && i <= 4; i++) {
          positions.push(diamondPositions[i - 1]);
        }
        break;
    }
    
    return positions;
  }

  /**
   * Generates fish DNA
   */
  private generateFishDNA(species: string, rarity: FishDNA['rarity'], category: FishCategory): FishDNA {
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
        size: this.getSizeMultiplier(category),
        speed: 0.8 + Math.random() * 0.4,
        aggression: Math.random(),
        intelligence: Math.random()
      }
    };
  }

  private getSizeMultiplier(category: FishCategory): number {
    const sizes = {
      [FishCategory.SMALL]: 0.5 + Math.random() * 0.2,
      [FishCategory.MEDIUM]: 0.8 + Math.random() * 0.2,
      [FishCategory.LARGE]: 1.2 + Math.random() * 0.3,
      [FishCategory.BOSS]: 2.0 + Math.random() * 0.5,
      [FishCategory.EVENT]: 1.0
    };
    return sizes[category];
  }

  private getBodyShapeForSpecies(species: string): string {
    const shapes: Record<string, string> = {
      goldfish: 'round',
      neonTetra: 'streamlined',
      crystalShark: 'streamlined',
      cosmicWhale: 'massive',
      voidAngel: 'diamond',
      ancientDragon: 'serpentine'
    };
    return shapes[species] || 'round';
  }

  private getRandomPattern(): string {
    const patterns = ['stripes', 'dots', 'scales', 'waves', 'gradient'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private getColorsForSpecies(species: string): FishDNA['colors'] {
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
      },
      voidAngel: {
        primary: '#000000',
        secondary: '#330066',
        accent: '#9900ff'
      },
      ancientDragon: {
        primary: '#ff0000',
        secondary: '#ffaa00',
        accent: '#ffff00'
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
   * Public API
   */
  public getActiveFishCount(): number {
    return this.activeFish.size;
  }

  public isBossActive(): boolean {
    return this.bossActive;
  }

  public addCustomSpawnEvent(event: SpawnEvent): void {
    event.time = this.spawnTimer + (event.time || 1000);
    this.spawnQueue.push(event);
  }

  public clearAllFish(): void {
    this.activeFish.forEach((activeFish) => {
      const layer = this.layers.get(activeFish.behavior.layerDepth);
      if (layer) {
        layer.removeChild(activeFish.fish);
      }
      activeFish.fish.destroy();
    });
    this.activeFish.clear();
    this.formations.clear();
    this.bossActive = false;
    this.activeBoss = null;
  }
}
