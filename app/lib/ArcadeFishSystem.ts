import * as PIXI from 'pixi.js';

// 鱼的配置 - 对标捕鱼达人
export interface ArcadeFishConfig {
  id: string;
  name: string;
  multiplier: number;      // 倍率 2x-1000x
  size: 'tiny' | 'small' | 'medium' | 'large' | 'boss' | 'legendary';
  speed: number;           // 1-10
  health: number;          // 1-100
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  pattern: 'straight' | 'wave' | 'circle' | 'zigzag' | 'boss_pattern';
  color: {
    primary: number;
    secondary: number;
    glow: number;
  };
}

// 预定义的鱼类型
export const FISH_TYPES: Record<string, ArcadeFishConfig> = {
  // 小鱼群 (2-5倍)
  'neon': {
    id: 'neon',
    name: 'Neon Tetra',
    multiplier: 2,
    size: 'tiny',
    speed: 8,
    health: 1,
    rarity: 'common',
    pattern: 'straight',
    color: { primary: 0x00ffff, secondary: 0x0099ff, glow: 0x00ffff }
  },
  
  'goldfish': {
    id: 'goldfish',
    name: 'Golden Koi',
    multiplier: 5,
    size: 'small',
    speed: 6,
    health: 2,
    rarity: 'common',
    pattern: 'wave',
    color: { primary: 0xffaa00, secondary: 0xff6600, glow: 0xffcc00 }
  },
  
  // 中型鱼 (10-20倍)
  'clownfish': {
    id: 'clownfish',
    name: 'Clown Fish',
    multiplier: 10,
    size: 'small',
    speed: 5,
    health: 3,
    rarity: 'uncommon',
    pattern: 'zigzag',
    color: { primary: 0xff6600, secondary: 0xffffff, glow: 0xff9900 }
  },
  
  'angelfish': {
    id: 'angelfish',
    name: 'Royal Angel',
    multiplier: 15,
    size: 'medium',
    speed: 4,
    health: 5,
    rarity: 'uncommon',
    pattern: 'wave',
    color: { primary: 0xff00ff, secondary: 0xffccff, glow: 0xff66ff }
  },
  
  // 大型鱼 (30-50倍)
  'shark': {
    id: 'shark',
    name: 'Great White',
    multiplier: 30,
    size: 'large',
    speed: 3,
    health: 10,
    rarity: 'rare',
    pattern: 'straight',
    color: { primary: 0x4488cc, secondary: 0x2266aa, glow: 0x6699ff }
  },
  
  'swordfish': {
    id: 'swordfish',
    name: 'Lightning Sword',
    multiplier: 40,
    size: 'large',
    speed: 7,
    health: 8,
    rarity: 'rare',
    pattern: 'straight',
    color: { primary: 0x6666ff, secondary: 0x4444cc, glow: 0x8888ff }
  },
  
  // BOSS鱼 (100-200倍)
  'whale': {
    id: 'whale',
    name: 'Cyber Whale',
    multiplier: 100,
    size: 'boss',
    speed: 2,
    health: 50,
    rarity: 'epic',
    pattern: 'boss_pattern',
    color: { primary: 0x0066cc, secondary: 0x003399, glow: 0x0099ff }
  },
  
  'kraken': {
    id: 'kraken',
    name: 'Neon Kraken',
    multiplier: 150,
    size: 'boss',
    speed: 2.5,
    health: 40,
    rarity: 'epic',
    pattern: 'circle',
    color: { primary: 0xff0066, secondary: 0xcc0033, glow: 0xff3399 }
  },
  
  // 传说鱼 (500-1000倍)
  'dragon': {
    id: 'dragon',
    name: 'Golden Dragon',
    multiplier: 500,
    size: 'legendary',
    speed: 4,
    health: 100,
    rarity: 'legendary',
    pattern: 'boss_pattern',
    color: { primary: 0xffcc00, secondary: 0xff9900, glow: 0xffff00 }
  },
  
  'phoenix': {
    id: 'phoenix',
    name: 'Phoenix Fish',
    multiplier: 1000,
    size: 'legendary',
    speed: 5,
    health: 80,
    rarity: 'mythic',
    pattern: 'circle',
    color: { primary: 0xff3300, secondary: 0xffcc00, glow: 0xff6600 }
  }
};

// 街机风格的像素鱼
export class ArcadePixelFish extends PIXI.Container {
  public config: ArcadeFishConfig;
  private pixelSize: number;
  private bodySprite: PIXI.Graphics;
  private glowSprite: PIXI.Graphics;
  private multiplierText: PIXI.Text;
  
