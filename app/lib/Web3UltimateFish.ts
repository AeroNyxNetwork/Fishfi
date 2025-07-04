import * as PIXI from 'pixi.js';
import { Web3FishVisuals } from './Web3FishVisuals';
import { UltimateFishConfig } from './UltimateFishingGame';

// Enhanced UltimateFish class using the new Web3 visual system
export class Web3UltimateFish extends PIXI.Container {
  public config: UltimateFishConfig;
  public currentHealth: number;
  private visualContainer: PIXI.Container;
  private healthBar!: PIXI.Graphics;
  private damageNumbers: PIXI.Container;
  
  // Movement properties
  public velocity: PIXI.Point;
  private movementPattern: 'sine' | 'bezier' | 'circular' | 'erratic' = 'sine';
  private pathPoints: PIXI.Point[] = [];
  private pathProgress: number = 0;
  
  constructor(config: UltimateFishConfig, startX: number, startY: number) {
    super();
    
    this.config = config;
    this.currentHealth = config.health;
    this.position.set(startX, startY);
    this.damageNumbers = new PIXI.Container();
    
    // Map fish types to Web3 templates
    const templateMap: Record<string, keyof typeof Web3FishVisuals.FISH_TEMPLATES> = {
      'mini_neon': 'cryptoMinnow',
      'ice_fish': 'defiDolphin',
      'bomb_fish': 'defiDolphin',
      'golden_shark': 'nftShark',
      'dragon_king': 'metaverseLeviathan'
    };
    
    // Create visual using new system
    const template = templateMap[config.id] || 'cryptoMinnow';
    this.visualContainer = Web3FishVisuals.createWeb3Fish(template, config.size);
    this.addChild(this.visualContainer);
    
    // Initialize movement
    this.velocity = new PIXI.Point(-config.speed, 0);
    this.initializeMovementPattern();
    
    // Add health bar for valuable fish
    if (config.health > 5) {
      this.createHealthBar();
    }
    
    // Add damage number container
    this.addChild(this.damageNumbers);
    
    // Start special effect for rare fish
    if (config.rarity !== 'common') {
      this.startSpecialEffects();
    }
  }
  
  private initializeMovementPattern(): void {
    // Assign movement patterns based on rarity
    const patterns = {
      common: ['sine'],
      rare: ['sine', 'circular'],
      epic: ['bezier', 'circular'],
      legendary: ['bezier', 'erratic'],
      mythic: ['erratic']
    };
    
    const availablePatterns = patterns[this.config.rarity] || ['sine'];
    this.movementPattern = availablePatterns[
      Math.floor(Math.random() * availablePatterns.length)
    ] as any;
    
    // Generate path points for complex movements
    if (this.movementPattern === 'bezier') {
      this.generateBezierPath();
    } else if (this.movementPattern === 'erratic') {
      this.generateErraticPath();
    }
  }
  
  private generateBezierPath(): void {
    const points = 4;
    for (let i = 0; i < points; i++) {
      this.pathPoints.push(new PIXI.Point(
        Math.random() * 200 - 100,
        Math.random() * 100 - 50
      ));
    }
  }
  
  private generateErraticPath(): void {
    // Generate random waypoints
    const waypoints = 8;
    for (let i = 0; i < waypoints; i++) {
      this.pathPoints.push(new PIXI.Point(
        Math.random() * 300 - 150,
        Math.random() * 150 - 75
      ));
    }
  }
  
  private createHealthBar(): void {
    this.healthBar = new PIXI.Graphics();
    this.updateHealthBar();
    this.healthBar.position.y = -80 * this.config.size;
    this.addChild(this.healthBar);
  }
  
  private updateHealthBar(): void {
    if (!this.healthBar) return;
    
    this.healthBar.clear();
    
    const width = 60 * this.config.size;
    const height = 6 * this.config.size;
    const healthPercent = this.currentHealth / this.config.health;
    
    // Background with gradient
    const bgGradient = this.createGradientTexture(
      [0x000000, 0x333333],
      width,
      height
    );
    this.healthBar.beginTextureFill({ texture: bgGradient, alpha: 0.8 });
    this.healthBar.drawRoundedRect(-width/2, -height/2, width, height, height/2);
    this.healthBar.endFill();
    
    // Health fill with color based on percentage
    const healthColors = healthPercent > 0.5 ? [0x00ff00, 0x00cc00] :
                        healthPercent > 0.25 ? [0xffff00, 0xcccc00] :
                        [0xff0000, 0xcc0000];
    
    const healthGradient = this.createGradientTexture(healthColors, width, height);
    this.healthBar.beginTextureFill({ texture: healthGradient });
    this.healthBar.drawRoundedRect(
      -width/2,
      -height/2,
      width * healthPercent,
      height,
      height/2
    );
    this.healthBar.endFill();
    
    // Shine effect
    this.healthBar.beginFill(0xffffff, 0.3);
    this.healthBar.drawRect(-width/2 + 2, -height/2 + 1, width * healthPercent - 4, 2);
    this.healthBar.endFill();
  }
  
