# TrendSelector Component - Sprint 3 Redesign

**Component**: `TrendSelector.tsx`  
**Epic**: EPIC-5 (热榜系统)  
**Priority**: P0  
**Status**: To Implement

---

## 🎯 Design Goals

1. **Display real-time trending topics** from Reddit/Twitter API
2. **Graceful degradation** to seed topics when API fails
3. **Clear visual hierarchy** between hot trends and custom input
4. **Mobile-optimized** touch interactions
5. **Loading skeleton** for better perceived performance

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────┐
│  🔥 Choose a Topic                          │ ← Header
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ Enter custom topic...          [→]  │   │ ← Custom Input (Always visible)
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  📊 Trending Today  [🔄 Refresh]            │ ← Section Header with Badge
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐             │
│  │  #1  │  │  #2  │  │  #3  │             │ ← Trend Cards (Grid)
│  │ 🔥   │  │ 🔥   │  │ 🔥   │             │
│  │Topic │  │Topic │  │Topic │             │
│  │Heat  │  │Heat  │  │Heat  │             │
│  └──────┘  └──────┘  └──────┘             │
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐             │
│  │  #4  │  │  #5  │  │  #6  │             │
│  └──────┘  └──────┘  └──────┘             │
│                                             │
│  ... (Total 12 cards)                       │
└─────────────────────────────────────────────┘
```

---

## 🎨 Visual Design Specification

### Component Container

```typescript
interface ContainerStyle {
  layout: {
    display: "flex"
    flexDirection: "column"
    gap: "24px" // spacing-6
  }
  spacing: {
    padding: "0" // No padding (handled by parent)
  }
}
```

### Header Section

```typescript
interface HeaderStyle {
  typography: {
    fontSize: "24px" // text-2xl
    fontWeight: 600 // semibold
    lineHeight: 1.25 // tight
    color: "#ffffff" // white
  }
  icon: {
    size: "24px"
    color: "#c084fc" // purple-400
    position: "inline"
    marginRight: "8px"
  }
}
```

### Custom Topic Input

```typescript
interface CustomInputStyle {
  container: {
    display: "flex"
    gap: "8px" // spacing-2
    width: "100%"
  }

  label: {
    fontSize: "14px" // text-sm
    color: "#a3a3a3" // gray-400
    marginBottom: "8px"
  }

  input: {
    // Default State
    flex: 1
    padding: "12px 16px"
    background: "#2a2a2a" // dark.bg.tertiary
    border: "1px solid #404040"
    borderRadius: "8px"
    color: "#ffffff"
    fontSize: "16px"
    transition: "all 150ms ease-out"

    // Focus State
    focus: {
      outline: "none"
      ring: "2px solid #a855f7" // purple-500
      borderColor: "#a855f7"
    }

    // Placeholder
    placeholder: {
      color: "#737373" // gray-500
    }
  }

  button: {
    padding: "12px 24px"
    background: "#a855f7" // purple-500
    borderRadius: "8px"
    fontSize: "16px"
    fontWeight: 500
    color: "#ffffff"
    minWidth: "100px"
    minHeight: "44px" // Touch target
    transition: "all 150ms ease-out"

    // Hover State
    hover: {
      background: "#9333ea" // purple-600
      transform: "scale(1.02)"
    }

    // Active State
    active: {
      transform: "scale(0.98)"
    }

    // Disabled State
    disabled: {
      background: "#404040"
      color: "#737373"
      cursor: "not-allowed"
      opacity: 0.5
    }
  }
}
```

### Section Header (Trending Today)

```typescript
interface SectionHeaderStyle {
  container: {
    display: "flex"
    justifyContent: "space-between"
    alignItems: "center"
    marginBottom: "12px"
  }

  title: {
    fontSize: "14px" // text-sm
    color: "#a3a3a3" // gray-400
    fontWeight: 500
    display: "flex"
    alignItems: "center"
    gap: "8px"
  }

