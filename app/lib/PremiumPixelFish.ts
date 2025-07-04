import * as PIXI from 'pixi.js';

// 高级像素鱼设计系统
export class PremiumPixelFish {
  
  // 精心设计的像素鱼模板 - 每个都是艺术品
  public static readonly FISH_DESIGNS = {
    // 霓虹鱼 - 小巧精致
    neonTetra: {
      frames: [
        // 帧1 - 游动状态1
        [
          "    ▓▓    ",
          "  ▓▓░░▓▓  ",
          " ▓░░██░░▓ ",
          "▓░░████░░▓",
          "▓░██░░██░▓",
          " ▓░░██░░▓ ",
          "  ▓▓░░▓▓  ",
          "    ▓▓    "
        ],
        // 帧2 - 游动状态2
        [
          "    ▓▓    ",
          "  ▓▓░░▓▓  ",
          " ▓░░██░░▓ ",
          "▓░░████░░▓",
          "▓░██░░██░▓",
          " ▓░░██░░▓▓",
          "  ▓▓░░▓▓  ",
          "    ▓▓    "
        ]
      ],
      colors: {
        '▓': 0x00ffff, // 霓虹蓝
        '░': 0x0099ff, // 深蓝
        '█': 0xffffff, // 亮白
        '▒': 0x006699  // 阴影
      },
      glowColor: 0x00ffff,
      size: 1
    },
    
    // 金鱼 - 优雅圆润
    goldfish: {
      frames: [
        [
          "     ▒▒▒▒     ",
          "   ▒▒████▒▒   ",
          "  ▒████████▒  ",
          " ▒██████████▒ ",
          "▒████●██████▒▒",
          "▒████████████▒",
          " ▒██████████▒ ",
          "  ▒████████▒▒ ",
          "   ▒▒████▒▒▓▓ ",
          "     ▒▒▒▒ ▓▓▓▓",
          "           ▓▓  "
        ]
      ],
      colors: {
        '█': 0xffaa00, // 金色
        '▒': 0xff8800, // 深金
        '●': 0x000000, // 眼睛
        '▓': 0xff6600  // 尾巴
      },
      glowColor: 0xffcc00,
      size: 1.5
    },
    
    // 鲨鱼 - 凶猛霸气
    shark: {
      frames: [
        [
          "      ▒▒▒▒▒▒        ",
          "    ▒▒░░░░░░▒▒      ",
          "   ▒░░░░░░░░░░▒     ",
          "  ▒░░░░▓▓░░░░░▒▒    ",
          " ▒░░░░░░░░░░░░░░▒▒▒▒",
          "▒░░●░░░░░░░░░░░░░░▒▒",
          "▒░░░░░░░░░░░░░░░░▒▓▓",
          " ▒▒░░░░░▀▀▀░░░░▒▒▓▓ ",
          "  ▒▒░░░░░░░░░░▒▒    ",
          "    ▒▒▒▒▒▒▒▒▒▒      "
        ]
      ],
      colors: {
        '░': 0x8899aa, // 鲨鱼灰
        '▒': 0x667788, // 深灰
        '●': 0xffffff, // 眼白
        '▓': 0x556677, // 鳍
        '▀': 0xffffff  // 牙齿
      },
      glowColor: 0x6699ff,
      size: 2.5
    },
    
    // 神仙鱼 - 飘逸优美
    angelfish: {
      frames: [
        [
          "    ▓▓▓▓    ",
          "   ▓░░░░▓   ",
          "  ▓░░██░░▓  ",
          " ▓░░████░░▓ ",
          "▓░░██████░░▓",
          "▓░████████░▓",
          "▓░░██████░░▓",
          " ▓░░████░░▓ ",
          "  ▓░░██░░▓  ",
          "   ▓░░░░▓   ",
          "    ▓▓▓▓    "
        ]
      ],
      colors: {
        '█': 0xff99ff, // 粉紫
        '░': 0xcc66cc, // 深紫
        '▓': 0xffccff  // 鳍-浅紫
      },
      glowColor: 0xff66ff,
      size: 1.8
    },
    
    // 河豚 - 圆胖可爱
    pufferfish: {
      frames: [
        // 正常状态
        [
          "   ▒▒▒▒▒   ",
          " ▒▒█████▒▒ ",
          "▒█████████▒",
          "▒███●█████▒",
          "▒█████████▒",
          "▒▓▓▓▓▓▓▓▓▒",
          " ▒▒█████▒▒ ",
          "   ▒▒▒▒▒   "
        ],
        // 膨胀状态
        [
          "  ▒▒▒▒▒▒▒  ",
          " ▒░░░░░░░▒ ",
          "▒░▓░▓░▓░▓░▒",
          "▒░▓●▓░▓░▓░▒",
          "▒░▓░▓░▓░▓░▒",
          "▒░░░░░░░░░▒",
          " ▒▒▒▒▒▒▒▒▒ ",
          "  ▒▒▒▒▒▒▒  "
        ]
      ],
      colors: {
        '█': 0xffcc66, // 黄褐
        '▒': 0xcc9933, // 深褐
        '●': 0x000000, // 眼睛
        '░': 0xffddaa, // 膨胀色
        '▓': 0x996633  // 刺
      },
      glowColor: 0xffcc00,
      size: 1.6
    },
    
    // 龙王 - 传说级霸气
    dragonKing: {
      frames: [
        [
          "     ▓▓█▓▓     ",
          "   ▓▓███▓▓▓    ",
          "  ▓████████▓   ",
          " ▓██████████▓▓▓",
          "▓████●███████▓█",
          "▓█████████████▓",
          "▓▓████▀▀█████▓▓",
          " ▓▓█████████▓▓ ",
          "  ▓▓███████▓▓  ",
          "   ▓▓█████▓▓   ",
          "    ▓▓▓█▓▓▓    ",
          "      ▓▓▓      "
        ]
      ],
      colors: {
        '█': 0xffcc00, // 金色主体
        '▓': 0xff9900, // 橙色边缘
        '●': 0xff0000, // 红眼
        '▀': 0xffffff  // 牙齿
      },
      glowColor: 0xffff00,
      size: 3.5
    },
    
    // 电鳗 - 科技感
    electricEel: {
      frames: [
        [
          "░░░░░░░░░░░░░░░",
          "▒████████████▒░",
          "░▒██◆██◆██◆█▒░",
          "░░▒█████████▒░░",
          "  ░▒▒▒▒▒▒▒▒░   "
        ]
      ],
      colors: {
        '█': 0x0099ff, // 电蓝
        '▒': 0x006699, // 深蓝
        '░': 0x00ccff, // 电光
        '◆': 0xffffff  // 电极
      },
      glowColor: 0x00ffff,
      size: 2.8
    },
    
    // 小丑鱼 - 经典配色
    clownfish: {
      frames: [
        [
          "   ▒▒▒▒   ",
          " ▒▒████▒▒ ",
          "▒██░░░██▒",
          "▒█░●●░░█▒",
          "▒██░░░██▒",
          " ▒▒████▒▒ ",
          "   ▒▒▒▒   "
        ]
      ],
      colors: {
        '█': 0xff6600, // 橙色
        '░': 0xffffff, // 白条
        '▒': 0xcc3300, // 深橙
        '●': 0x000000  // 眼睛
      },
      glowColor: 0xff9900,
      size: 1.2
    }
  };
  
