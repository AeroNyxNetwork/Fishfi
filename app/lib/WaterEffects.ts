import * as PIXI from 'pixi.js';
import { ShockwaveFilter } from '@pixi/filter-shockwave';

export class WaterEffects {
  private app: PIXI.Application;
  private waterContainer: PIXI.Container;
  private displacementSprite: PIXI.Sprite;
  private refractionSprite: PIXI.Sprite;
  private ripples: ShockwaveFilter[] = [];
  
  // 深度雾效
  private depthGradient: PIXI.Graphics;
  
  // 水面效果
  private surfaceReflection: PIXI.Graphics;
  private foamParticles: PIXI.Container;
  
  constructor(app: PIXI.Application) {
    this.app = app;
    this.waterContainer = new PIXI.Container();
    this.setupWaterLayers();
    this.createDisplacementMap();
    this.setupDepthEffects();
    this.setupSurfaceEffects();
  }
  
  private setupWaterLayers() {
    // 创建水体容器层级
    this.app.stage.addChildAt(this.waterContainer, 0);
  }
  
  private createDisplacementMap() {
    // 创建水波纹理
    const displacementTexture = this.generateWaterTexture();
    this.displacementSprite = new PIXI.Sprite(displacementTexture);
    this.displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    this.waterContainer.addChild(this.displacementSprite);
    
    // 折射效果
    const displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
    displacementFilter.scale.x = 15;
    displacementFilter.scale.y = 15;
    
    // 应用到整个场景
    this.app.stage.filters = [...(this.app.stage.filters || []), displacementFilter];
    
    // 动画水波
    this.app.ticker.add(() => {
      this.displacementSprite.x += 0.5;
      this.displacementSprite.y -= 0.3;
    });
  }
  
  private generateWaterTexture(): PIXI.Texture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // 创建Perlin噪声风格的水波纹理
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    
    // 简化的噪声生成
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const i = (x + y * size) * 4;
        
        // 多层正弦波叠加创建水波效果
        const wave1 = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 127;
        const wave2 = Math.sin(x * 0.02 + 1) * Math.cos(y * 0.02 + 1) * 63;
        const wave3 = Math.sin(x * 0.04 + 2) * Math.cos(y * 0.04 + 2) * 31;
        
        const value = 128 + wave1 + wave2 + wave3;
        
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 255;   // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 添加模糊使其更平滑
    ctx.filter = 'blur(2px)';
    ctx.drawImage(canvas, 0, 0);
    
