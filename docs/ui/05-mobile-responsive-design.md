# Mobile Responsive Design - Sprint 3

**Epic**: EPIC-6 (前端集成优化)  
**Priority**: P0  
**Status**: To Implement

---

## 🎯 Design Goals

1. **Mobile-first approach** - Design for smallest screen, enhance for larger
2. **Touch-optimized** - All interactive elements ≥ 44px
3. **Safe area aware** - Support notch and home indicator
4. **Performance** - Smooth 60fps scrolling and animations
5. **PWA ready** - Add to home screen support

---

## 📱 Breakpoints Strategy

### Defined Breakpoints

```typescript
const breakpoints = {
  // Mobile
  xs: "0px", // Tiny phones (< 375px)
  sm: "375px", // iPhone SE, small phones

  // Mobile landscape / small tablets
  md: "640px", // Mobile landscape

  // Tablets
  lg: "768px", // iPad portrait
  xl: "1024px", // iPad landscape

  // Desktop
  "2xl": "1280px", // Desktop
}
```

### Design for Each Breakpoint

```typescript
const layouts = {
  // Mobile Portrait (default, 375px - 640px)
  mobile: {
    container: {
      maxWidth: "100%",
      padding: "16px",
    },

    grid: {
      columns: 1, // Single column
      gap: "12px",
    },

    typography: {
      h1: "24px",
      h2: "20px",
      body: "16px", // Never smaller than 16px (iOS zoom)
    },

    spacing: {
      section: "24px",
      component: "16px",
    },
  },

  // Mobile Landscape / Small Tablet (640px - 768px)
  mobileLandscape: {
    container: {
      maxWidth: "640px",
      padding: "20px",
    },

    grid: {
      columns: 2, // 2 columns for cards
      gap: "16px",
    },
  },

  // Tablet Portrait (768px - 1024px)
  tablet: {
    container: {
      maxWidth: "768px",
      padding: "32px",
    },

    grid: {
      columns: 3, // 3 columns for cards
      gap: "20px",
    },

    typography: {
      h1: "30px",
      h2: "24px",
      body: "16px",
    },
  },

  // Desktop (1024px+)
  desktop: {
    container: {
      maxWidth: "1200px",
      padding: "40px",
    },

    grid: {
      columns: 4, // 4 columns for cards
      gap: "24px",
    },

    typography: {
      h1: "36px",
      h2: "28px",
      body: "16px",
    },

    // Show side navigation, etc.
    features: {
      sidebar: true,
      compactHeader: false,
    },
  },
}
```

---

## 👆 Touch Interactions

### Touch Target Sizes

```typescript
const touchTargets = {
  // Minimum sizes (Apple HIG / Material Design)
  minimum: {
    width: "44px",
    height: "44px",
  },

  // Recommended sizes
  recommended: {
    primary: "48px", // Main actions
    secondary: "44px", // Secondary actions
    tertiary: "36px", // Compact areas
  },

  // Spacing between targets
  spacing: {
    minimum: "8px", // Prevent mis-taps
    recommended: "12px",
  },
}
```

### Touch Feedback

```css
/* Base touch styles */
.touch-target {
  /* Minimum size */
  min-width: 44px;
  min-height: 44px;

  /* Disable browser defaults */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;

  /* Touch manipulation for faster taps */
  touch-action: manipulation;

  /* Visual feedback */
  transition: transform 150ms ease-out, opacity 150ms ease-out;
}

.touch-target:active {
  transform: scale(0.95);
  opacity: 0.8;
}

/* Specific for buttons */
button.touch-target {
  cursor: pointer;
  -webkit-appearance: none;
}

/* Prevent double-tap zoom on buttons */
button {
  touch-action: manipulation;
}
```

### Gesture Support

```typescript
const gestures = {
  // Swipe gestures
  swipe: {
    // Toast dismiss
    toastDismiss: {
      direction: "horizontal",
      threshold: "100px",
      velocity: "0.5px/ms",
    },

    // Image gallery navigation
    imageNav: {
      direction: "horizontal",
      threshold: "50px",
    },

    // Modal dismiss
    modalDismiss: {
      direction: "vertical",
      threshold: "100px",
      direction: "down",
    },
  },

  // Pinch gestures
  pinch: {
    // Image zoom
    imageZoom: {
      minScale: 1,
      maxScale: 3,
      doubleTapZoom: 2,
    },
  },

  // Long press
  longPress: {
    // Context menu
    duration: "500ms",
    feedback: "haptic", // On supported devices
  },
}
```

---

## 📐 Safe Area (Notch Support)

### CSS Environment Variables

