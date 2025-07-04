import * as PIXI from 'pixi.js';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';

export class EnvironmentEffects {
  private app: PIXI.Application;
  private weatherContainer: PIXI.Container;
  private lightingContainer: PIXI.Container;
  
  // 日夜循环
  private timeOfDay: number = 0.5; // 0 = 夜晚, 0.5 = 白天, 1 = 夜晚
  private sunMoonSprite: PIXI.Graphics;
  
  // 天气系统
  private currentWeather: 'clear' | 'rain' | 'storm' = 'clear';
  private rainParticles: PIXI.ParticleContainer;
  
  // 动态背景
  private backgroundLayers: PIXI.Container[] = [];
  
  constructor(app: PIXI.Application) {
    this.app = app;
    this.setupContainers();
    this.createDynamicBackground();
    this.setupDayNightCycle();
    this.setupWeatherSystem();
  }
  
  private setupContainers() {
    this.weatherContainer = new PIXI.Container();
    this.lightingContainer = new PIXI.Container();
    
    this.app.stage.addChildAt(this.lightingContainer, 0);
    this.app.stage.addChild(this.weatherContainer);
  }
  
  private createDynamicBackground() {
    // 创建多层视差背景
    const layers = [
      { depth: 0.1, count: 3, size: 150, color: 0x001122, alpha: 0.3 },  // 远景礁石
      { depth: 0.3, count: 5, size: 100, color: 0x002244, alpha: 0.4 },  // 中景海草
      { depth: 0.5, count: 8, size: 80, color: 0x003366, alpha: 0.5 },   // 近景植物
    ];
    
    layers.forEach((layerConfig, index) => {
      const layer = new PIXI.Container();
      
      // 创建背景元素
      for (let i = 0; i < layerConfig.count; i++) {
        const element = this.createBackgroundElement(layerConfig);
        element.x = Math.random() * this.app.screen.width;
        element.y = this.app.screen.height - layerConfig.size - Math.random() * 100;
        layer.addChild(element);
      }
      
      // 视差滚动
      this.app.ticker.add(() => {
        layer.x -= layerConfig.depth * 0.5;
        if (layer.x < -200) layer.x += 200;
      });
      
      this.backgroundLayers.push(layer);
      this.app.stage.addChildAt(layer, index);
    });
  }
  
  private createBackgroundElement(config: any): PIXI.Container {
    const element = new PIXI.Container();
    
    if (config.depth < 0.3) {
      // 远景礁石
      const rock = new PIXI.Graphics();
      rock.beginFill(config.color, config.alpha);
      rock.moveTo(0, 0);
      rock.lineTo(config.size * 0.7, -config.size);
      rock.lineTo(config.size * 1.2, -config.size * 0.8);
      rock.lineTo(config.size, 0);
      rock.closePath();
      rock.endFill();
      element.addChild(rock);
    } else {
      // 海草/珊瑚
      const plant = new PIXI.Graphics();
      
      for (let i = 0; i < 5; i++) {
        plant.beginFill(config.color, config.alpha);
        const height = config.size * (0.5 + Math.random() * 0.5);
        const width = 10 + Math.random() * 10;
        const x = i * 15 + Math.random() * 10;
        
        // 绘制摇曳的海草
        plant.moveTo(x, 0);
        plant.bezierCurveTo(
          x + width/2, -height/3,
          x - width/2, -height*2/3,
          x + Math.random() * 10 - 5, -height
        );
        plant.lineTo(x + 3, -height);
        plant.bezierCurveTo(
          x - width/2 + 3, -height*2/3,
          x + width/2 + 3, -height/3,
          x + 3, 0
        );
        plant.closePath();
        plant.endFill();
      }
      
      element.addChild(plant);
      
      // 海草摇摆动画
      let time = Math.random() * Math.PI * 2;
      this.app.ticker.add(() => {
        time += 0.02;
        plant.skew.x = Math.sin(time) * 0.1;
      });
    }
    
    return element;
  }
  
  private setupDayNightCycle() {
    // 创建太阳/月亮
    this.sunMoonSprite = new PIXI.Graphics();
    this.updateSunMoon();
    this.lightingContainer.addChild(this.sunMoonSprite);
    
    // 创建环境光遮罩
    const ambientOverlay = new PIXI.Graphics();
    this.lightingContainer.addChild(ambientOverlay);
    
    // 日夜循环动画
    this.app.ticker.add(() => {
      // 缓慢推进时间
      this.timeOfDay += 0.0001;
      if (this.timeOfDay > 1) this.timeOfDay = 0;
      
      // 更新光照
      this.updateLighting(ambientOverlay);
      
      // 每隔一段时间更新太阳/月亮
      if (Math.random() < 0.01) {
        this.updateSunMoon();
      }
    });
  }
  
