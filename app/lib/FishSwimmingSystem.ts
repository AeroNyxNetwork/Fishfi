/**
 * FishSwimmingSystem.ts
 * 
 * Optimized fish swimming system with pre-calculated paths and smooth physics
 * 
 * @version 3.0.0
 * @path app/lib/FishSwimmingSystem.ts
 */

import * as PIXI from 'pixi.js';
import { ArtisticFishPixi, FishDNA } from './ArtisticFishPixi';
import { GeometryCache } from './GeometryCache';

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
  duration?: number;
  // Pre-calculated path points for performance
  pathPoints?: PIXI.Point[];
}

/**
 * Fish behavior parameters
 */
interface FishBehavior {
  speed: number;
  pathType: PathType;
  swimStyle: SwimStyle;
  waveAmplitude: number;
  waveFrequency: number;
  layerDepth: number;
  animationSpeed: number;
}

/**
 * Formation configuration
 */
interface FormationConfig {
  type: FormationType;
  fishCount: number;
  spacing: number;
  pattern: PIXI.Point[];
  leader?: ActiveFish;
}

/**
 * Active fish tracking with enhanced properties
 */
interface ActiveFish {
  id: string;
  fish: ArtisticFishPixi;
  category: FishCategory;
  behavior: FishBehavior;
  path: PathDefinition;
  pathProgress: number;
  currentPosition: PIXI.Point;
  swimPhase: number;
  formation?: FormationConfig;
  formationOffset?: PIXI.Point;
  isLeader?: boolean;
  // Pre-calculated values for optimization
  cachedRotation?: number;
  targetRotation?: number;
}

/**
 * Special formation type
 */
interface SpecialFormation {
  id: string;
  type: 'circle' | 'spiral' | 'wave';
  fish: ActiveFish[];
  centerX: number;
  centerY: number;
  radius: number;
  startTime: number;
  duration: number;
}

/**
 * Spawn event interface
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
 * Optimized fish swimming system
 */
export class FishSwimmingSystem {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private activeFish: Map<string, ActiveFish> = new Map();
  private formations: Map<string, FormationConfig> = new Map();
  private specialFormations: Map<string, SpecialFormation> = new Map();
  
  // Screen boundaries
  private bounds = {
    visibleArea: new PIXI.Rectangle(0, 0, 800, 600),
    spawnArea: new PIXI.Rectangle(-150, -150, 1100, 900),
    despawnArea: new PIXI.Rectangle(-200, -200, 1200, 1000)
  };
  
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
  private readonly BASE_SPEED = 60;
  
  // Performance optimization
  private readonly PATH_RESOLUTION = 100; // Points per path
  private pathCache: Map<string, PIXI.Point[]> = new Map();

  constructor(app: PIXI.Application, container: PIXI.Container) {
    this.app = app;
    this.container = container;
    
    this.updateBounds();
    this.initializeLayers();
    
    window.addEventListener('resize', () => this.updateBounds());
    
    this.initializeSpawnQueue();
  }

