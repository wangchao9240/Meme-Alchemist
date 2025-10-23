# Supabase 项目设置指南

**预计时间**: 15-30 分钟  
**难度**: 简单

---

## 🎯 目标

创建 Supabase 项目并获取必要的认证信息，为数据库和存储功能做准备。

---

## 📝 步骤

### 1. 创建 Supabase 账号并登录

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 账号登录（推荐）或邮箱注册

### 2. 创建新项目

1. 点击 "New Project"
2. 填写项目信息：

   - **Name**: `meme-alchemist`（或您喜欢的名称）
   - **Database Password**: 设置一个强密码（请记住！）
   - **Region**: 选择离您最近的区域
     - 推荐：`Southeast Asia (Singapore)` 或 `Australia (Sydney)`
   - **Pricing Plan**: Free（免费层足够 MVP 使用）

3. 点击 "Create new project"
4. 等待 1-2 分钟，项目初始化中...

### 3. 获取 API 凭据

项目创建成功后：

1. 在左侧导航栏找到 **Settings** ⚙️
2. 点击 **API**
3. 您会看到以下信息：

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...`（公开密钥，用于前端）
   - **service_role**: `eyJhbGc...`（服务密钥，用于后端）

4. **复制以下两个值**：
   - `Project URL` → 这是您的 `SUPABASE_URL`
   - `service_role` → 这是您的 `SUPABASE_SERVICE_KEY`

⚠️ **重要**: `service_role` 密钥拥有完全访问权限，不要暴露到前端或公开仓库！

### 4. 配置本地环境变量

#### 后端配置

在项目根目录创建 `backend/.dev.vars` 文件：

```bash
cd /Users/wang/Documents/qut/projects/MEME-Alchemist/backend
touch .dev.vars
```

编辑 `backend/.dev.vars`，粘贴以下内容（替换为您的实际值）：

```bash
# 必需
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...（您的 service_role 密钥）

# 可选（暂时可以不配置）
OPENAI_API_KEY=sk-...
TWITTER_API_KEY=Bearer_xxx
ADMIN_KEY=dev-secret-key
WHITE_LISTED_DOMAINS=openai.com,reddit.com,bom.gov.au
```

#### 前端配置

在项目根目录创建 `frontend/.env.local` 文件：

```bash
cd /Users/wang/Documents/qut/projects/MEME-Alchemist/frontend
touch .env.local
```

编辑 `frontend/.env.local`：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### 5. 验证连接（稍后执行）

我会创建一个测试脚本来验证连接。完成上述步骤后告诉我！

---

## ✅ 检查清单

在继续之前，确保您已完成：

- [ ] Supabase 项目创建成功
- [ ] 获取 `SUPABASE_URL`（格式：`https://xxxxx.supabase.co`）
- [ ] 获取 `SUPABASE_SERVICE_KEY`（格式：`eyJhbGc...`）
- [ ] 创建 `backend/.dev.vars` 文件
- [ ] 创建 `frontend/.env.local` 文件
- [ ] 将密钥粘贴到正确的文件中

---

## 🔒 安全提示

1. **永远不要**将 `.dev.vars` 或 `.env.local` 提交到 Git
2. 已添加到 `.gitignore`，确认一下：

   ```bash
   cat .gitignore | grep -E '\.env|\.dev\.vars'
   # 应该看到这些文件被忽略
   ```

3. 如果不小心泄露了密钥：
   - 立即在 Supabase Dashboard → Settings → API 中重置密钥
   - 更新本地配置文件

---

## 📞 遇到问题？

### Q: 找不到 service_role 密钥？

A: Settings → API → 向下滚动到 "Project API keys" 区域

### Q: 项目创建失败？

A: 检查网络连接，或稍后重试。Supabase 偶尔会有短暂延迟。

### Q: 密钥很长，是否正确？

A: 是的！JWT Token 通常有几百个字符，这是正常的。

---

## 🎉 完成后

告诉我您已经完成配置，我将：

1. 创建数据库表结构
2. 设置 Storage bucket
3. 导入种子数据
4. 运行连接测试

---

**准备好了吗？** 完成上述步骤后，回复 "Supabase 配置完成"！
