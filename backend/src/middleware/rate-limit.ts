import type { Context, Next } from "hono"
import type { Env } from "../index"

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export function rateLimit(options: RateLimitOptions) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    // Skip rate limiting if KV is not available (local dev)
    if (!c.env.CACHE) {
      await next()
      return
    }

    const ip = c.req.header("cf-connecting-ip") || "unknown"
    const now = Date.now()
    const windowStart = Math.floor(now / options.windowMs)
    const key = `rl:${ip}:${c.req.path}:${windowStart}`

    try {
      const countStr = await c.env.CACHE.get(key)
      const count = countStr ? parseInt(countStr) : 0

      if (count >= options.maxRequests) {
        const retryAfter = Math.ceil(options.windowMs / 1000)
        return c.json(
          {
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
              retry_after: retryAfter,
            },
          },
          429
        )
      }

      await c.env.CACHE.put(key, String(count + 1), {
        expirationTtl: Math.ceil(options.windowMs / 1000),
      })

      await next()
    } catch (error) {
      console.error("Rate limit error:", error)
      // Fail open - allow request if rate limiting fails
      await next()
    }
  }
}
