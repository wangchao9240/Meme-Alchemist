# Loading & Error States System - Sprint 3

**Epic**: EPIC-6 (前端集成优化)  
**Priority**: P0  
**Status**: To Implement

---

## 🎯 Design Goals

1. **Consistent loading patterns** across all components
2. **Informative error messages** with recovery actions
3. **Skeleton screens** for better perceived performance
4. **Accessible** loading announcements for screen readers
5. **Progressive enhancement** - show partial data if available

---

## 🎨 Loading States

### 1. Spinner Component

```typescript
interface SpinnerProps {
  size: "sm" | "md" | "lg"
  color?: string
  label?: string
}

// Visual Specification
const spinnerStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "12px",
  },

  spinner: {
    // Base styles
    border: "4px solid",
    borderRadius: "50%",
    borderTopColor: "transparent",
    animation: "spin 0.8s linear infinite",

    // Size variants
    sizes: {
      sm: {
        width: "16px",
        height: "16px",
        borderWidth: "2px",
      },
      md: {
        width: "32px",
        height: "32px",
        borderWidth: "3px",
      },
      lg: {
        width: "48px",
        height: "48px",
        borderWidth: "4px",
      },
    },

    // Color variants
    colors: {
      primary: {
        borderColor: "#404040", // gray-700
        borderTopColor: "#a855f7", // purple-500
      },
      white: {
        borderColor: "rgba(255,255,255,0.2)",
        borderTopColor: "#ffffff",
      },
    },
  },

  label: {
    fontSize: "14px",
    color: "#a3a3a3",
    fontWeight: 500,
    textAlign: "center",
  },
}

// Animation
const spinAnimation = {
  name: "spin",
  keyframes: {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
  duration: "800ms",
  timing: "linear",
  iteration: "infinite",
}
```

### 2. Skeleton Screens

#### Skeleton Card (for Trend/Fact cards)

```typescript
interface SkeletonCardStyle {
  container: {
    padding: "16px"
    background: "#2a2a2a"
    border: "1px solid #404040"
    borderRadius: "12px"
    height: "120px"
    position: "relative"
    overflow: "hidden"
  }

  // Shimmer effect
  shimmer: {
    position: "absolute"
    top: 0
    left: "-100%"
    width: "100%"
    height: "100%"
    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)"
    animation: "shimmer 2s infinite"
  }

  // Skeleton elements
  elements: [
    {
      // Rank badge
      width: "24px"
      height: "24px"
      borderRadius: "50%"
      background: "#404040"
      position: "absolute"
      top: "12px"
      left: "12px"
    },
    {
      // Title line 1
      width: "75%"
      height: "14px"
      borderRadius: "4px"
      background: "#404040"
      marginTop: "40px"
    },
    {
      // Title line 2
      width: "60%"
      height: "14px"
      borderRadius: "4px"
      background: "#404040"
      marginTop: "8px"
    },
    {
      // Metadata
      width: "40%"
      height: "12px"
      borderRadius: "4px"
      background: "#404040"
      position: "absolute"
      bottom: "12px"
    }
  ]
}

// Shimmer animation
const shimmerAnimation = {
  name: "shimmer",
  keyframes: {
    "0%": { left: "-100%" },
    "100%": { left: "100%" },
  },
  duration: "2s",
  timing: "ease-in-out",
  iteration: "infinite",
}
```

#### Skeleton Text

```typescript
interface SkeletonTextStyle {
  // For single line
  singleLine: {
    height: "16px"
    background: "#404040"
    borderRadius: "4px"
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"

    // Width variants
    widths: {
      full: "100%"
      "3/4": "75%"
      "1/2": "50%"
      "1/4": "25%"
    }
  }

  // For multi-line paragraph
  paragraph: {
    display: "flex"
    flexDirection: "column"
    gap: "8px"

    lines: [
      { width: "100%"; height: "16px" },
      { width: "95%"; height: "16px" },
      { width: "80%"; height: "16px" },
      { width: "90%"; height: "16px" }
    ]
  }
}

// Pulse animation
const pulseAnimation = {
  name: "pulse",
  keyframes: {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0.5 },
  },
  duration: "2s",
  timing: "cubic-bezier(0.4, 0, 0.6, 1)",
  iteration: "infinite",
}
```