  // 创建高级像素鱼精灵
  public static createPremiumFish(
    type: keyof typeof PremiumPixelFish.FISH_DESIGNS,
    scale: number = 1
  ): PIXI.Container {
    const fishContainer = new PIXI.Container();
    const design = this.FISH_DESIGNS[type];
    
    if (!design) {
      console.warn(`Fish design ${type} not found`);
      return fishContainer;
    }
    
    // 创建主体精灵
    const bodySprite = this.createPixelSprite(design.frames[0], design.colors, scale);
    fishContainer.addChild(bodySprite);
    
    // 添加发光层
    if (design.glowColor) {
      const glowSprite = this.createGlowLayer(design.frames[0], design.glowColor, scale);
      fishContainer.addChildAt(glowSprite, 0);
    }
    
    // 添加细节层（反光、阴影等）
    const detailSprite = this.createDetailLayer(design.frames[0], scale);
    fishContainer.addChild(detailSprite);
    
    // 设置尺寸
    fishContainer.scale.set(design.size);
    
    // 添加动画数据
    (fishContainer as any).animationFrames = design.frames;
    (fishContainer as any).colors = design.colors;
    (fishContainer as any).currentFrame = 0;
    
    return fishContainer;
  }
  
  // 创建像素精灵
  private static createPixelSprite(
    frame: string[],
    colors: Record<string, number>,
    scale: number
  ): PIXI.Container {
    const sprite = new PIXI.Container();
    const pixelSize = 3 * scale;
    
    frame.forEach((row, y) => {
      const chars = row.split('');
      chars.forEach((char, x) => {
        if (char !== ' ' && colors[char]) {
          const pixel = new PIXI.Graphics();
          pixel.beginFill(colors[char]);
          pixel.drawRect(0, 0, pixelSize, pixelSize);
          pixel.endFill();
          
          // 像素边缘处理 - 添加细微的暗边
          pixel.lineStyle(0.5, 0x000000, 0.2);
          pixel.drawRect(0, 0, pixelSize, pixelSize);
          
          pixel.position.set(
            x * pixelSize - (chars.length * pixelSize) / 2,
            y * pixelSize - (frame.length * pixelSize) / 2
          );
          
          sprite.addChild(pixel);
        }
      });
    });
    
    return sprite;
  }
  
