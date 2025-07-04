import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';

export interface FishConfig {
  type: string;
  size: number;
  speed: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export class PixelFishSprite extends PIXI.Container {
  private config: FishConfig;
  private bodyContainer: PIXI.Container;
  private finContainer: PIXI.Container;
  private eyeSprite: PIXI.Graphics;
  private scaleShineContainer: PIXI.Container;
  
  // 动画参数
  private time: number = 0;
  private swimPhase: number = Math.random() * Math.PI * 2;
  private velocity: { x: number; y: number };
  
  // 视觉效果
  private glowFilter: GlowFilter;
  private shadowSprite: PIXI.Graphics;
  
  constructor(config: FishConfig) {
    super();
    this.config = config;
    this.velocity = { 
      x: (Math.random() - 0.5) * config.speed, 
      y: (Math.random() - 0.5) * config.speed * 0.3 
    };
    
    this.createFishStructure();
    this.applyVisualEffects();
    this.startAnimation();
  }
  
  private createFishStructure() {
    const pixelSize = 4;
    
    // 阴影
    this.shadowSprite = new PIXI.Graphics();
    this.shadowSprite.beginFill(0x000000, 0.3);
    this.shadowSprite.drawEllipse(0, 20, 30, 10);
    this.shadowSprite.endFill();
    this.shadowSprite.filters = [new PIXI.filters.BlurFilter(4)];
    this.addChild(this.shadowSprite);
    
    // 容器层级
    this.bodyContainer = new PIXI.Container();
    this.finContainer = new PIXI.Container();
    this.scaleShineContainer = new PIXI.Container();
    
    this.addChild(this.bodyContainer);
    this.addChild(this.finContainer);
    this.addChild(this.scaleShineContainer);
    
    // 构建鱼体
    this.buildFishBody();
    this.buildFins();
    this.buildEye();
    this.addScaleShine();
  }
  
  private buildFishBody() {
    const design = this.getFishDesign();
    const colors = this.getColorPalette();
    const pixelSize = 4;
    
    design.body.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel > 0) {
          const block = new PIXI.Graphics();
          const color = colors[pixel - 1] || 0xffffff;
          
          // 主色块
          block.beginFill(color);
          block.drawRect(0, 0, pixelSize, pixelSize);
          block.endFill();
          
          // 添加像素内渐变效果
          if (pixel === 2) { // 高光区域
            block.beginFill(0xffffff, 0.3);
            block.drawRect(0, 0, pixelSize/2, pixelSize/2);
            block.endFill();
          }
          
          block.position.set(x * pixelSize - 32, y * pixelSize - 24);
          this.bodyContainer.addChild(block);
        }
      });
    });
  }
  
  private buildFins() {
    const pixelSize = 4;
    const finColor = this.getFinColor();
    
    // 背鳍
    const dorsalFin = new PIXI.Graphics();
    dorsalFin.beginFill(finColor, 0.8);
    for (let i = 0; i < 3; i++) {
      dorsalFin.drawRect(
        -8 + i * pixelSize, 
        -28 - i * pixelSize, 
        pixelSize, 
        pixelSize * (3 - i)
      );
    }
    dorsalFin.endFill();
    this.finContainer.addChild(dorsalFin);
    
    // 胸鳍
    const pectoralFin = new PIXI.Graphics();
    pectoralFin.beginFill(finColor, 0.7);
    pectoralFin.drawPolygon([
      0, 0,
      -12, 8,
      -8, 16,
      4, 8
    ]);
    pectoralFin.endFill();
    this.finContainer.addChild(pectoralFin);
    
    // 尾鳍
    const tailFin = new PIXI.Graphics();
    tailFin.beginFill(finColor, 0.9);
    tailFin.moveTo(-28, 0);
    tailFin.lineTo(-40, -12);
    tailFin.lineTo(-36, 0);
    tailFin.lineTo(-40, 12);
    tailFin.closePath();
    tailFin.endFill();
    this.finContainer.addChild(tailFin);
  }
  
  private buildEye() {
    this.eyeSprite = new PIXI.Graphics();
    
    // 眼白
    this.eyeSprite.beginFill(0xffffff);
    this.eyeSprite.drawCircle(0, 0, 4);
    this.eyeSprite.endFill();
    
    // 瞳孔
    this.eyeSprite.beginFill(0x000000);
    this.eyeSprite.drawCircle(1, 0, 2);
    this.eyeSprite.endFill();
    
    // 高光
    this.eyeSprite.beginFill(0xffffff);
    this.eyeSprite.drawCircle(2, -1, 1);
    this.eyeSprite.endFill();
    
    this.eyeSprite.position.set(12, -4);
    this.addChild(this.eyeSprite);
  }
  
  private addScaleShine() {
    // 动态鳞片反光
    const shineCount = this.config.rarity === 'legendary' ? 10 : 5;
    
    for (let i = 0; i < shineCount; i++) {
      const shine = new PIXI.Graphics();
      shine.beginFill(0xffffff);
      shine.drawRect(0, 0, 2, 2);
      shine.endFill();
      
      shine.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
      );
      shine.alpha = 0;
      
      // 存储初始位置用于动画
      (shine as any).baseAlpha = Math.random() * 0.5 + 0.3;
      (shine as any).phaseOffset = Math.random() * Math.PI * 2;
      
      this.scaleShineContainer.addChild(shine);
    }
  }
  
  private applyVisualEffects() {
    // 根据稀有度设置发光效果
    const glowColors = {
      common: 0x88aaff,
      rare: 0x00ff88,
      epic: 0xff00ff,
      legendary: 0xffaa00
    };
    
    this.glowFilter = new GlowFilter({
      distance: this.config.rarity === 'legendary' ? 20 : 10,
      outerStrength: this.config.rarity === 'legendary' ? 3 : 1,
      innerStrength: 0.5,
      color: glowColors[this.config.rarity],
      quality: 0.5,
    });
    
    this.filters = [this.glowFilter];
    
    // 稀有鱼添加额外粒子效果
    if (this.config.rarity === 'epic' || this.config.rarity === 'legendary') {
      this.addMagicalParticles();
    }
  }
  
  private addMagicalParticles() {
    const particleContainer = new PIXI.Container();
    this.addChild(particleContainer);
    
    const createParticle = () => {
      const particle = new PIXI.Graphics();
      particle.beginFill(0xffffff, 0.8);
      particle.drawCircle(0, 0, 1);
      particle.endFill();
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 10;
      particle.position.set(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance
      );
      
      particleContainer.addChild(particle);
      
      // 粒子轨道动画
      let t = 0;
      const animateParticle = () => {
        t += 0.02;
        particle.position.x = Math.cos(angle + t) * distance;
        particle.position.y = Math.sin(angle + t) * distance * 0.5;
        particle.alpha = 0.5 + Math.sin(t * 2) * 0.3;
        
        if (t < Math.PI * 2) {
          requestAnimationFrame(animateParticle);
        } else {
          particleContainer.removeChild(particle);
        }
      };
      
      animateParticle();
    };
    
    // 定期生成新粒子
    setInterval(() => createParticle(), 500);
  }
  
  private startAnimation() {
    PIXI.Ticker.shared.add(this.animate, this);
  }
  
  private animate(delta: number) {
    this.time += delta * 0.05;
    
    // 游泳动画
    const swimOffset = Math.sin(this.time + this.swimPhase) * 5;
    this.bodyContainer.rotation = swimOffset * 0.01;
    this.finContainer.rotation = swimOffset * 0.02;
    
    // 尾巴摆动
    const tailSwing = Math.sin(this.time * 2 + this.swimPhase) * 0.3;
    if (this.finContainer.children[2]) {
      this.finContainer.children[2].rotation = tailSwing;
    }
    
    // 胸鳍扇动
    if (this.finContainer.children[1]) {
      this.finContainer.children[1].rotation = Math.sin(this.time * 1.5) * 0.2;
    }
    
    // 鳞片闪光动画
    this.scaleShineContainer.children.forEach((shine: any, i) => {
      shine.alpha = Math.max(0, Math.sin(this.time + shine.phaseOffset) * shine.baseAlpha);
    });
    
    // 眼睛跟随移动方向
    if (this.velocity.x < 0) {
      this.scale.x = -1;
    } else {
      this.scale.x = 1;
    }
    
    // 更新位置
    this.x += this.velocity.x;
    this.y += this.velocity.y + swimOffset * 0.1;
    
    // 发光脉冲效果
    if (this.config.rarity === 'legendary') {
      this.glowFilter.outerStrength = 2 + Math.sin(this.time * 0.5) * 1;
    }
    
    // 阴影跟随
    this.shadowSprite.scale.x = 1 + Math.sin(this.time) * 0.1;
  }
  
  private getFishDesign() {
    // 16x12 像素设计
    const designs: Record<string, { body: number[][] }> = {
      goldfish: {
        body: [
          [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
          [0,0,0,1,2,2,2,2,1,0,0,0,0,0,0,0],
          [0,0,1,2,2,3,3,2,2,1,0,0,0,0,0,0],
          [0,1,2,2,3,3,3,3,2,2,1,1,0,0,0,0],
          [1,2,2,3,3,3,3,3,3,2,2,2,1,0,0,0],
          [1,2,3,3,3,3,3,3,3,3,2,2,2,1,1,0],
          [1,2,3,3,3,3,3,3,3,3,2,2,2,1,1,0],
          [1,2,2,3,3,3,3,3,3,2,2,2,1,0,0,0],
          [0,1,2,2,3,3,3,3,2,2,1,1,0,0,0,0],
          [0,0,1,2,2,3,3,2,2,1,0,0,0,0,0,0],
          [0,0,0,1,2,2,2,2,1,0,0,0,0,0,0,0],
          [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
        ]
      }
    };
    
    return designs[this.config.type] || designs.goldfish;
  }
  
  private getColorPalette(): number[] {
    const palettes: Record<string, number[]> = {
      goldfish: [0x996600, 0xffaa00, 0xffdd00], // 深金 -> 金 -> 亮金
      shark: [0x333333, 0x666666, 0x999999],
      angelfish: [0x6600cc, 0x9933ff, 0xcc66ff],
      electric: [0x0066cc, 0x0099ff, 0x66ccff],
    };
    
    return palettes[this.config.type] || palettes.goldfish;
  }
  
  private getFinColor(): number {
    const finColors: Record<string, number> = {
      goldfish: 0xff8800,
      shark: 0x445566,
      angelfish: 0xffccff,
      electric: 0x00ffff,
    };
    
    return finColors[this.config.type] || 0xff8800;
  }
  
  // 公共方法
  public setVelocity(x: number, y: number) {
    this.velocity.x = x;
    this.velocity.y = y;
  }
  
  public flash(color: number = 0xffffff) {
    const flashFilter = new PIXI.filters.ColorMatrixFilter();
    flashFilter.brightness(2, false);
    
    const currentFilters = this.filters || [];
    this.filters = [...currentFilters, flashFilter];
    
    setTimeout(() => {
      this.filters = currentFilters;
    }, 100);
  }
  
  public destroy() {
    PIXI.Ticker.shared.remove(this.animate, this);
    super.destroy();
  }
}
