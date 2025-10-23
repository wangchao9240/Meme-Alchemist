import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../index"
import { JitFetchRequestSchema } from "@meme-alchemist/shared/schemas"
import type { JitFetchResponse } from "@meme-alchemist/shared/types"
import { FactsService } from "../services/facts"

const app = new Hono<{ Bindings: Env }>()

// POST /api/jit_fetch
app.post("/", zValidator("json", JitFetchRequestSchema), async (c) => {
  const { topic, collections, limit } = c.req.valid("json")

  // 检查 Supabase 配置
  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_KEY) {
    console.warn("[JIT] Supabase not configured, cannot fetch real facts")
    return c.json(
      {
        error: {
          code: "DB_NOT_CONFIGURED",
          message:
            "Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in environment variables.",
        },
      },
      503
    )
  }

  try {
    // 初始化 FactsService
    const factsService = new FactsService(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_KEY
    )

    console.log(
      `[JIT] Fetching facts for topic="${topic}", collections=[${collections.join(
        ", "
      )}], limit=${limit}`
    )

    // 从数据库检索事实
    const candidates = await factsService.fetchFactsByTags(collections, limit)

    // 候选不足时记录警告
    if (candidates.length < 2) {
      console.warn(
        `[JIT] Insufficient facts for collections: ${collections.join(
          ", "
        )} (found: ${candidates.length})`
      )
    }

    const response: JitFetchResponse = {
      candidates,
    }

    console.log(`[JIT] Returning ${candidates.length} candidates`)
    return c.json(response)
  } catch (error) {
    console.error("[JIT] Fetch error:", error)
    return c.json(
      {
        error: {
          code: "JIT_FETCH_FAILED",
          message:
            error instanceof Error ? error.message : "Failed to fetch facts",
        },
      },
      500
    )
  }
})

export default app
