# Epic 6: 前端集成与优化

**史诗 ID**: EPIC-6  
**优先级**: P1  
**估算**: 1-2 天  
**依赖**: EPIC 1-5  
**目标**: 完善前端用户体验，实现移动端优化，提升可用性和美观度

---

## 业务价值

良好的用户体验是简历项目的加分项，展示前端能力和对细节的关注。

---

## 验收标准

- [ ] 所有组件集成真实数据
- [ ] Loading/Error 状态完善
- [ ] 移动端适配完美
- [ ] Lighthouse 分数 >85
- [ ] Toast 通知系统
- [ ] PWA 基础功能（可选）

---

## 用户故事

### Story 6.1: 完善加载和错误状态

**故事 ID**: EPIC6-S1  
**优先级**: P0  
**估算**: 0.5 天

#### 技术任务

1. **统一 Loading 组件**

```typescript
// frontend/components/ui/Spinner.tsx
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-gray-300 border-t-primary",
          sizeClasses[size]
        )}
      />
    </div>
  )
}

// Skeleton 组件
export function FactCardSkeleton() {
  return (
    <div className="animate-pulse border rounded-lg p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}
```

2. **Toast 通知系统**

```typescript
// frontend/lib/stores/toast.ts
import { create } from "zustand"

interface ToastState {
  message: string
  type: "success" | "error" | "info"
  show: boolean
  showToast: (message: string, type: "success" | "error" | "info") => void
  hideToast: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  message: "",
  type: "info",
  show: false,
  showToast: (message, type) => {
    set({ message, type, show: true })
    setTimeout(() => set({ show: false }), 3000)
  },
  hideToast: () => set({ show: false }),
}))

// frontend/components/ui/Toast.tsx
export function Toast() {
  const { message, type, show, hideToast } = useToastStore()

  if (!show) return null

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type]

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50",
        bgColor,
        "text-white font-medium animate-slide-up"
      )}
    >
      {message}
    </div>
  )
}
```

3. **错误边界**

```typescript
// frontend/components/ErrorBoundary.tsx
"use client"

import { Component, ReactNode } from "react"

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

### Story 6.2: 移动端适配优化

**故事 ID**: EPIC6-S2  
**优先级**: P0  
**估算**: 0.5 天

#### 技术任务

1. **响应式布局检查**

```typescript
// frontend/app/try/page.tsx (优化)
<div className="min-h-screen bg-gray-50 pb-20 safe-area-inset">
  {/* 进度指示 */}
  <div className="sticky top-0 bg-white z-10 shadow-sm">
    <div className="max-w-2xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between text-sm">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex-1 text-center",
              step === s ? "text-primary font-semibold" : "text-gray-400"
            )}
          >
            {i + 1}. {s}
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* 主内容区 */}
  <div className="max-w-2xl mx-auto px-4 py-6">{/* 步骤内容 */}</div>

  {/* 底部操作栏 */}
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t safe-area-inset-bottom">
    <div className="max-w-2xl mx-auto px-4 py-3 flex gap-3">
      <button onClick={goBack} className="btn-secondary flex-1">
        上一步
      </button>
      <button onClick={goNext} className="btn-primary flex-1">
        下一步
      </button>
    </div>
  </div>
</div>
```

2. **触摸优化**

```css
/* frontend/app/globals.css (添加) */
@layer utilities {
  /* 安全区域 */
  .safe-area-inset {
    padding-top: env(safe-area-inset-top);
  }
  .safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* 触摸目标最小尺寸 */
  .touch-target {
    @apply min-h-[44px] min-w-[44px];
  }

  /* 禁用点击高亮 */
  .no-tap-highlight {
    -webkit-tap-highlight-color: transparent;
  }
}
```

3. **滚动优化**

```typescript
// 平滑滚动到下一步
const goToNextStep = () => {
  setStep(nextStep)
  window.scrollTo({ top: 0, behavior: "smooth" })
}
```

---

### Story 6.3: 性能优化

**故事 ID**: EPIC6-S3  
**优先级**: P1  
**估算**: 0.5 天

#### 技术任务

1. **图片懒加载**

```typescript
// frontend/components/viewer/MemeViewer.tsx
<Image
  src={result.images[0].url}
  alt="Generated meme"
  width={1080}
  height={1080}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

2. **Code Splitting**

```typescript
// frontend/app/try/page.tsx
import dynamic from "next/dynamic"

const MemeViewer = dynamic(() => import("@/components/viewer/MemeViewer"), {
  loading: () => <Spinner />,
})
```

3. **API 缓存**

```typescript
// frontend/lib/api-client.ts (添加 SWR 缓存)
import useSWR from "swr"

export function useTrends() {
  return useSWR("/api/trends", fetchTrends, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 分钟内复用
  })
}
```

---

### Story 6.4: PWA 基础功能（可选）

**故事 ID**: EPIC6-S4  
**优先级**: P2  
**估算**: 0.5 天

#### 技术任务

```typescript
// frontend/app/manifest.ts
import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Meme Alchemist",
    short_name: "MemeAlc",
    description: "AI-powered meme generator with evidence",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
```

---

## 测试清单

### 移动端

- [ ] iPhone SE (375px)
- [ ] iPhone 14 (390px)
- [ ] iPad (768px)
- [ ] 横屏模式

### 性能

- [ ] Lighthouse Performance >85
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s
- [ ] Cumulative Layout Shift <0.1

### 可访问性

- [ ] 键盘导航
- [ ] ARIA 标签
- [ ] 色彩对比度 >4.5:1

---

## 完成定义 (DoD)

- [ ] 所有加载状态完善
- [ ] Toast 通知系统可用
- [ ] 移动端适配完美
- [ ] Lighthouse 分数达标
- [ ] 代码审查通过
- [ ] 真机测试通过
