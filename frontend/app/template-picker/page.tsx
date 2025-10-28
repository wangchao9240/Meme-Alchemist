"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useComposerStore } from "@/lib/stores/composer"

// Template definitions
const TEMPLATES = [
  {
    id: "two-panel-v1",
    name: "Two Panel",
    description: "Compare two concepts or viewpoints side-by-side.",
    ratios: ["1:1", "4:5", "9:16"],
  },
  {
    id: "glossary-v1",
    name: "Glossary",
    description: "Define and explain terms in an educational format.",
    ratios: ["1:1"],
  },
]

export default function TemplatePickerPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  function handleBack() {
    router.back()
  }

  function handleSelectTemplate(templateId: string) {
    setSelectedTemplate(templateId)
  }

  function handleNext() {
    if (!selectedTemplate) {
      return
    }

    // Save template to store
    useComposerStore.setState({ template: selectedTemplate })

    // Navigate to meme viewer
    router.push("/meme-viewer")
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-[#191022] antialiased">
      {/* Top App Bar */}
      <header className="fixed top-0 z-10 mx-auto h-16 w-full max-w-md bg-[#191022]/80 px-4 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between">
          <button
            onClick={handleBack}
            className="flex size-10 shrink-0 items-center justify-center touch-manipulation"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-2xl text-white">
              arrow_back
            </span>
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-white">
            Choose Template
          </h1>
          <div className="size-10 shrink-0"></div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="w-full max-w-md px-4 pt-16 pb-[120px]">
        <div className="grid grid-cols-1 gap-5 pt-4 sm:grid-cols-2">
          {/* Template Card 1: Two Panel */}
          <TemplateCard
            template={TEMPLATES[0]}
            selected={selectedTemplate === TEMPLATES[0].id}
            onSelect={() => handleSelectTemplate(TEMPLATES[0].id)}
          >
            <TwoPanelPreview />
          </TemplateCard>

          {/* Template Card 2: Glossary */}
          <TemplateCard
            template={TEMPLATES[1]}
            selected={selectedTemplate === TEMPLATES[1].id}
            onSelect={() => handleSelectTemplate(TEMPLATES[1].id)}
          >
            <GlossaryPreview />
          </TemplateCard>
        </div>
      </main>

      {/* Bottom CTA Button */}
      <footer className="fixed bottom-0 z-10 w-full max-w-md bg-[#191022]/80 p-4 backdrop-blur-sm">
        <button
          onClick={handleNext}
          disabled={!selectedTemplate}
          className={`flex h-14 w-full items-center justify-center overflow-hidden rounded-lg text-base font-bold transition-all duration-200 touch-manipulation ${
            selectedTemplate
              ? "cursor-pointer bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/20 hover:bg-[#a855f7]/90 active:scale-[0.98]"
              : "cursor-not-allowed bg-[#3d2f4f] text-white/50"
          }`}
        >
          <span>Continue to Generate</span>
        </button>
      </footer>
    </div>
  )
}

interface TemplateCardProps {
  template: (typeof TEMPLATES)[0]
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
}

function TemplateCard({
  template,
  selected,
  onSelect,
  children,
}: TemplateCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ease-in-out touch-manipulation ${
        selected
          ? "border-[#a855f7] bg-[#2d1f3d]/60"
          : "border-white/20 bg-[#2d1f3d] hover:border-[#a855f7]/50"
      }`}
    >
      {selected && (
        <div className="absolute right-[-14px] top-[-14px] flex size-7 items-center justify-center rounded-full bg-[#a855f7]">
          <span className="material-symbols-outlined text-base text-white">
            check
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Preview Diagram */}
        {children}

        {/* Template Info */}
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">{template.name}</h2>
            <p className="text-sm text-white/70">{template.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {template.ratios.map((ratio) => (
              <div
                key={ratio}
                className="flex h-7 items-center justify-center rounded-full bg-white/10 px-3"
              >
                <p className="text-xs font-medium text-white/80">{ratio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TwoPanelPreview() {
  return (
    <div className="aspect-[4/3] w-full rounded-lg bg-[#0f0f0f]">
      <div className="flex h-full w-full items-center justify-center gap-2 p-3">
        <div className="flex h-full w-1/2 flex-col items-center justify-center gap-2 rounded bg-white/10 p-2">
          <div className="h-1/2 w-full rounded-sm bg-white/20"></div>
          <p className="text-[10px] font-medium text-white/70">Concept A</p>
        </div>
        <div className="flex h-full w-1/2 flex-col items-center justify-center gap-2 rounded bg-white/10 p-2">
          <div className="h-1/2 w-full rounded-sm bg-white/20"></div>
          <p className="text-[10px] font-medium text-white/70">Concept B</p>
        </div>
      </div>
    </div>
  )
}

function GlossaryPreview() {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] p-4">
      <div className="flex w-full flex-col gap-2">
        <p className="text-xl font-bold text-white">"Term"</p>
        <p className="font-mono text-xs text-white/80">/tɜːrm/</p>
        <div className="flex w-full flex-col gap-1">
          <div className="h-1.5 w-full rounded-full bg-white/20"></div>
          <div className="h-1.5 w-5/6 rounded-full bg-white/20"></div>
          <div className="h-1.5 w-3/4 rounded-full bg-white/20"></div>
        </div>
      </div>
    </div>
  )
}