  badge: {
    // "Today's Hot" badge
    padding: "4px 8px"
    background: "linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)"
    borderRadius: "12px"
    fontSize: "12px"
    fontWeight: 600
    color: "#ffffff"
    animation: "pulse 2s infinite"
  }

  refreshButton: {
    padding: "6px 12px"
    background: "transparent"
    border: "1px solid #404040"
    borderRadius: "6px"
    fontSize: "14px"
    color: "#a3a3a3"
    display: "flex"
    alignItems: "center"
    gap: "4px"
    cursor: "pointer"

    hover: {
      borderColor: "#525252"
      color: "#ffffff"
    }
  }
}
```

### Trend Card

```typescript
interface TrendCardStyle {
  container: {
    // Layout
    padding: "16px"
    background: "rgba(42, 42, 42, 0.5)" // dark.bg.tertiary with opacity
    backdropFilter: "blur(4px)"
    border: "1px solid #404040"
    borderRadius: "12px"
    cursor: "pointer"
    minHeight: "120px"
    display: "flex"
    flexDirection: "column"
    justifyContent: "space-between"
    transition: "all 150ms ease-out"

    // Hover State
    hover: {
      background: "#2a2a2a"
      borderColor: "#a855f7" // purple-500
      transform: "translateY(-2px)"
      shadow: "0 4px 12px rgba(168, 85, 247, 0.15)"
    }

    // Active State
    active: {
      transform: "scale(0.98)"
    }

    // Touch feedback
    touchAction: "manipulation"
    WebkitTapHighlightColor: "transparent"
  }

  rank: {
    // Top-left corner badge
    position: "absolute"
    top: "8px"
    left: "8px"
    width: "24px"
    height: "24px"
    background: "#a855f7"
    borderRadius: "50%"
    display: "flex"
    alignItems: "center"
    justifyContent: "center"
    fontSize: "12px"
    fontWeight: 700
    color: "#ffffff"
  }

  title: {
    fontSize: "14px" // text-sm
    fontWeight: 500
    lineHeight: 1.4
    color: "#ffffff"
    overflow: "hidden"
    display: "-webkit-box"
    WebkitLineClamp: 2 // Max 2 lines
    WebkitBoxOrient: "vertical"
    marginBottom: "8px"
  }

  metadata: {
    display: "flex"
    alignItems: "center"
    justifyContent: "space-between"
    fontSize: "12px"
    color: "#737373" // gray-500
    marginTop: "auto"
  }

  heatScore: {
    display: "flex"
    alignItems: "center"
    gap: "4px"
    fontSize: "12px"
    fontWeight: 600
    color: "#f59e0b" // amber-500

    icon: {
      content: "🔥"
      fontSize: "14px"
    }
  }

  source: {
    // "reddit" or "twitter" badge
    padding: "2px 6px"
    background: "#404040"
    borderRadius: "4px"
    fontSize: "10px"
    fontWeight: 500
    color: "#a3a3a3"
    textTransform: "uppercase"
  }
}
```

### Grid Layout

```typescript
interface GridLayoutStyle {
  container: {
    display: "grid"
    gap: "12px"

    // Responsive columns
    gridTemplateColumns: {
      mobile: "repeat(2, 1fr)" // 2 columns < 640px
      tablet: "repeat(3, 1fr)" // 3 columns >= 768px
      desktop: "repeat(4, 1fr)" // 4 columns >= 1024px
    }
  }
}
```

---

## 🎭 State Management

### Loading State

```typescript
interface LoadingState {
  condition: "loading === true"

  display: {
    // Show 12 skeleton cards
    skeletonCount: 12

    skeleton: {
      height: "120px"
      background: "#2a2a2a"
      borderRadius: "12px"
      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"

      // Inner skeleton elements
      children: [
        {
          type: "rank"
          width: "24px"
          height: "24px"
          borderRadius: "50%"
          position: "top-left"
        },
        {
          type: "title"
          width: "75%"
          height: "16px"
          borderRadius: "4px"
          marginTop: "32px"
        },
        {
          type: "titleLine2"
          width: "60%"
          height: "16px"
          borderRadius: "4px"
          marginTop: "8px"
        },
        {
          type: "metadata"
          width: "50%"
          height: "12px"
          borderRadius: "4px"
          position: "bottom"
        }
      ]
    }
  }
}
```

### Empty State (No Trends)

```typescript
interface EmptyState {
  condition: "trends.length === 0 && !loading"

