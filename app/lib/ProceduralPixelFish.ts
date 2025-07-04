import * as PIXI from 'pixi.js';

// 鱼的基因参数
export interface FishGenome {
  // 形态基因
  bodyLength: number;      // 8-32 像素
  bodyHeight: number;      // 4-16 像素
  bodyRatio: number;       // 0.3-0.8 (瘦长/圆胖)
  headSize: number;        // 0.2-0.4 (相对身体)
  tailSize: number;        // 0.3-0.6
  
  // 颜色基因
  primaryHue: number;      // 0-360
  secondaryHue: number;    // 0-360
  patternType: 'solid' | 'stripes' | 'spots' | 'gradient';
  luminance: number;       // 0.3-0.8
  
  // 动态特征
  swimStyle: 'sine' | 'burst' | 'glide' | 'zigzag';
  flexibility: number;     // 0.1-1.0 (身体柔韧度)
  finCount: number;        // 2-6
  
  // 稀有度特征
  hasGlow: boolean;
  sparkleIntensity: number; // 0-1
}

// 优化的像素鱼精灵
export class ProceduralPixelFish extends PIXI.Container {
  private genome: FishGenome;
  private pixelSize: number = 4;
  
  // 缓存系统
  private bodyTexture: PIXI.Texture;
  private bodySprite: PIXI.Sprite;
  private finSprites: PIXI.Sprite[] = [];
  
  // 动画状态
  private time: number = 0;
  private velocity: PIXI.Point;
  private targetVelocity: PIXI.Point;
  
  // 性能优化：使用对象池
  private static pixelPool: PIXI.Sprite[] = [];
  private usedPixels: PIXI.Sprite[] = [];
  
  constructor(genome: Partial<FishGenome> = {}) {
    super();
    
    // 生成完整基因组
    this.genome = this.generateGenome(genome);
    this.velocity = new PIXI.Point(0, 0);
    this.targetVelocity = new PIXI.Point(0, 0);
    
    // 生成鱼的纹理（只生成一次）
    this.bodyTexture = this.generateBodyTexture();
    this.bodySprite = new PIXI.Sprite(this.bodyTexture);
    this.bodySprite.anchor.set(0.5);
    this.addChild(this.bodySprite);
    
    // 创建鱼鳍
    this.createFins();
    
    // 启动动画
    this.startAnimation();
  }
  
  private generateGenome(partial: Partial<FishGenome>): FishGenome {
    return {
      bodyLength: partial.bodyLength || 16 + Math.random() * 16,
      bodyHeight: partial.bodyHeight || 8 + Math.random() * 8,
      bodyRatio: partial.bodyRatio || 0.4 + Math.random() * 0.4,
      headSize: partial.headSize || 0.25 + Math.random() * 0.15,
      tailSize: partial.tailSize || 0.3 + Math.random() * 0.3,
      
      primaryHue: partial.primaryHue || Math.random() * 360,
      secondaryHue: partial.secondaryHue || Math.random() * 360,
      patternType: partial.patternType || ['solid', 'stripes', 'spots', 'gradient'][Math.floor(Math.random() * 4)] as any,
      luminance: partial.luminance || 0.4 + Math.random() * 0.4,
      
      swimStyle: partial.swimStyle || ['sine', 'burst', 'glide', 'zigzag'][Math.floor(Math.random() * 4)] as any,
      flexibility: partial.flexibility || 0.3 + Math.random() * 0.7,
      finCount: partial.finCount || 2 + Math.floor(Math.random() * 4),
      
      hasGlow: partial.hasGlow || Math.random() > 0.8,
      sparkleIntensity: partial.sparkleIntensity || (Math.random() > 0.9 ? Math.random() : 0)
    };
  }
  
  private generateBodyTexture(): PIXI.Texture {
    const width = Math.ceil(this.genome.bodyLength);
    const height = Math.ceil(this.genome.bodyHeight);
    
    // 使用 Canvas 生成纹理
    const canvas = document.createElement('canvas');
    canvas.width = width * this.pixelSize;
    canvas.height = height * this.pixelSize;
    const ctx = canvas.getContext('2d')!;
    
    // 生成鱼身形状
    const shape = this.generateFishShape(width, height);
    
    // 应用颜色和图案
    this.applyPattern(ctx, shape, width, height);
    
    return PIXI.Texture.from(canvas);
  }
  
