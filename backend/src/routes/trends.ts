import { Hono } from "hono"
import type { Env } from "../index"
import type { TrendsResponse } from "@meme-alchemist/shared/types"
import { fetchAndClusterTrends } from "../services/trends"

const app = new Hono<{ Bindings: Env }>()

// Seed topics fallback (using fixed IDs to avoid crypto.randomUUID() in global scope)
function getSeedTopics(): TrendsResponse {
  return {
    date: new Date().toISOString().split("T")[0],
    topics: [
      {
        topic_id: "seed-topic-1",
        label: "AI Model Price War",
        score: 9.8,
        samples: ["OpenAI price drop", "Claude pricing update"],
      },
      {
        topic_id: "seed-topic-2",
        label: "Brisbane Summer Heat",
        score: 9.2,
        samples: ["Brisbane heatwave warning", "QLD storms"],
      },
      {
        topic_id: "seed-topic-3",
        label: "Tech Layoffs 2025",
        score: 8.5,
        samples: ["Tech industry layoffs", "Startup downsizing"],
      },
      {
        topic_id: "seed-topic-4",
        label: "React 19 Release",
        score: 8.2,
        samples: ["React Server Components", "React 19 features"],
      },
      {
        topic_id: "seed-topic-5",
        label: "Remote Work Trends",
        score: 7.9,
        samples: ["Return to office mandates", "Hybrid work policies"],
      },
      {
        topic_id: "seed-topic-6",
        label: "Space Exploration",
        score: 7.5,
        samples: ["Mars mission updates", "SpaceX launches"],
      },
    ],
  }
}

// GET /api/trends?date=today&limit=20
app.get("/", async (c) => {
  const dateQuery = c.req.query("date") || "today"
  const limit = parseInt(c.req.query("limit") || "20")

  try {
    // Determine cache key based on date query
    const today = new Date().toISOString().split("T")[0]
    const cacheKey =
      dateQuery === "today" ? `trends:${today}` : `trends:${dateQuery}`

    // 1. Try KV cache first (if available)
    if (c.env.CACHE) {
      const cached = await c.env.CACHE.get(cacheKey, "json")

      if (cached) {
        console.log(`[Trends] Cache hit: ${cacheKey}`)
        return c.json(cached as TrendsResponse)
      }
    }

    console.log(`[Trends] Cache miss: ${cacheKey}, using seed topics`)

    // 2. Fallback to seed topics
    // Note: Real trends are populated by Cron job daily
    const seedTopics = getSeedTopics()
    return c.json({
      ...seedTopics,
      date: dateQuery === "today" ? today : dateQuery,
    })
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

// Manual trigger endpoint (admin only)
// POST /api/trends/refresh
app.post("/refresh", async (c) => {
  try {
    // Check admin key
    const adminKey = c.req.header("X-Admin-Key")
    if (!adminKey || adminKey !== c.env.ADMIN_KEY) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    console.log("[Trends] Manual refresh triggered")

    // Fetch and cluster trends
    const topics = await fetchAndClusterTrends({
      twitterApiKey: c.env.TWITTER_API_KEY,
      includeInstagram: false,
    })

    // Cache results
    const today = new Date().toISOString().split("T")[0]
    const response: TrendsResponse = {
      date: today,
      topics,
    }

    if (c.env.CACHE) {
      await c.env.CACHE.put(`trends:${today}`, JSON.stringify(response), {
        expirationTtl: 86400 * 7, // Keep for 7 days
      })
    }

    console.log(`[Trends] Manual refresh completed: ${topics.length} topics`)

    return c.json({
      success: true,
      topics_count: topics.length,
      date: today,
    })
  } catch (error) {
    console.error("[Trends] Manual refresh failed:", error)
    return c.json({ error: "Refresh failed" }, 500)
  }
})

export default app