  display: {
    container: {
      padding: "48px 24px"
      textAlign: "center"
    }

    icon: {
      content: "🔍"
      fontSize: "48px"
      marginBottom: "16px"
    }

    title: {
      text: "No trends available"
      fontSize: "18px"
      fontWeight: 600
      color: "#ffffff"
      marginBottom: "8px"
    }

    description: {
      text: "Try entering a custom topic instead"
      fontSize: "14px"
      color: "#a3a3a3"
    }
  }
}
```

### Error State

```typescript
interface ErrorState {
  condition: "error !== null"

  display: {
    container: {
      padding: "24px"
      background: "rgba(239, 68, 68, 0.1)" // Red tint
      border: "1px solid #7f1d1d"
      borderRadius: "8px"
      marginBottom: "16px"
    }

    icon: {
      content: "⚠️"
      fontSize: "24px"
      marginRight: "8px"
    }

    message: {
      fontSize: "14px"
      color: "#fca5a5" // red-300
    }

    retryButton: {
      marginTop: "12px"
      padding: "8px 16px"
      background: "#dc2626" // red-600
      borderRadius: "6px"
      fontSize: "14px"
      color: "#ffffff"

      hover: {
        background: "#b91c1c" // red-700
      }
    }
  }

  fallbackBehavior: {
    action: "Show seed topics"
    message: "Showing curated topics instead"
  }
}
```

### Source Indicator

```typescript
interface SourceIndicator {
  // Show where trends came from
  display: {
    position: "top-right"
    padding: "4px 8px"
    background: "#1a1a1a"
    borderRadius: "6px"
    fontSize: "12px"

    variants: {
      cache: {
        icon: "🔥"
        text: "Today's Hot"
        color: "#f59e0b" // amber-500
      }
      seed: {
        icon: "⭐"
        text: "Curated Topics"
        color: "#a3a3a3" // gray-400
      }
    }
  }
}
```

---

## 🎬 Interactions & Animations

### Card Click Animation

```typescript
const cardClickAnimation = {
  trigger: "onClick",

  sequence: [
    {
      // 1. Scale down (feedback)
      duration: "100ms",
      easing: "ease-out",
      transform: "scale(0.98)",
    },
    {
      // 2. Ripple effect (optional)
      duration: "300ms",
      easing: "ease-out",
      effect: "radial-gradient ripple from click point",
    },
    {
      // 3. Call onNext callback
      delay: "100ms",
      action: "onNext(topic)",
    },
  ],
}
```

### Refresh Animation

```typescript
const refreshAnimation = {
  trigger: "onRefreshClick",

  iconAnimation: {
    duration: "500ms",
    transform: "rotate(360deg)",
    easing: "ease-in-out",
  },

  dataReload: {
    // 1. Fade out current trends
    fadeOut: {
      duration: "150ms",
      opacity: 0,
    },
    // 2. Fetch new data
    fetch: "fetchTrends()",
    // 3. Fade in new trends
    fadeIn: {
      duration: "300ms",
      opacity: 1,
    },
  },
}
```

### Custom Input Focus

```typescript
const inputFocusAnimation = {
  trigger: "onFocus",

  border: {
    duration: "150ms",
    easing: "ease-out",
    color: "#a855f7", // purple-500
  },

  ring: {
    duration: "150ms",
    easing: "ease-out",
    boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.5)",
  },
}
```

---

## 📱 Responsive Behavior

### Mobile (< 640px)

```typescript
const mobileLayout = {
  grid: {
    columns: 2,
    gap: "8px",
  },

  card: {
    minHeight: "100px",
    padding: "12px",
    fontSize: {
      title: "13px",
      metadata: "11px",
    },
  },

  customInput: {
    flexDirection: "column", // Stack input and button
    button: {
      width: "100%",
    },
  },
}
```

### Tablet (640px - 1024px)

```typescript
const tabletLayout = {
  grid: {
    columns: 3,
    gap: "12px",
  },

  card: {
    minHeight: "120px",
    padding: "16px",
  },
}
```

### Desktop (>= 1024px)

```typescript
const desktopLayout = {
  grid: {
    columns: 4,
    gap: "16px",
  },

  customInput: {
    maxWidth: "600px", // Don't stretch too wide
  },
}
```

---

## 🔄 Data Flow

```typescript
// Component State
interface TrendSelectorState {
  trends: TrendTopic[]
  loading: boolean
  error: string | null
  source: "cache" | "seed" | null
  customTopic: string
}

