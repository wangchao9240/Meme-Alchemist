"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Sparkles, CloudOff, Loader2 } from "lucide-react"

type ViewerState = "loading" | "loaded" | "error"

export default function MemeViewerPage() {
  const router = useRouter()
  const [state, setState] = useState<ViewerState>("loading")
  const [memeUrl, setMemeUrl] = useState("")

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      // For demo, randomly show loaded or error state
      const shouldSucceed = Math.random() > 0.3
      if (shouldSucceed) {
        setState("loaded")
        setMemeUrl(
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB6ynCvJ0a1Ar4I2gDmZpHSq46aj7Fi1h9WF71VnCbEAcc5K6B72HwXtK8nBU_e2WVEZ6-_xPgqk7hEBps17NXXoA4SkVxuo5o8pB3IZ0OwPDlhDAiOGcXHttWi7_mn-k_oZRA0PhLyGQKn5KTwQvAQc0ltITw8Y3Rb2Vpv7GTDS379y8y4GULCKVAV0kLTMxfXQPTCRHol9NJv_erm-S9PWxcA1WwP2-bgsxqdy2vqdao3AKejHQrvdSiQJNYtFvqIbElYL5TtBHY"
        )
      } else {
        setState("error")
        setMemeUrl(
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD0vUJjH2tNyCJmZk3_MP7pJvULNPRrVjY37lRSL0R5zXatXRs7Xu5purK7bwJp6qqoRMeDGAsjohDrTJuFFVQgl8dLIwmsgq7EM5yX1sC-FoPASUNUwyWaQCj3vnS4mWW0WEUk1FyVRWGqOeNRWixD72scCLhX196SvmLiq3VrxHSQPPszaKJXNR5hbN6nE7tuh0T3iQVwcDZYbovGrVxJAOxfs1LlrTOE_pwGKR76hb92_BfFNUbyPQFjnTozppH71_oTFcoi784"
        )
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  function handleBack() {
    router.back()
  }

  function handleDownload() {
    if (memeUrl) {
      window.open(memeUrl, "_blank")
    }
  }

  function handleGenerate() {
    setState("loading")
    setTimeout(() => {
      setState("loaded")
    }, 2000)
  }

  function handleRetry() {
    setState("loading")
    setTimeout(() => {
      setState("loaded")
      setMemeUrl(
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB6ynCvJ0a1Ar4I2gDmZpHSq46aj7Fi1h9WF71VnCbEAcc5K6B72HwXtK8nBU_e2WVEZ6-_xPgqk7hEBps17NXXoA4SkVxuo5o8pB3IZ0OwPDlhDAiOGcXHttWi7_mn-k_oZRA0PhLyGQKn5KTwQvAQc0ltITw8Y3Rb2Vpv7GTDS379y8y4GULCKVAV0kLTMxfXQPTCRHol9NJv_erm-S9PWxcA1WwP2-bgsxqdy2vqdao3AKejHQrvdSiQJNYtFvqIbElYL5TtBHY"
      )
    }, 2000)
  }

  return (
    <div
      className="relative flex min-h-screen w-full flex-col"
      style={{ backgroundColor: state === "loading" ? "#1E1E1E" : "#191022" }}
    >
      {/* Dev: State Switcher (remove in production) */}
      <div className="fixed top-20 right-4 z-50 flex gap-2">
        <button
          onClick={() => setState("loading")}
          className={`px-3 py-1 text-xs rounded ${
            state === "loading"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Loading
        </button>
        <button
          onClick={() => setState("loaded")}
          className={`px-3 py-1 text-xs rounded ${
            state === "loaded"
              ? "bg-green-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Loaded
        </button>
        <button
          onClick={() => setState("error")}
          className={`px-3 py-1 text-xs rounded ${
            state === "error"
              ? "bg-red-500 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Error
        </button>
      </div>

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
          <div className="flex w-full grow py-3 px-4">
            <div className="w-full gap-1 overflow-hidden aspect-[2/3] flex">
              <div
                className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-xl flex-1"
                style={{ backgroundImage: `url("${memeUrl}")` }}
              />
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
            <div
              className="w-full h-full bg-center bg-no-repeat bg-cover rounded-lg"
              style={{ backgroundImage: `url("${memeUrl}")` }}
            />
            <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center gap-4 p-4">
              <div className="flex flex-col items-center gap-2">
                <CloudOff className="text-red-500 w-16 h-16" />
                <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">
                  Network Failed
                </p>
                <p className="text-white/80 text-sm font-normal leading-normal text-center">
                  Please try again.
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
