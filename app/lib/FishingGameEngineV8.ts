import * as PIXI from 'pixi.js';
import { FishV8, FishConfig } from './FishV8';

export class FishingGameEngineV8 {
  private app!: PIXI.Application;
  private gameContainer!: PIXI.Container;
  private fishContainer!: PIXI.Container;
  private effectsContainer!: PIXI.Container;
  private uiLayer!: PIXI.Container;
  
  // Water effect
  private waterOverlay!: PIXI.TilingSprite;
  private displacementSprite!: PIXI.Sprite;
  private displacementFilter!: PIXI.DisplacementFilter;
  
  // Game objects
  private fishes: FishV8[] = [];
  private bullets: PIXI.Graphics[] = [];
  
  // Game state
  private coins = 1000;
  private score = 0;
  private cannonPower = 1;
  
  // UI elements
  private scoreText!: PIXI.Text;
  private coinsText!: PIXI.Text;
  private powerText!: PIXI.Text;
  
  // Interaction
  private cannon!: PIXI.Container;
  private mousePosition = new PIXI.Point();
  
  constructor(private canvas: HTMLCanvasElement) {}
  
  async init(): Promise<void> {
    // Initialize PIXI v8 Application
    this.app = new PIXI.Application();
    
    await this.app.init({
      canvas: this.canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x001a33,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      preference: 'webgl',
    });
    
    // Setup containers
    this.setupContainers();
    
    // Create ocean background with gradient
    await this.createOceanBackground();
    
    // Create water displacement effect
    await this.createWaterEffect();
    
    // Create UI
    this.createUI();
    
    // Create cannon
    this.createCannon();
    
    // Setup interactions
    this.setupInteractions();
    
    // Start game loop
    this.app.ticker.add(this.gameLoop, this);
    
    // Start spawning fish
    this.startFishSpawning();
  }
  
  private setupContainers(): void {
    // Main game container (affected by water displacement)
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    
    // Fish container
    this.fishContainer = new PIXI.Container();
    this.gameContainer.addChild(this.fishContainer);
    
    // Effects container
    this.effectsContainer = new PIXI.Container();
    this.gameContainer.addChild(this.effectsContainer);
    
    // UI Layer (not affected by water displacement)
    this.uiLayer = new PIXI.Container();
    this.app.stage.addChild(this.uiLayer);
  }
  
  private async createOceanBackground(): Promise<void> {
    // Create gradient background
    const gradientTexture = await this.createGradientTexture(
      [0x000814, 0x001a33, 0x003366],
      this.app.screen.width,
      this.app.screen.height
    );
    
    const background = new PIXI.Sprite(gradientTexture);
    this.gameContainer.addChild(background);
    
    // Add some static bubbles for atmosphere
    this.createBubbles();
  }
  
