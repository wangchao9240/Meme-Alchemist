# Epic 5: 热榜系统

**史诗 ID**: EPIC-5  
**优先级**: P1 (可降级)  
**估算**: 2-3 天  
**依赖**: EPIC-1 (数据基础设施)  
**目标**: 实现每日热榜抓取、聚类分析和展示，提供当日热门话题

---

## 业务价值

为用户提供今日热门话题，降低话题选择门槛。展示技术能力（爬虫、聚类、Cron）。

**降级方案**: 如果时间不够，可以使用固定的种子话题列表。

---

## 验收标准

- [ ] 实现至少 1 个热榜源抓取（Twitter/Reddit/Instagram）
- [ ] 聚类算法可运行（Jaccard 相似度）
- [ ] 每日自动执行（Cron Trigger）
- [ ] 结果缓存到 KV 和数据库
- [ ] 前端显示今日 TopN
- [ ] 降级到种子话题无缝切换

---

## 用户故事

### Story 5.1: 实现热榜抓取器

**故事 ID**: EPIC5-S1  
**优先级**: P1  
**估算**: 1 天

#### 平台选择说明

- **Reddit** (推荐 - P0):

  - ✅ 有公开 JSON API，无需认证
  - ✅ 完全免费，无限额
  - ✅ 内容质量高，话题多样
  - ⚠️ 需处理英文内容

- **Twitter** (可选 - P1):

  - ⚠️ 需要 API Key（免费层有限额）
  - ⚠️ 2023 年后 API 政策变化，可能收费
  - ✅ 实时性最强
  - 📌 作为备选，非必需

- **Instagram** (可选 - P2):
  - ⚠️ 官方 API 对趋势访问受限
  - 💡 可降级使用预定义热门标签
  - 💡 或使用第三方聚合服务

**MVP 建议**: 优先实现 Reddit，确保有稳定的免费数据源。

#### 技术任务

```typescript
// backend/src/services/trends/fetcher.ts
export interface TrendSource {
  name: string
  fetch(): Promise<RawTrend[]>
}

export interface RawTrend {
  source: string
  rank: number
  title: string
  url?: string
  hash: string
}

// Reddit 热榜抓取器（推荐 - 有官方 JSON API，无需认证）
export class RedditFetcher implements TrendSource {
  name = "reddit"
  private subreddits = ["all", "worldnews", "technology", "popular"]

  async fetch(): Promise<RawTrend[]> {
    const trends: RawTrend[] = []

    try {
      // Reddit 提供公开的 JSON API
      const response = await fetch(
        "https://www.reddit.com/r/all/hot.json?limit=50"
      )
      const data = await response.json()

      data.data.children.forEach((post: any, i: number) => {
        trends.push({
          source: this.name,
          rank: i + 1,
          title: post.data.title,
          url: `https://reddit.com${post.data.permalink}`,
          hash: this.hashTitle(post.data.title),
        })
      })

      return trends
    } catch (error) {
      console.error(`[Fetcher] ${this.name} failed:`, error)
      return []
    }
  }

  private hashTitle(title: string): string {
    return title.toLowerCase().replace(/\s+/g, "")
  }
}