  private createGradientTexture(colors: number[], width: number, height: number): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    colors.forEach((color, index) => {
      const stop = index / (colors.length - 1);
      const r = (color >> 16) & 0xff;
      const g = (color >> 8) & 0xff;
      const b = color & 0xff;
      gradient.addColorStop(stop, `rgb(${r},${g},${b})`);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return PIXI.Texture.from(canvas);
  }
  
  private startSpecialEffects(): void {
    // Add Web3-specific effects based on special effect type
    if (this.config.specialEffect) {
      switch (this.config.specialEffect) {
        case 'freeze':
          this.addFreezeEffect();
          break;
        case 'bomb':
          this.addBombEffect();
          break;
        case 'lightning':
          this.addLightningEffect();
          break;
        case 'blackhole':
          this.addBlackholeEffect();
          break;
      }
    }
  }
  
  private addFreezeEffect(): void {
    // Ice crystals floating around the fish
    const iceContainer = new PIXI.Container();
    
    for (let i = 0; i < 6; i++) {
      const crystal = new PIXI.Graphics();
      crystal.beginFill(0x00ffff, 0.6);
      crystal.moveTo(0, -5);
      crystal.lineTo(5, 0);
      crystal.lineTo(0, 5);
      crystal.lineTo(-5, 0);
      crystal.closePath();
      crystal.endFill();
      
      crystal.position.set(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      );
      
      iceContainer.addChild(crystal);
      
      // Animate crystals
      const duration = 3 + Math.random() * 2;
      const startAngle = Math.random() * Math.PI * 2;
      
      const updateCrystal = () => {
        const time = Date.now() * 0.001;
        crystal.rotation = time * 0.5;
        crystal.x = Math.cos(startAngle + time / duration) * 60 * this.config.size;
        crystal.y = Math.sin(startAngle + time / duration) * 40 * this.config.size;
        crystal.alpha = 0.3 + Math.sin(time) * 0.3;
      };
      
      PIXI.Ticker.shared.add(updateCrystal);
    }
    
    this.addChildAt(iceContainer, 0);
  }
  
  private addBombEffect(): void {
    // Pulsing danger indicator
    const bombIndicator = new PIXI.Graphics();
    bombIndicator.beginFill(0xff0000, 0.3);
    bombIndicator.drawCircle(0, 0, 50 * this.config.size);
    bombIndicator.endFill();
    
    // Warning symbol
    const warning = new PIXI.Text('⚠️', {
      fontSize: 30 * this.config.size,
      fill: 0xff0000
    });
    warning.anchor.set(0.5);
    warning.position.y = -60 * this.config.size;
    
    this.addChildAt(bombIndicator, 0);
    this.addChild(warning);
    
    // Pulse animation
    const pulse = () => {
      const time = Date.now() * 0.001;
      bombIndicator.scale.set(1 + Math.sin(time * 4) * 0.2);
      bombIndicator.alpha = 0.3 + Math.sin(time * 4) * 0.2;
      warning.scale.set(1 + Math.sin(time * 8) * 0.1);
    };
    
    PIXI.Ticker.shared.add(pulse);
  }
  
  private addLightningEffect(): void {
    // Electric arcs around the fish
    const lightningContainer = new PIXI.Container();
    
    const drawLightning = () => {
      lightningContainer.removeChildren();
      
      if (Math.random() > 0.7) {
        for (let i = 0; i < 3; i++) {
          const lightning = new PIXI.Graphics();
          lightning.lineStyle(2, 0xffff00, 0.8);
          
          const startAngle = Math.random() * Math.PI * 2;
          const endAngle = startAngle + (Math.random() - 0.5) * Math.PI;
          const radius = 60 * this.config.size;
          
          const points: PIXI.Point[] = [];
          const segments = 8;
          
          for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            const angle = startAngle + (endAngle - startAngle) * t;
            const r = radius + (Math.random() - 0.5) * 20;
            points.push(new PIXI.Point(
              Math.cos(angle) * r,
              Math.sin(angle) * r
            ));
          }
          
          lightning.moveTo(points[0].x, points[0].y);
          for (let j = 1; j < points.length; j++) {
            lightning.lineTo(points[j].x, points[j].y);
          }
          
          lightningContainer.addChild(lightning);
        }
      }
    };
    
    // Update lightning periodically
    setInterval(drawLightning, 100);
    this.addChildAt(lightningContainer, 0);
  }
  
