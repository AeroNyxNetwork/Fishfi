/**
 * NFTFishGallery.tsx
 * 
 * React component for the NFT Fish Gallery
 * Integrates the PIXI.js v8 engine with React
 * 
 * @version 1.0.0
 * @path app/components/NFTFishGallery.tsx
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { NFTGalleryEngine } from '../lib/NFTGalleryEngine';

export default function NFTFishGallery() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NFTGalleryEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initEngine = async () => {
      try {
        // Create engine instance
        const engine = new NFTGalleryEngine(canvasRef.current!);
        engineRef.current = engine;

        // Initialize
        await engine.init();
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize NFT Gallery:', err);
        setError('Failed to initialize the gallery. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initEngine();

    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-6xl animate-pulse">🐟</div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Initializing NFT Fish Gallery...
            </h2>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"
                   style={{ 
                     width: '100%',
                     animation: 'pulse 1.5s ease-in-out infinite'
                   }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center p-8 bg-red-900/20 rounded-lg border border-red-500">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-white mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* Instructions overlay */}
      {!isLoading && !error && (
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-6 
                        border border-purple-500/30 max-w-sm pointer-events-none">
          <h3 className="text-purple-400 font-bold text-lg mb-3">
            🎨 NFT Fish Gallery
          </h3>
          
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-purple-400">✨</span>
              <span>Click "Generate Artistic Fish" to create unique NFT-worthy fish</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400">🖱️</span>
              <span>Click on any fish to view its details</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400">🖼️</span>
              <span>Open the gallery to see your collection</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-purple-500/30">
            <h4 className="text-purple-400 font-semibold mb-2">Rarity Tiers:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white"></span>
                <span className="text-gray-400">Common (50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-green-400">Uncommon (30%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-blue-400">Rare (13%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-purple-400">Epic (5%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-yellow-400">Legendary (1.5%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                <span className="text-pink-400">Mythic (0.4%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
                <span className="text-white font-bold">Cosmic (0.1%)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-purple-500/30">
            <h4 className="text-purple-400 font-semibold mb-2">Special Features:</h4>
            <div className="space-y-1 text-xs text-gray-400">
              <div>• Unique patterns & color mutations</div>
              <div>• Special traits & visual effects</div>
              <div>• Particle effects for rare fish</div>
              <div>• Each fish has unique DNA</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance stats (debug mode) */}
      {process.env.NODE_ENV === 'development' && !isLoading && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded p-2 
                        text-xs font-mono text-green-400 pointer-events-none">
          <div>PIXI v8 Engine</div>
          <div>FPS: 60</div>
        </div>
      )}
    </div>
  );
}
