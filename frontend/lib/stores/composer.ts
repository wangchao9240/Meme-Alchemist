import { create } from "zustand"
import type { FactCandidate, MemeResult } from "@meme-alchemist/shared/types"

interface ComposerState {
  // Selections
  topic: string
  angle: "科普" | "自嘲" | "反差" | "内幕"
  facts: FactCandidate[]
  template: string

  // Result
  result: MemeResult | null

  // Actions
  setTopic: (topic: string) => void
  setAngle: (angle: ComposerState["angle"]) => void
  setFacts: (facts: FactCandidate[]) => void
  setTemplate: (template: string) => void
  setResult: (result: MemeResult) => void
  reset: () => void
}

const initialState = {
  topic: "",
  angle: "科普" as const,
  facts: [],
  template: "",
  result: null,
}

export const useComposerStore = create<ComposerState>((set) => ({
  ...initialState,

  setTopic: (topic) => set({ topic }),
  setAngle: (angle) => set({ angle }),
  setFacts: (facts) => set({ facts }),
  setTemplate: (template) => set({ template }),
  setResult: (result) => set({ result }),

  reset: () => set(initialState),
}))
