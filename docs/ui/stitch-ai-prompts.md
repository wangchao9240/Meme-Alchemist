# Stitch AI Design Prompts - Meme Alchemist

## Prompt 1: Landing Page (Home Page)

```
Create a modern landing page for "Meme Alchemist" - an AI-powered meme generator web application.

DESIGN REQUIREMENTS:
- Dark theme with gradient background from dark gray to black (#0a0a0a to #1a1a1a)
- Mobile-first responsive design
- Clean, minimalist layout with strong visual hierarchy

COLOR PALETTE:
- Background: Gradient from #0a0a0a (gray-900) to #000000 (black)
- Primary accent: Purple #a855f7 to Pink #ec4899 gradient
- Text primary: White #ffffff
- Text secondary: Light gray #a3a3a3
- Borders: Subtle gray #404040

LAYOUT STRUCTURE:

1. HERO SECTION (centered, max-width 768px):
   - Large app title: "Meme Alchemist"
     * Font size: 48-56px on mobile, 56-72px on desktop
     * Apply gradient text effect (purple to pink)
     * Font weight: Bold (700)

   - Subtitle text:
     * "AI-Powered Meme Generator · Trending Topics + Facts = Engaging Content"
     * Font size: 18-20px on mobile, 20-24px on desktop
     * Color: Light gray (#d1d5db)
     * Margin bottom: 32px

   - Primary CTA Button:
     * Text: "Create Your Meme"
     * Width: Auto (padding: 32px horizontal, 16px vertical)
     * Background: Purple to pink gradient (#a855f7 to #ec4899)
     * Border radius: 12px
     * Font size: 18px, font weight: 600
     * Add sparkle icon (✨) before text
     * Shadow: Large soft glow
     * Hover: Slightly darker gradient + scale up 2%
     * Min height: 56px (comfortable touch target)

2. FEATURES SECTION (centered, max-width 1024px):
   - Grid: 3 columns on desktop, 1 column on mobile
   - Gap: 24px between cards
   - Margin top: 64px from hero

   Feature Card Design:
   - Background: Semi-transparent dark gray (#1a1a1a with 50% opacity)
   - Border: 1px solid #374151
   - Border radius: 12px
   - Padding: 24px
   - Backdrop blur: 8px
   - Hover effect: Border changes to purple (#a855f7)

   Each card contains:
   - Icon at top (32px size, purple color #a855f7)
   - Title below icon (20px, font weight 600, white)
   - Description text (16px, #9ca3af, line height 1.5)

   Three features:
   1. "Real-Time Trends"
      Icon: 📈 (trending up chart)
      Description: "Automatically fetch hot topics from social platforms"

   2. "One-Click Generation"
      Icon: ⚡ (lightning bolt)
      Description: "Generate professional memes with sources in 5-10 seconds"

   3. "Verifiable Facts"
      Icon: ✨ (sparkles)
      Description: "Every fact includes source links, 100% verifiable"

3. FOOTER SECTION (centered):
   - Margin top: 64px
   - Small text: "Portfolio Project · MVP Version"
   - Color: #6b7280
   - Font size: 14px

SPACING & LAYOUT:
- Container padding: 16px on mobile, 32px on tablet+
- Vertical rhythm: 16px base unit
- Safe area insets for mobile (notch support)

RESPONSIVE BREAKPOINTS:
- Mobile: < 768px (single column, larger touch targets)
- Tablet: 768px - 1024px
- Desktop: > 1024px (full feature grid)

INTERACTIONS:
- Button hover: Scale 1.02, darker gradient, shadow increases
- Card hover: Border color transitions to purple
- All transitions: 300ms cubic-bezier(0.4, 0, 0.2, 1)
- Touch feedback: Scale 0.98 on active state

ACCESSIBILITY:
- All interactive elements min 44px tall
- Focus visible: 2px purple outline with 2px offset
- ARIA labels on all interactive elements
- Semantic HTML structure
```

---

## Prompt 2: Trends Page (/try route - Topic Selection)

