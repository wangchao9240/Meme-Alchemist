# Epic 7: 部署与发布

**史诗 ID**: EPIC-7  
**优先级**: P1  
**估算**: 1 天  
**依赖**: EPIC 1-6  
**目标**: 将应用部署到生产环境，配置监控，准备演示

---

## 业务价值

部署到真实环境，获得可分享的 URL，完成简历项目的最后一步。

---

## 验收标准

- [ ] 后端部署到 Cloudflare Workers
- [ ] 前端部署到 Cloudflare Pages
- [ ] KV Namespace 配置完成
- [ ] 环境变量正确配置
- [ ] 生产环境可正常访问
- [ ] 监控和日志可查看
- [ ] 自定义域名配置（可选）

---

## 用户故事

### Story 7.1: 部署 Cloudflare Workers

**故事 ID**: EPIC7-S1  
**优先级**: P0  
**估算**: 0.5 天

#### 技术任务

1. **创建 KV Namespace**

```bash
# 创建生产 KV
pnpm wrangler kv:namespace create CACHE

# 输出示例：
# ⛅️ wrangler 3.x
# 🌀 Creating namespace with title "meme-alchemist-CACHE"
# ✨ Success!
# Add the following to your configuration file:
# [[kv_namespaces]]
# binding = "CACHE"
# id = "abc123..."
```

2. **更新 wrangler.toml**

```toml
# backend/wrangler.toml
name = "meme-alchemist-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# 生产环境 KV
[[kv_namespaces]]
binding = "CACHE"
id = "abc123..."  # 从上一步获取

# 环境变量（通过 wrangler secret 配置）
# SUPABASE_URL
# SUPABASE_SERVICE_KEY
# OPENAI_API_KEY
```

3. **配置 Secrets**

```bash
# 设置敏感环境变量
pnpm wrangler secret put SUPABASE_URL
# 输入: https://xxx.supabase.co

pnpm wrangler secret put SUPABASE_SERVICE_KEY
# 输入: eyJhbGc...

pnpm wrangler secret put OPENAI_API_KEY
# 输入: sk-proj-...

# 可选
pnpm wrangler secret put DOUBAO_API_KEY
```

4. **部署**

```bash
cd backend
pnpm run deploy

# 输出：
# ✨ Successfully published your script to
#  https://meme-alchemist-api.<your-subdomain>.workers.dev
```

5. **验证**

```bash
# 测试健康检查
curl https://meme-alchemist-api.<your-subdomain>.workers.dev/health

# 测试 API
curl https://meme-alchemist-api.<your-subdomain>.workers.dev/api/trends
```

---

### Story 7.2: 部署 Cloudflare Pages

**故事 ID**: EPIC7-S2  
**优先级**: P0  
**估算**: 0.5 天

#### 技术任务

1. **配置前端环境变量**

```bash
# frontend/.env.production
NEXT_PUBLIC_API_URL=https://meme-alchemist-api.<your-subdomain>.workers.dev
```

2. **构建前端**

```bash
cd frontend
pnpm run build

# 验证 out/ 目录生成
ls out/
```

3. **部署到 Pages**

**方法 1: 使用 Wrangler CLI**

```bash
pnpm wrangler pages deploy out --project-name=meme-alchemist
```

**方法 2: 通过 Git 集成**

```bash
# 1. 在 Cloudflare Dashboard 创建 Pages 项目
# 2. 连接 Git 仓库
# 3. 配置构建设置：
#    - Build command: cd frontend && pnpm run build
#    - Build output directory: frontend/out
#    - Environment variables: NEXT_PUBLIC_API_URL
```

4. **验证**

```bash
# 访问部署的 URL
open https://meme-alchemist.pages.dev
```

---

### Story 7.3: 配置自定义域名（可选）

**故事 ID**: EPIC7-S3  
**优先级**: P2  
**估算**: 0.5 天

#### 技术任务

1. **添加域名到 Pages**

   - Cloudflare Dashboard → Pages → meme-alchemist → Custom Domains
   - 添加域名：`meme.yourdomain.com`
   - 配置 DNS（CNAME 或 A 记录）

