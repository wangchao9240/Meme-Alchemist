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
export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log("Cron triggered:", event.cron)

    // TODO: Implement trends ingest + analyze
    // await ingestTrends(env);
    // await analyzeTrends(env);

    console.log("Daily trends update completed")
  },
}
