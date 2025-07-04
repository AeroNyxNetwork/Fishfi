import * as PIXI from 'pixi.js';
import { UltimateFish, Bullet, ULTIMATE_FISH_TYPES, GameConfig } from './UltimateFishingGame';

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
  private fishes: UltimateFish[] = [];
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
    // 动态海洋背景
    const bg = new PIXI.Graphics();
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // 深度渐变
    for (let i = 0; i < 10; i++) {
      const y = (i / 10) * height;
      const color = this.interpolateColor(0x000814, 0x003366, i / 10);
      bg.beginFill(color);
      bg.drawRect(0, y, width, height / 10);
      bg.endFill();
    }
    
    this.gameContainer.addChildAt(bg, 0);
    
    // 动态水波纹
    const waterEffect = new PIXI.Graphics();
    this.gameContainer.addChild(waterEffect);
    waterEffect.alpha = 0.3;
    
    let time = 0;
    this.app.ticker.add(() => {
      time += 0.02;
      waterEffect.clear();
      
      for (let i = 0; i < 5; i++) {
        const x = width * (i / 5);
        const y = height * 0.5 + Math.sin(time + i) * 50;
        
        waterEffect.lineStyle(2, 0x0099ff, 0.5);
        waterEffect.moveTo(x, y);
        waterEffect.bezierCurveTo(
          x + width / 10, y + 20,
          x + width / 5, y - 20,
          x + width / 5, y
        );
      }
    });
  }
  
  private createCannon() {
    // 炮台底座
    const base = new PIXI.Graphics();
    base.beginFill(0x444444);
    base.drawCircle(0, 0, 40);
    base.endFill();
    base.beginFill(0x666666);
    base.drawCircle(0, 0, 30);
    base.endFill();
    
    // 炮管
    const barrel = new PIXI.Graphics();
    barrel.beginFill(0x888888);
    barrel.drawRect(-10, -50, 20, 50);
    barrel.endFill();
    barrel.beginFill(0xaaaaaa);
    barrel.drawRect(-6, -50, 12, 40);
    barrel.endFill();
    
    // 能量指示器
    const powerIndicator = new PIXI.Graphics();
    this.updatePowerIndicator(powerIndicator);
    
    this.cannon.addChild(base);
    this.cannon.addChild(barrel);
    this.cannon.addChild(powerIndicator);
    
    this.cannon.position.set(this.app.screen.width / 2, this.app.screen.height - 80);
  }
  
  private updatePowerIndicator(indicator: PIXI.Graphics) {
    indicator.clear();
    
    const power = this.gameConfig.cannonPower;
    const maxPower = 10;
    
    // 能量条
    for (let i = 0; i < power; i++) {
      const color = this.getPowerColor(power);
      indicator.beginFill(color, 0.8);
      indicator.drawRect(-20 + i * 4, -70, 3, 10);
      indicator.endFill();
    }
  }
  
  private createUI() {
    // 金币显示
    const coinStyle = new PIXI.TextStyle({
      fontFamily: 'Arial Black',
      fontSize: 32,
      fill: ['#ffcc00', '#ff9900'],
      stroke: '#000000',
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowDistance: 2,
    });
    
    this.coinDisplay = new PIXI.Text(`💰 ${this.gameConfig.coins}`, coinStyle);
    this.coinDisplay.position.set(20, 20);
    this.uiContainer.addChild(this.coinDisplay);
    
    // 炮台威力
    const powerStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    
    this.powerDisplay = new PIXI.Text(`炮台威力: ${this.gameConfig.cannonPower}`, powerStyle);
    this.powerDisplay.position.set(20, 70);
    this.uiContainer.addChild(this.powerDisplay);
    
    // 波次显示
    const waveStyle = new PIXI.TextStyle({
      fontFamily: 'Arial Black',
      fontSize: 36,
      fill: ['#00ffff', '#0099ff'],
      stroke: '#000033',
      strokeThickness: 5,
    });
    
    this.waveDisplay = new PIXI.Text(`Wave ${this.currentWave}`, waveStyle);
    this.waveDisplay.anchor.set(0.5, 0);
    this.waveDisplay.position.set(this.app.screen.width / 2, 20);
    this.uiContainer.addChild(this.waveDisplay);
    
    // 控制按钮
    this.createControlButtons();
  }
  
  private createControlButtons() {
    // 升级炮台按钮
    const upgradeBtn = this.createButton('⬆️ 升级威力', 100, () => {
      const cost = this.gameConfig.cannonPower * 100;
      if (this.gameConfig.coins >= cost && this.gameConfig.cannonPower < 10) {
        this.gameConfig.coins -= cost;
        this.gameConfig.cannonPower++;
        this.updateUI();
        this.updatePowerIndicator(this.cannon.children[2] as PIXI.Graphics);
        this.showMessage(`炮台升级到 ${this.gameConfig.cannonPower} 级！`, 0x00ff00);
      }
    });
    upgradeBtn.position.set(20, this.app.screen.height - 120);
    this.uiContainer.addChild(upgradeBtn);
    
    // 自动射击按钮
    const autoBtn = this.createButton('🎯 自动射击', 100, () => {
      this.gameConfig.autoFire = !this.gameConfig.autoFire;
      this.showMessage(this.gameConfig.autoFire ? '自动射击开启' : '自动射击关闭', 0xffff00);
    });
    autoBtn.position.set(20, this.app.screen.height - 60);
    this.uiContainer.addChild(autoBtn);
  }
  
  private createButton(text: string, width: number, onClick: () => void): PIXI.Container {
    const button = new PIXI.Container();
    
    const bg = new PIXI.Graphics();
    bg.beginFill(0x333333);
    bg.drawRoundedRect(0, 0, width, 40, 5);
    bg.endFill();
    
    const label = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: '#ffffff',
    });
    label.anchor.set(0.5);
    label.position.set(width / 2, 20);
    
    button.addChild(bg);
    button.addChild(label);
    
    button.interactive = true;
    button.cursor = 'pointer'; // 使用 cursor 替代 buttonMode
    
    button.on('pointerdown', () => {
      bg.tint = 0x666666;
      onClick();
    });
    
    button.on('pointerup', () => {
      bg.tint = 0xffffff;
    });
    
    return button;
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
      this.cannon.y - 50,
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
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffff00, 0.8);
    flash.drawCircle(0, -50, 20);
    flash.endFill();
    
    this.cannon.addChild(flash);
    
    // 闪光动画
    let scale = 1;
    const animate = () => {
      scale += 0.2;
      flash.scale.set(scale);
      flash.alpha -= 0.1;
      
      if (flash.alpha <= 0) {
        this.cannon.removeChild(flash);
      } else {
        requestAnimationFrame(animate);
      }
    };
    animate();
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
          const target = this.fishes[Math.floor(Math.random() * this.fishes.length)];
          this.mousePosition.set(target.x, target.y);
          this.fire();
        }
      }
      
      // 波次管理
      if (this.waveTimer > 600) { // 10秒一波
        this.waveTimer = 0;
        this.currentWave++;
        this.waveDisplay.text = `Wave ${this.currentWave}`;
        this.showMessage(`第 ${this.currentWave} 波来袭！`, 0x00ffff);
      }
    });
  }
  
  private spawnFish() {
    // 根据波次调整生成率
    const spawnRate = 60 - Math.min(this.currentWave * 2, 40);
    
    if (this.spawnTimer > spawnRate) {
      this.spawnTimer = 0;
      
      // 选择鱼类型
      const fishTypes = Object.keys(ULTIMATE_FISH_TYPES);
      let selectedType: string;
      
      // 根据波次调整稀有度
      const rand = Math.random();
      if (this.currentWave > 10 && rand < 0.05) {
        selectedType = 'dragon_king';
      } else if (this.currentWave > 5 && rand < 0.15) {
        selectedType = fishTypes.find(t => ULTIMATE_FISH_TYPES[t].rarity === 'epic') || 'golden_shark';
      } else if (rand < 0.3) {
        selectedType = fishTypes.find(t => ULTIMATE_FISH_TYPES[t].rarity === 'rare') || 'ice_fish';
      } else {
        selectedType = 'mini_neon';
      }
      
      const config = ULTIMATE_FISH_TYPES[selectedType];
      const fish = new UltimateFish(
        config,
        this.app.screen.width + 100,
        100 + Math.random() * (this.app.screen.height - 200)
      );
      
      // 监听特效和得分事件
      fish.on('specialEffect', (data) => this.handleSpecialEffect(data));
      fish.on('scored', (score) => this.handleScore(score));
      
      this.fishContainer.addChild(fish);
      this.fishes.push(fish);
    }
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
      if (fish.x < -200) {
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
        
        // 简单的圆形碰撞检测
        const dx = bullet.x - fish.x;
        const dy = bullet.y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30 * fish.config.size) {
          // 击中！
          bullet.explode();
          this.bulletContainer.removeChild(bullet);
          this.bullets.splice(i, 1);
          
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
  
  private handleSpecialEffect(data: any) {
    switch (data.type) {
      case 'freeze':
        // 冰冻效果 - 减速所有鱼
        this.fishes.forEach(fish => {
          fish.velocity.x *= 0.3;
          fish.tint = 0x00ccff;
          setTimeout(() => {
            fish.velocity.x *= 3.33;
            fish.tint = 0xffffff;
          }, 3000);
        });
        this.showMessage('冰冻效果！', 0x00ccff);
        break;
        
      case 'bomb':
        // 爆炸效果 - 范围伤害
        this.createExplosion(data.position, data.power * 100);
        break;
        
      case 'lightning':
        // 闪电链
        this.createLightningChain(data.position);
        break;
    }
  }
  
  private createExplosion(position: PIXI.Point, radius: number) {
    const explosion = new PIXI.Graphics();
    explosion.beginFill(0xff6600, 0.8);
    explosion.drawCircle(0, 0, radius);
    explosion.endFill();
    explosion.position.copyFrom(position);
    
    this.effectContainer.addChild(explosion);
    
    // 爆炸动画
    let scale = 0;
    const animate = () => {
      scale += 0.1;
      explosion.scale.set(scale);
      explosion.alpha -= 0.05;
      
      if (explosion.alpha <= 0) {
        this.effectContainer.removeChild(explosion);
      } else {
        requestAnimationFrame(animate);
      }
    };
    animate();
    
    // 范围伤害
    this.fishes.forEach(fish => {
      const dx = fish.x - position.x;
      const dy = fish.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < radius) {
        fish.takeDamage(5);
      }
    });
  }
  
  private createLightningChain(startPos: PIXI.Point) {
    const lightning = new PIXI.Graphics();
    lightning.lineStyle(3, 0xffff00, 1);
    
    // 找到最近的鱼
    let currentPos = startPos;
    const hitFishes: UltimateFish[] = [];
    
    for (let i = 0; i < 5; i++) {
      let nearestFish: UltimateFish | null = null;
      let nearestDistance = Infinity;
      
      this.fishes.forEach(fish => {
        if (hitFishes.includes(fish)) return;
        
        const dx = fish.x - currentPos.x;
        const dy = fish.y - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < nearestDistance && distance < 200) {
          nearestFish = fish;
          nearestDistance = distance;
        }
      });
      
      if (nearestFish) {
        // 绘制闪电
        lightning.moveTo(currentPos.x, currentPos.y);
        lightning.lineTo(nearestFish.x, nearestFish.y);
        
        nearestFish.takeDamage(10);
        hitFishes.push(nearestFish);
        currentPos = new PIXI.Point(nearestFish.x, nearestFish.y);
      } else {
        break;
      }
    }
    
    this.effectContainer.addChild(lightning);
    
    // 闪电消失动画
    setTimeout(() => {
      this.effectContainer.removeChild(lightning);
    }, 200);
  }
  
  private handleScore(score: number) {
    this.gameConfig.coins += score;
    this.updateUI();
    
    // 大奖提示
    if (score >= 100) {
      this.showBigWin(score);
    }
  }
  
  private showBigWin(amount: number) {
    const bigWin = new PIXI.Text(`大奖！+${amount} 💰`, {
      fontFamily: 'Arial Black',
      fontSize: 60,
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
    let scale = 0;
    const animate = () => {
      scale += 0.05;
      bigWin.scale.set(scale);
      
      if (scale >= 1.5) {
        setTimeout(() => {
          let alpha = 1;
          const fadeOut = () => {
            alpha -= 0.02;
            bigWin.alpha = alpha;
            
            if (alpha <= 0) {
              this.uiContainer.removeChild(bigWin);
            } else {
              requestAnimationFrame(fadeOut);
            }
          };
          fadeOut();
        }, 1000);
      } else {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }
  
  private updateUI() {
    this.coinDisplay.text = `💰 ${this.gameConfig.coins}`;
    this.powerDisplay.text = `炮台威力: ${this.gameConfig.cannonPower}`;
  }
  
  private showMessage(text: string, color: number) {
    const message = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: color,
      stroke: '#000000',
      strokeThickness: 3,
    });
    
    message.anchor.set(0.5);
    message.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 100);
    this.uiContainer.addChild(message);
    
    // 上升消失动画
    let offsetY = 0;
    const animate = () => {
      offsetY -= 1;
      message.y = this.app.screen.height / 2 - 100 + offsetY;
      message.alpha -= 0.01;
      
      if (message.alpha <= 0) {
        this.uiContainer.removeChild(message);
      } else {
        requestAnimationFrame(animate);
      }
    };
    animate();
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
  
  public destroy() {
    this.app.destroy(true);
  }
}