  /**
   * Gets the boss fish if active
   */
  private get bossFish(): ArtisticFishPixi | null {
    return this.activeBoss?.fish || null;
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
   * Initializes rendering layers
   */
  private initializeLayers(): void {
    for (let depth = 0; depth <= 5; depth++) {
      const layer = new PIXI.Container();
      layer.name = `layer_${depth}`;
      this.layers.set(depth, layer);
      this.container.addChild(layer);
    }
  }

  /**
   * Main update loop with optimizations
   */
  public update(deltaTime: number): void {
    this.spawnTimer += deltaTime;
    
    this.processSpawnQueue();
    this.updateFish(deltaTime);
    this.updateFormations();
    this.cleanupFish();
    
    if (!this.bossActive && this.activeFish.size < 20) {
      this.dynamicSpawn();
    }
  }

  /**
   * Updates fish formations - handles group behaviors and special formation patterns
   */
  private updateFormations(): void {
    // Update boss formation if boss is active
    if (this.bossActive && this.bossFish) {
      this.updateBossFormation();
    }
    
    // Update school formations for regular fish
    this.updateSchoolFormations();
    
    // Update any special formations (like during events)
    if (this.specialFormations.size > 0) {
      this.updateSpecialFormations();
    }
  }

  /**
   * Updates the formation around the boss fish
   */
  private updateBossFormation(): void {
    if (!this.activeBoss || !this.bossActive) return;
    
    const bossFish = this.activeBoss.fish;
    
    // Get minions that should follow the boss
    const minions = Array.from(this.activeFish.values()).filter(activeFish => 
      activeFish.formation?.leader === this.activeBoss
    );
    
    // Update minion positions relative to boss
    minions.forEach((minion, index) => {
      const angle = (index / minions.length) * Math.PI * 2;
      const radius = 150 + Math.sin(Date.now() * 0.001 + index) * 30;
      
      const targetX = bossFish.x + Math.cos(angle) * radius;
      const targetY = bossFish.y + Math.sin(angle) * radius;
      
      // Update formation offset
      if (!minion.formationOffset) {
        minion.formationOffset = new PIXI.Point(0, 0);
      }
      
      minion.formationOffset.x = targetX - minion.currentPosition.x;
      minion.formationOffset.y = targetY - minion.currentPosition.y;
    });
  }

  /**
   * Updates school formations for regular fish
   */
  private updateSchoolFormations(): void {
    // Group fish by species for schooling behavior
    const schools = new Map<string, ActiveFish[]>();
    
    this.activeFish.forEach(activeFish => {
      // Access the behavior through the ActiveFish interface
      if (!activeFish.isLeader && activeFish.fish.dna.species) {
        const species = activeFish.fish.dna.species;
        if (!schools.has(species)) {
          schools.set(species, []);
        }
        schools.get(species)!.push(activeFish);
      }
    });
    
    // Update each school
    schools.forEach((schoolFish, species) => {
      if (schoolFish.length < 3) return; // Need at least 3 fish for a school
      
      // Find the center of the school
      let centerX = 0;
      let centerY = 0;
      schoolFish.forEach(activeFish => {
        centerX += activeFish.fish.x;
        centerY += activeFish.fish.y;
      });
      centerX /= schoolFish.length;
      centerY /= schoolFish.length;
      
      // Apply cohesion and alignment forces
      schoolFish.forEach(activeFish => {
        const fish = activeFish.fish;
        
        // Cohesion - move towards center of school
        const cohesionForce = 0.001;
        const dx = centerX - fish.x;
        const dy = centerY - fish.y;
        
        // Since we're using path-based movement, we need to adjust the path or add offset
        // We can add a formation offset
        if (!activeFish.formationOffset) {
          activeFish.formationOffset = new PIXI.Point(0, 0);
        }
        
        activeFish.formationOffset.x += dx * cohesionForce;
        activeFish.formationOffset.y += dy * cohesionForce;
        
        // Separation - avoid getting too close to neighbors
        schoolFish.forEach(other => {
          if (other === activeFish) return;
          
          const otherFish = other.fish;
          const distX = fish.x - otherFish.x;
          const distY = fish.y - otherFish.y;
          const dist = Math.sqrt(distX * distX + distY * distY);
          
          if (dist < 50 && dist > 0) {
            const separationForce = 0.01 / dist;
            activeFish.formationOffset.x += distX * separationForce;
            activeFish.formationOffset.y += distY * separationForce;
          }
        });
      });
    });
  }

  /**
   * Updates special formations (events, patterns, etc.)
   */
  private updateSpecialFormations(): void {
    this.specialFormations.forEach((formation, id) => {
      const elapsed = Date.now() - formation.startTime;
      const progress = Math.min(elapsed / formation.duration, 1);
      
      // Update fish in this formation
      formation.fish.forEach((activeFish, index) => {
        // Use the id from the ActiveFish object instead of the fish
        if (!this.activeFish.has(activeFish.id)) {
          // Fish was removed, clean up
          formation.fish.splice(index, 1);
          return;
        }
        
        const fish = activeFish.fish;
        
        // Calculate position based on formation type
        let targetX = fish.x;
        let targetY = fish.y;
        
        switch (formation.type) {
          case 'circle':
            const angle = (index / formation.fish.length) * Math.PI * 2 + elapsed * 0.0005;
            targetX = formation.centerX + Math.cos(angle) * formation.radius;
            targetY = formation.centerY + Math.sin(angle) * formation.radius;
            break;
            
          case 'spiral':
            const spiralAngle = (index / formation.fish.length) * Math.PI * 2 + elapsed * 0.001;
            const spiralRadius = formation.radius * (1 - progress * 0.5);
            targetX = formation.centerX + Math.cos(spiralAngle) * spiralRadius;
            targetY = formation.centerY + Math.sin(spiralAngle) * spiralRadius;
            break;
            
          case 'wave':
            const waveOffset = index * 0.5;
            targetX = formation.centerX + (index - formation.fish.length / 2) * 30;
            targetY = formation.centerY + Math.sin(elapsed * 0.002 + waveOffset) * 50;
            break;
        }
        
        // Update formation offset for smooth movement
        if (!activeFish.formationOffset) {
          activeFish.formationOffset = new PIXI.Point(0, 0);
        }
        
        activeFish.formationOffset.x = targetX - activeFish.currentPosition.x;
        activeFish.formationOffset.y = targetY - activeFish.currentPosition.y;
      });
      
      // Remove completed formations
      if (progress >= 1) {
        this.specialFormations.delete(id);
      }
    });
  }

  /**
   * Creates a special formation
   */
  public createFormation(type: 'circle' | 'spiral' | 'wave', centerX: number, centerY: number, radius: number = 100): void {
    const formationId = `formation_${Date.now()}`;
    
    // Get nearby fish for the formation
    const nearbyFish = Array.from(this.activeFish.values()).filter(activeFish => {
      const fish = activeFish.fish;
      const dx = fish.x - centerX;
      const dy = fish.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < radius * 2 && !activeFish.isLeader;
    }).slice(0, 12); // Limit to 12 fish
    
    if (nearbyFish.length < 3) return; // Need at least 3 fish
    
    this.specialFormations.set(formationId, {
      id: formationId,
      type,
      fish: nearbyFish,
      centerX,
      centerY,
      radius,
      startTime: Date.now(),
      duration: 10000 // 10 seconds
    });
  }

  /**
   * Optimized fish update with lerped rotation
   */
  private updateFish(deltaTime: number): void {
    const deltaSeconds = deltaTime / 1000;
    
    this.activeFish.forEach((activeFish, id) => {
      const { fish, behavior, path } = activeFish;
      
      // Calculate movement
      const pathSpeed = behavior.speed * this.BASE_SPEED * deltaSeconds;
      const pathLength = this.calculatePathLength(path);
      const progressDelta = pathSpeed / pathLength;
      
      activeFish.pathProgress += progressDelta;
      
      // Get position from pre-calculated path
      const basePosition = this.getPositionAlongPath(path, activeFish.pathProgress);
      
      // Apply swimming style
      const swimOffset = this.applySwimStyle(
        behavior.swimStyle,
        behavior.waveAmplitude,
        behavior.waveFrequency,
        activeFish.swimPhase,
        deltaTime
      );
      
      activeFish.swimPhase += behavior.waveFrequency * deltaTime;
      
      // Formation handling
      if (activeFish.formation && activeFish.formationOffset && !activeFish.isLeader) {
        const leader = activeFish.formation.leader!;
        basePosition.x = leader.currentPosition.x + activeFish.formationOffset.x;
        basePosition.y = leader.currentPosition.y + activeFish.formationOffset.y;
      }
      
      // Update position
      fish.x = basePosition.x + swimOffset.x;
      fish.y = basePosition.y + swimOffset.y;
      activeFish.currentPosition.copyFrom(fish.position);
      
      // Smooth rotation with lerp
      const nextPosition = this.getPositionAlongPath(path, activeFish.pathProgress + 0.01);
      const targetAngle = Math.atan2(
        nextPosition.y - basePosition.y,
        nextPosition.x - basePosition.x
      );
      
      fish.rotation = this.lerpAngle(fish.rotation, targetAngle, 0.1);
      
      // Update fish animation
      fish.update(deltaTime);
    });
  }

  /**
   * Processes spawn queue
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
    const entryPoint = this.getEntryPoint(event.entryPoint);
    const exitPoint = this.getExitPoint(entryPoint);
    
    for (let i = 0; i < event.count; i++) {
      const dna = this.generateFishDNA(event.species, event.category);
      
      // Add formation offset for grouped spawns
      const spawnOffset = event.formation ? 
        new PIXI.Point(i * 30, Math.sin(i) * 20) : 
        new PIXI.Point(0, 0);
      
      const adjustedEntry = new PIXI.Point(
        entryPoint.x + spawnOffset.x,
        entryPoint.y + spawnOffset.y
      );
      
      this.spawnFish(dna, adjustedEntry, exitPoint, event.behavior);
    }
  }

  /**
   * Spawns a single fish
   */
  private spawnFish(dna: FishDNA, entryPoint: PIXI.Point, exitPoint: PIXI.Point, behavior: Partial<FishBehavior>): void {
    const fish = new ArtisticFishPixi(dna, this.app);
    const fishId = `fish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the complete behavior
    const completeBehavior: FishBehavior = {
      speed: behavior.speed || 1.0,
      pathType: behavior.pathType || PathType.LINEAR,
      swimStyle: behavior.swimStyle || SwimStyle.STRAIGHT,
      waveAmplitude: behavior.waveAmplitude || 10,
      waveFrequency: behavior.waveFrequency || 0.002,
      layerDepth: behavior.layerDepth || 2,
      animationSpeed: behavior.animationSpeed || 1.0
    };
    
    // Create the active fish entry
    const activeFish: ActiveFish = {
      id: fishId,
      fish,
      category: this.getCategoryFromSpecies(dna.species),
      behavior: completeBehavior,
      path: this.generatePath(entryPoint, exitPoint, completeBehavior.pathType),
      pathProgress: 0,
      currentPosition: new PIXI.Point(entryPoint.x, entryPoint.y),
      swimPhase: Math.random() * Math.PI * 2
    };
    
    // Position the fish
    fish.x = entryPoint.x;
    fish.y = entryPoint.y;
    
    // Add to the appropriate layer
    const layer = this.layers.get(completeBehavior.layerDepth);
    if (layer) {
      layer.addChild(fish);
    }
    
    // Add to active fish map
    this.activeFish.set(fishId, activeFish);
    
    // Handle boss spawning
    if (this.getCategoryFromSpecies(dna.species) === FishCategory.BOSS) {
      this.activeBoss = activeFish;
      this.bossActive = true;
    }
  }

  /**
   * Dynamic spawning based on current state
   */
  private dynamicSpawn(): void {
    if (this.spawnTimer < this.nextSpawnTime) return;
    
    const spawnTypes = [
      { category: FishCategory.SMALL, weight: 0.5 },
      { category: FishCategory.MEDIUM, weight: 0.3 },
      { category: FishCategory.LARGE, weight: 0.2 }
    ];
    
    const roll = Math.random();
    let cumulative = 0;
    let selectedCategory = FishCategory.SMALL;
    
    for (const type of spawnTypes) {
      cumulative += type.weight;
      if (roll < cumulative) {
        selectedCategory = type.category;
        break;
      }
    }
    
    const species = this.getRandomSpeciesForCategory(selectedCategory);
    const count = selectedCategory === FishCategory.SMALL ? 
      3 + Math.floor(Math.random() * 5) : 
      1 + Math.floor(Math.random() * 2);
    
    this.executeSpawnEvent({
      time: this.spawnTimer,
      category: selectedCategory,
      species,
      count,
      behavior: {
        speed: 0.8 + Math.random() * 0.4,
        swimStyle: this.getRandomSwimStyle()
      },
      entryPoint: 'random'
    });
    
    this.nextSpawnTime = this.spawnTimer + 3000 + Math.random() * 5000;
  }

  /**
   * Helper method to determine category from species
   */
  private getCategoryFromSpecies(species: string): FishCategory {
    const categoryMap: Record<string, FishCategory> = {
      'neonTetra': FishCategory.SMALL,
      'crystalShark': FishCategory.SMALL,
      'goldfish': FishCategory.MEDIUM,
      'voidAngel': FishCategory.LARGE,
      'cosmicWhale': FishCategory.BOSS,
      // Add more mappings as needed
    };
    
    return categoryMap[species] || FishCategory.MEDIUM;
  }

  /**
   * Gets random species for category
   */
  private getRandomSpeciesForCategory(category: FishCategory): string {
    const speciesByCategory: Record<FishCategory, string[]> = {
      [FishCategory.SMALL]: ['neonTetra', 'crystalShark', 'quantumMinnow'],
      [FishCategory.MEDIUM]: ['goldfish', 'electricEel', 'mysticKoi'],
      [FishCategory.LARGE]: ['voidAngel', 'spectralManta', 'cyberShark'],
      [FishCategory.BOSS]: ['cosmicWhale', 'nebulaDragon'],
      [FishCategory.EVENT]: ['festivalFish', 'crystalPhoenix']
    };
    
    const species = speciesByCategory[category];
    return species[Math.floor(Math.random() * species.length)];
  }

  /**
   * Gets random swim style
   */
  private getRandomSwimStyle(): SwimStyle {
    const styles = Object.values(SwimStyle);
    return styles[Math.floor(Math.random() * styles.length)];
  }

  /**
   * Gets entry point based on specification
   */
  private getEntryPoint(spec?: 'left' | 'right' | 'top' | 'bottom' | 'random'): PIXI.Point {
    const margin = this.SPAWN_MARGIN;
    const bounds = this.bounds.visibleArea;
    
    switch (spec || 'random') {
      case 'left':
        return new PIXI.Point(-margin, bounds.height * Math.random());
      case 'right':
        return new PIXI.Point(bounds.width + margin, bounds.height * Math.random());
      case 'top':
        return new PIXI.Point(bounds.width * Math.random(), -margin);
      case 'bottom':
        return new PIXI.Point(bounds.width * Math.random(), bounds.height + margin);
      case 'random':
      default:
        const side = Math.floor(Math.random() * 4);
        switch (side) {
          case 0: return this.getEntryPoint('left');
          case 1: return this.getEntryPoint('right');
          case 2: return this.getEntryPoint('top');
          case 3: return this.getEntryPoint('bottom');
          default: return this.getEntryPoint('left');
        }
    }
  }

  /**
   * Gets exit point based on entry
   */
  private getExitPoint(entryPoint: PIXI.Point): PIXI.Point {
    const bounds = this.bounds.visibleArea;
    const margin = this.SPAWN_MARGIN;
    
    // Determine which side the entry point is on
    const isLeft = entryPoint.x < 0;
    const isRight = entryPoint.x > bounds.width;
    const isTop = entryPoint.y < 0;
    const isBottom = entryPoint.y > bounds.height;
    
    // Exit on opposite side
    if (isLeft) {
      return new PIXI.Point(bounds.width + margin, bounds.height * Math.random());
    } else if (isRight) {
      return new PIXI.Point(-margin, bounds.height * Math.random());
    } else if (isTop) {
      return new PIXI.Point(bounds.width * Math.random(), bounds.height + margin);
    } else {
      return new PIXI.Point(bounds.width * Math.random(), -margin);
    }
  }

  /**
   * Generates fish DNA based on species and category
   */
  private generateFishDNA(species: string, category: FishCategory): FishDNA {
    // This should ideally come from a fish template system
    return {
      id: `${species}_${Date.now()}`,
      species,
      bodyShape: 'streamlined',
      pattern: 'scales',
      colors: {
        primary: '#' + Math.floor(Math.random()*16777215).toString(16),
        secondary: '#' + Math.floor(Math.random()*16777215).toString(16),
        accent: '#' + Math.floor(Math.random()*16777215).toString(16)
      },
      rarity: category === FishCategory.BOSS ? 'legendary' : 
              category === FishCategory.LARGE ? 'rare' : 
              category === FishCategory.MEDIUM ? 'uncommon' : 'common',
      traits: [],
      mutations: [],
      genes: {
        size: category === FishCategory.BOSS ? 0.9 : 
              category === FishCategory.LARGE ? 0.7 : 
              category === FishCategory.MEDIUM ? 0.5 : 0.3,
        speed: Math.random(),
        aggression: Math.random(),
        intelligence: Math.random()
      }
    };
  }

  /**
   * Initializes spawn queue
   */
  private initializeSpawnQueue(): void {
    this.spawnQueue = [
      {
        time: 2000,
        category: FishCategory.SMALL,
        species: 'neonTetra',
        count: 8,
        formation: FormationType.SNAKE,
        behavior: { speed: 1.5, swimStyle: SwimStyle.WAVE },
        entryPoint: 'left'
      },
      {
        time: 5000,
        category: FishCategory.MEDIUM,
        species: 'goldfish',
        count: 5,
        formation: FormationType.V_FORMATION,
        behavior: { speed: 1.0, swimStyle: SwimStyle.GLIDE },
        entryPoint: 'right'
      },
      {
        time: 8000,
        category: FishCategory.SMALL,
        species: 'crystalShark',
        count: 12,
        formation: FormationType.CIRCLE,
        behavior: { speed: 1.2, swimStyle: SwimStyle.WAVE },
        entryPoint: 'top'
      },
      {
        time: 12000,
        category: FishCategory.LARGE,
        species: 'voidAngel',
        count: 3,
        behavior: { speed: 0.7, swimStyle: SwimStyle.STRAIGHT },
        entryPoint: 'random'
      },
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
   * Generates path with pre-calculation
   */
  private generatePath(start: PIXI.Point, end: PIXI.Point, type: PathType): PathDefinition {
    const path: PathDefinition = {
      type,
      controlPoints: [],
      pathPoints: []
    };
    
    switch (type) {
      case PathType.LINEAR:
        path.controlPoints = [start, end];
        path.pathPoints = this.preCalculateLinearPath(start, end);
        break;
        
      case PathType.BEZIER_CURVE:
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const offset = 100 + Math.random() * 200;
        
        const control1 = new PIXI.Point(
          midX + (Math.random() - 0.5) * offset,
          midY + (Math.random() - 0.5) * offset
        );
        
        path.controlPoints = [start, control1, end];
        path.pathPoints = this.preCalculateBezierPath(start, control1, end);
        break;
        
      case PathType.COMPLEX_PATH:
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
        path.controlPoints = points;
        path.pathPoints = this.preCalculateComplexPath(points);
        break;
        
      default:
        path.controlPoints = [start, end];
        path.pathPoints = this.preCalculateLinearPath(start, end);
    }
    
    return path;
  }

  /**
   * Pre-calculates linear path points
   */
  private preCalculateLinearPath(start: PIXI.Point, end: PIXI.Point): PIXI.Point[] {
    const points: PIXI.Point[] = [];
    
    for (let i = 0; i <= this.PATH_RESOLUTION; i++) {
      const t = i / this.PATH_RESOLUTION;
      points.push(new PIXI.Point(
        start.x + (end.x - start.x) * t,
        start.y + (end.y - start.y) * t
      ));
    }
    
    return points;
  }

  /**
   * Pre-calculates bezier path points
   */
  private preCalculateBezierPath(p0: PIXI.Point, p1: PIXI.Point, p2: PIXI.Point): PIXI.Point[] {
    const points: PIXI.Point[] = [];
    
    for (let i = 0; i <= this.PATH_RESOLUTION; i++) {
      const t = i / this.PATH_RESOLUTION;
      const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
      points.push(new PIXI.Point(x, y));
    }
    
    return points;
  }

  /**
   * Pre-calculates complex path points
   */
  private preCalculateComplexPath(controlPoints: PIXI.Point[]): PIXI.Point[] {
    const points: PIXI.Point[] = [];
    const segmentCount = controlPoints.length - 1;
    
    for (let segment = 0; segment < segmentCount; segment++) {
      const start = controlPoints[segment];
      const end = controlPoints[segment + 1];
      const segmentPoints = Math.floor(this.PATH_RESOLUTION / segmentCount);
      
      for (let i = 0; i < segmentPoints; i++) {
        const t = i / segmentPoints;
        points.push(new PIXI.Point(
          start.x + (end.x - start.x) * t,
          start.y + (end.y - start.y) * t
        ));
      }
    }
    
    points.push(controlPoints[controlPoints.length - 1]);
    return points;
  }

  /**
   * Gets position along pre-calculated path
   */
  private getPositionAlongPath(path: PathDefinition, progress: number): PIXI.Point {
    const t = Math.max(0, Math.min(1, progress));
    
    if (path.pathPoints && path.pathPoints.length > 0) {
      const index = Math.floor(t * (path.pathPoints.length - 1));
      const localT = (t * (path.pathPoints.length - 1)) % 1;
      
      if (index < path.pathPoints.length - 1) {
        const p1 = path.pathPoints[index];
        const p2 = path.pathPoints[index + 1];
        
        return new PIXI.Point(
          p1.x + (p2.x - p1.x) * localT,
          p1.y + (p2.y - p1.y) * localT
        );
      }
      
      return path.pathPoints[path.pathPoints.length - 1];
    }
    
    // Fallback to real-time calculation
    return this.calculatePositionAlongPath(path, t);
  }

  /**
   * Fallback real-time path calculation
   */
  private calculatePositionAlongPath(path: PathDefinition, t: number): PIXI.Point {
    switch (path.type) {
      case PathType.LINEAR:
        const start = path.controlPoints[0];
        const end = path.controlPoints[1];
        return new PIXI.Point(
          start.x + (end.x - start.x) * t,
          start.y + (end.y - start.y) * t
        );
        
      case PathType.BEZIER_CURVE:
        if (path.controlPoints.length === 3) {
          const p0 = path.controlPoints[0];
          const p1 = path.controlPoints[1];
          const p2 = path.controlPoints[2];
          
          const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
          const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
          
          return new PIXI.Point(x, y);
        }
        break;
    }
    
    return path.controlPoints[path.controlPoints.length - 1];
  }

  /**
   * Smooth angle interpolation
   */
  private lerpAngle(current: number, target: number, alpha: number): number {
    let diff = target - current;
    
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    return current + diff * alpha;
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
        offset.y = Math.sin(phase) * amplitude;
        break;
        
      case SwimStyle.ERRATIC:
        if (Math.random() < 0.02) {
          offset.x = (Math.random() - 0.5) * amplitude * 2;
          offset.y = (Math.random() - 0.5) * amplitude * 2;
        }
        break;
        
      case SwimStyle.GLIDE:
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
    if (path.pathPoints && path.pathPoints.length > 1) {
      let length = 0;
      for (let i = 0; i < path.pathPoints.length - 1; i++) {
        const p1 = path.pathPoints[i];
        const p2 = path.pathPoints[i + 1];
        length += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      }
      return length || 1;
    }
    
    // Fallback to control points
    let length = 0;
    for (let i = 0; i < path.controlPoints.length - 1; i++) {
      const p1 = path.controlPoints[i];
      const p2 = path.controlPoints[i + 1];
      length += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
    
    return length || 1;
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
        
        const layer = this.layers.get(activeFish.behavior.layerDepth);
        if (layer) {
          layer.removeChild(fish);
        }
        
        fish.destroy();
        this.activeFish.delete(id);
        
        if (activeFish === this.activeBoss) {
          this.activeBoss = null;
          this.bossActive = false;
        }
      }
    });
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
    this.specialFormations.clear();
    this.bossActive = false;
    this.activeBoss = null;
    
    // Clear path cache periodically
    if (this.pathCache.size > 100) {
      this.pathCache.clear();
    }
  }
}