  private createGradientTexture(colors: number[], width: number, height: number): Promise<PIXI.Texture> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    colors.forEach((color, index) => {
      const stop = index / (colors.length - 1);
      const r = (color >> 16) & 0xff;
      const g = (color >> 8) & 0xff;
      const b = color & 0xff;
      gradient.addColorStop(stop, `rgb(${r},${g},${b})`);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return Promise.resolve(PIXI.Texture.from(canvas));
  }
  
  private createBubbles(): void {
    const bubbleContainer = new PIXI.Container();
    
    // Create bubble texture
    const bubbleGraphics = new PIXI.Graphics();
    bubbleGraphics
      .circle(0, 0, 10)
      .stroke({ color: 0xffffff, alpha: 0.3, width: 2 })
      .fill({ color: 0xffffff, alpha: 0.1 });
    
    const bubbleTexture = this.app.renderer.generateTexture(bubbleGraphics);
    
    // Create bubbles
    for (let i = 0; i < 20; i++) {
      const bubble = new PIXI.Sprite(bubbleTexture);
      bubble.anchor.set(0.5);
      bubble.position.set(
        Math.random() * this.app.screen.width,
        this.app.screen.height + 50
      );
      
      const scale = 0.2 + Math.random() * 0.8;
      bubble.scale.set(scale);
      
      bubbleContainer.addChild(bubble);
      
      // Animate bubble
      const speed = 0.5 + Math.random() * 1.5;
      const wobble = Math.random() * 2 - 1;
      
      this.app.ticker.add(() => {
        bubble.y -= speed;
        bubble.x += Math.sin(bubble.y * 0.01) * wobble;
        
        if (bubble.y < -50) {
          bubble.y = this.app.screen.height + 50;
          bubble.x = Math.random() * this.app.screen.width;
        }
      });
    }
    
    this.gameContainer.addChild(bubbleContainer);
  }
  
  private async createWaterEffect(): Promise<void> {
    // Create displacement map texture
    const displacementTexture = await this.createDisplacementTexture();
    
    // Create displacement sprite
    this.displacementSprite = new PIXI.Sprite(displacementTexture);
    this.displacementSprite.texture.source.wrapMode = 'repeat';
    this.displacementSprite.scale.set(2);
    
    // Create displacement filter
    this.displacementFilter = new PIXI.DisplacementFilter({
      sprite: this.displacementSprite,
      scale: 30, // Strength of displacement
      rotation: 0,
    });
    
    // Add displacement sprite to container
    this.gameContainer.addChild(this.displacementSprite);
    
    // Apply filter to game container
    this.gameContainer.filters = [this.displacementFilter];
    
    // Create water overlay for caustics effect
    const waterOverlayTexture = await this.createWaterOverlayTexture();
    this.waterOverlay = new PIXI.TilingSprite({
      texture: waterOverlayTexture,
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    this.waterOverlay.alpha = 0.2;
    this.waterOverlay.blendMode = 'add';
    
    this.gameContainer.addChild(this.waterOverlay);
  }
  
  private createDisplacementTexture(): Promise<PIXI.Texture> {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Create Perlin-noise-like pattern
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        
        // Create smooth noise pattern
        const value1 = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 127 + 127;
        const value2 = Math.sin(x * 0.02 + 100) * Math.cos(y * 0.02 + 100) * 127 + 127;
        
        data[i] = value1;     // red (x displacement)
        data[i + 1] = value2; // green (y displacement)
        data[i + 2] = 128;    // blue (unused)
        data[i + 3] = 255;    // alpha
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return Promise.resolve(PIXI.Texture.from(canvas));
  }
  
  private createWaterOverlayTexture(): Promise<PIXI.Texture> {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Create caustics-like pattern
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 20 + Math.random() * 40;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    return Promise.resolve(PIXI.Texture.from(canvas));
  }
  
  private createUI(): void {
    // UI Background
    const uiBg = new PIXI.Graphics();
    uiBg
      .roundRect(20, 20, 300, 150, 15)
      .fill({ color: 0x000000, alpha: 0.7 })
      .stroke({ color: 0x00ccff, width: 2 });
    
    this.uiLayer.addChild(uiBg);
    
    // Score text
    this.scoreText = new PIXI.Text({
      text: `Score: ${this.score}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 28,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 4 }
      }
    });
    this.scoreText.position.set(40, 35);
    this.uiLayer.addChild(this.scoreText);
    
    // Coins text
    this.coinsText = new PIXI.Text({
      text: `💰 ${this.coins}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffd700,
        stroke: { color: 0x000000, width: 3 }
      }
    });
    this.coinsText.position.set(40, 75);
    this.uiLayer.addChild(this.coinsText);
    
    // Power text
    this.powerText = new PIXI.Text({
      text: `⚡ Power: ${this.cannonPower}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0x00ccff,
        stroke: { color: 0x000000, width: 3 }
      }
    });
    this.powerText.position.set(40, 115);
    this.uiLayer.addChild(this.powerText);
    
    // Create upgrade button
    this.createUpgradeButton();
  }
  
  private createUpgradeButton(): void {
    const button = new PIXI.Container();
    
    const bg = new PIXI.Graphics();
    bg
      .roundRect(0, 0, 150, 40, 20)
      .fill({ color: 0x00cc00 })
      .stroke({ color: 0x00ff00, width: 2 });
    
    const text = new PIXI.Text({
      text: '⬆️ Upgrade',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffffff
      }
    });
    text.anchor.set(0.5);
    text.position.set(75, 20);
    
    button.addChild(bg);
    button.addChild(text);
    button.position.set(200, 115);
    
    // Make interactive
    button.eventMode = 'static';
    button.cursor = 'pointer';
    
    button.on('pointerdown', () => {
      const cost = this.cannonPower * 100;
      if (this.coins >= cost) {
        this.coins -= cost;
        this.cannonPower++;
        this.updateUI();
      }
    });
    
    button.on('pointerover', () => {
      bg.tint = 0xcccccc;
    });
    
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    this.uiLayer.addChild(button);
  }
  
  private createCannon(): void {
    this.cannon = new PIXI.Container();
    
    // Base
    const base = new PIXI.Graphics();
    base
      .circle(0, 0, 40)
      .fill({ color: 0x444444 })
      .stroke({ color: 0x666666, width: 3 });
    
    // Barrel
    const barrel = new PIXI.Graphics();
    barrel
      .rect(-10, -60, 20, 60)
      .fill({ color: 0x666666 })
      .stroke({ color: 0x888888, width: 2 });
    
    // Power indicator
    const powerGlow = new PIXI.Graphics();
    const glowColor = this.getPowerColor();
    powerGlow
      .circle(0, -60, 15)
      .fill({ color: glowColor, alpha: 0.6 });
    
          powerGlow.filters = [new PIXI.BlurFilter({ strength: 10 })];
    
    this.cannon.addChild(base);
    this.cannon.addChild(barrel);
    this.cannon.addChild(powerGlow);
    
    this.cannon.position.set(this.app.screen.width / 2, this.app.screen.height - 80);
    this.uiLayer.addChild(this.cannon);
  }
  
  private getPowerColor(): number {
    if (this.cannonPower < 3) return 0x00ccff;
    if (this.cannonPower < 5) return 0x00ff00;
    if (this.cannonPower < 7) return 0xffff00;
    return 0xff0000;
  }
  
  private setupInteractions(): void {
    // Track mouse
    this.app.stage.eventMode = 'static';
    
    this.app.stage.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      this.mousePosition = event.global;
      
      // Update cannon rotation
      const dx = this.mousePosition.x - this.cannon.x;
      const dy = this.mousePosition.y - this.cannon.y;
      this.cannon.rotation = Math.atan2(dy, dx) + Math.PI / 2;
    });
    
    // Shoot on click
    this.app.stage.on('pointerdown', () => {
      this.shoot();
    });
  }
  
  private shoot(): void {
    if (this.coins < 1) return;
    
    this.coins -= 1;
    this.updateUI();
    
    // Create bullet
    const bullet = new PIXI.Graphics();
    bullet
      .circle(0, 0, 5 + this.cannonPower)
      .fill({ color: this.getPowerColor() });
    
    bullet.position.copyFrom(this.cannon.position);
    
    // Calculate velocity
    const dx = this.mousePosition.x - this.cannon.x;
    const dy = this.mousePosition.y - this.cannon.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    (bullet as any).velocity = {
      x: (dx / distance) * 10,
      y: (dy / distance) * 10
    };
    
    this.effectsContainer.addChild(bullet);
    this.bullets.push(bullet);
    
    // Muzzle flash
    this.createMuzzleFlash();
  }
  
  private createMuzzleFlash(): void {
    const flash = new PIXI.Graphics();
    flash
      .circle(0, 0, 20)
      .fill({ color: this.getPowerColor(), alpha: 0.8 });
    
    flash.position.copyFrom(this.cannon.position);
    flash.position.y -= 60;
    
    this.effectsContainer.addChild(flash);
    
    // Fade out
    const fadeOut = () => {
      flash.alpha -= 0.1;
      flash.scale.x += 0.1;
      flash.scale.y += 0.1;
      
      if (flash.alpha <= 0) {
        this.effectsContainer.removeChild(flash);
        PIXI.Ticker.shared.remove(fadeOut);
      }
    };
    
    PIXI.Ticker.shared.add(fadeOut);
  }
  
  private createFishTexture(): Promise<PIXI.Texture> {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 60;
    const ctx = canvas.getContext('2d')!;
    
    // Fish body
    ctx.fillStyle = '#4da6ff';
    ctx.beginPath();
    ctx.ellipse(50, 30, 40, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail
    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.lineTo(0, 10);
    ctx.lineTo(0, 50);
    ctx.closePath();
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(65, 25, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(67, 25, 3, 0, Math.PI * 2);
    ctx.fill();
    
    return Promise.resolve(PIXI.Texture.from(canvas));
  }
  
  private async startFishSpawning(): Promise<void> {
    const fishTexture = await this.createFishTexture();
    
    // Spawn fish periodically
    setInterval(() => {
      const rarities: Array<'common' | 'rare' | 'epic' | 'legendary' | 'mythic'> = 
        ['common', 'common', 'common', 'rare', 'rare', 'epic', 'legendary'];
      
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];
      
      const config: FishConfig = {
        id: `fish-${Date.now()}`,
        name: this.getRandomFishName(),
        rarity: rarity,
        baseReward: this.getRewardByRarity(rarity),
        health: this.getHealthByRarity(rarity),
        maxHealth: this.getHealthByRarity(rarity),
        speed: 1 + Math.random() * 2,
        size: this.getSizeByRarity(rarity)
      };
      
      const fish = new FishV8(config, fishTexture);
      
      // Random spawn position
      fish.position.set(
        Math.random() > 0.5 ? -50 : this.app.screen.width + 50,
        100 + Math.random() * (this.app.screen.height - 200)
      );
      
      // Set direction towards center
      if (fish.x < 0) {
        fish.velocity.x = Math.abs(fish.velocity.x);
      } else {
        fish.velocity.x = -Math.abs(fish.velocity.x);
      }
      
      // Listen for death
      fish.on('death', (data: any) => {
        this.score += data.reward;
        this.coins += data.reward;
        this.updateUI();
        this.showReward(data.reward, data.position);
        this.createDeathEffect(data.position);
      });
      
      this.fishContainer.addChild(fish);
      this.fishes.push(fish);
    }, 2000);
  }
  
  private getRandomFishName(): string {
    const names = ['Nemo', 'Dory', 'Bubbles', 'Splash', 'Finley', 'Coral', 'Wave', 'Storm'];
    return names[Math.floor(Math.random() * names.length)];
  }
  
  private getRewardByRarity(rarity: string): number {
    const rewards: Record<string, number> = {
      common: 10,
      rare: 50,
      epic: 200,
      legendary: 500,
      mythic: 1000
    };
    return rewards[rarity] || 10;
  }
  
  private getHealthByRarity(rarity: string): number {
    const health: Record<string, number> = {
      common: 10,
      rare: 25,
      epic: 50,
      legendary: 100,
      mythic: 200
    };
    return health[rarity] || 10;
  }
  
  private getSizeByRarity(rarity: string): number {
    const sizes: Record<string, number> = {
      common: 0.8,
      rare: 1,
      epic: 1.2,
      legendary: 1.5,
      mythic: 2
    };
    return sizes[rarity] || 1;
  }
  
  private showReward(amount: number, position: PIXI.IPointData): void {
    const text = new PIXI.Text({
      text: `+${amount} 💰`,
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffd700,
        stroke: { color: 0x000000, width: 3 }
      }
    });
    
    text.anchor.set(0.5);
    text.position.copyFrom(position);
    this.uiLayer.addChild(text);
    
    // Animate
    const animate = () => {
      text.y -= 2;
      text.alpha -= 0.02;
      
      if (text.alpha <= 0) {
        this.uiLayer.removeChild(text);
        PIXI.Ticker.shared.remove(animate);
      }
    };
    
    PIXI.Ticker.shared.add(animate);
  }
  
  private createDeathEffect(position: PIXI.IPointData): void {
    // Create particle burst
    for (let i = 0; i < 10; i++) {
      const particle = new PIXI.Graphics();
      particle
        .circle(0, 0, 3 + Math.random() * 5)
        .fill({ color: 0x4da6ff, alpha: 0.8 });
      
      particle.position.copyFrom(position);
      this.effectsContainer.addChild(particle);
      
      const angle = (i / 10) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const animate = () => {
        particle.x += vx;
        particle.y += vy;
        particle.alpha -= 0.02;
        
        if (particle.alpha <= 0) {
          this.effectsContainer.removeChild(particle);
          PIXI.Ticker.shared.remove(animate);
        }
      };
      
      PIXI.Ticker.shared.add(animate);
    }
  }
  
  private updateUI(): void {
    this.scoreText.text = `Score: ${this.score}`;
    this.coinsText.text = `💰 ${this.coins}`;
    this.powerText.text = `⚡ Power: ${this.cannonPower}`;
  }
  
  private gameLoop(ticker: PIXI.Ticker): void {
    const deltaTime = ticker.deltaTime;
    
    // Animate water displacement
    this.displacementSprite.x += 0.5 * deltaTime;
    this.displacementSprite.y += 0.5 * deltaTime;
    
    // Animate water overlay
    this.waterOverlay.tilePosition.x += 0.3 * deltaTime;
    this.waterOverlay.tilePosition.y += 0.3 * deltaTime;
    
    // Update fish
    for (let i = this.fishes.length - 1; i >= 0; i--) {
      const fish = this.fishes[i];
      fish.update(deltaTime);
      
      // Remove fish that are off screen
      if (fish.x < -200 || fish.x > this.app.screen.width + 200 ||
          fish.y < -200 || fish.y > this.app.screen.height + 200) {
        this.fishContainer.removeChild(fish);
        this.fishes.splice(i, 1);
      }
    }
    
    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      const velocity = (bullet as any).velocity;
      
      bullet.x += velocity.x * deltaTime;
      bullet.y += velocity.y * deltaTime;
      
      // Check collision with fish
      for (let j = this.fishes.length - 1; j >= 0; j--) {
        const fish = this.fishes[j];
        
        const dx = bullet.x - fish.x;
        const dy = bullet.y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50 * fish.config.size) {
          // Hit!
          const isDead = fish.takeDamage(this.cannonPower * 10);
          
          if (isDead) {
            this.fishContainer.removeChild(fish);
            this.fishes.splice(j, 1);
          }
          
          // Remove bullet
          this.effectsContainer.removeChild(bullet);
          this.bullets.splice(i, 1);
          
          // Create hit effect
          this.createHitEffect(bullet.position);
          break;
        }
      }
      
      // Remove bullets that are off screen
      if (bullet.x < -50 || bullet.x > this.app.screen.width + 50 ||
          bullet.y < -50 || bullet.y > this.app.screen.height + 50) {
        this.effectsContainer.removeChild(bullet);
        this.bullets.splice(i, 1);
      }
    }
  }
  
  private createHitEffect(position: PIXI.IPointData): void {
    const ring = new PIXI.Graphics();
    ring
      .circle(0, 0, 20)
      .stroke({ color: 0xffffff, width: 3, alpha: 0.8 });
    
    ring.position.copyFrom(position);
    this.effectsContainer.addChild(ring);
    
    const expand = () => {
      ring.scale.x += 0.1;
      ring.scale.y += 0.1;
      ring.alpha -= 0.05;
      
      if (ring.alpha <= 0) {
        this.effectsContainer.removeChild(ring);
        PIXI.Ticker.shared.remove(expand);
      }
    };
    
    PIXI.Ticker.shared.add(expand);
  }
  
  public destroy(): void {
    this.app.destroy(true);
  }
}