### 3. Inline Loading States

#### Button Loading

```typescript
interface ButtonLoadingStyle {
  button: {
    // Disabled state
    cursor: "wait"
    opacity: 0.7
    pointerEvents: "none"

    // Content layout
    display: "flex"
    alignItems: "center"
    justifyContent: "center"
    gap: "8px"
  }

  spinner: {
    width: "16px"
    height: "16px"
    border: "2px solid rgba(255, 255, 255, 0.3)"
    borderTopColor: "#ffffff"
    borderRadius: "50%"
    animation: "spin 0.8s linear infinite"
  }

  text: {
    // Original button text or "Loading..."
    opacity: 0.8
  }
}

// Usage example
const buttonMarkup = `
  <button disabled class="loading">
    <SpinnerIcon />
    <span>Generating...</span>
  </button>
`
```

#### Content Area Loading Overlay

```typescript
interface LoadingOverlayStyle {
  container: {
    position: "relative"
    minHeight: "200px"
  }

  overlay: {
    position: "absolute"
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: "rgba(10, 10, 10, 0.8)"
    backdropFilter: "blur(4px)"
    display: "flex"
    flexDirection: "column"
    alignItems: "center"
    justifyContent: "center"
    gap: "16px"
    zIndex: 10

    // Enter animation
    animation: "fadeIn 150ms ease-out"
  }

  content: {
    textAlign: "center"

    spinner: {
      width: "48px"
      height: "48px"
      marginBottom: "16px"
    }

    title: {
      fontSize: "18px"
      fontWeight: 600
      color: "#ffffff"
      marginBottom: "4px"
    }

    description: {
      fontSize: "14px"
      color: "#a3a3a3"
      maxWidth: "300px"
    }
  }
}
```

---

## ❌ Error States

### 1. Inline Error Message

```typescript
interface InlineErrorStyle {
  container: {
    padding: "12px 16px"
    background: "rgba(239, 68, 68, 0.1)" // Red tint
    border: "1px solid #7f1d1d" // dark red
    borderRadius: "8px"
    display: "flex"
    alignItems: "start"
    gap: "12px"
  }

  icon: {
    fontSize: "20px"
    color: "#ef4444" // red-500
    flexShrink: 0
    content: "⚠️"
  }

  content: {
    flex: 1

    title: {
      fontSize: "14px"
      fontWeight: 600
      color: "#fca5a5" // red-300
      marginBottom: "4px"
    }

    message: {
      fontSize: "14px"
      color: "#fca5a5"
      lineHeight: 1.5
    }
  }

  dismissButton: {
    padding: "4px"
    background: "transparent"
    border: "none"
    color: "#737373"
    cursor: "pointer"

    hover: {
      color: "#ffffff"
    }
  }
}
```

### 2. Error Boundary Fallback

```typescript
interface ErrorBoundaryStyle {
  container: {
    minHeight: "100vh"
    display: "flex"
    alignItems: "center"
    justifyContent: "center"
    background: "#0a0a0a"
    padding: "24px"
  }

  content: {
    maxWidth: "500px"
    textAlign: "center"

    icon: {
      fontSize: "64px"
      marginBottom: "24px"
      content: "😵"
    }

    title: {
      fontSize: "24px"
      fontWeight: 700
      color: "#ffffff"
      marginBottom: "12px"
      text: "Oops! Something went wrong"
    }

    message: {
      fontSize: "16px"
      color: "#a3a3a3"
      lineHeight: 1.6
      marginBottom: "24px"
      text: "We're sorry for the inconvenience. Please try refreshing the page."
    }

    actions: {
      display: "flex"
      gap: "12px"
      justifyContent: "center"

      reloadButton: {
        padding: "12px 24px"
        background: "#a855f7"
        borderRadius: "8px"
        fontSize: "16px"
        fontWeight: 500
        color: "#ffffff"

        hover: {
          background: "#9333ea"
        }
      }

      homeButton: {
        padding: "12px 24px"
        background: "transparent"
        border: "1px solid #404040"
        borderRadius: "8px"
        fontSize: "16px"
        color: "#a3a3a3"

        hover: {
          borderColor: "#525252"
          color: "#ffffff"
        }
      }
    }

    details: {
      marginTop: "32px"
      padding: "16px"
      background: "#1a1a1a"
      borderRadius: "8px"
      textAlign: "left"

      toggle: {
        fontSize: "12px"
        color: "#737373"
        cursor: "pointer"
        marginBottom: "8px"

        hover: {
          color: "#a3a3a3"
        }
      }

      errorStack: {
        fontSize: "12px"
        fontFamily: "monospace"
        color: "#ef4444"
        whiteSpace: "pre-wrap"
        overflow: "auto"
        maxHeight: "200px"
      }
    }
  }
}
```