```
Create a topic selection page for a meme generator app showing trending topics as simple text-based items (no images).

DESIGN REQUIREMENTS:
- Dark theme background: #191022 (deep purple-black)
- Mobile-first, vertically scrollable layout
- Clean list-based design (not card-based since there are no images)

COLOR PALETTE:
- Background: #191022 (deep purple-black)
- Surface: #2d1f3d (lighter purple-gray for items)
- Primary: #a855f7 (purple)
- Text primary: #ffffff
- Text secondary: rgba(255, 255, 255, 0.7)
- Borders: rgba(255, 255, 255, 0.2)

LAYOUT STRUCTURE:

1. FIXED HEADER (top of screen):
   - Height: 64px
   - Background: #191022
   - Padding: 16px horizontal
   - Three items in flex row:
     * Left: Back arrow icon (24px, only show opacity if not on first step)
     * Center: Title "Select a Trend" (20px, bold, white)
     * Right: Refresh icon (24px, white)

2. CUSTOM TOPIC INPUT SECTION (sticky below header):
   - Background: #191022
   - Padding: 16px horizontal, 24px vertical
   - Contains:
     * Label: "Have a topic in mind?" (14px, rgba(255,255,255,0.7))
     * Search input:
       - Height: 56px
       - Background: #2d1f3d
       - Border: 1px solid rgba(255,255,255,0.2)
       - Border radius: 12px
       - Padding: 16px, with search icon on left
       - Placeholder: "e.g., 'AI in healthcare'"
       - Focus state: Border changes to #a855f7, add purple glow
       - Font size: 16px

3. TRENDING TOPICS LIST (scrollable main content):
   - Padding: 0px 16px, bottom padding 120px (for nav bar clearance)
   - Design as vertical list (NOT grid, since no images)

   Each Topic Item:
   - Design as horizontal list item (not card)
   - Height: Auto (min 72px)
   - Background: #2d1f3d
   - Border radius: 16px
   - Margin bottom: 12px
   - Padding: 20px
   - Border: 2px solid transparent
   - Hover/Selected state: Border color #a855f7, background slightly lighter

   Item contents (flex row):
   - Left side:
     * Topic emoji or colored circle indicator (32px)
     * Use different colors for variety: purple, blue, pink, orange, green

   - Middle (flex-1):
     * Topic title (18px, font weight 600, white)
     * Subtitle/description if available (14px, rgba(255,255,255,0.6))

   - Right side:
     * Trending indicator: Small pill badge
     * Background: rgba(168, 85, 247, 0.2)
     * Text: "Hot" or trending score
     * Font size: 12px, color: #a855f7
     * Padding: 4px 12px
     * Border radius: 12px

4. BOTTOM NAVIGATION BAR (fixed at bottom):
   - Height: 80px + safe area inset
   - Background: rgba(28, 24, 37, 0.8) with 8px backdrop blur
   - Border top: 1px solid rgba(255,255,255,0.1)
   - Four navigation items in flex row:
     * Home (house icon)
     * Trending (trending up icon) - active state
     * Create (plus circle icon)
     * Profile (user icon)

   Active nav item styling:
   - Icon wrapped in purple container (#a855f7)
   - Container: rounded pill shape, 40px x 56px
   - Label below in purple color
   - Inactive items: white with 60% opacity

INTERACTIONS:
- Topic item tap: Border animates to purple, slight scale down (0.98)
- Input focus: Border and glow transition smoothly (300ms)
- Smooth scroll behavior
- Pull-to-refresh gesture (optional)

RESPONSIVE:
- Single column on all screen sizes
- Max width: 640px centered on desktop
- Padding adjusts for safe areas (notch, home indicator)

ACCESSIBILITY:
- Min touch target: 56px height for list items
- Focus visible states with outline
- Proper semantic HTML (nav, button, input)
- ARIA labels on icons
```

---

## Prompt 3: Template Picker Page (/template-picker)