  private addBlackholeEffect(): void {
    // Gravitational distortion effect
    const blackholeContainer = new PIXI.Container();
    
    // Create swirling particles
    const particleCount = 20;
    const particles: any[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(0x9933ff, 0.6);
      particle.drawCircle(0, 0, 3);
      particle.endFill();
      
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 80 * this.config.size;
      
      particle.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
      
      particles.push({
        sprite: particle,
        angle: angle,
        radius: radius,
        speed: 0.02 + Math.random() * 0.02
      });
      
      blackholeContainer.addChild(particle);
    }
    
    // Animate swirl
    const updateSwirl = () => {
      particles.forEach(p => {
        p.angle += p.speed;
        p.radius = Math.max(10, p.radius - 0.5);
        
        p.sprite.x = Math.cos(p.angle) * p.radius;
        p.sprite.y = Math.sin(p.angle) * p.radius;
        p.sprite.scale.set(p.radius / (80 * this.config.size));
        
        if (p.radius <= 10) {
          p.radius = 80 * this.config.size;
        }
      });
    };
    
    PIXI.Ticker.shared.add(updateSwirl);
    this.addChildAt(blackholeContainer, 0);
  }
  
  public update(deltaTime: number): void {
    // Update position based on movement pattern
    switch (this.movementPattern) {
      case 'sine':
        this.updateSineMovement(deltaTime);
        break;
      case 'circular':
        this.updateCircularMovement(deltaTime);
        break;
      case 'bezier':
        this.updateBezierMovement(deltaTime);
        break;
      case 'erratic':
        this.updateErraticMovement(deltaTime);
        break;
    }
    
    // Update visual animations
    Web3FishVisuals.animateFish(this.visualContainer, deltaTime);
    
    // Update damage numbers
    this.updateDamageNumbers(deltaTime);
  }
  
  private updateSineMovement(deltaTime: number): void {
    this.x += this.velocity.x * deltaTime;
    this.y += Math.sin(Date.now() * 0.001 * this.config.speed * 0.5) * 
              2 * this.config.size;
  }
  
  private updateCircularMovement(deltaTime: number): void {
    const time = Date.now() * 0.001;
    const radius = 50 * this.config.size;
    
    this.x += this.velocity.x * deltaTime;
    this.y += Math.sin(time * this.config.speed * 0.3) * radius;
  }
  
  private updateBezierMovement(deltaTime: number): void {
    if (this.pathPoints.length < 4) return;
    
    this.pathProgress += deltaTime * 0.0005;
    if (this.pathProgress > 1) {
      this.pathProgress = 0;
      this.generateBezierPath();
    }
    
    const t = this.pathProgress;
    const p0 = this.pathPoints[0];
    const p1 = this.pathPoints[1];
    const p2 = this.pathPoints[2];
    const p3 = this.pathPoints[3];
    
    // Cubic bezier formula
    const x = Math.pow(1-t, 3) * p0.x + 
              3 * Math.pow(1-t, 2) * t * p1.x +
              3 * (1-t) * Math.pow(t, 2) * p2.x +
              Math.pow(t, 3) * p3.x;
              
    const y = Math.pow(1-t, 3) * p0.y + 
              3 * Math.pow(1-t, 2) * t * p1.y +
              3 * (1-t) * Math.pow(t, 2) * p2.y +
              Math.pow(t, 3) * p3.y;
    
    this.x += this.velocity.x * deltaTime;
    this.y += y * 0.5;
  }
  
  private updateErraticMovement(deltaTime: number): void {
    this.pathProgress += deltaTime * 0.001;
    
    if (this.pathProgress > 1) {
      this.pathProgress = 0;
      this.generateErraticPath();
    }
    
    const currentIndex = Math.floor(this.pathProgress * (this.pathPoints.length - 1));
    const nextIndex = Math.min(currentIndex + 1, this.pathPoints.length - 1);
    const localProgress = (this.pathProgress * (this.pathPoints.length - 1)) % 1;
    
    const current = this.pathPoints[currentIndex];
    const next = this.pathPoints[nextIndex];
    
    const targetY = current.y + (next.y - current.y) * localProgress;
    
    this.x += this.velocity.x * deltaTime;
    this.y += (targetY - this.y) * 0.1;
  }
  