### 3. Empty State (No Data)

```typescript
interface EmptyStateStyle {
  container: {
    padding: "64px 24px"
    textAlign: "center"
  }

  illustration: {
    width: "120px"
    height: "120px"
    margin: "0 auto 24px"
    opacity: 0.5

    // Can be image, SVG, or emoji
    content: "🔍"
    fontSize: "80px"
  }

  title: {
    fontSize: "20px"
    fontWeight: 600
    color: "#ffffff"
    marginBottom: "8px"
  }

  description: {
    fontSize: "14px"
    color: "#a3a3a3"
    lineHeight: 1.6
    maxWidth: "400px"
    margin: "0 auto 24px"
  }

  cta: {
    padding: "10px 20px"
    background: "#a855f7"
    borderRadius: "8px"
    fontSize: "14px"
    fontWeight: 500
    color: "#ffffff"

    hover: {
      background: "#9333ea"
    }
  }
}
```

### 4. Network Error with Retry

```typescript
interface NetworkErrorStyle {
  container: {
    padding: "40px 24px"
    textAlign: "center"
    background: "rgba(239, 68, 68, 0.05)"
    border: "1px dashed #7f1d1d"
    borderRadius: "12px"
  }

  icon: {
    fontSize: "48px"
    marginBottom: "16px"
    content: "📡"
  }

  title: {
    fontSize: "18px"
    fontWeight: 600
    color: "#ffffff"
    marginBottom: "8px"
    text: "Connection Error"
  }

  message: {
    fontSize: "14px"
    color: "#a3a3a3"
    marginBottom: "20px"
    text: "Unable to load data. Please check your connection."
  }

  retryButton: {
    padding: "10px 20px"
    background: "#dc2626"
    borderRadius: "8px"
    fontSize: "14px"
    fontWeight: 500
    color: "#ffffff"
    display: "inline-flex"
    alignItems: "center"
    gap: "8px"

    hover: {
      background: "#b91c1c"
    }

    icon: {
      width: "16px"
      height: "16px"
    }
  }

  // Retry count indicator
  retryCount: {
    marginTop: "12px"
    fontSize: "12px"
    color: "#737373"
    text: "Retry attempt {count}/3"
  }
}
```

---

## 🎬 State Transitions

### Loading → Success

```typescript
const loadingToSuccessTransition = {
  sequence: [
    {
      // 1. Fade out loading state
      duration: "150ms",
      easing: "ease-out",
      opacity: 0,
    },
    {
      // 2. Swap content (loading → data)
      immediate: true,
    },
    {
      // 3. Fade in data with slide up
      duration: "300ms",
      easing: "ease-out",
      opacity: "0 → 1",
      transform: "translateY(16px) → translateY(0)",
    },
  ],
}
```

### Loading → Error

```typescript
const loadingToErrorTransition = {
  sequence: [
    {
      // 1. Fade out loading
      duration: "150ms",
      opacity: 0,
    },
    {
      // 2. Show error with shake animation
      duration: "500ms",
      animation: "shake",
      keyframes: {
        "0%, 100%": { transform: "translateX(0)" },
        "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
        "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
      },
    },
  ],
}
```

