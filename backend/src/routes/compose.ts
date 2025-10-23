import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../index"
import { ComposeRequestSchema } from "@meme-alchemist/shared/schemas"
import { LLMOrchestrator } from "../services/llm"

const app = new Hono<{ Bindings: Env }>()

// POST /api/compose
app.post("/", zValidator("json", ComposeRequestSchema), async (c) => {
  const request = c.req.valid("json")

  try {
    const orchestrator = new LLMOrchestrator(c.env.OPENAI_API_KEY)

    const startTime = Date.now()
    const { response, provider } = await orchestrator.generate(request)
    const duration = Date.now() - startTime

    // Add headers to indicate which provider was used
    c.header("X-LLM-Provider", provider)
    c.header("X-LLM-Duration", String(duration))

    console.log(`[Compose] Generated in ${duration}ms using ${provider}`)

    return c.json(response)
  } catch (error: any) {
    console.error("Compose error:", error)
    return c.json(
      {
        error: {
          code: "COMPOSE_FAILED",
          message: "Failed to generate content",
        },
      },
      500
    )
  }
})

export default app
