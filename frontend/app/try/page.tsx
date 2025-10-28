"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { fetchTrends } from "@/lib/api-client"
import { useComposerStore } from "@/lib/stores/composer"
import { useToastStore } from "@/lib/stores/toast"
import type { TrendTopic } from "@meme-alchemist/shared/types"

export default function TryPage() {
  const router = useRouter()
  const [trends, setTrends] = useState<TrendTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [customTopic, setCustomTopic] = useState("")
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null)

  useEffect(() => {
    loadTrends()
  }, [])

  async function loadTrends(isManualRefresh = false) {
    try {
      setLoading(true)
      const data = await fetchTrends()
      setTrends(data.topics)

      if (isManualRefresh) {
        useToastStore.getState().showToast("Trends refreshed", "success")
      }
    } catch (error) {
      console.error("Failed to load trends:", error)
      useToastStore
        .getState()
        .showToast("Failed to load trends, using fallback", "warning")

      // Set fallback trends
      setTrends([
        {
          topic_id: "1",
          label: "Stock Market Frenzy",
          score: 95,
          samples: ["To the moon!"],
        },
        {
          topic_id: "2",
          label: "The Future of Remote Work",
          score: 88,
          samples: ["Memes about WFH life"],
        },
        {
          topic_id: "3",
          label: "Retro Gaming Revival",
          score: 82,
          samples: ["Nostalgia hits different"],
        },
        {
          topic_id: "4",
          label: "AI Takes Over",
          score: 78,
          samples: ["Our new robot overlords"],
        },
        {
          topic_id: "5",
          label: "Sustainable Living",
          score: 75,
          samples: ["Saving the planet, one meme at a time"],
        },
        {
          topic_id: "6",
          label: "Latest Movie Hype",
          score: 70,
          samples: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleTrendClick(topic: string) {
    setSelectedTrend(topic)
    useComposerStore.setState({ topic })
    setTimeout(() => {
      router.push("/fact-picker")
    }, 150)
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (customTopic.trim()) {
      useComposerStore.setState({ topic: customTopic.trim() })
      router.push("/fact-picker")
    }
  }

  function handleBack() {
    router.push("/")
  }

  function handleRefresh() {
    loadTrends(true)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#191022]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-[#191022] px-4">
        <button
          onClick={handleBack}
          className="flex size-12 shrink-0 items-center justify-start touch-manipulation"
          aria-label="Back"
        >
          <span
            className="material-symbols-outlined text-white/90"
            style={{ fontSize: "28px" }}
          >
            arrow_back
          </span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-white">
          Select a Trend
        </h1>
        <button
          onClick={handleRefresh}
          className="flex size-12 shrink-0 items-center justify-end touch-manipulation"
          aria-label="Refresh"
          disabled={loading}
        >
          <span
            className={`material-symbols-outlined text-white/90 ${
              loading ? "animate-spin" : ""
            }`}
            style={{ fontSize: "28px" }}
          >
            refresh
          </span>
        </button>
      </header>

      {/* Custom Topic Input - Sticky */}
      <div className="sticky top-16 z-10 bg-[#191022] px-4 pb-4 pt-2">
        <p className="mb-2 text-sm text-white/60">Have a topic in mind?</p>
        <form onSubmit={handleCustomSubmit}>
          <label className="flex h-14 w-full min-w-40 flex-col">
            <div className="flex h-full w-full flex-1 items-stretch rounded-xl border border-white/20 bg-[#2d1f3d] transition-all focus-within:border-[#a855f7] focus-within:ring-2 focus-within:ring-[#a855f7]/50">
              <div className="flex items-center justify-center pl-4 text-white/60">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="form-input h-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl border-none bg-transparent px-3 text-base font-normal text-white placeholder:text-white/60 focus:outline-0 focus:ring-0"
                placeholder="e.g., 'AI in healthcare'"
              />
            </div>
          </label>
        </form>
      </div>

      {/* Trending Topics List */}
      <main className="flex-1 space-y-3 overflow-y-auto px-4 pb-8">
        {loading ? (
          // Loading skeletons
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex min-h-[72px] items-center rounded-2xl bg-[#2d1f3d] p-5 animate-pulse"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-5 w-3/4 rounded bg-white/10"></div>
                  <div className="h-4 w-1/2 rounded bg-white/10"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          trends.map((trend) => (
            <button
              key={trend.topic_id}
              onClick={() => handleTrendClick(trend.label)}
              className={`group flex min-h-[72px] w-full cursor-pointer items-center rounded-2xl border-2 p-5 transition-all hover:bg-[#352545] active:scale-95 touch-manipulation ${
                selectedTrend === trend.label
                  ? "border-[#a855f7] bg-[#352545]"
                  : "border-transparent bg-[#2d1f3d] hover:border-[#a855f7]"
              }`}
            >
              <div className="flex flex-1 flex-col justify-center text-left">
                <p className="text-lg font-bold text-white">{trend.label}</p>
                {trend.samples && trend.samples.length > 0 && (
                  <p className="text-sm font-normal text-white/60">
                    {trend.samples[0]}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </main>
    </div>
  )
}
