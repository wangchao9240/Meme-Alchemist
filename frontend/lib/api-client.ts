import type {
  TrendsResponse,
  JitFetchRequest,
  JitFetchResponse,
  ComposeRequest,
  ComposeResponse,
  RenderRequest,
  RenderResponse,
  MemeResult,
} from "@meme-alchemist/shared/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"

class APIError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message)
    this.name = "APIError"
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new APIError(
        error.error?.message || `Request failed: ${response.statusText}`,
        response.status,
        error.error?.code
      )
    }

    return response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError("Network error", 0)
  }
}

// API Methods

export async function fetchTrends(date = "today"): Promise<TrendsResponse> {
  return fetchAPI<TrendsResponse>(`/api/trends?date=${date}&limit=20`)
}

export async function fetchFacts(
  request: JitFetchRequest
): Promise<JitFetchResponse> {
  return fetchAPI<JitFetchResponse>("/api/jit_fetch", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export async function compose(
  request: ComposeRequest
): Promise<ComposeResponse> {
  return fetchAPI<ComposeResponse>("/api/compose", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export async function render(request: RenderRequest): Promise<RenderResponse> {
  return fetchAPI<RenderResponse>("/api/render", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

// Combined API call for compose + render
export async function composeAndRender(
  request: ComposeRequest & { ratios: string[] }
): Promise<MemeResult> {
  // 1. Compose text
  const composeResult = await compose({
    topic: request.topic,
    angle: request.angle,
    template_id: request.template_id,
    facts: request.facts,
  })

  // 2. Build payload based on template type
  const payload = buildPayloadForTemplate(
    request.template_id,
    composeResult,
    request.facts
  )

  // 3. Render images
  const renderResult = await render({
    template_id: request.template_id,
    payload,
    ratios: request.ratios,
  })

  // 4. Combine results
  return {
    ...composeResult,
    images: renderResult.images,
    asset_id: renderResult.asset_id,
  }
}

/**
 * Build payload for specific template types
 */
function buildPayloadForTemplate(
  templateId: string,
  composeResult: ComposeResponse,
  facts: Array<{ quote: string; source: string }>
): Record<string, string> {
  const basePayload = {
    title: composeResult.hook,
    body: composeResult.body,
  }

  if (templateId === "two-panel-v1") {
    // For two-panel: map facts to left and right panels
    return {
      ...basePayload,
      left: facts[0]?.quote || "Left panel content",
      right: facts[1]?.quote || "Right panel content",
      footer: composeResult.body,
    }
  }

  if (templateId === "glossary-v1") {
    // For glossary: use hook as term, body as definition
    return {
      term: composeResult.hook,
      definition: composeResult.body,
      examples: facts.map((f) => f.quote).join("; "),
    }
  }

  // Default payload
  return basePayload
}
