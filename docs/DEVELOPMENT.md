# 开发指南

## 快速开始

### 1. 安装依赖

```bash
# 安装 pnpm (如果还没有)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 2. 设置环境变量

**前端 (frontend/.env.local)**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
```

**后端 (backend/.dev.vars)**:

```bash
# 必需
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# 可选但推荐
OPENAI_API_KEY=sk-...

# 可选 - 热榜功能
TWITTER_API_KEY=Bearer_xxx  # Twitter API v2 (可选，有免费限额)

# 其他可选
ADMIN_KEY=dev-secret-key
WHITE_LISTED_DOMAINS=mdn.mozilla.org,python.org
DOUBAO_API_KEY=xxx  # 豆包 API (可选)
```

### 3. 本地开发

**启动前端**:

```bash
cd frontend
pnpm dev
# 访问 http://localhost:3000
```

**启动后端**:

```bash
cd backend
pnpm dev
# 访问 http://localhost:8787
```

**或者并行启动**:

```bash
# 在根目录
pnpm dev
```

## 项目结构

```
frontend/
├── app/              # Next.js 15 App Router
│   ├── page.tsx      # 首页
│   ├── try/          # 生成页
│   └── layout.tsx    # 根布局
├── components/       # React 组件
│   ├── composer/     # 创作流程组件
│   └── viewer/       # 结果展示组件
└── lib/              # 工具函数
    ├── api-client.ts # API 调用
    └── stores/       # Zustand 状态管理

backend/
├── src/
│   ├── index.ts      # 主入口
│   ├── routes/       # API 路由
│   │   ├── trends.ts
│   │   ├── jit.ts
│   │   ├── compose.ts
│   │   └── render.ts
│   ├── middleware/   # 中间件
│   └── services/     # 业务逻辑 (TODO)
└── wrangler.toml     # Workers 配置

packages/
└── shared/           # 前后端共享
    ├── types/        # TypeScript 类型
    └── schemas/      # Zod 验证 schemas
```

## 开发工作流

### 前端开发

1. **创建新页面**: 在 `frontend/app/` 下创建新目录
2. **创建组件**: 在 `frontend/components/` 下按功能分类
3. **API 调用**: 使用 `lib/api-client.ts` 中的封装方法
4. **状态管理**: 使用 Zustand (`lib/stores/`)

### 后端开发

1. **添加新路由**: 在 `backend/src/routes/` 创建新文件
2. **注册路由**: 在 `backend/src/index.ts` 中注册
3. **添加验证**: 使用 Zod schemas (`packages/shared/schemas/`)
4. **测试**: 使用 `wrangler dev` 本地测试

### 添加新类型

1. 在 `packages/shared/types/index.ts` 添加 TypeScript 类型
2. 在 `packages/shared/schemas/index.ts` 添加 Zod schema
3. 前后端自动获得类型提示

## 常用命令

```bash
# 开发
pnpm dev              # 启动所有服务
pnpm dev:web          # 仅前端
pnpm dev:api          # 仅后端

# 构建
pnpm build            # 构建前端
pnpm build:api        # 构建后端

# 类型检查
pnpm typecheck        # 所有包

# 部署
pnpm deploy           # 部署所有
pnpm deploy:web       # 仅前端
pnpm deploy:api       # 仅后端
```

## Cloudflare Workers 本地开发

### 设置 KV 命名空间

```bash
# 创建 KV namespace
wrangler kv:namespace create CACHE
wrangler kv:namespace create CACHE --preview

# 更新 wrangler.toml 中的 ID
```

### 设置 Secrets

```bash
cd backend
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put ADMIN_KEY
```

### 测试 Cron

```bash
# 本地触发 cron (需要部署后)
wrangler dev --test-scheduled
```

## Supabase 设置

### 创建数据库表

1. 创建 Supabase 项目
2. 运行 SQL 迁移文件（参考 PRD 中的 schema）
3. 设置 RLS 策略
4. 创建 Storage bucket

### 种子数据

```bash
# TODO: 添加种子数据脚本
pnpm db:seed
```

## 调试技巧

### 前端调试

- 使用 React DevTools
- 查看 Network 面板查看 API 调用
- 使用 `console.log` 或 debugger

### 后端调试

- 使用 `console.log` (会显示在 wrangler dev 输出中)
- 查看 Cloudflare Dashboard 的 Logs
- 使用 Postman/Insomnia 测试 API

## 性能优化

### 前端

- 使用 Next.js Image 组件（注意：export 模式下需 unoptimized）
- 懒加载组件
- 使用 SWR 缓存 API 响应

### 后端

- 使用 KV 缓存频繁查询
- 限制 Supabase 查询数量
- 使用 Cloudflare Workers 边缘计算

## 常见问题

### Q: pnpm install 失败

A: 确保 Node.js >= 18，pnpm >= 9

### Q: wrangler dev 报错

A: 检查 wrangler.toml 配置，确保 KV namespace 已创建

### Q: API 调用 CORS 错误

A: 检查后端 CORS 配置，本地开发时应允许 localhost

### Q: 类型错误

A: 运行 `pnpm typecheck` 查看具体错误

## 下一步

- [ ] 实现 Supabase 数据库集成
- [ ] 实现 LLM API 调用（OpenAI/Doubao）
- [ ] 实现图片渲染（Satori + Sharp）
- [ ] 实现热榜抓取和分析
- [ ] 添加测试
- [ ] 性能优化

## 参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [Hono 文档](https://hono.dev/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Supabase 文档](https://supabase.com/docs)
