import * as PIXI from 'pixi.js';
import { Web3UltimateFish } from './Web3UltimateFish';
import { Bullet, ULTIMATE_FISH_TYPES, GameConfig } from './UltimateFishingGame';

export class FishingGameEngine {
  public app: PIXI.Application;
  private gameContainer!: PIXI.Container;
  private fishContainer!: PIXI.Container;
  private bulletContainer!: PIXI.Container;
  private effectContainer!: PIXI.Container;
  private uiContainer!: PIXI.Container;
  
  // 游戏状态
  private gameConfig: GameConfig = {
    cannonPower: 1,
    coins: 1000,
    betAmount: 1,
    autoFire: false
  };
  
  // 游戏对象
  private fishes: Web3UltimateFish[] = [];
  private bullets: Bullet[] = [];
  private cannon!: PIXI.Container;
  
  // UI元素
  private coinDisplay!: PIXI.Text;
  private powerDisplay!: PIXI.Text;
  private waveDisplay!: PIXI.Text;
  
  // 游戏参数
  private currentWave: number = 1;
  private waveTimer: number = 0;
  private spawnTimer: number = 0;
  private autoFireTimer: number = 0;
  
  // 交互
  private mousePosition: PIXI.Point = new PIXI.Point();
  private isFiring: boolean = false;
  
  constructor(canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000814,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    
    this.cannon = new PIXI.Container();
    
    this.setupContainers();
    this.createBackground();
    this.createCannon();
    this.createUI();
    this.setupInteraction();
    this.startGameLoop();
  }
  
  private setupContainers() {
    this.gameContainer = new PIXI.Container();
    this.fishContainer = new PIXI.Container();
    this.bulletContainer = new PIXI.Container();
    this.effectContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();
    
    this.app.stage.addChild(this.gameContainer);
    this.gameContainer.addChild(this.fishContainer);
    this.gameContainer.addChild(this.bulletContainer);
    this.gameContainer.addChild(this.effectContainer);
    this.app.stage.addChild(this.cannon);
    this.app.stage.addChild(this.uiContainer);
  }
  
  private createBackground() {
    // 深海背景效果
    const bg = new PIXI.Graphics();
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // 深度渐变 - 更深邃的海洋效果
    const gradient = new PIXI.Graphics();
    for (let i = 0; i < 20; i++) {
      const y = (i / 20) * height;
      const t = i / 20;
      const color = this.interpolateColor(0x000814, 0x001a3d, t);
      gradient.beginFill(color);
      gradient.drawRect(0, y, width, height / 20);
      gradient.endFill();
    }
    
    this.gameContainer.addChildAt(gradient, 0);
    
    // 添加光线效果
    const lightRays = new PIXI.Graphics();
    lightRays.alpha = 0.1;
    
    for (let i = 0; i < 5; i++) {
      const startX = width * (i / 5) + Math.random() * 100;
      const startY = -100;
      const endX = startX + 200 + Math.random() * 100;
      const endY = height + 100;
      
      lightRays.beginFill(0x00ccff, 0.3);
      lightRays.moveTo(startX, startY);
      lightRays.lineTo(startX + 50, startY);
      lightRays.lineTo(endX + 50, endY);
      lightRays.lineTo(endX, endY);
      lightRays.closePath();
      lightRays.endFill();
    }
    
    lightRays.filters = [new PIXI.filters.BlurFilter(20)];
    this.gameContainer.addChild(lightRays);
    
    // 动态水波纹
    const waterEffect = new PIXI.Graphics();
    this.gameContainer.addChild(waterEffect);
    waterEffect.alpha = 0.2;
    
    // 添加气泡效果
    this.createBubbleEffect();
    
    let time = 0;
    this.app.ticker.add(() => {
      time += 0.02;
      waterEffect.clear();
      
      // 多层水波
      for (let layer = 0; layer < 3; layer++) {
        waterEffect.lineStyle(2, 0x0099ff, 0.3 - layer * 0.1);
        for (let i = 0; i < 8; i++) {
          const x = width * (i / 8);
          const y = height * (0.3 + layer * 0.1) + Math.sin(time + i + layer) * (30 - layer * 5);
          
          waterEffect.moveTo(x, y);
          waterEffect.bezierCurveTo(
            x + width / 16, y + 20 - layer * 5,
            x + width / 8, y - 20 + layer * 5,
            x + width / 8, y
          );
        }
      }
    });
  }
  
  private createBubbleEffect() {
    const bubbleContainer = new PIXI.Container();
    this.gameContainer.addChild(bubbleContainer);
    
    // 创建持续的气泡效果
    setInterval(() => {
      const bubble = new PIXI.Graphics();
      bubble.lineStyle(1, 0xffffff, 0.3);
      bubble.beginFill(0xffffff, 0.1);
      const size = 3 + Math.random() * 7;
      bubble.drawCircle(0, 0, size);
      bubble.endFill();
      
      bubble.x = Math.random() * this.app.screen.width;
      bubble.y = this.app.screen.height + 50;
      
      bubbleContainer.addChild(bubble);
      
      // 气泡上升动画
      const speed = 1 + Math.random() * 2;
      const wobble = Math.random() * 2 - 1;
      
      const update = () => {
        bubble.y -= speed;
        bubble.x += Math.sin(bubble.y * 0.01) * wobble;
        bubble.alpha -= 0.001;
        bubble.scale.set(bubble.scale.x * 1.001);
        
        if (bubble.y < -50 || bubble.alpha <= 0) {
          bubbleContainer.removeChild(bubble);
          PIXI.Ticker.shared.remove(update);
        }
      };
      
      PIXI.Ticker.shared.add(update);
    }, 200);
  }
  
