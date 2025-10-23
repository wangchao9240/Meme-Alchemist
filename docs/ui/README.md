# UI Design Documentation - Sprint 3

**Project**: Meme Alchemist  
**Sprint**: Sprint 3 (热榜系统 + 前端优化)  
**Status**: Design Complete, Ready for Implementation  
**Last Updated**: 2025-10-23

---

## 📋 Document Index

This UI design documentation provides comprehensive, AI-readable specifications for all Sprint 3 frontend work.

### Core Design System

**[00-design-system.md](./00-design-system.md)** - Foundation

- Color palette (dark theme)
- Typography scale
- Spacing system
- Component states
- Animation system
- Accessibility guidelines

### Component Redesigns

**[01-trend-selector-redesign.md](./01-trend-selector-redesign.md)** - EPIC-5

- Real-time trending topics from Reddit/Twitter
- Custom topic input
- Loading skeleton screens
- Graceful fallback to seed topics
- Mobile-optimized grid layout

**[02-loading-error-states.md](./02-loading-error-states.md)** - EPIC-6

- Spinner component (3 sizes)
- Skeleton screens (cards, text, lists)
- Error messages (inline, boundary, network)
- Empty states
- State transition animations

**[03-toast-notification-system.md](./03-toast-notification-system.md)** - EPIC-6

- Toast variants (success, error, warning, info, loading)
- Stack management
- Swipe to dismiss (mobile)
- Promise toast for async operations
- Accessibility with ARIA live regions

**[04-meme-viewer-polish.md](./04-meme-viewer-polish.md)** - EPIC-6

- Generation progress stepper
- Image preview with lazy loading
- Aspect ratio selector
- Download, copy, share actions
- Evidence section with collapsible cards
- Fullscreen image modal with pinch-to-zoom

**[05-mobile-responsive-design.md](./05-mobile-responsive-design.md)** - EPIC-6

- Breakpoint strategy (mobile-first)
- Touch target guidelines (≥44px)
- Safe area support (notch, home indicator)
- Mobile-specific components (bottom nav, bottom sheet)
- PWA configuration
- Performance optimizations

---

## 🎯 Design Principles

### 1. Mobile-First

- Design for smallest screens first (375px)
- Progressive enhancement for larger screens
- Touch-optimized interactions

### 2. Performance-First

- Skeleton screens for perceived performance
- Lazy loading images
- GPU-accelerated animations
- Smooth 60fps scrolling

### 3. Accessible

- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Color contrast ratios

### 4. Consistent

- Unified design tokens
- Shared component library
- Predictable interaction patterns

---

## 🎨 Quick Reference

### Colors

```javascript
// Primary
purple-500: #a855f7    // Brand color
purple-600: #9333ea    // Hover states

// Dark theme
gray-900: #0a0a0a      // Background
gray-800: #1a1a1a      // Cards
gray-700: #2a2a2a      // Elevated elements

// Semantic
green-500: #10b981     // Success
red-500: #ef4444       // Error
amber-500: #f59e0b     // Warning
blue-500: #3b82f6      // Info
```

### Typography

```javascript
// Font sizes
text-xs: 12px          // Captions, tags
text-sm: 14px          // Body secondary
text-base: 16px        // Body primary (mobile minimum)
text-lg: 18px          // Subheadings
text-xl: 20px          // H3
text-2xl: 24px         // H2
text-3xl: 30px         // H1

// Font weights
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

### Spacing

```javascript
// Tailwind scale (4px base)
spacing-1: 4px
spacing-2: 8px
spacing-3: 12px
spacing-4: 16px
spacing-6: 24px
spacing-8: 32px
```

### Transitions

```javascript
duration-fast: 150ms   // Hover, focus
duration-base: 300ms   // Standard animations
duration-slow: 500ms   // Complex animations
```

---

## 🚀 Implementation Priority

### Phase 1: Core Systems (P0)

1. **Design System Setup**

   - [ ] Add design tokens to `globals.css`
   - [ ] Create base utility classes
   - [ ] Set up CSS variables

2. **Loading & Error States**

   - [ ] Create `Spinner.tsx`
   - [ ] Create skeleton components
   - [ ] Create error components

3. **Toast Notification**
   - [ ] Create `Toast.tsx`
   - [ ] Create `useToastStore`
   - [ ] Add toast animations

### Phase 2: Component Enhancements (P0)

4. **TrendSelector Redesign**

   - [ ] Update layout with real API
   - [ ] Add loading skeletons
   - [ ] Implement error fallback

5. **MemeViewer Polish**
   - [ ] Add generation progress
   - [ ] Implement ratio selector
   - [ ] Add advanced options

### Phase 3: Mobile Optimization (P1)

6. **Mobile Responsiveness**

   - [ ] Add safe area support
   - [ ] Implement touch gestures
   - [ ] Add bottom sheet component

7. **PWA Features**
   - [ ] Create manifest.json
   - [ ] Add app icons
   - [ ] Configure meta tags

---

## 📐 Layout Examples

### Mobile Flow (375px)

```
┌────────────────────┐
│ Header (Sticky)    │ ← 56px height + safe-top
├────────────────────┤
│                    │
│  Main Content      │ ← Scrollable, 16px padding
│  (Full width)      │
│                    │
│                    │
├────────────────────┤
│ Bottom Nav         │ ← 64px height + safe-bottom
└────────────────────┘
```

### Desktop Flow (1280px)

```
┌─────────────────────────────────────┐
│ Header (Full width, centered)       │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐     │
│    │  Content (max 1200px)   │     │ ← Centered container
│    │  40px side padding      │     │
│    └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎬 Animation Patterns

