import * as PIXI from 'pixi.js';
import { ArcadePixelFish, FISH_TYPES, ArcadeFishConfig } from './ArcadeFishSystem';

export class ArcadeRenderer {
  public app: PIXI.Application;
  private mainContainer: PIXI.Container;
  private backgroundContainer: PIXI.Container;
  private fishContainer: PIXI.Container;
  private uiContainer: PIXI.Container;
  
  // 鱼群管理
  private activeFishes: ArcadePixelFish[] = [];
  private fishWaves: any[] = [];
  
  // 游戏状态
  private waveNumber: number = 1;
  private score: number = 0;
  
  constructor(canvas: HTMLCanvasElement) {
    // 创建应用 - 街机风格设置
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000814, // 深海蓝黑
      antialias: false,
      resolution: 1,
      powerPreference: 'high-performance',
    });
    
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    
    this.setupContainers();
    this.createArcadeBackground();
    this.startWaveSystem();
  }
  
  private setupContainers() {
    this.backgroundContainer = new PIXI.Container();
    this.mainContainer = new PIXI.Container();
    this.fishContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();
    
    this.app.stage.addChild(this.backgroundContainer);
    this.app.stage.addChild(this.mainContainer);
    this.mainContainer.addChild(this.fishContainer);
    this.app.stage.addChild(this.uiContainer);
  }
  
  private createArcadeBackground() {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // 深海渐变背景
    const gradient = new PIXI.Graphics();
    const colors = [
      { pos: 0, color: 0x000814 },      // 深蓝黑
      { pos: 0.3, color: 0x001428 },    // 深海蓝
      { pos: 0.6, color: 0x002855 },    // 中海蓝
      { pos: 1, color: 0x003d82 }       // 浅海蓝
    ];
    
    // 绘制渐变
    for (let i = 0; i < colors.length - 1; i++) {
      const startY = height * colors[i].pos;
      const endY = height * colors[i + 1].pos;
      const steps = 20;
      
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const y = startY + (endY - startY) * t;
        const color = this.interpolateColor(colors[i].color, colors[i + 1].color, t);
        
        gradient.beginFill(color);
        gradient.drawRect(0, y, width, (endY - startY) / steps);
        gradient.endFill();
      }
    }
    
    this.backgroundContainer.addChild(gradient);
    
    // 添加海底装饰
    this.addSeabedDecorations();
    
    // 添加动态光效
    this.addDynamicLighting();
  }
  
  private addSeabedDecorations() {
    // 海底礁石
    const rocks = new PIXI.Graphics();
    rocks.beginFill(0x001122, 0.5);
    
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * this.app.screen.width;
      const size = 50 + Math.random() * 100;
      
      rocks.moveTo(x, this.app.screen.height);
      rocks.lineTo(x - size/2, this.app.screen.height - size);
      rocks.lineTo(x + size/2, this.app.screen.height - size * 0.8);
      rocks.closePath();
    }
    
    rocks.endFill();
    this.backgroundContainer.addChild(rocks);
    
    // 海草
    for (let i = 0; i < 10; i++) {
      const seaweed = new PIXI.Graphics();
      const x = Math.random() * this.app.screen.width;
      const height = 50 + Math.random() * 100;
      
      seaweed.lineStyle(3, 0x00ff88, 0.3);
      seaweed.moveTo(x, this.app.screen.height);
      
      // 贝塞尔曲线海草
      const cp1x = x + Math.random() * 20 - 10;
      const cp1y = this.app.screen.height - height * 0.3;
      const cp2x = x + Math.random() * 20 - 10;
      const cp2y = this.app.screen.height - height * 0.6;
      const endX = x + Math.random() * 30 - 15;
      const endY = this.app.screen.height - height;
      
      seaweed.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
      
      this.backgroundContainer.addChild(seaweed);
      
      // 海草动画
      PIXI.Ticker.shared.add(() => {
        seaweed.rotation = Math.sin(Date.now() * 0.001 + i) * 0.05;
      });
    }
  }
  
  private addDynamicLighting() {
    // 动态光束效果
    const lightContainer = new PIXI.Container();
    lightContainer.alpha = 0.3;
    
    for (let i = 0; i < 3; i++) {
      const light = new PIXI.Graphics();
      const x = this.app.screen.width * (0.2 + i * 0.3);
      
      // 使用渐变透明度创建光束
      for (let j = 0; j < 20; j++) {
        const alpha = (1 - j / 20) * 0.3;
        const width = 100 - j * 3;
        
        light.beginFill(0x00ffff, alpha);
        light.moveTo(x - width/2, j * 20);
        light.lineTo(x - width/4, this.app.screen.height);
        light.lineTo(x + width/4, this.app.screen.height);
        light.lineTo(x + width/2, j * 20);
        light.closePath();
        light.endFill();
      }
      
      lightContainer.addChild(light);
      
      // 光束动画
      let offset = i * 2;
      PIXI.Ticker.shared.add(() => {
        light.alpha = 0.2 + Math.sin(Date.now() * 0.001 + offset) * 0.1;
      });
    }
    
    this.backgroundContainer.addChild(lightContainer);
  }
  
  // 波次系统
  private startWaveSystem() {
    // 定义波次
    this.fishWaves = [
      // 第一波 - 小鱼群
      {
        delay: 0,
        fishes: [
          { type: 'neon', count: 8, formation: 'line', y: 0.3 },
          { type: 'goldfish', count: 5, formation: 'v', y: 0.5 }
        ]
      },
      // 第二波 - 中型鱼
      {
        delay: 5000,
        fishes: [
          { type: 'clownfish', count: 4, formation: 'diamond', y: 0.4 },
          { type: 'angelfish', count: 3, formation: 'line', y: 0.6 }
        ]
      },
      // 第三波 - 混合
      {
        delay: 10000,
        fishes: [
          { type: 'neon', count: 10, formation: 'wave', y: 0.3 },
          { type: 'shark', count: 1, formation: 'solo', y: 0.5 }
        ]
      },
      // BOSS波
      {
        delay: 15000,
        fishes: [
          { type: 'whale', count: 1, formation: 'solo', y: 0.5 },
          { type: 'goldfish', count: 6, formation: 'circle', y: 0.5 }
        ]
      }
    ];
    
    // 开始第一波
    this.spawnWave(0);
  }
  
  private spawnWave(waveIndex: number) {
    if (waveIndex >= this.fishWaves.length) {
      // 循环波次
      waveIndex = 0;
      this.waveNumber++;
    }
    
    const wave = this.fishWaves[waveIndex];
    
    // 生成该波次的所有鱼
    wave.fishes.forEach((group: any) => {
      this.spawnFormation(
        group.type,
        group.count,
        group.formation,
        group.y * this.app.screen.height
      );
    });
    
    // 设置下一波
    setTimeout(() => {
      this.spawnWave(waveIndex + 1);
    }, wave.delay + 5000);
  }
  
  private spawnFormation(fishType: string, count: number, formation: string, centerY: number) {
    const config = FISH_TYPES[fishType];
    if (!config) return;
    
    const startX = -100; // 从屏幕外开始
    const spacing = 60;
    
    switch (formation) {
      case 'line':
        // 直线队形
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            this.spawnFish(config, startX - i * spacing, centerY, 'right');
          }, i * 200);
        }
        break;
        
      case 'v':
        // V字队形
        const half = Math.floor(count / 2);
        for (let i = 0; i < count; i++) {
          const offset = Math.abs(i - half) * 30;
          setTimeout(() => {
            this.spawnFish(config, startX - i * spacing, centerY + offset, 'right');
          }, i * 200);
        }
        break;
        
      case 'diamond':
        // 钻石队形
        const positions = [
          { x: 0, y: 0 },
          { x: -spacing, y: -spacing/2 },
          { x: -spacing, y: spacing/2 },
          { x: -spacing*2, y: 0 }
        ];
        positions.slice(0, count).forEach((pos, i) => {
          setTimeout(() => {
            this.spawnFish(config, startX + pos.x, centerY + pos.y, 'right');
          }, i * 200);
        });
        break;
        
      case 'circle':
        // 环绕BOSS的小鱼
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const radius = 100;
          const x = this.app.screen.width / 2 + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          this.spawnFish(config, x, y, 'circle');
        }
        break;
        
      case 'wave':
        // 波浪队形
        for (let i = 0; i < count; i++) {
          const waveY = centerY + Math.sin(i * 0.5) * 50;
          setTimeout(() => {
            this.spawnFish(config, startX - i * spacing/2, waveY, 'right');
          }, i * 100);
        }
        break;
        
      case 'solo':
        // 单独出现（BOSS）
        this.spawnFish(config, startX, centerY, 'right');
        break;
    }
  }
  
  private spawnFish(config: ArcadeFishConfig, x: number, y: number, direction: string) {
    const fish = new ArcadePixelFish(config, direction as 'left' | 'right');
    fish.position.set(x, y);
    fish.setBaseY(y);
    
    this.fishContainer.addChild(fish);
    this.activeFishes.push(fish);
    
    // 创建入场特效
    this.createSpawnEffect(x, y, config.rarity);
    
    // 检查鱼是否离开屏幕
    const checkBounds = () => {
      if (fish.x > this.app.screen.width + 200 || fish.x < -200) {
        this.removeFish(fish);
      } else {
        requestAnimationFrame(checkBounds);
      }
    };
    checkBounds();
  }
  
  private createSpawnEffect(x: number, y: number, rarity: string) {
    const effectContainer = new PIXI.Container();
    effectContainer.position.set(x, y);
    this.mainContainer.addChild(effectContainer);
    
    // 根据稀有度创建不同特效
    const colors = {
      common: 0x00ffff,
      uncommon: 0x00ff00,
      rare: 0x0099ff,
      epic: 0xff00ff,
      legendary: 0xffaa00,
      mythic: 0xff0000
    };
    
    const color = colors[rarity as keyof typeof colors] || 0xffffff;
    
    // 扩散环
    const ring = new PIXI.Graphics();
    ring.lineStyle(3, color, 0.8);
    ring.drawCircle(0, 0, 10);
    effectContainer.addChild(ring);
    
    // 动画
    let scale = 1;
    let alpha = 1;
    
    const animate = () => {
      scale += 0.1;
      alpha -= 0.02;
      
      ring.scale.set(scale);
      ring.alpha = alpha;
      
      if (alpha <= 0) {
        this.mainContainer.removeChild(effectContainer);
      } else {
        requestAnimationFrame(animate);
      }
    };
    animate();
    
    // 稀有鱼的额外特效
    if (rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic') {
      // 闪光粒子
      for (let i = 0; i < 10; i++) {
        const particle = new PIXI.Graphics();
        particle.beginFill(color);
        particle.drawCircle(0, 0, 2);
        particle.endFill();
        
        const angle = (i / 10) * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        
        effectContainer.addChild(particle);
        
        const moveParticle = () => {
          particle.x += Math.cos(angle) * speed;
          particle.y += Math.sin(angle) * speed;
          particle.alpha -= 0.02;
          
          if (particle.alpha > 0) {
            requestAnimationFrame(moveParticle);
          }
        };
        moveParticle();
      }
    }
  }
  
  private removeFish(fish: ArcadePixelFish) {
    const index = this.activeFishes.indexOf(fish);
    if (index > -1) {
      this.activeFishes.splice(index, 1);
      this.fishContainer.removeChild(fish);
      fish.destroy();
    }
  }
  
  // 创建UI显示
  public createUI() {
    // 波次显示
    const waveText = new PIXI.Text(`Wave ${this.waveNumber}`, {
      fontFamily: 'Arial Black',
      fontSize: 36,
      fill: ['#ffffff', '#00ffff'],
      stroke: '#000033',
      strokeThickness: 6,
      dropShadow: true,
      dropShadowColor: '#000033',
      dropShadowBlur: 4,
      dropShadowDistance: 4,
    });
    waveText.anchor.set(0.5);
    waveText.position.set(this.app.screen.width / 2, 50);
    this.uiContainer.addChild(waveText);
    
    // 分数显示
    const scoreText = new PIXI.Text(`Score: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4,
    });
    scoreText.position.set(20, 20);
    this.uiContainer.addChild(scoreText);
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
  
  // 获取当前游戏状态
  public getGameStats() {
    return {
      wave: this.waveNumber,
      score: this.score,
      fishCount: this.activeFishes.length
    };
  }
  
  // 更新分数
  public updateScore(points: number) {
    this.score += points;
  }
  
  public destroy() {
    this.activeFishes.forEach(fish => fish.destroy());
    this.app.destroy(true);
  }
}