```
Create a template selection page for meme generator with visual preview mockups for each template style.

DESIGN REQUIREMENTS:
- Dark theme: #191022 background
- Show templates with illustrative preview diagrams
- Mobile-first vertical layout

COLOR PALETTE:
- Background: #191022
- Card background: #2d1f3d
- Primary: #a855f7 (purple)
- Selected border: #a855f7
- Text: White #ffffff
- Text muted: rgba(255, 255, 255, 0.7)

LAYOUT STRUCTURE:

1. HEADER (fixed at top):
   - Height: 64px
   - Background: #191022
   - Padding: 16px
   - Layout: Flex row
     * Left: Back arrow (24px)
     * Center: "Choose Template" (20px, bold)
     * Right: Empty space (same width as left for balance)

2. TEMPLATE GRID (scrollable):
   - Padding: 16px horizontal
   - Padding bottom: 120px (for fixed button clearance)
   - Max width: 480px centered
   - Gap: 20px between items

   Each Template Card:
   - Background: #2d1f3d
   - Border radius: 20px
   - Padding: 24px
   - Border: 2px solid rgba(255,255,255,0.2)
   - Selected state: Border #a855f7, background tint purple (10% opacity)

   Card layout (vertical stack):

   a) PREVIEW DIAGRAM (top):
      - Aspect ratio: 4:3
      - Width: 100%
      - Border radius: 12px
      - Design custom preview for each template:

      * TWO-PANEL Preview:
        - Background: #0f0f0f (dark black)
        - Split into two equal halves vertically
        - Left half: Light rectangle placeholder + "Concept A" label
        - Right half: Light rectangle placeholder + "Concept B" label
        - Show subtle divider line between panels
        - Use light gray (#404040) for placeholder shapes
        - Labels in white, 12px

      * GLOSSARY Preview:
        - Background: #667eea (blue-purple gradient)
        - Design like a dictionary card:
        - Top: Large term in quotes ("Term")
        - Middle: Pronunciation guide in italics (/tɜːrm/)
        - Bottom: Definition paragraph (use lines to represent text)
        - All text placeholders in white/off-white
        - Padding 16px
        - Typography-focused design

   b) TEMPLATE INFO (below preview):
      - Margin top: 16px

      * Title (18px, bold, white)
      * Description (14px, rgba(255,255,255,0.7), line height 1.5)
      * Margin bottom: 12px

      * Aspect ratio tags:
        - Flex row of pills
        - Each pill: Background rgba(255,255,255,0.1), padding 6px 12px
        - Border radius: 16px
        - Font size: 12px, white 80% opacity
        - Example tags: "1:1" "4:5" "9:16"

   c) SELECTED INDICATOR (if selected):
      - Position: Absolute top-right of card (12px inset)
      - Purple circle (#a855f7)
      - Size: 28px diameter
      - White checkmark icon inside (16px)

3. TWO TEMPLATES TO SHOW:

   Template 1: "Two Panel"
   - Preview: Dark with split panels (described above)
   - Description: "Compare two concepts or viewpoints side-by-side"
   - Ratios: 1:1, 4:5, 9:16

   Template 2: "Glossary"
   - Preview: Blue-purple with dictionary-style layout (described above)
   - Description: "Define and explain terms in an educational format"
   - Ratios: 1:1

4. FIXED BOTTOM BUTTON:
   - Position: Fixed at bottom
   - Background: #191022
   - Padding: 16px horizontal, 16px + safe area bottom
   - Max width: 480px centered

   Button:
   - Width: 100%
   - Height: 56px
   - Background: #a855f7 (enabled) or #3d2f4f (disabled)
   - Border radius: 12px
   - Text: "Continue to Generate"
   - Font size: 16px, font weight: 600
   - Text color: white (enabled) or rgba(255,255,255,0.5) (disabled)
   - Disabled state when no template selected

INTERACTIONS:
- Card tap: Border animates to purple, slight scale
- Button disabled state: Muted colors, no interaction
- Smooth transitions: 300ms ease-in-out
- Active state: Scale 0.98 on touch

RESPONSIVE:
- Single column on mobile
- Max width 480px centered on larger screens
- Cards stack vertically with consistent spacing

PREVIEW DIAGRAM DETAILS:
- Keep previews simple and illustrative (not realistic)
- Use geometric shapes and lines to suggest layout
- Each preview should be clearly different
- Maintain consistent styling: rounded corners, clean lines
- Use template's signature color as background

ACCESSIBILITY:
- Large touch targets (min 56px for buttons)
- Clear visual feedback on selection
- Focus states with purple outline
- Semantic markup (button, header tags)
```

---

## Usage Instructions for Stitch AI:

1. Copy each prompt separately into Stitch AI
2. Generate the design for each page
3. Review and iterate on the generated designs
4. Export HTML/CSS code from Stitch AI
5. Adapt the code to Next.js + Tailwind CSS structure

## Design System Reference:

All prompts follow the design system defined in `/docs/ui/00-design-system.md`:

- Color palette: Purple primary (#a855f7), dark backgrounds
- Typography: 16px base, bold headings, Inter font family
- Spacing: 4px base unit, 16px standard padding
- Touch targets: Minimum 44px, recommended 56px
- Animations: 300ms transitions with ease-in-out
- Mobile-first with safe area support
