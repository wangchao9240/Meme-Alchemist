import { Hono } from "hono"
import type { Env } from "../index"
import type { TrendsResponse } from "@meme-alchemist/shared/types"

const app = new Hono<{ Bindings: Env }>()

// GET /api/trends?date=today&limit=20
app.get("/", async (c) => {
  const date = c.req.query("date") || "today"
  const limit = parseInt(c.req.query("limit") || "20")

  try {
    // 1. Try KV cache first (if available)
    if (c.env.CACHE) {
      const cacheKey = `trends:${date}`
      const cached = await c.env.CACHE.get(cacheKey, "json")

      if (cached) {
        return c.json(cached as TrendsResponse)
      }
    }

    // 2. Fallback to seed topics
    const seedTopics: TrendsResponse = {
      date: new Date().toISOString().split("T")[0],
      topics: [
        {
          topic_id: crypto.randomUUID(),
          label: "AI Model Price War",
          score: 9.8,
          samples: ["OpenAI price drop", "Claude pricing update"],
        },
        {
          topic_id: crypto.randomUUID(),
          label: "Brisbane Summer Heat",
          score: 9.2,
          samples: ["Brisbane heatwave warning", "QLD storms"],
        },
        {
          topic_id: crypto.randomUUID(),
          label: "Tech Layoffs 2025",
          score: 8.5,
          samples: ["Tech industry layoffs", "Startup downsizing"],
        },
        {
          topic_id: crypto.randomUUID(),
          label: "React 19 Release",
          score: 8.2,
          samples: ["React Server Components", "React 19 features"],
        },
        {
          topic_id: crypto.randomUUID(),
          label: "Remote Work Trends",
          score: 7.9,
          samples: ["Return to office mandates", "Hybrid work policies"],
        },
      ],
    }

    // Cache seed topics for 24h (if KV available)
    if (c.env.CACHE) {
      const cacheKey = `trends:${date}`
      await c.env.CACHE.put(cacheKey, JSON.stringify(seedTopics), {
        expirationTtl: 86400,
      })
    }

    return c.json(seedTopics)
  } catch (error) {
    console.error("Trends error:", error)
    return c.json(
      {
        error: {
          code: "TRENDS_FETCH_FAILED",
          message: "Failed to fetch trends",
        },
      },
      500
    )
  }
})

export default app
