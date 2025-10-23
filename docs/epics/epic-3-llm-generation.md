# Epic 3: LLM 内容生成系统

**史诗 ID**: EPIC-3  
**优先级**: P0  
**估算**: 2-3 天  
**依赖**: EPIC-2 (JIT 取材)  
**目标**: 集成 LLM API，实现基于事实的智能文案生成，包含降级策略

---

## 业务价值

将选定的事实转化为有趣的梗图文案，是项目的核心价值。通过降级策略确保即使 LLM 失败也能提供基础功能。

---

## 验收标准

- [ ] OpenAI API 集成完成
- [ ] Structured Output 确保格式一致
- [ ] 3 层降级策略实现（OpenAI → Doubao → 模板）
- [ ] 生成时间 P95 < 8s
- [ ] 100% 响应可用（含降级）
- [ ] 生成内容符合 PRD schema

---

## 用户故事

### Story 3.1: 实现 OpenAI Service

**故事 ID**: EPIC3-S1  
**优先级**: P0  
**估算**: 1 天

#### 作为

后端开发者

#### 我想要

创建 OpenAI API 调用服务

#### 以便于

系统可以使用 GPT-4o-mini 生成文案

#### 验收标准

- [ ] 创建 `backend/src/services/llm/openai.ts`
- [ ] 使用 Structured Output（JSON mode）
- [ ] 实现超时控制（8s）
- [ ] 错误处理和重试逻辑
- [ ] Token 使用监控

#### 技术任务

```typescript
// backend/src/services/llm/openai.ts
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
              content: `你是一个梗图文案创作专家。根据提供的事实，创作${request.angle}风格的内容。
要求：
1. 标题要吸引人（hook）
2. 正文要结合所有事实，自然流畅
3. 保持事实准确性，不编造内容
4. 输出 JSON 格式`,
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
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      const content = JSON.parse(completion.choices[0].message.content!)

      return {
        topic: request.topic,
        angle: request.angle,
        hook: content.hook,
        body: content.body,
        facts: request.facts,
        platform_fit: content.platform_fit,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === "AbortError") {
        throw new Error("OPENAI_TIMEOUT")
      }
      throw error
    }
  }

  private buildPrompt(request: ComposeRequest): string {
    const factsText = request.facts
      .map((f, i) => `${i + 1}. ${f.quote} (来源: ${f.source})`)
      .join("\n")

    return `话题: ${request.topic}
角度: ${request.angle}
模板: ${request.template_id}

事实素材:
${factsText}

请生成 JSON 格式的内容，包含:
- hook: 吸引人的标题
- body: 正文（结合所有事实）
- platform_fit: 适配不同平台的格式建议`
  }
}
```

---

### Story 3.2: 实现降级策略

**故事 ID**: EPIC3-S2  
**优先级**: P0  
**估算**: 1 天

#### 作为

后端开发者

#### 我想要

实现 3 层降级策略确保服务可用

#### 以便于

即使 OpenAI 失败用户也能生成内容

#### 验收标准

- [ ] P0: OpenAI (8s 超时)
- [ ] P1: Doubao (可选，10s 超时)
- [ ] P2: 模板化文案（必定成功）
- [ ] 自动降级无需人工干预
- [ ] 记录降级事件到日志

#### 技术任务

```typescript
// backend/src/services/llm/orchestrator.ts
import { OpenAIService } from "./openai"
import { DouBaoService } from "./doubao" // 可选
import { TemplateFallback } from "./fallback"

export class LLMOrchestrator {
  private openai: OpenAIService
  private doubao?: DouBaoService
  private fallback: TemplateFallback

  constructor(openaiKey: string, doubaoKey?: string) {
    this.openai = new OpenAIService(openaiKey)
    if (doubaoKey) {
      this.doubao = new DouBaoService(doubaoKey)
    }
    this.fallback = new TemplateFallback()
  }

  async generate(request: ComposeRequest): Promise<ComposeResponse> {
    // P0: OpenAI
    try {
      console.log("[LLM] Trying OpenAI...")
      const result = await this.openai.generateContent(request, 8000)
      console.log("[LLM] OpenAI success")
      return result
    } catch (error) {
      console.warn("[LLM] OpenAI failed:", error.message)
    }

    // P1: Doubao (如果配置)
    if (this.doubao) {
      try {
        console.log("[LLM] Trying Doubao...")
        const result = await this.doubao.generateContent(request, 10000)
        console.log("[LLM] Doubao success")
        return result
      } catch (error) {
        console.warn("[LLM] Doubao failed:", error.message)
      }
    }

    // P2: Template Fallback (必定成功)
    console.log("[LLM] Using template fallback")
    return this.fallback.generate(request)
  }
}
```

