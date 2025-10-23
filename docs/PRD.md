# Meme Alchemist（移动端网页版）— 需求文档（MVP）

> 目标：做一款**小而有趣、可展示在简历**里的移动端网页，支持“热榜话题 + 自选领域事实”一键生成**带出处**的梗图（可选导出短视频脚本草案）。功能克制，强调演示稳定性与可追溯性。

---

## 0. 定义与术语

* **热梗/话题（Trend/Topic）**：从公共榜单抓取并聚类后的主题短语。
* **事实卡（Fact Card）**：**一句可验证的短句** + 来源链接及元数据，是生成内容的唯一“取材源”。
* **领域 / Collection**：用户自定义的主题与其下的事实集合（如“AI 术语”“Brisbane 生活”）。
* **模板（Template）**：SVG 版式的**数据化描述**（DSL），用来把文本填入图片。

---

## 1. 项目定位与边界

### 1.1 一句话

手机网页打开即可：从**今日热梗**或自填话题出发，选择领域与模板，系统在白名单来源**JIT 取材**抽出 2–4 条事实卡，**一键生成**带证据的梗图。

### 1.2 用户与场景

* **用户**：面试官 / 同学 / 老师（无需登录）。
* **场景**：扫码或点链接 → 选话题/模板 → 一键生成 → 查看证据 / 下载图片 / 复制文案。

### 1.3 明确不做（MVP 非目标）

* 账号系统、评论/点赞、自动分发到平台。
* 内容审核/风控与复杂视频合成（仅输出分镜 JSON + 字幕草案）。

---

## 2. 功能需求（FRD）

### 2.1 Try Live（生成页）

* **输入/选择**：

  * 话题（从**今日热梗 TopN**选择或手动输入）；
  * 角度：`['科普','自嘲','反差','内幕']`；
  * 模板：两栏对比 / 九宫格 / 时间线 / 词条解释 / 数据点 / 流程图（≥6 个）；
  * 领域与 Collections（可多选）。

* **JIT 取材流程**：
  1. 从已有 `facts` 表按 `tags` 检索（匹配用户选择的 Collections）；
  2. 返回候选事实 2–8 条（按 `level` 和 `confidence` 排序）；
  3. **用户勾选 2–4 条**（若候选 <2 条，提示切换领域）。

* **一键生成**：
  * 5–10 秒内出图（进度提示："取材 → 生成文案 → 渲染图片"）；
  * 可复制文案 / 下载图片 / 展开查看证据链接。

* **限频**：每 IP 每小时 10 次（演示友好）。

* **白名单验证**：所有事实卡的 `url` 必须属于 `WHITE_LISTED_DOMAINS`（在录入时验证，前台只读）。

### 2.2 热榜抓取与分析（Trends）

* **后台触发**：

  * `Fetch Now`：抓取并缓存原始热榜数据到 `trends_raw`；
  * `Analyze Now`：标准化→去重→聚类→打分→缓存 TopN。

* **聚类算法（MVP 简化方案）**：
  1. **分词**：使用简单空格/标点分词（中文可用 jieba 或跳过）；
  2. **相似度**：关键词重叠率（Jaccard 系数）；
  3. **合并**：相似度 >0.6 的标题合并为一个 topic；
  4. **打分**：`cluster_size × (1 - avg_rank/100)`；
  5. **输出**：取 Top 20，写入 `trends_cache`。

* **每日定时**：默认 **09:00 AEST**（`23:00 UTC`）自动执行 `ingest + analyze`。

* **前台消费**：`/try` 顶部横滑显示 **今日 TopN** 热梗，点选即可带入话题框。

* **降级策略**：若当日抓取/分析失败，返回昨日缓存；若仍无数据，返回固定的 10 个种子话题。

---

## 3. 非功能需求（NFR）

### 3.1 性能

* 首屏渲染 ≤ **2s**；
* 生成 P95 ≤ **10s**；
* 热榜分析 P95 ≤ **5s**（N≤100）；
* `/api/trends` 命中缓存 < 50ms。

### 3.2 稳定性与降级

| 失败场景 | 降级方案 | 用户提示 |
|---------|---------|---------|
| LLM API 超时/失败 | 使用模板化文案填充 | "当前使用经典模板" |
| 热榜抓取失败 | 返回昨日缓存 → 种子话题 | "显示昨日热榜" |
| JIT 检索无结果 | 提示用户切换领域 | "未找到相关素材，请选择其他领域" |
| 渲染失败 | 返回纯文本 JSON | "下载文案版本" |
| Supabase 连接失败 | 使用 KV 缓存的历史数据 | "离线模式" |

