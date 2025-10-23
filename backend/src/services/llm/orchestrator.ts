import { OpenAIService } from "./openai"
import { TemplateFallback } from "./fallback"
import type {
  ComposeRequest,
  ComposeResponse,
} from "@meme-alchemist/shared/types"

export class LLMOrchestrator {
  private openai?: OpenAIService
  private fallback: TemplateFallback

  constructor(openaiKey?: string) {
    if (openaiKey) {
      this.openai = new OpenAIService(openaiKey)
    }
    this.fallback = new TemplateFallback()
  }

  async generate(request: ComposeRequest): Promise<{
    response: ComposeResponse
    provider: "openai" | "fallback"
  }> {
    // P0: OpenAI (if configured)
    if (this.openai) {
      try {
        console.log("[LLM] Trying OpenAI...")
        const result = await this.openai.generateContent(request, 8000)
        console.log("[LLM] OpenAI success")
        return { response: result, provider: "openai" }
      } catch (error: any) {
        console.warn("[LLM] OpenAI failed:", error.message)
      }
    } else {
      console.log("[LLM] OpenAI not configured, using fallback")
    }

    // P2: Template Fallback (always succeeds)
    console.log("[LLM] Using template fallback")
    const result = this.fallback.generate(request)
    return { response: result, provider: "fallback" }
  }
}
