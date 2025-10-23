# Toast Notification System - Sprint 3

**Component**: `Toast.tsx`  
**Epic**: EPIC-6 (前端集成优化)  
**Priority**: P0  
**Status**: To Implement

---

## 🎯 Design Goals

1. **Non-intrusive** feedback for user actions
2. **Auto-dismiss** with configurable duration
3. **Multiple variants** for different message types
4. **Stack multiple toasts** when needed
5. **Accessible** with screen reader support
6. **Swipe to dismiss** on mobile

---

## 🎨 Visual Design

### Toast Container

```typescript
interface ToastContainerStyle {
  position: "fixed"
  bottom: "20px" // Mobile
  left: "50%"
  transform: "translateX(-50%)"
  zIndex: 60 // Above modals
  display: "flex"
  flexDirection: "column-reverse" // New toasts appear at bottom
  gap: "12px"
  maxWidth: "90vw"
  width: "400px"
  pointerEvents: "none" // Allow clicks through container

  // Desktop
  "@media (min-width: 768px)": {
    bottom: "32px"
    maxWidth: "500px"
  }
}
```

### Toast Card

```typescript
interface ToastStyle {
  // Base structure
  container: {
    display: "flex"
    alignItems: "start"
    gap: "12px"
    padding: "16px"
    borderRadius: "12px"
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)"
    backdropFilter: "blur(8px)"
    border: "1px solid"
    minHeight: "60px"
    maxWidth: "100%"
    pointerEvents: "auto" // Enable interaction
    cursor: "pointer" // Click to dismiss
    transition: "all 150ms ease-out"

    // Hover effect
    hover: {
      transform: "scale(1.02)"
    }
  }

  // Variants
  variants: {
    success: {
      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)"
      borderColor: "#10b981"
      icon: "✓"
      iconColor: "#ffffff"
    }

    error: {
      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)"
      borderColor: "#ef4444"
      icon: "✕"
      iconColor: "#ffffff"
    }

    warning: {
      background: "linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)"
      borderColor: "#f59e0b"
      icon: "⚠"
      iconColor: "#ffffff"
    }

    info: {
      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)"
      borderColor: "#3b82f6"
      icon: "ℹ"
      iconColor: "#ffffff"
    }

    loading: {
      background: "linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)"
      borderColor: "#a855f7"
      icon: "spinner"
      iconColor: "#ffffff"
    }
  }

  // Icon container
  icon: {
    width: "24px"
    height: "24px"
    borderRadius: "50%"
    background: "rgba(255, 255, 255, 0.2)"
    display: "flex"
    alignItems: "center"
    justifyContent: "center"
    fontSize: "14px"
    fontWeight: 700
    flexShrink: 0
  }

  // Content area
  content: {
    flex: 1
    minWidth: 0

    title: {
      fontSize: "15px"
      fontWeight: 600
      color: "#ffffff"
      lineHeight: 1.4
      marginBottom: "4px"
    }

    message: {
      fontSize: "14px"
      color: "rgba(255, 255, 255, 0.9)"
      lineHeight: 1.5
    }
  }

  // Close button
  closeButton: {
    width: "20px"
    height: "20px"
    borderRadius: "50%"
    background: "rgba(255, 255, 255, 0.2)"
    border: "none"
    color: "#ffffff"
    fontSize: "12px"
    display: "flex"
    alignItems: "center"
    justifyContent: "center"
    cursor: "pointer"
    flexShrink: 0
    transition: "all 150ms ease-out"

    hover: {
      background: "rgba(255, 255, 255, 0.3)"
      transform: "scale(1.1)"
    }
  }

  // Progress bar (auto-dismiss indicator)
  progressBar: {
    position: "absolute"
    bottom: 0
    left: 0
    height: "3px"
    background: "rgba(255, 255, 255, 0.4)"
    borderRadius: "0 0 12px 12px"
    transformOrigin: "left"
    animation: "shrink {duration}ms linear"
  }
}
```

---

## 🎬 Animations

### Enter Animation (Slide Up + Fade In)

```typescript
const enterAnimation = {
  name: "toastEnter",
  keyframes: {
    from: {
      opacity: 0,
      transform: "translateY(24px) scale(0.95)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0) scale(1)",
    },
  },
  duration: "300ms",
  easing: "cubic-bezier(0.16, 1, 0.3, 1)", // Spring ease
}
```

### Exit Animation (Slide Down + Fade Out)

```typescript
const exitAnimation = {
  name: "toastExit",
  keyframes: {
    from: {
      opacity: 1,
      transform: "translateY(0) scale(1)",
    },
    to: {
      opacity: 0,
      transform: "translateY(24px) scale(0.95)",
    },
  },
  duration: "200ms",
  easing: "ease-in",
}
```

