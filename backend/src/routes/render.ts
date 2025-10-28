import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "../index"
import { RenderRequestSchema } from "@meme-alchemist/shared/schemas"
import { StorageService } from "../services/storage-service"
import { getTemplate } from "../services/renderer"

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

  // Check Workers AI binding
  if (!c.env.AI) {
    return c.json(
      {
        error: {
          code: "AI_NOT_CONFIGURED",
          message: "Cloudflare Workers AI not configured",
        },
      },
      503
    )
  }

  try {
    const storage = new StorageService(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_KEY
    )

    const startTime = Date.now()

    // Generate prompts based on template type
    const prompts = generatePromptsForTemplate(template_id, payload)
    console.log(
      `[Render] Generated ${prompts.length} prompts for ${template_id}`
    )

    // Generate images for each prompt
    const allImages = []

    for (let i = 0; i < prompts.length; i++) {
      const promptInfo = prompts[i]
      console.log(
        `[Render] Generating image ${i + 1}/${prompts.length}:`,
        promptInfo.description
      )

      // Call Cloudflare Workers AI to generate image
      const aiResponse = await c.env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        {
          prompt: promptInfo.prompt,
        }
      )

      // The response is a PNG image as Uint8Array
      const imageBuffer = aiResponse as unknown as Uint8Array

      // Upload to Supabase with descriptive filename
      const filename = `ai-${Date.now()}-${template_id}-${promptInfo.label}.png`
      const url = await storage.uploadImage(imageBuffer, filename)

      console.log(`[Render] Image ${i + 1} generated and uploaded: ${url}`)

      allImages.push({
        ratio: ratios[0] || "1:1", // Use first ratio for all images
        url,
      })
    }

    const duration = Date.now() - startTime
    console.log(
      `[Render] Generated ${allImages.length} AI images in ${duration}ms`
    )

    c.header("X-Render-Duration", String(duration))

    return c.json({
      images: allImages,
      asset_id: crypto.randomUUID(),
    })
  } catch (error: any) {
    console.error("[Render] AI generation error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    return c.json(
      {
        error: {
          code: "RENDER_FAILED",
          message: error.message || "Failed to generate AI image",
        },
      },
      500
    )
  }
})

/**
 * Generate prompts based on template type
 */
function generatePromptsForTemplate(
  templateId: string,
  payload: Record<string, string>
): Array<{ label: string; prompt: string; description: string }> {
  const { title, body, left, right, term, definition, examples } = payload

  if (templateId === "two-panel-v1") {
    // Generate 2 images: one for left panel, one for right panel
    const basePrompt = `Create a modern meme-style image${
      title ? ` about "${title}"` : ""
    }. Style: bold colors, high contrast, minimalist design, suitable for social media.`

    return [
      {
        label: "left-panel",
        description: "Left panel",
        prompt: `${basePrompt} Focus on: ${left || "first perspective"}. ${
          body || ""
        }`,
      },
      {
        label: "right-panel",
        description: "Right panel",
        prompt: `${basePrompt} Focus on: ${right || "second perspective"}. ${
          body || ""
        }`,
      },
    ]
  }

  if (templateId === "glossary-v1") {
    // Generate 1 image: glossary-style definition
    let prompt = `Create a glossary or dictionary-style image`

    if (term) {
      prompt += ` defining the term: "${term}"`
    }

    if (definition) {
      prompt += `. Definition: ${definition}`
    }

    if (examples) {
      prompt += `. Examples: ${examples}`
    }

    prompt +=
      ". Style: clean, educational, modern typography, suitable for infographic."

    return [
      {
        label: "glossary",
        description: "Glossary definition",
        prompt,
      },
    ]
  }

  // Default: generate 1 image with all content
  let defaultPrompt = "Create a modern meme-style image"

  if (title) {
    defaultPrompt += ` with the topic: "${title}"`
  }

  if (body) {
    defaultPrompt += `. ${body}`
  }

  defaultPrompt +=
    ". Style: bold colors, high contrast, simple background, minimalist design, suitable for social media."

  return [
    {
      label: "default",
      description: "Default meme",
      prompt: defaultPrompt,
    },
  ]
}

export default app
