"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Sparkles, CloudOff, Loader2 } from "lucide-react"
import { useComposerStore } from "@/lib/stores/composer"
import { composeAndRender } from "@/lib/api-client"
import { useToastStore } from "@/lib/stores/toast"

type ViewerState = "loading" | "loaded" | "error"

export default function MemeViewerPage() {
  const router = useRouter()
  const [state, setState] = useState<ViewerState>("loading")
  const [memeUrls, setMemeUrls] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const hasGeneratedRef = useRef(false)

  // Get data from store
  const topic = useComposerStore((state) => state.topic)
  const facts = useComposerStore((state) => state.facts)
  const template = useComposerStore((state) => state.template)

  useEffect(() => {
    // Prevent duplicate calls (React StrictMode in dev)
    if (hasGeneratedRef.current) {
      console.log("[MemeViewer] Already generated, skipping...")
      return
    }

    // Validate required data
    if (!topic || !facts || facts.length === 0 || !template) {
      console.error("[MemeViewer] Missing required data:", {
        topic,
        factsCount: facts?.length,
        template,
      })
      useToastStore
        .getState()
        .showToast(
          "Missing topic, facts or template. Please go back and select them.",
          "error"
        )
      setState("error")
      setErrorMessage("Missing required data. Please go back.")
      return
    }

    // Mark as generated and start generation
    hasGeneratedRef.current = true
    generateMeme()
  }, [])

  async function generateMeme() {
    setState("loading")
    setErrorMessage("")

    console.log("[MemeViewer] Starting generation...")
    console.log("[MemeViewer] Topic:", topic)
    console.log("[MemeViewer] Facts:", facts)

    try {
      // Call API to compose and render meme
      const result = await composeAndRender({
        topic: topic!,
        angle: "educational", // Default angle
        template_id: template!, // User-selected template
        facts: facts!.slice(0, 4).map((fact) => ({
          quote: fact.quote,
          source: fact.url,
        })),
        ratios: ["1:1"], // Generate 1:1 ratio by default
      })

      console.log("[MemeViewer] Generation successful!")
      console.log("[MemeViewer] Images:", result.images)

      if (result.images && result.images.length > 0) {
        setState("loaded")
        // Store all generated image URLs
        setMemeUrls(result.images.map((img) => img.url))
        useToastStore
          .getState()
          .showToast(
            `${result.images.length} meme image(s) generated successfully!`,
            "success"
          )
      } else {
        throw new Error("No images returned from API")
      }
    } catch (error) {
      console.error("[MemeViewer] Generation failed:", error)
      setState("error")
      const message =
        error instanceof Error ? error.message : "Failed to generate meme"
      setErrorMessage(message)
      useToastStore.getState().showToast(message, "error")
    }
  }

  function handleBack() {
    router.back()
  }

  function handleDownload() {
    if (memeUrls.length > 0) {
      // Download all generated images
      memeUrls.forEach((url, index) => {
        const link = document.createElement("a")
        link.href = url
        link.download = `meme-${Date.now()}-${index + 1}.png`
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })

      useToastStore
        .getState()
        .showToast(`${memeUrls.length} image(s) download started!`, "success")
    }
  }

  function handleGenerate() {
    hasGeneratedRef.current = false
    generateMeme()
  }

  function handleRetry() {
    hasGeneratedRef.current = false
    generateMeme()
  }

  return (
    <div
      className="relative flex min-h-screen w-full flex-col"
      style={{ backgroundColor: state === "loading" ? "#1E1E1E" : "#191022" }}
    >
      {/* Header */}
      <div
        className="flex items-center p-4 pb-2 justify-between"
        style={{ backgroundColor: state === "loading" ? "#1E1E1E" : "#191022" }}
      >
        <div className="flex size-12 shrink-0 items-center">
          <button onClick={handleBack} className="touch-manipulation">
            <ArrowLeft size={24} className="text-white" />
          </button>
        </div>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Meme Viewer
        </h2>
        <div className="w-12" />
      </div>

      {/* Loading State */}
      {state === "loading" && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
          <div className="w-full max-w-sm flex flex-col items-center space-y-4">
            {/* Top skeleton bar */}
            <div className="w-4/5 h-8 rounded-lg bg-[#333333] animate-shimmer" />

            {/* Main image skeleton with spinner */}
            <div className="relative w-full aspect-square rounded-xl bg-[#333333] animate-shimmer flex items-center justify-center">
              <div className="absolute">
                <Loader2 className="h-16 w-16 text-[#FFD700] animate-spin" />
              </div>
            </div>

            {/* Bottom skeleton bar */}
            <div className="w-4/5 h-8 rounded-lg bg-[#333333] animate-shimmer" />
          </div>
        </div>
      )}

      {/* Loaded State */}
      {state === "loaded" && (
        <>
          <div className="flex w-full grow py-3 px-4 overflow-y-auto">
            <div className="w-full flex flex-col gap-4">
              {memeUrls.map((url, index) => (
                <div key={index} className="w-full">
                  <img
                    src={url}
                    alt={`Generated Meme ${index + 1}`}
                    className="w-full h-auto object-contain rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-stretch sticky bottom-0 bg-[#191022] pt-2">
            <div className="flex flex-1 gap-3 max-w-[480px] items-stretch px-4 py-3">
              <button
                onClick={handleGenerate}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-transparent text-white text-base font-bold leading-normal tracking-[0.015em] w-full border border-white/20 gap-2 touch-manipulation"
              >
                <Sparkles size={20} />
                <span className="truncate">Generate</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 text-white text-base font-bold leading-normal tracking-[0.015em] w-full gap-2 touch-manipulation"
                style={{ backgroundColor: "#a658f3" }}
              >
                <Download size={20} />
                <span className="truncate">Download</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Error State */}
      {state === "error" && (
        <div className="flex-1 flex flex-col justify-center px-4 py-6">
          <div className="relative w-full max-w-[480px] mx-auto aspect-[2/3]">
            <div className="w-full h-full bg-[#191022] rounded-lg"></div>
            <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center gap-4 p-4">
              <div className="flex flex-col items-center gap-2">
                <CloudOff className="text-red-500 w-16 h-16" />
                <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">
                  Generation Failed
                </p>
                <p className="text-white/80 text-sm font-normal leading-normal text-center">
                  {errorMessage || "Please try again."}
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-4 px-6 py-2 bg-[#a658f3] text-white font-bold rounded-lg touch-manipulation"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