### Progress Bar Animation

```typescript
const progressAnimation = {
  name: "shrink",
  keyframes: {
    from: {
      transform: "scaleX(1)",
    },
    to: {
      transform: "scaleX(0)",
    },
  },
  duration: "{duration}ms", // e.g., 3000ms
  easing: "linear",
}
```

### Swipe Dismiss (Mobile)

```typescript
const swipeDismiss = {
  // Touch event handling
  onTouchStart: {
    capture: "startX, startY",
  },

  onTouchMove: {
    calculate: "deltaX = currentX - startX",
    apply: "transform: translateX(deltaX)",

    // Visual feedback
    if: {
      condition: "Math.abs(deltaX) > 50",
      then: {
        opacity: "1 - (Math.abs(deltaX) / 200)",
      },
    },
  },

  onTouchEnd: {
    if: {
      condition: "Math.abs(deltaX) > 100",
      then: "dismissToast()",
      else: "spring back to position",
    },
  },

  springBack: {
    duration: "200ms",
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    transform: "translateX(0)",
    opacity: 1,
  },
}
```

---

## 🔧 State Management

### Toast State (Zustand)

```typescript
interface ToastItem {
  id: string
  type: "success" | "error" | "warning" | "info" | "loading"
  title?: string
  message: string
  duration?: number // Auto-dismiss time (ms), null = manual dismiss
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastStore {
  toasts: ToastItem[]

  // Actions
  show: (toast: Omit<ToastItem, "id">) => string
  dismiss: (id: string) => void
  dismissAll: () => void
  update: (id: string, updates: Partial<ToastItem>) => void
}

// Implementation
const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  show: (toast) => {
    const id = generateId()
    const newToast = {
      ...toast,
      id,
      duration: toast.duration ?? 3000, // Default 3s
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-dismiss
    if (newToast.duration !== null) {
      setTimeout(() => {
        get().dismiss(id)
      }, newToast.duration)
    }

    return id
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  dismissAll: () => {
    set({ toasts: [] })
  },

  update: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  },
}))
```

### Helper Functions

```typescript
// Convenience functions
const toast = {
  success: (message: string, title?: string) => {
    return useToastStore.getState().show({
      type: "success",
      title,
      message,
      duration: 3000,
    })
  },

  error: (message: string, title?: string) => {
    return useToastStore.getState().show({
      type: "error",
      title: title || "Error",
      message,
      duration: 5000, // Longer for errors
    })
  },

  warning: (message: string, title?: string) => {
    return useToastStore.getState().show({
      type: "warning",
      title,
      message,
      duration: 4000,
    })
  },

  info: (message: string, title?: string) => {
    return useToastStore.getState().show({
      type: "info",
      title,
      message,
      duration: 3000,
    })
  },

  loading: (message: string, title?: string) => {
    return useToastStore.getState().show({
      type: "loading",
      title,
      message,
      duration: null, // Manual dismiss
    })
  },

  promise: async <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    const toastId = toast.loading(messages.loading)

    try {
      const result = await promise
      useToastStore.getState().update(toastId, {
        type: "success",
        message: messages.success,
        duration: 3000,
      })
      return result
    } catch (error) {
      useToastStore.getState().update(toastId, {
        type: "error",
        message: messages.error,
        duration: 5000,
      })
      throw error
    }
  },
}
```

---

## 📋 Usage Examples

### Basic Toast

```typescript
// Success
toast.success("Meme generated successfully!")

// Error
toast.error("Failed to generate meme. Please try again.")

// With title
toast.warning("API quota exceeded", "Using fallback generator")

// Manual dismiss
const loadingToast = toast.loading("Generating meme...")
// Later...
useToastStore.getState().dismiss(loadingToast)
```

### Promise Toast (Async Operations)

```typescript
await toast.promise(composeAndRender(params), {
  loading: "Generating your meme...",
  success: "Meme ready! 🎉",
  error: "Generation failed. Please try again.",
})
```

### Toast with Action

```typescript
useToastStore.getState().show({
  type: "info",
  message: "New trends available",
  duration: 5000,
  action: {
    label: "Refresh",
    onClick: () => {
      refreshTrends()
    },
  },
})
```

### Update Existing Toast

```typescript
const toastId = toast.loading("Processing...")

// ... later
useToastStore.getState().update(toastId, {
  type: "success",
  message: "Processing complete!",
  duration: 3000,
})
```

---

## 📱 Mobile Considerations

### Touch Interactions

