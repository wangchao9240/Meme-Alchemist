# Epic 4: 图片渲染系统

**史诗 ID**: EPIC-4  
**优先级**: P0  
**估算**: 2-3 天  
**依赖**: EPIC-3 (LLM 生成)  
**目标**: 使用 Satori + Sharp 实现本地图片渲染，支持多比例、中文字体和模板系统

---

## 业务价值

将 LLM 生成的文案转化为精美的梗图，是用户最终获得的产品。本地渲染确保零额外成本和快速响应。

---

## 验收标准

- [ ] Satori 集成完成，支持中文
- [ ] Sharp 转换 SVG → PNG
- [ ] 至少 2 个模板可用（目标 6 个）
- [ ] 支持 3 种比例（1:1, 4:5, 9:16）
- [ ] 单张渲染 <100ms
- [ ] 图片上传到 Supabase Storage
- [ ] 返回 CDN URL

---

## 用户故事

### Story 4.1: 集成 Satori 渲染引擎

**故事 ID**: EPIC4-S1  
**优先级**: P0  
**估算**: 1 天

#### 技术任务

```typescript
// backend/src/services/renderer/satori.ts
import satori from "satori"
import { Resvg } from "@resvg/resvg-wasm"
import type { Template, RenderRequest } from "@meme-alchemist/shared/types"

export class SatoriRenderer {
  private fontData: Map<string, ArrayBuffer> = new Map()

  async initialize() {
    // 预加载字体
    const notoSans = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap"
    ).then((r) => r.arrayBuffer())

    this.fontData.set("Noto Sans SC", notoSans)
  }

  async renderToSVG(
    template: Template,
    payload: Record<string, string>
  ): Promise<string> {
    const jsx = this.buildJSX(template, payload)

    return await satori(jsx, {
      width: template.canvas.w,
      height: template.canvas.h,
      fonts: [
        {
          name: "Noto Sans SC",
          data: this.fontData.get("Noto Sans SC")!,
          weight: 400,
          style: "normal",
        },
      ],
    })
  }

  async svgToPng(svg: string, width: number): Promise<Uint8Array> {
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: width },
    })
    return resvg.render().asPng()
  }

  private buildJSX(template: Template, payload: Record<string, string>) {
    return {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: template.canvas.bg,
        },
        children: template.slots.map((slot) => ({
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: slot.x,
              top: slot.y,
              width: slot.w,
              fontSize: 24,
              color: "#fff",
            },
            children: payload[slot.name] || "",
          },
        })),
      },
    }
  }
}
```

---

### Story 4.2: 实现模板系统

**故事 ID**: EPIC4-S2  
**优先级**: P0  
**估算**: 1 天

#### 技术任务

创建 2 个基础模板（two-panel, glossary），后续可扩展到 6 个。

```typescript
// backend/src/services/renderer/templates.ts
import type { Template } from "@meme-alchemist/shared/types"

export const TEMPLATES: Record<string, Template> = {
  "two-panel-v1": {
    id: "two-panel-v1",
    name: "两栏对比",
    type: "meme_image",
    canvas: { w: 1080, h: 1350, bg: "#0f0f0f" },
    slots: [
      { name: "title", kind: "text", x: 60, y: 80, w: 960, style: "heading" },
      { name: "left", kind: "text", x: 80, y: 300, w: 420, style: "body" },
      { name: "right", kind: "text", x: 580, y: 300, w: 420, style: "body" },
      { name: "footer", kind: "text", x: 60, y: 1250, w: 960, style: "note" },
    ],
    ratios: ["1:1", "4:5", "9:16"],
  },

  "glossary-v1": {
    id: "glossary-v1",
    name: "词条解释",
    type: "meme_image",
    canvas: {
      w: 1080,
      h: 1080,
      bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    slots: [
      { name: "term", kind: "text", x: 80, y: 100, w: 920, style: "title" },
      {
        name: "definition",
        kind: "text",
        x: 80,
        y: 400,
        w: 920,
        style: "body",
      },
      {
        name: "examples",
        kind: "text",
        x: 80,
        y: 700,
        w: 920,
        style: "examples",
      },
    ],
    ratios: ["1:1"],
  },
}

export function getTemplate(id: string): Template | null {
  return TEMPLATES[id] || null
}
```

---

### Story 4.3: 实现图片上传服务

**故事 ID**: EPIC4-S3  
**优先级**: P0  
**估算**: 0.5 天

#### 技术任务

```typescript
// backend/src/services/storage-service.ts
import { createClient } from "@supabase/supabase-js"

export class StorageService {
  private supabase

  constructor(url: string, key: string) {
    this.supabase = createClient(url, key)
  }

  async uploadImage(buffer: Uint8Array, filename: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from("meme-images")
      .upload(filename, buffer, {
        contentType: "image/png",
        upsert: true,
      })

    if (error) throw error

    // 返回公开 URL
    const {
      data: { publicUrl },
    } = this.supabase.storage.from("meme-images").getPublicUrl(data.path)

    return publicUrl
  }
}
```

---

### Story 4.4: 更新 Render API

**故事 ID**: EPIC4-S4  
**优先级**: P0  
**估算**: 0.5 天

#### 技术任务

```typescript
// backend/src/routes/render.ts (完整实现)
import { SatoriRenderer } from "../services/renderer/satori"
import { StorageService } from "../services/storage-service"
import { getTemplate } from "../services/renderer/templates"

app.post("/", zValidator("json", RenderRequestSchema), async (c) => {
  const { template_id, payload, ratios } = c.req.valid("json")

  const template = getTemplate(template_id)
  if (!template) {
    return c.json(
      { error: { code: "INVALID_TEMPLATE", message: "Template not found" } },
      400
    )
  }

  try {
    const renderer = new SatoriRenderer()
    await renderer.initialize()

    const storage = new StorageService(
      c.env.SUPABASE_URL!,
      c.env.SUPABASE_SERVICE_KEY!
    )

    // 并行渲染多个比例
    const images = await Promise.all(
      ratios.map(async (ratio) => {
        const svg = await renderer.renderToSVG(template, payload)
        const png = await renderer.svgToPng(svg, template.canvas.w)

        const filename = `${Date.now()}-${ratio}.png`
        const url = await storage.uploadImage(png, filename)

        return { ratio, url }
      })
    )

    return c.json({
      images,
      asset_id: crypto.randomUUID(),
    })
  } catch (error) {
    console.error("Render error:", error)
    return c.json(
      { error: { code: "RENDER_FAILED", message: error.message } },
      500
    )
  }
})
```

---

## 测试场景

### 场景 1: 基础渲染

- 使用 two-panel 模板
- 提供简单文本
- 生成 1:1 比例
- 验证图片可访问

### 场景 2: 中文支持

- 文本包含中文、emoji
- 验证字体正确加载
- 验证文字不乱码

### 场景 3: 多比例并行

- 请求 3 个比例
- 验证并行生成
- 验证所有 URL 可访问

---

## 性能目标

- **SVG 生成**: <50ms
- **PNG 转换**: <50ms
- **上传**: <100ms
- **总计**: <200ms/图

---

## 完成定义 (DoD)

- [ ] Satori 集成完成
- [ ] 至少 2 个模板
- [ ] 中文渲染正常
- [ ] 图片上传成功
- [ ] API 返回公开 URL
- [ ] 性能达标
- [ ] 前端可显示生成的图片
