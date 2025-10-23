"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle, Loader2, ArrowLeft } from "lucide-react"
import { fetchFacts } from "@/lib/api-client"
import type { FactCandidate } from "@meme-alchemist/shared/types"

interface FactPickerProps {
  topic: string
  onNext: (facts: FactCandidate[]) => void
  onBack: () => void
}

export function FactPicker({ topic, onNext, onBack }: FactPickerProps) {
  const [candidates, setCandidates] = useState<FactCandidate[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [collections, setCollections] = useState<string[]>(["AI", "Brisbane"])

  useEffect(() => {
    loadFacts()
  }, [topic, collections])

  async function loadFacts() {
    setLoading(true)
    try {
      const data = await fetchFacts({ topic, collections, limit: 8 })
      setCandidates(data.candidates)
    } catch (error) {
      console.error("Failed to load facts:", error)
    } finally {
      setLoading(false)
    }
  }

  function toggleFact(id: string) {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      if (newSelected.size < 4) {
        newSelected.add(id)
      }
    }
    setSelected(newSelected)
  }

  function handleNext() {
    const selectedFacts = candidates.filter((f) => selected.has(f.id))
    onNext(selectedFacts)
  }

  const canProceed = selected.size >= 2 && selected.size <= 4

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Pick Facts for <span className="text-purple-400">{topic}</span>
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <p className="text-sm text-gray-400">
        Select 2-4 facts (Selected {selected.size}/4)
      </p>

      {/* Collection Filter (optional) */}
      <div className="flex gap-2 flex-wrap">
        {["AI", "Brisbane", "Tech", "Health"].map((col) => (
          <button
            key={col}
            onClick={() => {
              if (collections.includes(col)) {
                setCollections(collections.filter((c) => c !== col))
              } else {
                setCollections([...collections, col])
              }
            }}
            className={`
              px-3 py-1 rounded-full text-sm transition-colors touch-manipulation
              ${
                collections.includes(col)
                  ? "bg-purple-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }
            `}
          >
            {col}
          </button>
        ))}
      </div>

      {/* Facts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No facts found. Try different collections or topic.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((fact) => {
            const isSelected = selected.has(fact.id)
            return (
              <button
                key={fact.id}
                onClick={() => toggleFact(fact.id)}
                className={`
                  w-full p-4 rounded-lg border text-left transition-all touch-manipulation
                  ${
                    isSelected
                      ? "bg-purple-500/20 border-purple-500"
                      : "bg-gray-700/50 border-gray-600 hover:border-gray-500"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{fact.quote}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span className="bg-gray-600 px-2 py-0.5 rounded">
                        Level {fact.level}
                      </span>
                      <span>
                        {(fact.confidence * 100).toFixed(0)}% confident
                      </span>
                      <a
                        href={fact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Source
                      </a>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="px-6 py-3 bg-purple-500 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          Choose Template
        </button>
      </div>
    </div>
  )
}
