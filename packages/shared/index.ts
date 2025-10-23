// Re-export all types and schemas
export * from "./types"
export * from "./schemas"

// Constants
export const ANGLES = [
  "educational",
  "self-deprecating",
  "contrast",
  "insider",
] as const
export const FACT_LEVELS = ["A", "B", "C", "D"] as const
export const RATIOS = ["1:1", "4:5", "9:16"] as const

export const TEMPLATE_IDS = [
  "two-panel-v1",
  "grid-9-v1",
  "timeline-v1",
  "glossary-v1",
  "datapoint-v1",
  "flowchart-v1",
] as const
