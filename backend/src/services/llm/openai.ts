import OpenAI from "openai"
import type {
  ComposeRequest,
  ComposeResponse,
} from "@meme-alchemist/shared/types"

export class OpenAIService {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async generateContent(
    request: ComposeRequest,
    timeout: number = 8000
  ): Promise<ComposeResponse> {
    const prompt = this.buildPrompt(request)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const completion = await this.client.chat.completions.create(
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert meme creator. Based on provided facts, create ${request.angle} style content.

Requirements:
1. Hook must be catchy and engaging
2. Body should naturally incorporate all facts
3. Keep factual accuracy, no fabrication
4. Output must be JSON format with fields: hook, body, platform_fit
5. Content must be in English unless topic specifically requires otherwise`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          signal: controller.signal as any,
        }
      )

      clearTimeout(timeoutId)

      const content = JSON.parse(completion.choices[0].message.content!)

      return {
        topic: request.topic,
        angle: request.angle,
        hook:
          content.hook ||
          `${
            request.angle.charAt(0).toUpperCase() + request.angle.slice(1)
          } take on "${request.topic}"`,
        body:
          content.body ||
          request.facts.map((f, i) => `${i + 1}. ${f.quote}`).join("\n\n"),
        facts: request.facts,
        platform_fit: content.platform_fit || [
          { platform: "twitter", chars_max: 280, emoji_budget: 2 },
          { platform: "reddit", chars_max: 1000 },
        ],
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === "AbortError") {
        throw new Error("OPENAI_TIMEOUT")
      }
      console.error("[OpenAI] Error:", error)
      throw error
    }
  }

  private buildPrompt(request: ComposeRequest): string {
    const factsText = request.facts
      .map((f, i) => `${i + 1}. ${f.quote} (Source: ${f.source})`)
      .join("\n")

    return `Topic: ${request.topic}
Angle: ${request.angle}
Template: ${request.template_id}

Fact Materials:
${factsText}

Please generate JSON format content with:
- hook: An engaging title/hook
- body: Main content (naturally incorporating all facts)
- platform_fit: Array of objects with platform, chars_max, emoji_budget fields

Example output:
{
  "hook": "Amazing Facts About ${request.topic}",
  "body": "Here's what you need to know:\\n\\n1. [fact 1]\\n2. [fact 2]...",
  "platform_fit": [
    {"platform": "twitter", "chars_max": 280, "emoji_budget": 2},
    {"platform": "reddit", "chars_max": 1000}
  ]
}`
  }
}