  private generateFishShape(width: number, height: number): boolean[][] {
    const shape: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));
    const centerY = height / 2;
    
    // 使用数学函数生成鱼形
    for (let x = 0; x < width; x++) {
      const t = x / width;
      
      // 鱼身轮廓函数（可以调整以创建不同形状）
      let thickness: number;
      
      if (t < this.genome.headSize) {
        // 头部：抛物线
        const headT = t / this.genome.headSize;
        thickness = Math.sqrt(headT) * this.genome.bodyRatio;
      } else if (t < 1 - this.genome.tailSize) {
        // 身体：椭圆函数
        const bodyT = (t - this.genome.headSize) / (1 - this.genome.headSize - this.genome.tailSize);
        thickness = this.genome.bodyRatio * Math.sin(bodyT * Math.PI);
      } else {
        // 尾部：反抛物线
        const tailT = (t - (1 - this.genome.tailSize)) / this.genome.tailSize;
        thickness = this.genome.bodyRatio * (1 - tailT * tailT) * 0.5;
      }
      
      // 填充形状
      const halfThickness = thickness * height / 2;
      for (let y = 0; y < height; y++) {
        const distance = Math.abs(y - centerY);
        if (distance <= halfThickness) {
          shape[y][x] = true;
        }
      }
    }
    
    return shape;
  }
  
  private applyPattern(ctx: CanvasRenderingContext2D, shape: boolean[][], width: number, height: number) {
    const primaryColor = this.hslToRgb(this.genome.primaryHue, 0.7, this.genome.luminance);
    const secondaryColor = this.hslToRgb(this.genome.secondaryHue, 0.6, this.genome.luminance * 0.8);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!shape[y][x]) continue;
        
        let color = primaryColor;
        
        // 应用图案
        switch (this.genome.patternType) {
          case 'stripes':
            if (x % 4 < 2) color = secondaryColor;
            break;
          case 'spots':
            if ((x + y) % 5 === 0) color = secondaryColor;
            break;
          case 'gradient':
            const t = x / width;
            color = this.interpolateColor(primaryColor, secondaryColor, t);
            break;
        }
        
        // 添加光照效果
        const centerY = height / 2;
        const lightness = 1 - Math.abs(y - centerY) / centerY * 0.3;
        color = this.adjustBrightness(color, lightness);
        
        ctx.fillStyle = color;
        ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
      }
    }
    
    // 添加细节
    this.addDetails(ctx, shape, width, height);
  }
  
  private addDetails(ctx: CanvasRenderingContext2D, shape: boolean[][], width: number, height: number) {
    // 眼睛
    const eyeX = Math.floor(width * this.genome.headSize * 0.7);
    const eyeY = Math.floor(height * 0.3);
    
    if (shape[eyeY]?.[eyeX]) {
      // 眼白
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(eyeX * this.pixelSize, eyeY * this.pixelSize, this.pixelSize * 2, this.pixelSize * 2);
      
      // 瞳孔
      ctx.fillStyle = '#000000';
      ctx.fillRect((eyeX + 0.5) * this.pixelSize, (eyeY + 0.5) * this.pixelSize, this.pixelSize, this.pixelSize);
    }
    
    // 鳞片高光
    if (this.genome.sparkleIntensity > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.genome.sparkleIntensity})`;
      for (let i = 0; i < 5; i++) {
        const sparkleX = Math.floor(Math.random() * width);
        const sparkleY = Math.floor(Math.random() * height);
        if (shape[sparkleY]?.[sparkleX]) {
          ctx.fillRect(sparkleX * this.pixelSize, sparkleY * this.pixelSize, this.pixelSize * 0.5, this.pixelSize * 0.5);
        }
      }
    }
  }
  
  private createFins() {
    // 背鳍
    const dorsalFin = this.createFinSprite('dorsal');
    dorsalFin.position.set(0, -this.genome.bodyHeight * this.pixelSize * 0.5);
    this.addChild(dorsalFin);
    this.finSprites.push(dorsalFin);
    
    // 胸鳍
    const pectoralFin = this.createFinSprite('pectoral');
    pectoralFin.position.set(this.genome.bodyLength * this.pixelSize * 0.2, 0);
    this.addChild(pectoralFin);
    this.finSprites.push(pectoralFin);
    
    // 尾鳍
    const tailFin = this.createFinSprite('tail');
    tailFin.position.set(-this.genome.bodyLength * this.pixelSize * 0.5, 0);
    this.addChild(tailFin);
    this.finSprites.push(tailFin);
  }
  
  private createFinSprite(type: 'dorsal' | 'pectoral' | 'tail'): PIXI.Sprite {
    const canvas = document.createElement('canvas');
    const size = this.pixelSize * 4;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = this.hslToRgb(this.genome.primaryHue, 0.5, this.genome.luminance * 0.7);
    
    switch (type) {
      case 'dorsal':
        ctx.beginPath();
        ctx.moveTo(size/2, size);
        ctx.lineTo(0, 0);
        ctx.lineTo(size, 0);
        ctx.closePath();
        ctx.fill();
        break;
      case 'pectoral':
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'tail':
        ctx.beginPath();
        ctx.moveTo(0, size/2);
        ctx.lineTo(size, 0);
        ctx.lineTo(size, size);
        ctx.closePath();
        ctx.fill();
        break;
    }
    
    const sprite = new PIXI.Sprite(PIXI.Texture.from(canvas));
    sprite.anchor.set(0.5);
    return sprite;
  }
  
  private startAnimation() {
    PIXI.Ticker.shared.add(this.animate, this);
  }
  
  private animate = (delta: number) => {
    this.time += delta * 0.05;
    
    // 平滑速度过渡
    this.velocity.x += (this.targetVelocity.x - this.velocity.x) * 0.1;
    this.velocity.y += (this.targetVelocity.y - this.velocity.y) * 0.1;
    
    // 更新位置
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
    
    // 根据游泳风格应用动画
    this.applySwimAnimation();
    
    // 更新朝向
    if (Math.abs(this.velocity.x) > 0.1) {
      this.scale.x = this.velocity.x > 0 ? 1 : -1;
    }
  }
  
  private applySwimAnimation() {
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    const intensity = Math.min(speed / 5, 1);
    
    switch (this.genome.swimStyle) {
      case 'sine':
        // 正弦波游动
        const waveAmount = Math.sin(this.time * 0.2) * this.genome.flexibility * intensity;
        this.bodySprite.skew.y = waveAmount * 0.1;
        this.finSprites[2].rotation = waveAmount * 0.5; // 尾鳍
        break;
        
      case 'burst':
        // 爆发式游动
        const burstPhase = (this.time * 0.1) % 1;
        if (burstPhase < 0.3) {
          this.bodySprite.scale.x = 1 + burstPhase * 0.2;
          this.finSprites.forEach(fin => fin.scale.set(1 + burstPhase * 0.5));
        } else {
          this.bodySprite.scale.x = 1;
          this.finSprites.forEach(fin => fin.scale.set(1));
        }
        break;
        
      case 'glide':
        // 滑翔游动
        this.bodySprite.rotation = Math.atan2(this.velocity.y, this.velocity.x) * 0.3;
        this.finSprites[1].rotation = Math.sin(this.time * 0.05) * 0.2; // 胸鳍轻微扇动
        break;
        
      case 'zigzag':
        // Z字形游动
        const zigzag = Math.sin(this.time * 0.3) * this.genome.flexibility;
        this.y += zigzag * intensity;
        this.bodySprite.rotation = zigzag * 0.2;
        break;
    }
    
    // 所有鱼鳍的通用动画
    this.finSprites[0].scale.y = 1 + Math.sin(this.time * 0.15) * 0.2; // 背鳍
    this.finSprites[1].rotation += Math.sin(this.time * 0.2) * 0.1 * intensity; // 胸鳍
  }
  
  // 公共方法
  public setTargetVelocity(x: number, y: number) {
    this.targetVelocity.set(x, y);
  }
  
  public breed(otherFish: ProceduralPixelFish): FishGenome {
    // 基因混合算法
    const newGenome: Partial<FishGenome> = {};
    const g1 = this.genome;
    const g2 = otherFish.genome;
    
    // 数值基因：平均值 + 变异
    newGenome.bodyLength = (g1.bodyLength + g2.bodyLength) / 2 + (Math.random() - 0.5) * 4;
    newGenome.bodyHeight = (g1.bodyHeight + g2.bodyHeight) / 2 + (Math.random() - 0.5) * 2;
    newGenome.flexibility = (g1.flexibility + g2.flexibility) / 2 + (Math.random() - 0.5) * 0.1;
    
    // 颜色基因：混合或继承
    if (Math.random() > 0.5) {
      newGenome.primaryHue = (g1.primaryHue + g2.primaryHue) / 2;
    } else {
      newGenome.primaryHue = Math.random() > 0.5 ? g1.primaryHue : g2.primaryHue;
    }
    
    // 特征基因：随机继承
    newGenome.patternType = Math.random() > 0.5 ? g1.patternType : g2.patternType;
    newGenome.swimStyle = Math.random() > 0.5 ? g1.swimStyle : g2.swimStyle;
    
    // 稀有变异
    if (Math.random() < 0.1) {
      newGenome.hasGlow = true;
      newGenome.sparkleIntensity = Math.random();
    }
    
    return this.generateGenome(newGenome);
  }
  
  // 工具函数
  private hslToRgb(h: number, s: number, l: number): string {
    h = h / 360;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    const r = Math.round(255 * f(0));
    const g = Math.round(255 * f(8));
    const b = Math.round(255 * f(4));
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  private interpolateColor(c1: string, c2: string, t: number): string {
    const rgb1 = c1.match(/\d+/g)!.map(Number);
    const rgb2 = c2.match(/\d+/g)!.map(Number);
    const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t);
    const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t);
    const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  private adjustBrightness(color: string, factor: number): string {
    const rgb = color.match(/\d+/g)!.map(Number);
    const r = Math.min(255, Math.round(rgb[0] * factor));
    const g = Math.min(255, Math.round(rgb[1] * factor));
    const b = Math.min(255, Math.round(rgb[2] * factor));
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  public destroy() {
    PIXI.Ticker.shared.remove(this.animate, this);
    super.destroy({ children: true, texture: true });
  }
}
