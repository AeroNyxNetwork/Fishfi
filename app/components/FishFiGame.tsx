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
}">剑鱼</span>
                  <span className="text-orange-400">40x</span>
                </div>
              </div>
            </div>
            
            {/* BOSS鱼 */}
            <div className="border-b border-gray-700 pb-2">
              <div className="text-gray-400 font-bold mb-1">[ BOSS ]</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-500">电子鲸</span>
                  <span className="text-red-400">100x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pink-500">霓虹海妖</span>
                  <span className="text-red-400">150x</span>
                </div>
              </div>
            </div>
            
            {/* 传说鱼 */}
            <div>
              <div className="text-gray-400 font-bold mb-1">[ 传说 ]</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-400 animate-pulse">黄金龙</span>
                  <span className="text-yellow-400 font-bold">500x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 animate-pulse">
                    凤凰鱼
                  </span>
                  <span className="text-yellow-400 font-bold">1000x</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
            <div>💡 高倍率鱼出现概率极低</div>
            <div>⚡ BOSS鱼需要持续攻击</div>
          </div>
        </div>
        
        {/* 底部控制提示 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-r from-cyan-900/80 to-blue-900/80 backdrop-blur-sm rounded-full 
                          px-8 py-3 border border-cyan-500/50 shadow-lg shadow-cyan-500/20">
            <div className="text-center">
              <div className="text-cyan-300 text-sm font-medium">🎮 街机捕鱼模式 🎮</div>
              <div className="text-gray-300 text-xs mt-1">鱼群自动生成 • 波次不断升级</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}圆润体型，渐变色，正弦游动</div>
            <div><span className="text-blue-400">鲨鱼:</span> 流线型，大背鳍，滑翔游动</div>
            <div><span className="text-orange-400">河豚:</span> 球形，爆发游动，斑点图案</div>
            <div><span className="text-purple-400">神仙鱼:</span> 三角形，长鳍，Z字游动</div>
            <div><span className="text-green-400">霓虹鱼:</span> 小巧发光，快速游动</div>
            <div><span className="text-teal-400">鳗鱼:</span> 细长蛇形，波浪游动</div>
            <div><span className="text-pink-400">海马:</span> S形身体，直立游动</div>
            <div><span className="text-yellow-600">比目鱼:</span> 扁平椭圆，贴底滑行</div>
            <div><span className="text-indigo-400">剑鱼:</span> 长吻流线，冲刺游动</div>
            <div><span className="text-red-400">小丑鱼:</span> 橙白条纹，活泼游动</div>
          </div>
          
          <h3 className="text-cyan-400 font-bold mt-4 mb-2">交互提示</h3>
          <div className="text-xs text-gray-300">
            • 点击画面创建涟漪和气泡<br/>
            • 每种鱼都有独特的形状算法<br/>
            • 观察不同的游泳风格
          </div>
        </div>
      </div>
    </div>
  );
}
