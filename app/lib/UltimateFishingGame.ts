import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { PremiumPixelFish } from './PremiumPixelFish';

// 真正的游戏配置
export interface GameConfig {
  cannonPower: number;      // 1-10 炮台威力
  coins: number;            // 金币数量
  betAmount: number;        // 每发子弹消耗
  autoFire: boolean;        // 自动射击
}

// 增强的鱼配置
export interface UltimateFishConfig {
  id: string;
  name: string;
  baseReward: number;       // 基础奖励
  health: number;           // 生命值
  speed: number;            // 速度
  size: number;             // 大小倍数
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  specialEffect?: 'freeze' | 'bomb' | 'lightning' | 'blackhole';
}

// 终极鱼类定义
export const ULTIMATE_FISH_TYPES: Record<string, UltimateFishConfig> = {
  // 小鱼 - 容易打但奖励少
  'mini_neon': {
    id: 'mini_neon',
    name: '迷你霓虹',
    baseReward: 2,
    health: 1,
    speed: 4,
    size: 0.5,
    rarity: 'common'
  },
  
  // 特效鱼 - 打中有特殊效果
  'ice_fish': {
    id: 'ice_fish',
    name: '冰冻鱼',
    baseReward: 20,
    health: 5,
    speed: 2,
    size: 1,
    rarity: 'rare',
    specialEffect: 'freeze'
  },
  
  'bomb_fish': {
    id: 'bomb_fish',
    name: '爆炸鱼',
    baseReward: 30,
    health: 8,
    speed: 3,
    size: 1.2,
    rarity: 'rare',
    specialEffect: 'bomb'
  },
  
  // 高价值目标
  'golden_shark': {
    id: 'golden_shark',
    name: '黄金鲨',
    baseReward: 100,
    health: 20,
    speed: 2.5,
    size: 2,
    rarity: 'epic'
  },
  
  // 超级BOSS
  'dragon_king': {
    id: 'dragon_king',
    name: '龙王',
    baseReward: 888,
    health: 100,
    speed: 1,
    size: 4,
    rarity: 'mythic',
    specialEffect: 'lightning'
  }
};

// 子弹类
export class Bullet extends PIXI.Container {
  public damage: number;
  public velocity: PIXI.Point;
  private sprite!: PIXI.Graphics;
  private trail: PIXI.Graphics[] = [];
  
  constructor(x: number, y: number, targetX: number, targetY: number, power: number) {
    super();
    
    this.damage = power;
    this.position.set(x, y);
    
    // 计算速度向量
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.velocity = new PIXI.Point(dx / distance * 10, dy / distance * 10);
    
    // 创建子弹视觉效果
    this.createBulletVisual(power);
    
    // 开始动画
    this.startAnimation();
  }
  
  private createBulletVisual(power: number) {
    this.sprite = new PIXI.Graphics();
    
    // 根据威力调整大小和颜色
    const size = 3 + power * 0.5;
    const color = this.getPowerColor(power);
    
    // 绘制能量球
    this.sprite.beginFill(color);
    this.sprite.drawCircle(0, 0, size);
    this.sprite.endFill();
    
    // 添加发光效果
    const glowFilter = new GlowFilter({
      distance: 10 + power,
      outerStrength: 2,
      innerStrength: 1,
      color: color,
      quality: 0.5,
    });
    this.sprite.filters = [glowFilter];
    
    this.addChild(this.sprite);
  }
  
  private getPowerColor(power: number): number {
    if (power < 3) return 0x00ffff;      // 青色
    if (power < 5) return 0x00ff00;      // 绿色
    if (power < 7) return 0xffff00;      // 黄色
    if (power < 9) return 0xff6600;      // 橙色
    return 0xff0000;                     // 红色
  }
  
