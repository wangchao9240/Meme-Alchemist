// ============ Trends (热榜) ============

export interface TrendTopic {
  topic_id: string
  label: string
  score: number
  samples: string[]
}

export interface TrendsResponse {
  date: string
  topics: TrendTopic[]
}

// ============ Facts (事实卡) ============

export interface Fact {
  id: string
  quote: string
  source_title?: string
  url: string
  publisher?: string
  date?: string
  tags: string[]
  level: "A" | "B" | "C" | "D"
  confidence: number
  created_at: string
}

export interface FactCandidate {
  id: string
  quote: string
  source_title: string
  url: string
  level: "A" | "B" | "C" | "D"
  confidence: number
}

export interface JitFetchRequest {
  topic: string
  collections: string[]
  limit?: number
}

export interface JitFetchResponse {
  candidates: FactCandidate[]
}

// ============ Compose (生成文案) ============

export type Angle = "educational" | "self-deprecating" | "contrast" | "insider"

export interface ComposeRequest {
  topic: string
  angle: Angle
  template_id: string
  facts: Array<{
    quote: string
    source: string
  }>
}

export interface ComposeResponse {
  topic: string
  angle: Angle
  hook: string
  body: string
  facts: Array<{
    quote: string
    source: string
  }>
  platform_fit?: Array<{
    platform: string
    chars_max: number
    emoji_budget?: number
  }>
}

// ============ Render (渲染图片) ============

export interface RenderRequest {
  template_id: string
  payload: Record<string, string>
  ratios: string[]
}

export interface ImageResult {
  ratio: string
  url: string
}

export interface RenderResponse {
  images: ImageResult[]
  asset_id: string
}

// ============ Combined Result ============

export interface MemeResult extends ComposeResponse {
  images: ImageResult[]
  asset_id: string
}

// ============ Template (模板) ============

export interface Template {
  id: string
  name: string
  type: "meme_image"
  canvas: {
    w: number
    h: number
    bg: string
  }
  slots: TemplateSlot[]
  ratios: string[]
}

export interface TemplateSlot {
  name: string
  kind: "text" | "image" | "divider"
  x: number
  y: number
  w: number
  h?: number
  style: string
  maxLines?: number
}

// ============ Error Response ============

export interface APIErrorResponse {
  error: {
    code: string
    message: string
    retry_after?: number
  }
}