    return PIXI.Texture.from(canvas);
  }
  
  private setupDepthEffects() {
    // 深度渐变
    this.depthGradient = new PIXI.Graphics();
    this.updateDepthGradient();
    this.waterContainer.addChild(this.depthGradient);
    
    // 深度雾化滤镜
    const fogFilter = new PIXI.filters.ColorMatrixFilter();
    fogFilter.desaturate();
    fogFilter.brightness(0.8, false);
    
    // 根据深度应用不同强度的雾化
    this.createDepthLayers();
  }
  
  private updateDepthGradient() {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    this.depthGradient.clear();
    
    // 创建垂直渐变
    const gradientSteps = 10;
    for (let i = 0; i < gradientSteps; i++) {
      const y = (i / gradientSteps) * height;
      const nextY = ((i + 1) / gradientSteps) * height;
      const alpha = i / gradientSteps * 0.6;
      
      // 从浅蓝到深蓝
      const color = this.interpolateColor(0x66ccff, 0x001144, i / gradientSteps);
      
      this.depthGradient.beginFill(color, alpha);
      this.depthGradient.drawRect(0, y, width, nextY - y);
      this.depthGradient.endFill();
    }
    
    this.depthGradient.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  }
  
  private createDepthLayers() {
    // 创建多层深度效果
    const layers = 5;
    
    for (let i = 0; i < layers; i++) {
      const layer = new PIXI.Graphics();
      const depth = i / layers;
      
      // 漂浮的杂质
      for (let j = 0; j < 20; j++) {
        layer.beginFill(0x88aacc, 0.1 + depth * 0.1);
        layer.drawCircle(
          Math.random() * this.app.screen.width,
          Math.random() * this.app.screen.height,
          1 + Math.random() * 2
        );
        layer.endFill();
      }
      
      // 应用模糊
      const blurFilter = new PIXI.filters.BlurFilter();
      blurFilter.blur = depth * 5;
      layer.filters = [blurFilter];
      
      this.waterContainer.addChild(layer);
      
      // 缓慢移动
      this.app.ticker.add(() => {
        layer.x += (0.1 + depth * 0.2) * 0.5;
        layer.y -= (0.05 + depth * 0.1) * 0.5;
        
        // 循环
        if (layer.x > 50) layer.x -= 50;
        if (layer.y < -50) layer.y += 50;
      });
    }
  }
  
  private setupSurfaceEffects() {
    // 水面反射高光
    this.surfaceReflection = new PIXI.Graphics();
    this.createSurfaceHighlights();
    this.waterContainer.addChild(this.surfaceReflection);
    
    // 泡沫粒子容器
    this.foamParticles = new PIXI.Container();
    this.waterContainer.addChild(this.foamParticles);
    
    // 定期生成泡沫
    setInterval(() => this.createFoam(), 500);
  }
  
  private createSurfaceHighlights() {
    const width = this.app.screen.width;
    
    this.surfaceReflection.clear();
    
    // 创建波光粼粼的效果
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * 100;
      const w = 20 + Math.random() * 40;
      const h = 2 + Math.random() * 4;
      
      this.surfaceReflection.beginFill(0xffffff, 0.3);
      this.surfaceReflection.drawEllipse(x, y, w, h);
      this.surfaceReflection.endFill();
    }
    
    this.surfaceReflection.blendMode = PIXI.BLEND_MODES.ADD;
    
    // 动画闪烁
    let time = 0;
    this.app.ticker.add(() => {
      time += 0.05;
      this.surfaceReflection.alpha = 0.3 + Math.sin(time) * 0.2;
    });
  }
  
  private createFoam() {
    const foam = new PIXI.Graphics();
    foam.beginFill(0xffffff, 0.6);
    
    // 创建泡沫簇
    const clusterSize = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < clusterSize; i++) {
      const offsetX = (Math.random() - 0.5) * 10;
      const offsetY = (Math.random() - 0.5) * 10;
      const size = 2 + Math.random() * 3;
      
      foam.drawCircle(offsetX, offsetY, size);
    }
    
    foam.endFill();
    foam.position.set(
      Math.random() * this.app.screen.width,
      Math.random() * 100
    );
    
    this.foamParticles.addChild(foam);
    
    // 泡沫生命周期
    let life = 1;
    const fadeOut = () => {
      life -= 0.01;
      foam.alpha = life;
      foam.scale.set(1 + (1 - life) * 0.5);
      
      if (life <= 0) {
        this.foamParticles.removeChild(foam);
      } else {
        requestAnimationFrame(fadeOut);
      }
    };
    
    fadeOut();
  }
  
  // 创建涟漪效果
  public createRipple(x: number, y: number, strength: number = 1) {
    const rippleFilter = new ShockwaveFilter([x, y], {
      amplitude: 30 * strength,
      wavelength: 100,
      brightness: 1.2,
      speed: 300,
      radius: 50
    });
    
    this.ripples.push(rippleFilter);
    
    // 添加到滤镜
    const currentFilters = this.app.stage.filters || [];
    this.app.stage.filters = [...currentFilters, rippleFilter];
    
    // 动画涟漪扩散
    const animateRipple = () => {
      rippleFilter.time += 0.02;
      
      if (rippleFilter.time > 2) {
        // 移除完成的涟漪
        const index = this.ripples.indexOf(rippleFilter);
        if (index > -1) {
          this.ripples.splice(index, 1);
          this.app.stage.filters = this.app.stage.filters?.filter(f => f !== rippleFilter);
        }
      } else {
        requestAnimationFrame(animateRipple);
      }
    };
    
    animateRipple();
  }
  
  // 创建水花飞溅
  public createSplash(x: number, y: number, intensity: number = 1) {
    const particleCount = Math.floor(10 * intensity);
    
    for (let i = 0; i < particleCount; i++) {
      const droplet = new PIXI.Graphics();
      droplet.beginFill(0xaaccff, 0.8);
      droplet.drawCircle(0, 0, 2 + Math.random() * 2);
      droplet.endFill();
      
      droplet.position.set(x, y);
      this.waterContainer.addChild(droplet);
      
      // 水滴物理动画
      const vx = (Math.random() - 0.5) * 10 * intensity;
      let vy = -Math.random() * 15 * intensity - 5;
      const gravity = 0.5;
      
      const animateDroplet = () => {
        droplet.x += vx;
        droplet.y += vy;
        vy += gravity;
        droplet.alpha -= 0.02;
        
        // 水滴变形
        droplet.scale.y = 1 + Math.abs(vy) * 0.05;
        
        if (droplet.y > y + 50 || droplet.alpha <= 0) {
          this.waterContainer.removeChild(droplet);
          
          // 落回水面时创建小涟漪
          if (droplet.y > y) {
            this.createRipple(droplet.x, droplet.y, 0.3);
          }
        } else {
          requestAnimationFrame(animateDroplet);
        }
      };
      
      animateDroplet();
    }
  }
  
  // 工具函数：颜色插值
  private interpolateColor(color1: number, color2: number, factor: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
    
    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return (r << 16) | (g << 8) | b;
  }
  
  // 创建水下气泡流
  public createBubbleStream(x: number, y: number, duration: number = 5000) {
    const startTime = Date.now();
    
    const createBubble = () => {
      if (Date.now() - startTime > duration) return;
      
      const bubble = new PIXI.Graphics();
      const size = 2 + Math.random() * 6;
      
      // 绘制有光泽的气泡
      bubble.beginFill(0xffffff, 0.3);
      bubble.drawCircle(0, 0, size);
      bubble.endFill();
      
      bubble.beginFill(0xffffff, 0.6);
      bubble.drawCircle(-size * 0.3, -size * 0.3, size * 0.3);
      bubble.endFill();
      
      bubble.position.set(x + (Math.random() - 0.5) * 20, y);
      this.waterContainer.addChild(bubble);
      
      // 气泡上升动画
      const speed = 1 + Math.random() * 2;
      const wobble = Math.random() * Math.PI * 2;
      
      const animateBubble = () => {
        bubble.y -= speed;
        bubble.x += Math.sin(bubble.y * 0.01 + wobble) * 1;
        bubble.alpha -= 0.003;
        
        // 气泡变大
        bubble.scale.set(bubble.scale.x * 1.002);
        
        if (bubble.y < -50 || bubble.alpha <= 0) {
          this.waterContainer.removeChild(bubble);
        } else {
          requestAnimationFrame(animateBubble);
        }
      };
      
      animateBubble();
      
      // 继续生成
      setTimeout(() => createBubble(), 50 + Math.random() * 150);
    };
    
    createBubble();
  }
}
