# Epic 1: 数据基础设施

**史诗 ID**: EPIC-1  
**优先级**: P0 (必须最先完成)  
**估算**: 2-3 天  
**目标**: 建立 Supabase 数据库、表结构和种子数据，为所有功能提供数据基础

---

## 业务价值

建立稳定的数据基础，支撑事实取材、热榜展示和作品存储功能。没有数据基础，所有其他功能无法运行。

---

## 验收标准

- [ ] Supabase 项目创建并配置完成
- [ ] 所有数据表创建并配置索引
- [ ] RLS 策略配置完成
- [ ] Storage bucket 创建并配置
- [ ] 至少 20 条高质量种子 facts 数据
- [ ] 10 个种子热榜话题
- [ ] 数据库迁移脚本可复用

---

## 用户故事

### Story 1.1: 初始化 Supabase 项目

**故事 ID**: EPIC1-S1  
**优先级**: P0  
**估算**: 0.5 天

#### 作为

开发者

#### 我想要

设置 Supabase 项目并配置环境变量

#### 以便于

后端可以连接到数据库和存储服务

#### 验收标准

- [ ] Supabase 项目创建
- [ ] 获取 `SUPABASE_URL` 和 `SUPABASE_SERVICE_KEY`
- [ ] 配置到 `backend/.dev.vars`
- [ ] 配置到 `frontend/.env.local`
- [ ] 连接测试成功

#### 技术任务

1. 访问 https://supabase.com 创建新项目
2. 记录项目 URL 和 API keys
3. 更新环境变量文件
4. 创建测试脚本验证连接

---

### Story 1.2: 创建数据库表结构

**故事 ID**: EPIC1-S2  
**优先级**: P0  
**估算**: 1 天

#### 作为

开发者

#### 我想要

创建所有必需的数据库表和索引

#### 以便于

应用可以存储和查询数据

#### 验收标准

- [ ] `facts` 表创建完成（含 GIN 索引）
- [ ] `trends_raw` 表创建完成
- [ ] `trends_cache` 表创建完成
- [ ] `drafts` 表创建完成
- [ ] `assets` 表创建完成
- [ ] 所有索引创建完成
- [ ] RLS 策略配置完成

#### 技术任务

1. 在 `supabase/migrations/` 创建迁移文件
2. 执行以下 SQL：

```sql
-- facts 表
CREATE TABLE facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  source_title TEXT,
  url TEXT NOT NULL,
  publisher TEXT,
  date DATE,
  tags TEXT[],
  level TEXT CHECK(level IN ('A','B','C','D')),
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_facts_tags ON facts USING GIN(tags);
CREATE INDEX idx_facts_level_conf ON facts(level, confidence DESC) WHERE level IN ('A','B');
CREATE INDEX idx_facts_date ON facts(date DESC);

-- trends_raw 表
CREATE TABLE trends_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  date DATE NOT NULL,
  rank INTEGER NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trends_raw_date_source ON trends_raw(date, source);
CREATE INDEX idx_trends_raw_hash ON trends_raw(hash);

-- trends_cache 表
CREATE TABLE trends_cache (
  date DATE PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- drafts 表
CREATE TABLE drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  angle TEXT NOT NULL,
  facts JSONB NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- assets 表
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES drafts(id),
  type TEXT DEFAULT 'png',
  path TEXT NOT NULL,
  ratios TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. 配置 RLS 策略（公开读）
4. 运行迁移并验证

---

### Story 1.3: 创建 Storage Bucket

**故事 ID**: EPIC1-S3  
**优先级**: P0  
**估算**: 0.5 天

#### 作为

开发者

#### 我想要

创建用于存储生成图片的 Storage bucket

#### 以便于

渲染的图片可以上传并公开访问

#### 验收标准

- [ ] `meme-images` bucket 创建
- [ ] Bucket 配置为公开访问
- [ ] 上传策略配置（仅 service role）
- [ ] 测试上传和访问成功

#### 技术任务

1. 在 Supabase Dashboard 创建 bucket
2. 配置为 public
3. 设置上传策略
4. 创建测试脚本验证上传

---

### Story 1.4: 准备种子数据

**故事 ID**: EPIC1-S4  
**优先级**: P0  
**估算**: 1 天

#### 作为

PO/开发者

#### 我想要

准备高质量的种子 facts 和热榜话题

#### 以便于

演示时有真实可用的数据

#### 验收标准

- [ ] 至少 20 条 facts（覆盖 3+ 领域）
- [ ] 所有 facts 都有真实来源链接
- [ ] 至少 10 个种子热榜话题
- [ ] CSV 或 SQL 格式存储
- [ ] 导入脚本可重复执行

#### 技术任务

1. 创建 `supabase/seed.sql`
2. 收集真实 facts：
   - AI 术语（5+ 条）
   - Brisbane 生活（5+ 条）
   - 科技资讯（5+ 条）
   - 其他领域（5+ 条）
3. 创建种子热榜话题
4. 编写导入脚本
5. 执行并验证数据

**示例 Facts**:

```sql
INSERT INTO facts (quote, source_title, url, publisher, tags, level, confidence) VALUES
('GPT-4o-mini 价格为 $0.15/百万tokens，比 GPT-4 便宜 99%', 'OpenAI Pricing', 'https://openai.com/pricing', 'OpenAI', ARRAY['AI','价格'], 'A', 0.95),
('布里斯班夏季（12月-2月）平均气温 25-30°C，UV 指数常达 11+', 'BOM Brisbane Climate', 'http://www.bom.gov.au/qld/brisbane/', 'BOM', ARRAY['Brisbane','天气'], 'A', 0.92),
-- ... 更多
```

---

## 风险与依赖

### 风险

- **R1**: Supabase 免费层限制可能不够 → **缓解**: 监控使用量，必要时升级
- **R2**: 种子数据质量不高 → **缓解**: 严格审核来源，确保可追溯

### 依赖

- Supabase 账号
- 白名单网站可访问

---

## 完成定义 (DoD)

- [ ] 所有表创建并可查询
- [ ] 所有索引创建
- [ ] RLS 策略生效
- [ ] Storage bucket 可上传
- [ ] 种子数据导入成功
- [ ] 迁移脚本已提交到 Git
- [ ] 文档更新（README 添加数据库设置步骤）
