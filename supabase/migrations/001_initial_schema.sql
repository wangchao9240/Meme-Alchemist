-- Meme Alchemist Database Schema
-- Migration: 001_initial_schema
-- Created: 2025-01-10

-- =====================================================
-- 1. Facts Table (事实卡片表)
-- =====================================================
CREATE TABLE IF NOT EXISTS facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,                      -- 事实引用文本
  source_title TEXT,                        -- 来源标题
  url TEXT NOT NULL,                        -- 来源 URL (必须在白名单内)
  publisher TEXT,                           -- 发布者/网站名称
  date DATE,                                -- 发布/引用日期
  tags TEXT[],                              -- 标签数组 (用于检索)
  level TEXT CHECK(level IN ('A','B','C','D')), -- 质量等级
  confidence NUMERIC CHECK(confidence >= 0 AND confidence <= 1), -- 置信度 0-1
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for facts table
CREATE INDEX IF NOT EXISTS idx_facts_tags ON facts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_facts_level_conf ON facts(level, confidence DESC) WHERE level IN ('A','B');
CREATE INDEX IF NOT EXISTS idx_facts_date ON facts(date DESC);

-- =====================================================
-- 2. Trends Raw Table (原始热榜数据表)
-- =====================================================
CREATE TABLE IF NOT EXISTS trends_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,                     -- 来源平台 (reddit, twitter, instagram)
  date DATE NOT NULL,                       -- 抓取日期
  rank INTEGER NOT NULL,                    -- 排名
  title TEXT NOT NULL,                      -- 标题
  url TEXT,                                 -- 链接 (可选)
  hash TEXT NOT NULL,                       -- 标题哈希值 (用于去重)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trends_raw_date_source ON trends_raw(date, source);
CREATE INDEX IF NOT EXISTS idx_trends_raw_hash ON trends_raw(hash);

-- =====================================================
-- 3. Trends Cache Table (热榜缓存表)
-- =====================================================
CREATE TABLE IF NOT EXISTS trends_cache (
  date DATE PRIMARY KEY,
  payload JSONB NOT NULL,                   -- 聚类后的热榜数据 (JSON 格式)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. Drafts Table (草稿表 - 生成的文案)
-- =====================================================
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,                      -- 话题
  angle TEXT NOT NULL,                      -- 角度 (科普/自嘲/反差/内幕)
  facts JSONB NOT NULL,                     -- 使用的事实 (JSON 数组)
  hook TEXT,                                -- 标题/钩子
  body TEXT NOT NULL,                       -- 正文
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drafts_created_at ON drafts(created_at DESC);

-- =====================================================
-- 5. Assets Table (资源表 - 生成的图片)
-- =====================================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'png',                  -- 文件类型
  path TEXT NOT NULL,                       -- 存储路径
  ratios TEXT[],                            -- 生成的比例 ['1:1', '4:5', '9:16']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_draft_id ON assets(draft_id);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Facts: 公开只读
CREATE POLICY "Facts are viewable by everyone" ON facts
  FOR SELECT USING (true);

-- Trends Cache: 公开只读
CREATE POLICY "Trends cache is viewable by everyone" ON trends_cache
  FOR SELECT USING (true);

-- Drafts: 公开只读（展示作品）
CREATE POLICY "Drafts are viewable by everyone" ON drafts
  FOR SELECT USING (true);

-- Assets: 公开只读
CREATE POLICY "Assets are viewable by everyone" ON assets
  FOR SELECT USING (true);

-- Service role can do everything (backend API)
-- 通过 service_role key 可以完全访问

-- =====================================================
-- Comments & Documentation
-- =====================================================

COMMENT ON TABLE facts IS '事实卡片表 - 存储所有用于生成内容的事实';
COMMENT ON TABLE trends_raw IS '原始热榜数据 - 从 Reddit/Twitter 等抓取的原始数据';
COMMENT ON TABLE trends_cache IS '热榜缓存表 - 聚类后的每日热榜';
COMMENT ON TABLE drafts IS '草稿表 - LLM 生成的文案';
COMMENT ON TABLE assets IS '资源表 - 渲染的图片资源';

COMMENT ON COLUMN facts.tags IS '标签数组，用于 JIT 取材检索';
COMMENT ON COLUMN facts.level IS '质量等级: A(权威) B(可信) C(一般) D(低质)';
COMMENT ON COLUMN facts.confidence IS '置信度 0-1，表示事实的可靠程度';

-- =====================================================
-- Verification
-- =====================================================

-- Check tables created
DO $$
BEGIN
  RAISE NOTICE 'Migration 001 completed successfully!';
  RAISE NOTICE 'Created tables: facts, trends_raw, trends_cache, drafts, assets';
  RAISE NOTICE 'Created % indexes', (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('facts', 'trends_raw', 'trends_cache', 'drafts', 'assets'));
END $$;

