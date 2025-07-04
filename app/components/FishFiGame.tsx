'use client';

import { useEffect, useRef } from 'react';
import { FishingGameEngine } from '../lib/FishingGameEngine';

export default function FishFiGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<FishingGameEngine | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // 初始化游戏引擎
    const game = new FishingGameEngine(canvasRef.current);
    gameRef.current = game;
    
    // 清理
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, []);
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 游戏画布 */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* 游戏说明叠加层 */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 
                      border border-cyan-500/30 max-w-xs pointer-events-none">
        <h3 className="text-cyan-400 font-bold mb-2">🎮 操作说明</h3>
        <div className="text-xs space-y-1 text-gray-300">
          <div>🖱️ 移动鼠标瞄准</div>
          <div>👆 点击发射子弹</div>
          <div>💰 击中鱼获得金币</div>
          <div>⬆️ 升级炮台威力</div>
          <div>🎯 开启自动射击</div>
        </div>
        
        <h3 className="text-cyan-400 font-bold mt-3 mb-2">🐟 特殊鱼效果</h3>
        <div className="text-xs space-y-1 text-gray-300">
          <div>❄️ 冰冻鱼 - 减速全场</div>
          <div>💣 爆炸鱼 - 范围伤害</div>
          <div>⚡ 闪电鱼 - 连锁攻击</div>
          <div>👑 龙王 - 超级大奖</div>
        </div>
      </div>
    </div>
  );
}