### Entrance Animations

```css
/* Fade + Slide Up */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### Exit Animations

```css
/* Fade + Slide Down */
@keyframes fadeSlideDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(16px);
  }
}
```

### Loading Animations

```css
/* Pulse */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Spin */
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

## ♿ Accessibility Checklist

### Visual

- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Focus indicators visible
- [ ] No information conveyed by color alone
- [ ] Text resizable up to 200%

### Interaction

- [ ] All interactive elements keyboard accessible
- [ ] Focus order logical
- [ ] Skip links provided
- [ ] No keyboard traps

### Assistive Technology

- [ ] Semantic HTML
- [ ] ARIA labels on icons
- [ ] Live regions for dynamic content
- [ ] Alt text on images

### Mobile

- [ ] Touch targets ≥ 44px
- [ ] Spacing between targets ≥ 8px
- [ ] Orientation supported
- [ ] Pinch-to-zoom enabled (except games/maps)

---

## 🧪 Testing Scenarios

### Visual Regression

- [ ] Component renders correctly on all breakpoints
- [ ] Animations smooth (60fps)
- [ ] No layout shifts (CLS < 0.1)
- [ ] Images load progressively

### Interaction

- [ ] Hover states work
- [ ] Focus states visible
- [ ] Active states provide feedback
- [ ] Loading states display
- [ ] Error states recoverable

### Accessibility

- [ ] Screen reader announces content
- [ ] Keyboard navigation works
- [ ] Focus order logical
- [ ] Color contrast passes

### Performance

- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 85
- [ ] Bundle size optimized

---

## 📱 Device Testing Matrix

| Device             | Screen   | OS          | Priority |
| ------------------ | -------- | ----------- | -------- |
| iPhone SE          | 375x667  | iOS 15+     | P0       |
| iPhone 14          | 390x844  | iOS 16+     | P0       |
| iPhone 14 Pro Max  | 430x932  | iOS 16+     | P1       |
| Samsung Galaxy S21 | 360x800  | Android 11+ | P0       |
| iPad Mini          | 744x1133 | iPadOS 15+  | P1       |
| iPad Pro 11"       | 834x1194 | iPadOS 15+  | P2       |

---

## 🔗 Related Documentation

- **Backend**: [architecture.md](../architecture.md)
- **Sprint Plan**: [SPRINT_PLAN.md](../SPRINT_PLAN.md)
- **Epic 5**: [epic-5-trends-system.md](../epics/epic-5-trends-system.md)
- **Epic 6**: [epic-6-frontend-polish.md](../epics/epic-6-frontend-polish.md)

---

## 📝 Usage Notes

### For Developers

These documents are written to be:

- **Comprehensive** - All visual and interaction details specified
- **AI-readable** - Structured format for AI code generation
- **Implementation-ready** - Copy-paste CSS/TypeScript examples
- **Accessible** - ARIA attributes and semantic HTML included

### For Designers

Use these as a reference to:

- Understand current design decisions
- Propose improvements
- Create high-fidelity mockups
- Design new features consistently

### For AI Assistants

These documents provide:

- Complete component specifications
- TypeScript type definitions
- CSS/Tailwind class names
- Animation keyframes
- Accessibility requirements
- Mobile-specific considerations

---

**Status**: ✅ Design Complete  
**Next Step**: Begin implementation in Sprint 3  
**Questions**: Refer to individual component docs or [PRD](../PRD.md)
