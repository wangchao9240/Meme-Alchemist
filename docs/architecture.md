# Meme Alchemist — 架构设计文档

> **设计原则**：零成本启动、极简部署、性能优先、可靠降级

---

## 目录

1. [架构概览](#1-架构概览)
2. [技术栈选型](#2-技术栈选型)
3. [系统架构](#3-系统架构)
4. [数据架构](#4-数据架构)
5. [API 设计](#5-api-设计)
6. [缓存策略](#6-缓存策略)
7. [渲染引擎](#7-渲染引擎)
8. [部署方案](#8-部署方案)
9. [成本分析](#9-成本分析)
10. [性能优化](#10-性能优化)
11. [安全与限流](#11-安全与限流)

---

## 1. 架构概览

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          用户层                                  │
│  Mobile Web (PWA) - Next.js 15 + React 19 + Tailwind           │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    边缘计算层 (免费)                             │
│  Cloudflare Pages (静态资源) + Workers (API)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ KV (缓存)    │  │ Cron (定时)  │  │ Durable Obj  │          │
│  │ - trends     │  │ - 23:00 UTC  │  │ (可选限流)   │          │
│  │ - rate limit │  │ - ingest     │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Supabase    │ │ LLM API     │ │ 热榜源      │
│ (免费层)    │ │ (按需选择)  │ │ (公开API)   │
│             │ │             │ │             │
│ - Postgres  │ │ - 4o-mini   │ │ - 微博热搜  │
│ - Storage   │ │ - Doubao    │ │ - 知乎热榜  │
│ - Auth(可选)│ │ - Qwen      │ │ - Github    │
└─────────────┘ └─────────────┘ └─────────────┘
```

### 1.2 关键特性

| 特性 | 方案 | 成本 |
|------|------|------|
| 前端托管 | Cloudflare Pages | **免费** 无限请求 |
| API/Cron | Cloudflare Workers | **免费** 10万请求/天 |
| 数据库 | Supabase | **免费** 500MB + 2GB带宽/月 |
| 对象存储 | Supabase Storage | **免费** 1GB |
| 缓存 | Cloudflare KV | **免费** 10万读/天 |
| LLM | OpenAI 4o-mini | **$0.15/1M tokens** |
| 图片渲染 | Satori (本地) | **免费** |

**预估月成本**：$0-5（仅 LLM 调用）

---

## 2. 技术栈选型

### 2.1 前端技术栈

```yaml
框架: Next.js 15 (App Router)
UI库: React 19
样式: Tailwind CSS 4
状态管理: Zustand (轻量)
请求库: fetch + SWR (自动缓存)
PWA: next-pwa
图标: Lucide React
字体: Google Fonts (Noto Sans SC)
```

**选型理由**：
- Next.js 15 → 自带 SSR/SSG，Cloudflare Pages 原生支持
- Zustand → 比 Redux 轻 90%，适合小项目
- SWR → 自动缓存、重试、去重，降低 API 调用

### 2.2 后端技术栈

```yaml
运行时: Cloudflare Workers (V8 isolates)
语言: TypeScript 5.x
框架: Hono.js (超轻量，3.5KB)
ORM: Drizzle ORM (type-safe, edge-ready)
验证: Zod
限流: 基于 KV + Durable Objects
定时任务: Cloudflare Cron Triggers
```

**选型理由**：
- Hono.js → 比 Express 快 10x，专为 Edge 优化
- Drizzle ORM → 比 Prisma 轻，支持 Cloudflare Workers
- Zod → 运行时类型验证，防止脏数据

### 2.3 数据与存储

```yaml
主数据库: Supabase Postgres 15
缓存层1: Cloudflare KV (Edge)
缓存层2: Supabase 自带 PostgREST 缓存
对象存储: Supabase Storage (S3兼容)
```

### 2.4 LLM 服务选择

**多厂商降级策略**：

| 优先级 | 服务商 | 模型 | 价格 | 延迟 | 用途 |
|--------|--------|------|------|------|------|
| P0 | OpenAI | gpt-4o-mini | $0.15/1M | ~1s | 主力生成 |
| P1 | Doubao (字节) | doubao-lite-4k | $0.07/1M | ~1.5s | 降级备选 |
| P2 | 本地模板 | 无 | 免费 | <100ms | 最终降级 |

**配置建议**：
```typescript
// 环境变量
LLM_PRIMARY=openai:gpt-4o-mini
LLM_FALLBACK=doubao:doubao-lite-4k
LLM_TIMEOUT=8000 // 8秒超时
```

### 2.5 图片渲染方案

**选型：Satori + Sharp**

```yaml
文本→SVG: Satori (@vercel/og)
SVG→PNG: Sharp (WASM 版本)
字体: Google Fonts (预加载 .ttf)
优化: TinyPNG API (可选)
```

**优势**：
- ✅ 完全本地渲染，无外部依赖
- ✅ Workers 内运行，<100ms
- ✅ 支持中文字体（Noto Sans SC）

---

## 3. 系统架构

### 3.1 目录结构

```
meme-alchemist/
├── apps/
│   ├── web/                    # Next.js 前端
│   │   ├── app/
│   │   │   ├── (routes)/
│   │   │   │   ├── page.tsx           # 首页
│   │   │   │   └── try/
│   │   │   │       └── page.tsx       # 生成页
│   │   │   ├── api/                   # Next.js API (本地开发)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── composer/
│   │   │   │   ├── TopicSelector.tsx
│   │   │   │   ├── FactPicker.tsx
│   │   │   │   └── TemplateGrid.tsx
│   │   │   ├── viewer/
│   │   │   │   ├── MemeViewer.tsx
│   │   │   │   └── EvidencePanel.tsx
│   │   │   └── ui/
│   │   ├── lib/
│   │   │   ├── api-client.ts          # API 封装
│   │   │   └── stores/                # Zustand stores
│   │   └── public/
│   │       └── templates/             # 模板 JSON
│   │
│   └── workers/                # Cloudflare Workers
│       ├── src/
│       │   ├── index.ts               # 主路由
│       │   ├── routes/
│       │   │   ├── trends.ts          # 热榜 API
│       │   │   ├── jit.ts             # JIT 取材
│       │   │   ├── compose.ts         # LLM 生成
│       │   │   └── render.ts          # 图片渲染
│       │   ├── services/
│       │   │   ├── llm/
│       │   │   │   ├── openai.ts
│       │   │   │   ├── doubao.ts
│       │   │   │   └── fallback.ts
│       │   │   ├── trends/
│       │   │   │   ├── fetcher.ts     # 抓取逻辑
│       │   │   │   ├── analyzer.ts    # 聚类算法
│       │   │   │   └── sources/       # 各热榜源
│       │   │   ├── renderer/
│       │   │   │   ├── satori.ts
│       │   │   │   └── templates.ts
│       │   │   └── db.ts              # Drizzle 客户端
│       │   ├── cron/
│       │   │   └── daily-trends.ts    # 定时任务
│       │   └── middleware/
│       │       ├── rate-limit.ts
│       │       └── error-handler.ts
│       └── wrangler.toml              # Workers 配置
│
├── packages/
│   ├── shared/                 # 共享代码
│   │   ├── types/              # TypeScript 类型
│   │   ├── schemas/            # Zod schemas
│   │   └── constants.ts
│   └── db/                     # 数据库 schema
│       ├── schema.ts           # Drizzle schema
│       └── migrations/
│
├── supabase/
│   ├── migrations/             # SQL 迁移文件
│   └── seed.sql                # 种子数据
│
└── scripts/
    ├── seed-facts.ts           # 导入事实卡
    └── deploy.sh               # 一键部署
```

### 3.2 核心模块设计

#### 3.2.1 热榜分析引擎

```typescript
// workers/src/services/trends/analyzer.ts

interface TrendAnalyzer {
  // 1. 标准化
  normalize(raw: TrendRaw[]): NormalizedTrend[];
  
  // 2. 去重（基于 hash）
  deduplicate(trends: NormalizedTrend[]): NormalizedTrend[];
  
  // 3. 聚类（Jaccard 相似度）
  cluster(trends: NormalizedTrend[]): TrendCluster[];
  
  // 4. 打分
  score(clusters: TrendCluster[]): ScoredTopic[];
  
  // 5. 缓存
  cache(topics: ScoredTopic[], date: string): Promise<void>;
}

// 简化的聚类算法
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}
```

#### 3.2.2 LLM 调用层

```typescript
// workers/src/services/llm/orchestrator.ts

class LLMOrchestrator {
  async generate(request: ComposeRequest): Promise<ComposeResponse> {
    // 优先级链
    const providers = [
      { name: 'openai', timeout: 8000 },
      { name: 'doubao', timeout: 10000 },
      { name: 'fallback', timeout: 0 } // 模板化文案
    ];
    
    for (const provider of providers) {
      try {
        const result = await Promise.race([
          this.callProvider(provider.name, request),
          this.timeout(provider.timeout)
        ]);
        return result;
      } catch (error) {
        console.error(`${provider.name} failed, trying next...`);
        continue;
      }
    }
    
    // 最终降级
    return this.templateFallback(request);
  }
  
  private templateFallback(req: ComposeRequest): ComposeResponse {
    // 基于模板生成固定文案
    return {
      topic: req.topic,
      angle: req.angle,
      hook: `关于"${req.topic}"的${req.angle}解读`,
      body: req.facts.map(f => `• ${f.quote}`).join('\n'),
      facts: req.facts
    };
  }
}
```

#### 3.2.3 渲染引擎

```typescript
// workers/src/services/renderer/satori.ts

import satori from 'satori';
import { Resvg } from '@resvg/resvg-wasm';

async function renderTemplate(
  template: Template,
  payload: Record<string, string>,
  ratio: string
): Promise<Uint8Array> {
  // 1. 根据 ratio 调整画布
  const dimensions = RATIO_MAP[ratio]; // {w, h}
  
  // 2. Satori 生成 SVG
  const svg = await satori(
    buildJSXFromTemplate(template, payload),
    {
      width: dimensions.w,
      height: dimensions.h,
      fonts: await loadFonts(['Noto Sans SC'])
    }
  );
  
  // 3. SVG → PNG
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: dimensions.w }
  });
  
  return resvg.render().asPng();
}
```

---

## 4. 数据架构

### 4.1 数据库 Schema (Drizzle)

```typescript
// packages/db/schema.ts

import { pgTable, uuid, text, timestamp, jsonb, index, real, date, integer } from 'drizzle-orm/pg-core';

// 事实卡
export const facts = pgTable('facts', {
  id: uuid('id').primaryKey().defaultRandom(),
  quote: text('quote').notNull(),
  sourceTitle: text('source_title'),
  url: text('url').notNull(),
  publisher: text('publisher'),
  date: date('date'),
  tags: text('tags').array(),
  level: text('level', { enum: ['A', 'B', 'C', 'D'] }),
  confidence: real('confidence'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  tagsIdx: index('idx_facts_tags').using('gin', table.tags),
  levelConfIdx: index('idx_facts_level_conf').on(table.level, table.confidence),
  dateIdx: index('idx_facts_date').on(table.date)
}));

// 热榜原始数据
export const trendsRaw = pgTable('trends_raw', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: text('source').notNull(), // 'weibo' | 'zhihu' | 'github'
  date: date('date').notNull(),
  rank: integer('rank').notNull(),
  title: text('title').notNull(),
  url: text('url'),
  hash: text('hash').notNull(), // MD5(source+title)
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  dateSourceIdx: index('idx_trends_raw_date_source').on(table.date, table.source),
  hashIdx: index('idx_trends_raw_hash').on(table.hash)
}));

// 热榜缓存（最终输出）
export const trendsCache = pgTable('trends_cache', {
  date: date('date').primaryKey(),
  payload: jsonb('payload').notNull(), // ScoredTopic[]
  createdAt: timestamp('created_at').defaultNow()
});

// 作品
export const drafts = pgTable('drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  topic: text('topic').notNull(),
  angle: text('angle').notNull(),
  facts: jsonb('facts').notNull(), // Fact[]
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// 生成的图片
export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  draftId: uuid('draft_id').references(() => drafts.id),
  type: text('type').default('png'),
  path: text('path').notNull(), // Supabase Storage path
  ratios: text('ratios').array(), // ['1:1', '4:5', '9:16']
  createdAt: timestamp('created_at').defaultNow()
});
```

### 4.2 Supabase 配置

**Row Level Security (RLS)**：

```sql
-- 事实卡：只读
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "facts_read_all" ON facts FOR SELECT USING (true);

-- 热榜缓存：只读
ALTER TABLE trends_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trends_cache_read_all" ON trends_cache FOR SELECT USING (true);

-- 作品：公开读
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drafts_read_all" ON drafts FOR SELECT USING (true);
```

**Storage Bucket**：

```sql
-- 创建公开 bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('meme-images', 'meme-images', true);

-- 允许上传（仅 Worker service role）
CREATE POLICY "worker_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'meme-images');
```

---

## 5. API 设计

### 5.1 RESTful 端点

**前台 API（公开）**

```typescript
// GET /api/trends
// 获取今日热榜 TopN
Response: {
  date: string;
  topics: Array<{
    topic_id: string;
    label: string;      // "春节放假安排"
    score: number;
    samples: string[];  // 原始标题样本
  }>;
}

// POST /api/jit_fetch
// JIT 取材
Request: {
  topic: string;
  collections: string[];  // ["AI术语", "Brisbane生活"]
  limit?: number;         // default 6
}
Response: {
  candidates: Array<{
    id: string;
    quote: string;
    source_title: string;
    url: string;
    level: 'A' | 'B' | 'C' | 'D';
    confidence: number;
  }>;
}

// POST /api/compose
// LLM 生成文案
Request: {
  topic: string;
  angle: '科普' | '自嘲' | '反差' | '内幕';
  template_id: string;
  facts: Array<{ quote: string; source: string }>;
}
Response: {
  topic: string;
  angle: string;
  hook: string;
  body: string;
  facts: Array<{ quote: string; source: string }>;
  platform_fit: Array<{ platform: string; chars_max: number }>;
}

// POST /api/render
// 渲染图片
Request: {
  template_id: string;
  payload: Record<string, string>;  // {title, left, right, note}
  ratios: string[];                 // ['1:1', '4:5', '9:16']
}
Response: {
  images: Array<{
    ratio: string;
    url: string;  // Supabase Storage CDN URL
  }>;
  asset_id: string;
}
```

**后台 API（限制访问）**

```typescript
// POST /admin/trends/ingest
// 抓取热榜（需 API Key）
Headers: { Authorization: Bearer <ADMIN_KEY> }
Response: {
  fetched: number;
  sources: string[];
}

// POST /admin/trends/analyze
// 分析聚类（需 API Key）
Headers: { Authorization: Bearer <ADMIN_KEY> }
Response: {
  topics: number;
  cached_date: string;
}
```

### 5.2 错误码规范

```typescript
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "每小时限制 10 次，请稍后再试",
    "retry_after": 3600
  }
}
```

**标准错误码**：

| Code | HTTP | 含义 |
|------|------|------|
| `RATE_LIMIT_EXCEEDED` | 429 | 超过限频 |
| `INSUFFICIENT_FACTS` | 400 | 候选事实不足 |
| `LLM_TIMEOUT` | 504 | LLM 调用超时 |
| `RENDER_FAILED` | 500 | 渲染失败 |
| `INVALID_TEMPLATE` | 400 | 模板不存在 |

---

## 6. 缓存策略

### 6.1 三层缓存架构

```
┌─────────────────────────────────────────────┐
│  L1: Cloudflare KV (边缘, TTL 1h-24h)      │
│  - /api/trends → 24h                        │
│  - 热门模板配置 → 12h                       │
│  - 限流计数 → 1h                            │
└────────────────┬────────────────────────────┘
                 │ Miss
                 ▼
┌─────────────────────────────────────────────┐
│  L2: Supabase PostgREST Cache (1h)          │
│  - facts 表查询结果                         │
│  - trends_cache 表                          │
└────────────────┬────────────────────────────┘
                 │ Miss
                 ▼
┌─────────────────────────────────────────────┐
│  L3: Postgres (源数据)                      │
└─────────────────────────────────────────────┘
```

### 6.2 缓存键设计

```typescript
// KV 键命名规范
const CACHE_KEYS = {
  TRENDS: (date: string) => `trends:${date}`,           // trends:2025-01-10
  FACTS: (tags: string) => `facts:${tags}`,             // facts:AU,天气
  RATE_LIMIT: (ip: string) => `rl:${ip}:${hour}`,      // rl:1.2.3.4:2025011010
  SEED_TOPICS: 'seed:topics'                            // 种子话题
};
```

### 6.3 缓存失效策略

| 数据类型 | TTL | 失效触发 |
|---------|-----|---------|
| 热榜缓存 | 24h | 每日 09:00 AEST 定时刷新 |
| Facts 查询 | 1h | 新增 fact 时清空相关 tag 缓存 |
| 限流计数 | 1h | 自动过期 |
| 模板配置 | 12h | 手动清空 |

---

## 7. 渲染引擎

### 7.1 模板系统设计

**模板 DSL 完整 Schema**：

```typescript
interface Template {
  id: string;              // 'two-panel-v1'
  name: string;            // '两栏对比'
  type: 'meme_image';
  canvas: {
    w: number;             // 1080
    h: number;             // 1350
    bg: string;            // '#0f0f0f' or 'linear-gradient(...)'
  };
  slots: Slot[];
  styles: StyleSheet;      // CSS-in-JS 样式
  ratios: string[];        // 支持的比例
}

interface Slot {
  name: string;            // 'title' | 'left' | 'right' | 'note'
  kind: 'text' | 'image' | 'divider';
  x: number;               // 绝对定位 x
  y: number;               // 绝对定位 y
  w: number;               // 宽度
  h?: number;              // 高度（文本可省略）
  style: string;           // 引用 styles 中的样式名
  maxLines?: number;       // 文本最大行数
}
```

**预设模板列表（MVP 6个）**：

| ID | 名称 | 适用角度 | 插槽数 |
|----|------|----------|--------|
| `two-panel-v1` | 两栏对比 | 反差 | 4 |
| `grid-9-v1` | 九宫格 | 科普 | 10 |
| `timeline-v1` | 时间线 | 内幕 | 5 |
| `glossary-v1` | 词条解释 | 科普 | 3 |
| `datapoint-v1` | 数据点 | 科普 | 6 |
| `flowchart-v1` | 流程图 | 自嘲 | 4 |

### 7.2 字体加载策略

```typescript
// workers/src/services/renderer/fonts.ts

const FONT_CACHE = new Map<string, ArrayBuffer>();

async function loadFonts(names: string[]): Promise<FontData[]> {
  return Promise.all(names.map(async (name) => {
    if (!FONT_CACHE.has(name)) {
      // 从 Google Fonts 或 Supabase Storage 加载
      const buffer = await fetch(
        `https://fonts.googleapis.com/css2?family=${name}&display=swap`
      ).then(r => r.arrayBuffer());
      FONT_CACHE.set(name, buffer);
    }
    
    return {
      name,
      data: FONT_CACHE.get(name)!,
      weight: 400,
      style: 'normal'
    };
  }));
}
```

### 7.3 渲染性能优化

**目标**：单张图 <100ms

1. **字体预加载**：Worker 启动时加载常用字体到内存
2. **模板缓存**：模板 JSON 存入 KV
3. **批量渲染**：3 个比例并行生成
4. **流式上传**：边渲染边上传到 Supabase Storage

```typescript
async function renderMultiRatios(
  template: Template,
  payload: Record<string, string>,
  ratios: string[]
): Promise<ImageResult[]> {
  return Promise.all(
    ratios.map(ratio => renderTemplate(template, payload, ratio))
  );
}
```

---

## 8. 部署方案

### 8.1 Cloudflare Workers 配置

```toml
# workers/wrangler.toml

name = "meme-alchemist-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# KV 绑定
[[kv_namespaces]]
binding = "CACHE"
id = "xxxxx"                    # 生产环境 ID

[[kv_namespaces]]
binding = "CACHE"
id = "yyyyy"
preview_id = "zzzzz"            # 预览环境 ID

# 定时任务
[triggers]
crons = ["0 23 * * *"]          # 每天 23:00 UTC (09:00 AEST)

# 环境变量
[vars]
SUPABASE_URL = "https://xxx.supabase.co"
WHITE_LISTED_DOMAINS = "mdn.mozilla.org,python.org,bom.gov.au"

# 密钥（通过 wrangler secret put 设置）
# SUPABASE_SERVICE_KEY
# OPENAI_API_KEY
# DOUBAO_API_KEY
# ADMIN_KEY
```

### 8.2 Cloudflare Pages 配置

```toml
# apps/web/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',               // 静态导出
  images: {
    unoptimized: true,            // Pages 不支持 Image Optimization
    domains: ['xxx.supabase.co']  // Supabase Storage
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL || 'https://api.meme-alchemist.workers.dev'
  }
};

export default nextConfig;
```

### 8.3 一键部署脚本

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 部署 Meme Alchemist..."

# 1. 构建前端
cd apps/web
pnpm build
echo "✅ 前端构建完成"

# 2. 部署到 Cloudflare Pages
npx wrangler pages deploy out --project-name=meme-alchemist
echo "✅ 前端已部署"

# 3. 部署 Workers
cd ../workers
pnpm run deploy
echo "✅ API 已部署"

# 4. 运行数据库迁移
cd ../../
pnpm run db:migrate
echo "✅ 数据库迁移完成"

echo "🎉 部署完成！"
echo "前端: https://meme-alchemist.pages.dev"
echo "API: https://api.meme-alchemist.workers.dev"
```

### 8.4 环境变量清单

**.env.example**：

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (仅 Workers)

# LLM
OPENAI_API_KEY=sk-...
DOUBAO_API_KEY=... (可选)

# Workers
ADMIN_KEY=your-secure-random-key
WHITE_LISTED_DOMAINS=mdn.mozilla.org,python.org,bom.gov.au,gov.cn,who.int

# 前端
NEXT_PUBLIC_API_URL=https://api.meme-alchemist.workers.dev
```

---

## 9. 成本分析

### 9.1 免费额度明细

| 服务 | 免费额度 | 预估用量 | 超额成本 |
|------|---------|---------|---------|
| **Cloudflare Pages** | 无限请求 | ~500 PV/天 | $0 |
| **Cloudflare Workers** | 10万请求/天 | ~200 请求/天 | $5/月 (超额后) |
| **Cloudflare KV** | 10万读/天, 1000写/天 | ~500读/天 | $0.50/百万读 |
| **Supabase DB** | 500MB, 2GB带宽/月 | ~50MB, 500MB带宽 | $0 |
| **Supabase Storage** | 1GB | ~100MB (图片) | $0 |
| **OpenAI 4o-mini** | 按量计费 | ~50K tokens/天 | $0.15/百万 tokens |

### 9.2 月成本估算

**低流量场景（100 PV/天，3 次生成/天）**：

```
OpenAI API:
  3次 × 30天 × 500 tokens = 45K tokens/月
  $0.15/1M × 0.045M = $0.0068 ≈ $0.01

总计: ~$0.01/月
```

**中等流量场景（1000 PV/天，30 次生成/天）**：

```
OpenAI API:
  30次 × 30天 × 500 tokens = 450K tokens/月
  $0.15/1M × 0.45M = $0.0675 ≈ $0.07

Workers (仍在免费额度内)
Supabase (仍在免费额度内)

总计: ~$0.07/月
```

**高流量场景（10000 PV/天，300 次生成/天）**：

```
OpenAI API:
  300次 × 30天 × 500 tokens = 4.5M tokens/月
  $0.15/1M × 4.5M = $0.68

Workers:
  300次 × 30天 = 9000 请求/月 (仍在免费额度内)

Supabase:
  可能需要升级到 Pro ($25/月) 获得更高带宽

总计: ~$0.68 - $25.68/月（取决于是否升级 Supabase）
```

### 9.3 成本优化建议

1. **LLM 降级**：主力用 4o-mini，降级用 Doubao (更便宜)
2. **积极缓存**：热榜缓存 24h，减少 DB 查询
3. **CDN 优化**：Supabase Storage 自带 CDN，图片永久缓存
4. **批量生成**：鼓励用户一次生成多比例，分摊成本

---

## 10. 性能优化

### 10.1 前端优化

**目标：首屏 <2s（4G 网络）**

| 优化项 | 方案 | 收益 |
|--------|------|------|
| 代码分割 | Next.js 自动 code splitting | -40% JS |
| 图片优化 | WebP + 响应式图片 | -60% 带宽 |
| 字体优化 | `font-display: swap` | -500ms FCP |
| 预加载 | `<link rel="preconnect">` 到 API | -200ms |
| Service Worker | 缓存静态资源 | 离线可用 |

**Critical CSS 内联**：

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 10.2 API 优化

**目标：P95 <10s**

| 端点 | 优化手段 | P95 目标 |
|------|---------|---------|
| `/api/trends` | KV 缓存 + 预计算 | <50ms |
| `/api/jit_fetch` | 索引优化 + limit 6 | <200ms |
| `/api/compose` | 超时 8s + 降级 | <8s |
| `/api/render` | 并行渲染 + 流式上传 | <1s |

**数据库查询优化**：

```typescript
// 使用 Drizzle 的高效查询
const candidates = await db
  .select()
  .from(facts)
  .where(
    and(
      arrayContains(facts.tags, collections),
      inArray(facts.level, ['A', 'B'])
    )
  )
  .orderBy(desc(facts.confidence))
  .limit(limit);
```

### 10.3 渲染优化

**并行渲染 + 流式上传**：

```typescript
async function renderAndUpload(
  template: Template,
  payload: Record<string, string>,
  ratios: string[]
): Promise<ImageResult[]> {
  const uploadPromises = ratios.map(async (ratio) => {
    const pngBuffer = await renderTemplate(template, payload, ratio);
    
    // 流式上传到 Supabase Storage
    const path = `${Date.now()}-${ratio}.png`;
    const { data } = await supabase.storage
      .from('meme-images')
      .upload(path, pngBuffer, { contentType: 'image/png' });
    
    return {
      ratio,
      url: data.publicUrl
    };
  });
  
  return Promise.all(uploadPromises);
}
```

---

## 11. 安全与限流

### 11.1 限流策略

**基于 Cloudflare KV 的滑动窗口**：

```typescript
// workers/src/middleware/rate-limit.ts

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  '/api/compose': { maxRequests: 10, windowMs: 3600000 },  // 10次/小时
  '/api/render': { maxRequests: 10, windowMs: 3600000 },
  '/admin/*': { maxRequests: 100, windowMs: 3600000 }      // 后台宽松
};