  // 动画参数
  private time: number = 0;
  private direction: 1 | -1 = 1;
  public velocity: { x: number; y: number };
  private baseY: number;
  
  // 特效
  private particleContainer: PIXI.Container;
  private isGlowing: boolean = false;
  
  constructor(config: ArcadeFishConfig, direction: 'left' | 'right' = 'right') {
    super();
    this.config = config;
    this.direction = direction === 'right' ? 1 : -1;
    this.velocity = { x: config.speed * this.direction, y: 0 };
    this.baseY = 0;
    
    // 根据鱼的大小设置像素大小
    this.pixelSize = this.getPixelSize();
    
    // 创建鱼体
    this.createFishBody();
    
    // 创建倍率显示
    this.createMultiplierDisplay();
    
    // 添加特效
    this.addSpecialEffects();
    
    // 开始动画
    this.startAnimation();
  }
  
  private getPixelSize(): number {
    const sizes = {
      'tiny': 2,
      'small': 3,
      'medium': 4,
      'large': 5,
      'boss': 6,
      'legendary': 8
    };
    return sizes[this.config.size];
  }
  
  private createFishBody() {
    // 发光层
    this.glowSprite = new PIXI.Graphics();
    this.addChild(this.glowSprite);
    
    // 主体
    this.bodySprite = new PIXI.Graphics();
    this.addChild(this.bodySprite);
    
    // 粒子容器
    this.particleContainer = new PIXI.Container();
    this.addChild(this.particleContainer);
    
    // 绘制鱼形
    this.drawFish();
  }
  