```css
/* Root styles for safe area */
:root {
  /* Safe area insets */
  --safe-area-top: env(safe-area-inset-top);
  --safe-area-bottom: env(safe-area-inset-bottom);
  --safe-area-left: env(safe-area-inset-left);
  --safe-area-right: env(safe-area-inset-right);
}

/* Apply to layout */
.page-container {
  /* Top spacing (includes notch) */
  padding-top: max(20px, var(--safe-area-top));

  /* Bottom spacing (includes home indicator) */
  padding-bottom: max(20px, var(--safe-area-bottom));

  /* Left/right for landscape */
  padding-left: max(16px, var(--safe-area-left));
  padding-right: max(16px, var(--safe-area-right));
}

/* Fixed bottom bar */
.fixed-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  /* Account for home indicator */
  padding-bottom: var(--safe-area-bottom);
}

/* Sticky header */
.sticky-header {
  position: sticky;
  top: 0;

  /* Account for notch */
  padding-top: var(--safe-area-top);
}
```

### Utility Classes

```css
/* Safe area utilities */
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-left {
  padding-left: env(safe-area-inset-left);
}

.safe-right {
  padding-right: env(safe-area-inset-right);
}

.safe-area-inset {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

---

## 🎨 Mobile-Specific Components

### Mobile Navigation

```typescript
interface MobileNavStyle {
  // Bottom navigation bar
  bottomNav: {
    position: "fixed"
    bottom: 0
    left: 0
    right: 0
    height: "64px"
    background: "rgba(26, 26, 26, 0.95)"
    backdropFilter: "blur(10px)"
    borderTop: "1px solid #404040"

    // Safe area
    paddingBottom: "var(--safe-area-bottom)"

    // Shadow
    boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.3)"

    // Layout
    display: "flex"
    justifyContent: "space-around"
    alignItems: "center"
    padding: "8px 16px"

    zIndex: 30
  }

  navItem: {
    display: "flex"
    flexDirection: "column"
    alignItems: "center"
    gap: "4px"
    minWidth: "56px"
    minHeight: "48px" // Touch target
    padding: "8px"
    cursor: "pointer"

    icon: {
      fontSize: "24px"
      color: "#737373"
      transition: "color 150ms ease-out"
    }

    label: {
      fontSize: "11px"
      color: "#737373"
      fontWeight: 500
    }

    // Active state
    active: {
      icon: {
        color: "#a855f7"
      }
      label: {
        color: "#ffffff"
      }
    }
  }
}
```

### Pull to Refresh

```typescript
interface PullToRefreshStyle {
  // Indicator
  indicator: {
    position: "absolute"
    top: "-60px"
    left: "50%"
    transform: "translateX(-50%)"
    width: "40px"
    height: "40px"
    display: "flex"
    alignItems: "center"
    justifyContent: "center"

    // State-based styles
    states: {
      idle: {
        opacity: 0
      }
      pulling: {
        opacity: "scale(0, 1)" // Based on pull distance
        icon: "arrow-down"
      }
      releasing: {
        opacity: 1
        icon: "arrow-up"
      }
      refreshing: {
        opacity: 1
        icon: "spinner"
      }
    }
  }

  // Implementation
  behavior: {
    threshold: "80px" // Minimum pull distance
    maxPull: "120px" // Maximum pull distance
    resistance: 0.5 // Scroll resistance factor
  }
}
```

### Mobile Sheet (Bottom Sheet)

```typescript
interface BottomSheetStyle {
  // Overlay
  overlay: {
    position: "fixed"
    inset: 0
    background: "rgba(0, 0, 0, 0.5)"
    backdropFilter: "blur(4px)"
    zIndex: 40

    // Animation
    animation: "fadeIn 200ms ease-out"
  }

  // Sheet container
  sheet: {
    position: "fixed"
    bottom: 0
    left: 0
    right: 0
    maxHeight: "90vh"
    background: "#1a1a1a"
    borderRadius: "20px 20px 0 0"
    zIndex: 50

    // Safe area
    paddingBottom: "var(--safe-area-bottom)"

    // Shadow
    boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.5)"

    // Animation
    animation: "slideUpSheet 300ms cubic-bezier(0.16, 1, 0.3, 1)"
  }

  // Drag handle
  handle: {
    width: "40px"
    height: "4px"
    background: "#404040"
    borderRadius: "2px"
    margin: "12px auto 8px"
  }

  // Content
  content: {
    padding: "16px"
    overflowY: "auto"
    maxHeight: "calc(90vh - 80px)"
  }
}