// Twitter Trends 抓取器（需要 API Key）
export class TwitterFetcher implements TrendSource {
  name = "twitter"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async fetch(): Promise<RawTrend[]> {
    try {
      // 使用 Twitter API v2 获取趋势话题
      // WOEID: 1 = Worldwide
      const response = await fetch(
        "https://api.twitter.com/2/trends/place.json?id=1",
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      const data = await response.json()

      return data[0].trends.slice(0, 50).map((trend: any, i: number) => ({
        source: this.name,
        rank: i + 1,
        title: trend.name,
        url: trend.url,
        hash: this.hashTitle(trend.name),
      }))
    } catch (error) {
      console.error(`[Fetcher] ${this.name} failed:`, error)
      return []
    }
  }

  private hashTitle(title: string): string {
    return title.toLowerCase().replace(/[#\s]+/g, "")
  }
}

// Instagram Trending (通过第三方聚合 API)
export class InstagramFetcher implements TrendSource {
  name = "instagram"

  async fetch(): Promise<RawTrend[]> {
    try {
      // 注意：Instagram 官方 API 对趋势数据访问受限
      // 可以使用第三方服务如 RapidAPI 的 Instagram Trending Hashtags
      // 或者降级为使用预定义的热门标签

      // 降级方案：返回常见热门标签
      const popularHashtags = [
        "#instagood",
        "#photooftheday",
        "#fashion",
        "#beautiful",
        "#art",
        "#photography",
        "#travel",
        "#nature",
        "#food",
        "#fitness",
      ]

      return popularHashtags.map((tag, i) => ({
        source: this.name,
        rank: i + 1,
        title: tag,
        url: `https://www.instagram.com/explore/tags/${tag.slice(1)}/`,
        hash: this.hashTitle(tag),
      }))
    } catch (error) {
      console.error(`[Fetcher] ${this.name} failed:`, error)
      return []
    }
  }

  private hashTitle(title: string): string {
    return title.toLowerCase().replace(/[#\s]+/g, "")
  }
}
```

---

### Story 5.2: 实现聚类算法

**故事 ID**: EPIC5-S2  
**优先级**: P1  
**估算**: 1 天

#### 技术任务

```typescript
// backend/src/services/trends/cluster.ts
export interface ClusteredTopic {
  representative: string
  variants: string[]
  sources: string[]
  score: number
}

export class TrendClusterer {
  private readonly SIMILARITY_THRESHOLD = 0.6

  cluster(trends: RawTrend[]): ClusteredTopic[] {
    // 1. 标准化
    const normalized = this.normalize(trends)

    // 2. 去重（完全相同的标题）
    const unique = this.deduplicate(normalized)

    // 3. 聚类
    const clusters = this.clusterBySimilarity(unique)

    // 4. 打分
    const scored = this.scoreAndRank(clusters)

    // 5. 返回 Top 20
    return scored.slice(0, 20)
  }

  private normalize(trends: RawTrend[]): RawTrend[] {
    return trends.map((t) => ({
      ...t,
      title: t.title.replace(/[#\[\]【】]/g, "").trim(),
    }))
  }

  private deduplicate(trends: RawTrend[]): RawTrend[] {
    const seen = new Set<string>()
    return trends.filter((t) => {
      if (seen.has(t.hash)) return false
      seen.add(t.hash)
      return true
    })
  }

  private clusterBySimilarity(trends: RawTrend[]): ClusteredTopic[] {
    const clusters: ClusteredTopic[] = []
    const used = new Set<number>()

    for (let i = 0; i < trends.length; i++) {
      if (used.has(i)) continue

      const cluster: ClusteredTopic = {
        representative: trends[i].title,
        variants: [trends[i].title],
        sources: [trends[i].source],
        score: 0,
      }

      for (let j = i + 1; j < trends.length; j++) {
        if (used.has(j)) continue

        const similarity = this.jaccardSimilarity(
          trends[i].title,
          trends[j].title
        )

        if (similarity > this.SIMILARITY_THRESHOLD) {
          cluster.variants.push(trends[j].title)
          cluster.sources.push(trends[j].source)
          used.add(j)
        }
      }

      clusters.push(cluster)
      used.add(i)
    }

    return clusters
  }

  private jaccardSimilarity(a: string, b: string): number {
    const tokensA = new Set(this.tokenize(a))
    const tokensB = new Set(this.tokenize(b))

    const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)))
    const union = new Set([...tokensA, ...tokensB])

    return intersection.size / union.size
  }

  private tokenize(text: string): string[] {
    // 简化分词：按空格和标点
    return text
      .toLowerCase()
      .split(/[\s,，、。！？]+/)
      .filter((t) => t.length > 0)
  }

  private scoreAndRank(clusters: ClusteredTopic[]): ClusteredTopic[] {
    // 打分：cluster_size × (1 - avg_rank/100)
    // 这里简化为：cluster_size (变体数量)
    return clusters
      .map((c) => ({
        ...c,
        score: c.variants.length,
      }))
      .sort((a, b) => b.score - a.score)
  }
}
```

---

### Story 5.3: 实现 Cron 任务

**故事 ID**: EPIC5-S3  
**优先级**: P1  
**估算**: 0.5 天

#### 技术任务

```typescript
// backend/src/index.ts (添加 Cron)
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log("[Cron] Daily trends update started")

    try {
      // 1. 抓取多个来源
      const redditFetcher = new RedditFetcher()
      const redditTrends = await redditFetcher.fetch()

      // 可选：如果有 Twitter API Key
      let twitterTrends: RawTrend[] = []
      if (env.TWITTER_API_KEY) {
        const twitterFetcher = new TwitterFetcher(env.TWITTER_API_KEY)
        twitterTrends = await twitterFetcher.fetch()
      }

      // 合并所有来源
      const allTrends = [...redditTrends, ...twitterTrends]

      // 存储到 trends_raw (可选)
      // ...

      // 2. 聚类
      const clusterer = new TrendClusterer()
      const topics = clusterer.cluster(allTrends)

      // 3. 缓存
      const today = new Date().toISOString().split("T")[0]

      // 写入 KV
      if (env.CACHE) {
        await env.CACHE.put(
          `trends:${today}`,
          JSON.stringify(topics),
          { expirationTtl: 86400 * 7 } // 保留 7 天
        )
      }

      // 写入 Supabase (可选)
      // ...

      console.log(
        `[Cron] Updated ${topics.length} topics from ${allTrends.length} raw trends`
      )
    } catch (error) {
      console.error("[Cron] Failed:", error)
    }
  },
}
```

```toml
# backend/wrangler.toml (添加 Cron 配置)
[triggers]
crons = ["0 23 * * *"]  # 每天 23:00 UTC (09:00 AEST)
```

---

### Story 5.4: 前端集成

**故事 ID**: EPIC5-S4  
**优先级**: P1  
**估算**: 0.5 天

#### 技术任务

更新 `TrendSelector` 组件：

```typescript
// frontend/components/composer/TrendSelector.tsx (更新)
useEffect(() => {
  fetchTrends()
    .then((data) => {
      if (data.trends.length > 0) {
        setTrends(data.trends)
        setSource("cache") // 真实热榜
      } else {
        setTrends(SEED_TOPICS)
        setSource("seed") // 降级
      }
    })
    .catch(() => {
      setTrends(SEED_TOPICS)
      setSource("seed")
    })
}, [])

// 显示来源标签
{
  source === "cache" && <span className="text-xs">今日热榜</span>
}
{
  source === "seed" && <span className="text-xs">精选话题</span>
}
```

---

## 测试场景

### 场景 1: Cron 手动触发

```bash
# 本地测试
pnpm wrangler dev --test-scheduled
```

### 场景 2: 降级测试

- Mock 抓取失败
- 验证返回种子话题
- 验证前端正常显示

### 场景 3: 聚类验证

- 输入 50 条原始热榜
- 验证输出 ~15-20 个聚类
- 检查相似标题是否合并

---

## 风险与缓解

| 风险                       | 缓解                                           |
| -------------------------- | ---------------------------------------------- |
| Twitter API 限额或收费     | 优先使用 Reddit（免费）；降级到种子话题        |
| API 认证失败或密钥过期     | 实现多源备份；Reddit 无需认证可直接使用        |
| Instagram 趋势数据访问受限 | 使用预定义热门标签；或使用第三方聚合 API       |
| 聚类效果差（英文 vs 中文） | 调整分词和相似度阈值；允许手动话题输入         |
| Cron 不稳定                | 允许手动触发；缓存历史数据；至少保留 7 天缓存  |
| 跨地域限制或速度慢         | 使用 Cloudflare Workers 边缘计算；设置超时重试 |

---

## 完成定义 (DoD)

- [ ] 至少 1 个热榜源可用
- [ ] 聚类算法运行正常
- [ ] Cron 配置完成
- [ ] 前端显示今日热榜
- [ ] 降级策略测试通过
- [ ] 文档更新（如何手动触发 Cron）
