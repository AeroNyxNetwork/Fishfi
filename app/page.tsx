import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const FishFiGameV8 = dynamic(() => import('./components/FishFiGameV8'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-black">
      <div className="text-center">
        <div className="text-4xl text-cyan-400 mb-4">🐟</div>
        <div className="text-white text-xl animate-pulse">Loading PIXI v8 Ocean...</div>
      </div>
    </div>
  )
});

export default function Home() {
  return <FishFiGameV8 />;
}
