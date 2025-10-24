import { z } from "zod"

// ============ Trends ============

export const TrendTopicSchema = z.object({
  topic_id: z.string().uuid(),
  label: z.string().min(2).max(50),
  score: z.number().min(0),
  samples: z.array(z.string()).min(1),
})

export const TrendsResponseSchema = z.object({
  date: z.string(),
  topics: z.array(TrendTopicSchema),
})

// ============ Facts ============

export const FactLevelSchema = z.enum(["A", "B", "C", "D"])

export const FactCandidateSchema = z.object({
  id: z.string().uuid(),
  quote: z.string().min(10).max(200),
  source_title: z.string(),
  url: z.string().url(),
  level: FactLevelSchema,
  confidence: z.number().min(0).max(1),
})

export const JitFetchRequestSchema = z.object({
  topic: z.string().min(2).max(50),
  collections: z.array(z.string()).min(1).max(10),
  limit: z.number().int().min(2).max(20).optional().default(6),
})

export const JitFetchResponseSchema = z.object({
  candidates: z.array(FactCandidateSchema),
})

// ============ Compose ============

export const AngleSchema = z.enum([
  "educational",
  "self-deprecating",
  "contrast",
  "insider",
])

export const ComposeRequestSchema = z.object({
  topic: z.string().min(2).max(50),
  angle: AngleSchema,
  template_id: z.string().regex(/^[a-z0-9-]+$/),
  facts: z
    .array(
      z.object({
        quote: z.string().min(10).max(200),
        source: z.string().url(),
      })
    )
    .min(1) // Allow 1-4 facts
    .max(4),
})

export const ComposeResponseSchema = z.object({
  topic: z.string(),
  angle: AngleSchema,
  hook: z.string(),
  body: z.string(),
  facts: z.array(
    z.object({
      quote: z.string(),
      source: z.string().url(),
    })
  ),
  platform_fit: z
    .array(
      z.object({
        platform: z.string(),
        chars_max: z.number(),
        emoji_budget: z.number().optional(),
      })
    )
    .optional(),
})

// ============ Render ============

export const RenderRequestSchema = z.object({
  template_id: z.string().regex(/^[a-z0-9-]+$/),
  payload: z.record(z.string()),
  ratios: z.array(z.string()).min(1).max(3),
})

export const ImageResultSchema = z.object({
  ratio: z.string(),
  url: z.string().url(),
})

export const RenderResponseSchema = z.object({
  images: z.array(ImageResultSchema),
  asset_id: z.string().uuid(),
})

// ============ Error ============

export const APIErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    retry_after: z.number().optional(),
  }),
})