2. **配置 Workers 路由**

   - Cloudflare Dashboard → Workers → meme-alchemist-api
   - 添加路由：`api.yourdomain.com/*`

3. **更新 CORS 配置**

```typescript
// backend/src/index.ts
app.use(
  "/api/*",
  cors({
    origin: ["https://meme.yourdomain.com", "https://meme-alchemist.pages.dev"],
  })
)
```

---

### Story 7.4: 监控与日志

**故事 ID**: EPIC7-S4  
**优先级**: P1  
**估算**: 0.5 天

#### 技术任务

1. **启用 Workers Analytics**

   - Cloudflare Dashboard → Workers → Analytics
   - 查看请求量、错误率、P50/P95 延迟

2. **配置日志查看**

```bash
# 实时查看 Workers 日志
pnpm wrangler tail

# 或在 Dashboard 查看
# Workers → meme-alchemist-api → Logs
```

3. **添加自定义监控（可选）**

```typescript
// backend/src/middleware/metrics.ts
export async function metricsMiddleware(c: Context, next: Next) {
  const start = Date.now()

  await next()

  const duration = Date.now() - start

  // 记录慢请求
  if (duration > 5000) {
    console.warn(`[SLOW] ${c.req.path} took ${duration}ms`)
  }

  // 可以发送到外部监控服务（如 Axiom, Logflare）
}
```

4. **健康检查端点**

```typescript
// backend/src/index.ts
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      supabase: !!c.env.SUPABASE_URL,
      openai: !!c.env.OPENAI_API_KEY,
      kv: !!c.env.CACHE,
    },
  })
})
```

---

## 部署检查清单

### 前置准备

- [ ] Cloudflare 账号创建
- [ ] Supabase 项目配置完成
- [ ] OpenAI API Key 获取
- [ ] 代码推送到 Git

### 后端部署

- [ ] KV Namespace 创建
- [ ] Secrets 配置完成
- [ ] wrangler.toml 更新
- [ ] 部署成功
- [ ] 健康检查通过
- [ ] API 测试通过

### 前端部署

- [ ] 环境变量配置
- [ ] 构建成功
- [ ] 部署到 Pages
- [ ] 页面可访问
- [ ] API 调用正常

### 监控

- [ ] Analytics 启用
- [ ] 日志可查看
- [ ] 错误追踪配置

---

## 部署脚本

```bash
#!/bin/bash
# scripts/deploy-prod.sh

set -e

echo "🚀 Starting production deployment..."

# 1. 构建前端
echo "📦 Building frontend..."
cd frontend
pnpm run build
cd ..

# 2. 部署后端
echo "☁️  Deploying backend to Workers..."
cd backend
pnpm run deploy
cd ..

# 3. 部署前端
echo "🌐 Deploying frontend to Pages..."
pnpm wrangler pages deploy frontend/out --project-name=meme-alchemist

echo "✅ Deployment complete!"
echo "Backend: https://meme-alchemist-api.<subdomain>.workers.dev"
echo "Frontend: https://meme-alchemist.pages.dev"
```

---

## 回滚计划

如果生产环境出现问题：

```bash
# 1. 回滚 Workers 到上一个版本
pnpm wrangler rollback

# 2. 回滚 Pages 到上一个部署
# Cloudflare Dashboard → Pages → Deployments → 选择上一个版本 → Rollback

# 3. 检查日志
pnpm wrangler tail
```

---

## 演示准备

### 录制演示视频

1. 打开网站
2. 选择热榜话题
3. 选择事实
4. 选择模板
5. 生成梗图
6. 查看证据
7. 下载图片

### 准备演示数据

- [ ] 至少 5 个不同话题的作品
- [ ] 截图保存
- [ ] 二维码生成

### 文档完善

- [ ] README 更新部署 URL
- [ ] 添加演示 GIF
- [ ] 更新简历项目描述

---

## 完成定义 (DoD)

- [ ] 生产环境部署成功
- [ ] 所有功能正常运行
- [ ] 监控和日志配置完成
- [ ] 演示视频录制
- [ ] 文档更新
- [ ] 项目可分享
