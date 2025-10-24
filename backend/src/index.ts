import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"

import trendsRoutes from "./routes/trends"
import jitRoutes from "./routes/jit"
import composeRoutes from "./routes/compose"
import renderRoutes from "./routes/render"
import { errorHandler } from "./middleware/error-handler"
import { rateLimit } from "./middleware/rate-limit"

// Environment bindings
export interface Env {
  // KV (optional in local dev)
  CACHE?: KVNamespace

  // Secrets (optional in local dev)
  SUPABASE_URL?: string
  SUPABASE_SERVICE_KEY?: string
  OPENAI_API_KEY?: string
  ADMIN_KEY?: string
  WHITE_LISTED_DOMAINS?: string

  // Optional
  DOUBAO_API_KEY?: string
  TWITTER_API_KEY?: string
  ENVIRONMENT?: string
}

const app = new Hono<{ Bindings: Env }>()

// Global middleware
app.use("*", logger())
app.use("*", prettyJSON())
app.use(
  "*",
  cors({
    origin: "*", // TODO: Restrict in production
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
)

// Health check
app.get("/", (c) => {
  return c.json({
    name: "Meme Alchemist API",
    version: "0.1.0",
    status: "healthy",
    environment: c.env.ENVIRONMENT || "production",
  })
})

// Routes
app.route("/api/trends", trendsRoutes)
app.route("/api/jit_fetch", jitRoutes)
app.route("/api/compose", composeRoutes)
app.route("/api/render", renderRoutes)

// Rate limiting for public endpoints
app.use("/api/compose", rateLimit({ maxRequests: 10, windowMs: 3600000 }))
app.use("/api/render", rateLimit({ maxRequests: 10, windowMs: 3600000 }))

// Error handling
app.onError(errorHandler)

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: "Endpoint not found",
      },
    },
    404
  )
})

// Cron trigger (daily trends update)
// Implements EPIC5-S3: Cron 任务
export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log("[Cron] Daily trends update started:", event.cron)

    try {
      // Import trends service dynamically
      const { fetchAndClusterTrends } = await import("./services/trends")

      // 1. Fetch and cluster trends from multiple sources
      const topics = await fetchAndClusterTrends({
        twitterApiKey: env.TWITTER_API_KEY,
        includeInstagram: false, // Optional, can enable if needed
      })
      console.log(`[Cron] Fetched and clustered ${topics.length} topics`)

      // 2. Cache to KV
      const today = new Date().toISOString().split("T")[0]

      if (env.CACHE) {
        const response = {
          date: today,
          topics,
        }

        await env.CACHE.put(
          `trends:${today}`,
          JSON.stringify(response),
          { expirationTtl: 86400 * 7 } // Keep for 7 days
        )

        console.log(`[Cron] Cached to KV: trends:${today}`)
      } else {
        console.warn("[Cron] KV namespace not available, skipping cache")
      }

      // 3. Optional: Store to Supabase for historical analysis
      // if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      //   const storage = new StorageService(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
      //   await storage.storeTrends(topics)
      // }

      console.log("[Cron] Daily trends update completed successfully")
    } catch (error) {
      console.error("[Cron] Daily trends update failed:", error)
      // Don't throw - let the Cron continue even if one execution fails
    }
  },
}