### Retry Button Click

```typescript
const retryButtonAnimation = {
  onClick: {
    // 1. Button feedback
    button: {
      transform: "scale(0.95)",
      duration: "100ms",
    },

    // 2. Icon spin
    icon: {
      transform: "rotate(360deg)",
      duration: "500ms",
      easing: "ease-in-out",
    },

    // 3. Fade out error, fade in loading
    transition: {
      duration: "200ms",
      opacity: "1 → 0 → 1",
    },
  },
}
```

---

## 📋 Component-Specific Loading States

### TrendSelector Loading

```typescript
const trendSelectorLoading = {
  display: "SkeletonGrid",
  config: {
    columns: 2, // mobile
    rows: 6, // 12 cards total
    skeletonType: "TrendCard",
  },
}
```

### FactPicker Loading

```typescript
const factPickerLoading = {
  display: "SkeletonList",
  config: {
    count: 8,
    skeletonType: "FactCard",
    spacing: "12px",
  },
}
```

### MemeViewer Loading (Generation)

```typescript
const memeGenerationLoading = {
  display: "LoadingOverlay",
  config: {
    spinner: "large",
    title: "Generating your meme...",
    steps: [
      { text: "Analyzing facts...", duration: 2000 },
      { text: "Crafting message...", duration: 3000 },
      { text: "Rendering image...", duration: 2000 },
    ],

    // Progress indicator (optional)
    progress: {
      show: true,
      type: "steps", // or 'percentage'
      current: 1,
      total: 3,
    },
  },
}
```

---

## ♿ Accessibility

### Loading Announcements

```typescript
const loadingA11y = {
  // Live region for screen readers
  liveRegion: {
    role: "status",
    ariaLive: "polite",
    ariaAtomic: true,
  },

  // Loading state
  loading: {
    ariaLabel: "Loading content",
    ariaBusy: true,
    text: "Loading... Please wait",
  },

  // Success state
  success: {
    ariaBusy: false,
    text: "Content loaded successfully",
  },

  // Error state
  error: {
    role: "alert",
    ariaLive: "assertive",
    ariaBusy: false,
    text: "Error: {errorMessage}",
  },
}
```

### Focus Management

```typescript
const focusManagement = {
  // When loading completes
  onLoadComplete: {
    action: "Focus first interactive element",
    announceCount: "Loaded {count} items",
  },

  // When error occurs
  onError: {
    action: "Focus retry button",
    announce: "Error occurred. {errorMessage}",
  },

  // Retry button
  retryButton: {
    ariaLabel: "Retry loading content",
    ariaDescribedBy: "error-message-id",
  },
}
```

---

## 🎨 Design Tokens Reference

```typescript
// Loading colors
const loadingColors = {
  spinner: {
    border: "#404040",
    active: "#a855f7",
  },
  skeleton: {
    base: "#2a2a2a",
    shimmer: "rgba(255,255,255,0.05)",
  },
  overlay: {
    background: "rgba(10, 10, 10, 0.8)",
  },
}

// Error colors
const errorColors = {
  background: "rgba(239, 68, 68, 0.1)",
  border: "#7f1d1d",
  text: "#fca5a5",
  icon: "#ef4444",
}

// Timing
const timing = {
  fast: "150ms",
  base: "300ms",
  slow: "500ms",
  shimmer: "2s",
  pulse: "2s",
}
```

---

## 📝 Usage Examples

### Component with Loading State

```typescript
function ExampleComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  if (loading) {
    return <Spinner size="lg" label="Loading data..." />
  }

  if (error) {
    return <NetworkError message={error.message} onRetry={() => fetchData()} />
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No data found"
        description="Try adjusting your filters"
        ctaText="Reset Filters"
        onCta={() => resetFilters()}
      />
    )
  }

  return <DataDisplay data={data} />
}
```

---

**Related Components**:

- Toast Notification System
- TrendSelector
- FactPicker
- MemeViewer
