import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../index"
import { RenderRequestSchema } from "@meme-alchemist/shared/schemas"
import { SatoriRenderer, getTemplate } from "../services/renderer"
import { StorageService } from "../services/storage-service"

const app = new Hono<{ Bindings: Env }>()

// POST /api/render
app.post("/", zValidator("json", RenderRequestSchema), async (c) => {
  const { template_id, payload, ratios } = c.req.valid("json")

  // Get template
  const template = getTemplate(template_id)
  if (!template) {
    return c.json(
      {
        error: {
          code: "INVALID_TEMPLATE",
          message: "Template not found",
        },
      },
      400
    )
  }

  // Check Supabase configuration
  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_KEY) {
    return c.json(
      {
        error: {
          code: "DB_NOT_CONFIGURED",
          message: "Supabase not configured",
        },
      },
      503
    )
  }

  try {
    const renderer = new SatoriRenderer()
    await renderer.initialize()

    const storage = new StorageService(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_KEY
    )

    const startTime = Date.now()

    // Render SVG once
    const svg = await renderer.renderToSVG(template, payload)

    // Convert to PNG and upload for each ratio
    // For MVP, we generate same image for all ratios
    // In future, we can adjust canvas size per ratio
    const images = await Promise.all(
      ratios.map(async (ratio) => {
        const png = await renderer.svgToPng(svg)

        const filename = `${Date.now()}-${ratio}.png`
        const url = await storage.uploadImage(png, filename)

        return { ratio, url }
      })
    )

    const duration = Date.now() - startTime
    console.log(`[Render] Generated ${images.length} images in ${duration}ms`)

    c.header("X-Render-Duration", String(duration))

    return c.json({
      images,
      asset_id: crypto.randomUUID(),
    })
  } catch (error: any) {
    console.error("[Render] Error caught:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    // Development fallback: Return a mock image URL
    // WASM is not supported in Cloudflare Workers local dev mode
    if (error.message && error.message.toLowerCase().includes("wasm")) {
      console.warn("[Render] WASM-related error detected, using mock image URL")

      // Return a placeholder image from a public CDN
      const mockImages = ratios.map((ratio) => ({
        ratio,
        url: `https://via.placeholder.com/1080x1350/0f0f0f/ffffff?text=${encodeURIComponent(
          `${
            payload.title || "Meme"
          }\n\n(Mock Image - WASM not available in local dev)`
        )}`,
      }))

      return c.json({
        images: mockImages,
        asset_id: crypto.randomUUID(),
      })
    }

    // For non-WASM errors, return proper error response
    return c.json(
      {
        error: {
          code: "RENDER_FAILED",
          message: error.message || "Failed to render image",
        },
      },
      500
    )
  }
})

export default app