  private updateDamageNumbers(deltaTime: number): void {
    this.damageNumbers.children.forEach(child => {
      child.y -= deltaTime * 0.1;
      child.alpha -= deltaTime * 0.001;
      
      if (child.alpha <= 0) {
        this.damageNumbers.removeChild(child);
      }
    });
  }
  
  public takeDamage(damage: number): boolean {
    this.currentHealth -= damage;
    this.updateHealthBar();
    
    // Create sophisticated damage number
    this.showDamageNumber(damage);
    
    // Visual feedback
    this.flashDamage();
    
    if (this.currentHealth <= 0) {
      this.die();
      return true;
    }
    
    return false;
  }
  
  private showDamageNumber(damage: number): void {
    const damageText = new PIXI.Text(`-${damage}`, {
      fontFamily: 'Arial Black',
      fontSize: 24 * this.config.size,
      fill: [0xff0000, 0xff6600],
      fontWeight: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowDistance: 2,
    });
    
    damageText.anchor.set(0.5);
    damageText.position.set(
      (Math.random() - 0.5) * 40,
      -40 * this.config.size
    );
    
    // Add bounce effect
    const startY = damageText.y;
    let velocity = -5;
    
    const updateDamage = () => {
      velocity += 0.3;
      damageText.y += velocity;
      
      if (damageText.y > startY && velocity > 0) {
        velocity *= -0.5;
        if (Math.abs(velocity) < 0.5) {
          PIXI.Ticker.shared.remove(updateDamage);
        }
      }
    };
    
    PIXI.Ticker.shared.add(updateDamage);
    this.damageNumbers.addChild(damageText);
  }
  
  private flashDamage(): void {
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffffff, 0.8);
    flash.drawRect(-100 * this.config.size, -100 * this.config.size, 
                   200 * this.config.size, 200 * this.config.size);
    flash.endFill();
    
    this.addChild(flash);
    
    // Fade out
    const fadeOut = () => {
      flash.alpha -= 0.1;
      if (flash.alpha <= 0) {
        this.removeChild(flash);
        PIXI.Ticker.shared.remove(fadeOut);
      }
    };
    
