# Harper Brand & Design System Analysis
## Brand Alignment Review for GhostWrite Integration

**Date**: 2025-11-23
**Purpose**: Evaluate Harper's design language and determine alignment with GhostWrite's planned "Liquid Design System"

---

## Executive Summary

### ⚠️ DESIGN CONFLICT IDENTIFIED

**Harper's Brand Identity**: Nature-inspired, earthy, playful, and accessible
**GhostWrite's Planned Identity**: Glassmorphic, minimal, Linear/Vercel-style professional aesthetic

**Recommendation**: GhostWrite should **white-label Harper completely** and build its own design system independently. The two brands serve different audiences and have incompatible visual languages.

---

## Harper's Design System

### 1. Color Palette

**Primary Brand Colors** (from Chrome Extension):
```
Green System (10 tones):
├─ #fefee3 (Ultra light green/yellow)
├─ #dcf4dd (Pale green)
├─ #b9eaba (Mint)
├─ #97df99 (Light green)
├─ #74d577 (Medium green)
├─ #52ca56 (Bright green)
├─ #3fb043 (Vibrant green) ← Primary brand color
├─ #318635 (Deep green)
├─ #245c28 (Forest green)
└─ #23583a (Darkest green)

Accent Colors:
├─ #ffc9b9 (Warm peach)
└─ #d68c45 (Earthy sand/terracotta)

Neutrals:
├─ White (light mode)
├─ Gray-900/200/700 (dark mode)
└─ Slate-950/100 (system)
```

### 2. Typography

**Primary Font**: Atkinson Hyperlegible
- **Purpose**: Accessibility-first, designed for readability
- **Character**: Friendly, approachable, inclusive
- **Not typical for**: Premium SaaS products

**Monospace Font**: JetBrains Mono
- **Purpose**: Code display
- **Character**: Developer-focused

### 3. Logo & Visual Identity

**Logo Design** (by Lukas Werner):
- Minimalist line art
- Playful, character-based (stylized face)
- Black and white (adaptable)
- **Personality**: Friendly, approachable, whimsical

**Brand Personality**:
- 🌱 Nature-inspired (green palette)
- 😊 Friendly and accessible
- 🎨 Creative/playful
- 🌍 Organic/sustainable vibe

### 4. UI Patterns

**Chrome Extension**:
- Flowbite Svelte component library (pre-built components)
- 150ms smooth transitions
- Dark mode support with `.dark` class
- Rounded corners and padding (friendly, soft)

**Web Application** (writewithharper.com):
- SvelteKit + Tailwind CSS
- Atkinson Hyperlegible font (accessibility focus)
- Subtle animations (underline hover, bounce effects)
- Semantic HTML emphasis

### 5. Design Philosophy

Harper's philosophy is **pragmatic and accessible**:
- "Just right" (not overbearing like Grammarly)
- Privacy-first (100% local)
- Fast and efficient
- Developer-friendly
- **Earthy, organic, approachable**

---

## GhostWrite's Planned Design System

### From IMPLEMENTATION_PLAN.md - Phase 8: Liquid Design System

**Target Aesthetic**: Linear/Vercel style

**Design Principles**:
- Glassmorphic UI (backdrop-blur)
- Neutral color palette
- Smooth animations (200ms transitions)
- Subtle shadows and glows
- High-end, minimal, professional

**Planned CSS Variables**:
```css
:root {
  --ghost-bg: rgba(255, 255, 255, 0.9);
  --ghost-border: rgba(0, 0, 0, 0.1);
  --ghost-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --ghost-blur: blur(10px);
  --ghost-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --ghost-accent: #6366f1; /* Indigo */
  --ghost-success: #10b981; /* Green */
  --ghost-error: #ef4444; /* Red */
}
```

**Visual References**:
- Linear (project management tool)
- Vercel (developer platform)
- Sleek, premium SaaS aesthetic

**Target Audience**:
- Privacy-conscious professionals
- Users editing AI-generated content
- People who want a "lighter, faster" alternative to Grammarly

---

## Brand Comparison Matrix

