"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useComposerStore } from "@/lib/stores/composer"

// Template definitions matching backend
const TEMPLATES = [
  {
    id: "two-panel-v1",
    name: "Two Panel",
    description: "对比两个观点或概念",
    preview: "/templates/two-panel-preview.svg",
    ratios: ["1:1", "4:5", "9:16"],
    color: "#0f0f0f",
  },
  {
    id: "glossary-v1",
    name: "Glossary",
    description: "术语定义和解释",
    preview: "/templates/glossary-preview.svg",
    ratios: ["1:1"],
    color: "#667eea",
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
    <div
      className="relative flex min-h-screen w-full flex-col"
      style={{ backgroundColor: "#191022" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center p-4 pb-2 justify-between"
        style={{ backgroundColor: "#191022" }}
      >
        <div className="flex size-12 shrink-0 items-center">
          <button onClick={handleBack} className="touch-manipulation">
            <ArrowLeft size={24} className="text-white" />
          </button>
        </div>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Choose Template
        </h2>
        <div className="w-12" />
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              className={`relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left touch-manipulation transition-all ${
                selectedTemplate === template.id
                  ? "border-[#a855f7] bg-[#a855f7]/10"
                  : "border-white/20 bg-[#2d1f3d] hover:border-[#a855f7]/50"
              }`}
            >
              {/* Template Preview */}
              <div
                className="w-full aspect-[4/3] rounded-xl flex items-center justify-center text-white/50 text-sm"
                style={{ backgroundColor: template.color }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="font-bold text-white">{template.name}</div>
                </div>
              </div>

              {/* Template Info */}
              <div className="flex-1">
                <h3 className="text-white text-lg font-bold mb-1">
                  {template.name}
                </h3>
                <p className="text-white/70 text-sm mb-2">
                  {template.description}
                </p>
                <div className="flex gap-2">
                  {template.ratios.map((ratio) => (
                    <span
                      key={ratio}
                      className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80"
                    >
                      {ratio}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected Indicator */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#a855f7] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4"
        style={{ backgroundColor: "#191022" }}
      >
        <button
          onClick={handleNext}
          disabled={!selectedTemplate}
          className={`w-full max-w-md mx-auto flex items-center justify-center rounded-lg h-12 px-5 text-base font-bold leading-normal tracking-[0.015em] touch-manipulation transition-all ${
            selectedTemplate
              ? "bg-[#a658f3] text-white hover:bg-[#9547e3]"
              : "bg-[#3d2f4f] text-white/50 cursor-not-allowed"
          }`}
        >
          Continue to Generate
        </button>
      </div>
    </div>
  )
}
