# Design System - Meme Alchemist

**Version**: Sprint 3  
**Last Updated**: 2025-10-23  
**Platform**: Mobile-first Web App

---

## 🎨 Design Principles

### 1. Mobile-First

- Optimize for touch interactions (min 44px touch targets)
- Progressive enhancement for desktop
- Safe area insets for modern devices

### 2. Performance-First

- Skeleton loading states
- Lazy loading images
- Smooth animations (60fps)

### 3. Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support

---

## 🎨 Color Palette

```javascript
// Primary Colors
const colors = {
  // Brand
  primary: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7", // Main purple
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },

  // Dark theme (default)
  dark: {
    bg: {
      primary: "#0a0a0a", // Background main
      secondary: "#1a1a1a", // Cards
      tertiary: "#2a2a2a", // Elevated elements
    },
    text: {
      primary: "#ffffff", // Main text
      secondary: "#a3a3a3", // Muted text
      tertiary: "#737373", // Disabled text
    },
    border: {
      default: "#404040",
      hover: "#525252",
      active: "#a855f7", // Purple
    },
  },

  // Semantic
  semantic: {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  },
}
```

---

## 📐 Spacing System

```javascript
// Tailwind spacing scale (4px base)
const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
}
```

**Usage Guidelines**:

- Component padding: `4` (16px)
- Section spacing: `6` (24px)
- Page margins: `4` (16px) mobile, `8` (32px) desktop

---

## 🔤 Typography

```javascript
const typography = {
  // Font Family
  sans: ["Inter", "system-ui", "sans-serif"],
  mono: ["Fira Code", "monospace"],

  // Font Sizes
  sizes: {
    xs: "12px", // Captions, tags
    sm: "14px", // Body secondary
    base: "16px", // Body primary
    lg: "18px", // Subheadings
    xl: "20px", // H3
    "2xl": "24px", // H2
    "3xl": "30px", // H1
  },

  // Line Heights
  lineHeight: {
    tight: 1.25, // Headings
    normal: 1.5, // Body
    relaxed: 1.75, // Long text
  },

  // Font Weights
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
}
```

---

## 🧩 Component States

### Interactive States

```typescript
interface ComponentState {
  default: StyleDefinition
  hover: StyleDefinition
  active: StyleDefinition
  focus: StyleDefinition
  disabled: StyleDefinition
  loading: StyleDefinition
}

// Example: Button
const buttonStates = {
  default: {
    bg: "purple-500",
    text: "white",
    border: "transparent",
  },
  hover: {
    bg: "purple-600",
    transform: "scale(1.02)",
  },
  active: {
    bg: "purple-700",
    transform: "scale(0.98)",
  },
  focus: {
    ring: "2px purple-400",
    ringOffset: "2px",
  },
  disabled: {
    bg: "gray-600",
    text: "gray-400",
    cursor: "not-allowed",
    opacity: 0.5,
  },
  loading: {
    cursor: "wait",
    icon: "spinner",
  },
}
```

---

## 📱 Responsive Breakpoints

```javascript
const breakpoints = {
  sm: "640px", // Mobile landscape
  md: "768px", // Tablet portrait
  lg: "1024px", // Tablet landscape / Small desktop
  xl: "1280px", // Desktop
  "2xl": "1536px", // Large desktop
}
```

**Mobile-First Strategy**:

```css
/* Default: Mobile (< 640px) */
.container {
  padding: 16px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 32px;
  }
}
```

---

## 🎭 Animation System

### Transition Durations

```javascript
const transitions = {
  fast: "150ms", // Micro-interactions (hover)
  base: "300ms", // Standard (modal open)
  slow: "500ms", // Complex animations
}
```

### Easing Functions

```javascript
const easing = {
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
}
```

### Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse (Loading) */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## 🔘 Component Library

### Button Variants

```typescript
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
type ButtonSize = "sm" | "md" | "lg"

const buttonVariants = {
  primary: {
    bg: "purple-500 hover:purple-600",
    text: "white",
    border: "transparent",
  },
  secondary: {
    bg: "gray-700 hover:gray-600",
    text: "white",
    border: "gray-600",
  },
  ghost: {
    bg: "transparent hover:gray-800",
    text: "gray-300",
    border: "transparent",
  },
  danger: {
    bg: "red-500 hover:red-600",
    text: "white",
    border: "transparent",
  },
}

const buttonSizes = {
  sm: {
    padding: "px-3 py-1.5",
    fontSize: "text-sm",
    minHeight: "36px",
  },
  md: {
    padding: "px-4 py-2",
    fontSize: "text-base",
    minHeight: "44px", // Touch target
  },
  lg: {
    padding: "px-6 py-3",
    fontSize: "text-lg",
    minHeight: "52px",
  },
}
```

### Card Component

```typescript
interface CardProps {
  variant: "default" | "elevated" | "outlined"
  interactive: boolean
  selected: boolean
}

const cardStyles = {
  default: {
    bg: "gray-800/50",
    border: "gray-700",
    borderWidth: "1px",
    borderRadius: "8px",
    padding: "16px",
  },
  elevated: {
    bg: "gray-800",
    shadow: "lg",
    borderRadius: "12px",
    padding: "20px",
  },
  outlined: {
    bg: "transparent",
    border: "gray-600",
    borderWidth: "2px",
    borderRadius: "8px",
    padding: "16px",
  },
}
```

---

## 🎯 Touch Interactions

### Touch Target Guidelines

```typescript
const touchTargets = {
  minimum: "44px", // Apple HIG / Material Design
  recommended: "48px", // Comfortable size
  spacing: "8px", // Minimum between targets
}
```

### Touch Feedback

```css
/* Disable blue highlight on mobile */
.touch-element {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* Active state for touch */
.touch-element:active {
  transform: scale(0.95);
  opacity: 0.8;
}
```

---

## 📊 Loading States

### Skeleton Screen

```typescript
const skeletonStyles = {
  bg: 'gray-700',
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  borderRadius: '4px',
}

// Usage
<div class="h-4 w-3/4 bg-gray-700 rounded animate-pulse" />
```

### Spinner Component

```typescript
const spinnerSizes = {
  sm: '16px',
  md: '32px',
  lg: '48px',
}

// Spinner markup
<div class="animate-spin rounded-full border-4 border-gray-600 border-t-purple-500" />
```

---

## 🌐 Z-Index Layers

```javascript
const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
}
```

---

## ✅ Accessibility

### Focus Visible

```css
/* Visible focus ring for keyboard navigation */
.interactive-element:focus-visible {
  outline: 2px solid theme("colors.purple.400");
  outline-offset: 2px;
}

/* Hide focus ring for mouse users */
.interactive-element:focus:not(:focus-visible) {
  outline: none;
}
```

### ARIA Labels

```typescript
// Required ARIA attributes
const ariaLabels = {
  button: "aria-label",
  link: "aria-label",
  image: "alt",
  form: "aria-describedby",
  error: 'aria-live="polite"',
  loading: 'aria-busy="true"',
}
```

---

## 📝 Implementation Notes

### CSS Custom Properties

```css
:root {
  /* Safe area insets (iOS notch) */
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);

  /* Spacing */
  --spacing-unit: 4px;

  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 300ms;
}
```

### Utility Classes

```css
/* Touch manipulation */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Safe area */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

**Next**: See specific component designs in:

- `01-trend-selector-redesign.md`
- `02-fact-picker-enhancements.md`
- `03-meme-viewer-polish.md`
- `04-loading-error-states.md`
- `05-toast-notification-system.md`
