# MemeViewer Component - Sprint 3 Polish

**Component**: `MemeViewer.tsx`  
**Epic**: EPIC-6 (前端集成优化)  
**Priority**: P0  
**Status**: To Enhance

---

## 🎯 Enhancement Goals

1. **Better generation UX** with step-by-step progress
2. **Image preview optimization** with lazy loading
3. **Enhanced download options** (all ratios, with watermark toggle)
4. **Share functionality** (copy link, native share API)
5. **Evidence display** with expandable cards
6. **Regenerate options** (tweak angle, retry)

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────┐
│  🎉 Meme Generated                [Create New]│ ← Header
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ 📊 Generation Insights (optional)   │   │ ← Metadata
│  │ • LLM: OpenAI GPT-4o-mini          │   │
│  │ • Generation time: 3.2s             │   │
│  │ • Render time: 0.8s                 │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  Aspect Ratio: [1:1] [4:5] [9:16]          │ ← Ratio Selector
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │       [Image Preview]               │   │ ← Image
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 💬 Meme Text                        │   │ ← Text Content
│  │                                     │   │
│  │ **Hook**: {hook}                    │   │
│  │ {body}                              │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  [⬇ Download] [📋 Copy Text] [🔗 Share]    │ ← Actions (Row 1)
│  [⚙️ Advanced Options ▼]                    │ ← Actions (Row 2)
├─────────────────────────────────────────────┤
│  📎 Evidence & Sources (3)        [▼ Show] │ ← Evidence Section
└─────────────────────────────────────────────┘
```

---

## 🎨 Visual Design

### Header Section

```typescript
interface HeaderStyle {
  container: {
    display: "flex"
    alignItems: "center"
    justifyContent: "space-between"
    marginBottom: "24px"
  }

  title: {
    display: "flex"
    alignItems: "center"
    gap: "8px"

    icon: {
      fontSize: "24px"
      content: "🎉"
    }

    text: {
      fontSize: "24px"
      fontWeight: 600
      color: "#ffffff"
    }
  }

  resetButton: {
    display: "flex"
    alignItems: "center"
    gap: "6px"
    padding: "8px 16px"
    background: "transparent"
    border: "1px solid #404040"
    borderRadius: "8px"
    fontSize: "14px"
    color: "#a3a3a3"
    cursor: "pointer"
    transition: "all 150ms ease-out"

    hover: {
      borderColor: "#525252"
      color: "#ffffff"
      background: "rgba(64, 64, 64, 0.3)"
    }
  }
}
```

### Generation Insights (Metadata)

```typescript
interface InsightsStyle {
  container: {
    padding: "12px 16px"
    background: "rgba(168, 85, 247, 0.1)"
    border: "1px solid rgba(168, 85, 247, 0.3)"
    borderRadius: "8px"
    marginBottom: "16px"
  }

  title: {
    fontSize: "12px"
    fontWeight: 600
    color: "#c084fc" // purple-400
    textTransform: "uppercase"
    letterSpacing: "0.05em"
    marginBottom: "8px"
  }

  stats: {
    display: "grid"
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))"
    gap: "8px"

    item: {
      display: "flex"
      alignItems: "center"
      gap: "6px"
      fontSize: "13px"
      color: "#a3a3a3"

      icon: {
        fontSize: "14px"
      }

      label: {
        color: "#737373"
      }

      value: {
        fontWeight: 600
        color: "#ffffff"
      }
    }
  }
}
```

### Ratio Selector

```typescript
interface RatioSelectorStyle {
  container: {
    display: "flex"
    gap: "8px"
    marginBottom: "16px"

    // Mobile: Stack vertically
    "@media (max-width: 640px)": {
      flexDirection: "column"
    }
  }

  button: {
    // Default state
    flex: 1
    padding: "12px 20px"
    background: "#2a2a2a"
    border: "2px solid #404040"
    borderRadius: "8px"
    fontSize: "14px"
    fontWeight: 500
    color: "#a3a3a3"
    cursor: "pointer"
    transition: "all 150ms ease-out"
    display: "flex"
    alignItems: "center"
    justifyContent: "center"
    gap: "8px"
    minHeight: "44px"

    // Hover state
    hover: {
      borderColor: "#525252"
      background: "#333333"
    }

    // Selected state
    selected: {
      background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)"
      borderColor: "#a855f7"
      color: "#ffffff"
      fontWeight: 600

      icon: {
        content: "✓"
        fontSize: "16px"
      }
    }