  private drawFish() {
    const shape = this.getFishShape();
    const colors = this.config.color;
    
    // 清空画布
    this.bodySprite.clear();
    this.glowSprite.clear();
    
    // 绘制发光效果
    if (this.config.rarity !== 'common') {
      this.glowSprite.beginFill(colors.glow, 0.3);
      const glowSize = this.pixelSize * 1.5;
      shape.forEach((row, y) => {
        row.forEach((pixel, x) => {
          if (pixel) {
            this.glowSprite.drawRect(
              (x - shape[0].length/2) * glowSize - glowSize/4,
              (y - shape.length/2) * glowSize - glowSize/4,
              glowSize * 1.5,
              glowSize * 1.5
            );
          }
        });
      });
      this.glowSprite.endFill();
      this.glowSprite.filters = [new PIXI.filters.BlurFilter(4)];
    }
    
    // 绘制主体
    shape.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel > 0) {
          const color = pixel === 1 ? colors.primary : colors.secondary;
          this.bodySprite.beginFill(color);
          this.bodySprite.drawRect(
            (x - shape[0].length/2) * this.pixelSize,
            (y - shape.length/2) * this.pixelSize,
            this.pixelSize,
            this.pixelSize
          );
          this.bodySprite.endFill();
          
          // 添加高光
          if (Math.random() < 0.1) {
            this.bodySprite.beginFill(0xffffff, 0.5);
            this.bodySprite.drawRect(
              (x - shape[0].length/2) * this.pixelSize,
              (y - shape.length/2) * this.pixelSize,
              this.pixelSize * 0.5,
              this.pixelSize * 0.5
            );
            this.bodySprite.endFill();
          }
        }
      });
    });
    
    // 添加眼睛
    this.addEyes(shape);
  }
  
  private getFishShape(): number[][] {
    // 根据鱼的类型返回不同的形状
    const shapes: Record<string, number[][]> = {
      // 小鱼 - 简单形状
      'neon': [
        [0,1,1,0],
        [1,2,2,1],
        [1,2,2,1],
        [0,1,1,0]
      ],
      
      // 金鱼 - 圆润
      'goldfish': [
        [0,0,1,1,1,0,0],
        [0,1,2,2,2,1,0],
        [1,2,2,2,2,2,1],
        [1,2,2,2,2,2,1],
        [0,1,2,2,2,1,0],
        [0,0,1,1,1,0,0]
      ],
      
      // 小丑鱼 - 条纹
      'clownfish': [
        [0,0,1,1,1,0,0],
        [0,1,2,1,2,1,0],
        [1,2,1,2,1,2,1],
        [1,2,1,2,1,2,1],
        [0,1,2,1,2,1,0],
        [0,0,1,1,1,0,0]
      ],
      
      // 神仙鱼 - 三角形
      'angelfish': [
        [0,0,0,1,0,0,0],
        [0,0,1,2,1,0,0],
        [0,1,2,2,2,1,0],
        [1,2,2,2,2,2,1],
        [1,2,2,2,2,2,1],
        [0,1,2,2,2,1,0],
        [0,0,1,2,1,0,0],
        [0,0,0,1,0,0,0]
      ],
      
      // 鲨鱼 - 流线型
      'shark': [
        [0,0,0,1,1,0,0,0,0,0],
        [0,0,1,2,2,1,0,0,0,0],
        [0,1,2,2,2,2,1,1,0,0],
        [1,2,2,2,2,2,2,2,1,1],
        [1,2,2,2,2,2,2,2,1,1],
        [0,1,2,2,2,2,1,1,0,0],
        [0,0,1,2,2,1,0,0,0,0],
        [0,0,0,1,1,0,0,0,0,0]
      ],
      
      // 默认形状
      'default': [
        [0,1,1,1,0],
        [1,2,2,2,1],
        [1,2,2,2,1],
        [0,1,1,1,0]
      ]
    };
    
    // 如果是BOSS或传说级，放大形状
    let shape = shapes[this.config.id] || shapes['default'];
    
    if (this.config.size === 'boss' || this.config.size === 'legendary') {
      shape = this.enlargeShape(shape, 2);
    }
    
    return shape;
  }
  
  private enlargeShape(shape: number[][], scale: number): number[][] {
    const newHeight = shape.length * scale;
    const newWidth = shape[0].length * scale;
    const enlarged: number[][] = Array(newHeight).fill(null).map(() => Array(newWidth).fill(0));
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        const value = shape[y][x];
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            enlarged[y * scale + dy][x * scale + dx] = value;
          }
        }
      }
    }
    
    return enlarged;
  }
  
  private addEyes(shape: number[][]) {
    // 找到合适的眼睛位置
    const eyeY = Math.floor(shape.length * 0.3);
    let eyeX = Math.floor(shape[0].length * 0.7);
    
    // 确保眼睛在鱼身上
    if (shape[eyeY]?.[eyeX]) {
      this.bodySprite.beginFill(0xffffff);
      this.bodySprite.drawCircle(
        (eyeX - shape[0].length/2) * this.pixelSize,
        (eyeY - shape.length/2) * this.pixelSize,
        this.pixelSize
      );
      this.bodySprite.endFill();
      
      this.bodySprite.beginFill(0x000000);
      this.bodySprite.drawCircle(
        (eyeX - shape[0].length/2) * this.pixelSize + this.pixelSize * 0.3,
        (eyeY - shape.length/2) * this.pixelSize,
        this.pixelSize * 0.5
      );
      this.bodySprite.endFill();
    }
  }
  
  private createMultiplierDisplay() {
    // 创建倍率文字
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial Black',
      fontSize: this.pixelSize * 3,
      fontWeight: 'bold',
      fill: ['#ffffff', '#ffcc00'],
      stroke: '#000000',
      strokeThickness: 2,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowDistance: 2,
    });
    
    this.multiplierText = new PIXI.Text(`${this.config.multiplier}x`, style);
    this.multiplierText.anchor.set(0.5);
    this.multiplierText.position.y = -this.pixelSize * 10;
    
    // 高倍率鱼的文字更醒目
    if (this.config.multiplier >= 100) {
      this.multiplierText.style.fontSize = this.pixelSize * 4;
      this.multiplierText.style.fill = ['#ffff00', '#ff6600'];
    }
    
    this.addChild(this.multiplierText);
  }
  
  private addSpecialEffects() {
    // 稀有鱼添加粒子效果
    if (this.config.rarity === 'rare' || this.config.rarity === 'epic') {
      this.createSparkles();
    }
    
    // 传说鱼添加能量环
    if (this.config.rarity === 'legendary' || this.config.rarity === 'mythic') {
      this.createEnergyRing();
    }
    
    // BOSS鱼添加震撼效果
    if (this.config.size === 'boss' || this.config.size === 'legendary') {
      this.createBossAura();
    }
  }
  
  private createSparkles() {
    const createSparkle = () => {
      const sparkle = new PIXI.Graphics();
      sparkle.beginFill(0xffffff, 0.8);
      sparkle.drawStar(0, 0, 4, this.pixelSize);
      sparkle.endFill();
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;
      sparkle.x = Math.cos(angle) * distance;
      sparkle.y = Math.sin(angle) * distance;
      
      this.particleContainer.addChild(sparkle);
      
      // 动画
      let life = 1;
      const update = () => {
        life -= 0.02;
        sparkle.alpha = life;
        sparkle.scale.set(life);
        sparkle.rotation += 0.1;
        
        if (life <= 0) {
          this.particleContainer.removeChild(sparkle);
        } else {
          requestAnimationFrame(update);
        }
      };
      update();
    };
    
    // 定期产生火花
    setInterval(() => createSparkle(), 200);
  }
  
  private createEnergyRing() {
    const ring = new PIXI.Graphics();
    ring.lineStyle(2, this.config.color.glow, 0.5);
    ring.drawCircle(0, 0, 50);
    this.addChildAt(ring, 0);
    
    // 旋转动画
    PIXI.Ticker.shared.add(() => {
      ring.rotation += 0.02;
      ring.scale.set(1 + Math.sin(this.time * 0.05) * 0.1);
    });
  }
  
  private createBossAura() {
    const aura = new PIXI.Graphics();
    this.addChildAt(aura, 0);
    
    // 动态光环
    PIXI.Ticker.shared.add(() => {
      aura.clear();
      const radius = 60 + Math.sin(this.time * 0.1) * 20;
      const alpha = 0.3 + Math.sin(this.time * 0.15) * 0.2;
      
      aura.beginFill(this.config.color.glow, alpha);
      aura.drawCircle(0, 0, radius);
      aura.endFill();
    });
  }
  
  private startAnimation() {
    PIXI.Ticker.shared.add(this.update, this);
  }
  
  private update = (delta: number) => {
    this.time += delta * 0.05;
    
    // 更新位置
    this.x += this.velocity.x * delta;
    
    // 游动模式
    switch (this.config.pattern) {
      case 'straight':
        // 直线
        break;
        
      case 'wave':
        // 波浪
        this.y = this.baseY + Math.sin(this.time * 0.1) * 30;
        break;
        
      case 'zigzag':
        // Z字形
        const zigzagPhase = Math.floor(this.time * 0.05) % 2;
        this.velocity.y = zigzagPhase === 0 ? 1 : -1;
        this.y += this.velocity.y * delta;
        break;
        
      case 'circle':
        // 圆形
        const radius = 50;
        this.x = this.baseY + Math.cos(this.time * 0.05) * radius;
        this.y = this.baseY + Math.sin(this.time * 0.05) * radius;
        break;
        
      case 'boss_pattern':
        // BOSS特殊模式
        this.y = this.baseY + Math.sin(this.time * 0.05) * 50;
        this.rotation = Math.sin(this.time * 0.03) * 0.1;
        break;
    }
    
    // 身体动画
    const swimOffset = Math.sin(this.time * 0.2);
    this.bodySprite.skew.y = swimOffset * 0.05;
    
    // 倍率文字浮动
    this.multiplierText.y = -this.pixelSize * 10 + Math.sin(this.time * 0.15) * 2;
    
    // 传说鱼的彩虹效果
    if (this.config.rarity === 'legendary' || this.config.rarity === 'mythic') {
      const hue = (this.time * 2) % 360;
      this.bodySprite.tint = this.hslToHex(hue, 70, 50);
    }
  };
  
  // 设置Y轴基准位置
  public setBaseY(y: number) {
    this.baseY = y;
    this.y = y;
  }
  
  // 被击中效果
  public hit(damage: number) {
    // 闪白效果
    this.bodySprite.tint = 0xffffff;
    setTimeout(() => {
      this.bodySprite.tint = 0xffffff;
    }, 100);
    
    // 创建伤害数字
    const damageText = new PIXI.Text(`-${damage}`, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xff0000,
      fontWeight: 'bold'
    });
    damageText.anchor.set(0.5);
    this.addChild(damageText);
    
    // 伤害数字动画
    let floatY = 0;
    const floatDamage = () => {
      floatY -= 1;
      damageText.y = floatY;
      damageText.alpha -= 0.02;
      
      if (damageText.alpha <= 0) {
        this.removeChild(damageText);
      } else {
        requestAnimationFrame(floatDamage);
      }
    };
    floatDamage();
    
    return this.config.health;
  }
  
  // 工具函数
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
  
  public destroy() {
    PIXI.Ticker.shared.remove(this.update, this);
    super.destroy({ children: true });
  }
}