    PIXI.Ticker.shared.add(fadeOut);
  }
  
  private die(): void {
    // Trigger special effect death animation
    if (this.config.specialEffect) {
      this.triggerDeathEffect();
    }
    
    // Create epic death animation based on rarity
    this.createDeathAnimation();
    
    // Show rewards
    this.showRewards();
    
    // Emit death event
    this.emit('death', {
      fishId: this.config.id,
      reward: this.config.baseReward,
      position: this.position.clone()
    });
  }
  
  private triggerDeathEffect(): void {
    switch (this.config.specialEffect) {
      case 'freeze':
        this.createFreezeExplosion();
        break;
      case 'bomb':
        this.createBombExplosion();
        break;
      case 'lightning':
        this.createLightningExplosion();
        break;
      case 'blackhole':
        this.createBlackholeCollapse();
        break;
    }
  }
  
  private createFreezeExplosion(): void {
    // Ice shards explosion
    const shardCount = 12;
    for (let i = 0; i < shardCount; i++) {
      const shard = new PIXI.Graphics();
      shard.beginFill(0x00ffff, 0.8);
      shard.moveTo(0, -10);
      shard.lineTo(10, 0);
      shard.lineTo(0, 10);
      shard.lineTo(-10, 0);
      shard.closePath();
      shard.endFill();
      
      shard.position.copyFrom(this.position);
      this.parent.addChild(shard);
      
      const angle = (i / shardCount) * Math.PI * 2;
      const speed = 5 + Math.random() * 5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      let rotation = Math.random() * 0.3;
      
      const updateShard = () => {
        shard.x += vx;
        shard.y += vy;
        shard.rotation += rotation;
        shard.alpha -= 0.02;
        shard.scale.set(shard.scale.x * 0.98);
        
        if (shard.alpha <= 0) {
          shard.parent?.removeChild(shard);
          PIXI.Ticker.shared.remove(updateShard);
        }
      };
      
      PIXI.Ticker.shared.add(updateShard);
    }
    
    // Freeze wave effect
    const freezeWave = new PIXI.Graphics();
    freezeWave.lineStyle(4, 0x00ffff, 0.6);
    freezeWave.drawCircle(0, 0, 50);
    freezeWave.position.copyFrom(this.position);
    this.parent.addChild(freezeWave);
    
    let waveScale = 1;
    const expandWave = () => {
      waveScale += 0.3;
      freezeWave.scale.set(waveScale);
      freezeWave.alpha -= 0.03;
      
      if (freezeWave.alpha <= 0) {
        freezeWave.parent?.removeChild(freezeWave);
        PIXI.Ticker.shared.remove(expandWave);
      }
    };
    
    PIXI.Ticker.shared.add(expandWave);
    
    // Emit freeze event
    this.emit('specialEffect', {
      type: 'freeze',
      position: this.position.clone(),
      radius: 150,
      duration: 2000
    });
  }
  
  private createBombExplosion(): void {
    // Central explosion
    const explosion = new PIXI.Graphics();
    explosion.beginFill(0xff6600, 0.9);
    explosion.drawCircle(0, 0, 80 * this.config.size);
    explosion.endFill();
    explosion.position.copyFrom(this.position);
    explosion.filters = [new PIXI.filters.BlurFilter(10)];
    this.parent.addChild(explosion);
    
    // Shockwave rings
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const ring = new PIXI.Graphics();
        ring.lineStyle(8 - i * 2, 0xffaa00, 0.8 - i * 0.2);
        ring.drawCircle(0, 0, 50);
        ring.position.copyFrom(this.position);
        this.parent.addChild(ring);
        
        let ringScale = 1;
        const expandRing = () => {
          ringScale += 0.5;
          ring.scale.set(ringScale);
          ring.alpha -= 0.04;
          
          if (ring.alpha <= 0) {
            ring.parent?.removeChild(ring);
            PIXI.Ticker.shared.remove(expandRing);
          }
        };
        
        PIXI.Ticker.shared.add(expandRing);
      }, i * 100);
    }
    
    // Debris particles
    const debrisCount = 20;
    for (let i = 0; i < debrisCount; i++) {
      const debris = new PIXI.Graphics();
      debris.beginFill(Math.random() > 0.5 ? 0xff6600 : 0xffcc00);
      debris.drawRect(-5, -5, 10, 10);
      debris.endFill();
      debris.position.copyFrom(this.position);
      this.parent.addChild(debris);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 5;
      const gravity = 0.3;
      let velocityY = vy;
      
      const updateDebris = () => {
        debris.x += vx;
        velocityY += gravity;
        debris.y += velocityY;
        debris.rotation += 0.2;
        debris.alpha -= 0.01;
        
        if (debris.alpha <= 0 || debris.y > 600) {
          debris.parent?.removeChild(debris);
          PIXI.Ticker.shared.remove(updateDebris);
        }
      };
      
      PIXI.Ticker.shared.add(updateDebris);
    }
    
    // Screen shake and damage
    this.emit('specialEffect', {
      type: 'bomb',
      position: this.position.clone(),
      radius: 200,
      damage: 50
    });
  }
  
  private createLightningExplosion(): void {
    // Lightning bolt network
    const boltCount = 8;
    for (let i = 0; i < boltCount; i++) {
      const bolt = new PIXI.Graphics();
      bolt.lineStyle(3, 0xffff00, 1);
      
      const angle = (i / boltCount) * Math.PI * 2;
      const length = 100 + Math.random() * 100;
      
      // Create jagged lightning path
      bolt.moveTo(0, 0);
      let currentX = 0;
      let currentY = 0;
      const segments = 8;
      
      for (let j = 1; j <= segments; j++) {
        const progress = j / segments;
        const targetX = Math.cos(angle) * length * progress;
        const targetY = Math.sin(angle) * length * progress;
        
        // Add random offset for lightning effect
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        bolt.lineTo(targetX + offsetX, targetY + offsetY);
        currentX = targetX;
        currentY = targetY;
      }
      
      bolt.position.copyFrom(this.position);
      bolt.filters = [new PIXI.filters.BlurFilter(2)];
      this.parent.addChild(bolt);
      
      // Animate lightning
      let flashCount = 3;
      const flash = () => {
        bolt.alpha = bolt.alpha > 0 ? 0 : 1;
        flashCount--;
        
        if (flashCount <= 0) {
          bolt.parent?.removeChild(bolt);
          PIXI.Ticker.shared.remove(flash);
        }
      };
      
      PIXI.Ticker.shared.add(flash);
    }
    
    // Electric field effect
    const field = new PIXI.Graphics();
    field.beginFill(0xffff00, 0.2);
    field.drawCircle(0, 0, 150);
    field.endFill();
    field.position.copyFrom(this.position);
    field.filters = [new PIXI.filters.BlurFilter(20)];
    this.parent.addChild(field);
    
    const pulseField = () => {
      field.alpha = 0.2 + Math.sin(Date.now() * 0.01) * 0.1;
    };
    
    PIXI.Ticker.shared.add(pulseField);
    
    setTimeout(() => {
      PIXI.Ticker.shared.remove(pulseField);
      field.parent?.removeChild(field);
    }, 2000);
    
    // Chain lightning event
    this.emit('specialEffect', {
      type: 'lightning',
      position: this.position.clone(),
      chainCount: 3,
      damage: 30
    });
  }
  
  private createBlackholeCollapse(): void {
    // Create distortion effect
    const distortion = new PIXI.Graphics();
    distortion.beginFill(0x000000, 0.8);
    distortion.drawCircle(0, 0, 100);
    distortion.endFill();
    distortion.position.copyFrom(this.position);
    this.parent.addChild(distortion);
    
    // Spiral particles getting sucked in
    const particleCount = 30;
    const particles: any[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(0x9933ff, 0.8);
      particle.drawCircle(0, 0, 4);
      particle.endFill();
      
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 200 + Math.random() * 100;
      
      particle.position.set(
        this.position.x + Math.cos(angle) * radius,
        this.position.y + Math.sin(angle) * radius
      );
      
      particles.push({
        sprite: particle,
        angle: angle,
        radius: radius,
        angularVelocity: 0.05 + Math.random() * 0.05
      });
      
      this.parent.addChild(particle);
    }
    
    // Collapse animation
    let collapseTime = 0;
    const collapse = () => {
      collapseTime += 0.016;
      
      // Update distortion
      const scale = Math.max(0, 1 - collapseTime * 0.5);
      distortion.scale.set(scale);
      distortion.rotation += 0.1;
      
      // Update particles
      particles.forEach(p => {
        p.angle += p.angularVelocity;
        p.radius = Math.max(0, p.radius - 3);
        p.angularVelocity += 0.002;
        
        p.sprite.x = this.position.x + Math.cos(p.angle) * p.radius;
        p.sprite.y = this.position.y + Math.sin(p.angle) * p.radius;
        p.sprite.scale.set(p.radius / 200);
        
        if (p.radius <= 0) {
          p.sprite.parent?.removeChild(p.sprite);
        }
      });
      
      // End animation
      if (collapseTime > 2) {
        distortion.parent?.removeChild(distortion);
        particles.forEach(p => {
          if (p.sprite.parent) {
            p.sprite.parent.removeChild(p.sprite);
          }
        });
        PIXI.Ticker.shared.remove(collapse);
        
        // Create implosion flash
        const flash = new PIXI.Graphics();
        flash.beginFill(0xffffff, 1);
        flash.drawCircle(0, 0, 300);
        flash.endFill();
        flash.position.copyFrom(this.position);
        this.parent.addChild(flash);
        
        const fadeFlash = () => {
          flash.alpha -= 0.05;
          flash.scale.set(flash.scale.x * 0.95);
          
          if (flash.alpha <= 0) {
            flash.parent?.removeChild(flash);
            PIXI.Ticker.shared.remove(fadeFlash);
          }
        };
        
        PIXI.Ticker.shared.add(fadeFlash);
      }
    };
    
    PIXI.Ticker.shared.add(collapse);
    
    // Pull nearby objects event
    this.emit('specialEffect', {
      type: 'blackhole',
      position: this.position.clone(),
      radius: 300,
      duration: 2000,
      pullForce: 5
    });
  }
  
  private createDeathAnimation(): void {
    // Rarity-based death effects
    const deathEffects = {
      common: () => this.createSimpleDeath(),
      rare: () => this.createRareDeath(),
      epic: () => this.createEpicDeath(),
      legendary: () => this.createLegendaryDeath(),
      mythic: () => this.createMythicDeath()
    };
    
    const effect = deathEffects[this.config.rarity] || deathEffects.common;
    effect();
  }
  
  private createSimpleDeath(): void {
    // Basic particle burst
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(0x00d4ff);
      particle.drawCircle(0, 0, 5);
      particle.endFill();
      particle.position.copyFrom(this.position);
      this.parent.addChild(particle);
      
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const update = () => {
        particle.x += vx;
        particle.y += vy;
        particle.alpha -= 0.02;
        
        if (particle.alpha <= 0) {
          particle.parent?.removeChild(particle);
          PIXI.Ticker.shared.remove(update);
        }
      };
      
      PIXI.Ticker.shared.add(update);
    }
  }
  
  private createRareDeath(): void {
    // Ethereum-style dissolution
    const fragments = 15;
    for (let i = 0; i < fragments; i++) {
      const fragment = new PIXI.Graphics();
      fragment.beginFill(0x7b3ff2, 0.8);
      fragment.moveTo(0, -10);
      fragment.lineTo(10, 0);
      fragment.lineTo(0, 10);
      fragment.lineTo(-10, 0);
      fragment.closePath();
      fragment.endFill();
      fragment.position.copyFrom(this.position);
      this.parent.addChild(fragment);
      
      const angle = (i / fragments) * Math.PI * 2;
      const speed = 3 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const rotSpeed = (Math.random() - 0.5) * 0.3;
      
      const update = () => {
        fragment.x += vx;
        fragment.y += vy;
        fragment.rotation += rotSpeed;
        fragment.alpha -= 0.015;
        fragment.scale.set(fragment.scale.x * 0.98);
        
        if (fragment.alpha <= 0) {
          fragment.parent?.removeChild(fragment);
          PIXI.Ticker.shared.remove(update);
        }
      };
      
      PIXI.Ticker.shared.add(update);
    }
  }
  
  private createEpicDeath(): void {
    // NFT fragmentation effect
    const gridSize = 5;
    const cellSize = 20 * this.config.size;
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const fragment = new PIXI.Graphics();
        const color = Math.random() > 0.5 ? 0xff6b6b : 0xc44569;
        fragment.beginFill(color, 0.9);
        fragment.drawRect(0, 0, cellSize, cellSize);
        fragment.endFill();
        
        fragment.position.set(
          this.position.x + (x - gridSize/2) * cellSize,
          this.position.y + (y - gridSize/2) * cellSize
        );
        
        this.parent.addChild(fragment);
        
        // Random explosion direction
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const rotSpeed = (Math.random() - 0.5) * 0.5;
        
        const update = () => {
          fragment.x += vx;
          fragment.y += vy;
          fragment.rotation += rotSpeed;
          fragment.alpha -= 0.01;
          
          if (fragment.alpha <= 0) {
            fragment.parent?.removeChild(fragment);
            PIXI.Ticker.shared.remove(update);
          }
        };
        
        PIXI.Ticker.shared.add(update);
      }
    }
  }
  
  private createLegendaryDeath(): void {
    // Golden explosion with coin shower
    const explosion = new PIXI.Graphics();
    explosion.beginFill(0xffd93d, 0.8);
    explosion.drawCircle(0, 0, 100 * this.config.size);
    explosion.endFill();
    explosion.position.copyFrom(this.position);
    explosion.filters = [new PIXI.filters.BlurFilter(20)];
    this.parent.addChild(explosion);
    
    // Expand and fade
    const expandExplosion = () => {
      explosion.scale.set(explosion.scale.x * 1.1);
      explosion.alpha -= 0.03;
      
      if (explosion.alpha <= 0) {
        explosion.parent?.removeChild(explosion);
        PIXI.Ticker.shared.remove(expandExplosion);
      }
    };
    
    PIXI.Ticker.shared.add(expandExplosion);
    
    // Coin shower
    const coinCount = 20;
    for (let i = 0; i < coinCount; i++) {
      setTimeout(() => {
        const coin = new PIXI.Graphics();
        coin.beginFill(0xffd93d);
        coin.drawCircle(0, 0, 8);
        coin.endFill();
        coin.lineStyle(2, 0xffaa00);
        coin.drawCircle(0, 0, 8);
        
        coin.position.set(
          this.position.x + (Math.random() - 0.5) * 100,
          this.position.y - 50
        );
        
        this.parent.addChild(coin);
        
        const vx = (Math.random() - 0.5) * 4;
        let vy = -5 - Math.random() * 5;
        const gravity = 0.5;
        
        const updateCoin = () => {
          coin.x += vx;
          vy += gravity;
          coin.y += vy;
          coin.rotation += 0.2;
          
          if (coin.y > 600) {
            coin.parent?.removeChild(coin);
            PIXI.Ticker.shared.remove(updateCoin);
          }
        };
        
        PIXI.Ticker.shared.add(updateCoin);
      }, i * 50);
    }
  }
  
  private createMythicDeath(): void {
    // Dimensional collapse effect
    const portalLayers = 5;
    
    for (let i = 0; i < portalLayers; i++) {
      const portal = new PIXI.Graphics();
      const colors = [0xe056fd, 0x8e44ad, 0x3498db];
      const color = colors[i % colors.length];
      
      portal.lineStyle(4, color, 0.8 - i * 0.1);
      portal.drawCircle(0, 0, 50 + i * 30);
      portal.position.copyFrom(this.position);
      portal.filters = [new PIXI.filters.BlurFilter(5)];
      this.parent.addChild(portal);
      
      // Spiral collapse
      let scale = 1;
      let rotation = 0;
      
      const collapse = () => {
        scale *= 0.95;
        rotation += 0.1 + i * 0.02;
        portal.scale.set(scale);
        portal.rotation = rotation;
        portal.alpha -= 0.01;
        
        if (portal.alpha <= 0) {
          portal.parent?.removeChild(portal);
          PIXI.Ticker.shared.remove(collapse);
        }
      };
      
      PIXI.Ticker.shared.add(collapse);
    }
    
    // Reality fragments
    const fragmentCount = 30;
    for (let i = 0; i < fragmentCount; i++) {
      const fragment = new PIXI.Graphics();
      const size = 10 + Math.random() * 20;
      
      // Holographic fragments
      fragment.beginFill(0xe056fd, 0.6);
      fragment.drawPolygon([
        0, -size,
        size * 0.866, size * 0.5,
        -size * 0.866, size * 0.5
      ]);
      fragment.endFill();
      
      fragment.position.copyFrom(this.position);
      this.parent.addChild(fragment);
      
      const angle = (i / fragmentCount) * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const rotSpeed = (Math.random() - 0.5) * 0.2;
      let hue = 0;
      
      const updateFragment = () => {
        fragment.x += vx;
        fragment.y += vy;
        fragment.rotation += rotSpeed;
        fragment.alpha -= 0.005;
        
        // Color shift
        hue += 2;
        const color = this.hslToHex(hue % 360, 70, 50);
        fragment.tint = color;
        
        if (fragment.alpha <= 0) {
          fragment.parent?.removeChild(fragment);
          PIXI.Ticker.shared.remove(updateFragment);
        }
      };
      
      PIXI.Ticker.shared.add(updateFragment);
    }
  }
  
  private showRewards(): void {
    // Create sophisticated reward display
    const rewardContainer = new PIXI.Container();
    rewardContainer.position.copyFrom(this.position);
    this.parent.addChild(rewardContainer);
    
    // Reward background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.8);
    bg.lineStyle(3, this.getRarityColor(), 1);
    bg.drawRoundedRect(-100, -30, 200, 60, 20);
    bg.endFill();
    
    // Add glow effect
    bg.filters = [new PIXI.filters.BlurFilter(5)];
    rewardContainer.addChild(bg);
    
    // Reward text
    const rewardText = new PIXI.Text(`+${this.config.baseReward} FISH`, {
      fontFamily: 'Arial Black',
      fontSize: 28,
      fill: [this.getRarityColor(), 0xffffff],
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowDistance: 2,
    });
    
    rewardText.anchor.set(0.5);
    rewardContainer.addChild(rewardText);
    
    // Bonus indicators for special fish
    if (this.config.rarity !== 'common') {
      const bonusText = new PIXI.Text(`${this.config.rarity.toUpperCase()} CATCH!`, {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: this.getRarityColor(),
        fontWeight: 'bold'
      });
      bonusText.anchor.set(0.5);
      bonusText.position.y = -40;
      rewardContainer.addChild(bonusText);
    }
    
    // Animate reward display
    let lifetime = 0;
    const animateReward = () => {
      lifetime += 0.016;
      
      // Float up
      rewardContainer.y -= 1.5;
      
      // Scale pulse
      const scale = 1 + Math.sin(lifetime * 10) * 0.05;
      rewardContainer.scale.set(scale);
      
      // Fade out after delay
      if (lifetime > 1) {
        rewardContainer.alpha -= 0.02;
      }
      
      if (rewardContainer.alpha <= 0) {
        rewardContainer.parent?.removeChild(rewardContainer);
        PIXI.Ticker.shared.remove(animateReward);
      }
    };
    
    PIXI.Ticker.shared.add(animateReward);
    
    // Emit score event
    this.emit('scored', {
      amount: this.config.baseReward,
      fishType: this.config.id,
      rarity: this.config.rarity,
      position: this.position.clone()
    });
  }
  
  private getRarityColor(): number {
    const colors = {
      common: 0x00d4ff,
      rare: 0x7b3ff2,
      epic: 0xff6b6b,
      legendary: 0xffd93d,
      mythic: 0xe056fd
    };
    return colors[this.config.rarity] || 0xffffff;
  }
  
  private hslToHex(h: number, s: number, l: number): number {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
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
    
    return (Math.round(r * 255) << 16) + (Math.round(g * 255) << 8) + Math.round(b * 255);
  }
}