    // Icon (ratio icon)
    icon: {
      fontSize: "18px"
    }
  }
}
```

### Image Preview

```typescript
interface ImagePreviewStyle {
  container: {
    position: "relative"
    background: "#1a1a1a"
    borderRadius: "12px"
    overflow: "hidden"
    marginBottom: "20px"

    // Aspect ratio container
    aspectRatio: {
      "1:1": "1 / 1"
      "4:5": "4 / 5"
      "9:16": "9 / 16"
    }

    // Shadow for depth
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
  }

  image: {
    width: "100%"
    height: "100%"
    objectFit: "contain"
    display: "block"

    // Loading state
    loading: {
      filter: "blur(10px)"
      opacity: 0
      transition: "all 300ms ease-out"
    }

    // Loaded state
    loaded: {
      filter: "blur(0)"
      opacity: 1
    }
  }

  // Loading overlay
  loadingOverlay: {
    position: "absolute"
    inset: 0
    display: "flex"
    alignItems: "center"
    justifyContent: "center"
    background: "rgba(0, 0, 0, 0.7)"

    spinner: {
      width: "48px"
      height: "48px"
    }
  }

  // Zoom button (top-right)
  zoomButton: {
    position: "absolute"
    top: "12px"
    right: "12px"
    width: "36px"
    height: "36px"
    background: "rgba(0, 0, 0, 0.6)"
    backdropFilter: "blur(8px)"
    border: "1px solid rgba(255, 255, 255, 0.1)"
    borderRadius: "8px"
    display: "flex"
    alignItems: "center"
    justifyContent: "center"
    cursor: "pointer"
    transition: "all 150ms ease-out"

    hover: {
      background: "rgba(0, 0, 0, 0.8)"
      borderColor: "rgba(255, 255, 255, 0.2)"
      transform: "scale(1.05)"
    }

    icon: {
      fontSize: "18px"
      color: "#ffffff"
    }
  }
}
```

### Text Content Card

```typescript
interface TextCardStyle {
  container: {
    padding: "16px"
    background: "rgba(42, 42, 42, 0.5)"
    border: "1px solid #404040"
    borderRadius: "12px"
    marginBottom: "20px"
  }

  hook: {
    fontSize: "18px"
    fontWeight: 700
    color: "#ffffff"
    marginBottom: "12px"
    lineHeight: 1.4
  }

  body: {
    fontSize: "15px"
    color: "#d4d4d4"
    lineHeight: 1.6
    whiteSpace: "pre-wrap"
  }

  // Platform tags
  platformTags: {
    marginTop: "12px"
    display: "flex"
    flexWrap: "wrap"
    gap: "6px"

    tag: {
      padding: "4px 10px"
      background: "#404040"
      borderRadius: "12px"
      fontSize: "11px"
      fontWeight: 500
      color: "#a3a3a3"
      textTransform: "uppercase"
      letterSpacing: "0.05em"

      // Platform-specific colors
      variants: {
        instagram: {
          background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 100%)"
          color: "#ffffff"
        }
        twitter: {
          background: "#1da1f2"
          color: "#ffffff"
        }
        reddit: {
          background: "#ff4500"
          color: "#ffffff"
        }
      }
    }
  }
}
```

### Action Buttons

```typescript
interface ActionButtonsStyle {
  container: {
    display: "flex"
    flexDirection: "column"
    gap: "12px"
    marginBottom: "20px"
  }

  // Primary actions row
  primaryRow: {
    display: "grid"
    gridTemplateColumns: "repeat(3, 1fr)"
    gap: "8px"

    // Mobile: Stack
    "@media (max-width: 640px)": {
      gridTemplateColumns: "1fr"
    }
  }

  // Button variants
  downloadButton: {
    background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)"
    color: "#ffffff"
    fontWeight: 600

    hover: {
      background: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)"
      transform: "scale(1.02)"
    }
  }

  copyButton: {
    background: "#2a2a2a"
    border: "1px solid #404040"
    color: "#ffffff"

    hover: {
      background: "#333333"
      borderColor: "#525252"
    }
  }

  shareButton: {
    background: "#2a2a2a"
    border: "1px solid #404040"
    color: "#ffffff"

    hover: {
      background: "#333333"
      borderColor: "#525252"
    }
  }

  // Advanced options (collapsible)
  advancedButton: {
    padding: "10px 16px"
    background: "transparent"
    border: "1px dashed #404040"
    borderRadius: "8px"
    fontSize: "14px"
    color: "#a3a3a3"
    cursor: "pointer"
    transition: "all 150ms ease-out"

    hover: {
      borderColor: "#525252"
      background: "rgba(42, 42, 42, 0.3)"
    }
  }
}
```

### Advanced Options Panel (Collapsible)

```typescript
interface AdvancedOptionsStyle {
  container: {
    marginTop: "12px"
    padding: "16px"
    background: "#1a1a1a"
    border: "1px solid #404040"
    borderRadius: "8px"

    // Enter/exit animation
    animation: {
      enter: "slideDown 200ms ease-out"
      exit: "slideUp 200ms ease-in"
    }
  }

