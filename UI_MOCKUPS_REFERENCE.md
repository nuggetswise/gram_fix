# Two-Stage Pipeline UI Mockups Reference

**Visual Guide for Developers** | Component Specifications

---

## Component 1: Idle Menu

```
┌─────────────────────────────────────────────────────┐
│  [ ✓ Fix Grammar ]  [ ✨ Humanize ]  [ ↻ Rewrite ]  │
└─────────────────────────────────────────────────────┘
```

**Dimensions:**
- Width: Auto (based on buttons)
- Height: 44px
- Padding: 8px
- Gap between buttons: 8px

**Positioning:**
- 8px above text selection
- Centered horizontally
- Fallback: Below if clipped

**Button Specs:**
```css
.ghost-button {
  padding: 8px 12px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
}

.ghost-button:hover {
  border-color: #6366F1;
  transform: scale(1.02);
}
```

---

## Component 2: AI Processing State

```
┌────────────────────────────────────────────────────────┐
│  🤖 AI Enhancement                             (1/2)   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 65%              │
│                                                        │
│  Humanizing your text with Gemini...                  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Estimated: 2s  •  Credits: 1  •  Gemini         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [ Cancel ]                                            │
└────────────────────────────────────────────────────────┘
```

**Dimensions:**
- Width: 400px
- Height: Auto (min 180px)
- Padding: 16px

**Progress Bar:**
```css
.ghost-progress-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.ghost-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366F1, #8B5CF6);
  animation: shimmer 2s ease-in-out infinite;
  transition: width 300ms ease;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

**Stage Badge:**
```css
.ghost-stage-badge {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}
```

---

## Component 3: Result - Clean (No Errors)

```
┌──────────────────────────────────────────────────────────┐
│  ✨ Humanized & Grammar Checked                       × │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Using AI technology helps create better results     │ │
│  │                                                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────┐             │
│  │ ✓  No grammar issues found              │             │
│  └─────────────────────────────────────────┘             │
│                                                           │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  [ ✓ Accept & Replace ]  [ Reject ]  [ 📋 Copy ]        │
│                                                           │
│  💳 99 credits remaining  •  Powered by Gemini           │
└──────────────────────────────────────────────────────────┘
```

**Dimensions:**
- Width: 500px (min), 600px (max)
- Height: Auto
- Padding: 16px

**Success Badge:**
```css
.ghost-success-badge {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #059669;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```

**Text Display:**
```css
.ghost-result-text {
  background: rgba(249, 250, 251, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}
```

---

## Component 4: Result - With Grammar Errors

```
┌──────────────────────────────────────────────────────────┐
│  ✨ Humanized                      ⚠️ 2 issues found  × │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Using AI helps create better result                 │ │
│  │                ^^^^^^        ^^^^^^                  │ │
│  │                creates       results                 │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────┐             │
│  │ ⚠️  AI output has 2 grammar issues.     │             │
│  │     Fix them?                            │             │
│  └─────────────────────────────────────────┘             │
│                                                           │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  [ ✓ Fix All & Replace ]  [ Use As-Is ]                 │
│  [ 👁️ Review Each ]                                      │
│                                                           │
│  💳 99 credits remaining  •  Powered by Gemini           │
└──────────────────────────────────────────────────────────┘
```

**Error Highlighting:**
```css
.ghost-error {
  position: relative;
  display: inline-block;
  border-bottom: 2px wavy #EF4444;
  cursor: pointer;
  transition: background 200ms ease;
}

.ghost-error:hover {
  background: rgba(239, 68, 68, 0.1);
}
```

**Error Tooltip (on hover):**
```
        ┌─────────────────────────┐
        │ Subject-verb agreement  │
        │ ─────────────────────── │
        │ create → creates        │
        └───────────┬─────────────┘
                    │
            creates (in text)
```

```css
.ghost-error-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease;
  z-index: 1000;
}

.ghost-error:hover .ghost-error-tooltip {
  opacity: 1;
}
```

---

## Component 5: Grammar Review Step-Through

```
┌──────────────────────────────────────────────────────────┐
│  Issue 1 of 2                                  ● ○  1/2  │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ "...helps create better result"                     │ │
│  │          ^^^^^^        ^^^^^^                        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Issue:                                                   │
│  Subject-verb agreement                                  │
│                                                           │
│  Suggestion:                                              │
│  ┌──────────────────────────┐                            │
│  │ create  →  creates       │                            │
│  └──────────────────────────┘                            │
│                                                           │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  [ ✓ Accept Fix ]  [ Ignore ]  [ Next → ]               │
│                                                           │
│  [ Cancel Review ]                                        │
└──────────────────────────────────────────────────────────┘
```

**Progress Dots:**
```css
.ghost-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: background 200ms ease;
}

.ghost-dot--active {
  background: #6366F1;
}
```

**Correction Display:**
```css
.ghost-correction {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(249, 250, 251, 0.95);
  padding: 8px 12px;
  border-radius: 6px;
}

.ghost-correction-before {
  color: #DC2626;
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.ghost-correction-arrow {
  color: #94A3B8;
  font-size: 16px;
}

.ghost-correction-after {
  color: #059669;
  font-weight: 500;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}
```

---

## Component 6: Success Toast

```
                                        ┌────────────────────────────┐
                                        │  ✓  Text replaced          │
                                        │     2 corrections applied  │
                                        │                          × │
                                        └────────────────────────────┘
```

**Positioning:**
- Fixed bottom-right: 24px from bottom, 24px from right
- Z-index: 10000

**Dimensions:**
- Width: 280px (min)
- Height: Auto
- Padding: 12px

**Specs:**
```css
.ghostwrite-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-left: 3px solid #10B981;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px);
  animation: slideUp 200ms ease-out;
  z-index: 10000;
}

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

.ghost-toast-icon {
  width: 32px;
  height: 32px;
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
```

**Auto-dismiss:**
- Duration: 3000ms (3 seconds)
- Pause on hover
- Fade out animation: 200ms

---

## Component 7: Error State

```
┌──────────────────────────────────────────────────────────┐
│  ⚠️                                                       │
│                                                           │
│  No credits remaining                                    │
│                                                           │
│  You've used all your credits. Buy more to continue      │
│  using AI features.                                       │
│                                                           │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  [ 💳 Buy Credits ]  [ Close ]                           │
│                                                           │
│  Learn about pricing →                                   │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
```css
.ghostwrite-error {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-left: 3px solid #EF4444;
  border-radius: 8px;
  padding: 16px;
  min-width: 360px;
  animation: shake 300ms ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(0); }
  75% { transform: translateX(8px); }
}

