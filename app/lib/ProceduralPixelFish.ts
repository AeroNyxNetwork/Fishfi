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
  private bodyTexture!: PIXI.Texture;
  private bodySprite!: PIXI.Sprite;
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
    
    // 根据鱼的类型使用不同的形状算法
    const shapeType = this.getShapeType();
    
    switch (shapeType) {
      case 'classic': // 经典鱼形（金鱼）
        this.generateClassicShape(shape, width, height, centerY);
        break;
      case 'predator': // 掠食者（鲨鱼）
        this.generatePredatorShape(shape, width, height, centerY);
        break;
      case 'round': // 圆形（河豚）
        this.generateRoundShape(shape, width, height, centerY);
        break;
      case 'flat': // 扁平（比目鱼）
        this.generateFlatShape(shape, width, height, centerY);
        break;
      case 'long': // 细长（鳗鱼）
        this.generateLongShape(shape, width, height, centerY);
        break;
      case 'triangle': // 三角形（神仙鱼）
        this.generateTriangleShape(shape, width, height, centerY);
        break;
      case 'exotic': // 异形（海马）
        this.generateExoticShape(shape, width, height, centerY);
        break;
      default:
        this.generateClassicShape(shape, width, height, centerY);
    }
    
    // 添加鱼鳍轮廓
    this.addFinsToShape(shape, width, height, shapeType);
    
    return shape;
  }
  
  private getShapeType(): string {
    // 根据基因决定形状类型
    const ratio = this.genome.bodyRatio;
    const heightRatio = this.genome.bodyHeight / this.genome.bodyLength;
    
    if (this.genome.swimStyle === 'glide' && ratio < 0.5) return 'predator';
    if (ratio > 0.7 && heightRatio > 0.8) return 'round';
    if (heightRatio < 0.3) return 'flat';
    if (ratio < 0.3 && this.genome.bodyLength > 24) return 'long';
    if (heightRatio > 1.0) return 'triangle';
    if (this.genome.flexibility > 0.8) return 'exotic';
    return 'classic';
  }
  
  private generateClassicShape(shape: boolean[][], width: number, height: number, centerY: number) {
    // 经典鱼形 - 流线型
    for (let x = 0; x < width; x++) {
      const t = x / width;
      let thickness: number;
      
      if (t < 0.25) {
        // 头部 - 椭圆前端
        thickness = Math.sin(t * Math.PI * 2) * 0.4;
      } else if (t < 0.7) {
        // 身体 - 饱满
        const bodyT = (t - 0.25) / 0.45;
        thickness = 0.4 + Math.sin(bodyT * Math.PI) * 0.3;
      } else {
        // 尾部 - 收缩
        const tailT = (t - 0.7) / 0.3;
        thickness = 0.7 * (1 - tailT) * (1 - tailT * 0.5);
      }
      
      this.fillColumn(shape, x, centerY, thickness * height / 2);
    }
  }
  
  private generatePredatorShape(shape: boolean[][], width: number, height: number, centerY: number) {
    // 鲨鱼形 - 流线型加强
    for (let x = 0; x < width; x++) {
      const t = x / width;
      let thickness: number;
      
      if (t < 0.15) {
        // 尖锐的头部
        thickness = Math.pow(t / 0.15, 0.5) * 0.3;
      } else if (t < 0.6) {
        // 强壮的身体
        const bodyT = (t - 0.15) / 0.45;
        thickness = 0.3 + Math.sin(bodyT * Math.PI * 0.8) * 0.2;
      } else {
        // 有力的尾部
        const tailT = (t - 0.6) / 0.4;
        thickness = 0.5 * Math.cos(tailT * Math.PI / 2);
      }
      
      this.fillColumn(shape, x, centerY, thickness * height / 2);
    }
    
    // 添加背鳍
    const dorsalStart = Math.floor(width * 0.3);
    const dorsalEnd = Math.floor(width * 0.5);
    for (let x = dorsalStart; x < dorsalEnd; x++) {
      const dorsalT = (x - dorsalStart) / (dorsalEnd - dorsalStart);
      const dorsalHeight = Math.sin(dorsalT * Math.PI) * height * 0.3;
      for (let y = 0; y < dorsalHeight; y++) {
        const dorsalY = Math.floor(centerY - height/2 - y);
        if (dorsalY >= 0) shape[dorsalY][x] = true;
      }
    }
  }
  
  private generateRoundShape(shape: boolean[][], width: number, height: number, centerY: number) {
    // 河豚形 - 近似圆形
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 椭圆形状
        const adjustedDistance = Math.sqrt(
          Math.pow(dx / (width / 2), 2) + 
          Math.pow(dy / (height / 2), 2)
        );
        
        if (adjustedDistance < 0.9) {
          shape[y][x] = true;
        }
      }
    }
    
    // 添加小尾巴
    const tailStart = Math.floor(width * 0.8);
    for (let x = tailStart; x < width; x++) {
      const tailT = (x - tailStart) / (width - tailStart);
      const tailHeight = (1 - tailT) * height * 0.3;
      this.fillColumn(shape, x, centerY, tailHeight);
    }
  }
  
  private generateFlatShape(shape: boolean[][], width: number, height: number, centerY: number) {
    // 比目鱼形 - 扁平椭圆
    for (let x = 0; x < width; x++) {
      const t = x / width;
      
      // 椭圆方程
      const a = width / 2;
      const b = height / 3; // 更扁
      const centerX = width / 2;
      
      // 计算椭圆边界
      const dx = Math.abs(x - centerX);
      if (dx < a) {
        const thickness = b * Math.sqrt(1 - (dx / a) * (dx / a));
        this.fillColumn(shape, x, centerY, thickness);
      }
    }
  }
  
  private generateLongShape(shape: boolean[][], width: number, height: number, centerY: number) {
    // 鳗鱼形 - 细长蛇形
    for (let x = 0; x < width; x++) {
      const t = x / width;
      
      // 波浪形身体
      const waveOffset = Math.sin(t * Math.PI * 4) * height * 0.1;
      const thickness = 0.3 + Math.sin(t * Math.PI) * 0.1;
      
      const adjustedCenterY = centerY + waveOffset;
      this.fillColumn(shape, x, adjustedCenterY, thickness * height / 2);
    }
  }
  
  private generateTriangleShape(shape: boolean[][], width: number, height: number, centerY: number) {
    // 神仙鱼形 - 三角形
    for (let x = 0; x < width; x++) {
      const t = x / width;
      let topY: number, bottomY: number;
      
      if (t < 0.6) {
        // 前部扩张
        const expandT = t / 0.6;
        topY = centerY - expandT * height / 2;
        bottomY = centerY + expandT * height / 2;
      } else {
        // 后部收缩
        const contractT = (t - 0.6) / 0.4;
        topY = centerY - (1 - contractT) * height / 2;
        bottomY = centerY + (1 - contractT) * height / 2;
      }
      
      for (let y = Math.floor(topY); y <= Math.floor(bottomY); y++) {
        if (y >= 0 && y < height) {
          shape[y][x] = true;
        }
      }
    }
  }
  
  private generateExoticShape(shape: boolean[][], width: number, height: number, centerY: number) {
    // 海马形 - S形曲线
    for (let x = 0; x < width; x++) {
      const t = x / width;
      
      // S形曲线
      let curveY: number;
      if (t < 0.5) {
        curveY = centerY - Math.sin(t * Math.PI) * height * 0.3;
      } else {
        curveY = centerY + Math.sin((t - 0.5) * Math.PI) * height * 0.3;
      }
      
      // 变化的厚度
      let thickness: number;
      if (t < 0.3) {
        thickness = 0.5 + t;
      } else {
        thickness = 0.8 - t * 0.5;
      }
      
      this.fillColumn(shape, x, curveY, thickness * height / 3);
    }
    
    // 添加特征性的卷曲尾巴
    const tailX = Math.floor(width * 0.8);
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI / 4;
      const tx = tailX + Math.cos(angle) * 3;
      const ty = centerY + height/3 + Math.sin(angle) * 3;
      if (tx < width && ty < height && ty >= 0) {
        shape[Math.floor(ty)][Math.floor(tx)] = true;
      }
    }
  }
  
  private fillColumn(shape: boolean[][], x: number, centerY: number, halfHeight: number) {
    const top = Math.floor(centerY - halfHeight);
    const bottom = Math.floor(centerY + halfHeight);
    
    for (let y = top; y <= bottom; y++) {
      if (y >= 0 && y < shape.length && x >= 0 && x < shape[0].length) {
        shape[y][x] = true;
      }
    }
  }
  
  private addFinsToShape(shape: boolean[][], width: number, height: number, shapeType: string) {
    // 根据鱼的类型添加不同的鱼鳍
    switch (shapeType) {
      case 'predator':
        // 鲨鱼 - 大背鳍已在形状中添加
        break;
        
      case 'round':
        // 河豚 - 小圆鳍
        this.addSmallRoundFins(shape, width, height);
        break;
        
      case 'triangle':
        // 神仙鱼 - 长飘逸的鳍
        this.addLongFins(shape, width, height);
        break;
        
      case 'exotic':
        // 海马 - 背部波浪鳍
        this.addWavyDorsalFin(shape, width, height);
        break;
        
      default:
        // 标准鳍
        this.addStandardFins(shape, width, height);
    }
  }
  
  private addSmallRoundFins(shape: boolean[][], width: number, height: number) {
    // 在身体周围添加小圆鳍
    const centerY = height / 2;
    const finPositions = [
      { x: width * 0.3, y: centerY - height * 0.3 },
      { x: width * 0.3, y: centerY + height * 0.3 },
      { x: width * 0.6, y: centerY }
    ];
    
    finPositions.forEach(pos => {
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const x = Math.floor(pos.x + dx);
          const y = Math.floor(pos.y + dy);
          if (x >= 0 && x < width && y >= 0 && y < height) {
            if (dx * dx + dy * dy <= 4) {
              shape[y][x] = true;
            }
          }
        }
      }
    });
  }
  
  private addLongFins(shape: boolean[][], width: number, height: number) {
    // 添加长飘逸的鳍
    const centerY = height / 2;
    
    // 上下长鳍
    for (let x = width * 0.2; x < width * 0.7; x++) {
      const finT = (x - width * 0.2) / (width * 0.5);
      const finHeight = Math.sin(finT * Math.PI) * height * 0.2;
      
      // 上鳍
      for (let y = 0; y < finHeight; y++) {
        const fy = Math.floor(centerY - height/2 - y);
        if (fy >= 0) shape[fy][Math.floor(x)] = true;
      }
      
      // 下鳍
      for (let y = 0; y < finHeight; y++) {
        const fy = Math.floor(centerY + height/2 + y);
        if (fy < height) shape[fy][Math.floor(x)] = true;
      }
    }
  }
  
  private addWavyDorsalFin(shape: boolean[][], width: number, height: number) {
    // 波浪形背鳍
    const startX = Math.floor(width * 0.1);
    const endX = Math.floor(width * 0.7);
    
    for (let x = startX; x < endX; x++) {
      const t = (x - startX) / (endX - startX);
      const wave = Math.sin(t * Math.PI * 3) * 2;
      const finHeight = 3 + wave;
      
      for (let y = 0; y < finHeight; y++) {
        const fy = Math.floor(height / 2 - height / 2 - y);
        if (fy >= 0) shape[fy][x] = true;
      }
    }
  }
  
  private addStandardFins(shape: boolean[][], width: number, height: number) {
    // 标准背鳍和腹鳍
    const dorsalStart = Math.floor(width * 0.4);
    const dorsalEnd = Math.floor(width * 0.6);
    
    for (let x = dorsalStart; x < dorsalEnd; x++) {
      const t = (x - dorsalStart) / (dorsalEnd - dorsalStart);
      const finHeight = Math.sin(t * Math.PI) * 3;
      
      for (let y = 0; y < finHeight; y++) {
        const fy = Math.floor(height / 2 - height / 2 - y);
        if (fy >= 0) shape[fy][x] = true;
      }
    }
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
