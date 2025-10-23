"use client"

import { useState } from "react"
import { ArrowLeft, Layout } from "lucide-react"

interface TemplateGridProps {
  onNext: (templateId: string) => void
  onBack: () => void
}

const TEMPLATES = [
  {
    id: "two-panel-v1",
    name: "Two Panel",
    description: "Side-by-side comparison",
  },
  { id: "grid-9-v1", name: "Grid", description: "9 facts in grid layout" },
  { id: "timeline-v1", name: "Timeline", description: "Time-based sequence" },
  { id: "glossary-v1", name: "Glossary", description: "Term definition style" },
  { id: "datapoint-v1", name: "Data Point", description: "Data visualization" },
  {
    id: "flowchart-v1",
    name: "Flowchart",
    description: "Step-by-step process",
  },
]

export function TemplateGrid({ onNext, onBack }: TemplateGridProps) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleSelect(templateId: string) {
    setSelected(templateId)
    // Auto-proceed after selection
    setTimeout(() => onNext(templateId), 300)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Layout className="w-6 h-6 text-purple-400" />
          Choose Template
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelect(template.id)}
            className={`
              p-6 rounded-lg border text-left transition-all touch-manipulation
              ${
                selected === template.id
                  ? "bg-purple-500/20 border-purple-500 scale-105"
                  : "bg-gray-700/50 border-gray-600 hover:border-gray-500 hover:scale-102"
              }
            `}
          >
            <div className="aspect-[4/5] bg-gray-600 rounded mb-3 flex items-center justify-center">
              <Layout className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-semibold mb-1">{template.name}</h3>
            <p className="text-xs text-gray-400">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