.ghost-error-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.ghost-error-title {
  font-size: 18px;
  font-weight: 500;
  color: #0F172A;
  margin-bottom: 8px;
}

.ghost-error-message {
  font-size: 14px;
  color: #64748B;
  line-height: 1.5;
  margin-bottom: 16px;
}
```

---

## Component 8: Warning Badge (Stage 2 Failed)

```
┌──────────────────────────────────────────────────────────┐
│  ✨ Humanized          ℹ️ Grammar check unavailable    × │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Using AI technology helps create better results     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────┐             │
│  │ ⚠️  Grammar checking failed.            │             │
│  │     Please review manually.              │             │
│  └─────────────────────────────────────────┘             │
│                                                           │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  [ Accept & Replace ]  [ Reject ]                        │
│                                                           │
│  💳 99 credits remaining  •  Powered by Gemini           │
└──────────────────────────────────────────────────────────┘
```

**Warning Badge:**
```css
.ghost-warning-badge {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #D97706;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```

---

## Component 9: First-Time Education Modal

```
┌──────────────────────────────────────────────────────────┐
│  ✨ Two-Stage Pipeline                                   │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  GhostWrite gives you AI enhancement + grammar           │
│  perfection in one click!                                │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 1️⃣ AI Enhancement (Gemini/OpenAI)                 │  │
│  │    Makes text natural and engaging                 │  │
│  │                                                     │  │
│  │ 2️⃣ Automatic Grammar Check (Harper)               │  │
│  │    Ensures perfection                              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  Both happen automatically - no extra clicks needed!     │
│                                                           │
│  ────────────────────────────────────────────────────    │
│                                                           │
│  [ Got it! ]  [ Don't show again ]                       │
└──────────────────────────────────────────────────────────┘
```

**Trigger:** First time user clicks "Humanize" or "Rewrite"

**Specs:**
```css
.ghost-education-modal {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  animation: scaleIn 200ms ease-out;
}

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
```

---

## Component 10: Comparison View (Before/After)

```
┌──────────────────────────────────────────────────────────────────┐
│  ✨ Humanized & Grammar Checked              [ ⚖️ Compare ]  × │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  ┌──────────────────────────┐  →  ┌──────────────────────────┐  │
│  │ Original                 │     │ Improved                 │  │
│  ├──────────────────────────┤     ├──────────────────────────┤  │
│  │ The utilization of AI    │     │ Using AI technology      │  │
│  │ technology facilitates   │     │ helps create better      │  │
│  │ better outcomes          │     │ results                  │  │
│  └──────────────────────────┘     └──────────────────────────┘  │
│                                                                   │
│  ────────────────────────────────────────────────────────────    │
│                                                                   │
│  [ ✓ Accept Improved ]  [ Keep Original ]                       │
└──────────────────────────────────────────────────────────────────┘
```

**Layout:**
```css
.ghost-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  margin: 16px 0;
}

.ghost-comparison-panel {
  background: rgba(249, 250, 251, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  padding: 12px;
}

.ghost-comparison-label {
  font-size: 12px;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.ghost-comparison-arrow {
  color: #94A3B8;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Button Component Specs

### Primary Button
```
┌──────────────────────┐
│ ✓ Accept & Replace   │
└──────────────────────┘
```

```css
.ghost-button-primary {
  background: #6366F1;
  color: white;
  border: 1px solid #6366F1;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 200ms ease;
}

.ghost-button-primary:hover {
  background: #4F46E5;
}

.ghost-button-primary:active {
  background: #4338CA;
}
```

### Secondary Button
```
┌──────────┐
│ Reject   │
└──────────┘
```

```css
.ghost-button-secondary {
  background: transparent;
  color: #0F172A;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
}

.ghost-button-secondary:hover {
  background: rgba(249, 250, 251, 0.95);
  border-color: rgba(0, 0, 0, 0.12);
}
```

### Ghost Button (Minimal)
```
┌──────────┐
│ Cancel   │
└──────────┘
```

```css
.ghost-button-ghost {
  background: transparent;
  color: #64748B;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
}

.ghost-button-ghost:hover {
  color: #0F172A;
  background: rgba(249, 250, 251, 0.95);
}
```

---

## Color Palette Quick Reference

### Light Mode (Default)
```
Background:      rgba(255, 255, 255, 0.95)
Background 2:    rgba(249, 250, 251, 0.95)
Border:          rgba(0, 0, 0, 0.08)
Text Primary:    #0F172A
Text Secondary:  #64748B
Text Tertiary:   #94A3B8

Success:         #10B981
Error:           #EF4444
Warning:         #F59E0B
Accent:          #6366F1
```

### Dark Mode
```
Background:      rgba(15, 23, 42, 0.95)
Background 2:    rgba(30, 41, 59, 0.95)
Border:          rgba(255, 255, 255, 0.1)
Text Primary:    #F8FAFC
Text Secondary:  #CBD5E1
Text Tertiary:   #64748B

Success:         #10B981
Error:           #EF4444
Warning:         #F59E0B
Accent:          #6366F1
```

---

## Animation Timing Reference

```
Instant:    100ms  - Micro-interactions
Quick:      150ms  - Menu fade in
Standard:   200ms  - Button hover, transitions
Smooth:     300ms  - Modal scale in
Slow:       400ms  - Success celebrations

Easing:
- Fade in:  ease-out
- Fade out: ease-in-out
- Scale:    ease-out
- Slide:    ease-out
- Spring:   cubic-bezier(0.34, 1.56, 0.64, 1)
```

---

## Spacing Scale

```
Tight:       4px   - Icon padding
Compact:     8px   - Button padding
Default:     12px  - Component padding
Comfortable: 16px  - Modal padding
Loose:       20px  - Section margins
Extra Loose: 24px  - Page margins
Spacious:    32px  - Onboarding screens
```

---

## Z-Index Stack

```
Base:        1     - Page content
Menu:        1000  - Ghost menu
Progress:    1001  - Loading states
Result:      1002  - Result display
Modal:       2000  - Modals, dialogs
Toast:       10000 - Toast notifications
```

---

## Accessibility Checklist

**Keyboard Navigation:**
- ✅ Tab: Navigate between buttons
- ✅ Enter: Activate focused button
- ✅ ESC: Close menu/modal
- ✅ Arrow keys: Navigate grammar errors

**Focus States:**
```css
.ghost-button:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
}
```

**ARIA Labels:**
```html
<button aria-label="Accept suggestion and replace text">
  Accept
