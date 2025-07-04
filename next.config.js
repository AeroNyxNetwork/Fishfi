/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 解决 PixiJS 相关的构建问题
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }];
    
    // 解决一些包的兼容性问题
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    return config;
  },
  
  // 优化图片和资源加载
  images: {
    domains: [],
  },
}