```typescript
const mobileInteractions = {
  // Swipe to dismiss
  swipe: {
    direction: "horizontal",
    threshold: "100px",
    feedback: {
      resistance: "Apply resistance when swiping",
      opacity: "Fade out as swipe distance increases",
    },
  },

  // Tap to dismiss
  tap: {
    target: "Anywhere on toast",
    action: "Dismiss immediately",
  },

  // Long press to pause
  longPress: {
    duration: "500ms",
    action: "Pause auto-dismiss timer",
    feedback: "Progress bar pauses",
  },
}
```

### Position on Mobile

```typescript
const mobilePosition = {
  // Bottom center (default)
  bottom: {
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",

    // Safe area for notch devices
    paddingBottom: "env(safe-area-inset-bottom)",
  },

  // Alternative: Top center
  top: {
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    paddingTop: "env(safe-area-inset-top)",
  },
}
```

---

## ♿ Accessibility

### ARIA Attributes

```typescript
const toastA11y = {
  // Container
  container: {
    role: "region",
    ariaLabel: "Notifications",
    ariaLive: "polite", // Default
  },

  // Individual toast
  toast: {
    role: "status",
    ariaLive: "polite", // 'assertive' for errors
    ariaAtomic: true,

    // Error toasts
    error: {
      ariaLive: "assertive",
      role: "alert",
    },
  },

  // Close button
  closeButton: {
    ariaLabel: "Dismiss notification",
    type: "button",
  },

  // Action button
  actionButton: {
    ariaLabel: "{actionLabel}",
    type: "button",
  },
}
```

### Screen Reader Announcements

```typescript
const screenReaderText = {
  success: "Success: {message}",
  error: "Error: {message}",
  warning: "Warning: {message}",
  info: "Information: {message}",
  loading: "Loading: {message}",
}

// Visually hidden text for screen readers
const hiddenText = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
}
```

### Keyboard Navigation

```typescript
const keyboardSupport = {
  // Focus management
  onShow: {
    action: "Do not steal focus from current element",
    reason: "Toasts are non-modal notifications",
  },

  // Dismiss with keyboard
  onEscape: {
    key: "Escape",
    action: "Dismiss focused toast or all toasts",
  },

  // Navigate between toasts
  onTab: {
    action: "Tab through toast action buttons",
  },
}
```

---

## 🎨 Advanced Features

### Stacked Toasts

```typescript
const stackedToasts = {
  maxVisible: 3,

  behavior: {
    whenExceeded: "Queue new toasts",
    queueStrategy: "FIFO (First In, First Out)",
  },

  layout: {
    spacing: "12px",
    stackDirection: "column-reverse", // New at bottom

    // Visual stacking effect (optional)
    stackedAppearance: {
      visible: {
        transform: "scale(1) translateY(0)",
        opacity: 1,
      },
      queued: {
        transform: "scale(0.95) translateY(-8px)",
        opacity: 0.8,
      },
    },
  },
}
```

### Toast Groups

```typescript
// Group related toasts
const toastGroups = {
  // Example: Download progress
  downloadGroup: {
    id: "download-123",
    toasts: [
      { message: "Starting download..." },
      { message: "Download 50% complete..." },
      { message: "Download complete!" },
    ],
    strategy: "Replace previous",
  },
}
```

### Persistent Toast

```typescript
// Toast that stays until user dismisses
const persistentToast = {
  type: "warning",
  message: "You are offline. Changes will sync when connected.",
  duration: null, // No auto-dismiss
  dismissible: true,

  // Optional: Show on every page
  persistent: true,
  persistKey: "offline-warning",
}
```

---

## 🧪 Testing Scenarios

### Visual Tests

- [ ] Toast appears in correct position
- [ ] Colors match variant
- [ ] Progress bar animates correctly
- [ ] Multiple toasts stack properly
- [ ] Swipe gesture works on mobile
- [ ] Animations are smooth (60fps)

### Interaction Tests

- [ ] Click toast to dismiss
- [ ] Click close button to dismiss
- [ ] Click action button triggers callback
- [ ] Auto-dismiss after duration
- [ ] Swipe to dismiss (mobile)
- [ ] Queue overflow handled correctly

### Accessibility Tests

- [ ] Screen reader announces toasts
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] ARIA attributes present
- [ ] Color contrast meets WCAG AA

---

## 📝 Implementation Checklist

- [ ] Create `Toast.tsx` component
- [ ] Create `useToastStore` in `lib/stores/toast.ts`
- [ ] Add toast helper functions
- [ ] Add animations to `globals.css`
- [ ] Add Toast container to root layout
- [ ] Implement swipe gesture (mobile)
- [ ] Add accessibility attributes
- [ ] Test with screen reader
- [ ] Document usage examples
- [ ] Replace all `alert()` with `toast.error()`

---

**Related Components**:

- Loading States (for `toast.loading()`)
- MemeViewer (success/error feedback)
- TrendSelector (refresh feedback)
- Error Boundary (error notifications)
