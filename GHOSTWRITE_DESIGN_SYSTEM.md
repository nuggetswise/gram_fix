# GhostWrite Design System

**Version 1.0** | Last Updated: 2025-11-23

---

## Table of Contents

1. [Brand Foundation](#brand-foundation)
2. [Design Principles](#design-principles)
3. [Visual Identity](#visual-identity)
4. [Color System](#color-system)
5. [Typography](#typography)
6. [Spacing & Layout](#spacing--layout)
7. [Components](#components)
8. [Interaction Design](#interaction-design)
9. [Accessibility](#accessibility)
10. [Voice & Content](#voice--content)

---

## Brand Foundation

### Mission
Provide instant, privacy-first writing assistance that combines local grammar checking with optional cloud-powered AI enhancement—lightweight, fast, and unobtrusive.

### Brand Values
- **Privacy-First**: Local processing by default, cloud only when opted-in
- **Unobtrusive**: Appears only when needed, disappears when done
- **Fast**: Sub-100ms interactions, no waiting
- **Transparent**: Clear about what's local vs. cloud, free vs. paid
- **Professional**: Enterprise-grade quality without enterprise complexity

### Brand Personality
- **Minimal**: No clutter, no noise
- **Confident**: Quiet competence, no over-promising
- **Helpful**: Supportive without being patronizing
- **Modern**: Contemporary aesthetic, future-proof design

---

## Design Principles

### 1. Invisible Until Needed
The interface should feel like a natural extension of the writing environment, not an intrusive overlay. GhostWrite appears contextually and fades away gracefully.

**Application**:
- No persistent UI elements during typing
- 400ms debounce before menu appears
- Smooth fade-in/fade-out animations
- Never blocks user interaction

### 2. Speed is a Feature
Every interaction should feel instant. Users should never wait for the interface.

**Application**:
- < 100ms menu appearance
- < 50ms grammar checks
- Optimistic UI updates
- Skeleton states, never spinners

### 3. Progressive Disclosure
Show complexity only when requested. Free tier users see simple grammar tools; paid tier users see additional AI features.

**Application**:
- Single "Fix Grammar" button for free users
- AI features visible but locked until activated
- Settings hidden in popup, not inline
- Tooltips for advanced features only

### 4. Contextual Adaptation
The UI adapts to its environment—light/dark themes, page layouts, input field types.

**Application**:
- Auto-detect light/dark backgrounds
- Responsive positioning (above/below selection)
- Respect page color schemes
- Blur backgrounds for context awareness

### 5. Clarity Over Cleverness
Straightforward labels, obvious actions, predictable results. No hidden gestures or mystery interactions.

**Application**:
- Buttons labeled with verbs ("Fix Grammar", "Humanize")
- Visual feedback for every action
- Undo always available
- Error states with clear recovery paths

---

## Visual Identity

### Logo & Brand Mark
**Primary Logo**: "GhostWrite" wordmark in Inter font, medium weight
**Icon**: Minimalist ghost or pen icon (TBD)
**Usage**: Extension icon, Chrome Web Store, documentation headers

**Color Variants**:
- **Dark Mode**: White text (#FFFFFF) on transparent
- **Light Mode**: Dark text (#0F172A) on transparent

### Brand Assets
- Extension icon: 128×128px, 48×48px, 16×16px (PNG)
- Promo tile: 1400×560px (Chrome Web Store)
- Screenshots: 1280×800px or 640×400px

---

## Color System

### Neutral Palette

**Light Mode**:
```css
--ghost-bg: rgba(255, 255, 255, 0.95);
--ghost-bg-secondary: rgba(249, 250, 251, 0.95);
--ghost-border: rgba(0, 0, 0, 0.08);
--ghost-text-primary: #0F172A;
--ghost-text-secondary: #64748B;
--ghost-text-tertiary: #94A3B8;
```

**Dark Mode**:
```css
--ghost-bg: rgba(15, 23, 42, 0.95);
--ghost-bg-secondary: rgba(30, 41, 59, 0.95);
--ghost-border: rgba(255, 255, 255, 0.1);
--ghost-text-primary: #F8FAFC;
--ghost-text-secondary: #CBD5E1;
--ghost-text-tertiary: #64748B;
```

### Semantic Colors

**Success** (grammar corrections accepted):
```css
--ghost-success-bg: rgba(16, 185, 129, 0.1);
--ghost-success-border: rgba(16, 185, 129, 0.3);
--ghost-success-text: #059669;
```

**Error** (grammar mistakes highlighted):
```css
--ghost-error-bg: rgba(239, 68, 68, 0.1);
--ghost-error-border: rgba(239, 68, 68, 0.3);
--ghost-error-text: #DC2626;
```

**Accent** (primary actions, AI features):
```css
--ghost-accent-bg: rgba(99, 102, 241, 0.1);
--ghost-accent-border: rgba(99, 102, 241, 0.3);
--ghost-accent-text: #6366F1;
--ghost-accent-solid: #6366F1;
```

**Warning** (low credits, upsell prompts):
```css
--ghost-warning-bg: rgba(245, 158, 11, 0.1);
--ghost-warning-border: rgba(245, 158, 11, 0.3);
--ghost-warning-text: #D97706;
```

### Accessibility
All text colors meet **WCAG 2.1 AA** standards for contrast:
- Primary text: 7:1 contrast minimum
- Secondary text: 4.5:1 contrast minimum
- Interactive elements: 3:1 contrast minimum

---

## Typography

### Font Family
**Primary**: [Inter](https://rsms.me/inter/) (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)

**Rationale**: Inter is optimized for screen readability, supports extensive weights, and includes tabular numbers for credit counters.

### Type Scale

```css
/* Display (onboarding, welcome screens) */
--font-size-display: 24px;
--line-height-display: 1.2;
--font-weight-display: 600;

/* Title (section headers) */
--font-size-title: 18px;
--line-height-title: 1.3;
--font-weight-title: 500;

/* Body (primary text) */
--font-size-body: 14px;
--line-height-body: 1.5;
--font-weight-body: 400;

/* Caption (metadata, timestamps) */
--font-size-caption: 12px;
--line-height-caption: 1.4;
--font-weight-caption: 400;

/* Label (buttons, form labels) */
--font-size-label: 13px;
--line-height-label: 1.4;
--font-weight-label: 500;
```

### OpenType Features
```css
font-feature-settings: "cv05", "cv09", "ss01";
font-variant-numeric: tabular-nums;
```

**Enabled Features**:
- `tabular-nums`: Fixed-width numbers for credit counters
- `ss01`: Alternate stylistic set (improved legibility)

---

## Spacing & Layout

### Spacing Scale
Based on 4px base unit:

```css
--space-1: 4px;   /* Tight spacing (icon padding) */
--space-2: 8px;   /* Compact spacing (button padding) */
--space-3: 12px;  /* Default spacing (component padding) */
--space-4: 16px;  /* Comfortable spacing (modal padding) */
--space-5: 20px;  /* Loose spacing (section margins) */
--space-6: 24px;  /* Extra loose (modal margins) */
--space-8: 32px;  /* Spacious (onboarding screens) */
```

### Component Spacing Rules
- **Buttons**: `padding: var(--space-2) var(--space-3)`
- **Modals**: `padding: var(--space-6)`
- **Menu Items**: `gap: var(--space-2)`
- **Sections**: `margin-bottom: var(--space-5)`

### Positioning
- **Ghost Menu**: 8px above/below text selection
- **Modals**: Centered viewport with 20px viewport margin
- **Tooltips**: 4px offset from trigger element

---

## Components

### 1. Ghost Menu

**Purpose**: Primary interaction surface for text selection actions.

**Anatomy**:
```html
<div class="ghostwrite-menu" data-theme="auto">
  <button class="ghost-button" data-action="fix-grammar">
    <span class="ghost-button-icon">✓</span>
    <span class="ghost-button-label">Fix Grammar</span>
  </button>
  <button class="ghost-button ghost-button--locked" data-action="humanize">
    <span class="ghost-button-icon">✨</span>
    <span class="ghost-button-label">Humanize</span>
    <span class="ghost-button-badge">Trial</span>
  </button>
</div>
```

**States**:
- **Default**: Neutral background, subtle border
- **Hover**: Accent border, slight scale (1.02)
- **Active**: Accent background, white text
- **Locked**: 50% opacity, lock icon, trial badge
- **Loading**: Animated spinner, disabled state

**Visual Specs**:
```css
.ghostwrite-menu {
  background: var(--ghost-bg);
  border: 1px solid var(--ghost-border);
  border-radius: 8px;
  padding: var(--space-2);
  backdrop-filter: blur(12px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: var(--space-2);
}

.ghost-button {
  padding: var(--space-2) var(--space-3);
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-label);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.ghost-button:hover {
  border-color: var(--ghost-accent-border);
  transform: scale(1.02);
}
```

**Behavior**:
- Appears 400ms after text selection
- Fades in over 150ms
- Positions above selection (fallback: below if clipped)
- Dismisses on click outside or ESC key

---

### 2. Correction Preview

**Purpose**: Show grammar corrections before applying.

**Anatomy**:
```html
<div class="ghostwrite-preview">
  <div class="ghost-correction">
    <span class="ghost-error">recieve</span>
    <span class="ghost-arrow">→</span>
    <span class="ghost-fix">receive</span>
  </div>
  <div class="ghost-actions">
    <button class="ghost-button-sm ghost-button--accept">Accept</button>
    <button class="ghost-button-sm ghost-button--reject">Reject</button>
  </div>
  <div class="ghost-meta">Grammar</div>
</div>
```

**Visual Treatment**:
```css
.ghost-correction {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ghost-error {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  text-decoration-color: var(--ghost-error-text);
  color: var(--ghost-text-secondary);
}

.ghost-arrow {
  color: var(--ghost-text-tertiary);
  font-size: 16px;
}

.ghost-fix {
  color: var(--ghost-success-text);
  font-weight: 500;
  background: var(--ghost-success-bg);
  padding: 2px 6px;
  border-radius: 4px;
}
```

**States**:
- **Loading**: Skeleton placeholder for correction text
- **Success**: Green highlight for accepted correction
- **Rejected**: Fade out animation

---

### 3. Settings Popup

**Purpose**: Extension configuration and status dashboard.

**Layout**:
```
┌─────────────────────────────────────┐
│ GhostWrite                          │ ← Title
├─────────────────────────────────────┤
│ Grammar Checking                    │ ← Section
│ ✅ Active • 0ms latency             │ ← Status
│                                     │
│ AI Features                         │
│ 🎁 Trial: 73 credits left           │
│                                     │
│ [Upgrade for $5/mo] →               │ ← CTA
│                                     │
│ ⚙️ Settings                         │ ← Links
│ ⌨️ Keyboard Shortcuts               │
│ 💳 Billing Portal                   │
└─────────────────────────────────────┘
```

**Dimensions**: 320px × auto (min-height: 400px)

**Visual Specs**:
```css
.ghost-popup {
  width: 320px;
  padding: var(--space-6);
  background: var(--ghost-bg);
  border-radius: 12px;
}

.ghost-section {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--ghost-border);
}

.ghost-section:last-child {
  border-bottom: none;
}
```

---

### 4. Buttons

**Variants**:

**Primary** (main actions):
```css
.ghost-button-primary {
  background: var(--ghost-accent-solid);
  color: white;
  border: 1px solid var(--ghost-accent-solid);
}

.ghost-button-primary:hover {
  background: #4F46E5; /* Darker accent */
}
```

**Secondary** (cancel, reject):
```css
.ghost-button-secondary {
  background: transparent;
  color: var(--ghost-text-primary);
  border: 1px solid var(--ghost-border);
}

.ghost-button-secondary:hover {
  background: var(--ghost-bg-secondary);
}
```

**Ghost** (minimal actions):
```css
.ghost-button-ghost {
  background: transparent;
  color: var(--ghost-text-secondary);
  border: none;
}

.ghost-button-ghost:hover {
  color: var(--ghost-text-primary);
  background: var(--ghost-bg-secondary);
}
```

**Sizes**:
- **Default**: `height: 36px`
- **Small**: `height: 28px`
- **Large**: `height: 44px`

---

### 5. Badges

**Purpose**: Status indicators (trial, locked, new).

**Variants**:
```css
.ghost-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ghost-badge--trial {
  background: var(--ghost-accent-bg);
  color: var(--ghost-accent-text);
  border: 1px solid var(--ghost-accent-border);
}

.ghost-badge--locked {
  background: var(--ghost-bg-secondary);
  color: var(--ghost-text-tertiary);
}
```

---

### 6. Loading States

**Skeleton Loader** (for text previews):
```css
.ghost-skeleton {
  background: linear-gradient(
    90deg,
    var(--ghost-bg-secondary) 25%,
    var(--ghost-bg) 50%,
    var(--ghost-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Spinner** (for button loading):
```html
<svg class="ghost-spinner" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" stroke-width="3" fill="none" />
</svg>
```

```css
.ghost-spinner circle {
  stroke: var(--ghost-accent-solid);
  stroke-dasharray: 50;
  stroke-dashoffset: 0;
  animation: spinner-rotate 1s linear infinite;
}

@keyframes spinner-rotate {
  to { stroke-dashoffset: -150; }
}
```

---

## Interaction Design

### Animation Principles

**Timing**:
- **Instant**: < 100ms (micro-interactions)
- **Quick**: 150-200ms (menu appears, buttons)
- **Standard**: 300ms (modals, overlays)
- **Slow**: 400-500ms (page transitions)

**Easing**:
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Usage**:
- Default: `--ease-in-out` (most transitions)
- Enter: `--ease-out` (menu appearing)
- Exit: `--ease-in-out` (menu disappearing)
- Spring: `--ease-spring` (success confirmations)

### Transitions

**Fade In/Out**:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ghost-menu {
  animation: fadeIn 150ms var(--ease-out);
}
```

**Scale In** (modals):
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.ghost-modal {
  animation: scaleIn 200ms var(--ease-out);
}
```

**Slide Up** (toasts, notifications):
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Hover States

**Buttons**:
- **Background**: Lighten/darken by 5%
- **Border**: Accent color
- **Scale**: 1.02 (subtle lift)
- **Timing**: 200ms

**Links**:
- **Underline**: Fade in underline
- **Color**: Shift to accent
- **Timing**: 150ms

### Focus States

**Keyboard Navigation**:
```css
.ghost-button:focus-visible {
  outline: 2px solid var(--ghost-accent-solid);
  outline-offset: 2px;
}
```

**Accessibility**: All interactive elements must have visible focus indicators.

---

## Accessibility

### Color Contrast
- **Primary text**: 7:1 minimum (AAA)
- **Secondary text**: 4.5:1 minimum (AA)
- **Interactive elements**: 3:1 minimum (AA)

### Keyboard Navigation
- **Tab order**: Logical sequence (top-to-bottom, left-to-right)
- **Focus indicators**: 2px outline, 2px offset
- **Shortcuts**:
  - `ESC`: Close menu/modal
  - `Enter`: Accept suggestion
  - `Tab`: Navigate between buttons

### Screen Readers
- **ARIA labels**: All icons have `aria-label`
- **Live regions**: Grammar check results announced
- **Semantic HTML**: `<button>`, `<dialog>`, `<nav>`

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Voice & Content

### Writing Principles

**1. Clear, Not Clever**
- ✅ "Fix Grammar"
- ❌ "Make it Perfect"

**2. Active Voice**
- ✅ "Checking grammar..."
- ❌ "Grammar is being checked..."

**3. Concise Labels**
- ✅ "Humanize"
- ❌ "Make Text Sound More Human"

**4. No Jargon**
- ✅ "Credits"
- ❌ "API Usage Units"

**5. Transparent**
- ✅ "This uses cloud AI (1 credit)"
- ❌ "Enhanced processing"

### Tone Guidelines

**Professional, Not Formal**:
- ✅ "We found 3 grammar issues"
- ❌ "Three grammatical errors have been detected"

**Helpful, Not Patronizing**:
- ✅ "Low on credits? Upgrade for $5/mo"
- ❌ "Uh oh! You're almost out of credits!"

**Confident, Not Arrogant**:
- ✅ "Grammar checked in 12ms"
- ❌ "Lightning-fast grammar checking!"

### Microcopy Examples

**Button Labels**:
- Primary actions: "Fix Grammar", "Humanize", "Rewrite"
- Secondary actions: "Accept", "Reject", "Cancel"
- Tertiary actions: "Learn More", "Settings", "Upgrade"

**Status Messages**:
- Success: "Grammar fixed"
- Error: "Unable to check grammar. Try again?"
- Loading: "Checking grammar..."
- Empty: "No grammar issues found"

**Onboarding**:
- Welcome: "Welcome to GhostWrite"
- Value prop: "Unlimited grammar checking, forever free"
- CTA: "Get Started"

**Upgrade Prompts**:
- Trial: "100 free credits available"
- Low credits: "10 credits remaining"
- Upgrade: "Upgrade for $5/mo"

---

## Implementation Guidelines

### CSS Architecture

**Naming Convention**: BEM (Block Element Modifier)
```css
.ghost-menu { }                    /* Block */
.ghost-menu__item { }              /* Element */
.ghost-menu__item--locked { }      /* Modifier */
```

**Custom Properties**:
All design tokens defined as CSS custom properties in `:root`:
```css
:root {
  /* Colors */
  --ghost-bg: ...;
  --ghost-text-primary: ...;

  /* Typography */
  --font-size-body: ...;
  --line-height-body: ...;

  /* Spacing */
  --space-2: ...;
  --space-3: ...;

  /* Shadows */
  --ghost-shadow: ...;
}
```

**Dark Mode**:
```css
[data-theme="dark"] {
  --ghost-bg: rgba(15, 23, 42, 0.95);
  /* Override all tokens */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Auto dark mode tokens */
  }
}
```

### Component Anatomy

**Standard Structure**:
```html
<div class="ghost-[component]">
  <div class="ghost-[component]__header">
    <h3 class="ghost-[component]__title">Title</h3>
  </div>
  <div class="ghost-[component]__body">
    <!-- Content -->
  </div>
  <div class="ghost-[component]__footer">
    <!-- Actions -->
  </div>
</div>
```

### Theming System

**Auto-detection**:
```javascript
// Detect page background brightness
function detectTheme() {
  const bg = window.getComputedStyle(document.body).backgroundColor;
  const rgb = bg.match(/\d+/g);
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? 'light' : 'dark';
}

document.documentElement.setAttribute('data-theme', detectTheme());
```

---

## Design Tokens Reference

### Complete Token List

```css
:root {
  /* ========== Colors ========== */
  /* Neutral - Light Mode */
  --ghost-bg: rgba(255, 255, 255, 0.95);
  --ghost-bg-secondary: rgba(249, 250, 251, 0.95);
  --ghost-border: rgba(0, 0, 0, 0.08);
  --ghost-text-primary: #0F172A;
  --ghost-text-secondary: #64748B;
  --ghost-text-tertiary: #94A3B8;

  /* Semantic */
  --ghost-success: #10B981;
  --ghost-error: #EF4444;
  --ghost-warning: #F59E0B;
  --ghost-accent: #6366F1;

  /* ========== Typography ========== */
  --font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-size-display: 24px;
  --font-size-title: 18px;
  --font-size-body: 14px;
  --font-size-caption: 12px;
  --font-size-label: 13px;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;

  /* ========== Spacing ========== */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* ========== Effects ========== */
  --ghost-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --ghost-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
  --ghost-blur: blur(12px);
  --ghost-border-radius: 8px;
  --ghost-border-radius-sm: 6px;
  --ghost-border-radius-lg: 12px;

  /* ========== Animation ========== */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-23 | Initial design system documentation |

---

**Maintained by**: GhostWrite Design Team
**Questions?**: File an issue or update this document via pull request.
