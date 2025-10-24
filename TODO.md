# Meme Alchemist - TODO

**最后更新**: 2025-10-23  
**当前 Sprint**: Sprint 3 ✅ COMPLETE  
**下一步**: Sprint 4 - 部署与监控

---

## ✅ 已完成

### Sprint 1: 数据与取材基础

- [x] 项目架构设计
- [x] PRD 文档
- [x] 前端项目结构搭建
- [x] 后端项目结构搭建
- [x] 共享类型和 Schemas
- [x] Supabase 数据库配置
- [x] 创建数据库表（facts, trends\_\*, drafts, assets）
- [x] 配置 RLS 策略
- [x] 创建 Storage bucket
- [x] 实现 Drizzle ORM schemas
- [x] JIT 取材 API 实现
- [x] facts 表查询实现
- [x] tags 过滤实现
- [x] 排序（level + confidence）实现
- [x] 25 条种子数据导入
- [x] 全英文国际化完成

### Sprint 2: 内容生成核心

- [x] 集成 OpenAI API (GPT-4o-mini)
- [x] 实现降级策略（OpenAI → Template Fallback）
- [x] 实现模板化文案兜底
- [x] 集成 Satori 渲染引擎
- [x] 集成 Resvg (SVG → PNG)
- [x] 实现模板系统（two-panel-v1, glossary-v1）
- [x] 实现字体加载
- [x] 上传到 Supabase Storage
- [x] `/api/compose` API 完成
- [x] `/api/render` API 完成

### Sprint 3: 热榜与前端优化

- [x] **热榜功能**

  - [x] 实现热榜抓取器（Reddit, Twitter）
  - [x] 实现聚类算法（Jaccard 相似度）
  - [x] 实现定时任务（Cron）
  - [x] KV 缓存集成
  - [x] `/api/trends` GET 端点
  - [x] `/api/trends/refresh` POST 端点
  - [x] 降级策略（Seed Topics）

- [x] **UI/UX 优化**

  - [x] UI 设计系统完整（100% 还原设计稿）
  - [x] TrendSelector 组件完成
  - [x] FactPicker 组件完成
  - [x] MemeViewer 组件完成（3 种状态）
  - [x] 添加 Loading 状态（Spinner, Skeleton）
  - [x] 添加 Error 处理（Error Boundary）
  - [x] 添加 Toast 通知
  - [x] 移动端适配优化（sticky header, fixed bottom nav）
  - [x] 自定义话题搜索功能
  - [x] 刷新按钮 Toast 通知

- [x] **性能优化**
  - [x] SWR 缓存配置
  - [x] 图片懒加载
  - [x] Code splitting
  - [x] API 降级策略

---

## 🚧 进行中 - Sprint 4

### 部署配置

- [ ] **Cloudflare Workers 部署**

  - [ ] 创建 Workers 项目
  - [ ] 配置 KV Namespace (生产环境)
  - [ ] 设置环境变量和 Secrets
  - [ ] 部署后端 API
  - [ ] 配置自定义域名（可选）

- [ ] **Cloudflare Pages 部署**

  - [ ] 连接 GitHub 仓库
  - [ ] 配置构建设置
  - [ ] 部署前端应用
  - [ ] 配置环境变量
  - [ ] 配置自定义域名（可选）

- [ ] **监控与日志**
  - [ ] 配置 Cloudflare Analytics
  - [ ] 验证错误日志
  - [ ] 验证性能监控
  - [ ] 测试生产环境

---

## 📋 待办事项

### 文档与演示

- [ ] 完善 README

  - [ ] 添加项目介绍
  - [ ] 添加技术栈说明
  - [ ] 添加快速开始指南
  - [ ] 添加部署指南
  - [ ] 添加二维码
  - [ ] 添加演示截图

- [ ] 录制演示视频

  - [ ] 录制完整流程（60s）
  - [ ] 编辑视频
  - [ ] 上传到视频平台
  - [ ] 更新 README 链接

- [ ] 准备简历材料
  - [ ] 项目描述
  - [ ] 技术亮点
  - [ ] 成果数据

### 核心功能（可选）

- [ ] 实现更多模板（目标 6 个）
- [ ] 实现证据链接展示
- [ ] 实现文案复制功能
- [ ] 实现多比例下载

### 可选功能

- [ ] 管理后台（/admin）
- [ ] 手动触发热榜更新 UI
- [ ] Facts 管理界面
- [ ] 生成历史记录
- [ ] 暗色模式支持
- [ ] 热榜历史查看

### 测试（可选）

- [ ] 单元测试（Vitest）
- [ ] E2E 测试（Playwright）
- [ ] 性能测试
- [ ] 兼容性测试

### 优化（可选）

- [ ] SEO 优化
- [ ] 图片优化（WebP）
- [ ] 字体优化（子集化）
- [ ] 缓存策略优化
- [ ] PWA 支持

---

## 🎯 MVP 验收清单

- [ ] 5 个不同话题的作品展示
- [x] 每张图的事实卡都能点击跳转到真实来源
- [ ] 移动端 Lighthouse 性能分数 >85（需部署后测试）
- [x] 从选话题到下载图片全流程 <30 秒（实际 ~15s）
- [ ] README 包含二维码 + 演示截图/视频

---

## 🐛 已知问题

_当前无已知问题_

---

## 💡 改进想法

- [ ] 添加 A/B 测试
- [ ] 添加分享功能（分享到社交媒体）
- [ ] 添加收藏功能
- [ ] 支持短视频脚本导出
- [ ] 多语言支持（中文/英文切换）
- [ ] 用户自定义模板
- [ ] 批量生成功能

---

## 📊 项目进度

**Epic 完成率**: 85.7% (6/7)  
**Story 完成率**: 94.3% (33/35)  
**整体完成度**: 85%

```
Sprint 1: [████████████████████] 100% ✅ COMPLETE
Sprint 2: [████████████████████] 100% ✅ COMPLETE
Sprint 3: [████████████████████] 100% ✅ COMPLETE
Sprint 4: [░░░░░░░░░░░░░░░░░░░░] 0%   ⏳ READY
```

---

## 📚 参考文档

- [项目进度总览](./docs/PROJECT_STATUS.md)
- [Sprint 规划](./docs/SPRINT_PLAN.md)
- [PRD 文档](./docs/PRD.md)
- [架构文档](./docs/architecture.md)
- [Sprint 3 验收报告](./docs/SPRINT3_FINAL_ACCEPTANCE.md)

---

**下一步行动**: 开始 Sprint 4 部署工作 🚀
