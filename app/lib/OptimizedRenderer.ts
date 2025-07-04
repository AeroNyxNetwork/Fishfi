import * as PIXI from 'pixi.js';
import { ProceduralPixelFish, FishGenome } from './ProceduralPixelFish';

export class OptimizedRenderer {
  public app: PIXI.Application;
  private mainContainer!: PIXI.Container;
  private fishContainer!: PIXI.Container;
  private effectsContainer!: PIXI.Container;
  
  // 性能优化
  private renderTexture!: PIXI.RenderTexture;
  private renderSprite!: PIXI.Sprite;
  
  // 简化的背景
  private gradientBg!: PIXI.Graphics;
  private lightRays!: PIXI.Graphics;
  
  // 鱼群管理
  private fishes: ProceduralPixelFish[] = [];
  private fishPool: ProceduralPixelFish[] = [];
  
  constructor(canvas: HTMLCanvasElement) {
    // 创建应用，关闭抗锯齿保持像素风格
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x001a33,
      antialias: false,
      resolution: 1, // 固定分辨率，避免高DPI导致的性能问题
      autoDensity: false,
      powerPreference: 'high-performance',
    });
    
    // 设置像素完美缩放
    this.app.stage.scale.set(1);
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    
    this.setupContainers();
    this.createOptimizedBackground();
    this.startRenderLoop();
  }
  
  private setupContainers() {
    this.mainContainer = new PIXI.Container();
    this.fishContainer = new PIXI.Container();
    this.effectsContainer = new PIXI.Container();
    
    // 使用渲染纹理优化性能
    this.renderTexture = PIXI.RenderTexture.create({
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    this.renderSprite = new PIXI.Sprite(this.renderTexture);
    
    this.app.stage.addChild(this.mainContainer);
    this.mainContainer.addChild(this.fishContainer);
    this.mainContainer.addChild(this.effectsContainer);
  }
  
  private createOptimizedBackground() {
    // 简单的渐变背景（不使用复杂的滤镜）
    this.gradientBg = new PIXI.Graphics();
    const height = this.app.screen.height;
    const width = this.app.screen.width;
    
    // 绘制渐变
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      const y = (i / steps) * height;
      const nextY = ((i + 1) / steps) * height;
      const color = this.interpolateColor(0x001a33, 0x003366, i / steps);
      
      this.gradientBg.beginFill(color);
      this.gradientBg.drawRect(0, y, width, nextY - y);
      this.gradientBg.endFill();
    }
    
    this.mainContainer.addChildAt(this.gradientBg, 0);
    
    // 简单的光线效果（静态）
    this.lightRays = new PIXI.Graphics();
    this.lightRays.alpha = 0.1;
    
    for (let i = 0; i < 3; i++) {
      const x = width * (0.2 + i * 0.3);
      this.lightRays.beginFill(0xffffaa, 0.3);
      this.lightRays.moveTo(x, 0);
      this.lightRays.lineTo(x - 50, height);
      this.lightRays.lineTo(x + 50, height);
      this.lightRays.closePath();
      this.lightRays.endFill();
    }
    
    this.mainContainer.addChildAt(this.lightRays, 1);
  }
  
  private startRenderLoop() {
    let time = 0;
    
    this.app.ticker.add((delta) => {
      time += delta;
      
      // 轻微的光线动画
      this.lightRays.alpha = 0.05 + Math.sin(time * 0.01) * 0.05;
      
      // 更新鱼的行为
      this.updateFishBehavior();
    });
  }
  
  private updateFishBehavior() {
    // 简单的群体行为
    this.fishes.forEach((fish, index) => {
      // 基础游动
      let vx = fish['targetVelocity'].x;
      let vy = fish['targetVelocity'].y;
      
      // 边界回避
      const margin = 100;
      if (fish.x < margin) vx += 0.5;
      if (fish.x > this.app.screen.width - margin) vx -= 0.5;
      if (fish.y < margin) vy += 0.5;
      if (fish.y > this.app.screen.height - margin) vy -= 0.5;
      
      // 简单的分离行为（避免重叠）
      this.fishes.forEach((other, otherIndex) => {
        if (index === otherIndex) return;
        
        const dx = fish.x - other.x;
        const dy = fish.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100 && dist > 0) {
          vx += (dx / dist) * 0.5;
          vy += (dy / dist) * 0.5;
        }
      });
      
      // 限制速度
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > 3) {
        vx = (vx / speed) * 3;
        vy = (vy / speed) * 3;
      }
      
      fish.setTargetVelocity(vx, vy);
    });
  }
  
  // 创建各种特征的鱼
  public createSpecialFish(type: string): ProceduralPixelFish {
    let genome: Partial<FishGenome> = {};
    
    switch (type) {
      case 'goldfish':
        genome = {
          bodyLength: 20,
          bodyHeight: 12,
          bodyRatio: 0.7,
          primaryHue: 45,
          secondaryHue: 30,
          patternType: 'gradient',
          swimStyle: 'sine',
          flexibility: 0.6,
          sparkleIntensity: 0.3
        };
        break;
        
      case 'shark':
        genome = {
          bodyLength: 32,
          bodyHeight: 10,
          bodyRatio: 0.4,
          primaryHue: 200,
          secondaryHue: 180,
          patternType: 'solid',
          swimStyle: 'glide',
          flexibility: 0.3,
          tailSize: 0.4
        };
        break;
        
      case 'pufferfish':
        genome = {
          bodyLength: 16,
          bodyHeight: 16,
          bodyRatio: 0.8,
          primaryHue: 60,
          secondaryHue: 40,
          patternType: 'spots',
          swimStyle: 'burst',
          flexibility: 0.2
        };
        break;
        
      case 'angelfish':
        genome = {
          bodyLength: 18,
          bodyHeight: 20,
          bodyRatio: 0.6,
          primaryHue: 300,
          secondaryHue: 270,
          patternType: 'stripes',
          swimStyle: 'zigzag',
          flexibility: 0.8,
          finCount: 6
        };
        break;
        
      case 'neon':
        genome = {
          bodyLength: 14,
          bodyHeight: 6,
          bodyRatio: 0.5,
          primaryHue: 180,
          secondaryHue: 120,
          patternType: 'gradient',
          swimStyle: 'burst',
          hasGlow: true,
          sparkleIntensity: 0.8
        };
        break;
        
      default:
        // 随机鱼
        genome = {};
    }
    
    const fish = new ProceduralPixelFish(genome);
    fish.position.set(
      Math.random() * this.app.screen.width,
      Math.random() * this.app.screen.height
    );
    
    // 设置初始速度
    fish.setTargetVelocity(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 1
    );
    
    this.fishContainer.addChild(fish);
    this.fishes.push(fish);
    
    return fish;
  }
  
  // 创建气泡效果（优化版）
  public createBubble(x: number, y: number) {
    const bubble = new PIXI.Graphics();
    bubble.beginFill(0xffffff, 0.3);
    bubble.drawCircle(0, 0, 3 + Math.random() * 3);
    bubble.endFill();
    bubble.position.set(x, y);
    
    this.effectsContainer.addChild(bubble);
    
    // 简单的上升动画
    const speed = 1 + Math.random();
    const wobble = Math.random() * 0.02;
    
    const animate = () => {
      bubble.y -= speed;
      bubble.x += Math.sin(bubble.y * wobble) * 0.5;
      bubble.alpha -= 0.01;
      
      if (bubble.y < -20 || bubble.alpha <= 0) {
        this.effectsContainer.removeChild(bubble);
        bubble.destroy();
      } else {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  // 创建涟漪效果（简化版）
  public createRipple(x: number, y: number) {
    const ripple = new PIXI.Graphics();
    ripple.position.set(x, y);
    this.effectsContainer.addChild(ripple);
    
    let radius = 0;
    let alpha = 0.5;
    
    const animate = () => {
      radius += 2;
      alpha -= 0.02;
      
      ripple.clear();
      ripple.lineStyle(2, 0xffffff, alpha);
      ripple.drawCircle(0, 0, radius);
      
      if (alpha <= 0) {
        this.effectsContainer.removeChild(ripple);
        ripple.destroy();
      } else {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  // 工具函数
  private interpolateColor(color1: number, color2: number, t: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
    
    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;
    
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    
    return (r << 16) | (g << 8) | b;
  }
  
  public removeFish(fish: ProceduralPixelFish) {
    const index = this.fishes.indexOf(fish);
    if (index > -1) {
      this.fishes.splice(index, 1);
      this.fishContainer.removeChild(fish);
      fish.destroy();
    }
  }
  
  public getFishCount(): number {
    return this.fishes.length;
  }
  
  public destroy() {
    this.fishes.forEach(fish => fish.destroy());
    this.app.destroy(true);
  }
}