async function checkRateLimit(
  ip: string,
  endpoint: string,
  kv: KVNamespace
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const config = LIMITS[endpoint];
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const key = `rl:${ip}:${endpoint}:${Math.floor(now / config.windowMs)}`;
  
  const count = await kv.get<number>(key, 'json') || 0;
  
  if (count >= config.maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((windowStart + config.windowMs - now) / 1000)
    };
  }
  
  await kv.put(key, String(count + 1), {
    expirationTtl: Math.ceil(config.windowMs / 1000)
  });
  
  return { allowed: true };
}
```

### 11.2 输入验证

**使用 Zod Schema**：

```typescript
// packages/shared/schemas/compose.ts

import { z } from 'zod';

export const ComposeRequestSchema = z.object({
  topic: z.string().min(2).max(50),
  angle: z.enum(['科普', '自嘲', '反差', '内幕']),
  template_id: z.string().regex(/^[a-z0-9-]+$/),
  facts: z.array(
    z.object({
      quote: z.string().min(10).max(200),
      source: z.string().url()
    })
  ).min(2).max(4)
});

// 使用
const validated = ComposeRequestSchema.parse(request);
```

### 11.3 防护措施

| 威胁 | 防护方案 |
|------|---------|
| DDoS | Cloudflare 自带防护 |
| SQL 注入 | Drizzle ORM 参数化查询 |
| XSS | React 自动转义 + CSP Header |
| CSRF | SameSite Cookie (如有登录) |
| API 滥用 | IP 限流 + ADMIN_KEY 验证 |

**CSP Header**：

```typescript
// workers/src/index.ts