```typescript
// backend/src/services/llm/fallback.ts
export class TemplateFallback {
  generate(request: ComposeRequest): ComposeResponse {
    const hook = `关于"${request.topic}"的${request.angle}解读`

    const body = request.facts.map((f, i) => `📌 ${f.quote}`).join("\n\n")

    return {
      topic: request.topic,
      angle: request.angle,
      hook,
      body,
      facts: request.facts,
      platform_fit: [{ platform: "weibo", chars_max: 300, emoji_budget: 2 }],
    }
  }
}
```

---

### Story 3.3: 更新 Compose API

**故事 ID**: EPIC3-S3  
**优先级**: P0  
**估算**: 0.5 天

#### 作为

后端开发者

#### 我想要

将 `/api/compose` 切换到真实 LLM 服务

#### 以便于

生成真实的 AI 文案

#### 验收标准

- [ ] 集成 LLMOrchestrator
- [ ] 保持 API 接口不变
- [ ] 添加降级提示头（X-LLM-Provider）
- [ ] 记录生成耗时

#### 技术任务

```typescript
// backend/src/routes/compose.ts (更新)
import { LLMOrchestrator } from "../services/llm/orchestrator"

app.post("/", zValidator("json", ComposeRequestSchema), async (c) => {
  const request = c.req.valid("json")

  if (!c.env.OPENAI_API_KEY) {
    // 直接使用模板降级
    const fallback = new TemplateFallback()
    const response = fallback.generate(request)
    c.header("X-LLM-Provider", "fallback")
    return c.json(response)
  }

  try {
    const orchestrator = new LLMOrchestrator(
      c.env.OPENAI_API_KEY,
      c.env.DOUBAO_API_KEY
    )

    const startTime = Date.now()
    const response = await orchestrator.generate(request)
    const duration = Date.now() - startTime

    c.header("X-LLM-Duration", String(duration))
    c.header("X-LLM-Provider", "ai") // 或记录具体哪个 provider

    console.log(`[Compose] Generated in ${duration}ms`)
    return c.json(response)
  } catch (error) {
    console.error("Compose error:", error)
    return c.json(
      {
        error: {
          code: "COMPOSE_FAILED",
          message: "Failed to generate content",
        },
      },
      500
    )
  }
})
```

---

### Story 3.4: 前端集成与 UX 优化

**故事 ID**: EPIC3-S4  
**优先级**: P1  
**估算**: 0.5 天

#### 作为

前端开发者

#### 我想要

优化生成过程的用户体验

#### 以便于

用户了解生成进度和状态

#### 验收标准

- [ ] 显示实时进度（取材 → 生成 → 渲染）
- [ ] 显示预估时间（5-10s）
- [ ] 降级时显示提示
- [ ] 超时后显示重试按钮

#### 技术任务

1. 更新 MemeViewer 组件
2. 添加进度条动画
3. 检测 X-LLM-Provider 头
4. 显示降级提示（"当前使用经典模板"）

---

## 成本控制

### Token 预算

- 平均每次生成: ~500 tokens
- 月生成次数: 1000 次
- 月成本: 1000 × 500 / 1M × $0.15 = **$0.075**

### 优化策略

- 精简 system prompt
- 限制 max_tokens
- 缓存相同请求（可选）

---

## 测试场景

### 场景 1: OpenAI 成功

- **Mock**: OpenAI API 正常
- **预期**: 8s 内返回高质量文案
- **验证**: JSON 格式正确，包含所有事实

### 场景 2: OpenAI 超时

- **Mock**: API 延迟 10s
- **预期**: 自动降级到 Doubao 或模板
- **验证**: 仍能返回可用内容

### 场景 3: API Key 缺失

- **Mock**: 无 OPENAI_API_KEY
- **预期**: 直接使用模板
- **验证**: 返回基础文案，标记为 fallback

---

## 完成定义 (DoD)

- [ ] OpenAI Service 实现并测试
- [ ] 降级策略完整实现
- [ ] API 切换到真实服务
- [ ] 前端体验优化
- [ ] 成本监控到位
- [ ] 所有测试场景通过
- [ ] 文档更新（API 密钥配置）