  private startAnimation() {
    // 创建拖尾效果
    for (let i = 0; i < 5; i++) {
      const trail = new PIXI.Graphics();
      trail.beginFill(this.getPowerColor(this.damage), 0.5 - i * 0.1);
      trail.drawCircle(0, 0, (3 + this.damage * 0.5) * (1 - i * 0.15));
      trail.endFill();
      this.trail.push(trail);
      this.addChildAt(trail, 0);
    }
  }
  
  public update(delta: number) {
    // 更新位置
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
    
    // 更新拖尾
    for (let i = this.trail.length - 1; i >= 0; i--) {
      if (i === 0) {
        this.trail[i].position.set(0, 0);
      } else {
        const prev = this.trail[i - 1];
        this.trail[i].x = prev.x * 0.8;
        this.trail[i].y = prev.y * 0.8;
      }
    }
    
    // 旋转效果
    this.sprite.rotation += 0.1 * delta;
  }
  
  public explode() {
    // 击中特效
    const explosion = new PIXI.Graphics();
    explosion.beginFill(this.getPowerColor(this.damage));
    explosion.drawCircle(0, 0, 20);
    explosion.endFill();
    explosion.alpha = 0.8;
    
    this.parent?.addChild(explosion);
    explosion.position.copyFrom(this.position);
    
    // 爆炸动画
    let scale = 1;
    const animate = () => {
      scale += 0.1;
      explosion.scale.set(scale);
      explosion.alpha -= 0.05;
      
      if (explosion.alpha <= 0) {
        explosion.parent?.removeChild(explosion);
      } else {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }
}

// 终极鱼精灵
export class UltimateFish extends PIXI.Container {
  public config: UltimateFishConfig;
  public currentHealth: number;
  private bodyContainer!: PIXI.Container;
  private effectContainer!: PIXI.Container;
  private healthBar!: PIXI.Graphics;
  private rewardText!: PIXI.Text;
  
  // 运动参数
  public velocity: PIXI.Point;
  private targetY: number;
  private waveAmplitude: number;
  private waveFrequency: number;
  private time: number = 0;
  
  constructor(config: UltimateFishConfig, startX: number, startY: number) {
    super();
    
    this.config = config;
    this.currentHealth = config.health;
    this.position.set(startX, startY);
    this.targetY = startY;
    
    // 随机运动参数
    this.velocity = new PIXI.Point(-config.speed, 0);
    this.waveAmplitude = 20 + Math.random() * 30;
    this.waveFrequency = 0.02 + Math.random() * 0.02;
    
    // 创建视觉组件
    this.createVisuals();
    
    // 根据稀有度添加特效
    this.addRarityEffects();
  }
  
  private createVisuals() {
    this.bodyContainer = new PIXI.Container();
    this.effectContainer = new PIXI.Container();
    
    this.addChild(this.effectContainer);
    this.addChild(this.bodyContainer);
    
    // 使用高级像素鱼设计系统
    const fishTypeMap: Record<string, keyof typeof PremiumPixelFish['FISH_DESIGNS']> = {
      'mini_neon': 'neonTetra',
      'goldfish': 'goldfish',
      'ice_fish': 'angelfish',
      'bomb_fish': 'pufferfish',
      'golden_shark': 'shark',
      'dragon_king': 'dragonKing',
      'electric_eel': 'electricEel',
      'clownfish': 'clownfish'
    };
    
    const designType = fishTypeMap[this.config.id] || 'goldfish';
    const premiumFish = PremiumPixelFish.createPremiumFish(designType as any, this.config.size);
    this.bodyContainer.addChild(premiumFish);
    
    // 存储动画引用
    (this as any).premiumFishSprite = premiumFish;
    
    // 创建血条（只有高级鱼显示）
    if (this.config.health > 5) {
      this.createHealthBar();
    }
    
    // 创建奖励显示
    this.createRewardDisplay();
  }
  
  private createHealthBar() {
    this.healthBar = new PIXI.Graphics();
    this.updateHealthBar();
    this.healthBar.position.y = -30 * this.config.size;
    this.addChild(this.healthBar);
  }
  
  private updateHealthBar() {
    if (!this.healthBar) return;
    
    this.healthBar.clear();
    
    const width = 40 * this.config.size;
    const height = 4;
    const healthPercent = this.currentHealth / this.config.health;
    
    // 背景
    this.healthBar.beginFill(0x000000, 0.5);
    this.healthBar.drawRect(-width/2, -height/2, width, height);
    this.healthBar.endFill();
    
    // 血条
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBar.beginFill(healthColor);
    this.healthBar.drawRect(-width/2, -height/2, width * healthPercent, height);
    this.healthBar.endFill();
  }
  
  private createRewardDisplay() {
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial Black',
      fontSize: 12 * this.config.size,
      fontWeight: 'bold',
      fill: this.config.rarity === 'mythic' ? ['#ffff00', '#ff6600'] : ['#ffffff', '#ffcc00'],
      stroke: '#000000',
      strokeThickness: 3,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowDistance: 2,
    });
    
    this.rewardText = new PIXI.Text(`${this.config.baseReward}`, style);
    this.rewardText.anchor.set(0.5);
    this.rewardText.position.y = 20 * this.config.size;
    this.addChild(this.rewardText);
  }
  
