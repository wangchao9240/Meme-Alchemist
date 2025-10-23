"use client"

import { useRouter } from "next/navigation"
import { FactPicker } from "@/components/composer/FactPicker"
import { useComposerStore } from "@/lib/stores/composer"
import type { FactCandidate } from "@meme-alchemist/shared/types"

export default function FactPickerPage() {
  const router = useRouter()
  const topic = useComposerStore((state) => state.topic)

  function handleNext(facts: FactCandidate[]) {
    // Save selected facts to store
    useComposerStore.setState({ facts })
    // Navigate to meme viewer
    router.push("/meme-viewer")
  }

  function handleBack() {
    router.back()
  }

  return (
    <FactPicker
      topic={topic || "Trending Topics"}
      onNext={handleNext}
      onBack={handleBack}
    />
  )
}