  private createCannon() {
    // 现代化炮台设计
    const base = new PIXI.Graphics();
    
    // 外圈装饰
    base.beginFill(0x1a1a2e, 0.8);
    base.lineStyle(2, 0x0099ff, 0.5);
    base.drawCircle(0, 0, 50);
    base.endFill();
    
    // 中间层
    base.beginFill(0x16213e);
    base.drawCircle(0, 0, 40);
    base.endFill();
    
    // 核心
    base.beginFill(0x0f3460);
    base.drawCircle(0, 0, 30);
    base.endFill();
    
    // 能量核心
    const core = new PIXI.Graphics();
    core.beginFill(0x00d4ff, 0.8);
    core.drawCircle(0, 0, 15);
    core.endFill();
    core.filters = [new PIXI.filters.BlurFilter(5)];
    
    // 炮管 - 更科技感的设计
    const barrel = new PIXI.Graphics();
    
    // 主炮管
    barrel.beginFill(0x2c3e50);
    barrel.drawRect(-12, -60, 24, 60);
    barrel.endFill();
    
    // 炮管装饰
    barrel.lineStyle(2, 0x00d4ff, 0.8);
    barrel.moveTo(-12, -60);
    barrel.lineTo(-12, -10);
    barrel.moveTo(12, -60);
    barrel.lineTo(12, -10);
    
    // 炮口
    barrel.beginFill(0x00d4ff, 0.6);
    barrel.drawRect(-15, -65, 30, 8);
    barrel.endFill();
    
    // 能量指示器
    const powerIndicator = new PIXI.Graphics();
    this.updatePowerIndicator(powerIndicator);
    
    this.cannon.addChild(base);
    this.cannon.addChild(core);
    this.cannon.addChild(barrel);
    this.cannon.addChild(powerIndicator);
    
    this.cannon.position.set(this.app.screen.width / 2, this.app.screen.height - 80);
    
    // 炮台呼吸动画
    let breathTime = 0;
    this.app.ticker.add(() => {
      breathTime += 0.05;
      core.scale.set(1 + Math.sin(breathTime) * 0.1);
      core.alpha = 0.6 + Math.sin(breathTime * 2) * 0.2;
    });
  }
  
