import * as PIXI from 'pixi.js';

export interface FishConfig {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  baseReward: number;
  health: number;
  maxHealth: number;
  speed: number;
  size: number;
}

export class FishV8 extends PIXI.Container {
  public config: FishConfig;
  public currentHealth: number;
  private fishSprite: PIXI.Sprite;
  private nameLabel!: PIXI.Text;
  private healthBar?: PIXI.Graphics;
  
  // Simple movement
  public velocity: { x: number; y: number };
  private _direction: number;
  
  constructor(config: FishConfig, texture: PIXI.Texture) {
    super();
    
    this.config = config;
    this.currentHealth = config.health;
    
    // Create fish sprite
    this.fishSprite = new PIXI.Sprite({
      texture,
      anchor: { x: 0.5, y: 0.5 },
    });
    
    // Scale based on size
    this.fishSprite.scale.set(config.size);
    
    // Apply rarity tint
    this.applyRarityTint();
    
    // Create UI elements
    this.createNameLabel();
    if (config.health > 5) {
      this.createHealthBar();
    }
    
    // Add glow for rare fish
    if (config.rarity !== 'common') {
      this.createGlowEffect();
    }
    
    // Add components
    this.addChild(this.fishSprite);
    this.addChild(this.nameLabel);
    if (this.healthBar) {
      this.addChild(this.healthBar);
    }
    
    // Initialize movement
    this._direction = Math.random() * Math.PI * 2;
    const speed = config.speed * (0.5 + Math.random() * 0.5);
    this.velocity = {
      x: Math.cos(this._direction) * speed,
      y: Math.sin(this._direction) * speed
    };
    
    // Make interactive
    this.eventMode = 'static';
    this.cursor = 'pointer';
  }
  
  private applyRarityTint(): void {
    const tints: Record<string, number> = {
      common: 0xffffff,
      rare: 0x4da6ff,
      epic: 0xcc66ff,
      legendary: 0xffcc00,
      mythic: 0xff66ff
    };
    
    this.fishSprite.tint = tints[this.config.rarity];
  }
  
  private createNameLabel(): void {
    // Using PIXI v8's new Text API
    this.nameLabel = new PIXI.Text({
      text: `${this.config.name} (${this.config.baseReward}💰)`,
      style: {
        fontFamily: 'Arial',
        fontSize: 14 * this.config.size,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { 
          color: 0x000000, 
          width: 3 
        },
        dropShadow: {
          alpha: 0.8,
          angle: Math.PI / 4,
          blur: 4,
          color: 0x000000,
          distance: 2,
        }
      }
    });
    
    this.nameLabel.anchor.set(0.5, 1);
    this.nameLabel.position.y = this.fishSprite.height / 2 + 10;
  }
  
  private createHealthBar(): void {
    this.healthBar = new PIXI.Graphics();
    this.updateHealthBar();
    this.healthBar.position.set(0, -this.fishSprite.height / 2 - 20);
  }
  
  public updateHealthBar(): void {
    if (!this.healthBar) return;
    
    const width = 60 * this.config.size;
    const height = 6 * this.config.size;
    const healthPercent = this.currentHealth / this.config.maxHealth;
    
    this.healthBar.clear();
    
    // Background using new Graphics API
    this.healthBar
      .rect(-width/2, -height/2, width, height)
      .fill({ color: 0x000000, alpha: 0.7 });
    
    // Health fill
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : 
                       healthPercent > 0.25 ? 0xffff00 : 
                       0xff0000;
    
    this.healthBar
      .rect(-width/2, -height/2, width * healthPercent, height)
      .fill({ color: healthColor });
    
    // Border
    this.healthBar
      .rect(-width/2, -height/2, width, height)
      .stroke({ color: 0xffffff, width: 1 });
  }
  
  private createGlowEffect(): void {
    // For now, we'll add the glow effect directly to the fish sprite
    if (this.config.rarity !== 'common') {
      const glowStrength: Record<string, number> = {
        rare: 5,
        epic: 8,
        legendary: 12,
        mythic: 15
      };
      
      // Apply glow filter directly to the fish sprite
      this.fishSprite.filters = [
        new PIXI.BlurFilter({
          strength: glowStrength[this.config.rarity] || 5,
          quality: 4
        })
      ];
    }
  }
  
  public update(deltaTime: number): void {
    // Simple linear movement
    this.x += this.velocity.x * deltaTime * 0.06;
    this.y += this.velocity.y * deltaTime * 0.06;
    
    // Update rotation to face movement direction
    this.fishSprite.rotation = Math.atan2(this.velocity.y, this.velocity.x);
    
    // The water displacement filter will create the swimming effect
    // So we just need simple movement here
  }
  
  public takeDamage(damage: number): boolean {
    this.currentHealth -= damage;
    this.updateHealthBar();
    
    // Flash effect
    const originalTint = this.fishSprite.tint;
    this.fishSprite.tint = 0xff0000;
    
    setTimeout(() => {
      this.fishSprite.tint = originalTint;
    }, 100);
    
    // Show damage number
    this.showDamageNumber(damage);
    
    if (this.currentHealth <= 0) {
      this.emit('death', {
        reward: this.config.baseReward,
        position: this.position.clone()
      });
      return true;
    }
    
    return false;
  }
  
  private showDamageNumber(damage: number): void {
    const damageText = new PIXI.Text({
      text: `-${damage}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xff0000,
        stroke: { color: 0xffffff, width: 2 }
      }
    });
    
    damageText.anchor.set(0.5);
    damageText.position.set(0, -20);
    this.addChild(damageText);
    
    // Simple animation
    let time = 0;
    const ticker = PIXI.Ticker.shared;
    
    const animate = (t: PIXI.Ticker) => {
      time += t.deltaTime;
      damageText.position.y -= 1;
      damageText.alpha -= 0.02;
      
      if (damageText.alpha <= 0) {
        this.removeChild(damageText);
        ticker.remove(animate);
      }
    };
    
    ticker.add(animate);
  }
  
  // Check if point is over fish (for click detection)
  public containsPoint(point: PIXI.Point): boolean {
    return this.fishSprite.containsPoint(point);
  }
}
