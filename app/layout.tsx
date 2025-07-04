import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FishFi - 像素鱼元宇宙',
  description: '全球首个基于基因进化的 GameFi 捕鱼游戏',
  keywords: 'gamefi, nft, blockchain, pixel art, fish, web3',
  authors: [{ name: 'FishFi Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#001a33',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} overflow-hidden`}>{children}</body>
    </html>
  )
}