  private updatePowerIndicator(indicator: PIXI.Graphics) {
    indicator.clear();
    
    const power = this.gameConfig.cannonPower;
    const maxPower = 10;
    
    // 环形能量条
    const radius = 35;
    const angleStep = (Math.PI * 1.5) / maxPower;
    const startAngle = Math.PI * 0.75;
    
    for (let i = 0; i < power; i++) {
      const angle = startAngle + i * angleStep;
      const color = this.getPowerColor(power);
      
      indicator.beginFill(color, 0.8);
      const x1 = Math.cos(angle) * radius;
      const y1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + angleStep * 0.8) * radius;
      const y2 = Math.sin(angle + angleStep * 0.8) * radius;
      const x3 = Math.cos(angle + angleStep * 0.8) * (radius - 5);
      const y3 = Math.sin(angle + angleStep * 0.8) * (radius - 5);
      const x4 = Math.cos(angle) * (radius - 5);
      const y4 = Math.sin(angle) * (radius - 5);
      
      indicator.moveTo(x1, y1);
      indicator.lineTo(x2, y2);
      indicator.lineTo(x3, y3);
      indicator.lineTo(x4, y4);
      indicator.closePath();
      indicator.endFill();
    }
  }
  
  private createUI() {
    // 现代化UI设计
    const uiBackground = new PIXI.Graphics();
    uiBackground.beginFill(0x000000, 0.5);
    uiBackground.drawRoundedRect(10, 10, 300, 150, 15);
    uiBackground.endFill();
    uiBackground.filters = [new PIXI.filters.BlurFilter(2)];
    this.uiContainer.addChild(uiBackground);
    
    // 金币显示
    const coinStyle = new PIXI.TextStyle({
      fontFamily: 'Arial Black',
      fontSize: 36,
      fill: ['#ffd700', '#ffed4e'],
      stroke: '#000000',
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 8,
      dropShadowDistance: 3,
    });
    
    this.coinDisplay = new PIXI.Text(`💰 ${this.gameConfig.coins}`, coinStyle);
    this.coinDisplay.position.set(30, 25);
    this.uiContainer.addChild(this.coinDisplay);
    
    // 炮台威力
    const powerStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#00d4ff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    
    this.powerDisplay = new PIXI.Text(`⚡ 威力: ${this.gameConfig.cannonPower}/10`, powerStyle);
    this.powerDisplay.position.set(30, 75);
    this.uiContainer.addChild(this.powerDisplay);
    
    // 波次显示 - 更醒目的设计
    const waveBackground = new PIXI.Graphics();
    waveBackground.beginFill(0x000000, 0.7);
    waveBackground.lineStyle(3, 0x00ffff, 0.8);
    waveBackground.drawRoundedRect(-120, -25, 240, 50, 25);
    waveBackground.endFill();
    waveBackground.position.set(this.app.screen.width / 2, 40);
    this.uiContainer.addChild(waveBackground);
    
    const waveStyle = new PIXI.TextStyle({
      fontFamily: 'Arial Black',
      fontSize: 32,
      fill: ['#00ffff', '#0099ff'],
      stroke: '#000033',
      strokeThickness: 5,
      letterSpacing: 2
    });
    
    this.waveDisplay = new PIXI.Text(`WAVE ${this.currentWave}`, waveStyle);
    this.waveDisplay.anchor.set(0.5);
    this.waveDisplay.position.set(this.app.screen.width / 2, 40);
    this.uiContainer.addChild(this.waveDisplay);
    
    // 控制按钮
    this.createControlButtons();
  }
  
  private createControlButtons() {
    // 升级按钮
    const upgradeBtn = this.createModernButton('⬆️ 升级威力', 150, () => {
      const cost = this.gameConfig.cannonPower * 100;
      if (this.gameConfig.coins >= cost && this.gameConfig.cannonPower < 10) {
        this.gameConfig.coins -= cost;
        this.gameConfig.cannonPower++;
        this.updateUI();
        this.updatePowerIndicator(this.cannon.children[3] as PIXI.Graphics);
        this.showMessage(`炮台升级到 ${this.gameConfig.cannonPower} 级！`, 0x00ff00);
        this.createUpgradeEffect();
      }
    });
    upgradeBtn.position.set(30, 115);
    this.uiContainer.addChild(upgradeBtn);
    
    // 自动射击按钮
    const autoBtn = this.createModernButton('🎯 自动射击', 150, () => {
      this.gameConfig.autoFire = !this.gameConfig.autoFire;
      this.showMessage(this.gameConfig.autoFire ? '自动射击开启' : '自动射击关闭', 0xffff00);
      
      // 更新按钮状态
      const bg = autoBtn.children[0] as PIXI.Graphics;
      bg.tint = this.gameConfig.autoFire ? 0x00ff00 : 0xffffff;
    });
    autoBtn.position.set(200, 115);
    this.uiContainer.addChild(autoBtn);
  }
  
  private createModernButton(text: string, width: number, onClick: () => void): PIXI.Container {
    const button = new PIXI.Container();
    
    const bg = new PIXI.Graphics();
    bg.beginFill(0x2c3e50);
    bg.lineStyle(2, 0x00d4ff, 0.8);
    bg.drawRoundedRect(0, 0, width, 45, 10);
    bg.endFill();
    
    const label = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#ffffff',
      fontWeight: 'bold'
    });
    label.anchor.set(0.5);
    label.position.set(width / 2, 22.5);
    
    button.addChild(bg);
    button.addChild(label);
    
    button.interactive = true;
    button.cursor = 'pointer';
    
    // 悬停效果
    button.on('pointerover', () => {
      bg.tint = 0x3498db;
    });
    
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    button.on('pointerdown', () => {
      bg.tint = 0x2980b9;
      onClick();
    });
    
    button.on('pointerup', () => {
      bg.tint = 0x3498db;
    });
    
    return button;
  }
  
  private createUpgradeEffect() {
    // 升级特效
    const ring = new PIXI.Graphics();
    ring.lineStyle(4, 0x00ff00, 0.8);
    ring.drawCircle(0, 0, 50);
    ring.position.copyFrom(this.cannon.position);
    this.effectContainer.addChild(ring);
    
    let scale = 1;
    const expand = () => {
      scale += 0.1;
      ring.scale.set(scale);
      ring.alpha -= 0.05;
      
      if (ring.alpha <= 0) {
        this.effectContainer.removeChild(ring);
        PIXI.Ticker.shared.remove(expand);
      }
    };
    
    PIXI.Ticker.shared.add(expand);
  }
  
  private setupInteraction() {
    this.app.stage.interactive = true;
    
    // 鼠标跟踪
    this.app.stage.on('pointermove', (event) => {
      this.mousePosition = event.data.global;
      
      // 更新炮台角度
      const dx = this.mousePosition.x - this.cannon.x;
      const dy = this.mousePosition.y - this.cannon.y;
      this.cannon.rotation = Math.atan2(dy, dx) + Math.PI / 2;
    });
    
    // 射击
    this.app.stage.on('pointerdown', () => {
      this.isFiring = true;
      this.fire();
    });
    
    this.app.stage.on('pointerup', () => {
      this.isFiring = false;
    });
  }
  
  private fire() {
    if (this.gameConfig.coins < this.gameConfig.betAmount) {
      this.showMessage('金币不足！', 0xff0000);
      return;
    }
    
    // 扣除金币
    this.gameConfig.coins -= this.gameConfig.betAmount;
    this.updateUI();
    
    // 创建子弹
    const bullet = new Bullet(
      this.cannon.x,
      this.cannon.y - 60,
      this.mousePosition.x,
      this.mousePosition.y,
      this.gameConfig.cannonPower
    );
    
    this.bulletContainer.addChild(bullet);
    this.bullets.push(bullet);
    
    // 开炮特效
    this.createFireEffect();
  }
  
  private createFireEffect() {
    // 炮口闪光
    const muzzleFlash = new PIXI.Graphics();
    const flashColor = this.getPowerColor(this.gameConfig.cannonPower);
    
    // 多层闪光效果
    for (let i = 0; i < 3; i++) {
      const flash = new PIXI.Graphics();
      flash.beginFill(flashColor, 0.8 - i * 0.2);
      flash.drawCircle(0, 0, 15 + i * 10);
      flash.endFill();
      flash.position.set(
        this.cannon.x - Math.sin(this.cannon.rotation) * 65,
        this.cannon.y + Math.cos(this.cannon.rotation) * 65
      );
      flash.filters = [new PIXI.filters.BlurFilter(5 + i * 3)];
      
      this.effectContainer.addChild(flash);
      
      // 闪光动画
      let scale = 1;
      const animate = () => {
        scale += 0.3;
        flash.scale.set(scale);
        flash.alpha -= 0.15;
        
        if (flash.alpha <= 0) {
          this.effectContainer.removeChild(flash);
          PIXI.Ticker.shared.remove(animate);
        }
      };
      
      PIXI.Ticker.shared.add(animate);
    }
    
    // 后坐力动画
    const originalY = this.cannon.y;
    this.cannon.y += 10;
    const recoil = () => {
      this.cannon.y -= 2;
      if (this.cannon.y <= originalY) {
        this.cannon.y = originalY;
        PIXI.Ticker.shared.remove(recoil);
      }
    };
    PIXI.Ticker.shared.add(recoil);
  }
  
  private startGameLoop() {
    this.app.ticker.add((delta) => {
      // 更新计时器
      this.waveTimer += delta;
      this.spawnTimer += delta;
      this.autoFireTimer += delta;
      
      // 生成鱼
      this.spawnFish();
      
      // 更新子弹
      this.updateBullets(delta);
      
      // 更新鱼
      this.updateFish(delta);
      
      // 碰撞检测
      this.checkCollisions();
      
      // 自动射击
      if (this.gameConfig.autoFire && this.autoFireTimer > 30) {
        this.autoFireTimer = 0;
        if (this.fishes.length > 0) {
          // 瞄准最近的鱼
          let nearestFish = this.fishes[0];
          let minDistance = Infinity;
          
          for (const fish of this.fishes) {
            const dx = fish.x - this.cannon.x;
            const dy = fish.y - this.cannon.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
              minDistance = distance;
              nearestFish = fish;
            }
          }
          
          this.mousePosition.set(nearestFish.x, nearestFish.y);
          this.fire();
        }
      }
      
      // 波次管理
      if (this.waveTimer > 600) { // 10秒一波
        this.waveTimer = 0;
        this.currentWave++;
        this.waveDisplay.text = `WAVE ${this.currentWave}`;
        this.showWaveTransition();
      }
    });
  }
  
  private showWaveTransition() {
    // 波次转换特效
    const transition = new PIXI.Graphics();
    transition.beginFill(0x00ffff, 0.3);
    transition.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    transition.endFill();
    transition.alpha = 0;
    this.effectContainer.addChild(transition);
    
    // 文字提示
    const waveText = new PIXI.Text(`第 ${this.currentWave} 波来袭！`, {
      fontFamily: 'Arial Black',
      fontSize: 60,
      fill: ['#00ffff', '#ffffff'],
      stroke: '#000000',
      strokeThickness: 8,
      dropShadow: true,
      dropShadowBlur: 10,
      dropShadowDistance: 5
    });
    waveText.anchor.set(0.5);
    waveText.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    waveText.scale.set(0);
    this.effectContainer.addChild(waveText);
    
    // 动画
    let time = 0;
    const animate = () => {
      time += 0.05;
      
      if (time < 1) {
        transition.alpha = Math.sin(time * Math.PI) * 0.5;
        waveText.scale.set(time * 1.5);
        waveText.rotation = (1 - time) * 0.1;
      } else if (time < 2) {
        waveText.alpha = 2 - time;
        waveText.scale.set(1.5 + (time - 1) * 0.5);
      } else {
        this.effectContainer.removeChild(transition);
        this.effectContainer.removeChild(waveText);
        PIXI.Ticker.shared.remove(animate);
      }
    };
    
    PIXI.Ticker.shared.add(animate);
  }
  
  private spawnFish() {
    // 根据波次调整生成率
    const spawnRate = Math.max(30, 60 - this.currentWave * 3);
    
    if (this.spawnTimer > spawnRate) {
      this.spawnTimer = 0;
      
      // 选择鱼类型 - 根据波次调整概率
      const fishTypes = Object.keys(ULTIMATE_FISH_TYPES);
      let selectedType: string;
      
      const rand = Math.random();
      const waveModifier = Math.min(this.currentWave * 0.02, 0.3);
      
      if (this.currentWave > 10 && rand < 0.02 + waveModifier * 0.1) {
        selectedType = 'dragon_king';
      } else if (this.currentWave > 5 && rand < 0.1 + waveModifier) {
        selectedType = fishTypes.find(t => ULTIMATE_FISH_TYPES[t].rarity === 'epic') || 'golden_shark';
      } else if (rand < 0.25 + waveModifier) {
        const rareFish = fishTypes.filter(t => ULTIMATE_FISH_TYPES[t].rarity === 'rare');
        selectedType = rareFish[Math.floor(Math.random() * rareFish.length)] || 'ice_fish';
      } else {
        selectedType = 'mini_neon';
      }
      
      const config = ULTIMATE_FISH_TYPES[selectedType];
      
      // 随机生成位置
      const spawnY = 100 + Math.random() * (this.app.screen.height - 300);
      
      // 使用新的Web3鱼类系统
      const fish = new Web3UltimateFish(
        config,
        this.app.screen.width + 100,
        spawnY
      );
      
      // 监听事件
      fish.on('specialEffect', (data) => this.handleSpecialEffect(data));
      fish.on('scored', (data) => this.handleScore(data));
      fish.on('death', (data) => this.handleFishDeath(data));
      
      this.fishContainer.addChild(fish);
      this.fishes.push(fish);
      
      // 生成特效
      this.createSpawnEffect(fish.position);
    }
  }
  
  private createSpawnEffect(position: PIXI.Point) {
    // 水花效果
    const ripple = new PIXI.Graphics();
    ripple.lineStyle(2, 0x00ccff, 0.6);
    ripple.drawCircle(0, 0, 30);
    ripple.position.copyFrom(position);
    this.effectContainer.addChild(ripple);
    
    let scale = 1;
    const expand = () => {
      scale += 0.1;
      ripple.scale.set(scale);
      ripple.alpha -= 0.03;
      
      if (ripple.alpha <= 0) {
        this.effectContainer.removeChild(ripple);
        PIXI.Ticker.shared.remove(expand);
      }
    };
    
    PIXI.Ticker.shared.add(expand);
  }
  
  private updateBullets(delta: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(delta);
      
      // 移除超出屏幕的子弹
      if (bullet.x < -50 || bullet.x > this.app.screen.width + 50 ||
          bullet.y < -50 || bullet.y > this.app.screen.height + 50) {
        this.bulletContainer.removeChild(bullet);
        this.bullets.splice(i, 1);
      }
    }
  }
  
  private updateFish(delta: number) {
    for (let i = this.fishes.length - 1; i >= 0; i--) {
      const fish = this.fishes[i];
      fish.update(delta);
      
      // 移除离开屏幕的鱼
      if (fish.x < -300) {
        this.fishContainer.removeChild(fish);
        this.fishes.splice(i, 1);
      }
    }
  }
  
  private checkCollisions() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      for (let j = this.fishes.length - 1; j >= 0; j--) {
        const fish = this.fishes[j];
        
        // 改进的碰撞检测 - 基于鱼的大小
        const dx = bullet.x - fish.x;
        const dy = bullet.y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const hitRadius = 40 * fish.config.size;
        
        if (distance < hitRadius) {
          // 击中！
          bullet.explode();
          this.bulletContainer.removeChild(bullet);
          this.bullets.splice(i, 1);
          
          // 创建击中特效
          this.createHitEffect(bullet.position, bullet.damage);
          
          // 鱼受伤
          const isDead = fish.takeDamage(bullet.damage);
          
          if (isDead) {
            this.fishContainer.removeChild(fish);
            this.fishes.splice(j, 1);
          }
          
          break;
        }
      }
    }
  }
  
  private createHitEffect(position: PIXI.Point, damage: number) {
    // 冲击波效果
    const shockwave = new PIXI.Graphics();
    shockwave.lineStyle(3, 0xffffff, 0.8);
    shockwave.drawCircle(0, 0, 20);
    shockwave.position.copyFrom(position);
    this.effectContainer.addChild(shockwave);
    
    let scale = 1;
    const expand = () => {
      scale += 0.2;
      shockwave.scale.set(scale);
      shockwave.alpha -= 0.1;
      
      if (shockwave.alpha <= 0) {
        this.effectContainer.removeChild(shockwave);
        PIXI.Ticker.shared.remove(expand);
      }
    };
    
    PIXI.Ticker.shared.add(expand);
  }
  
  private handleSpecialEffect(data: any) {
    switch (data.type) {
      case 'freeze':
        this.createFreezeFieldEffect(data);
        break;
        
      case 'bomb':
        this.createExplosion(data.position, data.radius);
        break;
        
      case 'lightning':
        this.createLightningChain(data.position);
        break;
        
      case 'blackhole':
        this.createBlackholeEffect(data);
        break;
    }
  }
  
  private createFreezeFieldEffect(data: any) {
    // 全屏冰冻效果
    const freezeOverlay = new PIXI.Graphics();
    freezeOverlay.beginFill(0x00ccff, 0.2);
    freezeOverlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    freezeOverlay.endFill();
    this.effectContainer.addChild(freezeOverlay);
    
    // 冰冻所有鱼
    this.fishes.forEach(fish => {
      if (fish.velocity) {
        const originalSpeed = fish.velocity.x;
        fish.velocity.x *= 0.2;
        
        // 添加冰冻视觉效果
        const iceOverlay = new PIXI.Graphics();
        iceOverlay.beginFill(0x00ccff, 0.3);
        iceOverlay.drawRect(-50, -50, 100, 100);
        iceOverlay.endFill();
        fish.addChild(iceOverlay);
        
        setTimeout(() => {
          fish.velocity.x = originalSpeed;
          fish.removeChild(iceOverlay);
        }, data.duration || 3000);
      }
    });
    
    // 淡出效果
    const fadeOut = () => {
      freezeOverlay.alpha -= 0.01;
      if (freezeOverlay.alpha <= 0) {
        this.effectContainer.removeChild(freezeOverlay);
        PIXI.Ticker.shared.remove(fadeOut);
      }
    };
    
    setTimeout(() => {
      PIXI.Ticker.shared.add(fadeOut);
    }, data.duration - 500 || 2500);
    
    this.showMessage('❄️ 冰冻领域！', 0x00ccff);
  }
  
  private createExplosion(position: PIXI.Point, radius: number) {
    // 主爆炸
    const explosion = new PIXI.Graphics();
    explosion.beginFill(0xff6600, 0.8);
    explosion.drawCircle(0, 0, radius);
    explosion.endFill();
    explosion.position.copyFrom(position);
    explosion.filters = [new PIXI.filters.BlurFilter(15)];
    
    this.effectContainer.addChild(explosion);
    
    // 火焰粒子
    for (let i = 0; i < 20; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(Math.random() > 0.5 ? 0xff6600 : 0xffcc00);
      particle.drawCircle(0, 0, 5 + Math.random() * 10);
      particle.endFill();
      particle.position.copyFrom(position);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 10;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.effectContainer.addChild(particle);
      
      const update = () => {
        particle.x += vx;
        particle.y += vy;
        particle.alpha -= 0.03;
        particle.scale.set(particle.scale.x * 0.95);
        
        if (particle.alpha <= 0) {
          this.effectContainer.removeChild(particle);
          PIXI.Ticker.shared.remove(update);
        }
      };
      
      PIXI.Ticker.shared.add(update);
    }
    
    // 爆炸动画
    let scale = 0;
    const animate = () => {
      scale += 0.15;
      explosion.scale.set(scale);
      explosion.alpha -= 0.05;
      
      if (explosion.alpha <= 0) {
        this.effectContainer.removeChild(explosion);
        PIXI.Ticker.shared.remove(animate);
      }
    };
    
    PIXI.Ticker.shared.add(animate);
    
    // 范围伤害
    this.fishes.forEach(fish => {
      const dx = fish.x - position.x;
      const dy = fish.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < radius) {
        const damage = Math.floor(10 * (1 - distance / radius));
        fish.takeDamage(damage);
        
        // 击退效果
        const force = (1 - distance / radius) * 10;
        const angle = Math.atan2(dy, dx);
        fish.x += Math.cos(angle) * force;
        fish.y += Math.sin(angle) * force;
      }
    });
    
    this.showMessage('💣 爆炸！', 0xff6600);
  }
  
  private createLightningChain(startPos: PIXI.Point) {
    const chainedFish: Web3UltimateFish[] = [];
    let currentPos = startPos;
    const maxChains = 5;
    
    // 创建连锁闪电
    for (let chain = 0; chain < maxChains; chain++) {
      let nearestFish: Web3UltimateFish | null = null;
      let nearestDistance = 250; // 最大连锁距离
      
      // 找到最近的未被击中的鱼
      for (const fish of this.fishes) {
        if (chainedFish.includes(fish)) continue;
        
        const dx = fish.x - currentPos.x;
        const dy = fish.y - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < nearestDistance) {
          nearestFish = fish;
          nearestDistance = distance;
        }
      }
      
      if (nearestFish) {
        // 绘制闪电
        this.drawLightningBolt(currentPos, nearestFish.position);
        
        // 造成伤害
        nearestFish.takeDamage(15 - chain * 2);
        chainedFish.push(nearestFish);
        currentPos = nearestFish.position.clone();
      } else {
        break;
      }
    }
    
    this.showMessage(`⚡ 连锁闪电 x${chainedFish.length}！`, 0xffff00);
  }
  
  private drawLightningBolt(from: PIXI.Point, to: PIXI.Point) {
    const lightning = new PIXI.Graphics();
    lightning.lineStyle(3, 0xffff00, 1);
    
    // 创建锯齿状闪电路径
    const segments = 8;
    const points: PIXI.Point[] = [from];
    
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * 30;
      const y = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * 30;
      points.push(new PIXI.Point(x, y));
    }
    points.push(to);
    
    // 绘制路径
    lightning.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      lightning.lineTo(points[i].x, points[i].y);
    }
    
    // 添加外发光
    lightning.filters = [new PIXI.filters.BlurFilter(3)];
    this.effectContainer.addChild(lightning);
    
    // 闪烁效果
    let flashes = 3;
    const flash = () => {
      lightning.visible = !lightning.visible;
      flashes--;
      
      if (flashes <= 0) {
        this.effectContainer.removeChild(lightning);
        PIXI.Ticker.shared.remove(flash);
      }
    };
    
    PIXI.Ticker.shared.add(flash);
  }
  
  private createBlackholeEffect(data: any) {
    // 黑洞中心
    const blackhole = new PIXI.Graphics();
    blackhole.beginFill(0x000000, 0.8);
    blackhole.drawCircle(0, 0, 50);
    blackhole.endFill();
    blackhole.position.copyFrom(data.position);
    this.effectContainer.addChild(blackhole);
    
    // 事件视界
    const eventHorizon = new PIXI.Graphics();
    eventHorizon.lineStyle(3, 0x9933ff, 0.6);
    eventHorizon.drawCircle(0, 0, data.radius);
    eventHorizon.position.copyFrom(data.position);
    eventHorizon.filters = [new PIXI.filters.BlurFilter(5)];
    this.effectContainer.addChild(eventHorizon);
    
    // 扭曲效果
    const distortionRings: PIXI.Graphics[] = [];
    for (let i = 0; i < 5; i++) {
      const ring = new PIXI.Graphics();
      ring.lineStyle(2, 0x9933ff, 0.5 - i * 0.1);
      ring.drawCircle(0, 0, 100 + i * 30);
      ring.position.copyFrom(data.position);
      distortionRings.push(ring);
      this.effectContainer.addChild(ring);
    }
    
    // 吸引效果
    const pullDuration = data.duration || 2000;
    const startTime = Date.now();
    
    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / pullDuration;
      
      if (progress >= 1) {
        // 清理效果
        this.effectContainer.removeChild(blackhole);
        this.effectContainer.removeChild(eventHorizon);
        distortionRings.forEach(ring => this.effectContainer.removeChild(ring));
        PIXI.Ticker.shared.remove(update);
        return;
      }
      
      // 旋转黑洞
      blackhole.rotation += 0.1;
      eventHorizon.rotation -= 0.05;
      
      // 动画扭曲环
      distortionRings.forEach((ring, index) => {
        ring.rotation += 0.02 * (index + 1);
        ring.scale.set(1 + Math.sin(elapsed * 0.001 + index) * 0.1);
      });
      
      // 吸引附近的鱼
      this.fishes.forEach(fish => {
        const dx = data.position.x - fish.x;
        const dy = data.position.y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < data.radius && distance > 50) {
          const pullForce = (data.pullForce || 5) * (1 - distance / data.radius);
          const angle = Math.atan2(dy, dx);
          
          fish.x += Math.cos(angle) * pullForce;
          fish.y += Math.sin(angle) * pullForce;
          
          // 如果太近则造成伤害
          if (distance < 80) {
            fish.takeDamage(1);
          }
        }
      });
    };
    
    PIXI.Ticker.shared.add(update);
    this.showMessage('🌀 引力奇点！', 0x9933ff);
  }
  
  private handleScore(data: any) {
    this.gameConfig.coins += data.amount;
    this.updateUI();
    
    // 根据奖励大小显示不同效果
    if (data.amount >= 500) {
      this.showMegaWin(data.amount);
    } else if (data.amount >= 100) {
      this.showBigWin(data.amount);
    }
    
    // 稀有度奖励
    if (data.rarity === 'mythic') {
      this.showMythicBonus();
    }
  }
  
  private handleFishDeath(data: any) {
    // 处理鱼死亡的额外效果
    if (data.fishId === 'dragon_king') {
      this.showDragonKingDefeat();
    }
  }
  
  private showBigWin(amount: number) {
    const bigWin = new PIXI.Text(`大奖！+${amount} 💰`, {
      fontFamily: 'Arial Black',
      fontSize: 48,
      fill: ['#ffff00', '#ff6600'],
      stroke: '#000000',
      strokeThickness: 6,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 8,
      dropShadowDistance: 4,
    });
    
    bigWin.anchor.set(0.5);
    bigWin.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    this.uiContainer.addChild(bigWin);
    
    // 动画
    bigWin.scale.set(0);
    let time = 0;
    const animate = () => {
      time += 0.05;
      
      if (time < 1) {
        bigWin.scale.set(time * 1.5);
        bigWin.rotation = (1 - time) * 0.2;
      } else if (time > 2) {
        bigWin.alpha = 3 - time;
        
        if (time >= 3) {
          this.uiContainer.removeChild(bigWin);
          PIXI.Ticker.shared.remove(animate);
        }
      }
    };
    
    PIXI.Ticker.shared.add(animate);
  }
  
  private showMegaWin(amount: number) {
    // 全屏特效
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0xffd700, 0.3);
    overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.endFill();
    overlay.alpha = 0;
    this.effectContainer.addChild(overlay);
    
    // 巨额奖励文字
    const megaWin = new PIXI.Text(`超级大奖！\n+${amount} 💰`, {
      fontFamily: 'Arial Black',
      fontSize: 72,
      fill: ['#ffd700', '#ffffff', '#ffd700'],
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center',
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 15,
      dropShadowDistance: 5,
    });
    
    megaWin.anchor.set(0.5);
    megaWin.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    megaWin.scale.set(0);
    this.uiContainer.addChild(megaWin);
    
    // 金币雨效果
    this.createCoinRain();
    
    // 动画
    let time = 0;
    const animate = () => {
      time += 0.03;
      
      if (time < 1) {
        overlay.alpha = Math.sin(time * Math.PI) * 0.5;
        megaWin.scale.set(time * 2);
        megaWin.rotation = Math.sin(time * 10) * 0.05;
      } else if (time > 3) {
        overlay.alpha = (4 - time) * 0.5;
        megaWin.alpha = 4 - time;
        
        if (time >= 4) {
          this.effectContainer.removeChild(overlay);
          this.uiContainer.removeChild(megaWin);
          PIXI.Ticker.shared.remove(animate);
        }
      }
    };
    
    PIXI.Ticker.shared.add(animate);
  }
  
  private createCoinRain() {
    const coinCount = 30;
    
    for (let i = 0; i < coinCount; i++) {
      setTimeout(() => {
        const coin = new PIXI.Text('💰', {
          fontSize: 24 + Math.random() * 24
        });
        
        coin.position.set(
          Math.random() * this.app.screen.width,
          -50
        );
        
        this.effectContainer.addChild(coin);
        
        const speed = 3 + Math.random() * 3;
        const rotation = (Math.random() - 0.5) * 0.1;
        
        const update = () => {
          coin.y += speed;
          coin.rotation += rotation;
          
          if (coin.y > this.app.screen.height + 50) {
            this.effectContainer.removeChild(coin);
            PIXI.Ticker.shared.remove(update);
          }
        };
        
        PIXI.Ticker.shared.add(update);
      }, i * 100);
    }
  }
  
  private showMythicBonus() {
    // 神话级奖励特效
    const bonus = new PIXI.Text('神话捕获！\n稀有度奖励 x10', {
      fontFamily: 'Arial Black',
      fontSize: 36,
      fill: ['#e056fd', '#8e44ad', '#3498db'],
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    
    bonus.anchor.set(0.5);
    bonus.position.set(this.app.screen.width / 2, this.app.screen.height / 3);
    this.uiContainer.addChild(bonus);
    
    // 彩虹动画
    let hue = 0;
    const animate = () => {
      hue += 2;
      const color = this.hslToHex(hue % 360, 70, 50);
      bonus.tint = color;
      bonus.scale.set(1 + Math.sin(Date.now() * 0.005) * 0.1);
      
      if (hue > 360) {
        bonus.alpha -= 0.02;
        if (bonus.alpha <= 0) {
          this.uiContainer.removeChild(bonus);
          PIXI.Ticker.shared.remove(animate);
        }
      }
    };
    
    PIXI.Ticker.shared.add(animate);
  }
  
  private showDragonKingDefeat() {
    // 龙王击败特效
    const message = new PIXI.Text('🐉 龙王已被击败！🐉', {
      fontFamily: 'Arial Black',
      fontSize: 48,
      fill: ['#ffd700', '#ff6600'],
      stroke: '#000000',
      strokeThickness: 8
    });
    
    message.anchor.set(0.5);
    message.position.set(this.app.screen.width / 2, 100);
    this.uiContainer.addChild(message);
    
    // 震动效果
    const originalX = message.x;
    let shakeTime = 0;
    const shake = () => {
      shakeTime += 0.1;
      message.x = originalX + Math.sin(shakeTime * 20) * (20 - shakeTime);
      
      if (shakeTime > 20) {
        message.x = originalX;
        PIXI.Ticker.shared.remove(shake);
        
        // 淡出
        const fadeOut = () => {
          message.alpha -= 0.01;
          if (message.alpha <= 0) {
            this.uiContainer.removeChild(message);
            PIXI.Ticker.shared.remove(fadeOut);
          }
        };
        PIXI.Ticker.shared.add(fadeOut);
      }
    };
    
    PIXI.Ticker.shared.add(shake);
  }
  
  private updateUI() {
    this.coinDisplay.text = `💰 ${this.gameConfig.coins}`;
    this.powerDisplay.text = `⚡ 威力: ${this.gameConfig.cannonPower}/10`;
  }
  
  private showMessage(text: string, color: number) {
    const message = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: color,
      stroke: '#000000',
      strokeThickness: 4,
      dropShadow: true,
      dropShadowBlur: 4,
      dropShadowDistance: 2
    });
    
    message.anchor.set(0.5);
    message.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 100);
    this.uiContainer.addChild(message);
    
    // 上升消失动画
    let offsetY = 0;
    const animate = () => {
      offsetY -= 2;
      message.y = this.app.screen.height / 2 - 100 + offsetY;
      message.alpha -= 0.015;
      message.scale.set(message.scale.x * 1.005);
      
      if (message.alpha <= 0) {
        this.uiContainer.removeChild(message);
        PIXI.Ticker.shared.remove(animate);
      }
    };
    
    PIXI.Ticker.shared.add(animate);
  }
  
  private getPowerColor(power: number): number {
    if (power < 3) return 0x00ffff;
    if (power < 5) return 0x00ff00;
    if (power < 7) return 0xffff00;
    if (power < 9) return 0xff6600;
    return 0xff0000;
  }
  
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
    this.app.destroy(true);
  }
}