app.use('*', async (c, next) => {
  await next();
  c.header('Content-Security-Policy', 
    "default-src 'self'; img-src 'self' https://*.supabase.co; style-src 'self' 'unsafe-inline'"
  );
});
```

---

## 附录

### A. 热榜数据源

**免费公开 API**：

| 平台 | API | 免费额度 | 数据质量 |
|------|-----|---------|---------|
| 微博热搜 | RSS / 第三方 API | 无限 | ⭐⭐⭐⭐ |
| 知乎热榜 | 官方 API (限流) | 100次/小时 | ⭐⭐⭐⭐⭐ |
| GitHub Trending | GitHub API | 5000次/小时 | ⭐⭐⭐ |
| V2EX 热门 | V2EX API | 无限 | ⭐⭐⭐ |

**推荐配置**：微博 + 知乎（覆盖中文热点）

### B. 监控与日志

**Cloudflare Analytics（免费）**：

- Workers 调用次数
- 错误率
- P50/P95/P99 延迟
- 带宽使用

**自定义日志**：

```typescript
// 关键路径打点
console.log(JSON.stringify({
  event: 'compose_success',
  topic: request.topic,
  provider: 'openai',
  duration_ms: 2345,
  tokens: 456
}));
```

### C. 测试策略

**单元测试**：Vitest

```bash
# Workers 测试
cd apps/workers
pnpm test

