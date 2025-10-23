import Link from "next/link"
import { Sparkles, Zap, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Meme Alchemist
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            AI 驱动的梗图生成器 · 热榜话题 + 事实证据 = 有趣有据
          </p>
          <Link
            href="/try"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl touch-manipulation"
          >
            <Sparkles className="w-5 h-5" />
            立即生成梗图
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="实时热榜"
            description="自动抓取微博、知乎等平台热门话题"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="一键生成"
            description="5-10 秒内生成带出处的专业梗图"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="可追溯性"
            description="每个事实都有来源链接，100% 可验证"
          />
        </div>

        {/* Demo Preview (optional) */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>简历展示项目 · MVP 版本</p>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
      <div className="text-purple-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
