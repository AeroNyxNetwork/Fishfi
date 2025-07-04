import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';

export class FishRenderer {
  public app: PIXI.Application;  // 改为 public
  private lightingContainer!: PIXI.Container;
  private fishContainer!: PIXI.Container;
  private particleContainer!: PIXI.ParticleContainer;
  private waterOverlay!: PIXI.Graphics;
  
  // 光照系统
  private sunlight!: PIXI.Graphics;
  private causticTexture!: PIXI.Texture;
  private causticSprite!: PIXI.TilingSprite;
  
  constructor(canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x001a33,
      antialias: false, // 保持像素风格
      resolution: window.devicePixelRatio || 1,
    });
    
    this.setupContainers();
    this.setupLighting();
    this.setupWaterEffects();
    this.startAnimation();
  }
  
  private setupContainers() {
    // 层级管理
    this.lightingContainer = new PIXI.Container();
    this.fishContainer = new PIXI.Container();
    this.particleContainer = new PIXI.ParticleContainer(10000, {
      scale: true,
      position: true,
      rotation: true,
      alpha: true,
      tint: true,
    });
    
    this.app.stage.addChild(this.lightingContainer);
    this.app.stage.addChild(this.fishContainer);
    this.app.stage.addChild(this.particleContainer);
  }
  
  private setupLighting() {
    // 创建顶部阳光效果
    this.sunlight = new PIXI.Graphics();
    this.updateSunlight();
    this.lightingContainer.addChild(this.sunlight);
    
    // 创建焦散纹理（水底光斑）
    this.causticTexture = this.createCausticTexture();
    this.causticSprite = new PIXI.TilingSprite(
      this.causticTexture,
      this.app.screen.width,
      this.app.screen.height
    );
    this.causticSprite.alpha = 0.3;
    this.causticSprite.blendMode = PIXI.BLEND_MODES.ADD;
    this.lightingContainer.addChild(this.causticSprite);
    
    // 添加整体光照滤镜
    const bloomFilter = new AdvancedBloomFilter({
      threshold: 0.5,
      bloomScale: 1.5,
      brightness: 1.2,
      blur: 2,
      quality: 3,
    });
    this.app.stage.filters = [bloomFilter];
  }
  
  private createCausticTexture(): PIXI.Texture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // 生成焦散图案
    const gradient = ctx.createRadialGradient(
      size/2, size/2, 0,
      size/2, size/2, size/2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 100, 200, 0)');
    
    // 绘制多个光斑
    for (let i = 0; i < 20; i++) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.translate(Math.random() * size, Math.random() * size);
      ctx.scale(0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5);
      ctx.fillRect(-size/2, -size/2, size, size);
      ctx.restore();
    }
    
    return PIXI.Texture.from(canvas);
  }
  
  private updateSunlight() {
    this.sunlight.clear();
    
    // 创建光线束
    const rayCount = 5;
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    
    for (let i = 0; i < rayCount; i++) {
      const x = (i / rayCount) * screenWidth + screenWidth / (rayCount * 2);
      const width = 100 + Math.random() * 50;
      
      // 渐变光束
      const gradient = new PIXI.Graphics();
      gradient.beginFill(0xffffcc, 0.1);
      gradient.drawPolygon([
        x - width/2, 0,
        x + width/2, 0,
        x + width/4 + Math.random() * 20, screenHeight,
        x - width/4 + Math.random() * 20, screenHeight
      ]);
      gradient.endFill();
      
      this.sunlight.addChild(gradient);
    }
  }
  
  private setupWaterEffects() {
    // 水面叠加层
    this.waterOverlay = new PIXI.Graphics();
    this.waterOverlay.beginFill(0x0066cc, 0.1);
    this.waterOverlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    this.waterOverlay.endFill();
    this.waterOverlay.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    this.app.stage.addChild(this.waterOverlay);
  }
  
  private startAnimation() {
    let time = 0;
    
    this.app.ticker.add(() => {
      time += 0.01;
      
      // 动画焦散效果
      this.causticSprite.tilePosition.x += 0.5;
      this.causticSprite.tilePosition.y -= 0.3;
      this.causticSprite.alpha = 0.2 + Math.sin(time) * 0.1;
      
      // 动态更新阳光（模拟波动）
      if (Math.random() < 0.05) {
        this.updateSunlight();
      }
    });
  }
  
  // 创建像素鱼精灵
  public createPixelFish(type: string, x: number, y: number): PIXI.Container {
    const fish = new PIXI.Container();
    
    // 鱼身主体
    const body = this.createFishBody(type);
    fish.addChild(body);
    
    // 添加发光效果
    const glowFilter = new GlowFilter({
      distance: 15,
      outerStrength: 2,
      innerStrength: 1,
      color: this.getFishGlowColor(type),
      quality: 0.5,
    });
    fish.filters = [glowFilter];
    
    // 添加鱼鳞反光
    const scales = this.createScaleShine();
    fish.addChild(scales);
    
    fish.position.set(x, y);
    this.fishContainer.addChild(fish);
    
    return fish;
  }
  
  private createFishBody(type: string): PIXI.Graphics {
    const body = new PIXI.Graphics();
    const pixelSize = 4;
    
    // 根据类型绘制不同形状的鱼
    const fishData = this.getFishPixelData(type);
    
    fishData.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel > 0) {
          const color = this.getFishColor(type, pixel);
          body.beginFill(color);
          body.drawRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
          body.endFill();
        }
      });
    });
    
    return body;
  }
  
  private createScaleShine(): PIXI.Graphics {
    const shine = new PIXI.Graphics();
    shine.beginFill(0xffffff, 0.6);
    
    // 随机添加几个高光点
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 40 - 20;
      const y = Math.random() * 20 - 10;
      shine.drawRect(x, y, 2, 2);
    }
    
    shine.endFill();
    shine.blendMode = PIXI.BLEND_MODES.ADD;
    
    return shine;
  }
  
  private getFishPixelData(type: string): number[][] {
    // 简化的像素数据，实际使用时可以更复杂
    const goldfish = [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [1,2,2,3,3,2,2,1],
      [1,2,2,2,2,2,2,1],
      [0,1,2,2,2,2,1,0],
      [0,0,1,1,1,1,0,0],
    ];
    
    return goldfish;
  }
  
  private getFishColor(type: string, pixel: number): number {
    const colors: Record<string, number[]> = {
      goldfish: [0x000000, 0xffaa00, 0xffdd00, 0xffffff],
      shark: [0x000000, 0x666666, 0x999999, 0xcccccc],
    };
    
    return colors[type]?.[pixel] || 0xffffff;
  }
  
  private getFishGlowColor(type: string): number {
    const glowColors: Record<string, number> = {
      goldfish: 0xffaa00,
      shark: 0x0099ff,
      angelfish: 0xff00ff,
    };
    
    return glowColors[type] || 0xffffff;
  }
  
  // 创建气泡粒子
  public createBubble(x: number, y: number) {
    const bubble = new PIXI.Sprite(PIXI.Texture.WHITE);
    bubble.width = bubble.height = 4 + Math.random() * 8;
    bubble.position.set(x, y);
    bubble.tint = 0xccddff;
    bubble.alpha = 0.6;
    
    this.particleContainer.addChild(bubble);
    
    // 气泡上升动画
    const speed = 1 + Math.random() * 2;
    const wobble = Math.random() * Math.PI * 2;
    
    const animate = () => {
      bubble.y -= speed;
      bubble.x += Math.sin(bubble.y * 0.02 + wobble) * 0.5;
      bubble.alpha -= 0.005;
      
      if (bubble.y < -20 || bubble.alpha <= 0) {
        this.particleContainer.removeChild(bubble);
      } else {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  // 创建浮游生物
  public createPlankton() {
    const count = 50;
    for (let i = 0; i < count; i++) {
      // 创建一个小的白色纹理作为浮游生物
      const plankton = new PIXI.Sprite(PIXI.Texture.WHITE);
      plankton.width = plankton.height = 2;
      plankton.tint = 0xaaccff;
      plankton.alpha = 0.3;
      
      plankton.x = Math.random() * this.app.screen.width;
      plankton.y = Math.random() * this.app.screen.height;
      
      this.particleContainer.addChild(plankton);
      
      // 漂浮动画
      const drift = () => {
        plankton.x += (Math.random() - 0.5) * 0.5;
        plankton.y += (Math.random() - 0.5) * 0.5;
        plankton.alpha = 0.2 + Math.random() * 0.2;
        
        requestAnimationFrame(drift);
      };
      
      drift();
    }
  }
  
  public destroy() {
    this.app.destroy(true);
  }
}