### 3.3 可追溯性

* 100% 作品可展开 ≥2 条事实卡并点回原文；
* 每张图显示"📎 证据"按钮，点击展示所有引用来源。

### 3.4 成本

* 使用**便宜文本模型**（如 4o-mini / Doubao/Qwen 低价档）；
* Cloudflare Workers 免费额度内运行；
* Supabase 免费层足够 MVP。

### 3.5 隐私与版权

* 仅保存"短句事实 + 链接"，不存储完整文章；
* 模板与字体使用自有/可商用资源（如 Google Fonts）；
* 不收集用户个人信息（仅 IP 用于限频）。

---

## 4. 业务流程（高层）

```
[后台 Cron/按钮] → Fetch 热榜 → Normalize/Dedup → Cluster → Score → Cache TopN
                                                             │
移动端 /try 读取今日 TopN → 选话题/角度/模板/领域 → [JIT 取材：白名单检索→抽取候选事实]
                                                             │ (勾选2–4条)
                                      选定 facts → 约束生成文案 → 模板渲染(SVG→PNG) → 展示/下载
```

---

## 5. 数据模型（简化表）

### 5.1 Facts（事实卡）

```sql
facts(
  id uuid PK,
  quote text not null,                  -- 一句可验证短句
  source_title text,
  url text not null,
  publisher text,
  date date,
  tags text[],                          -- ["AU","天气"]
  level text check(level in ('A','B','C','D')),
  confidence numeric,                   -- 0-1
  created_at timestamptz default now()
);

-- 索引（JIT 检索优化）
CREATE INDEX idx_facts_tags ON facts USING GIN(tags);
CREATE INDEX idx_facts_level_conf ON facts(level, confidence DESC) 
  WHERE level IN ('A','B');
CREATE INDEX idx_facts_date ON facts(date DESC);
```

### 5.2 Trends（热榜）

```sql
trends_raw(
  id uuid PK, source text, date date, rank int,
  title text, url text, hash text, created_at timestamptz
);

trends_topics(
  topic_id uuid PK, terms jsonb, sample_titles jsonb, created_at timestamptz
);

trends_day(
  topic_id uuid, date date, pos_score numeric,
  mov_score numeric, final_score numeric, sample_titles jsonb
);

trends_cache(
  date date PK, payload jsonb, created_at timestamptz
);
```

### 5.3 作品与素材

```sql
drafts(id uuid PK, topic text, angle text, facts jsonb, body text, created_at timestamptz);
assets(id uuid PK, draft_id uuid, type text, path text, ratios text[], created_at timestamptz);
```

---

## 6. 模板与输出 Schema

### 6.1 模板 DSL（示例）

```json
{
  "id":"two-panel-v1",
  "type":"meme_image",
  "canvas":{"w":1080,"h":1350,"bg":"#0f0f0f"},
  "slots":[
    {"name":"title","kind":"text","x":60,"y":80,"w":960,"style":"heading"},
    {"name":"left","kind":"text","x":80,"y":240,"w":420,"style":"caption"},
    {"name":"right","kind":"text","x":580,"y":240,"w":420,"style":"caption"},
    {"name":"note","kind":"text","x":60,"y":1240,"w":960,"style":"note"}
  ]
}
```

### 6.2 生成输出（LLM 约束 JSON）

```json
{
  "topic": "string",
  "angle": "one_of['科普','自嘲','反差','内幕']",
  "hook": "string",
  "body": "string",
  "facts": [{"quote":"string","source":"url"}],
  "platform_fit": [
    {"platform":"weibo","chars_max":300,"emoji_budget":2}
  ]
}
```

---

## 7. 接口定义（Workers）

### 7.1 热榜

* `POST /admin/trends/ingest` → 抓取多源写入 `trends_raw`（后台按钮/定时任务触发）。
* `POST /admin/trends/analyze` → 标准化→去重→聚类→打分→写入 `trends_cache`。
* `GET /api/trends?date=today&limit=20` → 返回 TopN 话题（供前台 `/try`）。

**单条热梗对象**

```json
{ "topic_id":"uuid", "label":"string", "score":1.23, "samples":["..",".."] }
```

### 7.2 取材/生成/渲染

