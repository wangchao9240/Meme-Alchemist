import Link from "next/link"

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-b from-[#0a0a0a] to-[#000000] text-white">
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative flex h-auto min-h-[50vh] w-full flex-col items-center justify-center p-4 pt-16 @container sm:pt-4">
          <div className="flex flex-col gap-6 text-center @[480px]:gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="gradient-text text-5xl font-black leading-tight tracking-tighter @[480px]:text-6xl">
                Meme Alchemist
              </h1>
              <h2 className="text-lg font-normal leading-normal text-gray-300 @[480px]:text-xl">
                AI-Powered Meme Generator · Trending Topics + Facts = Engaging
                Content
              </h2>
            </div>
            <div className="flex justify-center">
              <Link
                href="/try"
                className="gradient-button flex min-h-[56px] w-full max-w-xs cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-4 text-base font-bold leading-normal text-white transition-all duration-300 hover:scale-105 active:scale-95 @[480px]:px-8 @[480px]:py-5 @[480px]:text-lg touch-manipulation"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                <span className="truncate">Create Your Meme</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="flex flex-col gap-6 px-4 py-8 @container">
          <div className="grid grid-cols-1 gap-4 @[640px]:grid-cols-3">
            <FeatureCard
              icon="trending_up"
              title="Real-Time Trends"
              description="Our AI scours the internet for the latest trending topics to keep your content fresh and relevant."
            />
            <FeatureCard
              icon="bolt"
              title="One-Click Generation"
              description="Generate engaging memes with a single click. No design skills required, just pure creativity."
            />
            <FeatureCard
              icon="auto_awesome"
              title="Verifiable Facts"
              description="Add a unique twist to your memes by incorporating interesting and verifiable facts automatically."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-6 px-5 py-6 text-center @container">
        <p className="text-sm font-normal leading-normal text-gray-500">
          Portfolio Project · MVP Version
        </p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-xl border border-gray-800 bg-[#1a1a1a]/50 p-5 backdrop-blur-sm transition-transform hover:scale-[1.02] hover:border-[#b75af2]/50">
      <div className="text-[#b75af2]">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold leading-tight text-white">{title}</h2>
        <p className="text-base font-normal leading-normal text-gray-400">
          {description}
        </p>
      </div>
    </div>
  )
}
