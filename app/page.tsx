/**
 * page.tsx
 * 
 * Main page component that loads the NFT Fish Gallery
 * Uses dynamic import to avoid SSR issues with PIXI.js
 * 
 * @version 1.0.0
 * @path app/page.tsx
 */

import dynamic from 'next/dynamic';

// Dynamic import with custom loading component
const NFTFishGallery = dynamic(() => import('./components/NFTFishGallery'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 via-blue-900 to-black">
      <div className="text-center">
        <div className="relative">
          {/* Animated fish icon */}
          <div className="text-8xl mb-8 animate-bounce">🐟</div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 blur-3xl opacity-50">
            <div className="text-8xl">🐟</div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
          NFT Fish Gallery
        </h1>
        
        <p className="text-white/60 text-lg mb-8">
          Generating artistic pixel fish...
        </p>
        
        {/* Loading bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
               style={{
                 animation: 'loading 1.5s ease-in-out infinite',
               }}
          />
        </div>
        
        <style jsx>{`
          @keyframes loading {
            0% { width: 0%; opacity: 0; }
            50% { width: 100%; opacity: 1; }
            100% { width: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  )
});

export default function Home() {
  return (
    <>
      <NFTFishGallery />
      
      {/* Global styles for pixel art */}
      <style jsx global>{`
        /* Pixel-perfect rendering */
        canvas {
          image-rendering: -moz-crisp-edges;
          image-rendering: -webkit-crisp-edges;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        
        /* Disable user selection on canvas */
        canvas {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Ensure proper touch handling on mobile */
        canvas {
          touch-action: none;
          -webkit-touch-callout: none;
        }
        
        /* Custom scrollbar for gallery */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.8);
        }
      `}</style>
    </>
  );
}