  private addRarityEffects() {
    // 稀有鱼的特殊效果
    if (this.config.rarity === 'epic' || this.config.rarity === 'legendary') {
      this.createSparkleEffect();
    }
    
    if (this.config.rarity === 'mythic') {
      this.createAuraEffect();
    }
    
    // 特殊效果鱼的视觉提示
    if (this.config.specialEffect) {
      this.createSpecialEffectIndicator();
    }
  }
  
  private createSparkleEffect() {
    setInterval(() => {
      const sparkle = new PIXI.Graphics();
      sparkle.beginFill(0xffffff);
      sparkle.drawRect(0, 0, 2, 2);
      sparkle.endFill();
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 20;
      sparkle.x = Math.cos(angle) * distance * this.config.size;
      sparkle.y = Math.sin(angle) * distance * this.config.size;
      
      this.effectContainer.addChild(sparkle);
      
      // 闪烁动画
      let life = 1;
      const update = () => {
        life -= 0.02;
        sparkle.alpha = life;
        sparkle.scale.set(life * 2);
        
        if (life <= 0) {
          this.effectContainer.removeChild(sparkle);
        } else {
          requestAnimationFrame(update);
        }
      };
      update();
    }, 200);
  }
  
  private createAuraEffect() {
    const aura = new PIXI.Graphics();
    this.effectContainer.addChildAt(aura, 0);
    
    // 动态光环
    let time = 0;
    const update = () => {
      time += 0.05;
      aura.clear();
      
      const radius = (40 + Math.sin(time) * 10) * this.config.size;
      const alpha = 0.3 + Math.sin(time * 2) * 0.1;
      
      // 多层光环
      for (let i = 3; i > 0; i--) {
        aura.beginFill(0xffcc00, alpha / i);
        aura.drawCircle(0, 0, radius * (0.6 + i * 0.2));
        aura.endFill();
      }
      
      requestAnimationFrame(update);
    };
    update();
  }
  
  private createSpecialEffectIndicator() {
    const icons: Record<string, string> = {
      freeze: '❄️',
      bomb: '💣',
      lightning: '⚡',
      blackhole: '🌀'
    };
    
    const icon = icons[this.config.specialEffect!] || '✨';
    
    const text = new PIXI.Text(icon, {
      fontSize: 16 * this.config.size,
    });
    text.anchor.set(0.5);
    text.position.y = -20 * this.config.size;
    this.addChild(text);
    
    // 图标动画
    let time = 0;
    const update = () => {
      time += 0.1;
      text.scale.set(1 + Math.sin(time) * 0.1);
      text.rotation = Math.sin(time * 0.5) * 0.1;
      requestAnimationFrame(update);
    };
    update();
  }
  