* `POST /api/jit_fetch`
  **Req**

  ```json
  { "topic":"string", "collections":["AI术语","Brisbane生活"], "limit":6 }
  ```

  **Res**

  ```json
  { "candidates": [
    {"quote":"...","source_title":"...","url":"...","level":"A","confidence":0.86}
  ]}
  ```

* `POST /api/compose`
  **Req**

  ```json
  { "topic":"string", "angle":"科普", "template_id":"two-panel-v1", "facts":[{...},{...}] }
  ```

  **Res**（见 §6.2）

* `POST /api/render`
  **Req**

  ```json
  { "template_id":"two-panel-v1", "payload":{"title":"...","left":"...","right":"...","note":"..."},
    "ratios":["1:1","4:5","9:16"] }
  ```

  **Res**

  ```json
  { "images": [{"ratio":"1:1","url":"..."}], "asset_id":"uuid" }
  ```

---

## 8. 基础架构（建议）

### 8.1 组件与托管

* **前端**：Next.js + Tailwind（PWA，移动端优先） → Cloudflare Pages
* **后端**：Cloudflare Workers（API、Cron、KV/Cache）
* **存储**：Supabase（Postgres + Storage）
* **模型**：OpenAI 4o-mini 或 Doubao/Qwen 低价档（环境变量切换）

### 8.2 拓扑（ASCII）

```
[Mobile Web(PWA)]
      │  GET /api/trends /api/jit_fetch /api/compose /api/render
      ▼
[Cloudflare Workers + KV/Cache] ──Cron(23:00 UTC)──► [Trends ingest/analyze]
      │                                              │
      ▼                                              ▼
[Supabase: Postgres (facts/drafts/assets/trends_*) + Storage(图片)]
```

### 8.3 环境变量（.env）

```
LLM_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
WHITE_LISTED_DOMAINS=mdn.mozilla.org,python.org,bom.gov.au,gov.cn,who.int
```

---

## 9. 接受标准（验收用例）

### 9.1 生成一张图（成功路径）

1. 打开 `/try` 页面，选择"今日热梗 #1"；
2. 选择"科普" + "two-panel-v1" + "AI术语, Brisbane生活"；
3. 点击"取材"，`POST /api/jit_fetch` 返回 ≥4 条候选事实；
4. 用户勾选 3 条事实，点击"生成"；
5. `POST /api/compose` 返回 JSON 文案；
6. `POST /api/render` 返回 3 比例图片链接；
7. 作品展示页显示"📎 证据"按钮，点击可查看所有引用来源及原文链接。

### 9.2 边界情况处理

* **候选不足**：若 `jit_fetch` 返回 <2 条，显示提示："未找到足够素材，请切换领域或添加自定义事实"；
* **LLM 失败**：若 `compose` 超时，使用模板化文案，显示提示："当前使用经典模板"；
* **热榜失败**：若当日热榜抓取失败，显示昨日缓存或种子话题，顶部显示："显示昨日热榜"。

### 9.3 热榜自动更新

* 每日 **09:00 AEST** 自动执行 `ingest + analyze`；
* `/api/trends` 返回当日 TopN（若失败返回降级数据）；
* 分析完成后，前台刷新即可看到最新热梗。

### 9.4 性能验证

* 100 次生成中 P95 ≤ 10s；
* `/api/trends` 命中缓存响应 < 50ms；
* 首屏渲染（移动端 4G 网络）< 2s。

---

## 10. 可选增强（非 MVP）

* A/B Hook 胜率记录板；
* 短视频合成（FFmpeg/Cloudflare Stream）；
* 多语言模板；
* 收藏/分享。

---

## 11. MVP 成功指标（演示用）

- [ ] 5 个不同话题的作品展示（可通过直接链接查看）
- [ ] 每张图的事实卡都能点击跳转到真实来源
- [ ] 移动端 Lighthouse 性能分数 >85
- [ ] 从选话题到下载图片全流程 <30 秒
- [ ] README 包含二维码 + 演示截图/视频

---

## 12. 附：事实卡 CSV 模板（示例）

```csv
quote,source_title,url,publisher,date,tags,level,confidence
"布里斯班夏季日出早，6:00–7:00地铁间隔更密","Translink Timetable","https://...","Translink","2025-01-10","AU;通勤","A",0.88
"UV指数在10:00–14:00更高","BOM UV Index","https://...","BOM","2025-02-03","AU;天气","A",0.91
```