# 覆盖率目标
- services/: >80%
- routes/: >70%
```

**E2E 测试**：Playwright

```typescript
test('完整生成流程', async ({ page }) => {
  await page.goto('/try');
  await page.click('[data-topic="春节放假"]');
  await page.click('[data-template="two-panel-v1"]');
  await page.click('button:has-text("取材")');
  await page.locator('[data-fact]').nth(0).click();
  await page.locator('[data-fact]').nth(1).click();
  await page.click('button:has-text("生成")');
  
  await expect(page.locator('img[alt*="梗图"]')).toBeVisible({ timeout: 15000 });
});
```

---

## 总结

### ✅ 架构优势

1. **零成本启动**：Cloudflare + Supabase 免费层足够 MVP
2. **全球加速**：边缘计算 + CDN，中国/澳洲均可快速访问
3. **高可用性**：Cloudflare 99.99% SLA，无需自建基础设施
4. **可扩展性**：Workers 自动扩容，按需付费
5. **开发友好**：TypeScript 全栈，类型安全

### 📊 技术指标

| 指标 | 目标 | 实现方案 |
|------|------|---------|
| 首屏渲染 | <2s | SSG + 边缘缓存 |
| 生成 P95 | <10s | LLM 超时 + 降级 |
| 热榜分析 | <5s | 简化聚类算法 |
| 可用性 | >99.9% | Cloudflare + 降级策略 |
| 月成本 | <$5 | 免费层 + 4o-mini |

### 🚀 下一步

1. ✅ **架构评审通过** → 开始编码
2. 📦 初始化仓库（Turborepo）
3. 🗄️ 设置 Supabase 项目 + 运行迁移
4. 🎨 实现前端框架 + 首页
5. ⚡ 实现核心 Workers API
6. 🎭 实现渲染引擎 + 模板
7. 🧪 E2E 测试
8. 🚢 部署上线

---

**文档版本**：v1.0  
**最后更新**：2025-01-10  
**作者**：架构师