  options: {
    display: "flex"
    flexDirection: "column"
    gap: "12px"
  }

  option: {
    display: "flex"
    alignItems: "center"
    justifyContent: "space-between"

    label: {
      fontSize: "14px"
      color: "#d4d4d4"
    }

    // Toggle switch
    toggle: {
      width: "44px"
      height: "24px"
      background: "#404040"
      borderRadius: "12px"
      position: "relative"
      cursor: "pointer"
      transition: "background 150ms ease-out"

      active: {
        background: "#a855f7"
      }

      thumb: {
        width: "18px"
        height: "18px"
        background: "#ffffff"
        borderRadius: "50%"
        position: "absolute"
        top: "3px"
        left: "3px"
        transition: "transform 150ms ease-out"

        active: {
          transform: "translateX(20px)"
        }
      }
    }
  }

  // Download all button
  downloadAllButton: {
    marginTop: "12px"
    width: "100%"
    padding: "10px"
    background: "#2a2a2a"
    border: "1px solid #404040"
    borderRadius: "8px"
    fontSize: "14px"
    color: "#ffffff"

    hover: {
      background: "#333333"
    }
  }
}
```

### Evidence Section

```typescript
interface EvidenceSectionStyle {
  header: {
    display: "flex"
    alignItems: "center"
    justifyContent: "space-between"
    padding: "12px 16px"
    background: "#2a2a2a"
    border: "1px solid #404040"
    borderRadius: "8px"
    cursor: "pointer"
    transition: "all 150ms ease-out"

    hover: {
      background: "#333333"
      borderColor: "#525252"
    }

    title: {
      fontSize: "14px"
      fontWeight: 600
      color: "#ffffff"
      display: "flex"
      alignItems: "center"
      gap: "8px"

      icon: {
        fontSize: "16px"
      }

      count: {
        padding: "2px 8px"
        background: "#a855f7"
        borderRadius: "12px"
        fontSize: "12px"
        fontWeight: 700
      }
    }

    chevron: {
      fontSize: "16px"
      color: "#737373"
      transition: "transform 200ms ease-out"

      expanded: {
        transform: "rotate(180deg)"
      }
    }
  }

  // Evidence cards (expandable)
  cards: {
    marginTop: "12px"
    display: "flex"
    flexDirection: "column"
    gap: "8px"

    // Animation
    animation: {
      enter: "fadeIn 200ms ease-out"
      exit: "fadeOut 150ms ease-in"
    }
  }

