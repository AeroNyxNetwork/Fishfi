'use client';

import { useEffect, useRef, useState } from 'react';
import { OptimizedRenderer } from '../lib/OptimizedRenderer';
import { ProceduralPixelFish } from '../lib/ProceduralPixelFish';

export default function FishFiGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<OptimizedRenderer | null>(null);
  
  const [stats, setStats] = useState({
    fishCount: 0,
    fps: 0,
  });
  
  const [selectedFishType, setSelectedFishType] = useState('random');
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // 初始化优化的渲染器
    const renderer = new OptimizedRenderer(canvasRef.current);
    rendererRef.current = renderer;
    
    // 创建初始鱼群，展示不同特征
    const fishTypes = ['goldfish', 'shark', 'pufferfish', 'angelfish', 'neon'];
    fishTypes.forEach((type, index) => {
      setTimeout(() => {
        renderer.createSpecialFish(type);
      }, index * 200);
    });
    
    // 再添加一些随机鱼
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        renderer.createSpecialFish('random');
      }, (fishTypes.length + i) * 200);
    }
    
    // 性能监控
    let frames = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setStats({
          fishCount: renderer.getFishCount(),
          fps: Math.round(frames * 1000 / (currentTime - lastTime))
        });
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
    
    // 自动添加气泡
    const bubbleInterval = setInterval(() => {
      if (Math.random() < 0.5) {
        renderer.createBubble(
          Math.random() * window.innerWidth,
          window.innerHeight - 50
        );
      }
    }, 1000);
    
    // 清理
    return () => {
      clearInterval(bubbleInterval);
      if (rendererRef.current) {
        rendererRef.current.destroy();
      }
    };
  }, []);
  
  const handleAddFish = () => {
    if (rendererRef.current) {
      rendererRef.current.createSpecialFish(selectedFishType);
      
      // 创建涟漪效果
      rendererRef.current.createRipple(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (rendererRef.current) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      rendererRef.current.createRipple(x, y);
      rendererRef.current.createBubble(x, y);
    }
  };
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 游戏画布 */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleClick}
      />
      
      {/* UI 叠加层 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 顶部状态栏 */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              FishFi - 程序化像素鱼系统
            </h1>
            <div className="flex justify-center gap-8 text-sm">
              <div className="text-cyan-400">
                鱼群数量: <span className="text-white font-mono">{stats.fishCount}</span>
              </div>
              <div className="text-green-400">
                FPS: <span className="text-white font-mono">{stats.fps}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 控制面板 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 max-w-4xl mx-auto">
            {/* 鱼类型选择 */}
            <div className="flex justify-center gap-3 mb-4">
              {['random', 'goldfish', 'shark', 'pufferfish', 'angelfish', 'neon'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedFishType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    selectedFishType === type
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            
            {/* 生成按钮 */}
            <div className="flex justify-center">
              <button 
                onClick={handleAddFish}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg 
                           shadow-lg hover:shadow-emerald-500/50 transition-all transform hover:scale-105
                           active:scale-95"
              >
                生成{selectedFishType === 'random' ? '随机' : selectedFishType}鱼
              </button>
            </div>
          </div>
        </div>
        
        {/* 特征说明 */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-lg p-4 pointer-events-auto max-w-xs">
          <h3 className="text-cyan-400 font-bold mb-2">鱼类特征</h3>
          <div className="text-xs space-y-2 text-gray-300">
            <div><span className="text-yellow-400">金鱼:</span> 圆润体型，渐变色，正弦游动</div>
            <div><span className="text-blue-400">鲨鱼:</span> 流线型，滑翔游动，大尾鳍</div>
            <div><span className="text-orange-400">河豚:</span> 球形，爆发游动，斑点图案</div>
            <div><span className="text-purple-400">神仙鱼:</span> 高身形，条纹，Z字游动</div>
            <div><span className="text-green-400">霓虹鱼:</span> 小巧，发光，快速游动</div>
          </div>
          
          <h3 className="text-cyan-400 font-bold mt-4 mb-2">交互提示</h3>
          <div className="text-xs text-gray-300">
            点击画面创建涟漪和气泡效果
          </div>
        </div>
      </div>
    </div>
  );
}
