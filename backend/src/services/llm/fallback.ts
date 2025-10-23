import type {
  ComposeRequest,
  ComposeResponse,
} from "@meme-alchemist/shared/types"

export class TemplateFallback {
  generate(request: ComposeRequest): ComposeResponse {
    const hook = `${
      request.angle.charAt(0).toUpperCase() + request.angle.slice(1)
    } take on "${request.topic}"`

    const body = request.facts
      .map((f, i) => `📌 **Fact ${i + 1}**: ${f.quote}`)
      .join("\n\n")

    return {
      topic: request.topic,
      angle: request.angle,
      hook,
      body,
      facts: request.facts,
      platform_fit: [
        { platform: "twitter", chars_max: 280, emoji_budget: 2 },
        { platform: "reddit", chars_max: 1000 },
      ],
    }
  }
}