</button>

<div role="alert" aria-live="polite">
  Text replaced successfully
</div>

<span class="ghost-error"
      aria-label="Grammar error: Subject-verb agreement"
      tabindex="0">
  create
</span>
```

**Screen Reader Announcements:**
- "AI processing started"
- "Grammar checking..."
- "2 grammar issues found"
- "Text replaced successfully"

---

## Responsive Considerations

**Desktop (>1024px):**
- Full width components
- Side-by-side comparison view
- Hover tooltips

**Tablet (768px - 1024px):**
- Slightly narrower components
- Stacked comparison view
- Tap tooltips

**Mobile (Not applicable):**
- Chrome extensions don't work on mobile
- Consider companion app in future

---

## Developer Notes

**Component Dependencies:**
```javascript
// Required libraries
- None (vanilla JS + CSS)

// Optional enhancements
- Framer Motion (for advanced animations)
- Tippy.js (for tooltips)
- React (if converting to component library)
```

**File Structure:**
```
/ui/
  ├── components/
  │   ├── Menu.js
  │   ├── Progress.js
  │   ├── Result.js
  │   ├── Toast.js
  │   └── ErrorDisplay.js
  ├── styles/
  │   ├── tokens.css       (design tokens)
  │   ├── components.css   (component styles)
  │   └── animations.css   (keyframes)
  └── utils/
      ├── positioning.js   (menu positioning logic)
      └── text-replace.js  (DOM manipulation)
```

**Testing Checklist:**
- ✅ Test on Gmail, Google Docs, Twitter
- ✅ Test with long text (>1000 words)
- ✅ Test error states (no credits, timeout)
- ✅ Test keyboard navigation
- ✅ Test screen reader compatibility
- ✅ Test light/dark mode switching

---

**Version:** 1.0
**Last Updated:** 2025-11-23
**Status:** Ready for Implementation

**Questions?** See `/home/user/gram_fix/TWO_STAGE_PIPELINE_UX_DESIGN.md` for full specifications.