  private updateSunMoon() {
    this.sunMoonSprite.clear();
    
    const centerX = this.app.screen.width / 2;
    const radius = Math.min(this.app.screen.width, this.app.screen.height) * 0.4;
    
    // 计算太阳/月亮位置
    const angle = this.timeOfDay * Math.PI;
    const x = centerX + Math.cos(angle + Math.PI) * radius;
    const y = this.app.screen.height * 0.8 - Math.sin(angle) * radius;
    
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.75) {
      // 白天 - 太阳
      const sunSize = 60;
      
      // 太阳光晕
      for (let i = 3; i > 0; i--) {
        this.sunMoonSprite.beginFill(0xffff88, 0.1 * i);
        this.sunMoonSprite.drawCircle(x, y, sunSize * (1 + i * 0.5));
        this.sunMoonSprite.endFill();
      }
      
      // 太阳主体
      this.sunMoonSprite.beginFill(0xffdd00);
      this.sunMoonSprite.drawCircle(x, y, sunSize);
      this.sunMoonSprite.endFill();
      
      // 创建光线
      this.createSunRays(x, y);
    } else {
      // 夜晚 - 月亮
      const moonSize = 50;
      
      // 月光晕
      this.sunMoonSprite.beginFill(0xaaccff, 0.2);
      this.sunMoonSprite.drawCircle(x, y, moonSize * 2);
      this.sunMoonSprite.endFill();
      
      // 月亮主体
      this.sunMoonSprite.beginFill(0xccddff);
      this.sunMoonSprite.drawCircle(x, y, moonSize);
      this.sunMoonSprite.endFill();
      
      // 月亮纹理
      this.sunMoonSprite.beginFill(0xaabbdd, 0.5);
      this.sunMoonSprite.drawCircle(x - 10, y - 5, 15);
      this.sunMoonSprite.drawCircle(x + 15, y + 10, 10);
      this.sunMoonSprite.endFill();
    }
  }
  
  private createSunRays(x: number, y: number) {
    const rayCount = 12;
    const rayLength = 100;
    
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const innerRadius = 70;
      const outerRadius = innerRadius + rayLength;
      
      this.sunMoonSprite.beginFill(0xffff88, 0.3);
      this.sunMoonSprite.moveTo(
        x + Math.cos(angle - 0.1) * innerRadius,
        y + Math.sin(angle - 0.1) * innerRadius
      );
      this.sunMoonSprite.lineTo(
        x + Math.cos(angle) * outerRadius,
        y + Math.sin(angle) * outerRadius
      );
      this.sunMoonSprite.lineTo(
        x + Math.cos(angle + 0.1) * innerRadius,
        y + Math.sin(angle + 0.1) * innerRadius
      );
      this.sunMoonSprite.closePath();
      this.sunMoonSprite.endFill();
    }
  }
  
  private updateLighting(overlay: PIXI.Graphics) {
    overlay.clear();
    
    // 计算环境光颜色和强度
    let overlayColor: number;
    let overlayAlpha: number;
    
    if (this.timeOfDay < 0.25 || this.timeOfDay > 0.75) {
      // 夜晚
      overlayColor = 0x000033;
      overlayAlpha = 0.6;
    } else if (this.timeOfDay < 0.3 || this.timeOfDay > 0.7) {
      // 黄昏/黎明
      overlayColor = 0xff6600;
      overlayAlpha = 0.3;
    } else {
      // 白天
      overlayColor = 0x0066ff;
      overlayAlpha = 0.1;
    }
    
    overlay.beginFill(overlayColor, overlayAlpha);
    overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.endFill();
    overlay.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  }
  
  private setupWeatherSystem() {
    this.rainParticles = new PIXI.ParticleContainer(1000, {
      position: true,
      rotation: true,
      alpha: true,
      scale: true
    });
    this.weatherContainer.addChild(this.rainParticles);
    
    // 随机改变天气
    setInterval(() => {
      const rand = Math.random();
      if (rand < 0.6) {
        this.setWeather('clear');
      } else if (rand < 0.9) {
        this.setWeather('rain');
      } else {
        this.setWeather('storm');
      }
    }, 30000);
  }
  
  public setWeather(weather: 'clear' | 'rain' | 'storm') {
    this.currentWeather = weather;
    
    // 清除现有天气效果
    this.rainParticles.removeChildren();
    
    switch (weather) {
      case 'rain':
        this.startRain(100);
        break;
      case 'storm':
        this.startRain(300);
        this.startLightning();
        break;
    }
  }
  
  private startRain(intensity: number) {
    for (let i = 0; i < intensity; i++) {
      const raindrop = new PIXI.Sprite(PIXI.Texture.WHITE);
      raindrop.width = 2;
      raindrop.height = 10 + Math.random() * 20;
      raindrop.alpha = 0.3 + Math.random() * 0.3;
      raindrop.x = Math.random() * this.app.screen.width;
      raindrop.y = -50 - Math.random() * 100;
      raindrop.rotation = 0.1;
      
      this.rainParticles.addChild(raindrop);
      
      // 雨滴下落动画
      const speed = 5 + Math.random() * 10;
      const animateRain = () => {
        raindrop.y += speed;
        raindrop.x += speed * 0.1; // 风效果
        
        if (raindrop.y > this.app.screen.height) {
          raindrop.y = -50;
          raindrop.x = Math.random() * this.app.screen.width;
        }
        
        if (this.currentWeather === 'rain' || this.currentWeather === 'storm') {
          requestAnimationFrame(animateRain);
        }
      };
      
      animateRain();
    }
  }
  
  private startLightning() {
    const lightning = () => {
      if (this.currentWeather !== 'storm') return;
      
      // 闪电效果
      const flash = new PIXI.Graphics();
      flash.beginFill(0xffffff, 0.8);
      flash.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
      flash.endFill();
      
      this.weatherContainer.addChild(flash);
      
      // 闪电分支
      const branches = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < branches; i++) {
        const bolt = new PIXI.Graphics();
        bolt.lineStyle(2 + Math.random() * 3, 0xffffff, 1);
        
        let x = Math.random() * this.app.screen.width;
        let y = 0;
        
        bolt.moveTo(x, y);
        
        // 绘制锯齿状闪电
        for (let j = 0; j < 10; j++) {
          x += (Math.random() - 0.5) * 50;
          y += this.app.screen.height / 10;
          bolt.lineTo(x, y);
        }
        
        this.weatherContainer.addChild(bolt);
        
        setTimeout(() => {
          this.weatherContainer.removeChild(bolt);
        }, 100);
      }
      
      // 闪光渐隐
      let alpha = 0.8;
      const fade = () => {
        alpha -= 0.1;
        flash.alpha = alpha;
        
        if (alpha <= 0) {
          this.weatherContainer.removeChild(flash);
        } else {
          requestAnimationFrame(fade);
        }
      };
      
      fade();
      
      // 随机下一次闪电
      setTimeout(() => lightning(), 5000 + Math.random() * 10000);
    };
    
    lightning();
  }
  
  // 创建水草动画
  public createSeaweed(x: number, y: number) {
    const seaweed = new PIXI.Graphics();
    const segments = 8;
    const segmentHeight = 15;
    const width = 10;
    
    // 绘制分段海草
    const points: PIXI.Point[] = [];
    for (let i = 0; i <= segments; i++) {
      points.push(new PIXI.Point(0, -i * segmentHeight));
    }
    
    const drawSeaweed = (offset: number) => {
      seaweed.clear();
      seaweed.beginFill(0x228844, 0.8);
      
      // 使用贝塞尔曲线绘制弯曲的海草
      seaweed.moveTo(0, 0);
      
      for (let i = 1; i < points.length; i++) {
        const wave = Math.sin(offset + i * 0.5) * (i * 2);
        seaweed.lineTo(points[i].x + wave, points[i].y);
      }
      
      // 另一边
      for (let i = points.length - 1; i >= 0; i--) {
        const wave = Math.sin(offset + i * 0.5) * (i * 2);
        seaweed.lineTo(points[i].x + wave + width, points[i].y);
      }
      
      seaweed.closePath();
      seaweed.endFill();
    };
    
    seaweed.position.set(x, y);
    this.backgroundLayers[2].addChild(seaweed);
    
    // 摇摆动画
    let time = 0;
    this.app.ticker.add(() => {
      time += 0.02;
      drawSeaweed(time);
    });
    
    return seaweed;
  }
}