// Animation
const slideUpSheet = {
  keyframes: {
    from: {
      transform: "translateY(100%)",
    },
    to: {
      transform: "translateY(0)",
    },
  },
}
```

---

## 🏗️ Layout Patterns

### Page Layout (Mobile)

```typescript
interface MobilePageLayout {
  structure: {
    // Main container
    container: {
      minHeight: "100vh"
      display: "flex"
      flexDirection: "column"
      background: "#0a0a0a"
    }

    // Header (sticky)
    header: {
      position: "sticky"
      top: 0
      zIndex: 20
      background: "rgba(26, 26, 26, 0.95)"
      backdropFilter: "blur(10px)"
      borderBottom: "1px solid #404040"
      padding: "12px 16px"
      paddingTop: "var(--safe-area-top)"
    }

    // Main content (scrollable)
    main: {
      flex: 1
      overflowY: "auto"
      padding: "16px"
      paddingBottom: "80px" // Space for bottom nav

      // iOS momentum scrolling
      WebkitOverflowScrolling: "touch"
    }

    // Bottom navigation
    nav: {
      position: "fixed"
      bottom: 0
      left: 0
      right: 0
      paddingBottom: "var(--safe-area-bottom)"
    }
  }
}
```

### Card Grid (Responsive)

```typescript
interface ResponsiveGrid {
  // Auto-responsive grid
  container: {
    display: "grid"
    gap: "12px"

    // Responsive columns
    gridTemplateColumns: {
      mobile: "1fr" // 1 column
      mobileLandscape: "repeat(2, 1fr)" // 2 columns
      tablet: "repeat(3, 1fr)" // 3 columns
      desktop: "repeat(4, 1fr)" // 4 columns
    }

    // Alternative: Auto-fit
    autoFit: "repeat(auto-fit, minmax(280px, 1fr))"
  }
}
```

---

## 🎬 Performance Optimizations

### Scroll Performance

```css
/* Optimize scroll performance */
.scrollable {
  /* Hardware acceleration */
  will-change: transform;

  /* iOS momentum scrolling */
  -webkit-overflow-scrolling: touch;

  /* Prevent scroll chaining */
  overscroll-behavior: contain;

  /* GPU acceleration for transforms */
  transform: translateZ(0);
}

/* Lazy render off-screen content */
.lazy-render {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

### Animation Performance

```css
/* Only animate transform and opacity */
.performant-animation {
  /* GPU-accelerated properties only */
  transition: transform 300ms ease-out, opacity 300ms ease-out;

  /* Avoid */
  /* transition: height 300ms; ❌ */
  /* transition: background 300ms; ❌ */
}

/* Use will-change sparingly */
.about-to-animate {
  will-change: transform, opacity;
}

.done-animating {
  will-change: auto;
}
```

### Image Optimization

```typescript
const imageOptimization = {
  // Responsive images
  srcSet: [
    "320w", // Mobile
    "640w", // Mobile 2x
    "768w", // Tablet
    "1024w", // Desktop
  ],

  // Lazy loading
  loading: "lazy",

  // Modern formats
  formats: ["avif", "webp", "jpg"],

  // Blur placeholder
  placeholder: "blur",
  blurDataURL: "data:image/jpeg;base64,...",
}
```

---

## 📲 PWA Features

### Manifest.json

```json
{
  "name": "Meme Alchemist",
  "short_name": "MemeAlc",
  "description": "AI-powered meme generator with evidence",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#a855f7",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Meta Tags (Mobile)

```html
<!-- Viewport -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
/>

<!-- Status bar -->
<meta name="theme-color" content="#0a0a0a" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>

<!-- App icons -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

<!-- Prevent auto-detect -->
<meta name="format-detection" content="telephone=no" />

<!-- PWA -->
<link rel="manifest" href="/manifest.json" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

---

## 🧪 Testing Checklist

### Devices

- [ ] iPhone SE (375 x 667)
- [ ] iPhone 14 (390 x 844) - with notch
- [ ] iPhone 14 Pro Max (430 x 932)
- [ ] Samsung Galaxy S21 (360 x 800)
- [ ] iPad Mini (744 x 1133)
- [ ] iPad Pro 11" (834 x 1194)

### Orientations

- [ ] Portrait mode
- [ ] Landscape mode
- [ ] Orientation change handling

### Interactions

- [ ] Touch targets ≥ 44px
- [ ] Gestures work (swipe, pinch, long-press)
- [ ] No accidental taps
- [ ] Smooth scrolling (60fps)
- [ ] Pull to refresh works
- [ ] Bottom sheet draggable

### Safe Areas

- [ ] Content not hidden by notch
- [ ] Bottom nav above home indicator
- [ ] Fixed elements respect safe areas
- [ ] Landscape safe areas (L/R)

### Performance

- [ ] Page load < 3s on 3G
- [ ] Time to Interactive < 5s
- [ ] Smooth animations (no jank)
- [ ] Images lazy load
- [ ] No layout shifts (CLS < 0.1)

### PWA

- [ ] Add to home screen works
- [ ] Splash screen shows
- [ ] Standalone mode works
- [ ] Icons display correctly

---

## 📝 Implementation Notes

### Detect Mobile

```typescript
// Detect touch device
const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0
}

// Detect iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// Detect standalone mode (PWA)
const isStandalone = () => {
  return window.matchMedia("(display-mode: standalone)").matches
}

// Use in component
useEffect(() => {
  if (isTouchDevice()) {
    // Enable touch-specific features
  }
}, [])
```

### Prevent Zoom on Double-Tap

```css
/* Prevent double-tap zoom on specific elements */
button,
a,
input[type="button"] {
  touch-action: manipulation;
}

/* Allow zooming on inputs (accessibility) */
input[type="text"],
input[type="email"],
textarea {
  touch-action: auto;
}
```

---

**Related Documents**:

- Design System (base styles)
- Toast Notification System (mobile gestures)
- MemeViewer Polish (touch interactions)
- Loading States (mobile skeletons)
