import type { Metadata, Viewport } from "next"
import { Noto_Sans_SC } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Toast } from "@/components/ui/Toast"

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Meme Alchemist - AI 梗图生成器",
  description: "基于热门话题和事实的 AI 梗图生成工具",
  keywords: ["meme", "AI", "梗图", "热榜", "生成器"],
  authors: [{ name: "Meme Alchemist Team" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={notoSansSC.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning
      >
        <ErrorBoundary>
          {children}
          <Toast />
        </ErrorBoundary>
      </body>
    </html>
  )
}
