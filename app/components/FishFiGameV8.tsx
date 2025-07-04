'use client';

import { useEffect, useRef } from 'react';
import { FishingGameEngineV8 } from '../lib/FishingGameEngineV8';

export default function FishFiGameV8() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<FishingGameEngineV8 | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize PIXI v8 game engine
    const game = new FishingGameEngineV8(canvasRef.current);
    gameRef.current = game;
    
    // Start the game
    game.init().catch(console.error);
    
    // Handle resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, []);
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Game canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Game instructions overlay */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 
                      border border-cyan-500/30 max-w-xs pointer-events-none">
        <h3 className="text-cyan-400 font-bold mb-2">🎮 PIXI v8 Enhanced</h3>
        <div className="text-xs space-y-1 text-gray-300">
          <div>🌊 Dynamic water effects</div>
          <div>🖱️ Move mouse to aim</div>
          <div>👆 Click to shoot</div>
          <div>💰 Hit fish for coins</div>
          <div>⬆️ Upgrade your cannon</div>
        </div>
        
        <h3 className="text-cyan-400 font-bold mt-3 mb-2">🐟 Fish Rarity</h3>
        <div className="text-xs space-y-1 text-gray-300">
          <div className="text-white">⚪ Common - 10 💰</div>
          <div className="text-blue-400">🔵 Rare - 50 💰</div>
          <div className="text-purple-400">🟣 Epic - 200 💰</div>
          <div className="text-yellow-400">🟡 Legendary - 500 💰</div>
          <div className="text-pink-400">🩷 Mythic - 1000 💰</div>
        </div>
      </div>
    </div>
  );
}