  public update(delta: number) {
    this.time += delta * 0.05;
    
    // 横向移动
    this.x += this.velocity.x * delta;
    
    // 波浪游动
    this.y = this.targetY + Math.sin(this.time * this.waveFrequency) * this.waveAmplitude;
    
    // 更新高级像素鱼动画
    const premiumSprite = (this as any).premiumFishSprite;
    if (premiumSprite) {
      PremiumPixelFish.animateFish(premiumSprite, this.time);
    }
    
    // 特殊鱼的额外动画
    if (this.config.rarity === 'mythic') {
      // 彩虹色变
      const hue = (this.time * 2) % 360;
      if (this.bodyContainer.children[0]) {
        this.bodyContainer.children[0].tint = this.hslToHex(hue, 70, 50);
      }
    }
  }
  
  public takeDamage(damage: number): boolean {
    this.currentHealth -= damage;
    
    // 更新血条
    this.updateHealthBar();
    
    // 受击效果
    this.flash();
    
    // 显示伤害数字
    this.showDamage(damage);
    
    // 检查是否死亡
    if (this.currentHealth <= 0) {
      this.die();
      return true;
    }
    
    return false;
  }
  
  private flash() {
    const originalTint = this.bodyContainer.children[0].tint;
    this.bodyContainer.children[0].tint = 0xffffff;
    
    setTimeout(() => {
      this.bodyContainer.children[0].tint = originalTint;
    }, 100);
  }
  
  private showDamage(damage: number) {
    const text = new PIXI.Text(`-${damage}`, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xff0000,
      fontWeight: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
    });
    text.anchor.set(0.5);
    this.addChild(text);
    
    // 飘动动画
    let offsetY = 0;
    const animate = () => {
      offsetY -= 1;
      text.y = offsetY;
      text.alpha -= 0.02;
      
      if (text.alpha <= 0) {
        this.removeChild(text);
      } else {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }
  
  private die() {
    // 死亡特效
    this.createDeathEffect();
    
    // 触发特殊效果
    if (this.config.specialEffect) {
      this.triggerSpecialEffect();
    }
    
    // 显示奖励
    this.showReward();
  }
  
  private createDeathEffect() {
    // 爆炸粒子
    for (let i = 0; i < 20; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(0xffcc00);
      particle.drawCircle(0, 0, 3);
      particle.endFill();
      
      particle.position.copyFrom(this.position);
      this.parent.addChild(particle);
      
      const angle = (i / 20) * Math.PI * 2;
      const speed = 3 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const animate = () => {
        particle.x += vx;
        particle.y += vy;
        particle.alpha -= 0.02;
        
        if (particle.alpha <= 0) {
          particle.parent?.removeChild(particle);
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }
  
  private triggerSpecialEffect() {
    // 根据特殊效果类型触发不同效果
    const effectData = {
      type: this.config.specialEffect!,
      position: this.position.clone(),
      power: this.config.size
    };
    
    // 发送特效事件（实际游戏中处理）
    this.emit('specialEffect', effectData);
  }
  
  private showReward() {
    const coin = new PIXI.Text(`+${this.config.baseReward} 💰`, {
      fontFamily: 'Arial Black',
      fontSize: 24,
      fill: ['#ffff00', '#ff6600'],
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    coin.anchor.set(0.5);
    coin.position.copyFrom(this.position);
    this.parent.addChild(coin);
    
    // 上升动画
    let offsetY = 0;
    const animate = () => {
      offsetY -= 2;
      coin.y = this.position.y + offsetY;
      coin.alpha -= 0.01;
      coin.scale.set(coin.scale.x * 1.01);
      
      if (coin.alpha <= 0) {
        coin.parent?.removeChild(coin);
      } else {
        requestAnimationFrame(animate);
      }
    };
    animate();
    
    // 发送得分事件
    this.emit('scored', this.config.baseReward);
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
}