  // 创建发光层
  private static createGlowLayer(
    frame: string[],
    glowColor: number,
    scale: number
  ): PIXI.Container {
    const glowContainer = new PIXI.Container();
    const pixelSize = 3 * scale;
    
    // 创建模糊的发光背景
    const glowGraphics = new PIXI.Graphics();
    glowGraphics.beginFill(glowColor, 0.3);
    
    // 找出鱼的轮廓
    const outline: Array<{x: number, y: number}> = [];
    frame.forEach((row, y) => {
      const chars = row.split('');
      chars.forEach((char, x) => {
        if (char !== ' ') {
          // 检查是否是边缘像素
          const isEdge = 
            (x === 0 || chars[x-1] === ' ') ||
            (x === chars.length - 1 || chars[x+1] === ' ') ||
            (y === 0 || frame[y-1]?.[x] === ' ') ||
            (y === frame.length - 1 || frame[y+1]?.[x] === ' ');
          
          if (isEdge) {
            outline.push({
              x: x * pixelSize - (chars.length * pixelSize) / 2,
              y: y * pixelSize - (frame.length * pixelSize) / 2
            });
          }
        }
      });
    });
    
    // 绘制发光效果
    outline.forEach(point => {
      glowGraphics.drawCircle(
        point.x + pixelSize/2,
        point.y + pixelSize/2,
        pixelSize * 2
      );
    });
    
    glowGraphics.endFill();
    
    // 应用模糊滤镜
    const blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.blur = 4 * scale;
    glowGraphics.filters = [blurFilter];
    
    glowContainer.addChild(glowGraphics);
    return glowContainer;
  }
  
  // 创建细节层（高光、阴影）
  private static createDetailLayer(
    frame: string[],
    scale: number
  ): PIXI.Container {
    const detailContainer = new PIXI.Container();
    const pixelSize = 3 * scale;
    
    // 添加随机高光点
    const highlights = new PIXI.Graphics();
    highlights.beginFill(0xffffff, 0.6);
    
    // 在鱼身上随机添加一些亮点
    let highlightCount = 0;
    frame.forEach((row, y) => {
      const chars = row.split('');
      chars.forEach((char, x) => {
        if (char !== ' ' && Math.random() < 0.1 && highlightCount < 5) {
          highlights.drawRect(
            x * pixelSize - (chars.length * pixelSize) / 2,
            y * pixelSize - (frame.length * pixelSize) / 2,
            pixelSize * 0.5,
            pixelSize * 0.5
          );
          highlightCount++;
        }
      });
    });
    
    highlights.endFill();
    detailContainer.addChild(highlights);
    
    return detailContainer;
  }
  
  // 动画更新方法
  public static animateFish(fish: PIXI.Container, time: number) {
    // 获取动画数据
    const frames = (fish as any).animationFrames;
    const colors = (fish as any).colors;
    
    if (!frames || frames.length <= 1) return;
    
    // 计算当前帧
    const frameIndex = Math.floor(time * 0.1) % frames.length;
    
    if (frameIndex !== (fish as any).currentFrame) {
      (fish as any).currentFrame = frameIndex;
      
      // 更新精灵
      fish.removeChildren();
      const newSprite = this.createPixelSprite(frames[frameIndex], colors, 1);
      fish.addChild(newSprite);
    }
    
    // 游泳动画
    fish.rotation = Math.sin(time * 0.05) * 0.05;
    fish.y += Math.sin(time * 0.03) * 0.5;
  }
  
  // 创建特殊效果
  public static createSpecialEffect(type: string, position: PIXI.Point): PIXI.Container {
    const effectContainer = new PIXI.Container();
    effectContainer.position.copyFrom(position);
    
    switch (type) {
      case 'bubble':
        // 气泡效果
        for (let i = 0; i < 5; i++) {
          const bubble = new PIXI.Graphics();
          bubble.lineStyle(1, 0xffffff, 0.5);
          bubble.drawCircle(0, 0, 3 + i * 2);
          bubble.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
          );
          effectContainer.addChild(bubble);
        }
        break;
        
      case 'sparkle':
        // 闪光效果
        const sparkle = new PIXI.Graphics();
        sparkle.beginFill(0xffffff, 0.8);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const length = 10;
          sparkle.moveTo(0, 0);
          sparkle.lineTo(
            Math.cos(angle) * length,
            Math.sin(angle) * length
          );
        }
        sparkle.endFill();
        effectContainer.addChild(sparkle);
        break;
    }
    
    return effectContainer;
  }
}