  card: {
    padding: "12px"
    background: "#1a1a1a"
    border: "1px solid #404040"
    borderRadius: "8px"

    quote: {
      fontSize: "14px"
      color: "#d4d4d4"
      lineHeight: 1.5
      marginBottom: "8px"
    }

    source: {
      display: "flex"
      alignItems: "center"
      gap: "8px"

      icon: {
        fontSize: "14px"
        color: "#a855f7"
      }

      link: {
        fontSize: "13px"
        color: "#a855f7"
        textDecoration: "none"

        hover: {
          textDecoration: "underline"
        }
      }
    }
  }
}
```

---

## 🎬 Interactions

### Generation Flow Animation

```typescript
const generationFlow = {
  stages: [
    {
      step: 1,
      message: "Analyzing facts...",
      icon: "🔍",
      duration: 2000,
    },
    {
      step: 2,
      message: "Crafting message...",
      icon: "✍️",
      duration: 3000,
    },
    {
      step: 3,
      message: "Rendering image...",
      icon: "🎨",
      duration: 2000,
    },
  ],

  // Display as progress steps
  display: {
    type: "StepProgress",
    showCurrentOnly: true,
    showCheckmarks: true,
  },
}
```

### Download Button Flow

```typescript
const downloadFlow = {
  onClick: {
    sequence: [
      {
        // 1. Show loading state
        duration: 0,
        action: "setLoading(true)",
        buttonText: "Downloading...",
      },
      {
        // 2. Fetch image
        action: "fetch(imageUrl)",
      },
      {
        // 3. Trigger download
        action: "createDownloadLink()",
      },
      {
        // 4. Show success feedback
        duration: 100,
        action: 'toast.success("Downloaded successfully!")',
      },
      {
        // 5. Reset button
        duration: 500,
        action: "setLoading(false)",
      },
    ],
  },
}
```

### Copy Text Animation

```typescript
const copyTextAnimation = {
  onClick: {
    sequence: [
      {
        // 1. Copy to clipboard
        action: "navigator.clipboard.writeText(text)",
      },
      {
        // 2. Button feedback
        duration: 200,
        buttonText: "Copied!",
        icon: "✓",
        background: "#10b981", // green
      },
      {
        // 3. Reset after delay
        delay: 2000,
        buttonText: "Copy Text",
        icon: "📋",
      },
    ],
  },
}
```

### Share Flow (Native API)

```typescript
const shareFlow = {
  onClick: async () => {
    // Check if native share is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.hook,
          text: result.body,
          url: currentImage.url,
        })

        toast.success("Shared successfully!")
      } catch (error) {
        // User cancelled or error
        if (error.name !== "AbortError") {
          // Fallback to copy link
          copyToClipboard(currentImage.url)
          toast.info("Link copied to clipboard")
        }
      }
    } else {
      // Fallback: Copy link
      copyToClipboard(currentImage.url)
      toast.success("Link copied to clipboard")
    }
  },
}
```

---

## 📱 Mobile Optimizations

### Pinch to Zoom (Image)

```typescript
const pinchZoom = {
  // Touch event handling
  onTouchStart: {
    capture: "initialDistance, initialScale",
  },

  onTouchMove: {
    if: "touches.length === 2",
    then: {
      calculate: "currentDistance",
      scale: "initialScale * (currentDistance / initialDistance)",
      clamp: "between 1 and 3",
      apply: "transform: scale(scale)",
    },
  },

  onTouchEnd: {
    if: "scale < 1.2",
    then: "spring back to scale(1)",
    else: "maintain current scale",
  },
}
```

### Image Modal (Fullscreen)

```typescript
const imageModal = {
  trigger: "Click zoom button or tap image",

  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.95)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    // Prevent body scroll
    bodyStyle: {
      overflow: "hidden",
    },

    // Close button
    closeButton: {
      position: "fixed",
      top: "20px",
      right: "20px",
      width: "44px",
      height: "44px",
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "50%",
      border: "1px solid rgba(255, 255, 255, 0.2)",

      hover: {
        background: "rgba(255, 255, 255, 0.2)",
      },
    },

    // Image
    image: {
      maxWidth: "90vw",
      maxHeight: "90vh",
      objectFit: "contain",
    },

    // Swipe down to close (mobile)
    swipeClose: {
      direction: "vertical",
      threshold: "100px",
    },
  },
}
```

---

## ♿ Accessibility

### Image Alt Text

```typescript
const imageA11y = {
  alt: `Generated meme: ${result.hook}. ${result.body}`,
  role: "img",
  ariaLabel: `Meme image in ${selectedRatio} aspect ratio`,
}
```

### Keyboard Navigation

```typescript
const keyboardSupport = {
  // Ratio selector
  ratioButtons: {
    role: "radiogroup",
    ariaLabel: "Select aspect ratio",

    button: {
      role: "radio",
      ariaChecked: "true/false",
      onEnter: "selectRatio()",
      onSpace: "selectRatio()",
      onArrowKeys: "navigate between ratios",
    },
  },

  // Image zoom
  zoomButton: {
    ariaLabel: "View fullscreen image",
    onEnter: "openModal()",
  },

  // Evidence toggle
  evidenceToggle: {
    ariaExpanded: "true/false",
    ariaControls: "evidence-cards",
    onEnter: "toggleEvidence()",
  },
}
```

---

## 📝 Implementation Checklist

- [ ] Add generation progress stepper
- [ ] Implement lazy image loading
- [ ] Add pinch-to-zoom support
- [ ] Implement fullscreen image modal
- [ ] Add native share API fallback
- [ ] Create advanced options panel
- [ ] Style evidence cards
- [ ] Add download all functionality
- [ ] Implement copy text feedback
- [ ] Add platform-specific tags
- [ ] Test on real devices
- [ ] Optimize image loading performance

---

**Related Components**:

- Toast (feedback notifications)
- Loading States (generation progress)
- Modal (fullscreen image)
