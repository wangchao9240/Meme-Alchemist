# Meme Alchemist 🎨

> AI 驱动的梗图生成器 - 热榜话题 + 事实证据 = 有趣有据

一个小而有趣、可展示在简历的移动端网页项目，支持"热榜话题 + 自选领域事实"一键生成带出处的梗图。

## ✨ 特性

- 🔥 **实时热榜** - 自动抓取微博、知乎等平台热门话题
- ⚡ **一键生成** - 5-10 秒内生成带出处的专业梗图
- 📎 **可追溯性** - 每个事实都有来源链接，100% 可验证
- 💰 **零成本启动** - Cloudflare + Supabase 免费层即可运行
- 📱 **移动优先** - PWA 支持，完美适配移动端

## 🏗️ 技术栈

### 前端

- **框架**: Next.js 15 (App Router) + React 19
- **样式**: Tailwind CSS 4
- **状态**: Zustand + SWR
- **部署**: Cloudflare Pages

### 后端

- **运行时**: Cloudflare Workers
- **框架**: Hono.js (超轻量 3.5KB)
- **验证**: Zod
- **部署**: Wrangler CLI

### 数据

- **数据库**: Supabase Postgres
- **存储**: Supabase Storage
- **缓存**: Cloudflare KV

### AI

- **主力**: OpenAI GPT-4o-mini ($0.15/1M tokens)
- **降级**: Doubao Lite / 模板化文案

## 📁 项目结构

```
meme-alchemist/
├── frontend/           # Next.js 前端
│   ├── app/           # App Router 页面
│   ├── components/    # React 组件
│   └── lib/           # API client, stores
├── backend/           # Cloudflare Workers API
│   ├── src/
│   │   ├── routes/    # API 路由
│   │   ├── services/  # 业务逻辑
│   │   └── middleware/
│   └── wrangler.toml
├── packages/
│   └── shared/        # 共享类型和 schemas
└── docs/              # 文档
    ├── PRD.md
    └── architecture.md
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 9
- Cloudflare 账号
- Supabase 账号

### 安装依赖

```bash
pnpm install
```

### 设置环境变量

1. 复制 `.env.example` 到 `.env.local`
2. 填写必要的环境变量：
   - `NEXT_PUBLIC_API_URL`: API 地址
   - `SUPABASE_URL`: Supabase 项目 URL
   - `OPENAI_API_KEY`: OpenAI API 密钥

### 本地开发

```bash
# 前端 (http://localhost:3000)
pnpm dev:web

# 后端 (http://localhost:8787)
pnpm dev:api
```

### 部署

```bash
# 一键部署
pnpm deploy

# 或分别部署
pnpm deploy:web  # 前端 → Cloudflare Pages
pnpm deploy:api  # 后端 → Cloudflare Workers
```

## 📊 成本估算

**MVP 阶段（100 PV/天，3 次生成/天）**：

- Cloudflare Pages: **免费**
- Cloudflare Workers: **免费** (10 万请求/天)
- Supabase: **免费** (500MB)
- OpenAI API: **~$0.01/月**

**总计**: **<$1/月** 🎉

## 📝 核心功能

1. **选择话题** - 从今日热榜选择或手动输入
2. **挑选素材** - 从事实库选择 2-4 条可验证事实
3. **选择模板** - 6+ 种专业模板（对比/九宫格/时间线等）
4. **一键生成** - AI 生成文案 + 自动渲染图片
5. **查看证据** - 点击查看每个事实的原文链接

## 🎯 MVP 验收标准

- [ ] 5 个不同话题的作品展示
- [ ] 每张图的事实卡都能点击跳转到真实来源
- [ ] 移动端 Lighthouse 性能分数 >85
- [ ] 从选话题到下载图片全流程 <30 秒
- [ ] README 包含二维码 + 演示截图/视频

## 📖 文档

- [需求文档 (PRD)](./docs/PRD.md)
- [架构设计](./docs/architecture.md)

## 🤝 贡献

这是一个简历展示项目，暂不接受外部贡献。

## 📄 许可

MIT License

---

**Made with ❤️ for portfolio showcase**
