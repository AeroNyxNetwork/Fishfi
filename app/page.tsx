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
  loading: () => <LoadingScreen />
});

// Separate loading component
function LoadingScreen() {
  return (
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
        
        {/* Loading bar with Tailwind animation */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return <NFTFishGallery />;
}