// Lifecycle
const dataFlow = {
  onMount: [
    "1. Set loading = true",
    "2. Call fetchTrends() API",
    '3. If success: setTrends(data.topics), source = "cache"',
    '4. If fail: setTrends(SEED_TOPICS), source = "seed"',
    "5. Set loading = false",
  ],

  onRefresh: [
    "1. Set loading = true (keep current trends visible)",
    "2. Call fetchTrends() API",
    "3. If success: Update trends with fade animation",
    "4. If fail: Keep current trends, show error toast",
    "5. Set loading = false",
  ],

  onTrendClick: [
    "1. Trigger click animation",
    "2. Call onNext(trend.label)",
    "3. Parent handles step navigation",
  ],

  onCustomSubmit: [
    "1. Validate input (trim, min length)",
    "2. Call onNext(customTopic)",
    "3. Clear input",
  ],
}
```

---

## ✅ Accessibility Checklist

- [ ] All cards have `role="button"` and `tabindex="0"`
- [ ] Keyboard navigation: Enter/Space to select
- [ ] Custom input has `aria-label="Enter custom topic"`
- [ ] Loading state has `aria-busy="true"`
- [ ] Error message has `role="alert"`
- [ ] Trend cards have `aria-label` with full topic text
- [ ] Focus visible styles for keyboard users
- [ ] Screen reader announces trend count

---

## 📝 Implementation Notes

### API Integration

```typescript
// Expected API response format
interface TrendsResponse {
  topics: TrendTopic[]
  updated_at: string
  source: string
}

interface TrendTopic {
  topic_id: string
  label: string // Display text
  score: number // Heat score (0-100)
  rank: number // Position in list
  source: "reddit" | "twitter" | "seed"
  variants?: string[] // Related keywords
}
```

### Fallback Strategy

```typescript
const SEED_TOPICS: TrendTopic[] = [
  {
    topic_id: "seed-1",
    label: "Artificial Intelligence",
    score: 95,
    rank: 1,
    source: "seed",
  },
  // ... 11 more topics
]

// Fallback logic
async function loadTrends() {
  try {
    const data = await fetchTrends()
    if (data.topics.length > 0) {
      setTrends(data.topics)
      setSource("cache")
    } else {
      throw new Error("No trends returned")
    }
  } catch (error) {
    console.error("Trends fetch failed:", error)
    setTrends(SEED_TOPICS)
    setSource("seed")
    setError("Using curated topics")
  }
}
```

---

## 🎨 Design Tokens Reference

```typescript
// Use from design-system.md
import { colors, spacing, typography, transitions } from "@/design-system"

const styles = {
  card: {
    background: colors.dark.bg.tertiary,
    borderColor: colors.dark.border.default,
    borderRadius: spacing[3],
    padding: spacing[4],

    hover: {
      borderColor: colors.primary[500],
      transition: `all ${transitions.fast}`,
    },
  },
}
```

---

**Related Components**:

- FactPicker (next step)
- TemplateGrid (step 3)
- Toast (for error notifications)
