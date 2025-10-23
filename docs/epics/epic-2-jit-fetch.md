# Epic 2: JIT 取材系统

**史诗 ID**: EPIC-2  
**优先级**: P0  
**估算**: 1-2 天  
**依赖**: EPIC-1 (数据基础设施)  
**目标**: 实现基于 tags 的智能事实检索，为内容生成提供素材

---

## 业务价值

允许用户根据话题和领域快速找到相关事实，是生成高质量梗图的关键。智能排序确保最可信的事实被优先选择。

---

## 验收标准

- [ ] 可根据 collections (tags) 检索 facts
- [ ] 按 level + confidence 排序
- [ ] 返回 2-8 条候选事实
- [ ] 候选不足时有友好提示
- [ ] 响应时间 < 200ms (P95)
- [ ] 集成到前端 FactPicker 组件

---

## 用户故事

### Story 2.1: 实现 Facts 检索服务

**故事 ID**: EPIC2-S1  
**优先级**: P0  
**估算**: 1 天

#### 作为

后端开发者

#### 我想要

创建 Supabase 查询服务来检索 facts

#### 以便于

API 可以高效查询符合条件的事实

#### 验收标准

- [ ] 创建 `backend/src/services/facts-service.ts`
- [ ] 实现 tags 过滤（AND 或 OR 逻辑）
- [ ] 实现 level + confidence 排序
- [ ] 支持 limit 参数
- [ ] 添加单元测试
- [ ] 查询性能 < 100ms

#### 技术任务

```typescript
// backend/src/services/facts-service.ts
import { createClient } from "@supabase/supabase-js"
import type { Fact, FactCandidate } from "@meme-alchemist/shared/types"

export class FactsService {
  private supabase

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async fetchFactsByTags(
    tags: string[],
    limit: number = 6
  ): Promise<FactCandidate[]> {
    // 查询包含任一 tag 的 facts
    const { data, error } = await this.supabase
      .from("facts")
      .select("id, quote, source_title, url, level, confidence")
      .overlaps("tags", tags) // 数组重叠查询
      .in("level", ["A", "B"]) // 只返回高质量
      .order("confidence", { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  }

  async getFactById(id: string): Promise<Fact | null> {
    const { data } = await this.supabase
      .from("facts")
      .select("*")
      .eq("id", id)
      .single()

    return data
  }
}
```

---

### Story 2.2: 更新 JIT Fetch API

**故事 ID**: EPIC2-S2  
**优先级**: P0  
**估算**: 0.5 天

#### 作为

后端开发者

#### 我想要

将 `/api/jit_fetch` 从 mock 数据切换到真实查询

#### 以便于

前端可以获取真实的 facts 数据

#### 验收标准

- [ ] 移除 mock 数据
- [ ] 集成 FactsService
- [ ] 保持相同的 API 接口
- [ ] 添加错误处理
- [ ] 候选不足时返回友好提示

#### 技术任务

```typescript
// backend/src/routes/jit.ts (更新)
import { FactsService } from "../services/facts-service"

app.post("/", zValidator("json", JitFetchRequestSchema), async (c) => {
  const { topic, collections, limit } = c.req.valid("json")

  // 检查 Supabase 配置
  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_KEY) {
    return c.json(
      {
        error: {
          code: "DB_NOT_CONFIGURED",
          message: "Database not configured",
        },
      },
      500
    )
  }

  try {
    const factsService = new FactsService(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_KEY
    )

    const candidates = await factsService.fetchFactsByTags(collections, limit)

    // 候选不足提示
    if (candidates.length < 2) {
      console.warn(`Insufficient facts for collections: ${collections}`)
    }

    return c.json({ candidates })
  } catch (error) {
    console.error("JIT fetch error:", error)
    return c.json(
      {
        error: {
          code: "JIT_FETCH_FAILED",
          message: "Failed to fetch facts",
        },
      },
      500
    )
  }
})
```

---

### Story 2.3: 前端集成测试

**故事 ID**: EPIC2-S3  
**优先级**: P0  
**估算**: 0.5 天

#### 作为

前端开发者

#### 我想要

确保 FactPicker 组件能正确显示真实数据

#### 以便于

用户可以选择真实的事实

#### 验收标准

- [ ] FactPicker 正确调用 API
- [ ] 显示真实的 facts 数据
- [ ] 候选不足时显示提示
- [ ] Loading 和 Error 状态正确
- [ ] 可选择 2-4 条事实

#### 技术任务

1. 测试 API 连接
2. 验证数据显示
3. 测试边界情况（0 条、1 条、10+ 条）
4. 优化 UX（loading skeleton）

---

## 测试场景

### 场景 1: 成功检索

- **输入**: `{ topic: "AI", collections: ["AI","价格"], limit: 6 }`
- **预期**: 返回 6 条相关 facts（如果存在）
- **验证**: 所有 facts 包含至少一个匹配的 tag

### 场景 2: 候选不足

- **输入**: `{ topic: "量子计算", collections: ["量子"], limit: 6 }`
- **预期**: 返回 < 6 条或 0 条
- **验证**: 前端显示提示信息

### 场景 3: 多领域混合

- **输入**: `{ collections: ["AI", "Brisbane"], limit: 8 }`
- **预期**: 返回混合两个领域的 facts
- **验证**: 按 confidence 排序

---

## 性能要求

- **P50**: < 50ms
- **P95**: < 200ms
- **P99**: < 500ms

优化手段：

- 利用 GIN 索引加速 tags 查询
- 限制返回字段（不返回 created_at 等）
- 缓存热门查询（可选）

---

## 完成定义 (DoD)

- [ ] FactsService 实现并测试
- [ ] API 切换到真实数据
- [ ] 前端正确显示
- [ ] 所有边界情况处理
- [ ] 性能达标
- [ ] 代码已审查并合并