| Element | Harper | GhostWrite |
|---------|--------|------------|
| **Primary Color** | Earthy green (#3fb043) | Indigo (#6366f1) |
| **Aesthetic** | Nature-inspired, playful | Glassmorphic, minimal |
| **Personality** | Friendly, accessible, organic | Premium, sleek, professional |
| **Typography** | Atkinson Hyperlegible (accessibility) | TBD (likely Inter/SF Pro) |
| **Visual Style** | Soft, rounded, colorful | Sharp, translucent, neutral |
| **Target User** | Writers, students, everyone | Privacy-conscious professionals |
| **Brand Vibe** | 🌱 Earthy & approachable | 👻 Sleek & modern |

---

## Key Conflicts

### 1. Color Palette Clash
- **Harper**: Vibrant greens, warm peach accents (nature theme)
- **GhostWrite**: Neutral grays, indigo accents (tech theme)
- **Conflict**: Users familiar with Harper expect green; GhostWrite wants indigo

### 2. Visual Language Mismatch
- **Harper**: Rounded corners, soft edges, playful character logo
- **GhostWrite**: Glassmorphic blur, subtle shadows, ghost metaphor
- **Conflict**: Harper feels "warm and organic"; GhostWrite aims for "cool and minimal"

### 3. Typography Philosophy
- **Harper**: Atkinson Hyperlegible (accessibility-first)
- **GhostWrite**: Likely Inter/SF Pro (professional SaaS standard)
- **Conflict**: Different target audiences (accessibility vs. premium feel)

### 4. Component Libraries
- **Harper**: Uses Flowbite (Bootstrap-like, comprehensive)
- **GhostWrite**: Needs custom ghost menu (floating, translucent)
- **Conflict**: Harper's components won't match GhostWrite's visual identity

---

## License & Attribution Requirements

### Apache 2.0 License Summary

**What You Can Do**:
✅ Use Harper WASM in commercial products (like GhostWrite)
✅ Modify the code
✅ Distribute in source or compiled form
✅ Sublicense to users
✅ White-label without Harper branding

**What You Must Do**:
📋 Include a copy of the Apache 2.0 license
📋 Retain copyright notice: "Copyright 2024 Elijah Potter"
📋 State modifications if you change Harper's source code
📋 Include attribution notices if a NOTICE file exists

**What You Cannot Do**:
❌ Use Harper's trademarks/logo without permission
❌ Claim Harper endorses GhostWrite
❌ Remove copyright/patent/trademark notices

### Logo & Branding

**Harper's Logo** (by Lukas Werner):
- ❌ **Do NOT use** in GhostWrite (trademark restriction)
- You can credit Harper in documentation, but avoid visual association

**Proper Attribution**:
```
GhostWrite uses Harper for grammar checking.
Harper is Copyright 2024 Elijah Potter, licensed under Apache 2.0.
```

---

## Recommendations for GhostWrite

### ✅ DO:

1. **White-label Harper completely**
   - Use only the WASM engine (harper.js NPM package)
   - Build your own UI from scratch
   - No Harper logos, colors, or branding

2. **Create independent design system**
   - Use your planned glassmorphic aesthetic
   - Indigo accent color (#6366f1)
   - Custom ghost menu (no reuse of Harper UI)

3. **Attribute properly in legal docs**
   - Include Apache 2.0 license in extension
   - Mention Harper in "About" section or footer
   - Credit: "Grammar checking powered by Harper"

4. **Differentiate clearly**
   - Never say "GhostWrite by Harper"
   - Position as "GhostWrite uses Harper engine"
   - Your brand = Ghost/minimal; Harper = Nature/playful

### ❌ DON'T:

1. **Don't reuse Harper's UI components**
   - Their Flowbite components won't match your aesthetic
   - Building custom is faster than restyling

2. **Don't use Harper's green color palette**
   - Creates brand confusion
   - Conflicts with your indigo/neutral vision

3. **Don't use Harper's logo**
   - Trademark violation
   - Misleads users about product relationship

4. **Don't expect visual consistency**
   - Users won't associate Harper's website with your extension
   - This is GOOD - you're targeting different markets

---

## Implementation Impact

### Updated Phase 3: Ghost Menu UI

**Original Plan** (from IMPLEMENTATION_PLAN.md):
```html
<div class="ghostwrite-menu">
  <button data-action="fix-grammar">✓ Fix Grammar</button>
  <button data-action="humanize" class="locked">✨ Humanize (Trial)</button>
  <button data-action="rewrite" class="locked">↻ Rewrite (Trial)</button>
</div>
```

**Updated Recommendation**:
```html
<div class="ghostwrite-menu">
  <!-- No Harper branding, colors, or logos -->
  <button data-action="fix-grammar">
    <svg><!-- Custom GhostWrite icon --></svg>
    Fix Grammar
  </button>
  <button data-action="humanize" class="locked">
    <svg><!-- Ghost icon --></svg>
    Humanize
  </button>
</div>
```

**CSS** (completely independent):
```css
.ghostwrite-menu {
  background: var(--ghost-bg); /* Not Harper's green */
  backdrop-filter: var(--ghost-blur);
  border: 1px solid var(--ghost-border);
  box-shadow: var(--ghost-shadow);
  /* Zero Harper visual elements */
}
```

### Updated Phase 8: Liquid Design System

**Add to tasks**:
- [ ] ~~Review Harper's design system~~ ✅ COMPLETE
- [ ] Confirm zero visual overlap with Harper branding
- [ ] Create custom ghost icon set (no reuse of Harper's character logo)
- [ ] Test menu on writewithharper.com to ensure differentiation

---

## Competitive Positioning

### How This Affects Your Market Position

**Good News**:
- Harper and GhostWrite target different users
- No brand confusion since you're fully white-labeling
- You can position as "faster alternative to Grammarly" without mentioning Harper

**Attribution Strategy**:
```
Marketing Site:
"GhostWrite uses the Harper grammar engine (open source)"

Extension "About" Page:
"Grammar checking powered by Harper
Copyright 2024 Elijah Potter | Apache 2.0 License"

Extension Store Listing:
"Fast, privacy-first grammar checking and AI humanization"
(No mention of Harper in main description - not required)
```

---

## Open Questions

1. **Does Automattic (WordPress parent company) have branding guidelines?**
   - Harper is in the Automattic GitHub org
   - May inherit design language from WordPress/Tumblr/etc.
   - Worth checking if there are additional trademark restrictions

2. **Will you acknowledge Harper in the UI?**
   - Legally not required (Apache 2.0 only requires license file)
   - Good practice: "Powered by Harper" in settings footer
   - Bad practice: Harper logo in your menu (trademark issue)

3. **Should you contribute back to Harper?**
   - Apache 2.0 doesn't require it
   - Good for community relations
   - Could propose GhostWrite-style UI as optional Harper theme

---

## Action Items

### Before Starting Phase 3 (UI Development):

- [x] Review Harper's GitHub repository
- [x] Analyze Harper's design system
- [x] Review Apache 2.0 license requirements
- [ ] Create GhostWrite logo/icon (ghost theme, not nature theme)
- [ ] Finalize GhostWrite color palette (confirm indigo accent)
- [ ] Draft attribution language for legal compliance
- [ ] Update IMPLEMENTATION_PLAN.md Phase 8 to remove Harper references
- [ ] Create GhostWrite Design System document (separate from this analysis)

---

## Conclusion

**Harper's design system is incompatible with GhostWrite's vision.**

This is **not a problem** because:
1. Apache 2.0 allows complete white-labeling
2. You only need Harper's WASM engine (no UI)
3. Different target audiences = no brand confusion
4. You can build a superior UI aligned with your vision

**Your planned "Liquid Design System" should proceed as originally envisioned** with zero influence from Harper's earthy, playful aesthetic. Think of Harper as a headless engine—you provide the face.

---

**Maintained by**: Elijah Potter (Harper creator)
**Owned by**: Automattic
**Logo Designer**: Lukas Werner
**License**: Apache 2.0
**GhostWrite Status**: Independent brand using Harper engine
