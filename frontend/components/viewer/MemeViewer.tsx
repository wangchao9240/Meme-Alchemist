"use client"

import { useState, useEffect } from "react"
import { Download, Copy, Loader2, RotateCcw, ExternalLink } from "lucide-react"
import { composeAndRender } from "@/lib/api-client"
import { useComposerStore } from "@/lib/stores/composer"
import type { MemeResult } from "@meme-alchemist/shared/types"

interface MemeViewerProps {
  result: MemeResult | null
  onReset: () => void
}

export function MemeViewer({
  result: initialResult,
  onReset,
}: MemeViewerProps) {
  const [result, setResult] = useState<MemeResult | null>(initialResult)
  const [loading, setLoading] = useState(!initialResult)
  const [error, setError] = useState<string | null>(null)
  const [selectedRatio, setSelectedRatio] = useState<string>("1:1")
  const [showEvidence, setShowEvidence] = useState(false)

  const { topic, facts, template } = useComposerStore()

  useEffect(() => {
    if (!result) {
      generate()
    }
  }, [])

  async function generate() {
    if (!topic || !facts.length || !template) return

    setLoading(true)
    setError(null)

    try {
      const data = await composeAndRender({
        topic,
        angle: "educational", // TODO: Let user choose
        template_id: template,
        facts: facts.map((f) => ({ quote: f.quote, source: f.url })),
        ratios: ["1:1", "4:5", "9:16"],
      })

      setResult(data)
      useComposerStore.setState({ result: data })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    if (!result) return
    const image = result.images.find((img) => img.ratio === selectedRatio)
    if (!image) return

    const link = document.createElement("a")
    link.href = image.url
    link.download = `meme-${Date.now()}.png`
    link.click()
  }

  async function handleCopyText() {
    if (!result) return
    await navigator.clipboard.writeText(result.body)
    // TODO: Show toast
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
        <p className="text-gray-400">Generating meme...</p>
        <p className="text-sm text-gray-500 mt-2">
          Fetch facts → Generate copy → Render image
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">❌ {error}</p>
        <button
          onClick={generate}
          className="px-6 py-2 bg-purple-500 rounded-lg font-medium hover:bg-purple-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!result) return null

  const currentImage = result.images.find((img) => img.ratio === selectedRatio)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">🎉 Meme Generated</h2>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Create New
        </button>
      </div>

      {/* Ratio Selector */}
      <div className="flex gap-2">
        {["1:1", "4:5", "9:16"].map((ratio) => (
          <button
            key={ratio}
            onClick={() => setSelectedRatio(ratio)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation
              ${
                selectedRatio === ratio
                  ? "bg-purple-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }
            `}
          >
            {ratio}
          </button>
        ))}
      </div>

      {/* Image Preview */}
      {currentImage && (
        <div className="bg-gray-900 rounded-lg p-4">
          <img
            src={currentImage.url}
            alt="Generated meme"
            className="w-full h-auto rounded shadow-lg"
          />
        </div>
      )}

      {/* Text Content */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">{result.hook}</h3>
        <p className="text-sm text-gray-300 whitespace-pre-wrap">
          {result.body}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 rounded-lg font-medium hover:bg-purple-600 transition-colors touch-manipulation"
        >
          <Download className="w-5 h-5" />
          Download
        </button>
        <button
          onClick={handleCopyText}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors touch-manipulation"
        >
          <Copy className="w-5 h-5" />
          Copy Text
        </button>
      </div>

      {/* Evidence */}
      <div>
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
        >
          📎 View Sources ({result.facts.length})
        </button>
        {showEvidence && (
          <div className="mt-3 space-y-2">
            {result.facts.map((fact, index) => (
              <div
                key={index}
                className="bg-gray-700/50 rounded-lg p-3 text-sm"
              >
                <p className="mb-2">{fact.quote}</p>
                <a
                  href={fact.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Source
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
