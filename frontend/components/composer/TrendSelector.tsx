"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { fetchTrends } from "@/lib/api-client"
import { useComposerStore } from "@/lib/stores/composer"
import { TrendCardSkeleton } from "@/components/ui/Skeleton"
import { useToastStore } from "@/lib/stores/toast"
import type { TrendTopic } from "@meme-alchemist/shared/types"

interface TrendSelectorProps {
  onNext: (topic: string) => void
  onBack?: () => void
}

export interface TrendSelectorRef {
  refreshTrends: () => void
}

// Mock trend images - in production, these would come from the API
const TREND_IMAGES = [
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1573865526739-10c1dd7eaa78?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?w=400&h=600&fit=crop",
]

export const TrendSelector = forwardRef<TrendSelectorRef, TrendSelectorProps>(
  function TrendSelector({ onNext, onBack }, ref) {
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
        const data = await fetchTrends()
        setTrends(data.topics)

        // Show success toast if it's a manual refresh
        if (isManualRefresh) {
          useToastStore.getState().showToast("Trends refreshed", "success")
        }
      } catch (error) {
        console.error("Failed to load trends:", error)

        // Show error toast
        useToastStore
          .getState()
          .showToast("Failed to load trends, using fallback", "warning")

        // Set fallback trends
        setTrends([
          { topic_id: "1", label: "AI & Technology", score: 95, samples: [] },
          { topic_id: "2", label: "Cats & Memes", score: 88, samples: [] },
          { topic_id: "3", label: "Space Exploration", score: 82, samples: [] },
          { topic_id: "4", label: "Climate Change", score: 78, samples: [] },
          { topic_id: "5", label: "Gaming Culture", score: 75, samples: [] },
          { topic_id: "6", label: "Food Trends", score: 70, samples: [] },
        ])
      } finally {
        setLoading(false)
      }
    }

    // Expose refreshTrends method via ref
    useImperativeHandle(ref, () => ({
      refreshTrends: () => {
        setLoading(true)
        loadTrends(true) // Pass true to show toast
      },
    }))

    function handleTrendClick(topic: string) {
      setSelectedTrend(topic)
      // Save topic to store and navigate to fact-picker
      useComposerStore.setState({ topic })
      setTimeout(() => {
        router.push("/fact-picker")
      }, 150)
    }

    function handleCustomSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (customTopic.trim()) {
        // Save topic to store and navigate to fact-picker
        useComposerStore.setState({ topic: customTopic.trim() })
        router.push("/fact-picker")
      }
    }

    function handleRefresh() {
      setLoading(true)
      loadTrends(true)
    }

    return (
      <div className="flex flex-col h-full">
        {/* Custom Topic Input - Sticky */}
        <div
          className="px-4 pb-6 pt-2 sticky top-0 z-10"
          style={{ backgroundColor: "var(--background-dark)" }}
        >
          <label
            htmlFor="custom-topic"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--on-surface-variant-dark)" }}
          >
            Have a topic in mind?
          </label>
          <form onSubmit={handleCustomSubmit} className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              size={20}
              style={{ color: "var(--on-surface-variant-dark)" }}
            />
            <input
              id="custom-topic"
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g., 'Cats in space'"
              className="w-full h-14 pl-12 pr-4 rounded-lg transition-all touch-manipulation"
              style={{
                backgroundColor: "var(--surface-dark)",
                borderColor: "var(--outline-variant)",
                borderWidth: "1px",
                color: "var(--on-surface-dark)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary)"
                e.target.style.boxShadow = "0 0 0 2px rgba(168, 85, 247, 0.2)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--outline-variant)"
                e.target.style.boxShadow = "none"
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleCustomSubmit(e)
                }
              }}
            />
          </form>
        </div>

        {/* Trending Topics Grid - Scrollable */}
        <div className="px-4 pb-[calc(100px+var(--safe-area-bottom))]">
          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <TrendCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {trends.slice(0, 6).map((trend, index) => (
                <button
                  key={trend.topic_id}
                  onClick={() => handleTrendClick(trend.label)}
                  className={`group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 touch-manipulation ${
                    selectedTrend === trend.label
                      ? "ring-4 ring-[#a855f7] scale-[0.98]"
                      : "focus-within:ring-4 focus-within:ring-[#a855f7] hover:ring-4 hover:ring-[#a855f7]"
                  }`}
                  tabIndex={0}
                >
                  {/* Background Image with Gradient */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.8) 100%), url('${
                        TREND_IMAGES[index % TREND_IMAGES.length]
                      }')`,
                    }}
                  />

                  {/* Purple Overlay on Hover/Focus */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 group-focus-within:opacity-20 transition-opacity duration-300"
                    style={{ backgroundColor: "var(--primary)" }}
                  />

                  {/* Selected State Overlay */}
                  {selectedTrend === trend.label && (
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundColor: "var(--primary)" }}
                    />
                  )}

                  {/* Topic Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p
                      className="text-base font-bold leading-tight line-clamp-2"
                      style={{ color: "var(--on-primary-container)" }}
                    >
                      {trend.label}
                    </p>
                  </div>

                  {/* Active State Ring */}
                  <div className="absolute inset-0 ring-4 ring-[#a855f7] opacity-0 group-active:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)
