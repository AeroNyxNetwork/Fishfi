'use client';

import { useEffect, useRef, useState } from 'react';
import { FishRenderer } from '../lib/FishRenderer';
import { PixelFishSprite, FishConfig } from '../lib/PixelFishSprite';
import { WaterEffects } from '../lib/WaterEffects';
import * as PIXI from 'pixi.js';

export default function FishFiGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<FishRenderer | null>(null);
  const waterEffectsRef = useRef<WaterEffects | null>(null);
  const fishSpritesRef = useRef<PixelFishSprite[]>([]);
  
  const [stats, setStats] = useState({
    fishCount: 0,
    fps: 0,
    particles: 0
  });
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // 初始化渲染器
    const renderer = new FishRenderer(canvasRef.current);
    rendererRef.current = renderer;
    
    // 初始化水体效果
    const waterEffects = new WaterEffects(renderer.app);
    waterEffectsRef.current = waterEffects;
    
    // 创建初始鱼群
    const createInitialFish = () => {
      const fishTypes: FishConfig[] = [
        { type: 'goldfish', size: 1, speed: 2, rarity: 'common' },
        { type: 'goldfish', size: 1.2, speed: 1.8, rarity: 'rare' },
        { type: 'shark', size: 2, speed: 3, rarity: 'epic' },
        { type: 'angelfish', size: 1.5, speed: 1.5, rarity: 'rare' },
        { type: 'electric', size: 1.3, speed: 2.5, rarity: 'legendary' }
      ];
      
      // 创建10条初始鱼
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          const config = fishTypes[Math.floor(Math.random() * fishTypes.length)];
          createFish(config);
        }, i * 200);
      }
    };
    
    createInitialFish();
    
    // 启动环境效果
    startEnvironmentEffects();
    
    // 性能监控
    startPerformanceMonitor();
    
    // 清理
    return () => {
      renderer.destroy();
      // 复制当前的鱼数组引用
      const currentFishSprites = fishSpritesRef.current;
      currentFishSprites.forEach(fish => fish.destroy());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const createFish = (config: FishConfig) => {
    if (!rendererRef.current) return;
    
    const fish = new PixelFishSprite(config);
    fish.position.set(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight
    );
    
    rendererRef.current.app.stage.addChild(fish);
    fishSpritesRef.current.push(fish);
    
    // 添加鱼的AI行为
    setupFishAI(fish);
    
    // 创建入场效果
    createSpawnEffect(fish.x, fish.y, config.rarity);
    
    updateStats();
  };
  
  const setupFishAI = (fish: PixelFishSprite) => {
    // 简单的游动AI
    const changeDirection = () => {
      const speed = 1 + Math.random() * 2;
      const angle = Math.random() * Math.PI * 2;
      
      fish.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed * 0.3
      );
      
      // 随机改变方向
      setTimeout(changeDirection, 3000 + Math.random() * 5000);
    };
    
    changeDirection();
    
    // 边界检测
    const checkBounds = () => {
      if (fish.x < -100) fish.x = window.innerWidth + 100;
      if (fish.x > window.innerWidth + 100) fish.x = -100;
      if (fish.y < -100) fish.y = window.innerHeight + 100;
      if (fish.y > window.innerHeight + 100) fish.y = -100;
      
      requestAnimationFrame(checkBounds);
    };
    
    checkBounds();
  };
  
  const createSpawnEffect = (x: number, y: number, rarity: string) => {
    if (!waterEffectsRef.current) return;
    
    // 根据稀有度创建不同强度的效果
    const intensity = {
      common: 0.5,
      rare: 1,
      epic: 1.5,
      legendary: 2
    }[rarity] || 1;
    
    // 涟漪效果
    waterEffectsRef.current.createRipple(x, y, intensity);
    
    // 水花效果
    waterEffectsRef.current.createSplash(x, y, intensity);
    
    // 气泡效果
    if (rarity === 'epic' || rarity === 'legendary') {
      waterEffectsRef.current.createBubbleStream(x, y, 2000);
    }
  };
  
  const startEnvironmentEffects = () => {
    if (!rendererRef.current || !waterEffectsRef.current) return;
    
    // 创建浮游生物
    rendererRef.current.createPlankton();
    
    // 定期产生气泡
    setInterval(() => {
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight - 50;
      rendererRef.current?.createBubble(x, y);
    }, 500);
    
    // 随机水花效果
    setInterval(() => {
      if (Math.random() < 0.3) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * 200;
        waterEffectsRef.current?.createRipple(x, y, 0.5);
      }
    }, 2000);
  };
  
  const startPerformanceMonitor = () => {
    let lastTime = performance.now();
    let frames = 0;
    
    const monitor = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setStats({
          fishCount: fishSpritesRef.current.length,
          fps: Math.round(frames * 1000 / (currentTime - lastTime)),
          particles: rendererRef.current?.app.stage.children.length || 0
        });
        
        lastTime = currentTime;
        frames = 0;
      }
      
      requestAnimationFrame(monitor);
    };
    
    monitor();
  };
  
  const updateStats = () => {
    setStats(prev => ({
      ...prev,
      fishCount: fishSpritesRef.current.length
    }));
  };
  
  const handleAddFish = () => {
    const rarities: Array<'common' | 'rare' | 'epic' | 'legendary'> = 
      ['common', 'common', 'common', 'rare', 'rare', 'epic', 'legendary'];
    
    const config: FishConfig = {
      type: ['goldfish', 'shark', 'angelfish', 'electric'][Math.floor(Math.random() * 4)],
      size: 0.8 + Math.random() * 0.4,
      speed: 1 + Math.random() * 2,
      rarity: rarities[Math.floor(Math.random() * rarities.length)]
    };
    
    createFish(config);
  };
  
  const handleCreateRipple = () => {
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
    waterEffectsRef.current?.createRipple(x, y, 1.5);
    waterEffectsRef.current?.createSplash(x, y, 1);
  };
  
  const handleFeedFish = () => {
    // 在随机位置创建食物效果
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const x = window.innerWidth / 2 + (Math.random() - 0.5) * 300;
        const y = 100 + Math.random() * 200;
        
        // 创建食物粒子
        if (rendererRef.current) {
          const food = new PIXI.Graphics();
          food.beginFill(0xffaa00);
          food.drawCircle(0, 0, 3);
          food.endFill();
          food.position.set(x, y);
          
          rendererRef.current.app.stage.addChild(food);
          
          // 下沉动画
          let vy = 0.5;
          const sink = () => {
            food.y += vy;
            vy += 0.05;
            
            // 检查是否被鱼吃掉
            const eaten = fishSpritesRef.current.some(fish => {
              const dist = Math.sqrt((fish.x - food.x) ** 2 + (fish.y - food.y) ** 2);
              if (dist < 50) {
                fish.flash(0xffff00);
                waterEffectsRef.current?.createRipple(food.x, food.y, 0.3);
                return true;
              }
              return false;
            });
            
            if (eaten || food.y > window.innerHeight) {
              rendererRef.current?.app.stage.removeChild(food);
            } else {
              requestAnimationFrame(sink);
            }
          };
          
          sink();
        }
      }, i * 100);
    }
  };
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 游戏画布 */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* UI 叠加层 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 顶部状态栏 */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              FishFi - 像素鱼元宇宙
            </h1>
            <div className="flex justify-center gap-8 text-sm">
              <div className="text-cyan-400">
                鱼群数量: <span className="text-white font-mono">{stats.fishCount}</span>
              </div>
              <div className="text-green-400">
                FPS: <span className="text-white font-mono">{stats.fps}</span>
              </div>
              <div className="text-purple-400">
                粒子数: <span className="text-white font-mono">{stats.particles}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 控制按钮 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex justify-center gap-4 max-w-2xl mx-auto">
            <button 
              onClick={handleAddFish}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg 
                         shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105
                         active:scale-95"
            >
              生成新鱼
            </button>
            
            <button 
              onClick={handleCreateRipple}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg 
                         shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105
                         active:scale-95"
            >
              创建涟漪
            </button>
            
            <button 
              onClick={handleFeedFish}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg 
                         shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105
                         active:scale-95"
            >
              投喂食物
            </button>
          </div>
        </div>
        
        {/* 稀有度说明 */}
        <div className="absolute bottom-20 left-4 bg-black/50 backdrop-blur-md rounded-lg p-3 pointer-events-auto">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
              <span className="text-gray-300">普通</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
              <span className="text-gray-300">稀有</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
              <span className="text-gray-300">史诗</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 animate-pulse"></div>
              <span className="text-gray-300">传说</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
