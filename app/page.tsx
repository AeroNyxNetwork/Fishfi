import dynamic from 'next/dynamic';

// 动态导入避免SSR问题
const FishFiGame = dynamic(() => import('./components/FishFiGame'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-black">
      <div className="text-center">
        <div className="text-4xl text-cyan-400 mb-4">🐟</div>
        <div className="text-white text-xl animate-pulse">加载游戏中...</div>
      </div>
    </div>
  )
});

export default function Home() {
  return <FishFiGame />;
}
