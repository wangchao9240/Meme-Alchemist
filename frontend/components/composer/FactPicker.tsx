"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Loader2, Search, X } from "lucide-react"
import { fetchFacts } from "@/lib/api-client"
import type { FactCandidate } from "@meme-alchemist/shared/types"

const CATEGORIES = [
  "All",
  "Weird but True",
  "Historical Tidbits",
  "Science Facts",
  "Random Trivia",
  "Animal Kingdom",
  "Pop Culture",
] as const

type Category = (typeof CATEGORIES)[number]

const FALLBACK_FACTS: FactCandidate[] = [
  {
    id: "fact-1",
    quote: "A group of flamingos is called a 'flamboyance'.",
    source_title: "National Geographic",
    url: "https://example.com/flamingos",
    level: "B",
    confidence: 0.95,
  },
  {
    id: "fact-2",
    quote: "Bananas are berries, but strawberries aren't.",
    source_title: "Smithsonian Magazine",
    url: "https://example.com/bananas",
    level: "B",
    confidence: 0.92,
  },
  {
    id: "fact-3",
    quote: "The inventor of the Pringles can is now buried in one.",
    source_title: "New York Times",
    url: "https://example.com/pringles",
    level: "C",
    confidence: 0.88,
  },
  {
    id: "fact-4",
    quote: "Honey never spoils.",
    source_title: "Scientific American",
    url: "https://example.com/honey",
    level: "A",
    confidence: 0.98,
  },
  {
    id: "fact-5",
    quote: "A shrimp's heart is in its head.",
    source_title: "BBC Earth",
    url: "https://example.com/shrimp",
    level: "C",
    confidence: 0.85,
  },
  {
    id: "fact-6",
    quote: "It is impossible for most people to lick their own elbow.",
    source_title: "Mental Floss",
    url: "https://example.com/elbow",
    level: "B",
    confidence: 0.9,
  },
]

const FALLBACK_CATEGORY_MAP: Record<string, Category> = {
  "fact-1": "Animal Kingdom",
  "fact-2": "Science Facts",
  "fact-3": "Weird but True",
  "fact-4": "Science Facts",
  "fact-5": "Animal Kingdom",
  "fact-6": "Random Trivia",
}

interface FactPickerProps {
  topic: string
  onNext: (facts: FactCandidate[]) => void
  onBack: () => void
}

export function FactPicker({ topic, onNext, onBack }: FactPickerProps) {
  const [candidates, setCandidates] = useState<FactCandidate[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<Category>("All")

  useEffect(() => {
    loadFacts()
  }, [topic])

  async function loadFacts() {
    setLoading(true)
    try {
      const data = await fetchFacts({ topic, collections: [], limit: 12 })
      setCandidates(data.candidates)
    } catch (error) {
      console.error("Failed to load facts:", error)
      setCandidates(FALLBACK_FACTS)
    } finally {
      setLoading(false)
    }
  }

  function toggleFact(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleNext() {
    const selectedFacts = candidates.filter((fact) => selected.has(fact.id))
    if (selectedFacts.length > 0) {
      onNext(selectedFacts)
    }
  }

  function handleClearSearch() {
    setSearchQuery("")
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredFacts = useMemo(() => {
    return candidates.filter((fact) => {
      const category = getCategoryForFact(fact)
      const matchesCategory =
        activeCategory === "All" || category === activeCategory

      if (!matchesCategory) return false

      if (!normalizedQuery) return true

      return fact.quote.toLowerCase().includes(normalizedQuery)
    })
  }, [candidates, activeCategory, normalizedQuery])

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col"
      style={{ backgroundColor: "#121212" }}
    >
      {/* Top App Bar - Sticky */}
      <div className="flex items-center bg-[#121212] p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-800">
        <div className="text-white flex size-12 shrink-0 items-center">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="touch-manipulation"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Choose a Fact
        </h2>

        <div className="w-12" />
      </div>

      {/* Search Bar - Sticky */}
      <div className="px-4 py-3 sticky top-[72px] z-10 bg-[#121212]">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-gray-400 flex border-none bg-gray-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
              <Search size={20} />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a fact..."
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-gray-800 focus:border-none h-full placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
            />

            <div className="text-gray-400 flex border-none bg-gray-800 items-center justify-center pr-4 rounded-r-lg border-l-0 touch-manipulation cursor-pointer">
              {searchQuery && (
                <div onClick={handleClearSearch}>
                  <X size={20} />
                </div>
              )}
            </div>
          </div>
        </label>
      </div>

      {/* Chips */}
      <div className="flex gap-3 p-4 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((category) => (
          <div
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-4 cursor-pointer touch-manipulation ${
              activeCategory === category ? "bg-primary" : "bg-gray-800"
            }`}
          >
            <p className="text-white text-sm font-medium leading-normal whitespace-nowrap">
              {category}
            </p>
          </div>
        ))}
      </div>

      {/* Fact List */}
      <div className="flex flex-col gap-2 px-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              className="animate-spin"
              size={32}
              style={{ color: "#8A2BE2" }}
            />
          </div>
        ) : filteredFacts.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "#9ca3af" }}>
            <p>No facts found. Try a different search term.</p>
          </div>
        ) : (
          filteredFacts.map((fact) => {
            const isSelected = selected.has(fact.id)
            return (
              <div
                key={fact.id}
                onClick={() => toggleFact(fact.id)}
                className={`flex items-center gap-4 bg-gray-800 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer touch-manipulation ${
                  isSelected
                    ? "border-primary"
                    : "border-transparent hover:border-primary"
                }`}
              >
                <div className="flex-1">
                  <p className="text-white text-base font-normal leading-normal">
                    {fact.quote}
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="flex size-7 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-5 w-5 rounded border-gray-600 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:border-gray-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add to Meme Button - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#121212]/80 backdrop-blur-sm border-t border-gray-800 safe-area-inset-bottom">
        <button
          onClick={handleNext}
          disabled={selected.size === 0}
          className="w-full h-12 bg-primary text-white font-bold rounded-lg flex items-center justify-center text-lg disabled:opacity-50"
        >
          Add to Meme
        </button>
      </div>
    </div>
  )
}

function getCategoryForFact(fact: FactCandidate): Category {
  const tags = (fact as unknown as { tags?: string[] }).tags ?? []
  const matched = tags.find((tag) => CATEGORIES.includes(tag as Category))
  if (matched) return matched as Category
  return FALLBACK_CATEGORY_MAP[fact.id] ?? "All"
}
